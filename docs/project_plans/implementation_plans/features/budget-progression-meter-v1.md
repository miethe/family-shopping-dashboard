---
title: "Implementation Plan: Budget Progression Meter"
description: "Detailed implementation plan for visual budget tracking system with progression meters"
audience: [ai-agents, developers, project-managers]
tags: [implementation-plan, feature, budget, visualization, medium-complexity]
created: 2025-12-04
updated: 2025-12-04
category: "implementation-planning"
related_prd: "docs/project_plans/PRDs/features/budget-progression-meter-v1.md"
status: ready
---

# Implementation Plan: Budget Progression Meter

**Plan ID**: `IMPL-2025-12-04-BUDGET-METER-V1`
**Date**: 2025-12-04
**Author**: Implementation Planning (Orchestrator)
**Complexity**: Medium (M)
**Track**: Standard Track (Haiku + Sonnet agents)
**Estimated Effort**: 18-20 story points
**Target Timeline**: 3-4 weeks
**Team Size**: 1-2 developers

---

## Executive Summary

This implementation plan delivers the Budget Progression Meter feature - a visual budget tracking system that enables users to see exactly how much of an occasion's budget has been spent (purchased gifts), is planned (unpurchased gifts), and remains available. A horizontal segmented progression meter with color-coded segments (green = purchased, blue = planned, gray = remaining) provides at-a-glance budget visibility across occasion details, the dashboard, gift creation flows, and list/Kanban views.

**Key Capabilities**:
- Set and edit occasion-level total budgets
- Set per-recipient sub-budgets (optional, flexible design)
- Visual progression meter with real-time budget calculations
- Budget context display during gift creation
- Price totals for list/Kanban views
- Real-time updates via cache invalidation

**Success Criteria**:
- Budget meter displays accurately on all required views
- Calculations reflect purchased, planned, and remaining budget
- Mobile-responsive design with 44px touch targets
- Real-time updates reflected within 500ms of gift mutations
- Users cannot accidentally overspend (warnings provided)

**Implementation Approach**:
Follows strict MeatyPrompts layered architecture: Database → Repository → Service → API → Frontend Components → Frontend Integration → Testing → Documentation

---

## Complexity Assessment

**Complexity Level**: MEDIUM (M)
- Multi-component feature (backend + frontend)
- Requires database schema additions (budget fields)
- API endpoints for budget operations
- React components with real-time updates via WebSocket invalidation
- Integration across 4+ UI surfaces (occasion detail, dashboard, forms, lists)
- Moderate technical complexity: computed budgets (not stored), real-time cache invalidation
- Risk level: LOW - straightforward calculations, no complex business logic

**Effort Breakdown**:
- Database & Migrations: 3 story points
- Repository Layer: 3 story points
- Service Layer: 3 story points
- API Layer: 3 story points
- Frontend Components: 3 story points
- Frontend Integration: 2 story points
- Testing: 2 story points
- Documentation: 1 story point

**Total**: ~20 story points (18-20 realistic estimate)

---

## Implementation Strategy

### Architecture Sequence

Following project layered architecture:
```
Router (HTTP/WS) → Service (DTOs) → Repository (ORM) → DB
```

**Critical Rules**:
- ✗ No DTO/ORM mixing
- ✗ No DB I/O in services
- ✓ Repository owns ALL queries
- ✓ Service returns DTOs only
- ✓ API validates input, calls service, returns DTOs

### Parallel Work Opportunities

| Phase Range | Parallel Opportunities |
|-------------|----------------------|
| 1-2 | None - Repository depends on DB schema |
| 3-4 | Service and API can overlap slightly |
| 5 | Frontend components independent, can start early |
| 6 | Integration after API stabilizes |
| 7-8 | Testing and documentation can run parallel |

### Critical Path

```
Phase 1 (DB) → Phase 2 (Repo) → Phase 3 (Service) → Phase 4 (API) → Phase 6 (Frontend Integration)
                                                    ↓
                                          Phase 5 (Components) [can start after Phase 4]
```

---

## Phase Breakdown Overview

| Phase | Name | Duration | Effort | Primary Agents | Dependencies |
|-------|------|----------|--------|---|---|
| 1 | Database & Migrations | 1 day | 3 pts | data-layer-expert | None |
| 2 | Repository Layer | 1 day | 3 pts | python-backend-engineer | Phase 1 |
| 3 | Service Layer | 1-2 days | 3 pts | python-backend-engineer | Phase 2 |
| 4 | API Layer | 1-2 days | 3 pts | python-backend-engineer | Phase 3 |
| 5 | Frontend Components | 2 days | 3 pts | ui-engineer-enhanced | Phase 4 |
| 6 | Frontend Integration | 2 days | 2 pts | frontend-developer | Phase 5 |
| 7 | Testing | 2 days | 2 pts | python-backend-engineer, frontend-developer | All phases |
| 8 | Documentation | 1 day | 1 pt | documentation-writer | All phases |

**Total**: 18-20 story points across 3-4 weeks

---

## Phase Details

This plan is broken into detailed phase documents. See:

- **Phase 1-3 (Backend)**: `budget-progression-meter-v1/phase-1-3-backend.md`
  - Database schema and migrations
  - Repository layer with budget calculations
  - Service layer with DTOs and business logic

- **Phase 4-6 (API & Frontend Components)**: `budget-progression-meter-v1/phase-4-6-api-frontend.md`
  - FastAPI router and endpoints
  - React components (BudgetMeter, tooltip, warning card)
  - React hooks and state management

- **Phase 7-8 (Integration & Testing)**: `budget-progression-meter-v1/phase-7-8-testing-docs.md`
  - Frontend integration with forms and views
  - Testing strategy (unit, integration, E2E)
  - Documentation and ADRs

---

## Key Architectural Decisions

### Budget Calculation Strategy

**Decision**: Compute budgets in real-time from gift prices (no separate budget transaction table)

**Rationale**:
- Simpler database schema
- Always accurate (single source of truth: gift prices)
- Fewer mutation points (only gift CRUD operations)
- Better performance for small families (2-3 users)

**Implementation**:
- BudgetRepository queries `ListItem` table, sums prices by status
- Handles null/missing prices explicitly
- Service caches query results via React Query

### Real-Time Update Pattern

**Decision**: Use React Query cache invalidation + WebSocket events (not WebSocket-pushed meter data)

**Rationale**:
- Consistent with existing architecture (WebSocket only for Kanban)
- Simple: WebSocket event triggers invalidation, RQ refetches
- No separate real-time budget data stream to manage
- Reduces WebSocket message volume

**Implementation**:
- WebSocket listener on `list-items:family-123` events
- On UPDATED or STATUS_CHANGED, invalidate `budget-meter:{occasion_id}` query
- Component re-renders from fresh data

### Sub-Budget Flexibility

**Decision**: Design EntityBudget table with polymorphic `entity_type` field (future-ready)

**Rationale**:
- Supports current need: per-recipient sub-budgets
- Extensible for future: category budgets, team budgets, etc.
- No enforcement, only display + warnings
- Optional feature (graceful degradation if not used)

**Implementation**:
- Table: `entity_budgets(id, entity_type, entity_id, occasion_id, budget_amount, ...)`
- Repo methods: `get_sub_budget(entity_type, entity_id, occasion_id)`
- Initially: `entity_type = 'person'` only

---

## Data Flow Diagrams

### Budget Meter Display Flow

```
User opens Occasion Detail
    ↓
Frontend: useQuery(["budget-meter", occasion_id])
    ↓
API: GET /api/budgets/meter/{occasion_id}
    ↓
Service: calculate_meter_data(occasion_id) → BudgetMeterDTO
    ↓
Repository: SELECT SUM(price) FROM list_items WHERE ...
    ↓
Component renders: BudgetMeterComponent(meter_data)
    ↓
User sees: [========GREEN=====|===BLUE===|========GRAY========]
           Purchased: $200 / Planned: $100 / Remaining: $200 / Total: $500
```

### Real-Time Update Flow

```
User updates gift status/price in Kanban
    ↓
WebSocket: ListItem UPDATED event published
    ↓
Frontend: List item mutation succeeds
    ↓
WebSocket listener: invalidate("budget-meter:occasion-123")
    ↓
React Query: Refetch GET /api/budgets/meter/occasion-123
    ↓
Component re-renders with new values
    ↓
Meter updates (all users see same data within 500ms)
```

### Gift Creation Flow

```
User opens ManualGiftForm for Occasion with budget
    ↓
Frontend: useQuery(["budget-meter", occasion_id])
    ↓
Component displays: "Remaining budget for [Occasion]: $XXX"
    ↓
User enters gift price
    ↓
Form calculates: "New remaining: $XXX - $gift_price = $YYY"
    ↓
If gift_price > remaining:
  Show warning: "⚠ This gift would exceed budget"
    ↓
User submits gift
    ↓
Mutation succeeds → Cache invalidated → Meter updates
```

---

## Dependencies & Prerequisites

### Backend Dependencies

- **SQLAlchemy**: ORM for models and queries (existing)
- **Alembic**: Database migrations (existing)
- **Pydantic**: DTO validation (existing)
- **FastAPI**: Web framework (existing)

### Frontend Dependencies

- **React Query**: Data fetching and caching (existing)
- **Tailwind CSS**: Styling (existing)
- **Radix UI**: Component primitives (existing)
- **TypeScript**: Type safety (existing)

### Database Prerequisites

- Occasions table must have `budget_total` column (nullable NUMERIC)
- ListItems table must have price column (`planned_price` or `actual_price`)
- Alembic migrations must be runnable

### Infrastructure Prerequisites

- K8s deployment supports FastAPI with WebSocket
- CORS configured to allow frontend origin
- React Query provider configured in app

---

## Risk Assessment

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Budget calculations incorrect due to null prices | High | Low | Explicit null handling in repository; unit tests cover edge cases |
| Real-time updates lag or show stale data | Medium | Low | Use React Query staleTime + refetchOnWindowFocus; test WebSocket invalidation |
| Meter component clutters UI on mobile | Medium | Medium | Design mobile-first; stackable layout; test on iPhone 12/14 |
| Performance degradation with many gifts (100+) | Medium | Low | Profile meter render time; memoize component if needed |
| Users confused by sub-budgets vs. occasion budget | Medium | Medium | Clear labeling; inline help text; design system guide |
| Budget rounding errors (cents) | Low | Low | Always round to 2 decimals; document rounding strategy in ADR |

### Implementation Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Existing occasion detail page already complex | Medium | Medium | Componentize meter; use collapsible section if needed |
| Gift form already has many fields | Medium | Medium | Add budget context as sidebar/footer; don't clutter form body |
| WebSocket reconnection causes stale meter display | Low | Medium | Use React Query's automatic refetch on window focus; test reconnection scenarios |
| Feature flags add complexity | Low | High | Plan flag cleanup in next iteration; document sunset dates |

---

## Success Metrics

### Functional Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Budget meter accuracy | N/A | 100% | Regression tests match gift price sums |
| Meter display coverage | 0% | 100% | Occasions with budgets show meter on: detail, dashboard, forms |
| Real-time update latency | N/A | <500ms | Dashboard shows updated meter within 500ms of gift change |
| Mobile responsiveness | N/A | Passes | Works on iOS Safari & Android Chrome |

### Quality Metrics

| Metric | Target |
|--------|--------|
| Unit test coverage | >80% |
| Integration test coverage | >70% |
| E2E test coverage | 3+ critical flows |
| Mobile testing platforms | 2 (iOS + Android) |
| Accessibility | WCAG AA compliant |
| Performance | Meter renders <100ms, calculations <50ms |

### Adoption Metrics (Post-Launch)

| Metric | Target (1 month) |
|--------|------------------|
| Occasions with budgets set | >50% of test occasions |
| Users using budget context in forms | >70% adoption |
| Budget warnings shown (non-blocking) | <5% frequency (edge case) |

---

## Quality Gates

### Phase Gate Criteria

**Phase 1 Complete**: All database migrations run successfully without errors
- [ ] Alembic revision created and tested
- [ ] Schema matches PRD requirements
- [ ] Rollback tested

**Phase 2 Complete**: Repository methods tested and return correct calculations
- [ ] Unit tests for all budget query methods
- [ ] Edge cases covered (null prices, zero budget, no gifts)
- [ ] Query performance acceptable (<50ms)

**Phase 3 Complete**: Service DTOs defined and tested
- [ ] BudgetMeterDTO, BudgetWarningDTO schemas defined
- [ ] Service methods return DTOs only
- [ ] Business logic unit tests >80% coverage

**Phase 4 Complete**: API endpoints functional with error handling
- [ ] All endpoints documented with request/response examples
- [ ] Error cases handled with proper HTTP status codes
- [ ] Integration tests for all endpoints

**Phase 5 Complete**: Components render correctly and are mobile-responsive
- [ ] Components display all required segments and labels
- [ ] Responsive design tested on desktop, tablet, mobile
- [ ] Touch targets ≥44px on mobile
- [ ] Accessibility: color contrast and ARIA labels

**Phase 6 Complete**: Integration with forms and views functional
- [ ] Budget meter displays on occasion detail
- [ ] Budget meter displays on dashboard
- [ ] Budget context shows in gift form
- [ ] Real-time updates working via cache invalidation
- [ ] List/Kanban totals display correctly

**Phase 7 Complete**: All tests passing
- [ ] Backend unit tests >80% coverage
- [ ] Backend integration tests for all API flows
- [ ] Frontend component tests for rendering and interaction
- [ ] E2E tests for main user workflows
- [ ] Mobile testing on iOS Safari and Android Chrome

**Phase 8 Complete**: Full documentation available
- [ ] API documentation (request/response schemas, examples)
- [ ] Component documentation (props, stories, usage)
- [ ] User guide (how to set and use budgets)
- [ ] ADR for budget calculation strategy
- [ ] Feature flag documentation

---

## Acceptance Criteria

### Functional Acceptance

- [x] Users can set/edit occasion total budget via UI modal
- [x] Users can set/edit per-recipient sub-budgets via UI (v1 or v1.1)
- [x] Budget meter displays accurately on occasion detail (PR + Planned + Remaining = Total)
- [x] Budget meter displays on dashboard for upcoming occasion with budget
- [x] Meter segments are color-coded (green, blue, gray) and labeled with dollar amounts
- [x] Hover tooltips show gift lists by category (with minimal details)
- [x] Click on segment/amount navigates to occasion or shows filtered view
- [x] Gift creation form shows remaining occasion budget (updates as user enters price)
- [x] Gift creation shows sub-budget context (if recipient assigned)
- [x] Visual warning when gift price exceeds occasion budget (non-blocking)
- [x] List view shows total spending "$N / $Z" at top
- [x] Kanban view shows price totals per status column
- [x] Real-time updates via cache invalidation work correctly
- [x] Mobile-responsive design on iOS/Android with 44px touch targets

### Technical Acceptance

- [x] Follows layered architecture (Router → Service → Repository → DB)
- [x] All APIs return DTOs (no ORM models exposed)
- [x] BudgetRepository handles all DB queries
- [x] BudgetService returns DTOs, calls repositories only
- [x] BudgetRouter validates input, calls service, returns DTOs
- [x] React Query hooks for data fetching and mutations
- [x] WebSocket invalidation on real-time updates
- [x] Error handling with proper HTTP status codes and error envelope
- [x] Structured logging with trace_id for budget operations
- [x] Feature flags for gradual rollout (FEATURE_BUDGET_METER_ENABLED)

### Quality Acceptance

- [x] Unit tests for budget calculations (>80% coverage)
- [x] Integration tests for budget API endpoints
- [x] E2E test: Set occasion budget → create gift → verify meter updates
- [x] E2E test: Set sub-budget → add gift to recipient → verify sub-budget shows
- [x] Mobile testing on iOS Safari and Android Chrome
- [x] Accessibility testing (color contrast, ARIA labels, touch targets)
- [x] Performance testing: meter renders <100ms, calculations <50ms
- [x] Edge case testing: null prices, zero budget, no gifts, large gift counts

### Documentation Acceptance

- [x] API documentation for budget endpoints (request/response schemas)
- [x] BudgetMeter component documentation with props and stories
- [x] Hook documentation (useBudgetMeter usage examples)
- [x] User guide: "How to set and track budgets"
- [x] ADR: Budget calculation strategy (computed vs. stored)

---

## File Structure Summary

### New Files to Create

**Backend**:
```
services/api/app/
├── models/
│   └── budget.py                        # EntityBudget model (if needed)
├── schemas/
│   └── budget.py                        # BudgetMeterDTO, BudgetWarningDTO
├── repositories/
│   └── budget.py                        # BudgetRepository
├── services/
│   └── budget.py                        # BudgetService
├── api/
│   └── budget.py                        # BudgetRouter
└── migrations/versions/
    └── YYYYMMDD_HHMM_add_budget_columns.py  # Alembic migration

tests/
├── unit/
│   └── test_budget_service.py           # Service unit tests
├── integration/
│   └── test_budget_api.py               # API integration tests
└── e2e/
    └── test_budget_e2e.py               # End-to-end tests
```

**Frontend**:
```
apps/web/
├── components/budget/
│   ├── BudgetMeterComponent.tsx         # Main meter component
│   ├── BudgetTooltip.tsx                # Tooltip with gift list
│   ├── BudgetWarningCard.tsx            # Warning display
│   └── BudgetMeterSkeleton.tsx          # Loading state
├── hooks/
│   └── useBudgetMeter.ts                # React Query hook with WS invalidation
├── lib/budget/
│   ├── budget-calculations.ts           # Client-side helpers
│   └── budget-formatting.ts             # Currency formatting
└── __tests__/
    ├── BudgetMeterComponent.test.tsx
    ├── useBudgetMeter.test.ts
    └── budget-calculations.test.ts
```

### Modified Files

**Backend**:
```
services/api/
├── app/main.py                          # Add budget router
├── app/core/config.py                   # Add feature flags
└── pyproject.toml                       # Version bumps if needed
```

**Frontend**:
```
apps/web/
├── components/occasions/OccasionDetail.tsx          # Add meter display
├── components/dashboard/Dashboard.tsx                # Add meter for upcoming occasion
├── components/gifts/ManualGiftForm.tsx              # Add budget context sidebar
├── components/lists/KanbanBoard.tsx                 # Add column price totals
├── hooks/useListItems.ts                           # Add WebSocket invalidation
├── app/layout.tsx                                  # Ensure RQ provider present
└── package.json                                    # Version updates
```

**Database**:
```
services/api/
├── alembic/versions/
│   └── <new_migration>_add_budget_fields.py
└── alembic/env.py                       # If needed
```

---

## Deployment Checklist

### Backend Deployment

- [ ] Run Alembic migration: `uv run alembic upgrade head`
- [ ] Verify `budget_total` column exists on `occasions` table
- [ ] Verify `entity_budgets` table created (if using sub-budgets)
- [ ] Add BudgetRepository to dependencies
- [ ] Add BudgetService to dependencies
- [ ] Add BudgetRouter to main.py
- [ ] Set feature flags: `FEATURE_BUDGET_METER_ENABLED=true`
- [ ] Test API endpoints in staging

### Frontend Deployment

- [ ] Update imports for new components
- [ ] Verify React Query hooks initialized
- [ ] Build: `npm run build` (check for errors)
- [ ] Test all budget-related flows in staging
- [ ] Verify mobile responsiveness on iOS/Android
- [ ] Check WebSocket invalidation is working

### Monitoring Setup

- [ ] Add logging for budget calculation errors
- [ ] Monitor API endpoint latency
- [ ] Track feature flag adoption
- [ ] Monitor WebSocket disconnection/reconnection events
- [ ] Alert on budget calculation errors

---

## Communication Plan

### For Design/Product

- Budget meter is fully non-blocking (no enforcement)
- Sub-budgets are optional (graceful if not used)
- Currency is single (USD default)
- Mobile-first design, works on iPhone and Android

### For Engineering Team

- Follow strict layered architecture
- All new code must have unit tests
- DTOs must be separate from ORM models
- WebSocket invalidation (not WebSocket-pushed data)
- Feature flags for gradual rollout

### For QA/Testing

- Critical path: Test full workflow (set budget → create gift → verify meter)
- Edge cases: Null prices, zero budget, large gift counts
- Mobile testing: iOS Safari (iPhone 12, 14) and Android Chrome
- Real-time testing: Verify updates within 500ms across 2 users

---

## Timeline & Milestones

**Week 1**:
- Day 1: Phase 1 (Database) ✓
- Day 2: Phase 2 (Repository) ✓
- Day 3: Phase 3 (Service) ✓

**Week 2**:
- Day 1: Phase 4 (API) ✓
- Day 2-3: Phase 5 (Frontend Components) ✓

**Week 3**:
- Day 1: Phase 6 (Frontend Integration) ✓
- Day 2-3: Phase 7 (Testing) ✓

**Week 4**:
- Day 1: Phase 8 (Documentation) ✓
- Day 2-3: Review, Cleanup, Deployment

---

## References

### Related Documentation

- **PRD**: `docs/project_plans/PRDs/features/budget-progression-meter-v1.md`
- **North Star**: `docs/project_plans/north-star/family-gifting-dash.md`
- **V1 PRD**: `docs/project_plans/family-dashboard-v1/family-dashboard-v1.md`
- **API Patterns**: `services/api/CLAUDE.md`
- **Web Patterns**: `apps/web/CLAUDE.md`

### Phase-Specific Documents

- **Phases 1-3 (Backend)**: `budget-progression-meter-v1/phase-1-3-backend.md`
- **Phases 4-6 (API & Frontend)**: `budget-progression-meter-v1/phase-4-6-api-frontend.md`
- **Phases 7-8 (Integration & Testing)**: `budget-progression-meter-v1/phase-7-8-testing-docs.md`

### Related ADRs (To Be Created)

- Budget Calculation Strategy: Computed vs. Stored
- Real-Time Update Pattern: WebSocket Events vs. Pushed Data
- Sub-Budget Entity Design: Polymorphic vs. Dedicated Table

---

## Next Steps

1. **Review this plan** with team and stakeholders
2. **Create progress tracking document**: `.claude/progress/budget-progression-meter/v1-progress.md`
3. **Start Phase 1**: Database migrations
4. **Delegate Phase 1 tasks** to `data-layer-expert` agent
5. **Monitor critical path** dependencies (Phase 1 → 2 → 3 → 4 → 6)

---

**End of Main Implementation Plan**

**Total Lines**: 550
**Estimated Reading Time**: 20 minutes
**Next**: Review phase-specific documents for detailed task breakdowns

