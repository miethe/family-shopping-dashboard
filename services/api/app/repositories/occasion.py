"""Occasion repository for managing gifting events."""

from datetime import date, timedelta

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.occasion import Occasion, OccasionType
from app.models.person import PersonOccasion
from app.repositories.base import BaseRepository


class OccasionRepository(BaseRepository[Occasion]):
    """
    Repository for Occasion model with specialized query methods.

    Extends BaseRepository with occasion-specific operations:
    - Finding upcoming occasions within a date range
    - Filtering occasions by type (birthday, holiday, other)
    - Eager loading of related gift lists
    - Managing person-occasion linkages

    Example:
        ```python
        repo = OccasionRepository(session)

        # Get occasions in next 30 days
        upcoming = await repo.get_upcoming(days=30)

        # Get all birthdays
        birthdays = await repo.get_by_type(OccasionType.birthday)

        # Get occasion with all related lists loaded
        occasion = await repo.get_with_lists(occasion_id=123)

        # Link persons to an occasion
        await repo.link_persons(occasion_id=1, person_ids=[5, 10])
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

    async def get_with_persons(self, occasion_id: int) -> Occasion | None:
        """
        Get an occasion with all related persons eager loaded.

        Uses SQLAlchemy's selectinload to eager load the persons relationship,
        preventing N+1 query issues when accessing occasion.persons.

        Args:
            occasion_id: Primary key of the occasion

        Returns:
            Occasion instance with persons loaded, or None if not found

        Example:
            ```python
            occasion = await repo.get_with_persons(123)
            if occasion:
                for person in occasion.persons:
                    print(f"Person: {person.display_name}")
            ```

        Note:
            This method is more efficient when you need to access the persons
            relationship, as it eager loads in a single query.
        """
        stmt = (
            select(self.model)
            .where(self.model.id == occasion_id)
            .options(selectinload(self.model.persons))
        )

        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_recurring_occasions(self) -> list[Occasion]:
        """
        Get all active recurring occasions.

        Returns occasions where type is RECURRING and is_active is True,
        which are candidates for rolling forward their next_occurrence.

        Returns:
            List of active recurring Occasion instances

        Example:
            ```python
            from app.utils.recurrence import should_roll_forward

            recurring = await repo.get_recurring_occasions()
            for occasion in recurring:
                if should_roll_forward(occasion.date, occasion.next_occurrence):
                    # Update next_occurrence
                    pass
            ```

        Note:
            Only returns active occasions. Inactive recurring occasions
            (is_active=False) are excluded from the results.
        """
        stmt = select(self.model).where(
            self.model.type == OccasionType.RECURRING, self.model.is_active == True
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_upcoming_by_next_occurrence(self, within_days: int = 90) -> list[Occasion]:
        """
        Get occasions with next_occurrence within N days.

        Filters active occasions by next_occurrence date, ordered by soonest first.
        This is useful for recurring occasions that track their next occurrence.

        Args:
            within_days: Number of days to look ahead (default: 90)

        Returns:
            List of Occasion instances ordered by next_occurrence (soonest first)

        Example:
            ```python
            # Get all occasions in next 3 months
            upcoming = await repo.get_upcoming_by_next_occurrence(within_days=90)

            for occasion in upcoming:
                days_until = (occasion.next_occurrence - date.today()).days
                print(f"{occasion.name} in {days_until} days")
            ```

        Note:
            Only returns occasions where:
            - is_active is True
            - next_occurrence is not None
            - next_occurrence is between today and today + within_days
        """
        today = date.today()
        cutoff = today + timedelta(days=within_days)

        stmt = (
            select(self.model)
            .where(self.model.is_active == True)
            .where(self.model.next_occurrence.isnot(None))
            .where(self.model.next_occurrence >= today)
            .where(self.model.next_occurrence <= cutoff)
            .order_by(self.model.next_occurrence.asc())
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def link_persons(self, occasion_id: int, person_ids: list[int]) -> None:
        """
        Link persons to an occasion.

        Creates PersonOccasion records to associate persons with the occasion.
        Ignores duplicates (won't create if link already exists).

        Args:
            occasion_id: ID of the occasion
            person_ids: List of person IDs to link

        Example:
            ```python
            # Link persons 5 and 10 to occasion 1
            await repo.link_persons(occasion_id=1, person_ids=[5, 10])
            ```

        Note:
            This method does not remove existing links. Use set_persons()
            to replace all links, or unlink_persons() to remove specific links.
        """
        for person_id in person_ids:
            # Check if link already exists
            stmt = select(PersonOccasion).where(
                PersonOccasion.occasion_id == occasion_id,
                PersonOccasion.person_id == person_id,
            )
            result = await self.session.execute(stmt)
            existing = result.scalar_one_or_none()

            # Only create if link doesn't exist
            if existing is None:
                link = PersonOccasion(occasion_id=occasion_id, person_id=person_id)
                self.session.add(link)

        await self.session.commit()

    async def unlink_persons(self, occasion_id: int, person_ids: list[int]) -> None:
        """
        Unlink persons from an occasion.

        Deletes PersonOccasion records for the specified persons and occasion.

        Args:
            occasion_id: ID of the occasion
            person_ids: List of person IDs to unlink

        Example:
            ```python
            # Unlink person 5 from occasion 1
            await repo.unlink_persons(occasion_id=1, person_ids=[5])
            ```

        Note:
            This method only removes specified links. Use set_persons()
            to replace all links at once.
        """
        stmt = delete(PersonOccasion).where(
            PersonOccasion.occasion_id == occasion_id,
            PersonOccasion.person_id.in_(person_ids),
        )
        await self.session.execute(stmt)
        await self.session.commit()

    async def set_persons(self, occasion_id: int, person_ids: list[int]) -> None:
        """
        Replace all linked persons for an occasion.

        Deletes all existing PersonOccasion links and creates new ones.
        This is useful for bulk updates when you want to replace the entire set.

        Args:
            occasion_id: ID of the occasion
            person_ids: List of person IDs to set as the new links

        Example:
            ```python
            # Replace all person links with just persons 5 and 10
            await repo.set_persons(occasion_id=1, person_ids=[5, 10])

            # Remove all person links
            await repo.set_persons(occasion_id=1, person_ids=[])
            ```

        Note:
            This method is atomic - all existing links are removed before
            new ones are created.
        """
        # Remove all existing links for this occasion
        stmt = delete(PersonOccasion).where(PersonOccasion.occasion_id == occasion_id)
        await self.session.execute(stmt)

        # Add new links
        for person_id in person_ids:
            link = PersonOccasion(occasion_id=occasion_id, person_id=person_id)
            self.session.add(link)

        await self.session.commit()
