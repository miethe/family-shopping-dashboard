# WebSocket System

Real-time communication infrastructure for the Family Gifting Dashboard.

**Note**: WebSockets are currently used **ONLY for the Kanban board (list items)** real-time sync. Other data (gifts, lists, persons, occasions) uses React Query's caching and staleTime mechanisms for simplicity (2-3 user single-tenant app).

---

## Quick Start

### 1. Setup Provider

```tsx
// app/layout.tsx
import { WebSocketProvider } from '@/lib/websocket';

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
```

### 2. Use in Component (List Items / Kanban)

```tsx
// app/lists/[id]/page.tsx
'use client';

import { useListItems } from '@/hooks/useListItems';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

export default function ListDetailPage({ params }: { params: { id: string } }) {
  const queryKey = ['list-items', params.id];

  // Fetch data
  const { data: items } = useQuery({
    queryKey,
    queryFn: () => apiClient.get(`/list-items?list_id=${params.id}`),
  });

  // Real-time sync (Kanban board only)
  useRealtimeSync({
    topic: `list-items:${params.id}`,
    queryKey,
  });

  return <div>{/* Kanban board */}</div>;
}
```

---

## Core Concepts

### Connection Lifecycle

```
[disconnected]
    ↓ login
[connecting]
    ↓ onopen
[connected] ←─────┐
    ↓ onclose     │
[reconnecting] ───┘
    ↓ manual disconnect
[disconnected]
```

### Topic Structure

Topics follow the pattern: `{resource-type}:{identifier}`

**Examples:**
- `gift-list:123` - All gifts in list 123
- `gift:456` - Single gift 456
- `user:789` - User 789 events
- `list-item:list-123` - All items in list 123

### Event Types

| Event | Description |
|-------|-------------|
| `ADDED` | New entity created |
| `UPDATED` | Entity modified |
| `DELETED` | Entity removed |
| `STATUS_CHANGED` | Status field changed |

---

## Hooks

### useWebSocket

Low-level WebSocket connection hook.

```typescript
const { state, subscribe, unsubscribe, connect, disconnect } = useWebSocket();

// Subscribe to topic
const unsubscribe = subscribe('gift-list:123', (event) => {
  console.log('Event:', event);
});

// Unsubscribe
unsubscribe();

// Connection state
console.log(state); // 'connected' | 'connecting' | 'reconnecting' | 'disconnected' | 'error'
```

### useRealtimeSync

High-level React Query integration.

**Strategy 1: Cache Invalidation (default)**

```typescript
useRealtimeSync({
  topic: 'gift-list:123',
  queryKey: ['gifts', '123'],
});
```

**Strategy 2: Direct Cache Update**

```typescript
useRealtimeSync({
  topic: 'gift-list:123',
  queryKey: ['gifts', '123'],
  onEvent: (event, queryClient) => {
    queryClient.setQueryData(['gifts', '123'], (old: Gift[]) => {
      if (event.event === 'ADDED') {
        return [...old, event.data.payload];
      }
      return old;
    });
  },
});
```

**Options:**

```typescript
interface UseRealtimeSyncOptions {
  topic: string;                // WebSocket topic
  queryKey: QueryKey;           // React Query key
  events?: WSEventType[];       // Filter events
  onEvent?: (event, client) => void; // Custom handler
  debounceMs?: number;          // Debounce invalidation
  enabled?: boolean;            // Enable/disable
  onSubscribed?: () => void;    // Callback
  onUnsubscribed?: () => void;  // Callback
}
```

### usePollingFallback

Automatic polling when WebSocket disconnected.

```typescript
usePollingFallback({
  queryKey: ['gifts', '123'],
  intervalMs: 10000, // Poll every 10s
});
```

---

## Components

### ConnectionIndicator

Shows connection status with visual feedback.

```tsx
import { ConnectionIndicator } from '@/components/websocket/ConnectionIndicator';

// Full indicator
<ConnectionIndicator />

// Compact icon only
<ConnectionIndicatorCompact />

// Hide when connected
<ConnectionIndicator hideWhenConnected />
```

---

## TypeScript Types

### WSEvent

```typescript
interface WSEvent<T = unknown> {
  topic: string;
  event: 'ADDED' | 'UPDATED' | 'DELETED' | 'STATUS_CHANGED';
  data: {
    entity_id: string;
    payload: T;
    user_id: string;
    timestamp: string;
  };
  trace_id?: string;
}
```

### WSConnectionState

```typescript
type WSConnectionState =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error';
```

---

## Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### Provider Options

```tsx
<WebSocketProvider
  options={{
    url: 'wss://api.example.com/ws',
    reconnect: true,
    reconnectInterval: 5000,      // Initial delay
    reconnectMaxInterval: 20000,  // Max delay
    heartbeatInterval: 30000,     // Ping interval
    debug: true,                  // Enable logs
  }}
>
  {children}
</WebSocketProvider>
```

---

## Patterns

### Pattern: List with Real-time Updates

```typescript
// hooks/useGifts.ts
export function useGifts(listId: string) {
  const queryKey = ['gifts', listId];

  const query = useQuery({
    queryKey,
    queryFn: () => apiClient.get(`/gifts?list_id=${listId}`),
  });

  useRealtimeSync({
    topic: `gift-list:${listId}`,
    queryKey,
  });

  return query;
}
```

### Pattern: Optimistic Update with Rollback

```typescript
import { optimisticUpdate } from '@/hooks/useRealtimeSync';

export function useUpdateGift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiClient.patch(`/gifts/${data.id}`, data),

    onMutate: async (newGift) => {
      const rollback = await optimisticUpdate(
        queryClient,
        ['gifts', newGift.list_id],
        (old: Gift[]) => old.map(g => g.id === newGift.id ? newGift : g)
      );
      return { rollback };
    },

    onError: (err, variables, context) => {
      context?.rollback();
    },
  });
}
```

### Pattern: Debounced Updates

```typescript
useRealtimeSync({
  topic: 'gift-list:123',
  queryKey: ['gifts', '123'],
  debounceMs: 500, // Wait 500ms before invalidating
});
```

### Pattern: Selective Event Handling

```typescript
useRealtimeSync({
  topic: 'gift:456',
  queryKey: ['gift', '456'],
  events: ['UPDATED', 'STATUS_CHANGED'], // Ignore ADDED/DELETED
});
```

---

## Troubleshooting

### Connection Issues

**Problem:** WebSocket won't connect

**Check:**
1. Environment variable `NEXT_PUBLIC_WS_URL` is set
2. User is authenticated (token exists)
3. Backend WebSocket endpoint is running
4. Browser console for errors

**Debug:**
```tsx
<WebSocketProvider options={{ debug: true }}>
  {children}
</WebSocketProvider>
```

### Events Not Received

**Problem:** Subscribed but no events

**Check:**
1. Topic matches backend broadcast topic
2. Event type not filtered out
3. Handler function is correct

**Debug:**
```typescript
useRealtimeSync({
  topic: 'gift-list:123',
  queryKey: ['gifts'],
  onEvent: (event) => {
    console.log('Received:', event);
  },
});
```

### Constant Reconnections

**Problem:** Reconnecting in a loop

**Solutions:**
1. Check backend accepts connection
2. Verify JWT token is valid
3. Increase reconnect intervals
4. Check CORS configuration

---

## Best Practices

### DO

✅ Use cache invalidation for 2-3 users (simple, safe)
✅ Subscribe on component mount, unsubscribe on unmount
✅ Filter events to what you need
✅ Use polling fallback for critical data
✅ Show connection status to users
✅ Test offline/reconnection scenarios

### DON'T

❌ Don't use direct cache updates unless necessary
❌ Don't subscribe to topics you don't need
❌ Don't forget to unsubscribe (causes memory leaks)
❌ Don't poll if WebSocket is working
❌ Don't hardcode URLs (use env vars)
❌ Don't reconnect on manual disconnect

---

## Examples

See working examples:
- **hooks/useListItems.ts** - List items (Kanban) with real-time sync via WebSocket
- **hooks/useGifts.ts** - Gifts using React Query staleTime (no WebSocket)
- **FE-A-005-WEBSOCKET-COMPLETE.md** - Complete implementation guide

---

## Architecture

```
┌─────────────────┐
│   Component     │
└────────┬────────┘
         │
         ├─ useQuery (REST initial load)
         │
         └─ useRealtimeSync
            └─ useWebSocket
               ├─ connect with JWT
               ├─ subscribe to topics
               ├─ receive events
               ├─ invalidate cache
               └─ reconnect on error
```

---

## References

- **Backend WS**: `services/api/app/api/v1/ws.py`
- **Auth Context**: `lib/context/AuthContext.tsx`
- **API Client**: `lib/api/client.ts`
- **Query Client**: `lib/query-client.ts`

---

**Last Updated**: 2025-11-27
