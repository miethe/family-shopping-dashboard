"""Unit tests for ListService."""

from unittest.mock import AsyncMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.list import List, ListType, ListVisibility
from app.repositories.list import ListRepository
from app.schemas.list import ListCreate, ListResponse, ListUpdate
from app.services.list import ListService


@pytest.fixture
def mock_list_repo() -> AsyncMock:
    """Create mock ListRepository."""
    return AsyncMock(spec=ListRepository)


@pytest.fixture
def list_service(mock_list_repo: AsyncMock) -> ListService:
    """Create ListService with mocked repository."""
    service = ListService(session=AsyncMock(spec=AsyncSession))
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

        mock_list = List(
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
        mock_list = List(
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
            List(
                id=1,
                name="List 1",
                type=ListType.wishlist,
                visibility=ListVisibility.family,
                user_id=1,
                person_id=5,
            ),
            List(
                id=2,
                name="List 2",
                type=ListType.shopping,
                visibility=ListVisibility.family,
                user_id=1,
                person_id=5,
            ),
        ]
        mock_list_repo.get_by_person.return_value = mock_lists

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
            List(
                id=1,
                name="List 1",
                type=ListType.wishlist,
                visibility=ListVisibility.family,
                user_id=1,
                occasion_id=10,
            ),
        ]
        mock_list_repo.get_by_occasion.return_value = mock_lists

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
        existing = List(
            id=1,
            name="Old Name",
            type=ListType.wishlist,
            visibility=ListVisibility.family,
            user_id=1,
        )
        updated = List(
            id=1,
            name="New Name",
            type=ListType.shopping,
            visibility=ListVisibility.public,
            user_id=1,
        )

        mock_list_repo.get.return_value = existing
        mock_list_repo.update.return_value = updated

        update_data = ListUpdate(name="New Name", type=ListType.shopping)

        # Act
        result = await list_service.update(list_id=1, data=update_data)

        # Assert
        assert result is not None
        assert result.name == "New Name"
        assert result.type == ListType.shopping

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
