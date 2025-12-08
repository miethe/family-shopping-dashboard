---
type: progress
prd: person-occasion-budgets-v1
phase: 3
phase_name: Service & API Layer
status: not_started
progress: 0
total_tasks: 7
completed_tasks: 0
story_points: 14
estimated_duration: 1.5 days
tasks:
  - id: API-001
    title: Create PersonOccasionBudgetResponse DTO
    status: pending
    assigned_to: python-backend-engineer
    dependencies: [REPO-004]
    story_points: 1
    files:
      - services/api/app/schemas/person.py
    description: DTO for returning budget data to frontend
  - id: API-002
    title: Create PersonOccasionBudgetUpdate DTO
    status: pending
    assigned_to: python-backend-engineer
    dependencies: [REPO-004]
    story_points: 1
    files:
      - services/api/app/schemas/person.py
    description: DTO for updating budget data from frontend
  - id: API-003
    title: Add PersonService.get_occasion_budget() method
    status: pending
    assigned_to: python-backend-engineer
    dependencies: [API-001, REPO-004]
    story_points: 2
    files:
      - services/api/app/services/person_service.py
    description: Service method to get budget, converts ORM to DTO
  - id: API-004
    title: Add PersonService.set_occasion_budget() method
    status: pending
    assigned_to: python-backend-engineer
    dependencies: [API-002, REPO-004]
    story_points: 3
    files:
      - services/api/app/services/person_service.py
    description: Service method to update budget with validation
  - id: API-005
    title: Add GET /persons/{id}/occasions/{oid}/budget endpoint
    status: pending
    assigned_to: python-backend-engineer
    dependencies: [API-003]
    story_points: 2
    files:
      - services/api/app/api/v1/endpoints/persons.py
    description: REST endpoint to retrieve person-occasion budget
  - id: API-006
    title: Add PUT /persons/{id}/occasions/{oid}/budget endpoint
    status: pending
    assigned_to: python-backend-engineer
    dependencies: [API-004]
    story_points: 2
    files:
      - services/api/app/api/v1/endpoints/persons.py
    description: REST endpoint to update person-occasion budget
  - id: API-007
    title: Write API integration tests
    status: pending
    assigned_to: python-backend-engineer
    dependencies: [API-005, API-006]
    story_points: 3
    files:
      - services/api/tests/integration/test_person_budget_api.py
    description: End-to-end API tests for budget endpoints
---

# Phase 3: Service & API Layer

**Status**: Not Started
**Last Updated**: 2025-12-07
**Completion**: 0%
**Story Points**: 14 / 14 remaining
**Estimated Duration**: 1.5 days

## Overview

Create DTOs, service layer business logic, and REST API endpoints for person-occasion budgets. This phase exposes repository functionality through a clean HTTP API that follows the project's layered architecture (Router → Service → Repository).

## Parallelization Strategy

### Batch 1: DTOs (Parallel - 2 story points, 0.25 days)
Can run in parallel:
- API-001: PersonOccasionBudgetResponse DTO (1 pt)
- API-002: PersonOccasionBudgetUpdate DTO (1 pt)

### Batch 2: Service Layer (Parallel - 5 story points, 0.5 days)
Can run in parallel after DTOs complete:
- API-003: get_occasion_budget() service method (2 pts)
- API-004: set_occasion_budget() service method (3 pts)

### Batch 3: API Endpoints (Parallel - 4 story points, 0.5 days)
Can run in parallel after service layer:
- API-005: GET endpoint (2 pts)
- API-006: PUT endpoint (2 pts)

### Batch 4: Testing (Sequential - 3 story points, 0.25 days)
- API-007: Integration tests (depends on API-005, API-006)

**Total Duration**: 1.5 days (significant parallelization possible)

## Tasks

### API-001: Create PersonOccasionBudgetResponse DTO ⏳ Pending
**Story Points**: 1
**Assigned To**: python-backend-engineer
**Dependencies**: REPO-004
**Files**: `services/api/app/schemas/person.py`

**Description**:
Create Pydantic schema for returning person-occasion budget data to the frontend.

**Schema Definition**:
```python
class PersonOccasionBudgetResponse(BaseModel):
    person_id: int
    occasion_id: int
    budget_amount: Decimal | None
    budget_spent: Decimal
    budget_remaining: Decimal  # Computed field
    budget_currency: str
    budget_notes: str | None
    is_over_budget: bool  # Computed field

    model_config = ConfigDict(from_attributes=True)
```

**Acceptance Criteria**:
- [ ] All fields properly typed
- [ ] Computed fields (budget_remaining, is_over_budget) calculated correctly
- [ ] Decimal fields serialize to strings for JSON
- [ ] Follows existing DTO patterns in codebase
- [ ] from_attributes=True for ORM conversion

---

### API-002: Create PersonOccasionBudgetUpdate DTO ⏳ Pending
**Story Points**: 1
**Assigned To**: python-backend-engineer
**Dependencies**: REPO-004
**Files**: `services/api/app/schemas/person.py`

**Description**:
Create Pydantic schema for updating person-occasion budget from the frontend.

**Schema Definition**:
```python
class PersonOccasionBudgetUpdate(BaseModel):
    budget_amount: Decimal | None = None
    budget_currency: str | None = Field(None, pattern="^[A-Z]{3}$")
    budget_notes: str | None = None

    @field_validator('budget_amount')
    @classmethod
    def validate_budget_amount(cls, v):
        if v is not None and v < 0:
            raise ValueError('Budget amount must be non-negative')
        return v
```

**Acceptance Criteria**:
- [ ] All fields optional (partial update support)
- [ ] budget_amount validated >= 0
- [ ] budget_currency validated as 3-letter code
- [ ] Field validators use Pydantic v2 syntax
- [ ] Follows existing update DTO patterns

---

### API-003: Add PersonService.get_occasion_budget() Method ⏳ Pending
**Story Points**: 2
**Assigned To**: python-backend-engineer
**Dependencies**: API-001, REPO-004
**Files**: `services/api/app/services/person_service.py`

**Description**:
Service method to retrieve person-occasion budget with computed fields.

**Method Signature**:
```python
async def get_occasion_budget(
    self,
    person_id: int,
    occasion_id: int,
    db: AsyncSession
) -> PersonOccasionBudgetResponse:
    """Get budget for person-occasion pair with computed fields."""
```

**Implementation Logic**:
1. Call repository.get_person_occasion_budget()
2. If not found, raise HTTPException 404
3. Calculate budget_remaining = budget_amount - budget_spent
4. Calculate is_over_budget = budget_spent > budget_amount
5. Convert ORM model to PersonOccasionBudgetResponse DTO
6. Return DTO

**Acceptance Criteria**:
- [ ] Calls repository layer (no direct DB access)
- [ ] Raises 404 if person-occasion pair doesn't exist
- [ ] Computes budget_remaining correctly
- [ ] Computes is_over_budget correctly
- [ ] Returns DTO (not ORM model)
- [ ] Follows existing service patterns

---

### API-004: Add PersonService.set_occasion_budget() Method ⏳ Pending
**Story Points**: 3
**Assigned To**: python-backend-engineer
**Dependencies**: API-002, REPO-004
**Files**: `services/api/app/services/person_service.py`

**Method Signature**:
```python
async def set_occasion_budget(
    self,
    person_id: int,
    occasion_id: int,
    budget_update: PersonOccasionBudgetUpdate,
    db: AsyncSession
) -> PersonOccasionBudgetResponse:
    """Update budget for person-occasion pair."""
```

**Implementation Logic**:
1. Validate person exists (call person_repository)
2. Validate occasion exists (call occasion_repository)
3. Call repository.update_person_occasion_budget()
4. Recalculate budget_spent from gift_repository.get_gift_budget()
5. Update budget_spent field
6. Convert ORM model to PersonOccasionBudgetResponse DTO
7. Return DTO

**Acceptance Criteria**:
- [ ] Validates person exists (404 if not)
- [ ] Validates occasion exists (404 if not)
- [ ] Calls repository for update
- [ ] Recalculates budget_spent from gifts
- [ ] Returns updated budget with computed fields
- [ ] Follows existing service patterns
- [ ] Handles partial updates correctly

---

### API-005: Add GET /persons/{id}/occasions/{oid}/budget Endpoint ⏳ Pending
**Story Points**: 2
**Assigned To**: python-backend-engineer
**Dependencies**: API-003
**Files**: `services/api/app/api/v1/endpoints/persons.py`

**Description**:
REST endpoint to retrieve person-occasion budget.

**Endpoint Specification**:
```python
@router.get(
    "/persons/{person_id}/occasions/{occasion_id}/budget",
    response_model=PersonOccasionBudgetResponse,
    status_code=status.HTTP_200_OK
)
async def get_person_occasion_budget(
    person_id: int = Path(..., gt=0),
    occasion_id: int = Path(..., gt=0),
    db: AsyncSession = Depends(get_db)
):
    """Get budget for specific person-occasion pair."""
    return await person_service.get_occasion_budget(person_id, occasion_id, db)
```

**Acceptance Criteria**:
- [ ] Route registered in persons router
- [ ] Path parameters validated (gt=0)
- [ ] Calls service layer (no business logic in router)
- [ ] Returns PersonOccasionBudgetResponse
- [ ] Returns 200 on success
- [ ] Returns 404 if person-occasion not found
- [ ] OpenAPI docs generated correctly

---

### API-006: Add PUT /persons/{id}/occasions/{oid}/budget Endpoint ⏳ Pending
**Story Points**: 2
**Assigned To**: python-backend-engineer
**Dependencies**: API-004
**Files**: `services/api/app/api/v1/endpoints/persons.py`

**Description**:
REST endpoint to update person-occasion budget.

**Endpoint Specification**:
```python
@router.put(
    "/persons/{person_id}/occasions/{occasion_id}/budget",
    response_model=PersonOccasionBudgetResponse,
    status_code=status.HTTP_200_OK
)
async def update_person_occasion_budget(
    person_id: int = Path(..., gt=0),
    occasion_id: int = Path(..., gt=0),
    budget_update: PersonOccasionBudgetUpdate = Body(...),
    db: AsyncSession = Depends(get_db)
):
    """Update budget for specific person-occasion pair."""
    return await person_service.set_occasion_budget(
        person_id, occasion_id, budget_update, db
    )
```

**Acceptance Criteria**:
- [ ] Route registered in persons router
- [ ] Path parameters validated
- [ ] Request body validated via Pydantic
- [ ] Calls service layer
- [ ] Returns PersonOccasionBudgetResponse
- [ ] Returns 200 on success
- [ ] Returns 404 if person or occasion not found
- [ ] Returns 422 on validation errors
- [ ] OpenAPI docs generated correctly

---

### API-007: Write API Integration Tests ⏳ Pending
**Story Points**: 3
**Assigned To**: python-backend-engineer
**Dependencies**: API-005, API-006
**Files**: `services/api/tests/integration/test_person_budget_api.py`

**Description**:
End-to-end integration tests for budget API endpoints using TestClient.

**Test Coverage**:

**GET /persons/{id}/occasions/{oid}/budget**:
- `test_get_budget_success`: Happy path returns budget
- `test_get_budget_not_found`: 404 when person-occasion doesn't exist
- `test_get_budget_invalid_params`: 422 for invalid IDs

**PUT /persons/{id}/occasions/{oid}/budget**:
- `test_update_budget_new`: Creates new budget
- `test_update_budget_existing`: Updates existing budget
- `test_update_budget_partial`: Partial update works
- `test_update_budget_validation_negative_amount`: 422 for negative amount
- `test_update_budget_validation_invalid_currency`: 422 for invalid currency
- `test_update_budget_person_not_found`: 404 when person doesn't exist
- `test_update_budget_occasion_not_found`: 404 when occasion doesn't exist

**Computed Fields**:
- `test_budget_remaining_calculation`: budget_remaining computed correctly
- `test_over_budget_flag`: is_over_budget flag set correctly

**Acceptance Criteria**:
- [ ] All tests pass
- [ ] Tests use TestClient for HTTP requests
- [ ] Tests use test database (not production)
- [ ] Tests create fixture data in setup
- [ ] Tests clean up data in teardown
- [ ] Tests verify response status codes
- [ ] Tests verify response body structure
- [ ] Tests cover edge cases and error paths

---

## Quick Reference

### Pre-built Task Commands

```python
# API-001: Create PersonOccasionBudgetResponse DTO
Task("python-backend-engineer", """
Create PersonOccasionBudgetResponse DTO in person schemas.

File: services/api/app/schemas/person.py

Schema:
class PersonOccasionBudgetResponse(BaseModel):
    person_id: int
    occasion_id: int
    budget_amount: Decimal | None
    budget_spent: Decimal
    budget_remaining: Decimal  # Computed: budget_amount - budget_spent
    budget_currency: str
    budget_notes: str | None
    is_over_budget: bool  # Computed: budget_spent > budget_amount

    model_config = ConfigDict(from_attributes=True)

Ensure Decimal serialization to string for JSON.
Follow existing DTO patterns in the file.
""")

# API-002: Create PersonOccasionBudgetUpdate DTO
Task("python-backend-engineer", """
Create PersonOccasionBudgetUpdate DTO in person schemas.

File: services/api/app/schemas/person.py

Schema:
class PersonOccasionBudgetUpdate(BaseModel):
    budget_amount: Decimal | None = None
    budget_currency: str | None = Field(None, pattern="^[A-Z]{3}$")
    budget_notes: str | None = None

    @field_validator('budget_amount')
    @classmethod
    def validate_budget_amount(cls, v):
        if v is not None and v < 0:
            raise ValueError('Budget amount must be non-negative')
        return v

All fields optional for partial updates.
Use Pydantic v2 field_validator syntax.
""")

# API-003: Add PersonService.get_occasion_budget()
Task("python-backend-engineer", """
Add get_occasion_budget() method to PersonService.

File: services/api/app/services/person_service.py

Method signature:
async def get_occasion_budget(
    self,
    person_id: int,
    occasion_id: int,
    db: AsyncSession
) -> PersonOccasionBudgetResponse:
    '''Get budget for person-occasion pair with computed fields.'''

Implementation:
1. Call self.person_occasion_repo.get_person_occasion_budget(person_id, occasion_id, db)
2. If None, raise HTTPException(404, "Person-occasion budget not found")
3. Calculate budget_remaining = budget_amount - budget_spent (handle None)
4. Calculate is_over_budget = budget_spent > budget_amount (if budget_amount set)
5. Convert to PersonOccasionBudgetResponse DTO
6. Return DTO

Follow existing service patterns in the file.
""")

# API-004: Add PersonService.set_occasion_budget()
Task("python-backend-engineer", """
Add set_occasion_budget() method to PersonService.

File: services/api/app/services/person_service.py

Method signature:
async def set_occasion_budget(
    self,
    person_id: int,
    occasion_id: int,
    budget_update: PersonOccasionBudgetUpdate,
    db: AsyncSession
) -> PersonOccasionBudgetResponse:
    '''Update budget for person-occasion pair.'''

Implementation:
1. Validate person exists (call person_repo.get_by_id, raise 404 if not found)
2. Validate occasion exists (call occasion_repo.get_by_id, raise 404 if not found)
3. Call person_occasion_repo.update_person_occasion_budget(...)
4. Recalculate budget_spent: gift_repo.get_gift_budget(person_id, db, occasion_id)
5. Update budget_spent field on returned model
6. Convert to PersonOccasionBudgetResponse with computed fields
7. Return DTO

Follow existing service patterns.
""")

# API-005: Add GET endpoint
Task("python-backend-engineer", """
Add GET /persons/{person_id}/occasions/{occasion_id}/budget endpoint.

File: services/api/app/api/v1/endpoints/persons.py

Endpoint:
@router.get(
    "/persons/{person_id}/occasions/{occasion_id}/budget",
    response_model=PersonOccasionBudgetResponse,
    status_code=status.HTTP_200_OK
)
async def get_person_occasion_budget(
    person_id: int = Path(..., gt=0),
    occasion_id: int = Path(..., gt=0),
    db: AsyncSession = Depends(get_db)
):
    '''Get budget for specific person-occasion pair.'''
    return await person_service.get_occasion_budget(person_id, occasion_id, db)

Add to existing persons router.
Follow existing endpoint patterns.
""")

# API-006: Add PUT endpoint
Task("python-backend-engineer", """
Add PUT /persons/{person_id}/occasions/{occasion_id}/budget endpoint.

File: services/api/app/api/v1/endpoints/persons.py

Endpoint:
@router.put(
    "/persons/{person_id}/occasions/{occasion_id}/budget",
    response_model=PersonOccasionBudgetResponse,
    status_code=status.HTTP_200_OK
)
async def update_person_occasion_budget(
    person_id: int = Path(..., gt=0),
    occasion_id: int = Path(..., gt=0),
    budget_update: PersonOccasionBudgetUpdate = Body(...),
    db: AsyncSession = Depends(get_db)
):
    '''Update budget for specific person-occasion pair.'''
    return await person_service.set_occasion_budget(
        person_id, occasion_id, budget_update, db
    )

Add to existing persons router.
Follow existing endpoint patterns.
""")

# API-007: Write integration tests
Task("python-backend-engineer", """
Write API integration tests for person-occasion budget endpoints.

File: services/api/tests/integration/test_person_budget_api.py

Tests to implement:
GET endpoint:
- test_get_budget_success
- test_get_budget_not_found
- test_get_budget_invalid_params

PUT endpoint:
- test_update_budget_new
- test_update_budget_existing
- test_update_budget_partial
- test_update_budget_validation_negative_amount
- test_update_budget_validation_invalid_currency
- test_update_budget_person_not_found
- test_update_budget_occasion_not_found

Computed fields:
- test_budget_remaining_calculation
- test_over_budget_flag

Use TestClient, test database, fixtures.
Follow existing integration test patterns.
""")
```

### File Locations

```
services/api/
├── app/
│   ├── schemas/
│   │   └── person.py                        # API-001, API-002
│   ├── services/
│   │   └── person_service.py                # API-003, API-004
│   └── api/
│       └── v1/
│           └── endpoints/
│               └── persons.py               # API-005, API-006
└── tests/
    └── integration/
        └── test_person_budget_api.py        # API-007
```

### Testing Commands

```bash
# Navigate to API directory
cd /Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api

# Run integration tests
uv run pytest tests/integration/test_person_budget_api.py -v

# Run with coverage
uv run pytest tests/integration/test_person_budget_api.py --cov=app --cov-report=term-missing

# Test specific endpoint
uv run pytest tests/integration/test_person_budget_api.py::test_get_budget_success -v

# Run all API tests
uv run pytest tests/integration/ -v

# Check OpenAPI schema
curl http://localhost:8000/docs
# Or visit http://localhost:8000/openapi.json
```

## Context for AI Agents

### Architecture Layer

Service & API Layer sits between Router and Repository:
- **Input (Router)**: Receives DTOs from HTTP requests
- **Output (Router)**: Returns DTOs in HTTP responses
- **Service Logic**: Business logic, validation, ORM→DTO conversion
- **Repository Calls**: All database access through repository layer

### DTO Conversion Pattern

```python
# ORM → DTO (in service layer)
person_occasion_orm = await repo.get_person_occasion_budget(...)
budget_remaining = (person_occasion_orm.budget_amount or Decimal(0)) - person_occasion_orm.budget_spent
is_over_budget = person_occasion_orm.budget_spent > (person_occasion_orm.budget_amount or Decimal(0))

return PersonOccasionBudgetResponse(
    person_id=person_occasion_orm.person_id,
    occasion_id=person_occasion_orm.occasion_id,
    budget_amount=person_occasion_orm.budget_amount,
    budget_spent=person_occasion_orm.budget_spent,
    budget_remaining=budget_remaining,
    budget_currency=person_occasion_orm.budget_currency,
    budget_notes=person_occasion_orm.budget_notes,
    is_over_budget=is_over_budget
)
```

### Computed Fields

**budget_remaining**:
- `budget_amount - budget_spent`
- Handle None: treat as 0 or unlimited

**is_over_budget**:
- `budget_spent > budget_amount`
- Only true if budget_amount is set
- If budget_amount is None, return False (no limit)

### Error Handling

```python
# 404 errors
if not person_occasion:
    raise HTTPException(status_code=404, detail="Person-occasion budget not found")

# 422 errors (Pydantic handles these automatically via field validators)
# 500 errors (let FastAPI handle unexpected exceptions)
```

### Integration Testing Pattern

```python
def test_update_budget_success(client: TestClient, test_db: AsyncSession):
    # Arrange
    person = create_test_person(test_db)
    occasion = create_test_occasion(test_db)

    # Act
    response = client.put(
        f"/api/v1/persons/{person.id}/occasions/{occasion.id}/budget",
        json={"budget_amount": "100.00", "budget_currency": "USD"}
    )

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["budget_amount"] == "100.00"
    assert data["budget_currency"] == "USD"
    assert data["budget_spent"] == "0.00"
    assert data["budget_remaining"] == "100.00"
    assert data["is_over_budget"] is False
```

## Integration Points

### Consumed By
- **Frontend** (Phase 4): React Query hooks will call these endpoints
- **UI Components** (Phase 5): Budget displays will consume response DTOs

### Consumes
- **PersonService**: Existing service for person operations
- **OccasionService**: Existing service for occasion operations
- **PersonOccasionRepository**: New repository from Phase 2
- **GiftRepository**: Existing repository for spending calculations

### OpenAPI Documentation
- Endpoints auto-documented via FastAPI
- DTOs define request/response schemas
- Path parameters, query params, body all documented
- Available at `/docs` and `/openapi.json`

## Next Steps

After Phase 3 completion:
1. Proceed to Phase 4: Frontend Hooks & Data Layer
2. Create TypeScript types matching DTOs
3. Create React Query hooks for API calls
4. Prepare for UI integration in Phase 5

## References

- **PRD**: `/docs/project_plans/PRDs/features/person-occasion-budgets-v1.md`
- **Implementation Plan**: `/docs/project_plans/implementation_plans/features/person-occasion-budgets-v1.md`
- **Phase 1**: `.claude/progress/person-occasion-budgets-v1/phase-1-database-progress.md`
- **Phase 2**: `.claude/progress/person-occasion-budgets-v1/phase-2-repository-progress.md`
- **API Patterns**: `services/api/CLAUDE.md`
