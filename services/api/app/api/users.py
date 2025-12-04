"""User management API routes for profile and account management."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.core.exceptions import NotFoundError
from app.schemas.user import UserResponse, UserUpdate
from app.services.user import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Retrieve authenticated user's profile information",
)
async def get_current_user_profile(
    user_id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Get current authenticated user's profile.

    Returns the profile of the currently authenticated user. This is a convenience
    endpoint that mirrors /auth/me functionality for consistency with user management routes.

    Args:
        user_id: Current authenticated user ID (from JWT, injected)
        session: Database session (injected)

    Returns:
        UserResponse with user profile (id, email, created_at, updated_at)

    Raises:
        HTTPException: 401 if token is invalid or user not found

    Example:
        ```json
        GET /users/me
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        {
            "id": 1,
            "email": "alice@example.com",
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:00:00Z"
        }
        ```

    Note:
        - Requires valid Bearer token in Authorization header
        - Never returns password_hash field
        - Functionally equivalent to GET /auth/me
    """
    service = UserService(session)

    # Get user profile by ID from token
    user = await service.get(user_id)

    if user is None:
        # Should not happen if token is valid, but handle gracefully
        raise NotFoundError(
            code="USER_NOT_FOUND",
            message="Authenticated user not found in database",
        )

    return user


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user by ID",
    description="Retrieve a user's profile information by user ID",
)
async def get_user_by_id(
    user_id: int,
    current_user_id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Get user profile by ID.

    Retrieves profile information for any user in the system. Since this is a
    family app with 2-3 users, no ownership restrictions are enforced.

    Args:
        user_id: User ID to retrieve
        current_user_id: Current authenticated user ID (validates auth, not used for access control)
        session: Database session (injected)

    Returns:
        UserResponse with user profile (id, email, created_at, updated_at)

    Raises:
        HTTPException: 401 if token is invalid
        HTTPException: 404 if user not found

    Example:
        ```json
        GET /users/2
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        {
            "id": 2,
            "email": "bob@example.com",
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:00:00Z"
        }

        Response 404:
        {
            "error": {
                "code": "USER_NOT_FOUND",
                "message": "User with ID 999 not found",
                "trace_id": "..."
            }
        }
        ```

    Note:
        - Requires valid Bearer token in Authorization header
        - No ownership checks (family app with 2-3 users)
        - Never returns password_hash field
    """
    service = UserService(session)

    # Get user by ID
    user = await service.get(user_id)

    if user is None:
        raise NotFoundError(
            code="USER_NOT_FOUND",
            message=f"User with ID {user_id} not found",
        )

    return user


@router.put(
    "/{user_id}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update user profile",
    description="Update a user's profile information (currently supports email updates)",
)
async def update_user(
    user_id: int,
    data: UserUpdate,
    current_user_id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Update user profile.

    Updates a user's profile information. Currently supports updating email address.
    Future versions will support additional profile fields (name, avatar_url, etc.).

    Args:
        user_id: User ID to update
        data: Update data (email and/or other future profile fields)
        current_user_id: Current authenticated user ID (validates auth, not used for access control)
        session: Database session (injected)

    Returns:
        Updated UserResponse with modified profile

    Raises:
        HTTPException: 401 if token is invalid
        HTTPException: 404 if user not found
        HTTPException: 400 if email already exists or validation fails

    Example:
        ```json
        PUT /users/1
        Headers: Authorization: Bearer eyJhbGc...
        Content-Type: application/json

        Request:
        {
            "email": "newemail@example.com"
        }

        Response 200:
        {
            "id": 1,
            "email": "newemail@example.com",
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:00:00Z"
        }

        Response 404:
        {
            "error": {
                "code": "USER_NOT_FOUND",
                "message": "User with ID 999 not found",
                "trace_id": "..."
            }
        }

        Response 400 (duplicate email):
        {
            "error": {
                "code": "DUPLICATE_EMAIL",
                "message": "Email already registered: existing@example.com",
                "trace_id": "..."
            }
        }
        ```

    Note:
        - Requires valid Bearer token in Authorization header
        - No ownership checks (family app with 2-3 users)
        - Email uniqueness is enforced across the system
        - Only non-None fields are updated (partial updates supported)
    """
    service = UserService(session)

    # Check user exists first
    existing_user = await service.get(user_id)
    if existing_user is None:
        raise NotFoundError(
            code="USER_NOT_FOUND",
            message=f"User with ID {user_id} not found",
        )

    # Attempt to update user
    try:
        updated_user = await service.update(user_id, data)

        if updated_user is None:
            # Should not happen since we checked existence, but handle gracefully
            raise NotFoundError(
                code="USER_NOT_FOUND",
                message=f"User with ID {user_id} not found",
            )

        return updated_user

    except ValueError as e:
        # Service raises ValueError for duplicate email
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation failed: {str(e)}",
        ) from e


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete user account",
    description="Delete a user account and all associated data",
)
async def delete_user(
    user_id: int,
    current_user_id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> None:
    """
    Delete user account.

    Permanently deletes a user account and all associated data. This operation
    is irreversible and should be used with caution.

    Args:
        user_id: User ID to delete
        current_user_id: Current authenticated user ID (validates auth, not used for access control)
        session: Database session (injected)

    Raises:
        HTTPException: 401 if token is invalid
        HTTPException: 404 if user not found

    Example:
        ```json
        DELETE /users/1
        Headers: Authorization: Bearer eyJhbGc...

        Response 204: (No Content)

        Response 404:
        {
            "error": {
                "code": "USER_NOT_FOUND",
                "message": "User with ID 999 not found",
                "trace_id": "..."
            }
        }
        ```

    Note:
        - Requires valid Bearer token in Authorization header
        - No ownership checks (family app with 2-3 users)
        - Deletion is permanent and irreversible
        - Returns 204 No Content on success
        - Returns 404 if user does not exist
    """
    service = UserService(session)

    # Check user exists first
    user = await service.get(user_id)
    if user is None:
        raise NotFoundError(
            code="USER_NOT_FOUND",
            message=f"User with ID {user_id} not found",
        )

    # Delete user
    await service.delete(user_id)

    # Return 204 No Content (implicitly None)
