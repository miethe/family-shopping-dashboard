"""List management API routes for gift lists."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.core.exceptions import NotFoundError, ValidationError
from app.schemas.base import PaginatedResponse
from app.schemas.list import ListCreate, ListResponse, ListUpdate
from app.schemas.list_item import ListItemCreate, ListItemResponse
from app.services.list import ListService
from app.services.list_item import ListItemService

router = APIRouter(prefix="/lists", tags=["lists"])


@router.get(
    "",
    response_model=PaginatedResponse[ListResponse],
    status_code=status.HTTP_200_OK,
    summary="List gift lists with optional filtering",
    description="Get paginated list of gift lists with optional filters by person, occasion, or visibility",
)
async def list_lists(
    person_id: int | None = Query(
        None,
        description="Filter by person ID",
    ),
    occasion_id: int | None = Query(
        None,
        description="Filter by occasion ID",
    ),
    visibility: str | None = Query(
        None,
        description="Filter by visibility (public, private, secret)",
    ),
    cursor: int | None = Query(
        None,
        description="Pagination cursor (ID of last item from previous page)",
    ),
    limit: int = Query(
        50,
        ge=1,
        le=100,
        description="Maximum number of items to return",
    ),
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[ListResponse]:
    """
    Get paginated list of gift lists with optional filtering.

    Supports cursor-based pagination and filtering by person, occasion, or visibility.
    All lists are returned regardless of ownership (no authorization checks).

    Args:
        person_id: Optional filter by person ID
        occasion_id: Optional filter by occasion ID
        visibility: Optional filter by visibility level (public, private, secret)
        cursor: Pagination cursor (ID of last item from previous page)
        limit: Number of items to return (1-100, default 50)
        current_user_id: Current authenticated user ID (injected)
        db: Database session (injected)

    Returns:
        PaginatedResponse with list of ListResponse DTOs

    Example:
        ```json
        GET /lists?person_id=5&limit=20

        Response 200:
        {
            "items": [
                {
                    "id": 1,
                    "name": "Christmas Wishlist",
                    "type": "wishlist",
                    "visibility": "family",
                    "user_id": 1,
                    "person_id": 5,
                    "occasion_id": 10,
                    "created_at": "2025-11-26T12:00:00Z",
                    "updated_at": "2025-11-26T12:00:00Z"
                }
            ],
            "has_more": false,
            "next_cursor": null
        }
        ```

    Note:
        - Requires authentication via Bearer token
        - Filters are applied in combination (AND logic)
        - Uses cursor-based pagination for better performance
    """
    service = ListService(db)

    # Build filters dict with only non-None values
    filters = {}
    if person_id is not None:
        filters["person_id"] = person_id
    if occasion_id is not None:
        filters["occasion_id"] = occasion_id
    if visibility is not None:
        filters["visibility"] = visibility

    # Get lists with filters applied
    lists, has_more, next_cursor = await service.list(
        cursor=cursor,
        limit=limit,
        filters=filters,
    )

    return PaginatedResponse(items=lists, has_more=has_more, next_cursor=next_cursor)


@router.post(
    "",
    response_model=ListResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new gift list",
    description="Create a new gift list owned by current user",
)
async def create_list(
    data: ListCreate,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ListResponse:
    """
    Create a new gift list.

    Creates a gift list owned by the authenticated user with specified name,
    type, visibility, and optional person/occasion context.

    Args:
        data: List creation data (name, type, visibility, person_id, occasion_id)
        current_user_id: Current authenticated user ID (injected)
        db: Database session (injected)

    Returns:
        ListResponse with created list details

    Raises:
        HTTPException: 400 if validation fails

    Example:
        ```json
        POST /lists
        {
            "name": "Christmas Wishlist",
            "type": "wishlist",
            "visibility": "family",
            "person_id": 5,
            "occasion_id": 10
        }

        Response 201:
        {
            "id": 1,
            "name": "Christmas Wishlist",
            "type": "wishlist",
            "visibility": "family",
            "user_id": 1,
            "person_id": 5,
            "occasion_id": 10,
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:00:00Z"
        }
        ```

    Note:
        - user_id is automatically set to current authenticated user
        - person_id and occasion_id are optional
        - name must be 1-255 characters
    """
    service = ListService(db)

    try:
        list_obj = await service.create(current_user_id, data)
        return list_obj

    except ValueError as e:
        raise ValidationError(
            code="LIST_CREATE_ERROR",
            message=str(e),
        ) from e


@router.get(
    "/{list_id}",
    response_model=ListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get gift list by ID",
    description="Retrieve a single gift list by ID",
)
async def get_list(
    list_id: int,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ListResponse:
    """
    Get a single gift list by ID.

    Args:
        list_id: ID of the list to retrieve
        current_user_id: Current authenticated user ID (injected)
        db: Database session (injected)

    Returns:
        ListResponse with list details

    Raises:
        HTTPException: 404 if list not found

    Example:
        ```json
        GET /lists/1

        Response 200:
        {
            "id": 1,
            "name": "Christmas Wishlist",
            "type": "wishlist",
            "visibility": "family",
            "user_id": 1,
            "person_id": 5,
            "occasion_id": 10,
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:00:00Z"
        }
        ```

    Note:
        Requires authentication via Bearer token.
        No authorization checks (any user can view any list).
    """
    service = ListService(db)
    list_obj = await service.get(list_id)

    if list_obj is None:
        raise NotFoundError(
            code="LIST_NOT_FOUND",
            message=f"List with ID {list_id} not found",
        )

    return list_obj


@router.put(
    "/{list_id}",
    response_model=ListResponse,
    status_code=status.HTTP_200_OK,
    summary="Update gift list",
    description="Update a gift list's properties",
)
async def update_list(
    list_id: int,
    data: ListUpdate,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ListResponse:
    """
    Update a gift list.

    Updates list properties (all fields optional for partial updates).

    Args:
        list_id: ID of the list to update
        data: Update data (name, type, visibility, person_id, occasion_id)
        current_user_id: Current authenticated user ID (injected)
        db: Database session (injected)

    Returns:
        Updated ListResponse

    Raises:
        HTTPException: 404 if list not found
        HTTPException: 400 if validation fails

    Example:
        ```json
        PUT /lists/1
        {
            "name": "Updated Christmas Wishlist",
            "visibility": "public"
        }

        Response 200:
        {
            "id": 1,
            "name": "Updated Christmas Wishlist",
            "type": "wishlist",
            "visibility": "public",
            "user_id": 1,
            "person_id": 5,
            "occasion_id": 10,
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:35:00Z"
        }
        ```

    Note:
        - All fields are optional (partial update)
        - Only provided fields are updated
        - Returns updated list
    """
    service = ListService(db)

    try:
        updated_list = await service.update(list_id, data)

        if updated_list is None:
            raise NotFoundError(
                code="LIST_NOT_FOUND",
                message=f"List with ID {list_id} not found",
            )

        return updated_list

    except ValueError as e:
        raise ValidationError(
            code="LIST_UPDATE_ERROR",
            message=str(e),
        ) from e


@router.delete(
    "/{list_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete gift list",
    description="Delete a gift list and all its items",
)
async def delete_list(
    list_id: int,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Delete a gift list.

    Permanently deletes the list and all associated list items.

    Args:
        list_id: ID of the list to delete
        current_user_id: Current authenticated user ID (injected)
        db: Database session (injected)

    Raises:
        HTTPException: 404 if list not found

    Example:
        ```json
        DELETE /lists/1

        Response 204 No Content
        ```

    Note:
        - Cascades delete to all list items
        - Operation is permanent and cannot be undone
        - No authorization checks
    """
    service = ListService(db)
    deleted = await service.delete(list_id)

    if not deleted:
        raise NotFoundError(
            code="LIST_NOT_FOUND",
            message=f"List with ID {list_id} not found",
        )


@router.get(
    "/{list_id}/items",
    response_model=list[ListItemResponse],
    status_code=status.HTTP_200_OK,
    summary="Get items in a gift list",
    description="Get all items (gifts) in a specific list",
)
async def get_list_items(
    list_id: int,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ListItemResponse]:
    """
    Get all items in a gift list.

    Retrieves all gifts added to a specific list with their status and metadata.

    Args:
        list_id: ID of the list to get items from
        current_user_id: Current authenticated user ID (injected)
        db: Database session (injected)

    Returns:
        List of ListItemResponse DTOs (may be empty)

    Raises:
        HTTPException: 404 if list not found

    Example:
        ```json
        GET /lists/1/items

        Response 200:
        [
            {
                "id": 1,
                "gift_id": 10,
                "list_id": 1,
                "status": "idea",
                "assigned_to": null,
                "notes": "Check size",
                "created_at": "2025-11-26T12:00:00Z",
                "updated_at": "2025-11-26T12:00:00Z"
            },
            {
                "id": 2,
                "gift_id": 11,
                "list_id": 1,
                "status": "selected",
                "assigned_to": 2,
                "notes": null,
                "created_at": "2025-11-26T12:01:00Z",
                "updated_at": "2025-11-26T12:15:00Z"
            }
        ]
        ```

    Note:
        - Requires authentication via Bearer token
        - Returns items ordered by creation date (newest first)
        - No authorization checks
    """
    list_service = ListService(db)

    # Verify list exists
    list_obj = await list_service.get(list_id)
    if list_obj is None:
        raise NotFoundError(
            code="LIST_NOT_FOUND",
            message=f"List with ID {list_id} not found",
        )

    # Get list items
    item_service = ListItemService(db)
    items = await item_service.get_for_list(list_id)

    return items


@router.post(
    "/{list_id}/items",
    response_model=ListItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add item to gift list",
    description="Add a gift to a list",
)
async def add_item_to_list(
    list_id: int,
    data: ListItemCreate,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ListItemResponse:
    """
    Add a gift to a list.

    Creates a new list item (gift association) with initial status.

    Args:
        list_id: ID of the list to add item to
        data: ListItemCreate DTO (gift_id, status, assigned_to, notes)
        current_user_id: Current authenticated user ID (injected)
        db: Database session (injected)

    Returns:
        ListItemResponse with created item details

    Raises:
        HTTPException: 404 if list not found
        HTTPException: 400 if gift already in list or validation fails

    Example:
        ```json
        POST /lists/1/items
        {
            "gift_id": 10,
            "status": "idea",
            "assigned_to": null,
            "notes": "Need to check size"
        }

        Response 201:
        {
            "id": 1,
            "gift_id": 10,
            "list_id": 1,
            "status": "idea",
            "assigned_to": null,
            "notes": "Need to check size",
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:00:00Z"
        }
        ```

    Note:
        - Requires authentication via Bearer token
        - Status defaults to 'idea' if not provided
        - Gift can only appear once per list (enforced by database)
        - assigned_to and notes are optional
    """
    list_service = ListService(db)

    # Verify list exists
    list_obj = await list_service.get(list_id)
    if list_obj is None:
        raise NotFoundError(
            code="LIST_NOT_FOUND",
            message=f"List with ID {list_id} not found",
        )

    # Create list item with explicit list_id from path
    item_data = ListItemCreate(
        gift_id=data.gift_id,
        list_id=list_id,
        status=data.status,
        assigned_to=data.assigned_to,
        notes=data.notes,
    )

    item_service = ListItemService(db)

    try:
        item = await item_service.create(item_data, current_user_id)
        return item

    except ValueError as e:
        # Gift already in list or other validation error
        raise ValidationError(
            code="ITEM_CREATE_ERROR",
            message=str(e),
        ) from e
