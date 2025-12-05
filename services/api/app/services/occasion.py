"""Occasion service for gifting event management."""

from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.occasion import OccasionRepository
from app.schemas.occasion import OccasionCreate, OccasionResponse, OccasionUpdate
from app.utils.recurrence import compute_next_occurrence, should_roll_forward


class OccasionService:
    """
    Occasion service handling CRUD and timeline queries.

    Converts ORM models to DTOs for occasions (birthdays, holidays, etc.).

    Example:
        ```python
        async with async_session() as session:
            service = OccasionService(session)
            occasion = await service.create(OccasionCreate(
                name="Christmas 2024",
                type=OccasionType.holiday,
                date=date(2024, 12, 25)
            ))
        ```
    """

    def __init__(self, session: AsyncSession) -> None:
        """
        Initialize occasion service with database session.

        Args:
            session: SQLAlchemy async session for database operations
        """
        self.session = session
        self.repo = OccasionRepository(session)

    async def create(self, data: OccasionCreate) -> OccasionResponse:
        """
        Create a new occasion.

        Args:
            data: Occasion creation data (name, type, date, description, recurrence, persons)

        Returns:
            OccasionResponse DTO with created occasion details

        Example:
            ```python
            occasion = await service.create(OccasionCreate(
                name="Mom's Birthday",
                type=OccasionType.recurring,
                date=date(2025, 3, 15),
                description="Mom's 60th birthday celebration",
                recurrence_rule={"month": 3, "day": 15},
                person_ids=[5]
            ))
            print(f"Created occasion: {occasion.name}")
            ```

        Note:
            - For recurring occasions, provide recurrence_rule and next_occurrence will be set
            - Person IDs will be linked to the occasion after creation
        """
        # Extract person_ids before creating the occasion
        person_ids = data.person_ids
        create_data = data.model_dump(exclude={"person_ids"})

        # Create occasion in database
        occasion = await self.repo.create(create_data)

        # Link persons if provided
        if person_ids:
            await self.repo.link_persons(occasion.id, person_ids)
            # Reload occasion with persons
            occasion = await self.repo.get_with_persons(occasion.id)

        # Convert ORM model to DTO
        return self._to_response(occasion)

    def _to_response(self, occasion: OccasionRepository.model) -> OccasionResponse:
        """
        Convert ORM model to response DTO with person_ids.

        Args:
            occasion: Occasion ORM model instance

        Returns:
            OccasionResponse DTO

        Note:
            Extracts person_ids from the persons relationship if loaded.
        """
        person_ids = []
        if occasion.persons:
            person_ids = [p.id for p in occasion.persons]

        return OccasionResponse(
            id=occasion.id,
            name=occasion.name,
            type=occasion.type,
            date=occasion.date,
            description=occasion.description,
            recurrence_rule=occasion.recurrence_rule,
            is_active=occasion.is_active,
            next_occurrence=occasion.next_occurrence,
            subtype=occasion.subtype,
            person_ids=person_ids,
            created_at=occasion.created_at,
            updated_at=occasion.updated_at,
        )

    async def get(self, occasion_id: int) -> OccasionResponse | None:
        """
        Get occasion by ID with linked persons.

        Args:
            occasion_id: Occasion ID to retrieve

        Returns:
            OccasionResponse DTO if found, None otherwise

        Example:
            ```python
            occasion = await service.get(occasion_id=42)
            if occasion:
                print(f"Found occasion: {occasion.name} on {occasion.date}")
                print(f"Linked persons: {occasion.person_ids}")
            else:
                print("Occasion not found")
            ```
        """
        occasion = await self.repo.get_with_persons(occasion_id)
        if occasion is None:
            return None

        return self._to_response(occasion)

    async def list(
        self, cursor: int | None = None, limit: int = 50
    ) -> tuple[list[OccasionResponse], bool, int | None]:
        """
        List occasions with cursor pagination.

        Returns occasions ordered by date descending (most recent first).

        Args:
            cursor: Optional ID to start pagination from (exclusive)
            limit: Maximum number of occasions to return (default: 50)

        Returns:
            Tuple of (occasions, has_more, next_cursor):
                - occasions: List of OccasionResponse DTOs
                - has_more: True if more results exist beyond this page
                - next_cursor: ID to use for next page, or None if no more results

        Example:
            ```python
            # First page
            occasions, has_more, next_cursor = await service.list(limit=20)

            # Next page
            if has_more:
                more_occasions, has_more, next_cursor = await service.list(
                    cursor=next_cursor, limit=20
                )
            ```

        Note:
            Cursor-based pagination prevents duplicate/missed results
            during concurrent modifications.
        """
        occasions, has_more, next_cursor = await self.repo.get_multi(
            cursor=cursor, limit=limit
        )

        # Convert ORM models to DTOs
        occasion_dtos = [self._to_response(occ) for occ in occasions]

        return occasion_dtos, has_more, next_cursor

    async def get_upcoming(self, within_days: int = 90, limit: int | None = None) -> list[OccasionResponse]:
        """
        Get upcoming occasions ordered by next_occurrence.

        Returns occasions occurring in the next N days, ordered by
        next_occurrence ascending (soonest first).

        Args:
            within_days: Number of days to look ahead (default: 90)
            limit: Optional maximum number of occasions to return

        Returns:
            List of OccasionResponse DTOs for upcoming occasions

        Example:
            ```python
            # Get occasions in next 90 days
            upcoming = await service.get_upcoming(within_days=90)
            for occasion in upcoming:
                days_until = (occasion.next_occurrence - date.today()).days
                print(f"{occasion.name} in {days_until} days")

            # Get next 5 occasions only
            top_5 = await service.get_upcoming(within_days=90, limit=5)
            ```

        Note:
            Uses get_upcoming_by_next_occurrence() which filters by next_occurrence.
            Results are ordered by next_occurrence ascending (soonest first).
        """
        occasions = await self.get_upcoming_by_next_occurrence(within_days=within_days)

        # Limit results if requested
        if limit is not None:
            occasions = occasions[:limit]

        return occasions

    async def update(
        self, occasion_id: int, data: OccasionUpdate
    ) -> OccasionResponse | None:
        """
        Update an existing occasion.

        Supports partial updates - only provided fields are modified.
        Handles person linkage updates if person_ids is provided.

        Args:
            occasion_id: Occasion ID to update
            data: Update data (all fields optional, including person_ids)

        Returns:
            Updated OccasionResponse DTO if found, None otherwise

        Example:
            ```python
            # Update just the date
            occasion = await service.update(
                occasion_id=42,
                data=OccasionUpdate(date=date(2025, 12, 26))
            )

            # Update multiple fields including person linkage
            occasion = await service.update(
                occasion_id=42,
                data=OccasionUpdate(
                    name="Christmas Day 2025",
                    date=date(2025, 12, 25),
                    description="Updated description",
                    person_ids=[5, 10]
                )
            )
            ```

        Note:
            - Only updates provided fields (partial update)
            - Returns None if occasion not found
            - If person_ids provided, replaces all existing person links
        """
        # Check occasion exists
        existing_occasion = await self.repo.get(occasion_id)
        if existing_occasion is None:
            return None

        # Extract person_ids for separate handling
        person_ids = data.person_ids

        # Build update dict (only non-None fields, excluding person_ids)
        update_data = {}
        if data.name is not None:
            update_data["name"] = data.name
        if data.type is not None:
            update_data["type"] = data.type
        if data.date is not None:
            update_data["date"] = data.date
        if data.description is not None:
            update_data["description"] = data.description
        if data.recurrence_rule is not None:
            update_data["recurrence_rule"] = data.recurrence_rule
        if data.is_active is not None:
            update_data["is_active"] = data.is_active
        if data.subtype is not None:
            update_data["subtype"] = data.subtype

        # Update occasion if there are changes
        if update_data:
            updated_occasion = await self.repo.update(occasion_id, update_data)
            if updated_occasion is None:
                return None
            occasion = updated_occasion
        else:
            occasion = existing_occasion

        # Update person linkage if provided
        if person_ids is not None:
            await self.repo.set_persons(occasion_id, person_ids)

        # Reload with persons to get updated person_ids
        occasion = await self.repo.get_with_persons(occasion_id)
        if occasion is None:
            return None

        # Convert ORM model to DTO
        return self._to_response(occasion)

    async def delete(self, occasion_id: int) -> bool:
        """
        Delete an occasion.

        Args:
            occasion_id: Occasion ID to delete

        Returns:
            True if deleted successfully, False if not found

        Example:
            ```python
            if await service.delete(occasion_id=42):
                print("Occasion deleted")
            else:
                print("Occasion not found")
            ```

        Note:
            - Deletion cascades to related gift lists (if configured in ORM)
            - Returns False (not exception) if occasion doesn't exist
        """
        return await self.repo.delete(occasion_id)

    async def update_next_occurrences(self) -> int:
        """
        Roll forward all recurring occasions that have passed.

        Iterates through all active recurring occasions and updates their
        next_occurrence if it's in the past or not set.

        Returns:
            Count of updated occasions

        Example:
            ```python
            # Typically run as a scheduled task (cron job)
            updated = await service.update_next_occurrences()
            print(f"Updated {updated} recurring occasions")
            ```

        Note:
            - Only processes active recurring occasions (type=RECURRING, is_active=True)
            - Uses recurrence_rule to compute next occurrence
            - Skips occasions without valid recurrence_rule
            - Safe to run repeatedly (idempotent)
        """
        occasions = await self.repo.get_recurring_occasions()
        updated = 0

        for occasion in occasions:
            if occasion.recurrence_rule and should_roll_forward(
                occasion.date, occasion.next_occurrence
            ):
                new_next = compute_next_occurrence(occasion.recurrence_rule)
                if new_next:
                    await self.repo.update(occasion.id, {"next_occurrence": new_next})
                    updated += 1

        return updated

    async def get_upcoming_by_next_occurrence(
        self, within_days: int = 90
    ) -> list[OccasionResponse]:
        """
        Get occasions occurring within the next N days.

        Returns occasions where next_occurrence falls within the specified
        time window, ordered by soonest first.

        Args:
            within_days: Number of days to look ahead (default: 90)

        Returns:
            List of OccasionResponse DTOs for upcoming occasions

        Example:
            ```python
            # Get occasions in next 3 months
            upcoming = await service.get_upcoming_by_next_occurrence(within_days=90)

            for occasion in upcoming:
                days_until = (occasion.next_occurrence - date.today()).days
                print(f"{occasion.name} in {days_until} days")
            ```

        Note:
            - Only returns active occasions with next_occurrence set
            - Excludes occasions with next_occurrence in the past
            - Results ordered by next_occurrence ascending (soonest first)
            - Useful for dashboard "upcoming events" widgets
        """
        occasions = await self.repo.get_upcoming_by_next_occurrence(
            within_days=within_days
        )

        # Convert ORM models to DTOs
        return [self._to_response(occ) for occ in occasions]
