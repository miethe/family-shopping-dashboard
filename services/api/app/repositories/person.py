"""Person repository for database operations on Person entities."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

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
