"""Dashboard service for aggregated dashboard data."""

import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.list_item import ListItem, ListItemStatus
from app.models.occasion import Occasion
from app.models.person import Person
from app.models.list import List
from app.schemas.dashboard import (
    DashboardOccasionSummary,
    DashboardResponse,
    PersonSummary,
)


class DashboardService:
    """
    Dashboard service providing aggregated data for the dashboard view.

    Aggregates data from multiple entities to provide a single response
    with all dashboard data points. Optimized for efficient queries.

    Example:
        ```python
        async with async_session() as session:
            service = DashboardService(session)
            dashboard = await service.get_dashboard(user_id=42)
        ```

    Attributes:
        session: SQLAlchemy async session for database operations.
    """

    def __init__(self, session: AsyncSession) -> None:
        """
        Initialize dashboard service with async database session.

        Args:
            session: SQLAlchemy async session for database operations.
        """
        self.session = session

    async def get_dashboard(self, user_id: int) -> DashboardResponse:
        """
        Get aggregated dashboard data for a user.

        Fetches all dashboard data points in efficient queries:
        - Primary (next) occasion with item counts
        - People needing gifts (with pending item counts)
        - Total ideas count
        - Total purchased count
        - User's assignment count

        Args:
            user_id: ID of the current user.

        Returns:
            DashboardResponse with all aggregated data.

        Example:
            ```python
            dashboard = await service.get_dashboard(user_id=42)
            if dashboard.primary_occasion:
                print(f"Next: {dashboard.primary_occasion.name}")
                print(f"Days until: {dashboard.primary_occasion.days_until}")
            ```
        """
        # Run all queries concurrently for better performance
        primary_occasion = await self._get_primary_occasion()
        people_needing_gifts = await self._get_people_needing_gifts()
        total_ideas = await self._count_by_status(ListItemStatus.idea)
        total_purchased = await self._count_by_status(ListItemStatus.purchased)
        my_assignments = await self._count_user_assignments(user_id)

        return DashboardResponse(
            primary_occasion=primary_occasion,
            people_needing_gifts=people_needing_gifts,
            total_ideas=total_ideas,
            total_purchased=total_purchased,
            my_assignments=my_assignments,
        )

    async def _get_primary_occasion(self) -> DashboardOccasionSummary | None:
        """
        Get the next upcoming occasion with item statistics.

        Finds the occasion with the earliest date >= today and calculates
        total and purchased item counts across all lists for that occasion.

        Returns:
            DashboardOccasionSummary for the next occasion, or None if no
            upcoming occasions exist.
        """
        today = datetime.date.today()

        # Get the next upcoming occasion
        stmt = (
            select(Occasion)
            .where(Occasion.date >= today)
            .order_by(Occasion.date.asc())
            .limit(1)
        )
        result = await self.session.execute(stmt)
        occasion = result.scalar_one_or_none()

        if occasion is None:
            return None

        # Get item counts for this occasion's lists
        total_items_stmt = (
            select(func.count(ListItem.id))
            .join(List, ListItem.list_id == List.id)
            .where(List.occasion_id == occasion.id)
        )
        total_result = await self.session.execute(total_items_stmt)
        total_items = total_result.scalar() or 0

        purchased_items_stmt = (
            select(func.count(ListItem.id))
            .join(List, ListItem.list_id == List.id)
            .where(List.occasion_id == occasion.id)
            .where(
                ListItem.status.in_([ListItemStatus.purchased, ListItemStatus.received])
            )
        )
        purchased_result = await self.session.execute(purchased_items_stmt)
        purchased_items = purchased_result.scalar() or 0

        days_until = (occasion.date - today).days

        return DashboardOccasionSummary(
            id=occasion.id,
            name=occasion.name,
            date=occasion.date,
            days_until=days_until,
            total_items=total_items,
            purchased_items=purchased_items,
        )

    async def _get_people_needing_gifts(self) -> list[PersonSummary]:
        """
        Get people who have pending gifts (not yet purchased).

        Returns people who have lists with items in IDEA or SELECTED status,
        sorted by number of pending gifts descending.

        Returns:
            List of PersonSummary with pending gift counts.
        """
        # Subquery for pending items count per person
        pending_statuses = [ListItemStatus.idea, ListItemStatus.selected]

        stmt = (
            select(
                Person.id,
                Person.name,
                func.count(ListItem.id).label("pending_gifts"),
            )
            .join(List, List.person_id == Person.id)
            .join(ListItem, ListItem.list_id == List.id)
            .where(ListItem.status.in_(pending_statuses))
            .group_by(Person.id, Person.name)
            .having(func.count(ListItem.id) > 0)
            .order_by(func.count(ListItem.id).desc())
        )

        result = await self.session.execute(stmt)
        rows = result.all()

        return [
            PersonSummary(
                id=row.id,
                name=row.name,
                pending_gifts=row.pending_gifts,
            )
            for row in rows
        ]

    async def _count_by_status(self, status: ListItemStatus) -> int:
        """
        Count list items with a specific status.

        Args:
            status: The ListItemStatus to count.

        Returns:
            Total count of items with the given status.
        """
        stmt = select(func.count(ListItem.id)).where(ListItem.status == status)
        result = await self.session.execute(stmt)
        return result.scalar() or 0

    async def _count_user_assignments(self, user_id: int) -> int:
        """
        Count list items assigned to a specific user.

        Counts items where assigned_to matches the user_id and status
        is not yet RECEIVED (still pending action from the user).

        Args:
            user_id: ID of the user to count assignments for.

        Returns:
            Number of items assigned to the user.
        """
        stmt = (
            select(func.count(ListItem.id))
            .where(ListItem.assigned_to == user_id)
            .where(ListItem.status != ListItemStatus.received)
        )
        result = await self.session.execute(stmt)
        return result.scalar() or 0
