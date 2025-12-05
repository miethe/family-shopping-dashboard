"""Person API routes for gift recipient management."""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.core.exceptions import NotFoundError
from app.schemas.base import PaginatedResponse
from app.schemas.person import PersonCreate, PersonResponse, PersonUpdate
from app.services.person import PersonService

router = APIRouter(prefix="/persons", tags=["persons"])


@router.get(
    "",
    response_model=PaginatedResponse[PersonResponse],
    status_code=status.HTTP_200_OK,
    summary="List all persons with pagination and optional group filtering",
    description="Retrieve paginated list of gift recipients using cursor-based pagination, optionally filtered by group",
)
async def list_persons(
    cursor: int | None = Query(
        None, description="Cursor ID for pagination (ID of last item from previous page)"
    ),
    limit: int = Query(50, ge=1, le=100, description="Number of items per page"),
    group_id: int | None = Query(
        None, description="Filter by group ID (None for no filter)"
    ),
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[PersonResponse]:
    """
    List all persons with cursor-based pagination and optional group filtering.

    Returns paginated list of gift recipients. Uses cursor-based pagination for
    efficient loading of large datasets. Can optionally filter by group membership.

    Args:
        cursor: Optional cursor ID for pagination (None for first page)
        limit: Number of items to return (1-100, default 50)
        group_id: Optional group ID to filter by (None for no filter)
        current_user_id: Authenticated user ID (from JWT token, injected)
        db: Database session (injected)

    Returns:
        PaginatedResponse containing:
        - items: List of PersonResponse objects (with groups field populated)
        - has_more: True if more items exist after this page
        - next_cursor: Cursor ID for next page (None if no more items)

    Raises:
        HTTPException: 401 if not authenticated

    Example:
        ```json
        # Get all persons
        GET /persons?limit=20
        Headers: Authorization: Bearer eyJhbGc...

        # Get persons in group 1
        GET /persons?limit=20&group_id=1
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        {
            "items": [
                {
                    "id": 1,
                    "display_name": "Mom",
                    "relationship": "Mother",
                    "birthdate": "1970-05-15",
                    "interests": ["Reading", "Gardening"],
                    "sizes": {"shirt": "M", "shoe": "8"},
                    "groups": [
                        {"id": 1, "name": "Immediate Family", "color": "#FF5733"}
                    ],
                    "created_at": "2025-11-26T12:00:00Z",
                    "updated_at": "2025-11-26T12:00:00Z"
                }
            ],
            "has_more": true,
            "next_cursor": 2
        }
        ```

    Note:
        - Results are sorted by ID in ascending order
        - Cursor pagination is more efficient than offset for large datasets
        - User must be authenticated to list persons
        - Groups are eagerly loaded for all returned persons
    """
    service = PersonService(db)
    persons, has_more, next_cursor = await service.list(
        cursor=cursor, limit=limit, group_id=group_id
    )

    return PaginatedResponse(items=persons, has_more=has_more, next_cursor=next_cursor)


@router.post(
    "",
    response_model=PersonResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new person",
    description="Create a new gift recipient with name, interests, and sizes",
)
async def create_person(
    data: PersonCreate,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PersonResponse:
    """
    Create a new person (gift recipient).

    Creates a new gift recipient with name, interests, and clothing/shoe sizes.
    Name is required; interests and sizes are optional.

    Args:
        data: PersonCreate schema with name and optional interests/sizes
        current_user_id: Authenticated user ID (from JWT token, injected)
        db: Database session (injected)

    Returns:
        PersonResponse with created person details including ID and timestamps

    Raises:
        HTTPException: 401 if not authenticated
        HTTPException: 400 if validation fails (e.g., empty name)

    Example:
        ```json
        POST /persons
        Headers: Authorization: Bearer eyJhbGc...
        Content-Type: application/json

        {
            "name": "Sarah",
            "interests": ["Photography", "Hiking"],
            "sizes": {"shirt": "S", "pants": "28x32", "shoe": "7"}
        }

        Response 201:
        {
            "id": 5,
            "name": "Sarah",
            "interests": ["Photography", "Hiking"],
            "sizes": {"shirt": "S", "pants": "28x32", "shoe": "7"},
            "created_at": "2025-11-26T13:45:30Z",
            "updated_at": "2025-11-26T13:45:30Z"
        }
        ```

    Note:
        - Name must be 1-100 characters
        - Interests and sizes are optional
        - Timestamps are auto-generated
        - User must be authenticated
    """
    service = PersonService(db)
    person = await service.create(data)

    return person


@router.get(
    "/{person_id}",
    response_model=PersonResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a person by ID",
    description="Retrieve details for a specific gift recipient",
)
async def get_person(
    person_id: int,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PersonResponse:
    """
    Get a person by ID.

    Retrieve details for a specific gift recipient including name, interests,
    and sizes.

    Args:
        person_id: ID of the person to retrieve
        current_user_id: Authenticated user ID (from JWT token, injected)
        db: Database session (injected)

    Returns:
        PersonResponse with person details

    Raises:
        HTTPException: 401 if not authenticated
        HTTPException: 404 if person not found

    Example:
        ```json
        GET /persons/1
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        {
            "id": 1,
            "name": "Mom",
            "interests": ["Reading", "Gardening"],
            "sizes": {"shirt": "M", "shoe": "8"},
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:00:00Z"
        }
        ```

    Note:
        - Returns 404 if person doesn't exist
        - User must be authenticated
    """
    service = PersonService(db)
    person = await service.get(person_id)

    if person is None:
        raise NotFoundError(
            code="PERSON_NOT_FOUND",
            message=f"Person with ID {person_id} not found",
            details={"person_id": person_id},
        )

    return person


@router.put(
    "/{person_id}",
    response_model=PersonResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a person",
    description="Update person details (name, interests, sizes)",
)
async def update_person(
    person_id: int,
    data: PersonUpdate,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PersonResponse:
    """
    Update a person's details.

    Partially update a person's name, interests, or sizes. Only provided fields
    are updated; omitted fields retain their current values.

    Args:
        person_id: ID of the person to update
        data: PersonUpdate schema with fields to update (all optional)
        current_user_id: Authenticated user ID (from JWT token, injected)
        db: Database session (injected)

    Returns:
        Updated PersonResponse with all person details

    Raises:
        HTTPException: 401 if not authenticated
        HTTPException: 404 if person not found
        HTTPException: 400 if validation fails

    Example:
        ```json
        PUT /persons/1
        Headers: Authorization: Bearer eyJhbGc...
        Content-Type: application/json

        {
            "interests": ["Reading", "Cooking", "Travel"],
            "sizes": {"shirt": "M", "pants": "32x30", "shoe": "10"}
        }

        Response 200:
        {
            "id": 1,
            "name": "Mom",
            "interests": ["Reading", "Cooking", "Travel"],
            "sizes": {"shirt": "M", "pants": "32x30", "shoe": "10"},
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T14:20:15Z"
        }
        ```

    Note:
        - All fields in PersonUpdate are optional (partial updates)
        - Only provided fields are updated
        - Returns 404 if person doesn't exist
        - updated_at timestamp is automatically updated
        - User must be authenticated
    """
    service = PersonService(db)
    person = await service.update(person_id, data)

    if person is None:
        raise NotFoundError(
            code="PERSON_NOT_FOUND",
            message=f"Person with ID {person_id} not found",
            details={"person_id": person_id},
        )

    return person


@router.delete(
    "/{person_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a person",
    description="Delete a gift recipient by ID",
)
async def delete_person(
    person_id: int,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Delete a person by ID.

    Permanently delete a gift recipient. Related gift lists and items may be
    affected depending on foreign key constraints.

    Args:
        person_id: ID of the person to delete
        current_user_id: Authenticated user ID (from JWT token, injected)
        db: Database session (injected)

    Returns:
        No content (204 response)

    Raises:
        HTTPException: 401 if not authenticated
        HTTPException: 404 if person not found

    Example:
        ```json
        DELETE /persons/1
        Headers: Authorization: Bearer eyJhbGc...

        Response 204 No Content
        ```

    Note:
        - Deletion is permanent and cannot be undone
        - Returns 404 if person doesn't exist
        - May have cascading effects on related records
        - User must be authenticated
    """
    service = PersonService(db)
    deleted = await service.delete(person_id)

    if not deleted:
        raise NotFoundError(
            code="PERSON_NOT_FOUND",
            message=f"Person with ID {person_id} not found",
            details={"person_id": person_id},
        )
