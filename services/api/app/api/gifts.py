"""Gift API routes for CRUD operations and search."""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.core.exceptions import NotFoundError
from app.schemas.base import PaginatedResponse
from app.schemas.gift import (
    BulkGiftAction,
    BulkGiftResult,
    GiftCreate,
    GiftPeopleLink,
    GiftResponse,
    GiftUpdate,
    MarkPurchasedRequest,
)
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
    - Person: Filter by recipient person IDs (via list ownership OR direct GiftPerson linking)
    - Status: Filter by list item statuses (idea/selected/purchased/received)
    - List: Filter by specific list IDs
    - Occasion: Filter by occasion IDs

    Filters use AND logic across groups and OR logic within groups.
    For example: person_ids=[1,2] AND statuses=['purchased'] means
    "gifts for person 1 OR 2 that have status 'purchased'".

    Note: The person_ids filter returns gifts from BOTH:
    1. List ownership (gifts added to lists owned by the person)
    2. Direct linking (gifts linked via GiftPerson table with role=RECIPIENT)

    Args:
        cursor: ID of last item from previous page (None for first page)
        limit: Maximum number of items to return (1-100, default: 50)
        search: Search query for gift name (minimum 2 characters)
        person_ids: Filter by recipient person IDs (includes list-based AND GiftPerson-based)
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


@router.patch(
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


@router.get(
    "/{gift_id}/people",
    response_model=list[int],
    status_code=status.HTTP_200_OK,
    summary="Get people linked to a gift",
    description="Get all person IDs linked to a specific gift",
)
async def get_gift_people(
    gift_id: int,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[int]:
    """
    Get all person IDs linked to a gift.

    Args:
        gift_id: Gift ID to get linked people for
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        List of person IDs linked to the gift

    Raises:
        HTTPException: 404 if gift not found

    Example:
        ```json
        GET /gifts/42/people
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        [1, 2, 3]
        ```
    """
    service = GiftService(db)
    gift = await service.get(gift_id)

    if gift is None:
        raise NotFoundError(
            code="GIFT_NOT_FOUND",
            message=f"Gift with ID {gift_id} not found",
        )

    return await service.get_linked_people(gift_id)


@router.post(
    "/{gift_id}/people",
    response_model=list[int],
    status_code=status.HTTP_200_OK,
    summary="Attach people to a gift",
    description="Attach multiple people to a gift (batch operation, skips duplicates) and return updated person ids.",
)
async def attach_people_to_gift(
    gift_id: int,
    data: GiftPeopleLink,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[int]:
    """
    Attach people to a gift (batch operation).

    Args:
        gift_id: Gift ID to attach people to
        data: Request body with person IDs to attach
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        No content (204)

    Raises:
        HTTPException: 404 if gift not found

    Example:
        ```json
        POST /gifts/42/people
        Headers: Authorization: Bearer eyJhbGc...
        {
            "person_ids": [1, 2, 3]
        }

        Response 204 No Content
        ```

    Note:
        - Automatically skips duplicate links
        - Does not fail if some people are already linked
        - All person IDs must be valid (will fail if any person doesn't exist)
    """
    service = GiftService(db)
    gift = await service.get(gift_id)

    if gift is None:
        raise NotFoundError(
            code="GIFT_NOT_FOUND",
            message=f"Gift with ID {gift_id} not found",
        )

    await service.attach_people(gift_id, data.person_ids)
    return await service.get_linked_people(gift_id)


@router.delete(
    "/{gift_id}/people/{person_id}",
    response_model=list[int],
    status_code=status.HTTP_200_OK,
    summary="Detach a person from a gift",
    description="Remove the link between a gift and a person and return the updated person list",
)
async def detach_person_from_gift(
    gift_id: int,
    person_id: int,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[int]:
    """
    Detach a person from a gift.

    Args:
        gift_id: Gift ID to detach person from
        person_id: Person ID to detach
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        Updated list of linked person IDs

    Raises:
        HTTPException: 404 if link not found (either gift or person doesn't exist,
                      or they aren't linked)
    """
    service = GiftService(db)
    deleted = await service.detach_person(gift_id, person_id)

    if not deleted:
        raise NotFoundError(
            code="LINK_NOT_FOUND",
            message=f"No link found between gift {gift_id} and person {person_id}",
        )

    return await service.get_linked_people(gift_id)


@router.post(
    "/{gift_id}/mark-purchased",
    response_model=GiftResponse,
    status_code=status.HTTP_200_OK,
    summary="Mark gift as purchased or partially purchased",
    description="Sets purchase date, status, and quantity purchased metadata on the gift.",
)
async def mark_gift_as_purchased(
    gift_id: int,
    data: MarkPurchasedRequest,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GiftResponse:
    service = GiftService(db)
    updated = await service.mark_as_purchased(gift_id, data)
    if updated is None:
        raise NotFoundError(
            code="GIFT_NOT_FOUND",
            message=f"Gift with ID {gift_id} not found",
        )
    return updated


@router.patch(
    "/bulk",
    response_model=BulkGiftResult,
    status_code=status.HTTP_200_OK,
    summary="Bulk update gifts",
    description="Perform bulk actions on multiple gifts (assign, mark purchased, delete)",
)
async def bulk_update_gifts(
    data: BulkGiftAction,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BulkGiftResult:
    """
    Perform bulk action on multiple gifts.

    Supports the following actions:
    - assign_recipient: Add person as recipient (requires person_id)
    - assign_purchaser: Set person as purchaser (requires person_id)
    - mark_purchased: Set purchase_date to today
    - delete: Delete gifts

    Returns partial success - continues even if some gifts fail.
    This allows the UI to show which gifts were successfully processed
    and which failed with error details.

    Args:
        data: Bulk action request with gift IDs, action type, and optional person_id
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        BulkGiftResult with success count, failed IDs, and error messages

    Example:
        ```json
        PATCH /gifts/bulk
        Headers: Authorization: Bearer eyJhbGc...
        {
            "gift_ids": [1, 2, 3],
            "action": "assign_recipient",
            "person_id": 5
        }

        Response 200:
        {
            "success_count": 2,
            "failed_ids": [3],
            "errors": ["Gift 3: Gift not found"]
        }
        ```

    Note:
        - Validates person_id is provided for assign actions
        - Continues processing even if some gifts fail
        - Returns detailed error messages for each failed gift
        - Maximum 100 gifts per request
    """
    service = GiftService(db)
    result = await service.bulk_action(
        gift_ids=data.gift_ids,
        action=data.action,
        person_id=data.person_id,
    )
    return BulkGiftResult(**result)


@router.get(
    "/linked-to-person/{person_id}",
    response_model=list[GiftResponse],
    status_code=status.HTTP_200_OK,
    summary="Get gifts directly linked to a person",
    description="Get all gifts that are directly linked to a specific person via gift_people table",
)
async def get_gifts_by_linked_person(
    person_id: int,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[GiftResponse]:
    """
    Get all gifts directly linked to a specific person.

    This endpoint returns gifts that are directly associated with a person
    via the gift_people junction table. This is different from filtering
    by list ownership (person_ids parameter in GET /gifts).

    Args:
        person_id: Person ID to get linked gifts for
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        List of GiftResponse objects directly linked to the person

    Example:
        ```json
        GET /gifts/linked-to-person/5
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        [
            {
                "id": 1,
                "name": "LEGO Star Wars Set",
                "url": "https://www.amazon.com/dp/B08H93ZRK9",
                "price": 79.99,
                "image_url": "https://example.com/image.jpg",
                "source": "Amazon wishlist",
                "extra_data": {},
                "created_at": "2025-11-26T12:00:00Z",
                "updated_at": "2025-11-26T12:00:00Z"
            },
            {
                "id": 2,
                "name": "Coffee Maker",
                "url": "https://example.com/product",
                "price": 49.99,
                "image_url": "https://example.com/coffee.jpg",
                "source": "URL import",
                "extra_data": {},
                "created_at": "2025-11-26T13:00:00Z",
                "updated_at": "2025-11-26T13:00:00Z"
            }
        ]
        ```

    Note:
        - Returns gifts directly linked via gift_people table
        - Does NOT filter by list ownership
        - Returns empty list if person has no linked gifts
        - Results ordered by gift ID (most recent first)
    """
    service = GiftService(db)
    return await service.list_by_linked_person(person_id)
