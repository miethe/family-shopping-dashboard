"""Unit tests for CommentService."""

from unittest.mock import AsyncMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.comment import Comment, CommentParentType
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
    async def test_create_comment(
        self, comment_service: CommentService, mock_comment_repo: AsyncMock
    ) -> None:
        """Test creating a comment."""
        # Arrange
        comment_data = CommentCreate(
            content="Great gift idea!",
            parent_type=CommentParentType.list_item,
            parent_id=123,
        )

        mock_comment = Comment(
            id=1,
            content="Great gift idea!",
            author_id=42,
            parent_type=CommentParentType.list_item,
            parent_id=123,
        )
        mock_comment_repo.create.return_value = mock_comment

        # Act
        result = await comment_service.create(author_id=42, data=comment_data)

        # Assert
        assert isinstance(result, CommentResponse)
        assert result.id == 1
        assert result.content == "Great gift idea!"
        assert result.author_id == 42
        assert result.parent_type == CommentParentType.list_item
        assert result.parent_id == 123

    @pytest.mark.asyncio
    async def test_create_comment_on_list(
        self, comment_service: CommentService, mock_comment_repo: AsyncMock
    ) -> None:
        """Test creating comment on a list (different parent type)."""
        # Arrange
        comment_data = CommentCreate(
            content="Comment on list",
            parent_type=CommentParentType.list,
            parent_id=5,
        )

        mock_comment = Comment(
            id=2,
            content="Comment on list",
            author_id=10,
            parent_type=CommentParentType.list,
            parent_id=5,
        )
        mock_comment_repo.create.return_value = mock_comment

        # Act
        result = await comment_service.create(author_id=10, data=comment_data)

        # Assert
        assert result.parent_type == CommentParentType.list
        assert result.parent_id == 5

    @pytest.mark.asyncio
    async def test_get_comment_found(
        self, comment_service: CommentService, mock_comment_repo: AsyncMock
    ) -> None:
        """Test getting an existing comment."""
        # Arrange
        mock_comment = Comment(
            id=1,
            content="Test comment",
            author_id=1,
            parent_type=CommentParentType.list_item,
            parent_id=1,
        )
        mock_comment_repo.get_with_author.return_value = mock_comment

        # Act
        result = await comment_service.get(comment_id=1)

        # Assert
        assert result is not None
        assert result.id == 1
        assert result.content == "Test comment"

    @pytest.mark.asyncio
    async def test_get_comment_not_found(
        self, comment_service: CommentService, mock_comment_repo: AsyncMock
    ) -> None:
        """Test getting non-existent comment returns None."""
        # Arrange
        mock_comment_repo.get_with_author.return_value = None

        # Act
        result = await comment_service.get(comment_id=999)

        # Assert
        assert result is None

    @pytest.mark.asyncio
    async def test_get_for_parent(
        self, comment_service: CommentService, mock_comment_repo: AsyncMock
    ) -> None:
        """Test getting all comments for a parent entity."""
        # Arrange
        mock_comments = [
            Comment(
                id=1,
                content="Comment 1",
                author_id=1,
                parent_type=CommentParentType.list_item,
                parent_id=123,
            ),
            Comment(
                id=2,
                content="Comment 2",
                author_id=2,
                parent_type=CommentParentType.list_item,
                parent_id=123,
            ),
        ]
        mock_comment_repo.get_for_parent.return_value = mock_comments

        # Act
        result = await comment_service.get_for_parent(
            parent_type=CommentParentType.list_item, parent_id=123
        )

        # Assert
        assert len(result) == 2
        assert all(c.parent_id == 123 for c in result)
        assert all(c.parent_type == CommentParentType.list_item for c in result)

    @pytest.mark.asyncio
    async def test_get_for_parent_empty(
        self, comment_service: CommentService, mock_comment_repo: AsyncMock
    ) -> None:
        """Test getting comments for parent with no comments returns empty list."""
        # Arrange
        mock_comment_repo.get_for_parent.return_value = []

        # Act
        result = await comment_service.get_for_parent(
            parent_type=CommentParentType.list, parent_id=999
        )

        # Assert
        assert result == []

    @pytest.mark.asyncio
    async def test_update_comment(
        self, comment_service: CommentService, mock_comment_repo: AsyncMock
    ) -> None:
        """Test updating comment content."""
        # Arrange
        existing = Comment(
            id=1,
            content="Old content",
            author_id=1,
            parent_type=CommentParentType.list_item,
            parent_id=1,
        )
        updated = Comment(
            id=1,
            content="Updated content",
            author_id=1,
            parent_type=CommentParentType.list_item,
            parent_id=1,
        )

        mock_comment_repo.get.return_value = existing
        mock_comment_repo.update.return_value = updated

        update_data = CommentUpdate(content="Updated content")

        # Act
        result = await comment_service.update(comment_id=1, data=update_data)

        # Assert
        assert result is not None
        assert result.content == "Updated content"

    @pytest.mark.asyncio
    async def test_update_comment_not_found(
        self, comment_service: CommentService, mock_comment_repo: AsyncMock
    ) -> None:
        """Test updating non-existent comment returns None."""
        # Arrange
        mock_comment_repo.get.return_value = None

        update_data = CommentUpdate(content="New content")

        # Act
        result = await comment_service.update(comment_id=999, data=update_data)

        # Assert
        assert result is None
        mock_comment_repo.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_delete_comment_success(
        self, comment_service: CommentService, mock_comment_repo: AsyncMock
    ) -> None:
        """Test deleting a comment successfully."""
        # Arrange
        mock_comment_repo.delete.return_value = True

        # Act
        result = await comment_service.delete(comment_id=1)

        # Assert
        assert result is True
        mock_comment_repo.delete.assert_called_once_with(1)

    @pytest.mark.asyncio
    async def test_delete_comment_not_found(
        self, comment_service: CommentService, mock_comment_repo: AsyncMock
    ) -> None:
        """Test deleting non-existent comment returns False."""
        # Arrange
        mock_comment_repo.delete.return_value = False

        # Act
        result = await comment_service.delete(comment_id=999)

        # Assert
        assert result is False
