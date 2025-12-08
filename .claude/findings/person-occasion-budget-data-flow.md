# Person Budget per Occasion - Data Flow & Architecture

---

## Overview: Current State vs Proposed Feature

### Current Architecture (Occasion-Level Only)

```
Occasion
├── budget_total: 500.00                    (Single budget for entire occasion)
├── lists
│   ├── List (Mom's Christmas Wishlist)
│   │   ├── list_items
│   │   │   ├── Gift #1 (price: 50)
│   │   │   └── Gift #2 (price: 75)
│   │   └── person_id: 1 (Mom)
│   └── List (Bob's Budget List)
│       ├── list_items
│       │   └── Gift #3 (price: 100)
│       └── person_id: 2 (Bob)
└── person_occasions (M-to-M)
    ├── person_id: 1 (Mom)
    └── person_id: 2 (Bob)

Problem: Single budget for all 3 gifts across 2 people. No way to say
"Mom's gifts have budget $200, Bob's gifts have budget $300"
```

### Proposed Architecture (Person-Occasion Budgets)

```
Occasion (budget_total: 500.00 - optional occasion-level budget)
├── person_occasion_budgets
│   ├── person_id: 1, recipient_budget: 200, purchaser_budget: 150
│   │   (Mom receives max $200 in gifts, buys max $150 for others)
│   ├── person_id: 2, recipient_budget: 300, purchaser_budget: null
│   │   (Bob receives max $300, no limit on purchasing)
│   └── ...
└── lists
    ├── List (Mom's Christmas Wishlist, person_id: 1, occasion_id: X)
    ├── List (Bob's Budget List, person_id: 2, occasion_id: X)
    └── ...

Benefit: Per-person budget allocation within occasion
- Ensures Mom doesn't overspend receiving gifts ($200 limit)
- Tracks how much Bob needs to spend buying gifts for others ($150)
```

---

## Data Flow: Displaying Person Budget for Occasion

### Flow Diagram

```
User navigates to Occasion Detail (Christmas 2024)
    ↓
PersonOccasionBudgetCard renders
    ├─ personId: 1 (Mom)
    ├─ occasionId: 5 (Christmas)
    ├─ GET /persons/1/occasions/5/budget
    │   ↓ Backend
    │   PersonService.get_person_occasion_budget(person_id=1, occasion_id=5)
    │       ↓
    │       PersonRepository.get_gift_budget(person_id=1, occasion_id=5)
    │           ├─ Query 1: GiftPerson JOIN Gift WHERE person_id=1 AND role=recipient AND gift in lists for occasion=5
    │           │   Result: gifts_assigned_count=3, gifts_assigned_total=150
    │           │
    │           ├─ Query 2: Same, but also check purchase_date IS NOT NULL
    │           │   Result: gifts_assigned_purchased_count=1, gifts_assigned_purchased_total=50
    │           │
    │           ├─ Query 3: Gift WHERE purchaser_id=1 AND purchase_date IS NOT NULL AND gift in occasion=5 lists
    │           │   Result: gifts_purchased_count=2, gifts_purchased_total=80
    │           │
    │           └─ Query 4: Gift WHERE purchaser_id=1 AND purchase_date IS NULL AND gift in occasion=5 lists
    │               Result: gifts_to_purchase_count=1, gifts_to_purchase_total=35
    │
    │       PersonOccasionBudgetRepository.get_budget(person_id=1, occasion_id=5)
    │           └─ SELECT * FROM person_occasion_budgets WHERE person_id=1 AND occasion_id=5
    │               Result: recipient_budget_total=200, purchaser_budget_total=150
    │
    │   Response: PersonOccasionBudgetResponse {
    │       person_id: 1,
    │       occasion_id: 5,
    │       recipient_budget_total: 200,
    │       purchased_gifts_recipient: 50,
    │       planned_gifts_recipient: 100,
    │       purchaser_budget_total: 150,
    │       purchased_gifts_purchaser: 80,
    │       planned_gifts_purchaser: 35
    │   }
    │
    └─ Frontend: PersonBudgetBar renders
        ├─ "Gifts to Receive"
        │   ├─ Budget: $200
        │   ├─ Purchased: $50 (green)
        │   ├─ Planned: $100 (amber)
        │   └─ Progress bar: [████░░░░░░░░░░░░]
        │
        └─ "Gifts to Buy"
            ├─ Budget: $150
            ├─ Purchased: $80 (green)
            ├─ Planned: $35 (amber)
            └─ Progress bar: [█████░░░░░░░░░░░]
```

---

## Data Model: Tables & Relationships

### Current Schema

```sql
-- Existing tables
persons (id, display_name, ...)
occasions (id, name, date, budget_total, ...)
person_occasions (person_id, occasion_id)  -- M-to-M
gift_people (gift_id, person_id, role)     -- M-to-M with role
lists (id, person_id, occasion_id, ...)
gifts (id, price, purchaser_id, ...)
```

### New Schema (Proposed)

```sql
-- NEW
person_occasion_budgets (
    id,
    person_id (FK → persons),
    occasion_id (FK → occasions),
    recipient_budget_total DECIMAL(10,2),   -- Budget for gifts TO this person
    purchaser_budget_total DECIMAL(10,2),   -- Budget for gifts BY this person
    created_at, updated_at,
    UNIQUE (person_id, occasion_id)
)

-- Existing relationships for context:
gifts (id, price, purchaser_id, purchase_date, ...)
  └─ Foreign key: purchaser_id → persons.id

gift_people (gift_id, person_id, role)
  ├─ gift_id → gifts.id
  ├─ person_id → persons.id
  └─ role: 'recipient' | 'purchaser' | 'contributor'

list_items (list_id, gift_id, status, ...)
  └─ status: 'idea' | 'selected' | 'purchased' | 'received'

lists (id, person_id, occasion_id, ...)
  ├─ person_id → persons.id (list owner)
  └─ occasion_id → occasions.id
```

### ER Diagram

```
persons (1) ────────────────── (M) lists
            ────────────────── (M) gift_people
            ────────────────── (M) person_occasions
            ────────────────── (M) person_occasion_budgets [NEW]
            ────────────────── (1) gifts (as purchaser_id)

occasions (1) ────────────────── (M) lists
            ────────────────── (M) person_occasions
            ────────────────── (M) person_occasion_budgets [NEW]

gifts (1) ────────────────── (M) list_items
        ────────────────── (M) gift_people

person_occasions (M) ────────────────── (1) person_occasion_budgets [NEW, optional]
```

---

## Query Patterns: Calculating Person Budget per Occasion

### Pattern 1: Recipient Gifts (Gifts TO person)

**Question**: "For Mom (person_id=1) in Christmas 2024 (occasion_id=5), how many gifts is she supposed to receive, and what's their total value?"

**SQL**:
```sql
SELECT COUNT(DISTINCT g.id) as count,
       COALESCE(SUM(g.price), 0) as total
FROM gifts g
JOIN gift_people gp ON g.id = gp.gift_id
JOIN list_items li ON g.id = li.gift_id
JOIN lists l ON li.list_id = l.id
WHERE gp.person_id = 1
  AND gp.role = 'recipient'
  AND l.occasion_id = 5;

-- Result: count=3, total=150.00
```

**Python (SQLAlchemy)**:
```python
async def count_recipient_gifts(self, person_id: int, occasion_id: int) -> tuple[int, Decimal]:
    stmt = (
        select(
            func.count(func.distinct(Gift.id)),
            func.coalesce(func.sum(Gift.price), Decimal("0"))
        )
        .select_from(Gift)
        .join(GiftPerson, Gift.id == GiftPerson.gift_id)
        .join(ListItem, Gift.id == ListItem.gift_id)
        .join(List, ListItem.list_id == List.id)
        .where(
            GiftPerson.person_id == person_id,
            GiftPerson.role == GiftPersonRole.RECIPIENT,
            List.occasion_id == occasion_id
        )
    )
    result = await self.session.execute(stmt)
    count, total = result.one()
    return count, total or Decimal("0")
```

### Pattern 2: Recipient Purchased (Of assigned gifts, how many purchased)

**Question**: "Of Mom's recipient gifts, how many have been purchased?"

**SQL**:
```sql
SELECT COUNT(DISTINCT g.id) as count,
       COALESCE(SUM(g.price), 0) as total
FROM gifts g
JOIN gift_people gp ON g.id = gp.gift_id
JOIN list_items li ON g.id = li.gift_id
JOIN lists l ON li.list_id = l.id
WHERE gp.person_id = 1
  AND gp.role = 'recipient'
  AND l.occasion_id = 5
  AND g.purchase_date IS NOT NULL;

-- Result: count=1, total=50.00
```

### Pattern 3: Purchaser Gifts (Gifts BY person, already bought)

**Question**: "How much has Mom already spent purchasing gifts for others in Christmas 2024?"

**SQL**:
```sql
SELECT COUNT(DISTINCT g.id) as count,
       COALESCE(SUM(g.price), 0) as total
FROM gifts g
JOIN list_items li ON g.id = li.gift_id
JOIN lists l ON li.list_id = l.id
WHERE g.purchaser_id = 1
  AND l.occasion_id = 5
  AND g.purchase_date IS NOT NULL;

-- Result: count=2, total=80.00
```

### Pattern 4: Purchaser To-Buy (Gifts to purchase, not yet bought)

**Question**: "How much more does Mom need to spend purchasing gifts that are assigned to her but not yet bought?"

**SQL**:
```sql
SELECT COUNT(DISTINCT g.id) as count,
       COALESCE(SUM(g.price), 0) as total
FROM gifts g
JOIN list_items li ON g.id = li.gift_id
JOIN lists l ON li.list_id = l.id
WHERE g.purchaser_id = 1
  AND l.occasion_id = 5
  AND g.purchase_date IS NULL;

-- Result: count=1, total=35.00
```

---

## API Request/Response Flow

### GET /persons/{id}/occasions/{occasion_id}/budget

**Request**:
```http
GET /persons/1/occasions/5/budget
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "person_id": 1,
  "occasion_id": 5,

  "allocated_budgets": {
    "recipient_budget_total": 200.00,
    "purchaser_budget_total": 150.00
  },

  "recipient_role": {
    "gifts_assigned_count": 3,
    "gifts_assigned_total": 150.00,
    "gifts_assigned_purchased_count": 1,
    "gifts_assigned_purchased_total": 50.00,
    "remaining_to_purchase_count": 2,
    "remaining_to_purchase_total": 100.00
  },

  "purchaser_role": {
    "gifts_purchased_count": 2,
    "gifts_purchased_total": 80.00,
    "gifts_to_purchase_count": 1,
    "gifts_to_purchase_total": 35.00,
    "total_to_buy": 35.00
  },

  "budget_status": {
    "recipient": {
      "allocated": 200.00,
      "spent": 50.00,
      "remaining": 150.00,
      "over_budget": false,
      "percent_used": 25
    },
    "purchaser": {
      "allocated": 150.00,
      "spent": 80.00,
      "remaining": 70.00,
      "over_budget": false,
      "percent_used": 53.33
    }
  },

  "created_at": "2024-11-01T10:00:00Z",
  "updated_at": "2024-11-05T14:30:00Z"
}
```

### PUT /persons/{id}/occasions/{occasion_id}/budget

**Request**:
```http
PUT /persons/1/occasions/5/budget
Content-Type: application/json

{
  "recipient_budget_total": 250.00,
  "purchaser_budget_total": null
}
```

**Response** (200 OK):
```json
{
  "person_id": 1,
  "occasion_id": 5,
  "allocated_budgets": {
    "recipient_budget_total": 250.00,
    "purchaser_budget_total": null
  },
  // ... rest of budget data ...
}
```

---

## Frontend State & Props Flow

### Component Hierarchy

```
OccasionDetailPage
├─ OccasionHeader
├─ OccasionBudgetSummary (shows occasion-level budget)
├─ PersonBudgetsList
│  └─ PersonBudgetListItem (one per person)
│     ├─ personId={1}
│     ├─ occasionId={5}
│     └─ PersonOccasionBudgetEditor
│        ├─ usePersonOccasionBudget(1, 5) [Hook]
│        │  └─ GET /persons/1/occasions/5/budget [API]
│        │
│        ├─ PersonBudgetBar [Component]
│        │  ├─ personId={1}
│        │  ├─ occasionId={5}
│        │  ├─ recipientBudgetTotal={200}
│        │  ├─ purchaserBudgetTotal={150}
│        │  └─ StackedProgressBar (2x)
│        │     ├─ "Gifts to Receive" (recipient role)
│        │     └─ "Gifts to Buy" (purchaser role)
│        │
│        └─ BudgetEditorForm [Component]
│           ├─ Input: recipientBudgetTotal
│           └─ Input: purchaserBudgetTotal
```

### Hook Data Flow

```typescript
// 1. Hook fetches budget data
const { data, isLoading } = usePersonOccasionBudget(personId=1, occasionId=5);

// 2. data shape
{
  allocated_budgets: {
    recipient_budget_total: 200,
    purchaser_budget_total: 150
  },
  recipient_role: {
    gifts_assigned_total: 150,
    gifts_assigned_purchased_total: 50
  },
  purchaser_role: {
    gifts_purchased_total: 80,
    gifts_to_purchase_total: 35
  },
  budget_status: { ... }
}

// 3. Component renders PersonBudgetBar
<PersonBudgetBar
  personId={1}
  recipientBudgetTotal={data.allocated_budgets.recipient_budget_total}    // 200
  purchaserBudgetTotal={data.allocated_budgets.purchaser_budget_total}    // 150
/>

// 4. PersonBudgetBar renders StackedProgressBar (2x)
<StackedProgressBar
  total={200}                     // Recipient budget
  purchased={50}                  // Recipient purchased
  planned={150}                   // Recipient assigned total
/>

<StackedProgressBar
  total={150}                     // Purchaser budget
  purchased={80}                  // Purchaser purchased
  planned={115}                   // Purchaser total (80 + 35)
/>

// 5. User edits form & mutates
mutation.mutateAsync({
  recipient_budget_total: 300,    // New recipient budget
  purchaser_budget_total: 200     // New purchaser budget
})
  └─ Calls: PUT /persons/1/occasions/5/budget
  └─ Invalidates cache
  └─ Re-fetches data
  └─ Components re-render with new budgets
```

---

## Event & State Management

### State Changes & Side Effects

```
User Action: Set recipient budget to $300
    ↓
BudgetEditorForm.handleSave()
    ├─ setRecipientBudget(300)
    └─ mutation.mutateAsync({ recipient_budget_total: 300 })
        ↓
    API: PUT /persons/1/occasions/5/budget
        ↓
    PersonOccasionBudgetService.set_budget()
        ├─ Check person_id & occasion_id exist
        ├─ PersonOccasionBudgetRepository.set_budget()
        │   ├─ If exists: UPDATE person_occasion_budgets SET recipient_budget_total = 300
        │   └─ If not exists: INSERT into person_occasion_budgets
        └─ Return updated PersonOccasionBudgetResponse
        ↓
    Frontend: mutation.onSuccess()
        ├─ queryClient.invalidateQueries(['person-occasion-budget', 1, 5])
        ├─ Automatic refetch triggered
        └─ PersonBudgetBar re-renders with new values
        ↓
    StackedProgressBar updates
        ├─ total: 300 (was 200)
        ├─ purchased: 50 (unchanged)
        ├─ Progress: [██░░░░░░░░░░░░░░░░] (now ~17% instead of 25%)
```

### Concurrent Updates (Multiple Users)

```
User A: Sets Mom's recipient budget to $300
User B: Adds gift to Mom's wishlist (triggers list re-fetch)

Backend Behavior:
- A's PUT succeeds, updates person_occasion_budgets
- B's GET /lists fetches new list item
- Both changes are independent (no conflicts)
- Frontend reconciles via React Query staleTime & refetchOnWindowFocus

If A & B both PUT simultaneously:
- Last write wins (database level)
- Frontend should show conflict warning or auto-refresh
```

---

## Integration Points

### With Existing Systems

**Budget Calculation** (Existing):
```python
PersonRepository.get_gift_budget(person_id=1, occasion_id=5)
  ├─ Counts gifts by role
  ├─ Filters by occasion via lists
  └─ Returns PersonBudgetResult with all metrics
```

**New Integration**:
```python
PersonOccasionBudgetRepository.get_budget(person_id=1, occasion_id=5)
  ├─ Fetches allocated budgets from person_occasion_budgets table
  └─ Combines with get_gift_budget() results
  └─ Returns comprehensive PersonOccasionBudgetResponse
```

**Frontend Integration**:
```typescript
// Old (global budget, no occasion scope)
usePersonBudget(personId)  // Returns PersonBudget

// New (per-occasion budget)
usePersonOccasionBudget(personId, occasionId)  // Returns PersonOccasionBudgetResponse

// Component still uses same PersonBudgetBar
<PersonBudgetBar
  personId={1}
  occasionId={5}              // [NEW] Pass occasion context
  recipientBudgetTotal={200}  // [NEW] Set specific budget
  purchaserBudgetTotal={150}  // [NEW] Set specific budget
/>
```

---

## Performance Considerations

### Query Complexity

Each budget calculation requires 4 queries:
1. Count recipient gifts
2. Count recipient purchased
3. Count purchaser gifts
4. Count purchaser to-purchase

**Optimization Options**:
- [ ] Combine into single query with CASE statements
- [ ] Cache results in Redis (invalidate on gift creation/purchase)
- [ ] Denormalize counters into person_occasion_budgets table

### Index Strategy

```sql
-- Essential indexes
CREATE INDEX idx_gift_people_person_id_role
    ON gift_people(person_id, role);

CREATE INDEX idx_list_items_gift_id
    ON list_items(gift_id);

CREATE INDEX idx_lists_occasion_id
    ON lists(occasion_id);

CREATE INDEX idx_person_occasion_budgets_person_occasion
    ON person_occasion_budgets(person_id, occasion_id);

-- For pagination
CREATE INDEX idx_persons_id
    ON persons(id);

CREATE INDEX idx_occasions_id
    ON occasions(id);
```

### Caching Strategy

```typescript
// Frontend: React Query
staleTime: 5 * 60 * 1000,      // 5 minutes
refetchOnWindowFocus: true,     // Refetch when user returns
cacheTime: 30 * 60 * 1000,      // Keep in cache 30 minutes

// Backend: Optional Redis
cache_key = f"person_occasion_budget:{person_id}:{occasion_id}"
ttl = 5 * 60  # 5 minutes
# Invalidate on: gift added, gift status changed, budget updated
```

---

## Error Handling

### Common Errors

| Error | Cause | Response |
|-------|-------|----------|
| `PersonNotFound` | person_id doesn't exist | 404 Not Found |
| `OccasionNotFound` | occasion_id doesn't exist | 404 Not Found |
| `InvalidBudgetAmount` | negative or non-numeric | 400 Bad Request |
| `BudgetOverLimit` | person spending exceeds allocated | 200 OK (return status flag) |
| `ConcurrencyConflict` | Another user updated simultaneously | 409 Conflict (with merged data) |

### Frontend Error Handling

```typescript
const { data, error, isLoading } = usePersonOccasionBudget(personId, occasionId);

if (error) {
  if (error.status === 404) {
    return <div>Person or occasion not found</div>;
  }
  if (error.status === 400) {
    return <div>Invalid budget data: {error.message}</div>;
  }
  return <div>Failed to load budget</div>;
}

if (isLoading) {
  return <div>Loading budget...</div>;
}

// Render data
```

---

## Success Criteria

When complete, the feature should:

1. ✓ Store person-occasion budget allocations
2. ✓ Calculate person budget scoped to occasion
3. ✓ Display progress bars with two roles (recipient, purchaser)
4. ✓ Allow setting budgets per person per occasion
5. ✓ Show warning when spending exceeds budget
6. ✓ Handle null budgets (no limit)
7. ✓ Real-time updates when gifts added/purchased
8. ✓ Support concurrent editing (last-write-wins)
9. ✓ Mobile-friendly UI (touch targets, responsive)
10. ✓ Tested end-to-end

---

## Summary

The "Person Budget per Occasion" feature completes the budget hierarchy:

```
Occasion
├─ Occasion-level budget (exists) — single cap for entire event
└─ Person-Occasion budgets (new) — per-person allocations
    ├─ Recipient budget — for gifts TO this person
    └─ Purchaser budget — for gifts BY this person
        └─ Tracked via GiftPerson role + occasion filter
```

This enables granular budget control while maintaining compatibility with existing code.
