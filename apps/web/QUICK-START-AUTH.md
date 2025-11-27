# Quick Start: Authentication System

## What Was Implemented

A complete JWT-based authentication system with React Context, token storage, and route protection.

## File Tree

```
apps/web/
├── lib/
│   ├── auth/
│   │   ├── types.ts           ← TypeScript interfaces
│   │   ├── storage.ts         ← Token storage (localStorage)
│   │   ├── api.ts             ← API client (login, register, me, refresh)
│   │   └── README.md          ← Full documentation
│   └── context/
│       └── AuthContext.tsx    ← React Context + hooks
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.tsx ← Wrapper for protected pages
│   │   ├── PublicRoute.tsx    ← Wrapper for login/register
│   │   └── index.ts
│   └── providers/
│       ├── AuthProvider.tsx   ← Re-export
│       └── index.tsx          ← ✅ Updated with AuthProvider
├── hooks/
│   └── useAuth.ts             ← Export hook
└── middleware.ts              ← Next.js middleware (placeholder)
```

## How to Use

### 1. In Any Component

```tsx
import { useAuth } from '@/hooks/useAuth';

export function MyComponent() {
  const { user, isAuthenticated, login, logout, loading, error } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 2. Protect a Page

```tsx
'use client';

import { ProtectedRoute } from '@/components/auth';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Protected content here</div>
    </ProtectedRoute>
  );
}
```

### 3. Login/Register Pages

```tsx
'use client';

import { PublicRoute } from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login, loading, error } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    // Auto-redirects to /dashboard
  };

  return (
    <PublicRoute>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleLogin(email, password);
      }}>
        {/* Form fields */}
      </form>
    </PublicRoute>
  );
}
```

### 4. Authenticated API Requests

```tsx
import { useAuth } from '@/hooks/useAuth';

export function useMyData() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['data'],
    queryFn: async () => {
      const res = await fetch('/api/endpoint', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return res.json();
    },
    enabled: !!token,
  });
}
```

## Auth Flow

```
┌─────────────┐
│ App Starts  │
└──────┬──────┘
       │
       ├─ Check localStorage for token
       │
       ├─ Token exists?
       │  ├─ Yes → Validate with GET /auth/me
       │  │  ├─ Valid → Set user state
       │  │  └─ Invalid → Clear token
       │  └─ No → Show login
       │
       ├─ User logs in
       │  ├─ POST /auth/login
       │  ├─ Store token in localStorage
       │  ├─ Set user state
       │  └─ Redirect to /dashboard
       │
       └─ User logs out
          ├─ Clear localStorage
          ├─ Clear user state
          └─ Redirect to /login
```

## API Endpoints

All endpoints use `NEXT_PUBLIC_API_URL` (default: http://localhost:8000/api/v1)

| Method | Endpoint | Headers | Body | Response |
|--------|----------|---------|------|----------|
| POST | /auth/login | - | `{email, password}` | `{id, email, token: {access_token, expires_in}}` |
| POST | /auth/register | - | `{email, password}` | `{id, email, created_at, updated_at}` |
| GET | /auth/me | `Authorization: Bearer <token>` | - | `{id, email, created_at, updated_at}` |
| POST | /auth/refresh | `Authorization: Bearer <token>` | - | `{access_token, expires_in}` |

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

## Testing

### 1. Build Check

```bash
npm run build
# Should complete successfully with no TypeScript errors
```

### 2. Dev Server

```bash
npm run dev
# Visit http://localhost:3000
```

### 3. Test Login Flow

1. Start backend API:
   ```bash
   cd services/api
   uv run uvicorn app.main:app --reload
   ```

2. Navigate to http://localhost:3000/login

3. Test with credentials (register first if needed)

4. Should redirect to /dashboard on success

5. Refresh page → Should stay logged in

6. Click logout → Should redirect to /login

## Auth Context API

```typescript
interface AuthContextType {
  // State
  user: User | null;              // Current user object
  token: string | null;           // JWT token
  loading: boolean;               // Loading state
  error: string | null;           // Error message
  isAuthenticated: boolean;       // !!user && !!token

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
```

## Common Patterns

### Check if logged in

```tsx
const { isAuthenticated } = useAuth();

if (isAuthenticated) {
  // Show authenticated UI
}
```

### Get current user

```tsx
const { user } = useAuth();

<p>Welcome, {user?.email}</p>
```

### Handle login errors

```tsx
const { login, error } = useAuth();

try {
  await login(email, password);
} catch (err) {
  // Error available in context.error
}

{error && <p className="text-red-600">{error}</p>}
```

### Logout

```tsx
const { logout } = useAuth();

<button onClick={logout}>Logout</button>
```

## Security Notes

1. **Token Storage**: localStorage (client-side)
   - Simple for MVP
   - Consider httpOnly cookies for production

2. **Token Expiry**: 24 hours (86400 seconds)
   - Automatically cleared when expired
   - Refresh flow ready to implement

3. **HTTPS**: Required in production
   - Tokens in Authorization header
   - Must use HTTPS to protect in transit

## Next Steps

1. Implement login/register UI (FE-005)
2. Add authenticated dashboard (FE-006)
3. Test with live backend API
4. Implement token refresh flow
5. Add error boundaries

## Documentation

- **Full Docs**: `lib/auth/README.md`
- **Implementation Summary**: `FE-004-AUTH-IMPLEMENTATION.md`
- **This Guide**: `QUICK-START-AUTH.md`

---

**Status**: ✅ Ready to use
**Build**: ✅ Passing
**TypeScript**: ✅ No errors
