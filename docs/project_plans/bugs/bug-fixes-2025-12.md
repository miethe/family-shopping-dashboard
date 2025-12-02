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
