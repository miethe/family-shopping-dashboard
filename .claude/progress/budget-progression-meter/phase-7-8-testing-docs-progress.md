---
type: progress
prd: budget-progression-meter-v1
phase_group: 7-8
phase_title: Testing, Integration & Documentation - Comprehensive QA and Docs
status: pending
progress: 0
total_tasks: 8
completed_tasks: 0
total_story_points: 3
story_points_complete: 0

tasks:
  - id: BUDGET-TEST-001
    name: Backend unit tests
    status: pending
    assigned_to: [python-backend-engineer]
    story_points: 0.5
    dependencies: [BUDGET-REPO-001, BUDGET-REPO-002, BUDGET-REPO-003, BUDGET-SERVICE-001, BUDGET-SERVICE-002, BUDGET-SERVICE-003]
    phase: 7
    description: Unit tests for repository, service, and DTO layers with >80% coverage

  - id: BUDGET-TEST-002
    name: Frontend component tests
    status: pending
    assigned_to: [ui-engineer]
    story_points: 0.5
    dependencies: [BUDGET-UI-001, BUDGET-UI-002, BUDGET-UI-003]
    phase: 7
    description: Jest component unit tests with >70% coverage and snapshot tests

  - id: BUDGET-TEST-003
    name: End-to-end tests
    status: pending
    assigned_to: [ui-engineer]
    story_points: 0.5
    dependencies: [BUDGET-INTEG-001, BUDGET-INTEG-002, BUDGET-INTEG-003, BUDGET-INTEG-004, BUDGET-INTEG-005]
    phase: 7
    description: Playwright E2E tests for 3+ critical workflows (create, update, delete, calculate)

  - id: BUDGET-TEST-004
    name: Mobile & accessibility testing
    status: pending
    assigned_to: [ui-engineer]
    story_points: 0.5
    dependencies: [BUDGET-INTEG-001, BUDGET-INTEG-002, BUDGET-INTEG-003, BUDGET-INTEG-004, BUDGET-INTEG-005]
    phase: 7
    description: Manual iOS Safari + Android Chrome testing; axe-core accessibility audit (WCAG AA)

  - id: BUDGET-DOCS-001
    name: API documentation
    status: pending
    assigned_to: [documentation-writer]
    story_points: 0.25
    dependencies: [BUDGET-API-001, BUDGET-API-002, BUDGET-API-003]
    phase: 8
    description: OpenAPI specs, endpoint examples, error codes; publish to /docs/api/budgets.md

  - id: BUDGET-DOCS-002
    name: Component documentation
    status: pending
    assigned_to: [documentation-writer]
    story_points: 0.25
    dependencies: [BUDGET-UI-001, BUDGET-UI-002, BUDGET-UI-003]
    phase: 8
    description: Storybook stories, prop tables, usage patterns; publish to /docs/components/BudgetMeter.md

  - id: BUDGET-DOCS-003
    name: User guide
    status: pending
    assigned_to: [documentation-writer]
    story_points: 0.25
    dependencies: [BUDGET-INTEG-001, BUDGET-INTEG-002, BUDGET-INTEG-003, BUDGET-INTEG-004, BUDGET-INTEG-005]
    phase: 8
    description: End-user guide with screenshots, workflows, troubleshooting; publish to /docs/guides/budget-tracking.md

  - id: BUDGET-DOCS-004
    name: ADR & architecture guide
    status: pending
    assigned_to: [documentation-writer]
    story_points: 0.25
    dependencies: [BUDGET-SERVICE-001, BUDGET-SERVICE-002]
    phase: 8
    description: ADR for budget calculation strategy, schema design, real-time sync patterns

parallelization:
  phase_7_backend_testing: [BUDGET-TEST-001]
  phase_7_frontend_testing: [BUDGET-TEST-002, BUDGET-TEST-003, BUDGET-TEST-004]
  phase_8_all_docs: [BUDGET-DOCS-001, BUDGET-DOCS-002, BUDGET-DOCS-003, BUDGET-DOCS-004]

critical_path:
  - Phase 7: (BUDGET-TEST-001) parallel (BUDGET-TEST-002 | BUDGET-TEST-003 | BUDGET-TEST-004)
  - Phase 8: (BUDGET-DOCS-001 | BUDGET-DOCS-002 | BUDGET-DOCS-003 | BUDGET-DOCS-004)

notes: |
  Phase 7 depends on ALL previous phases (1-6).
  Phase 8 depends on Phase 7 completion and specific earlier phases for reference.
  High parallelization in both phases: backend and frontend tests run in parallel; all docs tasks are independent.
  Backend testing (BUDGET-TEST-001) can proceed as soon as Phase 6 integration is complete.
  Frontend testing (BUDGET-TEST-002/003/004) can proceed in parallel; E2E depends on Phase 6 integration.
  Documentation tasks (Phase 8) can all run in parallel after Phase 7 testing is complete.
  Quality gates: Backend >80% coverage, frontend >70% coverage, E2E 3+ workflows, mobile/a11y tested.
---

# Phase 7-8: Testing, Integration & Documentation

## Overview

**Effort**: 3 story points across 2 phases
**Status**: Pending (awaiting Phase 6 integration completion)
**Completion**: 0/8 tasks
**Critical Path**: Phase 7 testing → Phase 8 documentation

This phase focuses on comprehensive quality assurance and complete documentation of the Budget Progression Meter feature. Phase 7 delivers testing coverage (unit, E2E, mobile, accessibility); Phase 8 delivers user-facing and developer documentation.

---

## Phase 7: Testing & Quality Assurance (2 pts)

### Parallel Execution Streams

#### Backend Testing (BUDGET-TEST-001)
**Assigned**: python-backend-engineer
**Story Points**: 0.5
**Status**: Pending

**Scope**:
- Unit tests for `BudgetRepository` (CRUD operations, period calculations, tracking)
- Unit tests for `BudgetService` (progress calculation, validation, DTOs)
- Unit tests for `BudgetProgressDTO`, `BudgetMetricsDTO` schemas
- Test fixtures for sample budgets, items, progress states
- Mock WebSocket events for real-time sync testing

**Acceptance Criteria**:
- Backend unit test coverage >80%
- All repository methods tested (create, read, update, delete, calculate)
- Service business logic tested with edge cases (zero budget, overspending, no items)
- DTO serialization/validation tested
- Test file: `services/api/tests/test_budgets.py`

**Command**:
```bash
Task("python-backend-engineer", """
  BUDGET-TEST-001: Write backend unit tests (0.5 pts)

  Deliverables:
  - services/api/tests/unit/test_budget_repository.py (>50 lines, >80% coverage)
  - services/api/tests/unit/test_budget_service.py (>50 lines)
  - services/api/tests/unit/test_budget_schemas.py (>20 lines)

  Acceptance:
  - pytest --cov=app.repositories.budget --cov=app.services.budget
  - Coverage >80%
  - All tests passing

  Dependencies complete: BUDGET-REPO-001, BUDGET-REPO-002, BUDGET-REPO-003, BUDGET-SERVICE-001, BUDGET-SERVICE-002, BUDGET-SERVICE-003
""")
```

---

#### Frontend Component Testing (BUDGET-TEST-002)
**Assigned**: ui-engineer
**Story Points**: 0.5
**Status**: Pending

**Scope**:
- Jest unit tests for `<BudgetProgressMeter />` component
- Jest unit tests for `<BudgetMetrics />` component
- Jest unit tests for `useBudgetProgress` hook
- Snapshot tests for static states (0%, 50%, 100%, >100%)
- Props validation and edge case rendering

**Acceptance Criteria**:
- Frontend component test coverage >70%
- All component props tested (width, height, customization options)
- Hook data flow tested (loading, success, error states)
- Snapshots captured for regressions
- Test file: `apps/web/src/__tests__/BudgetMeter.test.tsx`

**Command**:
```bash
Task("ui-engineer", """
  BUDGET-TEST-002: Write frontend component tests (0.5 pts)

  Deliverables:
  - apps/web/src/__tests__/components/BudgetProgressMeter.test.tsx (>50 lines)
  - apps/web/src/__tests__/hooks/useBudgetProgress.test.ts (>40 lines)
  - Snapshot tests for 4 states: 0%, 50%, 100%, >100%

  Acceptance:
  - jest --coverage
  - Coverage >70%
  - All tests passing
  - Snapshots committed

  Dependencies complete: BUDGET-UI-001, BUDGET-UI-002, BUDGET-UI-003
""")
```

---

#### End-to-End Testing (BUDGET-TEST-003)
**Assigned**: ui-engineer
**Story Points**: 0.5
**Status**: Pending

**Scope**:
- Playwright E2E tests for critical user workflows
- Workflow 1: Create budget → View in list → See meter
- Workflow 2: Add item → Update progress → See meter update in real-time (WebSocket)
- Workflow 3: Edit budget amount → See meter recalculate
- Workflow 4: Delete budget → Verify removed from list
- Tests run against staging environment

**Acceptance Criteria**:
- 3+ complete workflows tested end-to-end
- Real-time updates verified (WebSocket event → meter update <1s)
- Page navigation tested (list → detail → meter)
- Error scenarios tested (network failure, invalid input)
- Test file: `apps/web/e2e/budget-meter.spec.ts`

**Command**:
```bash
Task("ui-engineer", """
  BUDGET-TEST-003: Write end-to-end tests (0.5 pts)

  Deliverables:
  - apps/web/e2e/budget-meter.spec.ts (>100 lines, 3+ workflows)

  Workflows:
  1. Create → View → Meter visible
  2. Add item → Meter updates real-time (WebSocket)
  3. Edit budget → Meter recalculates
  4. Delete budget → Removed from list

  Acceptance:
  - All workflows passing
  - Real-time updates <1s latency
  - Error cases handled

  Dependencies complete: All Phase 6 integration tasks
""")
```

---

#### Mobile & Accessibility Testing (BUDGET-TEST-004)
**Assigned**: ui-engineer
**Story Points**: 0.5
**Status**: Pending

**Scope**:
- Playwright mobile emulation tests (iPhone 14 Pro, Pixel 6)
- Verify safe area insets applied (env(safe-area-inset-*))
- Touch target sizing (44x44px minimum)
- Responsive layout on small screens
- Accessibility audit with axe-core
- Screen reader testing (VoiceOver macOS, TalkBack Android)
- WCAG AA compliance verification

**Acceptance Criteria**:
- Passes on iOS Safari (iPhone 14 Pro) and Android Chrome (Pixel 6)
- No axe violations (level A+AA)
- Touch targets >44x44px
- Safe area insets properly applied
- Screen reader announces meter value, progress, percentage
- Test file: `apps/web/e2e/budget-meter-mobile.spec.ts`

**Command**:
```bash
Task("ui-engineer", """
  BUDGET-TEST-004: Mobile & accessibility testing (0.5 pts)

  Deliverables:
  - apps/web/e2e/budget-meter-mobile.spec.ts (Playwright mobile tests)
  - Accessibility audit report (axe-core results)
  - Manual screen reader testing notes

  Mobile Testing:
  - iPhone 14 Pro (375x667) — safe area insets, 44px touch targets
  - Pixel 6 (412x915) — responsive layout, touch targets

  Accessibility:
  - axe-core scan: 0 violations
  - WCAG AA compliant
  - Screen reader: meter value announced

  Acceptance:
  - All platforms passing
  - No accessibility violations
  - Mobile layout verified
""")
```

---

## Phase 8: Documentation (1 pt)

All documentation tasks are independent and can run in parallel after Phase 7 testing is complete.

### API Documentation (BUDGET-DOCS-001)
**Assigned**: documentation-writer
**Story Points**: 0.25
**Status**: Pending

**Deliverable**: `/docs/api/budgets.md`

**Scope**:
- OpenAPI specification for all budget endpoints
- Endpoint summaries with request/response examples
- Error codes and status codes
- Rate limits (if applicable)
- Authentication requirements
- WebSocket event schema for real-time updates

**Outline**:
```markdown
# Budget API Reference

## Endpoints
- GET /api/v1/families/:familyId/budgets — List all budgets
- POST /api/v1/families/:familyId/budgets — Create budget
- GET /api/v1/families/:familyId/budgets/:budgetId — Get budget details
- PATCH /api/v1/families/:familyId/budgets/:budgetId — Update budget
- DELETE /api/v1/families/:familyId/budgets/:budgetId — Delete budget

## WebSocket Events
- budgets:CREATED, :UPDATED, :DELETED, :PROGRESS_CHANGED

## Error Codes
- 400 Bad Request
- 404 Not Found
- 422 Validation Error
```

**Command**:
```bash
Task("documentation-writer", """
  BUDGET-DOCS-001: API documentation (0.25 pts)

  Deliverable: /docs/api/budgets.md

  Sections:
  - 5 REST endpoints (list, create, get, update, delete)
  - Request/response examples (JSON)
  - Error codes and troubleshooting
  - WebSocket event schema
  - Rate limits and authentication

  Quality:
  - All endpoints documented
  - Every field explained
  - Examples for success + error cases
""")
```

---

### Component Documentation (BUDGET-DOCS-002)
**Assigned**: documentation-writer
**Story Points**: 0.25
**Status**: Pending

**Deliverable**: `/docs/components/BudgetMeter.md`

**Scope**:
- Component API reference (`<BudgetProgressMeter />`, `<BudgetMetrics />`)
- Prop tables with types and defaults
- Usage examples and patterns
- Storybook stories (reference)
- Styling and customization options
- Integration with `useBudgetProgress` hook

**Outline**:
```markdown
# Budget Meter Components

## BudgetProgressMeter
Props: width, height, value, threshold, label, animated
Example: <BudgetProgressMeter value={75} width="100%" />

## BudgetMetrics
Props: budget, items, displayFormat
Example: <BudgetMetrics budget={budget} items={items} />

## useBudgetProgress Hook
Returns: { data, isLoading, error }
Example: const { data, isLoading } = useBudgetProgress(budgetId)
```

**Command**:
```bash
Task("documentation-writer", """
  BUDGET-DOCS-002: Component documentation (0.25 pts)

  Deliverable: /docs/components/BudgetMeter.md

  Components:
  - BudgetProgressMeter: Props, examples, styling
  - BudgetMetrics: Props, examples, data flow
  - useBudgetProgress hook: API, loading/error states

  Quality:
  - Every prop documented
  - TypeScript types shown
  - Usage examples provided
  - Link to Storybook stories
""")
```

---

### User Guide (BUDGET-DOCS-003)
**Assigned**: documentation-writer
**Story Points**: 0.25
**Status**: Pending

**Deliverable**: `/docs/guides/budget-tracking.md`

**Scope**:
- How to create a budget (step-by-step)
- How to add items to a budget
- Understanding the progress meter (color zones, percentage)
- Real-time updates explanation
- Troubleshooting common issues
- Screenshots of each workflow

**Outline**:
```markdown
# Budget Tracking Guide

## Creating a Budget
1. Go to [Lists] → [Create Budget]
2. Enter name, amount, period
3. Click [Save]

## Adding Items
1. Click on budget in list
2. [Add Item] button
3. Enter name, amount
4. Progress meter updates automatically

## Understanding the Meter
- Green: <80% of budget
- Yellow: 80-100% of budget
- Red: >100% of budget

## Real-Time Updates
Meter updates instantly when team members add items (WebSocket).
```

**Command**:
```bash
Task("documentation-writer", """
  BUDGET-DOCS-003: User guide (0.25 pts)

  Deliverable: /docs/guides/budget-tracking.md

  Sections:
  - Creating a budget (with screenshots)
  - Adding items to a budget
  - Understanding the progress meter (color zones)
  - Real-time updates explanation
  - Troubleshooting (no updates, calculation wrong)
  - FAQ

  Quality:
  - Beginner-friendly language
  - Screenshots for each step
  - Clear visuals of color zones
""")
```

---

### Architecture Documentation (BUDGET-DOCS-004)
**Assigned**: documentation-writer
**Story Points**: 0.25
**Status**: Pending

**Deliverable**: `/docs/architecture/adr-budget-calculation-strategy.md`

**Scope**:
- ADR: Budget calculation strategy (including real-time sync design)
- Schema decisions (list items vs. budget items)
- Repository pattern for budget queries
- Service layer business logic (progress calculation)
- Real-time sync flow (WebSocket → React Query invalidation)
- Performance considerations

**Outline**:
```markdown
# ADR: Budget Calculation Strategy

## Problem
How to calculate budget progress accurately and sync in real-time?

## Decision
- Progress = SUM(item amounts) / budget amount
- Real-time: WebSocket broadcasts list-item changes → invalidate React Query cache
- Calculation in service layer, not on frontend

## Rationale
- Single source of truth in database
- No desync between clients
- Service layer owns business logic

## Implementation
- Repository: fetch budget + sum items
- Service: calculate percentage, thresholds
- Router: WebSocket broadcasts on item change
- Frontend: invalidate cache on event
```

**Command**:
```bash
Task("documentation-writer", """
  BUDGET-DOCS-004: ADR & architecture guide (0.25 pts)

  Deliverable: /docs/architecture/adr-budget-calculation-strategy.md

  Sections:
  - Problem statement (accuracy + real-time)
  - Decision (server-side calculation, WebSocket sync)
  - Rationale (single source of truth)
  - Implementation details (schema, service, WebSocket)
  - Performance analysis (query complexity)
  - Future considerations (caching, optimization)

  Quality:
  - Technical depth
  - Diagrams/flow charts for clarity
  - Code examples
  - Trade-offs discussed
""")
```

---

## Testing Coverage Matrix

| Area | Target | Method | Assigned To | Task ID |
|------|--------|--------|-------------|---------|
| Backend Unit | >80% | pytest --cov | python-backend-engineer | BUDGET-TEST-001 |
| Frontend Unit | >70% | jest --coverage | ui-engineer | BUDGET-TEST-002 |
| E2E Workflows | 3+ scenarios | Playwright | ui-engineer | BUDGET-TEST-003 |
| Mobile Platforms | iOS + Android | Playwright emulation | ui-engineer | BUDGET-TEST-004 |
| Accessibility | WCAG AA | axe-core + screen reader | ui-engineer | BUDGET-TEST-004 |

---

## Documentation Checklist

**Phase 8 Deliverables**:

- [ ] `/docs/api/budgets.md` — 5 endpoints, examples, error codes
- [ ] `/docs/components/BudgetMeter.md` — Components, props, Storybook link
- [ ] `/docs/guides/budget-tracking.md` — User workflows, screenshots, troubleshooting
- [ ] `/docs/architecture/adr-budget-calculation-strategy.md` — Design decisions, rationale, implementation

---

## Status Log

| Date | Event | Status |
|------|-------|--------|
| 2025-12-04 | Phase 7-8 progress artifact created | Pending |
| — | Phase 7 testing initiated | Pending |
| — | Phase 8 documentation initiated | Pending |
| — | All tasks complete | Pending |

---

## Pre-Release Verification Checklist

**Quality Gates**:
- [ ] Backend unit test coverage >80% (pytest --cov)
- [ ] Frontend unit test coverage >70% (jest --coverage)
- [ ] All E2E workflows passing (Playwright)
- [ ] Mobile testing complete (iOS Safari, Android Chrome)
- [ ] Accessibility audit passed (axe-core, WCAG AA)
- [ ] Zero critical bugs from testing phase

**Documentation Gates**:
- [ ] All API endpoints documented with examples
- [ ] All components documented with props and usage
- [ ] User guide complete with screenshots
- [ ] Architecture ADR reviewed and approved
- [ ] No broken links in docs
- [ ] Docs build without errors (`npm run docs:build`)

**Deployment Readiness**:
- [ ] Feature flag configured (`BUDGET_PROGRESSION_METER_ENABLED`)
- [ ] Staging environment verified
- [ ] Performance benchmarks met (<50ms calculations, <100ms renders)
- [ ] Error monitoring configured
- [ ] Rollback plan documented

---

## Post-Release Monitoring

**Metrics to Track**:
- API error rates (target: <0.1%)
- WebSocket disconnection rate (target: <1%)
- Meter query latency (target: <50ms p95)
- Frontend render performance (target: <100ms p95)
- User adoption rate (days to first use)
- Feature usage frequency (budgets created per user per week)

**Feedback Collection**:
- In-app feedback widget enabled
- Monitor Sentry for exceptions
- Weekly check-in with users
- Accessibility feedback (screen reader users)

---

## Notes for Agents

**Backend Engineer (BUDGET-TEST-001)**:
- Dependencies: All Phase 6 integration (repos, services) must be complete
- Coverage tools: Use `pytest --cov=app.repositories.budget --cov=app.services.budget`
- Edge cases: Zero budget, overspending, no items, parallel updates
- Reference: `services/api/CLAUDE.md` for testing patterns

**Frontend Engineer (BUDGET-TEST-002/003/004)**:
- Dependencies: All Phase 6 integration (components, hooks) must be complete
- Testing tools: Jest for unit, Playwright for E2E and mobile
- Mobile emulation: iPhone 14 Pro (375x667), Pixel 6 (412x915)
- Accessibility: axe-core npm package, manual screen reader testing
- Reference: `apps/web/CLAUDE.md` for testing patterns, mobile constraints

**Documentation Writer**:
- Use Markdown with YAML frontmatter per doc-policy-spec.md
- API docs: Reference OpenAPI schema from router
- Component docs: Extract from TypeScript prop types
- User guide: Beginner-friendly, include screenshots
- ADR: Technical but approachable, justify decisions
- All docs go in `/docs/` directory, not `.claude/`

---

**Version**: 1.0
**Created**: 2025-12-04
**Last Updated**: 2025-12-04
**Phase Group**: 7-8
**Total Effort**: 3 story points
**Status**: Ready for execution (awaiting Phase 6 completion)
