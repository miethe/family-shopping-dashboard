"""ListItem service for gift list item management."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.list_item import ListItemStatus
from app.repositories.list_item import ListItemRepository
from app.schemas.list_item import ListItemCreate, ListItemResponse, ListItemUpdate


# Valid status transitions
VALID_TRANSITIONS: dict[ListItemStatus, set[ListItemStatus]] = {
    ListItemStatus.idea: {ListItemStatus.selected},
    ListItemStatus.selected: {ListItemStatus.purchased, ListItemStatus.idea},
    ListItemStatus.purchased: {ListItemStatus.received, ListItemStatus.idea},
    ListItemStatus.received: {ListItemStatus.idea},
}


class ListItemService:
    """
    ListItem service with status state machine validation.

    Manages gift items in lists with lifecycle status tracking (idea → selected → purchased → received).
    Enforces valid status transitions using state machine rules.

    Example:
        ```python
        async with async_session() as session:
            service = ListItemService(session)
            item = await service.create(ListItemCreate(
                gift_id=1,
                list_id=2,
                status=ListItemStatus.idea
            ))
        ```
    """

    def __init__(self, session: AsyncSession) -> None:
        """
        Initialize list item service with database session.

        Args:
            session: SQLAlchemy async session for database operations
        """
        self.session = session
        self.repo = ListItemRepository(session)

    async def create(self, data: ListItemCreate) -> ListItemResponse:
        """
        Add a gift to a list.

        Creates a new list item with initial status (defaults to 'idea').
        Validates that the gift can be added to the list (no duplicate constraint violations).

        Args:
            data: ListItemCreate DTO with gift_id, list_id, status, assigned_to, notes

        Returns:
            ListItemResponse DTO with created item details

        Raises:
            ValueError: If gift already exists in the list (unique constraint violation)

        Example:
            ```python
            item = await service.create(ListItemCreate(
                gift_id=1,
                list_id=2,
                status=ListItemStatus.idea,
                assigned_to=None,
                notes="Need to check size"
            ))
            print(f"Added item: {item.id}")
            ```

        Note:
            Default status is 'idea' if not specified.
            Gift can only appear once per list (enforced by database).
        """
        # Convert DTO to dict for repository
        create_data = data.model_dump()

        # Create in database
        list_item = await self.repo.create(create_data)

        # Convert ORM model to DTO
        return ListItemResponse(
            id=list_item.id,
            gift_id=list_item.gift_id,
            list_id=list_item.list_id,
            status=list_item.status,
            assigned_to=list_item.assigned_to,
            notes=list_item.notes,
            created_at=list_item.created_at,
            updated_at=list_item.updated_at,
        )

    async def get(self, item_id: int) -> ListItemResponse | None:
        """
        Get a list item by ID.

        Args:
            item_id: Primary key of the list item

        Returns:
            ListItemResponse DTO if found, None otherwise

        Example:
            ```python
            item = await service.get(item_id=42)
            if item:
                print(f"Item status: {item.status}")
            else:
                print("Item not found")
            ```
        """
        list_item = await self.repo.get(item_id)
        if list_item is None:
            return None

        return ListItemResponse(
            id=list_item.id,
            gift_id=list_item.gift_id,
            list_id=list_item.list_id,
            status=list_item.status,
            assigned_to=list_item.assigned_to,
            notes=list_item.notes,
            created_at=list_item.created_at,
            updated_at=list_item.updated_at,
        )

    async def get_for_list(self, list_id: int) -> list[ListItemResponse]:
        """
        Get all items in a specific list.

        Returns items ordered by creation date (newest first).

        Args:
            list_id: Foreign key of the list

        Returns:
            List of ListItemResponse DTOs (may be empty)

        Example:
            ```python
            items = await service.get_for_list(list_id=123)
            print(f"Found {len(items)} items in list")
            for item in items:
                print(f"- Gift {item.gift_id}: {item.status}")
            ```
        """
        list_items = await self.repo.get_by_list(list_id)

        # Convert ORM models to DTOs
        return [
            ListItemResponse(
                id=item.id,
                gift_id=item.gift_id,
                list_id=item.list_id,
                status=item.status,
                assigned_to=item.assigned_to,
                notes=item.notes,
                created_at=item.created_at,
                updated_at=item.updated_at,
            )
            for item in list_items
        ]

    async def update_status(
        self, item_id: int, status: ListItemStatus
    ) -> ListItemResponse | None:
        """
        Update the status of a list item with state machine validation.

        Validates status transitions according to state machine rules:
        - IDEA → SELECTED
        - SELECTED → PURCHASED or IDEA (reset)
        - PURCHASED → RECEIVED or IDEA (reset)
        - RECEIVED → IDEA (reset)

        Args:
            item_id: Primary key of the list item
            status: New ListItemStatus enum value

        Returns:
            Updated ListItemResponse DTO if found, None if item not found

        Raises:
            ValueError: If status transition is invalid

        Example:
            ```python
            # Valid transitions
            item = await service.update_status(item_id=1, status=ListItemStatus.selected)

            # Invalid transition (will raise ValueError)
            try:
                await service.update_status(item_id=1, status=ListItemStatus.received)
            except ValueError as e:
                print(f"Invalid transition: {e}")
            ```

        Note:
            Any status can transition back to IDEA (reset).
        """
        # Get current item to check current status
        current_item = await self.repo.get(item_id)
        if current_item is None:
            return None

        # Validate status transition
        current_status = current_item.status
        if current_status != status:  # Only validate if status is actually changing
            valid_next_statuses = VALID_TRANSITIONS.get(current_status, set())
            if status not in valid_next_statuses:
                raise ValueError(
                    f"Invalid status transition: {current_status.value} → {status.value}. "
                    f"Valid transitions from {current_status.value}: "
                    f"{', '.join(s.value for s in valid_next_statuses)}"
                )

        # Update status in database
        updated_item = await self.repo.update_status(item_id, status)
        if updated_item is None:
            return None

        # Convert ORM model to DTO
        return ListItemResponse(
            id=updated_item.id,
            gift_id=updated_item.gift_id,
            list_id=updated_item.list_id,
            status=updated_item.status,
            assigned_to=updated_item.assigned_to,
            notes=updated_item.notes,
            created_at=updated_item.created_at,
            updated_at=updated_item.updated_at,
        )

    async def assign(self, item_id: int, user_id: int) -> ListItemResponse | None:
        """
        Assign a list item to a user who will purchase it.

        Updates the assigned_to field to track who is responsible for purchasing.

        Args:
            item_id: Primary key of the list item
            user_id: Foreign key of the user to assign

        Returns:
            Updated ListItemResponse DTO if found, None if item not found

        Example:
            ```python
            item = await service.assign(item_id=42, user_id=123)
            if item:
                print(f"Item assigned to user {item.assigned_to}")
            ```

        Note:
            Does not validate user existence (relies on foreign key constraint).
            Use user_id=None to unassign (handled by update method).
        """
        updated_item = await self.repo.update(item_id, {"assigned_to": user_id})
        if updated_item is None:
            return None

        return ListItemResponse(
            id=updated_item.id,
            gift_id=updated_item.gift_id,
            list_id=updated_item.list_id,
            status=updated_item.status,
            assigned_to=updated_item.assigned_to,
            notes=updated_item.notes,
            created_at=updated_item.created_at,
            updated_at=updated_item.updated_at,
        )

    async def update(
        self, item_id: int, data: ListItemUpdate
    ) -> ListItemResponse | None:
        """
        Update list item fields (status, assigned_to, notes).

        General update method for partial updates. Only updates provided fields.
        For status updates with validation, prefer update_status method.

        Args:
            item_id: Primary key of the list item
            data: ListItemUpdate DTO with optional fields to update

        Returns:
            Updated ListItemResponse DTO if found, None if item not found

        Raises:
            ValueError: If status transition is invalid (when status is provided)

        Example:
            ```python
            # Update notes only
            item = await service.update(
                item_id=42,
                data=ListItemUpdate(notes="Found a better price online")
            )

            # Update multiple fields
            item = await service.update(
                item_id=42,
                data=ListItemUpdate(
                    status=ListItemStatus.purchased,
                    notes="Bought on sale!"
                )
            )
            ```

        Note:
            - Only updates fields that are not None in the DTO
            - If status is provided, validates transition using state machine
            - Returns None if item not found
        """
        # Check item exists
        existing_item = await self.repo.get(item_id)
        if existing_item is None:
            return None

        # Build update dict (only non-None fields)
        update_data = {}

        if data.status is not None:
            # Validate status transition using state machine
            current_status = existing_item.status
            if current_status != data.status:
                valid_next_statuses = VALID_TRANSITIONS.get(current_status, set())
                if data.status not in valid_next_statuses:
                    raise ValueError(
                        f"Invalid status transition: {current_status.value} → {data.status.value}. "
                        f"Valid transitions from {current_status.value}: "
                        f"{', '.join(s.value for s in valid_next_statuses)}"
                    )
            update_data["status"] = data.status

        if data.assigned_to is not None:
            update_data["assigned_to"] = data.assigned_to

        if data.notes is not None:
            update_data["notes"] = data.notes

        # Update item if there are changes
        if update_data:
            updated_item = await self.repo.update(item_id, update_data)
            if updated_item is None:
                # Should not happen since we checked existence, but handle gracefully
                return None
            item = updated_item
        else:
            item = existing_item

        # Convert ORM model to DTO
        return ListItemResponse(
            id=item.id,
            gift_id=item.gift_id,
            list_id=item.list_id,
            status=item.status,
            assigned_to=item.assigned_to,
            notes=item.notes,
            created_at=item.created_at,
            updated_at=item.updated_at,
        )

    async def delete(self, item_id: int) -> bool:
        """
        Remove an item from a list.

        Permanently deletes the list item. This does not delete the gift itself,
        only removes it from the specific list.

        Args:
            item_id: Primary key of the list item to delete

        Returns:
            True if item was deleted, False if item not found

        Example:
            ```python
            success = await service.delete(item_id=42)
            if success:
                print("Item removed from list")
            else:
                print("Item not found")
            ```

        Note:
            Cascading delete behavior depends on database foreign key constraints.
            This operation is permanent and cannot be undone.
        """
        return await self.repo.delete(item_id)
