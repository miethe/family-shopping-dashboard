---
title: "Implementation Plan: Gifts Action Bar Enhancements v1"
description: "Phased implementation of 7 gift card action bar features including status selection, list management, filters, price editing, and Santa toggle"
audience: [ai-agents, developers]
tags: [implementation, planning, gifts, frontend, backend, features]
created: 2025-12-22
updated: 2025-12-22
category: "product-planning"
status: ready
related:
  - /docs/project_plans/PRDs/features/gifts-action-bar-v1.md
---

# Implementation Plan: Gifts Action Bar Enhancements v1

**Plan ID**: `IMPL-2025-12-22-GIFTS-ACTION-BAR-V1`
**Date**: 2025-12-22
**Author**: Implementation Planning Orchestrator (Haiku)
**Related Documents**:
- **PRD**: `/docs/project_plans/PRDs/features/gifts-action-bar-v1.md`
- **GiftCard Component**: `apps/web/components/gifts/GiftCard.tsx`
- **Gift Model**: `services/api/app/models/gift.py`
- **Gift Schemas**: `services/api/app/schemas/gift.py`
- **Gift Hooks**: `apps/web/hooks/useGifts.ts`
- **Web Architecture**: `apps/web/CLAUDE.md`
- **API Architecture**: `services/api/CLAUDE.md`

**Complexity**: Medium (M)
**Total Estimated Effort**: 42 story points
**Target Timeline**: 2-3 weeks (10-15 business days)

---

## Executive Summary

This implementation plan delivers 7 quality-of-life enhancements to the Gift card action bar across the `/gifts` page. The feature set enables one-click status changes, multi-list assignment, inline price editing, clickable filters, and a "From Santa" personalization toggle. These improvements significantly reduce modal navigation and accelerate common gift management workflows for 2-3 user teams.

**Track**: Standard Track (Medium complexity, Haiku + Sonnet agents)

**Key Milestones**:
1. **Phase 1 (Days 1-2)**: Backend migration and schema updates
2. **Phase 2-5 (Days 3-10)**: Frontend components, mutations, and filters
3. **Phase 6 (Days 11-15)**: Comprehensive testing, polish, and documentation

**Success Criteria**:
- All 7 features fully implemented and tested
- 100% touch targets ≥44px on mobile
- <500ms interaction latency
- >80% test coverage
- WCAG 2.1 AA accessibility compliance
- Zero breaking API changes

---

## Implementation Strategy

### Architecture Sequence (MeatyPrompts Layers)

Following the project's layered architecture, work flows from foundation to presentation:

```
1. Database Layer     (Phase 1) → Migration for from_santa field
2. Repository Layer   (Phase 1) → No new queries, use existing gift repository
3. Service Layer      (Phase 1) → Updated schemas (DTOs) for from_santa
4. API Layer          (Phase 1) → Existing endpoints auto-support new field
5. UI Layer           (Phases 2-5) → Components (Status, List, Price, Santa)
6. Testing Layer      (Phase 6) → Unit, integration, E2E tests
7. Documentation      (Phase 6) → Component docs, API updates
8. Deployment         (Phase 6) → No feature flags needed; simple rollout
```

### Parallel Work Opportunities

**High Priority Parallelization**:
- **Phase 2-4 Frontend can start during Phase 1**: Backend changes are simple (schema-only); frontend components can be built in parallel using mock gift data
- **Phase 5 (Santa toggle) can start mid-Phase 2**: Independent of other features; purely additive
- **Phase 6 (Testing) can start Day 5 of Phase 1**: Write unit tests as components are completed

**Recommended Timeline**:
- **Days 1-2**: Backend (Phase 1) + Frontend component scaffolding
- **Days 3-8**: Phases 2-4 (Status, List, Price features) in parallel with Phase 1 completion
- **Days 6-10**: Phase 5 (Santa toggle) + parallel E2E test writing
- **Days 11-15**: Phase 6 (finalize tests, polish, accessibility audit, merge)

### Critical Path

1. **Phase 1 must complete first** (migration + schema updates)
2. **Phase 2 Status & List unblock Phase 3** (filters depend on data being present)
3. **Phase 6 testing can partially parallelize** but E2E requires all features working

**Estimated Critical Path**: 10 business days (Days 1-2 Backend, Days 3-10 Frontend, Days 11-15 Testing)

---

## Phase Breakdown Overview

| Phase | Name | Duration | Story Points | Subagent(s) | Output |
|-------|------|----------|--------------|-------------|--------|
| **1** | Backend: Migration & Schemas | 2 days | 5 pts | python-backend-engineer, data-layer-expert | Alembic migration, updated schemas |
| **2-5** | Frontend: Components & Mutations | 8 days | 25 pts | ui-engineer-enhanced, frontend-developer | 5 components + hooks + integration |
| **6** | Testing & Polish | 5 days | 12 pts | testing-specialist, code-reviewer | Tests, accessibility audit, docs |

**Detailed Phase Files**:
- **Phase 1 (Backend)**: [`gifts-action-bar-v1/phase-1-backend.md`](gifts-action-bar-v1/phase-1-backend.md)
- **Phase 2-5 (Frontend)**: [`gifts-action-bar-v1/phase-2-5-frontend.md`](gifts-action-bar-v1/phase-2-5-frontend.md)
- **Phase 6 (Testing)**: [`gifts-action-bar-v1/phase-6-testing.md`](gifts-action-bar-v1/phase-6-testing.md)

---

## Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Backend** | FastAPI, SQLAlchemy, Alembic, PostgreSQL | No new endpoints; existing PATCH /gifts/{id} handles all mutations |
| **Frontend** | Next.js (App Router), React Query, Tailwind, Radix UI | New components: StatusButton, ListPickerDropdown, PriceEditDialog |
| **Real-Time** | React Query cache invalidation | WebSockets not needed (gifts use RQ, not WebSocket like Kanban) |
| **Testing** | pytest, Vitest, React Testing Library, Playwright | Unit, integration, component, E2E |
| **Accessibility** | WCAG 2.1 AA (axe-core, keyboard nav, ARIA labels) | 44px touch targets, safe areas on iOS |

---

## Risk Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|-----------|
| **Dropdown positioning on mobile** | Menu appears off-screen or hidden | Medium | Use Radix `Popover` with auto-positioning; test on Safari iOS |
| **List creation dialog UX** | Nested dialog confuses users | Medium | Clear "Create New List" CTA; show success toast; return focus to list picker |
| **Optimistic update rollback** | Price or status fails but UI shows change | Low | Show error toast immediately; provide retry button; rollback optimistic state |
| **Multi-select list confusion** | Users select wrong lists | Low | Show list preview before Apply; require explicit confirmation |
| **Touch target sizes <44px** | Hard to tap on mobile | Low | Audit all interactive elements; use min 44x44px spacing |
| **Filter state persistence** | User navigates away, filter lost | Low | Store in URL query params (already supported by useGifts hook) |
| **Performance on large gift list** | Filter + render lags with 100+ gifts | Low | React Query pagination handles this; test with max 300 gifts |
| **From Santa toggle accident** | User toggles flag unintentionally | Very Low | Add tooltip; toast confirmation; not critical (low-risk toggle) |

---

## Dependencies & Integration Points

### Backend Dependencies
- **Gift Model** (`services/api/app/models/gift.py`): Add `from_santa: bool` field
- **Gift Schemas** (`services/api/app/schemas/gift.py`): Add `from_santa` to GiftCreate, GiftUpdate, GiftResponse
- **Migration** (`services/api/alembic/versions/`): Alembic auto-migration for new column
- **Existing API** (`services/api/app/api/gifts.py`): No changes needed; PATCH endpoint auto-supports new field

### Frontend Dependencies
- **GiftCard Component** (`apps/web/components/gifts/GiftCard.tsx`): Main integration point; add action bar buttons and callbacks
- **Gift Hooks** (`apps/web/hooks/useGifts.ts`): Existing hooks (useUpdateGift, useGifts) used for mutations and cache invalidation
- **LinkedEntityIcons** (`apps/web/components/gifts/LinkedEntityIcons.tsx`): Make avatars/badges clickable (connect to parent filter handlers)
- **Gifts Page** (`apps/web/pages/gifts/page.tsx`): Update filter state handlers; pass to GiftCard
- **Existing Components**: Use StatusSelector (exists), PersonDropdown (exists), create new: StatusButton, ListPickerDropdown, PriceEditDialog

### React Query Cache Invalidation
All mutations invalidate `['gifts']` query key to refetch list after any update (status, list, price, from_santa).

---

## Quality Gates

### Phase 1 Quality Gates (Backend)
- [ ] Alembic migration runs cleanly (`alembic upgrade head`)
- [ ] Gift model includes `from_santa: bool` field
- [ ] GiftCreate, GiftUpdate, GiftResponse schemas updated
- [ ] POST /gifts with `from_santa: true` returns 200
- [ ] PATCH /gifts/{id} with `from_santa` updates successfully
- [ ] Database column default is False
- [ ] No breaking API changes

### Phase 2-5 Quality Gates (Frontend)
- [ ] StatusButton component renders and mutation works
- [ ] ListPickerDropdown with checkboxes functional
- [ ] All 4 filters (status, person, list, price) clickable and updating URL params
- [ ] PriceEditDialog opens, saves, and validates input
- [ ] From Santa toggle displays icon when enabled
- [ ] Optimistic updates show immediately in UI
- [ ] Error toasts appear on failed mutations
- [ ] All buttons disabled during mutation (`isPending`)
- [ ] Dropdowns close on click-outside
- [ ] Mobile layout responsive; no overflow issues

### Phase 6 Quality Gates (Testing)
- [ ] Unit test coverage: >80% for new components
- [ ] Integration tests: Status update, list assignment, price edit, Santa toggle
- [ ] E2E test: Full workflow (status → list → filter → price → Santa)
- [ ] Accessibility: WCAG 2.1 AA passed (axe-core)
- [ ] Mobile: All touch targets ≥44px; safe areas respected
- [ ] Performance: Interactions <500ms; no layout thrash
- [ ] No console errors or warnings
- [ ] Responsive design tested on: iPhone SE, iPad, desktop
- [ ] Keyboard navigation: dropdowns, dialogs fully navigable
- [ ] Documentation: Component API docs, usage examples

---

## Success Metrics

| Metric | Target | Owner | Validation |
|--------|--------|-------|-----------|
| **Time to change status** | <2 sec (1 click desktop, 2 taps mobile) | Frontend Dev | Manual testing + user feedback |
| **List assignment from card** | >60% of assignments via card (vs modal) | Analytics (future) | Post-launch measurement |
| **Touch targets compliant** | 100% ≥44px on mobile | QA | Automated inspection tool |
| **Test coverage** | >80% unit, >70% integration | QA | pytest + Vitest reports |
| **E2E workflow passing** | 100% critical paths covered | QA | Playwright test report |
| **Accessibility score** | WCAG 2.1 AA (0 critical issues) | A11y Reviewer | axe-core audit |
| **Performance** | <500ms interactions, <1s page load | Frontend Dev | Chrome DevTools profiling |
| **API backward compatibility** | 100% (no breaking changes) | Backend Dev | API contract review |

---

## File Structure & Changes

### Files to Create (New)

```
services/api/
  alembic/versions/
    YYYY_MM_DD_HH_MM_SS_add_gift_from_santa.py     # Migration

apps/web/
  components/gifts/
    StatusButton.tsx                                # New component
    ListPickerDropdown.tsx                          # New component
    PriceEditDialog.tsx                             # New component

  __tests__/
    components/gifts/
      StatusButton.test.tsx                         # New test
      ListPickerDropdown.test.tsx                   # New test
      PriceEditDialog.test.tsx                      # New test
    integration/
      gifts-action-bar-workflow.test.tsx            # New test
    e2e/
      gifts-action-bar.spec.ts                      # New test
```

### Files to Modify (Existing)

```
services/api/
  app/
    models/
      gift.py                                       # Add from_santa field
    schemas/
      gift.py                                       # Add from_santa to schemas

apps/web/
  components/gifts/
    GiftCard.tsx                                    # Add buttons, callbacks, dialogs
    LinkedEntityIcons.tsx                           # Make icons clickable
  pages/gifts/
    page.tsx                                        # Handle filter callbacks
  hooks/
    useGifts.ts                                     # May add helper hook if needed
```

---

## Implementation Checklist

### Phase 1: Backend (Days 1-2)
- [ ] Create Alembic migration file
- [ ] Add `from_santa: bool` to Gift model
- [ ] Update GiftCreate schema
- [ ] Update GiftUpdate schema
- [ ] Update GiftResponse schema
- [ ] Run migration locally
- [ ] Test POST /gifts with `from_santa`
- [ ] Test PATCH /gifts/{id} updates `from_santa`

### Phase 2: Status & List UI (Days 3-4)
- [ ] Create StatusButton component
- [ ] Create ListPickerDropdown component
- [ ] Wire up useUpdateGift mutations
- [ ] Update GiftCard action bar layout
- [ ] Update mobile menu
- [ ] Test on mobile (responsive, 44px targets)
- [ ] Add error handling + toast feedback

### Phase 3: Clickable Filters (Days 5-6)
- [ ] Make status chip clickable
- [ ] Make person avatars clickable
- [ ] Make list badges clickable
- [ ] Update /gifts page to handle filter callbacks
- [ ] Add visual active filter indicators
- [ ] Test filter toggling
- [ ] Test URL param updates

### Phase 4: Price Dialog (Days 7-8)
- [ ] Create PriceEditDialog component
- [ ] Make price text clickable on GiftCard
- [ ] Add input validation (decimal, non-negative, max 10k)
- [ ] Add "No price" checkbox
- [ ] Wire up useUpdateGift mutation
- [ ] Test on mobile (positioning, input size)
- [ ] Add error handling + retry

### Phase 5: From Santa Toggle (Days 9-10)
- [ ] Add From Santa toggle to action bar
- [ ] Add toggle to mobile menu
- [ ] Wire up useUpdateGift mutation
- [ ] Add Santa icon display logic
- [ ] Position icon (top-right, no occlusion)
- [ ] Add tooltip "From Santa"
- [ ] Test icon shows/hides correctly

### Phase 6: Testing & Polish (Days 11-15)
- [ ] Unit tests for new components (>80% coverage)
- [ ] Integration tests for mutations
- [ ] E2E test for full workflow
- [ ] Mobile responsiveness audit
- [ ] Keyboard navigation test
- [ ] Touch target audit (≥44px)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance profiling
- [ ] Update component docs
- [ ] Update API docs for `from_santa` field
- [ ] Bug fixes and polish

---

## Communication & Status Tracking

**Progress Tracking**: See `.claude/progress/gifts-action-bar-v1/` for detailed phase-by-phase updates.

**Reporting Cadence**:
- Daily standup: Blockers, progress
- End of Phase 1: Backend sign-off
- End of Phase 4: Frontend feature complete
- End of Phase 6: Testing complete, ready for merge

---

## Post-Implementation

**Monitoring**:
- Watch error logs for gift update failures
- Monitor API response times (should be <200ms)
- Collect user feedback on new features

**Future Iterations**:
- Bulk gift actions (multi-select)
- Drag-drop reordering
- Advanced filtering UI
- Custom sort orders
- WebSocket real-time sync for collaborative teams (if needed)

---

## References

### Core Documentation
- **PRD**: `/docs/project_plans/PRDs/features/gifts-action-bar-v1.md`
- **North Star**: `/docs/project_plans/north-star/family-gifting-dash.md`
- **Project Guidelines**: `/CLAUDE.md`
- **API Patterns**: `/services/api/CLAUDE.md`
- **Web Patterns**: `/apps/web/CLAUDE.md`

### Component References
- **GiftCard**: `apps/web/components/gifts/GiftCard.tsx` (lines 335–378 action bar)
- **StatusSelector**: `apps/web/components/gifts/StatusSelector.tsx` (existing component to learn from)
- **PersonDropdown**: Existing component for single-select pattern
- **Radix UI**: `Popover`, `DropdownMenu`, `Dialog` components

### Hook References
- **useGifts**: `apps/web/hooks/useGifts.ts` (list fetching)
- **useUpdateGift**: Existing mutation hook for updates
- **useQueryClient**: For cache invalidation

---

## Detailed Phase Plans

For comprehensive task breakdowns, acceptance criteria, and implementation details, see:

1. **[Phase 1: Backend Migration & Schemas](gifts-action-bar-v1/phase-1-backend.md)** (Days 1-2, 5 pts)
2. **[Phases 2-5: Frontend Components & Mutations](gifts-action-bar-v1/phase-2-5-frontend.md)** (Days 3-10, 25 pts)
3. **[Phase 6: Testing & Polish](gifts-action-bar-v1/phase-6-testing.md)** (Days 11-15, 12 pts)

---

**Plan Version**: 1.0
**Last Updated**: 2025-12-22
**Status**: Ready for Phase 1 Start
**Approval**: Pending team review
