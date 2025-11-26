# Fallback and Recovery Strategies

## The Degradation Ladder

```
1. WebSocket      → Ideal: Full duplex, instant updates
2. SSE            → Server → client only, auto-reconnect
3. Long Polling   → Simulated real-time, higher latency
4. Short Polling  → Periodic REST requests
5. Manual Refresh → User-initiated
```

## Strategy 1: WebSocket with Polling Fallback

**When WebSocket fails, fall back to polling.**

```typescript
function useRealtimeWithFallback({
  topics,
  fallbackInterval = 10000, // Poll every 10s
}: {
  topics: string[];
  fallbackInterval?: number;
}) {
  const queryClient = useQueryClient();
  const [connectionType, setConnectionType] = useState<'ws' | 'polling' | 'none'>('none');

  // Try WebSocket first
  const { isConnected, error } = useWebSocket({
    url: WS_URL,
    topics,
  });

  // Fallback to polling if WS fails
  useEffect(() => {
    if (isConnected) {
      setConnectionType('ws');
      return;
    }

    // WebSocket failed or disconnected
    console.log('WebSocket unavailable, using polling fallback');
    setConnectionType('polling');

    const interval = setInterval(() => {
      // Invalidate queries to trigger refetch
      topics.forEach(topic => {
        const [resourceType] = topic.split(':');
        queryClient.invalidateQueries([resourceType]);
      });
    }, fallbackInterval);

    return () => clearInterval(interval);
  }, [isConnected, topics, fallbackInterval, queryClient]);

  return { connectionType, isRealtime: connectionType === 'ws' };
}
```

## Strategy 2: Progressive Timeout (WebSocket → SSE → Polling)

**Try WebSocket, then SSE, then polling.**

```typescript
function useAdaptiveRealtime({ topics }: { topics: string[] }) {
  const [method, setMethod] = useState<'ws' | 'sse' | 'polling'>('ws');
  const queryClient = useQueryClient();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const tryWebSocket = () => {
      const ws = new WebSocket(WS_URL);
      let connected = false;

      const timeout = setTimeout(() => {
        if (!connected) {
          console.log('WebSocket timeout, trying SSE');
          ws.close();
          trySSE();
        }
      }, 5000);

      ws.onopen = () => {
        connected = true;
        clearTimeout(timeout);
        setMethod('ws');
        // ... subscribe logic
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        if (!connected) {
          trySSE();
        }
      };

      cleanup = () => ws.close();
    };

    const trySSE = () => {
      const eventSource = new EventSource(`${API_URL}/events?topics=${topics.join(',')}`);
      let connected = false;

      const timeout = setTimeout(() => {
        if (!connected) {
          console.log('SSE timeout, using polling');
          eventSource.close();
          startPolling();
        }
      }, 5000);

      eventSource.onopen = () => {
        connected = true;
        clearTimeout(timeout);
        setMethod('sse');
      };

      eventSource.onmessage = (event) => {
        const wsEvent = JSON.parse(event.data);
        const [resourceType] = wsEvent.topic.split(':');
        queryClient.invalidateQueries([resourceType]);
      };

      eventSource.onerror = () => {
        clearTimeout(timeout);
        if (!connected) {
          startPolling();
        }
      };

      cleanup = () => eventSource.close();
    };

    const startPolling = () => {
      setMethod('polling');

      const interval = setInterval(() => {
        topics.forEach(topic => {
          const [resourceType] = topic.split(':');
          queryClient.invalidateQueries([resourceType]);
        });
      }, 10000);

      cleanup = () => clearInterval(interval);
    };

    tryWebSocket();

    return () => cleanup?.();
  }, [topics, queryClient]);

  return { method };
}
```

## Strategy 3: Network-Aware Fallback

**Choose method based on network conditions.**

```typescript
function useNetworkAwareRealtime({ topics }: { topics: string[] }) {
  const [effectiveType, setEffectiveType] = useState<string>('4g');

  useEffect(() => {
    // @ts-ignore - NetworkInformation API
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection) {
      setEffectiveType(connection.effectiveType);

      const handleChange = () => {
        setEffectiveType(connection.effectiveType);
      };

      connection.addEventListener('change', handleChange);

      return () => connection.removeEventListener('change', handleChange);
    }
  }, []);

  // Choose strategy based on network
  const strategy = useMemo(() => {
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'polling';  // Very slow, use polling with longer interval

      case '3g':
        return 'sse';      // SSE is more reliable than WS on unstable networks

      case '4g':
      default:
        return 'ws';       // Fast connection, use WebSocket
    }
  }, [effectiveType]);

  // Use appropriate method
  if (strategy === 'ws') {
    return useWebSocket({ url: WS_URL, topics });
  } else if (strategy === 'sse') {
    return useSSE({ url: `${API_URL}/events`, topics });
  } else {
    return usePolling({ topics, interval: 30000 }); // Longer interval for slow networks
  }
}
```

## Strategy 4: Retry with Circuit Breaker

**Prevent excessive reconnection attempts.**

```typescript
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold = 5,        // Failures before opening
    private timeout = 60000,      // Time before retry (1 min)
    private halfOpenAttempts = 1  // Attempts in half-open state
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      const now = Date.now();
      if (now - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = 'open';
    }
  }

  getState() {
    return this.state;
  }
}

// Usage
const breaker = new CircuitBreaker();

function connectWebSocket() {
  return breaker.execute(async () => {
    const ws = new WebSocket(WS_URL);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('Connection timeout'));
      }, 5000);

      ws.onopen = () => {
        clearTimeout(timeout);
        resolve(ws);
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Connection failed'));
      };
    });
  });
}
```

## Strategy 5: Offline Queue with Sync

**Queue mutations while offline, sync when reconnected.**

```typescript
interface QueuedMutation {
  id: string;
  type: string;
  data: unknown;
  timestamp: number;
}

function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<QueuedMutation[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Process queue when online
  useEffect(() => {
    if (!isOnline || queue.length === 0) return;

    const processQueue = async () => {
      const toProcess = [...queue];

      for (const mutation of toProcess) {
        try {
          await executeMutation(mutation);

          // Remove from queue on success
          setQueue(q => q.filter(m => m.id !== mutation.id));
        } catch (error) {
          console.error('Failed to sync mutation:', error);
          // Keep in queue, will retry next time
        }
      }

      // Refetch after sync
      queryClient.invalidateQueries();
    };

    processQueue();
  }, [isOnline, queue, queryClient]);

  const queueMutation = (type: string, data: unknown) => {
    const mutation: QueuedMutation = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: Date.now(),
    };

    setQueue(q => [...q, mutation]);
  };

  return { isOnline, queue, queueMutation };
}

// Usage
const { isOnline, queueMutation } = useOfflineSync();

const updateGift = useMutation({
  mutationFn: async (gift: Gift) => {
    if (!isOnline) {
      queueMutation('updateGift', gift);
      throw new Error('Offline - queued for later');
    }

    return updateGiftAPI(gift);
  },
});
```

## Strategy 6: Server-Sent Events (SSE) Fallback

**Use SSE when WebSocket unavailable.**

```typescript
function useSSE({ url, topics }: { url: string; topics: string[] }) {
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const topicsParam = topics.join(',');
    const eventSource = new EventSource(`${url}?topics=${topicsParam}`);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const wsEvent = JSON.parse(event.data);
        const [resourceType] = wsEvent.topic.split(':');
        queryClient.invalidateQueries([resourceType]);
      } catch (err) {
        console.error('SSE message parse error:', err);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };

    return () => eventSource.close();
  }, [url, topics, queryClient]);

  return { isConnected };
}
```

**Server (FastAPI SSE endpoint)**:

```python
from fastapi import FastAPI
from sse_starlette.sse import EventSourceResponse
import asyncio

@app.get("/events")
async def stream_events(topics: str):
    topic_list = topics.split(',')

    async def event_generator():
        while True:
            # Check for events on subscribed topics
            for topic in topic_list:
                events = await get_events_for_topic(topic)
                for event in events:
                    yield {
                        "event": "message",
                        "data": json.dumps(event)
                    }

            await asyncio.sleep(1)  # Poll interval

    return EventSourceResponse(event_generator())
```

## Strategy 7: Visible/Hidden Page Optimization

**Pause real-time when page hidden.**

```typescript
function useVisibilityOptimizedRealtime({ topics }: { topics: string[] }) {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);

      if (!document.hidden) {
        // Page became visible, refetch all data
        topics.forEach(topic => {
          const [resourceType] = topic.split(':');
          queryClient.invalidateQueries([resourceType]);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [topics, queryClient]);

  // Only connect WebSocket when visible
  const { isConnected } = useWebSocket({
    url: WS_URL,
    topics,
    reconnect: isVisible, // Don't reconnect when hidden
  });

  return { isConnected: isVisible && isConnected };
}
```

## User Feedback Patterns

### Connection Status Indicator

```typescript
function ConnectionIndicator({ connectionType }: { connectionType: 'ws' | 'polling' | 'offline' }) {
  const status = {
    ws: { color: 'green', text: 'Live', icon: '🟢' },
    polling: { color: 'yellow', text: 'Syncing', icon: '🟡' },
    offline: { color: 'gray', text: 'Offline', icon: '🔴' },
  }[connectionType];

  return (
    <div className="flex items-center gap-2">
      <span>{status.icon}</span>
      <span className={`text-${status.color}-600`}>{status.text}</span>
    </div>
  );
}
```

### Offline Banner

```typescript
function OfflineBanner({ isOnline }: { isOnline: boolean }) {
  if (isOnline) return null;

  return (
    <div className="bg-yellow-100 border-b border-yellow-400 p-2 text-center">
      <span>You're offline. Changes will sync when reconnected.</span>
    </div>
  );
}
```

## Best Practices

1. **Always provide fallback**: Never rely solely on WebSocket
2. **Detect network conditions**: Use Network Information API
3. **Circuit breaker**: Prevent infinite reconnection loops
4. **Queue offline mutations**: Sync when reconnected
5. **User feedback**: Show connection status clearly
6. **Optimize for battery**: Pause when page hidden
7. **Test degradation**: Verify all fallback paths work
8. **Monitor metrics**: Track connection success rates

## Testing Strategies

```typescript
// Simulate network failures
if (import.meta.env.DEV) {
  window.__simulateNetworkFailure = () => {
    // Close all WebSocket connections
  };

  window.__simulateSlowNetwork = () => {
    // Add artificial delays
  };
}
```
