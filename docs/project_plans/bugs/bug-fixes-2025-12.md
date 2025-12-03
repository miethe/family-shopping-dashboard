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

---

### Build Error: AddPersonModal Import Path

**Issue**: Build fails with `Module not found: Can't resolve '@/components/persons/AddPersonModal'`

- **Location**: `apps/web/components/modals/ListDetailModal.tsx`
- **Root Cause**: Import path used `persons` but the directory is named `people`
- **Fix**: Changed import from `@/components/persons/AddPersonModal` to `@/components/people/AddPersonModal`
- **Commit(s)**: `6a3ea9a`
- **Status**: RESOLVED

---

### Build Error: lucide-react Import in StatusSelector

**Issue**: Build fails with `Module not found: Can't resolve 'lucide-react'`

- **Location**: `apps/web/components/ui/status-selector.tsx`
- **Root Cause**: Project uses custom icons from `@/components/ui/icons`, not direct lucide-react imports
- **Fix**: Changed import to use project's icon system, added Check and ChevronDown icons to icons.tsx
- **Commit(s)**: `6a3ea9a`
- **Status**: RESOLVED

---

### Type Errors: Invalid ListItemStatus Values

**Issue**: Multiple TypeScript errors across list components using invalid status values (`to_buy`, `gifted`)

- **Location**: KanbanView, KanbanCard, KanbanColumn, ListItemGroup, ListItemRow, ListSummary, TableView, list detail page
- **Root Cause**: Frontend components used display-friendly status names (`to_buy`, `gifted`) that don't exist in the backend enum
- **Fix**: Aligned all status references to use backend-valid values: `idea`, `selected`, `purchased`, `received`
- **Commit(s)**: `d1b062d`
- **Status**: RESOLVED

---

### Gift Modal Crash: PostgreSQL JSON DISTINCT Error

**Issue**: Clicking a gift to open the modal crashes the site with API error: `could not identify an equality operator for type json`

- **Location**: `services/api/app/repositories/gift.py:254`
- **Root Cause**: The `get_filtered()` method used `select(distinct(self.model.id), self.model)` which applies DISTINCT across all columns including the `extra_data` JSON column. PostgreSQL cannot compare JSON types for DISTINCT operations.
- **Fix**: Refactored to use a two-step subquery approach: (1) build a subquery selecting only distinct gift IDs with all filters/joins, (2) select full Gift models where ID is in the subquery results. This avoids putting the JSON column in the DISTINCT comparison while preserving all filtering, pagination, and sorting logic.
- **Commit(s)**: `b120708`
- **Status**: RESOLVED

---

### Gift Modal Infinite API Calls / Site Crash

**Issue**: Clicking a gift to open the modal causes the site to hang and crash with repeated API calls (all returning 200 OK)

- **Location**: `apps/web/components/gifts/GiftCard.tsx`, `apps/web/app/gifts/page.tsx`
- **Root Cause**: Each `GiftCard` component rendered its own `GiftDetailModal` instance. With N gifts on the page, there were N modals each with their own `useListsForGift` hook (which makes N+1 API calls) and `useRealtimeSync` subscriptions. When any gift was clicked, the modal's entityId was set before `open` became true, causing even closed modals to trigger API fetches and WebSocket subscriptions.
- **Fix**: Lifted modal state to page level. Now a single `GiftDetailModal` is rendered at the page level with centralized state from `useEntityModal('gift')`. Each `GiftCard` receives an `onOpenDetail` callback prop instead of managing its own modal. This ensures only ONE modal instance exists and only ONE set of API calls happens when clicking a gift.
- **Commit(s)**: `83c3930`
- **Status**: RESOLVED

---

### Gifts Page Navigation Hang (WebSocket Subscription Storm)

**Issue**: Navigating to /gifts page and then to /occasions, /people, or /lists via sidebar causes the app to hang and fail. Direct URL navigation works. /dashboard and /assignments work fine.

- **Location**:
  - `apps/web/components/gifts/GiftToolbar.tsx:196-198`
  - `apps/web/components/modals/GiftDetailModal.tsx:514-525`
  - `apps/web/hooks/useLists.ts:170-209`
  - `apps/web/components/quick-add/QuickAddModal.tsx:40`
  - `apps/web/app/people/page.tsx:35`
  - `apps/web/app/lists/page.tsx:37`
- **Root Cause**: WebSocket subscription conflicts during client-side navigation. Multiple components subscribed to the same topics, causing race conditions when rapidly unsubscribing/resubscribing:
  1. **GiftToolbar eager subscriptions**: Called `usePersons()`, `useLists()`, `useOccasions()` unconditionally
  2. **QuickAddModal (global)**: Called `useLists({ type: 'ideas' })` BEFORE early return check, creating permanent subscription
  3. **Multiple 'occasions' subscribers**: /people and /lists pages both subscribed to 'occasions' topic for display data
  4. **Nested modal eager rendering**: GiftDetailModal rendered child modals unconditionally
  5. **N+1 query pattern**: `useListsForGift` made sequential API calls
- **Fix (Phase 1 - Commit `fa79df1`, `df0abf7`)**:
  1. Added `disableRealtime?: boolean` option to `usePersons`, `useLists`, `useOccasions` hooks
  2. Updated GiftToolbar to use `{ disableRealtime: true }` for filter data
  3. Changed GiftDetailModal to conditionally render nested modals
  4. Parallelized `useListsForGift` API calls using `Promise.all`
- **Fix (Phase 2 - Commit `ef7d2f9`)**:
  1. **QuickAddModal**: Added `{ enabled: isOpen }` to useLists - only subscribes when modal is open
  2. **People page**: Added `{ disableRealtime: true }` to useOccasions - only needs static occasion data
  3. **Lists page**: Added `{ disableRealtime: true }` to useOccasions - only needs occasion data for grouping
- **Fix (Phase 3 - Commit `f31847e`)**:
  1. **Specialized hooks**: Added `enabled`/`disableRealtime` options to `useListsForGift`, `useListsForPerson`, `useListsForOccasion` - these hooks didn't accept external `enabled` option, subscribing whenever ID present even when modal closed
  2. **GiftDetailModal**: Pass `{ enabled: open }` to useListsForGift
  3. **PersonDetailModal**: Pass `{ enabled: open }` to useListsForPerson
  4. **OccasionDetailModal**: Pass `{ enabled: open }` to useListsForOccasion
  5. **/lists/new page**: Added `{ disableRealtime: true }` to usePersons and useOccasions
- **Commit(s)**: `fa79df1`, `df0abf7`, `ef7d2f9`, `f31847e`
- **Status**: RESOLVED
