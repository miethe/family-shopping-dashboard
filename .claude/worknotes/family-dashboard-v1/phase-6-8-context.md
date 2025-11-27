# Phase 6-8 Working Context

**Purpose:** Token-efficient context for resuming work across AI turns for Frontend phases

---

## Current State

**Phase**: 6 (Frontend Foundation)
**Branch**: feat/implementation-v1
**Last Commit**: 1f8d44a feat(api): Phase 4-5 complete
**Current Task**: Starting Phase 6 - Group A parallel tasks

---

## Backend API Reference

### Endpoints Available
- `/api/v1/auth/login` - JWT authentication
- `/api/v1/auth/register` - User registration
- `/api/v1/users/*` - User CRUD
- `/api/v1/persons/*` - Person CRUD
- `/api/v1/occasions/*` - Occasion CRUD
- `/api/v1/lists/*` - List CRUD
- `/api/v1/gifts/*` - Gift CRUD
- `/api/v1/list-items/*` - ListItem CRUD
- `/api/v1/dashboard/summary` - Dashboard aggregation
- `/ws` - WebSocket endpoint (token query param)

### WebSocket Topics
- `list:{list_id}` - List updates
- `list-item:{item_id}` - Item status changes
- `user:{user_id}` - User-specific events

---

## Key Decisions

- **Framework**: Next.js 15+ with App Router
- **State**: React Query (TanStack Query v5)
- **UI**: Tailwind + Radix primitives
- **Mobile-first**: iOS safe areas, 44px touch targets, 100dvh

---

## Agent Delegation Summary

### Phase 6 (Foundation)
- Group A (parallel): nextjs-expert, frontend-dev, react-nextjs-expert
- Group B (parallel after A): frontend-dev × 2
- Group C (parallel after B): frontend-architect, ui-engineer-enhanced, frontend-dev

### Phase 7 (Core)
- Group A: react-component-architect (Dashboard)
- Group B (parallel): frontend-dev × 3
- Group C (parallel): frontend-dev × 2
- Group D: react-component-architect (List Detail)

### Phase 8 (Advanced)
- Group A (parallel): frontend-dev × 3, ui-engineer-enhanced
- Group B (parallel): realtime-architect, ui-engineer-enhanced
- Group C: realtime-architect
- Group D: frontend-dev

---

## Important Learnings

*(Updated as we progress)*

---

## Quick Reference

### Environment Setup
```bash
# API (already running)
cd services/api && uv run uvicorn app.main:app --reload --port 8000

# Web
cd apps/web && pnpm dev  # Port 3000

# Tests
pnpm --filter "./apps/web" test
```

### API Base URL
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

---

**Last Updated**: 2025-11-27
