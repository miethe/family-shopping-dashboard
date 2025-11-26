# API Service — FastAPI Patterns

**Tech**: FastAPI 0.115+ + SQLAlchemy 2.x + Alembic + PostgreSQL
**Python**: 3.12+ via `uv`

---

## Layer Architecture

| Layer | Location | Returns | Responsibility |
|-------|----------|---------|----------------|
| Router | `app/api/routes/` | Response envelope | HTTP/WS, validation, auth |
| Service | `app/services/` | DTOs | Business logic, ORM→DTO |
| Repository | `app/repositories/` | ORM models | DB I/O, queries |
| Schema | `app/schemas/` | Pydantic models | DTOs, validation |
| Model | `app/models/` | SQLAlchemy | ORM definitions |

**Rule**: Never skip layers. Always: Router → Service → Repository → DB

---

## Directory Structure

```text
app/
├── api/
│   └── routes/
│       ├── gifts.py          # Gift CRUD + WebSocket
│       ├── lists.py          # List management
│       ├── occasions.py      # Occasion CRUD
│       └── users.py          # Auth, profile
│
├── services/
│   ├── gift_service.py       # GiftService class
│   ├── list_service.py
│   └── occasion_service.py
│
├── repositories/
│   ├── gift_repository.py    # GiftRepository class
│   ├── list_repository.py
│   └── occasion_repository.py
│
├── schemas/
│   ├── gift.py               # CreateGiftDTO, GiftDTO
│   ├── list.py
│   ├── common.py             # ErrorResponse, PageInfo
│   └── websocket.py          # WSEvent
│
├── models/
│   ├── gift.py               # Gift ORM model
│   ├── list.py
│   ├── user.py
│   └── base.py               # Base class, mixins
│
├── core/
│   ├── auth.py               # JWT validation
│   ├── config.py             # Settings (env vars)
│   ├── database.py           # Session management
│   └── deps.py               # FastAPI dependencies
│
└── main.py                   # FastAPI app
```

---

## Implementation Patterns

### Router (HTTP Endpoint)

```python
# app/api/routes/gifts.py
from fastapi import APIRouter, Depends
from app.schemas.gift import CreateGiftDTO, GiftDTO
from app.services.gift_service import GiftService

router = APIRouter(prefix="/gifts", tags=["gifts"])

@router.post("", response_model=GiftDTO, status_code=201)
async def create_gift(
    data: CreateGiftDTO,
    service: GiftService = Depends()
):
    return service.create(data)
```

### Service (Business Logic)

```python
# app/services/gift_service.py
from app.schemas.gift import CreateGiftDTO, GiftDTO
from app.repositories.gift_repository import GiftRepository

class GiftService:
    def __init__(self, repo: GiftRepository = Depends()):
        self.repo = repo

    def create(self, data: CreateGiftDTO) -> GiftDTO:
        # Business logic here
        gift = self.repo.create(data)
        return GiftDTO.from_orm(gift)  # ORM → DTO
```

### Repository (DB Access)

```python
# app/repositories/gift_repository.py
from app.models.gift import Gift
from app.schemas.gift import CreateGiftDTO

class GiftRepository:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def create(self, data: CreateGiftDTO) -> Gift:
        gift = Gift(**data.dict())
        self.db.add(gift)
        self.db.commit()
        self.db.refresh(gift)
        return gift  # Returns ORM model
```

---

## WebSocket Pattern

### Server Setup

```python
# app/api/routes/websocket.py
from fastapi import WebSocket, WebSocketDisconnect

active_connections: dict[str, list[WebSocket]] = {}

@router.websocket("/ws/gifts/{family_id}")
async def gift_updates(websocket: WebSocket, family_id: str):
    await websocket.accept()
    if family_id not in active_connections:
        active_connections[family_id] = []
    active_connections[family_id].append(websocket)

    try:
        while True:
            await websocket.receive_text()  # Keep connection alive
    except WebSocketDisconnect:
        active_connections[family_id].remove(websocket)

async def broadcast(family_id: str, event: dict):
    for ws in active_connections.get(family_id, []):
        await ws.send_json(event)
```

### Event Broadcasting

```python
# In service layer after DB change
await broadcast(family_id, {
    "topic": f"gift-list:{family_id}",
    "event": "GIFT_ADDED",
    "data": {"entity_id": gift.id, "payload": {...}}
})
```

---

## Error Handling

### Error Response Envelope

```python
# app/schemas/common.py
from pydantic import BaseModel

class ErrorDetail(BaseModel):
    code: str
    message: str
    trace_id: str

class ErrorResponse(BaseModel):
    error: ErrorDetail
```

### Exception Handler

```python
# app/main.py
from fastapi import Request, status
from fastapi.responses import JSONResponse

@app.exception_handler(ValueError)
async def validation_exception_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": str(exc),
                "trace_id": request.state.trace_id
            }
        }
    )
```

---

## Database Migrations

### Create Migration

```bash
uv run alembic revision --autogenerate -m "add gift image_url"
```

### Review & Apply

```bash
# Review: alembic/versions/xxx_add_gift_image_url.py
uv run alembic upgrade head
```

### Rollback (if needed)

```bash
uv run alembic downgrade -1
```

---

## Authentication

### JWT Dependency

```python
# app/core/deps.py
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(token: str = Depends(security)):
    # Validate JWT, return user
    pass
```

### Protected Route

```python
@router.get("/me")
async def get_profile(user: User = Depends(get_current_user)):
    return user
```

---

## Testing Patterns

### Unit Tests (Services)

```python
# tests/unit/services/test_gift_service.py
def test_create_gift():
    mock_repo = MagicMock()
    service = GiftService(mock_repo)
    result = service.create(CreateGiftDTO(...))
    assert result.name == "LEGO"
```

### Integration Tests (API)

```python
# tests/integration/test_gifts.py
def test_create_gift_endpoint(client: TestClient):
    response = client.post("/gifts", json={...})
    assert response.status_code == 201
    assert response.json()["name"] == "LEGO"
```

### WebSocket Tests

```python
# tests/integration/test_websocket.py
async def test_gift_broadcast(client: TestClient):
    with client.websocket_connect("/ws/gifts/family-1") as ws:
        # Trigger event
        # Assert ws.receive_json()
        pass
```

---

## Configuration

### Settings (Environment)

```python
# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    API_PORT: int = 8000
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
```

---

## Common Anti-Patterns

| ✗ Anti-Pattern | ✓ Correct |
|----------------|-----------|
| DTO in repository | Repository returns ORM only |
| DB query in service | Service calls repository methods |
| ORM model in router response | Router returns DTO via `response_model` |
| Mixed async/sync | Use async throughout |
| No type hints | Type everything |

---

## Quick Reference

### Add New Entity

```text
1. Model: app/models/entity.py
2. Migration: alembic revision --autogenerate
3. Schema: app/schemas/entity.py (DTOs)
4. Repository: app/repositories/entity_repository.py
5. Service: app/services/entity_service.py
6. Router: app/api/routes/entity.py
7. Tests: tests/unit/, tests/integration/
```

### Run Locally

```bash
export PYTHONPATH="$PWD"
uv run uvicorn app.main:app --reload --port 8000
```

---

**Parent**: [../../CLAUDE.md](../../CLAUDE.md)
