"""Gift repository with search and relationship loading capabilities."""

from sqlalchemy import select, distinct, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gift import Gift
from app.models.tag import Tag, gift_tags
from app.models.list_item import ListItem
from app.models.list import List
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

    async def get_filtered(
        self,
        cursor: int | None = None,
        limit: int = 50,
        search: str | None = None,
        person_ids: list[int] | None = None,
        statuses: list[str] | None = None,
        list_ids: list[int] | None = None,
        occasion_ids: list[int] | None = None,
        sort_by: str = "recent",
    ) -> tuple[list[Gift], bool, int | None]:
        """
        Get filtered list of gifts with cursor-based pagination.

        Filters gifts by recipient (person), status, list, and occasion through
        the Gift → ListItem → List relationship chain. Uses a subquery approach
        to avoid duplicate gifts when filtering by list relationships while
        preventing PostgreSQL JSON column DISTINCT errors.

        Args:
            cursor: ID of last item from previous page (None for first page)
            limit: Maximum number of items to return (default: 50)
            search: Case-insensitive substring search on gift name
            person_ids: Filter by recipient person IDs (OR logic within group)
            statuses: Filter by list item statuses (OR logic within group)
            list_ids: Filter by list IDs (OR logic within group)
            occasion_ids: Filter by occasion IDs (OR logic within group)
            sort_by: Sort order ('recent', 'price_asc', 'price_desc')

        Returns:
            Tuple of (items, has_more, next_cursor):
            - items: List of Gift instances (up to `limit` items)
            - has_more: True if more items exist after this page
            - next_cursor: ID to use for next page (None if no more items)

        Example:
            ```python
            # Find gifts for person 5, with status 'purchased' or 'selected'
            gifts, has_more, cursor = await repo.get_filtered(
                person_ids=[5],
                statuses=['purchased', 'selected'],
                limit=20
            )

            # Search gifts containing "lego" sorted by price
            gifts, has_more, cursor = await repo.get_filtered(
                search="lego",
                sort_by="price_asc"
            )
            ```

        Note:
            - Empty list = no filter, None = no filter (both treated the same)
            - AND logic across filter groups (person AND status AND list)
            - OR logic within filter groups (person_id=1 OR person_id=2)
            - Uses database indexes: ix_list_items_status, ix_lists_person_id,
              ix_lists_occasion_id for optimal query performance
            - Subquery approach prevents duplicate gifts and avoids JSON DISTINCT errors
        """
        # Step 1: Build subquery for distinct gift IDs with all filters
        # Label the column explicitly so we can reference it after subquery()
        id_subquery = select(distinct(self.model.id).label("gift_id")).select_from(self.model)

        # Track if we need to join ListItem and List tables
        need_list_item_join = bool(statuses or list_ids or person_ids or occasion_ids)

        # Join through ListItem to List if filtering by list-related fields
        if need_list_item_join:
            id_subquery = id_subquery.join(ListItem, self.model.id == ListItem.gift_id)
            id_subquery = id_subquery.join(List, ListItem.list_id == List.id)

        # Apply filters (AND logic across groups)
        filters = []

        # Search by name (case-insensitive)
        if search:
            filters.append(func.lower(self.model.name).contains(func.lower(search)))

        # Filter by person (recipient) - OR logic within group
        if person_ids:
            filters.append(List.person_id.in_(person_ids))

        # Filter by list item status - OR logic within group
        if statuses:
            filters.append(ListItem.status.in_(statuses))

        # Filter by list ID - OR logic within group
        if list_ids:
            filters.append(ListItem.list_id.in_(list_ids))

        # Filter by occasion - OR logic within group
        if occasion_ids:
            filters.append(List.occasion_id.in_(occasion_ids))

        # Apply all filters to subquery
        if filters:
            id_subquery = id_subquery.where(*filters)

        # Convert to subquery
        id_subquery = id_subquery.subquery()

        # Step 2: Select full Gift models where ID is in the subquery
        stmt = select(self.model).where(self.model.id.in_(select(id_subquery.c.gift_id)))

        # Apply cursor pagination
        if cursor is not None:
            if sort_by == "price_asc":
                # For ascending price, get items where price > cursor_price OR (price = cursor_price AND id > cursor_id)
                # For simplicity with cursor pagination, we use ID-based cursor
                stmt = stmt.where(self.model.id > cursor)
            elif sort_by == "price_desc":
                stmt = stmt.where(self.model.id > cursor)
            else:  # recent (default)
                stmt = stmt.where(self.model.id > cursor)

        # Apply sorting
        if sort_by == "price_asc":
            stmt = stmt.order_by(self.model.price.asc().nulls_last(), self.model.id.asc())
        elif sort_by == "price_desc":
            stmt = stmt.order_by(self.model.price.desc().nulls_last(), self.model.id.asc())
        else:  # recent (default - newest first)
            stmt = stmt.order_by(self.model.id.desc())

        # Fetch limit + 1 to determine if there are more results
        stmt = stmt.limit(limit + 1)

        # Execute query
        result = await self.session.execute(stmt)
        gifts = list(result.scalars().all())

        # Check if there are more results
        has_more = len(gifts) > limit
        if has_more:
            gifts = gifts[:limit]  # Trim to requested limit

        # Determine next cursor
        next_cursor = gifts[-1].id if (gifts and has_more) else None

        return gifts, has_more, next_cursor
