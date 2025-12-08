"""Group repository for database operations on Group entities."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.group import Group
from app.repositories.base import BaseRepository


class GroupRepository(BaseRepository[Group]):
    """
    Repository for Group-specific database operations.

    Extends BaseRepository with group-specific queries including:
    - Eager loading of group members (persons)
    - Cursor-based pagination with member counts

    Example:
        ```python
        repo = GroupRepository(session)

        # Get group with all members loaded
        group = await repo.get_with_members(group_id=1)
        if group:
            for person in group.members:
                print(person.display_name)

        # Get paginated list with members
        groups, has_more, next_cursor = await repo.get_multi_with_members(limit=20)
        ```
    """

    def __init__(self, session: AsyncSession):
        """
        Initialize GroupRepository with async session.

        Args:
            session: SQLAlchemy async session for database operations
        """
        super().__init__(session, Group)

    async def get_with_members(self, group_id: int) -> Group | None:
        """
        Get a group by ID with all members eagerly loaded.

        Uses selectinload for efficient eager loading to avoid N+1 queries
        when accessing the group's members.

        Args:
            group_id: Primary key of the group to retrieve

        Returns:
            Group instance with members loaded if found, None otherwise

        Example:
            ```python
            group = await repo.get_with_members(1)
            if group:
                # Members are already loaded - no additional DB queries
                print(f"{group.name} has {len(group.members)} members")
                for person in group.members:
                    print(f"  - {person.display_name}")
            ```
        """
        stmt = (
            select(self.model)
            .where(self.model.id == group_id)
            .options(selectinload(self.model.members))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_multi_with_members(
        self,
        cursor: int | None = None,
        limit: int = 50,
        order_by: str = "id",
        descending: bool = False,
    ) -> tuple[list[Group], bool, int | None]:
        """
        Get multiple groups with members eagerly loaded and cursor-based pagination.

        Args:
            cursor: ID of the last group from the previous page (None for first page)
            limit: Maximum number of groups to return (default: 50)
            order_by: Field name to order by (default: "id")
            descending: If True, order descending; if False, ascending (default: False)

        Returns:
            Tuple of (groups, has_more, next_cursor):
            - groups: List of Group instances with members loaded (up to `limit` items)
            - has_more: True if more groups exist after this page
            - next_cursor: ID to use for next page (None if no more items)

        Example:
            ```python
            # First page
            groups, has_more, next_cursor = await repo.get_multi_with_members(limit=20)

            # Second page
            if has_more:
                groups, has_more, next_cursor = await repo.get_multi_with_members(
                    cursor=next_cursor, limit=20
                )
            ```

        Note:
            Results are ordered by ID in ascending order by default.
            Members are eagerly loaded to avoid N+1 queries.
        """
        from sqlalchemy import asc, desc

        # Build base query with eager loading of members
        stmt = select(self.model).options(selectinload(self.model.members))

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
