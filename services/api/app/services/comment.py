"""Comment service for polymorphic comments on entities."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.comment import CommentParentType
from app.repositories.comment import CommentRepository
from app.schemas.comment import CommentCreate, CommentResponse, CommentUpdate


class CommentService:
    """
    Comment service handling polymorphic comments on various entities.

    Converts ORM models to DTOs. Supports comments on multiple parent types:
    list_item, list, occasion, person.

    Example:
        ```python
        async with async_session() as session:
            service = CommentService(session)
            comment = await service.create(
                author_id=1,
                data=CommentCreate(
                    content="Great gift idea!",
                    parent_type=CommentParentType.list_item,
                    parent_id=123
                )
            )
        ```
    """

    def __init__(self, session: AsyncSession) -> None:
        """
        Initialize comment service with database session.

        Args:
            session: SQLAlchemy async session for database operations
        """
        self.session = session
        self.repo = CommentRepository(session)

    async def create(
        self, author_id: int, data: CommentCreate
    ) -> CommentResponse:
        """
        Create a new comment on a parent entity.

        Sets author_id from the authenticated user. Parent entity validation
        is best-effort (service trusts parent_id exists).

        Args:
            author_id: ID of the user creating the comment
            data: Comment creation data (content, parent_type, parent_id)

        Returns:
            CommentResponse DTO with created comment details

        Example:
            ```python
            comment = await service.create(
                author_id=42,
                data=CommentCreate(
                    content="This is perfect!",
                    parent_type=CommentParentType.list,
                    parent_id=5
                )
            )
            print(f"Comment created: {comment.id}")
            ```

        Note:
            - author_id is set from authenticated user (not from request body)
            - Parent entity existence is NOT validated (polymorphic reference)
            - Frontend should ensure parent_id is valid before creating comment
        """
        # Create comment in database
        comment = await self.repo.create(
            {
                "content": data.content,
                "parent_type": data.parent_type,
                "parent_id": data.parent_id,
                "author_id": author_id,
            }
        )

        # Convert ORM model to DTO
        return CommentResponse(
            id=comment.id,
            content=comment.content,
            author_id=comment.author_id,
            parent_type=comment.parent_type,
            parent_id=comment.parent_id,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
        )

    async def get(self, comment_id: int) -> CommentResponse | None:
        """
        Get comment by ID.

        Args:
            comment_id: Comment ID to retrieve

        Returns:
            CommentResponse DTO if found, None otherwise

        Example:
            ```python
            comment = await service.get(comment_id=123)
            if comment:
                print(f"Comment: {comment.content}")
            else:
                print("Comment not found")
            ```

        Note:
            Uses get_with_author() from repository to eager load author relationship.
        """
        comment = await self.repo.get_with_author(comment_id)
        if comment is None:
            return None

        return CommentResponse(
            id=comment.id,
            content=comment.content,
            author_id=comment.author_id,
            parent_type=comment.parent_type,
            parent_id=comment.parent_id,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
        )

    async def get_for_parent(
        self, parent_type: CommentParentType, parent_id: int
    ) -> list[CommentResponse]:
        """
        Get all comments for a specific parent entity.

        Fetches all comments attached to a given parent (list, list_item, etc.)
        ordered by created_at descending (newest first).

        Args:
            parent_type: Type of parent entity (from CommentParentType enum)
            parent_id: ID of the parent entity

        Returns:
            List of CommentResponse DTOs, empty list if no comments exist

        Example:
            ```python
            # Get all comments for a list
            comments = await service.get_for_parent(
                parent_type=CommentParentType.list,
                parent_id=5
            )

            for comment in comments:
                print(f"{comment.author_id}: {comment.content}")
            ```

        Note:
            - Returns empty list if no comments found (not None)
            - Comments are ordered newest first
            - Author relationship is eager loaded for efficiency
        """
        comments = await self.repo.get_for_parent(parent_type, parent_id)

        # Convert ORM models to DTOs
        return [
            CommentResponse(
                id=comment.id,
                content=comment.content,
                author_id=comment.author_id,
                parent_type=comment.parent_type,
                parent_id=comment.parent_id,
                created_at=comment.created_at,
                updated_at=comment.updated_at,
            )
            for comment in comments
        ]

    async def update(
        self, comment_id: int, data: CommentUpdate
    ) -> CommentResponse | None:
        """
        Update comment content.

        Currently only supports updating content field. Future: support
        editing metadata or adding reactions.

        Args:
            comment_id: Comment ID to update
            data: Update data (currently only content)

        Returns:
            Updated CommentResponse DTO if comment found, None otherwise

        Example:
            ```python
            comment = await service.update(
                comment_id=123,
                data=CommentUpdate(content="Updated comment text")
            )
            if comment:
                print(f"Updated: {comment.content}")
            ```

        Note:
            - Only updates content field (partial update)
            - Returns None if comment not found
            - Author validation should be done at router level
        """
        # Check comment exists
        existing_comment = await self.repo.get(comment_id)
        if existing_comment is None:
            return None

        # Update comment
        updated_comment = await self.repo.update(
            comment_id, {"content": data.content}
        )
        if updated_comment is None:
            # Should not happen since we checked existence
            return None

        # Convert ORM model to DTO
        return CommentResponse(
            id=updated_comment.id,
            content=updated_comment.content,
            author_id=updated_comment.author_id,
            parent_type=updated_comment.parent_type,
            parent_id=updated_comment.parent_id,
            created_at=updated_comment.created_at,
            updated_at=updated_comment.updated_at,
        )

    async def delete(self, comment_id: int) -> bool:
        """
        Delete comment by ID.

        Permanently removes comment from database. Author validation
        should be done at router level.

        Args:
            comment_id: Comment ID to delete

        Returns:
            True if comment was deleted, False if comment not found

        Example:
            ```python
            deleted = await service.delete(comment_id=123)
            if deleted:
                print("Comment deleted successfully")
            else:
                print("Comment not found")
            ```

        Note:
            - Returns False (not exception) if comment doesn't exist
            - Cascade behavior depends on database constraints
            - Author authorization should be enforced at router level
        """
        return await self.repo.delete(comment_id)
