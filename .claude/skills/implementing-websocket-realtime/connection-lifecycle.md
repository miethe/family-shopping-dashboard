# WebSocket Connection Lifecycle

## Complete Lifecycle

```
1. Connect       → Open TCP + HTTP upgrade
2. Authenticate  → Validate credentials
3. Subscribe     → Join topics/channels
4. Heartbeat     → Keep connection alive
5. Handle Events → Process messages
6. Reconnect     → On disconnect
7. Cleanup       → Unsubscribe + close
```

## 1. Connection Establishment

### Client-Side

```typescript
const ws = new WebSocket(`${WS_URL}?token=${authToken}`);

// Connection states
ws.addEventListener('open', () => {
  console.log('WebSocket connected');
  onConnected();
});

ws.addEventListener('error', (error) => {
  console.error('WebSocket error:', error);
  onError(error);
});

ws.addEventListener('close', (event) => {
  console.log(`WebSocket closed: ${event.code} ${event.reason}`);
  onClosed(event.code, event.reason);
});
```

### Server-Side (FastAPI)

```python
@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...)
):
    # Accept connection
    await websocket.accept()

    try:
        # Connection established
        user = await authenticate_token(token)
        await connection_manager.connect(websocket, user.id)

        # Keep connection open
        while True:
            data = await websocket.receive_text()
            await handle_message(data)

    except WebSocketDisconnect:
        connection_manager.disconnect(user.id)
```

## 2. Authentication Strategies

### Query Parameter (Simplest)

```typescript
// Client
const token = getAuthToken();
const ws = new WebSocket(`${WS_URL}?token=${token}`);

// Server (FastAPI)
@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...)
):
    user = verify_jwt(token)
    if not user:
        await websocket.close(code=1008, reason="Unauthorized")
        return

    await websocket.accept()
    # ...
```

**Pros**: Simple, stateless
**Cons**: Token in URL logs

### First Message

```typescript
// Client
ws.addEventListener('open', () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: getAuthToken(),
  }));
});

// Server
async def handle_message(websocket: WebSocket, data: str):
    message = json.loads(data)

    if message["type"] == "auth":
        user = verify_jwt(message["token"])
        if not user:
            await websocket.close(code=1008, reason="Unauthorized")
            return

        await connection_manager.connect(websocket, user.id)
```

**Pros**: Token not in URL
**Cons**: Delayed connection

### Cookie-Based

```typescript
// Client (uses existing HTTP session)
const ws = new WebSocket(WS_URL); // Cookies sent automatically

// Server
@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    session: str = Cookie(None)
):
    user = verify_session(session)
    if not user:
        await websocket.close(code=1008, reason="Unauthorized")
        return

    await websocket.accept()
```

**Pros**: Reuses HTTP auth
**Cons**: Requires same-origin or CORS

## 3. Subscription Management

### Client Subscribe/Unsubscribe

```typescript
function subscribe(ws: WebSocket, topics: string[]) {
  ws.send(JSON.stringify({
    type: 'subscribe',
    topics: topics,
  }));
}

function unsubscribe(ws: WebSocket, topics: string[]) {
  ws.send(JSON.stringify({
    type: 'unsubscribe',
    topics: topics,
  }));
}

// Usage
ws.addEventListener('open', () => {
  subscribe(ws, ['gift-list:123', 'user:456']);
});

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (ws.readyState === WebSocket.OPEN) {
      unsubscribe(ws, ['gift-list:123', 'user:456']);
    }
  };
}, []);
```

### Server Subscription Tracking

```python
class ConnectionManager:
    def __init__(self):
        self.subscriptions: Dict[str, Set[str]] = {}  # topic -> user_ids

    def subscribe(self, user_id: str, topics: List[str]):
        for topic in topics:
            if topic not in self.subscriptions:
                self.subscriptions[topic] = set()
            self.subscriptions[topic].add(user_id)

        return {"subscribed": topics}

    def unsubscribe(self, user_id: str, topics: List[str]):
        for topic in topics:
            if topic in self.subscriptions:
                self.subscriptions[topic].discard(user_id)
                if not self.subscriptions[topic]:
                    del self.subscriptions[topic]

        return {"unsubscribed": topics}

# Handle subscribe message
if message["type"] == "subscribe":
    result = manager.subscribe(user_id, message["topics"])
    await websocket.send_json(result)
```

## 4. Heartbeat/Keepalive

### Client Ping

```typescript
let heartbeatInterval: NodeJS.Timeout;

ws.addEventListener('open', () => {
  // Ping every 30 seconds
  heartbeatInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }));
    }
  }, 30000);
});

ws.addEventListener('close', () => {
  clearInterval(heartbeatInterval);
});
```

### Server Pong

```python
if message["type"] == "ping":
    await websocket.send_json({"type": "pong"})
```

### Detect Stale Connections

```python
from datetime import datetime, timedelta

class ConnectionManager:
    def __init__(self):
        self.last_pong: Dict[str, datetime] = {}

    async def heartbeat_check(self):
        """Run periodically to disconnect stale connections"""
        now = datetime.utcnow()
        stale_timeout = timedelta(seconds=60)

        for user_id, last_pong in list(self.last_pong.items()):
            if now - last_pong > stale_timeout:
                # Connection is stale
                if user_id in self.active_connections:
                    await self.active_connections[user_id].close(
                        code=1001,
                        reason="Heartbeat timeout"
                    )
                self.disconnect(user_id)

# Run heartbeat check every 30s
import asyncio

async def heartbeat_task():
    while True:
        await asyncio.sleep(30)
        await connection_manager.heartbeat_check()

@app.on_event("startup")
async def startup():
    asyncio.create_task(heartbeat_task())
```

## 5. Reconnection Logic

### Exponential Backoff

```typescript
class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private initialDelay = 1000; // 1 second

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.addEventListener('open', () => {
      console.log('Connected');
      this.reconnectAttempts = 0; // Reset on successful connection
    });

    this.ws.addEventListener('close', (event) => {
      console.log(`Closed: ${event.code}`);

      // Don't reconnect on normal close or auth failure
      if (event.code === 1000 || event.code === 1008) {
        return;
      }

      this.reconnect();
    });

    this.ws.addEventListener('error', (error) => {
      console.error('Error:', error);
    });
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.onMaxReconnectAttempts();
      return;
    }

    const delay = this.initialDelay * Math.pow(2, this.reconnectAttempts);
    const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd

    console.log(`Reconnecting in ${delay + jitter}ms... (attempt ${this.reconnectAttempts + 1})`);

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay + jitter);
  }

  disconnect() {
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
    this.ws?.close(1000, 'Client disconnect');
  }
}
```

### Reconnection with State Restoration

```typescript
class WebSocketClient {
  private subscribedTopics: Set<string> = new Set();

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.addEventListener('open', () => {
      // Restore subscriptions after reconnect
      if (this.subscribedTopics.size > 0) {
        this.ws?.send(JSON.stringify({
          type: 'subscribe',
          topics: Array.from(this.subscribedTopics),
        }));
      }
    });
  }

  subscribe(topics: string[]) {
    topics.forEach(t => this.subscribedTopics.add(t));

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', topics }));
    }
  }

  unsubscribe(topics: string[]) {
    topics.forEach(t => this.subscribedTopics.delete(t));

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', topics }));
    }
  }
}
```

## 6. Connection State Machine

```typescript
enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed',
}

class WebSocketClient {
  private state: ConnectionState = ConnectionState.DISCONNECTED;

  connect() {
    this.setState(ConnectionState.CONNECTING);

    this.ws = new WebSocket(this.url);

    this.ws.addEventListener('open', () => {
      this.setState(
        this.reconnectAttempts > 0
          ? ConnectionState.RECONNECTING
          : ConnectionState.CONNECTED
      );
    });

    this.ws.addEventListener('close', () => {
      if (this.state !== ConnectionState.FAILED) {
        this.setState(ConnectionState.DISCONNECTED);
        this.reconnect();
      }
    });
  }

  private setState(state: ConnectionState) {
    const prevState = this.state;
    this.state = state;
    this.onStateChange(prevState, state);
  }
}
```

## 7. Cleanup

### Client Cleanup

```typescript
useEffect(() => {
  const ws = new WebSocket(WS_URL);

  // ... setup handlers

  // Cleanup on unmount
  return () => {
    // Unsubscribe from topics
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'unsubscribe',
        topics: ['gift-list:123'],
      }));
    }

    // Close connection
    ws.close(1000, 'Component unmounted');

    // Clear intervals/timeouts
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }
  };
}, []);
```

### Server Cleanup

```python
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str):
    user = authenticate_token(token)
    await websocket.accept()
    await connection_manager.connect(websocket, user.id)

    try:
        while True:
            data = await websocket.receive_text()
            await handle_message(data)

    except WebSocketDisconnect:
        pass  # Normal disconnect

    finally:
        # Always cleanup
        connection_manager.disconnect(user.id)
        await websocket.close()
```

## Best Practices

1. **Always handle cleanup**: Unsubscribe and close connections properly
2. **Use exponential backoff**: Prevent server overload during reconnection
3. **Add jitter**: Avoid thundering herd problem
4. **Restore state**: Re-subscribe after reconnection
5. **Heartbeat**: Detect stale connections
6. **Close codes**: Use appropriate WebSocket close codes
   - `1000`: Normal closure
   - `1001`: Going away
   - `1008`: Policy violation (auth failure)
   - `1011`: Server error
7. **Limit reconnect attempts**: Prevent infinite loops
8. **State machine**: Track connection state clearly
