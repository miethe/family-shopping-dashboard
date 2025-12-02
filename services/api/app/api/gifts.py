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
    summary="List and filter gifts with pagination",
    description="Get paginated list of gifts with optional filtering by recipient, status, list, occasion, and search",
)
async def list_gifts(
    cursor: int | None = Query(None, description="Cursor for pagination (ID of last item)"),
    limit: int = Query(50, ge=1, le=100, description="Maximum items to return"),
    search: str | None = Query(None, min_length=2, description="Search query for gift name (case-insensitive)"),
    person_ids: list[int] | None = Query(None, description="Filter by recipient person IDs (OR logic)"),
    statuses: list[str] | None = Query(None, description="Filter by list item statuses (OR logic)"),
    list_ids: list[int] | None = Query(None, description="Filter by list IDs (OR logic)"),
    occasion_ids: list[int] | None = Query(None, description="Filter by occasion IDs (OR logic)"),
    sort: str = Query("recent", description="Sort order: 'recent' (default), 'price_asc', 'price_desc'"),
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[GiftResponse]:
    """
    Get paginated and filtered list of gifts.

    Supports filtering by:
    - Search: Case-insensitive substring match on gift name
    - Person: Filter by recipient person IDs
    - Status: Filter by list item statuses (idea/selected/purchased/received)
    - List: Filter by specific list IDs
    - Occasion: Filter by occasion IDs

    Filters use AND logic across groups and OR logic within groups.
    For example: person_ids=[1,2] AND statuses=['purchased'] means
    "gifts for person 1 OR 2 that have status 'purchased'".

    Args:
        cursor: ID of last item from previous page (None for first page)
        limit: Maximum number of items to return (1-100, default: 50)
        search: Search query for gift name (minimum 2 characters)
        person_ids: Filter by recipient person IDs
        statuses: Filter by list item statuses
        list_ids: Filter by list IDs
        occasion_ids: Filter by occasion IDs
        sort: Sort order ('recent', 'price_asc', 'price_desc')
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        PaginatedResponse with gift items, has_more flag, and next cursor

    Example:
        ```json
        GET /gifts?person_ids=5&statuses=purchased&statuses=selected&limit=20
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

    Example queries:
        - All gifts: GET /gifts
        - Search: GET /gifts?search=lego
        - Filter by person: GET /gifts?person_ids=5
        - Filter by status: GET /gifts?statuses=purchased&statuses=selected
        - Multiple filters: GET /gifts?person_ids=5&statuses=purchased&sort=price_asc
    """
    service = GiftService(db)
    gifts, has_more, next_cursor = await service.list(
        cursor=cursor,
        limit=limit,
        search=search,
        person_ids=person_ids,
        statuses=statuses,
        list_ids=list_ids,
        occasion_ids=occasion_ids,
        sort_by=sort,
    )

    return PaginatedResponse(items=gifts, has_more=has_more, next_cursor=next_cursor)


@router.get(
    "/search",
    response_model=PaginatedResponse[GiftResponse],
    status_code=status.HTTP_200_OK,
    summary="Search gifts by name (legacy endpoint)",
    description="Search gifts using case-insensitive substring matching. Use GET /gifts?search=query for new code.",
)
async def search_gifts(
    q: str = Query(..., min_length=2, description="Search query (minimum 2 characters)"),
    cursor: int | None = Query(None, description="Cursor for pagination (ID of last item)"),
    limit: int = Query(50, ge=1, le=100, description="Maximum items to return"),
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[GiftResponse]:
    """
    Search gifts by name (legacy endpoint).

    This endpoint is maintained for backwards compatibility.
    New code should use GET /gifts?search=query instead, which supports
    additional filtering options.

    Performs case-insensitive substring matching on gift names.
    Returns results ordered by relevance with cursor-based pagination.

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
        - For filtering by person/status/list/occasion, use GET /gifts endpoint
    """
    service = GiftService(db)
    # Use unified list method with search parameter
    gifts, has_more, next_cursor = await service.list(
        cursor=cursor,
        limit=limit,
        search=q,
    )

    return PaginatedResponse(items=gifts, has_more=has_more, next_cursor=next_cursor)


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
