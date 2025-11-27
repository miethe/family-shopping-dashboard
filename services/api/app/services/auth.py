"""Authentication service for JWT tokens and password management."""

from datetime import datetime, timedelta, timezone
from typing import TYPE_CHECKING

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

if TYPE_CHECKING:
    pass


class AuthService:
    """
    Authentication service for JWT tokens and password management.

    Handles password hashing/verification using bcrypt and JWT token
    generation/validation using HS256 algorithm.

    Example:
        ```python
        auth = AuthService()
        hashed = auth.hash_password("my_password")
        is_valid = auth.verify_password("my_password", hashed)

        token = auth.create_access_token(user_id=42)
        user_id = auth.decode_token(token)  # Returns 42 or None
        ```

    Attributes:
        pwd_context: Passlib context configured for bcrypt hashing.
        algorithm: JWT signing algorithm (HS256).
        secret_key: Secret key for JWT signing from environment.
        default_expiry: Default token expiration time (24 hours).
    """

    def __init__(self) -> None:
        """Initialize authentication service with bcrypt and JWT settings."""
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.algorithm = "HS256"
        self.secret_key = settings.JWT_SECRET_KEY
        self.default_expiry = timedelta(hours=24)

    def hash_password(self, password: str) -> str:
        """
        Hash a plain text password using bcrypt.

        Args:
            password: Plain text password to hash.

        Returns:
            Bcrypt hashed password string (includes salt and cost factor).

        Example:
            ```python
            hashed = auth.hash_password("my_secure_password")
            # Returns: "$2b$12$..."
            ```
        """
        return self.pwd_context.hash(password)

    def verify_password(self, plain: str, hashed: str) -> bool:
        """
        Verify a plain text password against a bcrypt hash.

        Args:
            plain: Plain text password to verify.
            hashed: Bcrypt hashed password to check against.

        Returns:
            True if password matches hash, False otherwise.

        Example:
            ```python
            is_valid = auth.verify_password("my_password", hashed_password)
            if is_valid:
                # Proceed with login
                pass
            ```
        """
        return self.pwd_context.verify(plain, hashed)

    def create_access_token(
        self, user_id: int, expires_delta: timedelta | None = None
    ) -> str:
        """
        Create a JWT access token for a user.

        Args:
            user_id: ID of the user to create token for.
            expires_delta: Optional custom expiration time.
                          Defaults to 24 hours if not provided.

        Returns:
            Encoded JWT token string.

        Example:
            ```python
            # Default 24 hour expiry
            token = auth.create_access_token(user_id=42)

            # Custom 1 hour expiry
            token = auth.create_access_token(
                user_id=42,
                expires_delta=timedelta(hours=1)
            )
            ```

        Note:
            Token payload includes:
            - sub: user_id (as string, per JWT spec)
            - exp: expiration timestamp (UTC)
            - iat: issued at timestamp (UTC)
        """
        if expires_delta is None:
            expires_delta = self.default_expiry

        now = datetime.now(timezone.utc)
        expire = now + expires_delta

        payload = {
            "sub": str(user_id),  # JWT "subject" claim (user identifier)
            "exp": expire,  # Expiration time
            "iat": now,  # Issued at time
        }

        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def decode_token(self, token: str) -> int | None:
        """
        Decode and validate a JWT token, returning the user ID.

        Args:
            token: JWT token string to decode and validate.

        Returns:
            User ID if token is valid, None if invalid or expired.

        Example:
            ```python
            user_id = auth.decode_token(token)
            if user_id is None:
                # Token invalid or expired
                raise HTTPException(status_code=401)
            ```

        Note:
            Returns None (instead of raising exceptions) for:
            - Invalid signature
            - Expired tokens
            - Malformed tokens
            - Missing required claims
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            user_id_str: str | None = payload.get("sub")

            if user_id_str is None:
                return None

            return int(user_id_str)

        except (JWTError, ValueError):
            # JWTError: Invalid signature, expired, malformed
            # ValueError: user_id not convertible to int
            return None
