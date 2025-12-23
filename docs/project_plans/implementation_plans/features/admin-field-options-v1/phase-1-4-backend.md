---
title: "Phase 1-4: Backend Infrastructure (Database through API)"
description: "Implementation guide for database layer, repository, service, and REST API endpoints for field options management"
audience: [backend-developers]
tags: [implementation, backend, database, api, python]
created: 2025-12-20
updated: 2025-12-20
category: "implementation-planning"
status: active
related: ["docs/project_plans/implementation_plans/features/admin-field-options-v1.md"]
---

# Phase 1-4: Backend Infrastructure

**Duration**: 2-2.5 weeks
**Complexity**: Medium-High
**Story Points**: 23 points
**Owner**: Backend Engineer (Sonnet)

This phase covers database design, ORM models, CRUD repository, service layer, and REST API implementation.

---

## Phase 1: Database Layer (Days 1-2)

### Task 1.1: Create Field Options Table Schema

**Story**: `ADMIN-1: Create field_options table`
**Points**: 2
**Owner**: Backend Engineer
**Status**: Not Started

**Description**:
Design and create PostgreSQL `field_options` table with all required columns and constraints.

**Files to Create**:
- `services/api/alembic/versions/001_create_field_options_table.py` (migration file)

**Implementation Details**:

```python
# alembic/versions/001_create_field_options_table.py
def upgrade():
    op.create_table(
        'field_options',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('entity', sa.String(50), nullable=False),
        sa.Column('field_name', sa.String(100), nullable=False),
        sa.Column('value', sa.String(255), nullable=False),
        sa.Column('display_label', sa.String(255), nullable=False),
        sa.Column('display_order', sa.Integer(), server_default='0'),
        sa.Column('is_system', sa.Boolean(), server_default='false'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('created_by', sa.UUID(), nullable=True),
        sa.Column('updated_by', sa.UUID(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('entity', 'field_name', 'value'),
        sa.ForeignKeyConstraint(['created_by'], ['user.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['updated_by'], ['user.id'], ondelete='SET NULL'),
    )
    op.create_index(
        'idx_field_options_entity_field',
        'field_options',
        ['entity', 'field_name', 'is_active'],
        unique=False
    )

def downgrade():
    op.drop_index('idx_field_options_entity_field')
    op.drop_table('field_options')
```

**Acceptance Criteria**:
- [ ] Table created with all 13 columns
- [ ] Primary key (id) defined as BIGSERIAL
- [ ] Unique constraint on (entity, field_name, value)
- [ ] Foreign keys to user table for audit trail
- [ ] Index on (entity, field_name, is_active) for fast lookups
- [ ] Default values set for display_order (0), is_system (false), is_active (true)
- [ ] Migration reversible (downgrade works)
- [ ] No migration errors when running on staging DB

**Testing**:
```python
# Test locally with:
cd services/api
uv run alembic revision --autogenerate -m "create field_options table"
uv run alembic upgrade head
psql -c "SELECT * FROM field_options;"  # Should be empty
```

---

### Task 1.2: Create FieldOption SQLAlchemy Model

**Story**: `ADMIN-3: Create FieldOption model & DTO (Part 1)`
**Points**: 1 (split with 1.3)
**Owner**: Backend Engineer
**Status**: Not Started

**Description**:
Create SQLAlchemy ORM model representing the `field_options` table.

**Files to Create**:
- `services/api/app/models/field_option.py`

**Implementation Details**:

```python
# app/models/field_option.py
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from app.models.base import Base, BaseModel
import uuid

class FieldOption(Base, BaseModel):
    """Field option for dynamic dropdowns and enums."""

    __tablename__ = "field_options"
    __table_args__ = (
        UniqueConstraint('entity', 'field_name', 'value'),
        Index('idx_field_options_entity_field', 'entity', 'field_name', 'is_active'),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    entity: Mapped[str] = mapped_column(String(50), nullable=False)  # "person", "gift", etc
    field_name: Mapped[str] = mapped_column(String(100), nullable=False)  # "wine_types", "priority"
    value: Mapped[str] = mapped_column(String(255), nullable=False)  # "sake", "low"
    display_label: Mapped[str] = mapped_column(String(255), nullable=False)  # "Sake", "Low Priority"
    display_order: Mapped[int] = mapped_column(Integer, default=0)  # Sorting in UI
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)  # Hardcoded defaults
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)  # Soft-delete flag
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by: Mapped[uuid.UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("user.id", ondelete="SET NULL"), nullable=True)
    updated_by: Mapped[uuid.UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("user.id", ondelete="SET NULL"), nullable=True)

    def __repr__(self) -> str:
        return f"<FieldOption(entity='{self.entity}', field='{self.field_name}', value='{self.value}')>"
```

**Acceptance Criteria**:
- [ ] Model inherits from Base and BaseModel
- [ ] All 13 columns mapped correctly with proper types
- [ ] Unique and index constraints match migration
- [ ] Relationships (if any) properly defined
- [ ] Model can be imported without errors
- [ ] BaseModel provides created/updated timestamp management

---

### Task 1.3: Create Pydantic Schemas (DTOs)

**Story**: `ADMIN-3: Create FieldOption model & DTO (Part 2)`
**Points**: 1 (split with 1.2)
**Owner**: Backend Engineer
**Status**: Not Started

**Description**:
Create Pydantic validation schemas for field options (request/response DTOs).

**Files to Create**:
- `services/api/app/schemas/field_option.py`

**Implementation Details**:

```python
# app/schemas/field_option.py
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from uuid import UUID
from typing import Optional

class FieldOptionBase(BaseModel):
    """Base schema for field option data."""
    entity: str = Field(..., min_length=1, max_length=50, description="Entity type: person, gift, occasion, list")
    field_name: str = Field(..., min_length=1, max_length=100, description="Field name: wine_types, priority, etc")
    value: str = Field(..., min_length=1, max_length=255, description="Option value (key), immutable")
    display_label: str = Field(..., min_length=1, max_length=255, description="Human-readable label")
    display_order: int = Field(0, ge=0, description="Sort order in UI")

    @field_validator('entity')
    @classmethod
    def validate_entity(cls, v: str) -> str:
        valid = {'person', 'gift', 'occasion', 'list'}
        if v not in valid:
            raise ValueError(f"entity must be one of {valid}, got {v}")
        return v

class FieldOptionCreateDTO(FieldOptionBase):
    """Request schema for creating a field option."""
    # Inherits: entity, field_name, value, display_label, display_order
    pass

class FieldOptionUpdateDTO(BaseModel):
    """Request schema for updating a field option."""
    display_label: Optional[str] = Field(None, min_length=1, max_length=255)
    display_order: Optional[int] = Field(None, ge=0)

class FieldOptionDTO(FieldOptionBase):
    """Response schema for field option (includes metadata)."""
    id: int
    is_system: bool = Field(False, description="True if hardcoded system default")
    is_active: bool = Field(True, description="False if soft-deleted")
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UUID] = None
    updated_by: Optional[UUID] = None
    usage_count: Optional[int] = Field(None, description="Number of records using this option")

    class Config:
        from_attributes = True  # For ORM model conversion

class FieldOptionsListDTO(BaseModel):
    """Response schema for list of field options."""
    total: int
    items: list[FieldOptionDTO]

class FieldOptionDeleteResponseDTO(BaseModel):
    """Response schema for delete operation."""
    success: bool
    id: int
    soft_deleted: bool = Field(False, description="True if soft-deleted, False if hard-deleted")
    usage_count: Optional[int] = Field(None, description="Number of records using this option (if in-use)")
    message: Optional[str] = None
```

**Acceptance Criteria**:
- [ ] All DTOs defined (Create, Update, Read, List, DeleteResponse)
- [ ] Entity validation restricts to person, gift, occasion, list
- [ ] Field validators check min/max lengths and ranges
- [ ] FieldOptionDTO includes audit fields (created_at, updated_at, created_by)
- [ ] from_attributes = True for ORM conversion
- [ ] All schemas have proper descriptions (for OpenAPI)

---

### Task 1.4: Create Seeding Migration (All Hardcoded Values)

**Story**: `ADMIN-2: Seed field_options migration`
**Points**: 3
**Owner**: Backend Engineer
**Status**: Not Started

**Description**:
Create Alembic migration to seed `field_options` table with all existing hardcoded values from person.py, gift.py, occasion.py, and list.py, marked as `is_system=true`.

**Files to Create**:
- `services/api/alembic/versions/002_seed_field_options.py`

**Implementation Details**:

```python
# alembic/versions/002_seed_field_options.py
"""Seed field_options table with existing hardcoded values."""

from alembic import op
import sqlalchemy as sa

def upgrade():
    # Get connection for bulk insert
    connection = op.get_bind()

    # Define all hardcoded options (from current schemas)
    options_data = [
        # Person: Food & Drink
        ("person", "wine_types", "red", "Red Wine", 0, True),
        ("person", "wine_types", "white", "White Wine", 1, True),
        ("person", "wine_types", "rosé", "Rosé", 2, True),
        ("person", "wine_types", "sparkling", "Sparkling Wine", 3, True),

        ("person", "beverage_prefs", "coffee", "Coffee", 0, True),
        ("person", "beverage_prefs", "tea", "Tea", 1, True),
        ("person", "beverage_prefs", "juice", "Juice", 2, True),
        ("person", "beverage_prefs", "soda", "Soda", 3, True),

        ("person", "coffee_styles", "espresso", "Espresso", 0, True),
        ("person", "coffee_styles", "latte", "Latte", 1, True),
        ("person", "coffee_styles", "cappuccino", "Cappuccino", 2, True),

        ("person", "tea_styles", "black", "Black Tea", 0, True),
        ("person", "tea_styles", "green", "Green Tea", 1, True),
        ("person", "tea_styles", "herbal", "Herbal Tea", 2, True),

        ("person", "spirits", "whiskey", "Whiskey", 0, True),
        ("person", "spirits", "vodka", "Vodka", 1, True),
        ("person", "spirits", "gin", "Gin", 2, True),

        ("person", "dietary", "vegetarian", "Vegetarian", 0, True),
        ("person", "dietary", "vegan", "Vegan", 1, True),
        ("person", "dietary", "gluten_free", "Gluten Free", 2, True),

        ("person", "cuisines", "italian", "Italian", 0, True),
        ("person", "cuisines", "french", "French", 1, True),
        ("person", "cuisines", "asian", "Asian", 2, True),

        ("person", "sweet_savory", "sweet", "Sweet", 0, True),
        ("person", "sweet_savory", "savory", "Savory", 1, True),

        # Person: Style
        ("person", "preferred_metals", "gold", "Gold", 0, True),
        ("person", "preferred_metals", "silver", "Silver", 1, True),
        ("person", "preferred_metals", "rose_gold", "Rose Gold", 2, True),

        ("person", "fragrance_notes", "floral", "Floral", 0, True),
        ("person", "fragrance_notes", "woody", "Woody", 1, True),
        ("person", "fragrance_notes", "citrus", "Citrus", 2, True),

        ("person", "accessory_prefs", "minimalist", "Minimalist", 0, True),
        ("person", "accessory_prefs", "statement", "Statement", 1, True),

        # Person: Hobbies
        ("person", "hobbies", "reading", "Reading", 0, True),
        ("person", "hobbies", "gaming", "Gaming", 1, True),
        ("person", "hobbies", "sports", "Sports", 2, True),
        ("person", "hobbies", "crafting", "Crafting", 3, True),

        ("person", "creative_outlets", "painting", "Painting", 0, True),
        ("person", "creative_outlets", "music", "Music", 1, True),
        ("person", "creative_outlets", "writing", "Writing", 2, True),

        ("person", "sports_played", "tennis", "Tennis", 0, True),
        ("person", "sports_played", "soccer", "Soccer", 1, True),
        ("person", "sports_played", "yoga", "Yoga", 2, True),

        ("person", "reading_genres", "fiction", "Fiction", 0, True),
        ("person", "reading_genres", "mystery", "Mystery", 1, True),
        ("person", "reading_genres", "nonfiction", "Non-Fiction", 2, True),

        ("person", "music_genres", "pop", "Pop", 0, True),
        ("person", "music_genres", "rock", "Rock", 1, True),
        ("person", "music_genres", "jazz", "Jazz", 2, True),

        # Person: Tech
        ("person", "tech_ecosystem", "apple", "Apple", 0, True),
        ("person", "tech_ecosystem", "google", "Google", 1, True),
        ("person", "tech_ecosystem", "windows", "Windows", 2, True),

        ("person", "gaming_platforms", "playstation", "PlayStation", 0, True),
        ("person", "gaming_platforms", "xbox", "Xbox", 1, True),
        ("person", "gaming_platforms", "nintendo", "Nintendo", 2, True),

        ("person", "smart_home", "alexa", "Amazon Alexa", 0, True),
        ("person", "smart_home", "google_home", "Google Home", 1, True),
        ("person", "smart_home", "siri", "Siri", 2, True),

        # Person: Experiences
        ("person", "travel_styles", "adventure", "Adventure", 0, True),
        ("person", "travel_styles", "relaxation", "Relaxation", 1, True),
        ("person", "travel_styles", "cultural", "Cultural", 2, True),

        ("person", "experience_types", "concerts", "Concerts", 0, True),
        ("person", "experience_types", "theater", "Theater", 1, True),
        ("person", "experience_types", "sports_events", "Sports Events", 2, True),

        ("person", "event_preferences", "large_gatherings", "Large Gatherings", 0, True),
        ("person", "event_preferences", "intimate", "Intimate", 1, True),

        # Person: Gifts & Free Text
        ("person", "collects", "figurines", "Figurines", 0, True),
        ("person", "collects", "stamps", "Stamps", 1, True),
        ("person", "collects", "coins", "Coins", 2, True),

        ("person", "avoid_categories", "electronics", "Electronics", 0, True),
        ("person", "avoid_categories", "clothing", "Clothing", 1, True),

        ("person", "budget_comfort", "luxury", "Luxury", 0, True),
        ("person", "budget_comfort", "practical", "Practical", 1, True),

        # Gift enums
        ("gift", "priority", "low", "Low", 0, True),
        ("gift", "priority", "medium", "Medium", 1, True),
        ("gift", "priority", "high", "High", 2, True),

        ("gift", "status", "idea", "Idea", 0, True),
        ("gift", "status", "selected", "Selected", 1, True),
        ("gift", "status", "purchased", "Purchased", 2, True),
        ("gift", "status", "received", "Received", 3, True),

        # Occasion enums
        ("occasion", "type", "holiday", "Holiday", 0, True),
        ("occasion", "type", "recurring", "Recurring", 1, True),
        ("occasion", "type", "other", "Other", 2, True),

        # List enums
        ("list", "type", "wishlist", "Wishlist", 0, True),
        ("list", "type", "ideas", "Ideas", 1, True),
        ("list", "type", "assigned", "Assigned", 2, True),

        ("list", "visibility", "private", "Private", 0, True),
        ("list", "visibility", "family", "Family", 1, True),
        ("list", "visibility", "public", "Public", 2, True),
    ]

    # Bulk insert
    stmt = sa.insert(sa.table(
        'field_options',
        sa.column('entity'),
        sa.column('field_name'),
        sa.column('value'),
        sa.column('display_label'),
        sa.column('display_order'),
        sa.column('is_system'),
    )).values([
        {
            'entity': entity,
            'field_name': field_name,
            'value': value,
            'display_label': label,
            'display_order': order,
            'is_system': is_system,
        }
        for entity, field_name, value, label, order, is_system in options_data
    ])

    connection.execute(stmt)

def downgrade():
    # Delete only system options (those we seeded)
    op.execute("DELETE FROM field_options WHERE is_system = true")
```

**Acceptance Criteria**:
- [ ] All ~25 Person option sets migrated (Food, Style, Hobbies, Tech, Experiences, Gifts)
- [ ] All 6 Gift/Occasion/List enums migrated
- [ ] Each option marked with is_system=true
- [ ] display_order set correctly for sorting
- [ ] Downgrade deletes only system options (preserves admin-created ones)
- [ ] Migration completes in <30 seconds for 100+ rows
- [ ] No duplicate unique constraint violations
- [ ] Tests verify count of seeded options

**Testing**:
```bash
# After running migration:
psql -c "SELECT COUNT(*) FROM field_options WHERE is_system = true;"
# Should show ~100+ rows
```

**Note**: If the exact hardcoded values vary from what's shown, extract actual values from:
- `services/api/app/schemas/person.py` (all PERSON_* sets)
- `services/api/app/schemas/gift.py` (GiftPriority, GiftStatus enums)
- `services/api/app/schemas/occasion.py` (OccasionType enum)
- `services/api/app/schemas/list.py` (ListType, ListVisibility enums)

---

## Phase 2: Repository Layer (Days 3-4)

### Task 2.1: Implement FieldOptionsRepository

**Story**: `ADMIN-4: FieldOptionsRepository`
**Points**: 5
**Owner**: Backend Engineer
**Status**: Not Started

**Description**:
Create repository class with CRUD methods and utility queries for option management.

**Files to Create**:
- `services/api/app/repositories/field_option.py`

**Implementation Details**:

```python
# app/repositories/field_option.py
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models.field_option import FieldOption
from app.schemas.field_option import FieldOptionCreateDTO, FieldOptionUpdateDTO
from app.core.exceptions import DuplicateRecordError, RecordNotFoundError
from typing import Optional

class FieldOptionsRepository:
    """Repository for field_options table operations."""

    def __init__(self, db: Session):
        self.db = db

    # CREATE
    def create(self, data: FieldOptionCreateDTO, created_by: Optional[str] = None) -> FieldOption:
        """Create new field option, with audit trail."""
        # Check for duplicate
        existing = self.db.execute(
            select(FieldOption).where(
                FieldOption.entity == data.entity,
                FieldOption.field_name == data.field_name,
                FieldOption.value == data.value
            )
        ).scalar_one_or_none()

        if existing:
            raise DuplicateRecordError(
                f"Option already exists: {data.entity}.{data.field_name}='{data.value}'"
            )

        option = FieldOption(
            entity=data.entity,
            field_name=data.field_name,
            value=data.value,
            display_label=data.display_label,
            display_order=data.display_order,
            created_by=created_by,
        )
        self.db.add(option)
        self.db.commit()
        self.db.refresh(option)
        return option

    # READ
    def get_by_id(self, option_id: int) -> FieldOption:
        """Fetch option by ID."""
        option = self.db.execute(
            select(FieldOption).where(FieldOption.id == option_id)
        ).scalar_one_or_none()

        if not option:
            raise RecordNotFoundError(f"Field option {option_id} not found")

        return option

    def get_options(
        self,
        entity: str,
        field_name: str,
        include_inactive: bool = False,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[list[FieldOption], int]:
        """Fetch options for entity/field with pagination."""
        query = select(FieldOption).where(
            FieldOption.entity == entity,
            FieldOption.field_name == field_name,
        )

        if not include_inactive:
            query = query.where(FieldOption.is_active == True)

        # Count total
        count_stmt = select(func.count()).select_from(FieldOption).where(
            FieldOption.entity == entity,
            FieldOption.field_name == field_name,
        )
        if not include_inactive:
            count_stmt = count_stmt.where(FieldOption.is_active == True)

        total = self.db.execute(count_stmt).scalar()

        # Fetch paginated results
        query = query.order_by(FieldOption.display_order).offset(skip).limit(limit)
        options = self.db.execute(query).scalars().all()

        return options, total

    def get_all_for_entity(self, entity: str, include_inactive: bool = False) -> list[FieldOption]:
        """Get all field names and counts for entity."""
        query = select(FieldOption).where(FieldOption.entity == entity)
        if not include_inactive:
            query = query.where(FieldOption.is_active == True)

        options = self.db.execute(query.order_by(FieldOption.field_name, FieldOption.display_order)).scalars().all()
        return options

    # UPDATE
    def update(
        self,
        option_id: int,
        data: FieldOptionUpdateDTO,
        updated_by: Optional[str] = None,
    ) -> FieldOption:
        """Update option (label and/or display_order only)."""
        option = self.get_by_id(option_id)

        if option.is_system and data.display_label is not None:
            # Could restrict editing of system options based on feature flag
            pass  # For now, allow editing system option labels

        if data.display_label is not None:
            option.display_label = data.display_label
        if data.display_order is not None:
            option.display_order = data.display_order

        option.updated_by = updated_by
        self.db.commit()
        self.db.refresh(option)
        return option

    # DELETE
    def soft_delete(self, option_id: int, updated_by: Optional[str] = None) -> FieldOption:
        """Soft-delete option (set is_active=false)."""
        option = self.get_by_id(option_id)
        option.is_active = False
        option.updated_by = updated_by
        self.db.commit()
        self.db.refresh(option)
        return option

    def hard_delete(self, option_id: int) -> dict:
        """Hard-delete option (only if not in use)."""
        option = self.get_by_id(option_id)

        # Check if in use before deletion
        usage_count = self._check_usage(option.entity, option.field_name, option.value)
        if usage_count > 0:
            raise ValueError(
                f"Cannot hard-delete option: {usage_count} record(s) using this value"
            )

        self.db.delete(option)
        self.db.commit()

        return {"success": True, "id": option_id, "hard_deleted": True}

    # UTILITY
    def check_usage(self, option_id: int) -> int:
        """Count records using this option (for any entity/field)."""
        option = self.get_by_id(option_id)
        return self._check_usage(option.entity, option.field_name, option.value)

    def _check_usage(self, entity: str, field_name: str, value: str) -> int:
        """Internal helper to check option usage in entity records."""
        # This is a simplified version; actual implementation depends on entity structure
        # For now, return 0 (assume option not used); enhance with actual queries per entity

        # Example for Person.wine_types:
        # if entity == "person" and field_name == "wine_types":
        #     return self.db.execute(
        #         select(func.count()).select_from(Person).where(
        #             Person.wine_types.contains(value)
        #         )
        #     ).scalar()

        return 0  # Placeholder for Phase 2 refinement
```

**Acceptance Criteria**:
- [ ] All CRUD methods implemented (create, get_by_id, get_options, update, soft_delete, hard_delete)
- [ ] Duplicate detection on create
- [ ] Not found error on get of non-existent ID
- [ ] Pagination support (skip, limit)
- [ ] Soft-delete sets is_active=false without removing row
- [ ] Hard-delete checks usage before deletion
- [ ] Audit fields (created_by, updated_by) populated
- [ ] All methods use parameterized queries (no SQL injection)
- [ ] Unit tests for all methods >80% coverage

---

### Task 2.2: Unit Tests for FieldOptionsRepository

**Story**: `ADMIN-4: FieldOptionsRepository` (Testing subset)
**Points**: 2 (included in 2.1 points)
**Owner**: Backend Engineer
**Status**: Not Started

**Description**:
Write comprehensive unit tests for repository methods.

**Files to Create**:
- `services/api/tests/unit/repositories/test_field_option_repository.py`

**Implementation Details**:

```python
# tests/unit/repositories/test_field_option_repository.py
import pytest
from sqlalchemy.orm import Session
from app.repositories.field_option import FieldOptionsRepository
from app.schemas.field_option import FieldOptionCreateDTO, FieldOptionUpdateDTO
from app.core.exceptions import DuplicateRecordError, RecordNotFoundError
from app.models.field_option import FieldOption

@pytest.fixture
def repo(db_session: Session):
    return FieldOptionsRepository(db_session)

@pytest.fixture
def sample_option_data():
    return FieldOptionCreateDTO(
        entity="person",
        field_name="wine_types",
        value="sake",
        display_label="Sake",
        display_order=10,
    )

class TestCreate:
    def test_create_success(self, repo, sample_option_data):
        option = repo.create(sample_option_data, created_by="user-123")
        assert option.id is not None
        assert option.entity == "person"
        assert option.value == "sake"
        assert option.created_by == "user-123"

    def test_create_duplicate_raises_error(self, repo, sample_option_data):
        repo.create(sample_option_data)
        with pytest.raises(DuplicateRecordError):
            repo.create(sample_option_data)

class TestRead:
    def test_get_by_id_success(self, repo, sample_option_data):
        created = repo.create(sample_option_data)
        fetched = repo.get_by_id(created.id)
        assert fetched.id == created.id
        assert fetched.value == "sake"

    def test_get_by_id_not_found(self, repo):
        with pytest.raises(RecordNotFoundError):
            repo.get_by_id(9999)

    def test_get_options_pagination(self, repo, sample_option_data):
        for i in range(5):
            data = sample_option_data.copy(update={"value": f"option_{i}"})
            repo.create(data)

        options, total = repo.get_options("person", "wine_types", skip=0, limit=2)
        assert len(options) == 2
        assert total == 5

    def test_get_options_exclude_inactive(self, repo, sample_option_data):
        option = repo.create(sample_option_data)
        repo.soft_delete(option.id)

        active_options, _ = repo.get_options("person", "wine_types", include_inactive=False)
        inactive_options, _ = repo.get_options("person", "wine_types", include_inactive=True)

        assert len(active_options) == 0
        assert len(inactive_options) == 1

class TestUpdate:
    def test_update_label_success(self, repo, sample_option_data):
        option = repo.create(sample_option_data)
        update_data = FieldOptionUpdateDTO(display_label="Sake (Premium)")
        updated = repo.update(option.id, update_data, updated_by="user-456")

        assert updated.display_label == "Sake (Premium)"
        assert updated.updated_by == "user-456"

    def test_update_display_order(self, repo, sample_option_data):
        option = repo.create(sample_option_data)
        update_data = FieldOptionUpdateDTO(display_order=1)
        updated = repo.update(option.id, update_data)

        assert updated.display_order == 1

class TestDelete:
    def test_soft_delete_success(self, repo, sample_option_data):
        option = repo.create(sample_option_data)
        deleted = repo.soft_delete(option.id)

        assert deleted.is_active == False

        # Should not appear in active list
        active, _ = repo.get_options("person", "wine_types", include_inactive=False)
        assert len(active) == 0

    def test_hard_delete_success(self, repo, sample_option_data):
        option = repo.create(sample_option_data)
        result = repo.hard_delete(option.id)

        assert result["success"] == True
        with pytest.raises(RecordNotFoundError):
            repo.get_by_id(option.id)
```

**Acceptance Criteria**:
- [ ] Tests for create (success, duplicate error)
- [ ] Tests for get_by_id (success, not found)
- [ ] Tests for get_options (pagination, filtering)
- [ ] Tests for update (label, display_order)
- [ ] Tests for soft_delete (sets is_active=false)
- [ ] Tests for hard_delete (removes row)
- [ ] All tests pass
- [ ] >80% coverage for repository methods

---

## Phase 3: Service Layer (Days 5-6)

### Task 3.1: Implement FieldOptionsService

**Story**: `ADMIN-5: FieldOptionsService`
**Points**: 5
**Owner**: Backend Engineer
**Status**: Not Started

**Description**:
Create service layer with business logic, validation, and permission checks.

**Files to Create**:
- `services/api/app/services/field_option_service.py`

**Implementation Details**:

```python
# app/services/field_option_service.py
from fastapi import Depends
from app.repositories.field_option import FieldOptionsRepository
from app.schemas.field_option import (
    FieldOptionCreateDTO,
    FieldOptionUpdateDTO,
    FieldOptionDTO,
    FieldOptionsListDTO,
    FieldOptionDeleteResponseDTO,
)
from app.core.exceptions import ValidationError
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class FieldOptionsService:
    """Business logic for field options management."""

    def __init__(self, repo: FieldOptionsRepository = Depends()):
        self.repo = repo

    # PERMISSION CHECKS
    def _check_admin_permission(self, user_id: Optional[str]) -> bool:
        """Check if user has admin permission."""
        # TODO: Implement actual permission check when User model has is_admin flag
        # For now, always return True (permissive during development)
        # Future: check user.is_admin from database
        return True

    # CREATE
    async def create_option(
        self,
        data: FieldOptionCreateDTO,
        current_user_id: Optional[str] = None,
    ) -> FieldOptionDTO:
        """Create new field option with validation."""
        # Permission check
        if not self._check_admin_permission(current_user_id):
            raise ValidationError("Only admins can create field options")

        # Business logic: validate entity and field_name
        self._validate_entity_field(data.entity, data.field_name)

        # Attempt creation (repository handles duplicate check)
        try:
            option = self.repo.create(data, created_by=current_user_id)
        except Exception as e:
            logger.error(f"Failed to create option: {e}")
            raise

        # Convert ORM to DTO
        return self._orm_to_dto(option)

    # READ
    async def get_option(self, option_id: int) -> FieldOptionDTO:
        """Fetch single option by ID."""
        option = self.repo.get_by_id(option_id)

        # Add usage count
        usage_count = self.repo.check_usage(option_id)

        dto = self._orm_to_dto(option)
        dto.usage_count = usage_count
        return dto

    async def get_options(
        self,
        entity: str,
        field_name: str,
        include_inactive: bool = False,
        skip: int = 0,
        limit: int = 100,
    ) -> FieldOptionsListDTO:
        """Fetch options for entity/field with pagination."""
        # Validate inputs
        self._validate_entity_field(entity, field_name)

        options, total = self.repo.get_options(
            entity,
            field_name,
            include_inactive=include_inactive,
            skip=skip,
            limit=limit,
        )

        # Convert all to DTOs with usage counts
        dtos = []
        for option in options:
            dto = self._orm_to_dto(option)
            # Note: could optimize by batch querying usage instead of per-option
            dto.usage_count = self.repo.check_usage(option.id)
            dtos.append(dto)

        return FieldOptionsListDTO(total=total, items=dtos)

    # UPDATE
    async def update_option(
        self,
        option_id: int,
        data: FieldOptionUpdateDTO,
        current_user_id: Optional[str] = None,
    ) -> FieldOptionDTO:
        """Update option (label and/or display_order)."""
        # Permission check
        if not self._check_admin_permission(current_user_id):
            raise ValidationError("Only admins can update field options")

        # Update via repository
        option = self.repo.update(option_id, data, updated_by=current_user_id)

        return self._orm_to_dto(option)

    # DELETE
    async def delete_option(
        self,
        option_id: int,
        hard_delete: bool = False,
        current_user_id: Optional[str] = None,
    ) -> FieldOptionDeleteResponseDTO:
        """Delete option (soft or hard)."""
        # Permission check
        if not self._check_admin_permission(current_user_id):
            raise ValidationError("Only admins can delete field options")

        option = self.repo.get_by_id(option_id)
        usage_count = self.repo.check_usage(option_id)

        # Check if system option (hardcoded defaults)
        if option.is_system and hard_delete:
            raise ValidationError(
                "Cannot hard-delete system options (hardcoded defaults)"
            )

        if hard_delete:
            # Hard delete: check usage first
            if usage_count > 0:
                return FieldOptionDeleteResponseDTO(
                    success=False,
                    id=option_id,
                    soft_deleted=False,
                    usage_count=usage_count,
                    message=f"Cannot hard-delete: {usage_count} record(s) using this option. Use soft-delete instead.",
                )

            result = self.repo.hard_delete(option_id)
            return FieldOptionDeleteResponseDTO(
                success=True,
                id=option_id,
                soft_deleted=False,
                message="Option hard-deleted successfully.",
            )
        else:
            # Soft delete: always succeeds
            deleted = self.repo.soft_delete(option_id, updated_by=current_user_id)

            return FieldOptionDeleteResponseDTO(
                success=True,
                id=option_id,
                soft_deleted=True,
                usage_count=usage_count,
                message=f"Option soft-deleted (still queryable by archive)." + (
                    f" Note: {usage_count} record(s) still using this value." if usage_count > 0 else ""
                ),
            )

    # UTILITY
    def _orm_to_dto(self, orm_model) -> FieldOptionDTO:
        """Convert SQLAlchemy model to DTO."""
        return FieldOptionDTO(
            id=orm_model.id,
            entity=orm_model.entity,
            field_name=orm_model.field_name,
            value=orm_model.value,
            display_label=orm_model.display_label,
            display_order=orm_model.display_order,
            is_system=orm_model.is_system,
            is_active=orm_model.is_active,
            created_at=orm_model.created_at,
            updated_at=orm_model.updated_at,
            created_by=orm_model.created_by,
            updated_by=orm_model.updated_by,
        )

    def _validate_entity_field(self, entity: str, field_name: str) -> None:
        """Validate entity and field_name are known."""
        valid_entities = {
            "person": {
                "wine_types", "beverage_prefs", "coffee_styles", "tea_styles",
                "spirits", "dietary", "cuisines", "sweet_savory", "preferred_metals",
                "fragrance_notes", "accessory_prefs", "hobbies", "creative_outlets",
                "sports_played", "reading_genres", "music_genres", "tech_ecosystem",
                "gaming_platforms", "smart_home", "travel_styles", "experience_types",
                "event_preferences", "collects", "avoid_categories", "budget_comfort",
            },
            "gift": {"priority", "status"},
            "occasion": {"type"},
            "list": {"type", "visibility"},
        }

        if entity not in valid_entities:
            raise ValidationError(f"Unknown entity: {entity}")

        if field_name not in valid_entities[entity]:
            raise ValidationError(
                f"Unknown field '{field_name}' for entity '{entity}'"
            )
```

**Acceptance Criteria**:
- [ ] All CRUD methods implemented (create, get, get_options, update, delete)
- [ ] Permission check boilerplate on all admin operations
- [ ] Validation of entity and field_name against known options
- [ ] Usage count included in response DTOs
- [ ] Soft-delete always succeeds; hard-delete checks usage
- [ ] System options (is_system=true) cannot be hard-deleted
- [ ] Service returns DTOs only (never ORM models)
- [ ] All methods async-ready
- [ ] Error messages informative and actionable
- [ ] Unit tests >80% coverage

---

### Task 3.2: Unit Tests for FieldOptionsService

**Story**: `ADMIN-5: FieldOptionsService` (Testing subset)
**Points**: 2 (included in 3.1 points)
**Owner**: Backend Engineer
**Status**: Not Started

**Description**:
Write comprehensive unit tests for service methods.

**Files to Create**:
- `services/api/tests/unit/services/test_field_option_service.py`

**Implementation Details**:

```python
# tests/unit/services/test_field_option_service.py
import pytest
from unittest.mock import MagicMock, patch
from app.services.field_option_service import FieldOptionsService
from app.schemas.field_option import (
    FieldOptionCreateDTO,
    FieldOptionUpdateDTO,
)
from app.models.field_option import FieldOption
from app.core.exceptions import ValidationError
from datetime import datetime
from uuid import uuid4

@pytest.fixture
def mock_repo():
    return MagicMock()

@pytest.fixture
def service(mock_repo):
    return FieldOptionsService(repo=mock_repo)

@pytest.fixture
def sample_orm_option():
    return FieldOption(
        id=1,
        entity="person",
        field_name="wine_types",
        value="sake",
        display_label="Sake",
        display_order=10,
        is_system=False,
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        created_by=uuid4(),
    )

class TestCreateOption:
    @pytest.mark.asyncio
    async def test_create_success(self, service, mock_repo, sample_orm_option):
        data = FieldOptionCreateDTO(
            entity="person",
            field_name="wine_types",
            value="sake",
            display_label="Sake",
            display_order=10,
        )
        mock_repo.create.return_value = sample_orm_option

        result = await service.create_option(data, current_user_id="user-123")

        assert result.id == 1
        assert result.value == "sake"
        mock_repo.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_invalid_entity(self, service, mock_repo):
        data = FieldOptionCreateDTO(
            entity="invalid",
            field_name="wine_types",
            value="sake",
            display_label="Sake",
        )

        with pytest.raises(ValidationError):
            await service.create_option(data)

    @pytest.mark.asyncio
    async def test_create_invalid_field(self, service, mock_repo):
        data = FieldOptionCreateDTO(
            entity="person",
            field_name="invalid_field",
            value="sake",
            display_label="Sake",
        )

        with pytest.raises(ValidationError):
            await service.create_option(data)

class TestGetOptions:
    @pytest.mark.asyncio
    async def test_get_options_success(self, service, mock_repo, sample_orm_option):
        mock_repo.get_options.return_value = ([sample_orm_option], 1)
        mock_repo.check_usage.return_value = 5

        result = await service.get_options("person", "wine_types")

        assert result.total == 1
        assert len(result.items) == 1
        assert result.items[0].usage_count == 5

class TestUpdateOption:
    @pytest.mark.asyncio
    async def test_update_success(self, service, mock_repo, sample_orm_option):
        sample_orm_option.display_label = "Sake (Premium)"
        mock_repo.update.return_value = sample_orm_option

        data = FieldOptionUpdateDTO(display_label="Sake (Premium)")
        result = await service.update_option(1, data, current_user_id="user-123")

        assert result.display_label == "Sake (Premium)"

class TestDeleteOption:
    @pytest.mark.asyncio
    async def test_soft_delete_success(self, service, mock_repo, sample_orm_option):
        sample_orm_option.is_active = False
        mock_repo.get_by_id.return_value = sample_orm_option
        mock_repo.check_usage.return_value = 0
        mock_repo.soft_delete.return_value = sample_orm_option

        result = await service.delete_option(1, hard_delete=False)

        assert result.success == True
        assert result.soft_deleted == True

    @pytest.mark.asyncio
    async def test_hard_delete_with_usage_fails(self, service, mock_repo, sample_orm_option):
        mock_repo.get_by_id.return_value = sample_orm_option
        mock_repo.check_usage.return_value = 5  # In use

        result = await service.delete_option(1, hard_delete=True)

        assert result.success == False
        assert result.usage_count == 5

    @pytest.mark.asyncio
    async def test_hard_delete_system_option_fails(self, service, mock_repo, sample_orm_option):
        sample_orm_option.is_system = True
        mock_repo.get_by_id.return_value = sample_orm_option
        mock_repo.check_usage.return_value = 0

        with pytest.raises(ValidationError, match="Cannot hard-delete system options"):
            await service.delete_option(1, hard_delete=True)
```

**Acceptance Criteria**:
- [ ] Tests for create (success, invalid entity, invalid field)
- [ ] Tests for get (success, pagination)
- [ ] Tests for update (success, field validation)
- [ ] Tests for delete (soft-delete, hard-delete with usage check, system option protection)
- [ ] Tests for permission checks (skipped in dev, enforced in prod)
- [ ] All tests pass
- [ ] >80% coverage for service methods

---

## Phase 4: API Layer (Days 7-10)

### Task 4.1: Implement FieldOptionsRouter

**Story**: `ADMIN-6: FieldOptionsRouter`
**Points**: 5
**Owner**: Backend Engineer
**Status**: Not Started

**Description**:
Create REST API endpoints for field options CRUD operations.

**Files to Create**:
- `services/api/app/api/routes/field_options.py`

**Implementation Details**:

```python
# app/api/routes/field_options.py
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from app.services.field_option_service import FieldOptionsService
from app.schemas.field_option import (
    FieldOptionCreateDTO,
    FieldOptionUpdateDTO,
    FieldOptionDTO,
    FieldOptionsListDTO,
    FieldOptionDeleteResponseDTO,
)
from app.core.exceptions import ValidationError, RecordNotFoundError, DuplicateRecordError
from app.core.deps import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/field-options",
    tags=["field-options"],
    responses={
        404: {"description": "Option not found"},
        409: {"description": "Duplicate option"},
        422: {"description": "Validation error"},
    },
)

# GET: List options for entity/field
@router.get("", response_model=FieldOptionsListDTO)
async def list_options(
    entity: str = Query(..., description="Entity type: person, gift, occasion, list"),
    field_name: str = Query(..., description="Field name"),
    include_inactive: bool = Query(False, description="Include soft-deleted options"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    service: FieldOptionsService = Depends(),
):
    """Fetch options for entity/field with pagination."""
    try:
        return await service.get_options(
            entity=entity,
            field_name=field_name,
            include_inactive=include_inactive,
            skip=skip,
            limit=limit,
        )
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))

# POST: Create new option
@router.post("", response_model=FieldOptionDTO, status_code=201)
async def create_option(
    data: FieldOptionCreateDTO,
    current_user = Depends(get_current_user),
    service: FieldOptionsService = Depends(),
):
    """Create new field option."""
    try:
        return await service.create_option(
            data=data,
            current_user_id=current_user.id if current_user else None,
        )
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except DuplicateRecordError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to create option: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# GET: Fetch single option
@router.get("/{option_id}", response_model=FieldOptionDTO)
async def get_option(
    option_id: int,
    service: FieldOptionsService = Depends(),
):
    """Fetch single field option by ID."""
    try:
        return await service.get_option(option_id)
    except RecordNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

# PUT: Update option
@router.put("/{option_id}", response_model=FieldOptionDTO)
async def update_option(
    option_id: int,
    data: FieldOptionUpdateDTO,
    current_user = Depends(get_current_user),
    service: FieldOptionsService = Depends(),
):
    """Update field option (label and/or display_order)."""
    try:
        return await service.update_option(
            option_id=option_id,
            data=data,
            current_user_id=current_user.id if current_user else None,
        )
    except RecordNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to update option {option_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# DELETE: Delete option
@router.delete("/{option_id}", response_model=FieldOptionDeleteResponseDTO)
async def delete_option(
    option_id: int,
    hard_delete: bool = Query(False, description="Hard delete (removes record) vs soft-delete (hides from UI)"),
    current_user = Depends(get_current_user),
    service: FieldOptionsService = Depends(),
):
    """Delete field option (soft or hard)."""
    try:
        return await service.delete_option(
            option_id=option_id,
            hard_delete=hard_delete,
            current_user_id=current_user.id if current_user else None,
        )
    except RecordNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to delete option {option_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

**Integration Points**:
- Register router in `app/main.py`: `app.include_router(field_options.router)`
- Ensure `get_current_user` dependency available from `core/deps.py`
- Error handling uses project's standard exception classes

**Acceptance Criteria**:
- [ ] GET endpoint lists options with pagination
- [ ] POST endpoint creates option with 201 status
- [ ] GET single option endpoint returns 404 if not found
- [ ] PUT endpoint updates label/display_order only
- [ ] DELETE endpoint supports hard_delete query parameter
- [ ] All endpoints return proper HTTP status codes (200, 201, 400, 404, 409, 500)
- [ ] Proper error messages in responses
- [ ] OpenAPI documentation auto-generated from schemas
- [ ] All endpoints authenticated and authorized

---

### Task 4.2: Integration Tests for FieldOptionsRouter

**Story**: `ADMIN-19: Integration tests (API)`
**Points**: 5
**Owner**: Backend Engineer
**Status**: Not Started

**Description**:
Write integration tests for all CRUD endpoints using TestClient.

**Files to Create**:
- `services/api/tests/integration/test_field_options_api.py`

**Implementation Details**:

```python
# tests/integration/test_field_options_api.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.models.field_option import FieldOption
from datetime import datetime

client = TestClient(app)

@pytest.fixture
def sample_option(db_session: Session):
    """Create a sample field option for testing."""
    option = FieldOption(
        entity="person",
        field_name="wine_types",
        value="sake",
        display_label="Sake",
        display_order=10,
        is_system=False,
        is_active=True,
    )
    db_session.add(option)
    db_session.commit()
    db_session.refresh(option)
    return option

class TestListOptions:
    def test_list_options_success(self, sample_option):
        response = client.get(
            "/api/field-options",
            params={
                "entity": "person",
                "field_name": "wine_types",
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert len(data["items"]) == 1
        assert data["items"][0]["value"] == "sake"

    def test_list_options_pagination(self, db_session):
        # Create 5 options
        for i in range(5):
            option = FieldOption(
                entity="person",
                field_name="wine_types",
                value=f"wine_{i}",
                display_label=f"Wine {i}",
                is_system=False,
            )
            db_session.add(option)
        db_session.commit()

        # Get first 2
        response = client.get(
            "/api/field-options",
            params={
                "entity": "person",
                "field_name": "wine_types",
                "skip": 0,
                "limit": 2,
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 5
        assert len(data["items"]) == 2

    def test_list_options_missing_entity(self):
        response = client.get(
            "/api/field-options",
            params={"field_name": "wine_types"}
        )
        assert response.status_code == 422  # Validation error

class TestCreateOption:
    def test_create_option_success(self):
        payload = {
            "entity": "person",
            "field_name": "wine_types",
            "value": "sauvignon_blanc",
            "display_label": "Sauvignon Blanc",
            "display_order": 5,
        }
        response = client.post("/api/field-options", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["value"] == "sauvignon_blanc"
        assert data["id"] is not None

    def test_create_option_duplicate(self, sample_option):
        payload = {
            "entity": "person",
            "field_name": "wine_types",
            "value": "sake",  # Duplicate
            "display_label": "Sake",
        }
        response = client.post("/api/field-options", json=payload)
        assert response.status_code == 409  # Conflict

    def test_create_option_invalid_entity(self):
        payload = {
            "entity": "invalid",
            "field_name": "wine_types",
            "value": "sake",
            "display_label": "Sake",
        }
        response = client.post("/api/field-options", json=payload)
        assert response.status_code == 400

class TestGetOption:
    def test_get_option_success(self, sample_option):
        response = client.get(f"/api/field-options/{sample_option.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_option.id
        assert data["value"] == "sake"

    def test_get_option_not_found(self):
        response = client.get("/api/field-options/9999")
        assert response.status_code == 404

class TestUpdateOption:
    def test_update_label_success(self, sample_option):
        payload = {"display_label": "Sake (Premium)"}
        response = client.put(
            f"/api/field-options/{sample_option.id}",
            json=payload
        )
        assert response.status_code == 200
        data = response.json()
        assert data["display_label"] == "Sake (Premium)"

    def test_update_display_order(self, sample_option):
        payload = {"display_order": 20}
        response = client.put(
            f"/api/field-options/{sample_option.id}",
            json=payload
        )
        assert response.status_code == 200
        data = response.json()
        assert data["display_order"] == 20

class TestDeleteOption:
    def test_soft_delete_success(self, sample_option):
        response = client.delete(
            f"/api/field-options/{sample_option.id}",
            params={"hard_delete": False}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["soft_deleted"] == True

    def test_hard_delete_success(self, sample_option):
        response = client.delete(
            f"/api/field-options/{sample_option.id}",
            params={"hard_delete": True}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["soft_deleted"] == False

    def test_hard_delete_not_found(self):
        response = client.delete(
            "/api/field-options/9999",
            params={"hard_delete": True}
        )
        assert response.status_code == 404
```

**Acceptance Criteria**:
- [ ] All CRUD endpoints tested
- [ ] Success paths verified (proper status codes and response structure)
- [ ] Error paths tested (404, 409, 400, etc.)
- [ ] Pagination tested
- [ ] Soft-delete and hard-delete both tested
- [ ] Validation errors caught
- [ ] All tests pass
- [ ] Integration tests >70% coverage

---

### Task 4.3: Register Router in Main App

**Story**: `ADMIN-6: FieldOptionsRouter` (Integration subset)
**Points**: 1 (included in 4.1 points)
**Owner**: Backend Engineer
**Status**: Not Started

**Description**:
Register the FieldOptionsRouter in the FastAPI main application.

**Files to Modify**:
- `services/api/app/main.py`

**Implementation**:

```python
# In app/main.py, add:
from app.api.routes import field_options

# In app setup section:
app.include_router(field_options.router)
```

**Acceptance Criteria**:
- [ ] Router registered before other routes
- [ ] No import errors
- [ ] Endpoints accessible at `/api/field-options`
- [ ] OpenAPI docs show new endpoints

---

## Phase 1-4 Summary

**Total Story Points**: 23 points
**Duration**: 2-2.5 weeks (1 developer)

### Deliverables

- [x] Database: `field_options` table created, migration seeding all hardcoded values
- [x] ORM Model: `FieldOption` SQLAlchemy model with all properties
- [x] Pydantic Schemas: DTOs for CRUD operations
- [x] Repository: `FieldOptionsRepository` with CRUD + utility methods
- [x] Service: `FieldOptionsService` with business logic and validation
- [x] API: `FieldOptionsRouter` with 4 main REST endpoints
- [x] Tests: Unit tests (repository, service) + Integration tests (API)
- [x] Documentation: Inline code comments and error messages

### Quality Metrics

- [ ] Unit test coverage >80%
- [ ] Integration test coverage >70%
- [ ] All tests passing
- [ ] No n+1 queries
- [ ] CRUD response time <200ms (p95)
- [ ] Migration reversible
- [ ] No SQL injection vulnerabilities

### Next Phase

Once Phase 1-4 complete and tests passing, proceed to **Phase 5-8: Frontend & Validation** (`admin-field-options-v1/phase-5-8-frontend.md`)

---

**Document Version**: 1.0
**Status**: Ready for Phase 1 Start
**Last Updated**: 2025-12-20
