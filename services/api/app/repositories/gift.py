"""Gift repository with search and relationship loading capabilities."""

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gift import Gift
from app.models.tag import Tag, gift_tags
from app.models.list_item import ListItem
from app.repositories.base import BaseRepository


class GiftRepository(BaseRepository[Gift]):
    """
    Repository for Gift entity with specialized search and relationship queries.

    Extends BaseRepository with:
    - Name-based search (case-insensitive ILIKE)
    - Tag filtering
    - Eager loading of relationships (tags, list_items)
    - Optimized queries to avoid N+1 problems

    Example:
        ```python
        repo = GiftRepository(session)

        # Search by name
        results = await repo.search_by_name("lego")

        # Filter by tag
        electronics = await repo.get_by_tag(tag_id=5)

        # Eager load relationships
        gift = await repo.get_with_tags(gift_id=123)
        for tag in gift.tags:
            print(tag.name)
        ```
    """

    def __init__(self, session: AsyncSession):
        """
        Initialize repository with async database session.

        Args:
            session: SQLAlchemy async session for database operations
        """
        super().__init__(session, Gift)

    async def search_by_name(self, query: str, limit: int = 20) -> list[Gift]:
        """
        Search gifts by name using case-insensitive pattern matching.

        Uses PostgreSQL ILIKE for case-insensitive substring search.
        Results are ordered by name for consistency.

        Args:
            query: Search string to match against gift names
            limit: Maximum number of results to return (default: 20)

        Returns:
            List of Gift instances matching the search query

        Example:
            ```python
            # Find all gifts with "lego" in the name (case-insensitive)
            results = await repo.search_by_name("lego")
            # Returns: ["LEGO Star Wars", "Lego City Set", "lego technic"]
            ```

        Note:
            - Search uses `%query%` pattern (matches anywhere in name)
            - Case-insensitive (LEGO = lego = Lego)
            - Returns empty list if no matches found
        """
        stmt = (
            select(self.model)
            .where(self.model.name.ilike(f"%{query}%"))
            .order_by(self.model.name)
            .limit(limit)
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_tag(self, tag_id: int) -> list[Gift]:
        """
        Get all gifts that have a specific tag.

        Performs a join through the gift_tags association table to find
        all gifts associated with the given tag ID.

        Args:
            tag_id: Primary key of the tag to filter by

        Returns:
            List of Gift instances that have the specified tag

        Example:
            ```python
            # Get all gifts tagged as "Electronics" (tag_id=5)
            electronics_gifts = await repo.get_by_tag(tag_id=5)

            for gift in electronics_gifts:
                print(f"{gift.name} - ${gift.price}")
            ```

        Note:
            - Returns empty list if tag doesn't exist or has no gifts
            - Results ordered by gift name
            - Does NOT eager load tags relationship (use get_with_tags for that)
        """
        stmt = (
            select(self.model)
            .join(gift_tags, self.model.id == gift_tags.c.gift_id)
            .where(gift_tags.c.tag_id == tag_id)
            .order_by(self.model.name)
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_with_tags(self, gift_id: int) -> Gift | None:
        """
        Get a single gift with tags eagerly loaded.

        Uses selectinload to avoid N+1 query problem when accessing tags.
        Efficient for immediately displaying gift details with all tags.

        Args:
            gift_id: Primary key of the gift to retrieve

        Returns:
            Gift instance with tags relationship loaded, or None if not found

        Example:
            ```python
            gift = await repo.get_with_tags(gift_id=123)
            if gift:
                print(f"{gift.name} - Tags: {[tag.name for tag in gift.tags]}")
            ```

        Note:
            - Uses selectinload for optimal query performance
            - Accessing gift.tags does NOT trigger additional queries
            - Returns None if gift doesn't exist
        """
        stmt = (
            select(self.model)
            .options(selectinload(self.model.tags))
            .where(self.model.id == gift_id)
        )

        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_with_list_items(self, gift_id: int) -> Gift | None:
        """
        Get a single gift with list_items eagerly loaded.

        Uses selectinload to avoid N+1 query problem when checking which
        lists contain this gift. Useful for displaying gift usage across lists.

        Args:
            gift_id: Primary key of the gift to retrieve

        Returns:
            Gift instance with list_items relationship loaded, or None if not found

        Example:
            ```python
            gift = await repo.get_with_list_items(gift_id=123)
            if gift:
                print(f"{gift.name} appears in {len(gift.list_items)} lists")
                for item in gift.list_items:
                    print(f"  - List {item.list_id}: {item.status}")
            ```

        Note:
            - Uses selectinload for optimal query performance
            - Accessing gift.list_items does NOT trigger additional queries
            - Returns None if gift doesn't exist
            - list_items will be empty list if gift not added to any lists
        """
        stmt = (
            select(self.model)
            .options(selectinload(self.model.list_items))
            .where(self.model.id == gift_id)
        )

        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
