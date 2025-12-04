# API Client

Typed fetch wrapper for the Family Gifting Dashboard API with automatic authentication and error handling.

## Quick Start

```typescript
import { giftApi, listApi, dashboardApi } from '@/lib/api';

// Get gifts
const gifts = await giftApi.list();

// Create a gift
const newGift = await giftApi.create({
  name: 'LEGO Star Wars',
  price: 79.99,
  url: 'https://...'
});

// Get dashboard summary
const summary = await dashboardApi.summary();
```

## Available APIs

- `authApi` - Authentication (login, register, refresh, me)
- `userApi` - User management
- `personApi` - Person/recipient management
- `occasionApi` - Occasions (birthdays, holidays)
- `giftApi` - Gift items
- `listApi` - Gift lists
- `listItemApi` - Items in lists
- `dashboardApi` - Dashboard aggregations

## Authentication

The client automatically includes JWT tokens from localStorage:

```typescript
import { authApi } from '@/lib/api';

// Login
const { access_token, user } = await authApi.login({
  email: 'user@example.com',
  password: 'password'
});

// Store token
localStorage.setItem('auth_token', access_token);

// All subsequent requests include token automatically
await giftApi.list(); // Authorization header added automatically
```

## Error Handling

```typescript
import { ApiError } from '@/lib/api';

try {
  await giftApi.create(data);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`Error ${error.code}: ${error.message}`);
    console.error(`Status: ${error.statusCode}`);
    console.error(`Trace ID: ${error.traceId}`);
  }
}
```

## Pagination

```typescript
// Cursor-based pagination
const { items, has_more, next_cursor } = await personApi.list({
  cursor: 0,
  limit: 20
});

if (has_more) {
  const nextPage = await personApi.list({ cursor: next_cursor });
}
```

## React Query Integration

The API client works seamlessly with React Query:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { giftApi } from '@/lib/api';

// Query
function useGifts() {
  return useQuery({
    queryKey: ['gifts'],
    queryFn: () => giftApi.list(),
  });
}

// Mutation
function useCreateGift() {
  return useMutation({
    mutationFn: (data) => giftApi.create(data),
  });
}
```

## Files

- `types.ts` - Core API types (errors, pagination)
- `client.ts` - HTTP client implementation
- `endpoints.ts` - Typed endpoint functions
- `index.ts` - Public exports

## Environment Variables

Set in `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Type Safety

All responses are fully typed:

```typescript
import type { Gift, Person, GiftList } from '@/types';

const gift: Gift = await giftApi.get(1);
const person: Person = await personApi.get(2);
const list: GiftList = await listApi.get(3);
```
