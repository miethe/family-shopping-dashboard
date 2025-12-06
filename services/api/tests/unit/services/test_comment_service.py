"""Unit tests for CommentService."""

from datetime import datetime
from unittest.mock import AsyncMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenError
from app.models.comment import Comment, CommentParentType, CommentVisibility
from app.repositories.comment import CommentRepository
from app.schemas.comment import CommentCreate, CommentResponse, CommentUpdate
from app.services.comment import CommentService


@pytest.fixture
def mock_comment_repo() -> AsyncMock:
    """Create mock CommentRepository."""
    return AsyncMock(spec=CommentRepository)


@pytest.fixture
def comment_service(mock_comment_repo: AsyncMock) -> CommentService:
    """Create CommentService with mocked repository."""
    service = CommentService(session=AsyncMock(spec=AsyncSession))
    service.repo = mock_comment_repo
    return service


class TestCommentService:
    """Test suite for CommentService."""

    @pytest.mark.asyncio
    async def test_create_comment_defaults_public(
        self, comment_service: CommentService, mock_comment_repo: AsyncMock
    ) -> None:
        """Test creating a comment with default visibility."""
        # Arrange
        comment_data = CommentCreate(
            content=" Great gift idea! ",
            parent_type=CommentParentType.list_item,
            parent_id=123,
        )

        mock_comment = Comment(
            id=1,
            content="Great gift idea!",
            author_id=42,
            parent_type=CommentParentType.list_item,
            parent_id=123,
            visibility=CommentVisibility.public,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        mock_comment_repo.create.return_value = mock_comment
        mock_comment_repo.get_with_author.return_value = mock_comment

        # Act
        result = await comment_service.create(author_id=42, data=comment_data)

        # Assert
        assert isinstance(result, CommentResponse)
        assert result.visibility == CommentVisibility.public
        assert result.text == "Great gift idea!"
        assert result.user_id == 42
        assert result.entity_type == CommentParentType.list_item

    @pytest.mark.asyncio
    async def test_get_for_parent_filters_private_for_other_user(
        self, comment_service: CommentService, mock_comment_repo: AsyncMock
    ) -> None:
        """Private comments from other users should be excluded."""
        public_comment = Comment(
            id=1,
            content="Visible",
            author_id=1,
            parent_type=CommentParentType.list_item,
            parent_id=123,
            visibility=CommentVisibility.public,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        mock_comment_repo.get_for_parent.return_value = [public_comment]

        result = await comment_service.get_for_parent(
            parent_type=CommentParentType.list_item,
            parent_id=123,
            viewer_id=99,
        )

        assert len(result) == 1
        assert result[0].id == public_comment.id

    @pytest.mark.asyncio
    async def test_get_for_parent_includes_own_private(
        self, comment_service: CommentService, mock_comment_repo: AsyncMock
    ) -> None:
        """Private comments should be returned for the author."""
        private_comment = Comment(
            id=2,
            content="My note",
            author_id=42,
            parent_type=CommentParentType.list_item,
            parent_id=123,
            visibility=CommentVisibility.private,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        mock_comment_repo.get_for_parent.return_value = [private_comment]

        result = await comment_service.get_for_parent(
            parent_type=CommentParentType.list_item,
            parent_id=123,
            viewer_id=42,
        )

        assert len(result) == 1
        assert result[0].visibility == CommentVisibility.private
        assert result[0].can_edit is True

    @pytest.mark.asyncio
    async def test_get_private_comment_other_user_returns_none(
        self, comment_service: CommentService, mock_comment_repo: AsyncMock
    ) -> None:
        """Getting a private comment from another user returns None."""
        private_comment = Comment(
            id=5,
            content="Secret",
            author_id=7,
            parent_type=CommentParentType.person,
            parent_id=11,
            visibility=CommentVisibility.private,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        mock_comment_repo.get_with_author.return_value = private_comment

        result = await comment_service.get(comment_id=5, viewer_id=99)
        assert result is None

    @pytest.mark.asyncio
    async def test_update_comment_author_only(
        self, comment_service: CommentService, mock_comment_repo: AsyncMock
    ) -> None:
        """Author can update their own comment."""
        existing = Comment(
            id=1,
            content="Old content",
            author_id=1,
            parent_type=CommentParentType.list_item,
            parent_id=1,
            visibility=CommentVisibility.public,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        updated = Comment(
            id=1,
            content="Updated content",
            author_id=1,
            parent_type=CommentParentType.list_item,
            parent_id=1,
            visibility=CommentVisibility.private,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        mock_comment_repo.get_with_author.side_effect = [existing, updated]
        mock_comment_repo.update.return_value = updated

        update_data = CommentUpdate(content="Updated content", visibility=CommentVisibility.private)

        result = await comment_service.update(
            comment_id=1, data=update_data, current_user_id=1
        )

        assert result is not None
        assert result.content == "Updated content"
        assert result.visibility == CommentVisibility.private

    @pytest.mark.asyncio
    async def test_update_comment_forbidden_for_other_user(
        self, comment_service: CommentService, mock_comment_repo: AsyncMock
    ) -> None:
        """Non-author cannot update comment."""
        existing = Comment(
            id=1,
            content="Old content",
            author_id=1,
            parent_type=CommentParentType.list_item,
            parent_id=1,
            visibility=CommentVisibility.public,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        mock_comment_repo.get_with_author.return_value = existing

        update_data = CommentUpdate(content="Try update")

        with pytest.raises(ForbiddenError):
            await comment_service.update(
                comment_id=1, data=update_data, current_user_id=2
            )

    @pytest.mark.asyncio
    async def test_delete_comment_forbidden_for_other_user(
        self, comment_service: CommentService, mock_comment_repo: AsyncMock
    ) -> None:
        """Non-author cannot delete comment."""
        existing = Comment(
            id=1,
            content="Hello",
            author_id=1,
            parent_type=CommentParentType.list_item,
            parent_id=1,
            visibility=CommentVisibility.public,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        mock_comment_repo.get.return_value = existing

        with pytest.raises(ForbiddenError):
            await comment_service.delete(comment_id=1, current_user_id=2)

    @pytest.mark.asyncio
    async def test_delete_comment_success(
        self, comment_service: CommentService, mock_comment_repo: AsyncMock
    ) -> None:
        """Author can delete their comment."""
        existing = Comment(
            id=1,
            content="Hello",
            author_id=1,
            parent_type=CommentParentType.list_item,
            parent_id=1,
            visibility=CommentVisibility.public,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        mock_comment_repo.get.return_value = existing
        mock_comment_repo.delete.return_value = True

        result = await comment_service.delete(comment_id=1, current_user_id=1)

        assert result is True
