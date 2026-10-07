"""Unit tests for ListService."""

from datetime import datetime, timezone
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.list import List, ListType, ListVisibility
from app.repositories.list import ListRepository
from app.schemas.list import ListCreate, ListResponse, ListUpdate
from app.services.list import ListService


_NOW = datetime(2025, 1, 1, tzinfo=timezone.utc)


def _list(**fields: Any) -> List:
    """Build a List as the DB would return it (insert-time timestamps applied)."""
    fields.setdefault("created_at", _NOW)
    fields.setdefault("updated_at", _NOW)
    return List(**fields)


@pytest.fixture
def mock_list_repo() -> AsyncMock:
    """Create mock ListRepository."""
    return AsyncMock(spec=ListRepository)


@pytest.fixture
def list_service(mock_list_repo: AsyncMock) -> ListService:
    """Create ListService with mocked repository."""
    session = AsyncMock(spec=AsyncSession)
    # get()/update() count items with session.execute(...).scalar()
    session.execute.return_value = MagicMock(**{"scalar.return_value": 0})
    service = ListService(session=session)
    service.repo = mock_list_repo
    return service


class TestListService:
    """Test suite for ListService."""

    @pytest.mark.asyncio
    async def test_create_list(
        self, list_service: ListService, mock_list_repo: AsyncMock
    ) -> None:
        """Test creating a list."""
        # Arrange
        list_data = ListCreate(
            name="Christmas Wishlist",
            type=ListType.wishlist,
            visibility=ListVisibility.family,
            person_id=1,
            occasion_id=2,
        )

        mock_list = _list(
            id=1,
            name="Christmas Wishlist",
            type=ListType.wishlist,
            visibility=ListVisibility.family,
            user_id=42,
            person_id=1,
            occasion_id=2,
        )
        mock_list_repo.create.return_value = mock_list

        # Act
        result = await list_service.create(user_id=42, data=list_data)

        # Assert
        assert isinstance(result, ListResponse)
        assert result.id == 1
        assert result.name == "Christmas Wishlist"
        assert result.user_id == 42
        assert result.person_id == 1
        assert result.occasion_id == 2

    @pytest.mark.asyncio
    async def test_get_list_found(
        self, list_service: ListService, mock_list_repo: AsyncMock
    ) -> None:
        """Test getting an existing list."""
        # Arrange
        mock_list = _list(
            id=1,
            name="Test List",
            type=ListType.wishlist,
            visibility=ListVisibility.family,
            user_id=1,
        )
        mock_list_repo.get.return_value = mock_list

        # Act
        result = await list_service.get(list_id=1)

        # Assert
        assert result is not None
        assert result.id == 1
        assert result.name == "Test List"

    @pytest.mark.asyncio
    async def test_get_list_not_found(
        self, list_service: ListService, mock_list_repo: AsyncMock
    ) -> None:
        """Test getting non-existent list returns None."""
        # Arrange
        mock_list_repo.get.return_value = None

        # Act
        result = await list_service.get(list_id=999)

        # Assert
        assert result is None

    @pytest.mark.asyncio
    async def test_filter_by_person(
        self, list_service: ListService, mock_list_repo: AsyncMock
    ) -> None:
        """Test filtering lists by person."""
        # Arrange
        mock_lists = [
            _list(
                id=1,
                name="List 1",
                type=ListType.wishlist,
                visibility=ListVisibility.family,
                user_id=1,
                person_id=5,
            ),
            _list(
                id=2,
                name="List 2",
                type=ListType.ideas,
                visibility=ListVisibility.family,
                user_id=1,
                person_id=5,
            ),
        ]
        # repository returns (list, item_count) rows
        mock_list_repo.get_by_person.return_value = [(lst, 0) for lst in mock_lists]

        # Act
        result = await list_service.filter_by_person(person_id=5)

        # Assert
        assert len(result) == 2
        assert all(lst.person_id == 5 for lst in result)

    @pytest.mark.asyncio
    async def test_filter_by_occasion(
        self, list_service: ListService, mock_list_repo: AsyncMock
    ) -> None:
        """Test filtering lists by occasion."""
        # Arrange
        mock_lists = [
            _list(
                id=1,
                name="List 1",
                type=ListType.wishlist,
                visibility=ListVisibility.family,
                user_id=1,
                occasion_id=10,
            ),
        ]
        mock_list_repo.get_by_occasion.return_value = [(lst, 0) for lst in mock_lists]

        # Act
        result = await list_service.filter_by_occasion(occasion_id=10)

        # Assert
        assert len(result) == 1
        assert result[0].occasion_id == 10

    @pytest.mark.asyncio
    async def test_update_list(
        self, list_service: ListService, mock_list_repo: AsyncMock
    ) -> None:
        """Test updating a list."""
        # Arrange
        existing = _list(
            id=1,
            name="Old Name",
            type=ListType.wishlist,
            visibility=ListVisibility.family,
            user_id=1,
        )
        updated = _list(
            id=1,
            name="New Name",
            type=ListType.ideas,
            visibility=ListVisibility.public,
            user_id=1,
        )

        mock_list_repo.get.return_value = existing
        mock_list_repo.update.return_value = updated

        update_data = ListUpdate(name="New Name", type=ListType.ideas)

        # Act
        result = await list_service.update(list_id=1, data=update_data)

        # Assert
        assert result is not None
        assert result.name == "New Name"
        assert result.type == ListType.ideas

    @pytest.mark.asyncio
    async def test_update_list_not_found(
        self, list_service: ListService, mock_list_repo: AsyncMock
    ) -> None:
        """Test updating non-existent list returns None."""
        # Arrange
        mock_list_repo.get.return_value = None

        update_data = ListUpdate(name="New Name")

        # Act
        result = await list_service.update(list_id=999, data=update_data)

        # Assert
        assert result is None
        mock_list_repo.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_delete_list_success(
        self, list_service: ListService, mock_list_repo: AsyncMock
    ) -> None:
        """Test deleting a list successfully."""
        # Arrange
        mock_list_repo.delete.return_value = True

        # Act
        result = await list_service.delete(list_id=1)

        # Assert
        assert result is True
        mock_list_repo.delete.assert_called_once_with(1)

    @pytest.mark.asyncio
    async def test_delete_list_not_found(
        self, list_service: ListService, mock_list_repo: AsyncMock
    ) -> None:
        """Test deleting non-existent list returns False."""
        # Arrange
        mock_list_repo.delete.return_value = False

        # Act
        result = await list_service.delete(list_id=999)

        # Assert
        assert result is False
