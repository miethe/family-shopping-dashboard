# Family Gifting Dashboard

**Stage**: Greenfield (PRD only)
**Stack**: Next.js + FastAPI + PostgreSQL + WebSockets
**Deploy**: K8s homelab
**Users**: 2-3 family members
**Focus**: Real-time collaboration, mobile-first, Apple ecosystem

---

## Prime Directives

| Directive | Implementation |
|-----------|---------------|
| **Delegate everything** | Opus reasons & orchestrates; subagents implement |
| Real-time first | WebSocket core, not optional |
| Mobile-first | iOS safe areas, 44px touch, responsive |
| Single-tenant | No RLS, no multi-user complexity |
| Token efficient | Symbol system, codebase-explorer |
| Rapid iteration | PRD → code → deploy fast |
| No over-architecture | YAGNI until proven |

### Opus Delegation Principle

**You are Opus. Tokens are expensive. You orchestrate; subagents execute.**

- ✗ **Never** write code directly (Read/Edit/Write for implementation)
- ✗ **Never** do token-heavy exploration yourself
- ✓ **Always** delegate implementation to specialized subagents
- ✓ **Always** use codebase-explorer for pattern discovery
- ✓ **Focus** on reasoning, analysis, planning, and orchestration

**Delegation Pattern**:

```text
1. Analyze task → identify what needs to change
2. Delegate exploration → codebase-explorer finds files/patterns
3. Delegate implementation → specialist agent writes code
4. Review results → verify correctness via agent reports
5. Commit → only direct action Opus takes
```

**When you catch yourself about to edit a file**: STOP. Delegate instead.

---

## Architecture

```text
Layer Stack:
Router (HTTP/WS) → Service (DTOs) → Repository (ORM) → DB

Tech:
- API: FastAPI + SQLAlchemy + Alembic + Postgres
- Web: Next.js (App Router) + React Query + Tailwind + Radix
- Real-time: WebSockets (server push)
- Deploy: Docker + K8s
```

**Critical Rules**:

- ✗ No DTO/ORM mixing
- ✗ No DB I/O in services
- ✓ Repository owns ALL queries
- ✓ Service returns DTOs only

**Domain-Specific Guides**:

- API patterns → `services/api/CLAUDE.md`
- Web patterns → `apps/web/CLAUDE.md`

---

## Project Structure

```text
family-gifting-dashboard/
├── services/api/           # FastAPI (see services/api/CLAUDE.md)
├── apps/web/               # Next.js (see apps/web/CLAUDE.md)
├── k8s/                    # K8s manifests
├── docs/
│   ├── project_plans/      # PRDs
│   └── architecture/       # ADRs
└── .claude/
    ├── progress/           # ONE per phase
    └── worknotes/          # Monthly logs only
```

---

## Real-Time Pattern (Simplified)

**WebSocket Scope**: Currently used **ONLY for Kanban board (list items)** real-time sync.

**Other Features**: Gifts, lists, persons, occasions use React Query's caching + staleTime + refetchOnWindowFocus (simplified for 2-3 user single-tenant app).

### WebSocket Event Structure (Kanban Only)

```typescript
interface WSEvent {
  topic: string;              // "list-items:family-123"
  event: "ADDED" | "UPDATED" | "DELETED" | "STATUS_CHANGED";
  data: { entity_id: string; payload: unknown; user_id: string };
}
```

### State Sync Patterns

**Pattern 1: React Query Only (Most Features)**

```text
1. Load: React Query useQuery (REST)
2. Cache: staleTime 5 minutes + refetchOnWindowFocus
3. Mutations: useMutation with optimistic updates
4. No WebSocket overhead
```

**Pattern 2: WebSocket + React Query (Kanban Board)**

```text
1. Load: React Query useQuery (REST)
2. Subscribe: WebSocket on mount for real-time updates
3. Event: Invalidate RQ cache → refetch
4. Unmount: Unsubscribe
5. Infrastructure: Reconnection handled automatically
```

---

## Mobile-First Constraints

| Constraint | Implementation |
|------------|---------------|
| Viewport | `width=device-width, initial-scale=1, maximum-scale=1` |
| Safe areas | `env(safe-area-inset-*)` |
| Touch | 44x44px minimum |
| 100vh issue | Use `100dvh` or `calc(100vh - 60px)` |
| PWA | manifest.json + icons (180x180, 512x512) |

---

## Error Envelope (Simplified)

```python
{
  "error": {
    "code": "VALIDATION_ERROR" | "NOT_FOUND" | "UNAUTHORIZED" | "INTERNAL_ERROR",
    "message": str,
    "trace_id": str
  }
}
```

---

## Deployment (K8s)

### Environment Variables

```bash
# API
DATABASE_URL, JWT_SECRET_KEY, API_PORT, CORS_ORIGINS

# Web
NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL
```

### Resources (2-3 users)

```yaml
api:  { mem: 256Mi, cpu: 100m }
web:  { mem: 128Mi, cpu: 50m }
```

### Health Checks

```python
@app.get("/health") → {"status": "healthy", "db": "connected"}
```

---

## Development Workflow

### Implementation Order

```text
1. Schema (Pydantic)
2. Model (SQLAlchemy) + Migration (Alembic)
3. Repository (DB methods)
4. Service (business logic, ORM→DTO)
5. Router (HTTP/WS)
6. Frontend (React Query + component)
7. Tests (unit + integration + E2E)
```

### DB Migrations

```bash
cd services/api
uv run alembic revision --autogenerate -m "description"
uv run alembic upgrade head
```

---

## Testing Strategy

```text
Pyramid (2-3 users = simplified):
- Unit (60%): Services, utilities
- Integration (30%): API endpoints, WebSocket
- E2E (10%): Critical flows
```

---

## Documentation Policy

**Reference**: `.claude/specs/doc-policy-spec.md`

**Allowed**:

- `/docs/` → User/dev/architecture docs (with frontmatter)
- `.claude/progress/[prd]/` → ONE per phase
- `.claude/worknotes/fixes/` → ONE per month
- `.claude/worknotes/observations/` → ONE per month

**Prohibited**:

- Debugging summaries → git commit
- Multiple progress per phase
- Daily/weekly reports
- Session notes as docs

---

## Agent Delegation

**Mandatory**: All implementation work MUST be delegated. Opus orchestrates only.

Below is a table of common tasks and which subagent/model to delegate to. This is a guideline and not all-encompassing; adapt as needed per task complexity, and use your updated context to find the best subagents per task.

### Exploration & Analysis

| Task | Agent | Model | Use When |
|------|-------|-------|----------|
| Find files/patterns | codebase-explorer | Haiku | Quick discovery |
| Deep analysis | explore | Haiku | Full context needed |
| Debug investigation | ultrathink-debugger | Sonnet | Complex bugs |

### Implementation

| Task | Agent | Model | Use When |
|------|-------|-------|----------|
| Backend Python | python-backend-engineer | Sonnet | FastAPI, SQLAlchemy, Alembic |
| Frontend React | ui-engineer | Sonnet | Components, hooks, pages |
| Full-stack TS | backend-typescript-architect | Sonnet | Node/TS backend |
| UI components | ui-engineer-enhanced | Sonnet | Design system, Radix |

### Documentation

| Task | Agent | Model | Use When |
|------|-------|-------|----------|
| Most docs (90%) | documentation-writer | Haiku | READMEs, API docs, guides |
| Complex docs | documentation-complex | Sonnet | Multi-system integration |
| AI artifacts | ai-artifacts-engineer | Sonnet | Skills, agents, commands |

### Example Delegation

```text
# Bug: API returns 422 error

1. DELEGATE exploration:
   Task("codebase-explorer", "Find ListItemCreate schema and where it's used")

2. DELEGATE fix:
   Task("python-backend-engineer", "Fix ListItemCreate schema - make list_id optional.
        File: services/api/app/schemas/list_item.py
        Change: list_id from required to optional (int | None = None)
        Reason: list_id comes from URL path, not request body")

3. COMMIT (Opus does this directly):
   git add ... && git commit
```

---

## Symbol System (Future)

```json
// ai/symbols.config.json (once code exists)
{
  "domains": {
    "api": { "source": "services/api/app", "include": ["**/*.py"] },
    "web": { "source": "apps/web", "include": ["**/*.ts", "**/*.tsx"] }
  }
}
```

**Usage**: `Task("codebase-explorer", "Find gift service")`

---

## Common Tasks

### Add API Endpoint

```text
1. DTO (schemas/) → 2. Repo (repositories/) → 3. Service (services/) → 4. Router (api/) → 5. Tests
```

### Add WebSocket Event

```text
1. Define event (schemas/ws.py) → 2. Broadcast (api/ws.py) → 3. Frontend hook → 4. Invalidate RQ cache
```

### Deploy

```bash
docker-compose up -d --build
```

---

## Git Workflow

```bash
git status && git diff
git add [files]
git commit -m "$(cat <<'EOF'
feat(api): description

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**Types**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
**Scope**: `api`, `web`, `common`, `ai`, `docs`, `package`

---

## References

### Core Docs

- North Star: `docs/project_plans/north-star/family-gifting-dash.md`
- V1 PRD: `docs/project_plans/family-dashboard-v1/family-dashboard-v1.md`

### Domain Guides

- API patterns: `services/api/CLAUDE.md`
- Web patterns: `apps/web/CLAUDE.md`

### Specs (Guidelines, not content)

- Fundamentals: `.claude/specs/claude-fundamentals-spec.md`
- Doc policy: `.claude/specs/doc-policy-spec.md`

---

## Project Context

**State**: Greenfield, no code yet

**Implications**:

- Establish patterns early
- Lock architecture decisions
- Keep simple
- Iterate fast
- No backwards compatibility

---

**Version**: 1.1
**Lines**: ~340
**Last Updated**: 2025-11-28
