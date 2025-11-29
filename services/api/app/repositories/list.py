"""List repository with complex filters and eager loading."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.list import List, ListType, ListVisibility
from app.models.list_item import ListItem
from app.repositories.base import BaseRepository


class ListRepository(BaseRepository[List]):
    """
    Repository for List model with specialized query methods.

    Extends BaseRepository with list-specific queries:
    - Get lists by user, person, or occasion
    - Filter by type (wishlist, ideas, assigned)
    - Filter by visibility (private, family, public)
    - Eager load related entities (gifts, user, person, occasion)

    Example:
        ```python
        async with get_session() as session:
            repo = ListRepository(session)

            # Get all wishlists for a user
            wishlists = await repo.filter_by_type(
                type=ListType.wishlist,
                user_id=123
            )

            # Get list with all gifts eager loaded
            list_with_gifts = await repo.get_with_gifts(list_id=456)
        ```
    """

    def __init__(self, session: AsyncSession):
        """
        Initialize repository with database session.

        Args:
            session: SQLAlchemy async session
        """
        super().__init__(session, List)

    async def get_multi(
        self,
        cursor: int | None = None,
        limit: int = 50,
        order_by: str = "id",
        descending: bool = False,
    ) -> tuple[list[tuple[List, int]], bool, int | None]:
        """
        Get multiple lists with item counts using cursor-based pagination.

        Overrides BaseRepository.get_multi to include item counts.

        Args:
            cursor: ID of last item from previous page (None for first page)
            limit: Maximum number of items to return (default: 50)
            order_by: Field name to order by (default: "id")
            descending: If True, order descending (default: False)

        Returns:
            Tuple of (items, has_more, next_cursor):
            - items: List of tuples (List instance, item_count)
            - has_more: True if more items exist after this page
            - next_cursor: ID to use for next page (None if no more items)

        Example:
            ```python
            lists, has_more, next_cursor = await repo.get_multi(limit=20)
            for list_obj, item_count in lists:
                print(f"{list_obj.name}: {item_count} items")
            ```
        """
        # Build query with item counts
        stmt = (
            select(
                List,
                func.count(ListItem.id).label("item_count")
            )
            .outerjoin(ListItem, List.id == ListItem.list_id)
            .group_by(List.id)
        )

        # Apply cursor filtering if provided
        if cursor is not None:
            order_column = getattr(List, order_by)
            if descending:
                stmt = stmt.where(order_column < cursor)
            else:
                stmt = stmt.where(order_column > cursor)

        # Apply ordering
        order_column = getattr(List, order_by)
        from sqlalchemy import asc, desc
        stmt = stmt.order_by(desc(order_column) if descending else asc(order_column))

        # Fetch limit+1 to check if more items exist
        stmt = stmt.limit(limit + 1)

        # Execute query
        result = await self.session.execute(stmt)
        items = list(result.all())

        # Check if more items exist
        has_more = len(items) > limit

        # Return only the requested limit
        if has_more:
            items = items[:limit]

        # Determine next cursor
        next_cursor = items[-1][0].id if items and has_more else None

        return items, has_more, next_cursor

    async def get_by_user(self, user_id: int) -> list[List]:
        """
        Get all lists owned by a specific user.

        Args:
            user_id: ID of the user who owns the lists

        Returns:
            List of List instances owned by the user

        Example:
            ```python
            user_lists = await repo.get_by_user(user_id=123)
            for list_obj in user_lists:
                print(f"{list_obj.name} ({list_obj.type.value})")
            ```
        """
        stmt = select(List).where(List.user_id == user_id).order_by(List.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_person(self, person_id: int) -> list[tuple[List, int]]:
        """
        Get all lists associated with a specific person with item counts.

        This returns lists that are "for" a person (e.g., gift ideas for them,
        their wishlists).

        Args:
            person_id: ID of the person

        Returns:
            List of tuples (List instance, item_count) for this person

        Example:
            ```python
            person_lists = await repo.get_by_person(person_id=456)
            for list_obj, item_count in person_lists:
                print(f"{list_obj.name}: {item_count} items")
            ```
        """
        stmt = (
            select(
                List,
                func.count(ListItem.id).label("item_count")
            )
            .outerjoin(ListItem, List.id == ListItem.list_id)
            .where(List.person_id == person_id)
            .group_by(List.id)
            .order_by(List.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.all())

    async def get_by_occasion(self, occasion_id: int) -> list[tuple[List, int]]:
        """
        Get all lists associated with a specific occasion with item counts.

        Args:
            occasion_id: ID of the occasion (e.g., Christmas 2024)

        Returns:
            List of tuples (List instance, item_count) for this occasion

        Example:
            ```python
            christmas_lists = await repo.get_by_occasion(occasion_id=789)
            for list_obj, item_count in christmas_lists:
                print(f"{list_obj.name}: {item_count} items")
            ```
        """
        stmt = (
            select(
                List,
                func.count(ListItem.id).label("item_count")
            )
            .outerjoin(ListItem, List.id == ListItem.list_id)
            .where(List.occasion_id == occasion_id)
            .group_by(List.id)
            .order_by(List.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.all())

    async def get_with_gifts(self, list_id: int) -> List | None:
        """
        Get a list with all gifts eager loaded.

        This performs a single query with joins to load:
        - The list itself
        - All gifts in the list
        - User, person, and occasion relationships

        Args:
            list_id: ID of the list to retrieve

        Returns:
            List instance with gifts loaded, or None if not found

        Example:
            ```python
            list_obj = await repo.get_with_gifts(list_id=123)
            if list_obj:
                print(f"List '{list_obj.name}' has {len(list_obj.list_items)} items")
                for list_item in list_obj.list_items:
                    print(f"  - {list_item.gift.name}: ${list_item.gift.price}")
            ```

        Note:
            This uses selectinload to avoid N+1 query problems.
            All related list_items are loaded in a single additional query.
        """
        stmt = (
            select(List)
            .where(List.id == list_id)
            .options(
                selectinload(List.list_items),  # Eager load all list items
                selectinload(List.user),  # Eager load owner
                selectinload(List.person),  # Eager load person (if set)
                selectinload(List.occasion),  # Eager load occasion (if set)
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def filter_by_type(
        self, type: ListType, user_id: int | None = None
    ) -> list[List]:
        """
        Filter lists by type, optionally scoped to a user.

        Args:
            type: List type enum (wishlist, ideas, or assigned)
            user_id: Optional user ID to filter by owner (default: None)

        Returns:
            List of List instances matching the type filter

        Example:
            ```python
            # Get all wishlists in the system
            all_wishlists = await repo.filter_by_type(ListType.wishlist)

            # Get wishlists for a specific user
            user_wishlists = await repo.filter_by_type(
                type=ListType.wishlist,
                user_id=123
            )

            # Get all assigned gift lists for a user
            assigned = await repo.filter_by_type(
                type=ListType.assigned,
                user_id=123
            )
            ```

        Note:
            Uses composite index (ix_lists_user_type) when user_id is provided
            for optimal query performance.
        """
        stmt = select(List).where(List.type == type)

        if user_id is not None:
            stmt = stmt.where(List.user_id == user_id)

        stmt = stmt.order_by(List.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def filter_by_visibility(self, visibility: ListVisibility) -> list[List]:
        """
        Filter lists by visibility level.

        Args:
            visibility: Visibility level enum (private, family, or public)

        Returns:
            List of List instances with the specified visibility

        Example:
            ```python
            # Get all public lists
            public_lists = await repo.filter_by_visibility(ListVisibility.public)

            # Get all family-visible lists
            family_lists = await repo.filter_by_visibility(ListVisibility.family)

            # Get all private lists
            private_lists = await repo.filter_by_visibility(ListVisibility.private)
            ```

        Note:
            For access control, you likely want to combine this with user_id
            filtering to ensure users only see appropriate lists.
        """
        stmt = (
            select(List)
            .where(List.visibility == visibility)
            .order_by(List.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_accessible_lists(
        self, user_id: int, include_private: bool = False
    ) -> list[List]:
        """
        Get all lists accessible to a user based on visibility rules.

        Access rules:
        - User's own lists (all visibilities if include_private=True)
        - Family-visible lists from other users
        - Public lists from other users

        Args:
            user_id: ID of the user requesting access
            include_private: If True, include user's private lists (default: False)

        Returns:
            List of List instances the user can access

        Example:
            ```python
            # Get all lists user can see (excluding their private ones)
            accessible = await repo.get_accessible_lists(user_id=123)

            # Get all lists including user's private lists
            all_accessible = await repo.get_accessible_lists(
                user_id=123,
                include_private=True
            )
            ```
        """
        # Build base query for non-private lists
        stmt = select(List).where(
            (List.visibility == ListVisibility.family)
            | (List.visibility == ListVisibility.public)
        )

        # Include user's private lists if requested
        if include_private:
            stmt = stmt.where(
                ((List.visibility == ListVisibility.family) | (List.visibility == ListVisibility.public))
                | ((List.visibility == ListVisibility.private) & (List.user_id == user_id))
            )

        stmt = stmt.order_by(List.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
