"""Generic base repository with async CRUD operations and cursor-based pagination."""

from typing import Any, Generic, TypeVar

from sqlalchemy import asc, desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import BaseModel

# TypeVar bound to BaseModel for generic repository
T = TypeVar("T", bound=BaseModel)


class BaseRepository(Generic[T]):
    """
    Generic base repository providing async CRUD operations.

    Features:
    - Async SQLAlchemy 2.0 patterns
    - Cursor-based pagination (better performance than offset)
    - Full type hints with Generic[T]
    - Dependency injection via constructor

    Type Parameters:
        T: The SQLAlchemy model class (must inherit from BaseModel)

    Example:
        ```python
        class GiftRepository(BaseRepository[Gift]):
            def __init__(self, session: AsyncSession):
                super().__init__(session, Gift)
        ```
    """

    def __init__(self, session: AsyncSession, model: type[T]):
        """
        Initialize repository with database session and model class.

        Args:
            session: SQLAlchemy async session
            model: SQLAlchemy model class
        """
        self.session = session
        self.model = model

    async def create(self, obj_in: dict[str, Any]) -> T:
        """
        Create a new database record.

        Args:
            obj_in: Dictionary of fields to create the object

        Returns:
            Created model instance with ID and timestamps

        Example:
            ```python
            gift = await repo.create({"name": "LEGO", "price": 49.99})
            ```
        """
        db_obj = self.model(**obj_in)
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def get(self, id: int) -> T | None:
        """
        Get a single record by ID.

        Args:
            id: Primary key of the record

        Returns:
            Model instance if found, None otherwise

        Example:
            ```python
            gift = await repo.get(123)
            if gift:
                print(gift.name)
            ```
        """
        stmt = select(self.model).where(self.model.id == id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_multi(
        self,
        cursor: int | None = None,
        limit: int = 50,
        order_by: str = "id",
        descending: bool = False,
    ) -> tuple[list[T], bool, int | None]:
        """
        Get multiple records with cursor-based pagination.

        Cursor-based pagination provides better performance than offset-based
        pagination, especially for large datasets. It uses the last item's ID
        as the cursor for the next page.

        Args:
            cursor: ID of the last item from the previous page (None for first page)
            limit: Maximum number of items to return (default: 50)
            order_by: Field name to order by (default: "id")
            descending: If True, order descending; if False, ascending (default: False)

        Returns:
            Tuple of (items, has_more, next_cursor):
            - items: List of model instances (up to `limit` items)
            - has_more: True if more items exist after this page
            - next_cursor: ID to use for next page (None if no more items)

        Example:
            ```python
            # First page
            items, has_more, next_cursor = await repo.get_multi(limit=20)

            # Second page
            if has_more:
                items, has_more, next_cursor = await repo.get_multi(
                    cursor=next_cursor,
                    limit=20
                )
            ```

        Note:
            Fetches limit+1 items to efficiently determine if more pages exist,
            but only returns `limit` items to the caller.
        """
        # Build query
        stmt = select(self.model)

        # Apply cursor filtering if provided
        if cursor is not None:
            order_column = getattr(self.model, order_by)
            if descending:
                stmt = stmt.where(order_column < cursor)
            else:
                stmt = stmt.where(order_column > cursor)

        # Apply ordering
        order_column = getattr(self.model, order_by)
        stmt = stmt.order_by(desc(order_column) if descending else asc(order_column))

        # Fetch limit+1 to check if more items exist
        stmt = stmt.limit(limit + 1)

        # Execute query
        result = await self.session.execute(stmt)
        items = list(result.scalars().all())

        # Check if more items exist
        has_more = len(items) > limit

        # Return only the requested limit
        if has_more:
            items = items[:limit]

        # Determine next cursor (ID of last item)
        next_cursor = getattr(items[-1], order_by) if items and has_more else None

        return items, has_more, next_cursor

    async def update(self, id: int, obj_in: dict[str, Any]) -> T | None:
        """
        Update an existing record.

        Args:
            id: Primary key of the record to update
            obj_in: Dictionary of fields to update

        Returns:
            Updated model instance if found, None if not found

        Example:
            ```python
            updated_gift = await repo.update(123, {"price": 59.99})
            if updated_gift:
                print(f"Updated price: {updated_gift.price}")
            ```

        Note:
            Only updates fields provided in obj_in. Does not modify other fields.
        """
        # Get existing record
        db_obj = await self.get(id)
        if db_obj is None:
            return None

        # Update fields
        for field, value in obj_in.items():
            setattr(db_obj, field, value)

        # Commit changes
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def delete(self, id: int) -> bool:
        """
        Delete a record by ID.

        Args:
            id: Primary key of the record to delete

        Returns:
            True if record was deleted, False if not found

        Example:
            ```python
            deleted = await repo.delete(123)
            if deleted:
                print("Gift deleted successfully")
            else:
                print("Gift not found")
            ```
        """
        db_obj = await self.get(id)
        if db_obj is None:
            return False

        await self.session.delete(db_obj)
        await self.session.commit()
        return True
