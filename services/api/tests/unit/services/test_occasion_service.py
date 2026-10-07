"""Unit tests for OccasionService."""

from datetime import date, datetime, timezone
from typing import Any
from unittest.mock import AsyncMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.occasion import Occasion, OccasionType
from app.repositories.occasion import OccasionRepository
from app.schemas.occasion import OccasionCreate, OccasionResponse, OccasionUpdate
from app.services.occasion import OccasionService


_NOW = datetime(2025, 1, 1, tzinfo=timezone.utc)


def _occ(**fields: Any) -> Occasion:
    """Build an Occasion as the DB would return it (timestamps + loaded persons)."""
    fields.setdefault("created_at", _NOW)
    fields.setdefault("updated_at", _NOW)
    fields.setdefault("persons", [])
    fields.setdefault("is_active", True)
    return Occasion(**fields)


@pytest.fixture
def mock_occasion_repo() -> AsyncMock:
    """Create mock OccasionRepository."""
    return AsyncMock(spec=OccasionRepository)


@pytest.fixture
def occasion_service(mock_occasion_repo: AsyncMock) -> OccasionService:
    """Create OccasionService with mocked repository."""
    service = OccasionService(session=AsyncMock(spec=AsyncSession))
    service.repo = mock_occasion_repo
    return service


class TestOccasionService:
    """Test suite for OccasionService."""

    @pytest.mark.asyncio
    async def test_create_occasion(
        self, occasion_service: OccasionService, mock_occasion_repo: AsyncMock
    ) -> None:
        """Test creating an occasion."""
        # Arrange
        occasion_data = OccasionCreate(
            name="Christmas 2025",
            type=OccasionType.HOLIDAY,
            date=date(2025, 12, 25),
            description="Christmas celebration",
        )

        mock_occasion = _occ(
            id=1,
            name="Christmas 2025",
            type=OccasionType.HOLIDAY,
            date=date(2025, 12, 25),
            description="Christmas celebration",
        )
        mock_occasion_repo.create.return_value = mock_occasion
        mock_occasion_repo.get_with_persons.return_value = mock_occasion

        # Act
        result = await occasion_service.create(occasion_data)

        # Assert
        assert isinstance(result, OccasionResponse)
        assert result.id == 1
        assert result.name == "Christmas 2025"
        assert result.type == OccasionType.HOLIDAY
        assert result.date == date(2025, 12, 25)
        assert result.description == "Christmas celebration"

    @pytest.mark.asyncio
    async def test_create_occasion_minimal(
        self, occasion_service: OccasionService, mock_occasion_repo: AsyncMock
    ) -> None:
        """Test creating occasion with minimal data."""
        # Arrange
        occasion_data = OccasionCreate(
            name="Birthday",
            type=OccasionType.RECURRING,
            date=date(2025, 6, 15),
        )

        mock_occasion = _occ(
            id=2,
            name="Birthday",
            type=OccasionType.RECURRING,
            date=date(2025, 6, 15),
            description=None,
        )
        mock_occasion_repo.create.return_value = mock_occasion
        mock_occasion_repo.get_with_persons.return_value = mock_occasion

        # Act
        result = await occasion_service.create(occasion_data)

        # Assert
        assert result.name == "Birthday"
        assert result.description is None

    @pytest.mark.asyncio
    async def test_get_occasion_found(
        self, occasion_service: OccasionService, mock_occasion_repo: AsyncMock
    ) -> None:
        """Test getting an existing occasion."""
        # Arrange
        mock_occasion = _occ(
            id=1, name="Christmas", type=OccasionType.HOLIDAY, date=date(2025, 12, 25)
        )
        mock_occasion_repo.get_with_persons.return_value = mock_occasion

        # Act
        result = await occasion_service.get(occasion_id=1)

        # Assert
        assert result is not None
        assert result.id == 1
        assert result.name == "Christmas"
        mock_occasion_repo.get_with_persons.assert_called_once_with(1)

    @pytest.mark.asyncio
    async def test_get_occasion_not_found(
        self, occasion_service: OccasionService, mock_occasion_repo: AsyncMock
    ) -> None:
        """Test getting non-existent occasion returns None."""
        # Arrange
        mock_occasion_repo.get_with_persons.return_value = None

        # Act
        result = await occasion_service.get(occasion_id=999)

        # Assert
        assert result is None

    @pytest.mark.asyncio
    async def test_list_occasions(
        self, occasion_service: OccasionService, mock_occasion_repo: AsyncMock
    ) -> None:
        """Test listing occasions with pagination."""
        # Arrange
        mock_occasions = [
            _occ(id=1, name="Occasion 1", type=OccasionType.RECURRING, date=date(2025, 1, 1)),
            _occ(id=2, name="Occasion 2", type=OccasionType.HOLIDAY, date=date(2025, 2, 1)),
        ]
        mock_occasion_repo.get_multi.return_value = (mock_occasions, True, 2)

        # Act
        occasions, has_more, next_cursor = await occasion_service.list(limit=2)

        # Assert
        assert len(occasions) == 2
        assert occasions[0].name == "Occasion 1"
        assert has_more is True
        assert next_cursor == 2

    @pytest.mark.asyncio
    async def test_get_upcoming_occasions(
        self, occasion_service: OccasionService, mock_occasion_repo: AsyncMock
    ) -> None:
        """Test getting upcoming occasions."""
        # Arrange
        mock_occasions = [
            _occ(
                id=1, name="Birthday", type=OccasionType.RECURRING, date=date(2025, 6, 15)
            ),
            _occ(
                id=2, name="Anniversary", type=OccasionType.RECURRING, date=date(2025, 7, 1)
            ),
        ]
        mock_occasion_repo.get_upcoming_by_next_occurrence.return_value = mock_occasions

        # Act
        result = await occasion_service.get_upcoming(limit=5)

        # Assert
        assert len(result) == 2
        assert result[0].name == "Birthday"
        assert result[1].name == "Anniversary"
        mock_occasion_repo.get_upcoming_by_next_occurrence.assert_called_once_with(
            within_days=90
        )

    @pytest.mark.asyncio
    async def test_get_upcoming_respects_limit(
        self, occasion_service: OccasionService, mock_occasion_repo: AsyncMock
    ) -> None:
        """Test upcoming occasions respects limit."""
        # Arrange
        mock_occasions = [
            _occ(id=i, name=f"Occasion {i}", type=OccasionType.RECURRING, date=date(2025, i, 1))
            for i in range(1, 11)
        ]
        mock_occasion_repo.get_upcoming_by_next_occurrence.return_value = mock_occasions

        # Act
        result = await occasion_service.get_upcoming(limit=3)

        # Assert
        assert len(result) == 3

    @pytest.mark.asyncio
    async def test_update_occasion(
        self, occasion_service: OccasionService, mock_occasion_repo: AsyncMock
    ) -> None:
        """Test updating an occasion."""
        # Arrange
        existing = _occ(
            id=1, name="Old Name", type=OccasionType.RECURRING, date=date(2025, 1, 1)
        )
        updated = _occ(
            id=1, name="New Name", type=OccasionType.RECURRING, date=date(2025, 2, 1)
        )

        mock_occasion_repo.get.return_value = existing
        mock_occasion_repo.update.return_value = updated
        mock_occasion_repo.get_with_persons.return_value = updated

        update_data = OccasionUpdate(name="New Name", date=date(2025, 2, 1))

        # Act
        result = await occasion_service.update(occasion_id=1, data=update_data)

        # Assert
        assert result is not None
        assert result.name == "New Name"
        assert result.date == date(2025, 2, 1)

    @pytest.mark.asyncio
    async def test_update_occasion_not_found(
        self, occasion_service: OccasionService, mock_occasion_repo: AsyncMock
    ) -> None:
        """Test updating non-existent occasion returns None."""
        # Arrange
        mock_occasion_repo.get.return_value = None

        update_data = OccasionUpdate(name="New Name")

        # Act
        result = await occasion_service.update(occasion_id=999, data=update_data)

        # Assert
        assert result is None
        mock_occasion_repo.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_update_occasion_no_changes(
        self, occasion_service: OccasionService, mock_occasion_repo: AsyncMock
    ) -> None:
        """Test updating occasion with no changes."""
        # Arrange
        existing = _occ(
            id=1, name="Name", type=OccasionType.RECURRING, date=date(2025, 1, 1)
        )
        mock_occasion_repo.get.return_value = existing
        mock_occasion_repo.get_with_persons.return_value = existing

        update_data = OccasionUpdate()

        # Act
        result = await occasion_service.update(occasion_id=1, data=update_data)

        # Assert
        assert result is not None
        assert result.name == "Name"
        mock_occasion_repo.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_delete_occasion_success(
        self, occasion_service: OccasionService, mock_occasion_repo: AsyncMock
    ) -> None:
        """Test deleting an occasion successfully."""
        # Arrange
        mock_occasion_repo.delete.return_value = True

        # Act
        result = await occasion_service.delete(occasion_id=1)

        # Assert
        assert result is True
        mock_occasion_repo.delete.assert_called_once_with(1)

    @pytest.mark.asyncio
    async def test_delete_occasion_not_found(
        self, occasion_service: OccasionService, mock_occasion_repo: AsyncMock
    ) -> None:
        """Test deleting non-existent occasion returns False."""
        # Arrange
        mock_occasion_repo.delete.return_value = False

        # Act
        result = await occasion_service.delete(occasion_id=999)

        # Assert
        assert result is False
