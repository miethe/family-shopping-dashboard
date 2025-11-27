# FE-005: API Client Implementation - Complete

## Summary

Successfully implemented a complete typed API client layer for the Family Gifting Dashboard web application. The implementation provides automatic auth header injection, comprehensive error handling, and fully-typed endpoint functions matching the FastAPI backend.

## Files Created

### Core API Client Files

#### `/lib/api/types.ts` (40 lines)
Core type definitions for API communication:
- `APIError` - Error structure matching backend format
- `APIErrorResponse` - Standard error envelope
- `PageInfo` - Cursor-based pagination metadata
- `PaginatedResponse<T>` - Generic paginated response wrapper
- `RequestOptions` - Request configuration options

#### `/lib/api/client.ts` (151 lines)
HTTP client implementation with:
- `ApiClient` class with typed methods (GET, POST, PUT, PATCH, DELETE)
- `ApiError` custom error class with status codes and trace IDs
- Automatic JWT token injection from localStorage
- Query parameter serialization
- Error response parsing and type-safe error throwing
- 204 No Content handling
- Singleton `apiClient` instance

#### `/lib/api/endpoints.ts` (173 lines)
Typed endpoint functions organized by domain:
- **Auth API** - login, register, refresh, me
- **User API** - list, get, update, delete
- **Person API** - list (paginated), get, create, update, delete
- **Occasion API** - list (paginated with filters), get, create, update, delete
- **Gift API** - list (paginated with search), get, create, createFromUrl, update, delete
- **List API** - list (paginated with filters), get (with items), create, update, delete
- **List Item API** - list (filtered), get, create, update, delete
- **Dashboard API** - summary

#### `/lib/api/index.ts` (9 lines)
Central export point for all API functionality

### Updated Files

#### `/types/index.ts` (277 lines)
Completely rewritten to match backend schemas exactly:
- All domain types with proper snake_case field names
- Timestamp fields using ISO strings
- Create/Update/Summary variants for each entity
- Proper enum types matching backend (ListType, ListVisibility, ListItemStatus, OccasionType)
- Extended types (ListItemWithGift, ListItemWithAssignee, ListWithItems)
- Dashboard aggregation types
- WebSocket event types
- API error types

## Key Features

### 1. Type Safety
- All API responses properly typed
- TypeScript inference for request/response bodies
- Compile-time checking of API calls
- No `any` types used

### 2. Automatic Authentication
```typescript
// Token automatically injected from localStorage
const gifts = await giftApi.list();
```

### 3. Error Handling
```typescript
try {
  await giftApi.create(data);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.code, error.message, error.traceId);
  }
}
```

### 4. Pagination Support
```typescript
const { items, has_more, next_cursor } = await personApi.list({ cursor: 10 });
```

### 5. Query Parameters
```typescript
// Type-safe query params
await listApi.list({ type: 'wishlist', occasion_id: 1 });
await giftApi.list({ search: 'lego', cursor: 20 });
```

## Usage Examples

### Authentication
```typescript
import { authApi } from '@/lib/api';

// Login
const { access_token, user } = await authApi.login({
  email: 'user@example.com',
  password: 'password'
});
localStorage.setItem('auth_token', access_token);

// Get current user
const currentUser = await authApi.me();
```

### CRUD Operations
```typescript
import { giftApi } from '@/lib/api';

// Create
const gift = await giftApi.create({
  name: 'LEGO Star Wars Set',
  price: 79.99,
  url: 'https://...',
});

// Read
const gift = await giftApi.get(1);
const gifts = await giftApi.list({ search: 'lego' });

// Update
const updated = await giftApi.update(1, { price: 69.99 });

// Delete
await giftApi.delete(1);
```

### Pagination
```typescript
import { personApi } from '@/lib/api';

let cursor: number | null = null;
const allPeople: Person[] = [];

do {
  const response = await personApi.list({ cursor: cursor || undefined });
  allPeople.push(...response.items);
  cursor = response.next_cursor;
} while (response.has_more);
```

### Dashboard Data
```typescript
import { dashboardApi } from '@/lib/api';

const summary = await dashboardApi.summary();
console.log(summary.primary_occasion);
console.log(summary.total_ideas, summary.total_purchased);
```

## Type Definitions

### Backend Schema Alignment

All TypeScript types match Python Pydantic schemas exactly:

| Python Schema | TypeScript Type | Fields Match |
|---------------|----------------|--------------|
| `PersonResponse` | `Person` | Yes |
| `GiftResponse` | `Gift` | Yes |
| `ListResponse` | `GiftList` | Yes |
| `ListItemResponse` | `ListItem` | Yes |
| `OccasionResponse` | `Occasion` | Yes |
| `DashboardResponse` | `DashboardResponse` | Yes |
| `PaginatedResponse[T]` | `PaginatedResponse<T>` | Yes |
| `ErrorResponse` | `APIErrorResponse` | Yes |

### Enum Types

All enums match backend exactly:

```typescript
// List types
type ListType = 'wishlist' | 'ideas' | 'assigned';
type ListVisibility = 'private' | 'family' | 'public';

// List item statuses
type ListItemStatus = 'idea' | 'selected' | 'purchased' | 'received';

// Occasion types
type OccasionType = 'birthday' | 'holiday' | 'other';
```

## Integration Points

### React Query (Phase 7)
The API client is designed to work seamlessly with React Query:

```typescript
// In hooks/useGifts.ts
import { useQuery } from '@tanstack/react-query';
import { giftApi } from '@/lib/api';

export function useGifts() {
  return useQuery({
    queryKey: ['gifts'],
    queryFn: () => giftApi.list(),
  });
}
```

### WebSocket (Phase 8)
API types are shared with WebSocket events:

```typescript
import type { WSEvent, Gift } from '@/types';

const event: WSEvent<Gift> = {
  topic: 'gift-list:family-1',
  event: 'UPDATED',
  data: {
    entity_id: '123',
    payload: updatedGift,
    user_id: '456'
  }
};
```

### Authentication Flow
The client integrates with localStorage for token management:

```typescript
// After login
const { access_token } = await authApi.login(credentials);
localStorage.setItem('auth_token', access_token);

// Token automatically included in all subsequent requests
await giftApi.list(); // Includes Authorization: Bearer {token}

// On logout
localStorage.removeItem('auth_token');
```

## Error Handling

### ApiError Class
```typescript
export class ApiError extends Error {
  code: string;        // 'VALIDATION_ERROR', 'NOT_FOUND', etc.
  statusCode: number;  // HTTP status code
  traceId?: string;    // Backend trace ID for debugging
}
```

### Usage in Components
```typescript
try {
  await giftApi.create(formData);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.statusCode === 401) {
      // Redirect to login
      router.push('/login');
    } else if (error.statusCode === 422) {
      // Show validation errors
      setErrors(error.message);
    }
  }
}
```

## Testing Considerations

The API client is designed to be easily testable:

### Mocking
```typescript
// Mock the apiClient
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }
}));

// In test
import { apiClient } from '@/lib/api/client';
(apiClient.get as jest.Mock).mockResolvedValue(mockData);
```

### Custom Instance
```typescript
// For integration tests
const testClient = new ApiClient('http://localhost:8000/api/v1');
```

## Performance Considerations

1. **Singleton Pattern**: Single client instance reduces memory overhead
2. **Type Inference**: TypeScript types don't affect runtime performance
3. **Lazy Loading**: Import specific endpoints to reduce bundle size:
   ```typescript
   import { giftApi } from '@/lib/api/endpoints';
   // Only imports gift-related code
   ```

## Security

1. **Token Storage**: JWT stored in localStorage (client-side only)
2. **HTTPS Required**: Production should enforce HTTPS
3. **No Token in URL**: Token only sent in Authorization header
4. **Error Trace IDs**: Backend trace IDs help with debugging without exposing internals

## Next Steps (Phase 7: React Query Integration)

The API client is now ready for React Query hooks:

1. Create `hooks/useGifts.ts` with queries and mutations
2. Create `hooks/useLists.ts` with queries and mutations
3. Create `hooks/useDashboard.ts` for dashboard data
4. Implement optimistic updates using mutations
5. Add WebSocket integration to invalidate queries

## Acceptance Criteria

- [x] ApiClient class with typed methods
- [x] Automatic auth header injection
- [x] Proper error handling with ApiError
- [x] Typed endpoint functions for all entities
- [x] TypeScript types match backend schemas
- [x] Works with React Query (returns Promise)
- [x] No TypeScript errors

## Files Summary

| File | Lines | Purpose |
|------|-------|---------|
| `lib/api/types.ts` | 40 | Core API types |
| `lib/api/client.ts` | 151 | HTTP client implementation |
| `lib/api/endpoints.ts` | 173 | Typed endpoint functions |
| `lib/api/index.ts` | 9 | Central exports |
| `types/index.ts` | 277 | Domain types (updated) |
| **Total** | **650** | Complete API layer |

## Validation

Type checking passes successfully:
```bash
pnpm type-check
# ✓ No errors
```

All types correctly match backend FastAPI schemas from `services/api/app/schemas/`.

---

**Implementation Date**: 2025-11-27
**Phase**: FE-005 - API Client
**Status**: Complete ✓
