# WebSockets Guide

## Overview

WebSockets enable **real-time, bidirectional communication** between browser and server. Unlike HTTP (request-response), WebSocket connections remain open, allowing the server to push updates to the browser instantly.

---

## WebSockets vs Traditional HTTP

### Traditional HTTP (Request-Response)

```
Browser                          Server
  │                               │
  ├─ "Get the gift list" ────────>│
  │                               │
  │<─────── "Here's the list" ────┤
  │ (connection closes)            │
  │                               │
  ├─ "Get the gift list again" ──>│ (after 30 seconds)
  │                               │
  │<─────── "Here's the list" ────┤
  │ (connection closes)            │
```

**Issues:**
- Polling wastes bandwidth (constant "Are you there?" requests)
- Delays (5-30 second stale data)
- Doesn't handle real-time collaboration well

### WebSockets (Persistent Connection)

```
Browser                          Server
  │                               │
  ├─ "Subscribe to gifts" ───────>│
  │<──────── "Subscribed" ────────┤
  │ (connection stays open)        │
  │                               │
  │ (Mom adds Nintendo Switch)     │
  │                               │
  │<──── "Gift added: Nintendo" ──┤ (instant push)
  │                               │
```

**Benefits:**
- Instant updates (< 100ms)
- Server initiates communication
- Efficient (push only on changes)
- Great for real-time collaboration

---

## Real-World Use Cases

| Use Case | Why WebSockets? |
|----------|-----------------|
| Chat apps | Messages arrive instantly |
| Collaborative editing (Google Docs) | See other users' edits in real-time |
| Live dashboards | Stock prices, sports scores update instantly |
| Multiplayer games | Low-latency state sync |
| **Your gift app** | See family members add/edit gifts instantly |

---

## Your App's Architecture

### The Connection Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    BROWSER (One per user/tab)                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              WebSocketProvider (app/layout.tsx)           │   │
│  │                                                           │   │
│  │  Manages: ONE persistent WebSocket connection            │   │
│  │  Provides: Context for entire app to use                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Topic Subscriptions (internal tracking)           │   │
│  │                                                           │   │
│  │  "gifts"     → [handler1, handler2, ...]                 │   │
│  │  "lists"     → [handler3, handler4, ...]                 │   │
│  │  "persons"   → [handler5, ...]                           │   │
│  │  "occasions" → [handler6, handler7, ...]                 │   │
│  │                                                           │   │
│  │  (One connection, many subscriptions)                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ONE WebSocket connection
                              │
┌─────────────────────────────────────────────────────────────────┐
│                          SERVER                                  │
│                                                                  │
│  When a gift is created/updated:                                 │
│  ├─ Event: { topic: "gifts", event: "ADDED", data: {...} }     │
│  └─ Broadcast to all subscribed clients                         │
└─────────────────────────────────────────────────────────────────┘
```

### Key Points

1. **One Connection Per User**: Each browser tab/window opens one WebSocket connection
2. **Multiple Subscriptions**: One connection can subscribe to many topics
3. **Topic-Based**: Components subscribe to specific topics (e.g., "gifts", "lists")
4. **Automatic Resubscribe**: On reconnection, client resends all active subscriptions

---

## How It Works in the Code

### 1. Provider Setup

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <WebSocketProvider>
      {children}
    </WebSocketProvider>
  );
}
```

**What it does:**
- Creates ONE WebSocket instance
- Makes it available to entire app via context
- Handles connection lifecycle (connect, reconnect, disconnect)

### 2. Subscribing to Updates

```typescript
// hooks/useGifts.ts
export function useGifts(params?: GiftListParams, options?: UseGiftsOptions) {
  const { enabled = true } = options;

  // Fetch initial data
  const query = useQuery({
    queryKey: ['gifts', params],
    queryFn: () => giftApi.list(params),
    enabled,
  });

  // Subscribe to real-time updates
  useRealtimeSync({
    topic: 'gifts',                    // What to listen for
    queryKey: ['gifts', params],       // Which cache to update
    events: ['ADDED', 'UPDATED', 'DELETED'],  // What events to react to
    enabled,                           // Only subscribe if enabled
  });

  return query;
}
```

**Flow:**
1. Component mounts → `useGifts()` is called
2. Fetch initial data via REST API
3. Subscribe to "gifts" topic via WebSocket
4. When server sends `{ topic: "gifts", event: "ADDED", ... }`
5. `useRealtimeSync` invalidates React Query cache
6. Cache refetch gets latest data
7. UI updates automatically

### 3. Event Flow Example

**User A adds a gift:**

```
1. User A's browser:
   POST /api/gifts { name: "Nintendo Switch", ... }
   ↓ (API succeeds)

2. Server broadcasts:
   { topic: "gifts", event: "ADDED", data: { id: 123, name: "Nintendo Switch" } }
   ↓ (to all connected clients)

3. User B's browser receives event:
   → useRealtimeSync handleEvent callback fires
   → queryClient.invalidateQueries(['gifts'])
   → React Query refetches `/api/gifts`
   → New gift appears instantly on User B's screen
```

---

## The Bug We Fixed

### Before: Too Many Subscriptions

```typescript
// GiftToolbar - ALWAYS subscribed, even when not needed
const { data: personsData } = usePersons();      // subscribe("persons")
const { data: listsData } = useLists();          // subscribe("lists")
const { data: occasionsData } = useOccasions();  // subscribe("occasions")

// GiftDetailModal - hidden but always rendered
<ListDetailModal />        // calls hooks that subscribe
<AddListModal />           // calls more hooks
```

**What happened when `/gifts` page loaded:**
- Main page: 1 subscription ("gifts")
- Toolbar: 3 subscriptions ("persons", "lists", "occasions")
- Hidden modals: 2+ more subscriptions
- **Total: 6+ subscriptions + dozens of API calls**

When any event arrived on any topic → cascade of cache invalidations → multiple refetches → browser hanging.

### After: Selective Subscriptions

```typescript
// GiftToolbar - NO real-time (filters don't change often)
const { data: personsData } = usePersons(undefined, { disableRealtime: true });
const { data: listsData } = useLists(undefined, { disableRealtime: true });
const { data: occasionsData } = useOccasions(undefined, { disableRealtime: true });

// GiftDetailModal - only render when open
{selectedListId && <ListDetailModal />}
{showAddListModal && <AddListModal />}
```

**Result:**
- Main page: 1 subscription ("gifts")
- Toolbar: 0 subscriptions (just fetch once)
- Modal: 0 subscriptions (only created when opened)
- **Total: 1-2 subscriptions as needed**

Fewer subscriptions = fewer cascade effects = smooth navigation.

---

## Best Practices

### 1. Only Subscribe to Data You're Actively Viewing

```typescript
// ❌ BAD: Always subscribe to filter data
const { data: personsData } = usePersons();

// ✅ GOOD: Don't subscribe to rarely-changing data
const { data: personsData } = usePersons(undefined, { disableRealtime: true });
```

**Rule**: If data doesn't change during the user's session, don't subscribe.

### 2. Gate Subscriptions on Visibility

```typescript
// ❌ BAD: Hidden modal always subscribed
export function MyModal() {
  const { data: lists } = useLists();  // Always fetches and subscribes

  if (!isOpen) return null;
  return <div>{lists}</div>;
}

// ✅ GOOD: Only fetch/subscribe when visible
export function MyModal({ isOpen }) {
  const { data: lists } = useLists(undefined, { enabled: isOpen });

  if (!isOpen) return null;
  return <div>{lists}</div>;
}
```

**Why**: Reduces browser resource usage and prevents cache thrashing.

### 3. Use Debouncing for High-Frequency Events

```typescript
// If a topic fires many events per second, debounce cache invalidation
useRealtimeSync({
  topic: 'cursor-position',
  queryKey: ['collaborators'],
  events: ['UPDATED'],
  debounceMs: 500,  // Wait 500ms before invalidating
});
```

**Why**: Prevents excessive refetches during rapid-fire events.

### 4. Fallback to Polling if WebSocket Fails

```typescript
// apps/web/hooks/useRealtimeSync.ts already includes this!

// If WebSocket is down, automatically poll every 10s
usePollingFallback({
  queryKey: ['gifts'],
  intervalMs: 10000,  // Poll every 10 seconds if WS down
});
```

**Why**: Ensures app still works if WebSocket server is unavailable.

---

## Multi-User Scenarios

### Single User, Multiple Tabs

```
Tab 1: "gifts" subscription → events arrive → invalidate
Tab 2: "gifts" subscription → events arrive → invalidate

Result: Each tab has its OWN WebSocket, events processed independently ✓
```

### Multiple Users

```
User A's browser:
  ├─ 1 WebSocket connection
  └─ 4 subscriptions

User B's browser:
  ├─ 1 WebSocket connection (different from User A)
  └─ 4 subscriptions

Server receives events from User A's browser
├─ Broadcasts gift created to ALL connected clients
└─ Both User A and User B see update instantly

Result: Works perfectly! No shared state issues ✓
```

---

## Debugging WebSocket Issues

### Enable Debug Logging

```typescript
// In useWebSocket hook, debug logging is enabled in dev
const DEFAULT_OPTIONS = {
  debug: process.env.NODE_ENV === 'development',  // ← enabled in dev
};

// Check browser console for [WebSocket] messages
```

### Check Current State

```typescript
const { state, subscribe } = useWebSocketContext();
console.log(state);  // 'connected', 'connecting', 'reconnecting', 'error', 'disconnected'
```

### Monitor React Query Cache

```
Chrome DevTools → Ext → TanStack Query DevTools
├─ See all cache keys
├─ See invalidation events
└─ See when refetches happen
```

---

## Summary

| Concept | Explanation |
|---------|-------------|
| **WebSocket** | Persistent connection for server → browser push |
| **Topic** | Channel for organizing events (e.g., "gifts", "lists") |
| **Subscription** | "Notify me about changes to this topic" |
| **One per user** | Each browser tab has 1 connection, unlimited subscriptions |
| **Real-time** | Instant updates, no polling needed |
| **Collaboration** | Multiple users see each other's changes in real-time |
| **Selective use** | Only subscribe to data that actually needs real-time sync |

---

## References

- **Implementation**: `apps/web/hooks/useWebSocket.ts`
- **Integration**: `apps/web/hooks/useRealtimeSync.ts`
- **Provider**: `apps/web/lib/websocket/WebSocketProvider.tsx`
- **Backend**: `services/api/app/api/ws.py`

