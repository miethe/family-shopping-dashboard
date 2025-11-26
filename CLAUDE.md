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
| Real-time first | WebSocket core, not optional |
| Mobile-first | iOS safe areas, 44px touch, responsive |
| Single-tenant | No RLS, no multi-user complexity |
| Token efficient | Symbol system, codebase-explorer |
| Rapid iteration | PRD → code → deploy fast |
| No over-architecture | YAGNI until proven |

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

## Real-Time Pattern (Core Feature)

### WebSocket Event Structure

```typescript
interface WSEvent {
  topic: string;              // "gift-list:family-123"
  event: "ADDED" | "UPDATED" | "DELETED" | "STATUS_CHANGED";
  data: { entity_id: string; payload: unknown; user_id: string };
}
```

### State Sync

```text
1. Load: React Query (REST)
2. Subscribe: WebSocket on mount
3. Event: Invalidate RQ cache → refetch
4. Unmount: Unsubscribe
5. Fallback: Poll every 10s if WS down
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

| Task | Agent | Model | When |
|------|-------|-------|------|
| Find pattern | codebase-explorer | Haiku | Quick symbol query |
| Deep analysis | explore | Haiku | Full context needed |
| Most docs | documentation-writer | Haiku | 90% of docs |
| Complex docs | documentation-complex | Sonnet | Multi-system |
| AI artifacts | ai-artifacts-engineer | Sonnet | Skills, agents |

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

### Deploy to Homelab

```bash
docker build -t gifting-api:latest ./services/api
docker build -t gifting-web:latest ./apps/web
kubectl apply -f k8s/
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

---

## References

### Core Docs

- North Star: `docs/project_plans/north-star/family-gifting-dash.md`
- V1 PRD: `docs/project_plans/init/family-dashboard-v1.md`

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

**Version**: 1.0
**Lines**: ~280
**Last Updated**: 2025-11-26
