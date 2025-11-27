# React Query Setup (FE-003)

**Status**: ✅ Complete
**Date**: 2025-11-27
**Task**: FE-003 - React Query Setup

---

## Overview

TanStack Query (React Query v5) has been successfully configured for the Family Gifting Dashboard. This provides efficient server state management with caching, automatic refetching, and seamless integration with Next.js App Router.

---

## What Was Implemented

### 1. Dependencies Installed

```json
{
  "@tanstack/react-query": "^5.90.11",
  "@tanstack/react-query-devtools": "^5.91.1"
}
```

### 2. Files Created

#### `lib/query-client.ts`
QueryClient factory with optimal defaults for a 2-3 user application:

```typescript
- staleTime: 5 minutes (reduce unnecessary refetches)
- gcTime: 30 minutes (keep data in cache longer)
- retry: 1 (single retry on failure)
- refetchOnWindowFocus: true (keep data fresh)
- refetchOnReconnect: 'always'
```

**Key Features**:
- Server-side: Creates new QueryClient per request
- Client-side: Singleton QueryClient instance
- Prevents hydration mismatches

#### `components/providers/QueryProvider.tsx`
Client component wrapper for QueryClientProvider:

```typescript
'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { getQueryClient } from '@/lib/query-client'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

**Features**:
- Devtools included (development only)
- Proper client component directive
- Hydration-safe

#### `components/providers/index.tsx`
Providers wrapper for future provider composition:

```typescript
'use client'

import { QueryProvider } from './QueryProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
    </QueryProvider>
  )
}
```

**Benefits**:
- Single import point for all providers
- Easy to add AuthProvider, ThemeProvider, etc. later
- Maintains clean separation of concerns

### 3. Files Modified

#### `app/layout.tsx`
Root layout now wraps children with Providers:

```typescript
import { Providers } from '@/components/providers'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="safe-area-inset">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

---

## Configuration Details

### Query Defaults

| Option | Value | Reasoning |
|--------|-------|-----------|
| `staleTime` | 5 minutes | Reduce API calls for 2-3 users |
| `gcTime` | 30 minutes | Keep cached data longer |
| `retry` | 1 | Single retry reduces latency |
| `refetchOnWindowFocus` | true | Keep data fresh on tab switch |
| `refetchOnReconnect` | always | Sync after network reconnect |

### Mutation Defaults

| Option | Value | Reasoning |
|--------|-------|-----------|
| `retry` | 1 | One retry for transient failures |

---

## React Query Patterns

### Query Key Conventions

Following the implementation plan conventions:

```typescript
// Entity lists
['persons']
['persons', { cursor }]

// Single entity
['persons', personId]

// Nested data
['lists', listId, 'items']

// Dashboard aggregation
['dashboard', 'summary']
```

### Example Hook Pattern (Future Implementation)

```typescript
// hooks/usePersons.ts
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

export function usePersons(cursor?: number) {
  return useQuery({
    queryKey: ['persons', { cursor }],
    queryFn: () => apiClient.get('/persons', { cursor })
  })
}

export function usePerson(id: string) {
  return useQuery({
    queryKey: ['persons', id],
    queryFn: () => apiClient.get(`/persons/${id}`),
    enabled: !!id  // Don't fetch if no ID
  })
}
```

---

## Testing & Verification

### Type Check
```bash
pnpm run type-check
```
**Result**: ✅ No TypeScript errors

### Dev Server
```bash
pnpm dev
```
**Result**: ✅ Server starts successfully at http://localhost:3000

### Test Page
Navigate to `/test-query` to verify:
- ✅ Query executes successfully
- ✅ Loading state displays
- ✅ Data fetches and renders
- ✅ DevTools visible in bottom-left corner

---

## React Query DevTools

### Accessing DevTools

1. Start dev server: `pnpm dev`
2. Open http://localhost:3000 in browser
3. DevTools appear in bottom-left corner
4. Click floating React Query icon to expand

### DevTools Features

- View all active queries
- Inspect query state (fresh, stale, fetching)
- See cache entries and their data
- Debug refetch behavior
- Monitor query timing

---

## Server Component Considerations

### Hydration Strategy

The `getQueryClient()` function handles SSR correctly:

```typescript
export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}
```

**Why This Works**:
- Each server request gets its own QueryClient (no shared state)
- Browser maintains single QueryClient instance
- Prevents hydration mismatches
- Compatible with Next.js App Router

### Prefetching Pattern (Future)

For server components that need to prefetch data:

```typescript
import { getQueryClient } from '@/lib/query-client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

export default async function ServerPage() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['persons'],
    queryFn: fetchPersons
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientComponent />
    </HydrationBoundary>
  )
}
```

---

## Integration with WebSocket (Phase 8)

React Query will integrate with WebSocket for real-time updates:

```typescript
// Future pattern from implementation plan
export function useGifts(listId: string) {
  const queryClient = useQueryClient()

  // REST: Initial load
  const query = useQuery({
    queryKey: ['gifts', listId],
    queryFn: () => apiClient.get(`/gifts?list=${listId}`)
  })

  // WebSocket: Real-time updates
  useWebSocket({
    topic: `gift-list:${listId}`,
    onMessage: (event) => {
      if (event.event === 'GIFT_ADDED' || event.event === 'GIFT_UPDATED') {
        // Invalidate to refetch
        queryClient.invalidateQueries({ queryKey: ['gifts', listId] })
      }
    }
  })

  return query
}
```

---

## Acceptance Criteria Status

- ✅ React Query installed correctly (@tanstack/react-query@5.90.11)
- ✅ QueryProvider wraps the app (components/providers/index.tsx)
- ✅ DevTools visible in development (bottom-left corner)
- ✅ No hydration errors (server/client strategy working)
- ✅ Query client accessible from any component (via getQueryClient)
- ✅ TypeScript strict mode enabled, no errors
- ✅ Proper default options configured (staleTime, gcTime, retry)

---

## Next Steps (Phase 7)

Now that React Query infrastructure is complete, Phase 7 can implement:

1. **API Client** (FE-005): Typed fetch wrapper with authentication
2. **Data Hooks** (Phase 7): usePersons, useOccasions, useLists, etc.
3. **Dashboard** (FE-C-001): Dashboard page with real data fetching
4. **CRUD Operations**: Mutations for create/update/delete

---

## File Structure

```
apps/web/
├── lib/
│   └── query-client.ts              # QueryClient factory
├── components/
│   └── providers/
│       ├── QueryProvider.tsx        # React Query provider
│       └── index.tsx                # Providers wrapper
├── app/
│   ├── layout.tsx                   # Root layout (modified)
│   └── test-query/
│       └── page.tsx                 # Test page
└── REACT_QUERY_SETUP.md             # This file
```

---

## References

**Implementation Plan**: `docs/project_plans/implementation_plans/family-dashboard-v1/phase-6-8-frontend.md`
**Task**: FE-003 - React Query Setup
**TanStack Query Docs**: https://tanstack.com/query/latest
**Next.js App Router**: https://nextjs.org/docs/app

---

## Troubleshooting

### Issue: "Cannot find module '@/lib/query-client'"

**Solution**: Verify `tsconfig.json` has path alias:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue: DevTools not showing

**Solution**:
1. Ensure you're in development mode (`pnpm dev`)
2. DevTools only appear in client components
3. Check browser console for errors

### Issue: Hydration mismatch

**Solution**:
- Verify `getQueryClient()` is used correctly
- Don't share QueryClient between server requests
- Use `dehydrate`/`HydrationBoundary` for SSR prefetching

---

**Status**: ✅ Complete and Ready for Phase 7
**Last Updated**: 2025-11-27
