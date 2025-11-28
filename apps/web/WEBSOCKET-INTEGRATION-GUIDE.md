# WebSocket Integration Guide

Quick guide to integrate WebSocket real-time functionality into the Family Gifting Dashboard.

---

## Step 1: Add WebSocketProvider to Layout

Update your root layout to include the WebSocketProvider:

```tsx
// app/layout.tsx
import { AuthProvider } from '@/lib/context/AuthContext';
import { WebSocketProvider } from '@/lib/websocket';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <WebSocketProvider>
              {children}
            </WebSocketProvider>
          </QueryClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Important Order:**
1. AuthProvider (provides token)
2. QueryClientProvider (React Query)
3. WebSocketProvider (uses token from AuthProvider)

---

## Step 2: Add Connection Indicator

Add connection status to your header or shell:

```tsx
// components/layout/Shell.tsx
import { ConnectionIndicator } from '@/components/websocket/ConnectionIndicator';

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="flex items-center justify-between p-4">
          <h1>Family Gifting</h1>

          {/* Connection indicator - hides when connected */}
          <ConnectionIndicator hideWhenConnected />
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
```

---

## Step 3: Update Data Hooks

Add real-time sync to existing hooks:

### Example: useGifts

```tsx
// hooks/useGifts.ts
import { useQuery } from '@tanstack/react-query';
import { useRealtimeSync } from './useRealtimeSync';
import { apiClient } from '@/lib/api/client';
import type { Gift } from '@/lib/api/types';

export function useGifts(listId?: string) {
  const queryKey = listId ? ['gifts', listId] : ['gifts'];

  // REST: Initial load
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (listId) {
        return apiClient.get<Gift[]>(`/gifts?list_id=${listId}`);
      }
      return apiClient.get<Gift[]>('/gifts');
    },
  });

  // WebSocket: Real-time updates
  useRealtimeSync({
    topic: listId ? `gift-list:${listId}` : 'gifts',
    queryKey,
  });

  return query;
}
```

### Example: useLists

```tsx
// hooks/useLists.ts
import { useQuery } from '@tanstack/react-query';
import { useRealtimeSync } from './useRealtimeSync';
import { apiClient } from '@/lib/api/client';
import type { GiftList } from '@/lib/api/types';

export function useLists() {
  const queryKey = ['lists'];

  const query = useQuery({
    queryKey,
    queryFn: () => apiClient.get<GiftList[]>('/lists'),
  });

  useRealtimeSync({
    topic: 'lists',
    queryKey,
  });

  return query;
}
```

### Example: useListItems

```tsx
// hooks/useListItems.ts
import { useQuery } from '@tanstack/react-query';
import { useRealtimeSync } from './useRealtimeSync';
import { apiClient } from '@/lib/api/client';
import type { ListItem } from '@/lib/api/types';

export function useListItems(listId: string) {
  const queryKey = ['list-items', listId];

  const query = useQuery({
    queryKey,
    queryFn: () => apiClient.get<ListItem[]>(`/list-items?list_id=${listId}`),
  });

  useRealtimeSync({
    topic: `list-items:${listId}`,
    queryKey,
  });

  return query;
}
```

---

## Step 4: Test WebSocket Connection

### 1. Start Backend

```bash
cd services/api
uv run uvicorn app.main:app --reload
```

### 2. Start Frontend

```bash
cd apps/web
pnpm dev
```

### 3. Login

Navigate to http://localhost:3000/login and authenticate.

### 4. Check Connection

Open browser DevTools console. With `debug: true`, you should see:

```
[WebSocket] Connecting to: ws://localhost:8000/ws?token=...
[WebSocket] Connected
[WebSocket] Subscribe to: gift-list:123
[WebSocket] Heartbeat started
```

### 5. Trigger Event

From another browser/device or via API:
- Create a gift
- Update a gift
- Delete a gift

You should see in console:

```
[WebSocket] Received: {
  topic: "gift-list:123",
  event: "ADDED",
  data: { ... }
}
```

And the UI should update automatically!

---

## Step 5: Add Polling Fallback (Optional)

For critical data, add polling fallback:

```tsx
import { usePollingFallback } from './useRealtimeSync';

export function useGifts(listId: string) {
  const queryKey = ['gifts', listId];

  const query = useQuery({
    queryKey,
    queryFn: () => apiClient.get(`/gifts?list_id=${listId}`),
  });

  // Real-time sync
  useRealtimeSync({
    topic: `gift-list:${listId}`,
    queryKey,
  });

  // Fallback: Poll every 10s if WebSocket down
  usePollingFallback({
    queryKey,
    intervalMs: 10000,
  });

  return query;
}
```

---

## Common Integration Patterns

### Pattern 1: List Page with Real-time

```tsx
// app/gifts/page.tsx
'use client';

import { useGifts } from '@/hooks/useGifts';

export default function GiftsPage() {
  const { data: gifts, isLoading } = useGifts('family-123');

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Gifts</h1>
      {gifts?.map((gift) => (
        <GiftCard key={gift.id} gift={gift} />
      ))}
    </div>
  );
}
```

### Pattern 2: Detail Page with Real-time

```tsx
// app/gifts/[id]/page.tsx
'use client';

import { useGift } from '@/hooks/useGift';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

export default function GiftDetailPage({ params }: { params: { id: string } }) {
  const queryKey = ['gift', params.id];

  const { data: gift } = useQuery({
    queryKey,
    queryFn: () => apiClient.get(`/gifts/${params.id}`),
  });

  useRealtimeSync({
    topic: `gift:${params.id}`,
    queryKey,
    events: ['UPDATED', 'DELETED', 'STATUS_CHANGED'],
  });

  return (
    <div>
      <h1>{gift?.name}</h1>
      {/* ... */}
    </div>
  );
}
```

### Pattern 3: Optimistic Update

```tsx
// hooks/useUpdateGift.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { optimisticUpdate } from './useRealtimeSync';

export function useUpdateGift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateGiftData) =>
      apiClient.patch(`/gifts/${data.id}`, data),

    onMutate: async (newGift) => {
      const rollback = await optimisticUpdate(
        queryClient,
        ['gifts', newGift.list_id],
        (old: Gift[]) =>
          old.map((g) => (g.id === newGift.id ? { ...g, ...newGift } : g))
      );
      return { rollback };
    },

    onError: (err, variables, context) => {
      context?.rollback();
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
    },
  });
}
```

---

## Troubleshooting

### WebSocket Not Connecting

**Check:**
1. `NEXT_PUBLIC_WS_URL` in `.env.local`
2. User is logged in (token exists)
3. Backend WebSocket endpoint running
4. Browser console for errors

**Enable debug mode:**
```tsx
<WebSocketProvider options={{ debug: true }}>
  {children}
</WebSocketProvider>
```

### Events Not Updating UI

**Check:**
1. Topic matches backend broadcast
2. `queryKey` matches your useQuery key
3. Backend is broadcasting events

**Debug:**
```tsx
useRealtimeSync({
  topic: 'gift-list:123',
  queryKey: ['gifts', '123'],
  onEvent: (event) => {
    console.log('Event received:', event);
  },
});
```

### Constant Reconnections

**Solutions:**
1. Check backend accepts WebSocket
2. Verify token is valid
3. Check CORS allows WebSocket

---

## Environment Setup

### Development

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### Production (Homelab K8s)

```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api.gifting.home/api/v1
NEXT_PUBLIC_WS_URL=wss://api.gifting.home/ws
```

---

## Next Steps

1. ✅ Add WebSocketProvider to layout
2. ✅ Update data hooks with useRealtimeSync
3. ✅ Add ConnectionIndicator to UI
4. ✅ Test with backend
5. ⬜ Add to remaining hooks (occasions, persons, etc.)
6. ⬜ Test offline/reconnection scenarios
7. ⬜ Performance testing with multiple users

---

## References

- **Full Implementation**: `FE-A-005-WEBSOCKET-COMPLETE.md`
- **WebSocket Docs**: `lib/websocket/README.md`
- **Example Hook**: `hooks/useGiftsRealtime.ts`
- **Backend WS**: `services/api/app/api/v1/ws.py`

---

**Quick Start**: Add WebSocketProvider → Update hooks → Add ConnectionIndicator → Test!
