"""Unit tests for FieldOptionService."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, ValidationError
from app.models.field_option import FieldOption
from app.repositories.field_option import FieldOptionRepository
from app.schemas.field_option import (
    FieldOptionCreate,
    FieldOptionDeleteResponse,
    FieldOptionListResponse,
    FieldOptionResponse,
    FieldOptionUpdate,
)
from app.services.field_option import FieldOptionService


@pytest.fixture
def mock_field_option_repo() -> AsyncMock:
    """Create mock FieldOptionRepository."""
    return AsyncMock(spec=FieldOptionRepository)


@pytest.fixture
def field_option_service(mock_field_option_repo: AsyncMock) -> FieldOptionService:
    """Create FieldOptionService with mocked dependencies."""
    service = FieldOptionService(session=AsyncMock(spec=AsyncSession))
    service.repo = mock_field_option_repo
    return service


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


class TestFieldOptionServiceCreate:
    """Test suite for FieldOptionService.create_option method."""

    @pytest.mark.asyncio
    async def test_create_option_success(
        self,
        field_option_service: FieldOptionService,
        mock_field_option_repo: AsyncMock,
    ) -> None:
        """Test successful creation of field option."""
        data = FieldOptionCreate(
            entity="person",
            field_name="wine_types",
            value="cabernet",
            display_label="Cabernet Sauvignon",
            display_order=1,
        )

        created_option = build_field_option_stub(
            value="cabernet", display_label="Cabernet Sauvignon", display_order=1
        )
        mock_field_option_repo.create.return_value = created_option

        result = await field_option_service.create_option(data=data, current_user_id=123)

        assert isinstance(result, FieldOptionResponse)
        assert result.value == "cabernet"
        assert result.display_label == "Cabernet Sauvignon"
        assert result.display_order == 1
        assert result.is_system is False
        assert result.usage_count == 0

        # Verify repository was called with correct data
        call_args = mock_field_option_repo.create.call_args
        assert call_args.kwargs["created_by"] == 123
        assert call_args.kwargs["data"]["is_system"] is False

    @pytest.mark.asyncio
    async def test_create_option_invalid_entity(
        self, field_option_service: FieldOptionService
    ) -> None:
        """Test create_option raises ValidationError for invalid entity."""
        data = FieldOptionCreate(
            entity="person",  # Will be normalized
            field_name="wine_types",
            value="cabernet",
            display_label="Cabernet",
        )
        # Override the entity to invalid after creation
        data.entity = "invalid_entity"

        with pytest.raises(ValidationError) as exc_info:
            await field_option_service.create_option(data=data)

        assert exc_info.value.code == "INVALID_ENTITY"
        assert "invalid_entity" in exc_info.value.message

    @pytest.mark.asyncio
    async def test_create_option_invalid_field(
        self, field_option_service: FieldOptionService
    ) -> None:
        """Test create_option raises ValidationError for invalid field_name."""
        data = FieldOptionCreate(
            entity="person",
            field_name="invalid_field",
            value="test",
            display_label="Test",
        )

        with pytest.raises(ValidationError) as exc_info:
            await field_option_service.create_option(data=data)

        assert exc_info.value.code == "INVALID_FIELD"
        assert "invalid_field" in exc_info.value.message
        assert "person" in exc_info.value.message

    @pytest.mark.asyncio
    async def test_create_option_valid_gift_priority(
        self,
        field_option_service: FieldOptionService,
        mock_field_option_repo: AsyncMock,
    ) -> None:
        """Test creating option for gift.priority field."""
        data = FieldOptionCreate(
            entity="gift",
            field_name="priority",
            value="high",
            display_label="High Priority",
        )

        created_option = build_field_option_stub(
            entity="gift", field_name="priority", value="high"
        )
        mock_field_option_repo.create.return_value = created_option

        result = await field_option_service.create_option(data=data)

        assert result.entity == "gift"
        assert result.field_name == "priority"

    @pytest.mark.asyncio
    async def test_create_option_duplicate_propagates_error(
        self,
        field_option_service: FieldOptionService,
        mock_field_option_repo: AsyncMock,
    ) -> None:
        """Test that repository ValidationError propagates correctly."""
        data = FieldOptionCreate(
            entity="person",
            field_name="wine_types",
            value="cabernet",
            display_label="Cabernet",
        )

        mock_field_option_repo.create.side_effect = ValidationError(
            code="DUPLICATE_OPTION",
            message="Option already exists",
            details={},
        )

        with pytest.raises(ValidationError) as exc_info:
            await field_option_service.create_option(data=data)

        assert exc_info.value.code == "DUPLICATE_OPTION"


class TestFieldOptionServiceGetOption:
    """Test suite for FieldOptionService.get_option method."""

    @pytest.mark.asyncio
    async def test_get_option_success(
        self,
        field_option_service: FieldOptionService,
        mock_field_option_repo: AsyncMock,
    ) -> None:
        """Test successful retrieval of field option."""
        existing_option = build_field_option_stub(id=42)
        mock_field_option_repo.get_by_id.return_value = existing_option

        result = await field_option_service.get_option(option_id=42)

        assert isinstance(result, FieldOptionResponse)
        assert result.id == 42
        assert result.entity == "person"
        mock_field_option_repo.get_by_id.assert_awaited_once_with(42)

    @pytest.mark.asyncio
    async def test_get_option_not_found(
        self,
        field_option_service: FieldOptionService,
        mock_field_option_repo: AsyncMock,
    ) -> None:
        """Test get_option raises NotFoundError when option doesn't exist."""
        mock_field_option_repo.get_by_id.return_value = None

        with pytest.raises(NotFoundError) as exc_info:
            await field_option_service.get_option(option_id=999)

        assert exc_info.value.code == "FIELD_OPTION_NOT_FOUND"
        assert "999" in exc_info.value.message


class TestFieldOptionServiceGetOptions:
    """Test suite for FieldOptionService.get_options method."""

    @pytest.mark.asyncio
    async def test_get_options_success(
        self,
        field_option_service: FieldOptionService,
        mock_field_option_repo: AsyncMock,
    ) -> None:
        """Test successful retrieval of paginated options."""
        option1 = build_field_option_stub(id=1, value="cabernet")
        option2 = build_field_option_stub(id=2, value="merlot")
        option3 = build_field_option_stub(id=3, value="pinot")

        mock_field_option_repo.get_options.return_value = ([option1, option2, option3], 5)

        result = await field_option_service.get_options(
            entity="person", field_name="wine_types", skip=0, limit=3
        )

        assert isinstance(result, FieldOptionListResponse)
        assert len(result.items) == 3
        assert result.total == 5
        assert result.has_more is True
        assert result.next_cursor == 3  # Last item ID

        # Verify all items are DTOs
        for item in result.items:
            assert isinstance(item, FieldOptionResponse)

    @pytest.mark.asyncio
    async def test_get_options_invalid_entity(
        self, field_option_service: FieldOptionService
    ) -> None:
        """Test get_options raises ValidationError for invalid entity."""
        with pytest.raises(ValidationError) as exc_info:
            await field_option_service.get_options(
                entity="invalid_entity", field_name="some_field"
            )

        assert exc_info.value.code == "INVALID_ENTITY"
        assert "invalid_entity" in exc_info.value.message

    @pytest.mark.asyncio
    async def test_get_options_empty_list(
        self,
        field_option_service: FieldOptionService,
        mock_field_option_repo: AsyncMock,
    ) -> None:
        """Test get_options with no results."""
        mock_field_option_repo.get_options.return_value = ([], 0)

        result = await field_option_service.get_options(
            entity="person", field_name="wine_types"
        )

        assert len(result.items) == 0
        assert result.total == 0
        assert result.has_more is False
        assert result.next_cursor is None

    @pytest.mark.asyncio
    async def test_get_options_no_more_pages(
        self,
        field_option_service: FieldOptionService,
        mock_field_option_repo: AsyncMock,
    ) -> None:
        """Test get_options when no more pages available."""
        option1 = build_field_option_stub(id=1)
        option2 = build_field_option_stub(id=2)

        # Total is 2, skip=0, limit=10 -> no more pages
        mock_field_option_repo.get_options.return_value = ([option1, option2], 2)

        result = await field_option_service.get_options(
            entity="person", field_name="wine_types", skip=0, limit=10
        )

        assert result.has_more is False
        assert result.next_cursor is None

    @pytest.mark.asyncio
    async def test_get_options_includes_inactive(
        self,
        field_option_service: FieldOptionService,
        mock_field_option_repo: AsyncMock,
    ) -> None:
        """Test get_options passes include_inactive flag to repository."""
        mock_field_option_repo.get_options.return_value = ([], 0)

        await field_option_service.get_options(
            entity="person", field_name="wine_types", include_inactive=True
        )

        call_args = mock_field_option_repo.get_options.call_args
        assert call_args.kwargs["include_inactive"] is True


class TestFieldOptionServiceUpdateOption:
    """Test suite for FieldOptionService.update_option method."""

    @pytest.mark.asyncio
    async def test_update_option_success(
        self,
        field_option_service: FieldOptionService,
        mock_field_option_repo: AsyncMock,
    ) -> None:
        """Test successful update of field option."""
        existing_option = build_field_option_stub(
            id=1, display_label="Old Label", display_order=0
        )
        updated_option = build_field_option_stub(
            id=1, display_label="New Label", display_order=5
        )

        mock_field_option_repo.get_by_id.return_value = existing_option
        mock_field_option_repo.update.return_value = updated_option

        update_data = FieldOptionUpdate(display_label="New Label", display_order=5)
        result = await field_option_service.update_option(
            option_id=1, data=update_data, current_user_id=456
        )

        assert isinstance(result, FieldOptionResponse)
        assert result.display_label == "New Label"
        assert result.display_order == 5

        # Verify repository update was called correctly
        call_args = mock_field_option_repo.update.call_args
        assert call_args.kwargs["option_id"] == 1
        assert call_args.kwargs["updated_by"] == 456
        assert "display_label" in call_args.kwargs["data"]
        assert "display_order" in call_args.kwargs["data"]

    @pytest.mark.asyncio
    async def test_update_option_not_found(
        self,
        field_option_service: FieldOptionService,
        mock_field_option_repo: AsyncMock,
    ) -> None:
        """Test update_option raises NotFoundError when option doesn't exist."""
        mock_field_option_repo.get_by_id.return_value = None

        update_data = FieldOptionUpdate(display_label="New Label")

        with pytest.raises(NotFoundError) as exc_info:
            await field_option_service.update_option(option_id=999, data=update_data)

        assert exc_info.value.code == "FIELD_OPTION_NOT_FOUND"
        assert "999" in exc_info.value.message
        # Should not call update if option doesn't exist
        mock_field_option_repo.update.assert_not_awaited()

    @pytest.mark.asyncio
    async def test_update_option_partial_update(
        self,
        field_option_service: FieldOptionService,
        mock_field_option_repo: AsyncMock,
    ) -> None:
        """Test updating only display_label without display_order."""
        existing_option = build_field_option_stub(id=1)
        updated_option = build_field_option_stub(id=1, display_label="Updated")

        mock_field_option_repo.get_by_id.return_value = existing_option
        mock_field_option_repo.update.return_value = updated_option

        update_data = FieldOptionUpdate(display_label="Updated")
        result = await field_option_service.update_option(option_id=1, data=update_data)

        # Verify only display_label in update data
        call_args = mock_field_option_repo.update.call_args
        update_dict = call_args.kwargs["data"]
        assert "display_label" in update_dict
        assert "display_order" not in update_dict

    @pytest.mark.asyncio
    async def test_update_option_repository_returns_none(
        self,
        field_option_service: FieldOptionService,
        mock_field_option_repo: AsyncMock,
    ) -> None:
        """Test update_option handles edge case where repository update returns None."""
        existing_option = build_field_option_stub(id=1)
        mock_field_option_repo.get_by_id.return_value = existing_option
        mock_field_option_repo.update.return_value = None  # Edge case

        update_data = FieldOptionUpdate(display_label="New Label")

        with pytest.raises(NotFoundError) as exc_info:
            await field_option_service.update_option(option_id=1, data=update_data)

        assert exc_info.value.code == "FIELD_OPTION_NOT_FOUND"


class TestFieldOptionServiceDeleteOption:
    """Test suite for FieldOptionService.delete_option method."""

    @pytest.mark.asyncio
    async def test_delete_option_soft_delete(
        self,
        field_option_service: FieldOptionService,
        mock_field_option_repo: AsyncMock,
    ) -> None:
        """Test soft delete of field option."""
        existing_option = build_field_option_stub(id=1, is_system=False)
        soft_deleted_option = build_field_option_stub(id=1, is_active=False)

        mock_field_option_repo.get_by_id.return_value = existing_option
        mock_field_option_repo.soft_delete.return_value = soft_deleted_option

        result = await field_option_service.delete_option(
            option_id=1, hard_delete=False, current_user_id=789
        )

        assert isinstance(result, FieldOptionDeleteResponse)
        assert result.success is True
        assert result.soft_deleted is True
        assert result.id == 1
        mock_field_option_repo.soft_delete.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_delete_option_hard_delete_success(
        self,
        field_option_service: FieldOptionService,
        mock_field_option_repo: AsyncMock,
    ) -> None:
        """Test hard delete when option is not system and not in use."""
        existing_option = build_field_option_stub(id=1, is_system=False)

        mock_field_option_repo.get_by_id.return_value = existing_option
        mock_field_option_repo.hard_delete.return_value = True

        result = await field_option_service.delete_option(
            option_id=1, hard_delete=True
        )

        assert result.success is True
        assert result.soft_deleted is False
        assert "permanently deleted" in result.message
        mock_field_option_repo.hard_delete.assert_awaited_once_with(1)

    @pytest.mark.asyncio
    async def test_delete_option_hard_delete_system_fails(
        self,
        field_option_service: FieldOptionService,
        mock_field_option_repo: AsyncMock,
    ) -> None:
        """Test hard delete raises ValidationError for system options."""
        system_option = build_field_option_stub(id=1, is_system=True)

        mock_field_option_repo.get_by_id.return_value = system_option

        with pytest.raises(ValidationError) as exc_info:
            await field_option_service.delete_option(option_id=1, hard_delete=True)

        assert exc_info.value.code == "CANNOT_DELETE_SYSTEM_OPTION"
        assert "System options" in exc_info.value.message
        mock_field_option_repo.hard_delete.assert_not_awaited()

    @pytest.mark.asyncio
    async def test_delete_option_not_found(
        self,
        field_option_service: FieldOptionService,
        mock_field_option_repo: AsyncMock,
    ) -> None:
        """Test delete_option raises NotFoundError when option doesn't exist."""
        mock_field_option_repo.get_by_id.return_value = None

        with pytest.raises(NotFoundError) as exc_info:
            await field_option_service.delete_option(option_id=999)

        assert exc_info.value.code == "FIELD_OPTION_NOT_FOUND"
        assert "999" in exc_info.value.message

    @pytest.mark.asyncio
    async def test_delete_option_soft_delete_returns_none(
        self,
        field_option_service: FieldOptionService,
        mock_field_option_repo: AsyncMock,
    ) -> None:
        """Test soft delete when repository returns None."""
        existing_option = build_field_option_stub(id=1)

        mock_field_option_repo.get_by_id.return_value = existing_option
        mock_field_option_repo.soft_delete.return_value = None

        result = await field_option_service.delete_option(option_id=1)

        assert result.success is False
        assert "not found" in result.message

    @pytest.mark.asyncio
    async def test_delete_option_hard_delete_returns_false(
        self,
        field_option_service: FieldOptionService,
        mock_field_option_repo: AsyncMock,
    ) -> None:
        """Test hard delete when repository returns False."""
        existing_option = build_field_option_stub(id=1, is_system=False)

        mock_field_option_repo.get_by_id.return_value = existing_option
        mock_field_option_repo.hard_delete.return_value = False

        result = await field_option_service.delete_option(
            option_id=1, hard_delete=True
        )

        assert result.success is False
        assert "not found" in result.message


class TestFieldOptionServiceToResponse:
    """Test suite for FieldOptionService._to_response conversion."""

    @pytest.mark.asyncio
    async def test_to_response_conversion(
        self,
        field_option_service: FieldOptionService,
        mock_field_option_repo: AsyncMock,
    ) -> None:
        """Test ORM to DTO conversion in _to_response."""
        now = datetime.now(timezone.utc)
        orm_option = build_field_option_stub(
            id=42,
            entity="person",
            field_name="wine_types",
            value="cabernet",
            display_label="Cabernet Sauvignon",
            display_order=3,
            is_system=True,
            is_active=True,
            created_by=100,
            updated_by=200,
            created_at=now,
            updated_at=now,
        )

        # Test via get_option which uses _to_response
        mock_field_option_repo.get_by_id.return_value = orm_option

        result = await field_option_service.get_option(option_id=42)

        # Verify all fields are correctly mapped
        assert result.id == 42
        assert result.entity == "person"
        assert result.field_name == "wine_types"
        assert result.value == "cabernet"
        assert result.display_label == "Cabernet Sauvignon"
        assert result.display_order == 3
        assert result.is_system is True
        assert result.is_active is True
        assert result.created_by == 100
        assert result.updated_by == 200
        assert result.usage_count == 0  # Always 0 until TASK-2.2
        assert result.created_at == now
        assert result.updated_at == now
