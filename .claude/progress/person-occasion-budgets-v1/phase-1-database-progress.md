---
type: progress
prd: person-occasion-budgets-v1
phase: 1
phase_name: Database Schema & Migration
status: not_started
progress: 0
total_tasks: 3
completed_tasks: 0
story_points: 3.5
estimated_duration: 0.5 days
tasks:
  - id: DB-001
    title: Extend PersonOccasion model with budget fields
    status: pending
    assigned_to: data-layer-expert
    dependencies: []
    story_points: 1
    files:
      - services/api/app/models/person_occasion.py
    description: Add budget_amount (Numeric), budget_spent (Numeric, default 0), budget_currency (String, default USD), budget_notes (Text, nullable)
  - id: DB-002
    title: Create Alembic migration
    status: pending
    assigned_to: data-layer-expert
    dependencies: [DB-001]
    story_points: 1.5
    files:
      - services/api/alembic/versions/
    description: Generate migration for PersonOccasion budget fields with proper defaults and nullable constraints
  - id: DB-003
    title: Create composite index
    status: pending
    assigned_to: data-layer-expert
    dependencies: [DB-002]
    story_points: 1
    files:
      - services/api/alembic/versions/
    description: Add composite index on (person_id, occasion_id, budget_amount) for efficient budget queries
---

# Phase 1: Database Schema & Migration

**Status**: Not Started
**Last Updated**: 2025-12-07
**Completion**: 0%
**Story Points**: 3.5 / 3.5 remaining
**Estimated Duration**: 0.5 days

## Overview

Extend the PersonOccasion model to support per-person, per-occasion budgets. This foundation enables users to set different budget amounts for each person within each occasion (e.g., $100 for Mom at Christmas, $50 for Mom at Birthday).

## Parallelization Strategy

### Batch 1: Schema Design (Sequential - 1 story point)
- DB-001: Extend PersonOccasion model

### Batch 2: Migration & Index (Sequential - 2.5 story points)
- DB-002: Create migration (depends on DB-001)
- DB-003: Create composite index (depends on DB-002)

**Total Duration**: 0.5 days (sequential due to dependencies)

## Tasks

### DB-001: Extend PersonOccasion Model ⏳ Pending
**Story Points**: 1
**Assigned To**: data-layer-expert
**Dependencies**: None
**Files**: `services/api/app/models/person_occasion.py`

**Description**:
Add budget tracking fields to PersonOccasion model:
- `budget_amount`: Numeric(10, 2), nullable=True (user-set budget)
- `budget_spent`: Numeric(10, 2), default=0, nullable=False (calculated from gifts)
- `budget_currency`: String(3), default='USD', nullable=False
- `budget_notes`: Text, nullable=True (optional notes)

**Acceptance Criteria**:
- [ ] All fields added with correct types and constraints
- [ ] Defaults properly set
- [ ] Model passes SQLAlchemy validation

---

### DB-002: Create Alembic Migration ⏳ Pending
**Story Points**: 1.5
**Assigned To**: data-layer-expert
**Dependencies**: DB-001
**Files**: `services/api/alembic/versions/`

**Description**:
Generate and verify Alembic migration for PersonOccasion budget fields.

**Acceptance Criteria**:
- [ ] Migration file generated with descriptive name
- [ ] upgrade() adds all four columns with correct types
- [ ] downgrade() removes columns safely
- [ ] Migration runs successfully on empty DB
- [ ] Migration runs successfully on DB with existing PersonOccasion records

---

### DB-003: Create Composite Index ⏳ Pending
**Story Points**: 1
**Assigned To**: data-layer-expert
**Dependencies**: DB-002
**Files**: `services/api/alembic/versions/`

**Description**:
Create composite index on (person_id, occasion_id, budget_amount) to optimize budget queries.

**Acceptance Criteria**:
- [ ] Index created in same migration or separate migration
- [ ] Index name follows convention: idx_person_occasion_budget
- [ ] Index improves query performance for budget lookups
- [ ] Index doesn't significantly impact write performance

---

## Quick Reference

### Pre-built Task Commands

```python
# DB-001: Extend PersonOccasion model
Task("data-layer-expert", """
Extend PersonOccasion model with budget fields.

File: services/api/app/models/person_occasion.py

Add these fields to PersonOccasion class:
- budget_amount: Numeric(10, 2), nullable=True
- budget_spent: Numeric(10, 2), default=0, nullable=False
- budget_currency: String(3), default='USD', nullable=False
- budget_notes: Text, nullable=True

Ensure proper SQLAlchemy Column definitions with defaults.
""")

# DB-002: Create Alembic migration
Task("data-layer-expert", """
Create Alembic migration for PersonOccasion budget fields.

Navigate to: services/api
Run: uv run alembic revision --autogenerate -m "Add budget fields to PersonOccasion"

Verify migration includes:
- budget_amount column (Numeric 10,2, nullable)
- budget_spent column (Numeric 10,2, default 0, not null)
- budget_currency column (String 3, default 'USD', not null)
- budget_notes column (Text, nullable)

Test migration:
- uv run alembic upgrade head
- uv run alembic downgrade -1
- uv run alembic upgrade head
""")

# DB-003: Create composite index
Task("data-layer-expert", """
Create composite index for PersonOccasion budget queries.

Option 1: Add to existing migration (if not yet deployed)
Option 2: Create new migration

Index specification:
- Name: idx_person_occasion_budget
- Columns: (person_id, occasion_id, budget_amount)
- Type: Standard B-tree index

Verify with:
- Check migration file includes create_index operation
- Run migration and verify index exists in DB
""")
```

### File Locations

```
services/api/
├── app/
│   └── models/
│       └── person_occasion.py          # DB-001
└── alembic/
    └── versions/
        └── <timestamp>_add_budget_fields_to_person_occasion.py  # DB-002, DB-003
```

### Testing Commands

```bash
# Navigate to API directory
cd /Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api

# Generate migration
uv run alembic revision --autogenerate -m "Add budget fields to PersonOccasion"

# Apply migration
uv run alembic upgrade head

# Verify migration
uv run alembic current
uv run alembic history

# Rollback if needed
uv run alembic downgrade -1

# Re-apply
uv run alembic upgrade head

# Check database (if needed)
# psql -d family_gifting_dev -c "\d person_occasions"
```

## Context for AI Agents

### Architecture Context

This phase establishes the database foundation for per-person, per-occasion budgets. The PersonOccasion join table already exists (linking Person and Occasion), so we're extending it with budget tracking capabilities.

### Key Decisions

1. **Storage Location**: Budget fields go on PersonOccasion (not Person or Occasion) because budgets are specific to person-occasion pairs
2. **Calculated Field**: budget_spent is stored (not calculated on-the-fly) for performance
3. **Currency Support**: budget_currency field enables future multi-currency support
4. **Nullable Budget**: budget_amount is nullable - not all person-occasion pairs require budgets

### Integration Points

- **Gift Model**: GiftPerson.amount feeds into PersonOccasion.budget_spent calculation
- **Repository Layer**: PersonOccasionRepository will need new methods (Phase 2)
- **Service Layer**: PersonService will expose budget operations (Phase 3)

### Performance Considerations

- Composite index optimizes: `WHERE person_id = ? AND occasion_id = ?`
- Index also supports: `WHERE person_id = ? AND occasion_id = ? AND budget_amount IS NOT NULL`
- Expected query pattern: "Get all budgets for person X across occasions" and "Get all budgets for occasion Y"

### Migration Safety

- All new columns are nullable or have defaults → safe for existing data
- No data transformation needed in migration
- Rollback is safe (dropping columns doesn't break existing functionality)

## Next Steps

After Phase 1 completion:
1. Proceed to Phase 2: Repository Layer (REPO-001 through REPO-004)
2. Repository will implement CRUD operations for budget fields
3. Service layer will consume repository methods

## References

- **PRD**: `/docs/project_plans/PRDs/features/person-occasion-budgets-v1.md`
- **Implementation Plan**: `/docs/project_plans/implementation_plans/features/person-occasion-budgets-v1.md`
- **Related Models**: `services/api/app/models/person_occasion.py`, `services/api/app/models/gift_person.py`
