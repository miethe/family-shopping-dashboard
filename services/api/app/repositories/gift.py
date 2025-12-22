"""Gift repository with search and relationship loading capabilities."""

from sqlalchemy import asc, delete, desc, distinct, func, or_, select, union
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.gift import Gift, GiftStatus
from app.models.gift_person import GiftPerson, GiftPersonRole
from app.models.list import List
from app.models.list_item import ListItem
from app.models.person import Person
from app.models.store import Store
from app.models.tag import Tag, gift_tags
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
            .options(
                selectinload(self.model.people),
                selectinload(self.model.stores),
                selectinload(self.model.gift_people_links),
                selectinload(self.model.list_items).selectinload(ListItem.list),
                selectinload(self.model.tags),
                selectinload(self.model.purchaser),
            )
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

    async def get_with_relations(self, gift_id: int) -> Gift | None:
        """
        Get a gift with all relationships eager loaded.

        Eager loads: people, stores, gift_people_links, list_items, tags, and purchaser.
        Prevents MissingGreenlet errors in async context by loading all relationships upfront.
        """
        stmt = (
            select(self.model)
            .options(
                selectinload(self.model.people),
                selectinload(self.model.stores),
                selectinload(self.model.gift_people_links),
                selectinload(self.model.list_items).selectinload(ListItem.list),
                selectinload(self.model.tags),
                selectinload(self.model.purchaser),
            )
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

    async def get_multi(
        self,
        cursor: int | None = None,
        limit: int = 50,
        order_by: str = "id",
        descending: bool = False,
    ) -> tuple[list[Gift], bool, int | None]:
        """
        Override base get_multi to eager-load all relationships for response shaping.
        """
        stmt = (
            select(self.model)
            .options(
                selectinload(self.model.people),
                selectinload(self.model.stores),
                selectinload(self.model.gift_people_links),
                selectinload(self.model.list_items).selectinload(ListItem.list),
                selectinload(self.model.tags),
                selectinload(self.model.purchaser),
            )
        )

        if cursor is not None:
            order_column = getattr(self.model, order_by)
            if descending:
                stmt = stmt.where(order_column < cursor)
            else:
                stmt = stmt.where(order_column > cursor)

        order_column = getattr(self.model, order_by)
        stmt = stmt.order_by(desc(order_column) if descending else asc(order_column))
        stmt = stmt.limit(limit + 1)

        result = await self.session.execute(stmt)
        items = list(result.scalars().all())

        has_more = len(items) > limit
        if has_more:
            items = items[:limit]

        next_cursor = getattr(items[-1], order_by) if items and has_more else None

        return items, has_more, next_cursor

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

        Filters gifts by recipient (person), status, list, and occasion. The person_ids
        filter uses a UNION approach to include gifts from both:
        1. List ownership (Gift → ListItem → List where List.person_id matches)
        2. Direct linking (Gift → GiftPerson where role=RECIPIENT)

        Other filters use the Gift → ListItem → List relationship chain. Uses a subquery
        approach to avoid duplicate gifts when filtering by list relationships while
        preventing PostgreSQL JSON column DISTINCT errors.

        Args:
            cursor: ID of last item from previous page (None for first page)
            limit: Maximum number of items to return (default: 50)
            search: Case-insensitive substring search on gift name
            person_ids: Filter by recipient person IDs via list ownership OR GiftPerson table (OR logic)
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
            # Includes gifts via list ownership AND direct GiftPerson links
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
            - person_ids filter includes BOTH list-based AND GiftPerson-based links (UNION)
            - Uses database indexes: ix_list_items_status, ix_lists_person_id,
              ix_lists_occasion_id for optimal query performance
            - Subquery approach prevents duplicate gifts and avoids JSON DISTINCT errors
        """
        # Step 1: Build subquery for distinct gift IDs with all filters
        # Label the column explicitly so we can reference it after subquery()

        # Track if we need to join ListItem and List tables (for non-person filters)
        need_list_item_join = bool(statuses or list_ids or occasion_ids)

        # Special handling for person_ids: UNION of list-based and GiftPerson-based gifts
        if person_ids:
            # Subquery 1: Gifts via list ownership (existing behavior)
            list_based_gifts = (
                select(distinct(self.model.id).label("gift_id"))
                .select_from(self.model)
                .join(ListItem, self.model.id == ListItem.gift_id)
                .join(List, ListItem.list_id == List.id)
                .where(List.person_id.in_(person_ids))
            )

            # Subquery 2: Gifts via direct GiftPerson linking
            direct_gifts = (
                select(distinct(self.model.id).label("gift_id"))
                .select_from(self.model)
                .join(GiftPerson, self.model.id == GiftPerson.gift_id)
                .where(
                    GiftPerson.person_id.in_(person_ids),
                    GiftPerson.role == GiftPersonRole.RECIPIENT
                )
            )

            # UNION both sources
            person_gift_ids = union(list_based_gifts, direct_gifts).subquery()

            # Start with gifts matching person filter
            id_subquery = (
                select(distinct(self.model.id).label("gift_id"))
                .select_from(self.model)
                .where(self.model.id.in_(select(person_gift_ids.c.gift_id)))
            )

            # Now join ListItem/List if we need other list-based filters
            if need_list_item_join:
                id_subquery = id_subquery.outerjoin(ListItem, self.model.id == ListItem.gift_id)
                id_subquery = id_subquery.outerjoin(List, ListItem.list_id == List.id)
        else:
            # No person filter - start fresh
            id_subquery = select(distinct(self.model.id).label("gift_id")).select_from(self.model)

            # Join through ListItem to List if filtering by list-related fields
            if need_list_item_join:
                id_subquery = id_subquery.outerjoin(ListItem, self.model.id == ListItem.gift_id)
                id_subquery = id_subquery.outerjoin(List, ListItem.list_id == List.id)

        # Apply remaining filters (AND logic across groups)
        filters = []

        # Search by name (case-insensitive)
        if search:
            filters.append(func.lower(self.model.name).contains(func.lower(search)))

        # Filter by gift status - directly on Gift model
        if statuses:
            # Convert string values to enum (frontend sends strings like 'purchased')
            enum_statuses = [GiftStatus(s) for s in statuses]
            filters.append(self.model.status.in_(enum_statuses))

        # Filter by list ID - OR logic within group
        # Include orphaned gifts (no ListItem records) along with matching list_ids
        if list_ids:
            filters.append(or_(
                ListItem.list_id.in_(list_ids),
                ListItem.gift_id.is_(None)  # Include gifts without ListItems
            ))

        # Filter by occasion - OR logic within group
        # Include orphaned gifts (no ListItem records) along with matching occasion_ids
        if occasion_ids:
            filters.append(or_(
                List.occasion_id.in_(occasion_ids),
                ListItem.gift_id.is_(None)  # Include gifts without ListItems
            ))

        # Apply all filters to subquery
        if filters:
            id_subquery = id_subquery.where(*filters)

        # Convert to subquery
        id_subquery = id_subquery.subquery()

        # Step 2: Select full Gift models where ID is in the subquery
        stmt = (
            select(self.model)
            .options(
                selectinload(self.model.people),
                selectinload(self.model.stores),
                selectinload(self.model.gift_people_links),
                selectinload(self.model.list_items).selectinload(ListItem.list),
                selectinload(self.model.tags),
                selectinload(self.model.purchaser),
            )
            .where(self.model.id.in_(select(id_subquery.c.gift_id)))
        )

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

    async def get_linked_people(self, gift_id: int) -> list[int]:
        """
        Get person IDs linked to a gift.

        Args:
            gift_id: Gift ID to get linked people for

        Returns:
            List of person IDs linked to the gift

        Example:
            ```python
            person_ids = await repo.get_linked_people(gift_id=123)
            print(f"Gift is linked to {len(person_ids)} people")
            ```
        """
        stmt = select(GiftPerson.person_id).where(GiftPerson.gift_id == gift_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def attach_people(self, gift_id: int, person_ids: list[int]) -> None:
        """
        Attach multiple people to a gift. Skips duplicates.

        Args:
            gift_id: Gift ID to attach people to
            person_ids: List of person IDs to attach

        Example:
            ```python
            await repo.attach_people(gift_id=123, person_ids=[1, 2, 3])
            ```

        Note:
            - Automatically skips existing links (no duplicates)
            - Commits changes to database
        """
        # Get existing person IDs
        existing = set(await self.get_linked_people(gift_id))

        # Add only new links
        for person_id in person_ids:
            if person_id not in existing:
                link = GiftPerson(gift_id=gift_id, person_id=person_id)
                self.session.add(link)

        await self.session.commit()

    async def detach_person(self, gift_id: int, person_id: int) -> bool:
        """
        Detach a person from a gift.

        Args:
            gift_id: Gift ID to detach person from
            person_id: Person ID to detach

        Returns:
            True if link was removed, False if link didn't exist

        Example:
            ```python
            deleted = await repo.detach_person(gift_id=123, person_id=5)
            if deleted:
                print("Person unlinked from gift")
            else:
                print("Link not found")
            ```
        """
        stmt = delete(GiftPerson).where(
            GiftPerson.gift_id == gift_id,
            GiftPerson.person_id == person_id
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.rowcount > 0

    async def set_people(self, gift_id: int, person_ids: list[int]) -> None:
        """
        Replace all linked people with new list.

        Args:
            gift_id: Gift ID to update people for
            person_ids: New list of person IDs to link

        Example:
            ```python
            # Replace all existing links with new ones
            await repo.set_people(gift_id=123, person_ids=[1, 2, 3])
            ```

        Note:
            - Removes ALL existing links first
            - Then adds new links
            - Commits changes to database
        """
        # Remove all existing links
        stmt = delete(GiftPerson).where(GiftPerson.gift_id == gift_id)
        await self.session.execute(stmt)

        # Add new links
        for person_id in person_ids:
            link = GiftPerson(gift_id=gift_id, person_id=person_id)
            self.session.add(link)

        await self.session.commit()

    async def set_stores(self, gift_id: int, store_ids: list[int]) -> Gift | None:
        """
        Replace all linked stores for a gift.

        Args:
            gift_id: Gift ID to update stores for
            store_ids: New list of store IDs to link

        Returns:
            Updated Gift with stores relationship loaded, or None if not found

        Note:
            Must eager-load stores BEFORE modification to avoid lazy loading in async context.
        """
        # Eager load stores relationship before modifying it
        stmt = select(Gift).where(Gift.id == gift_id).options(
            selectinload(Gift.stores)
        )
        result = await self.session.execute(stmt)
        gift = result.scalar_one_or_none()
        if gift is None:
            return None

        if not store_ids:
            gift.stores = []
            await self.session.commit()
            # Re-fetch with explicit eager loading to avoid lazy load in async context
            stmt = select(Gift).where(Gift.id == gift_id).options(
                selectinload(Gift.stores)
            )
            result = await self.session.execute(stmt)
            return result.scalar_one_or_none()

        stmt = select(Store).where(Store.id.in_(store_ids))
        result = await self.session.execute(stmt)
        stores = list(result.scalars().all())
        gift.stores = stores
        await self.session.commit()

        # Re-fetch with explicit eager loading to avoid lazy load in async context
        stmt = select(Gift).where(Gift.id == gift_id).options(
            selectinload(Gift.stores)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_linked_person(self, person_id: int) -> list[Gift]:
        """
        Get all gifts directly linked to a specific person via gift_people table.

        This is different from get_filtered(person_ids=[...]) which filters by
        list ownership. This method returns gifts that are directly associated
        with a person in the gift_people junction table.

        Args:
            person_id: Person ID to get linked gifts for

        Returns:
            List of Gift instances directly linked to the person

        Example:
            ```python
            # Get all gifts linked to person ID 5
            gifts = await repo.get_by_linked_person(person_id=5)
            for gift in gifts:
                print(f"{gift.name} - ${gift.price}")
            ```

        Note:
            - Returns gifts directly linked via gift_people table
            - Does NOT filter by list ownership
            - Returns empty list if person has no linked gifts
            - Results ordered by gift ID (most recent first)
        """
        stmt = (
            select(self.model)
            .options(
                selectinload(self.model.people),
                selectinload(self.model.stores),
                selectinload(self.model.gift_people_links),
                selectinload(self.model.list_items).selectinload(ListItem.list),
                selectinload(self.model.tags),
                selectinload(self.model.purchaser),
            )
            .join(GiftPerson, self.model.id == GiftPerson.gift_id)
            .where(GiftPerson.person_id == person_id)
            .order_by(self.model.id.desc())
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_linked_persons(self, person_ids: list[int]) -> list[Gift]:
        """
        Get all gifts directly linked to any of the specified persons via gift_people table.

        This is different from get_filtered(person_ids=[...]) which filters by
        list ownership. This method returns gifts that are directly associated
        with any of the specified persons in the gift_people junction table.

        Args:
            person_ids: List of person IDs to get linked gifts for

        Returns:
            List of Gift instances directly linked to any of the persons

        Example:
            ```python
            # Get all gifts linked to persons 1, 2, or 3
            gifts = await repo.get_by_linked_persons(person_ids=[1, 2, 3])
            for gift in gifts:
                print(f"{gift.name} - ${gift.price}")
            ```

        Note:
            - Returns gifts linked to ANY of the specified persons (OR logic)
            - Uses DISTINCT to avoid duplicate gifts
            - Returns empty list if no person_ids provided or no gifts found
            - Results ordered by gift ID (most recent first)
        """
        if not person_ids:
            return []

        stmt = (
            select(self.model)
            .options(
                selectinload(self.model.people),
                selectinload(self.model.stores),
                selectinload(self.model.gift_people_links),
                selectinload(self.model.list_items).selectinload(ListItem.list),
                selectinload(self.model.tags),
                selectinload(self.model.purchaser),
            )
            .join(GiftPerson, self.model.id == GiftPerson.gift_id)
            .where(GiftPerson.person_id.in_(person_ids))
            .distinct()
            .order_by(self.model.id.desc())
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_multi_with_linked_person_filter(
        self,
        cursor: int | None = None,
        limit: int = 50,
        linked_person_ids: list[int] | None = None,
    ) -> tuple[list[Gift], bool, int | None]:
        """
        Get gifts with cursor-based pagination and optional filtering by directly linked persons.

        This method provides paginated access to gifts that are directly linked to
        specific persons via the gift_people table. This is useful for viewing gifts
        associated with specific recipients.

        Args:
            cursor: ID of last item from previous page (None for first page)
            limit: Maximum number of items to return (default: 50)
            linked_person_ids: Filter by directly linked person IDs (OR logic)

        Returns:
            Tuple of (items, has_more, next_cursor):
            - items: List of Gift instances (up to `limit` items)
            - has_more: True if more items exist after this page
            - next_cursor: ID to use for next page (None if no more items)

        Example:
            ```python
            # First page - gifts linked to person 5
            gifts, has_more, cursor = await repo.get_multi_with_linked_person_filter(
                linked_person_ids=[5],
                limit=20
            )

            # Next page
            if has_more:
                gifts, has_more, cursor = await repo.get_multi_with_linked_person_filter(
                    cursor=cursor,
                    linked_person_ids=[5],
                    limit=20
                )
            ```

        Note:
            - If no linked_person_ids provided, returns all gifts
            - Uses DISTINCT to avoid duplicate gifts when joining
            - Cursor-based pagination for performance
            - Results ordered by gift ID (most recent first)
        """
        stmt = (
            select(self.model)
            .options(
                selectinload(self.model.people),
                selectinload(self.model.stores),
                selectinload(self.model.gift_people_links),
                selectinload(self.model.list_items).selectinload(ListItem.list),
                selectinload(self.model.tags),
                selectinload(self.model.purchaser),
            )
        )

        # Apply linked person filter if provided
        if linked_person_ids:
            stmt = (
                stmt
                .join(GiftPerson, self.model.id == GiftPerson.gift_id)
                .where(GiftPerson.person_id.in_(linked_person_ids))
                .distinct()
            )

        # Apply cursor pagination
        if cursor is not None:
            stmt = stmt.where(self.model.id < cursor)

        # Order by ID descending (most recent first) and limit
        stmt = stmt.order_by(self.model.id.desc()).limit(limit + 1)

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

    async def get_by_purchaser_id(
        self,
        purchaser_id: int,
        cursor: int | None = None,
        limit: int = 50,
    ) -> tuple[list[Gift], bool, int | None]:
        """
        Get all gifts where this person is the purchaser.

        Args:
            purchaser_id: Person ID to filter by (Gift.purchaser_id)
            cursor: Optional cursor for pagination
            limit: Max items to return (default: 50)

        Returns:
            Tuple of (gifts, has_more, next_cursor):
            - gifts: List of Gift instances (up to `limit` items)
            - has_more: True if more items exist after this page
            - next_cursor: ID to use for next page (None if no more items)

        Example:
            ```python
            # Get gifts purchased by person 5
            gifts, has_more, cursor = await repo.get_by_purchaser_id(
                purchaser_id=5,
                limit=20
            )

            # Next page
            if has_more:
                gifts, has_more, cursor = await repo.get_by_purchaser_id(
                    purchaser_id=5,
                    cursor=cursor,
                    limit=20
                )
            ```

        Note:
            - Filters by Gift.purchaser_id column
            - Results ordered by gift ID descending (most recent first)
            - Uses cursor-based pagination for performance
            - Eager loads people and stores relationships
        """
        stmt = (
            select(self.model)
            .options(
                selectinload(self.model.people),
                selectinload(self.model.stores),
                selectinload(self.model.gift_people_links),
                selectinload(self.model.list_items).selectinload(ListItem.list),
                selectinload(self.model.tags),
                selectinload(self.model.purchaser),
            )
            .where(self.model.purchaser_id == purchaser_id)
        )

        # Apply cursor pagination
        if cursor is not None:
            stmt = stmt.where(self.model.id < cursor)

        # Order by ID descending (most recent first) and limit
        stmt = stmt.order_by(self.model.id.desc()).limit(limit + 1)

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

    async def update_purchaser(
        self,
        gift_id: int,
        purchaser_id: int | None,
    ) -> Gift | None:
        """
        Update the purchaser of a gift.

        Args:
            gift_id: Gift to update
            purchaser_id: New purchaser ID (or None to clear)

        Returns:
            Updated Gift with relationships loaded, or None if not found

        Example:
            ```python
            # Set purchaser
            gift = await repo.update_purchaser(gift_id=123, purchaser_id=5)
            if gift:
                print(f"Purchaser updated for {gift.name}")

            # Clear purchaser
            gift = await repo.update_purchaser(gift_id=123, purchaser_id=None)
            ```

        Note:
            - Returns None if gift not found
            - Commits changes to database
            - Eager loads people and stores relationships
            - Can set to None to clear the purchaser
        """
        # Get gift
        gift = await self.get(gift_id)
        if gift is None:
            return None

        # Update purchaser_id field
        gift.purchaser_id = purchaser_id

        # Commit changes
        await self.session.commit()

        # Re-fetch with explicit eager loading to avoid lazy load in async context
        stmt = select(Gift).where(Gift.id == gift_id).options(
            selectinload(Gift.people),
            selectinload(Gift.stores)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
