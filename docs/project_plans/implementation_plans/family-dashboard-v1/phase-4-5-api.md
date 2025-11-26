# Phase 4-5: API Layer - REST and WebSocket

**Plan ID**: `IMPL-2025-11-26-FAMILY-DASH-V1`
**Parent Document**: [Family Dashboard V1 Implementation Plan](../family-dashboard-v1-implementation.md)

---

## Overview

Phases 4-5 implement the complete API layer: REST endpoints for all CRUD operations and WebSocket for real-time collaboration.

| Phase | Duration | Effort | Focus |
|-------|----------|--------|-------|
| **4: REST API** | 2-3 days | 10 pts | All CRUD routes, auth, error handling |
| **5: WebSocket** | 2-3 days | 8 pts | Real-time events, broadcasts, topic-based pub/sub |

**Total Effort**: 18 story points
**Dependencies**: Phase 3 complete (services ready)
**Critical Path**: Phase 4 → Phase 5 (WebSocket depends on REST routes for auth)

---

## Phase 4: API Layer - REST

**Duration**: ~2-3 days
**Effort**: 10 story points
**Dependencies**: Phase 3 complete
**Primary Agent**: `python-backend-engineer`
**Supporting Agents**: `backend-architect`, `api-documenter`

### Epic: API-V1 - REST Endpoints

Complete CRUD endpoints for all entities, authentication, error handling, OpenAPI docs.

| Task ID | Task Name | Description | Acceptance Criteria | Estimate |
|---------|-----------|-------------|-------------------|----------|
| API-001 | Router Setup | FastAPI app with CORS, error handlers, exception handlers, OpenAPI configuration | App runs on port 8000, CORS allows web origin, `/docs` shows OpenAPI | 1 pt |
| API-002 | Auth Routes | POST /auth/login, POST /auth/register, POST /auth/refresh, GET /auth/me | JWT flow working, login validates credentials, refresh extends token | 2 pts |
| API-003 | User Routes | GET /users/{id}, PUT /users/{id}, GET /users/me, DELETE /users/{id} | All user operations authenticated, returns UserDTO | 1 pt |
| API-004 | Person Routes | GET /persons, GET /persons/{id}, POST /persons, PUT /persons/{id}, DELETE /persons/{id}, GET /persons/{id}/history | Full CRUD, gift history in GET detail, relationships loaded | 1 pt |
| API-005 | Occasion Routes | GET /occasions, GET /occasions/{id}, POST /occasions, PUT /occasions/{id}, DELETE /occasions/{id}, GET /occasions/{id}/summary | Full CRUD, summary includes pipeline data per person | 1 pt |
| API-006 | List Routes | GET /lists, GET /lists/{id}, POST /lists, PUT /lists/{id}, DELETE /lists/{id}, GET /lists/{id}/items, POST /lists/{id}/items | Full CRUD lists and items, filter by type/person/occasion | 1 pt |
| API-007 | Gift Routes | GET /gifts, GET /gifts/{id}, POST /gifts, PUT /gifts/{id}, DELETE /gifts/{id}, GET /gifts/search?q=name | Full CRUD, URL parsing on create, search with pagination | 1 pt |
| API-008 | ListItem Routes | PUT /list-items/{id}/status (transition status), PUT /list-items/{id}/assign (assign to user) | Status transitions validated, assignment tracking | 1 pt |
| API-009 | Dashboard Route | GET /dashboard | Single endpoint returns all dashboard data (occasion, pipeline, people, ideas, activity) | 0.5 pt |
| API-010 | Health Check | GET /health | Returns {"status": "healthy", "db": "connected"} for K8s probes | 0.5 pt |

### REST API Response Pattern

```python
# services/api/app/schemas/base.py
from typing import Generic, TypeVar, Optional

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    data: List[T]
    pagination: PaginationInfo

class SuccessResponse(BaseModel, Generic[T]):
    data: T

class ErrorEnvelope(BaseModel):
    error: dict = Field(
        example={
            "code": "VALIDATION_ERROR",
            "message": "Email already exists",
            "trace_id": "req-12345"
        }
    )
```

### Error Handling Pattern

```python
# services/api/app/main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import uuid

app = FastAPI()

class AppException(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    trace_id = str(uuid.uuid4())
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "trace_id": trace_id
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    trace_id = str(uuid.uuid4())
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "trace_id": trace_id
            }
        }
    )
```

### CORS Configuration

```python
# services/api/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),  # from env: localhost:3000, domain.com
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Dependency Injection Pattern

```python
# services/api/app/api/deps.py
from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import oauth2_scheme, decode_token
from app.repositories.user import UserRepository

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    repo = UserRepository(db)
    user = await repo.get(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user
```

### Route Example

```python
# services/api/app/api/persons.py
from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.services.person import PersonService
from app.schemas.person import PersonCreate, PersonResponse

router = APIRouter(prefix="/persons", tags=["persons"])

@router.post("", response_model=PersonResponse, status_code=201)
async def create_person(
    person_in: PersonCreate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    service = PersonService(db)
    return await service.create(person_in)

@router.get("/{id}", response_model=PersonResponse)
async def get_person(
    id: int,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    service = PersonService(db)
    return await service.get(id)
```

### Phase 4 Quality Gates

- [ ] FastAPI app runs at `localhost:8000` without errors
- [ ] CORS configured for web frontend origin
- [ ] OpenAPI docs generate correctly at `/docs`
- [ ] All endpoints return consistent error envelope
- [ ] Authentication required on all protected routes (check Authorization header)
- [ ] GET endpoints return 200, POST 201, PUT 200, DELETE 204
- [ ] Pagination working with cursor on list endpoints
- [ ] All endpoints tested with integration tests
- [ ] Response time <300ms for typical list operations
- [ ] Health check at `/health` returns 200

### Key Files to Create

```
services/api/app/
├── api/
│   ├── __init__.py
│   ├── deps.py                # Dependency injection (get_current_user, get_db)
│   ├── auth.py                # POST /auth/login, /register, /refresh, /me
│   ├── users.py               # User CRUD routes
│   ├── persons.py             # Person CRUD routes
│   ├── occasions.py           # Occasion CRUD routes
│   ├── lists.py               # List CRUD routes
│   ├── gifts.py               # Gift CRUD routes
│   ├── list_items.py          # ListItem status/assignment updates
│   ├── dashboard.py           # GET /dashboard
│   └── health.py              # GET /health
├── core/
│   ├── config.py              # Settings (database URL, JWT secret, CORS origins)
│   ├── security.py            # oauth2_scheme, decode_token, get_current_user
│   └── exceptions.py          # AppException class
├── main.py                    # FastAPI app setup, middleware, routers
├── run.py                     # Entry point: uvicorn main:app
└── requirements.txt           # Or pyproject.toml with fastapi, uvicorn
```

### API Endpoint Summary

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/auth/login` | No | Get JWT token |
| POST | `/auth/register` | Admin | Create user (admin-only) |
| POST | `/auth/refresh` | Yes | Refresh JWT token |
| GET | `/auth/me` | Yes | Current user profile |
| GET | `/users/{id}` | Yes | Get user |
| PUT | `/users/{id}` | Yes | Update user |
| GET | `/persons` | Yes | List all persons (paginated) |
| POST | `/persons` | Yes | Create person |
| GET | `/persons/{id}` | Yes | Get person with history |
| PUT | `/persons/{id}` | Yes | Update person |
| DELETE | `/persons/{id}` | Yes | Delete person |
| GET | `/occasions` | Yes | List occasions |
| POST | `/occasions` | Yes | Create occasion |
| GET | `/occasions/{id}` | Yes | Get occasion with summary |
| PUT | `/occasions/{id}` | Yes | Update occasion |
| DELETE | `/occasions/{id}` | Yes | Delete occasion |
| GET | `/lists` | Yes | List lists (filter by type/person) |
| POST | `/lists` | Yes | Create list |
| GET | `/lists/{id}` | Yes | Get list with items |
| PUT | `/lists/{id}` | Yes | Update list |
| DELETE | `/lists/{id}` | Yes | Delete list |
| POST | `/lists/{id}/items` | Yes | Add item to list |
| GET | `/gifts` | Yes | List gifts (search, filter, paginate) |
| POST | `/gifts` | Yes | Create gift (with URL parsing) |
| GET | `/gifts/{id}` | Yes | Get gift |
| PUT | `/gifts/{id}` | Yes | Update gift |
| DELETE | `/gifts/{id}` | Yes | Delete gift |
| PUT | `/list-items/{id}/status` | Yes | Update status (idea→selected→purchased→received) |
| PUT | `/list-items/{id}/assign` | Yes | Assign to user |
| GET | `/dashboard` | Yes | Dashboard aggregations |
| GET | `/health` | No | Health check |

---

## Phase 5: API Layer - WebSocket

**Duration**: ~2-3 days
**Effort**: 8 story points
**Dependencies**: Phase 4 complete (REST API stable)
**Primary Agent**: `python-backend-engineer`
**Supporting Agents**: `backend-architect`

### Epic: WS-V1 - Real-Time Updates via WebSocket

Topic-based pub/sub for real-time collaboration. Events broadcast on all mutations.

| Task ID | Task Name | Description | Acceptance Criteria | Estimate |
|---------|-----------|-------------|-------------------|----------|
| WS-001 | WS Manager | Connection manager with in-memory topic subscriptions | ConnectionManager class, subscribe/unsubscribe/broadcast methods | 2 pts |
| WS-002 | WS Endpoint | WebSocket route at `/ws` with JWT authentication | Authenticated WS upgrade, connection cleanup on disconnect | 1 pt |
| WS-003 | Event Schema | WSEvent structure with topic, event type, payload | Pydantic model with validators, JSON serialization | 1 pt |
| WS-004 | Broadcast Integration | Services emit events on CRUD operations | Every mutation triggers broadcast (create/update/delete) | 2 pts |
| WS-005 | Client Topics | Topic subscription logic: subscribe to entity topics | Client sends {"action": "subscribe", "topic": "list:123"} | 1 pt |
| WS-006 | Presence Tracking | Optional: user presence indicator | Track "user viewing" per topic (optional for V1) | 1 pt |

### WebSocket Event Structure

```python
# services/api/app/schemas/ws.py
from typing import Literal
from pydantic import BaseModel
from datetime import datetime

class WSEvent(BaseModel):
    """Real-time WebSocket event structure."""
    topic: str                          # "list:123", "occasion:456", "list-items:all"
    event: Literal[
        "ADDED",
        "UPDATED",
        "DELETED",
        "STATUS_CHANGED",
        "ASSIGNED",
        "COMMENT_ADDED"
    ]
    data: dict = Field(
        example={
            "entity_id": "123",
            "payload": {...},           # Full entity DTO
            "user_id": "456",
            "timestamp": "2025-11-26T10:30:00Z"
        }
    )

class WSClientMessage(BaseModel):
    """Message from client to server."""
    action: Literal["subscribe", "unsubscribe", "ping"]
    topic: Optional[str] = None
```

### WebSocket Manager Pattern

```python
# services/api/app/services/ws_manager.py
from typing import Set, Dict, List
from fastapi import WebSocket
from app.schemas.ws import WSEvent
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, topic: str):
        await websocket.accept()
        if topic not in self.active_connections:
            self.active_connections[topic] = set()
        self.active_connections[topic].add(websocket)

    def disconnect(self, websocket: WebSocket, topic: str):
        if topic in self.active_connections:
            self.active_connections[topic].discard(websocket)
            if not self.active_connections[topic]:
                del self.active_connections[topic]

    async def broadcast(self, event: WSEvent):
        """Broadcast event to all clients subscribed to topic."""
        if event.topic in self.active_connections:
            for connection in self.active_connections[event.topic]:
                try:
                    await connection.send_text(event.model_dump_json())
                except Exception:
                    # Client disconnected, will be cleaned up by disconnect
                    pass

# Singleton instance
manager = ConnectionManager()
```

### WebSocket Endpoint Pattern

```python
# services/api/app/api/ws.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.core.security import decode_token
from app.services.ws_manager import manager
from app.schemas.ws import WSClientMessage

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time updates.

    Client must send:
    {
        "action": "subscribe",
        "topic": "list:123"
    }
    """
    # Extract token from query parameter
    query_params = websocket.query_params
    token = query_params.get("token")

    if not token:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    # Validate token
    user_id = decode_token(token)
    if not user_id:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    current_topic = None

    try:
        await websocket.accept()

        while True:
            data = await websocket.receive_text()
            message = WSClientMessage.model_validate_json(data)

            if message.action == "subscribe":
                # Unsubscribe from old topic
                if current_topic:
                    manager.disconnect(websocket, current_topic)

                # Subscribe to new topic
                current_topic = message.topic
                await manager.connect(websocket, current_topic)

            elif message.action == "unsubscribe" and current_topic:
                manager.disconnect(websocket, current_topic)
                current_topic = None

            elif message.action == "ping":
                await websocket.send_json({"action": "pong"})

    except WebSocketDisconnect:
        if current_topic:
            manager.disconnect(websocket, current_topic)
```

### Service Broadcast Integration Pattern

```python
# services/api/app/services/list_item.py
from app.schemas.ws import WSEvent
from app.services.ws_manager import manager

class ListItemService:
    async def update_status(self, list_item_id: int, new_status: str, user_id: int):
        # ... update logic in service ...

        # Broadcast event
        event = WSEvent(
            topic=f"list:{list_item.list_id}",
            event="STATUS_CHANGED",
            data={
                "entity_id": str(list_item_id),
                "payload": ListItemResponse.model_validate(list_item).model_dump(),
                "user_id": str(user_id),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )
        await manager.broadcast(event)
        return list_item
```

### Topic Naming Convention

| Entity | Topic Pattern | Triggers |
|--------|---------------|----------|
| List | `list:{list_id}` | ListItem added/updated/deleted, status change, assignment |
| Occasion | `occasion:{occasion_id}` | Lists, people added/removed |
| Person | `person:{person_id}` | Any gift assigned to person |
| List Items (All) | `list-items:all` | Any ListItem created/updated |
| Comments | `comments:{parent_type}:{parent_id}` | New comment posted |

### Frontend Integration Pattern

```typescript
// apps/web/lib/hooks/useWebSocket.ts
import { useEffect, useState } from 'react';

export function useWebSocket(token: string, topic: string) {
    const [connected, setConnected] = useState(false);
    const [event, setEvent] = useState(null);

    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${window.location.host}/ws?token=${token}`);

        ws.onopen = () => {
            setConnected(true);
            ws.send(JSON.stringify({ action: 'subscribe', topic }));
        };

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setEvent(data);
        };

        ws.onerror = () => setConnected(false);
        ws.onclose = () => setConnected(false);

        return () => ws.close();
    }, [token, topic]);

    return { connected, event };
}
```

### State Sync Pattern (from CLAUDE.md)

```
1. Load: React Query (REST) — fetch list items
2. Subscribe: WebSocket on mount — subscribe to "list:123"
3. Event: On WS message → invalidate RQ cache → refetch
4. Unmount: Unsubscribe — send unsubscribe message
5. Fallback: Poll every 10s if WS down (optional)
```

### Phase 5 Quality Gates

- [ ] WebSocket endpoint at `/ws` with token auth
- [ ] ConnectionManager in-memory storage works
- [ ] Topic-based subscription working (subscribe/unsubscribe)
- [ ] Events broadcast on ListItem mutations (create/update/delete)
- [ ] Events broadcast on status changes
- [ ] Events broadcast on new comments
- [ ] Connection cleanup on disconnect (no memory leaks)
- [ ] Integration test with 2 concurrent clients (ListItem update triggers both)
- [ ] Reconnect logic handles network interruption
- [ ] Message payload includes all required fields

### Key Files to Create

```
services/api/app/
├── api/
│   └── ws.py                  # WebSocket endpoint
├── services/
│   └── ws_manager.py          # ConnectionManager class
└── schemas/
    └── ws.py                  # WSEvent, WSClientMessage models
```

### Frontend Integration Files

```
apps/web/
├── lib/
│   └── hooks/
│       ├── useWebSocket.ts    # WebSocket connection hook
│       └── useRealtimeSync.ts # RQ cache invalidation on WS events
└── components/
    └── realtime/
        └── RealtimeProvider.tsx # Context provider for WS
```

---

## Phase 4-5 Summary

| Metric | Value |
|--------|-------|
| **Total Effort** | 18 story points |
| **Duration** | ~4-6 days |
| **REST Endpoints** | 25+ routes |
| **DTOs** | ~30 schemas |
| **WebSocket Topics** | 5+ topic patterns |
| **Event Types** | 6 event types |
| **Status Codes** | 200, 201, 204, 400, 401, 404, 500 |

### Success Criteria

- All CRUD endpoints working with proper HTTP status codes
- Authentication enforced on protected routes
- WebSocket real-time updates broadcasting correctly
- Error envelope consistent across all endpoints
- OpenAPI documentation complete and accurate
- <300ms response times on list operations
- Ready for frontend development in Phase 6

### Integration Testing Scenarios

1. Create ListItem → WebSocket broadcasts "ADDED" event
2. Update ListItem status → WebSocket broadcasts "STATUS_CHANGED"
3. Assign ListItem → WebSocket broadcasts "ASSIGNED"
4. Add Comment → WebSocket broadcasts "COMMENT_ADDED"
5. Multiple clients → Both receive updates simultaneously

---

**Phase File Version**: 1.0
**Last Updated**: 2025-11-26
