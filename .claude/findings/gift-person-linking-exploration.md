# Gift-Person Linking System - Exploration Findings

**Date**: 2025-12-07
**Focus**: Understanding how gifts link to people and how the Person modal displays linked entities

---

## 1. Overview: Data Flow for Gift-Person Linking

```
Frontend:
  PersonDetailModal (display person info)
    └─> LinkedGiftsSection (shows gifts linked to this person)
          └─> useGiftsByPerson(personId) hook
                └─> giftApi.list({ person_ids: [personId] })

Backend:
  GET /gifts?person_ids=[personId]
    └─> GiftRepository.get_filtered()
          └─> Query: Gift JOIN ListItem JOIN List WHERE List.person_id = personId
                └─> Returns list of gifts where person owns the list containing the gift
                └─> Eager loads: people, stores relationships
```

---

## 2. Key Files Involved

### Frontend Components

**Location**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web/components`

1. **PersonDetailModal.tsx** (lines 28-597)
   - Main person detail view with tabs
   - Tab: "Linked Entities" (lines 585-694)
   - Uses `<LinkedGiftsSection />` component (line 594-597)
   - Passes `personId` and `onOpenGiftDetail` callback

2. **people/LinkedGiftsSection.tsx** (ALL)
   - **Purpose**: Display gifts linked to a person
   - **Key Features**:
     - Uses `useGiftsByPerson(personId)` hook (line 36)
     - Groups gifts by purchase status:
       - **Pending Gifts**: `purchase_date` is null (lines 39-96)
       - **Purchased Gifts**: `purchase_date` is set (lines 99-116)
     - Mini grid display (48x48 thumbnails)
     - Empty state handling (lines 119-133)
     - "Add Gift" button pre-selects this person (lines 135-146)
   - **Component**: MiniGiftCard (lines 151-218)

3. **hooks/useGifts.ts**
   - **Function**: `useGiftsByPerson(personId, options)` (lines 41-46)
   - Wrapper around `useGifts({ person_ids: [personId] })`
   - Enables/disables based on `personId` availability
   - Caches for 5 minutes, refetches on window focus

### Backend Services

**Location**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api/app`

1. **api/gifts.py** - Router Layer
   - **Endpoint**: `GET /gifts` (lines 23-115)
   - Supports filters: `person_ids`, `statuses`, `list_ids`, `occasion_ids`, `search`
   - Calls `GiftService.list()` which delegates to `GiftRepository.get_filtered()`

2. **services/gift.py** - Service Layer
   - **Method**: `create()` (lines 61-112)
   - Handles `person_ids` relationship setup via `repo.set_people(gift.id, person_ids)`
   - Returns ORM → DTO conversion via `_to_response()`

3. **repositories/gift.py** - Repository Layer
   - **Key Methods**:
     - `get_filtered()` (lines 255-400)
       - Main query for filtering gifts by person_ids
       - Uses subquery approach to avoid duplicates
       - **Query Logic**: Gift JOIN ListItem JOIN List WHERE List.person_id IN [person_ids]
     - `get_linked_people()` (lines 402-420)
       - Returns person_ids linked to a gift via GiftPerson table
     - `attach_people()` (lines 422-448)
       - Add people to a gift (via GiftPerson association)
     - `set_people()` (implied via service layer)
       - Replaces all people linked to a gift

4. **api/persons.py** - Router Layer (Person Endpoints)
   - `GET /persons/{person_id}` (lines 173-226)
   - Returns PersonResponse with groups, occasion_ids, but **NOT** linked gifts
   - **GAP**: Person endpoint doesn't directly return linked gifts

5. **repositories/person.py** - Repository Layer
   - `get_gift_budget()` (lines 294-445)
     - Calculates budget metrics for a person as recipient
     - Queries: `Gift JOIN GiftPerson WHERE GiftPerson.person_id = person_id`
     - Tracks 4 budget types:
       - `gifts_assigned_count` / `gifts_assigned_total` - gifts TO this person
       - `gifts_purchased_count` / `gifts_purchased_total` - gifts BY this person
       - `gifts_assigned_purchased_count` - assigned gifts that are purchased
       - `gifts_to_purchase_count` - assigned to purchase but not yet bought

---

## 3. Database Schema: Gift-Person Relationships

### **GiftPerson Model** (Junction Table)
**File**: `services/api/app/models/gift_person.py`

```python
class GiftPerson(BaseModel):
    """Junction table: many-to-many Gift ↔ Person relationship"""

    __tablename__ = "gift_people"

    gift_id: int          # FK → gifts.id (CASCADE DELETE)
    person_id: int        # FK → persons.id (CASCADE Delete)
    role: GiftPersonRole  # ENUM: RECIPIENT | PURCHASER | CONTRIBUTOR

    # Unique constraint: (gift_id, person_id, role)
    # Ensures: One gift can have one person per role type
```

**GiftPersonRole Enum**:
- `RECIPIENT` - Gift is intended for this person
- `PURCHASER` - Gift is being purchased by this person
- `CONTRIBUTOR` - Shared purchase contribution

### **Gift Model** (Partial)
**File**: `services/api/app/models/gift.py`

```python
class Gift(BaseModel):
    id: int
    name: str
    price: Decimal | None
    image_url: str | None
    purchase_date: date | None  # Set when gift is purchased

    # Relationships
    people: relationship[Person]  # Via GiftPerson junction table
    stores: relationship[Store]
    list_items: relationship[ListItem]
```

### **List Model** (Relevant Part)
- Has `person_id` field → The person who owns this list
- A gift appears in LinkedGiftsSection if:
  - Gift is in a ListItem
  - That ListItem belongs to a List
  - That List's person_id matches the viewed person

---

## 4. Data Flow: Creating & Linking Gifts to People

### **Option 1: Direct People Linking (via GiftPerson)**
```
User creates gift with person_ids=[5, 7]
  ↓
GiftService.create(GiftCreate { person_ids: [5, 7], ... })
  ↓
GiftRepository.create(data)        # Creates Gift record
  ↓
GiftRepository.set_people(gift.id, [5, 7])  # Create GiftPerson rows
  ↓
Result: Gift row with GiftPerson entries
```

### **Option 2: List-Based Linking (Current in LinkedGiftsSection)**
```
User views Person detail
  ↓
LinkedGiftsSection calls useGiftsByPerson(personId)
  ↓
API: GET /gifts?person_ids=[personId]
  ↓
Repository.get_filtered(person_ids=[personId])
  ↓
Query: SELECT gifts.* FROM gifts
       JOIN list_items ON gifts.id = list_items.gift_id
       JOIN lists ON list_items.list_id = lists.id
       WHERE lists.person_id = {personId}
  ↓
Returns: All gifts in lists owned by that person
```

**Critical Finding**: The query filters by `lists.person_id`, not `gift_people.person_id`!

This means:
- Gifts show up in LinkedGiftsSection because they're in a list that person owns
- Not because they're directly linked via GiftPerson table
- **Potential GAP**: If a gift is linked directly via GiftPerson but NOT in any list, it won't appear

---

## 5. Person Modal: "Linked Entities" Tab Structure

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web/components/modals/PersonDetailModal.tsx`

### Tab Navigation (lines 371-388)
```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="advanced">Advanced</TabsTrigger>
    <TabsTrigger value="linked">Linked Entities</TabsTrigger>    ← HERE
    <TabsTrigger value="comments">Comments</TabsTrigger>
    <TabsTrigger value="history">History</TabsTrigger>
  </TabsList>
</Tabs>
```

### "Linked Entities" Tab Content (lines 585-694)

**Gifts Section** (lines 586-598):
```tsx
<div className="space-y-3">
  <h3>Gifts</h3>
  <p>Gifts linked to this person</p>
  <LinkedGiftsSection
    personId={person.id}
    onOpenGiftDetail={openGiftModal}
  />
</div>
```

**Lists Section** (lines 600-693):
```tsx
<div className="space-y-3 pt-6 border-t border-warm-200">
  <h3>Lists for this person</h3>
  {/* Shows lists that person owns */}
  {lists.map((list: GiftList) => (
    <Card key={list.id} onClick={() => openListModal(String(list.id))}>
      <h4>{list.name}</h4>
      <p>{list.item_count || 0} items</p>
    </Card>
  ))}
</div>
```

**Data Sources**:
1. **Gifts**: Fetched via `useGiftsByPerson(personId)` hook → Calls API with person_ids filter
2. **Lists**: Fetched via `useListsForPerson(personId)` hook → Gets lists person owns

---

## 6. Gift Status Grouping Logic

**LinkedGiftsSection.tsx** (lines 39-56):
```typescript
const { pendingGifts, purchasedGifts } = React.useMemo(() => {
  const gifts = giftsData?.items || [];
  const pending: Gift[] = [];
  const purchased: Gift[] = [];

  gifts.forEach((gift) => {
    if (gift.purchase_date) {
      purchased.push(gift);
    } else {
      pending.push(gift);
    }
  });

  return { pendingGifts: pending, purchasedGifts: purchased };
}, [giftsData?.items]);
```

**Status Criteria**:
- **Pending**: `gift.purchase_date === null`
- **Purchased**: `gift.purchase_date !== null`

This is a simple client-side split, not a database-level query distinction.

---

## 7. Identified Gaps & Issues

### **GAP 1: Two Linking Methods, Different Query Behavior**
**Problem**:
- GiftPerson junction table supports direct gift-person links with roles (RECIPIENT, PURCHASER, CONTRIBUTOR)
- But the current LinkedGiftsSection query uses `lists.person_id` (list ownership), not `gift_people` table
- A gift directly linked via GiftPerson won't show in LinkedGiftsSection unless it's also in a list

**Example**:
```
Gift #5 is created with person_ids=[7]  (stored in gift_people table)
  ↓
GiftPerson(gift_id=5, person_id=7, role=RECIPIENT) is created
  ↓
BUT: Gift #5 is never added to any list
  ↓
Result: Person #7's LinkedGiftsSection doesn't show Gift #5!
```

**Impact**: Confusing UX - you can link a gift to a person, but it won't appear in their "Linked Gifts" section

### **GAP 2: Person Endpoint Missing Linked Gifts**
**Problem**:
- `GET /persons/{person_id}` returns PersonResponse with groups and occasion_ids
- Doesn't include linked gifts data
- Frontend has to make separate API call to fetch gifts

**Impact**:
- Extra network round-trip
- No way to deep-link or server-render person+gifts together
- Could be optimized by adding `linked_gifts_count` or `gift_ids` to PersonResponse

### **GAP 3: Inconsistent Terminology**
**Problem**:
- "Linked Entities" tab title is vague
- Actually shows two different things:
  1. **Gifts in lists person owns** (via LinkedGiftsSection)
  2. **Lists person owns** (directly)

**Impact**: User confusion - "linked gifts" could mean:
- Gifts linked directly to person (GiftPerson table)
- Gifts in lists person owns (List.person_id)
- Gifts purchased by person (Gift.purchaser_id)
- Gifts for person to buy (Gift as recipient)

### **GAP 4: Missing Role Information**
**Problem**:
- GiftPerson has role enum (RECIPIENT, PURCHASER, CONTRIBUTOR)
- But LinkedGiftsSection doesn't display or filter by role
- No way to distinguish "gifts for this person" vs "gifts this person is buying"

**Impact**:
- All linked gifts grouped only by purchase status, not by relationship type
- Can't answer: "Which gifts is this person supposed to receive?" vs "Which should they buy?"

### **GAP 5: No Relationship to Gift's Direct Recipients**
**Problem**:
- A gift might have person_ids set (via GiftPerson RECIPIENT role)
- But the current Person modal shows gifts from lists person owns, not gifts where person is recipient

**Example**:
```
Alice owns List "Holiday Gifts"
- Item: Gift #5 (LEGO) for Bob (recipient)

When viewing Alice's person modal:
- Linked Gifts shows: Gift #5 (because Alice owns the list)
- This is correct for list context

When viewing Bob's person modal:
- Linked Gifts shows: (nothing, because Bob doesn't own any lists)
- Should show: Gift #5 (because he's the recipient via GiftPerson)
- But currently doesn't!
```

---

## 8. Budget Calculation Logic

**PersonRepository.get_gift_budget()** (lines 294-445)

Calculates 4 metrics for a person:

1. **gifts_assigned_count / gifts_assigned_total**
   - Query: `Gift JOIN GiftPerson WHERE GiftPerson.person_id = X AND role = RECIPIENT`
   - What: Gifts intended for this person

2. **gifts_purchased_count / gifts_purchased_total**
   - Query: `Gift WHERE Gift.purchaser_id = X AND purchase_date IS NOT NULL`
   - What: Gifts this person has purchased

3. **gifts_assigned_purchased_count / gifts_assigned_purchased_total**
   - Query: `Gift JOIN GiftPerson WHERE person_id = X AND role = RECIPIENT AND purchase_date IS NOT NULL`
   - What: Assigned gifts that have been purchased (progress toward goals)

4. **gifts_to_purchase_count / gifts_to_purchase_total**
   - Query: `Gift WHERE purchaser_id = X AND purchase_date IS NULL`
   - What: Gifts this person is supposed to buy but hasn't yet

---

## 9. Implementation Patterns Observed

### **Frontend Pattern: React Query + Hooks**
```typescript
// Hook composition for data fetching
useGiftsByPerson(personId)
  ↓
useGifts({ person_ids: [personId] })
  ↓
useQuery({
  queryKey: ['gifts', params],
  queryFn: () => giftApi.list(params),
  staleTime: 1000 * 60 * 5,  // Cache 5 minutes
  refetchOnWindowFocus: true,
})
```

### **Backend Pattern: Layered Architecture**
```
Router (api/gifts.py)
  ↓ passes params
Service (gift.py)
  ↓ business logic, ORM→DTO
Repository (repositories/gift.py)
  ↓ database queries
Database
```

### **Relationship Eager Loading**
```python
# Avoid N+1: eager load when fetching gifts
stmt = select(Gift).options(
    selectinload(Gift.people),      # Avoid N+1 on people
    selectinload(Gift.stores),      # Avoid N+1 on stores
)
```

---

## 10. API Contract: Gift Response Schema

**File**: `services/api/app/schemas/gift.py`

Key fields returned by GET /gifts:
```typescript
interface GiftResponse {
  id: number
  name: string
  url: string | null
  price: number | null
  image_url: string | null
  source: string | null
  description: string | null
  notes: string | null
  priority: "low" | "medium" | "high"
  quantity: number
  sale_price: number | null
  purchase_date: string | null    // ISO date, null = not purchased
  people: PersonSummary[]         // Linked people (via GiftPerson)
  stores: StoreMinimal[]          // Linked stores

  created_at: string              // ISO timestamp
  updated_at: string              // ISO timestamp
}
```

---

## 11. Summary: What Works, What Doesn't

### ✓ Currently Works
1. Create gifts with linked people (`GiftPerson` table)
2. Add gifts to lists
3. View gifts in LinkedGiftsSection (for gifts in lists person owns)
4. Sort gifts by purchase status (pending/purchased)
5. Calculate budget totals for recipients and purchasers
6. Eager load relationships to avoid N+1 queries

### ✗ Doesn't Work / Missing
1. **Show gifts directly linked to person** (via GiftPerson table)
   - Only shows gifts in lists person owns
2. **Show gifts person is supposed to receive** (by role=RECIPIENT)
   - Could solve #1
3. **Deep linking person+gifts** in API response
   - Requires separate network call
4. **Display role information** (recipient vs purchaser vs contributor)
   - Just groups by purchase status
5. **Support for "gifts to purchase"** in LinkedGiftsSection
   - Budget calculation tracks this, but UI doesn't show it separately

---

## 12. Code Snippet References

### Fetch gifts by person (Frontend)
**File**: `apps/web/hooks/useGifts.ts:41-46`
```typescript
export function useGiftsByPerson(personId: number, options: UseGiftsOptions = {}) {
  return useGifts(
    { person_ids: [personId] },
    { ...options, enabled: options.enabled !== false && !!personId }
  );
}
```

### Filter gifts by person (Backend)
**File**: `services/api/app/repositories/gift.py:333-335`
```python
if person_ids:
    filters.append(List.person_id.in_(person_ids))
```

### Group gifts by status (Frontend)
**File**: `apps/web/components/people/LinkedGiftsSection.tsx:39-56`
```typescript
gifts.forEach((gift) => {
  if (gift.purchase_date) {
    purchased.push(gift);
  } else {
    pending.push(gift);
  }
});
```

---

## Conclusion

The gift-to-person linking system has **dual mechanisms**:

1. **Direct Linking** (GiftPerson table)
   - Stores relationship type via role enum
   - Used for budget calculations
   - NOT used in current LinkedGiftsSection UI

2. **List-Based Linking** (List.person_id)
   - Implicit: gifts appear because person owns the list
   - Used in LinkedGiftsSection
   - Simple but doesn't capture "who the gift is for"

**Recommendation**: Align both mechanisms to avoid confusion. Either:
- **Option A**: Refactor LinkedGiftsSection to use GiftPerson table (with role filtering)
- **Option B**: Stop using GiftPerson for person-gift relationships, use lists exclusively
- **Option C**: Keep both but clearly distinguish them in UI (tab: "Gifts I Own Lists For" vs "Gifts For Me")
