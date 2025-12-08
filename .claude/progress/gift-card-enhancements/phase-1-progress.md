---
type: progress
prd: "gift-card-enhancements"
phase: 1
title: "Gift Card UI Enhancements"
status: "in_progress"
started: "2025-12-08"
completed: null

overall_progress: 10
completion_estimate: "on-track"

total_tasks: 6
completed_tasks: 0
in_progress_tasks: 2
blocked_tasks: 0
at_risk_tasks: 0

owners: ["ui-engineer-enhanced"]
contributors: ["python-backend-engineer", "frontend-developer"]

tasks:
  - id: "TASK-1.1"
    description: "Extend Gift API with list relationship data"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: []
    estimated_effort: "2h"
    priority: "high"

  - id: "TASK-1.2"
    description: "Create LinkedEntityIcons component"
    status: "in_progress"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "2h"
    priority: "high"

  - id: "TASK-1.3"
    description: "Create QuickPurchaseButton component"
    status: "in_progress"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "2h"
    priority: "high"

  - id: "TASK-1.4"
    description: "Integrate new components into GiftCard"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-1.2", "TASK-1.3"]
    estimated_effort: "2h"
    priority: "high"

  - id: "TASK-1.5"
    description: "Update gifts page data flow"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: ["TASK-1.1"]
    estimated_effort: "1h"
    priority: "medium"

  - id: "TASK-1.6"
    description: "Add unit tests for new components"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-1.4"]
    estimated_effort: "1h"
    priority: "medium"

parallelization:
  batch_1: ["TASK-1.1", "TASK-1.2", "TASK-1.3"]
  batch_2: ["TASK-1.4", "TASK-1.5"]
  batch_3: ["TASK-1.6"]
  critical_path: ["TASK-1.2", "TASK-1.4", "TASK-1.6"]
  estimated_total_time: "6h"

blockers: []

success_criteria:
  - id: "SC-1"
    description: "Linked entity icons visible on gift cards"
    status: "pending"
  - id: "SC-2"
    description: "Quick purchase button functional"
    status: "pending"
  - id: "SC-3"
    description: "External link icon visible on mobile"
    status: "pending"
  - id: "SC-4"
    description: "All touch targets 44px minimum"
    status: "pending"

files_modified:
  - "apps/web/components/gifts/LinkedEntityIcons.tsx"
  - "apps/web/components/gifts/QuickPurchaseButton.tsx"
  - "apps/web/components/gifts/GiftCard.tsx"
  - "apps/web/components/gifts/index.ts"
  - "services/api/app/schemas/gift.py"
  - "apps/web/types/index.ts"
---

# Gift Card Enhancements - Phase 1: UI Enhancements

**Phase**: 1 of 1
**Status**: 🔄 In Progress (10% complete)
**Duration**: Started 2025-12-08, estimated completion 2025-12-08
**Owner**: ui-engineer-enhanced
**Contributors**: python-backend-engineer, frontend-developer

---

## Orchestration Quick Reference

> **For Orchestration Agents**: Use this section to delegate tasks without reading the full file.

### Parallelization Strategy

**Batch 1** (Parallel - No Dependencies):
- TASK-1.1 → `python-backend-engineer` (2h) - Extend Gift API
- TASK-1.2 → `ui-engineer-enhanced` (2h) - LinkedEntityIcons component
- TASK-1.3 → `ui-engineer-enhanced` (2h) - QuickPurchaseButton component

**Batch 2** (Sequential - Depends on Batch 1):
- TASK-1.4 → `ui-engineer-enhanced` (2h) - **Blocked by**: TASK-1.2, TASK-1.3
- TASK-1.5 → `frontend-developer` (1h) - **Blocked by**: TASK-1.1

**Batch 3** (Sequential - Depends on Batch 2):
- TASK-1.6 → `ui-engineer-enhanced` (1h) - **Blocked by**: TASK-1.4

**Critical Path**: TASK-1.2 → TASK-1.4 → TASK-1.6 (5h total)

### Task Delegation Commands

```bash
# Batch 1 (Launch in parallel)
Task("python-backend-engineer", "TASK-1.1: Extend GiftResponse schema to include list_items array with list_id, list_name, and status for each list containing this gift. Update repository query to join with list_items and lists tables. Update service layer to map the data.")

Task("ui-engineer-enhanced", "TASK-1.2: Create LinkedEntityIcons component at apps/web/components/gifts/LinkedEntityIcons.tsx. Show recipient icons (Avatar or User icon) and list icons (ListChecks) with tooltips. Support maxVisible prop (default 3), +N more indicator, and onClick handlers for modal navigation. Follow Soft Modernity design: warm colors, 44px touch targets, 8px/full radii.")

Task("ui-engineer-enhanced", "TASK-1.3: Create QuickPurchaseButton component at apps/web/components/gifts/QuickPurchaseButton.tsx. Small icon button (ShoppingCart/CheckCircle) to mark gift as purchased. Handle single-list vs multi-list cases with dropdown. Use success color #7BA676 for purchased state. Include loading, disabled states.")

# Batch 2 (After Batch 1 completes)
Task("ui-engineer-enhanced", "TASK-1.4: Update GiftCard.tsx to integrate LinkedEntityIcons (below title) and QuickPurchaseButton (bottom right). Make external link icon visible on mobile. Maintain mobile-first layout with proper spacing.")

Task("frontend-developer", "TASK-1.5: Update gifts page and useGifts hook to include list relationship data. Ensure person names are available for tooltip display. Wire up modal handlers for entity navigation.")

# Batch 3 (After Batch 2 completes)
Task("ui-engineer-enhanced", "TASK-1.6: Add unit tests for LinkedEntityIcons and QuickPurchaseButton components. Test various recipient/list counts, tooltips, click handlers, and loading states.")
```

---

## Overview

Enhance the GiftCard component on the /gifts page (Grid View) with three improvements:
1. **Linked Entity Icons** - Small icons showing Recipient(s) and List(s) with tooltips and clickable navigation
2. **Quick Mark as Purchased Button** - Small button to mark gift as purchased without opening modal
3. **External Link Icon** - Visible icon on both mobile and desktop to open Product URL

**Why This Phase**: Users need at-a-glance visibility into gift relationships and faster actions without opening detail modals.

**Scope**:
- IN: GiftCard component enhancements, new sub-components
- OUT: Backend status change logic (using existing mutations), modal changes

---

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-1 | Linked entity icons visible on gift cards | ⏳ Pending |
| SC-2 | Quick purchase button functional | ⏳ Pending |
| SC-3 | External link icon visible on mobile | ⏳ Pending |
| SC-4 | All touch targets 44px minimum | ⏳ Pending |

---

## Tasks

| ID | Task | Status | Agent | Dependencies | Est | Notes |
|----|------|--------|-------|--------------|-----|-------|
| TASK-1.1 | Extend Gift API with list data | ⏳ | python-backend-engineer | None | 2h | Add list_items to response |
| TASK-1.2 | Create LinkedEntityIcons | 🔄 | ui-engineer-enhanced | None | 2h | Background agent running |
| TASK-1.3 | Create QuickPurchaseButton | 🔄 | ui-engineer-enhanced | None | 2h | Background agent running |
| TASK-1.4 | Integrate into GiftCard | ⏳ | ui-engineer-enhanced | 1.2, 1.3 | 2h | Layout changes |
| TASK-1.5 | Update gifts page data flow | ⏳ | frontend-developer | 1.1 | 1h | Hook and type updates |
| TASK-1.6 | Add unit tests | ⏳ | ui-engineer-enhanced | 1.4 | 1h | New component tests |

**Status Legend**:
- `⏳` Not Started (Pending)
- `🔄` In Progress
- `✓` Complete
- `🚫` Blocked
- `⚠️` At Risk

---

## Architecture Context

### Current State

GiftCard displays image, title, status, price, and assignee avatar. Quick actions exist for desktop (external link, assign recipient) but mobile uses overflow menu.

**Key Files**:
- `apps/web/components/gifts/GiftCard.tsx` - Current implementation
- `apps/web/types/index.ts` - Gift interface (has person_ids)
- `services/api/app/schemas/gift.py` - GiftResponse schema

### Reference Patterns

**Similar Features**:
- PersonDropdown component shows how to handle entity selection
- StatusSelector shows inline status change pattern
- Tooltip component used throughout for hover hints

---

## Implementation Details

### Technical Approach

1. **Backend**: Extend GiftResponse to include list relationship data (list_id, list_name, status)
2. **LinkedEntityIcons**: Create compact row of clickable icons with tooltips
3. **QuickPurchaseButton**: Create action button that updates list_item status
4. **Integration**: Add components to GiftCard layout, maintain responsive design

### Known Gotchas

- Gift can be in multiple lists - QuickPurchaseButton needs dropdown for selection
- Touch targets must be 44px even for small icons (larger hit area)
- Mobile layout is tight - icons must be compact visually

### Development Setup

No special setup required - standard Next.js development environment.

---

## Blockers

### Active Blockers

None currently.

### Resolved Blockers

N/A (phase just started)

---

## Dependencies

### External Dependencies

- None - self-contained feature enhancement

### Internal Integration Points

- **GiftCard** receives Gift object from parent (GiftGrid or GiftGroupedView)
- **useUpdateGift** and **useUpdateListItem** hooks for mutations
- **useEntityModal** hook for opening Person/List modals

---

## Testing Strategy

| Test Type | Scope | Coverage | Status |
|-----------|-------|----------|--------|
| Unit | LinkedEntityIcons, QuickPurchaseButton | 80%+ | ⏳ |
| Integration | GiftCard with new components | Core flows | ⏳ |
| Visual | Layout on mobile/desktop | Responsive | ⏳ |

---

## Next Session Agenda

### Immediate Actions (Next Session)
1. [ ] Retrieve background agent results for TASK-1.2 and TASK-1.3
2. [ ] Review generated components and iterate if needed
3. [ ] Start TASK-1.4 integration work

### Context for Continuing Agent

Two background agents were launched for LinkedEntityIcons (e805f59f) and QuickPurchaseButton (6c08e4eb). Check their outputs before proceeding with integration.

---

## Session Notes

### 2025-12-08

**Completed**:
- Created implementation plan at `docs/project_plans/implementation_plans/enhancements/gift-card-enhancements-v1.md`
- Created progress tracking file
- Launched background agents for TASK-1.2 and TASK-1.3

**In Progress**:
- TASK-1.2: LinkedEntityIcons component (background agent)
- TASK-1.3: QuickPurchaseButton component (background agent)

**Next Session**:
- Retrieve agent outputs and review components
- Integrate into GiftCard

---

## Additional Resources

- **Feature Request**: `docs/project_plans/requests/12-8-v2.md`
- **Implementation Plan**: `docs/project_plans/implementation_plans/enhancements/gift-card-enhancements-v1.md`
- **Design System**: `.claude/skills/frontend-design/SKILL.md`
