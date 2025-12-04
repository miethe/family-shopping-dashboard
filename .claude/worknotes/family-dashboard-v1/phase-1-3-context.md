---
type: context
prd: "family-dashboard-v1"
phases: [1, 2, 3]
title: "Backend Foundation Context"
created: 2025-11-26
updated: 2025-11-26
---

# Phase 1-3 Working Context

**Purpose:** Token-efficient context for resuming work across AI turns

---

## Current State

**Branch:** main
**Last Commit:** TBD (greenfield)
**Current Task:** DB-001 - Project Setup

---

## Key Decisions

- **Architecture:** Layered (router -> service -> repository -> DB)
- **Patterns:** Cursor pagination, error envelopes, DTOs separate from ORM
- **DB:** PostgreSQL + SQLAlchemy 2.0 + Alembic

---

## Agent Delegations (from lead-architect review)

### Phase 1 Changes
- DB-001: python-backend-engineer (not data-layer-expert) - scaffolding is general Python

### Phase 2 Changes
- REPO-001: data-layer-expert - cursor pagination expertise
- REPO-005: data-layer-expert - complex filter optimization

### Phase 3 Changes
- SVC-001: data-layer-expert - Pydantic DTOs are data modeling
- SVC-002: backend-architect - security-critical auth design
- SVC-007: python-pro - URL parsing error handling, async
- SVC-008: python-pro - state machine design pattern

---

## Important Learnings

*(To be updated as implementation progresses)*

---

## Quick Reference

### Environment Setup
```bash
# API (once created)
cd services/api
uv run alembic upgrade head
uv run python main.py

# Tests
uv run pytest
```

### Key Files (to create)
```
services/api/
├── app/
│   ├── models/       # SQLAlchemy ORM
│   ├── repositories/ # DB operations only
│   ├── services/     # Business logic + DTOs
│   ├── schemas/      # Pydantic DTOs
│   └── core/         # Config, database, security
├── alembic/          # Migrations
├── pyproject.toml
└── main.py
```

---

## Phase Scope Summary

**Phase 1**: 8 entity models (User, Person, Occasion, List, Gift, ListItem, Tag, Comment) with Alembic migration
**Phase 2**: Generic BaseRepository with cursor pagination + 8 entity repositories
**Phase 3**: Pydantic DTOs + Auth Service (JWT) + entity services with business logic

**Success Metric:** All layers complete, ready for API layer (Phase 4)

---

## Parallelization Groups

### Phase 1
- A: DB-001 (first)
- B: DB-002,003,004,005,006 (parallel)
- C: DB-007,008,009 (parallel, after B)

### Phase 2
- A: REPO-001 (first)
- B: REPO-002-009 (all parallel)

### Phase 3
- A: SVC-001 (DTOs first)
- B: SVC-002 (Auth)
- C: SVC-003 (User - depends on auth)
- D: SVC-004-009 (parallel)
- E: SVC-010 (Dashboard - aggregates all)
