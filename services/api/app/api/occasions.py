"""Occasion API routes for gifting event management."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.core.exceptions import NotFoundError
from app.schemas.base import PaginatedResponse
from app.schemas.occasion import OccasionCreate, OccasionResponse, OccasionUpdate
from app.services.occasion import OccasionService

router = APIRouter(prefix="/occasions", tags=["occasions"])


@router.get(
    "",
    response_model=PaginatedResponse[OccasionResponse],
    status_code=status.HTTP_200_OK,
    summary="List occasions with cursor pagination",
    description="Retrieve paginated list of occasions ordered by date descending",
)
async def list_occasions(
    cursor: int | None = None,
    limit: int = 50,
    user_id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> PaginatedResponse[OccasionResponse]:
    """
    List occasions with cursor-based pagination.

    Returns occasions ordered by date descending (most recent first).

    Args:
        cursor: Optional ID to start pagination from (exclusive)
        limit: Maximum number of occasions to return (default: 50, max: 100)
        user_id: Authenticated user ID (from JWT, injected)
        session: Database session (injected)

    Returns:
        PaginatedResponse with occasion list, has_more flag, and next cursor

    Example:
        ```json
        GET /occasions?cursor=&limit=20
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        {
            "items": [
                {
                    "id": 1,
                    "name": "Christmas 2024",
                    "type": "holiday",
                    "date": "2024-12-25",
                    "description": "Family gathering",
                    "created_at": "2025-11-26T12:00:00Z",
                    "updated_at": "2025-11-26T12:00:00Z"
                }
            ],
            "has_more": false,
            "next_cursor": null
        }
        ```

    Note:
        - Requires Bearer token in Authorization header
        - Limit capped at 100 for performance
        - Cursor-based pagination prevents duplicate results
    """
    service = OccasionService(session)

    # Fetch paginated occasions
    occasions, has_more, next_cursor = await service.list(cursor=cursor, limit=limit)

    # Return paginated response
    return PaginatedResponse(
        items=occasions,
        has_more=has_more,
        next_cursor=next_cursor,
    )


@router.post(
    "",
    response_model=OccasionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new occasion",
    description="Create a new gifting event occasion (birthday, holiday, etc.)",
)
async def create_occasion(
    data: OccasionCreate,
    user_id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> OccasionResponse:
    """
    Create a new occasion.

    Args:
        data: Occasion creation data (name, type, date, description)
        user_id: Authenticated user ID (from JWT, injected)
        session: Database session (injected)

    Returns:
        OccasionResponse with created occasion details

    Raises:
        HTTPException: 400 if validation fails

    Example:
        ```json
        POST /occasions
        Headers: Authorization: Bearer eyJhbGc...
        Content-Type: application/json

        Request:
        {
            "name": "Mom's Birthday",
            "type": "birthday",
            "date": "2025-03-15",
            "description": "Mom's 60th birthday celebration"
        }

        Response 201:
        {
            "id": 1,
            "name": "Mom's Birthday",
            "type": "birthday",
            "date": "2025-03-15",
            "description": "Mom's 60th birthday celebration",
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:00:00Z"
        }
        ```

    Note:
        - Requires Bearer token in Authorization header
        - Date can be in past or future
        - Description is optional
    """
    service = OccasionService(session)

    # Create occasion via service
    occasion = await service.create(data)

    return occasion


@router.get(
    "/{occasion_id}",
    response_model=OccasionResponse,
    status_code=status.HTTP_200_OK,
    summary="Get occasion by ID",
    description="Retrieve a specific occasion by its ID",
)
async def get_occasion(
    occasion_id: int,
    user_id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> OccasionResponse:
    """
    Get occasion by ID.

    Args:
        occasion_id: Occasion ID to retrieve
        user_id: Authenticated user ID (from JWT, injected)
        session: Database session (injected)

    Returns:
        OccasionResponse with occasion details

    Raises:
        HTTPException: 404 if occasion not found

    Example:
        ```json
        GET /occasions/1
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        {
            "id": 1,
            "name": "Christmas 2024",
            "type": "holiday",
            "date": "2024-12-25",
            "description": "Family gathering",
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:00:00Z"
        }
        ```

    Note:
        Requires Bearer token in Authorization header.
    """
    service = OccasionService(session)

    # Fetch occasion by ID
    occasion = await service.get(occasion_id)

    if occasion is None:
        raise NotFoundError(
            code="OCCASION_NOT_FOUND",
            message=f"Occasion with ID {occasion_id} not found",
        )

    return occasion


@router.put(
    "/{occasion_id}",
    response_model=OccasionResponse,
    status_code=status.HTTP_200_OK,
    summary="Update occasion",
    description="Update an existing occasion (all fields optional)",
)
async def update_occasion(
    occasion_id: int,
    data: OccasionUpdate,
    user_id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> OccasionResponse:
    """
    Update an existing occasion.

    Supports partial updates - only provided fields are modified.

    Args:
        occasion_id: Occasion ID to update
        data: Update data (all fields optional)
        user_id: Authenticated user ID (from JWT, injected)
        session: Database session (injected)

    Returns:
        OccasionResponse with updated occasion details

    Raises:
        HTTPException: 404 if occasion not found

    Example:
        ```json
        PUT /occasions/1
        Headers: Authorization: Bearer eyJhbGc...
        Content-Type: application/json

        Request (partial update - just date):
        {
            "date": "2024-12-26"
        }

        Response 200:
        {
            "id": 1,
            "name": "Christmas 2024",
            "type": "holiday",
            "date": "2024-12-26",
            "description": "Family gathering",
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:15:00Z"
        }
        ```

    Note:
        - Requires Bearer token in Authorization header
        - Only provided fields are updated
        - All fields are optional for partial updates
    """
    service = OccasionService(session)

    # Update occasion via service
    occasion = await service.update(occasion_id, data)

    if occasion is None:
        raise NotFoundError(
            code="OCCASION_NOT_FOUND",
            message=f"Occasion with ID {occasion_id} not found",
        )

    return occasion


@router.delete(
    "/{occasion_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete occasion",
    description="Delete an occasion and its associated data",
)
async def delete_occasion(
    occasion_id: int,
    user_id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> None:
    """
    Delete an occasion.

    Deletes the occasion and any cascading related data as configured in ORM.

    Args:
        occasion_id: Occasion ID to delete
        user_id: Authenticated user ID (from JWT, injected)
        session: Database session (injected)

    Returns:
        204 No Content (empty response body)

    Raises:
        HTTPException: 404 if occasion not found

    Example:
        ```json
        DELETE /occasions/1
        Headers: Authorization: Bearer eyJhbGc...

        Response 204: (no content)
        ```

    Note:
        - Requires Bearer token in Authorization header
        - Deletion may cascade to related entities
        - Returns 204 regardless of success (no response body)
    """
    service = OccasionService(session)

    # Delete occasion via service
    deleted = await service.delete(occasion_id)

    if not deleted:
        raise NotFoundError(
            code="OCCASION_NOT_FOUND",
            message=f"Occasion with ID {occasion_id} not found",
        )

    # 204 No Content - no response body needed
