"""Person service for gift recipient management."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.person import PersonRepository
from app.schemas.person import PersonCreate, PersonResponse, PersonUpdate


class PersonService:
    """
    Person service handling CRUD operations for gift recipients.

    Converts ORM models to DTOs for all operations.

    Example:
        ```python
        async with async_session() as session:
            service = PersonService(session)
            person = await service.create(PersonCreate(
                name="Mom",
                interests=["Reading", "Gardening"],
                sizes={"shirt": "M", "shoe": "8"}
            ))
        ```
    """

    def __init__(self, session: AsyncSession) -> None:
        """
        Initialize person service with database session.

        Args:
            session: SQLAlchemy async session for database operations
        """
        self.session = session
        self.repo = PersonRepository(session)

    async def create(self, data: PersonCreate) -> PersonResponse:
        """
        Create a new person for gift tracking.

        Args:
            data: Person creation data (name, interests, sizes)

        Returns:
            PersonResponse DTO with created person details

        Example:
            ```python
            person = await service.create(PersonCreate(
                name="Sarah",
                interests=["Photography", "Hiking"],
                sizes={"shirt": "S", "pants": "28x32"}
            ))
            print(f"Created person: {person.name}")
            ```

        Note:
            - Name is required and must be 1-100 characters
            - Interests and sizes are optional
            - Timestamps (created_at, updated_at) are auto-generated
        """
        # Create person in database
        person = await self.repo.create(data.model_dump(exclude_unset=True))

        # Convert ORM model to DTO
        return PersonResponse.model_validate(person)

    async def get(self, person_id: int) -> PersonResponse | None:
        """
        Get person by ID.

        Args:
            person_id: Person ID to retrieve

        Returns:
            PersonResponse DTO if found, None otherwise

        Example:
            ```python
            person = await service.get(person_id=42)
            if person:
                print(f"Found: {person.name}")
                print(f"Interests: {person.interests}")
            else:
                print("Person not found")
            ```
        """
        person = await self.repo.get(person_id)
        if person is None:
            return None

        return PersonResponse.model_validate(person)

    async def list(
        self, cursor: int | None = None, limit: int = 50
    ) -> tuple[list[PersonResponse], bool, int | None]:
        """
        List people with cursor-based pagination.

        Cursor-based pagination provides better performance than offset-based
        pagination, especially for large datasets.

        Args:
            cursor: ID of the last person from the previous page (None for first page)
            limit: Maximum number of people to return (default: 50)

        Returns:
            Tuple of (people, has_more, next_cursor):
            - people: List of PersonResponse DTOs (up to `limit` items)
            - has_more: True if more people exist after this page
            - next_cursor: ID to use for next page (None if no more items)

        Example:
            ```python
            # First page
            people, has_more, next_cursor = await service.list(limit=20)
            for person in people:
                print(f"- {person.name}")

            # Second page
            if has_more:
                people, has_more, next_cursor = await service.list(
                    cursor=next_cursor,
                    limit=20
                )
            ```

        Note:
            Results are ordered by ID in ascending order.
        """
        # Get paginated list from repository
        people, has_more, next_cursor = await self.repo.get_multi(
            cursor=cursor, limit=limit, order_by="id", descending=False
        )

        # Convert ORM models to DTOs
        people_dtos = [PersonResponse.model_validate(person) for person in people]

        return people_dtos, has_more, next_cursor

    async def update(self, person_id: int, data: PersonUpdate) -> PersonResponse | None:
        """
        Update person details.

        Args:
            person_id: Person ID to update
            data: Update data (all fields optional)

        Returns:
            Updated PersonResponse DTO if person found, None otherwise

        Example:
            ```python
            person = await service.update(
                person_id=42,
                data=PersonUpdate(
                    interests=["Reading", "Cooking", "Travel"],
                    sizes={"shirt": "M", "pants": "32x30", "shoe": "10"}
                )
            )
            if person:
                print(f"Updated: {person.name}")
            ```

        Note:
            - Only updates provided fields (partial update)
            - Returns None if person not found
            - updated_at timestamp is automatically updated
        """
        # Check person exists
        existing_person = await self.repo.get(person_id)
        if existing_person is None:
            return None

        # Build update dict (only non-None fields)
        update_data = data.model_dump(exclude_unset=True)

        # Update person if there are changes
        if update_data:
            updated_person = await self.repo.update(person_id, update_data)
            if updated_person is None:
                # Should not happen since we checked existence, but handle gracefully
                return None
            person = updated_person
        else:
            person = existing_person

        # Convert ORM model to DTO
        return PersonResponse.model_validate(person)

    async def delete(self, person_id: int) -> bool:
        """
        Delete a person by ID.

        Args:
            person_id: Person ID to delete

        Returns:
            True if person was deleted, False if not found

        Example:
            ```python
            deleted = await service.delete(person_id=42)
            if deleted:
                print("Person deleted successfully")
            else:
                print("Person not found")
            ```

        Note:
            - Returns False if person doesn't exist
            - Deletion is permanent and cannot be undone
            - Related gift lists may be affected (depends on foreign key constraints)
        """
        return await self.repo.delete(person_id)
