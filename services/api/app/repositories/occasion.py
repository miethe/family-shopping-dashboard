"""Occasion repository for managing gifting events."""

from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.occasion import Occasion, OccasionType
from app.repositories.base import BaseRepository


class OccasionRepository(BaseRepository[Occasion]):
    """
    Repository for Occasion model with specialized query methods.

    Extends BaseRepository with occasion-specific operations:
    - Finding upcoming occasions within a date range
    - Filtering occasions by type (birthday, holiday, other)
    - Eager loading of related gift lists

    Example:
        ```python
        repo = OccasionRepository(session)

        # Get occasions in next 30 days
        upcoming = await repo.get_upcoming(days=30)

        # Get all birthdays
        birthdays = await repo.get_by_type(OccasionType.birthday)

        # Get occasion with all related lists loaded
        occasion = await repo.get_with_lists(occasion_id=123)
        ```
    """

    def __init__(self, session: AsyncSession):
        """
        Initialize repository with database session.

        Args:
            session: SQLAlchemy async session
        """
        super().__init__(session, Occasion)

    async def get_upcoming(self, days: int = 30) -> list[Occasion]:
        """
        Get occasions occurring in the next N days.

        Filters occasions where the date is between today and today + days,
        ordered by date ascending (soonest first).

        Args:
            days: Number of days to look ahead (default: 30)

        Returns:
            List of Occasion instances ordered by date (soonest first)

        Example:
            ```python
            # Get occasions in next 2 weeks
            upcoming = await repo.get_upcoming(days=14)

            for occasion in upcoming:
                print(f"{occasion.name} on {occasion.date}")
            ```

        Note:
            Returns empty list if no occasions found in the date range.
        """
        today = date.today()
        end_date = today + timedelta(days=days)

        stmt = (
            select(self.model)
            .where(self.model.date >= today)
            .where(self.model.date <= end_date)
            .order_by(self.model.date.asc())
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_type(self, type: OccasionType) -> list[Occasion]:
        """
        Get all occasions of a specific type.

        Filters occasions by type enum (birthday, holiday, other),
        ordered by date ascending.

        Args:
            type: OccasionType enum value (birthday, holiday, or other)

        Returns:
            List of Occasion instances matching the type, ordered by date

        Example:
            ```python
            # Get all birthdays
            birthdays = await repo.get_by_type(OccasionType.birthday)

            # Get all holidays
            holidays = await repo.get_by_type(OccasionType.holiday)
            ```

        Note:
            Returns empty list if no occasions found for the given type.
        """
        stmt = (
            select(self.model)
            .where(self.model.type == type)
            .order_by(self.model.date.asc())
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_with_lists(self, occasion_id: int) -> Occasion | None:
        """
        Get an occasion with all related gift lists eager loaded.

        Uses SQLAlchemy's selectinload to eager load the lists relationship,
        preventing N+1 query issues when accessing occasion.lists.

        Args:
            occasion_id: Primary key of the occasion

        Returns:
            Occasion instance with lists loaded, or None if not found

        Example:
            ```python
            occasion = await repo.get_with_lists(123)
            if occasion:
                for gift_list in occasion.lists:
                    print(f"List: {gift_list.name}")
            ```

        Note:
            This method is more efficient than get() when you know you'll
            need to access the lists relationship, as it loads everything
            in a single query instead of lazy loading later.
        """
        stmt = (
            select(self.model)
            .where(self.model.id == occasion_id)
            .options(selectinload(self.model.lists))
        )

        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
