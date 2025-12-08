---
type: context
prd: person-occasion-budgets-v1
created: 2025-12-07
updated: 2025-12-07
status: planning
session_notes: []
---

# Person-Occasion Budgets v1 - Implementation Context

## Overview

Enable setting and tracking individual budgets for each person within each occasion. This allows users to allocate different budget amounts per person per occasion (e.g., $100 for Mom at Christmas, $50 for Mom at Birthday).

**Total Effort**: 42 story points (~7 days)
**Phases**: 6
**User Stories**: 14

## Key Documents

### Planning Documents
- **PRD**: `/docs/project_plans/PRDs/features/person-occasion-budgets-v1.md`
- **Implementation Plan**: `/docs/project_plans/implementation_plans/features/person-occasion-budgets-v1.md`

### Progress Tracking
- **Phase 1**: `.claude/progress/person-occasion-budgets-v1/phase-1-database-progress.md`
- **Phase 2**: `.claude/progress/person-occasion-budgets-v1/phase-2-repository-progress.md`
- **Phase 3**: `.claude/progress/person-occasion-budgets-v1/phase-3-api-progress.md`
- **Phase 4**: `.claude/progress/person-occasion-budgets-v1/phase-4-hooks-progress.md`
- **Phase 5**: `.claude/progress/person-occasion-budgets-v1/phase-5-ui-progress.md`
- **Phase 6**: `.claude/progress/person-occasion-budgets-v1/phase-6-testing-progress.md`

### Related Features
- **Budget Progression Meter v1**: Related visualization feature
- **Gift Linking v1**: Gifts linked to persons for budget calculations

## Architecture Summary

### Data Model

**PersonOccasion Model** (extended):
```python
class PersonOccasion(Base):
    person_id: int          # FK to Person
    occasion_id: int        # FK to Occasion
    # NEW FIELDS:
    budget_amount: Decimal  # User-set budget (nullable)
    budget_spent: Decimal   # Calculated from GiftPerson.amount
    budget_currency: str    # Default 'USD'
    budget_notes: Text      # Optional notes (nullable)
```

**Composite Index**: `(person_id, occasion_id, budget_amount)` for efficient queries

### Layer Architecture

```
Frontend (Next.js)
└── PersonOccasionBudgetCard component
    └── usePersonOccasionBudget hook
        └── GET /api/v1/persons/{id}/occasions/{oid}/budget

Frontend (Next.js)
└── PersonOccasionBudgetCard component (edit mode)
    └── useUpdatePersonOccasionBudget mutation
        └── PUT /api/v1/persons/{id}/occasions/{oid}/budget

API Layer (FastAPI)
└── Router: /persons/{id}/occasions/{oid}/budget
    └── PersonService.get_occasion_budget()
        └── PersonOccasionRepository.get_person_occasion_budget()
            └── PostgreSQL: SELECT * FROM person_occasions WHERE...

API Layer (FastAPI)
└── Router: /persons/{id}/occasions/{oid}/budget
    └── PersonService.set_occasion_budget()
        └── PersonOccasionRepository.update_person_occasion_budget()
        └── GiftRepository.get_gift_budget(occasion_id filter)
            └── PostgreSQL: UPDATE person_occasions SET..., SELECT SUM(...)
```

### DTOs

**Backend (Pydantic)**:
- `PersonOccasionBudgetResponse`: Response DTO with computed fields
- `PersonOccasionBudgetUpdate`: Request DTO for updates

**Frontend (TypeScript)**:
- `PersonOccasionBudget`: Matches backend response
- `PersonOccasionBudgetUpdate`: Matches backend request
- `PersonOccasionBudgetParsed`: Helper type with numbers (for calculations)

## Implementation Phases

### Phase 1: Database Schema & Migration (3.5 pts, 0.5 day)
**Status**: Not Started
**Tasks**: DB-001, DB-002, DB-003
**Owner**: data-layer-expert

Extend PersonOccasion model with budget fields, create migration, add composite index.

**Key Files**:
- `services/api/app/models/person_occasion.py`
- `services/api/alembic/versions/<timestamp>_add_budget_fields_to_person_occasion.py`

### Phase 2: Repository Layer (9 pts, 1.5 days)
**Status**: Not Started
**Tasks**: REPO-001, REPO-002, REPO-003, REPO-004
**Owner**: python-backend-engineer

Implement repository methods for budget CRUD and gift budget calculations.

**Key Files**:
- `services/api/app/repositories/person_occasion_repository.py`
- `services/api/app/repositories/gift_repository.py`
- `services/api/tests/unit/repositories/test_person_occasion_repository.py`

### Phase 3: Service & API Layer (14 pts, 1.5 days)
**Status**: Not Started
**Tasks**: API-001 through API-007
**Owners**: python-backend-engineer, backend-architect

Create DTOs, service methods, REST endpoints, and integration tests.

**Key Files**:
- `services/api/app/schemas/person.py`
- `services/api/app/services/person_service.py`
- `services/api/app/api/v1/endpoints/persons.py`
- `services/api/tests/integration/test_person_budget_api.py`

### Phase 4: Frontend Hooks & Data Layer (8 pts, 1 day)
**Status**: Not Started
**Tasks**: HOOK-001 through HOOK-004
**Owners**: ui-engineer-enhanced, frontend-developer

Create TypeScript types, React Query hooks, and hook tests.

**Key Files**:
- `apps/web/src/types/budget.ts`
- `apps/web/src/hooks/usePersonOccasionBudget.ts`
- `apps/web/src/hooks/__tests__/usePersonOccasionBudget.test.ts`

### Phase 5: UI Components & Pages (25 pts, 2 days)
**Status**: Not Started
**Tasks**: UI-001 through UI-008
**Owners**: ui-engineer-enhanced, frontend-developer

Build budget components, integrate into pages, add auto-save, implement warnings.

**Key Files**:
- `apps/web/src/components/budgets/PersonOccasionBudgetCard.tsx`
- `apps/web/src/components/budgets/PersonBudgetBar.tsx`
- `apps/web/src/components/persons/PersonBudgetsTab.tsx`
- `apps/web/src/components/persons/PersonDetailModal.tsx`
- `apps/web/src/components/occasions/OccasionRecipientsSection.tsx`

### Phase 6: Testing & Polish (21 pts, 1.5 days)
**Status**: Not Started
**Tasks**: TEST-001 through TEST-006
**Owners**: frontend-developer, ui-engineer-enhanced, code-reviewer

E2E tests, accessibility audit, performance testing, UAT, bug fixes.

**Key Files**:
- `apps/web/e2e/person-occasion-budgets.spec.ts`
- `.claude/worknotes/person-occasion-budgets-v1/accessibility-audit.md`
- `.claude/worknotes/person-occasion-budgets-v1/performance-report.md`
- `.claude/worknotes/person-occasion-budgets-v1/uat-checklist.md`

## Key Design Decisions

### 1. Storage on PersonOccasion Table
**Decision**: Store budget fields on PersonOccasion join table, not Person or Occasion.

**Rationale**:
- Budgets are specific to person-occasion pairs
- Enables different budgets for same person across occasions
- Efficient queries with composite index

**Alternatives Considered**:
- Separate BudgetAllocation table: More normalized but adds JOIN complexity
- Store on Person table: Doesn't support per-occasion budgets

### 2. Stored budget_spent vs. Calculated
**Decision**: Store budget_spent as a field, update via repository method.

**Rationale**:
- Performance: Avoid aggregation on every read
- Simpler queries for budget displays
- Trade-off: Must update when gifts change (acceptable for 2-3 users)

**Alternatives Considered**:
- Calculate on-the-fly: Slower, especially with many gifts
- Cached computed field: More complex, not needed for small scale

### 3. Auto-Save with Debounce
**Decision**: Auto-save budget changes after 1 second of inactivity.

**Rationale**:
- Better UX than explicit "Save" button
- Reduces friction, encourages budget setting
- 1 second balances responsiveness and API call frequency

**Alternatives Considered**:
- Explicit save button: More traditional, but more clicks
- Immediate save: Too many API calls, poor performance

### 4. Optimistic Updates
**Decision**: Update UI immediately, rollback on error.

**Rationale**:
- Instant feedback improves perceived performance
- Single-tenant: Low risk of conflicts
- React Query handles rollback automatically

**Alternatives Considered**:
- Wait for server response: Slower UX
- Pessimistic locking: Overkill for 2-3 users

### 5. 404 Handling for Unset Budgets
**Decision**: Return default budget (amount: null, spent: 0) instead of 404.

**Rationale**:
- UX: "No budget set" is a valid state, not an error
- Simplifies frontend logic (always renders budget section)
- Avoids error states for expected condition

**Alternatives Considered**:
- Return 404: Requires error handling, shows error UI
- Require budget on person-occasion creation: Forces users to set budgets upfront

## Technical Patterns

### Backend Patterns

**Repository Pattern**:
- All database access through repository layer
- Repository methods return ORM models
- Service layer converts ORM → DTO

**Upsert Pattern**:
```python
# Get or create
person_occasion = await get_person_occasion_budget(person_id, occasion_id, db)
if not person_occasion:
    person_occasion = PersonOccasion(person_id=person_id, occasion_id=occasion_id)
    db.add(person_occasion)

# Update fields
if budget_amount is not None:
    person_occasion.budget_amount = budget_amount

await db.commit()
```

**Computed Fields in DTO**:
```python
class PersonOccasionBudgetResponse(BaseModel):
    budget_remaining: Decimal  # Computed: budget_amount - budget_spent
    is_over_budget: bool       # Computed: budget_spent > budget_amount
```

### Frontend Patterns

**React Query Hooks**:
- `usePersonOccasionBudget`: Query hook for fetching
- `useUpdatePersonOccasionBudget`: Mutation hook for updating
- Query key factory for cache management

**Optimistic Updates**:
```typescript
onMutate: async (update) => {
  await queryClient.cancelQueries({ queryKey });
  const previous = queryClient.getQueryData(queryKey);
  queryClient.setQueryData(queryKey, { ...previous, ...update });
  return { previous };
},
onError: (err, update, context) => {
  queryClient.setQueryData(queryKey, context.previous);
}
```

**Auto-Save with Debounce**:
```typescript
const debouncedSave = useMemo(
  () => debounce((value) => mutate({ budget_amount: value }), 1000),
  [mutate]
);
```

## Integration Points

### Existing Features
- **PersonBudgetBar**: Extended with `occasionId` prop for filtering
- **PersonDetailModal**: New "Budgets" tab added
- **OccasionRecipientsSection**: Budget bars displayed per recipient

### New Features
- **Budget Progression Meter v1**: Will consume PersonOccasionBudget data
- Future reports/analytics: Can query budget vs. spent across occasions

### External Dependencies
- **PostgreSQL**: Database for budget storage
- **React Query**: Frontend state management
- **Radix UI**: Component library for UI elements
- **Tailwind CSS**: Styling framework

## Performance Considerations

### Database
- **Composite Index**: `(person_id, occasion_id, budget_amount)` optimizes queries
- **Query Time**: Target < 10ms for budget retrieval
- **Load**: 2-3 concurrent users, low load

### Frontend
- **Bundle Size**: Target < 20KB increase (gzipped)
- **Rendering**: PersonBudgetsTab with 10 budgets < 50ms
- **Caching**: 5-minute staleTime reduces API calls

### API
- **Throughput**: Target > 100 req/sec
- **Response Time**: 99th percentile < 100ms

## Testing Strategy

### Unit Tests (60%)
- Repository methods (REPO-004)
- Service methods (covered in Phase 3)
- Hook logic (HOOK-004)

### Integration Tests (30%)
- API endpoints (API-007)
- Component rendering (UI-008)

### E2E Tests (10%)
- Budget CRUD workflows (TEST-001)
- Progress updates (TEST-002)

### Manual Testing
- Accessibility audit (TEST-003)
- Performance testing (TEST-004)
- User acceptance testing (TEST-005)

## Risks and Mitigations

### Risk: budget_spent Out of Sync
**Mitigation**:
- Update budget_spent when gifts created/updated/deleted
- Repository method ensures consistency
- Future: Add periodic reconciliation job if needed

### Risk: Decimal Precision Loss
**Mitigation**:
- Use Decimal type (not float) in backend
- Serialize as string in JSON
- Parse carefully in frontend

### Risk: Race Conditions (Multiple Edits)
**Mitigation**:
- Single-tenant app (2-3 users)
- Low probability of simultaneous edits
- Optimistic updates handle most cases
- Last-write-wins acceptable for this use case

### Risk: Performance Degradation
**Mitigation**:
- Composite index on budget queries
- Stored budget_spent (not calculated on-the-fly)
- React Query caching reduces API calls
- Monitor performance in Phase 6

## Success Metrics

### Functionality
- [ ] All 14 user stories implemented
- [ ] All 42 story points completed
- [ ] All tests pass (unit, integration, E2E)

### Quality
- [ ] Accessibility score >= 95 (Lighthouse)
- [ ] Performance score >= 90 (Lighthouse)
- [ ] 0 critical bugs
- [ ] 0 high severity bugs

### User Experience
- [ ] UAT approved
- [ ] Auto-save working reliably
- [ ] Over-budget warnings clear and actionable
- [ ] Mobile experience smooth

## Session Notes

<!--
Add session notes as implementation progresses:

### Session 1: 2025-XX-XX
- Completed: Phase 1 (DB schema)
- Decisions: ...
- Blockers: None
- Next: Phase 2 (Repository)

### Session 2: 2025-XX-XX
- Completed: Phase 2 (Repository)
- Decisions: ...
- Blockers: ...
- Next: Phase 3 (API)

(Continue for each session)
-->

## Quick Start Guide

### For Backend Work (Phases 1-3)
```bash
cd /Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api

# Create migration
uv run alembic revision --autogenerate -m "Add budget fields to PersonOccasion"

# Apply migration
uv run alembic upgrade head

# Run tests
uv run pytest tests/unit/repositories/ -v
uv run pytest tests/integration/ -v
```

### For Frontend Work (Phases 4-5)
```bash
cd /Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web

# Type check
npm run type-check

# Run tests
npm test -- usePersonOccasionBudget.test.ts

# Start dev server
npm run dev
```

### For E2E Testing (Phase 6)
```bash
cd /Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web

# Run E2E tests
npm run test:e2e -- person-occasion-budgets.spec.ts

# Lighthouse audit
npm run lighthouse -- --only-categories=accessibility,performance /occasions/1
```

## References

### Internal Docs
- **Project CLAUDE.md**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/CLAUDE.md`
- **API Patterns**: `services/api/CLAUDE.md`
- **Frontend Patterns**: `apps/web/CLAUDE.md`

### External Docs
- **React Query**: https://tanstack.com/query/latest
- **Radix UI**: https://radix-ui.com/
- **Playwright**: https://playwright.dev/
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/

### Related PRDs
- **Budget Progression Meter v1**: `/docs/project_plans/PRDs/features/budget-progression-meter-v1.md`
- **Gift Linking v1**: (Referenced in implementation)

---

**Last Updated**: 2025-12-07
**Next Review**: After Phase 1 completion
