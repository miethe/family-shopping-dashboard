---
title: "Implementation Plan: Person Budget per Occasion"
description: "Phased implementation overview for person-occasion budget feature with links to detailed phase plans"
audience: [ai-agents, developers, stakeholders]
tags: [implementation, planning, phases, budgets, persons, occasions]
created: 2025-12-07
updated: 2025-12-07
category: "product-planning"
status: active
related:
  - /docs/project_plans/PRDs/features/person-occasion-budgets-v1.md
  - /docs/project_plans/family-dashboard-v1/family-dashboard-v1.md
---

# Implementation Plan: Person Budget per Occasion

**Plan ID**: `IMPL-2025-12-07-PERSON-OCCASION-BUDGETS`
**Date**: 2025-12-07
**Status**: Ready for implementation

**Related Documents**:

- **PRD**: `/docs/project_plans/PRDs/features/person-occasion-budgets-v1.md`
- **V1 Core**: `/docs/project_plans/family-dashboard-v1/family-dashboard-v1.md`
- **Architecture**: `/CLAUDE.md`, `/services/api/CLAUDE.md`, `/apps/web/CLAUDE.md`

---

## Executive Summary

This implementation plan transforms the Person Budget per Occasion PRD into actionable phases. The feature extends the PersonOccasion junction table with budget columns, creates budget management API endpoints, and wires budget visualization components to backend data.

**Complexity**: Medium (M)
**Total Estimated Effort**: 42 story points (~6-7 developer days)
**Target Timeline**: 6-7 days (single developer) | 4-5 days (2 developers in parallel)

**Key Milestones**:

1. Database schema extended with budget fields (Day 1)
2. Backend API fully operational with budget CRUD (Days 2-3)
3. Frontend hooks and components wired to backend (Days 4-5)
4. Testing and deployment completed (Days 6-7)

**Success Criteria**: Users can set and track individual budgets for each person within each occasion, with real-time progress visualization and historical budget preservation.

---

## Phase Overview

The implementation spans 8 phases grouped into 4 detailed phase files:

| Phase | Focus | Duration | Effort | Status | Details |
|-------|-------|----------|--------|--------|---------|
| **1-2** | Database & Repository | 2.5 days | 12.5 pts | Ready | [Phase 1-2: Backend](./person-occasion-budgets-v1/phase-1-2-backend.md) |
| **3-4** | API & Frontend Hooks | 2.5 days | 22 pts | Ready | [Phase 3-4: API & Hooks](./person-occasion-budgets-v1/phase-3-4-api-hooks.md) |
| **5** | UI Components | 2 days | 25 pts | Ready | [Phase 5: UI Components](./person-occasion-budgets-v1/phase-5-ui.md) |
| **6-8** | Testing & Deployment | 2.5 days | 28.5 pts | Ready | [Phase 6-8: Testing & Deploy](./person-occasion-budgets-v1/phase-6-testing.md) |

---

## Phase Details

### Phase 1-2: Database Foundation & Repository Layer

See: [Phase 1-2: Backend Details](./person-occasion-budgets-v1/phase-1-2-backend.md)

**Summary**: Extend PersonOccasion table with budget columns, create migration, and implement repository CRUD methods with unit tests.

**Duration**: 2.5 days | **Effort**: 12.5 story points
**Dependencies**: None
**Subagents**: `data-layer-expert`, `python-backend-engineer`

**Deliverables**:

- Extended PersonOccasion model with budget fields
- Alembic migration (up/down)
- Repository methods: `get_person_occasion_budget()`, `update_person_occasion_budget()`
- >80% unit test coverage for repository layer

### Phase 3-4: Service & API Layer + Frontend Hooks

See: [Phase 3-4: API & Hooks Details](./person-occasion-budgets-v1/phase-3-4-api-hooks.md)

**Summary**: Create service layer DTOs and methods, implement GET/PUT REST endpoints, and build React Query hooks with TypeScript types.

**Duration**: 2.5 days | **Effort**: 22 story points
**Dependencies**: Phase 1-2 complete
**Subagents**: `python-backend-engineer`, `backend-architect`, `ui-engineer-enhanced`, `frontend-developer`

**Deliverables**:

- DTOs: `PersonOccasionBudgetResponse`, `PersonOccasionBudgetUpdate`
- API endpoints: `GET /persons/{id}/occasions/{oid}/budget`, `PUT /persons/{id}/occasions/{oid}/budget`
- React Query hooks: `usePersonOccasionBudget()`, `useUpdatePersonOccasionBudget()`
- TypeScript types matching backend DTOs
- Integration tests for all endpoints

### Phase 5: UI Components & Pages

See: [Phase 5: UI Components Details](./person-occasion-budgets-v1/phase-5-ui.md)

**Summary**: Build React components for budget editing and visualization, integrate with occasion and person detail pages.

**Duration**: 2 days | **Effort**: 25 story points
**Dependencies**: Phase 3-4 complete
**Subagents**: `ui-engineer-enhanced`, `frontend-developer`, `ui-designer`

**Deliverables**:

- `PersonOccasionBudgetCard` component with auto-save inputs
- `PersonBudgetsTab` component for person detail modal
- Extended `PersonBudgetBar` with occasion-scoped visualization
- Occasion detail page "People" section with budget cards
- Over-budget warnings and progress visualization
- Responsive design (375px, 768px, 1024px+)
- WCAG 2.1 AA accessibility compliance

### Phase 6-8: Testing, Documentation & Deployment

See: [Phase 6-8: Testing & Deployment Details](./person-occasion-budgets-v1/phase-6-testing.md)

**Summary**: Comprehensive testing (unit, integration, E2E, accessibility), documentation, and production deployment.

**Duration**: 2.5 days | **Effort**: 28.5 story points
**Dependencies**: Phase 5 complete
**Subagents**: `code-reviewer`, `frontend-developer`, `python-backend-engineer`, `ui-engineer-enhanced`, `documentation-writer`

**Deliverables**:

- Backend unit tests (>80% coverage)
- Frontend component tests
- E2E budget workflow tests
- Accessibility audit (WCAG 2.1 AA)
- Performance benchmarks (<200ms API, <1s page load)
- API and component documentation
- Production deployment to K8s
- Monitoring and telemetry verification

---

## Implementation Strategy

### Architecture Sequence

Following MeatyPrompts layered architecture:

1. **Database Layer** - PersonOccasion table extension, indexes, migration (Phase 1)
2. **Repository Layer** - Budget query methods, occasion-scoped calculations (Phase 2)
3. **Service Layer** - Budget DTOs, business logic, ORM→DTO transformation (Phase 3)
4. **API Layer** - GET/PUT budget endpoints, validation, error handling (Phase 3)
5. **UI Layer** - React Query hooks, PersonBudgetCard, modal tabs (Phase 4-5)
6. **Testing Layer** - Unit, integration, E2E tests for all layers (Phase 6)
7. **Documentation Layer** - API docs, component docs, migration notes (Phase 7)
8. **Deployment Layer** - Migration deployment, monitoring, validation (Phase 8)

### Parallel Work Opportunities

**Backend Track (Phases 1-3)**:

- Sequential dependency: Phase 1 → Phase 2 → Phase 3
- Can proceed fully independently of frontend
- **Owner**: Backend specialist (3 days)

**Frontend Track (Phases 4-5)**:

- Phase 4 starts once API endpoints are testable (mock data OK)
- Phase 5 can overlap with Phase 4 completion
- **Owner**: Frontend specialist (3 days)

**Testing & Deployment (Phase 6-8)**:

- Unit tests written alongside each phase
- Integration tests after Phase 3
- E2E tests after Phase 5
- Deployment after Phase 6

**Optimal Parallelization** (2-developer team, 4-5 days):

- **Developer A**: Phases 1-3 (backend) + backend tests (3 days)
- **Developer B**: Phases 4-5 (frontend) in parallel (3 days)
- **Both**: E2E testing, documentation, deployment (1 day)

### Critical Path

```text
DB Migration (Phase 1) → Repository (Phase 2) → API (Phase 3) →
Frontend Hooks (Phase 4) → UI (Phase 5) → Testing (Phase 6) → Deployment (Phase 8)
```

**Critical Path Duration**: 5 days minimum (sequential dependencies)

---

## Resource Requirements

### Team Composition

#### Option 1: Single Developer (6-7 days)

- Full-stack developer: Backend (3 days) → Frontend (2.5 days) → Testing (1.5 days)

#### Option 2: Two Developers in Parallel (4-5 days)

- **Developer A** (Backend): Phases 1-3 (3 days) + Backend tests (1 day)
- **Developer B** (Frontend): Phases 4-5 (3 days) + Frontend tests (1 day)
- **Both**: E2E testing and deployment (1 day)

### Skill Requirements

#### Backend

- Python 3.12+, FastAPI, SQLAlchemy 2.x, Alembic
- PostgreSQL (NUMERIC types, indexes, migrations)
- Pydantic (DTO validation)
- OpenTelemetry (observability)

#### Frontend

- TypeScript, React 19+, Next.js 15+
- React Query (caching, mutations, optimistic updates)
- Tailwind CSS (responsive design)
- Playwright (E2E testing)
- WCAG 2.1 AA (accessibility)

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|-----------|
| Migration breaks existing PersonOccasion queries | High | Low | Test on staging first; write rollback script |
| Budget progress calculation performance degrades | Medium | Medium | Add composite index; test with 100+ gifts |
| NULL budget semantics confuse users | Medium | Medium | Add tooltip: "Leave empty for no limit" |
| React Query cache invalidation fails | Medium | Low | Test thoroughly; add manual refetch option |
| Auto-save conflicts with multiple users | Low | Very Low | Single-tenant app; last-write-wins acceptable |

### Schedule Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|-----------|
| Testing phase uncovers major bugs | High | Medium | Allocate 1 day buffer; prioritize P0/P1 |
| Frontend design iterations delay UI | Medium | Low | Finalize designs during Phase 1-3 |
| Migration requires downtime | Medium | Low | Plan deployment during low-traffic window |
| E2E tests flaky in CI/CD | Low | Medium | Use Playwright auto-wait; retry logic |

### Data Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|-----------|
| PersonOccasion data lost in migration | High | Very Low | Migration only adds columns; backup DB first |
| Budget values exceed precision | Low | Very Low | NUMERIC(10,2) supports up to $99,999,999.99 |
| Historical budgets deleted | Medium | Low | Intentional CASCADE delete; document behavior |

---

## Success Metrics

### Delivery Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| On-time delivery | ±10% of estimate | 6-7 days ±1 day |
| Code coverage | >80% | pytest --cov, vitest --coverage |
| Performance | API <200ms, page <1s | Lighthouse, Apache Bench |
| Zero P0/P1 bugs | First 7 days post-launch | Bug tracker |

### Business Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Budget adoption rate | 0% | 80%+ person-occasion pairs | DB query: COUNT(budget IS NOT NULL) / COUNT(*) |
| Budget accuracy | N/A | ±10% of actual spend | Compare final spend to initial budget |
| User satisfaction | N/A | >4/5 rating | Post-feature survey (2-3 users) |
| Error rate | N/A | <1% of operations | API logs (4xx/5xx errors) |

### Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| API documentation coverage | 100% | OpenAPI spec completeness |
| WCAG 2.1 AA compliance | 100% | axe-core, Lighthouse |
| Security review | Passed | No SQL injection, no negative budgets |
| Query performance | <50ms | EXPLAIN ANALYZE on budget queries |

---

## Communication Plan

### Daily Standups (5 minutes)

- **When**: Daily at 9:00 AM
- **Format**: Yesterday | Today | Blockers

### Weekly Status Reports

- **When**: Friday EOD
- **To**: Project stakeholders
- **Content**: Milestones completed | Risks | Budget/schedule variance

### Phase Reviews

- **When**: End of each major phase
- **Attendees**: Developers + code reviewer
- **Format**: Demo | Quality gates review | Sign-off

### Stakeholder Updates

- **When**: Bi-weekly (Mondays)
- **Format**: Progress summary | Demo | Feedback collection

---

## File Reference

### Backend Files (Created/Modified)

| File | Change | Description |
|------|--------|-------------|
| `/services/api/app/models/person.py` | MODIFY | Add budget fields to PersonOccasion |
| `/services/api/alembic/versions/xxx_add_person_occasion_budgets.py` | CREATE | Migration script |
| `/services/api/app/repositories/person.py` | MODIFY | Add budget CRUD methods |
| `/services/api/app/schemas/person.py` | MODIFY | Add budget DTOs |
| `/services/api/app/services/person.py` | MODIFY | Add budget service methods |
| `/services/api/app/api/persons.py` | MODIFY | Add GET/PUT budget endpoints |
| `/services/api/tests/unit/repositories/test_person_repository.py` | MODIFY | Add budget repository tests |
| `/services/api/tests/integration/test_budget_api.py` | CREATE | Integration tests |

### Frontend Files (Created/Modified)

| File | Change | Description |
|------|--------|-------------|
| `/apps/web/types/budget.ts` | CREATE | Budget TypeScript types |
| `/apps/web/lib/api.ts` | MODIFY | API client methods |
| `/apps/web/hooks/usePersonOccasionBudget.ts` | CREATE | React Query hooks |
| `/apps/web/components/occasions/PersonOccasionBudgetCard.tsx` | CREATE | Budget card component |
| `/apps/web/components/people/PersonBudgetsTab.tsx` | CREATE | Person budgets tab |
| `/apps/web/components/people/PersonBudgetBar.tsx` | MODIFY | Extend for occasion-scoped budgets |
| `/apps/web/app/occasions/[id]/page.tsx` | MODIFY | Add People section |
| `/apps/web/__tests__/e2e/budget-workflows.spec.ts` | CREATE | E2E tests |

---

## Progress Tracking

See detailed phase tracking:

- [Phase 1-2: Backend](./person-occasion-budgets-v1/phase-1-2-backend.md)
- [Phase 3-4: API & Hooks](./person-occasion-budgets-v1/phase-3-4-api-hooks.md)
- [Phase 5: UI](./person-occasion-budgets-v1/phase-5-ui.md)
- [Phase 6-8: Testing & Deploy](./person-occasion-budgets-v1/phase-6-testing.md)

---

## Next Steps

1. **Start Phase 1-2** with backend specialist (database + repository)
2. **Prepare Phase 4-5** frontend design during Phase 1-3
3. **Begin Phase 3** API implementation once Phase 2 repository complete
4. **Launch Phase 4** frontend hooks development (parallel with Phase 3)
5. **Execute Phase 5** UI development once Phase 4 hooks complete
6. **Run Phase 6-8** testing, documentation, and deployment

---

**Implementation Plan Version**: 2.0 (Optimized with Phase Splits)
**Last Updated**: 2025-12-07
