# Repository Layer

The repository layer provides database access operations following the Repository Pattern.

## Architecture

```text
Router → Service → Repository → Database
```

**Rule**: Repositories own ALL database queries. Services never access the database directly.

## BaseRepository

Generic repository providing async CRUD operations with cursor-based pagination.

### Features

- **Async SQLAlchemy 2.0**: All operations use `async`/`await`
- **Cursor-based pagination**: Better performance than offset-based pagination
- **Type safety**: Full Generic[T] type hints
- **Dependency injection**: Session passed via constructor

### Basic Usage

```python
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories import BaseRepository
from app.models.gift import Gift

class GiftRepository(BaseRepository[Gift]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Gift)
```

### CRUD Operations

#### Create

```python
gift = await repo.create({
    "name": "LEGO Star Wars",
    "price": 49.99,
    "url": "https://example.com/product"
})
# Returns: Gift instance with id, created_at, updated_at
```

#### Read Single

```python
gift = await repo.get(123)
if gift:
    print(f"Found: {gift.name}")
else:
    print("Not found")
```

#### Read Multiple (Paginated)

```python
# First page
items, has_more, next_cursor = await repo.get_multi(limit=20)

# Second page
if has_more:
    items, has_more, next_cursor = await repo.get_multi(
        cursor=next_cursor,
        limit=20
    )

# Custom ordering (descending by created_at)
items, has_more, next_cursor = await repo.get_multi(
    limit=20,
    order_by="created_at",
    descending=True
)
```

**Cursor Pagination Benefits**:
- Constant performance regardless of page number
- No missed/duplicate items when data changes
- Works well with real-time data

#### Update

```python
updated_gift = await repo.update(123, {
    "price": 59.99,
    "status": "purchased"
})
if updated_gift:
    print(f"Updated: {updated_gift.price}")
else:
    print("Gift not found")
```

#### Delete

```python
deleted = await repo.delete(123)
if deleted:
    print("Gift deleted")
else:
    print("Gift not found")
```

## Creating Domain-Specific Repositories

Extend `BaseRepository` to add domain-specific queries:

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories import BaseRepository
from app.models.gift import Gift

class GiftRepository(BaseRepository[Gift]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Gift)

    async def get_by_list_id(self, list_id: int) -> list[Gift]:
        """Get all gifts for a specific list."""
        stmt = select(Gift).where(Gift.list_id == list_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_status(
        self,
        list_id: int,
        status: str
    ) -> list[Gift]:
        """Get gifts by status within a list."""
        stmt = (
            select(Gift)
            .where(Gift.list_id == list_id)
            .where(Gift.status == status)
            .order_by(Gift.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def search_by_name(
        self,
        list_id: int,
        search_term: str
    ) -> list[Gift]:
        """Search gifts by name (case-insensitive)."""
        stmt = (
            select(Gift)
            .where(Gift.list_id == list_id)
            .where(Gift.name.ilike(f"%{search_term}%"))
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
```

## Dependency Injection Pattern

Use FastAPI's dependency injection to provide repositories to services:

```python
# app/core/deps.py
from collections.abc import AsyncGenerator
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.repositories.gift_repository import GiftRepository

async def get_gift_repository(
    session: AsyncSession = Depends(get_db)
) -> GiftRepository:
    """Dependency for GiftRepository."""
    return GiftRepository(session)
```

```python
# app/services/gift_service.py
from fastapi import Depends
from app.repositories.gift_repository import GiftRepository
from app.core.deps import get_gift_repository

class GiftService:
    def __init__(
        self,
        repo: GiftRepository = Depends(get_gift_repository)
    ):
        self.repo = repo

    async def get_all_gifts(self, list_id: int):
        return await self.repo.get_by_list_id(list_id)
```

## Best Practices

### ✓ Do

- Return ORM models from repositories
- Use async/await for all database operations
- Add domain-specific query methods to specialized repositories
- Use type hints with Generic[T]
- Handle None returns gracefully in services

### ✗ Don't

- Don't return DTOs from repositories (that's the service's job)
- Don't raise exceptions for "not found" (return None instead)
- Don't mix sync and async operations
- Don't put business logic in repositories
- Don't access the database directly from services

## Error Handling

Repositories return `None` for not found cases. Let services decide how to handle:

```python
# Repository (returns None)
async def get(self, id: int) -> Gift | None:
    ...

# Service (handles None)
async def get_gift(self, id: int) -> GiftDTO:
    gift = await self.repo.get(id)
    if gift is None:
        raise HTTPException(status_code=404, detail="Gift not found")
    return GiftDTO.from_orm(gift)
```

## Transaction Management

Repositories commit changes automatically. For complex multi-step operations, use service-level transactions:

```python
# Service controls transaction
async def create_list_with_gifts(self, data: CreateListDTO):
    # Create list
    gift_list = await self.list_repo.create(data.list_data)

    # Create gifts (all in same session/transaction)
    for gift_data in data.gifts:
        gift_data["list_id"] = gift_list.id
        await self.gift_repo.create(gift_data)

    # Both committed together
```

## Testing Repositories

Use pytest with async support:

```python
import pytest
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from app.repositories.gift_repository import GiftRepository

@pytest.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    # Setup tables...
    async with AsyncSession(engine) as session:
        yield session

@pytest.mark.asyncio
async def test_create_gift(db_session):
    repo = GiftRepository(db_session)
    gift = await repo.create({
        "name": "Test Gift",
        "price": 19.99
    })
    assert gift.id is not None
    assert gift.name == "Test Gift"

@pytest.mark.asyncio
async def test_cursor_pagination(db_session):
    repo = GiftRepository(db_session)

    # Create test data
    for i in range(25):
        await repo.create({"name": f"Gift {i}", "price": 10.0})

    # First page
    items, has_more, cursor = await repo.get_multi(limit=10)
    assert len(items) == 10
    assert has_more is True
    assert cursor is not None

    # Second page
    items2, has_more2, cursor2 = await repo.get_multi(cursor=cursor, limit=10)
    assert len(items2) == 10
    assert has_more2 is True

    # Third page (partial)
    items3, has_more3, cursor3 = await repo.get_multi(cursor=cursor2, limit=10)
    assert len(items3) == 5
    assert has_more3 is False
    assert cursor3 is None
```

## Migration from Offset Pagination

If migrating from offset-based pagination:

**Before (offset-based)**:
```python
items = await repo.get_multi(skip=20, limit=10)  # Slow for large offsets
```

**After (cursor-based)**:
```python
# First page
items, has_more, cursor = await repo.get_multi(limit=10)

# Next page
items, has_more, cursor = await repo.get_multi(cursor=cursor, limit=10)
```

**Benefits**:
- Constant O(1) performance vs O(n) with offset
- No duplicate/missing items when data changes
- Simpler for infinite scroll UIs

## See Also

- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/en/20/)
- [FastAPI Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
