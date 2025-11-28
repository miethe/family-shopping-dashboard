# Bug Fixes - November 2025

Monthly log of bug fixes and remediations for the Family Gifting Dashboard project.

---

## OccasionType Enum Duplicate Type Error

**Issue**: API failing on startup with `sqlalchemy.exc.ProgrammingError: (psycopg.errors.DuplicateObject) type "occasiontype" already exists`

- **Location**: `services/api/app/models/occasion.py:43-47`
- **Root Cause**: Name mismatch between migration (`name="occasiontype"`) and model (`name="occasion_type"`), combined with `create_type=True` in model causing SQLAlchemy to attempt creating the enum type at runtime even though the migration already created it
- **Fix**: Aligned model enum definition with migration by changing `name="occasion_type"` to `name="occasiontype"` and `create_type=True` to `create_type=False` to prevent duplicate type creation
- **Commit(s)**: `18bf915`
- **Status**: RESOLVED

---

## Login and Register Pages Missing Functionality

**Issue**: Root path "/" redirects to "/login" (via /dashboard → ProtectedRoute), but the login page only displays placeholder text with no form or buttons. Users cannot authenticate.

- **Location**: `apps/web/app/(auth)/login/page.tsx`, `apps/web/app/(auth)/register/page.tsx`
- **Root Cause**: Auth pages were stub implementations with only heading and text, no actual form components or integration with the useAuth hook
- **Fix**: Implemented complete login and register forms with:
  - Email/password input fields using existing UI components
  - Client-side validation (email format, password length, confirmation match)
  - Integration with useAuth() hook for login/register API calls
  - Loading states during submission
  - Error display for validation and API errors
  - Proper accessibility (labels, aria attributes, 44px touch targets)
  - Mobile-first responsive design with 100dvh viewport
  - Cross-linking between login and register pages
- **Commit(s)**: `5ac40a6`
- **Status**: RESOLVED

---

## API Endpoints Returning 404 - Missing /api/v1 Prefix

**Issue**: All API endpoints returning 404 errors. Login (`POST /api/v1/auth/login`) and register (`POST /api/v1/auth/register`) both fail with 404 Not Found.

- **Location**: `services/api/app/main.py:156-207`
- **Root Cause**: All API routers were registered WITHOUT the `/api/v1` prefix in `main.py`, but the frontend expects ALL endpoints to have this prefix. Backend provided `/auth/login` but frontend called `/api/v1/auth/login`.
- **Fix**: Added `prefix="/api/v1"` to all router includes in main.py (except health for K8s probes and WebSocket which is protocol-level). Created `API_V1_PREFIX` constant for consistency.
- **Affected Routers**: auth, lists, list_items, gifts, persons, dashboard, occasions, users (8 routers)
- **Commit(s)**: `85a5b0b`
- **Status**: RESOLVED

---

## User Model Missing Comments Relationship

**Issue**: User registration fails with SQLAlchemy error `InvalidRequestError: Mapper 'Mapper[User(users)]' has no property 'comments'`

- **Location**: `services/api/app/models/user.py:42-48`
- **Root Cause**: The `Comment` model defined a bidirectional relationship with `back_populates="comments"` but the `User` model did not have the corresponding `comments` relationship defined
- **Fix**: Added `comments` relationship to User model with proper `back_populates="author"`, `lazy="selectin"`, and `cascade="all, delete-orphan"` to match the Comment model's expectation
- **Commit(s)**: `7ae2850`
- **Status**: RESOLVED

---

## Multiple Missing Bidirectional Relationships Across Models

**Issue**: User registration fails with SQLAlchemy error `InvalidRequestError: Mapper 'Mapper[User(users)]' has no property 'lists'` (and similar errors for other missing relationships)

- **Location**: Multiple models in `services/api/app/models/`
- **Root Cause**: Several models defined bidirectional relationships with `back_populates` but the target models did not have the corresponding relationships defined:
  - `List.user` → `back_populates="lists"` but User had no `lists`
  - `ListItem.assignee` → `back_populates="assigned_items"` but User had no `assigned_items`
  - `List.person` → `back_populates="lists"` but Person had no `lists`
  - `List.occasion` → `back_populates="lists"` but Occasion had no `lists`
  - `List.gifts` was pointing to Gift model but should be `list_items` to ListItem
- **Fix**:
  - User: Added `lists` and `assigned_items` relationships
  - Person: Added `lists` relationship
  - Occasion: Added `lists` relationship
  - List: Changed incorrect `gifts→Gift` relationship to `list_items→ListItem`
  - Updated list repository and service to use `list_items` instead of `gifts`
- **Commit(s)**: `23530ce`
- **Validated**: API registration and login tested successfully via curl
- **Status**: RESOLVED

---

## Missing Tailwind CSS Directives

**Issue**: CSS styling completely broken across the entire app - no Tailwind classes rendering

- **Location**: `apps/web/app/globals.css:1`
- **Root Cause**: globals.css was missing the required `@tailwind base; @tailwind components; @tailwind utilities;` directives. The file had a comment indicating "Tailwind will be added in FE-002" but the directives were never added. Without these directives, PostCSS cannot inject the Tailwind utility classes into the compiled CSS.
- **Fix**: Added the three `@tailwind` directives at the top of globals.css
- **Commit(s)**: `9c8a2a8`
- **Status**: RESOLVED

---

## Dashboard API Endpoint Path Mismatch

**Issue**: Dashboard page showing 404 error - `GET http://localhost:8000/dashboard/summary 404`

- **Location**: `apps/web/lib/api/endpoints.ts:197`
- **Root Cause**: Frontend calling `/dashboard/summary` but backend route is `/dashboard`. The recent API prefix fix added `/api/v1` to all routes correctly, but the frontend endpoint definition had an extra `/summary` suffix that doesn't exist on the backend.
- **Fix**: Changed `'/dashboard/summary'` to `'/dashboard'` in dashboardApi.summary()
- **Commit(s)**: `9c8a2a8`
- **Status**: RESOLVED

---

## PWA Files Returning 400 Bad Request

**Issue**: manifest.json and sw.js returning 400 Bad Request, Service Worker registration failing

- **Location**: `apps/web/public/manifest.json`, `apps/web/public/sw.js`
- **Root Cause**: File permissions were set to `0600` (owner read/write only), which prevented the Next.js server process from reading these static files. When the server couldn't read the files, it returned 400 Bad Request.
- **Fix**: Changed file permissions to `0644` (world-readable) using `chmod 644`
- **Commit(s)**: `9c8a2a8` (documented; permissions not tracked in git)
- **Status**: RESOLVED

---

## Frontend lib/ Directory Not Tracked in Git

**Issue**: Critical frontend source code in `apps/web/lib/` not tracked in git - 16 files including API client, auth utilities, WebSocket provider, and React context

- **Location**: `.gitignore:14`, `apps/web/lib/`
- **Root Cause**: Root `.gitignore` had `lib/` pattern from Python packaging conventions (Distribution/packaging section) which unintentionally ignored the Next.js frontend's `lib/` source directory containing API client, authentication, WebSocket, and utility code.
- **Fix**: Removed `lib/` from root `.gitignore` (added comment explaining removal). Added all 16 previously-ignored files to git tracking:
  - `apps/web/lib/api/` (client.ts, endpoints.ts, types.ts, index.ts)
  - `apps/web/lib/auth/` (api.ts, storage.ts, types.ts)
  - `apps/web/lib/context/` (AuthContext.tsx)
  - `apps/web/lib/websocket/` (WebSocketProvider.tsx, types.ts, index.ts)
  - `apps/web/lib/query-client.ts`, `apps/web/lib/utils.ts`
- **Commit(s)**: `9c8a2a8`
- **Status**: RESOLVED

---

## API Client URL Construction Bug

**Issue**: All API calls missing `/api/v1` prefix - calls to `/dashboard` and `/lists` returning 404

- **Location**: `apps/web/lib/api/client.ts:57`
- **Root Cause**: The `new URL(path, baseUrl)` constructor doesn't preserve path segments in the base URL when the path starts with `/`. When path is `/dashboard` and baseUrl is `http://localhost:8000/api/v1`, the result is `http://localhost:8000/dashboard` instead of `http://localhost:8000/api/v1/dashboard`.
- **Fix**: Changed from `new URL(path, this.baseUrl)` to `new URL(\`${this.baseUrl}${path}\`)` to concatenate the full path before parsing
- **Commit(s)**: `a6dcab3`
- **Status**: RESOLVED

---

## ListItemStatus Enum Case Mismatch

**Issue**: Dashboard API crashing with `AttributeError: IDEA` - enum attribute not found

- **Location**: `services/api/app/services/dashboard.py:74,75,126,154,212`, `services/api/tests/unit/services/test_dashboard_service.py:203,222`
- **Root Cause**: The `ListItemStatus` enum uses lowercase values (`idea`, `selected`, `purchased`, `received`) but the dashboard service referenced uppercase attributes (`IDEA`, `SELECTED`, `PURCHASED`, `RECEIVED`). Python enums are case-sensitive.
- **Fix**: Changed all references from uppercase to lowercase:
  - `ListItemStatus.IDEA` → `ListItemStatus.idea`
  - `ListItemStatus.SELECTED` → `ListItemStatus.selected`
  - `ListItemStatus.PURCHASED` → `ListItemStatus.purchased`
  - `ListItemStatus.RECEIVED` → `ListItemStatus.received`
- **Commit(s)**: `a571d78`
- **Status**: RESOLVED

---

## OccasionRepository Missing list_paginated Method

**Issue**: Occasions page fails to load with `AttributeError: 'OccasionRepository' object has no attribute 'list_paginated'`

- **Location**: `services/api/app/services/occasion.py:145`
- **Root Cause**: The OccasionService called `self.repo.list_paginated()` but the BaseRepository provides `get_multi()` for cursor-based pagination. The method name was inconsistent.
- **Fix**: Changed `list_paginated` to `get_multi` in OccasionService and corresponding test mock
- **Commit(s)**: `0d661e8`
- **Status**: RESOLVED

---

## Create Pages Navigate to Non-Existent Entities

**Issue**: Create pages for Lists, People, and Occasions navigate to detail pages showing "entity not found" error instead of displaying create forms

- **Location**: `apps/web/app/lists/new/`, `apps/web/app/people/new/`, `apps/web/app/occasions/new/` (missing directories)
- **Root Cause**: Missing static route pages for `/lists/new`, `/people/new`, and `/occasions/new`. The dynamic `[id]` routes were catching "new" as an entity ID and attempting to fetch entities with `id="new"`, which returns NaN when parsed and causes 404 errors.
- **Fix**:
  - Created `apps/web/app/lists/new/page.tsx` with form for ListCreate fields
  - Created `apps/web/app/people/new/page.tsx` with PersonForm component
  - Created `apps/web/app/occasions/new/page.tsx` with form for OccasionCreate fields
  - Added `useCreateOccasion` hook to `hooks/useOccasion.ts` (was missing)
  - Added `PersonForm` component to `components/people/`
- **Pattern Reference**: Existing `/gifts/new/page.tsx` worked correctly and served as the template
- **Commit(s)**: `878db21`, `6e8161e`
- **Status**: RESOLVED

---

## List Items API Endpoint Path Mismatch

**Issue**: Adding items to lists fails with 404 - `GET /api/v1/list-items?list_id=1 404 Not Found`

- **Location**: `apps/web/lib/api/endpoints.ts:182-190`, `apps/web/hooks/useListItems.ts`
- **Root Cause**: Frontend assumed list items were a flat resource (`/list-items?list_id=X`) but backend implements them as nested resources under lists (`/lists/{list_id}/items`). The backend `/list-items` router only provides status update and assignment endpoints (`PUT /list-items/{id}/status`, `PUT /list-items/{id}/assign`), not CRUD operations.
- **Fix**:
  - Updated `listItemApi` in endpoints.ts to use correct nested resource paths:
    - `list()` → `GET /lists/{list_id}/items`
    - `create()` → `POST /lists/{list_id}/items`
    - Added `updateStatus()` → `PUT /list-items/{id}/status`
    - Added `assign()` → `PUT /list-items/{id}/assign`
    - Removed non-existent endpoints: `get()`, `update()`, `delete()`
  - Updated `useListItems` hook to accept `listId: number | undefined` instead of params object
  - Updated `useCreateListItem` hook to accept listId in mutation params
  - Stubbed `useMyAssignments` hook (requires backend endpoint `GET /list-items?assigned_to=X`)
  - Updated callers: `app/lists/[id]/page.tsx`, `components/quick-add/QuickAddModal.tsx`
- **Commit(s)**: `660684e`
- **Status**: RESOLVED

---

## UI Component Variant/Size Type Mismatches Breaking Docker Build

**Issue**: Docker Compose build failing with TypeScript type error: `Type '"outline"' is not assignable to type '"link" | "primary" | "secondary" | "ghost" | "tertiary" | "destructive" | null | undefined'` and multiple similar variant/size type mismatches across UI components

- **Location**: `apps/web/components/ui/button.tsx`, `apps/web/components/ui/badge.tsx`, `apps/web/components/ui/avatar.tsx`, `apps/web/components/ui/card.tsx`, `apps/web/components/ui/skeleton.tsx`
- **Root Cause**: UI components using `class-variance-authority` (cva) defined limited variant/size options, but usage across the codebase referenced variants and sizes not defined in the type system:
  - Button: used `variant="outline"`, `variant="default"`, `size="default"` (not in type)
  - Badge: used `variant="success"`, `"warning"`, `"error"`, `"info"` (not in type)
  - Avatar: used `size="default"` (not in type)
  - Card: used `padding="default"` (not in type)
  - Skeleton: `SkeletonProps` interface not exported
  - Badge: null index type error when accessing `dotColorMap[variant]`
- **Fix**:
  - **Button**: Added `outline`, `default` variants; added `default` size (aliases existing styles)
  - **Badge**: Added `success`, `warning`, `error`, `info` semantic variants with appropriate colors; added `default` size; added null coalescing for `dotColorMap` access
  - **Avatar**: Added `default` size aliasing `md`
  - **Card**: Added `default` padding aliasing `md`
  - **Skeleton**: Exported `SkeletonProps` interface
- **Commit(s)**: `1f2aea0`
- **Status**: RESOLVED

---

## POST /api/v1/persons Returns 422 Unprocessable Entity

**Issue**: Creating a new person fails with 422 validation error when submitting the person form

- **Location**: `apps/web/types/index.ts:42-64`, `apps/web/components/people/PersonForm.tsx`
- **Root Cause**: Frontend `PersonCreate` type used `display_name` but backend schema expects `name`. Frontend also sent extra fields not in backend (relationship, birthdate, notes, photo_url) and `interests` as string instead of string array.
- **Fix**: Updated all Person-related types and components to match backend schema:
  - Changed `display_name` → `name` in Person, PersonCreate, PersonUpdate interfaces
  - Changed `interests` from `string` → `string[]`
  - Removed unsupported fields: relationship, birthdate, notes, photo_url
  - Updated PersonForm to use tag-based interests input (array handling)
  - Updated PersonCard, PersonDetail, PersonInfo to use new field names
  - Updated people list search filter for array interests
- **Commit(s)**: `f7f9e7c` → superseded by `0e82b42` (full PRD implementation)
- **Status**: RESOLVED (re-implemented with full schema)

---

## Assignments Page Missing Layout Shell

**Issue**: The /assignments page has broken formatting with the sidebar disappearing

- **Location**: `apps/web/app/assignments/` (missing layout.tsx)
- **Root Cause**: Missing `layout.tsx` file in the assignments directory. All other routes (/people, /occasions, /lists, /dashboard) wrap their content in Shell + ProtectedRoute via layout.tsx, but assignments had no layout wrapper.
- **Fix**: Created `apps/web/app/assignments/layout.tsx` following the pattern from other working pages, wrapping children in ProtectedRoute and Shell components
- **Commit(s)**: `f7f9e7c`
- **Status**: RESOLVED

---

## Person Schema Missing PRD Fields

**Issue**: Backend Person model only had 3 fields (name, interests, sizes) but PRD specifies 8+ fields

- **Location**: `services/api/app/models/person.py`, `services/api/app/schemas/person.py`, `apps/web/types/index.ts`
- **Root Cause**: Initial implementation only added minimal fields. PRD section 4.1.2 specifies: `id, display_name, relationship, birthdate, notes, interests, sizes, constraints, photo_url`
- **Fix**:
  - Backend: Added all missing columns to Person model, updated DTOs with proper validation
  - Migration: Created `39be0dfc7e1d_add_person_fields_per_prd.py`
  - Frontend: Updated types, enhanced PersonForm with sections for all fields, PersonCard shows relationship/birthday, PersonDetail shows age calculation
- **Commit(s)**: `0e82b42`
- **Status**: RESOLVED

---

## Dashboard Person.name AttributeError

**Issue**: Dashboard API crashes with `AttributeError: type object 'Person' has no attribute 'name'`

- **Location**: `services/api/app/services/dashboard.py:159,165,176`
- **Root Cause**: Dashboard service referenced `Person.name` in SQLAlchemy query but the Person model uses `display_name` column (per PRD schema update in `0e82b42`)
- **Fix**: Updated query to use `Person.display_name` instead of `Person.name`:
  - Line 159: SELECT clause `Person.name` → `Person.display_name`
  - Line 165: GROUP BY clause `Person.name` → `Person.display_name`
  - Line 176: PersonSummary instantiation `row.name` → `row.display_name`
- **Commit(s)**: `aba7e40`
- **Status**: RESOLVED

---

## Login Page Displays 401 Error Before User Attempts Login

**Issue**: Login page shows "Authentication failed" error message before user tries to login when visiting with an expired token

- **Location**: `apps/web/lib/context/AuthContext.tsx:36-41`
- **Root Cause**: AuthContext's `validateAndLoadUser` function sets `error` state when token validation fails (401 from `/auth/me`). Login page displays this error via `const displayError = validationError || error`, causing expired token validation failures to appear as login errors.
- **Fix**: Removed `setError()` call from token validation failure handler. Token expiration is an expected condition (not an error to display) - only actual login/register attempts should set user-visible error state.
- **Commit(s)**: `aba7e40`
- **Status**: RESOLVED

---

## Add List Buttons Not Wired on Occasion and Person Detail Pages

**Issue**: Clicking "Add a List" or "New List" buttons on occasion detail pages does nothing. PersonLists component has no "Add List" button at all.

- **Location**: `apps/web/components/occasions/OccasionLists.tsx:67-70,83-86`, `apps/web/components/people/PersonLists.tsx`
- **Root Cause**: OccasionLists had two Button components for adding lists but neither had an onClick handler. PersonLists component had no button for creating lists, only text suggesting the user should "Create a list to start adding gift ideas" without any actionable UI.
- **Fix**:
  - Created `AddListModal` component (`apps/web/components/lists/AddListModal.tsx`) with:
    - Name, Type, Visibility form fields
    - Optional `occasionId` and `personId` props for pre-filling context
    - Uses `useCreateList` hook for mutation
    - Mobile-first design with 44px touch targets
  - Updated `OccasionLists`:
    - Added state for modal open/close
    - Wired both "Create List" and "New List" buttons to open modal
    - Modal pre-fills `occasionId` on creation
  - Updated `PersonLists`:
    - Added "Create List" button to empty state
    - Added header with "New List" button when lists exist
    - Modal pre-fills `personId` on creation
- **Commit(s)**: `e469e76`
- **Status**: RESOLVED

---

## Add Item Button on List Detail Page Has No Function

**Issue**: The "Add Item" button in the list detail page header does nothing when clicked. Users have no way to add items to a list from the list view.

- **Location**: `apps/web/app/lists/[id]/page.tsx:101-104`, `apps/web/components/lists/ListItemGroup.tsx`
- **Root Cause**: The Add Item button was rendered but had no onClick handler - it was purely visual placeholder. Additionally, there were no inline add buttons within each status group (Ideas, Selected, Purchased, Received) to provide contextual item addition.
- **Fix**:
  - Created `AddListItemModal` component (`apps/web/components/lists/AddListItemModal.tsx`) with:
    - Gift selection with search/filter functionality
    - Status dropdown (idea, selected, purchased, received)
    - Optional notes field
    - Pre-selects status via `defaultStatus` prop
    - Uses `useCreateListItem` hook for mutation
    - Follows design guide (44px touch targets, proper spacing)
  - Updated list detail page (`apps/web/app/lists/[id]/page.tsx`):
    - Added modal state management
    - Wired header "Add Item" button to open modal
    - Connected `handleAddItem` to PipelineView for status-specific additions
  - Updated `ListItemGroup` component:
    - Added `onAddItem` prop to callback with status
    - Shows "Add [Status]" button at top of items when items exist
    - Shows "Add [Status]" button in empty state
  - Updated `PipelineView` to pass `onAddItem` handler to each ListItemGroup
- **Commit(s)**: `2cc284f`
- **Status**: RESOLVED

---

## Price toFixed TypeError When Adding Gift

**Issue**: Adding a gift with a price from the /gifts screen fails with client-side error: `TypeError: s.price.toFixed is not a function`

- **Location**: Multiple frontend components + backend schema
  - `services/api/app/schemas/gift.py:65,76` (GiftResponse, GiftSummary)
  - `apps/web/components/lists/ListItemRow.tsx:62`
  - `apps/web/components/lists/AddListItemModal.tsx:184`
  - `apps/web/components/gifts/GiftCard.tsx:64`
  - `apps/web/components/gifts/GiftDetail.tsx:63`
  - `apps/web/components/assignments/AssignmentCard.tsx:131`
- **Root Cause**: Pydantic v2 serializes `Decimal` to JSON as a string (e.g., `"29.99"`), but the frontend TypeScript types declared `price?: number`. When frontend called `.toFixed(2)` on a string, it threw TypeError.
- **Fix**:
  - Backend: Added `@field_serializer('price')` to GiftResponse and GiftSummary to convert Decimal to float during JSON serialization
  - Frontend: Created `formatPrice()` utility in `lib/utils.ts` for defensive parsing (handles both string and number)
  - Updated all 5 components to use `formatPrice()` instead of raw `.toFixed()`
- **Commit(s)**: `47a123f`
- **Status**: RESOLVED

---

## Lists Fail to Load After Adding Gift

**Issue**: After creating a gift, navigating to lists or list detail pages would fail to render properly

- **Location**: Same as above (price serialization issue)
- **Root Cause**: Same root cause as price toFixed error. React Query cache invalidation triggered refetch, new data included string-typed prices, and ListItemRow.tsx crashed trying to render with `.toFixed()`.
- **Fix**: Same fix as above - proper Decimal→float serialization and defensive formatPrice() utility
- **Commit(s)**: `47a123f`
- **Status**: RESOLVED

---

## Add Item Modal Only Shows Existing Items

**Issue**: When viewing a list and clicking "Add Item", the modal only allows adding existing items with no option to create a new gift inline

- **Location**: `apps/web/components/lists/AddListItemModal.tsx`
- **Root Cause**: Modal was designed for single use case (select existing gift). Users had to navigate away to /gifts/new to create gifts, breaking the flow.
- **Fix**: Enhanced modal with tabbed interface:
  - "Add Existing" tab: Original functionality (search and select existing gift)
  - "Create New" tab: Embedded gift creation form (name, URL, price, image URL)
  - Two-step process: Creates gift via useCreateGift(), then adds to list with selected status
  - Status and notes fields available in both tabs
- **Commit(s)**: `63a1505`
- **Status**: RESOLVED

---

## Gift Creation Missing List Attachment Option

**Issue**: When creating a gift, there's no way to attach it to lists. When adding from /lists screen, it should auto-select the current list while allowing additional selections.

- **Location**: `apps/web/components/gifts/ManualGiftForm.tsx`, `apps/web/components/gifts/UrlGiftForm.tsx`
- **Root Cause**: Gift creation forms had no awareness of lists - users had to create gift, then separately add it to lists through list detail pages.
- **Fix**:
  - Created reusable Checkbox UI component
  - Added multi-select list attachment to both ManualGiftForm and UrlGiftForm
  - Added `defaultListId` prop for pre-selection when coming from list context
  - After gift creation, automatically creates list items (status: 'idea') for each selected list
  - Navigates to first selected list on success (or gift detail if no lists selected)
- **Commit(s)**: `05b2d11`
- **Status**: RESOLVED

---

## Adding Gift to List Fails with 422 list_id Required

**Issue**: Adding any gift (new or existing) to a list from /lists page fails with 422 error: "body -> list_id: Field required"

- **Location**: `services/api/app/schemas/list_item.py:24-27`
- **Root Cause**: `ListItemCreate` schema required `list_id` in the request body, but the frontend correctly passes `list_id` via URL path parameter (`POST /lists/{list_id}/items`). Pydantic validation fails before the router can inject `list_id` from path.
- **Fix**:
  1. Made `list_id` field optional (`int | None = None`) in `ListItemCreate` since the router injects it from path
  2. Added missing `current_user_id` argument to `item_service.create()` call in router
- **Commit(s)**: `4825f47`, `403ffc5`
- **Status**: RESOLVED

---
