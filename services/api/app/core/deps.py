"""FastAPI dependency injection functions."""

from collections.abc import AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db as _get_db
from app.core.exceptions import UnauthorizedError
from app.services.auth import AuthService

# Re-export get_db for convenience
get_db = _get_db

# OAuth2 scheme for extracting Bearer tokens from Authorization header
oauth2_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPBearer = Depends(oauth2_scheme),
) -> int:
    """
    FastAPI dependency that validates JWT token and returns current user ID.

    Extracts the Bearer token from the Authorization header, validates it using
    AuthService, and returns the authenticated user's ID.

    Args:
        credentials: HTTPBearer credentials containing the JWT token

    Returns:
        User ID extracted from valid JWT token

    Raises:
        HTTPException: 401 if token is missing, invalid, or expired

    Example:
        ```python
        @router.get("/me")
        async def get_profile(user_id: int = Depends(get_current_user)):
            # user_id is validated and extracted from JWT
            return {"user_id": user_id}
        ```

    Note:
        This dependency should be used on all protected routes that require
        authentication. It will automatically return a 401 error if the token
        is invalid or missing.
    """
    auth_service = AuthService()
    token = credentials.credentials

    user_id = auth_service.decode_token(token)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_id


__all__ = ["get_db", "get_current_user", "oauth2_scheme"]
