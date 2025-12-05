"""Person repository for database operations on Person entities."""

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.group import PersonGroup
from app.models.person import Person
from app.repositories.base import BaseRepository


class PersonRepository(BaseRepository[Person]):
    """
    Repository for Person-specific database operations.

    Extends BaseRepository with person-specific queries including:
    - Eager loading of related gift lists
    - Name-based search with case-insensitive matching

    Example:
        ```python
        repo = PersonRepository(session)

        # Get person with all related gift lists loaded
        person = await repo.get_with_lists(person_id=123)
        if person:
            for gift_list in person.lists:
                print(gift_list.name)

        # Search by name
        people = await repo.search_by_name("John", limit=5)
        ```
    """

    def __init__(self, session: AsyncSession):
        """
        Initialize PersonRepository with async session.

        Args:
            session: SQLAlchemy async session for database operations
        """
        super().__init__(session, Person)

    async def get_with_lists(self, person_id: int) -> Person | None:
        """
        Get a person by ID with all related gift lists eagerly loaded.

        Uses selectinload for efficient eager loading to avoid N+1 queries
        when accessing the person's gift lists.

        Args:
            person_id: Primary key of the person to retrieve

        Returns:
            Person instance with lists loaded if found, None otherwise

        Example:
            ```python
            person = await repo.get_with_lists(123)
            if person:
                # Lists are already loaded - no additional DB queries
                print(f"{person.name} has {len(person.lists)} gift lists")
                for gift_list in person.lists:
                    print(f"  - {gift_list.name}")
            ```

        Note:
            The relationship 'lists' must be defined in the Person model.
            If the relationship doesn't exist yet, this will raise an AttributeError.
        """
        stmt = (
            select(self.model)
            .where(self.model.id == person_id)
            .options(selectinload(self.model.lists))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def search_by_name(self, name: str, limit: int = 10) -> list[Person]:
        """
        Search for people by name using case-insensitive partial matching.

        Uses PostgreSQL ILIKE for case-insensitive pattern matching.
        Matches any person whose name contains the search term.

        Args:
            name: Search term to match against person names (case-insensitive)
            limit: Maximum number of results to return (default: 10)

        Returns:
            List of Person instances matching the search term, ordered by name.
            Returns empty list if no matches found.

        Example:
            ```python
            # Find all people with "john" in their name
            results = await repo.search_by_name("john", limit=5)
            for person in results:
                print(person.name)  # "John Doe", "Johnny Smith", etc.

            # Search is case-insensitive
            results = await repo.search_by_name("MARY")  # Matches "Mary", "mary", etc.
            ```

        Note:
            - Uses ILIKE for case-insensitive matching (PostgreSQL-specific)
            - Adds % wildcards for partial matching
            - Results are ordered alphabetically by name
            - For exact matches, use get() with known ID or filter directly
        """
        # Build search pattern with wildcards for partial matching
        search_pattern = f"%{name}%"

        stmt = (
            select(self.model)
            .where(self.model.name.ilike(search_pattern))
            .order_by(self.model.name)
            .limit(limit)
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_multi_with_group_filter(
        self,
        cursor: int | None = None,
        limit: int = 50,
        group_id: int | None = None,
        order_by: str = "id",
        descending: bool = False,
    ) -> tuple[list[Person], bool, int | None]:
        """
        Get multiple persons with optional group filtering and cursor-based pagination.

        Args:
            cursor: ID of the last person from the previous page (None for first page)
            limit: Maximum number of persons to return (default: 50)
            group_id: Optional group ID to filter by (None for no filter)
            order_by: Field name to order by (default: "id")
            descending: If True, order descending; if False, ascending (default: False)

        Returns:
            Tuple of (persons, has_more, next_cursor):
            - persons: List of Person instances (up to `limit` items)
            - has_more: True if more persons exist after this page
            - next_cursor: ID to use for next page (None if no more items)

        Example:
            ```python
            # Get persons in group 1
            persons, has_more, next_cursor = await repo.get_multi_with_group_filter(
                group_id=1, limit=20
            )

            # Get all persons (no filter)
            persons, has_more, next_cursor = await repo.get_multi_with_group_filter(
                limit=20
            )
            ```
        """
        from sqlalchemy import asc, desc

        # Build base query
        stmt = select(self.model)

        # Apply group filter if provided
        if group_id is not None:
            stmt = stmt.join(PersonGroup).where(PersonGroup.group_id == group_id)

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

    async def set_groups(self, person_id: int, group_ids: list[int]) -> None:
        """
        Replace all group memberships for a person.

        This method removes all existing group links and adds new ones based on
        the provided group_ids. It's an atomic operation within a transaction.

        Args:
            person_id: ID of the person to update group memberships for
            group_ids: List of group IDs to link the person to (empty list removes all)

        Example:
            ```python
            # Link person to groups 1, 2, and 3
            await repo.set_groups(person_id=42, group_ids=[1, 2, 3])

            # Remove person from all groups
            await repo.set_groups(person_id=42, group_ids=[])
            ```

        Note:
            - This replaces ALL existing group memberships
            - To add/remove individual groups, fetch current groups first
            - Changes are committed immediately
            - Invalid group_ids will cause foreign key constraint errors
        """
        # Remove existing group memberships
        await self.session.execute(
            delete(PersonGroup).where(PersonGroup.person_id == person_id)
        )

        # Add new group memberships
        for group_id in group_ids:
            link = PersonGroup(person_id=person_id, group_id=group_id)
            self.session.add(link)

        # Commit changes
        await self.session.commit()

    async def get_with_groups(self, person_id: int) -> Person | None:
        """
        Get a person by ID with groups eagerly loaded.

        Uses selectinload for efficient eager loading to avoid N+1 queries
        when accessing the person's groups.

        Args:
            person_id: Primary key of the person to retrieve

        Returns:
            Person instance with groups loaded if found, None otherwise

        Example:
            ```python
            person = await repo.get_with_groups(123)
            if person:
                # Groups are already loaded - no additional DB queries
                print(f"{person.display_name} is in {len(person.groups)} groups")
                for group in person.groups:
                    print(f"  - {group.name}")
            ```
        """
        stmt = (
            select(self.model)
            .where(self.model.id == person_id)
            .options(selectinload(self.model.groups))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
