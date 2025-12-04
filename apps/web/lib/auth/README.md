# Authentication System

## Overview

This authentication system provides JWT-based authentication with token storage, automatic validation, and session management for the Family Gifting Dashboard.

## Architecture

```
AuthProvider (React Context)
├── Token Storage (localStorage)
├── API Client (fetch wrapper)
└── Auth State Management
```

## Files

- `types.ts` - TypeScript interfaces for auth data structures
- `storage.ts` - Token storage helpers (localStorage with expiry)
- `api.ts` - API client for auth endpoints
- `lib/context/AuthContext.tsx` - React context provider and hook

## Usage

### 1. Basic Setup (Already Done)

The `AuthProvider` is already wrapped in the root layout via `components/providers/index.tsx`.

### 2. Using the useAuth Hook

```typescript
'use client';

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

### 3. Login Flow

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      // Automatically redirects to /dashboard on success
    } catch (err) {
      // Error is set in context and available via error state
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="min-h-[44px]"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="min-h-[44px]"
      />
      {error && <p className="text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="min-h-[44px]">
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### 4. Protected Routes

Use the `ProtectedRoute` component to protect pages:

```typescript
'use client';

import { ProtectedRoute } from '@/components/auth';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>
        <h1>Dashboard</h1>
        {/* Your protected content */}
      </div>
    </ProtectedRoute>
  );
}
```

### 5. Public Routes (Login/Register)

Use the `PublicRoute` component for login/register pages:

```typescript
'use client';

import { PublicRoute } from '@/components/auth';

export default function LoginPage() {
  return (
    <PublicRoute>
      <div>
        <h1>Login</h1>
        {/* Login form */}
      </div>
    </PublicRoute>
  );
}
```

### 6. Making Authenticated API Requests

```typescript
import { useAuth } from '@/hooks/useAuth';

export function MyComponent() {
  const { token } = useAuth();

  const fetchData = async () => {
    const response = await fetch('/api/endpoint', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  };

  // Use with React Query
  const { data } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    enabled: !!token,
  });
}
```

## API Endpoints

### POST /auth/login
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "id": 1,
  "email": "user@example.com",
  "created_at": "2025-11-26T12:00:00Z",
  "updated_at": "2025-11-26T12:00:00Z",
  "token": {
    "access_token": "eyJhbGc...",
    "token_type": "bearer",
    "expires_in": 86400
  }
}
```

### POST /auth/register
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (201):
{
  "id": 1,
  "email": "user@example.com",
  "created_at": "2025-11-26T12:00:00Z",
  "updated_at": "2025-11-26T12:00:00Z"
}
```

### GET /auth/me
```
Headers: Authorization: Bearer <token>

Response (200):
{
  "id": 1,
  "email": "user@example.com",
  "created_at": "2025-11-26T12:00:00Z",
  "updated_at": "2025-11-26T12:00:00Z"
}
```

### POST /auth/refresh
```
Headers: Authorization: Bearer <token>

Response (200):
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

## Token Storage

Tokens are stored in localStorage with expiry tracking:

- `auth_token` - JWT token
- `auth_token_expiry` - Expiry timestamp (milliseconds)

### Storage Helpers

```typescript
import { storeToken, getToken, clearToken, hasValidToken } from '@/lib/auth/storage';

// Store token with expiry
storeToken('eyJhbGc...', 86400); // 24 hours

// Get valid token (returns null if expired)
const token = getToken();

// Check if valid token exists
if (hasValidToken()) {
  // Token is valid
}

// Clear token
clearToken();
```

## Auth State

The AuthContext provides:

```typescript
interface AuthContextType {
  user: User | null;              // Current user object
  token: string | null;           // JWT token
  loading: boolean;               // Loading state
  error: string | null;           // Error message
  isAuthenticated: boolean;       // Computed: !!user && !!token
  login: (email, password) => Promise<void>;
  logout: () => void;
}
```

## Error Handling

Errors are managed in the context state:

```typescript
const { error } = useAuth();

// Errors are set on:
// - Login failure
// - Token validation failure
// - Network errors

// Clear error by attempting another action
```

## Mobile Considerations

- All interactive elements use `min-h-[44px] min-w-[44px]` for touch targets
- Forms are responsive and work well on mobile
- Token expiry is checked to avoid stale sessions

## Security Notes

1. **localStorage vs Cookies**: We use localStorage for simplicity. For production, consider:
   - HttpOnly cookies for better security
   - CSRF protection
   - Secure flag for HTTPS-only

2. **Token Expiry**: Tokens expire after 24 hours (86400 seconds). Implement refresh token flow for better UX.

3. **HTTPS**: Always use HTTPS in production to protect tokens in transit.

## Future Enhancements

- [ ] Automatic token refresh before expiry
- [ ] Remember me functionality
- [ ] Social login integration
- [ ] Two-factor authentication
- [ ] Session timeout warnings

## Troubleshooting

### Token not persisting
- Check browser localStorage is enabled
- Verify token expiry is set correctly
- Check for errors in browser console

### Infinite redirect loops
- Ensure public routes use `PublicRoute` wrapper
- Ensure protected routes use `ProtectedRoute` wrapper
- Check middleware configuration

### Token validation fails
- Verify API_BASE_URL environment variable
- Check backend is running and accessible
- Verify token format matches backend expectations
