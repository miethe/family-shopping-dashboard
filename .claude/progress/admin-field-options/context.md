---
type: context
prd: "admin-field-options"
title: "Admin Field Options - Development Context"
status: "active"
created: "2025-12-20"
updated: "2025-12-20"

critical_notes_count: 1
implementation_decisions_count: 1
active_gotchas_count: 1
agent_contributors: ["lead-pm", "codebase-explorer"]

agents:
  - { agent: "codebase-explorer", note_count: 1, last_contribution: "2025-12-20" }
  - { agent: "lead-pm", note_count: 1, last_contribution: "2025-12-20" }
---

# Admin Field Options - Development Context

**Status**: Active Development
**Created**: 2025-12-20
**Last Updated**: 2025-12-20

> **Purpose**: Shared worknotes for all AI agents working on this PRD. Add observations, decisions, gotchas, and notes for future agents.

---

## Quick Reference

**Agent Notes**: 2 notes from 2 agents
**Critical Items**: 1 item requiring attention
**Last Contribution**: codebase-explorer on 2025-12-20

**Key Documents**:
- PRD: `docs/project_plans/PRDs/features/admin-field-options-v1.md`
- Implementation Plan: `docs/project_plans/implementation_plans/features/admin-field-options-v1.md`
- Phase 1-4 Details: `docs/project_plans/implementation_plans/features/admin-field-options-v1/phase-1-4-backend.md`
- Phase 5-8 Details: `docs/project_plans/implementation_plans/features/admin-field-options-v1/phase-5-8-frontend.md`
- Phase 9-10 Details: `docs/project_plans/implementation_plans/features/admin-field-options-v1/phase-9-10-testing.md`

---

## Implementation Decisions

### 2025-12-20 - lead-pm - Database-driven options over config files

**Decision**: Use PostgreSQL table (`field_options`) instead of JSON config files for dynamic options management.

**Rationale**: Database provides ACID transactions, proper indexing, audit trail (created_by/updated_by), and integrates with existing SQLAlchemy patterns. Config files would require custom file watching and cache invalidation.

**Location**: `services/api/app/models/field_option.py` (to be created)

**Impact**: Requires Alembic migrations, seeding script for existing hardcoded values, and validator refactoring.

---

## Gotchas & Observations

### 2025-12-20 - codebase-explorer - Hardcoded options are deeply nested

**What**: The 25+ option sets in `person.py` are used inside `advanced_interests` nested structure with multiple levels (food_and_drink, style_and_accessories, etc.)

**Why**: Person entity has complex preference modeling with grouped categories.

**Solution**: When querying options, use (entity='person', field_name='wine_types') pattern. The nested structure is a frontend/schema concern, not stored in field_options table.

**Affects**: TASK-1.4 (seeding migration), TASK-8.1 (Person validator refactor)

### 2025-12-20 - codebase-explorer - Enums vs Sets distinction

**What**: Gift/Occasion/List use Python Enum classes, while Person uses Python set constants. These are different patterns.

**Why**: Enums have workflow implications (e.g., Gift status progresses through states), while Person options are pure lookup values.

**Solution**: Treat both as field_options in DB. For enums, keep original Enum class as fallback during transition. Mark enum options as `is_system=true`.

**Affects**: TASK-8.2 (Gift/Occasion/List validator refactor)

---

## Integration Notes

### 2025-12-20 - codebase-explorer - Navigation structure

**From**: `apps/web/components/layout/nav-config.ts`
**To**: Admin page at `/admin`
**Method**: Add nav item to existing navItems array
**Notes**: Position at bottom before user profile area. Use Material Symbols "settings" icon. Existing pattern uses `{ href, label, icon }` structure.

---

## Performance Notes

### 2025-12-20 - lead-pm - Cache strategy for options

**Issue**: Querying DB for every option validation could slow form submissions.

**Impact**: Medium - affects every form save that validates options.

**Fix**:
1. React Query caches frontend lookups (staleTime: 5min)
2. Consider adding in-memory cache on backend service (load all options on startup, invalidate on CRUD)
3. Batch load options per entity, not per field

---

## Agent Handoff Notes

### 2025-12-20 - lead-pm -> backend-engineer

**Completed**: PRD, Implementation Plan, Progress Tracking artifacts

**Next**: Start Phase 1-4 backend implementation. Begin with TASK-1.1 (create migration).

**Watch Out For**:
- Seeding migration (TASK-1.4) extracts 100+ options from `person.py` lines 27-162
- User table uses UUID for id, not integer (FK constraint in field_options)
- Test with `uv run alembic upgrade head` before committing

---

## References

**Related Files**:
- Progress: `.claude/progress/admin-field-options/phase-1-4-progress.md`
- Progress: `.claude/progress/admin-field-options/phase-5-8-progress.md`
- Progress: `.claude/progress/admin-field-options/phase-9-10-progress.md`

**Current Hardcoded Values**:
- `services/api/app/schemas/person.py:27-162` - All Person option sets
- `services/api/app/models/gift.py` - GiftPriority, GiftStatus enums
- `services/api/app/models/occasion.py` - OccasionType enum
- `services/api/app/models/list.py` - ListType, ListVisibility enums

**Architecture Patterns**:
- Repository: `services/api/app/repositories/person.py`
- Service: `services/api/app/services/person.py`
- Router: `services/api/app/api/persons.py`
- Sidebar: `apps/web/components/layout/nav-config.ts`

---

## Template Examples

<details>
<summary>Example: Adding a new observation</summary>

### YYYY-MM-DD - [agent-name] - Brief title

**What**: [What happened in 1-2 sentences]

**Why**: [Root cause in 1 sentence]

**Solution**: [How to avoid/fix in 1-2 sentences]

**Affects**: [Which files/components/phases]

</details>

<details>
<summary>Example: Agent handoff</summary>

### YYYY-MM-DD - [from-agent] -> [to-agent]

**Completed**: [What was just finished]

**Next**: [What should be done next]

**Watch Out For**: [Any gotchas or warnings]

</details>
