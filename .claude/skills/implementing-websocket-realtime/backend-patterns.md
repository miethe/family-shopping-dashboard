# Backend WebSocket Patterns

## FastAPI Implementation

### Complete Connection Manager

```python
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set, Optional
import asyncio
import json
from datetime import datetime

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.subscriptions: Dict[str, Set[str]] = {}  # topic -> set of user_ids
        self.user_metadata: Dict[str, dict] = {}  # user_id -> metadata

    async def connect(self, websocket: WebSocket, user_id: str, metadata: Optional[dict] = None):
        """Add connection and store metadata"""
        self.active_connections[user_id] = websocket
        self.user_metadata[user_id] = metadata or {}
        await self.send_personal(user_id, {
            "type": "connected",
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        })

    def disconnect(self, user_id: str):
        """Remove connection and all subscriptions"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if user_id in self.user_metadata:
            del self.user_metadata[user_id]

        # Clean up subscriptions
        for topic in list(self.subscriptions.keys()):
            if user_id in self.subscriptions[topic]:
                self.subscriptions[topic].remove(user_id)
            if not self.subscriptions[topic]:
                del self.subscriptions[topic]

    def subscribe(self, user_id: str, topics: list[str]):
        """Subscribe user to topics"""
        for topic in topics:
            if topic not in self.subscriptions:
                self.subscriptions[topic] = set()
            self.subscriptions[topic].add(user_id)

    def unsubscribe(self, user_id: str, topics: list[str]):
        """Unsubscribe user from topics"""
        for topic in topics:
            if topic in self.subscriptions and user_id in self.subscriptions[topic]:
                self.subscriptions[topic].remove(user_id)
                if not self.subscriptions[topic]:
                    del self.subscriptions[topic]

    async def send_personal(self, user_id: str, message: dict):
        """Send message to specific user"""
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
            except Exception as e:
                print(f"Error sending to {user_id}: {e}")
                self.disconnect(user_id)

    async def broadcast(self, topic: str, event: dict, exclude_user: Optional[str] = None):
        """Broadcast event to all topic subscribers"""
        if topic not in self.subscriptions:
            return

        for user_id in list(self.subscriptions[topic]):
            if user_id == exclude_user:
                continue

            if user_id in self.active_connections:
                try:
                    await self.active_connections[user_id].send_json(event)
                except Exception as e:
                    print(f"Error broadcasting to {user_id}: {e}")
                    self.disconnect(user_id)

    def get_subscribers(self, topic: str) -> Set[str]:
        """Get all subscribers for a topic"""
        return self.subscriptions.get(topic, set())

manager = ConnectionManager()
```

### WebSocket Endpoint

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, HTTPException
from pydantic import BaseModel
import jwt

app = FastAPI()

class SubscribeMessage(BaseModel):
    type: str  # "subscribe" | "unsubscribe"
    topics: list[str]

def authenticate_token(token: str) -> dict:
    """Validate JWT and return user info"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return {"user_id": payload["sub"], "email": payload.get("email")}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    # Authenticate
    try:
        user_info = authenticate_token(token)
        user_id = user_info["user_id"]
    except HTTPException:
        await websocket.close(code=1008, reason="Unauthorized")
        return

    # Accept connection
    await websocket.accept()
    await manager.connect(websocket, user_id, user_info)

    try:
        while True:
            # Receive message
            data = await websocket.receive_text()
            message = json.loads(data)

            # Handle subscription management
            if message["type"] == "subscribe":
                manager.subscribe(user_id, message["topics"])
                await manager.send_personal(user_id, {
                    "type": "subscribed",
                    "topics": message["topics"]
                })

            elif message["type"] == "unsubscribe":
                manager.unsubscribe(user_id, message["topics"])
                await manager.send_personal(user_id, {
                    "type": "unsubscribed",
                    "topics": message["topics"]
                })

            elif message["type"] == "ping":
                await manager.send_personal(user_id, {"type": "pong"})

    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(user_id)
```

### Broadcasting Events

```python
from pydantic import BaseModel
from datetime import datetime

class WebSocketEvent(BaseModel):
    topic: str
    event: str  # ADDED | UPDATED | DELETED | STATUS_CHANGED
    data: dict
    trace_id: Optional[str] = None

async def broadcast_event(
    topic: str,
    event_type: str,
    entity_id: str,
    payload: dict,
    user_id: Optional[str] = None,
    exclude_user: Optional[str] = None
):
    """Helper to broadcast events"""
    event = WebSocketEvent(
        topic=topic,
        event=event_type,
        data={
            "entity_id": entity_id,
            "payload": payload,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

    await manager.broadcast(
        topic=topic,
        event=event.dict(),
        exclude_user=exclude_user
    )

# Example usage in API endpoint
@app.post("/api/gifts")
async def create_gift(gift: GiftCreate, current_user: User = Depends(get_current_user)):
    # Create gift in database
    db_gift = await gift_repository.create(gift)

    # Broadcast to subscribers
    await broadcast_event(
        topic=f"gift-list:{gift.list_id}",
        event_type="ADDED",
        entity_id=db_gift.id,
        payload=db_gift.dict(),
        user_id=current_user.id,
        exclude_user=current_user.id  # Don't send to creator
    )

    return db_gift
```

## Node.js (Express + ws) Implementation

### Connection Manager

```javascript
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';

class ConnectionManager {
  constructor() {
    this.connections = new Map(); // user_id -> WebSocket
    this.subscriptions = new Map(); // topic -> Set<user_id>
    this.metadata = new Map(); // user_id -> metadata
  }

  connect(ws, userId, metadata = {}) {
    this.connections.set(userId, ws);
    this.metadata.set(userId, metadata);

    this.sendPersonal(userId, {
      type: 'connected',
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  }

  disconnect(userId) {
    this.connections.delete(userId);
    this.metadata.delete(userId);

    // Clean up subscriptions
    for (const [topic, subscribers] of this.subscriptions.entries()) {
      subscribers.delete(userId);
      if (subscribers.size === 0) {
        this.subscriptions.delete(topic);
      }
    }
  }

  subscribe(userId, topics) {
    for (const topic of topics) {
      if (!this.subscriptions.has(topic)) {
        this.subscriptions.set(topic, new Set());
      }
      this.subscriptions.get(topic).add(userId);
    }
  }

  unsubscribe(userId, topics) {
    for (const topic of topics) {
      const subscribers = this.subscriptions.get(topic);
      if (subscribers) {
        subscribers.delete(userId);
        if (subscribers.size === 0) {
          this.subscriptions.delete(topic);
        }
      }
    }
  }

  sendPersonal(userId, message) {
    const ws = this.connections.get(userId);
    if (ws && ws.readyState === 1) { // OPEN
      ws.send(JSON.stringify(message));
    }
  }

  broadcast(topic, event, excludeUser = null) {
    const subscribers = this.subscriptions.get(topic);
    if (!subscribers) return;

    const message = JSON.stringify(event);

    for (const userId of subscribers) {
      if (userId === excludeUser) continue;

      const ws = this.connections.get(userId);
      if (ws && ws.readyState === 1) {
        ws.send(message);
      }
    }
  }

  getSubscribers(topic) {
    return this.subscriptions.get(topic) || new Set();
  }
}

export const manager = new ConnectionManager();
```

### WebSocket Server Setup

```javascript
import express from 'express';
import { WebSocketServer } from 'ws';
import { parse } from 'url';
import jwt from 'jsonwebtoken';

const app = express();
const server = app.listen(3000);

const wss = new WebSocketServer({ noServer: true });

// Authenticate on upgrade
server.on('upgrade', (request, socket, head) => {
  const { query } = parse(request.url, true);
  const token = query.token;

  if (!token) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    request.userId = payload.sub;
    request.userEmail = payload.email;

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } catch (err) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
  }
});

// Handle connections
wss.on('connection', (ws, request) => {
  const userId = request.userId;

  manager.connect(ws, userId, { email: request.userEmail });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'subscribe':
          manager.subscribe(userId, message.topics);
          manager.sendPersonal(userId, {
            type: 'subscribed',
            topics: message.topics
          });
          break;

        case 'unsubscribe':
          manager.unsubscribe(userId, message.topics);
          manager.sendPersonal(userId, {
            type: 'unsubscribed',
            topics: message.topics
          });
          break;

        case 'ping':
          manager.sendPersonal(userId, { type: 'pong' });
          break;
      }
    } catch (err) {
      console.error('Message error:', err);
    }
  });

  ws.on('close', () => {
    manager.disconnect(userId);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    manager.disconnect(userId);
  });
});
```

### Broadcasting Helper

```javascript
export function broadcastEvent(topic, eventType, entityId, payload, userId = null, excludeUser = null) {
  const event = {
    topic,
    event: eventType,
    data: {
      entity_id: entityId,
      payload,
      user_id: userId,
      timestamp: new Date().toISOString()
    }
  };

  manager.broadcast(topic, event, excludeUser);
}

// Example usage in API route
app.post('/api/gifts', authenticate, async (req, res) => {
  const gift = await giftRepository.create(req.body);

  // Broadcast to subscribers
  broadcastEvent(
    `gift-list:${gift.listId}`,
    'ADDED',
    gift.id,
    gift,
    req.user.id,
    req.user.id // Don't send to creator
  );

  res.json(gift);
});
```

## Testing WebSocket Backend

```bash
# Install wscat for manual testing
npm install -g wscat

# Connect with token
wscat -c "ws://localhost:3000/ws?token=YOUR_JWT_TOKEN"

# Subscribe to topic
> {"type":"subscribe","topics":["gift-list:123"]}

# Ping
> {"type":"ping"}
< {"type":"pong"}
```

## Performance Optimization

### Connection Pooling

```python
# Limit concurrent connections per user
MAX_CONNECTIONS_PER_USER = 3

async def connect(self, websocket: WebSocket, user_id: str, metadata: Optional[dict] = None):
    # Check existing connections
    user_connections = [uid for uid, ws in self.active_connections.items() if uid == user_id]

    if len(user_connections) >= MAX_CONNECTIONS_PER_USER:
        await websocket.close(code=1008, reason="Max connections reached")
        return

    # Continue with connection...
```

### Message Batching

```python
from asyncio import gather

async def broadcast_batch(self, events: list[tuple[str, dict]]):
    """Broadcast multiple events efficiently"""
    tasks = []
    for topic, event in events:
        task = self.broadcast(topic, event)
        tasks.append(task)

    await gather(*tasks)
```

### Topic Wildcards

```python
def subscribe(self, user_id: str, patterns: list[str]):
    """Support wildcard subscriptions"""
    for pattern in patterns:
        # gift-list:* subscribes to all gift lists
        if '*' in pattern:
            self.wildcard_subscriptions[user_id].add(pattern)
        else:
            if pattern not in self.subscriptions:
                self.subscriptions[pattern] = set()
            self.subscriptions[pattern].add(user_id)

def get_matching_subscribers(self, topic: str) -> Set[str]:
    """Get subscribers including wildcard matches"""
    subscribers = self.subscriptions.get(topic, set()).copy()

    # Check wildcard subscriptions
    for user_id, patterns in self.wildcard_subscriptions.items():
        for pattern in patterns:
            if self._matches_pattern(topic, pattern):
                subscribers.add(user_id)

    return subscribers
```
