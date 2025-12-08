# Person, Occasion, Budget & Gift-Person Relationships Exploration

**Date**: 2025-12-07
**Purpose**: Comprehensive overview of existing Person, Occasion, Budget, and Gift-Person implementations for planning "Person Budget per Occasion" feature

---

## Executive Summary

The codebase has a well-structured foundation with:

1. **Person Entity**: Full profile with interests, sizes, advanced interests, constraints
2. **Occasion Entity**: Event-based budgeting with person linking via junction table
3. **Budget System**: Two-tier system (occasion-level + entity-level)
4. **Gift-Person Relationships**: Dual mechanisms (direct via GiftPerson table + implicit via list ownership)
5. **Frontend Components**: Budget progress bars, person modals with linked data, hooks for fetching

However, **"Person Budget per Occasion" is NOT yet implemented**. The current system has:
- Occasion-level budgets only
- Person-occasion associations (many-to-many)
- Person budget calculations (gifts to/from a person, globally)
- But NO per-occasion person budget tracking

---

## 1. PERSON ENTITY

### 1.1 Database Model

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api/app/models/person.py`

**Core Fields**:
```python
class Person(BaseModel):
    id: int                            # PK
    display_name: str                  # Required, 100 chars max, indexed
    relationship: str | None           # e.g., "Mom", "Sister" (100 chars max)
    birthdate: date | None             # For age/occasion calculation
    anniversary: date | None
    notes: str | None                  # Text field
    interests: list[str] | None        # JSON array
    sizes: dict[str, Any] | None       # Legacy JSON object
    size_profile: list[dict] | None    # New: Array of { type, value, fit?, brand?, notes? }
    advanced_interests: dict | None    # Complex JSON with 5 categories
    constraints: str | None            # Allergies, preferences (text)
    photo_url: str | None              # Avatar (500 chars max)
    created_at: DateTime               # Inherited from BaseModel
    updated_at: DateTime
```

**Relationships**:
- `lists` (1-to-many): Gift lists this person owns
- `occasions` (many-to-many via `person_occasions` junction table)
- `gifts` (many-to-many via `gift_people` junction table)
- `groups` (many-to-many via `person_groups` junction table)
- `gifts_purchasing` (1-to-many): Gifts this person is purchasing (foreign key)

### 1.2 Person Schema (DTOs)

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api/app/schemas/person.py`

Standard CRUD operations:
- `PersonCreate`: For creation (display_name, relationship, birthdate, photo_url, interests, constraints, size_profile, group_ids, advanced_interests)
- `PersonUpdate`: All fields optional
- `PersonResponse`: Full response with groups (as `GroupMinimal[]`), occasion_ids (int[])
- `PersonSummary`: Lightweight response (id, display_name, photo_url)

### 1.3 Advanced Interests Structure

**Spec File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/docs/api/person-entity-spec.md`

5 major categories (all optional, sparse allowed):

1. **food_and_drink**: Wine, beverages, coffee, tea, dietary restrictions, cuisines, treats
2. **style_and_accessories**: Colors, metals, fragrance, jewelry, accessories, style notes
3. **hobbies_and_media**: Hobbies, creative outlets, sports, games, reading, music, authors, fandoms
4. **tech_travel_experiences**: Tech ecosystem, gaming, smart home, travel, experiences
5. **gift_preferences**: Gift card ok?, personalized?, collects, avoid categories, budget comfort, notes

---

## 2. OCCASION ENTITY

### 2.1 Database Model

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api/app/models/occasion.py`

**Core Fields**:
```python
class Occasion(BaseModel):
    id: int                            # PK
    name: str                          # 255 chars, required
    type: OccasionType                 # ENUM: holiday, recurring, other
    date: date                         # Required, indexed
    description: str | None            # Text
    budget_total: Decimal | None       # DECIMAL(10,2) - occasion-level budget
    recurrence_rule: dict | None       # JSONB for recurring occasions
    is_active: bool                    # Default: True
    next_occurrence: date | None       # Next date for recurring
    subtype: str | None                # "birthday", "anniversary", etc. (50 chars)
    created_at: DateTime
    updated_at: DateTime
```

**Relationships**:
- `lists` (1-to-many): Gift lists for this occasion
- `persons` (many-to-many via `person_occasions`): People linked to occasion

**Indexes**:
- idx_occasions_date
- idx_occasions_type

**Junction Table**: `person_occasions`
```python
class PersonOccasion:
    id: int
    person_id: int (FK → persons.id, CASCADE)
    occasion_id: int (FK → occasions.id, CASCADE)
    unique constraint: (person_id, occasion_id)
```

### 2.2 Occasion Schema (DTOs)

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api/app/schemas/occasion.py`

- `OccasionCreate`: name, type, date, description, recurrence_rule, is_active, subtype, person_ids
- `OccasionUpdate`: All fields optional
- `OccasionResponse`: Full response with person_ids (list of linked person IDs)
- `OccasionSummary`: id, name, type, date, list_count

---

## 3. BUDGET-RELATED CODE

### 3.1 Entity Budget Model (Sub-budgets)

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api/app/models/entity_budget.py`

**Purpose**: Allocate budgets to specific gifts or lists WITHIN an occasion

```python
class EntityBudget(BaseModel):
    id: int
    occasion_id: int (FK → occasions.id, CASCADE)
    entity_type: str                   # "gift" or "list" (50 chars)
    entity_id: int                     # ID of the gift or list
    budget_amount: Decimal             # DECIMAL(10,2)
    created_at: DateTime
    updated_at: DateTime

    # Unique constraint: (occasion_id, entity_type, entity_id)
    # Indexes: occasion_id, (entity_type, entity_id), unique on all three
```

**NOT Person-specific**: EntityBudget is for gifts/lists within occasions, not for tracking budgets per person per occasion.

### 3.2 Budget Repository

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api/app/repositories/budget.py`

**Methods**:

| Method | Purpose |
|--------|---------|
| `get_occasion_budget(occasion_id)` | Get occasion.budget_total |
| `set_occasion_budget(occasion_id, amount)` | Set occasion.budget_total |
| `get_entity_budget(occasion_id, entity_type, entity_id)` | Get budget for a specific gift/list |
| `set_entity_budget(occasion_id, entity_type, entity_id, amount)` | Create/update entity budget |
| `get_all_entity_budgets(occasion_id)` | List all entity budgets for occasion |
| `get_purchased_amount(occasion_id)` | Sum of purchased items |
| `get_planned_amount(occasion_id)` | Sum of selected/reserved items |
| `get_total_committed(occasion_id)` | Sum of purchased + selected |
| `get_remaining_budget(occasion_id)` | budget_total - total_committed |
| `get_entity_spent(occasion_id, entity_type, entity_id)` | Amount spent on specific entity |
| `get_entity_budget_status(occasion_id, entity_type, entity_id)` | Complete budget status (budget, spent, remaining, over_budget) |
| `get_budgets_by_entity_type(occasion_id, entity_type)` | All budgets for "gift" or "list" |

**Key Calculation Pattern**:
```python
# Uses ListItem status to determine spending
effective_price = COALESCE(discount_price, price)
total_cost = effective_price * quantity

# Purchased: status = 'purchased'
# Planned: status = 'selected'
# Remaining: budget_total - (purchased + planned)
```

### 3.3 Person Gift Budget

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api/app/repositories/person.py` (lines 294-445)

**Dataclass**: `PersonBudgetResult`

```python
@dataclass
class PersonBudgetResult:
    person_id: int
    occasion_id: int | None           # Can be None for global budget

    # Recipient role (gifts TO this person)
    gifts_assigned_count: int
    gifts_assigned_total: Decimal
    gifts_assigned_purchased_count: int    # NEW: Of assigned, how many purchased
    gifts_assigned_purchased_total: Decimal

    # Purchaser role (gifts BY this person)
    gifts_purchased_count: int         # Gifts already purchased
    gifts_purchased_total: Decimal
    gifts_to_purchase_count: int       # NEW: Gifts assigned to buy but not yet bought
    gifts_to_purchase_total: Decimal
```

**Method**: `get_gift_budget(person_id, occasion_id=None) → PersonBudgetResult`

**Queries**:

1. **Recipient Gifts (assigned TO this person)**:
   ```sql
   Gift JOIN GiftPerson
   WHERE GiftPerson.person_id = X
   AND GiftPerson.role = 'recipient'
   ```

2. **Recipient Purchased (of assigned gifts, how many are purchased)**:
   ```sql
   Gift JOIN GiftPerson
   WHERE GiftPerson.person_id = X
   AND GiftPerson.role = 'recipient'
   AND Gift.purchase_date IS NOT NULL
   ```

3. **Purchaser Gifts (gifts BY this person, already bought)**:
   ```sql
   Gift
   WHERE Gift.purchaser_id = X
   AND Gift.purchase_date IS NOT NULL
   ```

4. **Purchaser To-Buy (gifts assigned to purchase but not yet bought)**:
   ```sql
   Gift
   WHERE Gift.purchaser_id = X
   AND Gift.purchase_date IS NULL
   ```

**Frontend Type**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web/types/budget.ts`

```typescript
interface PersonBudget {
  person_id: number
  occasion_id: number | null
  gifts_assigned_count: number
  gifts_assigned_total: number
  gifts_assigned_purchased_count: number
  gifts_assigned_purchased_total: number
  gifts_purchased_count: number
  gifts_purchased_total: number
  gifts_to_purchase_count: number
  gifts_to_purchase_total: number
}
```

---

## 4. GIFT-PERSON RELATIONSHIPS

### 4.1 GiftPerson Junction Table

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api/app/models/gift_person.py`

```python
class GiftPerson(BaseModel):
    id: int
    gift_id: int (FK → gifts.id, CASCADE)
    person_id: int (FK → persons.id, CASCADE)
    role: GiftPersonRole                # ENUM: recipient, purchaser, contributor
    created_at: DateTime
    updated_at: DateTime

    # Relationships
    gift: Mapped[Gift]
    person: Mapped[Person]

    # Unique constraint: (gift_id, person_id, role)
    # Prevents duplicate role assignments
```

**Role Types**:
- `RECIPIENT`: Gift is intended for this person
- `PURCHASER`: Gift is being purchased by this person
- `CONTRIBUTOR`: Shared purchase contribution

### 4.2 Two Linking Mechanisms (Critical Gap)

**Mechanism 1: Direct Linking via GiftPerson**
- Used by: Budget calculations (`get_gift_budget()`)
- Query: `Gift JOIN GiftPerson WHERE GiftPerson.person_id = X AND role = 'recipient'`
- Captures: Role-based relationships

**Mechanism 2: Implicit List-Based Linking**
- Used by: Frontend `LinkedGiftsSection` component
- Query: `Gift JOIN ListItem JOIN List WHERE List.person_id = X`
- Captures: Gifts in lists that person owns

**The Gap**: These query different data!
- A gift linked directly via GiftPerson (with role) but NOT in any list:
  - **Shows up** in budget calculations ✓
  - **Doesn't show** in LinkedGiftsSection ✗
  - Confusing UX

---

## 5. FRONTEND COMPONENTS

### 5.1 Person Budget Bar Component

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web/components/people/PersonBudgetBar.tsx`

**Props**:
```typescript
interface PersonBudgetBarProps {
  personId: number
  variant?: 'card' | 'modal'           // card=compact, modal=full
  occasionId?: number                  // Currently unused (future: filter to occasion)
  className?: string
  recipientBudgetTotal?: number | null // Budget for gifts TO person
  purchaserBudgetTotal?: number | null // Budget for gifts BY person
}
```

**Display Logic**:

```
Per Role (Recipient or Purchaser):
- No budget + No gifts → Section hidden
- No budget + Has gifts → Totals only (no bar)
- Has budget + No gifts → Empty progress bar
- Has budget + Has gifts → Full progress bar with colors
```

**Two Roles Displayed**:
1. **"Gifts to Receive"**: Shows gifts assigned TO person as recipient
   - Purchased: `gifts_assigned_purchased_total` (green)
   - Planned: `gifts_assigned_total - gifts_assigned_purchased_total` (amber)
   - Budget: `recipientBudgetTotal`

2. **"Gifts to Buy"**: Shows gifts assigned BY person as purchaser
   - Purchased: `gifts_purchased_total` (green)
   - Planned: `gifts_to_purchase_total + gifts_purchased_total` (amber)
   - Budget: `purchaserBudgetTotal`

### 5.2 Stacked Progress Bar Component

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web/components/ui/stacked-progress-bar.tsx`

**Props**:
```typescript
interface StackedProgressBarProps {
  total: number                        // Full bar width
  planned: number                      // Amber segment
  purchased: number                    // Green segment (overlays planned)
  label?: string
  showAmounts?: boolean                // Show currency values
  showHeaders?: boolean                // Show column headers above amounts
  variant?: 'recipient' | 'purchaser'
  size?: 'sm' | 'md' | 'lg'
  tooltipItems?: TooltipItem[]         // Hover-to-show gift details
  onItemClick?: (id) => void
  maxTooltipItems?: number             // Show max 5, "+N more"
}
```

**Visual**:
```
[████████████████░░░░░░░░░░░░░░░░░░░░|
 └─purchased─┘└─planned─┘└──remaining──┘
```

**Colors**:
- Track: bg-warm-200 (light grey)
- Purchased: bg-emerald-500 (green)
- Planned: bg-amber-400 (amber/mustard)

**Recently Added Features**:
- `showHeaders` prop (added in commit 8652b23): Shows column headers "Purchased | Planned | Budget"
- Conditional display feature in PersonBudgetBar (commit e9be3f4)

### 5.3 Person Modal Tabs

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web/components/modals/PersonDetailModal.tsx`

**Tabs**:
1. **Overview**: Basic info (name, relationship, birthdate, photo, interests, sizes, constraints, notes)
2. **Advanced**: Advanced interests (wine, style, hobbies, tech, gift preferences)
3. **Linked Entities**:
   - Gifts linked to this person (via LinkedGiftsSection)
   - Lists owned by this person
4. **Comments**: Comment thread
5. **History**: Audit log

### 5.4 Linked Gifts Section

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web/components/people/LinkedGiftsSection.tsx`

**Groups Gifts By**:
```typescript
// Client-side grouping only by purchase status:
if (gift.purchase_date) {
  purchased.push(gift);
} else {
  pending.push(gift);
}
```

**Uses Hook**: `useGiftsByPerson(personId)`
- Calls: `GET /gifts?person_ids=[personId]`
- Returns: Gifts in lists owned by that person (not gifts where person is recipient!)

### 5.5 React Hooks

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web/hooks/useGifts.ts`

```typescript
export function useGiftsByPerson(personId: number, options = {}) {
  return useGifts(
    { person_ids: [personId] },
    { ...options, enabled: !!personId }
  );
}
```

**File**: (inferred) `usePersonBudget.ts`
```typescript
export function usePersonBudget(personId: number, occasionId?: number) {
  return useQuery({
    queryKey: ['person-budget', personId, occasionId],
    queryFn: () => fetch(`/api/persons/${personId}/budgets?occasion_id=${occasionId || ''}`),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true
  });
}
```

---

## 6. API ENDPOINTS

### 6.1 Person Endpoints

**Router**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api/app/api/persons.py`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/persons` | GET | List all people (paginated, with group filter) |
| `/persons` | POST | Create person |
| `/persons/{id}` | GET | Get person details |
| `/persons/{id}` | PUT | Update person |
| `/persons/{id}` | DELETE | Delete person |
| `/persons/{id}/budgets` | GET | **Get person budget (global, not per occasion yet)** |

**GET /persons/{id}/budgets** Response:
```json
{
  "person_id": 1,
  "occasion_id": null,
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

### 6.2 Occasion Endpoints

**Router**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api/app/api/occasions.py`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/occasions` | GET | List all occasions |
| `/occasions` | POST | Create occasion |
| `/occasions/{id}` | GET | Get occasion details |
| `/occasions/{id}` | PUT | Update occasion |
| `/occasions/{id}` | DELETE | Delete occasion |
| `/occasions/{id}/budget` | GET/PUT | Get/set occasion-level budget |

### 6.3 Budget Endpoints

**Inferred from repository**: Budget management is likely under `/occasions/{id}/budget` or separate endpoints

---

## 7. DATABASE RELATIONSHIPS DIAGRAM

```
persons (id, display_name, ...)
    ├── lists (person_id FK)           [1-to-many: Person owns Lists]
    ├── person_occasions (person_id FK) [M-to-M: Person linked to Occasions]
    ├── gift_people (person_id FK)     [M-to-M: Person linked to Gifts with role]
    ├── person_groups (person_id FK)   [M-to-M: Person in Groups]
    └── gifts (purchaser_id FK)        [1-to-many: Person is purchaser]

occasions (id, name, date, budget_total)
    ├── lists (occasion_id FK)         [1-to-many: Occasion has Lists]
    ├── person_occasions (occasion_id FK) [M-to-M: Occasion linked to Persons]
    ├── entity_budgets (occasion_id FK) [1-to-many: Budget allocations]
    └── (NO direct person_budget table) ← THIS IS THE GAP

gifts (id, name, price, purchase_date, purchaser_id FK)
    ├── list_items (gift_id FK)        [1-to-many: Gift in ListItems]
    ├── gift_people (gift_id FK)       [M-to-M: Gift linked to Persons with role]
    └── stores (M-to-M)                [Linked via gift_stores table]

lists (id, name, person_id FK, occasion_id FK)
    ├── list_items (list_id FK)        [1-to-many: List contains Items]
    └── occasions (M-to-M implicit)    [Lists belong to Occasions]

entity_budgets (occasion_id FK, entity_type, entity_id, budget_amount)
    └── (Polymorphic: references gifts or lists, not persons)
```

---

## 8. CURRENT STATE: PERSON BUDGET PER OCCASION

### 8.1 What EXISTS

✓ Occasion-level budget tracking (`Occasion.budget_total`)
✓ Person-occasion associations (`person_occasions` junction table)
✓ Person budget calculations (global, not occasion-scoped)
✓ Entity-level budgets (gifts/lists within occasions, not persons)
✓ Frontend progress bar component (StackedProgressBar)
✓ Frontend PersonBudgetBar with optional budget props

### 8.2 What's MISSING

✗ Person-Occasion budget tracking (e.g., "For Mom at Christmas, budget $100 for gifts she receives")
✗ API endpoint to get/set person budget per occasion
✗ Repository method to calculate person budget scoped to occasion
✗ Database table or column to store person-occasion budgets
✗ Frontend hook to fetch person budget for specific occasion
✗ UI to edit/set person budgets per occasion
✗ Budget validation: "Does person's gifts for this occasion exceed her budget?"

### 8.3 Design Decisions Needed

Before implementing "Person Budget per Occasion", decide:

1. **Storage**: New `person_occasion_budget` junction table? Or add fields to `person_occasions`?
2. **Two Roles**: Track separate budgets for "Gifts to Receive" and "Gifts to Buy" per occasion?
3. **Scope**: Calculate based on:
   - Gifts directly linked via GiftPerson (current mechanism)
   - Gifts in lists for this person (current UI mechanism)
   - Both? (would require reconciling the dual mechanisms)
4. **API Design**:
   - `GET /occasions/{occasion_id}/persons/{person_id}/budget`
   - `PUT /occasions/{occasion_id}/persons/{person_id}/budget`
5. **Frontend**: Where to display/edit?
   - Occasion detail page → Person budget section?
   - Person detail modal → Budget per occasion tab?
   - Both?

---

## 9. KEY FILES SUMMARY

### Models (Database)
| File | Lines | Purpose |
|------|-------|---------|
| `services/api/app/models/person.py` | 1-187 | Person ORM model |
| `services/api/app/models/occasion.py` | 1-124 | Occasion ORM model |
| `services/api/app/models/gift_person.py` | 1-84 | GiftPerson junction + role enum |
| `services/api/app/models/entity_budget.py` | 1-83 | Entity-level budget model |

### Schemas (DTOs)
| File | Purpose |
|------|---------|
| `services/api/app/schemas/person.py` | Person request/response DTOs |
| `services/api/app/schemas/occasion.py` | Occasion DTOs with person_ids |
| (implicit) `services/api/app/schemas/budget.py` | Budget DTOs (if exists) |

### Repositories
| File | Key Methods |
|------|-------------|
| `services/api/app/repositories/person.py` | `get_gift_budget()`, `get_with_lists()`, `search_by_name()` |
| `services/api/app/repositories/occasion.py` | (assumed standard CRUD) |
| `services/api/app/repositories/budget.py` | All budget operations |

### API Routers
| File | Endpoints |
|------|-----------|
| `services/api/app/api/persons.py` | Person CRUD + `/budgets` |
| `services/api/app/api/occasions.py` | Occasion CRUD + `/budget` |

### Frontend Components
| File | Purpose |
|------|---------|
| `apps/web/components/people/PersonBudgetBar.tsx` | Budget visualization for person (2 roles) |
| `apps/web/components/ui/stacked-progress-bar.tsx` | Stacked progress bar (purchased + planned) |
| `apps/web/components/people/LinkedGiftsSection.tsx` | Shows gifts linked to person |
| `apps/web/components/modals/PersonDetailModal.tsx` | Person modal with linked entities tab |
| `apps/web/types/budget.ts` | Budget TypeScript types |

### Hooks
| File (inferred) | Purpose |
|-----------------|---------|
| `apps/web/hooks/useGifts.ts` | `useGiftsByPerson()` hook |
| `apps/web/hooks/usePersonBudget.ts` | `usePersonBudget()` hook (assumed) |

### Documentation
| File | Purpose |
|------|---------|
| `docs/api/person-entity-spec.md` | Complete Person field specification |
| `.claude/findings/gift-person-linking-exploration.md` | Detailed gift-person analysis |
| `.claude/findings/quick-reference-gift-person-linking.md` | Quick reference |

---

## 10. PATTERNS & CONVENTIONS

### Backend Patterns

**Layered Architecture**:
```
Router (app/api/occasions.py)
  ↓ passes OccasionCreate/OccasionUpdate
Service (app/services/occasion.py)
  ↓ business logic, ORM→DTO conversion
Repository (app/repositories/occasion.py)
  ↓ database queries
Database
```

**Repository Return Types**:
- ORM models (e.g., `Gift`, `Person`, `Occasion`)
- Service converts to DTOs before returning to API

**Query Patterns**:
- Use `selectinload()` to avoid N+1 queries
- Eager load relationships based on endpoint needs
- Use SQLAlchemy 2.x `select()` syntax

**Decimal for Currency**:
- All money fields use `Numeric(10, 2)` (DECIMAL in PostgreSQL)
- Python: `Decimal` type
- Frontend: Serialized as float in JSON

### Frontend Patterns

**React Query + Hooks**:
```typescript
export function useEntity(id: number, options = {}) {
  return useQuery({
    queryKey: ['entity', id],
    queryFn: () => fetch(`/api/entity/${id}`).then(r => r.json()),
    staleTime: 5 * 60 * 1000,              // 5 minutes
    refetchOnWindowFocus: true,
    enabled: !!id,
    ...options
  });
}
```

**Component Composition**:
- Server components by default (App Router)
- 'use client' only where interactive
- Radix/shadcn primitives with Tailwind

**Touch Targets**:
- Minimum 44px for all interactive elements: `min-h-[44px] min-w-[44px]`

**Currency Formatting**:
```typescript
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}
```

---

## 11. RELATED DOCUMENTATION

**Person Entity Spec**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/docs/api/person-entity-spec.md`
- Complete field reference
- Validation rules
- Advanced interests structure

**Gift-Person Exploration**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/.claude/findings/gift-person-linking-exploration.md`
- Detailed analysis of dual linking mechanisms
- Identified gaps
- Recommendations

**Budget Progress Meter PRD**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/docs/project_plans/PRDs/features/budget-progression-meter-v1.md`
- Feature specification (if exists)

---

## 12. Next Steps for "Person Budget per Occasion"

1. **Decide on Storage**:
   - Option A: New table `person_occasion_budgets`
   - Option B: Add to `person_occasions` junction table
   - Option C: Leverage existing `entity_budgets` with entity_type='person'

2. **Create Models**:
   - Define `PersonOccasionBudget` (or extend `PersonOccasion`)
   - Add fields: `recipient_budget_total`, `purchaser_budget_total`

3. **Create Repository Methods**:
   - `get_person_occasion_budget(person_id, occasion_id) → PersonOccasionBudgetResult`
   - Scoped queries to count/sum gifts per person per occasion

4. **Create DTOs & API Endpoints**:
   - `PersonOccasionBudgetResponse` DTO
   - `PUT /persons/{id}/occasions/{occasion_id}/budget`
   - `GET /persons/{id}/occasions/{occasion_id}/budget`

5. **Update Frontend**:
   - Modify `usePersonBudget` hook to accept `occasionId` parameter
   - Pass budgets to `PersonBudgetBar` component
   - Update occasional detail page or person modal to show per-occasion budgets

6. **Testing**:
   - Unit tests for repository budget calculations
   - Integration tests for API endpoints
   - E2E tests for UI interactions

---

## Conclusion

The codebase has a solid foundation with Person, Occasion, and Budget entities, plus complex gift-person relationships. The PersonBudgetBar component is already prepared to accept optional per-occasion budget props. The main work is:

1. Designing the storage mechanism for person-occasion budgets
2. Implementing repository queries scoped to person+occasion
3. Creating API endpoints for get/set operations
4. Hooking up the frontend to fetch and display occasion-scoped budgets

The dual linking mechanisms (GiftPerson vs list-based) should be resolved as part of this feature—likely by unifying on GiftPerson with proper role filtering.
