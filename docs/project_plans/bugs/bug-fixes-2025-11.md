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
