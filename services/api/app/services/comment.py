"""Comment service for polymorphic comments on entities with visibility."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenError
from app.models.comment import CommentParentType, CommentVisibility
from app.repositories.comment import CommentRepository
from app.schemas.comment import CommentCreate, CommentResponse, CommentUpdate


class CommentService:
    """
    Comment service handling polymorphic comments on various entities.

    Converts ORM models to DTOs. Supports comments on multiple parent types:
    list_item, list, occasion, person, gift.

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

    async def create(self, author_id: int, data: CommentCreate) -> CommentResponse:
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
                "visibility": data.visibility,
            }
        )

        # Reload with author relationship for response mapping
        created = await self.repo.get_with_author(comment.id)
        assert created is not None  # For type checking; just created above

        return self._to_response(created, viewer_id=author_id)

    async def get(self, comment_id: int, viewer_id: int) -> CommentResponse | None:
        """Get comment by ID with visibility check."""
        comment = await self.repo.get_with_author(comment_id)
        if comment is None:
            return None

        if comment.visibility == CommentVisibility.private and comment.author_id != viewer_id:
            return None

        return self._to_response(comment, viewer_id=viewer_id)

    async def get_for_parent(
        self, parent_type: CommentParentType, parent_id: int, viewer_id: int
    ) -> list[CommentResponse]:
        """Get visible comments for a parent entity for the current viewer."""
        comments = await self.repo.get_for_parent(
            parent_type=parent_type, parent_id=parent_id, viewer_id=viewer_id
        )
        return [self._to_response(comment, viewer_id=viewer_id) for comment in comments]

    async def update(
        self, comment_id: int, data: CommentUpdate, current_user_id: int
    ) -> CommentResponse | None:
        """Update comment content/visibility (author-only)."""
        existing_comment = await self.repo.get_with_author(comment_id)
        if existing_comment is None:
            return None

        if existing_comment.author_id != current_user_id:
            raise ForbiddenError(
                code="COMMENT_FORBIDDEN",
                message="You can only edit your own comments",
            )

        update_payload: dict[str, object] = {}
        if data.content:
            update_payload["content"] = data.content
        if data.visibility:
            update_payload["visibility"] = data.visibility

        updated_comment = await self.repo.update(comment_id, update_payload)
        if updated_comment is None:
            return None

        refreshed = await self.repo.get_with_author(comment_id)
        if refreshed is None:
            return None
        return self._to_response(refreshed, viewer_id=current_user_id)

    async def delete(self, comment_id: int, current_user_id: int) -> bool:
        """Delete comment by ID (author-only)."""
        comment = await self.repo.get(comment_id)
        if comment is None:
            return False

        if comment.author_id != current_user_id:
            raise ForbiddenError(
                code="COMMENT_FORBIDDEN",
                message="You can only delete your own comments",
            )

        return await self.repo.delete(comment_id)

    def _to_response(self, comment, viewer_id: int) -> CommentResponse:
        """Map ORM comment to response with aliases and permissions."""
        author_name = getattr(comment.author, "email", None) if getattr(comment, "author", None) else None
        author_label = author_name or f"User {comment.author_id}"

        can_edit = comment.author_id == viewer_id
        return CommentResponse(
            id=comment.id,
            content=comment.content,
            text=comment.content,
            visibility=comment.visibility,
            parent_type=comment.parent_type,
            parent_id=comment.parent_id,
            entity_type=comment.parent_type,
            entity_id=comment.parent_id,
            author_id=comment.author_id,
            user_id=comment.author_id,
            author_name=author_label,
            user_name=author_label,
            author_label=author_label,
            can_edit=can_edit,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
        )
