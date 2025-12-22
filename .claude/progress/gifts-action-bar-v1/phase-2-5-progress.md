---
# === PROGRESS TRACKING: GIFTS ACTION BAR V1 - PHASES 2-5 ===
# Frontend components, mutations, and filters implementation

# Metadata
type: progress
prd: "gifts-action-bar-v1"
phase: "2-5"
title: "Frontend Components & Mutations"
status: "planning"
started: null
completed: null

# Progress Metrics
overall_progress: 0
completion_estimate: "on-track"

# Task Counts
total_tasks: 13
completed_tasks: 0
in_progress_tasks: 0
blocked_tasks: 0
at_risk_tasks: 0

# Ownership
owners: ["ui-engineer-enhanced"]
contributors: ["frontend-developer"]

# === ORCHESTRATION QUICK REFERENCE ===
tasks:
  # Phase 2: Status & List UI
  - id: "TASK-2.1"
    description: "Create StatusButton component with dropdown"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "2pt"
    priority: "high"

  - id: "TASK-2.2"
    description: "Create ListPickerDropdown component with multi-select"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced", "frontend-developer"]
    dependencies: []
    estimated_effort: "3pt"
    priority: "high"

  - id: "TASK-2.3"
    description: "Integrate Status and List buttons into GiftCard action bar"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-2.1", "TASK-2.2"]
    estimated_effort: "2pt"
    priority: "high"

  # Phase 3: Clickable Filters
  - id: "TASK-3.1"
    description: "Make status chip clickable with filter callback"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-2.3"]
    estimated_effort: "1pt"
    priority: "medium"

  - id: "TASK-3.2"
    description: "Make person avatars clickable in LinkedEntityIcons"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-2.3"]
    estimated_effort: "2pt"
    priority: "medium"

  - id: "TASK-3.3"
    description: "Make list badges clickable in LinkedEntityIcons"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-2.3"]
    estimated_effort: "1pt"
    priority: "medium"

  - id: "TASK-3.4"
    description: "Update /gifts page to handle filter callbacks and URL params"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: ["TASK-3.1", "TASK-3.2", "TASK-3.3"]
    estimated_effort: "2pt"
    priority: "high"

  # Phase 4: Price Edit Dialog
  - id: "TASK-4.1"
    description: "Create PriceEditDialog popover component"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "2pt"
    priority: "medium"

  - id: "TASK-4.2"
    description: "Make price text clickable on GiftCard"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-4.1"]
    estimated_effort: "1pt"
    priority: "medium"

  - id: "TASK-4.3"
    description: "Add input validation and error handling to price dialog"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: ["TASK-4.1"]
    estimated_effort: "2pt"
    priority: "medium"

  # Phase 5: From Santa Toggle
  - id: "TASK-5.1"
    description: "Add From Santa toggle to GiftCard action bar"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "2pt"
    priority: "medium"

  - id: "TASK-5.2"
    description: "Add Santa icon display with tooltip"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-5.1"]
    estimated_effort: "2pt"
    priority: "medium"

  - id: "TASK-5.3"
    description: "Add From Santa toggle to mobile overflow menu"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-5.1"]
    estimated_effort: "1pt"
    priority: "low"

# Parallelization Strategy
parallelization:
  batch_1: ["TASK-2.1", "TASK-2.2", "TASK-4.1", "TASK-5.1"]
  batch_2: ["TASK-2.3", "TASK-4.2", "TASK-4.3", "TASK-5.2", "TASK-5.3"]
  batch_3: ["TASK-3.1", "TASK-3.2", "TASK-3.3"]
  batch_4: ["TASK-3.4"]
  critical_path: ["TASK-2.1", "TASK-2.3", "TASK-3.1", "TASK-3.4"]
  estimated_total_time: "8 days"

# Blockers
blockers: []

# Success Criteria
success_criteria:
  - { id: "SC-2.1", description: "StatusButton renders and mutation works", status: "pending" }
  - { id: "SC-2.2", description: "ListPickerDropdown multi-select functional", status: "pending" }
  - { id: "SC-3.1", description: "All 3 filters (status, person, list) update URL params", status: "pending" }
  - { id: "SC-4.1", description: "PriceEditDialog opens, saves, validates", status: "pending" }
  - { id: "SC-5.1", description: "Santa toggle and icon display correctly", status: "pending" }
  - { id: "SC-ALL", description: "All touch targets 44px+ on mobile", status: "pending" }
  - { id: "SC-ERR", description: "Error toasts appear on failed mutations", status: "pending" }

# Files Modified
files_modified:
  - "apps/web/components/gifts/StatusButton.tsx"
  - "apps/web/components/gifts/ListPickerDropdown.tsx"
  - "apps/web/components/gifts/PriceEditDialog.tsx"
  - "apps/web/components/gifts/GiftCard.tsx"
  - "apps/web/components/gifts/LinkedEntityIcons.tsx"
  - "apps/web/app/gifts/page.tsx"
  - "apps/web/hooks/useGifts.ts"
---

# Gifts Action Bar v1 - Phases 2-5: Frontend Components & Mutations

**Phase**: 2-5 (grouped) of 3 phase groups
**Status**: Planning (0% complete)
**Duration**: 8 days (Days 3-10)
**Story Points**: 25 pts
**Owner**: ui-engineer-enhanced
**Contributors**: frontend-developer

---

## Orchestration Quick Reference

> **For Orchestration Agents**: Use this section to delegate tasks without reading the full file.

### Parallelization Strategy

**Batch 1** (Independent Components - No Dependencies):
- TASK-2.1 → `ui-engineer-enhanced` (2pt) - StatusButton component
- TASK-2.2 → `ui-engineer-enhanced` (3pt) - ListPickerDropdown component
- TASK-4.1 → `ui-engineer-enhanced` (2pt) - PriceEditDialog component
- TASK-5.1 → `ui-engineer-enhanced` (2pt) - From Santa toggle

**Batch 2** (Integration - After Batch 1):
- TASK-2.3 → `ui-engineer-enhanced` (2pt) - Integrate into GiftCard
- TASK-4.2 → `ui-engineer-enhanced` (1pt) - Make price clickable
- TASK-4.3 → `frontend-developer` (2pt) - Price validation
- TASK-5.2 → `ui-engineer-enhanced` (2pt) - Santa icon + tooltip
- TASK-5.3 → `ui-engineer-enhanced` (1pt) - Mobile menu toggle

**Batch 3** (Filters - After GiftCard integration):
- TASK-3.1 → `ui-engineer-enhanced` (1pt) - Status chip filter
- TASK-3.2 → `ui-engineer-enhanced` (2pt) - Person avatar filter
- TASK-3.3 → `ui-engineer-enhanced` (1pt) - List badge filter

**Batch 4** (Page Integration - Final):
- TASK-3.4 → `frontend-developer` (2pt) - /gifts page filter handling

**Critical Path**: TASK-2.1 → TASK-2.3 → TASK-3.1 → TASK-3.4

### Task Delegation Commands

```
# Batch 1 - Independent Components (Launch ALL in parallel)
Task("ui-engineer-enhanced", "TASK-2.1: Create StatusButton component.
File: apps/web/components/gifts/StatusButton.tsx
- Button shows current status, opens dropdown on click
- 4 options: IDEA, SELECTED, PURCHASED, RECEIVED
- Uses useUpdateGift mutation with optimistic updates
- Radix DropdownMenu for accessibility
- Touch target 44px minimum
See: docs/project_plans/implementation_plans/features/gifts-action-bar-v1/phase-2-5-frontend.md")

Task("ui-engineer-enhanced", "TASK-2.2: Create ListPickerDropdown component.
File: apps/web/components/gifts/ListPickerDropdown.tsx
- Multi-select checkboxes for all lists
- 'Create New List' button opens nested dialog
- Apply/Cancel buttons
- Uses useLists hook for list data
- Touch targets 44px minimum
See: docs/project_plans/implementation_plans/features/gifts-action-bar-v1/phase-2-5-frontend.md")

Task("ui-engineer-enhanced", "TASK-4.1: Create PriceEditDialog popover component.
File: apps/web/components/gifts/PriceEditDialog.tsx
- Popover positioned near price text (not full modal)
- Input for price with decimal validation
- 'No price' checkbox to clear price
- Save/Cancel buttons
- Uses useUpdateGift mutation
See: docs/project_plans/implementation_plans/features/gifts-action-bar-v1/phase-2-5-frontend.md")

Task("ui-engineer-enhanced", "TASK-5.1: Add From Santa toggle to GiftCard action bar.
File: apps/web/components/gifts/GiftCard.tsx
- Toggle button in action bar (desktop)
- Uses useUpdateGift mutation with from_santa field
- Optimistic update with toast feedback
See: docs/project_plans/implementation_plans/features/gifts-action-bar-v1/phase-2-5-frontend.md")

# Batch 2 - Integration (After Batch 1 completes)
Task("ui-engineer-enhanced", "TASK-2.3: Integrate StatusButton and ListPickerDropdown into GiftCard.
File: apps/web/components/gifts/GiftCard.tsx
- Add buttons to desktop action bar (lines 335-378)
- Add to mobile overflow menu
- Wire up mutations and callbacks
- Test responsive layout")

Task("ui-engineer-enhanced", "TASK-4.2: Make price text clickable on GiftCard.
File: apps/web/components/gifts/GiftCard.tsx
- Price area (including 'No price') opens PriceEditDialog
- Add cursor:pointer and hover state
- Manage dialog open/close state")

Task("frontend-developer", "TASK-4.3: Add input validation and error handling to PriceEditDialog.
File: apps/web/components/gifts/PriceEditDialog.tsx
- Decimal validation (2 places max)
- Non-negative constraint
- Max value 10,000
- Error messages for invalid input
- Retry on mutation failure")

Task("ui-engineer-enhanced", "TASK-5.2: Add Santa icon display with tooltip.
File: apps/web/components/gifts/GiftCard.tsx
- Conditional Santa icon when from_santa=true
- Position: top-right of card (no image occlusion)
- Tooltip on hover: 'From Santa'")

Task("ui-engineer-enhanced", "TASK-5.3: Add From Santa toggle to mobile overflow menu.
File: apps/web/components/gifts/GiftCard.tsx
- Add toggle option in mobile menu
- Same mutation as desktop toggle")

# Batch 3 - Filters (After GiftCard integration)
Task("ui-engineer-enhanced", "TASK-3.1: Make status chip clickable with filter callback.
File: apps/web/components/gifts/GiftCard.tsx
- Status pill becomes clickable (cursor:pointer, hover state)
- onClick calls onStatusFilter callback
- Visual indicator when filter active")

Task("ui-engineer-enhanced", "TASK-3.2: Make person avatars clickable in LinkedEntityIcons.
File: apps/web/components/gifts/LinkedEntityIcons.tsx
- Person avatars become clickable
- onClick calls onPersonClick callback
- Multiple people can be selected (OR filter)
- Visual indicator for active filter")

Task("ui-engineer-enhanced", "TASK-3.3: Make list badges clickable in LinkedEntityIcons.
File: apps/web/components/gifts/LinkedEntityIcons.tsx
- List badges become clickable
- onClick calls onListClick callback
- Single list filter (click again to toggle off)")

# Batch 4 - Page Integration (Final)
Task("frontend-developer", "TASK-3.4: Update /gifts page to handle filter callbacks.
File: apps/web/app/gifts/page.tsx
- Accept filter callbacks from GiftCard components
- Update URL query params (statuses, person_ids, list_ids)
- Pass current filter state to useGifts hook
- Show visual filter indicators
- Clear filter button")
```

---

## Overview

Phases 2-5 implement all frontend components for the 7 action bar features:
- **Phase 2**: Status button + List picker dropdowns
- **Phase 3**: Clickable filters (status, person, list chips)
- **Phase 4**: Price edit dialog
- **Phase 5**: From Santa toggle and icon

**Why This Phase**: Core user-facing functionality that reduces modal navigation and speeds workflows.

**Scope**:
- IN: 3 new components, GiftCard integration, filter callbacks, mutations
- OUT: E2E tests (Phase 6), backend changes (Phase 1)

---

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-2.1 | StatusButton renders and mutation works | Pending |
| SC-2.2 | ListPickerDropdown multi-select functional | Pending |
| SC-3.1 | All 3 filters update URL params | Pending |
| SC-4.1 | PriceEditDialog opens, saves, validates | Pending |
| SC-5.1 | Santa toggle and icon display correctly | Pending |
| SC-ALL | All touch targets 44px+ on mobile | Pending |
| SC-ERR | Error toasts appear on failed mutations | Pending |

---

## Tasks

### Phase 2: Status & List UI (7 pts)

| ID | Task | Status | Agent | Dependencies | Est |
|----|------|--------|-------|--------------|-----|
| TASK-2.1 | Create StatusButton | Pending | ui-engineer-enhanced | None | 2pt |
| TASK-2.2 | Create ListPickerDropdown | Pending | ui-engineer-enhanced | None | 3pt |
| TASK-2.3 | Integrate into GiftCard | Pending | ui-engineer-enhanced | 2.1, 2.2 | 2pt |

### Phase 3: Clickable Filters (6 pts)

| ID | Task | Status | Agent | Dependencies | Est |
|----|------|--------|-------|--------------|-----|
| TASK-3.1 | Status chip clickable | Pending | ui-engineer-enhanced | 2.3 | 1pt |
| TASK-3.2 | Person avatars clickable | Pending | ui-engineer-enhanced | 2.3 | 2pt |
| TASK-3.3 | List badges clickable | Pending | ui-engineer-enhanced | 2.3 | 1pt |
| TASK-3.4 | Page filter handling | Pending | frontend-developer | 3.1-3.3 | 2pt |

### Phase 4: Price Edit Dialog (5 pts)

| ID | Task | Status | Agent | Dependencies | Est |
|----|------|--------|-------|--------------|-----|
| TASK-4.1 | Create PriceEditDialog | Pending | ui-engineer-enhanced | None | 2pt |
| TASK-4.2 | Make price clickable | Pending | ui-engineer-enhanced | 4.1 | 1pt |
| TASK-4.3 | Validation & error handling | Pending | frontend-developer | 4.1 | 2pt |

### Phase 5: From Santa Toggle (5 pts)

| ID | Task | Status | Agent | Dependencies | Est |
|----|------|--------|-------|--------------|-----|
| TASK-5.1 | Add toggle to action bar | Pending | ui-engineer-enhanced | None | 2pt |
| TASK-5.2 | Santa icon + tooltip | Pending | ui-engineer-enhanced | 5.1 | 2pt |
| TASK-5.3 | Mobile menu toggle | Pending | ui-engineer-enhanced | 5.1 | 1pt |

---

## Architecture Context

### Key Files
- `apps/web/components/gifts/GiftCard.tsx` - Main integration point (action bar lines 335-378)
- `apps/web/components/gifts/LinkedEntityIcons.tsx` - Avatars and badges
- `apps/web/app/gifts/page.tsx` - Page-level filter state
- `apps/web/hooks/useGifts.ts` - React Query hooks

### Reference Patterns
- `StatusSelector` - Existing status picker component
- `PersonDropdown` - Existing single-select pattern
- Radix `DropdownMenu`, `Popover`, `Dialog` components

---

## Testing Strategy

| Test Type | Scope | Status |
|-----------|-------|--------|
| Component | Each new component renders | Pending |
| Integration | Mutations work end-to-end | Pending |
| Visual | Mobile responsive, 44px targets | Pending |
| A11y | Keyboard nav, ARIA labels | Pending |

---

## Next Session Agenda

1. [ ] Start with Batch 1 components (parallel)
2. [ ] Test each component in isolation
3. [ ] Integrate into GiftCard
4. [ ] Test filter callbacks

---

## Session Notes

*(Session notes will be added as work progresses)*
