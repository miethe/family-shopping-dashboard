---
# === PROGRESS TRACKING: GIFTS ACTION BAR V1 - PHASE 1 ===
# Backend migration and schema updates for from_santa field

# Metadata
type: progress
prd: "gifts-action-bar-v1"
phase: 1
title: "Backend Migration & Schemas"
status: "planning"
started: null
completed: null

# Progress Metrics
overall_progress: 0
completion_estimate: "on-track"

# Task Counts
total_tasks: 5
completed_tasks: 0
in_progress_tasks: 0
blocked_tasks: 0
at_risk_tasks: 0

# Ownership
owners: ["python-backend-engineer"]
contributors: ["data-layer-expert"]

# === ORCHESTRATION QUICK REFERENCE ===
tasks:
  - id: "TASK-1.1"
    description: "Create Alembic migration for from_santa field"
    status: "pending"
    assigned_to: ["data-layer-expert", "python-backend-engineer"]
    dependencies: []
    estimated_effort: "1pt"
    priority: "high"

  - id: "TASK-1.2"
    description: "Update Gift SQLAlchemy model with from_santa field"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-1.1"]
    estimated_effort: "1pt"
    priority: "high"

  - id: "TASK-1.3"
    description: "Update GiftCreate schema with from_santa field"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-1.2"]
    estimated_effort: "1pt"
    priority: "medium"

  - id: "TASK-1.4"
    description: "Update GiftUpdate schema with from_santa field"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-1.2"]
    estimated_effort: "1pt"
    priority: "medium"

  - id: "TASK-1.5"
    description: "Update GiftResponse schema with from_santa field"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-1.2"]
    estimated_effort: "1pt"
    priority: "medium"

# Parallelization Strategy
parallelization:
  batch_1: ["TASK-1.1"]
  batch_2: ["TASK-1.2"]
  batch_3: ["TASK-1.3", "TASK-1.4", "TASK-1.5"]
  critical_path: ["TASK-1.1", "TASK-1.2", "TASK-1.3"]
  estimated_total_time: "2 days"

# Blockers
blockers: []

# Success Criteria
success_criteria:
  - { id: "SC-1.1", description: "Alembic migration runs cleanly", status: "pending" }
  - { id: "SC-1.2", description: "Gift model includes from_santa field", status: "pending" }
  - { id: "SC-1.3", description: "All schemas validate correctly", status: "pending" }
  - { id: "SC-1.4", description: "POST/PATCH endpoints work with from_santa", status: "pending" }
  - { id: "SC-1.5", description: "No breaking API changes", status: "pending" }

# Files Modified
files_modified:
  - "services/api/alembic/versions/*_add_gift_from_santa.py"
  - "services/api/app/models/gift.py"
  - "services/api/app/schemas/gift.py"
---

# Gifts Action Bar v1 - Phase 1: Backend Migration & Schemas

**Phase**: 1 of 3 (grouped phases)
**Status**: Planning (0% complete)
**Duration**: 2 days (Days 1-2)
**Story Points**: 5 pts
**Owner**: python-backend-engineer
**Contributors**: data-layer-expert

---

## Orchestration Quick Reference

> **For Orchestration Agents**: Use this section to delegate tasks without reading the full file.

### Parallelization Strategy

**Batch 1** (Foundation):
- TASK-1.1 → `data-layer-expert` (1pt) - Create Alembic migration

**Batch 2** (Model - Depends on Batch 1):
- TASK-1.2 → `python-backend-engineer` (1pt) - Update Gift model

**Batch 3** (Schemas - Can run in parallel after TASK-1.2):
- TASK-1.3 → `python-backend-engineer` (1pt) - GiftCreate schema
- TASK-1.4 → `python-backend-engineer` (1pt) - GiftUpdate schema
- TASK-1.5 → `python-backend-engineer` (1pt) - GiftResponse schema

**Critical Path**: TASK-1.1 → TASK-1.2 → TASK-1.3

### Task Delegation Commands

```
# Batch 1 - Foundation
Task("python-backend-engineer", "TASK-1.1: Create Alembic migration for from_santa field.
File: services/api/alembic/versions/*_add_gift_from_santa.py
Add 'from_santa BOOLEAN NOT NULL DEFAULT FALSE' to gifts table.
Include upgrade() and downgrade() functions.
See: docs/project_plans/implementation_plans/features/gifts-action-bar-v1/phase-1-backend.md")

# Batch 2 - Model (after TASK-1.1)
Task("python-backend-engineer", "TASK-1.2: Update Gift SQLAlchemy model with from_santa field.
File: services/api/app/models/gift.py
Add: from_santa: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
See: docs/project_plans/implementation_plans/features/gifts-action-bar-v1/phase-1-backend.md")

# Batch 3 - Schemas (all parallel, after TASK-1.2)
Task("python-backend-engineer", "TASK-1.3: Update GiftCreate schema.
File: services/api/app/schemas/gift.py
Add: from_santa: bool = Field(default=False, description='Mark gift as from Santa')")

Task("python-backend-engineer", "TASK-1.4: Update GiftUpdate schema.
File: services/api/app/schemas/gift.py
Add: from_santa: bool | None = None")

Task("python-backend-engineer", "TASK-1.5: Update GiftResponse schema.
File: services/api/app/schemas/gift.py
Add: from_santa: bool = Field(default=False)")
```

---

## Overview

Phase 1 prepares the backend to support the "From Santa" feature by adding a new database column, updating the ORM model, and expanding API schemas.

**Why This Phase**: Backend foundation must exist before frontend can display/toggle from_santa field.

**Scope**:
- IN: Migration, model update, schema updates
- OUT: API endpoint changes (existing PATCH auto-supports new field)

---

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-1.1 | Alembic migration runs cleanly | Pending |
| SC-1.2 | Gift model includes from_santa field | Pending |
| SC-1.3 | All schemas validate correctly | Pending |
| SC-1.4 | POST/PATCH endpoints work with from_santa | Pending |
| SC-1.5 | No breaking API changes | Pending |

---

## Tasks

| ID | Task | Status | Agent | Dependencies | Est | Notes |
|----|------|--------|-------|--------------|-----|-------|
| TASK-1.1 | Create Alembic migration | Pending | data-layer-expert | None | 1pt | Foundation |
| TASK-1.2 | Update Gift model | Pending | python-backend-engineer | TASK-1.1 | 1pt | Sequential |
| TASK-1.3 | Update GiftCreate schema | Pending | python-backend-engineer | TASK-1.2 | 1pt | Can parallel |
| TASK-1.4 | Update GiftUpdate schema | Pending | python-backend-engineer | TASK-1.2 | 1pt | Can parallel |
| TASK-1.5 | Update GiftResponse schema | Pending | python-backend-engineer | TASK-1.2 | 1pt | Can parallel |

---

## Architecture Context

### Key Files
- `services/api/app/models/gift.py` - Gift SQLAlchemy model
- `services/api/app/schemas/gift.py` - Pydantic schemas (Create, Update, Response)
- `services/api/alembic/versions/` - Migration files

### Reference Patterns
- Existing boolean fields in Gift model (e.g., any existing flags)
- GiftStatus enum pattern for consistency

---

## Testing Strategy

| Test Type | Scope | Status |
|-----------|-------|--------|
| Migration | Run upgrade/downgrade | Pending |
| Model | Create/read gift with from_santa | Pending |
| API | POST/PATCH with from_santa | Pending |

---

## Next Session Agenda

1. [ ] Run migration in dev environment
2. [ ] Test POST /gifts with from_santa
3. [ ] Test PATCH /gifts/{id} with from_santa
4. [ ] Verify backward compatibility

---

## Session Notes

*(Session notes will be added as work progresses)*
