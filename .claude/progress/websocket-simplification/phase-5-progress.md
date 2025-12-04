---
type: phase_progress
prd: websocket-simplification
phase: 5
title: "Phase 5: Documentation Updates"
status: pending
progress: 0%
estimated_hours: 1-1.5
assigned_to: ["documentation-writer"]
dependencies: ["phase-1-progress.md", "phase-2-progress.md", "phase-3-progress.md", "phase-4-progress.md"]
created: 2025-12-03
updated: 2025-12-03
---

# Phase 5: Documentation Updates

**Status**: Pending (blocked until Phase 1, 2, 3 & 4 complete)
**Progress**: 0%
**Estimated Duration**: 1-1.5 hours
**Assigned Team**: documentation-writer
**Depends On**: Phase 1, 2, 3 & 4 completion

## Phase Overview

Update project documentation to reflect the new WebSocket architecture where real-time sync is used only for Kanban board, and other pages use React Query cache strategies (staleTime, polling). This ensures future developers understand the design decisions and implementation patterns.

**Key Principle**: Documentation should be accurate, updated, and explain WHY decisions were made, not just WHAT was done.

---

## Orchestration Quick Reference

Copy-paste ready Task() commands for Phase 5. All four tasks can run in parallel.

```
Task("documentation-writer", "TASK-5.1: Update websockets.md guide
File: /docs/guides/websockets.md

Current Content:
- Guide covers WebSocket usage across all pages
- Explains real-time sync pattern as default
- Examples show WebSocket for various features
- Focused on implementation details

Required Changes:
1. Add section: 'Where WebSockets Are Used (Kanban Board Only)'
2. Update architecture section to show Kanban highlighted
3. Change examples to show polling pattern for non-Kanban data
4. Add rationale: Why WebSockets removed from read-heavy pages
5. Add section: 'Cache Strategies for Non-Real-Time Data'
6. Update code examples to match new patterns
7. Add migration guide (reference to phase-completed work)

New Content to Add:

## Kanban-Only Architecture

WebSockets are now used ONLY for Kanban board drag-and-drop updates:

[Diagram]
REST API + staleTime ← /gifts, /lists, /people, /occasions
REST API + polling ← /dashboard (idea inbox)
REST API + WebSocket ← /lists/[id] (Kanban board)

## Read-Heavy Pages Use staleTime

Pages where data changes infrequently use React Query's staleTime:
- /gifts: 5 minutes
- /lists: 10 minutes
- /people: 30 minutes
- /occasions: 30 minutes

## Activity Feed Uses Polling

Idea inbox (/dashboard) polls every 30 seconds for fresh activity.

Acceptance Criteria:
✓ Document reflects Kanban-only usage
✓ Examples show new patterns
✓ Rationale explained
✓ Code examples are accurate
✓ No broken links
✓ Diagram updated or removed
✓ Migration notes included

Reference: See PRD Phase 5 Documentation Changes section")
```

```
Task("documentation-writer", "TASK-5.2: Update CLAUDE.md real-time pattern section
File: /CLAUDE.md

Current Content:
- Prime Directives section states 'Real-time first'
- Real-Time Pattern section assumes WebSocket for all
- WebSocket structure shown as default

Required Changes:
1. Update Prime Directives: Change 'Real-time first' to 'Real-time where needed'
2. Rewrite Real-Time Pattern section with new architecture
3. Add anti-pattern: 'Don't use WebSockets for read-heavy pages'
4. Update example code to show staleTime pattern
5. Link to websockets.md for details
6. Add decision rationale

Changes:

From:
| Real-time first | WebSocket core, not optional |

To:
| Real-time where needed | WebSocket for Kanban, cache strategies elsewhere |

New Section: Real-Time Pattern (Updated)

WebSocket connections are now selective:

✓ USE WebSocket for:
- Kanban board drag-and-drop (Kanban board collaboration)
- Any simultaneous editing scenario
- Features requiring < 100ms latency

✓ USE React Query Cache for:
- Read-heavy pages (gifts, lists, people, occasions)
- Infrequently updated data
- Non-collaborative features

✓ USE Polling for:
- Activity feeds (idea inbox)
- Low-frequency updates
- Data that doesn't need real-time sync

Pattern Selection:
1. Is this simultaneous editing? → WebSocket
2. Does data rarely change? → staleTime
3. Is this a feed/activity? → Polling
4. Is this read-heavy? → staleTime

Acceptance Criteria:
✓ Prime Directives updated
✓ Real-Time Pattern section reflects new architecture
✓ Code examples match new patterns
✓ Anti-patterns documented
✓ Rationale explained
✓ CLAUDE.md is accurate
✓ No broken references

Reference: See PRD Phase 5 Documentation Changes section")
```

```
Task("documentation-writer", "TASK-5.3: Create architecture decision record (ADR)
File: /docs/architecture/ADRs/websocket-selective-usage.md (NEW)

Current State:
- No ADR exists for WebSocket architecture decision
- Future developers won't understand WHY WebSockets are Kanban-only

Required Changes:
Create new ADR file with standard format:

# ADR-XXX: WebSocket Use Limited to Kanban Board

## Status
Accepted

## Context
Initial implementation used WebSocket for all real-time features (gifts, lists,
persons, occasions, ideas, list-items). For a 2-3 user family app with mostly
read-only access patterns, this over-engineered the system.

## Decision
Removed WebSocket subscriptions from read-heavy pages. Only Kanban board
retains WebSocket for true simultaneous editing scenario.

## Rationale
- 2-3 user app: Polling/cache sufficient for most features
- Read-heavy workload: 95%+ of data access is read-only
- Complexity reduction: 60% less WebSocket code
- Performance: Fewer subscriptions, less server load
- Simplicity: Easier for future developers to understand

## Alternatives Considered
1. Keep WebSocket everywhere (rejected: over-engineered)
2. Remove WebSocket entirely (rejected: Kanban needs real-time)
3. Use Server-Sent Events (rejected: polling sufficient for non-Kanban)
4. Selective WebSocket (CHOSEN: Kanban only)

## Consequences
- Positive: Simpler code, easier maintenance, same UX quality
- Positive: Reduced infrastructure complexity
- Positive: Lower server resource usage
- Negative: Ideas appear with 30s latency (acceptable)
- Negative: Data updates with 5-30min latency (acceptable for static data)

## Implementation
See websocket-simplification refactor:
- Phase 1: Remove WebSocket from data hooks
- Phase 2: Switch ideas to polling
- Phase 3: Clean up infrastructure
- Phase 4: Validate all pages
- Phase 5: Document decision

Acceptance Criteria:
✓ ADR file created in docs/architecture/ADRs/
✓ Uses standard ADR format (Status, Context, Decision, etc.)
✓ Clearly explains rationale
✓ Documents trade-offs
✓ References implementation phases
✓ Future developer understands decision

Reference: See PRD Phase 5 Documentation Changes section")
```

```
Task("documentation-writer", "TASK-5.4: Add code comments explaining new patterns
Files: apps/web/hooks/useGifts.ts, apps/web/hooks/useLists.ts,
       apps/web/hooks/usePersons.ts, apps/web/hooks/useOccasions.ts,
       apps/web/hooks/useIdeas.ts, apps/web/hooks/useListItems.ts

Current State:
- Hooks have no comments explaining cache strategy choices
- Future developers won't understand staleTime values or polling intervals

Required Changes:
Add JSDoc comments to each hook explaining:
1. Why staleTime/polling is used instead of WebSocket
2. What the staleTime/polling interval means
3. When data is considered fresh vs stale
4. Link to architecture decision

Example for useGifts:

/**
 * Hook for fetching and caching gift list data.
 *
 * This hook uses React Query staleTime strategy instead of WebSocket because:
 * - Gifts are user-generated (infrequent updates)
 * - 5-minute staleness is acceptable UX (users don't check constantly)
 * - Reduces server load and infrastructure complexity
 *
 * Cache behavior:
 * - staleTime: 5 minutes - Data is considered fresh for 5 min
 * - refetchOnWindowFocus: true - Refetch when user returns to tab
 * - After 5 min: Next query request triggers fresh fetch
 *
 * Real-time updates for collaborative features (Kanban) use WebSocket
 * instead. See useListItems hook for WebSocket pattern.
 *
 * Related: /docs/architecture/ADRs/websocket-selective-usage.md
 */

Acceptance Criteria:
✓ JSDoc comments added to all hooks
✓ Explains WHY pattern chosen (not just what)
✓ Explains staleTime/polling values
✓ Links to ADR for context
✓ Code is self-documenting
✓ No typos or formatting issues

Reference: See PRD Phase 5 Documentation Changes section")
```

---

## Task Breakdown

### TASK-5.1: Update websockets.md Guide

**Duration**: 30 minutes
**Status**: pending
**Assigned to**: documentation-writer

| Aspect | Detail |
|--------|--------|
| **File** | `/docs/guides/websockets.md` |
| **Change Type** | Documentation update |
| **Scope** | Reflect Kanban-only architecture |
| **Complexity** | Low |
| **Risk** | None (documentation only) |

**Detailed Acceptance Criteria**:

- [ ] Section added: "Where WebSockets Are Used (Kanban Only)"
- [ ] Architecture diagram updated or clarified
- [ ] Examples show polling pattern for non-Kanban
- [ ] Rationale explained: Why removed from read-heavy pages
- [ ] Section added: "Cache Strategies for Non-Real-Time Data"
- [ ] Code examples match implementation
- [ ] No broken links
- [ ] Document structure is clear
- [ ] Easy for new developers to understand

**Key Content Areas**:

1. **Introduction**: Clarify WebSocket is selective, not universal
2. **Architecture Diagram**: Show REST + staleTime, REST + polling, REST + WebSocket separation
3. **Kanban Board Section**: Details on WebSocket usage for list items
4. **Cache Strategy Section**: Explain staleTime for gifts, lists, persons, occasions
5. **Polling Section**: Explain 30-second polling for ideas/inbox
6. **Why Selective**: Rationale for 2-3 user app
7. **Examples**: Code showing each pattern

---

### TASK-5.2: Update CLAUDE.md Real-Time Pattern

**Duration**: 20 minutes
**Status**: pending
**Assigned to**: documentation-writer

| Aspect | Detail |
|--------|--------|
| **File** | `/CLAUDE.md` |
| **Change Type** | Documentation update |
| **Scope** | Real-time pattern section |
| **Complexity** | Low |
| **Risk** | None (documentation only) |

**Detailed Acceptance Criteria**:

- [ ] Prime Directives: "Real-time first" updated to "Real-time where needed"
- [ ] Real-Time Pattern section rewritten
- [ ] Anti-pattern added: "Don't use WebSockets for read-heavy pages"
- [ ] Pattern decision tree provided (WebSocket? staleTime? Polling?)
- [ ] Code examples show new patterns
- [ ] Link to websockets.md guide
- [ ] CLAUDE.md accurate and current
- [ ] Future developers know pattern selection logic

**Key Sections**:

1. **Prime Directives**: Update table with "Real-time where needed"
2. **Real-Time Pattern**: Rewrite with selective WebSocket approach
3. **Pattern Selection Guide**: Decision tree
4. **Use WebSocket For**: Kanban board examples
5. **Use staleTime For**: Read-heavy pages examples
6. **Use Polling For**: Activity feeds examples
7. **Anti-Pattern**: What NOT to do (WebSocket for read-only data)

---

### TASK-5.3: Create Architecture Decision Record (ADR)

**Duration**: 20 minutes
**Status**: pending
**Assigned to**: documentation-writer

| Aspect | Detail |
|--------|--------|
| **File** | `/docs/architecture/ADRs/websocket-selective-usage.md` (NEW) |
| **Change Type** | New documentation |
| **Scope** | ADR for WebSocket decision |
| **Complexity** | Low |
| **Risk** | None (new file, no impact) |

**Detailed Acceptance Criteria**:

- [ ] ADR file created in correct location
- [ ] Uses standard ADR format (Status, Context, Decision, Rationale, etc.)
- [ ] Clearly explains why WebSocket limited to Kanban
- [ ] Documents trade-offs (pros/cons)
- [ ] References implementation phases
- [ ] Links to websockets.md guide
- [ ] Easy for future developers to understand decision
- [ ] Properly formatted Markdown

**ADR Structure**:

1. **Title**: Descriptive of decision
2. **Status**: Accepted
3. **Context**: Why decision was needed
4. **Decision**: What was decided
5. **Rationale**: Why this decision
6. **Alternatives Considered**: Other options and why rejected
7. **Consequences**: Positive and negative impacts
8. **Implementation**: Reference to phases
9. **References**: Links to related docs

---

### TASK-5.4: Add Code Comments

**Duration**: 10 minutes
**Status**: pending
**Assigned to**: documentation-writer

| Aspect | Detail |
|--------|--------|
| **Files** | 6 hook files |
| **Change Type** | Code comments |
| **Scope** | Add JSDoc explaining patterns |
| **Complexity** | Very Low |
| **Risk** | None (comments only) |

**Detailed Acceptance Criteria**:

- [ ] JSDoc added to useGifts explaining staleTime: 5min
- [ ] JSDoc added to useLists explaining staleTime: 10min
- [ ] JSDoc added to usePersons explaining staleTime: 30min
- [ ] JSDoc added to useOccasions explaining staleTime: 30min
- [ ] JSDoc added to useIdeas explaining polling: 30s
- [ ] JSDoc added to useListItems noting WebSocket usage
- [ ] Each explains WHY pattern chosen
- [ ] Each links to ADR or guide
- [ ] Code is self-documenting
- [ ] No typos or formatting issues

**Comment Template**:

```javascript
/**
 * Hook for fetching [data type].
 *
 * Cache Strategy: [staleTime / Polling / WebSocket]
 *
 * Rationale:
 * - [Reason 1]
 * - [Reason 2]
 *
 * Behavior:
 * - [staleTime value or polling interval]
 * - [Refetch behavior]
 *
 * See: /docs/architecture/ADRs/websocket-selective-usage.md
 */
```

---

## Quality Checklist (All Tasks)

After completing all Phase 5 tasks, verify:

### Documentation Quality
- [ ] websockets.md is accurate and current
- [ ] CLAUDE.md reflects new architecture
- [ ] ADR exists and is well-written
- [ ] Code comments are clear and helpful
- [ ] No broken links
- [ ] No outdated references

### Content Quality
- [ ] Rationale explained (not just WHAT, but WHY)
- [ ] Examples match actual implementation
- [ ] Future developers can understand decisions
- [ ] Anti-patterns documented
- [ ] Trade-offs clearly stated

### Technical Accuracy
- [ ] staleTime values correct (5min, 10min, 30min)
- [ ] Polling interval correct (30s)
- [ ] WebSocket usage accurate (Kanban only)
- [ ] Code examples work as shown
- [ ] References accurate

### Completeness
- [ ] All hooks documented with comments
- [ ] All pages' cache strategies documented
- [ ] Architecture decision documented in ADR
- [ ] Guide updated for new patterns
- [ ] CLAUDE.md updated for new patterns

---

## Deliverables

### Files Modified (8 total)

**Documentation (4 files)**:
1. `/docs/guides/websockets.md` - Updated guide
2. `/CLAUDE.md` - Updated real-time pattern section
3. `/docs/architecture/ADRs/websocket-selective-usage.md` - NEW ADR
4. Various hook files - Added JSDoc comments (4 files: useGifts, useLists, usePersons, useOccasions, useIdeas, useListItems)

### Commit Message

After all Phase 5 tasks complete, create commit:

```
docs: update architecture documentation for kanban-only websockets

Update project documentation to reflect Phase 1-4 WebSocket simplification:

Documentation Updates:
- /docs/guides/websockets.md: Now covers Kanban-only usage pattern
- /CLAUDE.md: Updated real-time pattern section with selective approach
- NEW: /docs/architecture/ADRs/websocket-selective-usage.md (decision record)

Code Comments:
- useGifts: Explains 5-minute staleTime strategy
- useLists: Explains 10-minute staleTime strategy
- usePersons: Explains 30-minute staleTime strategy
- useOccasions: Explains 30-minute staleTime strategy
- useIdeas: Explains 30-second polling strategy
- useListItems: Notes WebSocket usage for Kanban real-time sync

These changes ensure future developers understand the rationale behind
selective WebSocket usage and the cache strategies used elsewhere.

This completes the websocket-simplification refactor (all 5 phases).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Progress Tracking

| Task | Status | Assigned | Estimate | Completed |
|------|--------|----------|----------|-----------|
| TASK-5.1: Update websockets.md | pending | documentation-writer | 30 min | - |
| TASK-5.2: Update CLAUDE.md | pending | documentation-writer | 20 min | - |
| TASK-5.3: Create ADR | pending | documentation-writer | 20 min | - |
| TASK-5.4: Add code comments | pending | documentation-writer | 10 min | - |
| **Phase 5 Total** | **pending** | **documentation-writer** | **1.5 hours** | **0%** |

---

## Context for AI Agents

### What This Phase Accomplishes

Ensures that the WebSocket simplification changes are properly documented for future maintainers. This is essential because architectural decisions need to be recorded; otherwise, future developers might not understand why WebSocket is used selectively, not universally.

### Documentation Philosophy

**Explain Why, Not Just What**: Comments and ADRs should explain the reasoning behind decisions. "Why did we use staleTime instead of WebSocket?" is more important than "We use staleTime".

**Make Code Self-Documenting**: Future developers should be able to read a hook and understand its caching strategy without hunting through PRDs.

### Key Decision to Document

**Primary Decision**: WebSockets are now selective (Kanban only), not universal.

**Rationale**:
- 2-3 user family app (small scale)
- 95%+ read-only access patterns
- Only Kanban requires real-time simultaneous editing
- staleTime and polling are simpler and sufficient elsewhere

### Success Indicators

✓ Phase 5 complete when:
1. All 4 tasks marked complete
2. websockets.md updated and accurate
3. CLAUDE.md reflects new architecture
4. ADR created and well-written
5. Code comments added to all hooks
6. Documentation is clear and helpful
7. All changes committed to feat/ui-overhaul branch

✓ Refactoring complete when:
1. Phase 5 complete
2. All documentation merged
3. Ready to close websocket-simplification PRD

---

## Post-Implementation

### For Future Reference

After Phase 5 completes, the WebSocket simplification refactoring is done. Future developers can:

1. Read `/docs/guides/websockets.md` for pattern overview
2. Read `/CLAUDE.md` for selection logic
3. Read `/docs/architecture/ADRs/websocket-selective-usage.md` for decision rationale
4. Read hook comments in code for specific implementations

### Monitoring Period

For 1-2 weeks post-launch:
- Watch for user reports of "stale data"
- Monitor browser console for WebSocket errors
- Verify Kanban board performance stays smooth

### Potential Future Changes

If real-time needs expand later:
- Can add WebSocket to other features by copying useListItems pattern
- staleTime values can be adjusted if data feels stale
- Polling intervals can be tuned based on feedback

---

## Related Documentation

- **Full PRD**: `/docs/project_plans/implementation_plans/refactors/websocket-simplification-v1.md`
- **Phase 1 Progress**: `.claude/progress/websocket-simplification/phase-1-progress.md`
- **Phase 2 Progress**: `.claude/progress/websocket-simplification/phase-2-progress.md`
- **Phase 3 Progress**: `.claude/progress/websocket-simplification/phase-3-progress.md`
- **Phase 4 Progress**: `.claude/progress/websocket-simplification/phase-4-progress.md`

---

**Last Updated**: 2025-12-03
**Status**: Draft - Ready for Deployment (after Phase 1, 2, 3 & 4 complete)

---

## FINAL SIGN-OFF CHECKLIST

Phase 5 (and entire websocket-simplification refactor) is complete when:

- [ ] All 5 phases completed
- [ ] All files modified/created
- [ ] All tests passed (Phase 4)
- [ ] All documentation updated (Phase 5)
- [ ] All commits made
- [ ] Code merged to feat/ui-overhaul
- [ ] PR ready for review
- [ ] Ready for deployment

**Estimated Total Time**: ~9-15 hours
**Team Size**: 4 people (Phases can overlap)
**Impact**: 60% code reduction in WebSocket infrastructure
**Risk Level**: Low (Kanban protected, graceful degradation verified)

---

**Refactoring Complete**: Ready for production deployment.
