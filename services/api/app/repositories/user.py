"""User repository with authentication-specific queries."""

from sqlalchemy import exists, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """
    User repository extending BaseRepository with authentication queries.

    Provides specialized methods for user authentication and registration flows:
    - Email-based lookup for login
    - Email existence checks for registration validation

    Example:
        ```python
        # Get user for login
        user = await repo.get_by_email("user@example.com")
        if user and verify_password(password, user.password_hash):
            # Login success

        # Check email availability during registration
        if await repo.exists_by_email("new@example.com"):
            raise ValueError("Email already registered")
        ```
    """

    def __init__(self, session: AsyncSession):
        """
        Initialize user repository with async database session.

        Args:
            session: SQLAlchemy async session for database operations
        """
        super().__init__(session, User)

    async def get_by_email(self, email: str) -> User | None:
        """
        Get user by email address (for login).

        Uses indexed email column for efficient lookup. Case-sensitive comparison
        matches the unique constraint on the email field.

        Args:
            email: Email address to search for (case-sensitive)

        Returns:
            User instance if found, None otherwise

        Example:
            ```python
            user = await repo.get_by_email("alice@example.com")
            if user:
                print(f"Found user: {user.email}")
            else:
                print("User not found")
            ```

        Note:
            Email comparison is case-sensitive. Normalize email before calling
            this method if case-insensitive lookup is desired.
        """
        stmt = select(User).where(User.email == email)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def exists_by_email(self, email: str) -> bool:
        """
        Check if email exists (for registration validation).

        Efficient existence check using SQL EXISTS clause, which stops at the
        first match and doesn't retrieve the full record. More performant than
        get_by_email() when only checking existence.

        Args:
            email: Email address to check (case-sensitive)

        Returns:
            True if email exists in database, False otherwise

        Example:
            ```python
            # During registration flow
            if await repo.exists_by_email("new@example.com"):
                raise ValueError("Email already registered")

            # Proceed with user creation
            user = await repo.create({
                "email": "new@example.com",
                "password_hash": hashed_password
            })
            ```

        Performance:
            Uses SQL EXISTS which is more efficient than COUNT or full SELECT
            for large tables, as it stops at the first match.
        """
        stmt = select(exists().where(User.email == email))
        result = await self.session.execute(stmt)
        return result.scalar()
