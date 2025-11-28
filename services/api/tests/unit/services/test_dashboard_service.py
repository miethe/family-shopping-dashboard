"""Unit tests for DashboardService."""

import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.dashboard import (
    DashboardOccasionSummary,
    DashboardResponse,
    PersonSummary,
)
from app.services.dashboard import DashboardService


@pytest.fixture
def dashboard_service() -> DashboardService:
    """Create DashboardService with mocked session."""
    return DashboardService(session=AsyncMock(spec=AsyncSession))


class TestDashboardService:
    """Test suite for DashboardService."""

    @pytest.mark.asyncio
    async def test_get_dashboard_complete_data(
        self, dashboard_service: DashboardService
    ) -> None:
        """Test getting dashboard with all data populated."""
        # Arrange - Mock all internal methods
        mock_occasion = DashboardOccasionSummary(
            id=1,
            name="Christmas",
            date=datetime.date(2025, 12, 25),
            days_until=30,
            total_items=10,
            purchased_items=5,
        )
        mock_people = [
            PersonSummary(id=1, name="Mom", pending_gifts=3),
            PersonSummary(id=2, name="Dad", pending_gifts=2),
        ]

        dashboard_service._get_primary_occasion = AsyncMock(return_value=mock_occasion)
        dashboard_service._get_people_needing_gifts = AsyncMock(return_value=mock_people)
        dashboard_service._count_by_status = AsyncMock(side_effect=[15, 5])
        dashboard_service._count_user_assignments = AsyncMock(return_value=7)

        # Act
        result = await dashboard_service.get_dashboard(user_id=42)

        # Assert
        assert isinstance(result, DashboardResponse)
        assert result.primary_occasion == mock_occasion
        assert len(result.people_needing_gifts) == 2
        assert result.total_ideas == 15
        assert result.total_purchased == 5
        assert result.my_assignments == 7

    @pytest.mark.asyncio
    async def test_get_dashboard_no_primary_occasion(
        self, dashboard_service: DashboardService
    ) -> None:
        """Test dashboard when no upcoming occasion exists."""
        # Arrange
        dashboard_service._get_primary_occasion = AsyncMock(return_value=None)
        dashboard_service._get_people_needing_gifts = AsyncMock(return_value=[])
        dashboard_service._count_by_status = AsyncMock(side_effect=[0, 0])
        dashboard_service._count_user_assignments = AsyncMock(return_value=0)

        # Act
        result = await dashboard_service.get_dashboard(user_id=42)

        # Assert
        assert result.primary_occasion is None
        assert result.people_needing_gifts == []
        assert result.total_ideas == 0
        assert result.total_purchased == 0
        assert result.my_assignments == 0

    @pytest.mark.asyncio
    async def test_get_primary_occasion_found(
        self, dashboard_service: DashboardService
    ) -> None:
        """Test getting primary occasion with item counts."""
        # Arrange
        from app.models.occasion import Occasion, OccasionType

        today = datetime.date.today()
        future_date = today + datetime.timedelta(days=30)

        mock_occasion = Occasion(
            id=1, name="Birthday", type=OccasionType.birthday, date=future_date
        )

        # Mock database queries
        mock_execute = AsyncMock()
        mock_execute.scalar_one_or_none = MagicMock(return_value=mock_occasion)

        mock_total = AsyncMock()
        mock_total.scalar = MagicMock(return_value=10)

        mock_purchased = AsyncMock()
        mock_purchased.scalar = MagicMock(return_value=3)

        dashboard_service.session.execute = AsyncMock(
            side_effect=[mock_execute, mock_total, mock_purchased]
        )

        # Act
        result = await dashboard_service._get_primary_occasion()

        # Assert
        assert result is not None
        assert result.id == 1
        assert result.name == "Birthday"
        assert result.days_until == 30
        assert result.total_items == 10
        assert result.purchased_items == 3

    @pytest.mark.asyncio
    async def test_get_primary_occasion_not_found(
        self, dashboard_service: DashboardService
    ) -> None:
        """Test getting primary occasion when no upcoming occasions exist."""
        # Arrange
        mock_execute = AsyncMock()
        mock_execute.scalar_one_or_none = MagicMock(return_value=None)

        dashboard_service.session.execute = AsyncMock(return_value=mock_execute)

        # Act
        result = await dashboard_service._get_primary_occasion()

        # Assert
        assert result is None

    @pytest.mark.asyncio
    async def test_get_people_needing_gifts(
        self, dashboard_service: DashboardService
    ) -> None:
        """Test getting people with pending gifts."""
        # Arrange
        from unittest.mock import MagicMock

        mock_row_1 = MagicMock()
        mock_row_1.id = 1
        mock_row_1.name = "Alice"
        mock_row_1.pending_gifts = 5

        mock_row_2 = MagicMock()
        mock_row_2.id = 2
        mock_row_2.name = "Bob"
        mock_row_2.pending_gifts = 3

        mock_execute = AsyncMock()
        mock_execute.all = MagicMock(return_value=[mock_row_1, mock_row_2])

        dashboard_service.session.execute = AsyncMock(return_value=mock_execute)

        # Act
        result = await dashboard_service._get_people_needing_gifts()

        # Assert
        assert len(result) == 2
        assert result[0].name == "Alice"
        assert result[0].pending_gifts == 5
        assert result[1].name == "Bob"
        assert result[1].pending_gifts == 3

    @pytest.mark.asyncio
    async def test_get_people_needing_gifts_empty(
        self, dashboard_service: DashboardService
    ) -> None:
        """Test getting people when no pending gifts exist."""
        # Arrange
        mock_execute = AsyncMock()
        mock_execute.all = MagicMock(return_value=[])

        dashboard_service.session.execute = AsyncMock(return_value=mock_execute)

        # Act
        result = await dashboard_service._get_people_needing_gifts()

        # Assert
        assert result == []

    @pytest.mark.asyncio
    async def test_count_by_status(
        self, dashboard_service: DashboardService
    ) -> None:
        """Test counting items by status."""
        # Arrange
        from app.models.list_item import ListItemStatus

        mock_execute = AsyncMock()
        mock_execute.scalar = MagicMock(return_value=15)

        dashboard_service.session.execute = AsyncMock(return_value=mock_execute)

        # Act
        result = await dashboard_service._count_by_status(ListItemStatus.idea)

        # Assert
        assert result == 15

    @pytest.mark.asyncio
    async def test_count_by_status_none_returns_zero(
        self, dashboard_service: DashboardService
    ) -> None:
        """Test count returns 0 when result is None."""
        # Arrange
        from app.models.list_item import ListItemStatus

        mock_execute = AsyncMock()
        mock_execute.scalar = MagicMock(return_value=None)

        dashboard_service.session.execute = AsyncMock(return_value=mock_execute)

        # Act
        result = await dashboard_service._count_by_status(ListItemStatus.idea)

        # Assert
        assert result == 0

    @pytest.mark.asyncio
    async def test_count_user_assignments(
        self, dashboard_service: DashboardService
    ) -> None:
        """Test counting assignments for a user."""
        # Arrange
        mock_execute = AsyncMock()
        mock_execute.scalar = MagicMock(return_value=7)

        dashboard_service.session.execute = AsyncMock(return_value=mock_execute)

        # Act
        result = await dashboard_service._count_user_assignments(user_id=42)

        # Assert
        assert result == 7

    @pytest.mark.asyncio
    async def test_count_user_assignments_none_returns_zero(
        self, dashboard_service: DashboardService
    ) -> None:
        """Test user assignments count returns 0 when None."""
        # Arrange
        mock_execute = AsyncMock()
        mock_execute.scalar = MagicMock(return_value=None)

        dashboard_service.session.execute = AsyncMock(return_value=mock_execute)

        # Act
        result = await dashboard_service._count_user_assignments(user_id=42)

        # Assert
        assert result == 0
