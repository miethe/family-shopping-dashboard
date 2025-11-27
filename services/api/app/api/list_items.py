"""List item API routes for status transitions and item assignments."""

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.core.exceptions import NotFoundError, ValidationError
from app.models.list_item import ListItemStatus
from app.schemas.list_item import ListItemResponse
from app.services.list_item import ListItemService

router = APIRouter(prefix="/list-items", tags=["list_items"])


class StatusUpdate(BaseModel):
    """Request schema for updating list item status."""

    status: str = Field(
        ...,
        description="New status for the item (idea, selected, purchased, received)",
        pattern="^(idea|selected|purchased|received)$",
    )


class AssignmentUpdate(BaseModel):
    """Request schema for assigning list item to user."""

    assigned_to_id: int | None = Field(
        None,
        description="User ID to assign item to, or None to unassign",
    )


@router.put(
    "/{item_id}/status",
    response_model=ListItemResponse,
    status_code=status.HTTP_200_OK,
    summary="Update list item status",
    description="Transition item through status lifecycle with validation (idea → selected → purchased → received)",
)
async def update_item_status(
    item_id: int,
    data: StatusUpdate,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ListItemResponse:
    """
    Update the status of a list item with state machine validation.

    Validates status transitions according to state machine rules:
    - IDEA → SELECTED
    - SELECTED → PURCHASED or IDEA (reset)
    - PURCHASED → RECEIVED or IDEA (reset)
    - RECEIVED → IDEA (reset)

    Args:
        item_id: Primary key of the list item
        data: StatusUpdate DTO with new status
        current_user_id: Authenticated user ID (from JWT, injected)
        db: Database session (injected)

    Returns:
        ListItemResponse with updated item details

    Raises:
        NotFoundError: 404 if list item not found
        ValidationError: 400 if status transition is invalid

    Example:
        ```json
        PUT /list-items/42/status
        Headers: Authorization: Bearer eyJhbGc...
        {
            "status": "selected"
        }

        Response 200:
        {
            "id": 42,
            "gift_id": 1,
            "list_id": 2,
            "status": "selected",
            "assigned_to": null,
            "notes": null,
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:01:00Z"
        }
        ```

    Note:
        - Requires valid Bearer token in Authorization header
        - Invalid status transitions will raise ValidationError with details
        - Uses state machine to prevent invalid transitions
    """
    service = ListItemService(db)

    # Get current item to verify existence
    item = await service.get(item_id)
    if item is None:
        raise NotFoundError(
            code="LIST_ITEM_NOT_FOUND",
            message=f"List item with ID {item_id} not found",
        )

    # Convert string status to enum
    try:
        status_enum = ListItemStatus(data.status)
    except ValueError:
        raise ValidationError(
            code="INVALID_STATUS",
            message=f"Invalid status: {data.status}. Must be one of: idea, selected, purchased, received",
        )

    # Update status (service validates transition)
    try:
        updated = await service.update_status(item_id, status_enum, user_id=current_user_id)
        if updated is None:
            # Should not happen since we checked existence, but handle gracefully
            raise NotFoundError(
                code="LIST_ITEM_NOT_FOUND",
                message=f"List item with ID {item_id} not found",
            )
        return updated

    except ValueError as e:
        # Service raises ValueError for invalid transitions
        raise ValidationError(
            code="INVALID_STATUS_TRANSITION",
            message=str(e),
        ) from e


@router.put(
    "/{item_id}/assign",
    response_model=ListItemResponse,
    status_code=status.HTTP_200_OK,
    summary="Assign list item to user",
    description="Assign or unassign a list item to a family member who will purchase it",
)
async def update_item_assignment(
    item_id: int,
    data: AssignmentUpdate,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ListItemResponse:
    """
    Assign a list item to a user for purchase responsibility.

    Updates the assigned_to field to track who will purchase the gift.
    Pass assigned_to_id=None to unassign the item.

    Args:
        item_id: Primary key of the list item
        data: AssignmentUpdate DTO with user_id
        current_user_id: Authenticated user ID (from JWT, injected)
        db: Database session (injected)

    Returns:
        ListItemResponse with updated assignment

    Raises:
        NotFoundError: 404 if list item not found

    Example:
        ```json
        PUT /list-items/42/assign
        Headers: Authorization: Bearer eyJhbGc...
        {
            "assigned_to_id": 3
        }

        Response 200:
        {
            "id": 42,
            "gift_id": 1,
            "list_id": 2,
            "status": "idea",
            "assigned_to": 3,
            "notes": null,
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:02:00Z"
        }
        ```

    To unassign:
        ```json
        PUT /list-items/42/assign
        Headers: Authorization: Bearer eyJhbGc...
        {
            "assigned_to_id": null
        }
        ```

    Note:
        - Requires valid Bearer token in Authorization header
        - User ID validation is performed by database foreign key constraint
        - Passing null unassigns the item
    """
    service = ListItemService(db)

    # Get current item to verify existence
    item = await service.get(item_id)
    if item is None:
        raise NotFoundError(
            code="LIST_ITEM_NOT_FOUND",
            message=f"List item with ID {item_id} not found",
        )

    # Assign user (None is valid for unassign)
    updated = await service.assign(item_id, data.assigned_to_id, user_id=current_user_id)
    if updated is None:
        # Should not happen since we checked existence, but handle gracefully
        raise NotFoundError(
            code="LIST_ITEM_NOT_FOUND",
            message=f"List item with ID {item_id} not found",
        )

    return updated
