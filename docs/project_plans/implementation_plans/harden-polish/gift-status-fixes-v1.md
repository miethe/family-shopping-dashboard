---
title: "Implementation Plan: Gift Status Fixes"
description: "Fix Gift status persistence bugs and UI inconsistencies"
audience: [ai-agents, developers]
tags: [implementation, planning, gift-status, bug-fix, backend, frontend]
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
**Total Estimated Effort**: 26 story points
**Target Timeline**: 4-5 days

## Executive Summary

**ROOT CAUSE IDENTIFIED**: Gift status updates are not persisting because the backend service stores status in `extra_data` JSON field instead of the actual `Gift.status` database column. This causes:
- Status filtering returns wrong results (queries `Gift.status` column which is never updated)
- Status changes appear to work but revert on page refresh
- "Mark as Purchased" updates `purchase_date` but not `status` column

This plan addresses:
1. **CRITICAL**: Backend bugs preventing status persistence (Phase 0)
2. UI inconsistencies across status update locations (Phases 1-2)
3. Missing toast notifications (Phase 3)
4. Status visibility improvements (Phase 4)
5. Testing and validation (Phase 5)

## Root Cause Analysis

### The Bug

```
Data Flow (BROKEN):
─────────────────────────────────────────────────────────────────
Frontend: Update status to "purchased"
    ↓
PATCH /gifts/{id} { status: "purchased" }
    ↓
Backend: GiftService.update() at services/api/app/services/gift.py:309
    ├─ Handles: name, url, price, image_url, description, notes, etc.
    └─ ❌ MISSING: status field NOT handled (silently dropped)
    ↓
Database: Gift.status column = "idea" (unchanged)
    ↓
Frontend: Receives gift with status="idea" (old value)
```

```
Data Flow for Mark as Purchased (BROKEN):
─────────────────────────────────────────────────────────────────
Frontend: Mark as Purchased
    ↓
POST /gifts/{id}/mark-purchased { quantity_purchased: 1 }
    ↓
Backend: GiftService.mark_as_purchased() at services/api/app/services/gift.py:518
    ├─ Calculates: derived_status = "purchased" ✓
    ├─ Updates: extra_data["status"] = "purchased" ❌ WRONG FIELD
    ├─ Updates: purchase_date = today ✓
    └─ Gift.status column = "idea" (unchanged) ❌
    ↓
Filtering: WHERE Gift.status IN ('purchased') → NO RESULTS
```

### Files With Bugs

| File | Line(s) | Issue |
|------|---------|-------|
| `services/api/app/services/gift.py` | 309-387 | `update()` method ignores `status` field |
| `services/api/app/services/gift.py` | 518-546 | `mark_as_purchased()` stores status in `extra_data` instead of `status` column |

### Evidence

1. **GiftService.update()** (line 343-369): Builds `update_data` dict with all fields EXCEPT `status`
2. **GiftService.mark_as_purchased()** (line 534): `extra_data["status"] = derived_status` - wrong location
3. **GiftRepository.get_filtered()** (line 384-388): Correctly filters by `Gift.status` column, but that column is never updated

## Implementation Strategy

### Architecture Sequence

1. **Backend Service** (CRITICAL) - Fix status persistence bugs
2. **Frontend UI** - Fix visual inconsistencies
3. **Integration** - End-to-end validation
4. **Testing** - Regression + new tests

### Critical Path

**Backend fixes MUST come first** - no UI work matters until status actually persists.

```
Phase 0 (Backend) → Phase 1-4 (Frontend, parallel) → Phase 5 (Testing)
```

## Phase Breakdown

### Phase 0: Fix Backend Status Persistence (CRITICAL)

**Duration**: 0.5 day
**Dependencies**: None
**Assigned Subagent(s)**: python-backend-engineer

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|-------------|--------------|
| BE-001 | Fix GiftService.update() | Add status field handling to `update()` method in `services/api/app/services/gift.py` | When PATCH includes status, `Gift.status` column is updated | 2 pts | python-backend-engineer | None |
| BE-002 | Fix GiftService.mark_as_purchased() | Update `mark_as_purchased()` to set `Gift.status` column instead of `extra_data["status"]` | After mark_as_purchased, `Gift.status = 'purchased'` in DB | 2 pts | python-backend-engineer | None |
| BE-003 | Add backend tests | Add/update tests for status update flows | Tests verify status persists to DB column | 1 pt | python-backend-engineer | BE-001, BE-002 |

**Phase 0 Quality Gates:**
- [ ] `PATCH /gifts/{id}` with `status` field updates `Gift.status` column
- [ ] `POST /gifts/{id}/mark-purchased` updates `Gift.status` column to 'purchased'
- [ ] Filtering by status returns correct gifts
- [ ] Backend tests pass

**Key Files:**
- `services/api/app/services/gift.py` (lines 309-387, 518-546)

**Code Changes Required:**

```python
# BE-001: In update() method around line 366, ADD:
if data.status is not None:
    update_data["status"] = data.status

# BE-002: In mark_as_purchased() method around line 537, CHANGE:
update_payload = {
    "purchase_date": purchase_date,
    "extra_data": extra_data,
    "status": GiftStatus(derived_status),  # ADD THIS LINE
}
```

---

### Phase 1: Fix StatusSelector Component & Card Z-Index

**Duration**: 1 day
**Dependencies**: Phase 0 complete
**Assigned Subagent(s)**: ui-engineer-enhanced

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|-------------|--------------|
| UI-001 | Fix StatusSelector color inconsistency | Update `status-selector.tsx` to use correct colors for 'purchased' (distinct from 'received') | Purchased shows unique color (bg-status-purchased-100), matches StatusPill | 2 pts | ui-engineer-enhanced | BE-003 |
| UI-002 | Fix GiftCard z-index issue | Add proper z-index to StatusSelector dropdown on GiftCard so it renders above other cards | Dropdown menu appears above all other elements on page | 3 pts | ui-engineer-enhanced | BE-003 |
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
**Dependencies**: Phase 0 complete (can run parallel with Phase 1)
**Assigned Subagent(s)**: ui-engineer-enhanced, frontend-developer

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|-------------|--------------|
| UI-004 | Remove status from ManualGiftForm | Remove status field from ManualGiftForm (status is set on Gift, not during list item creation) | ManualGiftForm has no status field; gifts default to 'idea' | 2 pts | ui-engineer-enhanced | BE-003 |
| UI-005 | Update GiftEditModal status UI | Replace current status dropdown with StatusSelector component between Price and Product URL fields | GiftEditModal uses StatusSelector, field positioned between Price and Product URL | 2 pts | ui-engineer-enhanced | BE-003 |
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
**Dependencies**: Phase 0 complete
**Assigned Subagent(s)**: frontend-developer

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|-------------|--------------|
| UI-007 | Add toast on GiftCard status change | Show success toast after status update, error toast on failure | Toast appears: "Status updated to [status]" on success, error message on failure | 2 pts | frontend-developer | BE-003 |
| UI-008 | Add toast on GiftDetailModal status change | Show success toast after status update via dropdown or "Mark as Purchased" | Toast appears for both StatusSelector and Mark as Purchased button | 1 pt | frontend-developer | BE-003 |
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

### Phase 5: End-to-End Testing & Validation

**Duration**: 1 day
**Dependencies**: Phases 0-4 complete
**Assigned Subagent(s)**: frontend-developer, python-backend-engineer

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|-------------|--------------|
| TEST-001 | Test status filtering | Verify /gifts page filter works correctly with all status values after backend fix | Filtering by each status returns correct gifts | 2 pts | frontend-developer | UI-010 |
| TEST-002 | Test status persistence | Verify status updates persist across page refresh | Change status → refresh → status is still changed | 1 pt | frontend-developer | TEST-001 |
| TEST-003 | Test Mark as Purchased flow | Verify Mark as Purchased updates status column and is filterable | Mark as purchased → filter by purchased → gift appears | 1 pt | frontend-developer | TEST-001 |
| TEST-004 | Visual regression tests | Add/update visual tests for StatusSelector and StatusPill | Visual tests pass for all 4 status states | 2 pts | ui-engineer-enhanced | TEST-001 |

**Phase 5 Quality Gates:**
- [ ] Status changes persist after page refresh
- [ ] Filtering works correctly for all statuses
- [ ] Mark as Purchased sets status to 'purchased'
- [ ] Visual regression tests pass
- [ ] No page refresh required for status sync

**Key Files:**
- `apps/web/app/gifts/page.tsx`
- `services/api/tests/` (backend tests)
- Visual test files

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|--------|------------|-------------------|
| Backend fix breaks existing data | High | Low | Status column has default 'idea', existing data unaffected |
| extra_data migration needed | Medium | Low | Keep extra_data for backwards compat, prefer status column |
| React Query cache stale after fix | Medium | Medium | Force cache invalidation after backend fix deployed |

### Schedule Risks

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|--------|------------|-------------------|
| Backend fix takes longer | High | Low | Simple 2-line fixes, well-understood codebase |

---

## Resource Requirements

### Skill Requirements
- Python, FastAPI, SQLAlchemy (backend fixes)
- React, TypeScript, Tailwind CSS (frontend)
- React Query cache management

---

## Success Metrics

### Critical Success Criteria (Must Pass)
- [ ] Status updates persist to database `Gift.status` column
- [ ] Filtering by status returns correct gifts
- [ ] Mark as Purchased sets `status = 'purchased'`
- [ ] Status changes reflect immediately without page refresh

### Secondary Success Criteria
- [ ] All 8 UI issues from request resolved
- [ ] Toast notifications on status changes
- [ ] Consistent status colors across components

---

## Quick Reference

### Subagent Commands

```bash
# Phase 0: Backend fixes (CRITICAL - DO FIRST)
Task("python-backend-engineer", "Fix GiftService.update() in services/api/app/services/gift.py to handle status field. Around line 366, add: if data.status is not None: update_data['status'] = data.status")

Task("python-backend-engineer", "Fix GiftService.mark_as_purchased() in services/api/app/services/gift.py to update Gift.status column. Around line 537, add 'status': GiftStatus(derived_status) to update_payload dict")

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
Task("frontend-developer", "Test status filtering on /gifts page - verify all 4 status values filter correctly after backend fix")
```

---

**Progress Tracking:**

See `.claude/progress/gift-status-fixes/phase-progress.yaml` (to be created)

---

**Implementation Plan Version**: 2.0
**Last Updated**: 2025-12-09
