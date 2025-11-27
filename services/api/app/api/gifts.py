"""Gift API routes for CRUD operations and search."""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.core.exceptions import NotFoundError
from app.schemas.base import PaginatedResponse
from app.schemas.gift import GiftCreate, GiftResponse, GiftUpdate
from app.services.gift import GiftService

router = APIRouter(prefix="/gifts", tags=["gifts"])


@router.get(
    "",
    response_model=PaginatedResponse[GiftResponse],
    status_code=status.HTTP_200_OK,
    summary="List all gifts with pagination",
    description="Get paginated list of all gifts using cursor-based pagination",
)
async def list_gifts(
    cursor: int | None = Query(None, description="Cursor for pagination (ID of last item)"),
    limit: int = Query(50, ge=1, le=100, description="Maximum items to return"),
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[GiftResponse]:
    """
    Get paginated list of gifts.

    Args:
        cursor: ID of last item from previous page (None for first page)
        limit: Maximum number of items to return (1-100, default: 50)
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        PaginatedResponse with gift items, has_more flag, and next cursor

    Example:
        ```json
        GET /gifts?limit=20
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        {
            "items": [
                {
                    "id": 1,
                    "name": "LEGO Star Wars",
                    "url": "https://amazon.com/...",
                    "price": 79.99,
                    "image_url": "https://amazon.com/image.jpg",
                    "source": "Amazon wishlist",
                    "extra_data": {},
                    "created_at": "2025-11-26T12:00:00Z",
                    "updated_at": "2025-11-26T12:00:00Z"
                }
            ],
            "has_more": true,
            "next_cursor": 42
        }
        ```
    """
    service = GiftService(db)
    gifts, has_more, next_cursor = await service.list(cursor=cursor, limit=limit)

    return PaginatedResponse(items=gifts, has_more=has_more, next_cursor=next_cursor)


@router.get(
    "/search",
    response_model=PaginatedResponse[GiftResponse],
    status_code=status.HTTP_200_OK,
    summary="Search gifts by name",
    description="Search gifts using case-insensitive substring matching on gift names",
)
async def search_gifts(
    q: str = Query(..., min_length=2, description="Search query (minimum 2 characters)"),
    cursor: int | None = Query(None, description="Cursor for pagination (ID of last item)"),
    limit: int = Query(50, ge=1, le=100, description="Maximum items to return"),
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[GiftResponse]:
    """
    Search gifts by name.

    Performs case-insensitive substring matching on gift names.
    Returns results ordered by name and limited by cursor-based pagination.

    Args:
        q: Search query string (minimum 2 characters)
        cursor: ID of last item from previous page (None for first page)
        limit: Maximum number of items to return (1-100, default: 50)
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        PaginatedResponse with matching gift items

    Example:
        ```json
        GET /gifts/search?q=lego&limit=20
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        {
            "items": [
                {
                    "id": 1,
                    "name": "LEGO Star Wars",
                    "url": "https://amazon.com/...",
                    "price": 79.99,
                    "image_url": "https://amazon.com/image.jpg",
                    "source": "Amazon wishlist",
                    "extra_data": {},
                    "created_at": "2025-11-26T12:00:00Z",
                    "updated_at": "2025-11-26T12:00:00Z"
                },
                {
                    "id": 5,
                    "name": "LEGO Harry Potter",
                    "url": "https://amazon.com/...",
                    "price": 49.99,
                    "image_url": "https://amazon.com/image.jpg",
                    "source": "URL import",
                    "extra_data": {},
                    "created_at": "2025-11-26T12:00:00Z",
                    "updated_at": "2025-11-26T12:00:00Z"
                }
            ],
            "has_more": false,
            "next_cursor": null
        }
        ```

    Note:
        - Search is case-insensitive
        - Uses substring matching (finds "lego" anywhere in name)
        - Returns empty list if no matches found
    """
    service = GiftService(db)
    gifts = await service.search(q, limit=limit)

    # Convert search results to paginated response (search returns list, not paginated)
    return PaginatedResponse(items=gifts, has_more=False, next_cursor=None)


@router.post(
    "",
    response_model=GiftResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new gift",
    description="Create a new gift with provided data",
)
async def create_gift(
    data: GiftCreate,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GiftResponse:
    """
    Create a new gift.

    Args:
        data: Gift creation data (name is required, other fields optional)
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        GiftResponse with created gift details

    Example:
        ```json
        POST /gifts
        Headers: Authorization: Bearer eyJhbGc...
        {
            "name": "LEGO Star Wars Set",
            "url": "https://www.amazon.com/dp/B08H93ZRK9",
            "price": 79.99,
            "image_url": "https://example.com/image.jpg",
            "source": "Amazon wishlist"
        }

        Response 201:
        {
            "id": 42,
            "name": "LEGO Star Wars Set",
            "url": "https://www.amazon.com/dp/B08H93ZRK9",
            "price": 79.99,
            "image_url": "https://example.com/image.jpg",
            "source": "Amazon wishlist",
            "extra_data": {},
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:00:00Z"
        }
        ```

    Note:
        - Only 'name' field is required
        - All other fields (url, price, image_url, source) are optional
        - Price must be non-negative if provided
    """
    service = GiftService(db)
    gift = await service.create(data)

    return gift


@router.get(
    "/{gift_id}",
    response_model=GiftResponse,
    status_code=status.HTTP_200_OK,
    summary="Get gift by ID",
    description="Retrieve a specific gift by its ID",
)
async def get_gift(
    gift_id: int,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GiftResponse:
    """
    Get a gift by ID.

    Args:
        gift_id: Gift ID to retrieve
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        GiftResponse with gift details

    Raises:
        HTTPException: 404 if gift not found

    Example:
        ```json
        GET /gifts/42
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        {
            "id": 42,
            "name": "LEGO Star Wars Set",
            "url": "https://www.amazon.com/dp/B08H93ZRK9",
            "price": 79.99,
            "image_url": "https://example.com/image.jpg",
            "source": "Amazon wishlist",
            "extra_data": {},
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:00:00Z"
        }
        ```
    """
    service = GiftService(db)
    gift = await service.get(gift_id)

    if gift is None:
        raise NotFoundError(
            code="GIFT_NOT_FOUND",
            message=f"Gift with ID {gift_id} not found",
        )

    return gift


@router.put(
    "/{gift_id}",
    response_model=GiftResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a gift",
    description="Update an existing gift (all fields optional for partial updates)",
)
async def update_gift(
    gift_id: int,
    data: GiftUpdate,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GiftResponse:
    """
    Update an existing gift.

    Args:
        gift_id: Gift ID to update
        data: Update data (all fields optional for partial updates)
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        Updated GiftResponse

    Raises:
        HTTPException: 404 if gift not found

    Example:
        ```json
        PUT /gifts/42
        Headers: Authorization: Bearer eyJhbGc...
        {
            "price": 99.99,
            "image_url": "https://example.com/new-image.jpg"
        }

        Response 200:
        {
            "id": 42,
            "name": "LEGO Star Wars Set",
            "url": "https://www.amazon.com/dp/B08H93ZRK9",
            "price": 99.99,
            "image_url": "https://example.com/new-image.jpg",
            "source": "Amazon wishlist",
            "extra_data": {},
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:00:00Z"
        }
        ```

    Note:
        - Only provided fields are updated (partial update)
        - Missing/null fields are left unchanged
        - Returns 404 if gift not found
    """
    service = GiftService(db)
    gift = await service.update(gift_id, data)

    if gift is None:
        raise NotFoundError(
            code="GIFT_NOT_FOUND",
            message=f"Gift with ID {gift_id} not found",
        )

    return gift


@router.delete(
    "/{gift_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a gift",
    description="Delete a gift by ID",
)
async def delete_gift(
    gift_id: int,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Delete a gift by ID.

    Args:
        gift_id: Gift ID to delete
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        No content (204)

    Raises:
        HTTPException: 404 if gift not found

    Example:
        ```
        DELETE /gifts/42
        Headers: Authorization: Bearer eyJhbGc...

        Response 204 No Content
        ```

    Note:
        - Returns 204 No Content on success
        - Returns 404 if gift not found
    """
    service = GiftService(db)
    deleted = await service.delete(gift_id)

    if not deleted:
        raise NotFoundError(
            code="GIFT_NOT_FOUND",
            message=f"Gift with ID {gift_id} not found",
        )
