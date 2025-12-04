# WebSocket API - Quick Reference Guide

**Endpoint**: `ws://localhost:8000/ws?token=JWT_TOKEN`
**Protocol**: WebSocket + JSON
**Authentication**: JWT token in query parameter
**Status**: Complete and tested

---

## Quick Start

### 1. Connect with Authentication

```javascript
const token = await getJWTToken(); // From login endpoint
const ws = new WebSocket(`ws://localhost:8000/ws?token=${token}`);

ws.onopen = () => console.log("Connected");
ws.onclose = () => console.log("Disconnected");
ws.onerror = (e) => console.error("Error:", e);
```

### 2. Subscribe to Updates

```javascript
// Subscribe to a specific list
ws.send(JSON.stringify({
  action: "subscribe",
  topic: "list:123"
}));

// Listen for confirmations and events
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  // Subscription confirmation
  if (msg.action === "subscribed") {
    console.log(`Subscribed to ${msg.topic}`);
  }

  // Real-time event
  if (msg.event === "ADDED") {
    console.log("New item:", msg.data.payload);
  }
};
```

### 3. Unsubscribe When Done

```javascript
ws.send(JSON.stringify({
  action: "unsubscribe",
  topic: "list:123"
}));
```

### 4. Keep Connection Alive

```javascript
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ action: "ping" }));
  }
}, 30000); // Every 30 seconds
```

---

## Message Reference

### Client → Server

#### Subscribe to Topic
```json
{
  "action": "subscribe",
  "topic": "list:123"
}
```

#### Unsubscribe from Topic
```json
{
  "action": "unsubscribe",
  "topic": "list:123"
}
```

#### Keepalive Ping
```json
{
  "action": "ping"
}
```

### Server → Client

#### Subscription Confirmation
```json
{
  "action": "subscribed",
  "topic": "list:123"
}
```

#### Unsubscription Confirmation
```json
{
  "action": "unsubscribed",
  "topic": "list:123"
}
```

#### Keepalive Pong
```json
{
  "action": "pong"
}
```

#### Real-Time Event
```json
{
  "topic": "list:123",
  "event": "ADDED",
  "data": {
    "entity_id": "item:456",
    "payload": {
      "id": 456,
      "name": "Buy milk",
      "status": "pending",
      "list_id": 123
    },
    "user_id": "789",
    "timestamp": "2025-11-26T10:30:00Z"
  }
}
```

#### Error Response
```json
{
  "error": "Invalid message format",
  "details": "..."
}
```

---

## Topic Patterns

| Topic | Purpose | Example |
|-------|---------|---------|
| `list:{id}` | Updates for a specific shopping list | `list:123` |
| `occasion:{id}` | Updates for a specific occasion | `occasion:456` |
| `list-items:all` | All list item changes | Always available |
| `gifts:all` | All gift changes | Always available |

---

## Event Types

| Event | Trigger | When Used |
|-------|---------|-----------|
| `ADDED` | Entity created | New item added to list |
| `UPDATED` | Entity modified | Item name/priority changed |
| `DELETED` | Entity removed | Item removed from list |
| `STATUS_CHANGED` | Status field updated | Item marked as purchased |
| `ASSIGNED` | Assignment changed | Item assigned to person |
| `COMMENT_ADDED` | Comment posted | New comment on item |

---

## Backend Integration

### Broadcast Events from Service

```python
from app.services.ws_manager import manager
from app.schemas.ws import WSEvent
from datetime import datetime, timezone

# In any service method after data change
event = WSEvent(
    topic=f"list:{list_id}",
    event="ADDED",
    data={
        "entity_id": str(item.id),
        "payload": {
            "id": item.id,
            "name": item.name,
            "status": item.status,
            # Include all relevant fields
        },
        "user_id": str(user_id),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
)

await manager.broadcast_event(event)
```

### In API Router

```python
from fastapi import APIRouter

router = APIRouter(prefix="/lists", tags=["lists"])

@router.post("/{list_id}/items", response_model=ItemDTO)
async def add_item(
    list_id: int,
    item: CreateItemDTO,
    user_id: int = Depends(get_current_user),
    service: ItemService = Depends()
):
    # Service handles data + broadcasts event
    return service.add_item(list_id, item, user_id)

# Service.add_item() creates item in DB then broadcasts WSEvent
```

---

## Frontend Integration (React)

### useEffect Hook

```typescript
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useListUpdates(listId: number, token: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const ws = new WebSocket(
      `${import.meta.env.VITE_WS_URL}/ws?token=${token}`
    );

    ws.onopen = () => {
      // Subscribe to this list
      ws.send(JSON.stringify({
        action: "subscribe",
        topic: `list:${listId}`
      }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      // Invalidate cache to refetch
      if (msg.topic === `list:${listId}`) {
        queryClient.invalidateQueries({
          queryKey: ["list", listId]
        });
      }
    };

    return () => {
      // Unsubscribe on cleanup
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          action: "unsubscribe",
          topic: `list:${listId}`
        }));
      }
      ws.close();
    };
  }, [listId, token, queryClient]);
}

// Usage in component
function ListView({ listId }: { listId: number }) {
  const token = useAuth().token;
  useListUpdates(listId, token);

  const { data: list } = useQuery({
    queryKey: ["list", listId],
    queryFn: () => api.getList(listId)
  });

  return (
    // Component will refetch when WebSocket event arrives
  );
}
```

---

## Error Handling

### Invalid Token
```
Connection closes immediately with code 4001 "Unauthorized"
→ Client must re-authenticate and reconnect
```

### Invalid Message
```json
{
  "error": "Invalid message format",
  "details": "JSON decode error or validation failed"
}
→ Send corrected message
```

### Missing Topic
```json
{
  "error": "Topic is required for subscribe action"
}
→ Include topic in subscribe/unsubscribe
```

### Connection Loss
```
WebSocket onclose event fires
→ Client should reconnect with exponential backoff
```

---

## Common Tasks

### Listen to All Changes on a List
```javascript
ws.send(JSON.stringify({
  action: "subscribe",
  topic: "list:123"
}));
```

### Listen to All Gifts
```javascript
ws.send(JSON.stringify({
  action: "subscribe",
  topic: "gifts:all"
}));
```

### Stop Listening
```javascript
ws.send(JSON.stringify({
  action: "unsubscribe",
  topic: "list:123"
}));
```

### Implement Reconnection
```javascript
function connectWebSocket() {
  const ws = new WebSocket(`ws://.../ws?token=${token}`);
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 10;
  const reconnectDelay = 1000;

  ws.onopen = () => {
    reconnectAttempts = 0;
    subscribeToTopics();
  };

  ws.onclose = () => {
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      const delay = reconnectDelay * Math.pow(2, reconnectAttempts - 1);
      setTimeout(connectWebSocket, delay);
    }
  };

  return ws;
}
```

---

## Performance Tips

1. **Reuse Connection**: Don't create new WebSocket for each topic
2. **Batch Subscriptions**: Subscribe to all topics at once on connect
3. **Lazy Unsubscribe**: Only unsubscribe when really leaving that view
4. **Handle Duplicates**: Server may send duplicate events, deduplicate on client
5. **Use Query Invalidation**: Let React Query refetch data instead of updating directly

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Connection closes immediately | Invalid JWT token | Verify token from login endpoint |
| No events received | Not subscribed to topic | Send subscribe message first |
| Connection drops | Network issue or server restart | Implement reconnection logic |
| Events for other users | No authorization checks (v1) | Authorization coming in v2 |
| High memory usage | Too many open connections | Limit concurrent connections |

---

## API Endpoints Related to WebSocket

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login` | Get JWT token for WebSocket auth |
| POST | `/lists` | Create list (broadcasts ADDED event) |
| PUT | `/lists/{id}` | Update list (broadcasts UPDATED event) |
| DELETE | `/lists/{id}` | Delete list (broadcasts DELETED event) |
| POST | `/lists/{id}/items` | Add item (broadcasts ADDED event) |
| PUT | `/lists/{id}/items/{item_id}` | Update item (broadcasts event) |
| DELETE | `/lists/{id}/items/{item_id}` | Delete item (broadcasts DELETED event) |

---

## Resources

- **Implementation Details**: See `/docs/implementation/WS-002-WS-005-websocket-endpoint.md`
- **Architecture Guide**: See `services/api/CLAUDE.md` - WebSocket Pattern section
- **Schema Definitions**: See `app/schemas/ws.py`
- **Connection Manager**: See `app/services/ws_manager.py`

---

**Last Updated**: 2025-11-26
**Version**: 1.0
