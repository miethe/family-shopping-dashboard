"""Group API routes for organizing persons into groups."""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.core.exceptions import NotFoundError
from app.schemas.base import PaginatedResponse
from app.schemas.group import GroupCreate, GroupResponse, GroupUpdate
from app.services.group_service import GroupService

router = APIRouter(prefix="/groups", tags=["groups"])


@router.get(
    "",
    response_model=PaginatedResponse[GroupResponse],
    status_code=status.HTTP_200_OK,
    summary="List all groups with pagination",
    description="Retrieve paginated list of groups with member counts using cursor-based pagination",
)
async def list_groups(
    cursor: int | None = Query(
        None, description="Cursor ID for pagination (ID of last item from previous page)"
    ),
    limit: int = Query(50, ge=1, le=100, description="Number of items per page"),
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[GroupResponse]:
    """
    List all groups with cursor-based pagination.

    Returns paginated list of groups with member counts. Uses cursor-based pagination
    for efficient loading of large datasets.

    Args:
        cursor: Optional cursor ID for pagination (None for first page)
        limit: Number of items to return (1-100, default 50)
        current_user_id: Authenticated user ID (from JWT token, injected)
        db: Database session (injected)

    Returns:
        PaginatedResponse containing:
        - items: List of GroupResponse objects (with member_count field)
        - has_more: True if more items exist after this page
        - next_cursor: Cursor ID for next page (None if no more items)

    Raises:
        HTTPException: 401 if not authenticated

    Example:
        ```json
        GET /groups?limit=20
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        {
            "items": [
                {
                    "id": 1,
                    "name": "Immediate Family",
                    "description": "Close family members",
                    "color": "#4CAF50",
                    "member_count": 5,
                    "created_at": "2025-11-26T12:00:00Z",
                    "updated_at": "2025-11-26T12:00:00Z"
                }
            ],
            "has_more": false,
            "next_cursor": null
        }
        ```

    Note:
        - Results are sorted by ID in ascending order
        - Cursor pagination is more efficient than offset for large datasets
        - User must be authenticated to list groups
        - Member counts are included for each group
    """
    service = GroupService(db)
    groups, has_more, next_cursor = await service.list(cursor=cursor, limit=limit)

    return PaginatedResponse(items=groups, has_more=has_more, next_cursor=next_cursor)


@router.post(
    "",
    response_model=GroupResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new group",
    description="Create a new group for organizing persons",
)
async def create_group(
    data: GroupCreate,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GroupResponse:
    """
    Create a new group for organizing persons.

    Creates a new group with name, optional description, and optional color.
    Name must be unique across all groups.

    Args:
        data: GroupCreate schema with name and optional description/color
        current_user_id: Authenticated user ID (from JWT token, injected)
        db: Database session (injected)

    Returns:
        GroupResponse with created group details including ID and timestamps

    Raises:
        HTTPException: 401 if not authenticated
        HTTPException: 400 if validation fails (e.g., duplicate name, invalid color)

    Example:
        ```json
        POST /groups
        Headers: Authorization: Bearer eyJhbGc...
        Content-Type: application/json

        {
            "name": "Extended Family",
            "description": "Extended relatives and cousins",
            "color": "#FF9800"
        }

        Response 201:
        {
            "id": 3,
            "name": "Extended Family",
            "description": "Extended relatives and cousins",
            "color": "#FF9800",
            "member_count": 0,
            "created_at": "2025-11-26T13:45:30Z",
            "updated_at": "2025-11-26T13:45:30Z"
        }
        ```

    Note:
        - Name must be unique and 1-100 characters
        - Description and color are optional
        - Color must be hex format (#RRGGBB) if provided
        - Timestamps are auto-generated
        - New groups start with 0 members
        - User must be authenticated
    """
    service = GroupService(db)
    group = await service.create(data)

    return group


@router.get(
    "/{group_id}",
    response_model=GroupResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a group by ID",
    description="Retrieve details for a specific group with member count",
)
async def get_group(
    group_id: int,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GroupResponse:
    """
    Get a group by ID.

    Retrieve details for a specific group including name, description, color,
    and member count.

    Args:
        group_id: ID of the group to retrieve
        current_user_id: Authenticated user ID (from JWT token, injected)
        db: Database session (injected)

    Returns:
        GroupResponse with group details

    Raises:
        HTTPException: 401 if not authenticated
        HTTPException: 404 if group not found

    Example:
        ```json
        GET /groups/1
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        {
            "id": 1,
            "name": "Immediate Family",
            "description": "Close family members",
            "color": "#4CAF50",
            "member_count": 5,
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:00:00Z"
        }
        ```

    Note:
        - Returns 404 if group doesn't exist
        - Member count reflects current number of persons in this group
        - User must be authenticated
    """
    service = GroupService(db)
    group = await service.get(group_id)

    if group is None:
        raise NotFoundError(
            code="GROUP_NOT_FOUND",
            message=f"Group with ID {group_id} not found",
            details={"group_id": group_id},
        )

    return group


@router.put(
    "/{group_id}",
    response_model=GroupResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a group",
    description="Update group details (name, description, color)",
)
async def update_group(
    group_id: int,
    data: GroupUpdate,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GroupResponse:
    """
    Update a group's details.

    Partially update a group's name, description, or color. Only provided fields
    are updated; omitted fields retain their current values.

    Args:
        group_id: ID of the group to update
        data: GroupUpdate schema with fields to update (all optional)
        current_user_id: Authenticated user ID (from JWT token, injected)
        db: Database session (injected)

    Returns:
        Updated GroupResponse with all group details

    Raises:
        HTTPException: 401 if not authenticated
        HTTPException: 404 if group not found
        HTTPException: 400 if validation fails (e.g., duplicate name, invalid color)

    Example:
        ```json
        PUT /groups/1
        Headers: Authorization: Bearer eyJhbGc...
        Content-Type: application/json

        {
            "description": "Updated description for immediate family",
            "color": "#2196F3"
        }

        Response 200:
        {
            "id": 1,
            "name": "Immediate Family",
            "description": "Updated description for immediate family",
            "color": "#2196F3",
            "member_count": 5,
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T14:20:15Z"
        }
        ```

    Note:
        - All fields in GroupUpdate are optional (partial updates)
        - Only provided fields are updated
        - Name must remain unique if changed
        - Returns 404 if group doesn't exist
        - updated_at timestamp is automatically updated
        - Member count remains unchanged (manage via person endpoints)
        - User must be authenticated
    """
    service = GroupService(db)
    group = await service.update(group_id, data)

    if group is None:
        raise NotFoundError(
            code="GROUP_NOT_FOUND",
            message=f"Group with ID {group_id} not found",
            details={"group_id": group_id},
        )

    return group


@router.delete(
    "/{group_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a group",
    description="Delete a group by ID (removes group membership, not persons)",
)
async def delete_group(
    group_id: int,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Delete a group by ID.

    Permanently delete a group. This removes the group and all person-group
    memberships, but does not delete the persons themselves.

    Args:
        group_id: ID of the group to delete
        current_user_id: Authenticated user ID (from JWT token, injected)
        db: Database session (injected)

    Returns:
        No content (204 response)

    Raises:
        HTTPException: 401 if not authenticated
        HTTPException: 404 if group not found

    Example:
        ```json
        DELETE /groups/1
        Headers: Authorization: Bearer eyJhbGc...

        Response 204 No Content
        ```

    Note:
        - Deletion is permanent and cannot be undone
        - Returns 404 if group doesn't exist
        - Removes all person-group links (CASCADE)
        - Persons remain in the database (only group membership removed)
        - User must be authenticated
    """
    service = GroupService(db)
    deleted = await service.delete(group_id)

    if not deleted:
        raise NotFoundError(
            code="GROUP_NOT_FOUND",
            message=f"Group with ID {group_id} not found",
            details={"group_id": group_id},
        )
