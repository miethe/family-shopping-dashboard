"""Unit tests for PersonService with advanced interests and size profile support."""

from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.person import PersonRepository
from app.schemas.person import PersonCreate, PersonResponse, PersonUpdate, SizeEntry
from app.services.person import PersonService
from app.services.person_occasion_hooks import PersonOccasionHooks


def build_person_stub(**overrides: object) -> SimpleNamespace:
    """Create a simple object that matches PersonResponse attributes."""
    now = datetime.now(timezone.utc)
    base = {
        "id": 1,
        "display_name": "Jane Doe",
        "relationship": None,
        "birthdate": None,
        "anniversary": None,
        "notes": None,
        "interests": ["Reading"],
        "size_profile": [{"type": "Shirt", "value": "M"}],
        "sizes": {"Shirt": "M"},
        "advanced_interests": None,
        "constraints": None,
        "photo_url": None,
        "groups": [],
        "occasion_ids": [],
        "created_at": now,
        "updated_at": now,
    }
    base.update(overrides)
    return SimpleNamespace(**base)


@pytest.fixture
def mock_person_repo() -> AsyncMock:
    """Create mock PersonRepository."""
    return AsyncMock(spec=PersonRepository)


@pytest.fixture
def person_service(mock_person_repo: AsyncMock) -> PersonService:
    """Create PersonService with mocked dependencies."""
    service = PersonService(session=AsyncMock(spec=AsyncSession))
    service.repo = mock_person_repo
    service.hooks = AsyncMock(spec=PersonOccasionHooks)
    return service


class TestPersonService:
    """Test suite for PersonService."""

    @pytest.mark.asyncio
    async def test_create_person_sets_legacy_sizes(
        self, person_service: PersonService, mock_person_repo: AsyncMock
    ) -> None:
        """Ensure size_profile drives legacy sizes map on create."""
        person_data = PersonCreate(
            display_name="John Doe",
            interests=["Running"],
            size_profile=[SizeEntry(type="Shirt", value="M", fit="Slim")],
            group_ids=[],
        )

        created_stub = build_person_stub(
            size_profile=[{"type": "Shirt", "value": "M", "fit": "Slim"}],
            sizes={"Shirt": "M"},
        )
        mock_person_repo.create.return_value = created_stub
        mock_person_repo.get_with_groups.return_value = created_stub

        result = await person_service.create(person_data)

        payload = mock_person_repo.create.await_args.args[0]
        assert payload["sizes"] == {"Shirt": "M"}
        assert result.size_profile[0].fit == "Slim"
        person_service.hooks.on_person_created.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_create_person_backfills_size_profile_from_legacy(
        self, person_service: PersonService, mock_person_repo: AsyncMock
    ) -> None:
        """Legacy sizes input should backfill size_profile."""
        person_data = PersonCreate(
            display_name="Legacy User",
            sizes={"Hat": "M"},
            group_ids=[],
        )

        created_stub = build_person_stub(
            size_profile=[{"type": "Hat", "value": "M"}],
            sizes={"Hat": "M"},
        )
        mock_person_repo.create.return_value = created_stub
        mock_person_repo.get_with_groups.return_value = created_stub

        result = await person_service.create(person_data)

        payload = mock_person_repo.create.await_args.args[0]
        assert payload["size_profile"] == [{"type": "Hat", "value": "M"}]
        assert result.sizes == {"Hat": "M"}

    @pytest.mark.asyncio
    async def test_update_person_applies_size_profile(
        self, person_service: PersonService, mock_person_repo: AsyncMock
    ) -> None:
        """Update should normalize size_profile and legacy sizes."""
        existing_person = build_person_stub()
        updated_stub = build_person_stub(
            size_profile=[{"type": "Pants", "value": "32"}], sizes={"Pants": "32"}
        )

        mock_person_repo.get.return_value = existing_person
        mock_person_repo.update.return_value = updated_stub
        mock_person_repo.get_with_groups.return_value = updated_stub

        update_data = PersonUpdate(
            size_profile=[SizeEntry(type="Pants", value="32")],
            interests=["New Interest"],
        )

        result = await person_service.update(person_id=1, data=update_data)

        payload = mock_person_repo.update.await_args.args[1]
        assert payload["sizes"] == {"Pants": "32"}
        assert result.size_profile[0].type == "Pants"
        person_service.hooks.on_person_updated.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_update_person_not_found(
        self, person_service: PersonService, mock_person_repo: AsyncMock
    ) -> None:
        """Return None when updating a missing person."""
        mock_person_repo.get.return_value = None

        result = await person_service.update(
            person_id=999, data=PersonUpdate(display_name="Ghost")
        )

        assert result is None
        mock_person_repo.update.assert_not_awaited()

    @pytest.mark.asyncio
    async def test_list_persons_returns_responses(
        self, person_service: PersonService, mock_person_repo: AsyncMock
    ) -> None:
        """List should convert ORM objects to PersonResponse instances."""
        people = [
            build_person_stub(id=1, display_name="A"),
            build_person_stub(id=2, display_name="B"),
        ]
        mock_person_repo.get_multi_with_group_filter.return_value = (people, True, 2)

        items, has_more, next_cursor = await person_service.list(limit=2)

        assert isinstance(items[0], PersonResponse)
        assert items[0].display_name == "A"
        assert has_more is True
        assert next_cursor == 2
