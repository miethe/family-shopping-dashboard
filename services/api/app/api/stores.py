"""Store API routes for CRUD operations and search."""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.core.exceptions import NotFoundError
from app.schemas.base import PaginatedResponse
from app.schemas.store import StoreCreate, StoreResponse, StoreUpdate
from app.services.store import StoreService

router = APIRouter(prefix="/stores", tags=["stores"])


@router.get(
    "",
    response_model=PaginatedResponse[StoreResponse],
    status_code=status.HTTP_200_OK,
    summary="List stores with pagination",
    description="Get paginated list of stores",
)
async def list_stores(
    cursor: int | None = Query(None, description="Cursor for pagination (ID of last item)"),
    limit: int = Query(50, ge=1, le=100, description="Maximum items to return"),
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[StoreResponse]:
    """
    Get paginated list of stores.

    Returns stores ordered by name with cursor-based pagination for
    efficient scrolling through large datasets.

    Args:
        cursor: ID of last item from previous page (None for first page)
        limit: Maximum number of items to return (1-100, default: 50)
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        PaginatedResponse with store items, has_more flag, and next cursor

    Example:
        ```json
        GET /stores?limit=20
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        {
            "items": [
                {
                    "id": 1,
                    "name": "Amazon",
                    "url": "https://amazon.com",
                    "created_at": "2025-11-26T12:00:00Z",
                    "updated_at": "2025-11-26T12:00:00Z"
                }
            ],
            "has_more": true,
            "next_cursor": 42
        }
        ```
    """
    service = StoreService(db)
    stores, has_more, next_cursor = await service.list_stores(cursor=cursor, limit=limit)

    return PaginatedResponse(items=stores, has_more=has_more, next_cursor=next_cursor)


@router.get(
    "/search",
    response_model=list[StoreResponse],
    status_code=status.HTTP_200_OK,
    summary="Search stores by name",
    description="Search stores using case-insensitive substring matching",
)
async def search_stores(
    q: str = Query(..., min_length=1, description="Search query (minimum 1 character)"),
    limit: int = Query(20, ge=1, le=100, description="Maximum items to return"),
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[StoreResponse]:
    """
    Search stores by name.

    Performs case-insensitive substring matching on store names.
    Useful for autocomplete and store lookup when adding stores to gifts.

    Args:
        q: Search query string (minimum 1 character)
        limit: Maximum number of items to return (1-100, default: 20)
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        List of matching stores ordered by name

    Example:
        ```json
        GET /stores/search?q=amazon&limit=10
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        [
            {
                "id": 1,
                "name": "Amazon",
                "url": "https://amazon.com",
                "created_at": "2025-11-26T12:00:00Z",
                "updated_at": "2025-11-26T12:00:00Z"
            },
            {
                "id": 5,
                "name": "Amazon Fresh",
                "url": "https://fresh.amazon.com",
                "created_at": "2025-11-26T12:00:00Z",
                "updated_at": "2025-11-26T12:00:00Z"
            }
        ]
        ```

    Note:
        - Search is case-insensitive
        - Uses substring matching (finds query anywhere in name)
        - Returns empty list if no matches found
        - Ordered by store name alphabetically
    """
    service = StoreService(db)
    stores = await service.search(q, limit=limit)

    return stores


@router.post(
    "",
    response_model=StoreResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new store",
    description="Create a new store with provided data",
)
async def create_store(
    data: StoreCreate,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StoreResponse:
    """
    Create a new store.

    Args:
        data: Store creation data (name required, url optional)
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        StoreResponse with created store details

    Example:
        ```json
        POST /stores
        Headers: Authorization: Bearer eyJhbGc...
        {
            "name": "Target",
            "url": "https://target.com"
        }

        Response 201:
        {
            "id": 42,
            "name": "Target",
            "url": "https://target.com",
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:00:00Z"
        }
        ```

    Note:
        - Only 'name' field is required
        - URL is optional
        - Name must be 1-255 characters
    """
    service = StoreService(db)
    store = await service.create(data)

    return store


@router.get(
    "/{store_id}",
    response_model=StoreResponse,
    status_code=status.HTTP_200_OK,
    summary="Get store by ID",
    description="Retrieve a specific store by its ID",
)
async def get_store(
    store_id: int,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StoreResponse:
    """
    Get a store by ID.

    Args:
        store_id: Store ID to retrieve
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        StoreResponse with store details

    Raises:
        HTTPException: 404 if store not found

    Example:
        ```json
        GET /stores/42
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        {
            "id": 42,
            "name": "Target",
            "url": "https://target.com",
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:00:00Z"
        }
        ```
    """
    service = StoreService(db)
    store = await service.get(store_id)

    if store is None:
        raise NotFoundError(
            code="STORE_NOT_FOUND",
            message=f"Store with ID {store_id} not found",
        )

    return store


@router.patch(
    "/{store_id}",
    response_model=StoreResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a store",
    description="Update an existing store (all fields optional for partial updates)",
)
async def update_store(
    store_id: int,
    data: StoreUpdate,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StoreResponse:
    """
    Update an existing store.

    Args:
        store_id: Store ID to update
        data: Update data (all fields optional for partial updates)
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        Updated StoreResponse

    Raises:
        HTTPException: 404 if store not found

    Example:
        ```json
        PATCH /stores/42
        Headers: Authorization: Bearer eyJhbGc...
        {
            "url": "https://new-url.target.com"
        }

        Response 200:
        {
            "id": 42,
            "name": "Target",
            "url": "https://new-url.target.com",
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:00:00Z"
        }
        ```

    Note:
        - Only provided fields are updated (partial update)
        - Missing/null fields are left unchanged
        - Returns 404 if store not found
    """
    service = StoreService(db)
    store = await service.update(store_id, data)

    if store is None:
        raise NotFoundError(
            code="STORE_NOT_FOUND",
            message=f"Store with ID {store_id} not found",
        )

    return store


@router.delete(
    "/{store_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a store",
    description="Delete a store by ID",
)
async def delete_store(
    store_id: int,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Delete a store by ID.

    Args:
        store_id: Store ID to delete
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        No content (204)

    Raises:
        HTTPException: 404 if store not found

    Example:
        ```
        DELETE /stores/42
        Headers: Authorization: Bearer eyJhbGc...

        Response 204 No Content
        ```

    Note:
        - Returns 204 No Content on success
        - Returns 404 if store not found
        - CASCADE delete removes all gift_store associations
    """
    service = StoreService(db)
    deleted = await service.delete(store_id)

    if not deleted:
        raise NotFoundError(
            code="STORE_NOT_FOUND",
            message=f"Store with ID {store_id} not found",
        )
