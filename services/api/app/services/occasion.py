"""Occasion service for gifting event management."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.occasion import OccasionRepository
from app.schemas.occasion import OccasionCreate, OccasionResponse, OccasionUpdate


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
            data: Occasion creation data (name, type, date, description)

        Returns:
            OccasionResponse DTO with created occasion details

        Example:
            ```python
            occasion = await service.create(OccasionCreate(
                name="Mom's Birthday",
                type=OccasionType.birthday,
                date=date(2025, 3, 15),
                description="Mom's 60th birthday celebration"
            ))
            print(f"Created occasion: {occasion.name}")
            ```

        Note:
            Date can be in the past or future. System supports recurring
            occasions through type categorization.
        """
        # Create occasion in database
        occasion = await self.repo.create(data.model_dump())

        # Convert ORM model to DTO
        return OccasionResponse(
            id=occasion.id,
            name=occasion.name,
            type=occasion.type,
            date=occasion.date,
            description=occasion.description,
            created_at=occasion.created_at,
            updated_at=occasion.updated_at,
        )

    async def get(self, occasion_id: int) -> OccasionResponse | None:
        """
        Get occasion by ID.

        Args:
            occasion_id: Occasion ID to retrieve

        Returns:
            OccasionResponse DTO if found, None otherwise

        Example:
            ```python
            occasion = await service.get(occasion_id=42)
            if occasion:
                print(f"Found occasion: {occasion.name} on {occasion.date}")
            else:
                print("Occasion not found")
            ```
        """
        occasion = await self.repo.get(occasion_id)
        if occasion is None:
            return None

        return OccasionResponse(
            id=occasion.id,
            name=occasion.name,
            type=occasion.type,
            date=occasion.date,
            description=occasion.description,
            created_at=occasion.created_at,
            updated_at=occasion.updated_at,
        )

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
        occasions, has_more, next_cursor = await self.repo.list_paginated(
            cursor=cursor, limit=limit
        )

        # Convert ORM models to DTOs
        occasion_dtos = [
            OccasionResponse(
                id=occ.id,
                name=occ.name,
                type=occ.type,
                date=occ.date,
                description=occ.description,
                created_at=occ.created_at,
                updated_at=occ.updated_at,
            )
            for occ in occasions
        ]

        return occasion_dtos, has_more, next_cursor

    async def get_upcoming(self, limit: int = 10) -> list[OccasionResponse]:
        """
        Get upcoming occasions ordered by date.

        Returns occasions occurring in the next 30 days, ordered by
        date ascending (soonest first).

        Args:
            limit: Maximum number of occasions to return (default: 10)

        Returns:
            List of OccasionResponse DTOs for upcoming occasions

        Example:
            ```python
            upcoming = await service.get_upcoming(limit=5)
            for occasion in upcoming:
                days_until = (occasion.date - date.today()).days
                print(f"{occasion.name} in {days_until} days")
            ```

        Note:
            Uses repository's get_upcoming() which looks ahead 30 days.
            Results are ordered by date ascending (soonest first).
        """
        occasions = await self.repo.get_upcoming(days=30)

        # Limit results (repository returns all within 30 days)
        occasions = occasions[:limit]

        # Convert ORM models to DTOs
        return [
            OccasionResponse(
                id=occ.id,
                name=occ.name,
                type=occ.type,
                date=occ.date,
                description=occ.description,
                created_at=occ.created_at,
                updated_at=occ.updated_at,
            )
            for occ in occasions
        ]

    async def update(
        self, occasion_id: int, data: OccasionUpdate
    ) -> OccasionResponse | None:
        """
        Update an existing occasion.

        Supports partial updates - only provided fields are modified.

        Args:
            occasion_id: Occasion ID to update
            data: Update data (all fields optional)

        Returns:
            Updated OccasionResponse DTO if found, None otherwise

        Example:
            ```python
            # Update just the date
            occasion = await service.update(
                occasion_id=42,
                data=OccasionUpdate(date=date(2025, 12, 26))
            )

            # Update multiple fields
            occasion = await service.update(
                occasion_id=42,
                data=OccasionUpdate(
                    name="Christmas Day 2025",
                    date=date(2025, 12, 25),
                    description="Updated description"
                )
            )
            ```

        Note:
            - Only updates provided fields (partial update)
            - Returns None if occasion not found
        """
        # Check occasion exists
        existing_occasion = await self.repo.get(occasion_id)
        if existing_occasion is None:
            return None

        # Build update dict (only non-None fields)
        update_data = {}
        if data.name is not None:
            update_data["name"] = data.name
        if data.type is not None:
            update_data["type"] = data.type
        if data.date is not None:
            update_data["date"] = data.date
        if data.description is not None:
            update_data["description"] = data.description

        # Update occasion if there are changes
        if update_data:
            updated_occasion = await self.repo.update(occasion_id, update_data)
            if updated_occasion is None:
                # Should not happen since we checked existence, but handle gracefully
                return None
            occasion = updated_occasion
        else:
            occasion = existing_occasion

        # Convert ORM model to DTO
        return OccasionResponse(
            id=occasion.id,
            name=occasion.name,
            type=occasion.type,
            date=occasion.date,
            description=occasion.description,
            created_at=occasion.created_at,
            updated_at=occasion.updated_at,
        )

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
