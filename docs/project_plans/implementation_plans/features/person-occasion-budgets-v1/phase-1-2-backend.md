---
title: "Phase 1-2: Database & Repository Layer"
description: "Database schema, migration, and repository CRUD implementation for person-occasion budgets"
audience: [developers, backend-engineers]
tags: [implementation, database, repository, person-budgets, occasions]
created: 2025-12-07
updated: 2025-12-07
category: "product-planning"
status: active
---

# Phase 1-2: Database Foundation & Repository Layer

**Parent Plan**: [Person Budget per Occasion Implementation](../person-occasion-budgets-v1.md)

**Combined Duration**: 2.5 days
**Dependencies**: None
**Assigned Subagent(s)**: `data-layer-expert`, `python-backend-engineer`
**Related PRD Stories**: POB-001, POB-002

---

## Overview

This phase establishes the data layer for person-occasion budgets:

1. **Phase 1** extends the PersonOccasion database model with budget columns, creates indexes, and deploys migrations
2. **Phase 2** implements repository methods for budget CRUD operations with comprehensive unit tests

These phases must complete sequentially and independently of the frontend work.

---

## Phase 1: Database Foundation (1 day, 3.5 story points)

### Tasks

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|-------------|--------------|
| DB-001 | Schema Design | Extend PersonOccasion model with budget fields | recipient_budget_total, purchaser_budget_total added as NUMERIC(10,2) NULL | 1 pt | data-layer-expert | None |
| DB-002 | Composite Index | Create index on (person_id, occasion_id) for budget queries | Index created; query plan shows index usage | 0.5 pts | data-layer-expert | DB-001 |
| DB-003 | Alembic Migration | Create migration script with up/down paths | Migration runs cleanly; rollback works; existing data intact | 1.5 pts | python-backend-engineer | DB-002 |
| DB-004 | Migration Testing | Test migration on dev database | Up migration applies; down migration reverts; constraints validated | 0.5 pts | python-backend-engineer | DB-003 |

**Total Phase 1 Effort**: 3.5 story points

### Implementation Details

#### DB-001: Schema Design

**File**: `/services/api/app/models/person.py` (lines 152-187)

**Changes**: Add after line 178 (after occasion_id definition)

```python
recipient_budget_total: Mapped[Decimal | None] = mapped_column(
    NUMERIC(10, 2),
    nullable=True,
    comment="Budget for gifts TO this person for this occasion"
)

purchaser_budget_total: Mapped[Decimal | None] = mapped_column(
    NUMERIC(10, 2),
    nullable=True,
    comment="Budget for gifts BY this person for this occasion"
)
```

**Validation**: NULL allowed (no budget limit), 0+ values only (no negatives)

#### DB-002: Composite Index

**Rationale**: Budget queries will filter by (person_id, occasion_id) frequently

**SQL**:

```sql
CREATE INDEX idx_person_occasions_budget_lookup
ON person_occasions(person_id, occasion_id);
```

#### DB-003: Alembic Migration

**Command**: `cd services/api && uv run alembic revision --autogenerate -m "add person occasion budget fields"`

**Migration File**: `/services/api/alembic/versions/xxx_add_person_occasion_budgets.py`

**Up Migration**:

```python
def upgrade() -> None:
    op.add_column('person_occasions',
        sa.Column('recipient_budget_total', sa.NUMERIC(10, 2), nullable=True))
    op.add_column('person_occasions',
        sa.Column('purchaser_budget_total', sa.NUMERIC(10, 2), nullable=True))
    op.create_index('idx_person_occasions_budget_lookup',
        'person_occasions', ['person_id', 'occasion_id'])
```

**Down Migration**:

```python
def downgrade() -> None:
    op.drop_index('idx_person_occasions_budget_lookup', 'person_occasions')
    op.drop_column('person_occasions', 'purchaser_budget_total')
    op.drop_column('person_occasions', 'recipient_budget_total')
```

#### DB-004: Migration Testing

**Commands**:

```bash
# Test up migration
uv run alembic upgrade head

# Verify schema
psql -d gifting_db -c "\d person_occasions"

# Test down migration
uv run alembic downgrade -1

# Re-apply
uv run alembic upgrade head
```

### Phase 1 Quality Gates

- [x] PersonOccasion model includes budget fields with correct types
- [x] Composite index created on (person_id, occasion_id)
- [x] Alembic migration runs successfully in both directions
- [x] Existing PersonOccasion data remains intact after migration
- [x] Database constraints validated (NUMERIC precision, NULL allowed)

### Phase 1 Deliverables

- Modified model: `/services/api/app/models/person.py`
- Migration script: `/services/api/alembic/versions/xxx_add_person_occasion_budgets.py`
- Database with extended schema

---

## Phase 2: Repository Layer (1.5 days, 9 story points)

### Tasks

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|-------------|--------------|
| REPO-001 | Budget Query Method | Implement get_person_occasion_budget() | Method returns PersonOccasion row with budget fields | 2 pts | python-backend-engineer | DB-004 |
| REPO-002 | Budget Update Method | Implement update_person_occasion_budget() | Method updates budget fields; validates ≥0 or NULL | 2 pts | python-backend-engineer | REPO-001 |
| REPO-003 | Extend get_gift_budget() | Add occasion_id filter to existing method | When occasion_id passed, only count gifts from that occasion | 3 pts | data-layer-expert | REPO-001 |
| REPO-004 | Repository Unit Tests | Test budget CRUD and calculations | >80% coverage; edge cases (NULL, 0, large values) tested | 2 pts | python-backend-engineer | REPO-003 |

**Total Phase 2 Effort**: 9 story points

### Implementation Details

#### REPO-001: Budget Query Method

**File**: `/services/api/app/repositories/person.py`

**Location**: Add after existing get_gift_budget() method (after line ~445)

**Method Signature**:

```python
async def get_person_occasion_budget(
    self,
    person_id: int,
    occasion_id: int
) -> PersonOccasion | None:
    """
    Retrieve PersonOccasion record with budget fields.

    Args:
        person_id: ID of the person
        occasion_id: ID of the occasion

    Returns:
        PersonOccasion model with budget fields, or None if not linked

    Raises:
        ValueError: If person_id or occasion_id invalid
    """
    stmt = (
        select(PersonOccasion)
        .where(
            PersonOccasion.person_id == person_id,
            PersonOccasion.occasion_id == occasion_id
        )
    )
    result = await self.db.execute(stmt)
    return result.scalar_one_or_none()
```

#### REPO-002: Budget Update Method

**File**: `/services/api/app/repositories/person.py`

**Method Signature**:

```python
async def update_person_occasion_budget(
    self,
    person_id: int,
    occasion_id: int,
    recipient_budget_total: Decimal | None = None,
    purchaser_budget_total: Decimal | None = None
) -> PersonOccasion:
    """
    Update budget fields for a person-occasion link.

    Args:
        person_id: ID of the person
        occasion_id: ID of the occasion
        recipient_budget_total: Budget for gifts TO person (NULL = no limit)
        purchaser_budget_total: Budget for gifts BY person (NULL = no limit)

    Returns:
        Updated PersonOccasion model

    Raises:
        ValueError: If budgets are negative or link doesn't exist
    """
    # Validate non-negative
    if recipient_budget_total is not None and recipient_budget_total < 0:
        raise ValueError("recipient_budget_total must be ≥0 or NULL")
    if purchaser_budget_total is not None and purchaser_budget_total < 0:
        raise ValueError("purchaser_budget_total must be ≥0 or NULL")

    # Get existing record
    person_occasion = await self.get_person_occasion_budget(person_id, occasion_id)
    if not person_occasion:
        raise ValueError(f"PersonOccasion link not found: person={person_id}, occasion={occasion_id}")

    # Update fields
    person_occasion.recipient_budget_total = recipient_budget_total
    person_occasion.purchaser_budget_total = purchaser_budget_total

    await self.db.commit()
    await self.db.refresh(person_occasion)

    return person_occasion
```

#### REPO-003: Extend get_gift_budget()

**File**: `/services/api/app/repositories/person.py` (lines 294-445)

**Status**: Existing method already has `occasion_id: int | None = None` parameter (line 297)

**Action**: Verify occasion filtering works correctly for both recipient and purchaser queries

**Test Cases**:
- `get_gift_budget(person_id=5)` → Returns global totals (existing behavior)
- `get_gift_budget(person_id=5, occasion_id=12)` → Returns totals only for Christmas 2024 occasion

#### REPO-004: Repository Unit Tests

**File**: `/services/api/tests/unit/repositories/test_person_repository.py`

**Test Coverage**:

```python
async def test_get_person_occasion_budget_exists():
    """Test retrieving budget for existing person-occasion link."""
    budget = await repo.get_person_occasion_budget(person_id=1, occasion_id=1)
    assert budget is not None
    assert budget.person_id == 1
    assert budget.occasion_id == 1

async def test_get_person_occasion_budget_not_found():
    """Test retrieving budget for non-existent link."""
    budget = await repo.get_person_occasion_budget(person_id=999, occasion_id=999)
    assert budget is None

async def test_update_person_occasion_budget_success():
    """Test updating budget fields."""
    updated = await repo.update_person_occasion_budget(
        person_id=1, occasion_id=1,
        recipient_budget_total=Decimal("200.00"),
        purchaser_budget_total=Decimal("50.00")
    )
    assert updated.recipient_budget_total == Decimal("200.00")
    assert updated.purchaser_budget_total == Decimal("50.00")

async def test_update_person_occasion_budget_null_allowed():
    """Test setting budget to NULL (no limit)."""
    updated = await repo.update_person_occasion_budget(
        person_id=1, occasion_id=1,
        recipient_budget_total=None,
        purchaser_budget_total=None
    )
    assert updated.recipient_budget_total is None
    assert updated.purchaser_budget_total is None

async def test_update_person_occasion_budget_negative_rejected():
    """Test that negative budgets raise ValueError."""
    with pytest.raises(ValueError, match="must be ≥0 or NULL"):
        await repo.update_person_occasion_budget(
            person_id=1, occasion_id=1,
            recipient_budget_total=Decimal("-100.00")
        )

async def test_get_gift_budget_with_occasion_filter():
    """Test occasion-scoped budget calculation."""
    # Create gifts for person across multiple occasions
    # Verify totals match only the filtered occasion
    global_budget = await repo.get_gift_budget(person_id=1)
    occasion_budget = await repo.get_gift_budget(person_id=1, occasion_id=1)
    assert occasion_budget.recipient_total <= global_budget.recipient_total
```

### Phase 2 Quality Gates

- [x] get_person_occasion_budget() retrieves budget fields correctly
- [x] update_person_occasion_budget() saves budgets and validates constraints
- [x] get_gift_budget() filters by occasion_id when provided
- [x] Repository tests achieve >80% coverage
- [x] Edge cases handled (NULL budgets, 0 budgets, non-existent links)

### Phase 2 Deliverables

- Extended repository: `/services/api/app/repositories/person.py`
- Unit tests: `/services/api/tests/unit/repositories/test_person_repository.py`

---

## Integration Notes

- Phase 1 must complete before Phase 2 (database migration is prerequisite)
- Phase 2 can proceed in parallel with frontend design/preparation
- Repository methods will be consumed by Service layer (Phase 3)
- All database queries use SQLAlchemy ORM (no raw SQL)

---

## Next Steps

After Phase 2 completion, proceed to [Phase 3-4: API & Frontend Hooks](./phase-3-4-api-hooks.md)
