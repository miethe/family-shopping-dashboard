"""Unit tests for ListItemService with status state machine validation."""

from unittest.mock import AsyncMock, patch

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.list_item import ListItem, ListItemStatus
from app.repositories.list_item import ListItemRepository
from app.schemas.list_item import ListItemCreate, ListItemResponse, ListItemUpdate
from app.services.list_item import ListItemService


@pytest.fixture
def mock_list_item_repo() -> AsyncMock:
    """Create mock ListItemRepository."""
    return AsyncMock(spec=ListItemRepository)


@pytest.fixture
def list_item_service(mock_list_item_repo: AsyncMock) -> ListItemService:
    """Create ListItemService with mocked repository."""
    service = ListItemService(session=AsyncMock(spec=AsyncSession))
    service.repo = mock_list_item_repo
    return service


class TestListItemService:
    """Test suite for ListItemService."""

    @pytest.mark.asyncio
    @patch("app.services.list_item.manager.broadcast_event")
    async def test_create_list_item(
        self,
        mock_broadcast: AsyncMock,
        list_item_service: ListItemService,
        mock_list_item_repo: AsyncMock,
    ) -> None:
        """Test creating a list item."""
        # Arrange
        item_data = ListItemCreate(
            gift_id=1,
            list_id=2,
            status=ListItemStatus.idea,
            notes="Test notes",
        )

        mock_item = ListItem(
            id=10,
            gift_id=1,
            list_id=2,
            status=ListItemStatus.idea,
            assigned_to=None,
            notes="Test notes",
        )
        mock_list_item_repo.create.return_value = mock_item

        # Act
        result = await list_item_service.create(data=item_data, user_id=42)

        # Assert
        assert isinstance(result, ListItemResponse)
        assert result.id == 10
        assert result.status == ListItemStatus.idea
        assert result.notes == "Test notes"
        mock_broadcast.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_list_item_found(
        self, list_item_service: ListItemService, mock_list_item_repo: AsyncMock
    ) -> None:
        """Test getting an existing list item."""
        # Arrange
        mock_item = ListItem(
            id=1, gift_id=1, list_id=1, status=ListItemStatus.idea
        )
        mock_list_item_repo.get.return_value = mock_item

        # Act
        result = await list_item_service.get(item_id=1)

        # Assert
        assert result is not None
        assert result.id == 1
        assert result.status == ListItemStatus.idea

    @pytest.mark.asyncio
    async def test_get_list_item_not_found(
        self, list_item_service: ListItemService, mock_list_item_repo: AsyncMock
    ) -> None:
        """Test getting non-existent list item returns None."""
        # Arrange
        mock_list_item_repo.get.return_value = None

        # Act
        result = await list_item_service.get(item_id=999)

        # Assert
        assert result is None

    @pytest.mark.asyncio
    async def test_get_for_list(
        self, list_item_service: ListItemService, mock_list_item_repo: AsyncMock
    ) -> None:
        """Test getting all items for a list."""
        # Arrange
        mock_items = [
            ListItem(id=1, gift_id=1, list_id=5, status=ListItemStatus.idea),
            ListItem(id=2, gift_id=2, list_id=5, status=ListItemStatus.selected),
        ]
        mock_list_item_repo.get_by_list.return_value = mock_items

        # Act
        result = await list_item_service.get_for_list(list_id=5)

        # Assert
        assert len(result) == 2
        assert result[0].list_id == 5
        assert result[1].list_id == 5

    @pytest.mark.asyncio
    @patch("app.services.list_item.manager.broadcast_event")
    async def test_update_status_valid_transition_idea_to_selected(
        self,
        mock_broadcast: AsyncMock,
        list_item_service: ListItemService,
        mock_list_item_repo: AsyncMock,
    ) -> None:
        """Test valid status transition: IDEA → SELECTED."""
        # Arrange
        current_item = ListItem(
            id=1, gift_id=1, list_id=1, status=ListItemStatus.idea
        )
        updated_item = ListItem(
            id=1, gift_id=1, list_id=1, status=ListItemStatus.selected
        )

        mock_list_item_repo.get.return_value = current_item
        mock_list_item_repo.update_status.return_value = updated_item

        # Act
        result = await list_item_service.update_status(
            item_id=1, status=ListItemStatus.selected, user_id=42
        )

        # Assert
        assert result is not None
        assert result.status == ListItemStatus.selected
        mock_broadcast.assert_called_once()

    @pytest.mark.asyncio
    @patch("app.services.list_item.manager.broadcast_event")
    async def test_update_status_valid_transition_selected_to_purchased(
        self,
        mock_broadcast: AsyncMock,
        list_item_service: ListItemService,
        mock_list_item_repo: AsyncMock,
    ) -> None:
        """Test valid status transition: SELECTED → PURCHASED."""
        # Arrange
        current_item = ListItem(
            id=1, gift_id=1, list_id=1, status=ListItemStatus.selected
        )
        updated_item = ListItem(
            id=1, gift_id=1, list_id=1, status=ListItemStatus.purchased
        )

        mock_list_item_repo.get.return_value = current_item
        mock_list_item_repo.update_status.return_value = updated_item

        # Act
        result = await list_item_service.update_status(
            item_id=1, status=ListItemStatus.purchased, user_id=42
        )

        # Assert
        assert result is not None
        assert result.status == ListItemStatus.purchased

    @pytest.mark.asyncio
    @patch("app.services.list_item.manager.broadcast_event")
    async def test_update_status_valid_transition_purchased_to_received(
        self,
        mock_broadcast: AsyncMock,
        list_item_service: ListItemService,
        mock_list_item_repo: AsyncMock,
    ) -> None:
        """Test valid status transition: PURCHASED → RECEIVED."""
        # Arrange
        current_item = ListItem(
            id=1, gift_id=1, list_id=1, status=ListItemStatus.purchased
        )
        updated_item = ListItem(
            id=1, gift_id=1, list_id=1, status=ListItemStatus.received
        )

        mock_list_item_repo.get.return_value = current_item
        mock_list_item_repo.update_status.return_value = updated_item

        # Act
        result = await list_item_service.update_status(
            item_id=1, status=ListItemStatus.received, user_id=42
        )

        # Assert
        assert result is not None
        assert result.status == ListItemStatus.received

    @pytest.mark.asyncio
    async def test_update_status_reset_to_idea(
        self, list_item_service: ListItemService, mock_list_item_repo: AsyncMock
    ) -> None:
        """Test any status can transition back to IDEA (reset)."""
        # Arrange
        current_item = ListItem(
            id=1, gift_id=1, list_id=1, status=ListItemStatus.received
        )
        updated_item = ListItem(
            id=1, gift_id=1, list_id=1, status=ListItemStatus.idea
        )

        mock_list_item_repo.get.return_value = current_item
        mock_list_item_repo.update_status.return_value = updated_item

        # Act
        with patch("app.services.list_item.manager.broadcast_event"):
            result = await list_item_service.update_status(
                item_id=1, status=ListItemStatus.idea, user_id=42
            )

        # Assert
        assert result is not None
        assert result.status == ListItemStatus.idea

    @pytest.mark.asyncio
    async def test_update_status_invalid_transition_idea_to_purchased(
        self, list_item_service: ListItemService, mock_list_item_repo: AsyncMock
    ) -> None:
        """Test invalid status transition: IDEA → PURCHASED (should fail)."""
        # Arrange
        current_item = ListItem(
            id=1, gift_id=1, list_id=1, status=ListItemStatus.idea
        )
        mock_list_item_repo.get.return_value = current_item

        # Act & Assert
        with pytest.raises(ValueError, match="Invalid status transition"):
            await list_item_service.update_status(
                item_id=1, status=ListItemStatus.purchased, user_id=42
            )

    @pytest.mark.asyncio
    async def test_update_status_invalid_transition_idea_to_received(
        self, list_item_service: ListItemService, mock_list_item_repo: AsyncMock
    ) -> None:
        """Test invalid status transition: IDEA → RECEIVED (should fail)."""
        # Arrange
        current_item = ListItem(
            id=1, gift_id=1, list_id=1, status=ListItemStatus.idea
        )
        mock_list_item_repo.get.return_value = current_item

        # Act & Assert
        with pytest.raises(ValueError, match="Invalid status transition"):
            await list_item_service.update_status(
                item_id=1, status=ListItemStatus.received, user_id=42
            )

    @pytest.mark.asyncio
    async def test_update_status_invalid_transition_selected_to_received(
        self, list_item_service: ListItemService, mock_list_item_repo: AsyncMock
    ) -> None:
        """Test invalid status transition: SELECTED → RECEIVED (should fail)."""
        # Arrange
        current_item = ListItem(
            id=1, gift_id=1, list_id=1, status=ListItemStatus.selected
        )
        mock_list_item_repo.get.return_value = current_item

        # Act & Assert
        with pytest.raises(ValueError, match="Invalid status transition"):
            await list_item_service.update_status(
                item_id=1, status=ListItemStatus.received, user_id=42
            )

    @pytest.mark.asyncio
    async def test_update_status_same_status_no_validation(
        self, list_item_service: ListItemService, mock_list_item_repo: AsyncMock
    ) -> None:
        """Test updating to same status doesn't trigger validation."""
        # Arrange
        current_item = ListItem(
            id=1, gift_id=1, list_id=1, status=ListItemStatus.idea
        )
        mock_list_item_repo.get.return_value = current_item
        mock_list_item_repo.update_status.return_value = current_item

        # Act
        with patch("app.services.list_item.manager.broadcast_event"):
            result = await list_item_service.update_status(
                item_id=1, status=ListItemStatus.idea, user_id=42
            )

        # Assert - should succeed without raising ValueError
        assert result is not None
        assert result.status == ListItemStatus.idea

    @pytest.mark.asyncio
    @patch("app.services.list_item.manager.broadcast_event")
    async def test_assign_list_item(
        self,
        mock_broadcast: AsyncMock,
        list_item_service: ListItemService,
        mock_list_item_repo: AsyncMock,
    ) -> None:
        """Test assigning list item to a user."""
        # Arrange
        updated_item = ListItem(
            id=1, gift_id=1, list_id=1, status=ListItemStatus.idea, assigned_to=123
        )
        mock_list_item_repo.update.return_value = updated_item

        # Act
        result = await list_item_service.assign(
            item_id=1, assigned_to=123, user_id=42
        )

        # Assert
        assert result is not None
        assert result.assigned_to == 123
        mock_broadcast.assert_called_once()

    @pytest.mark.asyncio
    @patch("app.services.list_item.manager.broadcast_event")
    async def test_update_list_item_with_status_validation(
        self,
        mock_broadcast: AsyncMock,
        list_item_service: ListItemService,
        mock_list_item_repo: AsyncMock,
    ) -> None:
        """Test general update validates status transitions."""
        # Arrange
        existing_item = ListItem(
            id=1, gift_id=1, list_id=1, status=ListItemStatus.idea
        )
        updated_item = ListItem(
            id=1, gift_id=1, list_id=1, status=ListItemStatus.selected, notes="New notes"
        )

        mock_list_item_repo.get.return_value = existing_item
        mock_list_item_repo.update.return_value = updated_item

        update_data = ListItemUpdate(
            status=ListItemStatus.selected, notes="New notes"
        )

        # Act
        result = await list_item_service.update(
            item_id=1, data=update_data, user_id=42
        )

        # Assert
        assert result is not None
        assert result.status == ListItemStatus.selected
        assert result.notes == "New notes"

    @pytest.mark.asyncio
    async def test_update_list_item_invalid_status_transition(
        self, list_item_service: ListItemService, mock_list_item_repo: AsyncMock
    ) -> None:
        """Test general update with invalid status transition raises error."""
        # Arrange
        existing_item = ListItem(
            id=1, gift_id=1, list_id=1, status=ListItemStatus.idea
        )
        mock_list_item_repo.get.return_value = existing_item

        update_data = ListItemUpdate(status=ListItemStatus.purchased)

        # Act & Assert
        with pytest.raises(ValueError, match="Invalid status transition"):
            await list_item_service.update(item_id=1, data=update_data, user_id=42)

    @pytest.mark.asyncio
    @patch("app.services.list_item.manager.broadcast_event")
    async def test_delete_list_item(
        self,
        mock_broadcast: AsyncMock,
        list_item_service: ListItemService,
        mock_list_item_repo: AsyncMock,
    ) -> None:
        """Test deleting a list item."""
        # Arrange
        item_to_delete = ListItem(
            id=1, gift_id=1, list_id=2, status=ListItemStatus.idea
        )
        mock_list_item_repo.get.return_value = item_to_delete
        mock_list_item_repo.delete.return_value = True

        # Act
        result = await list_item_service.delete(item_id=1, user_id=42)

        # Assert
        assert result is True
        mock_broadcast.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_list_item_not_found(
        self, list_item_service: ListItemService, mock_list_item_repo: AsyncMock
    ) -> None:
        """Test deleting non-existent list item returns False."""
        # Arrange
        mock_list_item_repo.get.return_value = None

        # Act
        result = await list_item_service.delete(item_id=999, user_id=42)

        # Assert
        assert result is False
