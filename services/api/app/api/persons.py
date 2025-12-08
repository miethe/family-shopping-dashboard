"""Person API routes for gift recipient management."""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.core.exceptions import NotFoundError
from app.schemas.base import PaginatedResponse
from app.schemas.person import (
    PersonBudget,
    PersonCreate,
    PersonOccasionBudgetResponse,
    PersonOccasionBudgetUpdate,
    PersonResponse,
    PersonUpdate,
)
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


@router.get(
    "/{person_id}/budgets",
    response_model=PersonBudget,
    status_code=status.HTTP_200_OK,
    summary="Get person budget",
    description="Get gift budget totals for a person (assigned and purchased)",
)
async def get_person_budget(
    person_id: int,
    occasion_id: int | None = Query(None, description="Filter by occasion ID"),
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PersonBudget:
    """
    Get gift budget totals for a person.

    Returns:
    - gifts_assigned_count: Number of gifts assigned TO this person as recipient
    - gifts_assigned_total: Total value of assigned gifts
    - gifts_purchased_count: Number of gifts purchased BY this person
    - gifts_purchased_total: Total value of purchased gifts

    Args:
        person_id: Person to get budget for
        occasion_id: Optional filter by occasion
        current_user_id: Authenticated user (from JWT)
        db: Database session (injected)

    Returns:
        PersonBudget with counts and totals

    Raises:
        HTTPException 404: If person not found

    Example:
        ```json
        GET /persons/5/budgets
        GET /persons/5/budgets?occasion_id=1

        Response 200:
        {
            "person_id": 5,
            "occasion_id": null,
            "gifts_assigned_count": 3,
            "gifts_assigned_total": 150.00,
            "gifts_purchased_count": 2,
            "gifts_purchased_total": 89.99
        }
        ```

    Note:
        - Returns 404 if person not found
        - User must be authenticated
        - Occasion filter is optional
    """
    service = PersonService(db)
    budget = await service.get_budget(person_id, occasion_id)

    if budget is None:
        raise NotFoundError(
            code="PERSON_NOT_FOUND",
            message=f"Person with ID {person_id} not found",
            details={"person_id": person_id},
        )

    return budget


@router.get(
    "/{person_id}/occasions/{occasion_id}/budget",
    response_model=PersonOccasionBudgetResponse,
    status_code=status.HTTP_200_OK,
    summary="Get person budget for specific occasion",
    description="Retrieve budget fields and spending progress for a person-occasion pair",
)
async def get_person_occasion_budget(
    person_id: int,
    occasion_id: int,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PersonOccasionBudgetResponse:
    """
    Get budget and spending progress for person-occasion pair.

    Returns:
        - Budget fields (recipient_budget_total, purchaser_budget_total)
        - Spending amounts (recipient_spent, purchaser_spent)
        - Progress percentages (recipient_progress, purchaser_progress)

    Raises:
        HTTPException 404: If person-occasion link doesn't exist
    """
    service = PersonService(db)
    budget = await service.get_occasion_budget(person_id, occasion_id)

    if budget is None:
        raise NotFoundError(
            code="PERSON_OCCASION_NOT_FOUND",
            message=f"Person {person_id} is not linked to occasion {occasion_id}",
            details={"person_id": person_id, "occasion_id": occasion_id},
        )

    return budget


@router.put(
    "/{person_id}/occasions/{occasion_id}/budget",
    response_model=PersonOccasionBudgetResponse,
    status_code=status.HTTP_200_OK,
    summary="Update person budget for specific occasion",
    description="Set or update budget fields for a person-occasion pair",
)
async def update_person_occasion_budget(
    person_id: int,
    occasion_id: int,
    data: PersonOccasionBudgetUpdate,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PersonOccasionBudgetResponse:
    """
    Update budget for person-occasion pair.

    Args:
        recipient_budget_total: Budget for gifts TO person (>=0 or None for no limit)
        purchaser_budget_total: Budget for gifts BY person (>=0 or None for no limit)

    Returns:
        Updated budget response with spending progress

    Raises:
        HTTPException 404: If person-occasion link doesn't exist
    """
    service = PersonService(db)
    budget = await service.set_occasion_budget(person_id, occasion_id, data)

    if budget is None:
        raise NotFoundError(
            code="PERSON_OCCASION_NOT_FOUND",
            message=f"Person {person_id} is not linked to occasion {occasion_id}",
            details={"person_id": person_id, "occasion_id": occasion_id},
        )

    return budget
