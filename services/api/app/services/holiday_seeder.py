"""Holiday seeder service for standard holiday templates."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.data.holidays import STANDARD_HOLIDAYS
from app.models.occasion import Occasion, OccasionType
from app.utils.recurrence import compute_next_occurrence


class HolidaySeederService:
    """
    Service for seeding standard holidays into the database.

    Handles idempotent holiday creation with duplicate guards and
    next occurrence computation.

    Example:
        ```python
        async with async_session() as session:
            seeder = HolidaySeederService(session)

            # Seed all standard holidays
            stats = await seeder.seed_standard_holidays()
            print(f"Created: {stats['created']}, Skipped: {stats['skipped']}")

            # Check if holidays exist (idempotent)
            needs_seeding = await seeder.ensure_holidays_exist()
            print(f"Seeding performed: {needs_seeding}")
        ```
    """

    def __init__(self, session: AsyncSession) -> None:
        """
        Initialize holiday seeder with database session.

        Args:
            session: SQLAlchemy async session for database operations
        """
        self.session = session

    async def seed_standard_holidays(self, force: bool = False) -> dict[str, int]:
        """
        Seed standard holidays into the database.

        Creates holiday occasions from the STANDARD_HOLIDAYS template list.
        Guards against duplicates by checking holiday name + type before creation.

        Args:
            force: If True, skip duplicate checks and recreate existing holidays
                  (WARNING: This may create duplicates if not used carefully)

        Returns:
            Dictionary with creation statistics:
                - "created": Number of holidays created
                - "skipped": Number of holidays skipped (already exist)

        Example:
            ```python
            # Normal seeding (skip duplicates)
            stats = await seeder.seed_standard_holidays()
            print(f"Created {stats['created']} new holidays")

            # Force recreate (for testing/migration)
            stats = await seeder.seed_standard_holidays(force=True)
            print(f"Recreated {stats['created']} holidays")
            ```

        Note:
            - Uses holiday name as the uniqueness key (case-sensitive)
            - Computes next_occurrence for each holiday
            - Commits after all holidays are processed
        """
        stats = {"created": 0, "skipped": 0}

        for holiday_template in STANDARD_HOLIDAYS:
            # Check for duplicate (unless force=True)
            if not force:
                existing = await self._get_holiday_by_name(holiday_template["name"])
                if existing:
                    stats["skipped"] += 1
                    continue

            # Compute next occurrence from recurrence rule
            next_occurrence = None
            if holiday_template["recurrence_rule"]:
                next_occurrence = compute_next_occurrence(holiday_template["recurrence_rule"])

            # Create the occasion
            # Use next_occurrence as initial date if available, otherwise use today
            occasion_date = next_occurrence or next_occurrence  # Will use next_occurrence or None

            # For holidays with next_occurrence, use that as the date
            # This ensures the date field represents the next upcoming occurrence
            occasion = Occasion(
                name=holiday_template["name"],
                type=OccasionType.HOLIDAY,
                date=next_occurrence,  # Use computed next occurrence
                recurrence_rule=holiday_template["recurrence_rule"],
                next_occurrence=next_occurrence,
                is_active=True,
                subtype=holiday_template.get("subtype"),
                description=f"Standard holiday: {holiday_template['name']}",
            )

            self.session.add(occasion)
            stats["created"] += 1

        # Commit all changes
        await self.session.commit()
        return stats

    async def ensure_holidays_exist(self) -> bool:
        """
        Idempotent check that seeds holidays if none exist.

        Checks if any holidays exist in the database. If none are found,
        seeds the standard holidays. Safe to call multiple times.

        Returns:
            True if seeding was performed, False if holidays already exist

        Example:
            ```python
            # Call on application startup
            async with async_session() as session:
                seeder = HolidaySeederService(session)
                was_seeded = await seeder.ensure_holidays_exist()

                if was_seeded:
                    print("Seeded standard holidays on first run")
                else:
                    print("Holidays already exist, skipping seeding")
            ```

        Note:
            - Only checks for existence of ANY holiday
            - Does not check if ALL standard holidays exist
            - Use seed_standard_holidays() directly for more control
        """
        # Check if any holidays exist
        stmt = select(Occasion).where(Occasion.type == OccasionType.HOLIDAY).limit(1)
        result = await self.session.execute(stmt)

        if result.scalar_one_or_none():
            # Holidays already exist, skip seeding
            return False

        # No holidays found, seed them
        await self.seed_standard_holidays()
        return True

    async def _get_holiday_by_name(self, name: str) -> Occasion | None:
        """
        Check if a holiday already exists by name.

        Private helper method for duplicate detection.

        Args:
            name: Holiday name to search for (case-sensitive)

        Returns:
            Occasion instance if found, None otherwise

        Note:
            - Only checks HOLIDAY type occasions
            - Uses exact name match (case-sensitive)
        """
        stmt = select(Occasion).where(
            Occasion.name == name,
            Occasion.type == OccasionType.HOLIDAY,
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
