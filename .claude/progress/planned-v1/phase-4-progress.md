---
type: progress
prd: "planned-v1"
phase: 4
title: "Frontend - Person & Occasion Enhancements"
status: "completed"
started: "2025-12-06"
completed: "2025-12-06"

overall_progress: 100
completion_estimate: "on-track"

total_tasks: 5
completed_tasks: 5
in_progress_tasks: 0
blocked_tasks: 0
at_risk_tasks: 0

owners: ["ui-engineer-enhanced"]
contributors: ["frontend-developer"]

tasks:
  - id: "UI-008"
    description: "PersonBudgetBar component on PersonCard and modal"
    status: "completed"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "3h"
    priority: "high"

  - id: "UI-009"
    description: "Person modal linked gifts tab"
    status: "completed"
    assigned_to: ["frontend-developer"]
    dependencies: []
    estimated_effort: "3h"
    priority: "high"

  - id: "UI-010"
    description: "Person card gift counts with tooltips"
    status: "completed"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["UI-009"]
    estimated_effort: "2h"
    priority: "medium"

  - id: "UI-011"
    description: "Occasion recipients section on /occasions/{id}"
    status: "completed"
    assigned_to: ["frontend-developer"]
    dependencies: []
    estimated_effort: "2h"
    priority: "medium"

  - id: "UI-012"
    description: "Occasion modal recipient count with tooltip"
    status: "completed"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["UI-011"]
    estimated_effort: "1h"
    priority: "low"

parallelization:
  batch_1: ["UI-008", "UI-009", "UI-011"]
  batch_2: ["UI-010", "UI-012"]
  critical_path: ["UI-009", "UI-010"]
  estimated_total_time: "5h"

blockers: []

success_criteria:
  - { id: "SC-1", description: "Budget bars display accurate data", status: "completed" }
  - { id: "SC-2", description: "Tooltips accessible (keyboard, screen reader)", status: "completed" }
  - { id: "SC-3", description: "Modal navigation works correctly", status: "completed" }
  - { id: "SC-4", description: "Mobile responsive", status: "completed" }

files_modified:
  - "apps/web/components/people/PersonBudgetBar.tsx"
  - "apps/web/components/people/PersonCard.tsx"
  - "apps/web/components/people/LinkedGiftsSection.tsx"
  - "apps/web/components/modals/PersonDetailModal.tsx"
  - "apps/web/components/modals/OccasionDetailModal.tsx"
  - "apps/web/components/common/MiniCardTooltip.tsx"
  - "apps/web/components/occasions/OccasionRecipientsSection.tsx"
  - "apps/web/app/occasions/[id]/page.tsx"
  - "apps/web/hooks/usePersonBudget.ts"
  - "apps/web/lib/api/endpoints.ts"
  - "apps/web/types/budget.ts"
---

# planned-v1 - Phase 4: Frontend - Person & Occasion Enhancements

**Phase**: 4 of 4
**Status**: Completed (100%)
**Duration**: 2025-12-06
**Owner**: ui-engineer-enhanced
**Contributors**: frontend-developer

---

## Orchestration Quick Reference

> **For Orchestration Agents**: Use this section to delegate tasks without reading the full file.

### Parallelization Strategy

**Batch 1** (Parallel - No Dependencies):
- UI-008 → `ui-engineer-enhanced` (3h) - PersonBudgetBar
- UI-009 → `frontend-developer` (3h) - Person modal linked gifts
- UI-011 → `frontend-developer` (2h) - Occasion recipients section

**Batch 2** (Sequential - Depends on Batch 1):
- UI-010 → `ui-engineer-enhanced` (2h) - **Blocked by**: UI-009
- UI-012 → `ui-engineer-enhanced` (1h) - **Blocked by**: UI-011

**Critical Path**: UI-009 → UI-010 (5h total)

### Task Delegation Commands

```
# Batch 1 (Launch in parallel)
Task("ui-engineer-enhanced", "UI-008: Create PersonBudgetBar component.

Requirements:
- Two progress bars: 'Gifts to Give' and 'Gifts Purchased'
- Variants: 'card' (PersonCard), 'modal' (Person modal Overview)
- Card variant: Only show if person has relevant gifts
- Modal variant: Always show (0 if none)
- Data from GET /persons/{id}/budgets

Design Tokens:
- Label: #8A827C, 12px
- Value: #2D2520, 14px semibold
- Progress bar: 8px height, full radius
- 'To Give' fill: #D4A853 (mustard)
- 'Purchased' fill: #7BA676 (sage)
- Background: #F5F2ED

Files:
- apps/web/components/people/PersonBudgetBar.tsx (new)
- apps/web/components/people/PersonCard.tsx (integrate)
- apps/web/components/modals/PersonDetailModal.tsx (integrate)

Acceptance:
- Accurate budget data
- Conditional display for card variant
- Responsive")

Task("frontend-developer", "UI-009: Add linked gifts section to Person modal.

Requirements:
- New tab 'Linked Entities' in Person modal
- Section: 'As Recipient ({count})'
- Section: 'As Purchaser ({count})'
- Each gift: mini card (48x48 image, title, price, status)
- 'Add Gift' button → opens GiftForm with person pre-selected
- Each mini card clickable → opens GiftModal

Files:
- apps/web/components/modals/PersonDetailModal.tsx
- apps/web/components/common/LinkedGiftsSection.tsx (new)
- apps/web/components/common/MiniGiftCard.tsx (new)

Acceptance:
- Both sections display correctly
- Add Gift works
- Navigation to GiftModal works
- Empty state handled")

Task("frontend-developer", "UI-011: Add recipients section to /occasions/{id} page.

Requirements:
- Section below Gift Lists: 'Recipients ({count})'
- Mini Person cards (avatar, name, relationship)
- Each card clickable → opens PersonModal
- Uses existing person_ids from occasion data

Files:
- apps/web/app/occasions/[id]/page.tsx
- apps/web/components/occasions/OccasionRecipientsSection.tsx (new)
- apps/web/components/common/MiniPersonCard.tsx (new or reuse)

Acceptance:
- Recipients display correctly
- Navigation works
- Empty state handled")

# Batch 2 (After Batch 1 completes)
Task("ui-engineer-enhanced", "UI-010: Add gift counts with tooltips to PersonCard.

Requirements:
- On PersonCard: 'Gifts: {recipient_count} / {purchaser_count}'
- Hover: MiniCardTooltip with list of gifts
- Max 5 visible, '+N more' link
- Each mini card clickable → opens GiftModal

Design Tokens:
- Tooltip container: #FFFFFF, border #E8E3DC
- Radius: 16px, shadow high
- Max-width: 280px
- Mini card gap: 8px
- '+N more': #E8846B, 12px

Files:
- apps/web/components/people/PersonCard.tsx
- apps/web/components/common/MiniCardTooltip.tsx (new)

Acceptance:
- Counts accurate
- Tooltip accessible (keyboard)
- Mobile: tap to show
- Navigation works")

Task("ui-engineer-enhanced", "UI-012: Add recipient count with tooltip to Occasion modal.

Requirements:
- On Overview tab: 'Recipients: {count}'
- Hover: MiniCardTooltip with list of persons
- Max 5 visible, '+N more' link
- Each mini card clickable → opens PersonModal

Files:
- apps/web/components/modals/OccasionDetailModal.tsx

Acceptance:
- Count accurate
- Tooltip accessible
- Navigation works")
```

---

## Overview

Enhance Person and Occasion views with linked entity displays and budget tracking.

**Why This Phase**: Provides visibility into Gift-Person relationships across the app.

**Scope**:
- IN: PersonBudgetBar, LinkedGiftsSection, MiniCardTooltip, OccasionRecipients
- OUT: Already done in earlier phases

---

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-1 | Budget bars display accurate data | Pending |
| SC-2 | Tooltips accessible (keyboard, screen reader) | Pending |
| SC-3 | Modal navigation works correctly | Pending |
| SC-4 | Mobile responsive | Pending |

---

## Tasks

| ID | Task | Status | Agent | Dependencies | Est | Notes |
|----|------|--------|-------|--------------|-----|-------|
| UI-008 | PersonBudgetBar | Pending | ui-engineer-enhanced | None | 3h | Uses budget API |
| UI-009 | Person linked gifts | Pending | frontend-developer | None | 3h | New tab in modal |
| UI-010 | Person card counts | Pending | ui-engineer-enhanced | UI-009 | 2h | Tooltip component |
| UI-011 | Occasion recipients | Pending | frontend-developer | None | 2h | Section on detail page |
| UI-012 | Occasion modal count | Pending | ui-engineer-enhanced | UI-011 | 1h | Reuses tooltip |

---

## Reusable Components

This phase creates several reusable components:

| Component | Used By | Purpose |
|-----------|---------|---------|
| MiniCardTooltip | PersonCard, OccasionModal | Hoverable entity list |
| MiniGiftCard | LinkedGiftsSection, Tooltip | Compact gift display |
| MiniPersonCard | OccasionRecipients, Tooltip | Compact person display |
| LinkedGiftsSection | PersonModal | Gifts as recipient/purchaser |

---

## Design Reference

See `/docs/designs/specs/planned-v1-components.md` for:
- PersonBudgetBar (2 variants)
- LinkedGiftsSection (with Add Gift)
- MiniCardTooltip (hover behavior)

---

## Next Session Agenda

### Immediate Actions
1. [ ] Wait for Phase 3 completion
2. [ ] Execute Batch 1: UI-008, UI-009, UI-011 in parallel
3. [ ] Execute Batch 2 after dependencies complete

---

## Phase Completion Checklist

After all tasks complete:
- [ ] All 10 requirements from planned-v1.md implemented
- [ ] No regressions in existing functionality
- [ ] Mobile responsive across all new components
- [ ] Accessibility (keyboard, screen reader) verified
- [ ] Performance acceptable (no jank in tooltips/modals)

---
