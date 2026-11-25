"""User repository with authentication-specific queries."""

from sqlalchemy import exists, func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import lazyload

from app.core.apple_auth import AppleNotHouseholdError
from app.core.config import settings
from app.models.user import UNUSABLE_PASSWORD_HASH, User
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

    async def resolve_apple_user(self, subject: str, verified_email: str | None) -> User | None:
        """Resolve a linked subject, or atomically link/create with a verified Apple email."""
        for _ in range(2):
            try:
                return await self._resolve_apple_user(subject, verified_email)
            except IntegrityError:
                # A concurrent insert or link can win either unique index. Re-read its result.
                await self.session.rollback()
        return await self._get_by_apple_subject(subject)

    async def _resolve_apple_user(self, subject: str, verified_email: str | None) -> User | None:
        user = await self._get_by_apple_subject(subject)
        if user is not None:
            return user
        if verified_email is None:
            return None
        if verified_email.lower() not in settings.apple_household_emails:
            raise AppleNotHouseholdError()

        email = verified_email.lower()
        email_matches = func.lower(User.email) == email
        matches = (await self.session.scalars(select(User.id).where(email_matches).limit(2))).all()
        if len(matches) > 1:
            return None
        if not matches:
            return await self.create(
                {
                    "email": email,
                    "password_hash": UNUSABLE_PASSWORD_HASH,
                    "apple_subject": subject,
                }
            )

        link = (
            update(User)
            .where(User.id == matches[0], User.apple_subject.is_(None), email_matches)
            .values(apple_subject=subject)
            .returning(User)
            .options(lazyload("*"))
        )
        user = (await self.session.scalars(link)).one_or_none()
        if user is None:
            # A concurrent request may have linked this subject already. Never replace a binding.
            return await self._get_by_apple_subject(subject)
        await self.session.commit()
        return user

    async def _get_by_apple_subject(self, subject: str) -> User | None:
        query = select(User).where(User.apple_subject == subject).options(lazyload("*"))
        return (await self.session.scalars(query)).one_or_none()

    async def exists_by_email(self, email: str, *, case_sensitive: bool = True) -> bool:
        """
        Check if email exists (for registration validation).

        Efficient existence check using SQL EXISTS clause, which stops at the
        first match and doesn't retrieve the full record. More performant than
        get_by_email() when only checking existence.

        Args:
            email: Email address to check
            case_sensitive: Whether the email must match the stored case

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
        email_column = User.email if case_sensitive else func.lower(User.email)
        stmt = select(exists().where(email_column == (email if case_sensitive else email.lower())))
        result = await self.session.execute(stmt)
        return result.scalar()
