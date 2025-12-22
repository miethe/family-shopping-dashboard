---
# === CONTEXT FILE: GIFTS ACTION BAR V1 ===
# One-per-PRD context notes for AI agent handoffs

type: context
prd: "gifts-action-bar-v1"
created: "2025-12-22"
updated: "2025-12-22"
status: "active"

# Quick Stats
total_phases: 3
total_story_points: 42
estimated_duration: "2-3 weeks"
current_phase: 1

# Key Files for Implementation
key_files:
  prd: "docs/project_plans/PRDs/features/gifts-action-bar-v1.md"
  implementation_plan: "docs/project_plans/implementation_plans/features/gifts-action-bar-v1.md"
  phase_1: "docs/project_plans/implementation_plans/features/gifts-action-bar-v1/phase-1-backend.md"
  phase_2_5: "docs/project_plans/implementation_plans/features/gifts-action-bar-v1/phase-2-5-frontend.md"
  phase_6: "docs/project_plans/implementation_plans/features/gifts-action-bar-v1/phase-6-testing.md"

# Progress Tracking Files
progress_files:
  phase_1: ".claude/progress/gifts-action-bar-v1/phase-1-progress.md"
  phase_2_5: ".claude/progress/gifts-action-bar-v1/phase-2-5-progress.md"
  phase_6: ".claude/progress/gifts-action-bar-v1/phase-6-progress.md"

# Core Code Files
code_files:
  backend:
    - "services/api/app/models/gift.py"
    - "services/api/app/schemas/gift.py"
    - "services/api/alembic/versions/"
  frontend:
    - "apps/web/components/gifts/GiftCard.tsx"
    - "apps/web/components/gifts/LinkedEntityIcons.tsx"
    - "apps/web/hooks/useGifts.ts"
    - "apps/web/app/gifts/page.tsx"

# Team Assignments
primary_agents:
  phase_1: ["python-backend-engineer", "data-layer-expert"]
  phase_2_5: ["ui-engineer-enhanced", "frontend-developer"]
  phase_6: ["code-reviewer", "documentation-writer"]
---

# Gifts Action Bar v1 - Context Notes

> **For Session Handoffs**: This file provides essential context for continuing work on this PRD.

## Feature Summary

7 QoL enhancements to Gift cards on `/gifts` page:

1. **Status Selection Button** - One-click status changes (IDEA → SELECTED → PURCHASED → RECEIVED)
2. **+List Button** - Multi-select list assignment with "Create List" dialog
3. **Status Chip Filter** - Click status chip to filter page
4. **Person Avatar Filter** - Click avatar to filter by recipient
5. **List Badge Filter** - Click list badge to filter by list
6. **Clickable Price** - Edit price via popover dialog
7. **From Santa Toggle** - Mark gift as from Santa with icon display

## Architecture Overview

```
Backend (Phase 1)
├── Migration: Add from_santa BOOLEAN to gifts table
├── Model: Gift.from_santa field
└── Schemas: GiftCreate, GiftUpdate, GiftResponse

Frontend (Phases 2-5)
├── New Components:
│   ├── StatusButton.tsx
│   ├── ListPickerDropdown.tsx
│   └── PriceEditDialog.tsx
├── Modified:
│   ├── GiftCard.tsx (action bar integration)
│   ├── LinkedEntityIcons.tsx (clickable filters)
│   └── /gifts page.tsx (filter handling)
└── Hooks: useUpdateGift (existing)

Testing (Phase 6)
├── Unit: Component tests
├── Integration: Mutation tests
└── E2E: Full workflow test
```

## Critical Path

1. **Phase 1 must complete first** - Backend migration + schemas
2. **Batch 1 components can parallel** - StatusButton, ListPickerDropdown, PriceEditDialog, Santa toggle
3. **GiftCard integration depends on components**
4. **Filters depend on GiftCard integration**
5. **Testing can start as components complete**

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Status UI | Dropdown (not modal) | Faster workflow, stays on card |
| List assignment | Multi-select checkboxes | Multiple lists without reopening |
| Price edit | Popover (not modal) | Lightweight, contextual |
| Filters | URL query params | Shareable, browser back works |
| Real-time sync | React Query cache | No WebSocket needed (single-tenant) |
| Touch targets | 44px minimum | iOS HIG compliance |

## Common Gotchas

1. **Dropdown positioning** - Use Radix auto-positioning on mobile
2. **Optimistic updates** - Must rollback on mutation error
3. **Filter state** - Store in URL params, not component state
4. **Touch targets** - Check all buttons 44px on mobile
5. **Safe areas** - Test on iOS devices with notch

## Session Resume Checklist

When resuming work:

1. Read current phase progress file
2. Check YAML `tasks` section for pending work
3. Identify next batch to execute
4. Copy Task() commands from Orchestration Quick Reference
5. Update progress immediately after completing tasks

## Quick Reference: Start Phase Commands

```
# Start Phase 1
Task("python-backend-engineer", "Execute Phase 1 tasks for gifts-action-bar-v1.
Read: .claude/progress/gifts-action-bar-v1/phase-1-progress.md
Execute Batch 1 tasks, then Batch 2, then Batch 3.
Update progress file after each task completion.")

# Start Phase 2-5
Task("ui-engineer-enhanced", "Execute Phase 2-5 tasks for gifts-action-bar-v1.
Read: .claude/progress/gifts-action-bar-v1/phase-2-5-progress.md
Start with Batch 1 (parallel components).
Update progress file after each task completion.")

# Start Phase 6
Task("code-reviewer", "Execute Phase 6 testing tasks for gifts-action-bar-v1.
Read: .claude/progress/gifts-action-bar-v1/phase-6-progress.md
Start with Batch 1 (unit tests, integration tests, audits in parallel).
Update progress file after each task completion.")
```

## Notes Log

### 2025-12-22 - Initial Planning

- PRD created with 7 features across 6 original phases
- Implementation plan grouped into 3 phase files (1, 2-5, 6)
- Progress tracking files created for each phase group
- Total effort: 42 story points, 2-3 weeks estimated

---

*Add session notes below as work progresses*
