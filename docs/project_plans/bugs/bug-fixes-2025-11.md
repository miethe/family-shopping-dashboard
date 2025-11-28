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
