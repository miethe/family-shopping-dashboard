---
# === PROGRESS TRACKING: Gift Linking & Budget Display Fixes ===
type: progress
prd: "gift-linking-v1"
phase: "all"
title: "Gift Linking & Budget Display Fixes"
status: "in_progress"
started: "2025-12-07"
completed: null

# Overall Progress
overall_progress: 38
completion_estimate: "on-track"

# Task Counts
total_tasks: 13
completed_tasks: 5
in_progress_tasks: 2
blocked_tasks: 0
at_risk_tasks: 0

# Ownership
owners: ["python-backend-engineer", "ui-engineer-enhanced"]
contributors: ["frontend-developer"]

# === ORCHESTRATION QUICK REFERENCE ===
tasks:
  # Phase 1: Backend Async Fix
  - id: "BE-001"
    description: "Fix base repository update - remove/replace session.refresh()"
    status: "completed"
    assigned_to: ["python-backend-engineer"]
    dependencies: []
    estimated_effort: "2h"
    priority: "critical"
    phase: 1
    commit: "ce16932"

  - id: "BE-002"
    description: "Fix gift set_stores - replace session.refresh() with async pattern"
    status: "completed"
    assigned_to: ["python-backend-engineer"]
    dependencies: []
    estimated_effort: "1h"
    priority: "high"
    phase: 1
    commit: "d3e23cb"

  - id: "BE-003"
    description: "Fix gift update_purchaser - replace session.refresh() with selectinload"
    status: "completed"
    assigned_to: ["python-backend-engineer"]
    commit: "d3e23cb"
    dependencies: []
    estimated_effort: "1h"
    priority: "high"
    phase: 1

  - id: "BE-004"
    description: "Add integration test for gift price update flow"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["BE-001", "BE-002", "BE-003"]
    estimated_effort: "1h"
    priority: "medium"
    phase: 1

  # Phase 2: Query Enhancement
  - id: "LINK-001"
    description: "Update get_filtered() to include GiftPerson-linked gifts"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["BE-001"]
    estimated_effort: "3h"
    priority: "high"
    phase: 2

  - id: "LINK-002"
    description: "Add role information to gift response for GiftPerson links"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["LINK-001"]
    estimated_effort: "2h"
    priority: "medium"
    phase: 2

  - id: "LINK-003"
    description: "Add API tests for new query behavior"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["LINK-001", "LINK-002"]
    estimated_effort: "1h"
    priority: "medium"
    phase: 2

  # Phase 3: Frontend Enhancement
  - id: "UI-001"
    description: "Add budget fields to Person schema/type"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: []
    estimated_effort: "1h"
    priority: "medium"
    phase: 3

  - id: "UI-002"
    description: "Update PersonBudgetBar conditionals for budget existence"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["UI-001"]
    estimated_effort: "2h"
    priority: "high"
    phase: 3

  - id: "UI-003"
    description: "Add budget headers (Purchased/Planned/Total Budget)"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["UI-002"]
    estimated_effort: "2h"
    priority: "medium"
    phase: 3

  - id: "UI-004"
    description: "Handle totals-only case when no budget but gifts exist"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: ["UI-002"]
    estimated_effort: "2h"
    priority: "medium"
    phase: 3

  - id: "UI-005"
    description: "Update StackedProgressBar for optional budget mode"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["UI-002"]
    estimated_effort: "2h"
    priority: "medium"
    phase: 3

  - id: "UI-006"
    description: "Add component tests for all display conditions"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: ["UI-003", "UI-004", "UI-005"]
    estimated_effort: "1h"
    priority: "low"
    phase: 3

# Parallelization Strategy
parallelization:
  # Phase 1 batches
  batch_1: ["BE-001", "BE-002", "BE-003"]  # All can run in parallel
  batch_2: ["BE-004"]                       # After batch_1

  # Phase 2 batches
  batch_3: ["LINK-001"]                     # After BE-001
  batch_4: ["LINK-002"]                     # After LINK-001
  batch_5: ["LINK-003"]                     # After LINK-002

  # Phase 3 batches
  batch_6: ["UI-001"]                       # Can start with Phase 2
  batch_7: ["UI-002"]                       # After UI-001
  batch_8: ["UI-003", "UI-004", "UI-005"]   # After UI-002 (parallel)
  batch_9: ["UI-006"]                       # After batch_8

  critical_path: ["BE-001", "LINK-001", "UI-001", "UI-002", "UI-003"]
  estimated_total_time: "12h"

# Blockers
blockers: []

# Success Criteria
success_criteria:
  - id: "SC-1"
    description: "Gift price updates succeed without greenlet error"
    status: "pending"
  - id: "SC-2"
    description: "Gifts assigned via GiftPerson appear in Linked Entities"
    status: "pending"
  - id: "SC-3"
    description: "Progress bars only show when budget is set"
    status: "pending"
  - id: "SC-4"
    description: "Budget headers display correctly"
    status: "pending"

# Files Modified
files_modified:
  # Phase 1
  - "services/api/app/repositories/base.py"
  - "services/api/app/repositories/gift.py"
  # Phase 2
  - "services/api/app/repositories/gift.py"
  - "services/api/app/schemas/gift.py"
  # Phase 3
  - "services/api/app/schemas/person.py"
  - "apps/web/types/person.ts"
  - "apps/web/components/people/PersonBudgetBar.tsx"
  - "apps/web/components/ui/stacked-progress-bar.tsx"
---

# Gift Linking v1 - All Phases Progress

**PRD**: gift-linking-v1
**Status**: Planning (0% complete)
**Duration**: Started 2025-12-07
**Owners**: python-backend-engineer, ui-engineer-enhanced

---

## Orchestration Quick Reference

> **For Orchestration Agents**: Use this section to delegate tasks without reading the full file.

### Phase 1: Backend Async Fix (Critical)

**Batch 1** (Parallel - No Dependencies):
- BE-001 → `python-backend-engineer` (2h) - Fix base repo update
- BE-002 → `python-backend-engineer` (1h) - Fix set_stores
- BE-003 → `python-backend-engineer` (1h) - Fix update_purchaser

**Batch 2** (After Batch 1):
- BE-004 → `python-backend-engineer` (1h) - Integration tests

### Phase 2: Query Enhancement

**Batch 3** (After BE-001):
- LINK-001 → `python-backend-engineer` (3h) - Update get_filtered query

**Batch 4** (After LINK-001):
- LINK-002 → `python-backend-engineer` (2h) - Add role info

**Batch 5** (After LINK-002):
- LINK-003 → `python-backend-engineer` (1h) - API tests

### Phase 3: Frontend Enhancement

**Batch 6** (Can start parallel with Phase 2):
- UI-001 → `python-backend-engineer` (1h) - Add budget fields to Person

**Batch 7** (After UI-001):
- UI-002 → `ui-engineer-enhanced` (2h) - Update PersonBudgetBar conditionals

**Batch 8** (After UI-002, parallel):
- UI-003 → `ui-engineer-enhanced` (2h) - Add headers
- UI-004 → `frontend-developer` (2h) - Totals-only case
- UI-005 → `ui-engineer-enhanced` (2h) - Optional budget mode

**Batch 9** (After Batch 8):
- UI-006 → `frontend-developer` (1h) - Component tests

---

## Task Delegation Commands

### Phase 1: Backend Async Fix

```
# Batch 1 (Launch in parallel)
Task("python-backend-engineer", "BE-001: Fix greenlet error in base repository update method.
File: services/api/app/repositories/base.py:165-198
Problem: session.refresh() triggers lazy loading in async context.
Fix: Either remove refresh (return stale object) or re-fetch with selectinload.
Test: Gift price updates succeed without MissingGreenlet error.")

Task("python-backend-engineer", "BE-002: Fix greenlet error in gift set_stores method.
File: services/api/app/repositories/gift.py:508-527
Problem: session.refresh(gift) triggers lazy loading.
Fix: Remove refresh or use explicit eager loading query.
Test: Store assignment works without error.")

Task("python-backend-engineer", "BE-003: Fix greenlet error in gift update_purchaser method.
File: services/api/app/repositories/gift.py:775-819
Problem: session.refresh(gift, ['people', 'stores']) fails in async.
Fix: Replace with selectinload query.
Test: Purchaser updates work correctly.")

# Batch 2 (After Batch 1 completes)
Task("python-backend-engineer", "BE-004: Add integration test for gift price update flow.
Create test that updates gift price and verifies no greenlet error.
Location: services/api/tests/integration/
Cover: price update, sale_price update, MSRP update (if field exists).")
```

### Phase 2: Query Enhancement

```
# Batch 3 (After BE-001)
Task("python-backend-engineer", "LINK-001: Update gift get_filtered() to include GiftPerson-linked gifts.
File: services/api/app/repositories/gift.py
Current: Only queries via List ownership (Gift JOIN ListItem JOIN List).
Change: Add UNION with GiftPerson-linked gifts (where role=RECIPIENT).
Query pattern:
  list_gifts = Gift via ListItem → List → person_id
  direct_gifts = Gift via GiftPerson → person_id + role=RECIPIENT
  all_gifts = UNION(list_gifts, direct_gifts)
Ensure: No duplicate gifts in results, maintain filters.")

# Batch 4 (After LINK-001)
Task("python-backend-engineer", "LINK-002: Add relationship role to gift response.
File: services/api/app/schemas/gift.py, services/api/app/repositories/gift.py
Add: person_role field to indicate how gift is linked (RECIPIENT, PURCHASER, LIST_OWNER).
Frontend needs this to display role badges in Linked Entities.")

# Batch 5 (After LINK-002)
Task("python-backend-engineer", "LINK-003: Add API tests for gift-person linking.
Location: services/api/tests/
Test scenarios:
1. Gift assigned via GiftPerson shows in person's linked entities
2. Gift in person's list shows in linked entities
3. Gift linked both ways (GiftPerson + List) appears once (no duplicates)
4. Role information is correct in response.")
```

### Phase 3: Frontend Enhancement

```
# Batch 6 (Can start parallel with Phase 2)
Task("python-backend-engineer", "UI-001: Add budget fields to Person model and schema.
Files:
- services/api/app/schemas/person.py (add recipient_budget_total, purchaser_budget_total)
- services/api/app/models/person.py (if not already present)
These are the user-set budget amounts (not calculated totals).
Frontend needs these to determine whether to show progress bar vs just totals.")

# Batch 7 (After UI-001)
Task("ui-engineer-enhanced", "UI-002: Update PersonBudgetBar conditionals.
File: apps/web/components/people/PersonBudgetBar.tsx
Current: Always shows progress bars in modal variant.
Change: Add conditional logic based on budget existence:
- If budget NOT set AND no gifts: hide entirely
- If budget NOT set AND gifts exist: show totals only
- If budget set AND no gifts: show empty progress bar
- If budget set AND gifts: show full progress bar
Add display matrix logic for both recipient and purchaser categories.")

# Batch 8 (After UI-002, parallel)
Task("ui-engineer-enhanced", "UI-003: Add budget column headers.
File: apps/web/components/people/PersonBudgetBar.tsx or stacked-progress-bar.tsx
Add headers above progress bars:
  Purchased | Planned | Budget
  [$100]    | [$250]  | [$500]
Headers should only show when corresponding progress bar is visible.
Align columns with progress bar segments.")

Task("frontend-developer", "UI-004: Handle totals-only display case.
File: apps/web/components/people/PersonBudgetBar.tsx
When person has no budget set but has gifts:
- Show totals (Purchased: $X, Planned: $Y) without progress bar
- No percentage/progress visualization
- Clean, minimal display
Create new TotalsOnly variant or conditional in existing component.")

Task("ui-engineer-enhanced", "UI-005: Update StackedProgressBar for optional budget.
File: apps/web/components/ui/stacked-progress-bar.tsx
Add support for 'no budget' mode where:
- budgetTotal can be undefined/null
- Component renders differently without max value
- Consider variant prop: 'progress' vs 'totals-only'")

# Batch 9 (After Batch 8)
Task("frontend-developer", "UI-006: Add component tests for budget display.
Files: Test files for PersonBudgetBar and StackedProgressBar
Test all combinations:
1. Budget set + gifts exist → full progress bar
2. Budget set + no gifts → empty progress bar
3. No budget + gifts exist → totals only
4. No budget + no gifts → nothing rendered
Test for both recipient and purchaser categories.")
```

---

## Issues Overview

| # | Issue | Root Cause | Phase |
|---|-------|-----------|-------|
| 1 | Gifts not in Linked Entities | Query uses list ownership, not GiftPerson | 2 |
| 2 | Price update greenlet error | session.refresh() lazy loading in async | 1 |
| 3 | Progress bars always display | No conditional for budget existence | 3 |
| 4 | Missing budget headers | Not implemented | 3 |

---

## Tasks

| ID | Task | Status | Agent | Deps | Est | Phase |
|----|------|--------|-------|------|-----|-------|
| BE-001 | Fix base repo update() | ⏳ | python-backend-engineer | - | 2h | 1 |
| BE-002 | Fix gift set_stores() | ⏳ | python-backend-engineer | - | 1h | 1 |
| BE-003 | Fix gift update_purchaser() | ⏳ | python-backend-engineer | - | 1h | 1 |
| BE-004 | Add integration test | ⏳ | python-backend-engineer | BE-001-003 | 1h | 1 |
| LINK-001 | Update get_filtered query | ⏳ | python-backend-engineer | BE-001 | 3h | 2 |
| LINK-002 | Add role info to response | ⏳ | python-backend-engineer | LINK-001 | 2h | 2 |
| LINK-003 | Add API tests | ⏳ | python-backend-engineer | LINK-002 | 1h | 2 |
| UI-001 | Add budget fields to Person | ⏳ | python-backend-engineer | - | 1h | 3 |
| UI-002 | Update PersonBudgetBar conditionals | ⏳ | ui-engineer-enhanced | UI-001 | 2h | 3 |
| UI-003 | Add budget headers | ⏳ | ui-engineer-enhanced | UI-002 | 2h | 3 |
| UI-004 | Handle totals-only case | ⏳ | frontend-developer | UI-002 | 2h | 3 |
| UI-005 | Update StackedProgressBar | ⏳ | ui-engineer-enhanced | UI-002 | 2h | 3 |
| UI-006 | Add component tests | ⏳ | frontend-developer | UI-003-005 | 1h | 3 |

**Status Legend**: ⏳ Pending | 🔄 In Progress | ✓ Complete | 🚫 Blocked | ⚠️ At Risk

---

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-1 | Gift price updates succeed without greenlet error | ⏳ |
| SC-2 | Gifts assigned via GiftPerson appear in Linked Entities | ⏳ |
| SC-3 | Progress bars only show when budget is set | ⏳ |
| SC-4 | Budget headers display correctly | ⏳ |

---

## Key Files

### Phase 1 (Backend Async Fix)
- `services/api/app/repositories/base.py:165-198` - update() method
- `services/api/app/repositories/gift.py:508-527` - set_stores()
- `services/api/app/repositories/gift.py:775-819` - update_purchaser()

### Phase 2 (Query Enhancement)
- `services/api/app/repositories/gift.py` - get_filtered() method
- `services/api/app/schemas/gift.py` - GiftResponse

### Phase 3 (Frontend Enhancement)
- `services/api/app/schemas/person.py` - Person schema
- `apps/web/types/person.ts` - Person type
- `apps/web/components/people/PersonBudgetBar.tsx`
- `apps/web/components/ui/stacked-progress-bar.tsx`

---

## Session Notes

### 2025-12-07 (Planning)

**Completed**:
- Explored codebase to identify root causes
- Created implementation plan
- Created progress tracking artifact

**Key Findings**:
1. Two gift-person linking mechanisms: GiftPerson table vs List ownership
2. Greenlet error caused by session.refresh() without selectinload
3. PersonBudgetBar has card variant conditionals but modal always shows
4. StackedProgressBar renders without checking budget existence

**Next Session**:
- Start Phase 1: Fix backend async issues (BE-001, BE-002, BE-003 in parallel)

---

## Additional Resources

- **Implementation Plan**: `/docs/project_plans/implementation_plans/bugs/gift-linking-v1.md`
- **Feature Request**: `/docs/project_plans/requests/gift-linking-v1.md`
- **Exploration Findings**: `.claude/findings/gift-person-linking-exploration.md`
