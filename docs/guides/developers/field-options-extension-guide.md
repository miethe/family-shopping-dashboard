---
title: Field Options Extension Guide
description: Step-by-step guide for developers to extend the field options system to new entities
audience: Backend developers adding features to new entities
tags:
  - field-options
  - admin
  - extensibility
  - backend
created: 2025-12-22
updated: 2025-12-22
---

# Extending Field Options to New Entities

## Overview

The field options system provides admin-configurable dropdown and select values across the MeatyGifts application. This guide explains how to extend this system when you need to add field options support to new entities beyond the current `person`, `gift`, `occasion`, and `list`.

The system uses a **layered architecture** where options flow from the admin API through services and repositories to the database:

```
FieldOptionsRouter → FieldOptionsService → FieldOptionsRepository → field_options table
```

---

## When to Use Field Options

Field options are ideal for:

- **Dynamic dropdown values** that users (admins) can manage
- **Options that change frequently** without requiring code changes
- **Entity-specific values** like priority levels, status types, categories
- **Multi-valued attributes** like wine types, hobbies, dietary restrictions

Examples in current system:
- `person.wine_types`: ["red_wine", "white_wine", "sparkling"]
- `gift.priority`: ["low", "medium", "high"]
- `list.visibility`: ["private", "shared", "public"]

---

## Architecture Summary

### Database Layer

Field options are stored in a single `field_options` table with:

```sql
field_options
├── id (primary key)
├── entity (string: person, gift, occasion, list)
├── field_name (string: wine_types, priority, etc.)
├── value (string: red_wine, low, private - the key)
├── display_label (string: Red Wine, Low Priority, Private - the UI label)
├── display_order (integer: sort order in dropdowns)
├── is_system (boolean: true for hardcoded defaults)
├── is_active (boolean: false for soft-deleted)
├── created_by, updated_by, created_at, updated_at
└── unique constraint: (entity, field_name, value)
```

### Validation Model

The `VALID_ENTITIES` and `VALID_FIELDS` sets in schemas control what combinations are allowed:

```python
VALID_ENTITIES = {"person", "gift", "occasion", "list"}

VALID_FIELDS = {
    "person": {"wine_types", "beverage_prefs", ...},
    "gift": {"priority", "status"},
    "occasion": {"type"},
    "list": {"type", "visibility"},
}
```

---

## Adding Support for a New Entity

### Step 1: Update Schema Validation

**File**: `services/api/app/schemas/field_option.py`

Add the new entity to the validation sets:

```python
# Add entity to the valid set
VALID_ENTITIES = {"person", "gift", "occasion", "list", "news"}  # ← added "news"

# Add valid field names for the new entity
VALID_FIELDS = {
    "person": {...},
    "gift": {...},
    "occasion": {...},
    "list": {...},
    "news": {  # ← new entity
        "category",      # news.category field
        "priority",      # news.priority field
        "status",        # news.status field
    },
}
```

**Naming Conventions**:
- Entity names: lowercase, single word (e.g., `news`, `tag`, `event`)
- Field names: lowercase with underscores (e.g., `wine_types`, `favorite_cuisines`)
- Values: lowercase with underscores (e.g., `red_wine`, `high_priority`)

---

### Step 2: Seed Initial Options (Optional but Recommended)

**Choice A: Alembic Migration**

Create a migration for system options:

```bash
cd services/api
uv run alembic revision -m "add_news_field_options"
```

Edit the generated migration file:

```python
# alembic/versions/xxx_add_news_field_options.py
from alembic import op
import sqlalchemy as sa
from datetime import datetime

def upgrade():
    """Add system field options for news entity."""
    # Use raw SQL to insert seeded options
    op.execute("""
        INSERT INTO field_options
        (entity, field_name, value, display_label, display_order, is_system, is_active, created_at, updated_at)
        VALUES
        -- news.category options
        ('news', 'category', 'breaking', 'Breaking News', 0, true, true, NOW(), NOW()),
        ('news', 'category', 'feature', 'Feature Story', 1, true, true, NOW(), NOW()),
        ('news', 'category', 'opinion', 'Opinion', 2, true, true, NOW(), NOW()),

        -- news.priority options
        ('news', 'priority', 'low', 'Low', 0, true, true, NOW(), NOW()),
        ('news', 'priority', 'medium', 'Medium', 1, true, true, NOW(), NOW()),
        ('news', 'priority', 'high', 'High', 2, true, true, NOW(), NOW()),

        -- news.status options
        ('news', 'status', 'draft', 'Draft', 0, true, true, NOW(), NOW()),
        ('news', 'status', 'published', 'Published', 1, true, true, NOW(), NOW()),
        ('news', 'status', 'archived', 'Archived', 2, true, true, NOW(), NOW())
    """)

def downgrade():
    """Remove seeded field options."""
    op.execute("""
        DELETE FROM field_options
        WHERE entity = 'news' AND is_system = true
    """)
```

Apply the migration:

```bash
uv run alembic upgrade head
```

**Choice B: Data Seeding Script** (for development)

Create `services/api/app/data/field_options_seed.py`:

```python
"""Seed field options for development."""

from sqlalchemy.ext.asyncio import AsyncSession
from app.models.field_option import FieldOption

NEWS_OPTIONS = [
    # news.category
    {"entity": "news", "field_name": "category", "value": "breaking", "display_label": "Breaking News", "display_order": 0},
    {"entity": "news", "field_name": "category", "value": "feature", "display_label": "Feature Story", "display_order": 1},

    # news.priority
    {"entity": "news", "field_name": "priority", "value": "low", "display_label": "Low", "display_order": 0},
    {"entity": "news", "field_name": "priority", "value": "high", "display_label": "High", "display_order": 1},
]

async def seed_field_options(session: AsyncSession):
    """Seed field options from NEWS_OPTIONS."""
    for data in NEWS_OPTIONS:
        option = FieldOption(**data, is_system=True, is_active=True)
        session.add(option)
    await session.commit()
```

---

### Step 3: Create Entity Validators (Optional)

If your entity needs to validate that a value comes from the field options, implement a validator.

**Example**: Validating `News.category` must be a valid news category

Create or update `services/api/app/schemas/news.py`:

```python
"""News schemas for validation and DTOs."""

from pydantic import BaseModel, field_validator
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.field_option import FieldOptionRepository

class NewsCreate(BaseModel):
    title: str
    content: str
    category: str  # Must be valid news.category
    priority: str  # Must be valid news.priority

    @field_validator("category")
    @classmethod
    async def validate_category(cls, v: str, info) -> str:
        """Ensure category is a valid news category option."""
        # Get session from validation context (requires special setup in router)
        db = info.context.get("db") if info.context else None
        if not db:
            # In tests or without context, skip DB validation
            return v

        repo = FieldOptionRepository(db)
        options, _ = await repo.get_options(
            entity="news",
            field_name="category",
            include_inactive=False
        )
        valid_values = {opt.value for opt in options}

        if v not in valid_values:
            raise ValueError(
                f"category must be one of {sorted(valid_values)}, got '{v}'"
            )
        return v
```

**Alternative: Service-Level Validation** (simpler, recommended)

In your service layer, check validity before database operations:

```python
# app/services/news_service.py
from app.repositories.field_option import FieldOptionRepository
from app.core.exceptions import ValidationError

class NewsService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = FieldOptionRepository(session)

    async def create_news(self, data: NewsCreate) -> NewsResponse:
        """Create news with category validation."""
        # Validate category is a valid option
        valid_categories = await self._get_valid_field_values(
            entity="news",
            field_name="category"
        )

        if data.category not in valid_categories:
            raise ValidationError(
                code="INVALID_CATEGORY",
                message=f"category must be one of {sorted(valid_categories)}",
                details={"valid_categories": sorted(valid_categories)}
            )

        # ... rest of create logic

    async def _get_valid_field_values(
        self,
        entity: str,
        field_name: str
    ) -> set[str]:
        """Get all valid values for an entity field."""
        options, _ = await self.repo.get_options(
            entity=entity,
            field_name=field_name,
            include_inactive=False
        )
        return {opt.value for opt in options}
```

---

### Step 4: Update Admin UI

**File**: `apps/web/components/features/admin/EntityTab.tsx`

Add the new entity to the configuration:

```typescript
const ENTITY_FIELDS: Record<string, FieldConfig[]> = {
  person: [...],
  gift: [...],
  occasion: [...],
  list: [...],
  news: [  // ← new entity
    { name: 'category', label: 'News Category', category: 'Classification' },
    { name: 'priority', label: 'Priority', category: 'Lifecycle' },
    { name: 'status', label: 'Status', category: 'Publishing' },
  ],
};
```

The UI automatically:
- Shows the "News" tab in the admin interface
- Displays field management controls
- Allows admins to add, edit, and delete options

---

### Step 5: Add Usage Tracking (Optional)

Track how many records use each option (helps prevent deletions that would break data).

**File**: `services/api/app/repositories/field_option.py`

Implement the `_check_usage()` method for your entity:

```python
async def _check_usage(self, entity: str, value: str) -> int:
    """
    Count how many records use this option value.

    Returns:
        Number of records using this option
    """
    if entity == "news":
        # Count news records using this category value
        stmt = select(func.count()).select_from(News).where(
            News.category == value
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() or 0

    # Handle other entities...
```

Update the service to call this:

```python
# app/services/field_option.py
async def get_option(self, option_id: int) -> FieldOptionResponse:
    """Get single field option with usage count."""
    option = await self.repo.get_by_id(option_id)
    if option is None:
        raise NotFoundError(...)

    # Calculate usage for this entity/value
    usage_count = await self.repo._check_usage(option.entity, option.value)

    return self._to_response(option, usage_count=usage_count)
```

---

## Testing New Entity Integration

### Backend Tests

**File**: `tests/integration/test_field_options.py`

```python
import pytest
from app.schemas.field_option import FieldOptionCreate
from app.services.field_option import FieldOptionService

@pytest.mark.asyncio
async def test_create_news_category_option(db_session):
    """Test creating a category option for news entity."""
    service = FieldOptionService(db_session)

    result = await service.create_option(
        data=FieldOptionCreate(
            entity="news",
            field_name="category",
            value="breaking",
            display_label="Breaking News",
            display_order=0
        ),
        current_user_id=1
    )

    assert result.entity == "news"
    assert result.field_name == "category"
    assert result.value == "breaking"
    assert result.display_label == "Breaking News"


@pytest.mark.asyncio
async def test_invalid_news_field_rejected(db_session):
    """Test that invalid field names are rejected."""
    service = FieldOptionService(db_session)

    with pytest.raises(ValidationError) as exc_info:
        await service.create_option(
            data=FieldOptionCreate(
                entity="news",
                field_name="invalid_field",  # Not in VALID_FIELDS
                value="test",
                display_label="Test",
                display_order=0
            )
        )

    assert exc_info.value.code == "INVALID_FIELD"


@pytest.mark.asyncio
async def test_news_category_validator(db_session):
    """Test that news service validates category against options."""
    # First, seed a category option
    service = FieldOptionService(db_session)
    await service.create_option(
        FieldOptionCreate(
            entity="news",
            field_name="category",
            value="breaking",
            display_label="Breaking",
            display_order=0
        )
    )

    # Create news service with validator
    news_service = NewsService(db_session)

    # Valid category should work
    result = await news_service.create_news(
        NewsCreate(
            title="Breaking News",
            content="...",
            category="breaking",  # Valid
            priority="high"
        )
    )
    assert result.category == "breaking"

    # Invalid category should fail
    with pytest.raises(ValidationError) as exc_info:
        await news_service.create_news(
            NewsCreate(
                title="Invalid News",
                content="...",
                category="invalid",  # Not seeded
                priority="high"
            )
        )
    assert exc_info.value.code == "INVALID_CATEGORY"
```

### Frontend Tests

**File**: `apps/web/__tests__/components/admin/EntityTab.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { EntityTab } from '@/components/features/admin/EntityTab';

test('renders news entity tab', () => {
  render(<EntityTab entity="news" />);

  // Should display news fields grouped by category
  expect(screen.getByText('News Category')).toBeInTheDocument();
  expect(screen.getByText('Priority')).toBeInTheDocument();
  expect(screen.getByText('Status')).toBeInTheDocument();
});

test('news tab shows correct categories', () => {
  render(<EntityTab entity="news" />);

  // Fields should be organized by category
  expect(screen.getByText('Classification')).toBeInTheDocument(); // category field category
  expect(screen.getByText('Lifecycle')).toBeInTheDocument();       // priority field category
  expect(screen.getByText('Publishing')).toBeInTheDocument();      // status field category
});
```

---

## Complete Example: Adding "News" Entity

Here's a full walkthrough of adding field options support to a hypothetical `news` entity.

### 1. Update Schema (`services/api/app/schemas/field_option.py`)

```python
VALID_ENTITIES = {"person", "gift", "occasion", "list", "news"}

VALID_FIELDS = {
    "person": {...},
    "gift": {...},
    "occasion": {...},
    "list": {...},
    "news": {
        "category",
        "priority",
        "status",
    },
}
```

### 2. Create Migration

```bash
uv run alembic revision -m "seed_news_field_options"
```

Insert seed data in migration.

### 3. Create News Schemas (`services/api/app/schemas/news.py`)

```python
from pydantic import BaseModel

class NewsCreate(BaseModel):
    title: str
    content: str
    category: str  # Will be validated in service
    priority: str

class NewsResponse(BaseModel):
    id: int
    title: str
    content: str
    category: str
    priority: str
```

### 4. Create News Service (`services/api/app/services/news_service.py`)

```python
from app.repositories.field_option import FieldOptionRepository
from app.core.exceptions import ValidationError

class NewsService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.option_repo = FieldOptionRepository(session)

    async def create_news(
        self,
        data: NewsCreate,
        current_user_id: int | None = None
    ) -> NewsResponse:
        # Validate category
        categories = await self._get_valid_values("news", "category")
        if data.category not in categories:
            raise ValidationError(
                code="INVALID_CATEGORY",
                message=f"Invalid category: {data.category}"
            )

        # Create news...
```

### 5. Create News Router (`services/api/app/api/news.py`)

```python
from fastapi import APIRouter
from app.schemas.news import NewsCreate, NewsResponse
from app.services.news_service import NewsService

router = APIRouter(prefix="/news", tags=["news"])

@router.post("", response_model=NewsResponse, status_code=201)
async def create_news(
    data: NewsCreate,
    db: AsyncSession = Depends(get_db),
    current_user_id: int = Depends(get_current_user),
):
    service = NewsService(db)
    return await service.create_news(data, current_user_id)
```

### 6. Update Admin UI (`apps/web/components/features/admin/EntityTab.tsx`)

```typescript
const ENTITY_FIELDS: Record<string, FieldConfig[]> = {
  // ... existing entities ...
  news: [
    { name: 'category', label: 'News Category', category: 'Classification' },
    { name: 'priority', label: 'Priority', category: 'Lifecycle' },
    { name: 'status', label: 'Status', category: 'Publishing' },
  ],
};
```

### 7. Write Tests

Create integration tests and frontend tests as shown above.

---

## Best Practices

1. **Use Lowercase with Underscores**: Normalize values to `snake_case` - they're already handled by the schema validator

2. **Mark System Defaults**: Set `is_system=True` for options seeded in migrations so they can't be hard-deleted

3. **Document Field Purposes**: In comments/PR description, explain what each field represents and what values are valid

4. **Implement Usage Tracking**: Before allowing hard deletes, check if the option is used by any records

5. **Validate in Service Layer**: Keep validation logic in services, not mixed into repositories or routes

6. **Group UI Fields by Category**: In the admin UI, organize related fields with meaningful category names

7. **Write Tests First**: Test validators and API endpoints before deploying to production

---

## Common Gotchas

### Issue: "Entity not recognized" error

**Cause**: Forgot to add entity to `VALID_ENTITIES`

**Fix**: Add to `services/api/app/schemas/field_option.py`:
```python
VALID_ENTITIES = {"person", "gift", "occasion", "list", "your_entity"}
```

### Issue: Admin UI doesn't show new entity

**Cause**: Forgot to add to `ENTITY_FIELDS` config

**Fix**: Update `apps/web/components/features/admin/EntityTab.tsx`:
```typescript
your_entity: [
  { name: 'field1', label: 'Field 1', category: 'Category' },
]
```

### Issue: Validation always accepts invalid values

**Cause**: Service-level validator not implemented, or wrong field name in validator

**Fix**: Implement `_get_valid_field_values()` in your service and call before creating records

### Issue: Migration fails with "unique constraint"

**Cause**: Trying to seed options that already exist

**Fix**: Drop database and re-run migrations, or check if records already exist before inserting

---

## Architecture Decision: When to Use Field Options

| Scenario | Use Field Options? | Why |
|----------|-------------------|-----|
| Predefined status values (draft, published, archived) | Yes | Values don't change per-user, admin should control |
| User preferences (favorite color, timezone) | No | Each user has unique values, belongs in user_preferences table |
| Category tags for content | Yes | Shared across all records, admins manage options |
| Per-person configuration | No | Use a user_settings or entity_config table instead |
| Frequently changing values | Yes | Admin can update without code changes |
| Hardcoded enum in code | Consider | If it will never change, enum is fine; if might grow, use field_options |

---

## Troubleshooting

**Q: How do I list all valid entities?**
A: Check `VALID_ENTITIES` in `services/api/app/schemas/field_option.py`

**Q: How do I see all options for an entity?**
A: Use the API:
```bash
curl http://localhost:8000/api/field-options?entity=news&field_name=category
```

**Q: Can I change an option's `value` after creation?**
A: No - values are immutable. Other entities may reference them. Only `display_label` and `display_order` can be updated.

**Q: What happens if I delete an option that's still in use?**
A: Soft delete (default) works fine - sets `is_active=False`. Hard delete is blocked if `usage_count > 0`.

---

## References

- **Field Options API**: `/services/api/app/api/field_options.py`
- **Field Options Service**: `/services/api/app/services/field_option.py`
- **Field Options Repository**: `/services/api/app/repositories/field_option.py`
- **Field Options Schema**: `/services/api/app/schemas/field_option.py`
- **Admin UI**: `/apps/web/components/features/admin/EntityTab.tsx`
- **Architecture Guide**: `/docs/architecture/field-options-architecture.md`
