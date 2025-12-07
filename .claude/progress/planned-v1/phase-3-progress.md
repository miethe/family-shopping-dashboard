---
type: progress
prd: "planned-v1"
phase: 3
title: "Frontend - Gift Enhancements"
status: "completed"
started: "2025-12-06"
completed: "2025-12-06"

overall_progress: 100
completion_estimate: "on-track"

total_tasks: 7
completed_tasks: 7
in_progress_tasks: 0
blocked_tasks: 0
at_risk_tasks: 0

owners: ["ui-engineer-enhanced"]
contributors: ["frontend-developer"]

tasks:
  - id: "UI-001"
    description: "PersonDropdown component with inline Add New"
    status: "completed"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "3h"
    priority: "critical"

  - id: "UI-002"
    description: "Gift status change with purchaser assignment"
    status: "completed"
    assigned_to: ["frontend-developer"]
    dependencies: ["UI-001"]
    estimated_effort: "2h"
    priority: "high"

  - id: "UI-003"
    description: "GiftCard quick actions (URL, status, assign)"
    status: "completed"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["UI-001"]
    estimated_effort: "3h"
    priority: "high"

  - id: "UI-004"
    description: "Gift modal status dropdown (replace Mark as Purchased)"
    status: "completed"
    assigned_to: ["frontend-developer"]
    dependencies: []
    estimated_effort: "1h"
    priority: "medium"

  - id: "UI-005"
    description: "Bulk selection mode on /gifts page"
    status: "completed"
    assigned_to: ["frontend-developer"]
    dependencies: []
    estimated_effort: "2h"
    priority: "high"

  - id: "UI-006"
    description: "BulkActionBar component"
    status: "completed"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["UI-001", "UI-005"]
    estimated_effort: "3h"
    priority: "high"

  - id: "UI-007"
    description: "Gift form recipient/purchaser with Separate/Shared dialog"
    status: "completed"
    assigned_to: ["frontend-developer"]
    dependencies: ["UI-001"]
    estimated_effort: "3h"
    priority: "medium"

parallelization:
  batch_1: ["UI-001", "UI-004", "UI-005"]
  batch_2: ["UI-002", "UI-003", "UI-006", "UI-007"]
  critical_path: ["UI-001", "UI-006"]
  estimated_total_time: "6h"

blockers: []

success_criteria:
  - { id: "SC-1", description: "All components render in all states", status: "pending" }
  - { id: "SC-2", description: "Touch targets 44x44px minimum", status: "pending" }
  - { id: "SC-3", description: "Keyboard navigation works", status: "pending" }
  - { id: "SC-4", description: "Mobile responsive", status: "pending" }
  - { id: "SC-5", description: "Follows Soft Modernity design system", status: "pending" }

files_modified:
  - "apps/web/components/common/PersonDropdown.tsx"
  - "apps/web/components/gifts/GiftCard.tsx"
  - "apps/web/components/gifts/GiftForm.tsx"
  - "apps/web/components/modals/GiftDetailModal.tsx"
  - "apps/web/components/gifts/BulkActionBar.tsx"
  - "apps/web/components/modals/SeparateSharedDialog.tsx"
  - "apps/web/app/gifts/page.tsx"
  - "apps/web/hooks/useGiftSelection.ts"
---

# planned-v1 - Phase 3: Frontend - Gift Enhancements

**Phase**: 3 of 4
**Status**: Planning (0% complete)
**Duration**: Estimated 3-4 days
**Owner**: ui-engineer-enhanced
**Contributors**: frontend-developer

---

## Orchestration Quick Reference

> **For Orchestration Agents**: Use this section to delegate tasks without reading the full file.

### Parallelization Strategy

**Batch 1** (Parallel - No Dependencies):
- UI-001 → `ui-engineer-enhanced` (3h) - PersonDropdown (CRITICAL - blocks others)
- UI-004 → `frontend-developer` (1h) - Status dropdown in modal
- UI-005 → `frontend-developer` (2h) - Bulk selection mode

**Batch 2** (Sequential - Depends on Batch 1):
- UI-002 → `frontend-developer` (2h) - **Blocked by**: UI-001
- UI-003 → `ui-engineer-enhanced` (3h) - **Blocked by**: UI-001
- UI-006 → `ui-engineer-enhanced` (3h) - **Blocked by**: UI-001, UI-005
- UI-007 → `frontend-developer` (3h) - **Blocked by**: UI-001

**Critical Path**: UI-001 → UI-006 (6h total)

### Task Delegation Commands

```
# Batch 1 (Launch in parallel)
Task("ui-engineer-enhanced", "UI-001: Create PersonDropdown component with inline Add New.

CRITICAL: This component is used by UI-002, UI-003, UI-006, UI-007.

Requirements:
- Props: value, onChange, allowNew, label, variant ('compact' | 'default')
- Compact variant: 32px height for GiftCard
- Default variant: 44px height for forms
- Search/filter functionality
- 'Add New Person' option at bottom
- Inline person creation modal on 'Add New'
- Mobile: Opens as bottom sheet

Design Tokens (Soft Modernity):
- Background: #FFFFFF (elevated)
- Border: #D4CDC4, Focus: #E8846B
- Radius: 12px
- Avatar: 24px with status ring

Files:
- apps/web/components/common/PersonDropdown.tsx (new)
- apps/web/components/modals/PersonQuickCreateModal.tsx (new, simple)

Acceptance:
- Works in all contexts (GiftCard, forms, BulkActionBar)
- Touch targets 44px
- Keyboard navigation
- Mobile bottom sheet")

Task("frontend-developer", "UI-004: Replace 'Mark as Purchased' with status dropdown in Gift modal.

Requirements:
- Replace single button with dropdown
- All gift statuses available: idea, shortlisted, buying, ordered, purchased, delivered, gifted
- StatusPill styling with dot indicators
- Keep current status highlighted

Files:
- apps/web/components/modals/GiftDetailModal.tsx

Acceptance:
- All statuses selectable
- Current status indicated
- Triggers purchaser dialog when selecting Select/Purchased (Phase 3)")

Task("frontend-developer", "UI-005: Add bulk selection mode to /gifts page.

Requirements:
- 'Select' button in header toggles selection mode
- Checkbox column on left of each GiftCard/row
- Selection state managed in context/hook
- 'Clear Selection' resets state
- Count displayed in header

Files:
- apps/web/app/gifts/page.tsx
- apps/web/hooks/useGiftSelection.ts (new)
- apps/web/components/gifts/GiftCard.tsx (add checkbox)

Acceptance:
- Toggle mode works
- Multi-select functions
- State persists across scroll
- Clear works")

# Batch 2 (After Batch 1 completes)
Task("frontend-developer", "UI-002: Add purchaser assignment on gift status change.

Requirements:
- When status changes to 'selected' or 'purchased'
- Show PersonDropdown dialog: 'Who is purchasing this gift?'
- Optional (can skip)
- Save to gift.purchaser_id via API

Files:
- apps/web/components/modals/GiftDetailModal.tsx
- apps/web/components/modals/PurchaserAssignDialog.tsx (new)

Acceptance:
- Dialog appears on status change
- PersonDropdown integrated
- Skip option works
- API call saves purchaser")

Task("ui-engineer-enhanced", "UI-003: Add quick actions to GiftCard.

Requirements:
- Top-right: URL button (external link icon)
  - 32x32px, ghost variant
  - Only visible if gift.url exists
  - Opens URL in new tab
- Bottom-right: Status dropdown (compact StatusPill)
  - Clickable to change status
- Bottom-right (left of status): Assign recipient button
  - User plus icon, opens PersonDropdown

Design Tokens:
- Buttons: ghost, hover #F5F2ED
- Radius: 8px
- Gap: 8px

Files:
- apps/web/components/gifts/GiftCard.tsx

Acceptance:
- All 3 actions work
- Touch targets 44px
- Mobile: overflow menu
- URL button conditional")

Task("ui-engineer-enhanced", "UI-006: Create BulkActionBar component.

Requirements:
- Fixed bottom bar (above mobile nav)
- Height: 56px + safe area
- Shows: '{n} selected' + Clear button
- Actions: Mark Purchased, Assign Recipient, Assign Purchaser, Delete
- Delete requires confirmation (ConfirmDialog)
- Assign actions open PersonDropdown dialog
- Animation: slide up on first selection

Design Tokens:
- Glass panel: rgba(255,255,255,0.85) + blur 12px
- Border-top: #E8E3DC
- Shadow: high
- Radius: 20px (desktop), 0 (mobile)

Files:
- apps/web/components/gifts/BulkActionBar.tsx (new)
- apps/web/app/gifts/page.tsx (integrate)

Acceptance:
- All actions work with bulk endpoint
- Partial failures handled
- Animations smooth
- Mobile responsive")

Task("frontend-developer", "UI-007: Add recipient/purchaser to GiftForm with Separate/Shared dialog.

Requirements:
- Add 'Recipient(s)' field: multi-select PersonDropdown
- Add 'Purchaser' field: single-select PersonDropdown
- If multiple recipients selected and form submitted:
  - Show SeparateSharedDialog
  - 'Separate Gifts': Creates N gifts (quantity x N)
  - 'Shared Gift': One gift with all recipients

Files:
- apps/web/components/features/GiftForm.tsx
- apps/web/components/modals/SeparateSharedDialog.tsx (new)

Acceptance:
- Multi-select works
- Dialog appears for 2+ recipients
- Both options create correct data
- API calls succeed")
```

---

## Overview

Implement all gift-related UI enhancements including purchaser assignment, bulk actions, and quick card actions.

**Why This Phase**: High-visibility improvements to gift management workflow.

**Scope**:
- IN: PersonDropdown, GiftCard actions, BulkActionBar, GiftForm enhancements
- OUT: Person/Occasion UI (Phase 4)

---

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-1 | Components render in all states | Pending |
| SC-2 | Touch targets 44px minimum | Pending |
| SC-3 | Keyboard navigation works | Pending |
| SC-4 | Mobile responsive | Pending |
| SC-5 | Follows Soft Modernity design | Pending |

---

## Tasks

| ID | Task | Status | Agent | Dependencies | Est | Notes |
|----|------|--------|-------|--------------|-----|-------|
| UI-001 | PersonDropdown | Pending | ui-engineer-enhanced | None | 3h | CRITICAL - blocks 4 tasks |
| UI-002 | Status + purchaser | Pending | frontend-developer | UI-001 | 2h | Dialog flow |
| UI-003 | GiftCard quick actions | Pending | ui-engineer-enhanced | UI-001 | 3h | 3 new buttons |
| UI-004 | Modal status dropdown | Pending | frontend-developer | None | 1h | Simple replacement |
| UI-005 | Bulk selection mode | Pending | frontend-developer | None | 2h | Selection state |
| UI-006 | BulkActionBar | Pending | ui-engineer-enhanced | UI-001, UI-005 | 3h | Complex component |
| UI-007 | Form recipients | Pending | frontend-developer | UI-001 | 3h | Separate/Shared logic |

---

## Design Reference

See `/docs/designs/specs/planned-v1-components.md` for detailed component specifications.

Key components:
- PersonDropdown (2 variants)
- GiftCard Quick Actions (3 buttons)
- BulkActionBar (floating, glass panel)
- SeparateSharedDialog (radio options)

---

## Next Session Agenda

### Immediate Actions
1. [ ] Wait for Phase 2 completion (API endpoints needed)
2. [ ] Execute Batch 1: UI-001, UI-004, UI-005 in parallel
3. [ ] Execute Batch 2 after PersonDropdown complete

---
