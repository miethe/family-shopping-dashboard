"""Hooks to auto-sync person data with linked occasions."""

from __future__ import annotations

from datetime import date

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.occasion import Occasion, OccasionType
from app.models.person import Person, PersonOccasion
from app.utils.recurrence import compute_next_occurrence


class PersonOccasionHooks:
    """
    Hooks to sync person data with auto-generated occasions.

    Automatically creates, updates, and removes birthday/anniversary occasions
    when person data changes.

    Example:
        ```python
        async with async_session() as session:
            hooks = PersonOccasionHooks(session)

            # After creating a person with birthdate
            person = Person(display_name="Mom", birthdate=date(1960, 3, 15))
            await hooks.on_person_created(person)
            # Creates "Mom's Birthday" occasion with recurrence

            # After updating birthdate
            await hooks.on_person_updated(
                person,
                old_birthdate=date(1960, 3, 15),
                old_anniversary=None
            )
            # Updates existing birthday occasion with new date

            # Before deleting person
            await hooks.on_person_deleted(person.id)
            # Removes auto-generated occasions
        ```

    Note:
        - Only manages occasions with subtype="birthday" or "anniversary"
        - Does not affect manually created occasions
        - Occasions are only deleted if no other persons are linked
    """

    def __init__(self, db: AsyncSession) -> None:
        """
        Initialize person occasion hooks.

        Args:
            db: SQLAlchemy async session for database operations
        """
        self.db = db

    async def on_person_created(self, person: Person) -> list[Occasion]:
        """
        Called after a person is created. Creates birthday/anniversary occasions.

        Args:
            person: Newly created person instance

        Returns:
            List of created occasions (0-2 items)

        Example:
            ```python
            person = Person(
                display_name="Sarah",
                birthdate=date(1990, 6, 20),
                anniversary=date(2015, 9, 10)
            )
            occasions = await hooks.on_person_created(person)
            # Returns 2 occasions: birthday and anniversary
            ```
        """
        created = []

        if person.birthdate:
            occasion = await self._create_or_update_birthday(person)
            if occasion:
                created.append(occasion)

        if person.anniversary:
            occasion = await self._create_or_update_anniversary(person)
            if occasion:
                created.append(occasion)

        return created

    async def on_person_updated(
        self,
        person: Person,
        old_birthdate: date | None,
        old_anniversary: date | None,
    ) -> None:
        """
        Called after a person is updated. Syncs birthday/anniversary occasions.

        Args:
            person: Updated person instance
            old_birthdate: Previous birthdate value (None if unchanged)
            old_anniversary: Previous anniversary value (None if unchanged)

        Example:
            ```python
            # Person's birthdate changed from March 15 to March 20
            person.birthdate = date(1960, 3, 20)
            await hooks.on_person_updated(
                person,
                old_birthdate=date(1960, 3, 15),
                old_anniversary=None
            )
            # Updates birthday occasion to new date
            ```

        Note:
            - If birthdate changes from None to a date, creates occasion
            - If birthdate changes from a date to None, removes occasion
            - If birthdate changes from one date to another, updates occasion
        """
        # Handle birthdate changes
        if person.birthdate != old_birthdate:
            if person.birthdate:
                await self._create_or_update_birthday(person)
            else:
                await self._remove_auto_occasion(person.id, "birthday")

        # Handle anniversary changes
        if person.anniversary != old_anniversary:
            if person.anniversary:
                await self._create_or_update_anniversary(person)
            else:
                await self._remove_auto_occasion(person.id, "anniversary")

    async def on_person_deleted(self, person_id: int) -> None:
        """
        Called before a person is deleted. Removes auto-generated occasions.

        Args:
            person_id: ID of person being deleted

        Example:
            ```python
            await hooks.on_person_deleted(person_id=42)
            # Removes birthday/anniversary occasions if no other persons linked
            ```

        Note:
            - Only removes occasions if person was the sole link
            - If multiple persons share an occasion, it's preserved
            - Uses CASCADE delete for PersonOccasion links
        """
        # Find auto-generated occasions linked to this person
        stmt = (
            select(Occasion)
            .join(PersonOccasion)
            .where(
                PersonOccasion.person_id == person_id,
                Occasion.type == OccasionType.RECURRING,
                Occasion.subtype.in_(["birthday", "anniversary"]),
            )
        )
        result = await self.db.execute(stmt)
        occasions = list(result.scalars().all())

        for occasion in occasions:
            # Only delete if this was the only linked person
            count = await self._count_linked_persons(occasion.id)
            if count <= 1:
                await self.db.delete(occasion)

        await self.db.commit()

    async def _create_or_update_birthday(self, person: Person) -> Occasion | None:
        """
        Create or update a birthday occasion for a person.

        Args:
            person: Person instance with birthdate

        Returns:
            Created or updated Occasion instance, or None if no birthdate

        Note:
            - Creates new occasion if none exists
            - Updates existing occasion if found
            - Links person to occasion via PersonOccasion
        """
        if not person.birthdate:
            return None

        # Check if birthday occasion already exists
        existing = await self._get_person_occasion(person.id, "birthday")

        recurrence_rule = {
            "month": person.birthdate.month,
            "day": person.birthdate.day,
        }
        next_occurrence = compute_next_occurrence(recurrence_rule)

        if existing:
            # Update existing
            existing.recurrence_rule = recurrence_rule
            existing.next_occurrence = next_occurrence
            existing.date = next_occurrence or person.birthdate
            await self.db.commit()
            return existing

        # Create new birthday occasion
        occasion = Occasion(
            name=f"{person.display_name}'s Birthday",
            type=OccasionType.RECURRING,
            subtype="birthday",
            date=next_occurrence or person.birthdate,
            recurrence_rule=recurrence_rule,
            next_occurrence=next_occurrence,
            is_active=True,
        )
        self.db.add(occasion)
        await self.db.flush()

        # Link to person
        link = PersonOccasion(person_id=person.id, occasion_id=occasion.id)
        self.db.add(link)
        await self.db.commit()

        return occasion

    async def _create_or_update_anniversary(self, person: Person) -> Occasion | None:
        """
        Create or update an anniversary occasion for a person.

        Args:
            person: Person instance with anniversary

        Returns:
            Created or updated Occasion instance, or None if no anniversary

        Note:
            - Creates new occasion if none exists
            - Updates existing occasion if found
            - Links person to occasion via PersonOccasion
        """
        if not person.anniversary:
            return None

        existing = await self._get_person_occasion(person.id, "anniversary")

        recurrence_rule = {
            "month": person.anniversary.month,
            "day": person.anniversary.day,
        }
        next_occurrence = compute_next_occurrence(recurrence_rule)

        if existing:
            existing.recurrence_rule = recurrence_rule
            existing.next_occurrence = next_occurrence
            existing.date = next_occurrence or person.anniversary
            await self.db.commit()
            return existing

        occasion = Occasion(
            name=f"{person.display_name}'s Anniversary",
            type=OccasionType.RECURRING,
            subtype="anniversary",
            date=next_occurrence or person.anniversary,
            recurrence_rule=recurrence_rule,
            next_occurrence=next_occurrence,
            is_active=True,
        )
        self.db.add(occasion)
        await self.db.flush()

        link = PersonOccasion(person_id=person.id, occasion_id=occasion.id)
        self.db.add(link)
        await self.db.commit()

        return occasion

    async def _get_person_occasion(
        self, person_id: int, subtype: str
    ) -> Occasion | None:
        """
        Get an auto-generated occasion for a person by subtype.

        Args:
            person_id: ID of person
            subtype: Occasion subtype ("birthday" or "anniversary")

        Returns:
            Occasion instance if found, None otherwise

        Note:
            Only finds occasions linked to this specific person via PersonOccasion
        """
        stmt = (
            select(Occasion)
            .join(PersonOccasion)
            .where(
                PersonOccasion.person_id == person_id,
                Occasion.subtype == subtype,
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def _remove_auto_occasion(self, person_id: int, subtype: str) -> None:
        """
        Remove an auto-generated occasion for a person.

        Args:
            person_id: ID of person
            subtype: Occasion subtype ("birthday" or "anniversary")

        Note:
            - Only removes if this person is the sole link
            - PersonOccasion link is removed via CASCADE
        """
        occasion = await self._get_person_occasion(person_id, subtype)
        if occasion:
            count = await self._count_linked_persons(occasion.id)
            if count <= 1:
                await self.db.delete(occasion)
                await self.db.commit()

    async def _count_linked_persons(self, occasion_id: int) -> int:
        """
        Count persons linked to an occasion.

        Args:
            occasion_id: ID of occasion

        Returns:
            Number of persons linked to this occasion

        Note:
            Used to determine if an occasion can be safely deleted
        """
        stmt = select(func.count()).select_from(PersonOccasion).where(
            PersonOccasion.occasion_id == occasion_id
        )
        result = await self.db.execute(stmt)
        return result.scalar_one() or 0
