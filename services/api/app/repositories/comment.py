"""Comment repository with polymorphic parent queries."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.comment import Comment, CommentParentType
from app.models.user import User
from app.repositories.base import BaseRepository


class CommentRepository(BaseRepository[Comment]):
    """
    Comment repository with polymorphic parent relationship queries.

    Extends BaseRepository with comment-specific queries for:
    - Fetching comments by parent entity (polymorphic query)
    - Fetching all comments by a specific author
    - Eager loading author relationship for efficient queries

    Example:
        ```python
        repo = CommentRepository(session)

        # Get all comments for a specific list
        list_comments = await repo.get_for_parent(
            CommentParentType.list, list_id=123
        )

        # Get all comments by a user
        user_comments = await repo.get_by_author(author_id=456)

        # Get comment with author data
        comment = await repo.get_with_author(comment_id=789)
        print(comment.author.name)
        ```
    """

    def __init__(self, session: AsyncSession):
        """
        Initialize comment repository with database session.

        Args:
            session: SQLAlchemy async session
        """
        super().__init__(session, Comment)

    async def get_for_parent(
        self, parent_type: CommentParentType, parent_id: int
    ) -> list[Comment]:
        """
        Get all comments for a specific parent entity.

        Uses polymorphic query pattern to fetch comments for any parent type
        (list_item, list, occasion, person). Returns comments ordered by
        created_at descending (newest first).

        Args:
            parent_type: Type of parent entity (from CommentParentType enum)
            parent_id: ID of the parent entity

        Returns:
            List of Comment instances with author relationship loaded.
            Empty list if no comments exist for this parent.

        Example:
            ```python
            # Get comments for a list
            comments = await repo.get_for_parent(
                CommentParentType.list, 123
            )

            # Get comments for a list item
            comments = await repo.get_for_parent(
                CommentParentType.list_item, 456
            )
            ```

        Note:
            parent_id is NOT a foreign key - it's a polymorphic reference.
            The caller is responsible for ensuring the parent entity exists.
        """
        stmt = (
            select(Comment)
            .where(Comment.parent_type == parent_type)
            .where(Comment.parent_id == parent_id)
            .order_by(Comment.created_at.desc())
            .options(selectinload(Comment.author))
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_author(self, author_id: int) -> list[Comment]:
        """
        Get all comments created by a specific user.

        Returns all comments authored by the specified user, ordered by
        created_at descending (newest first). Useful for user activity
        tracking and profile views.

        Args:
            author_id: Foreign key to User table

        Returns:
            List of Comment instances authored by the user.
            Empty list if user has no comments.

        Example:
            ```python
            # Get all comments by user 123
            user_comments = await repo.get_by_author(123)

            # Display user activity
            for comment in user_comments:
                print(f"{comment.parent_type}: {comment.content}")
            ```
        """
        stmt = (
            select(Comment)
            .where(Comment.author_id == author_id)
            .order_by(Comment.created_at.desc())
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_with_author(self, comment_id: int) -> Comment | None:
        """
        Get a single comment by ID with author relationship eager loaded.

        Efficiently fetches comment and author in a single query using
        selectinload. This avoids N+1 query issues when accessing
        comment.author attributes.

        Args:
            comment_id: Primary key of the comment

        Returns:
            Comment instance with author relationship loaded, or None if not found.

        Example:
            ```python
            comment = await repo.get_with_author(123)
            if comment:
                print(f"{comment.author.name}: {comment.content}")
            else:
                print("Comment not found")
            ```

        Note:
            The base repository get() method also loads author due to
            lazy="joined" in the Comment model, but this method is explicit
            and uses selectinload for better control over query execution.
        """
        stmt = (
            select(Comment)
            .where(Comment.id == comment_id)
            .options(selectinload(Comment.author))
        )

        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
