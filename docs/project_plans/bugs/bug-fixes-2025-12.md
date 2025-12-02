# Bug Fixes - December 2025

## Overview

Monthly bug fix tracking document for the Family Gifting Dashboard.

---

### ListWithItems Pydantic Forward Reference Error

**Issue**: Opening a List fails with API error: `ListWithItems is not fully defined; you should define ListItemWithGift, then call ListWithItems.model_rebuild()`

- **Location**: `services/api/app/schemas/list.py:83-89`
- **Root Cause**: `ListWithItems` uses a forward reference `"ListItemWithGift"` via `TYPE_CHECKING` import, but never called `model_rebuild()` to resolve the reference at runtime. Pydantic requires forward references to be resolved before the model can be used.
- **Fix**: Added `model_rebuild()` call after class definition to resolve forward reference at module load time. Also fixed same issue in `list_item.py` for `ListItemWithAssignee` → `UserResponse`.
- **Commit(s)**: `5a6d6c8`
- **Status**: RESOLVED

---

### Gift Edit 405 Method Not Allowed

**Issue**: Editing a Gift fails - frontend PATCH requests receive 405 Method Not Allowed

- **Location**: `services/api/app/api/gifts.py:314`
- **Root Cause**: API endpoint used `@router.put()` but frontend (and all documentation examples) use PATCH for gift updates. Since `GiftUpdate` has all optional fields for partial updates, PATCH is the semantically correct method.
- **Fix**: Changed endpoint decorator from `@router.put()` to `@router.patch()` to match frontend expectations and REST semantics for partial updates.
- **Commit(s)**: `5a6d6c8`
- **Status**: RESOLVED

---

### Kanban Drag-and-Drop Status Update Failures

**Issue**: Dragging gifts in Kanban view to empty columns fails with two distinct errors:
1. `body -> status: String should match pattern '^(idea|selected|purchased|received)$'`
2. `Invalid status transition: idea → purchased. Valid transitions from idea: selected`

- **Location**:
  - `apps/web/components/lists/KanbanView.tsx:29,112-113`
  - `services/api/app/services/list_item.py:22-27`
- **Root Cause**: Two issues:
  1. **Status value mismatch**: Frontend Kanban columns use `to_buy` and `gifted`, but API expects `selected` and `received`. The frontend had display mapping (`selected`→`to_buy`) but no reverse mapping for updates.
  2. **Overly restrictive state machine**: Backend enforced linear transitions (`idea`→`selected`→`purchased`→`received`), preventing Kanban drag-and-drop to non-adjacent columns.
- **Fix**:
  1. Added `mapToApiStatus()` function in KanbanView.tsx to convert frontend column IDs to API status values before API calls
  2. Relaxed backend state machine to allow any-to-any status transitions for flexible Kanban UX
- **Commit(s)**: `784b755`
- **Status**: RESOLVED
