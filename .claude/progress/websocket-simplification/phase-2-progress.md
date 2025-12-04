---
type: phase_progress
prd: websocket-simplification
phase: 2
title: "Phase 2: Activity Layer Downgrade"
status: pending
progress: 0%
estimated_hours: 0.5-1
assigned_to: ["ui-engineer"]
dependencies: ["phase-1-progress.md"]
created: 2025-12-03
updated: 2025-12-03
---

# Phase 2: Activity Layer Downgrade

**Status**: Pending (blocked until Phase 1 complete)
**Progress**: 0%
**Estimated Duration**: 30 minutes - 1 hour
**Assigned Team**: ui-engineer
**Depends On**: Phase 1 completion

## Phase Overview

Replace WebSocket subscription with polling as the primary data fetch strategy in useIdeas hook. The hook already has polling infrastructure (usePollingFallback); we're upgrading it from fallback-only to primary strategy.

**Key Principle**: Activity feed (idea inbox) doesn't require real-time updates. 30-second polling provides sufficient freshness while eliminating WebSocket dependency for this feature.

---

## Orchestration Quick Reference

Copy-paste ready Task() command for Phase 2.

```
Task("ui-engineer", "TASK-2.1: Replace WebSocket with polling in useIdeas hook
File: apps/web/hooks/useIdeas.ts

Current Implementation (to replace):
- Hook uses useRealtimeSync() with topic 'ideas:inbox'
- Subscribes to ADDED, UPDATED, DELETED events
- Has usePollingFallback() but only for fallback (when WS down)
- Polling is treated as last-resort, not primary strategy

Required Changes:
1. Remove the useRealtimeSync() call entirely
2. Modify usePollingFallback() to always be enabled (not conditional on WS failure)
3. Ensure polling interval is set to 30000ms (30 seconds)
4. Remove any imports of useRealtimeSync if no longer used
5. Keep hook signature identical (backward compatible)

Acceptance Criteria:
✓ No useRealtimeSync import or function call in file
✓ usePollingFallback() is called unconditionally (always enabled)
✓ Polling interval is explicitly set to intervalMs: 30000
✓ Hook function signature matches original
✓ TypeScript compilation succeeds
✓ Ideas load on initial mount
✓ New ideas appear within 30 seconds of creation
✓ No console errors when hook is called

Reference: See detailed pattern in PRD Phase 2 Technical Details section
Context: Activity feed is low-frequency (new ideas created sporadically), not high-traffic
Impact: Reduces real-time infrastructure complexity, maintains acceptable UX for activity feed")
```

---

## Task Breakdown

### TASK-2.1: Replace WebSocket with Polling in useIdeas

**Duration**: 30 minutes
**Status**: pending
**Assigned to**: ui-engineer

| Aspect | Detail |
|--------|--------|
| **File** | `apps/web/hooks/useIdeas.ts` |
| **Change Type** | Hook modification |
| **Scope** | Remove WebSocket, promote polling to primary |
| **Complexity** | Low |
| **Risk** | Low (polling infrastructure already exists) |

**Detailed Acceptance Criteria**:

- [ ] No import of `useRealtimeSync` in file
- [ ] No `useRealtimeSync()` function call in hook body
- [ ] `usePollingFallback()` is called unconditionally
- [ ] Polling interval is set to `intervalMs: 30000` (30 seconds)
- [ ] Hook function signature unchanged from original
- [ ] All parameters still work identically
- [ ] Hook returns same query object structure
- [ ] TypeScript: No type errors on file
- [ ] Build: File compiles without warnings
- [ ] Runtime: No console errors when hook executes
- [ ] Manual testing: New ideas appear within 30 seconds

**Technical Notes**:

Activity feed (idea inbox) is low-frequency, asynchronous data:
- New ideas are created manually (not bulk operations)
- Family members check inbox sporadically (not continuous)
- 30-second polling provides acceptable freshness
- WebSocket is overkill for this use case

**Quality Gates**:

```typescript
// Pattern to follow (before → after):

// BEFORE: WebSocket + Polling (polling is fallback only)
export function useIdeas(options?: UseIdeasOptions) {
  const { enabled = true, forInbox = false } = options;

  const query = useQuery({
    queryKey: ['ideas', forInbox ? 'inbox' : 'all'],
    queryFn: () => forInbox ? ideasApi.inbox() : ideasApi.list(),
    enabled,
  });

  // Remove this block:
  useRealtimeSync({  // REMOVE
    topic: 'ideas:inbox',
    queryKey: ['ideas', 'inbox'],
    events: ['ADDED', 'UPDATED'],
    enabled: forInbox && enabled,
  });

  // Keep this, but enable unconditionally:
  usePollingFallback({
    queryKey: ['ideas', forInbox ? 'inbox' : 'all'],
    intervalMs: 30000,
    enabled: forInbox ? enabled : false,  // Currently conditional
  });

  return query;
}

// AFTER: Polling only (primary strategy)
export function useIdeas(options?: UseIdeasOptions) {
  const { enabled = true, forInbox = false } = options;

  const query = useQuery({
    queryKey: ['ideas', forInbox ? 'inbox' : 'all'],
    queryFn: () => forInbox ? ideasApi.inbox() : ideasApi.list(),
    enabled,
  });

  // Polling is now primary strategy, not fallback
  usePollingFallback({
    queryKey: ['ideas', forInbox ? 'inbox' : 'all'],
    intervalMs: 30000,  // 30 seconds
    enabled: forInbox ? enabled : false,  // Keep same conditional logic
  });

  // useRealtimeSync removed entirely

  return query;
}
```

---

## Why This Works

### Polling Strategy for Activity Feed

1. **Inbox Load**: User navigates to dashboard
   - `useIdeas` is called with `forInbox: true`
   - Initial query fetches current ideas from API
   - Polling starts: will refetch every 30 seconds

2. **New Idea Created**: Family member creates new idea
   - Within 30 seconds, polling refetch triggers
   - React Query fetches fresh inbox data
   - New idea appears in UI

3. **User Away**: User navigates to different page
   - Polling continues (doesn't hurt, minimal overhead)
   - Or: polling can be disabled when `forInbox: false`

4. **Performance**: 30-second interval chosen because
   - Activity feed is not mission-critical
   - Inbox is checked periodically (not continuously)
   - 30s latency is imperceptible UX impact
   - Reduces server load vs WebSocket subscriptions

### staleTime vs Polling

Key insight: This hook doesn't use staleTime (Phase 1 pattern) because:
- Activity feed needs fresher data than read-only reference data
- Polling ensures periodic fetches even if data isn't marked stale
- 30s polling + React Query cache = optimal balance

---

## Integration with usePollingFallback

### About usePollingFallback

This hook already exists in the codebase. It:
- Accepts `queryKey`, `intervalMs`, `enabled` parameters
- Sets up a timer that triggers query invalidation every N milliseconds
- Is designed to work in tandem with useQuery
- Cleans up on unmount (timer is cancelled)

### Phase 2 Change

We're not changing how `usePollingFallback` works; we're just:
1. Removing the `useRealtimeSync` call
2. Ensuring `usePollingFallback` is always called (not conditional on WS failure)
3. Keeping the 30-second interval

This is a configuration change, not a behavioral change.

---

## Quality Checklist

After completing TASK-2.1, verify:

### Code Quality
- [ ] No unused imports (clean up `useRealtimeSync` import)
- [ ] `usePollingFallback` call is present
- [ ] Polling interval is `intervalMs: 30000`
- [ ] Hook signature unchanged
- [ ] No `any` type widening
- [ ] TypeScript strict mode passes

### Functional Quality
- [ ] Hook still accepts original parameters
- [ ] Hook still returns query object
- [ ] Ideas fetch on first mount
- [ ] New ideas appear within 30 seconds
- [ ] No console errors during polling
- [ ] No TypeScript compilation errors

### Integration Quality
- [ ] Build succeeds: `npm run build`
- [ ] Dev server starts: `npm run dev`
- [ ] No new warnings in build output
- [ ] Hook can be imported and used normally
- [ ] Dashboard / inbox page works as expected

---

## Dependencies & Sequencing

**Phase 2 Dependency**: Phase 1 must be complete first
- Reason: Phase 1 establishes the new cache strategy pattern
- Phase 2 uses a similar pattern (polling as primary)
- Both changes should be understood together

**Phase 2 Parallelization**: Only one task (TASK-2.1), no parallelization

**Next Phase Dependency**: Phase 2 must be complete before Phase 3 can begin
- Phase 3 cleans up unused WebSocket infrastructure
- We need to confirm all data hooks are no longer using useRealtimeSync

---

## Deliverables

### Files Modified (1 total)
1. `apps/web/hooks/useIdeas.ts` - TASK-2.1

### Commit Message

After TASK-2.1 completes, create commit:

```
refactor(web): replace websocket with polling in useIdeas hook

Replace useRealtimeSync subscription with polling as primary strategy in
useIdeas hook. Activity feed (idea inbox) is low-frequency data that doesn't
require real-time updates; 30-second polling provides acceptable freshness.

- Remove useRealtimeSync() call
- Enable usePollingFallback() as primary (was fallback-only)
- Polling interval: 30 seconds (appropriate for activity feed)
- Maintains backward compatibility with original hook signature

Hook behavior unchanged: ideas load on mount, new items appear within 30s.

This is Phase 2 of websocket-simplification refactor.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Progress Tracking

| Task | Status | Assigned | Estimate | Completed |
|------|--------|----------|----------|-----------|
| TASK-2.1: useIdeas | pending | ui-engineer | 30 min | - |
| **Phase 2 Total** | **pending** | **ui-engineer** | **30 min** | **0%** |

---

## Context for AI Agents

### What This Phase Accomplishes

Completes the data hook migration by replacing WebSocket in the last complex hook (useIdeas) with polling. Unlike Phase 1 hooks which use React Query staleTime, useIdeas needs active periodic updates (activity feed must be fresh), so polling is the appropriate pattern.

### Key Files Location

- Hook to modify: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web/hooks/useIdeas.ts`
- Referenced hook: `usePollingFallback` (already exists, just being enabled unconditionally)

### Why Polling for Activity Feed

- **Activity is asynchronous**: Family members create ideas at different times
- **Low frequency**: Ideas are created manually, not bulk-generated
- **Acceptable latency**: 30-second delay is imperceptible for inbox
- **Simpler infrastructure**: Polling is built into React Query already
- **Better for small team**: 30s polling for 2-3 users has minimal server load

### Success Indicators

✓ Phase 2 complete when:
1. TASK-2.1 marked complete
2. useRealtimeSync import removed
3. usePollingFallback is called unconditionally
4. No TypeScript errors
5. Ideas load and appear within 30 seconds

✓ Ready for Phase 3 when:
1. TASK-2.1 complete
2. Changes committed to feat/ui-overhaul branch
3. All data hooks (Phases 1 & 2) no longer use useRealtimeSync

---

## Related Documentation

- **Full PRD**: `/docs/project_plans/implementation_plans/refactors/websocket-simplification-v1.md`
- **Phase 1 Progress**: `.claude/progress/websocket-simplification/phase-1-progress.md`
- **Phase 3 Progress**: `.claude/progress/websocket-simplification/phase-3-progress.md` (after Phase 2 complete)

---

**Last Updated**: 2025-12-03
**Status**: Draft - Ready for Deployment (after Phase 1 complete)
