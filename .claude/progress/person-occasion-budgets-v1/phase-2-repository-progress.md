---
type: progress
prd: person-occasion-budgets-v1
phase: 2
phase_name: Repository Layer
status: not_started
progress: 0
total_tasks: 4
completed_tasks: 0
story_points: 9
estimated_duration: 1.5 days
tasks:
  - id: REPO-001
    title: Add get_person_occasion_budget() method
    status: pending
    assigned_to: python-backend-engineer
    dependencies: [DB-003]
    story_points: 2
    files:
      - services/api/app/repositories/person_occasion_repository.py
    description: Retrieve budget fields for specific person-occasion pair
  - id: REPO-002
    title: Add update_person_occasion_budget() method
    status: pending
    assigned_to: python-backend-engineer
    dependencies: [DB-003]
    story_points: 3
    files:
      - services/api/app/repositories/person_occasion_repository.py
    description: Update budget_amount, budget_currency, budget_notes with validation
  - id: REPO-003
    title: Extend get_gift_budget() with occasion_id filter
    status: pending
    assigned_to: python-backend-engineer
    dependencies: [DB-003]
    story_points: 2
    files:
      - services/api/app/repositories/gift_repository.py
    description: Filter gift budget calculations by occasion_id to support per-occasion spending
  - id: REPO-004
    title: Write repository unit tests
    status: pending
    assigned_to: python-backend-engineer
    dependencies: [REPO-001, REPO-002, REPO-003]
    story_points: 2
    files:
      - services/api/tests/unit/repositories/test_person_occasion_repository.py
      - services/api/tests/unit/repositories/test_gift_repository.py
    description: Test all new repository methods with edge cases
---

# Phase 2: Repository Layer

**Status**: Not Started
**Last Updated**: 2025-12-07
**Completion**: 0%
**Story Points**: 9 / 9 remaining
**Estimated Duration**: 1.5 days

## Overview

Implement repository methods for budget CRUD operations. All database access for person-occasion budgets must go through the repository layer, following the project's layered architecture (Service → Repository → ORM).

## Parallelization Strategy

### Batch 1: Repository Methods (Parallel - 7 story points, 1 day)
Can run in parallel after Phase 1 completion:
- REPO-001: get_person_occasion_budget() (2 pts)
- REPO-002: update_person_occasion_budget() (3 pts)
- REPO-003: Extend get_gift_budget() with occasion filter (2 pts)

### Batch 2: Testing (Sequential - 2 story points, 0.5 days)
- REPO-004: Unit tests (depends on REPO-001, REPO-002, REPO-003)

**Total Duration**: 1.5 days (some parallelization possible)

## Tasks

### REPO-001: Add get_person_occasion_budget() Method ⏳ Pending
**Story Points**: 2
**Assigned To**: python-backend-engineer
**Dependencies**: DB-003
**Files**: `services/api/app/repositories/person_occasion_repository.py`

**Description**:
Add repository method to retrieve budget information for a specific person-occasion pair.

**Method Signature**:
```python
async def get_person_occasion_budget(
    self,
    person_id: int,
    occasion_id: int,
    db: AsyncSession
) -> PersonOccasion | None:
    """Get PersonOccasion with budget fields for specific person-occasion pair."""
```

**Acceptance Criteria**:
- [ ] Method queries PersonOccasion by person_id and occasion_id
- [ ] Returns PersonOccasion model with all budget fields
- [ ] Returns None if person-occasion pair doesn't exist
- [ ] Uses async/await properly
- [ ] Follows repository pattern (no business logic)

---

### REPO-002: Add update_person_occasion_budget() Method ⏳ Pending
**Story Points**: 3
**Assigned To**: python-backend-engineer
**Dependencies**: DB-003
**Files**: `services/api/app/repositories/person_occasion_repository.py`

**Description**:
Add repository method to update budget fields for a person-occasion pair.

**Method Signature**:
```python
async def update_person_occasion_budget(
    self,
    person_id: int,
    occasion_id: int,
    budget_amount: Decimal | None = None,
    budget_currency: str | None = None,
    budget_notes: str | None = None,
    db: AsyncSession
) -> PersonOccasion:
    """Update budget fields for person-occasion pair."""
```

**Acceptance Criteria**:
- [ ] Method updates only provided fields (partial update support)
- [ ] Creates PersonOccasion if it doesn't exist (upsert behavior)
- [ ] Validates budget_amount >= 0 if provided
- [ ] Validates budget_currency is 3-letter code if provided
- [ ] Returns updated PersonOccasion model
- [ ] Commits transaction
- [ ] Raises appropriate exceptions for invalid data

---

### REPO-003: Extend get_gift_budget() with Occasion Filter ⏳ Pending
**Story Points**: 2
**Assigned To**: python-backend-engineer
**Dependencies**: DB-003
**Files**: `services/api/app/repositories/gift_repository.py`

**Description**:
Enhance existing get_gift_budget() method to support filtering by occasion_id, enabling per-occasion spending calculations.

**Current Signature** (estimated):
```python
async def get_gift_budget(
    self,
    person_id: int,
    db: AsyncSession
) -> Decimal:
```

**New Signature**:
```python
async def get_gift_budget(
    self,
    person_id: int,
    db: AsyncSession,
    occasion_id: int | None = None
) -> Decimal:
    """Calculate total spent on gifts for person, optionally filtered by occasion."""
```

**Acceptance Criteria**:
- [ ] Adds optional occasion_id parameter
- [ ] When occasion_id is None: returns total across all occasions (backward compatible)
- [ ] When occasion_id is provided: returns total for that occasion only
- [ ] Joins Gift → GiftPerson → Person
- [ ] If occasion filtering needed, joins Gift → List → Occasion
- [ ] Sums GiftPerson.amount where person_id matches
- [ ] Returns Decimal(0) if no gifts found

---

### REPO-004: Write Repository Unit Tests ⏳ Pending
**Story Points**: 2
**Assigned To**: python-backend-engineer
**Dependencies**: REPO-001, REPO-002, REPO-003
**Files**:
- `services/api/tests/unit/repositories/test_person_occasion_repository.py`
- `services/api/tests/unit/repositories/test_gift_repository.py`

**Description**:
Comprehensive unit tests for all new repository methods.

**Test Coverage**:

**PersonOccasionRepository Tests**:
- `test_get_person_occasion_budget_exists`: Happy path
- `test_get_person_occasion_budget_not_found`: Returns None
- `test_update_person_occasion_budget_new`: Creates new record
- `test_update_person_occasion_budget_existing`: Updates existing record
- `test_update_person_occasion_budget_partial`: Only updates provided fields
- `test_update_person_occasion_budget_validation`: Negative amount raises error
- `test_update_person_occasion_budget_currency_validation`: Invalid currency code

**GiftRepository Tests**:
- `test_get_gift_budget_all_occasions`: occasion_id=None returns total
- `test_get_gift_budget_filtered_by_occasion`: occasion_id filters correctly
- `test_get_gift_budget_no_gifts`: Returns Decimal(0)
- `test_get_gift_budget_multiple_gifts_same_occasion`: Sums correctly

**Acceptance Criteria**:
- [ ] All tests pass
- [ ] Tests use pytest fixtures for database setup
- [ ] Tests use AsyncSession properly
- [ ] Tests clean up data after execution
- [ ] Edge cases covered (None values, zero amounts, missing records)
- [ ] Test isolation (no test depends on another)

---

## Quick Reference

### Pre-built Task Commands

```python
# REPO-001: Add get_person_occasion_budget() method
Task("python-backend-engineer", """
Add get_person_occasion_budget() method to PersonOccasionRepository.

File: services/api/app/repositories/person_occasion_repository.py

Method signature:
async def get_person_occasion_budget(
    self,
    person_id: int,
    occasion_id: int,
    db: AsyncSession
) -> PersonOccasion | None:
    '''Get PersonOccasion with budget fields for specific person-occasion pair.'''

Implementation:
- Query PersonOccasion where person_id=? AND occasion_id=?
- Return PersonOccasion model or None
- Use SQLAlchemy async session
- Follow existing repository patterns in the codebase

Pattern reference: Look at existing PersonOccasionRepository methods.
""")

# REPO-002: Add update_person_occasion_budget() method
Task("python-backend-engineer", """
Add update_person_occasion_budget() method to PersonOccasionRepository.

File: services/api/app/repositories/person_occasion_repository.py

Method signature:
async def update_person_occasion_budget(
    self,
    person_id: int,
    occasion_id: int,
    budget_amount: Decimal | None = None,
    budget_currency: str | None = None,
    budget_notes: str | None = None,
    db: AsyncSession
) -> PersonOccasion:
    '''Update budget fields for person-occasion pair.'''

Requirements:
- Upsert behavior (create if not exists)
- Partial updates (only update provided fields)
- Validate budget_amount >= 0
- Validate budget_currency is 3-letter code
- Commit transaction
- Return updated PersonOccasion

Pattern: Use SQLAlchemy merge() or get + create pattern.
""")

# REPO-003: Extend get_gift_budget() with occasion filter
Task("python-backend-engineer", """
Extend get_gift_budget() method in GiftRepository to support occasion filtering.

File: services/api/app/repositories/gift_repository.py

Change signature from:
async def get_gift_budget(self, person_id: int, db: AsyncSession) -> Decimal

To:
async def get_gift_budget(
    self,
    person_id: int,
    db: AsyncSession,
    occasion_id: int | None = None
) -> Decimal

Implementation:
- When occasion_id is None: sum all gifts for person (existing behavior)
- When occasion_id provided: join Gift → List → Occasion and filter by occasion_id
- Sum GiftPerson.amount where person_id matches
- Return Decimal(0) if no gifts

Maintain backward compatibility.
""")

# REPO-004: Write repository unit tests
Task("python-backend-engineer", """
Write unit tests for new repository methods.

Files:
- services/api/tests/unit/repositories/test_person_occasion_repository.py
- services/api/tests/unit/repositories/test_gift_repository.py

Tests for PersonOccasionRepository:
1. test_get_person_occasion_budget_exists
2. test_get_person_occasion_budget_not_found
3. test_update_person_occasion_budget_new
4. test_update_person_occasion_budget_existing
5. test_update_person_occasion_budget_partial
6. test_update_person_occasion_budget_validation

Tests for GiftRepository:
1. test_get_gift_budget_all_occasions
2. test_get_gift_budget_filtered_by_occasion
3. test_get_gift_budget_no_gifts
4. test_get_gift_budget_multiple_gifts_same_occasion

Use pytest, async fixtures, and follow existing test patterns.
""")
```

### File Locations

```
services/api/
├── app/
│   └── repositories/
│       ├── person_occasion_repository.py   # REPO-001, REPO-002
│       └── gift_repository.py              # REPO-003
└── tests/
    └── unit/
        └── repositories/
            ├── test_person_occasion_repository.py  # REPO-004
            └── test_gift_repository.py             # REPO-004
```

### Testing Commands

```bash
# Navigate to API directory
cd /Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api

# Run repository tests
uv run pytest tests/unit/repositories/test_person_occasion_repository.py -v
uv run pytest tests/unit/repositories/test_gift_repository.py -v

# Run all repository tests
uv run pytest tests/unit/repositories/ -v

# Run with coverage
uv run pytest tests/unit/repositories/ --cov=app/repositories --cov-report=term-missing
```

## Context for AI Agents

### Architecture Layer

Repository Layer sits between Service Layer and Database:
- **Input**: Receives primitive types (int, str, Decimal) from Service Layer
- **Output**: Returns ORM models (PersonOccasion, Gift)
- **Responsibility**: ALL database queries for person-occasion budgets
- **Pattern**: No business logic, just CRUD operations

### Key Patterns

1. **Async/Await**: All repository methods are async
2. **Session Management**: AsyncSession passed as parameter
3. **Return Types**: Return ORM models, not DTOs
4. **Error Handling**: Let SQLAlchemy exceptions bubble up (Service Layer handles them)

### Upsert Strategy

For REPO-002 (update_person_occasion_budget):
```python
# Option 1: get + create
person_occasion = await get_person_occasion_budget(person_id, occasion_id, db)
if not person_occasion:
    person_occasion = PersonOccasion(person_id=person_id, occasion_id=occasion_id)
    db.add(person_occasion)

# Update fields
if budget_amount is not None:
    person_occasion.budget_amount = budget_amount
# ... etc

await db.commit()
await db.refresh(person_occasion)
return person_occasion
```

### Query Optimization

For REPO-003 (get_gift_budget with occasion filter):
```python
query = (
    select(func.sum(GiftPerson.amount))
    .join(Gift, Gift.id == GiftPerson.gift_id)
    .where(GiftPerson.person_id == person_id)
)

if occasion_id is not None:
    query = query.join(List, List.id == Gift.list_id)
    query = query.where(List.occasion_id == occasion_id)

result = await db.execute(query)
return result.scalar() or Decimal(0)
```

### Testing Strategy

- Use pytest async fixtures
- Create test data in setup, clean in teardown
- Test isolation: each test creates its own data
- Cover happy path + edge cases
- Mock/stub external dependencies if any

## Integration Points

### Consumed By
- **PersonService** (Phase 3): Will call these repository methods
- **Service Layer**: Converts ORM models to DTOs

### Consumes
- **PersonOccasion Model**: ORM model from Phase 1
- **Gift/GiftPerson Models**: Existing models for spending calculations

### Database
- **Queries**: PersonOccasion table for budget fields
- **Joins**: Gift → GiftPerson → Person → PersonOccasion for spending calculations

## Next Steps

After Phase 2 completion:
1. Proceed to Phase 3: Service & API Layer
2. PersonService will wrap repository methods with business logic
3. API endpoints will expose service methods via DTOs

## References

- **PRD**: `/docs/project_plans/PRDs/features/person-occasion-budgets-v1.md`
- **Implementation Plan**: `/docs/project_plans/implementation_plans/features/person-occasion-budgets-v1.md`
- **Phase 1**: `.claude/progress/person-occasion-budgets-v1/phase-1-database-progress.md`
- **Repository Pattern**: `services/api/CLAUDE.md` (Repository Layer section)
