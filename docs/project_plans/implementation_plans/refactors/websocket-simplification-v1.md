---
title: "WebSocket Simplification - Implementation Plan"
description: "Remove unnecessary real-time sync from non-collaborative pages. Keep WebSockets only for Kanban board where actual simultaneous editing occurs."
audience: [ai-agents, developers]
tags: [refactoring, websockets, performance, simplification]
created: 2025-12-03
updated: 2025-12-03
category: "refactors"
status: draft
related:
  - /docs/guides/websockets.md
  - /CLAUDE.md
---

# WebSocket Simplification - Implementation Plan

## Executive Summary

**Objective**: Reduce WebSocket infrastructure from 100% coverage to surgical use only where needed (Kanban board), replacing other real-time sync with React Query cache strategies.

**Approach**: Methodical phase-out with validation at each step. Keep working features intact while removing over-engineered infrastructure.

**Timeline**: 5 phases, ~15 hours effort
- Phase 1: Data hooks simplification (4 files)
- Phase 2: Activity layer downgrade (1 file)
- Phase 3: Infrastructure cleanup (5 files)
- Phase 4: Validation & testing (all pages)
- Phase 5: Documentation (guides, architecture)

**Key Success Metrics**:
- All pages load and fetch data correctly
- Kanban board maintains instant updates (WebSocket kept)
- 60%+ reduction in WebSocket-related code
- Zero WebSocket errors in browser console
- App gracefully degrades if WebSocket server is down

**Risk Level**: Low-Medium
- Changes are isolated to specific hooks
- React Query handles both sync patterns (WebSocket invalidation vs polling)
- Can roll back individual hooks if issues appear

---

## Implementation Strategy

### Architecture Sequencing

```
Current State (Over-Engineered):
┌─────────────────────────────────────────────────┐
│ WebSocketProvider (1 connection)                │
├─────────────────────────────────────────────────┤
│ useGifts → WebSocket + REST                     │
│ useLists → WebSocket + REST                     │
│ usePersons → WebSocket + REST                   │
│ useOccasions → WebSocket + REST                 │
│ useIdeas → WebSocket + polling already built-in│
│ useListItems → WebSocket + REST (KEEP!)        │
└─────────────────────────────────────────────────┘

Target State (Optimized):
┌─────────────────────────────────────────────────┐
│ WebSocketProvider (minimal, Kanban only)        │
├─────────────────────────────────────────────────┤
│ useGifts → REST + staleTime (5 min)             │
│ useLists → REST + staleTime (10 min)            │
│ usePersons → REST + staleTime (30 min)          │
│ useOccasions → REST + staleTime (30 min)        │
│ useIdeas → REST + polling interval (30s)        │
│ useListItems → WebSocket + REST (KEPT)          │
└─────────────────────────────────────────────────┘
```

### Parallel Work Opportunities

**Can be done in parallel**:
- Phase 1: Data hooks (4 hooks are independent)
- Phase 3: Cleanup (after Phase 1 & 2 complete)

**Must be sequential**:
- Phase 2 (depends on Phase 1)
- Phase 4 (validation of all changes)
- Phase 5 (documentation updates)

### Critical Path

```
Phase 1 (2h) ──→ Phase 2 (0.5h) ──→ Phase 3 (2h) ──→ Phase 4 (3h) ──→ Phase 5 (1.5h)
Total: ~9 hours critical path
Optional parallel: Phase 1 hooks can be done in parallel (~4 hours if sequential)
```

---

## Phase Breakdown

### Phase 1: Data Hooks Simplification

**Duration**: 2-3 hours
**Assigned Subagents**: ui-engineer, frontend-developer
**Deliverables**: 4 updated hook files

#### Tasks

| ID | Task | Description | Acceptance Criteria | Estimate | Subagent |
|----|------|-------------|-------------------|----------|----------|
| 1.1 | Remove WebSocket from useGifts | Replace `useRealtimeSync` with React Query `staleTime: 5min` | Hook works, data fetches, no WS errors | 30 min | ui-engineer |
| 1.2 | Remove WebSocket from useLists | Replace `useRealtimeSync` with React Query `staleTime: 10min` | Hook works, data fetches, no WS errors | 30 min | ui-engineer |
| 1.3 | Remove WebSocket from usePersons | Replace `useRealtimeSync` with React Query `staleTime: 30min` | Hook works, data fetches, no WS errors | 30 min | ui-engineer |
| 1.4 | Remove WebSocket from useOccasions | Replace `useRealtimeSync` with React Query `staleTime: 30min` | Hook works, data fetches, no WS errors | 30 min | ui-engineer |

#### Technical Details

**Pattern for each hook**:

```typescript
// Before
export function useGifts(params?: GiftListParams, options?: UseGiftsOptions) {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: ['gifts', params],
    queryFn: () => giftApi.list(params),
    enabled,
  });

  // Remove this entire block:
  useRealtimeSync({
    topic: 'gifts',
    queryKey: ['gifts', params],
    events: ['ADDED', 'UPDATED', 'DELETED'],
    enabled,
  });

  return query;
}

// After
export function useGifts(params?: GiftListParams, options?: UseGiftsOptions) {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: ['gifts', params],
    queryFn: () => giftApi.list(params),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    enabled,
  });

  return query;
}
```

**Files Modified**:
- `apps/web/hooks/useGifts.ts`
- `apps/web/hooks/useLists.ts`
- `apps/web/hooks/usePersons.ts`
- `apps/web/hooks/useOccasions.ts`

**Quality Gates**:
- ✅ No `useRealtimeSync` import
- ✅ `staleTime` configured appropriately
- ✅ `refetchOnWindowFocus: true` enabled
- ✅ Hook signature unchanged (backward compatible)

---

### Phase 2: Activity Layer Downgrade

**Duration**: 30 minutes
**Assigned Subagents**: ui-engineer, frontend-developer
**Deliverables**: Updated useIdeas hook with polling

#### Tasks

| ID | Task | Description | Acceptance Criteria | Estimate | Subagent |
|----|------|-------------|-------------------|----------|----------|
| 2.1 | Replace WebSocket with polling in useIdeas | Keep existing `usePollingFallback`, enable it always (not just when WS down) | Ideas load, inbox updates every 30s, no WS errors | 30 min | ui-engineer |

#### Technical Details

**Current State**:
```typescript
// useIdeas.ts - already has polling fallback infrastructure
useRealtimeSync({
  topic: 'ideas:inbox',
  queryKey: ['ideas', 'inbox'],
  enabled,
});

// Already has polling, just for fallback:
usePollingFallback({
  queryKey: ['ideas', 'inbox'],
  intervalMs: 30000,  // Only enabled when WS down
});
```

**Target State**:
```typescript
// useIdeas.ts - use polling as primary, remove WebSocket
// Remove useRealtimeSync entirely

// Enable polling always (not just fallback)
usePollingFallback({
  queryKey: ['ideas', 'inbox'],
  intervalMs: 30000,  // 30 seconds - good for activity feed
  enabled,  // Always enabled
});
```

**Files Modified**:
- `apps/web/hooks/useIdeas.ts`

**Quality Gates**:
- ✅ No `useRealtimeSync` call
- ✅ Polling interval set to 30s (activity feed doesn't need sub-second latency)
- ✅ Ideas load correctly
- ✅ New ideas appear within 30 seconds

---

### Phase 3: Infrastructure Cleanup

**Duration**: 2-2.5 hours
**Assigned Subagents**: refactoring-expert, code-reviewer
**Deliverables**: Cleaned up WebSocket infrastructure

#### Tasks

| ID | Task | Description | Acceptance Criteria | Estimate | Subagent |
|----|------|-------------|-------------------|----------|----------|
| 3.1 | Remove unused imports from data hooks | Clean up `useRealtimeSync` imports after Phase 1 & 2 | No unused imports, build succeeds | 30 min | refactoring-expert |
| 3.2 | Simplify useRealtimeSync hook | Keep only what Kanban board needs, remove extra strategies | Hook still works for list items, 50% smaller | 30 min | refactoring-expert |
| 3.3 | Remove unused WebSocket types & helpers | Delete unused event types, topic definitions | No unused exports, types clean | 30 min | refactoring-expert |
| 3.4 | Audit WebSocketProvider usage | Verify only Kanban board actually uses it | Provider can be removed or greatly simplified | 30 min | code-reviewer |
| 3.5 | Delete dead code paths | Remove branches that handle multi-topic subscriptions | No dead code, coverage unchanged | 30 min | refactoring-expert |

#### Technical Details

**Files to Simplify**:
- `apps/web/hooks/useRealtimeSync.ts` - Keep core logic, remove extra event handlers, strategies
- `apps/web/hooks/useWebSocket.ts` - Already minimal, just verify no unused features
- `apps/web/lib/websocket/types.ts` - Remove unused event types
- `apps/web/lib/websocket/WebSocketProvider.tsx` - No changes, but verify only Kanban uses it
- `apps/web/components/websocket/ConnectionIndicator.tsx` - Consider removing if no longer needed

**Lines of Code Impact**:
- Before: ~1200 lines total WebSocket infrastructure + hooks using it
- After: ~400 lines (Kanban WebSocket + minimal infrastructure)
- **Reduction: 67%**

**Quality Gates**:
- ✅ Build passes (no type errors)
- ✅ Zero unused imports
- ✅ Kanban board still has WebSocket
- ✅ App still connects to WebSocket (even if unused elsewhere)
- ✅ Browser console: no "unused variable" warnings

---

### Phase 4: Testing & Validation

**Duration**: 3 hours
**Assigned Subagents**: code-reviewer, task-completion-validator
**Deliverables**: Validated changes across all pages

#### Tasks

| ID | Task | Description | Acceptance Criteria | Estimate | Subagent |
|----|------|-------------|-------------------|----------|----------|
| 4.1 | Test /gifts page | Verify gift list loads, search/filter works, no WS errors | Page loads instantly (cached), images render, search works | 20 min | code-reviewer |
| 4.2 | Test /lists page | Verify list index loads, list browsing works, no WS errors | Page loads, lists display, no errors | 20 min | code-reviewer |
| 4.3 | Test /lists/[id] Kanban | Verify drag-and-drop still works instantly, WebSocket active | Drag-and-drop smooth, other users see updates instantly | 30 min | code-reviewer |
| 4.4 | Test /people page | Verify people list loads, person detail works, no WS errors | Page loads, people display correctly | 20 min | code-reviewer |
| 4.5 | Test /occasions page | Verify occasions list loads, details work, no WS errors | Page loads, occasions display correctly | 20 min | code-reviewer |
| 4.6 | Test /dashboard | Verify stats load, idea inbox polls every 30s, no WS errors | Dashboard loads, ideas appear within 30s | 30 min | code-reviewer |
| 4.7 | Browser console check | Verify zero WebSocket-related errors in console | No "WebSocket failed", "Invalid topic", etc. errors | 20 min | code-reviewer |
| 4.8 | Disconnect WebSocket server | Test app degrades gracefully when WS down | All pages still work (using cached data), no hard failures | 30 min | code-reviewer |
| 4.9 | Performance check | Verify no performance regressions | App still responsive, no new slow loads | 20 min | task-completion-validator |

#### Testing Scenarios

**Happy Path**:
1. Load /gifts → instant (from cache)
2. Load /lists → instant (from cache)
3. Navigate to /lists/[id] (Kanban) → instant + WebSocket active
4. Open /dashboard → instant, idea inbox updates every 30s

**Edge Cases**:
1. WebSocket server down → app still works with REST only
2. User on /dashboard for 5+ minutes → new ideas appear every 30s
3. Return to browser tab after 1 hour → data refetches from server
4. Slow network → data loads from cache while fetching

**Quality Gates**:
- ✅ All pages render correctly
- ✅ No TypeScript errors
- ✅ No console errors
- ✅ Kanban board drag-and-drop instant
- ✅ App works without WebSocket
- ✅ No regressions from Before

---

### Phase 5: Documentation Updates

**Duration**: 1-1.5 hours
**Assigned Subagents**: documentation-writer
**Deliverables**: Updated guides and architecture docs

#### Tasks

| ID | Task | Description | Acceptance Criteria | Estimate | Subagent |
|----|------|-------------|-------------------|----------|----------|
| 5.1 | Update websockets.md guide | Clarify WebSocket is now Kanban-only, explain polling for other pages | Guide reflects current architecture, examples accurate | 30 min | documentation-writer |
| 5.2 | Update CLAUDE.md real-time section | Remove WebSocket as default pattern, explain selective use | CLAUDE.md accurate, reflects new strategy | 20 min | documentation-writer |
| 5.3 | Add architecture decision | Document why WebSockets were removed from most pages | ADR explains trade-offs, decisions | 20 min | documentation-writer |
| 5.4 | Comment code changes | Add comments explaining polling/staleTime choices | Code is self-documenting for future maintainers | 10 min | documentation-writer |

#### Documentation Changes

**In `/docs/guides/websockets.md`**:
- Add section: "Where WebSockets Are Used (Kanban Only)"
- Update architecture diagram to show Kanban highlighted
- Change examples to show polling pattern for non-Kanban data

**In `/CLAUDE.md`**:
- Update Prime Directives: Remove "real-time first" or clarify "where needed"
- Update Real-Time Pattern section: Explain selective use
- Add anti-pattern: "Don't use WebSockets for read-heavy pages"

**New ADR**:
- Create `docs/architecture/ADRs/websocket-selective-usage.md`
- Decision: Keep WebSockets only for Kanban board
- Rationale: 2-3 user app, 99% read-only data
- Trade-offs: Slightly delayed updates (up to 30s) for 90% code reduction

**Quality Gates**:
- ✅ All docs updated
- ✅ No broken links
- ✅ Examples match actual code
- ✅ Decision documented in ADR

---

## Risk Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Kanban drag-and-drop breaks | Low | High | Isolated change: useListItems hook NOT modified. Extensive testing Phase 4.3 |
| Data becomes stale too fast | Low | Medium | Tuned staleTime per page type. Can easily adjust if issues appear |
| WebSocket connection errors | Low | Low | App already gracefully degrades (polling fallback exists) |
| Performance regression | Low | Medium | Phase 4.9 validates performance. Fewer subscriptions should improve it |
| Browser memory leaks | Low | Low | Fewer subscriptions = less memory used. Improvement expected |

### Mitigation Strategies

1. **Kanban Board Protection**: Leave useListItems.ts untouched → zero risk
2. **Gradual Rollout**: Complete each phase with validation before next
3. **Easy Rollback**: Each hook change is isolated, can revert individually
4. **Testing Gates**: Phase 4 validates everything before Phase 5

---

## Resource Requirements

### Team Composition

- **UI Engineer / Frontend Developer**: 5-6 hours
  - Phases 1, 2: Hook modifications
- **Refactoring Expert**: 2-2.5 hours
  - Phase 3: Code cleanup
- **Code Reviewer / Validator**: 3-4 hours
  - Phase 4: Testing and validation
- **Documentation Writer**: 1-1.5 hours
  - Phase 5: Documentation

**Total**: ~12-15 hours across 4 roles

### Infrastructure

- No new infrastructure needed
- WebSocket server still runs (Kanban board uses it)
- React Query infrastructure unchanged
- No database changes

### Tools

- Browser DevTools (performance, console)
- TypeScript compiler (type checking)
- Git (version control, easy rollback)

---

## Success Metrics

### Technical Metrics

| Metric | Target | Validation |
|--------|--------|-----------|
| Code size reduction | 60-70% | Measure WebSocket-related code before/after |
| Build time | No increase | Check build log timing |
| Bundle size | Minimal change | WebSocket code is runtime-only |
| Performance | No regression | Phase 4.9 timing checks |
| Errors | Zero WS errors | Browser console validation |

### Functional Metrics

| Metric | Target | Validation |
|--------|--------|-----------|
| Kanban drag-and-drop | Instant (< 100ms) | Manual testing in Phase 4.3 |
| Data freshness | Acceptable delays | 5 min gifts, 30s ideas, etc. |
| App uptime | 100% | Works without WebSocket |
| All pages load | All 7+ pages | Phase 4 validates each |

### Business Metrics

| Metric | Target | Validation |
|--------|--------|-----------|
| Maintenance burden | Reduced 50%+ | Fewer hooks to maintain |
| Complexity | Reduced | Simpler code, easier to explain |
| Developer velocity | Improved | Less infrastructure to understand |

---

## Post-Implementation Plan

### Monitoring

**For 1-2 weeks post-launch**:
- Watch browser error logs for WebSocket issues
- Monitor if users report "stale data" issues
- Check if Kanban board works smoothly for family

### Maintenance

**Long-term**:
- If WebSocket becomes popular pattern again: easy to add back to specific hooks
- Polling intervals can be tuned based on feedback
- staleTime values can be adjusted if data feels stale

### Future Enhancements

**If real-time needs expand**:
- Can add WebSockets to specific features without full infrastructure
- useListItems pattern can be copied to other collaborative features
- Already has polling fallback for resilience

---

## Deliverables Summary

### Files Modified (9 total)

**Hooks (5 files - Phase 1 & 2)**:
1. `apps/web/hooks/useGifts.ts` - Remove WebSocket, add staleTime
2. `apps/web/hooks/useLists.ts` - Remove WebSocket, add staleTime
3. `apps/web/hooks/usePersons.ts` - Remove WebSocket, add staleTime
4. `apps/web/hooks/useOccasions.ts` - Remove WebSocket, add staleTime
5. `apps/web/hooks/useIdeas.ts` - Remove WebSocket, enable polling

**Infrastructure (3 files - Phase 3)**:
6. `apps/web/hooks/useRealtimeSync.ts` - Simplify for Kanban only
7. `apps/web/lib/websocket/types.ts` - Remove unused types
8. `apps/web/components/websocket/ConnectionIndicator.tsx` - Verify/update

**Docs (2 files - Phase 5)**:
9. `docs/guides/websockets.md` - Update for Kanban-only usage
10. `CLAUDE.md` - Update real-time pattern section
11. `docs/architecture/ADRs/websocket-selective-usage.md` - NEW

### Commits (One per phase)

1. **Phase 1**: `refactor(web): remove websocket from data hooks (gifts, lists, persons, occasions)`
2. **Phase 2**: `refactor(web): replace websocket with polling in useIdeas`
3. **Phase 3**: `refactor(web): simplify websocket infrastructure for kanban-only usage`
4. **Phase 4**: `test(web): validate websocket simplification across all pages`
5. **Phase 5**: `docs: update architecture for kanban-only websockets`

---

## Sign-Off Criteria

Plan is ready for implementation when:

- ✅ This plan is reviewed and approved
- ✅ Phase 1 subagent (ui-engineer) is assigned
- ✅ WebSocket simplification is priority (no blocking dependencies)
- ✅ Progress tracking is set up (artifact-tracking skill)

Plan is complete when:

- ✅ All 5 phases finished
- ✅ All pages tested (Phase 4 validation)
- ✅ Documentation updated
- ✅ Zero WebSocket errors in browser
- ✅ Kanban board drag-and-drop works smoothly
- ✅ Code committed to feat/ui-overhaul branch

