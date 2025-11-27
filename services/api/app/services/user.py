"""User service for authentication and profile management."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user import UserRepository
from app.schemas.user import TokenResponse, UserCreate, UserResponse, UserUpdate
from app.services.auth import AuthService


class UserService:
    """
    User service handling registration, authentication, and profile management.

    Converts ORM models to DTOs. Never returns password_hash.

    Example:
        ```python
        async with async_session() as session:
            service = UserService(session)
            user = await service.create(UserCreate(email="...", password="..."))
        ```
    """

    def __init__(self, session: AsyncSession) -> None:
        """
        Initialize user service with database session.

        Args:
            session: SQLAlchemy async session for database operations
        """
        self.session = session
        self.repo = UserRepository(session)
        self.auth = AuthService()

    async def create(self, data: UserCreate) -> UserResponse:
        """
        Register a new user with email and password.

        Validates email uniqueness, hashes password, and creates user record.
        Never stores plain text passwords.

        Args:
            data: User registration data (email and password)

        Returns:
            UserResponse DTO with user details (no password_hash)

        Raises:
            ValueError: If email already exists

        Example:
            ```python
            user = await service.create(UserCreate(
                email="alice@example.com",
                password="secure_password_123"
            ))
            print(f"Created user: {user.email}")
            ```

        Note:
            Password is hashed using bcrypt before storage.
            Email uniqueness is enforced at application and database level.
        """
        # Validate email uniqueness
        if await self.repo.exists_by_email(data.email):
            raise ValueError(f"Email already registered: {data.email}")

        # Hash password before storage
        password_hash = self.auth.hash_password(data.password)

        # Create user in database
        user = await self.repo.create(
            {"email": data.email, "password_hash": password_hash}
        )

        # Convert ORM model to DTO
        return UserResponse(
            id=user.id,
            email=user.email,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )

    async def authenticate(
        self, email: str, password: str
    ) -> tuple[UserResponse, TokenResponse] | None:
        """
        Authenticate user with email and password, returning user and JWT token.

        Verifies password against stored hash and generates access token on success.

        Args:
            email: User email address
            password: Plain text password to verify

        Returns:
            Tuple of (UserResponse, TokenResponse) if authentication succeeds,
            None if credentials are invalid

        Example:
            ```python
            result = await service.authenticate(
                email="alice@example.com",
                password="secure_password_123"
            )

            if result:
                user, token = result
                print(f"Login successful: {user.email}")
                print(f"Token: {token.access_token}")
            else:
                print("Invalid credentials")
            ```

        Note:
            - Returns None (not exception) for invalid credentials
            - Token expires in 24 hours by default
            - Password verification uses constant-time comparison
        """
        # Get user by email
        user = await self.repo.get_by_email(email)
        if user is None:
            return None

        # Verify password
        if not self.auth.verify_password(password, user.password_hash):
            return None

        # Generate JWT token
        access_token = self.auth.create_access_token(user_id=user.id)

        # Convert ORM model to DTO
        user_dto = UserResponse(
            id=user.id,
            email=user.email,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )

        # Create token response (24 hours = 86400 seconds)
        token_dto = TokenResponse(access_token=access_token, expires_in=86400)

        return user_dto, token_dto

    async def get(self, user_id: int) -> UserResponse | None:
        """
        Get user by ID.

        Args:
            user_id: User ID to retrieve

        Returns:
            UserResponse DTO if found, None otherwise

        Example:
            ```python
            user = await service.get(user_id=42)
            if user:
                print(f"Found user: {user.email}")
            else:
                print("User not found")
            ```

        Note:
            Never returns password_hash field.
        """
        user = await self.repo.get(user_id)
        if user is None:
            return None

        return UserResponse(
            id=user.id,
            email=user.email,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )

    async def get_by_email(self, email: str) -> UserResponse | None:
        """
        Get user by email address.

        Args:
            email: Email address to search for (case-sensitive)

        Returns:
            UserResponse DTO if found, None otherwise

        Example:
            ```python
            user = await service.get_by_email("alice@example.com")
            if user:
                print(f"Found user ID: {user.id}")
            ```

        Note:
            Email comparison is case-sensitive.
            Never returns password_hash field.
        """
        user = await self.repo.get_by_email(email)
        if user is None:
            return None

        return UserResponse(
            id=user.id,
            email=user.email,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )

    async def update(self, user_id: int, data: UserUpdate) -> UserResponse | None:
        """
        Update user profile.

        Currently supports updating email address only.
        Future: Add profile fields (name, avatar_url, etc.)

        Args:
            user_id: User ID to update
            data: Update data (currently only email)

        Returns:
            Updated UserResponse DTO if user found, None otherwise

        Raises:
            ValueError: If new email already exists for different user

        Example:
            ```python
            user = await service.update(
                user_id=42,
                data=UserUpdate(email="newemail@example.com")
            )
            if user:
                print(f"Updated email: {user.email}")
            ```

        Note:
            - Only updates provided fields (partial update)
            - Email uniqueness is validated before update
            - Returns None if user not found
        """
        # Check user exists
        existing_user = await self.repo.get(user_id)
        if existing_user is None:
            return None

        # Build update dict (only non-None fields)
        update_data = {}
        if data.email is not None:
            # Validate email uniqueness (if changing)
            if data.email != existing_user.email:
                if await self.repo.exists_by_email(data.email):
                    raise ValueError(f"Email already registered: {data.email}")
            update_data["email"] = data.email

        # Update user if there are changes
        if update_data:
            updated_user = await self.repo.update(user_id, update_data)
            if updated_user is None:
                # Should not happen since we checked existence, but handle gracefully
                return None
            user = updated_user
        else:
            user = existing_user

        # Convert ORM model to DTO
        return UserResponse(
            id=user.id,
            email=user.email,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
