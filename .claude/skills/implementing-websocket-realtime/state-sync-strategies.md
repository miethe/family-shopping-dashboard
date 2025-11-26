# State Synchronization Strategies

## Core Pattern: REST + WebSocket

```
Initial Load (REST) → Subscribe (WS) → Event (WS) → Update Cache → UI Reflects
```

## Strategy 1: Cache Invalidation (Simplest)

**Concept**: WebSocket events trigger cache invalidation, React Query refetches via REST.

**Pros**:
- Simple implementation
- Always in sync with server
- Leverages React Query caching

**Cons**:
- Extra network request per event
- Slight latency

```typescript
const { data } = useQuery({
  queryKey: ['gifts', listId],
  queryFn: () => fetchGifts(listId),
});

useWebSocket({
  topics: [`gift-list:${listId}`],
  onEvent: () => {
    // Trigger refetch
    queryClient.invalidateQueries(['gifts', listId]);
  },
});
```

**Best For**: 2-10 users, moderate update frequency

## Strategy 2: Direct Cache Update (Fastest)

**Concept**: Apply WebSocket event payload directly to cache without refetch.

**Pros**:
- Zero latency
- No extra network requests
- Immediate UI updates

**Cons**:
- More complex logic
- Potential for drift if events missed
- Must handle all event types

```typescript
useWebSocket({
  topics: [`gift-list:${listId}`],
  onEvent: (event) => {
    queryClient.setQueryData(['gifts', listId], (old: Gift[]) => {
      switch (event.event) {
        case 'ADDED':
          return [...old, event.data.payload];

        case 'UPDATED':
          return old.map(g =>
            g.id === event.data.entity_id
              ? { ...g, ...event.data.payload }
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

**Best For**: 10+ users, high update frequency, need instant updates

## Strategy 3: Hybrid (Recommended)

**Concept**: Direct update for common events, invalidate for complex ones.

**Pros**:
- Balance of speed and correctness
- Handles edge cases gracefully

**Cons**:
- More code

```typescript
useWebSocket({
  topics: [`gift-list:${listId}`],
  onEvent: (event) => {
    const simpleEvents = ['UPDATED', 'DELETED', 'ADDED'];

    if (simpleEvents.includes(event.event)) {
      // Direct update for simple events
      queryClient.setQueryData(['gifts', listId], (old: Gift[]) => {
        // ... direct update logic
      });
    } else {
      // Invalidate for complex events
      queryClient.invalidateQueries(['gifts', listId]);
    }
  },
});
```

**Best For**: Production apps, balance of performance and reliability

## Strategy 4: Optimistic Updates

**Concept**: Update UI immediately on user action, rollback on error.

**Pros**:
- Instant feedback
- Great UX

**Cons**:
- Complex error handling
- Can show stale data briefly

```typescript
const updateGift = useMutation({
  mutationFn: (gift: Gift) => updateGiftAPI(gift),

  onMutate: async (updatedGift) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['gifts', listId]);

    // Snapshot previous value
    const previous = queryClient.getQueryData(['gifts', listId]);

    // Optimistically update
    queryClient.setQueryData(['gifts', listId], (old: Gift[]) =>
      old.map(g => g.id === updatedGift.id ? updatedGift : g)
    );

    return { previous };
  },

  onError: (err, updatedGift, context) => {
    // Rollback on error
    queryClient.setQueryData(['gifts', listId], context?.previous);
    toast.error('Update failed');
  },

  onSuccess: () => {
    // Refetch to ensure sync
    queryClient.invalidateQueries(['gifts', listId]);
  },
});
```

**Best For**: User-triggered actions (clicks, form submissions)

## Strategy 5: Eventual Consistency

**Concept**: Allow temporary drift, periodic full sync.

**Pros**:
- Handles network issues gracefully
- Lower server load

**Cons**:
- Can show stale data
- Complex sync logic

```typescript
// Direct updates from WebSocket
useWebSocket({
  topics: [`gift-list:${listId}`],
  onEvent: (event) => {
    queryClient.setQueryData(['gifts', listId], /* ... */);
  },
});

// Periodic full sync every 60s
useInterval(() => {
  queryClient.invalidateQueries(['gifts', listId]);
}, 60000);
```

**Best For**: High-frequency updates, can tolerate brief inconsistency

## Handling Conflicts

### Last-Write-Wins

```typescript
// Server includes version/timestamp
interface Gift {
  id: string;
  name: string;
  updated_at: string;
}

// Client compares timestamps
queryClient.setQueryData(['gifts', listId], (old: Gift[]) =>
  old.map(g => {
    if (g.id === event.data.entity_id) {
      const oldTime = new Date(g.updated_at);
      const newTime = new Date(event.data.payload.updated_at);

      // Only update if newer
      return newTime > oldTime ? event.data.payload : g;
    }
    return g;
  })
);
```

### Optimistic Concurrency Control (Version Numbers)

```typescript
interface Gift {
  id: string;
  name: string;
  version: number;
}

// Server increments version on update
const updateGift = useMutation({
  mutationFn: async (gift: Gift) => {
    const response = await fetch(`/api/gifts/${gift.id}`, {
      method: 'PATCH',
      headers: { 'If-Match': gift.version.toString() },
      body: JSON.stringify(gift),
    });

    if (response.status === 412) {
      throw new Error('Conflict: resource was modified');
    }

    return response.json();
  },

  onError: (err) => {
    if (err.message.includes('Conflict')) {
      // Refetch to get latest version
      queryClient.invalidateQueries(['gifts', listId]);
      toast.error('Resource was modified by another user');
    }
  },
});
```

### User-Prompted Resolution

```typescript
const [conflict, setConflict] = useState<{ local: Gift; remote: Gift } | null>(null);

useWebSocket({
  onEvent: (event) => {
    queryClient.setQueryData(['gifts', listId], (old: Gift[]) => {
      const local = old.find(g => g.id === event.data.entity_id);
      const remote = event.data.payload;

      if (local && local.version === remote.version - 1) {
        // Normal update
        return old.map(g => g.id === local.id ? remote : g);
      } else if (local && local.version >= remote.version) {
        // Conflict detected
        setConflict({ local, remote });
        return old; // Keep local
      }

      return old;
    });
  },
});

// UI for conflict resolution
{conflict && (
  <ConflictDialog
    local={conflict.local}
    remote={conflict.remote}
    onResolve={(chosen) => {
      queryClient.setQueryData(['gifts', listId], (old: Gift[]) =>
        old.map(g => g.id === chosen.id ? chosen : g)
      );
      setConflict(null);
    }}
  />
)}
```

## Batch Updates

**Concept**: Accumulate events, apply in batch to reduce renders.

```typescript
const eventQueue = useRef<WebSocketEvent[]>([]);
const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);

useWebSocket({
  onEvent: (event) => {
    // Add to queue
    eventQueue.current.push(event);

    // Clear existing timeout
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
    }

    // Flush after 100ms of inactivity
    flushTimeoutRef.current = setTimeout(() => {
      const events = eventQueue.current;
      eventQueue.current = [];

      // Apply all events in batch
      queryClient.setQueryData(['gifts', listId], (old: Gift[]) => {
        let updated = [...old];

        for (const event of events) {
          // Apply event logic
          if (event.event === 'UPDATED') {
            updated = updated.map(g =>
              g.id === event.data.entity_id ? event.data.payload : g
            );
          }
          // ... other event types
        }

        return updated;
      });
    }, 100);
  },
});
```

## Offline/Online Handling

```typescript
const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
  const handleOnline = () => {
    setIsOnline(true);
    // Full sync when back online
    queryClient.invalidateQueries();
  };

  const handleOffline = () => {
    setIsOnline(false);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);

// Queue mutations while offline
const updateGift = useMutation({
  mutationFn: async (gift: Gift) => {
    if (!isOnline) {
      // Queue for later
      await queueMutation('updateGift', gift);
      throw new Error('Offline');
    }

    return updateGiftAPI(gift);
  },
});

// Process queue when online
useEffect(() => {
  if (isOnline) {
    processMutationQueue();
  }
}, [isOnline]);
```

## Recommendation Matrix

| Use Case | Strategy | Why |
|----------|----------|-----|
| 2-3 users, simple app | Cache Invalidation | Simplest, reliable |
| 10+ users, high frequency | Direct Cache Update | Fastest, best UX |
| Production app | Hybrid | Balance of speed & correctness |
| User actions | Optimistic Updates | Instant feedback |
| Unreliable network | Eventual Consistency | Graceful degradation |
| Collaborative editing | Conflict Resolution | Handle simultaneous edits |
