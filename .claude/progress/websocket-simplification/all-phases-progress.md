---
type: progress
prd: websocket-simplification
project: "Remove unnecessary WebSocket sync, keep only for Kanban board"
status: pending
progress: 0
total_tasks: 17
completed_tasks: 0
phases_total: 5
phases_complete: 0

timeline:
  phase_1_duration: "2-3 hours"
  phase_2_duration: "0.5 hours"
  phase_3_duration: "2-2.5 hours"
  phase_4_duration: "3 hours"
  phase_5_duration: "1-1.5 hours"
  total_effort: "9-12 hours"
  critical_path: "Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5"

tasks:
  # Phase 1: Data Hooks Simplification
  - id: "TASK-1.1"
    name: "Remove WebSocket from useGifts"
    status: pending
    assigned_to: ["ui-engineer"]
    dependencies: []
    file: "apps/web/hooks/useGifts.ts"
    priority: high
    estimate: "30 min"

  - id: "TASK-1.2"
    name: "Remove WebSocket from useLists"
    status: pending
    assigned_to: ["ui-engineer"]
    dependencies: []
    file: "apps/web/hooks/useLists.ts"
    priority: high
    estimate: "30 min"

  - id: "TASK-1.3"
    name: "Remove WebSocket from usePersons"
    status: pending
    assigned_to: ["ui-engineer"]
    dependencies: []
    file: "apps/web/hooks/usePersons.ts"
    priority: high
    estimate: "30 min"

  - id: "TASK-1.4"
    name: "Remove WebSocket from useOccasions"
    status: pending
    assigned_to: ["ui-engineer"]
    dependencies: []
    file: "apps/web/hooks/useOccasions.ts"
    priority: high
    estimate: "30 min"

  # Phase 2: Activity Layer Downgrade
  - id: "TASK-2.1"
    name: "Replace WebSocket with polling in useIdeas"
    status: pending
    assigned_to: ["ui-engineer"]
    dependencies: ["TASK-1.1", "TASK-1.2", "TASK-1.3", "TASK-1.4"]
    file: "apps/web/hooks/useIdeas.ts"
    priority: high
    estimate: "30 min"

  # Phase 3: Infrastructure Cleanup
  - id: "TASK-3.1"
    name: "Remove unused imports from data hooks"
    status: pending
    assigned_to: ["refactoring-expert"]
    dependencies: ["TASK-2.1"]
    file: "apps/web/hooks/*.ts"
    priority: medium
    estimate: "30 min"

  - id: "TASK-3.2"
    name: "Simplify useRealtimeSync hook"
    status: pending
    assigned_to: ["refactoring-expert"]
    dependencies: ["TASK-2.1"]
    file: "apps/web/hooks/useRealtimeSync.ts"
    priority: medium
    estimate: "30 min"

  - id: "TASK-3.3"
    name: "Remove unused WebSocket types & helpers"
    status: pending
    assigned_to: ["refactoring-expert"]
    dependencies: ["TASK-2.1"]
    file: "apps/web/lib/websocket/types.ts"
    priority: medium
    estimate: "30 min"

  - id: "TASK-3.4"
    name: "Audit WebSocketProvider usage"
    status: pending
    assigned_to: ["code-reviewer"]
    dependencies: ["TASK-2.1"]
    file: "apps/web/lib/websocket/WebSocketProvider.tsx"
    priority: medium
    estimate: "30 min"

  - id: "TASK-3.5"
    name: "Delete dead code paths"
    status: pending
    assigned_to: ["refactoring-expert"]
    dependencies: ["TASK-3.1", "TASK-3.2", "TASK-3.3", "TASK-3.4"]
    file: "apps/web/"
    priority: medium
    estimate: "30 min"

  # Phase 4: Testing & Validation
  - id: "TASK-4.1"
    name: "Test /gifts page"
    status: pending
    assigned_to: ["code-reviewer"]
    dependencies: ["TASK-3.5"]
    priority: high
    estimate: "20 min"

  - id: "TASK-4.2"
    name: "Test /lists page"
    status: pending
    assigned_to: ["code-reviewer"]
    dependencies: ["TASK-3.5"]
    priority: high
    estimate: "20 min"

  - id: "TASK-4.3"
    name: "Test /lists/[id] Kanban board drag-and-drop"
    status: pending
    assigned_to: ["code-reviewer"]
    dependencies: ["TASK-3.5"]
    priority: critical
    estimate: "30 min"

  - id: "TASK-4.4"
    name: "Test /people page"
    status: pending
    assigned_to: ["code-reviewer"]
    dependencies: ["TASK-3.5"]
    priority: high
    estimate: "20 min"

  - id: "TASK-4.5"
    name: "Test /occasions page"
    status: pending
    assigned_to: ["code-reviewer"]
    dependencies: ["TASK-3.5"]
    priority: high
    estimate: "20 min"

  - id: "TASK-4.6"
    name: "Test /dashboard idea inbox polling"
    status: pending
    assigned_to: ["code-reviewer"]
    dependencies: ["TASK-3.5"]
    priority: high
    estimate: "30 min"

  - id: "TASK-4.7"
    name: "Browser console check - no WebSocket errors"
    status: pending
    assigned_to: ["code-reviewer"]
    dependencies: ["TASK-4.1", "TASK-4.2", "TASK-4.3", "TASK-4.4", "TASK-4.5", "TASK-4.6"]
    priority: high
    estimate: "20 min"

  - id: "TASK-4.8"
    name: "Graceful degradation - app works without WebSocket"
    status: pending
    assigned_to: ["code-reviewer"]
    dependencies: ["TASK-4.1", "TASK-4.2", "TASK-4.3", "TASK-4.4", "TASK-4.5", "TASK-4.6"]
    priority: high
    estimate: "30 min"

  - id: "TASK-4.9"
    name: "Performance validation - no regressions"
    status: pending
    assigned_to: ["task-completion-validator"]
    dependencies: ["TASK-4.1", "TASK-4.2", "TASK-4.3", "TASK-4.4", "TASK-4.5", "TASK-4.6"]
    priority: high
    estimate: "20 min"

  # Phase 5: Documentation Updates
  - id: "TASK-5.1"
    name: "Update websockets.md guide"
    status: pending
    assigned_to: ["documentation-writer"]
    dependencies: ["TASK-4.9"]
    file: "docs/guides/websockets.md"
    priority: medium
    estimate: "30 min"

  - id: "TASK-5.2"
    name: "Update CLAUDE.md real-time section"
    status: pending
    assigned_to: ["documentation-writer"]
    dependencies: ["TASK-4.9"]
    file: "CLAUDE.md"
    priority: medium
    estimate: "20 min"

  - id: "TASK-5.3"
    name: "Create architecture decision ADR"
    status: pending
    assigned_to: ["documentation-writer"]
    dependencies: ["TASK-4.9"]
    file: "docs/architecture/ADRs/websocket-selective-usage.md"
    priority: medium
    estimate: "20 min"

  - id: "TASK-5.4"
    name: "Add code comments explaining changes"
    status: pending
    assigned_to: ["documentation-writer"]
    dependencies: ["TASK-4.9"]
    file: "apps/web/"
    priority: low
    estimate: "10 min"

parallelization:
  phase_1:
    description: "Data hooks - all independent, can run in parallel"
    batches:
      batch_1: ["TASK-1.1", "TASK-1.2", "TASK-1.3", "TASK-1.4"]

  phase_2:
    description: "Activity layer - depends on Phase 1"
    batches:
      batch_1: ["TASK-2.1"]

  phase_3:
    description: "Infrastructure cleanup - some can run in parallel after Phase 2"
    batches:
      batch_1: ["TASK-3.1", "TASK-3.2", "TASK-3.3", "TASK-3.4"]
      batch_2: ["TASK-3.5"]

  phase_4:
    description: "Testing - most can run in parallel"
    batches:
      batch_1: ["TASK-4.1", "TASK-4.2", "TASK-4.3", "TASK-4.4", "TASK-4.5", "TASK-4.6"]
      batch_2: ["TASK-4.7", "TASK-4.8", "TASK-4.9"]

  phase_5:
    description: "Documentation - can run in parallel"
    batches:
      batch_1: ["TASK-5.1", "TASK-5.2", "TASK-5.3", "TASK-5.4"]

success_criteria:
  - "All pages render and fetch data correctly"
  - "Kanban board drag-and-drop instant and smooth"
  - "Zero WebSocket errors in browser console"
  - "App works without WebSocket server running"
  - "60%+ reduction in WebSocket-related code"
  - "No performance regressions"
  - "Documentation updated and accurate"

blockers: []
notes: ""
---

# WebSocket Simplification - Progress Tracking

## Overview

Removing WebSocket sync from read-heavy pages (gifts, lists, people, occasions) while keeping it for Kanban board where true simultaneous editing occurs.

**Implementation Plan**: `/docs/project_plans/implementation_plans/refactors/websocket-simplification-v1.md`

---

## Phase 1: Data Hooks Simplification

**Status**: PENDING
**Effort**: 2-3 hours
**Assigned**: ui-engineer

Remove `useRealtimeSync` from 4 data hooks, add React Query `staleTime`:

### Orchestration Quick Reference

```bash
# Execute all Phase 1 tasks in parallel
Task("ui-engineer", "TASK-1.1: Remove WebSocket from useGifts.ts - add staleTime: 5min")
Task("ui-engineer", "TASK-1.2: Remove WebSocket from useLists.ts - add staleTime: 10min")
Task("ui-engineer", "TASK-1.3: Remove WebSocket from usePersons.ts - add staleTime: 30min")
Task("ui-engineer", "TASK-1.4: Remove WebSocket from useOccasions.ts - add staleTime: 30min")
```

**Success When**: All 4 hooks compile, no `useRealtimeSync` imports, `staleTime` configured

---

## Phase 2: Activity Layer Downgrade

**Status**: PENDING
**Effort**: 0.5 hours
**Assigned**: ui-engineer
**Depends On**: Phase 1 complete

Enable polling as primary sync method in useIdeas:

### Orchestration Quick Reference

```bash
Task("ui-engineer", "TASK-2.1: Replace WebSocket with polling in useIdeas.ts - polling interval 30s")
```

**Success When**: useIdeas hook compiles, no `useRealtimeSync` call, polling enabled always

---

## Phase 3: Infrastructure Cleanup

**Status**: PENDING
**Effort**: 2-2.5 hours
**Assigned**: refactoring-expert, code-reviewer
**Depends On**: Phase 2 complete

Simplify WebSocket infrastructure for Kanban-only usage:

### Orchestration Quick Reference

```bash
# Batch 1: Parallel cleanup tasks
Task("refactoring-expert", "TASK-3.1: Remove unused imports from data hooks")
Task("refactoring-expert", "TASK-3.2: Simplify useRealtimeSync for Kanban only")
Task("refactoring-expert", "TASK-3.3: Remove unused WebSocket types")
Task("code-reviewer", "TASK-3.4: Audit WebSocketProvider usage")

# Batch 2: Final cleanup (after batch 1 complete)
Task("refactoring-expert", "TASK-3.5: Delete dead code paths")
```

**Success When**: Build passes, zero unused imports, WebSocket code 60% smaller

---

## Phase 4: Testing & Validation

**Status**: PENDING
**Effort**: 3 hours
**Assigned**: code-reviewer, task-completion-validator
**Depends On**: Phase 3 complete

Validate all pages work correctly:

### Orchestration Quick Reference

```bash
# Batch 1: Page validation (parallel)
Task("code-reviewer", "TASK-4.1: Test /gifts page loads, search works, no WS errors")
Task("code-reviewer", "TASK-4.2: Test /lists page loads, lists display, no WS errors")
Task("code-reviewer", "TASK-4.3: Test Kanban drag-and-drop instant, WebSocket active")
Task("code-reviewer", "TASK-4.4: Test /people page loads, display correct, no WS errors")
Task("code-reviewer", "TASK-4.5: Test /occasions page loads, display correct, no WS errors")
Task("code-reviewer", "TASK-4.6: Test /dashboard stats load, idea inbox polls every 30s")

# Batch 2: Validation (after batch 1 complete)
Task("code-reviewer", "TASK-4.7: Browser console check - zero WebSocket errors")
Task("code-reviewer", "TASK-4.8: Disconnect WebSocket - app works without it")
Task("task-completion-validator", "TASK-4.9: Performance validation - no regressions")
```

**Success When**: All pages render correctly, Kanban smooth, zero console errors, app works offline

---

## Phase 5: Documentation Updates

**Status**: PENDING
**Effort**: 1-1.5 hours
**Assigned**: documentation-writer
**Depends On**: Phase 4 complete

Update guides and architecture docs:

### Orchestration Quick Reference

```bash
# All can run in parallel
Task("documentation-writer", "TASK-5.1: Update websockets.md - clarify Kanban-only usage")
Task("documentation-writer", "TASK-5.2: Update CLAUDE.md - update real-time section")
Task("documentation-writer", "TASK-5.3: Create ADR - websocket-selective-usage decision")
Task("documentation-writer", "TASK-5.4: Add code comments - explain polling/staleTime")
```

**Success When**: All docs updated, no broken links, ADR explains decisions

---

## Summary Table

| Phase | Title | Status | Effort | Tasks | Blocker | Next |
|-------|-------|--------|--------|-------|---------|------|
| 1 | Data Hooks | PENDING | 2-3h | 4 | None | Phase 2 |
| 2 | Activity Layer | PENDING | 0.5h | 1 | Phase 1 | Phase 3 |
| 3 | Infrastructure | PENDING | 2-2.5h | 5 | Phase 2 | Phase 4 |
| 4 | Testing | PENDING | 3h | 9 | Phase 3 | Phase 5 |
| 5 | Documentation | PENDING | 1-1.5h | 4 | Phase 4 | COMPLETE |

**Total Effort**: 9-12 hours
**Critical Path**: Phase 1 → 2 → 3 → 4 → 5

---

## Key Files Modified

| File | Phase | Change |
|------|-------|--------|
| `useGifts.ts` | 1 | Remove WebSocket, add staleTime |
| `useLists.ts` | 1 | Remove WebSocket, add staleTime |
| `usePersons.ts` | 1 | Remove WebSocket, add staleTime |
| `useOccasions.ts` | 1 | Remove WebSocket, add staleTime |
| `useIdeas.ts` | 2 | Replace WebSocket with polling |
| `useRealtimeSync.ts` | 3 | Simplify for Kanban only |
| `websockets.md` | 5 | Update guide |
| `CLAUDE.md` | 5 | Update real-time section |

---

## Commits

1. **Phase 1**: `refactor(web): remove websocket from data hooks (gifts, lists, persons, occasions)`
2. **Phase 2**: `refactor(web): replace websocket with polling in useIdeas`
3. **Phase 3**: `refactor(web): simplify websocket infrastructure for kanban-only usage`
4. **Phase 4**: `test(web): validate websocket simplification across all pages`
5. **Phase 5**: `docs: update architecture for kanban-only websockets`

---

## Notes

- Kanban board (useListItems) NOT modified - keeps WebSocket for true collaboration
- All changes backward compatible - no API changes
- Easy rollback per hook if issues appear
- WebSocket server still runs for Kanban, just unused elsewhere
