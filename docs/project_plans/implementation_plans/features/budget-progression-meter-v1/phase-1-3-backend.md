---
title: "Phase 1-3: Backend Foundation (Database, Repository, Service)"
description: "Database schema, migrations, repository queries, and service layer for budget calculations"
related_plan: "../budget-progression-meter-v1.md"
status: ready
---

# Phase 1-3: Backend Foundation

## Phase Overview

| Phase | Duration | Effort | Agents | Dependencies |
|-------|----------|--------|--------|---|
| 1: Database | 1 day | 3 pts | data-layer-expert | None |
| 2: Repository | 1 day | 3 pts | python-backend-engineer | Phase 1 |
| 3: Service | 1-2 days | 3 pts | python-backend-engineer | Phase 2 |

**Total**: 9 story points, 3-4 days

---

## Phase 1: Database & Migrations

**Duration**: 1 day
**Effort**: 3 story points
**Dependencies**: None
**Primary Agent**: `data-layer-expert`
**Supporting Agents**: `python-backend-engineer`

### Epic: BUDGET-DB - Database Schema & Migrations

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Assigned To |
|---------|-----------|-------------|-------------------|----------|-------------|
| BUDGET-DB-001 | Add budget_total to occasions | Ensure `occasions` table has `budget_total` nullable NUMERIC column; create migration if missing | Column exists, migration runs without error, rollback works, type is NUMERIC(12,2) or similar | 1.5 pts | data-layer-expert |
| BUDGET-DB-002 | Create entity_budgets table | Create new table for flexible sub-budget support with polymorphic design | Table created with fields: id, entity_type (enum/string), entity_id, occasion_id, budget_amount, created_at, updated_at; FK constraints to occasions; migration runs | 1.5 pts | data-layer-expert |
| BUDGET-DB-003 | Verify ListItem price columns | Confirm `list_items` table has `planned_price` and/or `actual_price` columns; create if missing | Columns exist with NUMERIC type, nullable, migration runs | 0.5 pt | data-layer-expert |

### Files to Create/Modify

**Backend**:
```
services/api/
├── alembic/versions/
│   └── 20251204_1000_add_budget_fields.py         # New Alembic migration
└── app/models/
    └── budget.py                                   # New EntityBudget model (if not in occasion.py)
```

### Detailed Task Descriptions

#### BUDGET-DB-001: Add budget_total to occasions

**Instructions for data-layer-expert**:

1. Check current `Occasion` model in `services/api/app/models/occasion.py`
2. Verify if `budget_total` column already exists:
   - If YES: Task complete, create migration that's a no-op
   - If NO: Add column definition to model
3. Create Alembic migration:
   ```bash
   cd services/api
   uv run alembic revision --autogenerate -m "add_budget_total_to_occasions"
   ```
4. Verify migration:
   - Adds `budget_total NUMERIC(12,2) NULL` to `occasions` table
   - Migration up/down tested locally
5. Acceptance: Migration file exists, syntax correct, can be run without errors

**Expected Model Addition**:
```python
# In services/api/app/models/occasion.py
from sqlalchemy import Numeric

class Occasion(Base):
    __tablename__ = "occasions"

    # ... existing fields ...

    budget_total: Mapped[Decimal | None] = mapped_column(
        Numeric(precision=12, scale=2),
        nullable=True,
        comment="Total budget for occasion in cents or dollars"
    )
```

---

#### BUDGET-DB-002: Create entity_budgets table

**Instructions for data-layer-expert**:

1. Create new model file: `services/api/app/models/budget.py`
2. Define `EntityBudget` model:
   ```python
   class EntityBudget(Base):
       __tablename__ = "entity_budgets"

       id: Mapped[int] = mapped_column(primary_key=True)
       entity_type: Mapped[str] = mapped_column(String(50))  # 'person', 'category', etc.
       entity_id: Mapped[int] = mapped_column()
       occasion_id: Mapped[int] = mapped_column(ForeignKey("occasions.id", ondelete="CASCADE"))
       budget_amount: Mapped[Decimal] = mapped_column(Numeric(precision=12, scale=2))
       created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
       updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

       # Relationships
       occasion: Mapped["Occasion"] = relationship("Occasion")
   ```
3. Add model to imports in `services/api/app/models/__init__.py`
4. Create Alembic migration:
   ```bash
   cd services/api
   uv run alembic revision --autogenerate -m "create_entity_budgets_table"
   ```
5. Verify migration creates table with all fields and constraints
6. Acceptance: Migration file exists, creates table correctly, can be applied/rolled back

---

#### BUDGET-DB-003: Verify ListItem price columns

**Instructions for data-layer-expert**:

1. Check `ListItem` model in `services/api/app/models/list_item.py`
2. Verify presence of price columns:
   - `planned_price`: NUMERIC, nullable
   - `actual_price` (or similar): NUMERIC, nullable
3. If columns missing:
   - Add to model
   - Create Alembic migration
4. Verify types are NUMERIC/Decimal
5. Acceptance: Columns exist with correct types, can be NULL for items without price

**Expected Fields**:
```python
class ListItem(Base):
    __tablename__ = "list_items"

    # ... existing fields ...

    planned_price: Mapped[Decimal | None] = mapped_column(
        Numeric(precision=12, scale=2),
        nullable=True,
        comment="Estimated price for this item"
    )

    actual_price: Mapped[Decimal | None] = mapped_column(
        Numeric(precision=12, scale=2),
        nullable=True,
        comment="Actual price paid for this item"
    )
```

---

### Quality Gates for Phase 1

- [ ] Alembic migrations created and tested locally
- [ ] Migrations can be applied: `uv run alembic upgrade head`
- [ ] Migrations can be rolled back: `uv run alembic downgrade -1`
- [ ] All schema changes match PRD requirements
- [ ] No data loss in rollback scenarios
- [ ] Foreign key constraints properly configured
- [ ] Nullable fields properly marked (budget_total, prices)

---

## Phase 2: Repository Layer

**Duration**: 1 day
**Effort**: 3 story points
**Dependencies**: Phase 1 (database must be migrated)
**Primary Agent**: `python-backend-engineer`

### Epic: BUDGET-REPO - Budget Repository & Queries

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Assigned To |
|---------|-----------|-------------|-------------------|----------|-------------|
| BUDGET-REPO-001 | BudgetRepository class | Create repository with methods for budget queries and calculations | Class with methods: get_occasion_budget, get_purchased_total, get_planned_total, get_entity_budget; all handle null prices; unit tests >80% coverage | 1.5 pts | python-backend-engineer |
| BUDGET-REPO-002 | Budget calculation queries | Implement queries to sum list_item prices by status (purchased vs. planned) | Queries return Decimal with 2-decimal precision; handle NULL prices by treating as $0; performance <50ms for 100+ items | 1 pt | python-backend-engineer |
| BUDGET-REPO-003 | Sub-budget queries | Implement queries for entity_budgets lookups (person, category, etc.) | Query returns EntityBudget or None; supports polymorphic entity_type; prepared for future extensions | 0.5 pt | python-backend-engineer |

### Files to Create/Modify

**Backend**:
```
services/api/app/
├── repositories/
│   └── budget.py                        # New BudgetRepository class
└── tests/unit/
    ├── test_budget_repository.py        # Unit tests for repo methods
    └── test_budget_calculations.py      # Unit tests for budget math
```

### Detailed Task Descriptions

#### BUDGET-REPO-001: BudgetRepository class

**Instructions for python-backend-engineer**:

1. Create file: `services/api/app/repositories/budget.py`
2. Implement class with methods:
   ```python
   class BudgetRepository:
       def __init__(self, db_session: Session):
           self.db = db_session

       def get_occasion_budget(self, occasion_id: int) -> Decimal | None:
           """Get total budget for occasion (or None if not set)"""
           ...

       def get_purchased_total(self, occasion_id: int) -> Decimal:
           """Sum of actual_price for gifts with status in ('gifted', 'delivered')"""
           ...

       def get_planned_total(self, occasion_id: int) -> Decimal:
           """Sum of planned_price for gifts with status NOT in ('gifted', 'delivered')"""
           ...

       def get_remaining_budget(self, occasion_id: int) -> Decimal | None:
           """total - purchased - planned (or None if no budget set)"""
           ...

       def get_entity_budget(self, entity_type: str, entity_id: int, occasion_id: int) -> Decimal | None:
           """Get sub-budget for entity (person, category, etc.) for occasion"""
           ...
   ```
3. Use SQLAlchemy `func.sum()` for aggregations
4. Handle NULL prices: `func.coalesce(ListItem.planned_price, 0)`
5. Add to `services/api/app/repositories/__init__.py`

**Key Implementation Details**:

Query for purchased total (status delivered/gifted):
```python
def get_purchased_total(self, occasion_id: int) -> Decimal:
    result = self.db.query(
        func.sum(func.coalesce(ListItem.actual_price, 0))
    ).filter(
        ListItem.occasion_id == occasion_id,
        ListItem.status.in_(['gifted', 'delivered'])
    ).scalar()
    return Decimal(str(result or 0))
```

Query for planned total (status not delivered/gifted):
```python
def get_planned_total(self, occasion_id: int) -> Decimal:
    result = self.db.query(
        func.sum(func.coalesce(ListItem.planned_price, 0))
    ).filter(
        ListItem.occasion_id == occasion_id,
        ~ListItem.status.in_(['gifted', 'delivered']),
        ListItem.planned_price.isnot(None)
    ).scalar()
    return Decimal(str(result or 0))
```

---

#### BUDGET-REPO-002: Budget calculation queries

**Instructions for python-backend-engineer**:

1. Implement complex queries in BudgetRepository
2. Test with various scenarios:
   - No gifts
   - All gifts have null prices
   - Mix of null and non-null prices
   - Large number of gifts (100+)
3. Ensure Decimal precision (2 decimal places)
4. Performance: All queries should complete <50ms

**Test Scenarios** (to be verified later in Phase 7):
```python
# Test 1: No gifts
purchased = repo.get_purchased_total(occasion_123)  # Should be 0

# Test 2: All null prices
# Add gifts with null prices, query should return 0

# Test 3: Mix of values
# Add gifts with prices: $10, $20, None, $30
# Purchased (status=gifted): Should sum non-null values only

# Test 4: Large dataset
# Add 100+ gifts
# Query should complete in <50ms
```

---

#### BUDGET-REPO-003: Sub-budget queries

**Instructions for python-backend-engineer**:

1. Implement entity budget lookups:
   ```python
   def get_entity_budget(self, entity_type: str, entity_id: int, occasion_id: int) -> Decimal | None:
       """Get sub-budget for entity (person, category, etc.)"""
       budget = self.db.query(EntityBudget).filter(
           EntityBudget.entity_type == entity_type,
           EntityBudget.entity_id == entity_id,
           EntityBudget.occasion_id == occasion_id
       ).first()
       return budget.budget_amount if budget else None
   ```
2. Add method to get entity spending (sum of gifts linked to entity):
   ```python
   def get_entity_spending(self, entity_type: str, entity_id: int, occasion_id: int) -> Decimal:
       """Sum of prices for gifts linked to entity"""
       ...
   ```
3. Support polymorphic design (entity_type can be 'person', 'category', etc.)
4. Handle missing entity_budget gracefully (return None)

---

### Unit Tests for Phase 2

**File**: `services/api/tests/unit/test_budget_repository.py`

```python
import pytest
from decimal import Decimal
from app.repositories.budget import BudgetRepository
from app.models import Occasion, ListItem, EntityBudget

class TestBudgetRepository:

    def test_get_occasion_budget_when_set(self, db_session):
        """Should return budget amount when set"""
        occasion = Occasion(budget_total=Decimal("500.00"))
        repo = BudgetRepository(db_session)

        budget = repo.get_occasion_budget(occasion.id)
        assert budget == Decimal("500.00")

    def test_get_occasion_budget_when_null(self, db_session):
        """Should return None when budget not set"""
        occasion = Occasion(budget_total=None)
        repo = BudgetRepository(db_session)

        budget = repo.get_occasion_budget(occasion.id)
        assert budget is None

    def test_get_purchased_total_no_gifts(self, db_session):
        """Should return 0 when no gifts"""
        occasion = Occasion()
        repo = BudgetRepository(db_session)

        total = repo.get_purchased_total(occasion.id)
        assert total == Decimal("0.00")

    def test_get_purchased_total_with_prices(self, db_session):
        """Should sum actual_price for gifted items"""
        occasion = Occasion()
        gift1 = ListItem(occasion_id=occasion.id, status='gifted', actual_price=Decimal("100.00"))
        gift2 = ListItem(occasion_id=occasion.id, status='gifted', actual_price=Decimal("50.00"))
        repo = BudgetRepository(db_session)

        total = repo.get_purchased_total(occasion.id)
        assert total == Decimal("150.00")

    def test_get_purchased_total_handles_null_prices(self, db_session):
        """Should treat NULL prices as $0"""
        occasion = Occasion()
        gift1 = ListItem(occasion_id=occasion.id, status='gifted', actual_price=Decimal("100.00"))
        gift2 = ListItem(occasion_id=occasion.id, status='gifted', actual_price=None)
        repo = BudgetRepository(db_session)

        total = repo.get_purchased_total(occasion.id)
        assert total == Decimal("100.00")

    def test_get_planned_total_excludes_gifted(self, db_session):
        """Should sum prices for non-gifted items only"""
        occasion = Occasion()
        gift1 = ListItem(occasion_id=occasion.id, status='planned', planned_price=Decimal("75.00"))
        gift2 = ListItem(occasion_id=occasion.id, status='shortlisted', planned_price=Decimal("25.00"))
        gift3 = ListItem(occasion_id=occasion.id, status='gifted', planned_price=Decimal("100.00"))
        repo = BudgetRepository(db_session)

        total = repo.get_planned_total(occasion.id)
        assert total == Decimal("100.00")  # Only planned + shortlisted

    def test_get_remaining_budget(self, db_session):
        """Should calculate remaining = total - purchased - planned"""
        occasion = Occasion(budget_total=Decimal("500.00"))
        gift1 = ListItem(occasion_id=occasion.id, status='gifted', actual_price=Decimal("200.00"))
        gift2 = ListItem(occasion_id=occasion.id, status='planned', planned_price=Decimal("100.00"))
        repo = BudgetRepository(db_session)

        remaining = repo.get_remaining_budget(occasion.id)
        assert remaining == Decimal("200.00")  # 500 - 200 - 100

    def test_get_entity_budget_when_set(self, db_session):
        """Should return sub-budget when set for entity"""
        occasion = Occasion()
        person = Person(name="Alice")
        entity_budget = EntityBudget(
            entity_type='person',
            entity_id=person.id,
            occasion_id=occasion.id,
            budget_amount=Decimal("200.00")
        )
        repo = BudgetRepository(db_session)

        budget = repo.get_entity_budget('person', person.id, occasion.id)
        assert budget == Decimal("200.00")

    def test_get_entity_budget_when_missing(self, db_session):
        """Should return None when no sub-budget set"""
        occasion = Occasion()
        person = Person(name="Alice")
        repo = BudgetRepository(db_session)

        budget = repo.get_entity_budget('person', person.id, occasion.id)
        assert budget is None
```

### Quality Gates for Phase 2

- [ ] BudgetRepository class created with all required methods
- [ ] All methods handle NULL prices correctly
- [ ] Unit tests written for all calculation scenarios
- [ ] Unit test coverage >80%
- [ ] Query performance <50ms for 100+ items
- [ ] Decimal precision correct (2 decimal places)
- [ ] Edge cases tested: no gifts, all null prices, mixed values

---

## Phase 3: Service Layer

**Duration**: 1-2 days
**Effort**: 3 story points
**Dependencies**: Phase 2 (repository must be complete)
**Primary Agent**: `python-backend-engineer`

### Epic: BUDGET-SERVICE - Service Layer & DTOs

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Assigned To |
|---------|-----------|-------------|-------------------|----------|-------------|
| BUDGET-SERVICE-001 | Define budget DTOs | Create Pydantic schemas: BudgetMeterDTO, BudgetWarningDTO, SubBudgetDTO | DTOs defined, all fields with types and descriptions, serialization tested | 1 pt | python-backend-engineer |
| BUDGET-SERVICE-002 | BudgetService class | Create service with calculate_meter_data, validate_budget_warning, get_sub_budget_context methods | Service returns DTOs only, calls repository methods, business logic separated from DB queries, unit tests >80% coverage | 1.5 pts | python-backend-engineer |
| BUDGET-SERVICE-003 | Budget warning logic | Implement logic to determine warning severity (approaching, exceeding, critical) | Method returns BudgetWarningDTO with severity level, message, percentage overspend | 0.5 pt | python-backend-engineer |

### Files to Create/Modify

**Backend**:
```
services/api/app/
├── schemas/
│   └── budget.py                        # BudgetMeterDTO, BudgetWarningDTO, etc.
├── services/
│   └── budget.py                        # BudgetService class
└── tests/unit/
    ├── test_budget_service.py           # Service unit tests
    └── test_budget_warnings.py          # Warning logic tests
```

### Detailed Task Descriptions

#### BUDGET-SERVICE-001: Define budget DTOs

**Instructions for python-backend-engineer**:

1. Create file: `services/api/app/schemas/budget.py`
2. Define DTOs using Pydantic:
   ```python
   from pydantic import BaseModel, Field
   from decimal import Decimal
   from datetime import datetime

   class BudgetMeterDTO(BaseModel):
       """Complete budget breakdown for an occasion"""
       occasion_id: int
       total_budget: Decimal | None = Field(None, description="Total occasion budget")
       purchased: Decimal = Field(Decimal("0.00"), description="Sum of actual_price for gifted items")
       planned: Decimal = Field(Decimal("0.00"), description="Sum of planned_price for non-gifted items")
       remaining: Decimal | None = Field(None, description="total_budget - purchased - planned")
       percentage_used: float | None = Field(None, description="(purchased + planned) / total_budget * 100")
       currency: str = Field("USD", description="Currency code")

       class Config:
           json_schema_extra = {
               "example": {
                   "occasion_id": 1,
                   "total_budget": Decimal("500.00"),
                   "purchased": Decimal("200.00"),
                   "planned": Decimal("100.00"),
                   "remaining": Decimal("200.00"),
                   "percentage_used": 60.0,
                   "currency": "USD"
               }
           }

   class BudgetWarningDTO(BaseModel):
       """Warning info for budget status"""
       has_warning: bool
       severity: str | None = Field(None, enum=["approaching", "exceeding", "critical"])
       message: str
       percentage_over: float | None = Field(None, description="How much over budget (if exceeding)")

       class Config:
           json_schema_extra = {
               "example": {
                   "has_warning": True,
                   "severity": "exceeding",
                   "message": "This gift would exceed your budget by $50",
                   "percentage_over": 10.0
               }
           }

   class SubBudgetContextDTO(BaseModel):
       """Sub-budget info for entity (person, category, etc.)"""
       entity_type: str
       entity_id: int
       occasion_id: int
       budget_amount: Decimal
       spent: Decimal
       remaining: Decimal
       percentage_used: float

   class EntityBudgetUpdateDTO(BaseModel):
       """Request DTO for setting/updating entity budget"""
       entity_type: str = Field(..., description="'person', 'category', etc.")
       entity_id: int
       occasion_id: int
       budget_amount: Decimal = Field(..., gt=0, description="Budget in dollars/cents")
   ```
3. Add to `services/api/app/schemas/__init__.py`
4. Ensure all fields have descriptions
5. Create Pydantic validation tests

---

#### BUDGET-SERVICE-002: BudgetService class

**Instructions for python-backend-engineer**:

1. Create file: `services/api/app/services/budget.py`
2. Implement service with dependency injection:
   ```python
   from decimal import Decimal
   from app.repositories.budget import BudgetRepository
   from app.schemas.budget import BudgetMeterDTO, BudgetWarningDTO, SubBudgetContextDTO

   class BudgetService:
       def __init__(self, budget_repo: BudgetRepository):
           self.budget_repo = budget_repo

       def calculate_meter_data(self, occasion_id: int) -> BudgetMeterDTO:
           """Calculate complete meter data for occasion"""
           total = self.budget_repo.get_occasion_budget(occasion_id)
           purchased = self.budget_repo.get_purchased_total(occasion_id)
           planned = self.budget_repo.get_planned_total(occasion_id)

           remaining = None
           percentage_used = None
           if total is not None:
               remaining = total - purchased - planned
               percentage_used = ((purchased + planned) / total * 100) if total > 0 else 0

           return BudgetMeterDTO(
               occasion_id=occasion_id,
               total_budget=total,
               purchased=purchased,
               planned=planned,
               remaining=remaining,
               percentage_used=percentage_used,
               currency="USD"
           )

       def validate_budget_warning(self, gift_price: Decimal, occasion_id: int, person_id: int | None = None) -> BudgetWarningDTO:
           """Check if gift price would exceed budget"""
           meter = self.calculate_meter_data(occasion_id)

           # Check occasion budget
           if meter.remaining is not None and gift_price > meter.remaining:
               over = gift_price - meter.remaining
               percentage = (over / meter.remaining * 100) if meter.remaining > 0 else 100
               return BudgetWarningDTO(
                   has_warning=True,
                   severity="exceeding",
                   message=f"This gift would exceed your budget by ${over:.2f}",
                   percentage_over=percentage
               )

           # Check entity (person) budget if provided
           if person_id:
               person_budget = self.budget_repo.get_entity_budget('person', person_id, occasion_id)
               if person_budget is not None:
                   person_spent = self.budget_repo.get_entity_spending('person', person_id, occasion_id)
                   person_remaining = person_budget - person_spent
                   if gift_price > person_remaining:
                       over = gift_price - person_remaining
                       percentage = (over / person_remaining * 100) if person_remaining > 0 else 100
                       return BudgetWarningDTO(
                           has_warning=True,
                           severity="exceeding",
                           message=f"This gift would exceed {person.name}'s budget by ${over:.2f}",
                           percentage_over=percentage
                       )

           # No warning
           return BudgetWarningDTO(has_warning=False, message="")

       def get_sub_budget_context(self, person_id: int, occasion_id: int) -> SubBudgetContextDTO | None:
           """Get sub-budget info for person if exists"""
           budget = self.budget_repo.get_entity_budget('person', person_id, occasion_id)
           if budget is None:
               return None

           spent = self.budget_repo.get_entity_spending('person', person_id, occasion_id)
           remaining = budget - spent
           percentage = (spent / budget * 100) if budget > 0 else 0

           return SubBudgetContextDTO(
               entity_type='person',
               entity_id=person_id,
               occasion_id=occasion_id,
               budget_amount=budget,
               spent=spent,
               remaining=remaining,
               percentage_used=percentage
           )
   ```
3. Return DTOs only (never ORM models)
4. Call repository methods for all DB I/O
5. Add to `services/api/app/services/__init__.py`

**Key Rules**:
- ✓ Call repository methods for all data access
- ✓ Return DTOs only
- ✓ No database imports in service
- ✗ Never mix ORM models and DTOs
- ✗ Never do DB I/O directly in service

---

#### BUDGET-SERVICE-003: Budget warning logic

**Instructions for python-backend-engineer**:

1. Implement in `validate_budget_warning()` method
2. Warning severity levels:
   - **approaching**: 80-99% of budget used → "You're using 85% of budget"
   - **exceeding**: >100% with gift → "Gift would exceed budget by $50"
   - **critical**: >120% → "Critical: way over budget"
3. Return clear, user-friendly messages
4. Calculate percentage overspend
5. Handle division by zero (budget = 0)

```python
def _calculate_warning_severity(self, percentage_used: float) -> str | None:
    """Determine warning severity level"""
    if percentage_used >= 120:
        return "critical"
    elif percentage_used > 100:
        return "exceeding"
    elif percentage_used >= 80:
        return "approaching"
    return None
```

---

### Unit Tests for Phase 3

**File**: `services/api/tests/unit/test_budget_service.py`

```python
import pytest
from decimal import Decimal
from app.services.budget import BudgetService
from app.repositories.budget import BudgetRepository

class TestBudgetService:

    def test_calculate_meter_data_complete(self, budget_repo_mock):
        """Should return complete meter data with all fields"""
        budget_repo_mock.get_occasion_budget.return_value = Decimal("500.00")
        budget_repo_mock.get_purchased_total.return_value = Decimal("200.00")
        budget_repo_mock.get_planned_total.return_value = Decimal("100.00")

        service = BudgetService(budget_repo_mock)
        meter = service.calculate_meter_data(occasion_id=1)

        assert meter.total_budget == Decimal("500.00")
        assert meter.purchased == Decimal("200.00")
        assert meter.planned == Decimal("100.00")
        assert meter.remaining == Decimal("200.00")
        assert meter.percentage_used == 60.0  # (200 + 100) / 500 * 100

    def test_calculate_meter_data_no_budget(self, budget_repo_mock):
        """Should handle no budget set gracefully"""
        budget_repo_mock.get_occasion_budget.return_value = None
        budget_repo_mock.get_purchased_total.return_value = Decimal("100.00")
        budget_repo_mock.get_planned_total.return_value = Decimal("50.00")

        service = BudgetService(budget_repo_mock)
        meter = service.calculate_meter_data(occasion_id=1)

        assert meter.total_budget is None
        assert meter.remaining is None
        assert meter.percentage_used is None

    def test_validate_budget_warning_no_overspend(self, budget_repo_mock):
        """Should have no warning when gift fits budget"""
        budget_repo_mock.get_occasion_budget.return_value = Decimal("500.00")
        budget_repo_mock.get_purchased_total.return_value = Decimal("200.00")
        budget_repo_mock.get_planned_total.return_value = Decimal("100.00")

        service = BudgetService(budget_repo_mock)
        warning = service.validate_budget_warning(gift_price=Decimal("100.00"), occasion_id=1)

        assert warning.has_warning is False
        assert warning.severity is None

    def test_validate_budget_warning_exceeding(self, budget_repo_mock):
        """Should warn when gift would exceed budget"""
        budget_repo_mock.get_occasion_budget.return_value = Decimal("500.00")
        budget_repo_mock.get_purchased_total.return_value = Decimal("300.00")
        budget_repo_mock.get_planned_total.return_value = Decimal("150.00")

        service = BudgetService(budget_repo_mock)
        warning = service.validate_budget_warning(gift_price=Decimal("100.00"), occasion_id=1)

        assert warning.has_warning is True
        assert warning.severity == "exceeding"
        assert "exceed" in warning.message.lower()
```

### Quality Gates for Phase 3

- [ ] All DTOs defined with proper Pydantic validation
- [ ] BudgetService created with all required methods
- [ ] Service returns DTOs only (never ORM models)
- [ ] Service calls repository methods for all data access
- [ ] No database imports in service file
- [ ] Unit tests >80% coverage
- [ ] Warning logic tested for all severity levels
- [ ] Edge cases handled (null budgets, zero prices, divisions)

---

## Critical Checkpoints Between Phases

**After Phase 1**:
- [ ] Migrations applied successfully: `uv run alembic upgrade head`
- [ ] Schema verified in database
- [ ] Rollback tested: `uv run alembic downgrade -1`

**After Phase 2**:
- [ ] BudgetRepository methods return correct Decimal values
- [ ] All edge cases (null prices) handled
- [ ] Queries perform <50ms

**After Phase 3**:
- [ ] BudgetService returns DTOs (never ORM)
- [ ] No database code in service layer
- [ ] Service unit tests passing >80% coverage

---

**End of Phase 1-3 Detailed Plan**

**Total Lines**: 700+
**Next**: Review Phase 4-6 for API and frontend components

