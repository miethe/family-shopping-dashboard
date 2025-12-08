# Quick Reference: Gift-Person Linking

## Files at a Glance

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| **UI Modal** | `apps/web/components/modals/PersonDetailModal.tsx` | 28-597 | Person details with tabs including "Linked Entities" |
| **Linked Gifts Display** | `apps/web/components/people/LinkedGiftsSection.tsx` | 31-149 | Shows gifts for a person, grouped by purchase status |
| **Gift Fetching Hook** | `apps/web/hooks/useGifts.ts` | 41-46 | `useGiftsByPerson(personId)` - React Query hook |
| **Gift Router** | `services/api/app/api/gifts.py` | 23-115 | `GET /gifts?person_ids=X` endpoint |
| **Gift Service** | `services/api/app/services/gift.py` | 61-112 | Business logic for creating/updating gifts |
| **Gift Repository** | `services/api/app/repositories/gift.py` | 255-400 | `get_filtered()` - Core query logic |
| **Person Repository** | `services/api/app/repositories/person.py` | 294-445 | `get_gift_budget()` - Budget calculations |
| **Gift-Person Model** | `services/api/app/models/gift_person.py` | 17-83 | Junction table: gift_people with role enum |
| **Gift Model** | `services/api/app/models/gift.py` | 29-140 | ORM definition with relationships |

---

## Key Concepts

### Two Ways Gifts Link to People

#### 1. Direct Linking (GiftPerson Table)
```python
# When: Creating gift with person_ids
GiftService.create(GiftCreate { person_ids: [5, 7], ... })
  └─> GiftRepository.set_people(gift_id, [5, 7])
      └─> Creates GiftPerson rows with role='recipient'

# Used by: Budget calculations only (currently)
# Query: Gift JOIN GiftPerson WHERE GiftPerson.person_id = 5
```

#### 2. List-Based Linking (List Ownership)
```python
# When: Person creates list and adds gifts to it
# Person #5 owns "Wishlist"
# Wishlist contains Gift #3 via ListItem

# Used by: LinkedGiftsSection (UI)
# Query: Gift JOIN ListItem JOIN List WHERE List.person_id = 5
```

### Status Grouping (Frontend)
```typescript
// LinkedGiftsSection groups by:
if (gift.purchase_date) {
  // Purchased Gifts section
} else {
  // Pending Gifts section
}
```

---

## Data Flow

```
User clicks Person #5 → PersonDetailModal
                         ├─ GET /persons/5 (PersonResponse)
                         └─ Renders "Linked Entities" tab
                            └─ LinkedGiftsSection
                               └─ useGiftsByPerson(5)
                                  └─ GET /gifts?person_ids=5
                                     └─ GiftRepository.get_filtered()
                                        └─ SQL: Gift JOIN ListItem JOIN List
                                                WHERE List.person_id = 5
```

---

## Critical Query: GET /gifts?person_ids=5

### Frontend
```typescript
// apps/web/hooks/useGifts.ts
useGiftsByPerson(personId) {
  return useGifts(
    { person_ids: [personId] },
    { enabled: !!personId }
  );
}
```

### Backend
```python
# services/api/app/repositories/gift.py: get_filtered()
SELECT gifts.*
FROM gifts
JOIN list_items ON gifts.id = list_items.gift_id
JOIN lists ON list_items.list_id = lists.id
WHERE lists.person_id = 5
ORDER BY gifts.id DESC
LIMIT 51
```

**Important**: Filters by `lists.person_id` (list ownership), not `gift_people.person_id`

---

## Budget Calculation (PersonRepository.get_gift_budget)

Four separate queries calculating:

| Metric | Query | Meaning |
|--------|-------|---------|
| **gifts_assigned_count** | `Gift JOIN GiftPerson WHERE person_id=X AND role=RECIPIENT` | Gifts intended for this person |
| **gifts_purchased_count** | `Gift WHERE purchaser_id=X AND purchase_date NOT NULL` | Gifts this person bought |
| **gifts_assigned_purchased_count** | `Gift JOIN GiftPerson WHERE person_id=X AND role=RECIPIENT AND purchase_date NOT NULL` | Assigned gifts completed |
| **gifts_to_purchase_count** | `Gift WHERE purchaser_id=X AND purchase_date IS NULL` | Gifts to buy, not yet purchased |

---

## The Gap: Inconsistent Linking

### Problem
Gift linked directly to person (via GiftPerson) but not in any list:
- **Budget**: Counts it ✓
- **LinkedGiftsSection**: Doesn't show it ✗

### Example
```python
# Create gift with recipient
GiftCreate { name: "LEGO", person_ids: [5], ... }

# Creates:
# - gifts row
# - gift_people row (gift_id=10, person_id=5, role=RECIPIENT)
# - NO list_items row (gift not in any list)

# Result:
# - PersonRepository.get_gift_budget(5) → counts it
# - LinkedGiftsSection → doesn't show it (fails JOIN through list_items)
```

---

## Database Schema Summary

```
gifts
├─ id (PK)
├─ name
├─ price
├─ purchase_date (null=pending, not null=purchased)
├─ purchaser_id FK → persons.id
└─ ...

gift_people (junction)
├─ gift_id FK → gifts.id
├─ person_id FK → persons.id
└─ role ENUM ('recipient', 'purchaser', 'contributor')

lists
├─ id (PK)
├─ person_id FK → persons.id (owner)
├─ name
└─ ...

list_items
├─ gift_id FK → gifts.id
├─ list_id FK → lists.id
├─ status ENUM ('idea', 'selected', 'purchased', 'received')
└─ ...
```

---

## Response Schemas

### GiftResponse (from GET /gifts)
```json
{
  "id": 1,
  "name": "LEGO Star Wars",
  "price": 79.99,
  "image_url": "https://...",
  "purchase_date": null,
  "people": [
    { "id": 5, "display_name": "Alice" }
  ],
  "created_at": "2025-11-26T...",
  "updated_at": "2025-11-26T..."
}
```

### PersonResponse (from GET /persons/5)
```json
{
  "id": 5,
  "display_name": "Alice",
  "groups": [ ... ],
  "occasion_ids": [ ... ],
  // NOTE: Does NOT include linked gifts
}
```

### PersonBudget (from GET /persons/5/budgets)
```json
{
  "person_id": 5,
  "gifts_assigned_count": 3,
  "gifts_assigned_total": 150.00,
  "gifts_assigned_purchased_count": 1,
  "gifts_assigned_purchased_total": 50.00,
  "gifts_purchased_count": 2,
  "gifts_purchased_total": 89.99,
  "gifts_to_purchase_count": 1,
  "gifts_to_purchase_total": 39.99
}
```

---

## MiniGiftCard Component

```typescript
// apps/web/components/people/LinkedGiftsSection.tsx: 157-218

Shows per gift:
- Image (48x48, optional)
- Name (2 line clamp)
- Price (if available)
- "Purchased" badge (if purchase_date is set)

Click handler: Opens GiftDetailModal
```

---

## Touch Points for Modification

### If you want to show gifts where person is recipient (not just in their lists):

**Option A: Update LinkedGiftsSection query**
```python
# Instead of:
# Gift JOIN ListItem JOIN List WHERE List.person_id = 5

# Use:
# Gift JOIN GiftPerson WHERE GiftPerson.person_id = 5 AND role = 'recipient'
```

**Option B: Combine both approaches**
```python
# Gift WHERE id IN (
#   SELECT gift_id FROM gift_people WHERE person_id = 5 AND role = 'recipient'
#   UNION
#   SELECT distinct(gift_id) FROM list_items
#   JOIN lists ON list_items.list_id = lists.id
#   WHERE lists.person_id = 5
# )
```

**Option C: Add to PersonResponse**
```python
# Include linked_gifts in GET /persons/5
# Avoid separate network call
```

---

## Testing Points

| Test Case | Where | What to Check |
|-----------|-------|---------------|
| View person modal | PersonDetailModal | Linked Entities tab loads |
| Group pending/purchased | LinkedGiftsSection | Gifts with/without purchase_date in correct groups |
| Click gift | MiniGiftCard → GiftDetailModal | Opens correct gift |
| Add gift button | LinkedGiftsSection | Navigates to /gifts/new?person_id=X |
| Budget calculation | PersonRepository.get_gift_budget | 4 queries count correctly |
| Direct linking | GiftRepository.set_people | GiftPerson rows created |

---

## Environment

- **Frontend**: Next.js 15+, React 19+, TanStack Query
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Protocol**: REST (HTTP GET/POST/PUT/DELETE)
- **Cache**: React Query, 5 minute staleTime

---

## Related Hooks & Components

```
PersonDetailModal
├─ useQuery(['people', personId])
├─ useListsForPerson(personId)
├─ useUpdatePerson(personId)
├─ useDeletePerson()
├─ useEntityModal('list')
├─ useEntityModal('gift')
└─ Renders:
   ├─ ListDetailModal (nested)
   ├─ GiftDetailModal (nested)
   ├─ LinkedGiftsSection
   │  └─ useGiftsByPerson(personId)
   │     └─ useGifts({ person_ids: [personId] })
   └─ CommentThread
```

---

## Next Steps for Investigation

1. **Test current behavior**: Can you create a gift with person_ids but NOT add to list? Does it appear in LinkedGiftsSection? (Expected: NO)

2. **Check usage of GiftPerson**: Is the junction table used anywhere besides budget calculations?

3. **Verify schema**: Run migration to confirm gift_people table exists with role enum

4. **Profile performance**: Does LinkedGiftsSection query need optimization (check indexes)?

5. **Document usage**: Add JSDoc to clarify "Linked Entities" means "gifts in my lists", not "gifts for me"
