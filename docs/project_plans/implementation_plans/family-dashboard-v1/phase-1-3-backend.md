# Phase 1-3: Backend Foundation - Database, Repository, Service

**Plan ID**: `IMPL-2025-11-26-FAMILY-DASH-V1`
**Parent Document**: [Family Dashboard V1 Implementation Plan](../family-dashboard-v1-implementation.md)
**PRD**: `docs/project_plans/init/family-dashboard-v1.md`

---

## Overview

Phases 1-3 establish the complete backend foundation following the layered architecture: Database → Repository → Service.

| Phase | Duration | Effort | Focus |
|-------|----------|--------|-------|
| **1: Database Foundation** | 3-4 days | 12 pts | 8 entity models, Alembic migrations |
| **2: Repository Layer** | 2-3 days | 10 pts | Base repository, entity-specific queries |
| **3: Service Layer** | 3-4 days | 12 pts | DTOs, business logic, auth |

**Total Effort**: 34 story points
**Critical Path**: Phase 1 → Phase 2 → Phase 3 (sequential)

---

## Phase 1: Database Foundation

**Duration**: ~3-4 days
**Effort**: 12 story points
**Dependencies**: None
**Primary Agent**: `data-layer-expert`
**Supporting Agents**: `python-backend-engineer`

### Epic: DB-V1 - Database Schema & Models

All 8 entity models with SQLAlchemy ORM definitions and Alembic migrations.

| Task ID | Task Name | Description | Acceptance Criteria | Estimate |
|---------|-----------|-------------|-------------------|----------|
| DB-001 | Project Setup | Initialize FastAPI project with uv, SQLAlchemy, Alembic, PostgreSQL driver | Project scaffolding complete, Alembic initialized, can run `uv run alembic revision` | 2 pts |
| DB-002 | User Model | User entity with id, email, hashed_password, created_at, updated_at | Model inherits from Base, email unique, password field present | 1 pt |
| DB-003 | Person Model | Person entity with name, interests (JSON), sizes (JSON), relationships for gift history | Model defined, JSON fields serialize/deserialize, relationships to Gift through ListItem | 1 pt |
| DB-004 | Occasion Model | Occasion entity with name, type (enum: birthday/holiday/other), date, description | Model with PostgreSQL enum field, date field validates date > today | 1 pt |
| DB-005 | List Model | List entity with name, type enum (wishlist/ideas/assigned), visibility enum, FKs to User, Person, Occasion | Model with composite FK constraints, status tracking via ListItems | 2 pts |
| DB-006 | Gift Model | Gift entity with name, url, price, image_url, source, metadata (JSON) | Model with URL validation, image_url for thumbnails, metadata for extensibility | 1 pt |
| DB-007 | ListItem Model | Junction table: Gift ↔ List with status (idea/selected/purchased/received), assigned_to (FK to User), notes, created_at | Model with status enum, FK constraints, composite unique on (gift_id, list_id) | 2 pts |
| DB-008 | Tag Model | Tag entity with name, description, association table for Tag ↔ Gift many-to-many | Model with association table defined, cascade delete rules | 1 pt |
| DB-009 | Comment Model | Polymorphic comment model with parent_type enum (list_item/list/occasion/person), parent_id, content, author_id (FK User), created_at | Model with parent_type and parent_id, no foreign key to maintain flexibility | 1 pt |

### Database Schema Summary

```sql
users (id, email, password_hash, created_at, updated_at)
persons (id, name, interests JSON, sizes JSON, created_at, updated_at)
occasions (id, name, type ENUM, date DATE, description, created_at, updated_at)
lists (id, name, type ENUM, visibility ENUM, user_id FK, person_id FK, occasion_id FK, created_at, updated_at)
gifts (id, name, url, price DECIMAL, image_url, source TEXT, metadata JSON, created_at, updated_at)
list_items (id, gift_id FK, list_id FK, status ENUM, assigned_to FK(users), notes, created_at, updated_at)
  -- Unique constraint: (gift_id, list_id)
tags (id, name, description, created_at, updated_at)
gift_tags (gift_id FK, tag_id FK) -- Many-to-many junction
comments (id, content, author_id FK(users), parent_type ENUM, parent_id, created_at)
```

### Phase 1 Quality Gates

- [ ] All 8 models defined in `services/api/app/models/`
- [ ] Alembic migration generated with `alembic revision --autogenerate -m "initial schema"`
- [ ] `alembic upgrade head` runs without errors against test PostgreSQL
- [ ] All foreign keys with proper ON DELETE constraints
- [ ] Indexes added for: status, user_id, person_id, occasion_id, gift_id, created_at
- [ ] Composite unique constraint on list_items (gift_id, list_id)
- [ ] SQLAlchemy relationships defined bidirectionally where needed
- [ ] Enums properly defined with PostgreSQL backend

### Key Files to Create

```
services/api/
├── app/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py           # BaseModel with id, created_at, updated_at
│   │   ├── user.py           # User model
│   │   ├── person.py         # Person model
│   │   ├── occasion.py       # Occasion model with type enum
│   │   ├── list.py           # List model with type/visibility enums
│   │   ├── gift.py           # Gift model
│   │   ├── list_item.py      # ListItem model with status enum
│   │   ├── tag.py            # Tag model
│   │   └── comment.py        # Comment model with parent_type
│   └── core/
│       └── database.py       # Engine, SessionLocal, get_db
├── alembic/
│   ├── env.py
│   ├── script.py.template
│   └── versions/
│       └── 001_initial_schema.py
├── pyproject.toml
├── .env.example              # DATABASE_URL template
└── main.py                   # Minimal FastAPI app
```

### Dependencies to Add

```toml
# pyproject.toml
sqlalchemy = "^2.0"
alembic = "^1.13"
psycopg = "^3.1"              # PostgreSQL driver with async support
pydantic = "^2.0"
python-dotenv = "^1.0"
```

---

## Phase 2: Repository Layer

**Duration**: ~2-3 days
**Effort**: 10 story points
**Dependencies**: Phase 1 complete, database migrations applied
**Primary Agent**: `python-backend-engineer`
**Supporting Agents**: `data-layer-expert`

### Epic: REPO-V1 - Repository Pattern Implementation

Generic CRUD base with entity-specific query methods. No business logic, only DB operations.

| Task ID | Task Name | Description | Acceptance Criteria | Estimate |
|---------|-----------|-------------|-------------------|----------|
| REPO-001 | Base Repository | Generic BaseRepository[T] with cursor-based pagination, CRUD operations | Supports create, read, list (with cursor), update, delete; type hints throughout | 2 pts |
| REPO-002 | User Repository | User-specific queries: get_by_email, get_by_id, update_password, verify_password | All auth-related queries present, password hashing/verification helpers | 1 pt |
| REPO-003 | Person Repository | Person queries: list_with_gift_history, get_with_lists, count_by_occasion | Eager loading relationships, efficient queries | 1 pt |
| REPO-004 | Occasion Repository | Occasion queries: get_upcoming, get_with_people, filter_by_type, timeline view | Date filtering, person aggregation | 1 pt |
| REPO-005 | List Repository | List queries: filter_by_type, filter_by_person, filter_by_occasion, get_with_items | Complex filters, eager load items | 2 pts |
| REPO-006 | Gift Repository | Gift queries: search_by_name, filter_by_tag, get_with_usage_info, paginated search | Full-text search support, tag filtering | 1 pt |
| REPO-007 | ListItem Repository | ListItem queries: filter_by_status, filter_by_assigned_to, get_for_list, status_counts | Status filtering, assignment tracking | 1 pt |
| REPO-008 | Tag Repository | Tag queries: list_all, get_with_gifts, attach_to_gift, detach_from_gift | Association management, no orphaned tags | 0.5 pt |
| REPO-009 | Comment Repository | Comment queries: get_for_parent, get_by_type, paginated fetch | Polymorphic querying, correct parent resolution | 0.5 pt |

### Repository Base Class Pattern

```python
# services/api/app/repositories/base.py
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from typing import TypeVar, Generic, List, Optional

T = TypeVar("T")

class BaseRepository(Generic[T]):
    def __init__(self, session: Session, model: type[T]):
        self.session = session
        self.model = model

    async def create(self, obj_in: dict) -> T:
        db_obj = self.model(**obj_in)
        self.session.add(db_obj)
        await self.session.commit()
        return db_obj

    async def get(self, id: int) -> Optional[T]:
        return await self.session.get(self.model, id)

    async def list(self, cursor: Optional[int] = None, limit: int = 50) -> List[T]:
        query = select(self.model)
        if cursor:
            query = query.where(self.model.id > cursor)
        query = query.limit(limit + 1)  # Fetch one extra to know if more exist
        return await self.session.scalars(query)

    async def update(self, id: int, obj_in: dict) -> Optional[T]:
        obj = await self.get(id)
        for key, value in obj_in.items():
            setattr(obj, key, value)
        await self.session.commit()
        return obj

    async def delete(self, id: int) -> bool:
        obj = await self.get(id)
        await self.session.delete(obj)
        await self.session.commit()
        return True
```

### Phase 2 Quality Gates

- [ ] All repositories in `services/api/app/repositories/` inheriting from BaseRepository
- [ ] BaseRepository supports cursor-based pagination (not offset, for efficiency)
- [ ] No business logic in repositories—only DB operations
- [ ] Transaction handling: explicit commit/rollback in repository methods
- [ ] Eager loading configured to prevent N+1 queries (use `selectinload`, `joinedload`)
- [ ] Unit tests for critical query methods (search, filter, pagination)
- [ ] Performance verified: <100ms for list operations on 1000+ items

### Key Files to Create

```
services/api/app/repositories/
├── __init__.py               # Export all repositories
├── base.py                   # BaseRepository[T] generic class
├── user.py                   # UserRepository
├── person.py                 # PersonRepository
├── occasion.py               # OccasionRepository
├── list.py                   # ListRepository
├── gift.py                   # GiftRepository
├── list_item.py              # ListItemRepository
├── tag.py                    # TagRepository
└── comment.py                # CommentRepository
```

### Key Patterns

**Eager Loading Example**:
```python
from sqlalchemy.orm import selectinload

async def get_with_items(self, list_id: int):
    query = (select(List)
             .where(List.id == list_id)
             .options(selectinload(List.items)
                     .selectinload(ListItem.gift)))
    return await self.session.scalar(query)
```

**Pagination Cursor**:
```python
async def list_paginated(self, cursor: Optional[int] = None, limit: int = 50):
    query = select(self.model)
    if cursor:
        query = query.where(self.model.id > cursor)
    query = query.order_by(self.model.id).limit(limit + 1)
    results = await self.session.scalars(query)

    has_more = len(results) > limit
    return results[:limit], has_more, results[-1].id if results else None
```

---

## Phase 3: Service Layer

**Duration**: ~3-4 days
**Effort**: 12 story points
**Dependencies**: Phase 2 complete
**Primary Agent**: `python-backend-engineer`
**Supporting Agents**: `backend-architect`

### Epic: SVC-V1 - Service Layer & DTOs

Data Transfer Objects, business logic, authentication, no ORM objects in return values.

| Task ID | Task Name | Description | Acceptance Criteria | Estimate |
|---------|-----------|-------------|-------------------|----------|
| SVC-001 | DTO Schemas | Pydantic v2 schemas for all entities: Request, Response, list payloads | All DTOs defined, validation rules for all fields, nested DTOs for relationships | 2 pts |
| SVC-002 | Auth Service | Login, register (admin-only), token generation (JWT), token validation, password hashing | JWT tokens with expiry, refresh token support, bcrypt hashing | 2 pts |
| SVC-003 | User Service | User CRUD, profile management, returning UserDTO only | Create validates email uniqueness, update redacts password | 1 pt |
| SVC-004 | Person Service | Person CRUD, gift history aggregation, returning PersonDTO | History aggregation from ListItems, interests/sizes JSON handling | 1 pt |
| SVC-005 | Occasion Service | Occasion CRUD, pipeline summary calculation (upcoming, status counts) | Summary aggregates all people's status counts, date validation | 1 pt |
| SVC-006 | List Service | List CRUD, status count aggregation, returning ListDTO with items | Status counts per list, efficient eager loading | 1 pt |
| SVC-007 | Gift Service | Gift CRUD, URL parsing for metadata (title, image, price), catalog search | BeautifulSoup/requests for URL scraping, fallback to manual input | 2 pts |
| SVC-008 | ListItem Service | ListItem status transitions, assignment logic, state machine validation | Valid transitions: idea→selected→purchased→received, only assigned_to update | 1 pt |
| SVC-009 | Comment Service | Comment CRUD, parent validation (list_item/list/occasion/person), returning CommentDTO | Validates parent exists before creating, polymorphic queries | 0.5 pt |
| SVC-010 | Dashboard Service | Dashboard aggregations (primary occasion, people needing gifts, pipeline, ideas, activity) | All dashboard data points in one call, efficient queries | 0.5 pt |

### DTO/Schema Structure

```python
# services/api/app/schemas/base.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class PaginationInfo(BaseModel):
    cursor: Optional[int] = None
    limit: int = 50
    has_more: bool = False

class ErrorResponse(BaseModel):
    error: dict  # {"code": "...", "message": "...", "trace_id": "..."}

class BaseSchema(BaseModel):
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # SQLAlchemy compatibility
```

### Authentication Service Pattern

```python
# services/api/app/services/auth.py
from datetime import datetime, timedelta, timezone
import jwt
from passlib.context import CryptContext

class AuthService:
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def hash_password(self, password: str) -> str:
        return self.pwd_context.hash(password)

    def verify_password(self, plain: str, hashed: str) -> bool:
        return self.pwd_context.verify(plain, hashed)

    def create_access_token(self, user_id: int, expires_delta: Optional[timedelta] = None) -> str:
        if expires_delta is None:
            expires_delta = timedelta(hours=24)

        expire = datetime.now(timezone.utc) + expires_delta
        payload = {"user_id": user_id, "exp": expire}
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def decode_token(self, token: str) -> Optional[int]:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload.get("user_id")
        except jwt.InvalidTokenError:
            return None
```

### Phase 3 Quality Gates

- [ ] All DTOs in `services/api/app/schemas/` with Pydantic v2 syntax
- [ ] All services in `services/api/app/services/` with proper dependency injection
- [ ] No ORM objects returned from service methods (only DTOs)
- [ ] No database I/O in services—all via repository methods
- [ ] Business logic (status transitions, validations, aggregations) in services
- [ ] Error envelope pattern: all exceptions wrapped in consistent format
- [ ] JWT auth service tested with token generation/validation
- [ ] Unit tests for business logic with 60%+ coverage on services
- [ ] Password hashing verified with bcrypt

### Key Files to Create

```
services/api/app/
├── schemas/
│   ├── __init__.py
│   ├── base.py               # PaginationInfo, ErrorResponse, BaseSchema
│   ├── user.py               # UserCreate, UserResponse, UserProfile
│   ├── person.py             # PersonCreate, PersonResponse, PersonHistory
│   ├── occasion.py           # OccasionCreate, OccasionResponse, OccasionSummary
│   ├── list.py               # ListCreate, ListResponse, ListWithItems
│   ├── gift.py               # GiftCreate, GiftResponse, GiftWithUsage
│   ├── list_item.py          # ListItemCreate, ListItemResponse
│   ├── tag.py                # TagCreate, TagResponse
│   ├── comment.py            # CommentCreate, CommentResponse
│   └── dashboard.py          # DashboardResponse with all data points
├── services/
│   ├── __init__.py
│   ├── auth.py               # AuthService (JWT, password hashing)
│   ├── user.py               # UserService
│   ├── person.py             # PersonService
│   ├── occasion.py           # OccasionService with aggregation
│   ├── list.py               # ListService with status counts
│   ├── gift.py               # GiftService with URL parsing
│   ├── list_item.py          # ListItemService with state machine
│   ├── comment.py            # CommentService
│   └── dashboard.py          # DashboardService
└── core/
    └── security.py           # JWT dependencies, get_current_user
```

### Dependencies to Add

```toml
# pyproject.toml
pydantic = "^2.0"
python-jose = "^3.3"
passlib = "^1.7"
bcrypt = "^4.0"
beautifulsoup4 = "^4.12"       # For URL metadata extraction
requests = "^2.31"             # For HTTP requests
pytest = "^7.4"                # For testing
pytest-asyncio = "^0.21"       # Async test support
```

---

## Phase 1-3 Summary

| Metric | Value |
|--------|-------|
| **Total Effort** | 34 story points |
| **Duration** | ~8-11 days |
| **Models Created** | 8 entities |
| **Repositories** | 9 classes |
| **Services** | 10 classes |
| **DTOs** | ~30 Pydantic schemas |
| **Migrations** | 1 initial, auto-generated |

### Success Criteria

- All models, repositories, and services follow established patterns
- Database schema complete with migrations
- No circular dependencies between layers
- JWT authentication working
- Ready for API layer development in Phase 4

---

**Phase File Version**: 1.0
**Last Updated**: 2025-11-26
