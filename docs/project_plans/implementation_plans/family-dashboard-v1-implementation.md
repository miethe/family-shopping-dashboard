# Implementation Plan: Family Gifting Dashboard V1

**Plan ID**: `IMPL-2025-11-26-FAMILY-DASH-V1`
**Date**: 2025-11-26
**Author**: Implementation Planning (Opus)
**Related Documents**:
- **PRD**: `docs/project_plans/init/family-dashboard-v1.md`
- **North Star**: `docs/project_plans/north-star/family-gifting-dash.md`

**Complexity**: Large (Full Application MVP)
**Total Estimated Effort**: ~95 story points
**Target Timeline**: 9 phases
**Team Size**: 1-2 developers (homelab project)

---

## Executive Summary

This implementation plan delivers the Family Gifting Dashboard V1 - a collaborative gift planning application for 2-3 family members. The approach follows a strict layered architecture (Database → Repository → Service → API → Frontend) with WebSocket-based real-time updates as a core feature.

**Key Milestones**:
1. Backend foundation complete (Phases 1-5): Full API with authentication and real-time
2. Frontend MVP (Phases 6-8): All views with real-time collaboration
3. Production-ready (Phase 9): Tested and deployed to K8s homelab

**Success Criteria**:
- All 8 entities (User, Person, Occasion, List, Gift, ListItem, Tag, Comment) fully implemented
- Real-time updates working between 2 concurrent users
- Mobile-first responsive design with iOS safe areas
- Deployed and accessible in homelab environment

---

## Implementation Strategy

### Architecture Sequence

Following project layered architecture:
```
Router (HTTP/WS) → Service (DTOs) → Repository (ORM) → DB
```

**Critical Rules**:
- ✗ No DTO/ORM mixing
- ✗ No DB I/O in services
- ✓ Repository owns ALL queries
- ✓ Service returns DTOs only

### Parallel Work Opportunities

| Phase Range | Parallel Opportunities |
|-------------|----------------------|
| 1-2 | None - Repository depends on DB schema |
| 3-4 | Service and API can be partially parallel |
| 5 | WebSocket independent after REST API base |
| 6-8 | Frontend can start after API stabilizes (Phase 4) |
| 9 | Testing parallel to final frontend work |

### Critical Path

```
Phase 1 (DB) → Phase 2 (Repo) → Phase 3 (Service) → Phase 4 (REST) → Phase 6 (FE Foundation) → Phase 7 (Core Features)
```

WebSocket (Phase 5) can run parallel to Phase 6 once Phase 4 completes.

---

## Phase Overview

| Phase | Name | Effort | Dependencies | Primary Agent(s) |
|-------|------|--------|--------------|------------------|
| 1 | Database Foundation | 12 pts | None | data-layer-expert |
| 2 | Repository Layer | 10 pts | Phase 1 | python-backend-engineer |
| 3 | Service Layer | 12 pts | Phase 2 | python-backend-engineer, backend-architect |
| 4 | API Layer - REST | 10 pts | Phase 3 | python-backend-engineer |
| 5 | API Layer - WebSocket | 8 pts | Phase 4 | python-backend-engineer, backend-architect |
| 6 | Frontend Foundation | 10 pts | Phase 4 | frontend-developer, ui-engineer |
| 7 | Frontend Features - Core | 14 pts | Phase 6 | frontend-developer, ui-engineer-enhanced |
| 8 | Frontend Features - Advanced | 12 pts | Phase 5, 7 | frontend-developer |
| 9 | Testing & Deployment | 7 pts | All previous | python-backend-engineer, devops-architect |

**Total**: 95 story points

---

## Phase 1: Database Foundation

**Duration**: ~3-4 days
**Effort**: 12 story points
**Dependencies**: None
**Primary Agent**: `data-layer-expert`
**Supporting Agents**: `python-backend-engineer`

### Epic: DB-V1 - Database Schema & Models

| Task ID | Task Name | Description | Acceptance Criteria | Estimate |
|---------|-----------|-------------|-------------------|----------|
| DB-001 | Project Setup | Initialize FastAPI project with uv, SQLAlchemy, Alembic | Project runs, Alembic initialized | 2 pts |
| DB-002 | User Model | User entity with auth fields | Model defined, migration runs | 1 pt |
| DB-003 | Person Model | Person entity with interests/sizes JSON | Model with JSON field support | 1 pt |
| DB-004 | Occasion Model | Occasion entity with type enum | Model with enum type field | 1 pt |
| DB-005 | List Model | List entity with type/visibility enums | Model with FK to User, Person, Occasion | 2 pts |
| DB-006 | Gift Model | Gift entity with URL fields | Model defined, migration runs | 1 pt |
| DB-007 | ListItem Model | Junction table Gift↔List with status | Model with status enum, FKs | 2 pts |
| DB-008 | Tag Model | Tag entity with many-to-many | Model with association tables | 1 pt |
| DB-009 | Comment Model | Polymorphic comment model | Model with parent_type enum | 1 pt |

### Phase 1 Quality Gates

- [ ] All 8 models defined in `services/api/app/models/`
- [ ] Alembic migration generates clean schema
- [ ] `alembic upgrade head` runs without errors
- [ ] All FKs and constraints properly defined
- [ ] Indexes added for common query patterns (status, dates, FKs)

### Key Files

```
services/api/
├── app/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py           # Base model with id, timestamps
│   │   ├── user.py
│   │   ├── person.py
│   │   ├── occasion.py
│   │   ├── list.py
│   │   ├── gift.py
│   │   ├── list_item.py
│   │   ├── tag.py
│   │   └── comment.py
│   └── core/
│       └── database.py       # Engine, session factory
├── alembic/
│   └── versions/
│       └── 001_initial_schema.py
└── pyproject.toml
```

---

## Phase 2: Repository Layer

**Duration**: ~2-3 days
**Effort**: 10 story points
**Dependencies**: Phase 1 complete
**Primary Agent**: `python-backend-engineer`
**Supporting Agents**: `data-layer-expert`

### Epic: REPO-V1 - Repository Pattern Implementation

| Task ID | Task Name | Description | Acceptance Criteria | Estimate |
|---------|-----------|-------------|-------------------|----------|
| REPO-001 | Base Repository | Generic CRUD base with pagination | Cursor pagination, type hints | 2 pts |
| REPO-002 | User Repository | User-specific queries (auth) | get_by_email, password ops | 1 pt |
| REPO-003 | Person Repository | Person queries with relations | List loading, gift history | 1 pt |
| REPO-004 | Occasion Repository | Occasion queries with timeline | Upcoming filter, people list | 1 pt |
| REPO-005 | List Repository | List queries with filters | Filter by type/person/occasion | 2 pts |
| REPO-006 | Gift Repository | Gift catalog queries | Search, tag filter | 1 pt |
| REPO-007 | ListItem Repository | ListItem status queries | Status filters, assignments | 1 pt |
| REPO-008 | Tag Repository | Tag CRUD with associations | Attach/detach operations | 0.5 pt |
| REPO-009 | Comment Repository | Polymorphic comment queries | Parent resolution | 0.5 pt |

### Phase 2 Quality Gates

- [ ] All repositories in `services/api/app/repositories/`
- [ ] Base repository supports cursor pagination
- [ ] No business logic in repositories (only DB operations)
- [ ] Transaction handling works correctly
- [ ] Unit tests for critical query methods

### Key Files

```
services/api/app/repositories/
├── __init__.py
├── base.py              # BaseRepository[T]
├── user.py
├── person.py
├── occasion.py
├── list.py
├── gift.py
├── list_item.py
├── tag.py
└── comment.py
```

---

## Phase 3: Service Layer

**Duration**: ~3-4 days
**Effort**: 12 story points
**Dependencies**: Phase 2 complete
**Primary Agent**: `python-backend-engineer`
**Supporting Agents**: `backend-architect`

### Epic: SVC-V1 - Service Layer & DTOs

| Task ID | Task Name | Description | Acceptance Criteria | Estimate |
|---------|-----------|-------------|-------------------|----------|
| SVC-001 | DTO Schemas | Pydantic schemas for all entities | Request/Response DTOs defined | 2 pts |
| SVC-002 | Auth Service | Login, token generation, validation | JWT auth working | 2 pts |
| SVC-003 | User Service | User CRUD, profile management | Returns DTOs only | 1 pt |
| SVC-004 | Person Service | Person CRUD with gift history | History aggregation logic | 1 pt |
| SVC-005 | Occasion Service | Occasion CRUD with summaries | Pipeline summary calculation | 1 pt |
| SVC-006 | List Service | List CRUD with status counts | Status aggregation | 1 pt |
| SVC-007 | Gift Service | Gift CRUD with URL parsing | URL metadata extraction | 2 pts |
| SVC-008 | ListItem Service | Status transitions, assignments | Valid state transitions | 1 pt |
| SVC-009 | Comment Service | Comment CRUD | Parent validation | 0.5 pt |
| SVC-010 | Dashboard Service | Dashboard aggregations | All dashboard data points | 0.5 pt |

### Phase 3 Quality Gates

- [ ] All DTOs in `services/api/app/schemas/`
- [ ] Services in `services/api/app/services/`
- [ ] No ORM objects in service return values
- [ ] Business logic (status transitions, validations) in services
- [ ] Error envelope pattern for all errors
- [ ] Unit tests for business logic

### Key Files

```
services/api/app/
├── schemas/
│   ├── __init__.py
│   ├── base.py           # PageInfo, ErrorResponse
│   ├── user.py
│   ├── person.py
│   ├── occasion.py
│   ├── list.py
│   ├── gift.py
│   ├── list_item.py
│   ├── tag.py
│   ├── comment.py
│   └── dashboard.py
└── services/
    ├── __init__.py
    ├── auth.py
    ├── user.py
    ├── person.py
    ├── occasion.py
    ├── list.py
    ├── gift.py
    ├── list_item.py
    ├── comment.py
    └── dashboard.py
```

---

## Phase 4: API Layer - REST

**Duration**: ~2-3 days
**Effort**: 10 story points
**Dependencies**: Phase 3 complete
**Primary Agent**: `python-backend-engineer`
**Supporting Agents**: `backend-architect`

### Epic: API-V1 - REST Endpoints

| Task ID | Task Name | Description | Acceptance Criteria | Estimate |
|---------|-----------|-------------|-------------------|----------|
| API-001 | Router Setup | FastAPI app with CORS, error handlers | App runs, CORS configured | 1 pt |
| API-002 | Auth Routes | Login, register (admin), refresh | JWT flow working | 2 pts |
| API-003 | User Routes | Profile CRUD | All user operations | 1 pt |
| API-004 | Person Routes | Person CRUD with relations | Full CRUD + gift history | 1 pt |
| API-005 | Occasion Routes | Occasion CRUD with summaries | Full CRUD + pipeline data | 1 pt |
| API-006 | List Routes | List CRUD with items | Full CRUD + item operations | 1 pt |
| API-007 | Gift Routes | Gift CRUD with URL parsing | Full CRUD + URL metadata | 1 pt |
| API-008 | ListItem Routes | Status/assignment updates | Status transitions, assignments | 1 pt |
| API-009 | Dashboard Route | Aggregated dashboard data | Single endpoint, all data | 0.5 pt |
| API-010 | Health Check | Health endpoint for K8s | DB connection check | 0.5 pt |

### Phase 4 Quality Gates

- [ ] All routers in `services/api/app/api/`
- [ ] OpenAPI docs generate correctly at `/docs`
- [ ] All endpoints return consistent error envelope
- [ ] Authentication required on protected routes
- [ ] Integration tests for all endpoints
- [ ] <300ms response time for list operations

### Key Files

```
services/api/app/
├── api/
│   ├── __init__.py
│   ├── deps.py           # Dependency injection
│   ├── auth.py
│   ├── users.py
│   ├── persons.py
│   ├── occasions.py
│   ├── lists.py
│   ├── gifts.py
│   ├── list_items.py
│   └── dashboard.py
├── main.py               # FastAPI app
└── core/
    ├── config.py         # Settings
    └── security.py       # JWT utilities
```

---

## Phase 5: API Layer - WebSocket

**Duration**: ~2-3 days
**Effort**: 8 story points
**Dependencies**: Phase 4 complete
**Primary Agent**: `python-backend-engineer`
**Supporting Agents**: `backend-architect`

### Epic: WS-V1 - Real-Time Updates

| Task ID | Task Name | Description | Acceptance Criteria | Estimate |
|---------|-----------|-------------|-------------------|----------|
| WS-001 | WS Manager | Connection manager with topics | Connect/disconnect, topic subscribe | 2 pts |
| WS-002 | WS Endpoint | WebSocket route with auth | Authenticated WS connections | 1 pt |
| WS-003 | Event Schema | WSEvent structure | Topic, event type, payload typed | 1 pt |
| WS-004 | Broadcast Integration | Service layer broadcasts | Events emitted on mutations | 2 pts |
| WS-005 | Client Topics | Topic subscription logic | Subscribe to list/occasion topics | 1 pt |
| WS-006 | Presence (Optional) | User presence tracking | "User viewing" indicator | 1 pt |

### WebSocket Event Structure

```python
class WSEvent:
    topic: str              # "list:123", "occasion:456"
    event: str              # "ADDED", "UPDATED", "DELETED", "STATUS_CHANGED"
    data: dict              # { entity_id, payload, user_id }
```

### Phase 5 Quality Gates

- [ ] WebSocket endpoint at `/ws`
- [ ] Topic-based subscription working
- [ ] Events broadcast on ListItem status changes
- [ ] Events broadcast on new comments
- [ ] Connection cleanup on disconnect
- [ ] Integration test with 2 concurrent clients

### Key Files

```
services/api/app/
├── api/
│   └── ws.py             # WebSocket endpoint
├── services/
│   └── ws_manager.py     # Connection manager
└── schemas/
    └── ws.py             # WSEvent schema
```

---

## Phase 6: Frontend Foundation

**Duration**: ~2-3 days
**Effort**: 10 story points
**Dependencies**: Phase 4 complete
**Primary Agent**: `frontend-developer`
**Supporting Agents**: `ui-engineer`, `ui-designer`

### Epic: FE-V1 - Frontend Setup

| Task ID | Task Name | Description | Acceptance Criteria | Estimate |
|---------|-----------|-------------|-------------------|----------|
| FE-001 | Next.js Setup | App Router project with TypeScript | Project runs, TS configured | 1 pt |
| FE-002 | Tailwind + Radix | Styling setup | Theme configured, components available | 1 pt |
| FE-003 | React Query Setup | Data fetching configuration | QueryClient, devtools | 1 pt |
| FE-004 | Auth Context | JWT auth state management | Login/logout, token refresh | 2 pts |
| FE-005 | API Client | Typed fetch wrapper | All endpoints typed | 1 pt |
| FE-006 | Layout Components | Shell, nav, mobile-first | Safe areas, 44px touch targets | 2 pts |
| FE-007 | Base Components | Button, Input, Card, etc. | Radix-based, accessible | 1 pt |
| FE-008 | PWA Setup | Manifest, icons | Add to home screen ready | 1 pt |

### Mobile-First Constraints

```css
/* Viewport */
viewport: width=device-width, initial-scale=1, maximum-scale=1

/* Safe areas */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);

/* Touch targets */
min-height: 44px;
min-width: 44px;

/* Height fix */
height: 100dvh; /* or calc(100vh - 60px) */
```

### Phase 6 Quality Gates

- [ ] Next.js app runs at `localhost:3000`
- [ ] Auth flow working (login → dashboard)
- [ ] Mobile-first layout with iOS safe areas
- [ ] 44px minimum touch targets
- [ ] React Query configured with API client
- [ ] Basic component library ready

### Key Files

```
apps/web/
├── app/
│   ├── layout.tsx        # Root layout with providers
│   ├── page.tsx          # Home/redirect
│   ├── login/
│   │   └── page.tsx
│   └── (dashboard)/
│       └── layout.tsx    # Auth-required layout
├── components/
│   ├── ui/               # Base components
│   ├── layout/           # Shell, nav
│   └── providers/        # React Query, Auth
├── lib/
│   ├── api/              # API client
│   └── hooks/            # Custom hooks
├── tailwind.config.ts
└── next.config.ts
```

---

## Phase 7: Frontend Features - Core

**Duration**: ~4-5 days
**Effort**: 14 story points
**Dependencies**: Phase 6 complete
**Primary Agent**: `frontend-developer`
**Supporting Agents**: `ui-engineer-enhanced`

### Epic: FE-CORE-V1 - Core Views

| Task ID | Task Name | Description | Acceptance Criteria | Estimate |
|---------|-----------|-------------|-------------------|----------|
| FE-C-001 | Dashboard Page | Overview with occasion, pipeline | All dashboard data displayed | 3 pts |
| FE-C-002 | People List | People index with cards | Filter, search, responsive | 2 pts |
| FE-C-003 | Person Detail | Person view with history | Tabs for lists, history, notes | 2 pts |
| FE-C-004 | Occasions List | Occasions index | Date-sorted, type badges | 1 pt |
| FE-C-005 | Occasion Detail | Occasion view with people | Pipeline per person | 2 pts |
| FE-C-006 | Lists View | Lists index with filters | Type/occasion/person filters | 2 pts |
| FE-C-007 | List Detail | List with pipeline groups | Status-grouped items | 2 pts |

### Dashboard Requirements

From PRD Section 4.2.1:
- Primary upcoming Occasion
- Pipeline summary (status counts)
- "People needing gifts" section
- Idea Inbox (top N ideas)
- Recent Activity feed

### Phase 7 Quality Gates

- [ ] Dashboard shows all required data points
- [ ] People CRUD working with forms
- [ ] Occasions CRUD working
- [ ] Lists display with status grouping
- [ ] All views mobile-responsive
- [ ] React Query caching working

### Key Files

```
apps/web/app/(dashboard)/
├── page.tsx              # Dashboard
├── people/
│   ├── page.tsx          # People list
│   └── [id]/
│       └── page.tsx      # Person detail
├── occasions/
│   ├── page.tsx          # Occasions list
│   └── [id]/
│       └── page.tsx      # Occasion detail
└── lists/
    ├── page.tsx          # Lists index
    └── [id]/
        └── page.tsx      # List detail
```

---

## Phase 8: Frontend Features - Advanced

**Duration**: ~3-4 days
**Effort**: 12 story points
**Dependencies**: Phase 5 + Phase 7 complete
**Primary Agent**: `frontend-developer`
**Supporting Agents**: `ui-engineer-enhanced`

### Epic: FE-ADV-V1 - Advanced Features

| Task ID | Task Name | Description | Acceptance Criteria | Estimate |
|---------|-----------|-------------|-------------------|----------|
| FE-A-001 | Gift Catalog | Gifts index with search | Search, tag filter, sort | 2 pts |
| FE-A-002 | Gift Detail | Gift view with usage info | Shows lists/people using gift | 1 pt |
| FE-A-003 | URL Gift Creation | Add gift from URL | Metadata extraction, preview | 2 pts |
| FE-A-004 | Quick Add Idea | Global add idea flow | Modal from any page | 1 pt |
| FE-A-005 | WebSocket Hook | useWebSocket hook | Connect, subscribe, reconnect | 2 pts |
| FE-A-006 | Real-Time Integration | RQ cache invalidation | Auto-refresh on WS events | 2 pts |
| FE-A-007 | Comments Component | Comment thread UI | Add, view, resolve comments | 1 pt |
| FE-A-008 | My Assignments | Assigned items view | Filter all items assigned to me | 1 pt |

### Real-Time State Sync Pattern

```typescript
// From CLAUDE.md
1. Load: React Query (REST)
2. Subscribe: WebSocket on mount
3. Event: Invalidate RQ cache → refetch
4. Unmount: Unsubscribe
5. Fallback: Poll every 10s if WS down
```

### Phase 8 Quality Gates

- [ ] Gift catalog with search working
- [ ] URL-based gift creation extracts metadata
- [ ] Quick Add Idea accessible from header
- [ ] WebSocket updates trigger UI refresh
- [ ] Comments working on all entity types
- [ ] "My Assignments" filter working

### Key Files

```
apps/web/
├── app/(dashboard)/
│   └── gifts/
│       ├── page.tsx      # Gift catalog
│       └── [id]/
│           └── page.tsx  # Gift detail
├── components/
│   ├── gifts/
│   │   ├── GiftCard.tsx
│   │   └── UrlGiftForm.tsx
│   ├── comments/
│   │   └── CommentThread.tsx
│   └── quick-add/
│       └── QuickAddModal.tsx
└── lib/
    └── hooks/
        ├── useWebSocket.ts
        └── useRealtimeSync.ts
```

---

## Phase 9: Testing & Deployment

**Duration**: ~2-3 days
**Effort**: 7 story points
**Dependencies**: All previous phases
**Primary Agent**: `python-backend-engineer`
**Supporting Agents**: `devops-architect`

### Epic: TEST-V1 - Testing & Deploy

| Task ID | Task Name | Description | Acceptance Criteria | Estimate |
|---------|-----------|-------------|-------------------|----------|
| TEST-001 | Backend Unit Tests | Service layer tests | 60% coverage on services | 2 pts |
| TEST-002 | API Integration Tests | Endpoint tests | All CRUD endpoints tested | 1 pt |
| TEST-003 | WebSocket Tests | WS integration tests | Event broadcast verified | 1 pt |
| TEST-004 | E2E Critical Paths | Playwright/Cypress E2E | UC1-UC4 from PRD tested | 1 pt |
| DEPLOY-001 | Dockerfiles | API + Web containers | Both build successfully | 0.5 pt |
| DEPLOY-002 | K8s Manifests | Deployment configs | Apply without errors | 1 pt |
| DEPLOY-003 | Health + Readiness | Probes configured | K8s health checks pass | 0.5 pt |

### Testing Pyramid (2-3 users = simplified)

```
Unit (60%): Services, utilities
Integration (30%): API endpoints, WebSocket
E2E (10%): Critical flows (UC1-UC4)
```

### Phase 9 Quality Gates

- [ ] Backend tests pass (`uv run pytest`)
- [ ] Frontend tests pass (`pnpm test`)
- [ ] E2E tests cover UC1-UC4
- [ ] Docker images build successfully
- [ ] K8s deployment works in homelab
- [ ] Health checks respond correctly

### Key Files

```
services/api/
├── tests/
│   ├── unit/
│   │   └── services/
│   ├── integration/
│   │   └── api/
│   └── conftest.py

apps/web/
├── tests/
│   └── e2e/
│       ├── capture-idea.spec.ts    # UC1
│       ├── plan-christmas.spec.ts  # UC2
│       ├── coordination.spec.ts    # UC3
│       └── progress-view.spec.ts   # UC4

k8s/
├── api-deployment.yaml
├── web-deployment.yaml
├── postgres-deployment.yaml
├── configmap.yaml
└── secrets.yaml
```

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| URL scraping fragility | Medium | High | Best-effort only, manual override always available |
| WebSocket reconnection issues | Medium | Medium | Fallback polling every 10s |
| Mobile Safari quirks | Low | Medium | Test on actual iOS device early |

### Schedule Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Scope creep beyond V1 | High | High | Strict adherence to PRD non-goals |
| Complexity in status logic | Medium | Medium | Define state machine upfront |

---

## Resource Requirements

### Infrastructure

| Resource | Specification |
|----------|---------------|
| API Container | 256Mi memory, 100m CPU |
| Web Container | 128Mi memory, 50m CPU |
| PostgreSQL | 512Mi memory, persistent volume |

### Environment Variables

**API**:
- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `API_PORT`
- `CORS_ORIGINS`

**Web**:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_WS_URL`

---

## Success Metrics

### Delivery Metrics

- [ ] All 9 phases completed
- [ ] All quality gates passed
- [ ] <300ms page load times
- [ ] Zero P0 bugs in first week of use

### PRD Success Criteria (from Section 8)

**Qualitative**:
- [ ] Plan Christmas + at least one other occasion entirely in app
- [ ] At-a-glance view of coverage and personal tasks

**Quantitative**:
- [ ] 10+ People records
- [ ] 5+ Occasions
- [ ] 50+ Gifts
- [ ] 100+ ListItems
- [ ] Zero double-buy incidents

---

## Phase File Links

For detailed task breakdowns, see individual phase files:

- [Phase 1-3: Backend Foundation](./family-dashboard-v1/phase-1-3-backend.md)
- [Phase 4-5: API Layer](./family-dashboard-v1/phase-4-5-api.md)
- [Phase 6-8: Frontend](./family-dashboard-v1/phase-6-8-frontend.md)
- [Phase 9: Testing & Deployment](./family-dashboard-v1/phase-9-deployment.md)

---

**Implementation Plan Version**: 1.0
**Last Updated**: 2025-11-26
