# Person Budget per Occasion - Implementation Checklist

**Goal**: Enable setting and tracking budgets for each person's gifts within specific occasions

---

## Exploration Results: What Exists

### ✓ Already Implemented

- [x] Person entity with all profiles
- [x] Occasion entity with occasion-level budget
- [x] Person-Occasion junction table (many-to-many)
- [x] PersonBudgetBar component (accepts optional recipientBudgetTotal, purchaserBudgetTotal)
- [x] StackedProgressBar progress visualization
- [x] Person gift budget calculations (global scope)
- [x] PersonBudgetResult dataclass with role-based metrics
- [x] GiftPerson junction table with role enum (recipient, purchaser, contributor)
- [x] BudgetRepository with comprehensive budget methods
- [x] Frontend hooks for fetching person and gift data

### ✗ Missing for Full Feature

- [ ] Person-Occasion budget database design (how to store per-occasion budgets)
- [ ] Repository method: Calculate person budget scoped to occasion
- [ ] API endpoint: GET /persons/{id}/occasions/{occasion_id}/budget
- [ ] API endpoint: PUT /persons/{id}/occasions/{occasion_id}/budget
- [ ] DTO for person-occasion budget response
- [ ] Frontend hook: usePersonOccasionBudget(personId, occasionId)
- [ ] UI to view/edit person budgets per occasion
- [ ] Validation: Check if person's gifts exceed budget

---

## File Structure Quick Reference

### Backend (Python/FastAPI)

```
services/api/app/
├── models/
│   ├── person.py                      # Person ORM (1-187)
│   ├── occasion.py                    # Occasion ORM (1-124)
│   ├── gift_person.py                 # GiftPerson junction + role enum
│   ├── entity_budget.py               # Entity-level budgets
│   └── person.py (lines 152-187)      # PersonOccasion junction
│
├── schemas/
│   ├── person.py                      # PersonCreate, PersonUpdate, PersonResponse
│   ├── occasion.py                    # OccasionCreate, OccasionUpdate, OccasionResponse
│   └── budget.py                      # Budget DTOs
│
├── repositories/
│   ├── person.py                      # PersonRepository.get_gift_budget()
│   ├── occasion.py                    # OccasionRepository (basic CRUD)
│   └── budget.py                      # BudgetRepository (all budget logic)
│
├── services/
│   ├── person.py                      # PersonService (business logic)
│   ├── occasion.py                    # OccasionService
│   └── budget.py                      # BudgetService (inferred)
│
└── api/
    ├── persons.py                     # GET /persons/{id}/budgets
    └── occasions.py                   # Occasion CRUD
```

### Frontend (React/TypeScript)

```
apps/web/
├── components/
│   ├── people/
│   │   ├── PersonBudgetBar.tsx        # Main component (accepts optional budgets)
│   │   ├── PersonDetailModal.tsx      # Modal with tabs (no budget UI yet)
│   │   ├── LinkedGiftsSection.tsx     # Shows gifts linked to person
│   │   └── PersonCard.tsx
│   │
│   ├── ui/
│   │   └── stacked-progress-bar.tsx   # Progress visualization
│   │
│   └── modals/
│       └── PersonDetailModal.tsx      # (same as above, alternate location)
│
├── hooks/
│   ├── useGifts.ts                    # useGiftsByPerson()
│   ├── usePersonBudget.ts             # usePersonBudget() [needs occasion param]
│   └── useOccasions.ts                # useOccasions()
│
└── types/
    └── budget.ts                      # Budget TypeScript interfaces
```

---

## Database Changes Needed

### Option A: New Junction Table (Recommended)

```sql
CREATE TABLE person_occasion_budgets (
    id SERIAL PRIMARY KEY,
    person_id INT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    occasion_id INT NOT NULL REFERENCES occasions(id) ON DELETE CASCADE,

    -- Budget per role
    recipient_budget_total DECIMAL(10,2),   -- Budget for gifts TO person
    purchaser_budget_total DECIMAL(10,2),   -- Budget for gifts BY person

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    UNIQUE (person_id, occasion_id),
    CHECK (recipient_budget_total IS NULL OR recipient_budget_total >= 0),
    CHECK (purchaser_budget_total IS NULL OR purchaser_budget_total >= 0)
);

CREATE INDEX idx_person_occasion_budgets_person_id
    ON person_occasion_budgets(person_id);
CREATE INDEX idx_person_occasion_budgets_occasion_id
    ON person_occasion_budgets(occasion_id);
```

**Python Model**:
```python
class PersonOccasionBudget(BaseModel):
    __tablename__ = "person_occasion_budgets"

    person_id: Mapped[int] = mapped_column(
        ForeignKey("persons.id", ondelete="CASCADE"),
        nullable=False
    )
    occasion_id: Mapped[int] = mapped_column(
        ForeignKey("occasions.id", ondelete="CASCADE"),
        nullable=False
    )

    recipient_budget_total: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        default=None
    )
    purchaser_budget_total: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        default=None
    )

    __table_args__ = (
        UniqueConstraint("person_id", "occasion_id", name="uq_person_occasion_budget"),
    )
```

### Option B: Extend PersonOccasion (Simpler)

```python
class PersonOccasion(BaseModel):
    # ... existing fields ...

    # NEW: Budget for this person's gifts in this occasion
    recipient_budget_total: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        default=None
    )
    purchaser_budget_total: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        default=None
    )
```

**Pros**: Fewer tables
**Cons**: PersonOccasion already serves as association; mixing concerns

---

## Implementation Sequence

### Phase 1: Backend Model & Migration

1. **Create Model**: PersonOccasionBudget (or extend PersonOccasion)
2. **Create Migration**: Alembic revision to create table
3. **Add Relationships**: Link model to Person and Occasion

### Phase 2: Backend Repository & Service

4. **Add Repository Methods**:
   - `get_person_occasion_budget(person_id, occasion_id)`
   - `set_person_occasion_budget(person_id, occasion_id, recipient_total, purchaser_total)`
   - Helper: `calculate_person_occasion_budget(person_id, occasion_id)` (scoped queries)

5. **Update PersonRepository.get_gift_budget()**:
   - Accept `occasion_id` parameter
   - Filter gift queries to occasion scope

### Phase 3: Backend API

6. **Create DTO**: PersonOccasionBudgetResponse
7. **Create Service**: PersonOccasionBudgetService
8. **Add Endpoints**:
   - `GET /persons/{id}/occasions/{occasion_id}/budget`
   - `PUT /persons/{id}/occasions/{occasion_id}/budget`

### Phase 4: Frontend

9. **Update Hook**: Modify `usePersonBudget()` to accept `occasionId` param
10. **Add Occasion Selector**: UI to pick occasion (if not in occasion context)
11. **Display Budgets**: Update PersonBudgetBar or create new component
12. **Add Edit UI**: Form to set budgets

### Phase 5: Testing

13. **Unit Tests**: Repository budget calculations
14. **Integration Tests**: API endpoints
15. **E2E Tests**: Full workflow

---

## Code Sketch: Repository Method

```python
# services/api/app/repositories/person.py

async def get_gift_budget(
    self,
    person_id: int,
    occasion_id: int | None = None,  # NEW: Optional occasion filter
) -> PersonBudgetResult:
    """
    Calculate gift budget for a person, optionally scoped to occasion.

    If occasion_id is provided, only count gifts in that occasion's lists.
    If occasion_id is None, count all gifts globally.
    """

    # Base queries as before, but with optional occasion filter

    # Recipient gifts (TO this person)
    stmt = (
        select(func.count(Gift.id), func.coalesce(func.sum(Gift.price), 0))
        .select_from(Gift)
        .join(GiftPerson)
        .where(
            GiftPerson.person_id == person_id,
            GiftPerson.role == GiftPersonRole.RECIPIENT
        )
    )

    # NEW: Filter by occasion if provided
    if occasion_id is not None:
        stmt = stmt.join(ListItem).join(List).where(
            List.occasion_id == occasion_id
        )

    # Execute and accumulate results...

    return PersonBudgetResult(...)
```

---

## API Endpoint Sketch

```python
# services/api/app/api/persons.py

@router.get(
    "/{person_id}/occasions/{occasion_id}/budget",
    response_model=PersonOccasionBudgetResponse,
    summary="Get person's budget for an occasion"
)
async def get_person_occasion_budget(
    person_id: int,
    occasion_id: int,
    service: PersonOccasionBudgetService = Depends()
) -> PersonOccasionBudgetResponse:
    """
    Get budget allocation and spending for a person within an occasion.

    Combines:
    - Allocated budgets (recipient_budget_total, purchaser_budget_total)
    - Calculated spending (gifts_assigned_total, gifts_purchased_total, etc.)
    - Progress metrics (percent_spent, remaining, over_budget)
    """
    return await service.get_budget(person_id, occasion_id)


@router.put(
    "/{person_id}/occasions/{occasion_id}/budget",
    response_model=PersonOccasionBudgetResponse,
    summary="Set person's budget for an occasion"
)
async def set_person_occasion_budget(
    person_id: int,
    occasion_id: int,
    data: SetPersonOccasionBudgetRequest,
    service: PersonOccasionBudgetService = Depends()
) -> PersonOccasionBudgetResponse:
    """
    Set or update budget allocations for a person within an occasion.

    Request:
    {
        "recipient_budget_total": 500.00,    # Budget for gifts TO person (null = no limit)
        "purchaser_budget_total": 300.00     # Budget for gifts BY person (null = no limit)
    }
    """
    return await service.set_budget(person_id, occasion_id, data)
```

---

## Frontend Hook Sketch

```typescript
// apps/web/hooks/usePersonOccasionBudget.ts

export function usePersonOccasionBudget(
  personId: number,
  occasionId: number,
  options: UseQueryOptions = {}
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['person-occasion-budget', personId, occasionId],
    queryFn: async () => {
      const res = await fetch(
        `/api/persons/${personId}/occasions/${occasionId}/budget`
      );
      if (!res.ok) throw new Error('Failed to fetch budget');
      return res.json() as Promise<PersonOccasionBudgetResponse>;
    },
    staleTime: 5 * 60 * 1000,  // 5 minutes
    refetchOnWindowFocus: true,
    enabled: !!personId && !!occasionId,
    ...options
  });

  const mutation = useMutation({
    mutationFn: async (data: SetPersonOccasionBudgetRequest) => {
      const res = await fetch(
        `/api/persons/${personId}/occasions/${occasionId}/budget`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }
      );
      if (!res.ok) throw new Error('Failed to set budget');
      return res.json() as Promise<PersonOccasionBudgetResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['person-occasion-budget', personId, occasionId]
      });
    }
  });

  return { ...query, mutation };
}
```

---

## Frontend Component Sketch

```typescript
// apps/web/components/people/PersonOccasionBudgetEditor.tsx

export function PersonOccasionBudgetEditor({
  personId: number,
  occasionId: number
}) {
  const { data: budget, isLoading } = usePersonOccasionBudget(personId, occasionId);
  const { mutation } = usePersonOccasionBudget(personId, occasionId);
  const [recipientBudget, setRecipientBudget] = useState<number | null>(null);
  const [purchaserBudget, setPurchaserBudget] = useState<number | null>(null);

  useEffect(() => {
    if (budget) {
      setRecipientBudget(budget.recipient_budget_total);
      setPurchaserBudget(budget.purchaser_budget_total);
    }
  }, [budget]);

  const handleSave = async () => {
    await mutation.mutateAsync({
      recipient_budget_total: recipientBudget,
      purchaser_budget_total: purchaserBudget
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label>Budget for Gifts to Receive</label>
        <Input
          type="number"
          value={recipientBudget || ''}
          onChange={(e) => setRecipientBudget(e.target.value ? parseFloat(e.target.value) : null)}
          placeholder="No limit"
        />
      </div>

      <div>
        <label>Budget for Gifts to Buy</label>
        <Input
          type="number"
          value={purchaserBudget || ''}
          onChange={(e) => setPurchaserBudget(e.target.value ? parseFloat(e.target.value) : null)}
          placeholder="No limit"
        />
      </div>

      <Button onClick={handleSave} disabled={mutation.isPending}>
        Save Budgets
      </Button>

      {/* Display PersonBudgetBar with fetched budgets */}
      <PersonBudgetBar
        personId={personId}
        variant="modal"
        occasionId={occasionId}
        recipientBudgetTotal={recipientBudget}
        purchaserBudgetTotal={purchaserBudget}
      />
    </div>
  );
}
```

---

## Testing Checklist

### Unit Tests

- [ ] PersonRepository.get_gift_budget() with occasion_id filter
- [ ] BudgetCalculations: Recipient gifts count/sum for occasion
- [ ] BudgetCalculations: Purchaser gifts count/sum for occasion
- [ ] PersonOccasionBudget model validation

### Integration Tests

- [ ] GET /persons/{id}/occasions/{occasion_id}/budget returns correct data
- [ ] PUT /persons/{id}/occasions/{occasion_id}/budget creates/updates budget
- [ ] Over-budget detection (spent > allocated)
- [ ] Null budgets (no limit) handled correctly

### E2E Tests

- [ ] Navigate to occasion detail
- [ ] Select person
- [ ] Set recipient budget, see progress bar update
- [ ] Set purchaser budget, see progress bar update
- [ ] Add gift to person in occasion, verify progress bar updates
- [ ] Mark gift purchased, verify progress bar reflects new state

---

## Key Decision Points

1. **Storage**: Separate table vs extend PersonOccasion?
   - **Recommendation**: Separate table (cleaner, but Option B is simpler for MVP)

2. **Role-based Budgets**: Separate budgets for recipient vs purchaser?
   - **Recommendation**: Yes (already supported in PersonBudgetBar component)

3. **Null Budgets**: "No budget" = no limit, or invalid?
   - **Recommendation**: Null = no limit (allows optional budgets)

4. **Occasion Scope**: Gift queries filtered to occasion's lists, or all gifts linked to person?
   - **Recommendation**: Occasion scope (filter by List.occasion_id)

5. **UI Location**: Where to set budgets?
   - **Option A**: Occasion detail page → Person section
   - **Option B**: Person modal → Budget tab (new)
   - **Option C**: Separate budget management page
   - **Recommendation**: Option A (occasion-centric view)

---

## Performance Considerations

- [ ] Add indexes on `person_occasion_budgets(person_id, occasion_id)`
- [ ] Cache person budget queries (5 minute staleTime)
- [ ] Use eager loading for related persons/occasions
- [ ] Consider pagination if many person-occasion combos

---

## Related PRDs/Docs

- **Budget Progression Meter V1**: `/docs/project_plans/PRDs/features/budget-progression-meter-v1.md`
- **Gift-Person Linking**: `.claude/findings/gift-person-linking-exploration.md`
- **Person Entity Spec**: `docs/api/person-entity-spec.md`

---

## Timeline Estimate

- **Design & DB Schema**: 0.5 days
- **Backend (Model, Repo, Service, API)**: 1.5 days
- **Frontend (Hook, Components, UI)**: 1.5 days
- **Testing**: 1 day
- **Documentation**: 0.5 days

**Total**: ~5 days (MVP)

---

## Next Steps

1. **Review this document** with the team
2. **Decide on storage mechanism** (new table vs extend PersonOccasion)
3. **Create database migration**
4. **Implement backend repository & API**
5. **Implement frontend hook & components**
6. **Test end-to-end**
7. **Document API & UI patterns**
