"""Authentication API routes for user registration and login."""

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import apple_throttle
from app.core.apple_auth import (
    AppleTokenVerifier,
    InvalidAppleCredentialsError,
    get_apple_token_verifier,
)
from app.core.apple_throttle import authenticated_subject, throttle_apple
from app.core.deps import get_current_user, get_db
from app.core.exceptions import UnauthorizedError, ValidationError
from app.schemas.user import (
    AppleChallengeResponse,
    AppleLogin,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)
from app.services.apple_challenge import AppleChallengeService
from app.services.auth import AuthService
from app.services.user import UserService, require_registration_open

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
    "/apple/challenge",
    response_model=AppleChallengeResponse,
    dependencies=[Depends(throttle_apple)],
    summary="Issue an Apple sign-in challenge",
)
async def apple_challenge(session: AsyncSession = Depends(get_db)) -> AppleChallengeResponse:
    return await AppleChallengeService(session).issue()


@router.post(
    "/apple",
    response_model=LoginResponse,
    summary="Sign in with Apple",
)
async def login_with_apple(
    credentials: AppleLogin,
    request: Request,
    session: AsyncSession = Depends(get_db),
    verifier: AppleTokenVerifier = Depends(get_apple_token_verifier),
) -> LoginResponse:
    verified_subject = False
    signed_in_subject = authenticated_subject(request)

    def throttle_verified(subject: str) -> None:
        nonlocal verified_subject
        verified_subject = True
        apple_throttle.apple_limiter.check(signed_in_subject or f"apple:{subject}")

    try:
        identity = await verifier.verify(
            credentials.identity_token,
            credentials.nonce,
            on_subject=throttle_verified,
        )
    except InvalidAppleCredentialsError:
        if not verified_subject:
            apple_throttle.apple_limiter.check(None)
        await AppleChallengeService(session).consume(credentials.nonce)
        raise
    await AppleChallengeService(session).consume(credentials.nonce)
    result = await UserService(session).authenticate_apple(identity)
    if result is None:
        raise InvalidAppleCredentialsError()

    user, token = result
    return LoginResponse(**user.model_dump(), token=token)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_registration_open)],
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
