"""Field Options API routes for managing admin-configurable field options."""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.schemas.field_option import (
    FieldOptionCreate,
    FieldOptionDeleteResponse,
    FieldOptionListResponse,
    FieldOptionResponse,
    FieldOptionUpdate,
)
from app.services.field_option import FieldOptionService

router = APIRouter(prefix="/field-options", tags=["field-options"])


@router.get(
    "",
    response_model=FieldOptionListResponse,
    status_code=status.HTTP_200_OK,
    summary="List field options for an entity/field",
    description="Get paginated list of options for a specific entity and field with optional inactive filter",
)
async def list_field_options(
    entity: str = Query(..., description="Entity type (person, gift, occasion, list)"),
    field_name: str = Query(..., description="Field name (wine_types, priority, etc.)"),
    include_inactive: bool = Query(False, description="Include soft-deleted options"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(100, ge=1, le=1000, description="Page size (max 1000)"),
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FieldOptionListResponse:
    """
    Get paginated list of field options for a specific entity and field.

    Field options are admin-configurable dropdown/select values used throughout
    the application (e.g., wine types for persons, priority levels for gifts).

    Filters:
    - entity: Required entity type (person, gift, occasion, list)
    - field_name: Required field name within the entity
    - include_inactive: Whether to include soft-deleted options (default: false)

    Pagination:
    - skip: Number of records to skip (default: 0)
    - limit: Maximum records to return (1-1000, default: 100)

    Args:
        entity: Entity type (person, gift, occasion, list)
        field_name: Field name (wine_types, priority, etc.)
        include_inactive: Include soft-deleted options (default: False)
        skip: Pagination offset (default: 0)
        limit: Page size 1-1000 (default: 100)
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        FieldOptionListResponse with options list, total count, skip, and limit

    Example:
        ```json
        GET /field-options?entity=person&field_name=wine_types&limit=50
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        {
            "options": [
                {
                    "id": 1,
                    "entity": "person",
                    "field_name": "wine_types",
                    "label": "Red Wine",
                    "order": 1,
                    "is_active": true,
                    "created_at": "2025-12-21T12:00:00Z",
                    "updated_at": "2025-12-21T12:00:00Z"
                },
                {
                    "id": 2,
                    "entity": "person",
                    "field_name": "wine_types",
                    "label": "White Wine",
                    "order": 2,
                    "is_active": true,
                    "created_at": "2025-12-21T12:00:00Z",
                    "updated_at": "2025-12-21T12:00:00Z"
                }
            ],
            "total": 2,
            "skip": 0,
            "limit": 50
        }
        ```

    Example queries:
        - All wine types: GET /field-options?entity=person&field_name=wine_types
        - With inactive: GET /field-options?entity=person&field_name=wine_types&include_inactive=true
        - Paginated: GET /field-options?entity=gift&field_name=priority&skip=10&limit=20
    """
    service = FieldOptionService(db)
    return await service.get_options(
        entity=entity,
        field_name=field_name,
        include_inactive=include_inactive,
        skip=skip,
        limit=limit,
    )


@router.post(
    "",
    response_model=FieldOptionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new field option",
    description="Create a new option for an entity field",
)
async def create_field_option(
    data: FieldOptionCreate,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FieldOptionResponse:
    """
    Create a new field option.

    Creates a new selectable option for a specific entity field.
    The order field determines display order in dropdowns.

    Args:
        data: Field option creation data (entity, field_name, label, order)
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        FieldOptionResponse with created option details

    Example:
        ```json
        POST /field-options
        Headers: Authorization: Bearer eyJhbGc...
        {
            "entity": "person",
            "field_name": "wine_types",
            "label": "Sparkling Wine",
            "order": 3
        }

        Response 201:
        {
            "id": 3,
            "entity": "person",
            "field_name": "wine_types",
            "label": "Sparkling Wine",
            "order": 3,
            "is_active": true,
            "created_at": "2025-12-21T12:00:00Z",
            "updated_at": "2025-12-21T12:00:00Z"
        }
        ```

    Note:
        - All fields are required
        - Order determines display position (lower numbers first)
        - Duplicate labels for same entity/field_name are allowed
        - New options are active by default (is_active=true)
    """
    service = FieldOptionService(db)
    return await service.create_option(data, current_user_id=current_user_id)


@router.get(
    "/{option_id}",
    response_model=FieldOptionResponse,
    status_code=status.HTTP_200_OK,
    summary="Get field option by ID",
    description="Retrieve a specific field option by its ID",
)
async def get_field_option(
    option_id: int,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FieldOptionResponse:
    """
    Get a field option by ID.

    Args:
        option_id: Field option ID to retrieve
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        FieldOptionResponse with option details

    Raises:
        HTTPException: 404 if field option not found

    Example:
        ```json
        GET /field-options/3
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        {
            "id": 3,
            "entity": "person",
            "field_name": "wine_types",
            "label": "Sparkling Wine",
            "order": 3,
            "is_active": true,
            "created_at": "2025-12-21T12:00:00Z",
            "updated_at": "2025-12-21T12:00:00Z"
        }
        ```
    """
    service = FieldOptionService(db)
    return await service.get_option(option_id)


@router.put(
    "/{option_id}",
    response_model=FieldOptionResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a field option",
    description="Update an existing field option (label and order only)",
)
async def update_field_option(
    option_id: int,
    data: FieldOptionUpdate,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FieldOptionResponse:
    """
    Update an existing field option.

    Only label and order can be updated. Entity and field_name are immutable
    after creation to maintain data integrity.

    Args:
        option_id: Field option ID to update
        data: Update data (label and/or order, all fields optional)
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        Updated FieldOptionResponse

    Raises:
        HTTPException: 404 if field option not found

    Example:
        ```json
        PUT /field-options/3
        Headers: Authorization: Bearer eyJhbGc...
        {
            "label": "Champagne & Sparkling",
            "order": 1
        }

        Response 200:
        {
            "id": 3,
            "entity": "person",
            "field_name": "wine_types",
            "label": "Champagne & Sparkling",
            "order": 1,
            "is_active": true,
            "created_at": "2025-12-21T12:00:00Z",
            "updated_at": "2025-12-21T12:30:00Z"
        }
        ```

    Note:
        - Only provided fields are updated (partial update)
        - Missing/null fields are left unchanged
        - Cannot change entity or field_name (immutable)
        - Returns 404 if field option not found
    """
    service = FieldOptionService(db)
    return await service.update_option(option_id, data, current_user_id=current_user_id)


@router.delete(
    "/{option_id}",
    response_model=FieldOptionDeleteResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete a field option",
    description="Delete a field option (soft delete by default, hard delete optional)",
)
async def delete_field_option(
    option_id: int,
    hard_delete: bool = Query(False, description="Perform hard delete instead of soft delete"),
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FieldOptionDeleteResponse:
    """
    Delete a field option by ID.

    Supports both soft delete (default) and hard delete:
    - Soft delete: Sets is_active=False, preserves data
    - Hard delete: Permanently removes from database

    Soft delete is recommended to maintain data integrity for existing references.

    Args:
        option_id: Field option ID to delete
        hard_delete: If True, permanently delete; if False, soft delete (default: False)
        current_user_id: Authenticated user ID (from JWT)
        db: Database session (injected)

    Returns:
        FieldOptionDeleteResponse with success status and delete type

    Raises:
        HTTPException: 404 if field option not found

    Examples:
        Soft delete (default):
        ```json
        DELETE /field-options/3
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        {
            "success": true,
            "deleted_id": 3,
            "hard_deleted": false
        }
        ```

        Hard delete:
        ```json
        DELETE /field-options/3?hard_delete=true
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        {
            "success": true,
            "deleted_id": 3,
            "hard_deleted": true
        }
        ```

    Note:
        - Soft delete (default) preserves data, sets is_active=False
        - Hard delete permanently removes record
        - Returns 404 if field option not found
        - Consider cascade effects when hard deleting
    """
    service = FieldOptionService(db)
    return await service.delete_option(option_id, hard_delete=hard_delete, current_user_id=current_user_id)
