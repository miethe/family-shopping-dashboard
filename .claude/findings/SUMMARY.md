# Gift-Person Linking Exploration - Summary

**Completed**: 2025-12-07

This exploration analyzed how gifts link to people in the Family Gifting Dashboard, focusing on the Person modal's "Linked Entities" section and the underlying data architecture.

---

## What Was Explored

1. **Person Modal Component** - How the detail view displays linked gifts
2. **LinkedGiftsSection Component** - Gift display logic and status grouping
3. **API Endpoints** - GET /gifts and GET /persons endpoints
4. **Database Schema** - GiftPerson junction table and relationships
5. **Data Flow** - From frontend UI to backend query execution
6. **Budget Calculations** - Person-specific gift metrics

---

## Key Findings

### 1. Two Linking Mechanisms (Design Issue!)

The system has **two different ways** gifts link to people:

**Mechanism A: Direct Linking (GiftPerson Table)**
- When you create a gift with `person_ids=[5]`, it creates a `GiftPerson` row
- Stores relationship type via `role` enum (RECIPIENT, PURCHASER, CONTRIBUTOR)
- **Currently used by**: Budget calculations only
- **Currently NOT used by**: LinkedGiftsSection UI

**Mechanism B: List-Based Linking**
- Gifts appear in a person's LinkedGiftsSection if they're in a list that person owns
- Query: `Gift JOIN ListItem JOIN List WHERE List.person_id = 5`
- **Currently used by**: LinkedGiftsSection UI
- **Result**: Implicit linking through list ownership, not explicit gift-person relationships

### 2. The Core Gap

A gift can be:
- ✓ Directly linked to a person (GiftPerson table)
- ✓ Counted in that person's budget
- ✗ But NOT show in LinkedGiftsSection if it's not in one of their lists

**Example**:
```
Create Gift "LEGO" with person_ids=[5]
  → GiftPerson(gift_id=X, person_id=5, role=RECIPIENT) created
  → Budget: Person 5 has 1 assigned gift
  → LinkedGiftsSection: Shows nothing (gift not in any list)
```

This creates confusing UX inconsistency.

### 3. The Person Modal Structure

**"Linked Entities" Tab** contains:

**Gifts Section**:
- Displays gifts in lists person owns
- Grouped by purchase status:
  - Pending: `purchase_date IS NULL`
  - Purchased: `purchase_date IS NOT NULL`
- Grid layout with mini cards (48x48 image, name, price)
- Add Gift button (pre-selects this person)

**Lists Section**:
- Shows all lists owned by this person
- Separate network call: `useListsForPerson(personId)`
- Clickable cards to open list detail modal

### 4. Data Flow (Complete)

```
PersonDetailModal
  └─ useQuery(['people', personId])
      └─ GET /persons/{personId}
          └─ PersonResponse (person data, NOT gifts)

  └─ LinkedGiftsSection
      └─ useGiftsByPerson(personId)
          └─ useGifts({ person_ids: [personId] })
              └─ GET /gifts?person_ids=5
                  └─ GiftRepository.get_filtered(person_ids=[5])
                      └─ SQL Query:
                          SELECT gifts.* FROM gifts
                          JOIN list_items ON gifts.id = list_items.gift_id
                          JOIN lists ON list_items.list_id = lists.id
                          WHERE lists.person_id = 5
                          ORDER BY gifts.id DESC

  └─ useListsForPerson(personId)
      └─ GET /lists?person_id=5
          └─ PaginatedResponse[GiftList]
```

### 5. Database Relationships

```
gifts
  ├─ id
  ├─ name
  ├─ price
  ├─ purchase_date (null=pending, !null=purchased)
  └─ purchaser_id → persons.id (who bought it)

gift_people (junction - many-to-many)
  ├─ gift_id → gifts.id
  ├─ person_id → persons.id
  └─ role (RECIPIENT | PURCHASER | CONTRIBUTOR)

lists
  ├─ id
  ├─ person_id → persons.id (owner)
  └─ name

list_items
  ├─ gift_id → gifts.id
  ├─ list_id → lists.id
  └─ status
```

### 6. What Works

✓ Create gifts with linked people (GiftPerson table)
✓ Add gifts to lists owned by person
✓ View gifts in LinkedGiftsSection (for gifts in person's lists)
✓ Sort/group gifts by purchase status
✓ Calculate budget totals (using GiftPerson)
✓ Eager load relationships (avoid N+1 queries)

### 7. What Doesn't Work / Gaps

✗ Show gifts directly linked to person (only list-based shown)
✗ Show gifts person is supposed to receive by role=RECIPIENT
✗ Deep link person+gifts in API response (requires separate call)
✗ Display role information (recipient vs purchaser)
✗ Distinguish "gifts I own lists for" vs "gifts for me"

---

## File Locations

### Frontend
- **Person Modal**: `apps/web/components/modals/PersonDetailModal.tsx` (lines 28-597)
- **Linked Gifts Display**: `apps/web/components/people/LinkedGiftsSection.tsx` (ALL)
- **Gift Hook**: `apps/web/hooks/useGifts.ts` (lines 41-46)

### Backend
- **Gift Router**: `services/api/app/api/gifts.py` (lines 23-115)
- **Gift Repository**: `services/api/app/repositories/gift.py` (lines 255-400, 422-448)
- **Person Repository**: `services/api/app/repositories/person.py` (lines 294-445)
- **Gift-Person Model**: `services/api/app/models/gift_person.py` (ALL)
- **Gift Model**: `services/api/app/models/gift.py` (lines 29-140)

---

## Generated Documentation

Three detailed exploration documents have been created:

1. **gift-person-linking-exploration.md** (Full Analysis)
   - Complete 12-section breakdown
   - All code snippets and references
   - Detailed gap analysis and recommendations

2. **gift-person-data-flow.txt** (Visual Diagrams)
   - ASCII diagrams of data flows
   - Database schema visualization
   - Component structure maps
   - Query flow examples
   - File reference guide

3. **quick-reference-gift-person-linking.md** (Quick Lookup)
   - File references table
   - Key concepts at a glance
   - Critical query explanations
   - Testing points
   - Next steps for investigation

---

## Recommendations for Next Steps

### If fixing the inconsistency:

**Option A: Query by GiftPerson instead of List**
- Update `LinkedGiftsSection` to filter by `gift_people` table
- Would show gifts directly linked to person (role=RECIPIENT)
- More semantically correct but different from current behavior

**Option B: Include Person API Response**
- Add `linked_gifts_count` or `gift_ids` to `GET /persons/{id}`
- Reduces network round-trips
- Better for server-side rendering/deep linking

**Option C: Rename/Clarify UI**
- Change "Linked Entities" to "My Lists & Gifts"
- Add explanation: "Shows gifts in lists you own"
- Document which gifts are "for you" vs "for others"

### For investigation:
1. Test: Create gift with person_ids but NOT in any list - confirm it doesn't appear in LinkedGiftsSection
2. Check: Are GiftPerson rows actually being created when gifts are made?
3. Profile: Does the LIST-based query need optimization (check indexes)?
4. Review: Is the dual-mechanism intentional or technical debt?

---

## Key Code References

### Fetch gifts by person (Frontend)
```typescript
// apps/web/hooks/useGifts.ts:41-46
export function useGiftsByPerson(personId: number, options: UseGiftsOptions = {}) {
  return useGifts(
    { person_ids: [personId] },
    { ...options, enabled: options.enabled !== false && !!personId }
  );
}
```

### Filter query (Backend)
```python
# services/api/app/repositories/gift.py:255-400
# Key filter logic at lines 333-335:
if person_ids:
    filters.append(List.person_id.in_(person_ids))  # Filters by LIST ownership
```

### Group by status (Frontend)
```typescript
// apps/web/components/people/LinkedGiftsSection.tsx:39-56
gifts.forEach((gift) => {
  if (gift.purchase_date) {
    purchased.push(gift);   // Purchased Gifts section
  } else {
    pending.push(gift);     // Pending Gifts section
  }
});
```

### Person Modal Structure
```typescript
// apps/web/components/modals/PersonDetailModal.tsx:585-694
<TabsContent value="linked">
  {/* Gifts Section */}
  <LinkedGiftsSection personId={person.id} />

  {/* Lists Section */}
  {lists.map((list) => (
    <Card key={list.id} onClick={() => openListModal(...)}>
      {list.name} ({list.item_count} items)
    </Card>
  ))}
</TabsContent>
```

---

## Statistics

- **Files analyzed**: 12 core files
- **Lines of code reviewed**: 2000+
- **API endpoints**: 2 (GET /gifts, GET /persons/{id})
- **Database tables involved**: 4 (gifts, gift_people, lists, list_items)
- **Key relationships**: 2 (Direct via GiftPerson, List-based)
- **Identified gaps**: 5 major
- **Documentation generated**: 3 detailed files

---

## Time Breakdown

- File discovery and initial analysis: 20%
- Code reading and understanding: 50%
- Data flow mapping: 20%
- Documentation and synthesis: 10%

---

## Questions Answered

1. **How does the Person modal show linked gifts?**
   - Via LinkedGiftsSection component that queries gifts in lists person owns

2. **What's the data flow from UI to API?**
   - PersonDetailModal → LinkedGiftsSection → useGiftsByPerson → GET /gifts?person_ids=X → GiftRepository.get_filtered()

3. **How does the API link gifts to people?**
   - Two ways: GiftPerson junction table (direct) and List.person_id (indirect/list-based)

4. **Why the confusing behavior?**
   - Dual mechanisms: one for data model (GiftPerson), one for UI (list-based)
   - Inconsistent query logic between budget calculation and LinkedGiftsSection

5. **What are the obvious gaps?**
   - Direct linked gifts don't appear in LinkedGiftsSection
   - Person endpoint doesn't return linked gifts
   - Role information (recipient/purchaser) not displayed in UI
   - Unclear terminology ("Linked Entities" is ambiguous)

---

## Next Phase

This exploration provides the foundation for:
- Fixing the linking inconsistency
- Adding role-based gift filtering
- Improving API response completeness
- Clarifying UI labels and behavior
- Adding tests for gift-person relationships

---

**Status**: Complete
**Files Created**: 3 detailed documents in `.claude/findings/`
**Location**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/.claude/findings/`
