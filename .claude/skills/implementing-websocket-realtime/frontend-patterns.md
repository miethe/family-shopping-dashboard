# Frontend WebSocket Patterns

## React Hook: Complete useWebSocket

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface WebSocketEvent {
  topic: string;
  event: string;
  data: {
    entity_id: string;
    payload: unknown;
    user_id?: string;
    timestamp: string;
  };
}

interface UseWebSocketOptions {
  url: string;
  topics: string[];
  onEvent?: (event: WebSocketEvent) => void;
  reconnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
}

export function useWebSocket({
  url,
  topics,
  onEvent,
  reconnect = true,
  reconnectAttempts = 5,
  reconnectDelay = 1000,
  heartbeatInterval = 30000,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    try {
      const token = localStorage.getItem('auth_token');
      const ws = new WebSocket(`${url}?token=${token}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Subscribe to topics
        ws.send(JSON.stringify({
          type: 'subscribe',
          topics,
        }));

        // Start heartbeat
        if (heartbeatInterval > 0) {
          heartbeatRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'ping' }));
            }
          }, heartbeatInterval);
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          // Handle system messages
          if (message.type === 'pong' || message.type === 'connected') {
            return;
          }

          // Handle WebSocket events
          const wsEvent = message as WebSocketEvent;

          // Call custom handler
          onEvent?.(wsEvent);

          // Auto-invalidate React Query cache
          const [resourceType] = wsEvent.topic.split(':');
          queryClient.invalidateQueries([resourceType]);

        } catch (err) {
          console.error('Message parse error:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError(new Error('WebSocket connection error'));
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);

        // Clear heartbeat
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
        }

        // Attempt reconnection
        if (reconnect && reconnectAttemptsRef.current < reconnectAttempts) {
          const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
          console.log(`Reconnecting in ${delay}ms...`);

          setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;

    } catch (err) {
      console.error('WebSocket connection error:', err);
      setError(err as Error);
    }
  }, [url, topics, onEvent, reconnect, reconnectAttempts, reconnectDelay, heartbeatInterval, queryClient]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'unsubscribe',
        topics,
      }));
      wsRef.current.close();
      wsRef.current = null;
    }

    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }

    setIsConnected(false);
  }, [topics]);

  const send = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    error,
    send,
    reconnect: connect,
  };
}
```

## Usage Example: Gift List with Real-Time Updates

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function GiftList({ listId }: { listId: string }) {
  const queryClient = useQueryClient();

  // 1. Load initial data via REST
  const { data: giftList, isLoading } = useQuery({
    queryKey: ['gift-list', listId],
    queryFn: () => fetchGiftList(listId),
  });

  // 2. Subscribe to real-time updates
  const { isConnected } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL!,
    topics: [`gift-list:${listId}`],
    onEvent: (event) => {
      console.log('Received event:', event);

      // Custom event handling (optional)
      if (event.event === 'DELETED') {
        // Show notification
        toast.info(`Gift "${event.data.payload.name}" was removed`);
      }
    },
  });

  // 3. Mutation with optimistic update
  const updateGift = useMutation({
    mutationFn: (gift: Gift) => updateGiftAPI(gift),

    // Optimistic update
    onMutate: async (updatedGift) => {
      await queryClient.cancelQueries(['gift-list', listId]);

      const previousData = queryClient.getQueryData(['gift-list', listId]);

      queryClient.setQueryData(['gift-list', listId], (old: GiftList) => ({
        ...old,
        gifts: old.gifts.map(g =>
          g.id === updatedGift.id ? updatedGift : g
        ),
      }));

      return { previousData };
    },

    // Rollback on error
    onError: (err, updatedGift, context) => {
      queryClient.setQueryData(['gift-list', listId], context?.previousData);
      toast.error('Failed to update gift');
    },

    // Refetch on success
    onSuccess: () => {
      queryClient.invalidateQueries(['gift-list', listId]);
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex items-center gap-2">
        <h1>{giftList.name}</h1>
        <ConnectionStatus isConnected={isConnected} />
      </div>

      <ul>
        {giftList.gifts.map(gift => (
          <GiftItem
            key={gift.id}
            gift={gift}
            onUpdate={updateGift.mutate}
          />
        ))}
      </ul>
    </div>
  );
}
```

## Connection Status Component

```typescript
function ConnectionStatus({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-2 w-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-gray-300'
        }`}
      />
      <span className="text-sm text-gray-600">
        {isConnected ? 'Live' : 'Offline'}
      </span>
    </div>
  );
}
```

## Advanced: Custom WebSocket Provider

```typescript
import { createContext, useContext, ReactNode } from 'react';

interface WebSocketContextValue {
  isConnected: boolean;
  error: Error | null;
  send: (message: unknown) => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({
  children,
  url,
  topics,
}: {
  children: ReactNode;
  url: string;
  topics: string[];
}) {
  const wsState = useWebSocket({ url, topics });

  return (
    <WebSocketContext.Provider value={wsState}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
}

// Usage
function App() {
  const userId = useAuthUser().id;

  return (
    <WebSocketProvider
      url={process.env.NEXT_PUBLIC_WS_URL!}
      topics={[`user:${userId}`]}
    >
      <Dashboard />
    </WebSocketProvider>
  );
}

function Dashboard() {
  const { isConnected } = useWebSocketContext();
  // ...
}
```

## Fallback Polling Strategy

```typescript
import { useEffect } from 'react';

function useWebSocketWithFallback({
  url,
  topics,
  fallbackInterval = 10000, // Poll every 10s if WS fails
}: UseWebSocketOptions & { fallbackInterval?: number }) {
  const { isConnected, ...wsState } = useWebSocket({ url, topics });
  const queryClient = useQueryClient();

  // Fallback polling when disconnected
  useEffect(() => {
    if (isConnected) return;

    console.log('WebSocket disconnected, using polling fallback');

    const interval = setInterval(() => {
      // Invalidate all queries to trigger refetch
      topics.forEach(topic => {
        const [resourceType] = topic.split(':');
        queryClient.invalidateQueries([resourceType]);
      });
    }, fallbackInterval);

    return () => clearInterval(interval);
  }, [isConnected, topics, fallbackInterval, queryClient]);

  return { isConnected, ...wsState };
}
```

## Vue.js Composition API

```typescript
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';

export function useWebSocket(url: string, topics: string[]) {
  const isConnected = ref(false);
  const error = ref<Error | null>(null);
  let ws: WebSocket | null = null;
  let heartbeat: NodeJS.Timeout | null = null;

  const queryClient = useQueryClient();

  const connect = () => {
    const token = localStorage.getItem('auth_token');
    ws = new WebSocket(`${url}?token=${token}`);

    ws.onopen = () => {
      isConnected.value = true;
      ws?.send(JSON.stringify({ type: 'subscribe', topics }));

      heartbeat = setInterval(() => {
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'pong') return;

      // Invalidate cache
      const [resourceType] = message.topic.split(':');
      queryClient.invalidateQueries([resourceType]);
    };

    ws.onclose = () => {
      isConnected.value = false;
      if (heartbeat) clearInterval(heartbeat);
    };

    ws.onerror = (err) => {
      error.value = new Error('WebSocket error');
    };
  };

  const disconnect = () => {
    ws?.send(JSON.stringify({ type: 'unsubscribe', topics }));
    ws?.close();
    if (heartbeat) clearInterval(heartbeat);
  };

  onMounted(connect);
  onUnmounted(disconnect);

  // Reconnect when topics change
  watch(() => topics, () => {
    disconnect();
    connect();
  });

  return { isConnected, error };
}
```

## Svelte Store

```typescript
import { writable } from 'svelte/store';
import { queryClient } from './query-client';

function createWebSocketStore(url: string, topics: string[]) {
  const { subscribe, set } = writable({
    isConnected: false,
    error: null as Error | null,
  });

  let ws: WebSocket | null = null;

  const connect = () => {
    const token = localStorage.getItem('auth_token');
    ws = new WebSocket(`${url}?token=${token}`);

    ws.onopen = () => {
      set({ isConnected: true, error: null });
      ws?.send(JSON.stringify({ type: 'subscribe', topics }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const [resourceType] = message.topic.split(':');
      queryClient.invalidateQueries([resourceType]);
    };

    ws.onclose = () => {
      set({ isConnected: false, error: null });
    };
  };

  const disconnect = () => {
    ws?.close();
  };

  return {
    subscribe,
    connect,
    disconnect,
  };
}

// Usage
export const websocketStore = createWebSocketStore(
  import.meta.env.VITE_WS_URL,
  ['user:123']
);
```

## Testing WebSocket Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WS from 'jest-websocket-mock';

describe('useWebSocket', () => {
  let server: WS;
  const queryClient = new QueryClient();

  beforeEach(() => {
    server = new WS('ws://localhost:3000/ws');
  });

  afterEach(() => {
    WS.clean();
  });

  it('connects and subscribes to topics', async () => {
    const { result } = renderHook(
      () => useWebSocket({
        url: 'ws://localhost:3000/ws',
        topics: ['gift-list:123'],
      }),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      }
    );

    await server.connected;

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    await expect(server).toReceiveMessage(
      JSON.stringify({
        type: 'subscribe',
        topics: ['gift-list:123'],
      })
    );
  });

  it('invalidates cache on event', async () => {
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    renderHook(
      () => useWebSocket({
        url: 'ws://localhost:3000/ws',
        topics: ['gift-list:123'],
      }),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      }
    );

    await server.connected;

    // Send event
    server.send(JSON.stringify({
      topic: 'gift-list:123',
      event: 'UPDATED',
      data: { entity_id: '456', payload: {} },
    }));

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith(['gift-list']);
    });
  });
});
```

## Performance Optimization

### Debounce Cache Invalidation

```typescript
import { debounce } from 'lodash-es';

const debouncedInvalidate = useRef(
  debounce((queryKey: string[]) => {
    queryClient.invalidateQueries(queryKey);
  }, 500)
).current;

// In onmessage handler
const [resourceType] = wsEvent.topic.split(':');
debouncedInvalidate([resourceType]);
```

### Selective Cache Updates

```typescript
// Instead of invalidating entire cache, update specific item
ws.onmessage = (event) => {
  const wsEvent = JSON.parse(event.data);

  queryClient.setQueryData(['gift-list', listId], (old: GiftList) => {
    if (wsEvent.event === 'UPDATED') {
      return {
        ...old,
        gifts: old.gifts.map(g =>
          g.id === wsEvent.data.entity_id
            ? { ...g, ...wsEvent.data.payload }
            : g
        ),
      };
    }

    if (wsEvent.event === 'ADDED') {
      return {
        ...old,
        gifts: [...old.gifts, wsEvent.data.payload],
      };
    }

    if (wsEvent.event === 'DELETED') {
      return {
        ...old,
        gifts: old.gifts.filter(g => g.id !== wsEvent.data.entity_id),
      };
    }

    return old;
  });
};
```
