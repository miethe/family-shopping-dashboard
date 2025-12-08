# Bug Fixes - December 2025

## Overview

Monthly bug tracking for December 2025.

---

### Docker Build ENOSPC Error

**Issue**: Docker build failed with `ENOSPC: no space left on device` when Next.js created standalone output

- **Location**: Docker Desktop storage
- **Root Cause**: Docker Desktop's virtual disk was full with 21GB of build cache and 17GB of unused images. This is separate from local disk space.
- **Fix**: Cleared Docker storage using:
  ```bash
  docker builder prune -af   # Cleared 21GB build cache
  docker image prune -af     # Cleared 17GB unused images
  ```
- **Commit(s)**: N/A (runtime fix, no code changes)
- **Status**: RESOLVED

**Prevention**: Periodically clean Docker storage with `docker system prune -a` or configure Docker Desktop to limit disk usage in Preferences > Resources > Disk image size.

**Note**: User has Docker Desktop installed but CLI not in PATH. Access via `/Applications/Docker.app/Contents/Resources/bin/docker`.

---

### Side Navigation Design Mismatch

**Issue**: Side navigation bar used glassmorphism styling (bg-white/60 backdrop-blur) instead of the warm terracotta background shown in the design renders

- **Location**: `apps/web/components/layout/DesktopNav.tsx:24`, `apps/web/components/layout/MobileNav.tsx`
- **Root Cause**: Design was implemented with glassmorphism before final design renders were created
- **Fix**: Updated both DesktopNav and MobileNav to use solid warm terracotta background (`bg-[#B67352]`) with white icons, matching the design render at `docs/designs/renders/gifts-dash.png`
- **Commit(s)**: 8598f05
- **Status**: RESOLVED

---

### Gifts Page Crash When Navigating Away

**Issue**: Visiting `/gifts` then navigating to another query-heavy page caused the app to hang and fail to load the next page/endpoints. Pages without queries (e.g., `/assignments`) were fine until a query page was visited again.

- **Location**:
  - `apps/web/components/gifts/AddGiftModal.tsx`
  - `apps/web/components/gifts/GiftEditModal.tsx`
  - `apps/web/components/modals/AddToListModal.tsx`
  - `apps/web/components/quick-add/QuickAddModal.tsx`
- **Root Cause**: These modals were mounted at all times even when closed. Each modal eagerly fetched lists/persons/occasions (and registered WebSocket subscriptions via those hooks). On `/gifts`, the combination of page-level queries plus multiple always-mounted modals created a surge of concurrent API calls and subscriptions; navigating away left the UI thread overloaded and the next page stalled.
- **Fix**:
  - Lazily render each modal only when `isOpen` is true, preventing background queries/subscriptions while closed
  - Keeps existing behaviors intact while cutting idle network/WebSocket load
- **Commit(s)**: c73e10a
- **Status**: RESOLVED

---

### Gifts Navigation Crash - Prefetch and Gift List Fan-Out

**Issue**: Navigating from `/gifts` via sidebar links still intermittently crashed or hung the app, likely due to bursty data fetch/fan-out unique to client-side nav.

- **Location**:
  - `apps/web/components/layout/DesktopNav.tsx`
  - `apps/web/components/layout/MobileNav.tsx`
  - `apps/web/hooks/useLists.ts` (`useListsForGift`)
- **Root Cause (suspected)**: Sidebar Links were prefetching query-heavy routes while `/gifts` already had multiple list/person/occasion fetches in flight. `useListsForGift` also fans out to fetch every list detail to filter lists containing a gift, which can explode when many lists exist.
- **Fix**:
  - Disabled Next.js prefetch on sidebar Links to avoid preloading heavy routes while on `/gifts`
  - Added guard/logging in `useListsForGift` to skip detail fan-out when list counts are high and to log counts for debugging
- **Commit(s)**: 7cdf812
- **Status**: MONITORING

---

### Kanban Drag Size Bug

**Issue**: When dragging a gift card between statuses on the Kanban board (`/lists/{id}`), the item became very large until placed

- **Location**: `apps/web/components/lists/KanbanCard.tsx:51-58`
- **Root Cause**: Drag ghost image cloning didn't constrain dimensions - the cloned element inherited flexible layout properties that expanded when appended to document body
- **Fix**: Set explicit width/height on ghost element using `getBoundingClientRect()`, positioned off-screen, and added `scale-100` class during drag to prevent card scaling
- **Commit(s)**: 8598f05
- **Status**: RESOLVED

---

### ListItemGroup TypeScript Build Error

**Issue**: Build failed with type error about missing `gifted` and `to_buy` properties in statusIcons Record

- **Location**: `apps/web/components/lists/ListItemGroup.tsx:38-45`
- **Root Cause**: TypeScript Record object keys were in different order than the ListItemStatus type definition, causing inference issues
- **Fix**: Reordered all status-related Record objects (statusIcons, statusColors, statusLabels, statusDescriptions) to match exact order of ListItemStatus type
- **Commit(s)**: 8598f05
- **Status**: RESOLVED

---

### Add Flows Not Using Modals

**Issue**: Creating new lists, people, occasions, and gifts navigated to separate `/new` pages instead of opening modals, disrupting user workflow

- **Location**: `apps/web/app/lists/page.tsx`, `apps/web/app/gifts/page.tsx`, `apps/web/app/people/page.tsx`, `apps/web/app/occasions/page.tsx`
- **Root Cause**: Initial implementation used page navigation for add flows before modal infrastructure was fully established
- **Fix**:
  - Created `AddGiftModal` component with URL/Manual tabs
  - Created `AddPersonModal` component with full person form
  - Created `AddOccasionModal` component with occasion form
  - Wired existing `AddListModal` to lists page
  - Replaced all Link components to `/new` routes with modal trigger buttons
- **Commit(s)**: 8598f05
- **Status**: RESOLVED

---

### Material Symbols Icons Not Rendering

**Issue**: Material Symbols icons displayed as text (icon names like "home", "card_giftcard") instead of actual icon glyphs

- **Location**: `apps/web/app/globals.css:12`, `apps/web/app/layout.tsx`
- **Root Cause**:
  1. CSS `@import` after `@tailwind` directives doesn't load reliably in Next.js
  2. Missing `font-family: 'Material Symbols Outlined'` in the CSS class
- **Fix**:
  - Moved font loading from CSS `@import` to HTML `<link>` tags in layout.tsx head
  - Added preconnect links to Google Fonts for performance
  - Added `font-family` declaration to `.material-symbols-outlined` class
- **Commit(s)**: e30b76a
- **Status**: RESOLVED

---

### List Modal Not Showing Gift Items

**Issue**: When opening a list modal (`ListDetailModal`), no gifts were displayed even though the list had items attached to it

- **Location**: `services/api/app/api/lists.py:190-247`, `services/api/app/services/list.py:350-403`
- **Root Cause**:
  1. Router used `response_model=ListResponse` instead of `ListWithItems`
  2. Router called `service.get()` instead of `service.get_with_items()`
  3. Service method `get_with_items()` had TODO comment and returned `items=[]`
  4. Repository didn't load nested gift relationship on list items
- **Fix**:
  - Router: Changed response model to `ListWithItems`, call `service.get_with_items()`
  - Service: Implemented ORM→DTO conversion for list items with gift details
  - Repository: Added nested `selectinload(ListItem.gift)` to eager load gifts
- **Commit(s)**: 48599a4
- **Status**: RESOLVED

---

### Material Symbols Icon Text in Empty State

**Issue**: RecentActivity component displayed "notifications_none" as plain text instead of an icon in the empty state

- **Location**: `apps/web/components/dashboard/RecentActivity.tsx:66-68`
- **Root Cause**: Component used `material-symbols-rounded` class which was not defined in CSS. Only `material-symbols-outlined` class was configured with the correct font-family.
- **Fix**: Replaced raw `<span>` elements with the existing `Icon` component from `@/components/ui/icon` which properly applies the `material-symbols-outlined` class
- **Commit(s)**: 5bed9e7
- **Status**: RESOLVED

---

### Dashboard Background Color Inconsistency

**Issue**: Dashboard page had off-white background (`bg-cream`) within the pane but white padding around it from the layout, creating a disjointed appearance

- **Location**: `apps/web/app/dashboard/page.tsx:26`, `apps/web/components/layout/AppLayout.tsx:44`, `apps/web/app/globals.css`
- **Root Cause**: Dashboard used `bg-cream` (#F5F1E8) but AppLayout used `bg-background-light` (#FBF9F6) - two different off-white colors
- **Fix**:
  - Unified all backgrounds to `cream` (#F5F1E8)
  - Updated AppLayout to use `bg-cream` so all pages inherit consistent background
  - Removed explicit `bg-cream` from dashboard page (now inherited)
  - Updated CSS variables and Tailwind config to use #F5F1E8 consistently
- **Commit(s)**: 5bed9e7
- **Status**: RESOLVED

---

### Gift Catalog UI Issues in List Modal

**Issue**: Gift Catalog section in list modal had multiple UI problems: cards too large, no vertical scrolling, "Add New Gift" not first

- **Location**: `apps/web/components/modals/ListDetailModal.tsx:354-467`
- **Root Cause**: Initial design didn't account for many gifts - used 2-3 column grid with large cards and no scroll container
- **Fix**:
  - Increased grid columns from 2-3 to 3-5 (responsive) for smaller cards
  - Reduced card text sizes (text-sm → text-xs)
  - Added `max-h-[400px] overflow-y-auto` for vertical scrolling
  - Moved "Add New Gift" card to render first before `filteredItems.map()`
- **Commit(s)**: 5bed9e7
- **Status**: RESOLVED

---

### Kanban Empty Column Drop Not Working

**Issue**: Could not drag gifts to empty columns in Kanban view - only columns with 1+ existing gifts accepted drops

---

### List Modal Linked Entities Empty

**Issue**: Linked Entities tab in list modals showed no attached recipient/occasion data even when the list was linked.
- **Location**: `apps/web/components/modals/ListDetailModal.tsx`
- **Root Cause**: Add buttons created people/occasions but never updated the list to point at them, so follow-up fetches had no person_id/occasion_id to render.
- **Fix**: Added `LinkEntityToListModal` with existing/new tabs so selecting or creating a person/occasion immediately updates the list link; wired ListDetailModal to use it.
- **Commit(s)**: 92d226e
- **Status**: RESOLVED

---

### Linked Entities Add Actions Lacked Existing/New Options

**Issue**: Linked Entities tabs only allowed creating new lists/recipients/occasions, blocking reuse of existing records and causing inconsistent UX.
- **Location**: `apps/web/components/modals/PersonDetailModal.tsx`, `apps/web/components/modals/OccasionDetailModal.tsx`
- **Root Cause**: Add actions were hard-coded to open creation modals without an existing-entity path.
- **Fix**: Introduced `LinkListsToContextModal` with existing/new tabs and hooked it into person/occasion detail modals so lists can be linked or created in one flow.
- **Commit(s)**: 92d226e
- **Status**: RESOLVED

---

### Gifts Could Only Link to One List

**Issue**: Attempts to add a gift to multiple lists hit duplicate constraint errors or lacked UI support to target more than one list.
- **Location**: `apps/web/components/gifts/LinkGiftToListsModal.tsx`, `apps/web/components/lists/AddListItemModal.tsx:213-305`, `apps/web/types/index.ts`
- **Root Cause**: No workflow to pick multiple destination lists; additional link attempts reused the same list context, triggering `uq_list_items_gift_list`.
- **Fix**: Added multi-select linking for gifts (new modal plus secondary list selection in AddListItemModal) so a gift can be linked to multiple lists in one submission while skipping already-linked lists.
- **Commit(s)**: 92d226e
- **Status**: RESOLVED

---

### List Items API Missing Pricing Fields

**Issue**: Opening some list modals threw Pydantic validation errors for missing `price`, `discount_price`, and `quantity` on list items.
- **Location**: `services/api/app/services/list.py:384-409`, `services/api/app/services/list_item.py:59-118`
- **Root Cause**: DTO mapping dropped pricing/quantity fields when building `ListItemWithGift`/`ListItemResponse`, so the response payload violated the schema.
- **Fix**: Centralized list item mapping to include pricing fields and applied it across create/update/get flows and the list-with-items assembler.
- **Commit(s)**: 992fd01
- **Status**: RESOLVED

---

### Recent Activity Cards Touching

**Issue**: Recent List Activity cards on `/lists` had no spacing, causing cards to run together vertically.
- **Location**: `apps/web/app/lists/page.tsx:228-240`
- **Root Cause**: Parent `space-y` classes applied to inline Links; inline elements ignore vertical margins.
- **Fix**: Rendered each Link as a block element so Tailwind spacing classes apply, restoring vertical padding between cards.
- **Commit(s)**: b8efaab
- **Status**: RESOLVED

---

### Gift Edit Route 404

**Issue**: Navigating to `/gifts/{id}/edit` returned 404, so "Edit" deep links for gifts were broken.
- **Location**: `apps/web/app/gifts/[id]/edit/page.tsx`
- **Root Cause**: No edit route existed in the app directory.
- **Fix**: Added an edit route that fetches the gift and renders the existing `GiftEditModal` (opening by default) with navigation back to the gift or list on close.
- **Commit(s)**: 111f449
- **Status**: RESOLVED

- **Location**: `apps/web/components/lists/KanbanColumn.tsx:89-101`
- **Root Cause**: `handleDragLeave` used cursor position boundary checking (`e.clientX/Y` vs `getBoundingClientRect()`) which incorrectly cleared hover state when moving between parent and child elements. Also called `e.preventDefault()` which interfered with drag events.
- **Fix**:
  - Removed `e.preventDefault()` from `handleDragLeave`
  - Changed from cursor boundary checking to `relatedTarget` + `contains()` DOM containment check
  - Only clears hover when truly leaving the column, not when moving to child elements
- **Commit(s)**: 5bed9e7
- **Status**: RESOLVED

---

### Gifts Not Clickable in List Detail Views

**Issue**: Gift items in list detail page (/lists/{id}) were not clickable - no way to open gift details from Kanban or List view

- **Location**: `apps/web/components/lists/KanbanCard.tsx`, `apps/web/components/lists/KanbanView.tsx`, `apps/web/app/lists/[id]/page.tsx`
- **Root Cause**: KanbanCard only had drag handlers, no onClick. TableView already had onClick working. GiftDetailModal existed but wasn't wired up.
- **Fix**:
  - Added `onClick?: (item: ListItemWithGift) => void` prop to KanbanCard and KanbanColumn
  - Passed `onItemClick` prop through KanbanView to columns and cards
  - Updated list detail page to track `selectedGiftId` state and render `GiftDetailModal`
  - Added `e.stopPropagation()` and `!isDragging` check to prevent click during drag
- **Commit(s)**: 5bed9e7
- **Status**: RESOLVED

---

### User Modal Hero Section Cut-Off

**Issue**: When viewing a User (Person) modal, the "Hero" section with avatar was cut-off at the bottom, making the avatar not fully visible

- **Location**: `apps/web/components/modals/PersonDetailModal.tsx:259-260`
- **Root Cause**: Hero section had insufficient vertical padding (py-8) and no minimum height constraint, causing avatar (80px + ring) to be clipped on smaller viewports
- **Fix**:
  - Increased Hero vertical padding from `py-8` to `py-12`
  - Added `min-h-[240px]` constraint to guarantee space for avatar + text + badge
  - Changed modal size from `lg` to `xl` for better content display
  - Added horizontal padding `px-6` to prevent edge clipping
- **Commit(s)**: 01ae2fb
- **Status**: RESOLVED

---

### Recipient Cards Missing Key Information

**Issue**: PersonCard on /people page only showed name, relationship, and birthday indicator - missing age, birthday date, gift count, and attached lists

- **Location**: `apps/web/components/people/PersonCard.tsx`
- **Root Cause**: Initial implementation was minimal - only basic info displayed, no data fetching for related entities
- **Fix**:
  - Added `calculateAge()` and `formatBirthday()` helper functions
  - Display age as "X years" next to birthday (🎂 Jan 15 • 25 years)
  - Added gift count with X/Y format and link to `/gifts?recipient={id}`
  - Show attached lists as badges with +N indicator for overflow
  - Clicking list badge opens ListDetailModal
  - Highlight cards with no gifts (orange accent) to prompt users to add
- **Commit(s)**: 555275b
- **Status**: RESOLVED

---

### Lists Cannot Be Attached to Recipients/Occasions

**Issue**: No UI to attach lists to recipients or occasions during list creation/editing, even though backend supported it

- **Location**: `apps/web/components/lists/AddListModal.tsx`, `apps/web/components/modals/ListDetailModal.tsx`
- **Root Cause**: Backend had `person_id` and `occasion_id` fields but frontend forms didn't expose them
- **Fix**:
  - AddListModal: Added "For Recipient" and "For Occasion" dropdowns
  - Pre-populate dropdowns in edit mode with existing values
  - Pass `person_id`/`occasion_id` to API on create/update
  - ListDetailModal: Display attached recipient with View Details button
  - Display attached occasion with date, color-coded cards
- **Commit(s)**: 9a6f11f
- **Status**: RESOLVED

---

### /Gifts Page Missing Advanced Filtering

**Issue**: /gifts page only had basic text search - no way to filter by recipient, status, list, or occasion

- **Location**: `services/api/app/repositories/gift.py`, `services/api/app/api/gifts.py`, `apps/web/app/gifts/page.tsx`
- **Root Cause**: Backend only implemented simple search, no join queries through ListItem→List for relationship-based filtering
- **Fix**:
  - Backend: Added `get_filtered()` repository method with joins through ListItem→List
  - Support filtering by `person_ids`, `statuses`, `list_ids`, `occasion_ids`
  - Use DISTINCT to prevent duplicate gifts in multiple lists
  - Implement sorting: recent, price_asc, price_desc
  - Frontend: Created GiftFilters component using FilterBar/FilterChip design system
  - Multi-select chips for Recipient, Status, List, Occasion
  - Updated API client with proper array parameter serialization
- **Commit(s)**: 23cf12d
- **Status**: RESOLVED

---

### Gifts Cannot Be Easily Attached to Recipients/Lists

**Issue**: Gift creation flow didn't show meaningful context about lists - just generic "wishlist list" text instead of showing recipient/occasion association

- **Location**: `apps/web/components/gifts/UrlGiftForm.tsx`, `apps/web/components/gifts/ManualGiftForm.tsx`, `apps/web/app/gifts/[id]/page.tsx`
- **Root Cause**: List selection only showed list type, not the associated recipient/occasion context
- **Fix**:
  - Enhanced list selection with `getListContext()` helper showing "for [Recipient] (Occasion)"
  - Created GiftEditModal for editing gifts and managing list associations
  - Updated GiftUsage component to show all lists containing a gift with status badges
  - Integrated edit modal into gift detail page
- **Commit(s)**: b791cf9
- **Status**: RESOLVED

---

### Entity Modals Missing Standardized Tabbed Design

**Issue**: Only GiftDetailModal had tabs - PersonDetailModal, ListDetailModal, OccasionDetailModal lacked consistent tabbed organization

- **Location**: `apps/web/components/modals/PersonDetailModal.tsx`, `apps/web/components/modals/ListDetailModal.tsx`, `apps/web/components/modals/OccasionDetailModal.tsx`
- **Root Cause**: Initial implementations were flat layouts without tabbed structure
- **Fix**:
  - PersonDetailModal: Added tabs (Overview, Linked Entities, History)
  - ListDetailModal: Added tabs (Overview, Items, Linked Entities, History)
  - OccasionDetailModal: Added tabs (Overview, Linked Entities, History)
  - All tabs follow GiftDetailModal pattern with consistent styling
  - Tab state resets on modal close
- **Commit(s)**: b791cf9
- **Status**: RESOLVED

---

### Occasions Cannot Be Edited or Deleted

**Issue**: OccasionDetailModal had no edit or delete functionality - view only with no way to modify or remove occasions

- **Location**: `apps/web/components/modals/OccasionDetailModal.tsx`, `apps/web/components/occasions/AddOccasionModal.tsx`
- **Root Cause**: Initial implementation was read-only, AddOccasionModal only supported create mode
- **Fix**:
  - OccasionDetailModal: Added Edit button opening AddOccasionModal in edit mode
  - Added Delete button with two-step confirmation dialog
  - Footer structure follows ListDetailModal pattern
  - AddOccasionModal: Support 'create' and 'edit' modes via props
  - Pre-populate form fields when editing existing occasion
  - Dynamic button text and modal title based on mode
- **Commit(s)**: 42e88bd
- **Status**: RESOLVED

---

### Frontend Not Connecting to API in Docker

**Issue**: After updating docker-compose to use external port 8030 for API, frontend still tried to connect to port 8000, causing CORS errors

- **Location**: `apps/web/Dockerfile`, `docker-compose.yml`, `apps/web/lib/api/client.ts`, `apps/web/lib/auth/api.ts`, `apps/web/hooks/useWebSocket.ts`
- **Root Cause**: `NEXT_PUBLIC_*` environment variables are baked into the JavaScript bundle at **build time**, not read at runtime. The docker-compose runtime environment variables were ignored because the Next.js app was already built with fallback values (port 8000).
- **Fix**:
  1. Dockerfile: Added `ARG` and `ENV` directives for `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` with correct defaults (port 8030)
  2. docker-compose.yml: Added `args` section under web service `build` to pass values at build time
  3. Updated fallback values in code to use port 8030 (external port for Docker dev)
  4. Added clarifying comments throughout distinguishing internal vs external ports
- **Commit(s)**: c9be299, 7c3bdf6
- **Status**: RESOLVED

**Follow-up Fix**: Initial fix was missing `/api/v1` path suffix in the URL. API routes are mounted at `/api/v1/auth/login`, not `/auth/login`.

**Key Insight**: Docker port mapping is `EXTERNAL:INTERNAL`. Browser-accessed URLs (`NEXT_PUBLIC_*`) use EXTERNAL ports. Container-to-container communication uses INTERNAL ports via service names.

---

### WebSocket Connection Explosion on Modal Open

**Issue**: Opening a list modal from /lists or /gifts page caused many WebSocket connections to open, hang, and close. First occurrence after app start crashed the site (required refresh). Navigating between /lists and /gifts triggered same crash.

- **Location**: `apps/web/hooks/useRealtimeSync.ts:38,103,212`
- **Root Cause**: `useRealtimeSync` hook imported and called `useWebSocket()` directly instead of `useWebSocketContext()`. This caused every component using `useRealtimeSync` (via `useLists`, `useGifts`, `usePersons`, `useOccasions`, etc.) to create its own WebSocket connection rather than sharing the singleton from `WebSocketProvider`. When AddListModal opened (using `usePersons` + `useOccasions`), 4+ simultaneous connections were created, overwhelming the browser.
- **Fix**:
  - Changed import from `useWebSocket` to `useWebSocketContext` from `@/lib/websocket/WebSocketProvider`
  - Updated line 103: `useWebSocket()` → `useWebSocketContext()` in `useRealtimeSync()`
  - Updated line 212: `useWebSocket()` → `useWebSocketContext()` in `usePollingFallback()`
- **Commit(s)**: 3a5bc27
- **Status**: RESOLVED

---

### Browser Tab Crash on Page Navigation (/lists ↔ /gifts)

**Issue**: Browser tab crashed when first loading /gifts or /lists page, then alternated - whichever page was loaded last would work, but navigating to the other page crashed. This pattern persisted across web app restarts.

- **Location**: `apps/web/hooks/useRealtimeSync.ts:172`
- **Root Cause**: The `state` variable from WebSocket context was included in the useEffect dependency array. When WebSocket state changed (connecting → connected), the effect re-ran, unsubscribing and immediately re-subscribing. This cascaded across ALL components using the hook. Combined with React Strict Mode (which doubles effects), this created exponential subscription growth leading to memory exhaustion and browser crash.
- **Why it persisted across restarts**: The WebSocketProvider is a singleton in the root layout. Subscriptions from one page accumulated in memory, and navigating to another page added MORE subscriptions without the first set being properly cleared. The subscription count grew until browser memory was exhausted.
- **Fix**:
  - Removed `state` from the subscription useEffect dependency array
  - Moved `onSubscribed` callback to a separate effect that only fires the callback (doesn't re-subscribe)
  - Added comment explaining why `state` must NOT be in dependencies
- **Commit(s)**: 129cc8f
- **Status**: RESOLVED

**Note**: Duplicate WebSocket/API requests in development are expected due to `reactStrictMode: true` in next.config.ts. This is not a bug.

---

### Browser Tab Crash - ConnectionIndicator Creating Separate WebSocket Connections

**Issue**: Browser tab crash persisted after the dependency array fix above. Crash occurred when first loading /gifts or /lists page, then alternated between pages.

- **Location**: `apps/web/components/websocket/ConnectionIndicator.tsx:15,66,103`
- **Root Cause**: `ConnectionIndicator` (and `ConnectionIndicatorCompact`) imported and called `useWebSocket()` directly instead of `useWebSocketContext()`. This caused each component instance to create its own WebSocket connection. Since `ConnectionIndicatorCompact` is rendered in the Header (which is on every page), EVERY page load created a new WebSocket connection. Combined with React Strict Mode doubling effects, this caused:
  - 4 WebSocket "connection open" events per page load (2 from provider × 2 from indicator, each doubled)
  - Connections accumulating when navigating between pages
  - Memory exhaustion leading to browser tab crash
- **Why previous fix was incomplete**: The `state` dependency fix addressed re-subscription loops in `useRealtimeSync`, but the ConnectionIndicator was independently creating duplicate connections via direct `useWebSocket()` calls.
- **Fix**:
  - Changed import from `useWebSocket` to `useWebSocketContext` from `@/lib/websocket/WebSocketProvider`
  - Updated both `ConnectionIndicator` and `ConnectionIndicatorCompact` to use context
- **Commit(s)**: ab0d8f0
- **Status**: RESOLVED

---

### WebSocket Subscribe Storm on Modal Open

**Issue**: Opening a list modal from `/lists` (and first loading `/gifts`) opened the WebSocket, froze the UI, then closed the connection and crashed the tab (“Aw Snap”) while `/gifts` and `/lists/{id}` fetches stayed pending.

- **Location**:
  - `apps/web/hooks/useGifts.ts`
  - `apps/web/hooks/usePersons.ts`
  - `apps/web/hooks/useOccasions.ts`
  - `apps/web/components/lists/AddListItemModal.tsx`
  - `apps/web/components/lists/AddListModal.tsx`
- **Root Cause**: Each list card renders its own hidden `ListDetailModal`, which always mounted `AddListItemModal` and `AddListModal`. These modals eagerly ran `useGifts`, `usePersons`, and `useOccasions`, and each hook subscribed to its WebSocket topic. With dozens of list cards plus React Strict Mode, hundreds of `gifts`/`persons`/`occasions` subscriptions accumulated before any modal was opened, overwhelming the WebSocket and starving the main thread.
- **Fix**:
  - Added `enabled` support to `useGifts`, `usePersons`, and `useOccasions` so queries/subscriptions can be gated
  - Gated `useGifts` in `AddListItemModal` to run only when the modal is open
  - Gated `usePersons`/`useOccasions` in `AddListModal` to run only when the modal is open
  - Result: Only the one open modal holds the live WebSocket subscriptions instead of every hidden modal on the page
- **Commit(s)**: 77d88b9
- **Status**: RESOLVED

---

### Gift Page Filter Bar Redesign - Inline Toolbar with Grouping

**Issue**: The /gifts page had separate GiftSearch and GiftFilters components stacked vertically, taking excessive space. Filter bar was collapsible but inconvenient. No way to group gifts by status.

- **Location**: `apps/web/app/gifts/page.tsx`, `apps/web/components/gifts/GiftFilters.tsx`, `apps/web/components/gifts/GiftSearch.tsx`
- **Root Cause**: Original design separated search and filters into distinct components without considering unified toolbar UX
- **Fix**:
  - Created `GiftToolbar` component - unified glassmorphism bar with search, filter dropdowns, sort, and grouping
  - Search input shortened (max-w-[240px]) to fit inline with filters
  - Filters converted from collapsible chip groups to compact dropdown pills with selection counts
  - Added grouping feature: Grid View (default), Group by Status, Group by Recipient
  - Created `GiftGroupedView` component for status-based grouping with collapsible sections
  - Each section shows status icon, label, count badge, and responsive gift grid
  - Mobile-first responsive: search on top row, filters wrap on mobile
  - Follows Soft Modernity design: glassmorphism, warm colors, 44px touch targets
- **Commit(s)**: 228fda8
- **Status**: RESOLVED

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

---

### Gifts Navigation Crash - Hidden List Modals Spawning Portals

**Issue**: Visiting `/gifts` then using the sidebar to go to `/occasions`, `/people`, or `/lists` still crashed after earlier fixes because ListDetailModal was mounting a stack of hidden portals and queries.

- **Location**: `apps/web/components/modals/ListDetailModal.tsx`
- **Root Cause**: Commit `80ecb0a` added always-mounted nested modals (gift/person/occasion detail plus add-person/occasion/list item) inside each ListDetailModal instance. Every list/person card renders a hidden ListDetailModal, so client-side navigation had to mount dozens of Radix portals and person/occasion detail queries even when closed, recreating the navigation crash.
- **Fix**:
  1. Gate person/occasion detail queries on `open` to avoid background fetches
  2. Lazy render all nested modals (GiftDetail, PersonDetail, OccasionDetail, AddPerson, AddOccasion, AddListItem, AddList edit) only when their own `open` flag is true
- **Commit(s)**: `a7b3e66`
- **Status**: RESOLVED

---

### Gifts Page Navigation Crash - Missing Suspense Boundary

**Issue**: Navigating FROM /gifts TO /occasions, /people, or /lists using sidebar buttons caused immediate site crash/hang. Direct URL navigation worked fine.

- **Location**: `apps/web/app/gifts/page.tsx:28`
- **Root Cause**: The `/gifts` page used `useSearchParams()` without wrapping the component in a Suspense boundary. In Next.js 15, `useSearchParams()` requires a Suspense boundary to prevent hydration corruption during client-side navigation. Without it, React cannot properly handle the async nature of search params, causing hydration mismatches that corrupt the React tree when navigating away via client-side routing (sidebar links). Direct URL navigation worked because it triggered full server-side renders, bypassing the corrupted hydration state.
- **Why previous fixes didn't resolve this**: Prior fixes addressed WebSocket subscription storms which were a valid issue at the time. After the websocket-simplification refactor removed WS from `useLists`, `usePersons`, and `useOccasions` hooks, this different root cause (missing Suspense) was exposed.
- **Fix**:
  1. Added `Suspense` import from React
  2. Created `GiftsSkeleton` loading component matching page structure
  3. Extracted page content into `GiftsPageContent` component (contains `useSearchParams`)
  4. Wrapped with `<Suspense fallback={<GiftsSkeleton />}>`
- **Commit(s)**: `775d41d`
- **Status**: RESOLVED (partial - see below for complete fix)

---

### Gifts Page Navigation Crash - Modal Inside Suspense Boundary

**Issue**: Despite the Suspense boundary fix (775d41d), navigating FROM /gifts TO /occasions, /people, or /lists still caused crashes. The crash persisted because the GiftDetailModal (which uses Radix Portal) was rendered INSIDE the Suspense boundary.

- **Location**: `apps/web/app/gifts/page.tsx:175-182`
- **Root Cause**: The GiftDetailModal was inside the Suspense boundary wrapping `GiftsPageContent`. When navigation occurred:
  1. The Suspense boundary would start unmounting (due to navigation)
  2. The GiftDetailModal's Radix Portal was still attached to document.body
  3. React Query subscriptions in the modal were still active
  4. This caused a race condition between portal cleanup and page unmounting
  5. The state collision during this transition crashed the app
- **Why crash only affected /occasions, /people, /lists**: These pages have more complex initial renders with multiple data sources. The race condition during navigation manifested specifically when mounting these pages while the orphaned portal state was still cleaning up. Simpler pages like /dashboard and /assignments mounted faster, avoiding the race window.
- **Fix**:
  1. Moved `useEntityModal('gift')` from inside `GiftsPageContent` to the outer `GiftsPage` component
  2. Added `GiftsPageContentProps` interface with `onOpenDetail` callback
  3. Passed `openDetail` as prop to `GiftsPageContent`
  4. Rendered `GiftDetailModal` OUTSIDE the Suspense boundary in `GiftsPage`
  5. Added documentation comments explaining why modal must stay outside Suspense
- **Commit(s)**: `cc2a86c`
- **Status**: RESOLVED


---

### GiftPriority Enum Case Mismatch

**Issue**: App failed with `LookupError: 'medium' is not among the defined enum values. Enum name: gift_priority. Possible values: LOW, MEDIUM, HIGH` during gift operations.

- **Location**: `services/api/app/models/gift.py:93-102`
- **Root Cause**: SQLAlchemy Enum by default uses Python enum NAMES (LOW, MEDIUM, HIGH) as database literals. However, migration `cf29065501d1` created a PostgreSQL ENUM type with VALUES ('low', 'medium', 'high'). The mismatch caused SQLAlchemy to fail when reading/writing gift priority.
- **Fix**:
  1. Changed `native_enum=False` to `native_enum=True` to use the existing PostgreSQL ENUM type
  2. Added `values_callable=lambda e: [m.value for m in e]` to tell SQLAlchemy to use enum VALUES ('low', 'medium', 'high') instead of NAMES
- **Commit(s)**: `9915dd8`
- **Status**: RESOLVED

---

### Alembic Multiple Head Revisions

**Issue**: Alembic failed with `Multiple head revisions are present for given argument 'head'` during `alembic upgrade head`.

- **Location**: `services/api/alembic/versions/`
- **Root Cause**: Two branch points in the migration history created 3 separate heads:
  1. `003_person_anniversary` (from `001_occasion_recurrence` branch)
  2. `cf29065501d1` (gift_model_expansion)
  3. `e21fa4490d9d` (groups_and_person_groups)
  
  Branch point `37835ac72a46` diverged into both `e5004eebd18f` and `001_occasion_recurrence`. Branch point `268c9faeabe7` diverged into both `cf29065501d1` and `e21fa4490d9d`.
- **Fix**: Created merge migration `ca7196997ff4` using `alembic merge heads -m "merge_all_heads"` to consolidate all three heads into a single migration path.
- **Commit(s)**: `fd315e5`
- **Status**: RESOLVED

---

### OccasionType Enum Case Mismatch

**Issue**: App failed with `LookupError: 'holiday' is not among the defined enum values. Enum name: occasiontype. Possible values: HOLIDAY, RECURRING, OTHER` on /lists page.

- **Location**: `services/api/app/models/occasion.py:54-63`
- **Root Cause**: Same as GiftPriority - SQLAlchemy Enum uses Python enum NAMES (HOLIDAY, RECURRING, OTHER) by default, but PostgreSQL ENUM was created with VALUES ('holiday', 'recurring', 'other').
- **Fix**: Changed from `ENUM(OccasionType, name="occasiontype", create_type=False)` to `SQLEnum(OccasionType, name="occasiontype", native_enum=True, values_callable=lambda e: [m.value for m in e])`.
- **Commit(s)**: `5bcc991`
- **Status**: RESOLVED

---

### PersonResponse.groups MissingGreenlet Error

**Issue**: `MissingGreenlet: greenlet_spawn has not been called; can't call await_only() here` when accessing /people endpoint.

- **Location**: `services/api/app/repositories/person.py:164`
- **Root Cause**: The `get_multi_with_group_filter()` repository method did NOT eagerly load the `groups` relationship. When Pydantic tried to validate PersonResponse and access `person.groups`, SQLAlchemy attempted a lazy load in an async context without proper greenlet spawning.
- **Fix**: Added `.options(selectinload(self.model.groups))` to eagerly load the groups relationship, matching the pattern used in `get_with_groups()` method.
- **Commit(s)**: `5bcc991`
- **Status**: RESOLVED

---

### Frontend Date Utils Null Pointer Error

**Issue**: `TypeError: Cannot read properties of undefined (reading 'split')` on /occasions and /people pages when date fields are undefined.

- **Location**: `apps/web/lib/date-utils.ts:21` and related functions
- **Root Cause**: `parseLocalDate()` and other date utility functions called `.split('-')` on potentially undefined date strings without null checks.
- **Fix**: Updated all date utility functions to accept `null | undefined`:
  - `parseLocalDate()`: returns current date as fallback
  - `formatDate()/formatDateCustom()`: handles null input
  - `getAge()`: returns null for undefined birthdate
  - `getNextBirthday()`: returns null for undefined birthdate
  - `getDaysUntil()`: returns 0 for undefined date
  - `formatRelativeTime()/formatTimeAgo()`: return "No date" for null
- **Commit(s)**: `d1acb8a`
- **Status**: RESOLVED

---

### Comment Visibility Migration - Wrong Index Name

**Issue**: App and Alembic migrations failed with `sqlalchemy.exc.ProgrammingError: index "idx_comments_parent_type_parent_id" does not exist` when trying to run the comment visibility migration.

- **Location**: `services/api/alembic/versions/1d2e5f3c4b21_add_comment_visibility_and_gift.py:40-42,63-65`
- **Root Cause**: Migration `1d2e5f3c4b21` tried to drop `idx_comments_parent_type_parent_id`, but migration `39be0dfc7e1d` had already renamed that index to `ix_comments_parent_type_parent_id` (SQLAlchemy convention change). The newer migration referenced a stale/non-existent index name.
- **Fix**: Updated both upgrade() and downgrade() functions to use the correct index name `ix_comments_parent_type_parent_id` instead of the old name.
- **Commit(s)**: `60ce92c`
- **Status**: RESOLVED

---

### Gift Edit Price Save Returns 405 Method Not Allowed

**Issue**: Saving a price on a gift in Edit mode fails with `PUT /api/v1/gifts/1 HTTP/1.1 405 Method Not Allowed`

- **Location**: `apps/web/lib/api/endpoints.ts:175`
- **Root Cause**: Frontend `giftApi.update()` used `apiClient.put()` but the backend gift update endpoint uses `@router.patch()` for partial updates (line 314 in `services/api/app/api/gifts.py`).
- **Fix**: Changed `apiClient.put` to `apiClient.patch` in the giftApi.update function
- **Commit(s)**: `8124ed5`
- **Status**: RESOLVED

---

### Cannot Add Person to Group from Edit Mode (Feature Gap)

**Issue**: No UI to add/remove people from a Group - only way to manage group membership was through the Person edit modal, not from the Group's perspective

- **Location**: Missing `apps/web/components/groups/GroupEditModal.tsx`
- **Root Cause**: Group management only existed as `GroupMultiSelect` in Person modals. No dedicated Group edit interface existed to manage group properties (name, color, description) or members.
- **Fix**: Created:
  1. `apps/web/components/common/PersonMultiSelect.tsx` - Multi-select component for choosing people (inverse of GroupMultiSelect)
  2. `apps/web/components/groups/GroupEditModal.tsx` - Full modal for editing group details and managing members
  3. `apps/web/components/groups/index.ts` - Export barrel for group components

  The modal allows editing group name/color/description and uses PersonMultiSelect to add/remove people from the group. Member updates work by modifying each person's `group_ids` via the Person API.
- **Commit(s)**: `f04b4b4`
- **Status**: RESOLVED

---

### React Hooks Build Errors Post for-people-ui-enhancement

**Issue**: Build failed with multiple React hooks violations and ESLint errors after the for-people-ui-enhancement implementation

- **Location**: Multiple frontend components
- **Root Cause**: Several React hooks rule violations introduced during UI enhancement work
- **Fixes Applied**:

#### 1. PersonOccasionBudgetCard.test.tsx Parsing Error
- **Location**: `apps/web/components/budgets/__tests__/PersonOccasionBudgetCard.test.tsx:563-569`
- **Root Cause**: Stray closing braces and extra indentation caused "Declaration or statement expected" parsing error
- **Fix**: Removed extra `});` and cleaned up indentation in the 'handles decimal budget values' test

#### 2. PersonBudgetBar.tsx Conditional Hook Call
- **Location**: `apps/web/components/people/PersonBudgetBar.tsx:129-140`
- **Root Cause**: `React.useMemo` was called after multiple early returns, violating React hooks rules
- **Fix**: Moved `gifts` and `allGiftTooltipItems` useMemo calls before all early returns; wrapped `gifts` in useMemo to prevent new array on every render

#### 3. PersonDropdown.tsx Logical Expression Warning
- **Location**: `apps/web/components/common/PersonDropdown.tsx:67`
- **Root Cause**: `personsData?.items || []` created new array reference each render, breaking useMemo deps
- **Fix**: Wrapped `persons` initialization in useMemo: `React.useMemo(() => personsData?.items ?? [], [personsData?.items])`

#### 4. confirm-dialog.tsx useCallback Missing Dependencies
- **Location**: `apps/web/components/ui/confirm-dialog.tsx:126-134`
- **Root Cause**: `handleConfirm` and `handleCancel` accessed `state.resolve` but only included `[state.resolve]` in deps
- **Fix**: Used functional state updates (`setState(prevState => ...)`) to avoid external state dependency

#### 5. image-picker.tsx uploadFile Function Recreation
- **Location**: `apps/web/components/ui/image-picker.tsx:93-112`
- **Root Cause**: `uploadFile` function recreated every render, causing `handlePaste` useCallback to recreate
- **Fix**: Wrapped `uploadFile` and `handleError` in useCallback with proper dependencies

#### 6. image-picker.tsx Image Alt Text False Positive
- **Location**: `apps/web/components/ui/image-picker.tsx:344`
- **Root Cause**: ESLint confused `Image` icon component (from `./icons`) with HTML `<img>` element
- **Fix**: Renamed import to `Image as ImageIcon` and usage to `<ImageIcon />`

- **Commit(s)**: `15d31f3` (confirm-dialog), `4e4f07a` (remaining fixes)
- **Status**: RESOLVED
