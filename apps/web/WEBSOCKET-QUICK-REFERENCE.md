# WebSocket Quick Reference Card

One-page reference for WebSocket implementation.

**Current Scope**: WebSockets are used **ONLY for Kanban board (list items)** real-time sync. Other features use React Query's caching mechanisms for simplicity.

---

## Import Paths

```typescript
// ✅ PUBLIC API - Use these for all application code
import { useWebSocketContext } from '@/lib/websocket/WebSocketProvider';
import { useRealtimeSync, usePollingFallback, optimisticUpdate } from '@/hooks/useRealtimeSync';
import { WebSocketProvider } from '@/lib/websocket/WebSocketProvider';
import { ConnectionIndicator } from '@/components/websocket/ConnectionIndicator';
import type { WSEvent, WSConnectionState, WSEventType } from '@/lib/websocket/types';

// ⛔ INTERNAL ONLY - Never import in application code
// import { useWebSocket } from '@/hooks/useWebSocket';  // Creates new connections - INTERNAL USE ONLY
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

## Architecture: Singleton Connection Pattern

```
┌─────────────────────────────────────────────────────┐
│ Application Layer (99% of usage)                    │
│ - useRealtimeSync()                                 │
│ - usePollingFallback()                              │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Context Layer (1% - advanced access only)           │
│ - useWebSocketContext()                             │
│ - WebSocketProvider                                 │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Connection Layer (INTERNAL - DO NOT USE)            │
│ - useWebSocket() ← Creates connections              │
└─────────────────────────────────────────────────────┘
```

**Why Singleton?**
- One WebSocket connection per browser tab (not per component)
- All subscriptions share the same socket
- Connection state is centralized
- Prevents duplicate events, state desync, and browser crashes

**Rule of Thumb:**
- **Application code**: Use `useRealtimeSync()`
- **Advanced access**: Use `useWebSocketContext()`
- **Internal only**: `useWebSocket()` (NEVER USE DIRECTLY)

---

## Usage Pattern 1: React Query Only (Most Features)

```typescript
// hooks/useGifts.ts - gifts, lists, persons, occasions
import { useQuery } from '@tanstack/react-query';

export function useGifts(listId: string) {
  const queryKey = ['gifts', listId];

  return useQuery({
    queryKey,
    queryFn: () => apiClient.get(`/gifts?list_id=${listId}`),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}
```

## Usage Pattern 2: WebSocket + Cache Invalidation (Kanban Only)

```typescript
// hooks/useListItems.ts - Kanban board with WebSocket
import { useQuery } from '@tanstack/react-query';
import { useRealtimeSync } from './useRealtimeSync';

export function useListItems(listId: string) {
  const queryKey = ['list-items', listId];

  const query = useQuery({
    queryKey,
    queryFn: () => apiClient.get(`/list-items?list_id=${listId}`),
  });

  // Real-time sync for Kanban board
  useRealtimeSync({
    topic: `list-items:${listId}`,
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

## Advanced: Direct Context Access

⚠️ **CRITICAL: Never call `useWebSocket()` directly!**

`useWebSocket()` is an **internal hook** used ONLY by `WebSocketProvider`. Calling it directly creates duplicate WebSocket connections.

### When to Use Direct Access

Only use `useWebSocketContext()` if `useRealtimeSync()` doesn't meet your needs (rare).

### Correct Pattern

```typescript
import { useWebSocketContext } from '@/lib/websocket/WebSocketProvider';

function MyComponent() {
  const { state, subscribe } = useWebSocketContext();

  useEffect(() => {
    const unsubscribe = subscribe('my-topic', (event) => {
      console.log('Event:', event);
    });

    return () => unsubscribe();
    // ⚠️ CRITICAL: Empty deps - subscribe once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check connection state (read-only)
  if (state === 'connected') {
    // Do something
  }
}
```

### ❌ WRONG - Creates Duplicate Connection

```typescript
// NEVER DO THIS - useWebSocket() creates a NEW connection!
import { useWebSocket } from '@/hooks/useWebSocket';

function BadComponent() {
  const { state } = useWebSocket(); // Bug: Creates duplicate connection
}
```

---

## Topic Naming Convention

Format: `{resource-type}` (collection) or `{resource-type}:{id}` (single)

### Actual Topics in Codebase

**Collection Topics:**
- `'gifts'` - All gifts
- `'lists'` - All lists
- `'persons'` - All persons
- `'occasions'` - All occasions
- `'ideas:inbox'` - Idea inbox

**Single Entity Topics:**
- `'gift:${id}'` - Specific gift
- `'list:${id}'` - Specific list (also receives list item events)
- `'person:${id}'` - Specific person
- `'occasion:${id}'` - Specific occasion

**Filtered Topics:**
- `'person:${personId}:lists'` - Lists for person
- `'occasion:${occasionId}:lists'` - Lists for occasion

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

### Browser tab crashes when navigating
**Cause**: Using `useWebSocket()` directly or `state` in effect dependencies
**Fix**: Use `useWebSocketContext()` and empty dependency arrays. See Anti-Patterns section.

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

### ⚠️ Critical Rules (MUST FOLLOW)

1. **Never call `useWebSocket()` directly** - It's internal to WebSocketProvider
2. **Always use `useWebSocketContext()`** for advanced access (rarely needed)
3. **Never include `state` in useEffect dependencies** - Causes infinite re-subscription
4. **Use `useRealtimeSync()` for 99% of cases** - It handles state correctly

✅ DO:
- Use `useRealtimeSync()` for real-time data (handles everything)
- Use cache invalidation pattern (recommended for 2-3 users)
- Subscribe on mount, unsubscribe on unmount (automatic with useRealtimeSync)
- Filter events to only what you need
- Show connection status to users
- Use polling fallback for critical data

❌ DON'T:
- Call `useWebSocket()` directly (creates duplicate connections)
- Include `state` in effect dependencies (infinite loop)
- Create custom WebSocket hooks bypassing context
- Use direct cache updates unless necessary
- Subscribe to topics you don't need
- Forget to unsubscribe (memory leak)
- Poll if WebSocket is working
- Hardcode URLs (use env vars)

---

## Anti-Patterns (Avoid These)

### ❌ Anti-Pattern 1: Direct useWebSocket() Call

**Bug:** Creates duplicate WebSocket connections per component.

```typescript
// ❌ WRONG - creates new connection each time
import { useWebSocket } from '@/hooks/useWebSocket';
const { state } = useWebSocket();

// ✅ CORRECT - uses shared connection
import { useWebSocketContext } from '@/lib/websocket/WebSocketProvider';
const { state } = useWebSocketContext();
```

### ❌ Anti-Pattern 2: State in Dependencies

**Bug:** Causes infinite re-subscription loop, crashes browser.

```typescript
// ❌ WRONG - infinite loop when state changes
const { state, subscribe } = useWebSocketContext();
useEffect(() => {
  subscribe('topic', handler);
  return () => unsubscribe();
}, [state, subscribe]); // Bug: re-runs when state changes

// ✅ CORRECT - subscribe once on mount
useEffect(() => {
  subscribe('topic', handler);
  return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Empty deps
```

### ❌ Anti-Pattern 3: Custom WebSocket Hooks

**Bug:** Bypasses singleton, duplicates connection logic.

```typescript
// ❌ WRONG - breaks singleton pattern
function useCustomWebSocket(topic: string) {
  const socket = useWebSocket(); // Creates duplicate connection
}

// ✅ CORRECT - build on existing hooks
function useCustomSync(topic: string) {
  return useRealtimeSync({ topic, queryKey: [...] });
}
```

### Bugs Caused by These Anti-Patterns

- **Commit ab0d8f0**: ConnectionIndicator used useWebSocket() directly
- **Commit 671a3c1**: useRealtimeSync had state in dependencies
- **Commit 7bc264a**: useRealtimeSync used useWebSocket() instead of context

All three bugs caused browser tab crashes from memory exhaustion.

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
  useListItems.ts              Kanban board with WebSocket (real example)
  useGifts.ts                  Gifts using React Query only (real example)

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
