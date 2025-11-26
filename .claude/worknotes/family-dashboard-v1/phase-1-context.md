---
type: context
prd: "family-dashboard-v1"
phase: 1
title: "Phase 1 Implementation Context - Database Foundation"
status: not_started
created: 2025-11-26
updated: 2025-11-26
owners: ["data-layer-expert"]
key_decisions: []
patterns_established: []
gotchas: []
dependencies:
  external:
    - name: "PostgreSQL"
      version: "16+"
      purpose: "Primary database"
    - name: "SQLAlchemy"
      version: "2.0+"
      purpose: "ORM"
    - name: "Alembic"
      version: "1.13+"
      purpose: "Database migrations"
    - name: "Pydantic"
      version: "2.0+"
      purpose: "Data validation"
  internal: []
files_created: []
files_modified: []
---

# Phase 1 Implementation Context - Database Foundation

**Phase**: 1 of 9
**Status**: Not Started
**Agent**: data-layer-expert

---

## Implementation Decisions

*Record key technical decisions as they are made during implementation.*

### Database Schema Decisions

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| *Example: Soft delete strategy* | *Timestamp field vs boolean flag* | *deleted_at timestamp* | *Enables restoration and audit* |

### Model Patterns

| Pattern | Description | Location | Usage |
|---------|-------------|----------|-------|
| *Example: Base model* | *Shared id, created_at, updated_at* | *models/base.py* | *All entities inherit* |

---

## Architecture Notes

### Entity Relationships

```
User (1) ────< (N) List (N) >──── (1) Occasion
                  │
                  │ (1)
                  ▼
              ListItem (N) >──── (1) Gift
                  │
                  │ (N)
                  ▼
               Comment

Person (1) ────< (N) List
Person (N) ────< (N) Tag >──── (N) Gift
```

### Enum Definitions

```python
# List types
ListType = Enum('ListType', ['GIFT', 'IDEA', 'WISHLIST'])

# List visibility
ListVisibility = Enum('ListVisibility', ['ALL_USERS', 'HIDDEN_FROM_TARGET'])

# Occasion types
OccasionType = Enum('OccasionType', ['CHRISTMAS', 'BIRTHDAY', 'ANNIVERSARY', 'OTHER'])

# ListItem status
ListItemStatus = Enum('ListItemStatus', [
    'IDEA', 'SHORTLISTED', 'BUYING', 'ORDERED',
    'DELIVERED', 'WRAPPED', 'GIFTED'
])

# Comment parent types
CommentParentType = Enum('CommentParentType', [
    'PERSON', 'OCCASION', 'LIST', 'GIFT', 'LIST_ITEM'
])
```

---

## Gotchas and Learnings

*Document unexpected issues, edge cases, and learnings as they occur.*

| Issue | Context | Resolution |
|-------|---------|------------|
| *Example: JSON column* | *PostgreSQL JSONB vs JSON* | *Use JSONB for indexing support* |

---

## Files Created

*Track files created during this phase:*

```
services/api/
├── app/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── user.py
│   │   ├── person.py
│   │   ├── occasion.py
│   │   ├── list.py
│   │   ├── gift.py
│   │   ├── list_item.py
│   │   ├── tag.py
│   │   └── comment.py
│   └── core/
│       └── database.py
├── alembic/
│   ├── env.py
│   └── versions/
│       └── 001_initial_schema.py
└── pyproject.toml
```

---

## Integration Points

### For Phase 2 (Repository Layer)

- All models export SQLAlchemy table references
- Base model provides common CRUD fields
- Relationship loading strategies defined (lazy vs eager)
- Session factory available from database.py

### For Phase 3 (Service Layer)

- Enum values match DTO validation
- JSON fields (sizes, interests) have defined structure
- Foreign key constraints enable cascade behavior

---

## Testing Notes

*Document testing approach and fixtures:*

```python
# Recommended fixtures for Phase 1
@pytest.fixture
async def db_session():
    """Async session for testing."""
    pass

@pytest.fixture
def sample_user():
    """Sample user for testing."""
    pass
```

---

**Last Updated**: 2025-11-26
