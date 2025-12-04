---
# Phase 4-6: API & Frontend Progress
type: progress
prd: budget-progression-meter-v1
phase_group: 4-6
phase_title: "API & Frontend Components - Endpoints, Components, Integration"
status: pending
started: "2025-12-04"
completed: null

# Overall Progress
overall_progress: 0
completion_estimate: "pending"

# Task Counts
total_tasks: 11
completed_tasks: 0
in_progress_tasks: 0
blocked_tasks: 0
at_risk_tasks: 0

# Story Points
total_story_points: 8
story_points_complete: 0

# Ownership
owners: ["python-backend-engineer", "ui-engineer-enhanced", "frontend-developer"]
contributors: []

# === PHASE 4: API LAYER (Sequential) ===
phase_4:
  title: "API Layer - Budget Endpoints"
  status: pending
  total_tasks: 3
  completed_tasks: 0
  total_story_points: 3
  story_points_complete: 0
  description: "Implement FastAPI endpoints for budget meter calculation and updates"

  tasks:
    - id: BUDGET-API-001
      description: "Implement GET /api/budgets/meter/{occasion_id} endpoint"
      details: |
        Returns budget meter breakdown:
        - remaining: float
        - spent: float
        - total: float
        - percent_used: int (0-100)
        - status: 'healthy' | 'warning' | 'exceeded'
        - gift_count: int
        - gift_list: [{ id, name, price, assigned_to }]
      status: pending
      assigned_to: ["python-backend-engineer"]
      story_points: 1
      priority: critical
      dependencies: ["BUDGET-SERVICE-001", "BUDGET-SERVICE-002", "BUDGET-SERVICE-003"]
      phase: 4

    - id: BUDGET-API-002
      description: "Implement PATCH /api/occasions/{id}/budget endpoint"
      details: |
        Update occasion budget:
        - Request: { budget: float }
        - Response: { id, budget, previous_budget, updated_at }
        - Validation: budget > 0, check for existing gifts
      status: pending
      assigned_to: ["python-backend-engineer"]
      story_points: 1
      priority: high
      dependencies: ["BUDGET-SERVICE-001", "BUDGET-SERVICE-002", "BUDGET-SERVICE-003"]
      phase: 4

    - id: BUDGET-API-003
      description: "Implement sub-budget endpoints"
      details: |
        POST /api/budgets/sub-budget: Create sub-budget
        GET /api/budgets/sub-budget/{id}: Retrieve sub-budget
        - Request: { occasion_id, category, limit }
        - Response: { id, occasion_id, category, limit, spent, status }
      status: pending
      assigned_to: ["python-backend-engineer"]
      story_points: 1
      priority: medium
      dependencies: ["BUDGET-SERVICE-001", "BUDGET-SERVICE-002", "BUDGET-SERVICE-003"]
      phase: 4

# === PHASE 5: FRONTEND COMPONENTS (Parallel) ===
phase_5:
  title: "Frontend Components - UI Building Blocks"
  status: pending
  total_tasks: 3
  completed_tasks: 0
  total_story_points: 3
  story_points_complete: 0
  description: "Create reusable React components for budget meter display"

  tasks:
    - id: BUDGET-UI-001
      description: "Create BudgetMeterComponent (main 3-segment bar)"
      details: |
        Component features:
        - 3-segment progress bar (allocated, spent, remaining)
        - Color coding: green (healthy), amber (warning), red (exceeded)
        - Responsive: 100% width on mobile, 300px on desktop
        - Shows percentage label
        - Accessible: ARIA labels, keyboard navigation
        - Storybook story with variants
      status: pending
      assigned_to: ["ui-engineer-enhanced"]
      story_points: 1.5
      priority: critical
      dependencies: ["BUDGET-API-001"]
      phase: 5

    - id: BUDGET-UI-002
      description: "Create BudgetTooltip component"
      details: |
        Tooltip shows on meter hover:
        - Total budget amount
        - Amount spent
        - Amount remaining
        - List of gifts with prices
        - Triggers on hover, dismissible
        - Mobile: tap to show, tap elsewhere to hide
      status: pending
      assigned_to: ["ui-engineer-enhanced"]
      story_points: 1
      priority: high
      dependencies: ["BUDGET-API-001"]
      phase: 5

    - id: BUDGET-UI-003
      description: "Create BudgetWarningCard component"
      details: |
        Alert card for budget overspend:
        - Appears when spent >= total
        - Shows amount over budget
        - Optional action button (e.g., "Adjust Budget", "Remove Item")
        - Dismissible
        - Accessible: alert role, color + icon not alone
      status: pending
      assigned_to: ["ui-engineer-enhanced"]
      story_points: 0.5
      priority: high
      dependencies: ["BUDGET-API-001"]
      phase: 5

# === PHASE 6: FRONTEND INTEGRATION (Sequential Hook + Parallel Integration) ===
phase_6:
  title: "Frontend Integration - Hook & View Integration"
  status: pending
  total_tasks: 5
  completed_tasks: 0
  total_story_points: 2.75
  story_points_complete: 0
  description: "Integrate budget components into React Query workflow and views"

  tasks:
    - id: BUDGET-INTEG-001
      description: "Implement useBudgetMeter React Query hook"
      details: |
        Hook features:
        - useQuery with staleTime: 5min
        - refetchOnWindowFocus: true
        - Handles loading, error, data states
        - WebSocket integration: listen for gift changes, invalidate on update
        - Returns: { data, isLoading, error, refetch }
        - Memoized to prevent unnecessary renders
      status: pending
      assigned_to: ["frontend-developer"]
      story_points: 1
      priority: critical
      dependencies: ["BUDGET-UI-001", "BUDGET-UI-002", "BUDGET-UI-003"]
      phase: 6

    - id: BUDGET-INTEG-002
      description: "Integrate meter in OccasionDetail view"
      details: |
        - Display BudgetMeterComponent
        - Show BudgetTooltip on hover
        - Display BudgetWarningCard if exceeded
        - Allow inline budget edit (PATCH endpoint)
        - Update on gift additions/removals
      status: pending
      assigned_to: ["frontend-developer"]
      story_points: 0.5
      priority: high
      dependencies: ["BUDGET-INTEG-001"]
      phase: 6

    - id: BUDGET-INTEG-003
      description: "Integrate meter in Dashboard (upcoming occasions)"
      details: |
        - Show compact meter for each upcoming occasion card
        - Hover tooltip
        - Click to navigate to occasion detail
        - Mobile: stack horizontally, no tooltip (show status badge)
      status: pending
      assigned_to: ["frontend-developer"]
      story_points: 0.25
      priority: medium
      dependencies: ["BUDGET-INTEG-001"]
      phase: 6

    - id: BUDGET-INTEG-004
      description: "Integrate budget context in gift form (sidebar)"
      details: |
        - Show budget remaining in AddGiftModal
        - Display warning if gift would exceed budget
        - Show category budget if applicable
        - Update remaining live as user enters price
      status: pending
      assigned_to: ["frontend-developer"]
      story_points: 0.5
      priority: medium
      dependencies: ["BUDGET-INTEG-001"]
      phase: 6

    - id: BUDGET-INTEG-005
      description: "Add totals to List/Kanban views"
      details: |
        - Show total spent for occasion at top of list
        - Show category totals in grouped view
        - Visual indicator if over budget
        - Update in real-time via WebSocket
      status: pending
      assigned_to: ["frontend-developer"]
      story_points: 0.5
      priority: low
      dependencies: ["BUDGET-INTEG-001"]
      phase: 6

# Parallelization Strategy
parallelization:
  phase_4:
    title: "Phase 4 - Sequential API Layer"
    description: "All 3 API tasks run sequentially (same engineer, clear dependencies)"
    batches:
      - batch_1: ["BUDGET-API-001"]
        description: "Start meter endpoint (foundation for others)"
      - batch_2: ["BUDGET-API-002"]
        description: "Add budget update endpoint"
      - batch_3: ["BUDGET-API-003"]
        description: "Add sub-budget endpoints"
    estimated_time: "3-4 days"
    critical_path: ["BUDGET-API-001", "BUDGET-API-002", "BUDGET-API-003"]

  phase_5:
    title: "Phase 5 - Parallel UI Components"
    description: "All 3 UI components can be developed in parallel (independent components)"
    batches:
      - batch_1: ["BUDGET-UI-001", "BUDGET-UI-002", "BUDGET-UI-003"]
        description: "All UI components in parallel"
    estimated_time: "2-3 days (parallel)"
    critical_path: ["BUDGET-UI-001"]
    notes: |
      - All components independent
      - BUDGET-UI-001 is heaviest (1.5 pts)
      - Can assign BUDGET-UI-002 and BUDGET-UI-003 to other engineers if available

  phase_6:
    title: "Phase 6 - Parallel Integration (after hook)"
    description: "useBudgetMeter hook first, then 4 integrations in parallel"
    batches:
      - batch_1: ["BUDGET-INTEG-001"]
        description: "Implement useBudgetMeter hook (prerequisite)"
      - batch_2: ["BUDGET-INTEG-002", "BUDGET-INTEG-003", "BUDGET-INTEG-004", "BUDGET-INTEG-005"]
        description: "All integrations in parallel (depend only on hook)"
    estimated_time: "2-3 days (1 day hook + 1-2 days integrations)"
    critical_path: ["BUDGET-INTEG-001", "BUDGET-INTEG-002"]
    notes: |
      - Hook blocks all integrations
      - Once hook ready, 4 integrations can run in parallel
      - BUDGET-INTEG-003 is lightest (0.25 pts)
      - Assign heaviest to separate engineers if possible

# Blockers
blockers: []
notes: |
  - Phase 4 depends on completion of Phase 3 (service layer)
  - Phase 5 can start design once Phase 4 endpoints are specified
  - Phase 6 can start planning while Phase 5 is in progress
  - Best parallelization: Phase 4 sequential, Phase 5 fully parallel, Phase 6 hook-first then parallel

# Success Criteria
success_criteria:
  - { id: SC-1, description: "All 3 API endpoints implemented and tested", phase: 4, status: pending }
  - { id: SC-2, description: "All endpoints handle errors gracefully (422, 404, 400)", phase: 4, status: pending }
  - { id: SC-3, description: "Integration tests for each endpoint (70%+ coverage)", phase: 4, status: pending }
  - { id: SC-4, description: "BudgetMeterComponent renders correctly on mobile and desktop", phase: 5, status: pending }
  - { id: SC-5, description: "Tooltip accessible with keyboard and screen readers", phase: 5, status: pending }
  - { id: SC-6, description: "All components have Storybook stories", phase: 5, status: pending }
  - { id: SC-7, description: "useBudgetMeter hook integrates with React Query and WebSocket", phase: 6, status: pending }
  - { id: SC-8, description: "Budget updates reflected in real-time (WebSocket <500ms)", phase: 6, status: pending }
  - { id: SC-9, description: "All views mobile-responsive (verified on iOS 44px touch)", phase: 6, status: pending }
  - { id: SC-10, description: "End-to-end flow tested: create occasion, set budget, add gift, see meter update", phase: 6, status: pending }

# Quality Gates
quality_gates:
  phase_4:
    description: "Code review, all endpoints tested, error handling complete"
    criteria:
      - All endpoints return correct status codes
      - Error envelopes follow project standard
      - Integration tests passing
      - No console errors/warnings
  phase_5:
    description: "Component review, accessibility, responsive design"
    criteria:
      - Components render without errors
      - Accessible (WCAG AA)
      - Responsive on mobile/desktop/tablet
      - Storybook stories complete
  phase_6:
    description: "Full integration, real-time sync, mobile tested"
    criteria:
      - Hook properly invalidates cache on WebSocket events
      - All views update correctly
      - Real-time latency <500ms
      - Mobile-first verified on actual device

---

# Phase 4-6: API & Frontend Progress

## Overview

This document tracks progress for Budget Progression Meter Phases 4-6, implementing the API layer and frontend integration for the budget visualization feature.

**Total Effort**: 8 story points across 3 phases
**Timeline**: 7-10 days (with parallelization)
**Status**: Pending (awaiting Phase 3 backend completion)
**Progress**: 0%

## Phase 4: API Layer (3 Story Points)

**Status**: Pending
**Dependencies**: Phase 3 service layer (BUDGET-SERVICE-001, BUDGET-SERVICE-002, BUDGET-SERVICE-003)
**Timeline**: 3-4 days (sequential, single engineer)

### Tasks

| ID | Task | Points | Status | Assigned | Dependencies |
|----|------|--------|--------|----------|--------------|
| BUDGET-API-001 | Budget meter endpoint (GET) | 1 | Pending | python-backend-engineer | Service layer |
| BUDGET-API-002 | Set occasion budget endpoint (PATCH) | 1 | Pending | python-backend-engineer | Service layer |
| BUDGET-API-003 | Sub-budget endpoints (POST/GET) | 1 | Pending | python-backend-engineer | Service layer |

### Orchestration Commands (Phase 4)

```text
# Sequential execution (all same engineer)
Task("python-backend-engineer", "BUDGET-API-001: Implement GET /api/budgets/meter/{occasion_id}")
Task("python-backend-engineer", "BUDGET-API-002: Implement PATCH /api/occasions/{id}/budget")
Task("python-backend-engineer", "BUDGET-API-003: Implement POST/GET sub-budget endpoints")
```

### Deliverables

- FastAPI router with 3 endpoints
- Request/response schemas validated
- Integration tests (70%+ coverage)
- Error handling per project standards

### Quality Gate

- All endpoints return correct HTTP status codes
- Error envelopes follow `/error` structure
- Integration tests passing
- No console errors or warnings

---

## Phase 5: Frontend Components (3 Story Points)

**Status**: Pending
**Dependencies**: Phase 4 API endpoints defined (can start design after specification)
**Timeline**: 2-3 days (fully parallel)

### Tasks

| ID | Task | Points | Status | Assigned | Dependencies |
|----|------|--------|--------|----------|--------------|
| BUDGET-UI-001 | BudgetMeterComponent (3-segment bar) | 1.5 | Pending | ui-engineer-enhanced | API spec |
| BUDGET-UI-002 | BudgetTooltip component | 1 | Pending | ui-engineer-enhanced | API spec |
| BUDGET-UI-003 | BudgetWarningCard component | 0.5 | Pending | ui-engineer-enhanced | API spec |

### Orchestration Commands (Phase 5)

```text
# All parallel (independent components)
Task("ui-engineer-enhanced", "BUDGET-UI-001: Create BudgetMeterComponent (1.5 pts)")
Task("ui-engineer-enhanced", "BUDGET-UI-002: Create BudgetTooltip component (1 pt)")
Task("ui-engineer-enhanced", "BUDGET-UI-003: Create BudgetWarningCard component (0.5 pt)")
```

### Component Specifications

#### BudgetMeterComponent
- **Props**: { budget: number, spent: number, giftsCount: number }
- **Display**: 3-segment bar (allocated, spent, remaining)
- **Colors**: Green (healthy), Amber (warning >80%), Red (exceeded)
- **Responsive**: 100% width on mobile, 300px+ on desktop
- **Accessibility**: ARIA labels, keyboard focus visible

#### BudgetTooltip
- **Trigger**: Hover on meter (desktop), tap (mobile)
- **Content**: Total budget, spent, remaining, gift list
- **Dismissal**: Auto-dismiss on blur, or tap outside

#### BudgetWarningCard
- **Trigger**: When spent >= total
- **Display**: "Budget exceeded by $X"
- **Action**: Optional button (dismiss, adjust budget)
- **Accessibility**: Alert role with color + icon

### Deliverables

- React components (TypeScript)
- Tailwind styling with dark mode
- Storybook stories for each component
- Unit tests (60%+ coverage)
- Accessibility verified (WCAG AA)

### Quality Gate

- Components render without errors
- Responsive on mobile, tablet, desktop
- Accessible (WCAG AA minimum)
- Storybook stories complete and interactive
- Unit tests >60% coverage

---

## Phase 6: Frontend Integration (2.75 Story Points)

**Status**: Pending
**Dependencies**: Phase 5 components + Phase 4 API complete
**Timeline**: 2-3 days (1 day hook + 1-2 days integrations)

### Tasks

| ID | Task | Points | Status | Assigned | Dependencies |
|----|------|--------|--------|----------|--------------|
| BUDGET-INTEG-001 | useBudgetMeter React Query hook | 1 | Pending | frontend-developer | Phase 5 complete |
| BUDGET-INTEG-002 | Occasion detail integration | 0.5 | Pending | frontend-developer | INTEG-001 |
| BUDGET-INTEG-003 | Dashboard integration | 0.25 | Pending | frontend-developer | INTEG-001 |
| BUDGET-INTEG-004 | Gift form budget context | 0.5 | Pending | frontend-developer | INTEG-001 |
| BUDGET-INTEG-005 | List/Kanban totals | 0.5 | Pending | frontend-developer | INTEG-001 |

### Orchestration Commands (Phase 6)

```text
# Step 1: Hook (prerequisite for all integrations)
Task("frontend-developer", "BUDGET-INTEG-001: Implement useBudgetMeter hook (1 pt)")

# Step 2: Integrations (parallel after hook)
Task("frontend-developer", "BUDGET-INTEG-002: Integrate in OccasionDetail (0.5 pt)")
Task("frontend-developer", "BUDGET-INTEG-003: Integrate in Dashboard (0.25 pt)")
Task("frontend-developer", "BUDGET-INTEG-004: Add context to gift form (0.5 pt)")
Task("frontend-developer", "BUDGET-INTEG-005: Add totals to lists (0.5 pt)")
```

### Hook Implementation (BUDGET-INTEG-001)

**useBudgetMeter(occasion_id)**

```typescript
// Returns
{
  data: {
    remaining: number,
    spent: number,
    total: number,
    percent_used: number (0-100),
    status: 'healthy' | 'warning' | 'exceeded',
    gift_count: number,
    gift_list: Array
  },
  isLoading: boolean,
  error: Error | null,
  refetch: () => Promise<any>
}
```

**Features**:
- React Query useQuery with 5-min staleTime
- WebSocket invalidation on gift changes
- Automatic refetch on window focus
- Error boundary compatible

### Integration Specifications

#### OccasionDetail (BUDGET-INTEG-002)
- Display BudgetMeterComponent at top of occasion
- Show tooltip on hover
- Display warning card if exceeded
- Allow inline budget edit (PATCH endpoint)
- Update on gift additions/deletions

#### Dashboard (BUDGET-INTEG-003)
- Show compact meter on upcoming occasion cards
- Hover tooltip with breakdown
- Mobile: show status badge, no tooltip
- Click meter to navigate to occasion detail

#### Gift Form (BUDGET-INTEG-004)
- Show budget remaining in AddGiftModal sidebar
- Display warning if gift would exceed budget
- Show category budget if applicable
- Live update remaining as user enters price

#### List/Kanban (BUDGET-INTEG-005)
- Show total spent at top of list
- Show category totals in grouped view
- Visual indicator if over budget
- Update in real-time via WebSocket invalidation

### Deliverables

- useBudgetMeter hook with proper error handling
- Integrated meter in 4+ views
- Real-time updates via WebSocket invalidation
- E2E user flow working (create occasion → set budget → add gift → see update)
- Mobile-responsive verified

### Quality Gate

- Hook properly memoized (no infinite renders)
- WebSocket invalidation triggers cache updates
- All views update correctly on gift changes
- Real-time latency <500ms
- Mobile-first verified on actual iOS device
- Accessibility verified (WCAG AA)
- End-to-end flow tested

---

## Critical Path & Dependencies

```
Phase 3 (Service Layer) ──→ Phase 4 (API) ──→ Phase 5 (UI) ──→ Phase 6 (Integration)
   BUDGET-SERVICE-*         3-4 days        2-3 days (parallel)   2-3 days (hook first)
      (complete)            sequential      all independent        hook + parallel
```

**Parallelization Opportunity**:
- Phase 5 UI components can start design once Phase 4 endpoints are specified (not waiting for full implementation)
- Phase 6 integrations can run in parallel once hook is complete

---

## Status Log

| Date | Event | Progress | Notes |
|------|-------|----------|-------|
| 2025-12-04 | Progress tracking file created | 0% | Awaiting Phase 3 completion; ready to queue Phase 4 tasks |

---

## Next Actions

1. **Verify Phase 3 Completion**: Confirm BUDGET-SERVICE-001, 002, 003 are complete
2. **Queue Phase 4**: Delegate BUDGET-API-001 to python-backend-engineer
3. **Prepare Phase 5**: Review component specs with ui-engineer-enhanced
4. **Monitor Dependencies**: Track Phase 4 completion before starting Phase 5 integration
5. **Real-Time Planning**: Verify WebSocket event structure for list item changes

---

## Notes for Opus (Orchestration)

- **Phase 4**: Single engineer (python-backend-engineer) - sequential execution, 3-4 days
- **Phase 5**: Can parallelize across multiple engineers if available (3 independent components)
- **Phase 6**: Hook is critical path; after that, 4 integrations can run fully parallel
- **Recommended Timeline**: Phase 4 (3-4d) → Phase 5 (2-3d parallel) → Phase 6 (2-3d) = 7-10 days total
- **Risk Mitigation**: Keep Phase 5 and 6 in close coordination; start Phase 5 design as soon as Phase 4 API spec is ready
