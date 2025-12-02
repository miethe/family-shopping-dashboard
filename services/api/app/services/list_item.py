"""ListItem service for gift list item management."""

from datetime import datetime, timezone

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.list_item import ListItemStatus
from app.repositories.list_item import ListItemRepository
from app.schemas.gift import GiftSummary
from app.schemas.list_item import (
    ListItemCreate,
    ListItemResponse,
    ListItemUpdate,
    ListItemWithGift,
)
from app.schemas.ws import WSEvent
from app.services.ws_manager import manager


# Valid status transitions - allows flexible Kanban drag-and-drop
VALID_TRANSITIONS: dict[ListItemStatus, set[ListItemStatus]] = {
    ListItemStatus.idea: {ListItemStatus.selected, ListItemStatus.purchased, ListItemStatus.received},
    ListItemStatus.selected: {ListItemStatus.idea, ListItemStatus.purchased, ListItemStatus.received},
    ListItemStatus.purchased: {ListItemStatus.idea, ListItemStatus.selected, ListItemStatus.received},
    ListItemStatus.received: {ListItemStatus.idea, ListItemStatus.selected, ListItemStatus.purchased},
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

    async def _broadcast_event(
        self,
        list_id: int,
        event_type: str,
        entity_id: int,
        payload: dict,
        user_id: int,
    ) -> None:
        """
        Broadcast WebSocket event for list item changes.

        Sends real-time notification to all clients subscribed to the list topic.

        Args:
            list_id: ID of the list that changed
            event_type: Type of event (ADDED, UPDATED, DELETED, STATUS_CHANGED, ASSIGNED)
            entity_id: ID of the list item that changed
            payload: Serialized entity data (from model_dump())
            user_id: ID of the user who triggered the change

        Example:
            ```python
            await self._broadcast_event(
                list_id=123,
                event_type="ADDED",
                entity_id=456,
                payload=response.model_dump(),
                user_id=789
            )
            ```
        """
        event = WSEvent(
            topic=f"list:{list_id}",
            event=event_type,
            data={
                "entity_id": str(entity_id),
                "payload": payload,
                "user_id": str(user_id),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )
        await manager.broadcast_event(event)

    async def create(
        self, data: ListItemCreate, user_id: int
    ) -> ListItemResponse:
        """
        Add a gift to a list.

        Creates a new list item with initial status (defaults to 'idea').
        Validates that the gift can be added to the list (no duplicate constraint violations).
        Broadcasts ADDED event to subscribed WebSocket clients.

        Args:
            data: ListItemCreate DTO with gift_id, list_id, status, assigned_to, notes
            user_id: ID of the user creating the item (for event tracking)

        Returns:
            ListItemResponse DTO with created item details

        Raises:
            ValueError: If gift already exists in the list (unique constraint violation)

        Example:
            ```python
            item = await service.create(
                ListItemCreate(
                    gift_id=1,
                    list_id=2,
                    status=ListItemStatus.idea,
                    assigned_to=None,
                    notes="Need to check size"
                ),
                user_id=123
            )
            print(f"Added item: {item.id}")
            ```

        Note:
            Default status is 'idea' if not specified.
            Gift can only appear once per list (enforced by database).
            Broadcasts ADDED event after successful creation.
        """
        # Convert DTO to dict for repository
        create_data = data.model_dump()

        # Create in database
        try:
            list_item = await self.repo.create(create_data)
        except IntegrityError as e:
            await self.session.rollback()
            # Check if it's the duplicate constraint
            if "uq_list_items_gift_list" in str(e):
                raise ValueError("This gift is already in the list") from e
            raise  # Re-raise if it's a different constraint

        # Convert ORM model to DTO
        response = ListItemResponse(
            id=list_item.id,
            gift_id=list_item.gift_id,
            list_id=list_item.list_id,
            status=list_item.status,
            assigned_to=list_item.assigned_to,
            notes=list_item.notes,
            created_at=list_item.created_at,
            updated_at=list_item.updated_at,
        )

        # Broadcast event to subscribed clients
        await self._broadcast_event(
            list_id=list_item.list_id,
            event_type="ADDED",
            entity_id=list_item.id,
            payload=response.model_dump(),
            user_id=user_id,
        )

        return response

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

    async def get_for_list(self, list_id: int) -> list[ListItemWithGift]:
        """
        Get all items in a specific list with gift details.

        Returns items ordered by creation date (newest first).
        Includes full gift information for each list item.

        Args:
            list_id: Foreign key of the list

        Returns:
            List of ListItemWithGift DTOs (may be empty)

        Example:
            ```python
            items = await service.get_for_list(list_id=123)
            print(f"Found {len(items)} items in list")
            for item in items:
                print(f"- {item.gift.name}: {item.status}")
            ```
        """
        list_items = await self.repo.get_by_list(list_id)

        # Convert ORM models to DTOs with gift details
        return [
            ListItemWithGift(
                id=item.id,
                gift_id=item.gift_id,
                list_id=item.list_id,
                status=item.status,
                assigned_to=item.assigned_to,
                notes=item.notes,
                created_at=item.created_at,
                updated_at=item.updated_at,
                gift=GiftSummary(
                    id=item.gift.id,
                    name=item.gift.name,
                    price=item.gift.price,
                    image_url=item.gift.image_url,
                ),
            )
            for item in list_items
        ]

    async def update_status(
        self, item_id: int, status: ListItemStatus, user_id: int
    ) -> ListItemResponse | None:
        """
        Update the status of a list item with state machine validation.

        Validates status transitions according to state machine rules.
        Any status can transition to any other status, enabling flexible
        Kanban drag-and-drop functionality.

        Broadcasts STATUS_CHANGED event to subscribed WebSocket clients.

        Args:
            item_id: Primary key of the list item
            status: New ListItemStatus enum value
            user_id: ID of the user changing the status (for event tracking)

        Returns:
            Updated ListItemResponse DTO if found, None if item not found

        Raises:
            ValueError: If status transition is invalid

        Example:
            ```python
            # Valid transitions
            item = await service.update_status(
                item_id=1,
                status=ListItemStatus.selected,
                user_id=123
            )

            # Invalid transition (will raise ValueError)
            try:
                await service.update_status(
                    item_id=1,
                    status=ListItemStatus.received,
                    user_id=123
                )
            except ValueError as e:
                print(f"Invalid transition: {e}")
            ```

        Note:
            All status transitions are allowed for flexible Kanban workflow.
            Broadcasts STATUS_CHANGED event after successful update.
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
        response = ListItemResponse(
            id=updated_item.id,
            gift_id=updated_item.gift_id,
            list_id=updated_item.list_id,
            status=updated_item.status,
            assigned_to=updated_item.assigned_to,
            notes=updated_item.notes,
            created_at=updated_item.created_at,
            updated_at=updated_item.updated_at,
        )

        # Broadcast event to subscribed clients
        await self._broadcast_event(
            list_id=updated_item.list_id,
            event_type="STATUS_CHANGED",
            entity_id=item_id,
            payload=response.model_dump(),
            user_id=user_id,
        )

        return response

    async def assign(
        self, item_id: int, assigned_to: int, user_id: int
    ) -> ListItemResponse | None:
        """
        Assign a list item to a user who will purchase it.

        Updates the assigned_to field to track who is responsible for purchasing.
        Broadcasts ASSIGNED event to subscribed WebSocket clients.

        Args:
            item_id: Primary key of the list item
            assigned_to: User ID to assign the item to
            user_id: ID of the user performing the assignment (for event tracking)

        Returns:
            Updated ListItemResponse DTO if found, None if item not found

        Example:
            ```python
            item = await service.assign(
                item_id=42,
                assigned_to=123,
                user_id=456
            )
            if item:
                print(f"Item assigned to user {item.assigned_to}")
            ```

        Note:
            Does not validate user existence (relies on foreign key constraint).
            Broadcasts ASSIGNED event after successful assignment.
        """
        updated_item = await self.repo.update(item_id, {"assigned_to": assigned_to})
        if updated_item is None:
            return None

        response = ListItemResponse(
            id=updated_item.id,
            gift_id=updated_item.gift_id,
            list_id=updated_item.list_id,
            status=updated_item.status,
            assigned_to=updated_item.assigned_to,
            notes=updated_item.notes,
            created_at=updated_item.created_at,
            updated_at=updated_item.updated_at,
        )

        # Broadcast event to subscribed clients
        await self._broadcast_event(
            list_id=updated_item.list_id,
            event_type="ASSIGNED",
            entity_id=item_id,
            payload=response.model_dump(),
            user_id=user_id,
        )

        return response

    async def update(
        self, item_id: int, data: ListItemUpdate, user_id: int
    ) -> ListItemResponse | None:
        """
        Update list item fields (status, assigned_to, notes).

        General update method for partial updates. Only updates provided fields.
        For status updates with validation, prefer update_status method.
        Broadcasts UPDATED or STATUS_CHANGED event depending on what changed.

        Args:
            item_id: Primary key of the list item
            data: ListItemUpdate DTO with optional fields to update
            user_id: ID of the user performing the update (for event tracking)

        Returns:
            Updated ListItemResponse DTO if found, None if item not found

        Raises:
            ValueError: If status transition is invalid (when status is provided)

        Example:
            ```python
            # Update notes only
            item = await service.update(
                item_id=42,
                data=ListItemUpdate(notes="Found a better price online"),
                user_id=123
            )

            # Update multiple fields
            item = await service.update(
                item_id=42,
                data=ListItemUpdate(
                    status=ListItemStatus.purchased,
                    notes="Bought on sale!"
                ),
                user_id=123
            )
            ```

        Note:
            - Only updates fields that are not None in the DTO
            - If status is provided, validates transition using state machine (all transitions allowed)
            - Returns None if item not found
            - Broadcasts UPDATED event after successful update (or STATUS_CHANGED if status changed)
        """
        # Check item exists
        existing_item = await self.repo.get(item_id)
        if existing_item is None:
            return None

        # Build update dict (only non-None fields)
        update_data = {}
        status_changed = False

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
                status_changed = True
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
        response = ListItemResponse(
            id=item.id,
            gift_id=item.gift_id,
            list_id=item.list_id,
            status=item.status,
            assigned_to=item.assigned_to,
            notes=item.notes,
            created_at=item.created_at,
            updated_at=item.updated_at,
        )

        # Broadcast event to subscribed clients if changes were made
        if update_data:
            event_type = "STATUS_CHANGED" if status_changed else "UPDATED"
            await self._broadcast_event(
                list_id=item.list_id,
                event_type=event_type,
                entity_id=item_id,
                payload=response.model_dump(),
                user_id=user_id,
            )

        return response

    async def delete(self, item_id: int, user_id: int) -> bool:
        """
        Remove an item from a list.

        Permanently deletes the list item. This does not delete the gift itself,
        only removes it from the specific list.
        Broadcasts DELETED event to subscribed WebSocket clients.

        Args:
            item_id: Primary key of the list item to delete
            user_id: ID of the user deleting the item (for event tracking)

        Returns:
            True if item was deleted, False if item not found

        Example:
            ```python
            success = await service.delete(item_id=42, user_id=123)
            if success:
                print("Item removed from list")
            else:
                print("Item not found")
            ```

        Note:
            Cascading delete behavior depends on database foreign key constraints.
            This operation is permanent and cannot be undone.
            Broadcasts DELETED event before deletion (uses current item data).
        """
        # Get item before deletion to access list_id for broadcast
        item_to_delete = await self.repo.get(item_id)
        if item_to_delete is None:
            return False

        # Delete from database
        success = await self.repo.delete(item_id)

        # Broadcast event after successful deletion
        if success:
            response = ListItemResponse(
                id=item_to_delete.id,
                gift_id=item_to_delete.gift_id,
                list_id=item_to_delete.list_id,
                status=item_to_delete.status,
                assigned_to=item_to_delete.assigned_to,
                notes=item_to_delete.notes,
                created_at=item_to_delete.created_at,
                updated_at=item_to_delete.updated_at,
            )
            await self._broadcast_event(
                list_id=item_to_delete.list_id,
                event_type="DELETED",
                entity_id=item_id,
                payload=response.model_dump(),
                user_id=user_id,
            )

        return success
