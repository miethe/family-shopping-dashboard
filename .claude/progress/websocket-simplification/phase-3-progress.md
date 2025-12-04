---
type: phase_progress
prd: websocket-simplification
phase: 3
title: "Phase 3: Infrastructure Cleanup"
status: pending
progress: 0%
estimated_hours: 2-2.5
assigned_to: ["refactoring-expert", "code-reviewer"]
dependencies: ["phase-1-progress.md", "phase-2-progress.md"]
created: 2025-12-03
updated: 2025-12-03
---

# Phase 3: Infrastructure Cleanup

**Status**: Pending (blocked until Phase 1 & 2 complete)
**Progress**: 0%
**Estimated Duration**: 2-2.5 hours
**Assigned Team**: refactoring-expert (tasks 3.1-3.3, 3.5), code-reviewer (task 3.4)
**Depends On**: Phase 1 & 2 completion

## Phase Overview

Remove dead code and simplify WebSocket infrastructure now that only Kanban board uses it. This includes cleaning up unused imports, simplifying the useRealtimeSync hook to be Kanban-only, removing unused types and event handlers, and verifying that WebSocketProvider is only truly needed for list items.

**Key Principle**: Reduce complexity from 1200+ lines of infrastructure to ~400 lines focused solely on Kanban board real-time updates.

---

## Orchestration Quick Reference

Copy-paste ready Task() commands for Phase 3. Tasks can be parallelized with careful sequencing (3.1-3.3 parallel, 3.4 parallel, 3.5 last).

```
Task("refactoring-expert", "TASK-3.1: Remove unused imports from data hooks
Files: apps/web/hooks/useGifts.ts, apps/web/hooks/useLists.ts,
       apps/web/hooks/usePersons.ts, apps/web/hooks/useOccasions.ts,
       apps/web/hooks/useIdeas.ts

Current State:
- These five hooks no longer use useRealtimeSync (removed in Phases 1-2)
- But their import statements may still be present
- Build may show 'unused variable' warnings

Required Changes:
1. Search each file for 'useRealtimeSync' import statement
2. Remove the entire import line if found
3. Save file (no other changes needed)

Acceptance Criteria:
✓ No import statement for useRealtimeSync in any of the 5 files
✓ Build succeeds: npm run build
✓ No unused import warnings
✓ TypeScript compilation succeeds
✓ Each file still compiles and exports its hook

Verification:
$ grep -r 'useRealtimeSync' apps/web/hooks/use*.ts
Should return no matches for these 5 files")
```

```
Task("refactoring-expert", "TASK-3.2: Simplify useRealtimeSync hook for Kanban only
File: apps/web/hooks/useRealtimeSync.ts

Current Implementation:
- Supports multiple topics (gifts, lists, persons, occasions, ideas, list-items)
- Handles various event types with different strategies
- Complex state management for multi-topic scenarios
- Only list-items topic is now actively used

Required Changes:
1. Identify which event handlers are actually used by useListItems
   - Look at how useListItems calls useRealtimeSync
   - Note the specific topic and event types it subscribes to
2. Simplify hook to focus only on that topic
3. Remove conditional logic for other topics
4. Remove event handlers not used by list-items
5. Keep the core WebSocket subscription logic (still needed by Kanban)

Acceptance Criteria:
✓ useRealtimeSync still works for useListItems hook
✓ Hook is 40-50% smaller (fewer lines of code)
✓ No unused variables or dead code paths
✓ Comments explain why this is Kanban-specific
✓ TypeScript compilation succeeds
✓ Build succeeds
✓ useListItems hook still gets real-time updates

Impact: Reduces complexity while keeping Kanban functionality")
```

```
Task("refactoring-expert", "TASK-3.3: Remove unused WebSocket types and helpers
Files: apps/web/lib/websocket/types.ts,
       apps/web/lib/websocket/*.ts (any helper files)

Current State:
- types.ts defines event types for all topics (gifts, lists, persons, occasions, ideas)
- Only list-items event types are used by useRealtimeSync now
- Extra event definitions take up space and mental overhead

Required Changes:
1. Identify which event types are imported by active code
   - Search for imports from websocket/types.ts
   - Note which event types are actually used
2. Create a deprecation marker or comment for unused types (don't delete yet)
3. Or: Move unused types to a separate 'unused-types.ts' file
4. Or: Delete unused types if confident they're not needed

Acceptance Criteria:
✓ Build succeeds: npm run build
✓ TypeScript shows no missing type references
✓ No unused export warnings
✓ List-item event types still available
✓ Can still build and run the app
✓ Kanban board real-time updates still work

Guidance: Be conservative—if unsure, leave it. Unused exports don't hurt.")
```

```
Task("code-reviewer", "TASK-3.4: Audit WebSocketProvider usage and necessity
File: apps/web/lib/websocket/WebSocketProvider.tsx

Current State:
- Provides WebSocket connection to entire app
- Used to be needed by multiple data hooks
- Now only needed by Kanban board (useListItems hook)

Required Task:
1. Search the entire codebase for where WebSocketProvider is rendered
   - grep -r 'WebSocketProvider' apps/web/
2. Search for where it's imported and used
3. Verify that useWebSocket hook (which consumes it) is only used by Kanban
4. Document findings in comments
5. Determine if provider can be simplified or if removal is safe

Acceptance Criteria:
✓ Audit is complete and documented
✓ No hidden usages of WebSocketProvider found
✓ Only Kanban board actually uses WebSocket connection
✓ Provider code is commented with findings
✓ Build succeeds
✓ No changes made yet (just audit, document findings)

Output: Write findings as comments in WebSocketProvider.tsx")
```

```
Task("refactoring-expert", "TASK-3.5: Delete dead code paths from WebSocket infrastructure
Files: apps/web/hooks/useRealtimeSync.ts, apps/web/lib/websocket/*.ts

Current State:
- Multi-topic subscription logic (gifts, lists, persons, occasions, ideas)
- Complex event routing strategies (added, updated, deleted, status_changed)
- Branching for fallback scenarios
- Error handling for multiple topics

Required Changes (after Tasks 3.1-3.4):
1. Remove if-branches that handle topics other than list-items
2. Remove event handlers for topics that are no longer subscribed
3. Remove fallback strategies that aren't needed
4. Delete commented-out code blocks
5. Simplify error handling (only for list-items topic)

Acceptance Criteria:
✓ No dead code branches
✓ No unused event handlers
✓ No commented-out code blocks
✓ Code is 30-40% smaller than Phase 3.2
✓ Build succeeds: npm run build
✓ Kanban board still works: real-time updates functional
✓ No TypeScript errors
✓ Code coverage unchanged (no functional changes)

Note: This task depends on 3.1-3.4 being complete
Use findings from 3.4 audit to guide what to delete")
```

---

## Task Breakdown

### TASK-3.1: Remove Unused Imports from Data Hooks

**Duration**: 30 minutes
**Status**: pending
**Assigned to**: refactoring-expert

| Aspect | Detail |
|--------|--------|
| **Files** | 5 hooks: useGifts, useLists, usePersons, useOccasions, useIdeas |
| **Change Type** | Import cleanup |
| **Scope** | Remove useRealtimeSync imports |
| **Complexity** | Very Low |
| **Risk** | None (simple deletion) |

**Detailed Acceptance Criteria**:

- [ ] useGifts.ts: No useRealtimeSync import
- [ ] useLists.ts: No useRealtimeSync import
- [ ] usePersons.ts: No useRealtimeSync import
- [ ] useOccasions.ts: No useRealtimeSync import
- [ ] useIdeas.ts: No useRealtimeSync import
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] No unused import warnings
- [ ] All hooks still export correctly

**What to Look For**:

```typescript
// These import lines should be REMOVED from each file:
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

// If this is the only import on that line, remove the entire line
// If there are other imports on same line, remove only useRealtimeSync
import { useQuery } from '@tanstack/react-query';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';  // Remove this
// becomes:
import { useQuery } from '@tanstack/react-query';
```

**Quality Gates**:

After removal, running the build should produce zero warnings about unused imports.

---

### TASK-3.2: Simplify useRealtimeSync Hook for Kanban Only

**Duration**: 30 minutes
**Status**: pending
**Assigned to**: refactoring-expert

| Aspect | Detail |
|--------|--------|
| **File** | `apps/web/hooks/useRealtimeSync.ts` |
| **Change Type** | Hook refactoring |
| **Scope** | Simplify to Kanban-only functionality |
| **Complexity** | Medium |
| **Risk** | Low (Kanban currently works) |

**Detailed Acceptance Criteria**:

- [ ] Hook still accepts topic, queryKey, events, enabled parameters
- [ ] useListItems hook still gets real-time updates (test this)
- [ ] Code is 40-50% smaller (measure before/after)
- [ ] No unused variables or parameters
- [ ] Comments explain Kanban-specific usage
- [ ] TypeScript strict mode passes
- [ ] Build succeeds
- [ ] No breaking changes to useListItems integration

**Technical Approach**:

1. **Analyze Current State**: Read useRealtimeSync.ts fully
2. **Find List-Items Usage**: Search for `useRealtimeSync({` and identify what list-items passes
3. **Identify Dead Code**: What event handlers, topics, conditions are only for gifts/lists/persons/etc?
4. **Simplify**:
   - Keep core WebSocket subscription logic
   - Keep only event handlers used by list-items
   - Remove topic-specific conditionals (gifts, lists, etc.)
   - Remove unused error handling branches
5. **Add Comments**: Explain why this is Kanban-specific now

**Expected Result**:

Before: 150+ lines of general-purpose real-time sync
After: 80-100 lines focused on list-items updates

---

### TASK-3.3: Remove Unused WebSocket Types and Helpers

**Duration**: 30 minutes
**Status**: pending
**Assigned to**: refactoring-expert

| Aspect | Detail |
|--------|--------|
| **Files** | `apps/web/lib/websocket/types.ts` and related helpers |
| **Change Type** | Type cleanup |
| **Scope** | Remove unused event types and helpers |
| **Complexity** | Low |
| **Risk** | Low (conservative approach: mark as deprecated if unsure) |

**Detailed Acceptance Criteria**:

- [ ] Identify which event types are imported and used
- [ ] Mark or comment unused types with deprecation notice (or delete if confident)
- [ ] List-items event types still available and working
- [ ] Build succeeds
- [ ] No TypeScript "unused export" warnings
- [ ] No missing type references
- [ ] Can still build the app successfully

**Conservative Approach** (recommended):

Instead of deleting, mark types as deprecated:

```typescript
/**
 * @deprecated No longer used. Gifts now sync via React Query staleTime.
 * Kept for reference until fully removed in future refactor.
 */
export type GiftWebSocketEvent = { ... };
```

This prevents accidental breakage while making intent clear.

**Quality Gates**:

- [ ] Build output has no type errors
- [ ] Kanban board real-time still works
- [ ] No TypeScript warnings

---

### TASK-3.4: Audit WebSocketProvider Usage and Necessity

**Duration**: 30 minutes
**Status**: pending
**Assigned to**: code-reviewer

| Aspect | Detail |
|--------|--------|
| **File** | `apps/web/lib/websocket/WebSocketProvider.tsx` |
| **Change Type** | Audit / Documentation |
| **Scope** | Verify provider usage, document findings |
| **Complexity** | Low |
| **Risk** | None (read-only audit) |

**Detailed Acceptance Criteria**:

- [ ] Codebase searched for WebSocketProvider imports
- [ ] All usages documented
- [ ] Verified that only Kanban board (useListItems) actually uses it
- [ ] Findings added as comments in WebSocketProvider.tsx
- [ ] Build still succeeds
- [ ] No changes made to functionality

**Search Strategy**:

```bash
# Find all WebSocketProvider imports and usages
grep -r 'WebSocketProvider' apps/web/

# Find all useWebSocket hook usages
grep -r 'useWebSocket' apps/web/

# These should only appear in Kanban/list-items related code
```

**Documentation Template** (add to WebSocketProvider.tsx):

```typescript
/**
 * WebSocket Provider for Real-Time Updates (Kanban Board Only)
 *
 * USAGE AUDIT (Phase 3):
 * - Used by: useListItems hook (Kanban drag-and-drop)
 * - Consumed by: useWebSocket() hook in real-time sync logic
 * - Required: YES (Kanban board requires instant updates)
 *
 * Other data hooks (gifts, lists, persons, occasions, ideas)
 * no longer use WebSocket. They rely on React Query cache
 * strategies and polling.
 *
 * This provider is minimal and can stay in place even though
 * it's only needed for one feature.
 */
```

---

### TASK-3.5: Delete Dead Code Paths from WebSocket Infrastructure

**Duration**: 30 minutes
**Status**: pending
**Assigned to**: refactoring-expert

| Aspect | Detail |
|--------|--------|
| **Files** | useRealtimeSync.ts, websocket library files |
| **Change Type** | Code cleanup |
| **Scope** | Delete dead branches, unused handlers |
| **Complexity** | Medium |
| **Risk** | Low (after Tasks 3.1-3.4 validation) |
| **Depends On** | Tasks 3.1, 3.2, 3.3, 3.4 |

**Detailed Acceptance Criteria**:

- [ ] No if-branches handling non-list-items topics
- [ ] No event handlers for unused topics
- [ ] No commented-out code blocks
- [ ] No unused error handling paths
- [ ] Code is 30-40% smaller than after Task 3.2
- [ ] Build succeeds
- [ ] Kanban board drag-and-drop works (real-time updates functional)
- [ ] No TypeScript errors
- [ ] No functional changes (behavior identical)

**What to Look For**:

Examples of dead code to delete:

```typescript
// REMOVE: Event handling for gifts topic (no longer used)
if (topic === 'gifts') {
  handleGiftEvent(event);
}

// REMOVE: Strategy for polling fallback (no longer needed)
const shouldUsePollingFallback = !isWebSocketConnected && topic !== 'list-items';
if (shouldUsePollingFallback) {
  // ... dead code
}

// REMOVE: Commented out old implementation
// const oldRealtimeSyncLogic = () => { ... };

// REMOVE: Unused error handler
const onUnusedError = (error) => { ... };
```

**Safe Deletion Checklist**:

- [ ] grep confirms code is not referenced elsewhere
- [ ] Task 3.4 audit confirms this code is unused
- [ ] Code has no side effects (not just calculating, but unused)
- [ ] No CSS/styling that depends on deleted elements

---

## Quality Checklist (All Tasks)

After completing all Phase 3 tasks, verify:

### Code Quality
- [ ] All 5 data hooks have no useRealtimeSync imports
- [ ] useRealtimeSync hook simplified to Kanban-only
- [ ] No unused variables or parameters
- [ ] No dead code branches
- [ ] No commented-out code
- [ ] TypeScript strict mode passes
- [ ] No TypeScript warnings

### Build Quality
- [ ] Build succeeds: `npm run build`
- [ ] No unused import warnings
- [ ] No unused export warnings
- [ ] No type errors
- [ ] Bundle size unchanged (cleanup doesn't reduce bundle much)

### Functional Quality
- [ ] Kanban board drag-and-drop works
- [ ] Real-time updates on list items still work
- [ ] useListItems hook unaffected
- [ ] WebSocket connection still established
- [ ] No new console errors

### Integration Quality
- [ ] App starts: `npm run dev`
- [ ] All pages load correctly
- [ ] No breaking changes to hooks
- [ ] WebSocket connection still works for Kanban
- [ ] Can be deployed without issues

---

## Phase 3 Parallelization Strategy

**Can run in parallel**:
- TASK-3.1: Import cleanup (independent)
- TASK-3.2: Simplify useRealtimeSync (depends on 3.1 conceptually, but not code-dependent)
- TASK-3.3: Remove unused types (independent)
- TASK-3.4: Audit WebSocketProvider (independent)

**Must run sequentially**:
- TASK-3.5: Delete dead code (depends on findings from 3.1-3.4)

**Recommended Order**:
1. Run TASK-3.1, 3.2, 3.3, 3.4 in parallel (or assign to different team members)
2. Wait for all to complete
3. Run TASK-3.5 (based on findings from all previous tasks)

**Estimated Timeline**:
- Parallel execution: ~30 min (TASK-3.1-3.4 simultaneous)
- Sequential cleanup: ~30 min (TASK-3.5)
- Total: 1-1.5 hours (vs 2.5 hours if sequential)

---

## Deliverables

### Files Modified (6-8 total)

**Import Cleanup (TASK-3.1)**:
1. `apps/web/hooks/useGifts.ts`
2. `apps/web/hooks/useLists.ts`
3. `apps/web/hooks/usePersons.ts`
4. `apps/web/hooks/useOccasions.ts`
5. `apps/web/hooks/useIdeas.ts`

**Infrastructure Simplification (TASK-3.2-3.5)**:
6. `apps/web/hooks/useRealtimeSync.ts` - Simplified for Kanban only
7. `apps/web/lib/websocket/types.ts` - Unused types marked/removed
8. `apps/web/lib/websocket/WebSocketProvider.tsx` - Commented with audit findings

### Commit Message

After all Phase 3 tasks complete, create commit:

```
refactor(web): simplify websocket infrastructure for kanban-only usage

Remove unused WebSocket-related code now that only Kanban board (useListItems)
actively uses real-time synchronization. Phase 1-2 removed WebSocket from
data hooks; Phase 3 cleans up the infrastructure.

Changes:
- Remove useRealtimeSync imports from 5 data hooks
- Simplify useRealtimeSync hook to Kanban-specific logic
- Mark/remove unused WebSocket event types
- Delete dead code branches for unused topics
- Document WebSocketProvider audit findings

Infrastructure size reduction: ~800 lines → ~400 lines (50% reduction)
Code clarity: Kanban-specific purpose now explicit

Kanban board drag-and-drop and real-time updates remain functional and fast.

This is Phase 3 of websocket-simplification refactor.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Progress Tracking

| Task | Status | Assigned | Estimate | Completed |
|------|--------|----------|----------|-----------|
| TASK-3.1: Import cleanup | pending | refactoring-expert | 30 min | - |
| TASK-3.2: Simplify hook | pending | refactoring-expert | 30 min | - |
| TASK-3.3: Remove types | pending | refactoring-expert | 30 min | - |
| TASK-3.4: Audit provider | pending | code-reviewer | 30 min | - |
| TASK-3.5: Delete dead code | pending | refactoring-expert | 30 min | - |
| **Phase 3 Total** | **pending** | **refactoring-expert, code-reviewer** | **1.5-2 hours** | **0%** |

---

## Context for AI Agents

### What This Phase Accomplishes

Cleans up the technical debt created by WebSocket infrastructure that was once needed across the app but is now only needed for Kanban board. This phase doesn't change any functional behavior; it's pure refactoring to improve code clarity and maintainability.

### Key Principle

By Phase 3, all data hooks (Phases 1-2) have been migrated away from WebSocket. This phase removes the now-unused WebSocket code that was left behind, reducing the codebase's complexity and making it clear that WebSockets are Kanban-specific.

### Critical Success Factor

**Kanban Board Must Still Work**: The Kanban board's drag-and-drop and real-time updates MUST continue to work perfectly. This phase is cleanup only; it must not affect Kanban functionality.

### Success Indicators

✓ Phase 3 complete when:
1. All 5 tasks marked complete
2. No useRealtimeSync imports in data hooks
3. useRealtimeSync hook is simplified
4. Dead code is deleted
5. Build succeeds with no warnings
6. Kanban board still works perfectly
7. Changes committed to feat/ui-overhaul branch

✓ Ready for Phase 4 when:
1. Phase 3 complete
2. Code review approved
3. Build verified successful

---

## Related Documentation

- **Full PRD**: `/docs/project_plans/implementation_plans/refactors/websocket-simplification-v1.md`
- **Phase 1 Progress**: `.claude/progress/websocket-simplification/phase-1-progress.md`
- **Phase 2 Progress**: `.claude/progress/websocket-simplification/phase-2-progress.md`
- **Phase 4 Progress**: `.claude/progress/websocket-simplification/phase-4-progress.md` (after Phase 3 complete)

---

**Last Updated**: 2025-12-03
**Status**: Draft - Ready for Deployment (after Phase 1 & 2 complete)
