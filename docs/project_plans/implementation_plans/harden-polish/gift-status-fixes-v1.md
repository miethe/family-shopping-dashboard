---
title: "Implementation Plan: Gift Status Fixes"
description: "Fix inconsistencies in Gift status implementation across all UI locations"
audience: [ai-agents, developers]
tags: [implementation, planning, gift-status, refactoring, ui-fixes]
created: 2025-12-09
updated: 2025-12-09
category: "product-planning"
status: draft
related:
  - /docs/project_plans/requests/gift-status.md
---

# Implementation Plan: Gift Status Fixes

**Plan ID**: `IMPL-2025-12-09-GIFT-STATUS-FIXES`
**Date**: 2025-12-09
**Author**: Implementation Planner Agent
**Related Documents**:
- **Request**: `/docs/project_plans/requests/gift-status.md`
- **Recent Commit**: `a6096daacd17db324de382bd9215ed17e4e2aecc` (GiftStatus enum refactor)

**Complexity**: Medium
**Total Estimated Effort**: 21 story points
**Target Timeline**: 3-4 days

## Executive Summary

This implementation fixes 8 identified issues with the Gift status system:
1. Status updates not reflecting correctly across all UI locations
2. StatusSelector dropdown z-index issues (renders below cards)
3. Divergent status fields between creation/editing flows
4. Missing toast notifications on status updates
5. Status dropdowns not showing current status value
6. Gift Lists incorrectly having status fields (should not exist)
7. Status visibility on cards/modals needs improvement
8. Real-time status sync across components

The work is frontend-focused with no database changes required. The GiftStatus enum is already correctly implemented in the backend.

## Current State Analysis

### Enum Definitions (Correct - No Changes Needed)

| Location | Values | Status |
|----------|--------|--------|
| Backend: `services/api/app/schemas/gift.py:27-33` | IDEA, SELECTED, PURCHASED, RECEIVED | ✅ Correct |
| Backend: `services/api/app/models/gift.py:30-36` | IDEA, SELECTED, PURCHASED, RECEIVED | ✅ Correct |
| Frontend: `apps/web/types/index.ts:319` | 'idea', 'selected', 'purchased', 'received' | ✅ Correct |

### Current Status Update Locations

| Component | File | Line(s) | Issue(s) |
|-----------|------|---------|----------|
| GiftCard StatusSelector | `apps/web/components/gifts/GiftCard.tsx` | 230-240, 355-364 | Z-index renders below other cards |
| GiftDetailModal StatusSelector | `apps/web/components/modals/GiftDetailModal.tsx` | 518-527 | Works correctly |
| GiftDetailModal "Mark as Purchased" | `apps/web/components/modals/GiftDetailModal.tsx` | 530-547 | Works correctly |
| GiftEditModal Status Dropdown | `apps/web/components/gifts/GiftEditModal.tsx` | 319-326 | Different UI than other locations |
| ManualGiftForm Status | `apps/web/components/gifts/ManualGiftForm.tsx` | 67, 420-426 | Uses ListItemStatus, wrong location |

### Identified Inconsistencies

1. **StatusSelector vs StatusPill Colors**: `StatusSelector` uses same colors for 'purchased' and 'received'; `StatusPill` correctly differentiates them
2. **ManualGiftForm**: Uses `ListItemStatus` type instead of `GiftStatus`, field positioned incorrectly
3. **GiftEditModal**: Has different status dropdown UI than StatusSelector component
4. **No toast notifications**: Status changes don't show success/error feedback
5. **Z-index issue**: StatusSelector dropdown on GiftCard renders below other cards

## Implementation Strategy

### Architecture Sequence

This is a frontend-only refactoring:
1. **UI Components** - Fix StatusSelector, unify status field
2. **State/Hooks** - Add toast notifications, ensure cache invalidation
3. **Integration** - Verify status sync across all locations
4. **Testing** - Unit + visual regression tests

### Parallel Work Opportunities

- Phase 1 (Component Fixes) and Phase 2 (Creation/Edit Flow) can run in parallel
- Phase 3 (Toast Notifications) can start after either phase

### Critical Path

StatusSelector z-index fix → Status field unification → Toast notifications → Testing

## Phase Breakdown

### Phase 1: Fix StatusSelector Component & Card Z-Index

**Duration**: 1 day
**Dependencies**: None
**Assigned Subagent(s)**: ui-engineer-enhanced

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|-------------|--------------|
| UI-001 | Fix StatusSelector color inconsistency | Update `status-selector.tsx` to use correct colors for 'purchased' (distinct from 'received') | Purchased shows unique color (bg-status-purchased-100), matches StatusPill | 2 pts | ui-engineer-enhanced | None |
| UI-002 | Fix GiftCard z-index issue | Add proper z-index to StatusSelector dropdown on GiftCard so it renders above other cards | Dropdown menu appears above all other elements on page | 3 pts | ui-engineer-enhanced | None |
| UI-003 | Display current status in dropdown | Ensure StatusSelector shows current status as selected value (not placeholder) | Dropdown trigger displays current gift status with correct color | 1 pt | ui-engineer-enhanced | UI-001 |

**Phase 1 Quality Gates:**
- [ ] StatusSelector colors match StatusPill for all 4 statuses
- [ ] Dropdown on GiftCard renders above other cards
- [ ] Current status visually indicated in dropdown trigger

**Key Files:**
- `apps/web/components/ui/status-selector.tsx`
- `apps/web/components/gifts/GiftCard.tsx`

---

### Phase 2: Unify Gift Creation/Edit Status Fields

**Duration**: 1 day
**Dependencies**: None (can run parallel with Phase 1)
**Assigned Subagent(s)**: ui-engineer-enhanced, frontend-developer

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|-------------|--------------|
| UI-004 | Remove status from ManualGiftForm | Remove status field from ManualGiftForm (status is set on Gift, not during list item creation) | ManualGiftForm has no status field; gifts default to 'idea' | 2 pts | ui-engineer-enhanced | None |
| UI-005 | Update GiftEditModal status UI | Replace current status dropdown with StatusSelector component between Price and Product URL fields | GiftEditModal uses StatusSelector, field positioned between Price and Product URL | 2 pts | ui-engineer-enhanced | None |
| UI-006 | Verify Gift creation flow | Ensure new gifts get default status 'idea' from backend, no frontend status field needed during creation | New gifts created with status='idea', visible on card after creation | 1 pt | frontend-developer | UI-004 |

**Phase 2 Quality Gates:**
- [ ] ManualGiftForm has no status field
- [ ] GiftEditModal uses StatusSelector component
- [ ] Status field positioned between Price and Product URL
- [ ] New gifts default to 'idea' status

**Key Files:**
- `apps/web/components/gifts/ManualGiftForm.tsx`
- `apps/web/components/gifts/GiftEditModal.tsx`

---

### Phase 3: Add Toast Notifications

**Duration**: 0.5 day
**Dependencies**: Phase 1 complete
**Assigned Subagent(s)**: frontend-developer

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|-------------|--------------|
| UI-007 | Add toast on GiftCard status change | Show success toast after status update, error toast on failure | Toast appears: "Status updated to [status]" on success, error message on failure | 2 pts | frontend-developer | UI-001 |
| UI-008 | Add toast on GiftDetailModal status change | Show success toast after status update via dropdown or "Mark as Purchased" | Toast appears for both StatusSelector and Mark as Purchased button | 1 pt | frontend-developer | UI-001 |
| UI-009 | Add toast on GiftEditModal save | Show success toast when gift is saved with status change | Toast appears: "Gift updated" on successful save | 1 pt | frontend-developer | UI-005 |

**Phase 3 Quality Gates:**
- [ ] Success toast on all status update methods
- [ ] Error toast on failure with clear message
- [ ] Toast doesn't block UI interaction

**Key Files:**
- `apps/web/components/gifts/GiftCard.tsx`
- `apps/web/components/modals/GiftDetailModal.tsx`
- `apps/web/components/gifts/GiftEditModal.tsx`

---

### Phase 4: Enhance Status Visibility

**Duration**: 0.5 day
**Dependencies**: Phase 1 complete
**Assigned Subagent(s)**: ui-engineer-enhanced

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|-------------|--------------|
| UI-010 | Enhance GiftCard status display | Make status more prominent on card with StatusPill component, visible without hover | Status visible on card at all times with color coding | 2 pts | ui-engineer-enhanced | UI-001 |
| UI-011 | Enhance GiftDetailModal status display | Ensure status is clearly visible in modal header/overview area | Status displayed prominently in modal with text and color | 1 pt | ui-engineer-enhanced | UI-001 |

**Phase 4 Quality Gates:**
- [ ] Status visible on GiftCard without interaction
- [ ] Status clearly displayed in GiftDetailModal
- [ ] Color coding matches GiftStatus enum semantics

**Key Files:**
- `apps/web/components/gifts/GiftCard.tsx`
- `apps/web/components/modals/GiftDetailModal.tsx`

---

### Phase 5: Real-Time Status Sync & Testing

**Duration**: 1 day
**Dependencies**: Phases 1-4 complete
**Assigned Subagent(s)**: frontend-developer, ui-engineer-enhanced

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|-------------|--------------|
| UI-012 | Verify React Query cache invalidation | Ensure status updates invalidate all relevant caches (gifts list, gift detail) | Status change on card immediately reflects in modal and vice versa | 2 pts | frontend-developer | UI-007 |
| UI-013 | Test status filtering integration | Verify /gifts page filter works correctly with all status values | Filtering by each status returns correct gifts | 1 pt | frontend-developer | UI-012 |
| UI-014 | Visual regression tests | Add/update visual tests for StatusSelector and StatusPill | Visual tests pass for all 4 status states | 2 pts | ui-engineer-enhanced | UI-012 |

**Phase 5 Quality Gates:**
- [ ] Status changes reflect immediately across all views
- [ ] Filtering works correctly for all statuses
- [ ] Visual regression tests pass
- [ ] No page refresh required for status sync

**Key Files:**
- `apps/web/hooks/useGifts.ts` (or similar)
- `apps/web/app/gifts/page.tsx`
- Visual test files

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|--------|------------|-------------------|
| Breaking existing status update flows | High | Medium | Test each flow individually before integration |
| React Query cache invalidation issues | Medium | Medium | Review existing cache keys, test thoroughly |
| Z-index conflicts with other modals/dropdowns | Low | Medium | Use consistent z-index scale from design system |

### Schedule Risks

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|--------|------------|-------------------|
| Discovery of additional status-related bugs | Medium | Medium | Allocate buffer time, prioritize critical fixes |

---

## Resource Requirements

### Skill Requirements
- React, TypeScript, Tailwind CSS
- React Query cache management
- Radix UI components (DropdownMenu, Toast)

---

## Success Metrics

### Delivery Metrics
- All 8 issues from request resolved
- Zero regression bugs
- All existing tests pass

### User Experience Metrics
- Status visible at all times on cards
- Status updates provide immediate feedback
- No Z-index rendering issues

---

## Quick Reference

### Subagent Commands

```bash
# Phase 1: StatusSelector fixes
Task("ui-engineer-enhanced", "Fix StatusSelector colors in apps/web/components/ui/status-selector.tsx - update 'purchased' to use bg-status-purchased-100, text-status-purchased-text to match StatusPill")

Task("ui-engineer-enhanced", "Fix z-index issue in GiftCard StatusSelector - ensure dropdown renders above other cards on /gifts page")

# Phase 2: Creation/Edit unification
Task("ui-engineer-enhanced", "Remove status field from ManualGiftForm in apps/web/components/gifts/ManualGiftForm.tsx")

Task("ui-engineer-enhanced", "Update GiftEditModal to use StatusSelector component, position between Price and Product URL")

# Phase 3: Toast notifications
Task("frontend-developer", "Add toast notifications on status change in GiftCard, GiftDetailModal, and GiftEditModal")

# Phase 4: Visibility
Task("ui-engineer-enhanced", "Enhance status visibility on GiftCard and GiftDetailModal with prominent StatusPill display")

# Phase 5: Testing
Task("frontend-developer", "Verify React Query cache invalidation on status updates across all components")
```

---

**Progress Tracking:**

See `.claude/progress/gift-status-fixes/phase-progress.yaml` (to be created)

---

**Implementation Plan Version**: 1.0
**Last Updated**: 2025-12-09
