"""Unit tests for FieldOptionRepository."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ValidationError
from app.models.field_option import FieldOption
from app.repositories.field_option import FieldOptionRepository


@pytest.fixture
def mock_session() -> AsyncMock:
    """Create mock AsyncSession."""
    return AsyncMock(spec=AsyncSession)


@pytest.fixture
def field_option_repo(mock_session: AsyncMock) -> FieldOptionRepository:
    """Create FieldOptionRepository with mocked session."""
    return FieldOptionRepository(session=mock_session)


def build_field_option_stub(**overrides: object) -> FieldOption:
    """Create a FieldOption stub for testing."""
    now = datetime.now(timezone.utc)
    base = {
        "id": 1,
        "entity": "person",
        "field_name": "wine_types",
        "value": "cabernet",
        "display_label": "Cabernet Sauvignon",
        "display_order": 0,
        "is_system": False,
        "is_active": True,
        "created_by": None,
        "updated_by": None,
        "created_at": now,
        "updated_at": now,
    }
    base.update(overrides)
    option = MagicMock(spec=FieldOption)
    for key, val in base.items():
        setattr(option, key, val)
    return option


class TestFieldOptionRepositoryCreate:
    """Test suite for FieldOptionRepository.create method."""

    @pytest.mark.asyncio
    async def test_create_success(
        self, field_option_repo: FieldOptionRepository, mock_session: AsyncMock
    ) -> None:
        """Test successful creation of field option."""
        data = {
            "entity": "person",
            "field_name": "wine_types",
            "value": "cabernet",
            "display_label": "Cabernet Sauvignon",
            "display_order": 1,
        }

        # Mock session behavior
        mock_session.commit = AsyncMock()
        mock_session.refresh = AsyncMock()

        result = await field_option_repo.create(data=data, created_by=123)

        # Verify session operations
        mock_session.add.assert_called_once()
        mock_session.commit.assert_awaited_once()
        mock_session.refresh.assert_awaited_once()

        # Verify created_by was added
        added_option = mock_session.add.call_args[0][0]
        assert added_option.created_by == 123

    @pytest.mark.asyncio
    async def test_create_duplicate_raises_validation_error(
        self, field_option_repo: FieldOptionRepository, mock_session: AsyncMock
    ) -> None:
        """Test that duplicate option raises ValidationError."""
        data = {
            "entity": "person",
            "field_name": "wine_types",
            "value": "cabernet",
            "display_label": "Cabernet Sauvignon",
        }

        # Mock IntegrityError for unique constraint violation
        mock_session.commit = AsyncMock(
            side_effect=IntegrityError(
                statement="INSERT INTO field_options",
                params={},
                orig=Exception("uq_field_options_entity_field_value"),
            )
        )
        mock_session.rollback = AsyncMock()

        with pytest.raises(ValidationError) as exc_info:
            await field_option_repo.create(data=data)

        assert exc_info.value.code == "DUPLICATE_OPTION"
        assert "cabernet" in exc_info.value.message
        assert "person.wine_types" in exc_info.value.message
        mock_session.rollback.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_create_without_created_by(
        self, field_option_repo: FieldOptionRepository, mock_session: AsyncMock
    ) -> None:
        """Test creation without created_by parameter."""
        data = {
            "entity": "gift",
            "field_name": "priority",
            "value": "high",
            "display_label": "High Priority",
        }

        mock_session.commit = AsyncMock()
        mock_session.refresh = AsyncMock()

        result = await field_option_repo.create(data=data)

        # Verify created_by not added to data
        added_option = mock_session.add.call_args[0][0]
        assert not hasattr(added_option, "created_by") or added_option.created_by is None


class TestFieldOptionRepositoryGetById:
    """Test suite for FieldOptionRepository.get_by_id method."""

    @pytest.mark.asyncio
    async def test_get_by_id_found(
        self, field_option_repo: FieldOptionRepository, mock_session: AsyncMock
    ) -> None:
        """Test retrieving existing option by ID."""
        expected_option = build_field_option_stub(id=42)

        # Mock query result
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = expected_option
        mock_session.execute = AsyncMock(return_value=mock_result)

        result = await field_option_repo.get_by_id(option_id=42)

        assert result == expected_option
        mock_session.execute.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_get_by_id_not_found(
        self, field_option_repo: FieldOptionRepository, mock_session: AsyncMock
    ) -> None:
        """Test get_by_id returns None for non-existent option."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute = AsyncMock(return_value=mock_result)

        result = await field_option_repo.get_by_id(option_id=999)

        assert result is None


class TestFieldOptionRepositoryGetOptions:
    """Test suite for FieldOptionRepository.get_options method."""

    @pytest.mark.asyncio
    async def test_get_options_empty(
        self, field_option_repo: FieldOptionRepository, mock_session: AsyncMock
    ) -> None:
        """Test get_options returns empty list when no options exist."""
        # Mock empty results
        mock_options_result = MagicMock()
        mock_options_result.scalars.return_value.all.return_value = []
        mock_count_result = MagicMock()
        mock_count_result.scalar_one.return_value = 0

        mock_session.execute = AsyncMock(
            side_effect=[mock_options_result, mock_count_result]
        )

        options, total = await field_option_repo.get_options(
            entity="person", field_name="wine_types"
        )

        assert options == []
        assert total == 0

    @pytest.mark.asyncio
    async def test_get_options_with_data(
        self, field_option_repo: FieldOptionRepository, mock_session: AsyncMock
    ) -> None:
        """Test get_options returns sorted options."""
        option1 = build_field_option_stub(id=1, value="cabernet", display_order=2)
        option2 = build_field_option_stub(id=2, value="merlot", display_order=1)
        option3 = build_field_option_stub(id=3, value="pinot", display_order=3)

        # Mock results (repository sorts by display_order)
        mock_options_result = MagicMock()
        mock_options_result.scalars.return_value.all.return_value = [
            option2,
            option1,
            option3,
        ]
        mock_count_result = MagicMock()
        mock_count_result.scalar_one.return_value = 3

        mock_session.execute = AsyncMock(
            side_effect=[mock_options_result, mock_count_result]
        )

        options, total = await field_option_repo.get_options(
            entity="person", field_name="wine_types"
        )

        assert len(options) == 3
        assert total == 3
        # Verify sorted by display_order
        assert options[0].display_order == 1
        assert options[1].display_order == 2

    @pytest.mark.asyncio
    async def test_get_options_excludes_inactive(
        self, field_option_repo: FieldOptionRepository, mock_session: AsyncMock
    ) -> None:
        """Test get_options excludes inactive options by default."""
        active_option = build_field_option_stub(id=1, is_active=True)

        mock_options_result = MagicMock()
        mock_options_result.scalars.return_value.all.return_value = [active_option]
        mock_count_result = MagicMock()
        mock_count_result.scalar_one.return_value = 1

        mock_session.execute = AsyncMock(
            side_effect=[mock_options_result, mock_count_result]
        )

        options, total = await field_option_repo.get_options(
            entity="person", field_name="wine_types", include_inactive=False
        )

        assert len(options) == 1
        assert options[0].is_active is True

    @pytest.mark.asyncio
    async def test_get_options_includes_inactive(
        self, field_option_repo: FieldOptionRepository, mock_session: AsyncMock
    ) -> None:
        """Test get_options includes inactive when flag set."""
        active_option = build_field_option_stub(id=1, is_active=True)
        inactive_option = build_field_option_stub(id=2, is_active=False)

        mock_options_result = MagicMock()
        mock_options_result.scalars.return_value.all.return_value = [
            active_option,
            inactive_option,
        ]
        mock_count_result = MagicMock()
        mock_count_result.scalar_one.return_value = 2

        mock_session.execute = AsyncMock(
            side_effect=[mock_options_result, mock_count_result]
        )

        options, total = await field_option_repo.get_options(
            entity="person", field_name="wine_types", include_inactive=True
        )

        assert len(options) == 2
        assert total == 2

    @pytest.mark.asyncio
    async def test_get_options_pagination(
        self, field_option_repo: FieldOptionRepository, mock_session: AsyncMock
    ) -> None:
        """Test get_options respects skip and limit."""
        option1 = build_field_option_stub(id=1, display_order=1)
        option2 = build_field_option_stub(id=2, display_order=2)

        mock_options_result = MagicMock()
        mock_options_result.scalars.return_value.all.return_value = [option1, option2]
        mock_count_result = MagicMock()
        mock_count_result.scalar_one.return_value = 10

        mock_session.execute = AsyncMock(
            side_effect=[mock_options_result, mock_count_result]
        )

        options, total = await field_option_repo.get_options(
            entity="person", field_name="wine_types", skip=5, limit=2
        )

        assert len(options) == 2
        assert total == 10


class TestFieldOptionRepositoryGetAllForEntity:
    """Test suite for FieldOptionRepository.get_all_for_entity method."""

    @pytest.mark.asyncio
    async def test_get_all_for_entity(
        self, field_option_repo: FieldOptionRepository, mock_session: AsyncMock
    ) -> None:
        """Test retrieving all options for an entity."""
        option1 = build_field_option_stub(id=1, field_name="wine_types")
        option2 = build_field_option_stub(id=2, field_name="beverage_prefs")

        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [option1, option2]
        mock_session.execute = AsyncMock(return_value=mock_result)

        result = await field_option_repo.get_all_for_entity(entity="person")

        assert len(result) == 2
        assert result[0].field_name == "wine_types"
        assert result[1].field_name == "beverage_prefs"


class TestFieldOptionRepositoryUpdate:
    """Test suite for FieldOptionRepository.update method."""

    @pytest.mark.asyncio
    async def test_update_success(
        self, field_option_repo: FieldOptionRepository, mock_session: AsyncMock
    ) -> None:
        """Test successful update of field option."""
        existing_option = build_field_option_stub(
            id=1, display_label="Old Label", display_order=0
        )

        # Mock get_by_id
        mock_get_result = MagicMock()
        mock_get_result.scalar_one_or_none.return_value = existing_option
        mock_session.execute = AsyncMock(return_value=mock_get_result)
        mock_session.commit = AsyncMock()
        mock_session.refresh = AsyncMock()

        result = await field_option_repo.update(
            option_id=1,
            data={"display_label": "New Label", "display_order": 5},
            updated_by=456,
        )

        assert result == existing_option
        assert existing_option.display_label == "New Label"
        assert existing_option.display_order == 5
        assert existing_option.updated_by == 456
        mock_session.commit.assert_awaited_once()
        mock_session.refresh.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_update_not_found(
        self, field_option_repo: FieldOptionRepository, mock_session: AsyncMock
    ) -> None:
        """Test update returns None for non-existent option."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute = AsyncMock(return_value=mock_result)

        result = await field_option_repo.update(
            option_id=999, data={"display_label": "New Label"}
        )

        assert result is None
        mock_session.commit.assert_not_awaited()


class TestFieldOptionRepositorySoftDelete:
    """Test suite for FieldOptionRepository.soft_delete method."""

    @pytest.mark.asyncio
    async def test_soft_delete_success(
        self, field_option_repo: FieldOptionRepository, mock_session: AsyncMock
    ) -> None:
        """Test soft delete sets is_active to False."""
        existing_option = build_field_option_stub(id=1, is_active=True)

        # Mock get_by_id
        mock_get_result = MagicMock()
        mock_get_result.scalar_one_or_none.return_value = existing_option
        mock_session.execute = AsyncMock(return_value=mock_get_result)
        mock_session.commit = AsyncMock()
        mock_session.refresh = AsyncMock()

        result = await field_option_repo.soft_delete(option_id=1, updated_by=789)

        assert result == existing_option
        assert existing_option.is_active is False
        assert existing_option.updated_by == 789


class TestFieldOptionRepositoryHardDelete:
    """Test suite for FieldOptionRepository.hard_delete method."""

    @pytest.mark.asyncio
    async def test_hard_delete_success(
        self, field_option_repo: FieldOptionRepository, mock_session: AsyncMock
    ) -> None:
        """Test hard delete permanently removes option."""
        existing_option = build_field_option_stub(id=1)

        # Mock get_by_id
        mock_get_result = MagicMock()
        mock_get_result.scalar_one_or_none.return_value = existing_option
        mock_session.execute = AsyncMock(return_value=mock_get_result)
        mock_session.delete = AsyncMock()
        mock_session.commit = AsyncMock()

        result = await field_option_repo.hard_delete(option_id=1)

        assert result is True
        mock_session.delete.assert_awaited_once_with(existing_option)
        mock_session.commit.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_hard_delete_not_found(
        self, field_option_repo: FieldOptionRepository, mock_session: AsyncMock
    ) -> None:
        """Test hard delete returns False for non-existent option."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute = AsyncMock(return_value=mock_result)

        result = await field_option_repo.hard_delete(option_id=999)

        assert result is False
        mock_session.delete.assert_not_awaited()
        mock_session.commit.assert_not_awaited()
