"""ListItem repository - queries for list items, status tracking, and assignments."""

from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.list_item import ListItem, ListItemStatus
from app.repositories.base import BaseRepository


class ListItemRepository(BaseRepository[ListItem]):
    """
    Repository for ListItem model with specialized queries.

    Extends BaseRepository with list-item-specific operations:
    - Filter by list, status, or assigned user
    - Eager load relationships (gift, list, assignee)
    - Aggregate status counts for dashboard views
    """

    def __init__(self, session: AsyncSession):
        """
        Initialize repository with database session.

        Args:
            session: SQLAlchemy async session
        """
        super().__init__(session, ListItem)

    async def get_by_list(self, list_id: int) -> list[ListItem]:
        """
        Get all items in a specific list.

        Args:
            list_id: Foreign key of the list

        Returns:
            List of ListItem instances, ordered by creation date (newest first)

        Example:
            ```python
            items = await repo.get_by_list(list_id=123)
            for item in items:
                print(f"{item.gift.name} - {item.status}")
            ```
        """
        stmt = (
            select(ListItem)
            .where(ListItem.list_id == list_id)
            .options(selectinload(ListItem.gift))
            .order_by(ListItem.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_status(self, status: ListItemStatus) -> list[ListItem]:
        """
        Get all list items with a specific status across all lists.

        Args:
            status: ListItemStatus enum value (idea/selected/purchased/received)

        Returns:
            List of ListItem instances with matching status

        Example:
            ```python
            purchased_items = await repo.get_by_status(ListItemStatus.purchased)
            print(f"Total purchased: {len(purchased_items)}")
            ```
        """
        stmt = (
            select(ListItem)
            .where(ListItem.status == status)
            .order_by(ListItem.updated_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_assigned_to(self, user_id: int) -> list[ListItem]:
        """
        Get all items assigned to a specific user.

        Args:
            user_id: Foreign key of the assigned user

        Returns:
            List of ListItem instances assigned to the user

        Example:
            ```python
            my_items = await repo.get_by_assigned_to(user_id=456)
            print(f"You have {len(my_items)} items to purchase")
            ```

        Note:
            Only returns items where assigned_to is not NULL and matches user_id.
        """
        stmt = (
            select(ListItem)
            .where(ListItem.assigned_to == user_id)
            .order_by(ListItem.status, ListItem.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_with_gift(self, list_item_id: int) -> ListItem | None:
        """
        Get a list item with its associated gift eagerly loaded.

        Uses selectinload to fetch the gift relationship in a single query,
        avoiding N+1 problems when accessing gift data.

        Args:
            list_item_id: Primary key of the list item

        Returns:
            ListItem instance with gift relationship loaded, or None if not found

        Example:
            ```python
            item = await repo.get_with_gift(list_item_id=789)
            if item:
                print(f"Gift: {item.gift.name}")  # No additional query needed
                print(f"Price: ${item.gift.price}")
            ```
        """
        stmt = (
            select(ListItem)
            .where(ListItem.id == list_item_id)
            .options(selectinload(ListItem.gift))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_status_counts_for_list(self, list_id: int) -> dict[str, int]:
        """
        Get aggregated status counts for all items in a list.

        Uses SQL GROUP BY and COUNT for efficient aggregation at the database level.
        Returns counts for all statuses, with 0 for statuses that have no items.

        Args:
            list_id: Foreign key of the list

        Returns:
            Dictionary mapping status values to counts, e.g.:
            {"idea": 5, "selected": 3, "purchased": 2, "received": 1}

        Example:
            ```python
            counts = await repo.get_status_counts_for_list(list_id=123)
            print(f"Ideas: {counts['idea']}")
            print(f"Purchased: {counts['purchased']}")

            # Use for dashboard progress bar
            total = sum(counts.values())
            progress_pct = (counts['received'] / total) * 100
            ```

        Note:
            All status enum values are included in the result, even if count is 0.
            This ensures consistent response shape for frontend consumers.
        """
        # Build query to count items by status
        stmt = (
            select(ListItem.status, func.count(ListItem.id).label("count"))
            .where(ListItem.list_id == list_id)
            .group_by(ListItem.status)
        )

        result = await self.session.execute(stmt)
        rows = result.all()

        # Initialize all statuses with 0
        counts: dict[str, int] = {status.value: 0 for status in ListItemStatus}

        # Update with actual counts from query
        for status, count in rows:
            counts[status.value] = count

        return counts

    async def get_by_list_and_status(
        self, list_id: int, status: ListItemStatus
    ) -> list[ListItem]:
        """
        Get items in a specific list filtered by status.

        Optimized query using composite index on (list_id, status).

        Args:
            list_id: Foreign key of the list
            status: ListItemStatus enum value

        Returns:
            List of ListItem instances matching both filters

        Example:
            ```python
            purchased = await repo.get_by_list_and_status(
                list_id=123,
                status=ListItemStatus.purchased
            )
            print(f"Purchased items in list: {len(purchased)}")
            ```
        """
        stmt = (
            select(ListItem)
            .where(ListItem.list_id == list_id, ListItem.status == status)
            .order_by(ListItem.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_with_all_relations(self, list_item_id: int) -> ListItem | None:
        """
        Get a list item with all relationships eagerly loaded.

        Loads gift, list, and assignee relationships in a single query
        for complete list item details.

        Args:
            list_item_id: Primary key of the list item

        Returns:
            ListItem instance with all relationships loaded, or None if not found

        Example:
            ```python
            item = await repo.get_with_all_relations(list_item_id=789)
            if item:
                print(f"Gift: {item.gift.name}")
                print(f"List: {item.list.name}")
                if item.assignee:
                    print(f"Assigned to: {item.assignee.name}")
            ```
        """
        stmt = (
            select(ListItem)
            .where(ListItem.id == list_item_id)
            .options(
                selectinload(ListItem.gift),
                selectinload(ListItem.list),
                selectinload(ListItem.assignee),
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update_status(
        self, list_item_id: int, status: ListItemStatus
    ) -> ListItem | None:
        """
        Update the status of a list item.

        Convenience method for the common operation of updating item status
        as it moves through the lifecycle (idea → selected → purchased → received).

        Args:
            list_item_id: Primary key of the list item
            status: New ListItemStatus enum value

        Returns:
            Updated ListItem instance if found, None if not found

        Example:
            ```python
            item = await repo.update_status(
                list_item_id=789,
                status=ListItemStatus.purchased
            )
            if item:
                print(f"Status updated to {item.status}")
            ```
        """
        return await self.update(list_item_id, {"status": status})
