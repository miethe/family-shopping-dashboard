"""Authentication API routes for user registration and login."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.core.exceptions import UnauthorizedError, ValidationError
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserResponse
from app.services.auth import AuthService
from app.services.user import UserService

router = APIRouter(prefix="/auth", tags=["authentication"])


class LoginResponse(UserResponse):
    """Response schema for successful login (user + token)."""

    token: TokenResponse


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and return JWT token",
    description="Validate email and password, return user profile and JWT token on success",
)
async def login(
    credentials: UserLogin,
    session: AsyncSession = Depends(get_db),
) -> LoginResponse:
    """
    Authenticate user with email and password.

    Args:
        credentials: User login credentials (email and password)
        session: Database session (injected)

    Returns:
        LoginResponse containing user profile and JWT token

    Raises:
        HTTPException: 401 if credentials are invalid

    Example:
        ```json
        POST /auth/login
        {
            "email": "alice@example.com",
            "password": "secure_password_123"
        }

        Response 200:
        {
            "id": 1,
            "email": "alice@example.com",
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:00:00Z",
            "token": {
                "access_token": "eyJhbGc...",
                "token_type": "bearer",
                "expires_in": 86400
            }
        }
        ```
    """
    service = UserService(session)

    # Authenticate user (returns (UserResponse, TokenResponse) or None)
    result = await service.authenticate(credentials.email, credentials.password)

    if result is None:
        raise UnauthorizedError(
            code="INVALID_CREDENTIALS",
            message="Invalid email or password",
        )

    user, token = result

    # Return combined response (user fields + token field)
    return LoginResponse(
        id=user.id,
        email=user.email,
        created_at=user.created_at,
        updated_at=user.updated_at,
        token=token,
    )


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user account",
    description="Create new user with email and password (hashed before storage)",
)
async def register(
    data: UserCreate,
    session: AsyncSession = Depends(get_db),
) -> UserResponse:
    """
    Register a new user account.

    Args:
        data: User registration data (email and password)
        session: Database session (injected)

    Returns:
        UserResponse with created user profile (no password)

    Raises:
        HTTPException: 400 if email already exists

    Example:
        ```json
        POST /auth/register
        {
            "email": "alice@example.com",
            "password": "secure_password_123"
        }

        Response 201:
        {
            "id": 1,
            "email": "alice@example.com",
            "created_at": "2025-11-26T12:00:00Z",
            "updated_at": "2025-11-26T12:00:00Z"
        }
        ```

    Note:
        - Password is hashed using bcrypt before storage
        - Email uniqueness is enforced
        - Never returns password_hash in response
    """
    service = UserService(session)

    try:
        user = await service.create(data)
        return user

    except ValueError as e:
        # Service raises ValueError for duplicate email
        raise ValidationError(
            code="DUPLICATE_EMAIL",
            message=str(e),
        ) from e


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh JWT token",
    description="Generate new JWT token for authenticated user (extend session)",
)
async def refresh_token(
    user_id: int = Depends(get_current_user),
) -> TokenResponse:
    """
    Refresh JWT token for authenticated user.

    Generates a new JWT token with fresh expiration time, allowing users
    to extend their session without re-entering credentials.

    Args:
        user_id: Current authenticated user ID (from JWT, injected)

    Returns:
        TokenResponse with new JWT token

    Raises:
        HTTPException: 401 if token is invalid or expired

    Example:
        ```json
        POST /auth/refresh
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        {
            "access_token": "eyJhbGc...",
            "token_type": "bearer",
            "expires_in": 86400
        }
        ```

    Note:
        Requires valid Bearer token in Authorization header.
        New token will have fresh 24-hour expiration.
    """
    auth_service = AuthService()

    # Create new token for authenticated user
    access_token = auth_service.create_access_token(user_id=user_id)

    # Return new token response (24 hours = 86400 seconds)
    return TokenResponse(access_token=access_token, expires_in=86400)


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

    Args:
        user_id: Current authenticated user ID (from JWT, injected)
        session: Database session (injected)

    Returns:
        UserResponse with user profile

    Raises:
        HTTPException: 401 if token is invalid or user not found

    Example:
        ```json
        GET /auth/me
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
        Requires valid Bearer token in Authorization header.
        Never returns password_hash field.
    """
    service = UserService(session)

    # Get user profile by ID from token
    user = await service.get(user_id)

    if user is None:
        # Should not happen if token is valid, but handle gracefully
        raise UnauthorizedError(
            code="USER_NOT_FOUND",
            message="Authenticated user not found in database",
        )

    return user
