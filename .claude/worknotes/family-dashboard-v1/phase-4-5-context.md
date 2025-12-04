# Phase 4-5 Working Context - API Layer (REST + WebSocket)

**Purpose:** Token-efficient context for resuming work across AI turns

---

## Current State

**Branch:** feat/implementation-v1
**Last Commit:** 788b444 feat(api): Phase 3 complete - service layer with 9 services
**Current Phase:** 4 - REST API
**Current Task:** API-001 (Router Setup)

---

## Completed Tasks

*Phase 4-5 just started*

---

## Key Decisions

- **Architecture:** Layered - Router → Service → Repository → DB
- **Error Format:** `ErrorResponse` with code, message, trace_id
- **Pagination:** Cursor-based via `PaginatedResponse[T]`
- **Auth Pattern:** JWT via `AuthService.decode_token()` - exists in services/auth.py
- **Agent Assignments:** backend-architect for API-001/002, python-backend-engineer for entity routes

---

## Parallelization Groups

### Phase 4 (REST)
- **Group A**: API-001 + API-010 (parallel - router + health)
- **Group B**: API-002 (auth routes, depends on A)
- **Group C**: API-003-008 (all parallel - CRUD routes)
- **Group D**: API-009 (dashboard, depends on C)

### Phase 5 (WebSocket)
- **Group A**: WS-001 + WS-003 (manager + schema)
- **Group B**: WS-002 + WS-005 (endpoint + topics)
- **Group C**: WS-004 (broadcast integration)
- **Group D**: WS-006 (presence - optional)

---

## Quick Reference

### Environment Setup
```bash
cd services/api
export PYTHONPATH="$PWD"
uv run uvicorn app.main:app --reload --port 8000
```

### Key Files
- Schemas: services/api/app/schemas/
- Repositories: services/api/app/repositories/
- Services: services/api/app/services/
- Models: services/api/app/models/
- Core: services/api/app/core/ (config.py, database.py)
- API routes: services/api/app/api/ (to create)

### Dependencies
Config needs CORS_ORIGINS for CORS setup.

---

## API Endpoint Summary

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/auth/login` | No | Get JWT token |
| POST | `/auth/register` | Yes | Create user |
| POST | `/auth/refresh` | Yes | Refresh JWT |
| GET | `/auth/me` | Yes | Current user |
| CRUD | `/users/*` | Yes | User management |
| CRUD | `/persons/*` | Yes | Person management |
| CRUD | `/occasions/*` | Yes | Occasion management |
| CRUD | `/lists/*` | Yes | List management |
| CRUD | `/gifts/*` | Yes | Gift management |
| PUT | `/list-items/{id}/status` | Yes | Status transition |
| PUT | `/list-items/{id}/assign` | Yes | Assignment |
| GET | `/dashboard` | Yes | Dashboard data |
| GET | `/health` | No | Health check |
| WS | `/ws` | Yes | Real-time updates |

---

## Phase Scope (From Plan)

REST API: 25+ routes with CORS, error handling, OpenAPI, JWT auth.
WebSocket: Topic-based pub/sub for real-time collaboration on mutations.

**Success Metric:** FastAPI at localhost:8000, OpenAPI at /docs, <300ms response times.

---

**Last Updated**: 2025-11-26
