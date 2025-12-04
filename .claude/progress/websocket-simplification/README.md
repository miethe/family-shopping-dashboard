---
type: phase_progress_index
prd: websocket-simplification
title: "WebSocket Simplification - Master Progress Tracker"
status: draft
created: 2025-12-03
updated: 2025-12-03
---

# WebSocket Simplification Refactor - Master Progress Index

**PRD**: websocket-simplification
**Status**: Draft (ready for implementation)
**Timeline**: 5 phases, ~15 hours
**Assigned Teams**: ui-engineer, refactoring-expert, code-reviewer, documentation-writer

---

## Quick Reference

### Phase Overview

| Phase | Focus | Duration | Team | Status | File |
|-------|-------|----------|------|--------|------|
| 1 | Data Hooks Simplification | 2-3h | ui-engineer | pending | [phase-1-progress.md](./phase-1-progress.md) |
| 2 | Activity Layer Downgrade | 0.5-1h | ui-engineer | pending | [phase-2-progress.md](./phase-2-progress.md) |
| 3 | Infrastructure Cleanup | 2-2.5h | refactoring-expert, code-reviewer | pending | [phase-3-progress.md](./phase-3-progress.md) |
| 4 | Testing & Validation | 3-3.5h | code-reviewer, task-completion-validator | pending | [phase-4-progress.md](./phase-4-progress.md) |
| 5 | Documentation Updates | 1-1.5h | documentation-writer | pending | [phase-5-progress.md](./phase-5-progress.md) |
| **Total** | **Complete Refactor** | **~15 hours** | **4 roles** | **pending** | |

### Critical Path

```
Phase 1 (2h) → Phase 2 (0.5h) → Phase 3 (2h) → Phase 4 (3h) → Phase 5 (1.5h)
Sequential: ~9 hours
With parallel work: Can be done in 4-5 hours of calendar time
```

### Key Metrics

| Metric | Target | Status |
|--------|--------|--------|
| WebSocket code reduction | 60-70% | Target |
| Pages keeping WebSocket | 1 (Kanban) | Target |
| Pages moving to cache strategies | 5 | Target |
| Build errors | 0 | Pending validation |
| Console errors | 0 WebSocket-related | Pending validation |
| Kanban drag latency | < 100ms | Pending validation |

---

## Phase Breakdown

### Phase 1: Data Hooks Simplification

**What**: Remove WebSocket subscriptions from 4 data hooks, replace with React Query staleTime
**Why**: Gifts, lists, persons, and occasions are read-heavy and don't need real-time sync
**How**: Replace `useRealtimeSync()` with `staleTime` configuration

**Tasks** (4 total, all parallel):
- TASK-1.1: useGifts → staleTime: 5 minutes
- TASK-1.2: useLists → staleTime: 10 minutes
- TASK-1.3: usePersons → staleTime: 30 minutes
- TASK-1.4: useOccasions → staleTime: 30 minutes

**Deliverables**: 4 modified hook files
**File**: [phase-1-progress.md](./phase-1-progress.md)

---

### Phase 2: Activity Layer Downgrade

**What**: Replace WebSocket with polling in useIdeas hook
**Why**: Activity feed doesn't require real-time updates; 30-second polling is acceptable
**How**: Promote `usePollingFallback` from fallback-only to primary strategy

**Tasks** (1 total):
- TASK-2.1: useIdeas → Enable polling as primary (30s interval)

**Deliverables**: 1 modified hook file
**File**: [phase-2-progress.md](./phase-2-progress.md)

---

### Phase 3: Infrastructure Cleanup

**What**: Remove dead WebSocket code and simplify infrastructure for Kanban-only usage
**Why**: Phases 1-2 removed WebSocket from most hooks; clean up infrastructure complexity
**How**: Delete unused imports, simplify useRealtimeSync, remove unused types

**Tasks** (5 total, parallelizable with sequencing):
- TASK-3.1: Remove useRealtimeSync imports from 5 data hooks
- TASK-3.2: Simplify useRealtimeSync hook for Kanban only
- TASK-3.3: Remove unused WebSocket types
- TASK-3.4: Audit WebSocketProvider usage
- TASK-3.5: Delete dead code paths (depends on 3.1-3.4)

**Deliverables**: 6-8 modified infrastructure files
**File**: [phase-3-progress.md](./phase-3-progress.md)

---

### Phase 4: Testing & Validation

**What**: Comprehensive testing of all pages to validate refactor didn't break anything
**Why**: Quality gate before documentation; verify Kanban still works smoothly
**How**: Manual testing of each page, console validation, performance checks, graceful degradation

**Tasks** (9 total, sequential or by different testers):
- TASK-4.1: Test /gifts page
- TASK-4.2: Test /lists page
- TASK-4.3: Test /lists/[id] Kanban (CRITICAL)
- TASK-4.4: Test /people page
- TASK-4.5: Test /occasions page
- TASK-4.6: Test /dashboard & polling
- TASK-4.7: Browser console validation
- TASK-4.8: Graceful degradation (WebSocket down)
- TASK-4.9: Performance validation

**Deliverables**: Test results document, any bug fixes
**File**: [phase-4-progress.md](./phase-4-progress.md)

---

### Phase 5: Documentation Updates

**What**: Update project docs to reflect new Kanban-only WebSocket architecture
**Why**: Ensure future developers understand design decisions
**How**: Update guides, CLAUDE.md, create ADR, add code comments

**Tasks** (4 total, all parallel):
- TASK-5.1: Update websockets.md guide
- TASK-5.2: Update CLAUDE.md real-time pattern
- TASK-5.3: Create ADR (websocket-selective-usage)
- TASK-5.4: Add code comments to hooks

**Deliverables**: Updated docs, new ADR, code comments
**File**: [phase-5-progress.md](./phase-5-progress.md)

---

## Orchestration Strategy

### Team Assignment

| Team | Phases | Hours | Notes |
|------|--------|-------|-------|
| ui-engineer | 1, 2 | 2.5-4 | Can do in parallel for each phase |
| refactoring-expert | 3 | 2-2.5 | Most of Phase 3, clean code work |
| code-reviewer | 3, 4 | 3.5-4 | Infrastructure audit, testing |
| documentation-writer | 5 | 1-1.5 | All documentation tasks |

### Optimal Execution

**Option 1: Sequential (Safest)**
- Days 1-2: Phase 1 (ui-engineer)
- Day 2: Phase 2 (ui-engineer)
- Day 3: Phase 3 (refactoring-expert + code-reviewer)
- Days 4-5: Phase 4 (code-reviewer)
- Day 5-6: Phase 5 (documentation-writer)
- **Total**: ~6 days, 1-2 people per day

**Option 2: Parallel (Faster)**
- Day 1: Phase 1 & 2 in parallel (ui-engineer) = 2.5-3 hours
- Day 2: Phase 3 (refactoring-expert + code-reviewer) = 2 hours
- Day 3: Phase 4 (code-reviewer) = 3 hours
- Day 3-4: Phase 5 (documentation-writer) = 1.5 hours
- **Total**: ~3-4 days with 2-4 people

### Dependency Graph

```
Phase 1 (must complete first)
    ↓
Phase 2 (depends on Phase 1)
    ↓
Phase 3 (depends on Phase 1 & 2)
    ↓
Phase 4 (depends on Phase 1, 2 & 3)
    ↓
Phase 5 (depends on Phase 4, can be async)
```

**Parallelization Within Phases**:
- Phase 1: All 4 hooks can be done in parallel (4 people × 30min = 1.5h total)
- Phase 2: Single task, no parallelization
- Phase 3: Tasks 3.1-3.4 parallel, then 3.5 sequential (1h parallel + 0.5h sequential)
- Phase 4: Can assign tasks to different testers (spreads 3-3.5h across multiple people)
- Phase 5: All 4 tasks can be parallel (1h total)

---

## Task Quick Reference by Batch

### Batch 1: Initial Hook Modifications (Phase 1)

Can run in parallel:

```bash
# TASK-1.1
Task("ui-engineer", "TASK-1.1: Remove WebSocket from useGifts hook
File: apps/web/hooks/useGifts.ts
Change: Remove useRealtimeSync(), add staleTime: 5 * 60 * 1000")

# TASK-1.2
Task("ui-engineer", "TASK-1.2: Remove WebSocket from useLists hook
File: apps/web/hooks/useLists.ts
Change: Remove useRealtimeSync(), add staleTime: 10 * 60 * 1000")

# TASK-1.3
Task("ui-engineer", "TASK-1.3: Remove WebSocket from usePersons hook
File: apps/web/hooks/usePersons.ts
Change: Remove useRealtimeSync(), add staleTime: 30 * 60 * 1000")

# TASK-1.4
Task("ui-engineer", "TASK-1.4: Remove WebSocket from useOccasions hook
File: apps/web/hooks/useOccasions.ts
Change: Remove useRealtimeSync(), add staleTime: 30 * 60 * 1000")
```

---

## Success Criteria

### Phase-Level Success

| Phase | Success = All Criteria Met |
|-------|---------------------------|
| 1 | All 4 hooks modified, no useRealtimeSync imports, TypeScript passes |
| 2 | useIdeas polling enabled, no WebSocket, 30s interval works |
| 3 | No dead code, infrastructure 50% smaller, Kanban still works |
| 4 | All pages tested, Kanban smooth, no console errors, graceful degradation |
| 5 | Docs updated, ADR created, code commented, future-proof |

### Overall Success

Refactor is complete and successful when:
- [ ] All 5 phases complete
- [ ] Zero WebSocket errors in browser console
- [ ] Kanban drag-and-drop smooth (< 100ms latency)
- [ ] All pages load and work correctly
- [ ] App degrades gracefully without WebSocket
- [ ] Code reduction: 60%+ less WebSocket infrastructure
- [ ] Documentation updated and clear
- [ ] Changes committed to feat/ui-overhaul branch
- [ ] Ready for production deployment

---

## Files Modified Summary

### Total Files: ~15

**Phase 1 (4 files)**: Data hooks
- apps/web/hooks/useGifts.ts
- apps/web/hooks/useLists.ts
- apps/web/hooks/usePersons.ts
- apps/web/hooks/useOccasions.ts

**Phase 2 (1 file)**: Activity hook
- apps/web/hooks/useIdeas.ts

**Phase 3 (6-8 files)**: Infrastructure
- apps/web/hooks/useRealtimeSync.ts
- apps/web/lib/websocket/types.ts
- apps/web/lib/websocket/WebSocketProvider.tsx
- apps/web/components/websocket/ConnectionIndicator.tsx
- (plus related helper files)

**Phase 4 (0 files)**: Testing only, no code changes

**Phase 5 (3 files)**: Documentation
- /docs/guides/websockets.md
- /CLAUDE.md
- /docs/architecture/ADRs/websocket-selective-usage.md (NEW)

**Phase 5 (6 files)**: Code comments
- apps/web/hooks/useGifts.ts (comments only)
- apps/web/hooks/useLists.ts (comments only)
- apps/web/hooks/usePersons.ts (comments only)
- apps/web/hooks/useOccasions.ts (comments only)
- apps/web/hooks/useIdeas.ts (comments only)
- apps/web/hooks/useListItems.ts (comments only)

---

## Git Commits

One commit per phase:

1. **Phase 1**: `refactor(web): remove websocket from data hooks (gifts, lists, persons, occasions)`
2. **Phase 2**: `refactor(web): replace websocket with polling in useIdeas`
3. **Phase 3**: `refactor(web): simplify websocket infrastructure for kanban-only usage`
4. **Phase 4**: `test(web): validate websocket simplification across all pages`
5. **Phase 5**: `docs: update architecture documentation for kanban-only websockets`

All commits include:
```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Timeline Estimate

### Minimal (Sequential)
```
Day 1 AM: Phase 1 (2-3h) → 4 hooks modified
Day 1 PM: Phase 2 (0.5h) → 1 hook modified
Day 2 AM: Phase 3 (2-2.5h) → Infrastructure cleaned
Day 2-3: Phase 4 (3h) → All pages tested
Day 3-4: Phase 5 (1.5h) → Docs updated
Total: 4-5 days, 1 person can do most (except testing)
```

### Optimal (Parallel)
```
Day 1 AM: Phase 1 with 4 people (all hooks done in parallel)
Day 1 PM: Phase 2 with 1 person
Day 2 AM: Phase 3 with 2 people (refactor-expert + code-reviewer)
Day 2-3: Phase 4 with 2-3 people (parallel testing)
Day 3-4: Phase 5 with 1 person (docs)
Total: 3-4 calendar days, 2-4 people engaged
```

---

## Risk Assessment

### Low-Risk Items

- Phase 1: Hook modifications are isolated, easy to revert
- Phase 2: Polling fallback already exists, just enabling it
- Phase 5: Documentation changes, zero code risk

### Medium-Risk Items

- Phase 3: Infrastructure cleanup, but Kanban isolated and not touched
- Phase 4: Testing validates everything works

### Mitigation

- **Branch**: Work on feat/ui-overhaul branch (already exists)
- **Testing**: Phase 4 comprehensive validation before Phase 5
- **Kanban Protection**: useListItems hook NOT modified, WebSocket stays
- **Rollback**: Each phase is independent; can revert individual hooks if needed
- **Easy Verification**: Browser console validation catches errors immediately

---

## How to Use This Tracker

### For Project Managers

1. View this README for high-level overview
2. Share phase-specific progress files with team members
3. Track phases through completion
4. Use commit messages to track progress in git history

### For Developers

1. Read the relevant phase file (e.g., phase-1-progress.md)
2. Copy-paste Task() commands from "Orchestration Quick Reference"
3. Follow checklist for each task
4. Mark tasks as complete when done
5. Run "Quality Checklist" at end of phase

### For Code Reviewers

1. Review commits using PRD as reference
2. Validate against phase acceptance criteria
3. Use Phase 4 test results as quality gate

### For Documentation Writers

1. Use Phase 5 task descriptions
2. Follow "Required Changes" sections
3. Update docs to match implementation
4. Ensure examples are accurate

---

## Maintenance & Monitoring

### Post-Launch (1-2 weeks)

Watch for:
- User reports of "stale data"
- WebSocket errors in browser console
- Kanban board performance issues

### Long-Term

If real-time needs expand:
- Copy useListItems pattern (Kanban) to other features
- Adjust staleTime/polling intervals based on feedback
- Can add WebSocket back to specific features without affecting others

---

## References

### Full Documentation

- **PRD**: `/docs/project_plans/implementation_plans/refactors/websocket-simplification-v1.md`
- **Phase 1**: [phase-1-progress.md](./phase-1-progress.md)
- **Phase 2**: [phase-2-progress.md](./phase-2-progress.md)
- **Phase 3**: [phase-3-progress.md](./phase-3-progress.md)
- **Phase 4**: [phase-4-progress.md](./phase-4-progress.md)
- **Phase 5**: [phase-5-progress.md](./phase-5-progress.md)

### Related Project Docs

- **WebSocket Guide**: `/docs/guides/websockets.md`
- **Project CLAUDE.md**: `/CLAUDE.md`
- **Architecture ADRs**: `/docs/architecture/ADRs/`

---

## Status Tracking

### Current Status

```
Phase 1: PENDING (ready to start)
Phase 2: PENDING (blocked until Phase 1 complete)
Phase 3: PENDING (blocked until Phase 1 & 2 complete)
Phase 4: PENDING (blocked until Phase 1, 2 & 3 complete)
Phase 5: PENDING (blocked until Phase 4 complete)

Overall: DRAFT (ready for implementation)
```

### To Start Implementation

1. Review this README
2. Assign teams to phases (or individual contributors)
3. Start Phase 1 using phase-1-progress.md
4. Copy-paste Task() commands from "Orchestration Quick Reference"
5. Progress through phases sequentially (or with parallel work)
6. Commit at end of each phase
7. Create PR when all 5 phases complete

---

**Created**: 2025-12-03
**Last Updated**: 2025-12-03
**Status**: Draft - Ready for Implementation
**Next Step**: Assign teams and begin Phase 1
