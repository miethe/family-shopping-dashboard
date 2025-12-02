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
