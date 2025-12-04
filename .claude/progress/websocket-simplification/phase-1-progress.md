---
type: phase_progress
prd: websocket-simplification
phase: 1
title: "Phase 1: Data Hooks Simplification"
status: pending
progress: 0%
estimated_hours: 2-3
assigned_to: ["ui-engineer"]
dependencies: []
created: 2025-12-03
updated: 2025-12-03
---

# Phase 1: Data Hooks Simplification

**Status**: Pending
**Progress**: 0%
**Estimated Duration**: 2-3 hours
**Assigned Team**: ui-engineer

## Phase Overview

Replace `useRealtimeSync` WebSocket infrastructure with React Query cache strategies in four data hooks. Gifts, Lists, Persons, and Occasions pages are read-heavy and don't require sub-second synchronization. Each hook modification is isolated and can be parallelized.

**Key Principle**: Remove WebSocket subscriptions, replace with appropriate `staleTime` values tuned per page type.

---

## Orchestration Quick Reference

Copy-paste ready Task() commands for Phase 1. All four tasks can run in parallel (batch_1).

### BATCH_1: Parallel Hook Modifications (Tasks 1.1-1.4)

```
Task("ui-engineer", "TASK-1.1: Remove WebSocket from useGifts hook
File: apps/web/hooks/useGifts.ts

Current Implementation (to replace):
- Hook uses useRealtimeSync() with topic 'gifts'
- Subscribes to ADDED, UPDATED, DELETED events
- Invalidates React Query cache on changes

Required Changes:
1. Remove the useRealtimeSync() call entirely
2. Add staleTime: 5 * 60 * 1000 (5 minutes) to useQuery config
3. Add refetchOnWindowFocus: true to useQuery config
4. Remove any imports of useRealtimeSync if no longer used
5. Keep hook signature identical (backward compatible)

Acceptance Criteria:
✓ No useRealtimeSync import or function call in file
✓ useQuery has staleTime: 5 * 60 * 1000
✓ refetchOnWindowFocus: true is set
✓ Hook function signature matches original
✓ TypeScript compilation succeeds
✓ No console errors when hook is called

Reference: See detailed pattern in PRD Phase 1 Technical Details section")
```

```
Task("ui-engineer", "TASK-1.2: Remove WebSocket from useLists hook
File: apps/web/hooks/useLists.ts

Current Implementation (to replace):
- Hook uses useRealtimeSync() with topic 'lists'
- Subscribes to ADDED, UPDATED, DELETED events
- Invalidates React Query cache on changes

Required Changes:
1. Remove the useRealtimeSync() call entirely
2. Add staleTime: 10 * 60 * 1000 (10 minutes) to useQuery config
3. Add refetchOnWindowFocus: true to useQuery config
4. Remove any imports of useRealtimeSync if no longer used
5. Keep hook signature identical (backward compatible)

Acceptance Criteria:
✓ No useRealtimeSync import or function call in file
✓ useQuery has staleTime: 10 * 60 * 1000
✓ refetchOnWindowFocus: true is set
✓ Hook function signature matches original
✓ TypeScript compilation succeeds
✓ No console errors when hook is called

Reference: See detailed pattern in PRD Phase 1 Technical Details section")
```

```
Task("ui-engineer", "TASK-1.3: Remove WebSocket from usePersons hook
File: apps/web/hooks/usePersons.ts

Current Implementation (to replace):
- Hook uses useRealtimeSync() with topic 'persons'
- Subscribes to ADDED, UPDATED, DELETED events
- Invalidates React Query cache on changes

Required Changes:
1. Remove the useRealtimeSync() call entirely
2. Add staleTime: 30 * 60 * 1000 (30 minutes) to useQuery config
3. Add refetchOnWindowFocus: true to useQuery config
4. Remove any imports of useRealtimeSync if no longer used
5. Keep hook signature identical (backward compatible)

Acceptance Criteria:
✓ No useRealtimeSync import or function call in file
✓ useQuery has staleTime: 30 * 60 * 1000
✓ refetchOnWindowFocus: true is set
✓ Hook function signature matches original
✓ TypeScript compilation succeeds
✓ No console errors when hook is called

Reference: See detailed pattern in PRD Phase 1 Technical Details section")
```

```
Task("ui-engineer", "TASK-1.4: Remove WebSocket from useOccasions hook
File: apps/web/hooks/useOccasions.ts

Current Implementation (to replace):
- Hook uses useRealtimeSync() with topic 'occasions'
- Subscribes to ADDED, UPDATED, DELETED events
- Invalidates React Query cache on changes

Required Changes:
1. Remove the useRealtimeSync() call entirely
2. Add staleTime: 30 * 60 * 1000 (30 minutes) to useQuery config
3. Add refetchOnWindowFocus: true to useQuery config
4. Remove any imports of useRealtimeSync if no longer used
5. Keep hook signature identical (backward compatible)

Acceptance Criteria:
✓ No useRealtimeSync import or function call in file
✓ useQuery has staleTime: 30 * 60 * 1000
✓ refetchOnWindowFocus: true is set
✓ Hook function signature matches original
✓ TypeScript compilation succeeds
✓ No console errors when hook is called

Reference: See detailed pattern in PRD Phase 1 Technical Details section")
```

---

## Task Breakdown

### TASK-1.1: Remove WebSocket from useGifts

**Duration**: 30 minutes
**Status**: pending
**Assigned to**: ui-engineer

| Aspect | Detail |
|--------|--------|
| **File** | `apps/web/hooks/useGifts.ts` |
| **Change Type** | Hook simplification |
| **Scope** | Remove real-time sync, add cache strategy |
| **Complexity** | Low |
| **Risk** | Low (isolated change) |

**Detailed Acceptance Criteria**:

- [ ] No import of `useRealtimeSync` in file
- [ ] No `useRealtimeSync()` function call in hook body
- [ ] `useQuery` configuration includes `staleTime: 5 * 60 * 1000`
- [ ] `useQuery` configuration includes `refetchOnWindowFocus: true`
- [ ] Hook function signature unchanged from original
- [ ] All parameters (`params`, `options`) still work identically
- [ ] Hook returns same query object structure
- [ ] TypeScript: No type errors on file
- [ ] Build: File compiles without warnings
- [ ] Runtime: No console errors when hook executes

**Technical Notes**:

Gifts are user-facing product data. 5-minute staleness is acceptable because:
- New gifts are added manually (not bulk imports)
- Family members check gifts sporadically (not continuous viewing)
- Updates are infrequent enough that 5-min latency is unnoticeable

**Quality Gates**:

```typescript
// Pattern to follow (before → after):
// BEFORE:
export function useGifts(params?: GiftListParams, options?: UseGiftsOptions) {
  const { enabled = true } = options;
  const query = useQuery({
    queryKey: ['gifts', params],
    queryFn: () => giftApi.list(params),
    enabled,
  });
  useRealtimeSync({  // REMOVE THIS ENTIRE BLOCK
    topic: 'gifts',
    queryKey: ['gifts', params],
    events: ['ADDED', 'UPDATED', 'DELETED'],
    enabled,
  });
  return query;
}

// AFTER:
export function useGifts(params?: GiftListParams, options?: UseGiftsOptions) {
  const { enabled = true } = options;
  const query = useQuery({
    queryKey: ['gifts', params],
    queryFn: () => giftApi.list(params),
    staleTime: 5 * 60 * 1000,        // ADD THIS
    refetchOnWindowFocus: true,      // ADD THIS
    enabled,
  });
  return query;  // useRealtimeSync call removed
}
```

---

### TASK-1.2: Remove WebSocket from useLists

**Duration**: 30 minutes
**Status**: pending
**Assigned to**: ui-engineer

| Aspect | Detail |
|--------|--------|
| **File** | `apps/web/hooks/useLists.ts` |
| **Change Type** | Hook simplification |
| **Scope** | Remove real-time sync, add cache strategy |
| **Complexity** | Low |
| **Risk** | Low (isolated change) |

**Detailed Acceptance Criteria**:

- [ ] No import of `useRealtimeSync` in file
- [ ] No `useRealtimeSync()` function call in hook body
- [ ] `useQuery` configuration includes `staleTime: 10 * 60 * 1000`
- [ ] `useQuery` configuration includes `refetchOnWindowFocus: true`
- [ ] Hook function signature unchanged from original
- [ ] All parameters still work identically
- [ ] Hook returns same query object structure
- [ ] TypeScript: No type errors on file
- [ ] Build: File compiles without warnings
- [ ] Runtime: No console errors when hook executes

**Technical Notes**:

Lists are moderately dynamic (new lists created occasionally). 10-minute staleness balances freshness with cache efficiency because:
- Lists are created manually (not bulk operations)
- List browsing is not real-time heavy
- New list appearance within 10 minutes is acceptable UX

---

### TASK-1.3: Remove WebSocket from usePersons

**Duration**: 30 minutes
**Status**: pending
**Assigned to**: ui-engineer

| Aspect | Detail |
|--------|--------|
| **File** | `apps/web/hooks/usePersons.ts` |
| **Change Type** | Hook simplification |
| **Scope** | Remove real-time sync, add cache strategy |
| **Complexity** | Low |
| **Risk** | Low (isolated change) |

**Detailed Acceptance Criteria**:

- [ ] No import of `useRealtimeSync` in file
- [ ] No `useRealtimeSync()` function call in hook body
- [ ] `useQuery` configuration includes `staleTime: 30 * 60 * 1000`
- [ ] `useQuery` configuration includes `refetchOnWindowFocus: true`
- [ ] Hook function signature unchanged from original
- [ ] All parameters still work identically
- [ ] Hook returns same query object structure
- [ ] TypeScript: No type errors on file
- [ ] Build: File compiles without warnings
- [ ] Runtime: No console errors when hook executes

**Technical Notes**:

Person data is almost static. 30-minute staleness is appropriate because:
- Person records change very infrequently (name, contact info)
- Family members are not bulk-updated
- This is reference data with very low update frequency

---

### TASK-1.4: Remove WebSocket from useOccasions

**Duration**: 30 minutes
**Status**: pending
**Assigned to**: ui-engineer

| Aspect | Detail |
|--------|--------|
| **File** | `apps/web/hooks/useOccasions.ts` |
| **Change Type** | Hook simplification |
| **Scope** | Remove real-time sync, add cache strategy |
| **Complexity** | Low |
| **Risk** | Low (isolated change) |

**Detailed Acceptance Criteria**:

- [ ] No import of `useRealtimeSync` in file
- [ ] No `useRealtimeSync()` function call in hook body
- [ ] `useQuery` configuration includes `staleTime: 30 * 60 * 1000`
- [ ] `useQuery` configuration includes `refetchOnWindowFocus: true`
- [ ] Hook function signature unchanged from original
- [ ] All parameters still work identically
- [ ] Hook returns same query object structure
- [ ] TypeScript: No type errors on file
- [ ] Build: File compiles without warnings
- [ ] Runtime: No console errors when hook executes

**Technical Notes**:

Occasions are static reference data. 30-minute staleness is appropriate because:
- Occasions (holidays, birthdays) don't change frequently
- No concurrent editing scenarios
- This is planning/reference data with minimal updates

---

## Quality Checklist (All Tasks)

After completing all Phase 1 tasks, verify:

### Code Quality
- [ ] All four hooks modified
- [ ] No unused imports (clean up any `useRealtimeSync` imports)
- [ ] Consistent staleTime values across hooks
- [ ] Hook signatures unchanged
- [ ] No `any` type widening
- [ ] TypeScript strict mode passes

### Functional Quality
- [ ] Each hook still accepts original parameters
- [ ] Each hook still returns query object
- [ ] Data fetches on first mount
- [ ] Data refetches when window regains focus
- [ ] No console errors during data fetching
- [ ] No TypeScript compilation errors

### Integration Quality
- [ ] Build succeeds: `npm run build`
- [ ] Dev server starts: `npm run dev`
- [ ] No new warnings in build output
- [ ] Each hook can be imported and used normally
- [ ] React Query devtools show correct staleTime values

---

## Technical Details: Pattern Implementation

### Standard Hook Pattern (Before → After)

All four hooks follow this transformation:

```typescript
// BEFORE: WebSocket + React Query
export function useHookName(params?: ParamsType, options?: OptionsType) {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: ['hookName', params],
    queryFn: () => api.list(params),
    enabled,
  });

  // Remove this entire block:
  useRealtimeSync({
    topic: 'hookName',
    queryKey: ['hookName', params],
    events: ['ADDED', 'UPDATED', 'DELETED'],
    enabled,
  });

  return query;
}

// AFTER: React Query staleTime + window focus refetch
export function useHookName(params?: ParamsType, options?: OptionsType) {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: ['hookName', params],
    queryFn: () => api.list(params),
    staleTime: STALETIME_VALUE,           // 5-30 min depending on hook
    refetchOnWindowFocus: true,           // Refetch when user returns to tab
    enabled,
  });

  return query;  // useRealtimeSync removed
}
```

### Why This Pattern Works

1. **Initial Load**: Data is fetched via REST API (same as before)
2. **Cache Hit**: Within staleTime window, cached data is returned instantly
3. **Staleness**: After staleTime expires, next query request triggers a fetch
4. **Window Focus**: When user returns to tab, fresh data is fetched
5. **Graceful Degradation**: If network is slow, cached data is used while fetch completes

### Deletion Guidance

When removing `useRealtimeSync` call:

```typescript
// Remove the import if it's no longer used elsewhere:
- import { useRealtimeSync } from '@/hooks/useRealtimeSync';

// Remove the entire hook call from the function body:
- useRealtimeSync({
-   topic: 'hookName',
-   queryKey: ['hookName', params],
-   events: ['ADDED', 'UPDATED', 'DELETED'],
-   enabled,
- });
```

---

## Dependencies & Sequencing

**Phase 1 Dependencies**: None. All four tasks are independent.

**Phase 1 Parallelization**: All four tasks (TASK-1.1 through TASK-1.4) can run in parallel:
- No shared code modifications
- No race conditions
- Each hook is in a separate file
- Independent acceptance criteria

**Next Phase Dependency**: Phase 1 must be complete before Phase 2 can begin (useIdeas hook depends on knowing which other hooks are already simplified).

---

## Deliverables

### Files Modified (4 total)
1. `apps/web/hooks/useGifts.ts` - TASK-1.1
2. `apps/web/hooks/useLists.ts` - TASK-1.2
3. `apps/web/hooks/usePersons.ts` - TASK-1.3
4. `apps/web/hooks/useOccasions.ts` - TASK-1.4

### Commit Message

After all Phase 1 tasks complete, create single commit:

```
refactor(web): remove websocket from data hooks (gifts, lists, persons, occasions)

Replace useRealtimeSync subscriptions with React Query staleTime cache strategy:
- useGifts: 5-minute staleTime (user-generated data, low update frequency)
- useLists: 10-minute staleTime (manually created, moderate freshness needed)
- usePersons: 30-minute staleTime (reference data, rarely changes)
- useOccasions: 30-minute staleTime (reference data, rarely changes)

All hooks maintain backward compatibility with original signatures.
WebSocket real-time sync removed from 4 read-heavy pages.

This is Phase 1 of websocket-simplification refactor.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Progress Tracking

| Task | Status | Assigned | Estimate | Completed |
|------|--------|----------|----------|-----------|
| TASK-1.1: useGifts | pending | ui-engineer | 30 min | - |
| TASK-1.2: useLists | pending | ui-engineer | 30 min | - |
| TASK-1.3: usePersons | pending | ui-engineer | 30 min | - |
| TASK-1.4: useOccasions | pending | ui-engineer | 30 min | - |
| **Phase 1 Total** | **pending** | **ui-engineer** | **2 hours** | **0%** |

---

## Context for AI Agents

### What This Phase Accomplishes

Removes unnecessary WebSocket subscription overhead from data hooks. These pages are read-heavy with infrequent updates; instant synchronization is not required. React Query's cache and window focus refetch patterns provide adequate data freshness while significantly reducing infrastructure complexity.

### Key Files Location

- Hooks to modify: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web/hooks/`
- useRealtimeSync hook (being removed): `/Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web/hooks/useRealtimeSync.ts`
- React Query setup: Check `apps/web/lib/query-client.ts` or similar

### Integration Points

- Hook usage: Imported in various React components throughout the app
- React Query client: Shares same query client configuration
- TypeScript: All hooks are fully typed (no type changes needed)
- Tests: If existing tests use these hooks, they'll still pass (hook API unchanged)

### Technical Constraints

- Hook signatures must remain identical (backward compatible)
- useQuery options are the only change
- No changes to queryFn or queryKey logic
- No changes to enabled option handling
- All hooks still support conditional execution via options.enabled

### Success Indicators

✓ Phase 1 complete when:
1. All four hooks modified
2. No `useRealtimeSync` imports in any of the four files
3. Each hook has appropriate staleTime value
4. TypeScript compilation succeeds
5. Browser console shows no errors

✓ Ready for Phase 2 when:
1. All tasks marked complete
2. Changes committed to feat/ui-overhaul branch
3. Code review approved (if applicable)

---

## Related Documentation

- **Full PRD**: `/docs/project_plans/implementation_plans/refactors/websocket-simplification-v1.md`
- **WebSocket Guide**: `/docs/guides/websockets.md`
- **Project CLAUDE.md**: `/CLAUDE.md` (Architecture & real-time patterns)
- **Phase 2 Progress**: `.claude/progress/websocket-simplification/phase-2-progress.md` (after Phase 1 complete)

---

**Last Updated**: 2025-12-03
**Status**: Draft - Ready for Deployment
