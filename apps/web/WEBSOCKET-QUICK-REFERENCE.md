# WebSocket Quick Reference Card

One-page reference for WebSocket implementation.

---

## Import Paths

```typescript
import { useWebSocket } from '@/hooks/useWebSocket';
import { useRealtimeSync, usePollingFallback, optimisticUpdate } from '@/hooks/useRealtimeSync';
import { WebSocketProvider } from '@/lib/websocket';
import { ConnectionIndicator } from '@/components/websocket/ConnectionIndicator';
import type { WSEvent, WSConnectionState, WSEventType } from '@/lib/websocket/types';
```

---

## Setup (One Time)

```tsx
// app/layout.tsx
<AuthProvider>
  <QueryClientProvider client={queryClient}>
    <WebSocketProvider>
      {children}
    </WebSocketProvider>
  </QueryClientProvider>
</AuthProvider>
```

---

## Usage Pattern: Cache Invalidation (Recommended)

```typescript
// hooks/useGifts.ts
import { useQuery } from '@tanstack/react-query';
import { useRealtimeSync } from './useRealtimeSync';

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

---

## Usage Pattern: Direct Cache Update (Advanced)

```typescript
useRealtimeSync({
  topic: 'gift-list:123',
  queryKey: ['gifts', '123'],
  onEvent: (event, queryClient) => {
    queryClient.setQueryData(['gifts', '123'], (old: Gift[] = []) => {
      switch (event.event) {
        case 'ADDED':
          return [...old, event.data.payload as Gift];
        case 'UPDATED':
          return old.map(g =>
            g.id === event.data.entity_id
              ? { ...g, ...(event.data.payload as Partial<Gift>) }
              : g
          );
        case 'DELETED':
          return old.filter(g => g.id !== event.data.entity_id);
        default:
          return old;
      }
    });
  },
});
```

---

## Connection Indicator

```tsx
// Full indicator with reconnect button
<ConnectionIndicator />

// Compact icon only
<ConnectionIndicatorCompact />

// Hide when connected (recommended)
<ConnectionIndicator hideWhenConnected />
```

---

## Event Filtering

```typescript
useRealtimeSync({
  topic: 'gift:123',
  queryKey: ['gift', '123'],
  events: ['UPDATED', 'STATUS_CHANGED'], // Only these events
});
```

---

## Debounced Updates

```typescript
useRealtimeSync({
  topic: 'gift-list:123',
  queryKey: ['gifts', '123'],
  debounceMs: 500, // Wait 500ms before invalidating
});
```

---

## Polling Fallback

```typescript
usePollingFallback({
  queryKey: ['gifts', '123'],
  intervalMs: 10000, // Poll every 10s when disconnected
});
```

---

## Optimistic Updates

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

---

## Direct WebSocket Access (Advanced)

```typescript
const { state, subscribe, unsubscribe, connect, disconnect } = useWebSocket();

// Subscribe to topic
const unsubscribe = subscribe('gift-list:123', (event) => {
  console.log('Event:', event);
});

// Check connection state
if (state === 'connected') {
  // Do something
}

// Manual reconnect
if (state === 'disconnected') {
  connect();
}

// Cleanup
unsubscribe();
```

---

## Topic Naming Convention

```
Format: {resource-type}:{identifier}

Examples:
  gift-list:123       All gifts in list 123
  gift:456            Single gift 456
  list-items:123      All list items in list 123
  user:789            User 789 events
  occasion:101        Occasion 101 events
```

---

## Event Types

```typescript
type WSEventType =
  | 'ADDED'           // New entity created
  | 'UPDATED'         // Entity modified
  | 'DELETED'         // Entity removed
  | 'STATUS_CHANGED'; // Status field changed
```

---

## Connection States

```typescript
type WSConnectionState =
  | 'connecting'      // Initial connection
  | 'connected'       // Connected and ready
  | 'reconnecting'    // Reconnecting after disconnect
  | 'disconnected'    // Not connected
  | 'error';          // Connection error
```

---

## Configuration

```tsx
// Custom WebSocket options
<WebSocketProvider
  options={{
    url: 'wss://api.example.com/ws',
    reconnect: true,
    reconnectInterval: 5000,
    reconnectMaxInterval: 20000,
    heartbeatInterval: 30000,
    debug: true,
  }}
>
  {children}
</WebSocketProvider>
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# .env.production
NEXT_PUBLIC_WS_URL=wss://api.gifting.home/ws
```

---

## Common Errors

### "WebSocket not connected"
**Cause**: Not authenticated or WebSocket unavailable
**Fix**: Check login status and NEXT_PUBLIC_WS_URL

### "useRealtimeSync must be used within WebSocketProvider"
**Cause**: Missing WebSocketProvider in layout
**Fix**: Add WebSocketProvider to app/layout.tsx

### Events not received
**Cause**: Topic mismatch or backend not broadcasting
**Fix**: Verify topic name matches backend broadcast

### Constant reconnections
**Cause**: Backend rejecting connection or token invalid
**Fix**: Check backend logs and token validity

---

## Debug Mode

```tsx
<WebSocketProvider options={{ debug: true }}>
  {children}
</WebSocketProvider>
```

**Console output:**
```
[WebSocket] Connecting to: ws://localhost:8000/ws?token=...
[WebSocket] Connected
[WebSocket] Subscribe to: gift-list:123
[WebSocket] Received: {...}
```

---

## Best Practices

✅ DO:
- Use cache invalidation for 2-3 users
- Subscribe on mount, unsubscribe on unmount
- Filter events to what you need
- Show connection status to users
- Use polling fallback for critical data

❌ DON'T:
- Use direct cache updates unless necessary
- Subscribe to topics you don't need
- Forget to unsubscribe (memory leak)
- Poll if WebSocket is working
- Hardcode URLs (use env vars)

---

## Complete Example

```tsx
// app/gifts/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { apiClient } from '@/lib/api/client';

export default function GiftsPage() {
  const queryKey = ['gifts', 'family-123'];

  // Fetch data
  const { data: gifts, isLoading } = useQuery({
    queryKey,
    queryFn: () => apiClient.get('/gifts?list_id=family-123'),
  });

  // Real-time sync
  useRealtimeSync({
    topic: 'gift-list:family-123',
    queryKey,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {gifts?.map(gift => (
        <div key={gift.id}>{gift.name}</div>
      ))}
    </div>
  );
}
```

---

## Files Reference

```
hooks/
  useWebSocket.ts              Core WebSocket hook
  useRealtimeSync.ts           React Query integration
  useGiftsRealtime.ts          Example usage

lib/websocket/
  types.ts                     TypeScript types
  WebSocketProvider.tsx        Context provider
  index.ts                     Exports

components/websocket/
  ConnectionIndicator.tsx      UI component
```

---

## Documentation

- **Complete Guide**: `FE-A-005-WEBSOCKET-COMPLETE.md`
- **Integration**: `WEBSOCKET-INTEGRATION-GUIDE.md`
- **Validation**: `WEBSOCKET-VALIDATION-CHECKLIST.md`
- **Summary**: `WEBSOCKET-SUMMARY.md`
- **System Docs**: `lib/websocket/README.md`

---

**Quick Start**: Add Provider → Add useRealtimeSync → Add ConnectionIndicator → Done!
