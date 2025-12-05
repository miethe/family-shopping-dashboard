"""Person service for gift recipient management."""

from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.person import PersonRepository
from app.schemas.person import PersonCreate, PersonResponse, PersonUpdate, SizeEntry
from app.services.person_occasion_hooks import PersonOccasionHooks


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
        self.hooks = PersonOccasionHooks(session)

    async def create(self, data: PersonCreate) -> PersonResponse:
        """
        Create a new person for gift tracking.

        Args:
            data: Person creation data (name, interests, sizes, group_ids)

        Returns:
            PersonResponse DTO with created person details

        Example:
            ```python
            person = await service.create(PersonCreate(
                name="Sarah",
                interests=["Photography", "Hiking"],
                sizes={"shirt": "S", "pants": "28x32"},
                group_ids=[1, 2]
            ))
            print(f"Created person: {person.name}")
            ```

        Note:
            - Name is required and must be 1-100 characters
            - Interests and sizes are optional
            - Timestamps (created_at, updated_at) are auto-generated
            - Group IDs are linked after person creation
        """
        # Extract group_ids before creating person
        group_ids = data.group_ids
        person_data = data.model_dump(
            exclude_unset=True, exclude_none=True, exclude={"group_ids"}
        )
        person_data = self._normalize_payload(person_data)

        # Create person in database
        person = await self.repo.create(person_data)

        # Link to groups if provided
        if group_ids:
            await self.repo.set_groups(person.id, group_ids)

        # Fetch person with groups loaded
        person_with_groups = await self.repo.get_with_groups(person.id)
        if person_with_groups is None:
            # Should not happen, but handle gracefully
            person_with_groups = person

        # Auto-create birthday/anniversary occasions if applicable
        await self.hooks.on_person_created(person_with_groups)

        # Convert ORM model to DTO
        return PersonResponse.model_validate(person_with_groups)

    async def get(self, person_id: int) -> PersonResponse | None:
        """
        Get person by ID with groups loaded.

        Args:
            person_id: Person ID to retrieve

        Returns:
            PersonResponse DTO if found, None otherwise

        Example:
            ```python
            person = await service.get(person_id=42)
            if person:
                print(f"Found: {person.display_name}")
                print(f"Interests: {person.interests}")
                print(f"Groups: {[g.name for g in person.groups]}")
            else:
                print("Person not found")
            ```
        """
        # Get person with groups eagerly loaded
        person = await self.repo.get_with_groups(person_id)
        if person is None:
            return None

        return PersonResponse.model_validate(person)

    async def list(
        self,
        cursor: int | None = None,
        limit: int = 50,
        group_id: int | None = None,
    ) -> tuple[list[PersonResponse], bool, int | None]:
        """
        List people with cursor-based pagination and optional group filtering.

        Cursor-based pagination provides better performance than offset-based
        pagination, especially for large datasets.

        Args:
            cursor: ID of the last person from the previous page (None for first page)
            limit: Maximum number of people to return (default: 50)
            group_id: Optional group ID to filter by (None for no filter)

        Returns:
            Tuple of (people, has_more, next_cursor):
            - people: List of PersonResponse DTOs (up to `limit` items)
            - has_more: True if more people exist after this page
            - next_cursor: ID to use for next page (None if no more items)

        Example:
            ```python
            # First page - all persons
            people, has_more, next_cursor = await service.list(limit=20)
            for person in people:
                print(f"- {person.display_name}")

            # First page - filtered by group
            people, has_more, next_cursor = await service.list(
                limit=20, group_id=1
            )

            # Second page
            if has_more:
                people, has_more, next_cursor = await service.list(
                    cursor=next_cursor,
                    limit=20,
                    group_id=group_id
                )
            ```

        Note:
            Results are ordered by ID in ascending order.
        """
        # Get paginated list from repository with optional group filter
        people, has_more, next_cursor = await self.repo.get_multi_with_group_filter(
            cursor=cursor,
            limit=limit,
            group_id=group_id,
            order_by="id",
            descending=False,
        )

        # Convert ORM models to DTOs
        people_dtos = [PersonResponse.model_validate(person) for person in people]

        return people_dtos, has_more, next_cursor

    async def update(self, person_id: int, data: PersonUpdate) -> PersonResponse | None:
        """
        Update person details including group memberships.

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
                    sizes={"shirt": "M", "pants": "32x30", "shoe": "10"},
                    group_ids=[1, 2, 3]
                )
            )
            if person:
                print(f"Updated: {person.display_name}")
            ```

        Note:
            - Only updates provided fields (partial update)
            - Returns None if person not found
            - updated_at timestamp is automatically updated
            - group_ids=None means don't change groups; group_ids=[] removes all groups
        """
        # Check person exists
        existing_person = await self.repo.get(person_id)
        if existing_person is None:
            return None

        # Capture old values for hook comparison
        old_birthdate = existing_person.birthdate
        old_anniversary = existing_person.anniversary

        # Extract group_ids separately
        update_dict = data.model_dump(exclude_unset=True)
        group_ids = update_dict.pop("group_ids", None)
        update_dict = self._normalize_payload(update_dict)

        # Update person fields if there are changes
        if update_dict:
            updated_person = await self.repo.update(person_id, update_dict)
            if updated_person is None:
                # Should not happen since we checked existence, but handle gracefully
                return None

        # Update group memberships if provided (None means don't change)
        if group_ids is not None:
            await self.repo.set_groups(person_id, group_ids)

        # Fetch person with groups loaded
        person_with_groups = await self.repo.get_with_groups(person_id)
        if person_with_groups is None:
            # Should not happen since we checked existence, but handle gracefully
            return None

        # Auto-sync birthday/anniversary occasions if dates changed
        await self.hooks.on_person_updated(
            person_with_groups, old_birthdate, old_anniversary
        )

        # Convert ORM model to DTO
        return PersonResponse.model_validate(person_with_groups)

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
            - Auto-generated occasions are removed if no other persons linked
        """
        # Remove auto-generated occasions before deleting person
        await self.hooks.on_person_deleted(person_id)

        return await self.repo.delete(person_id)

    @staticmethod
    def _prepare_size_fields(
        size_profile: list[SizeEntry] | list[dict[str, Any]] | None,
        sizes_map: dict[str, Any] | None,
    ) -> tuple[list[dict[str, Any]] | None, dict[str, str] | None]:
        """
        Normalize size inputs into structured payloads and legacy map.
        """
        if size_profile is not None:
            profile_payload: list[dict[str, Any]] = []
            for entry in size_profile:
                entry_data = (
                    entry.model_dump(exclude_none=True)
                    if isinstance(entry, SizeEntry)
                    else {k: v for k, v in entry.items() if v is not None}
                )
                size_type = entry_data.get("type")
                size_value = entry_data.get("value")
                if size_type and size_value:
                    profile_payload.append(entry_data)

            sizes_payload = (
                {entry["type"]: entry["value"] for entry in profile_payload}
                if profile_payload
                else None
            )
            return profile_payload or None, sizes_payload

        if sizes_map is not None:
            profile_payload = [
                {"type": size_type, "value": size_value}
                for size_type, size_value in sizes_map.items()
                if size_type and size_value
            ]
            return profile_payload or None, sizes_map or None

        return None, None

    @classmethod
    def _normalize_payload(cls, payload: dict[str, Any]) -> dict[str, Any]:
        """
        Normalize payload for persistence, ensuring size fields and advanced interests
        are aligned and empty payloads are dropped.
        """
        size_profile_present = "size_profile" in payload
        sizes_present = "sizes" in payload

        size_profile = payload.pop("size_profile", None)
        sizes_map = payload.pop("sizes", None)
        normalized_profile, normalized_sizes = cls._prepare_size_fields(
            size_profile=size_profile,
            sizes_map=sizes_map,
        )

        if normalized_profile is not None or size_profile_present:
            payload["size_profile"] = normalized_profile
        if normalized_sizes is not None or sizes_present:
            payload["sizes"] = normalized_sizes

        if "advanced_interests" in payload:
            advanced_interests = payload["advanced_interests"]
            if isinstance(advanced_interests, dict) and not advanced_interests:
                payload["advanced_interests"] = None

        return payload
