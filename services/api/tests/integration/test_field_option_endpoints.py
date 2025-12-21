"""Integration tests for field option API endpoints."""

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.field_option import FieldOption


@pytest_asyncio.fixture
async def sample_option(async_session: AsyncSession) -> FieldOption:
    """Create a sample field option for testing."""
    option = FieldOption(
        entity="person",
        field_name="wine_types",
        value="test_wine",
        display_label="Test Wine",
        display_order=99,
        is_system=False,
        is_active=True,
    )
    async_session.add(option)
    await async_session.commit()
    return option


@pytest_asyncio.fixture
async def system_option(async_session: AsyncSession) -> FieldOption:
    """Create a system field option (immutable)."""
    option = FieldOption(
        entity="gift",
        field_name="priority",
        value="critical",
        display_label="Critical",
        display_order=0,
        is_system=True,
        is_active=True,
    )
    async_session.add(option)
    await async_session.commit()
    return option


class TestListFieldOptions:
    """Tests for GET /api/v1/field-options endpoint."""

    @pytest.mark.asyncio
    async def test_list_options_requires_entity(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ) -> None:
        response = await client.get(
            "/api/v1/field-options",
            params={"field_name": "wine_types"},
            headers=auth_headers,
        )
        assert response.status_code == 422  # Missing required entity

    @pytest.mark.asyncio
    async def test_list_options_empty(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ) -> None:
        response = await client.get(
            "/api/v1/field-options",
            params={"entity": "person", "field_name": "wine_types"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0

    @pytest.mark.asyncio
    async def test_list_options_with_data(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_option: FieldOption,
    ) -> None:
        response = await client.get(
            "/api/v1/field-options",
            params={"entity": "person", "field_name": "wine_types"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["value"] == "test_wine"

    @pytest.mark.asyncio
    async def test_list_options_pagination(
        self, client: AsyncClient, auth_headers: dict[str, str], async_session: AsyncSession
    ) -> None:
        # Create multiple options
        for i in range(5):
            option = FieldOption(
                entity="person",
                field_name="wine_types",
                value=f"wine_{i}",
                display_label=f"Wine {i}",
                display_order=i,
            )
            async_session.add(option)
        await async_session.commit()

        # Get first page
        response = await client.get(
            "/api/v1/field-options",
            params={"entity": "person", "field_name": "wine_types", "limit": 2},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 2
        assert data["total"] == 5


class TestCreateFieldOption:
    """Tests for POST /api/v1/field-options endpoint."""

    @pytest.mark.asyncio
    async def test_create_option_success(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ) -> None:
        response = await client.post(
            "/api/v1/field-options",
            json={
                "entity": "person",
                "field_name": "wine_types",
                "value": "cabernet",
                "display_label": "Cabernet Sauvignon",
                "display_order": 5,
            },
            headers=auth_headers,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["value"] == "cabernet"
        assert data["display_label"] == "Cabernet Sauvignon"
        assert data["is_system"] is False

    @pytest.mark.asyncio
    async def test_create_option_invalid_entity(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ) -> None:
        response = await client.post(
            "/api/v1/field-options",
            json={
                "entity": "invalid",
                "field_name": "wine_types",
                "value": "test",
                "display_label": "Test",
            },
            headers=auth_headers,
        )
        assert response.status_code == 422  # Pydantic validation

    @pytest.mark.asyncio
    async def test_create_option_duplicate(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_option: FieldOption,
    ) -> None:
        response = await client.post(
            "/api/v1/field-options",
            json={
                "entity": "person",
                "field_name": "wine_types",
                "value": "test_wine",  # Same as sample_option
                "display_label": "Another Label",
            },
            headers=auth_headers,
        )
        assert response.status_code == 400  # Duplicate


class TestGetFieldOption:
    """Tests for GET /api/v1/field-options/{option_id} endpoint."""

    @pytest.mark.asyncio
    async def test_get_option_success(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_option: FieldOption,
    ) -> None:
        response = await client.get(
            f"/api/v1/field-options/{sample_option.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_option.id
        assert data["value"] == "test_wine"

    @pytest.mark.asyncio
    async def test_get_option_not_found(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ) -> None:
        response = await client.get(
            "/api/v1/field-options/99999",
            headers=auth_headers,
        )
        assert response.status_code == 404


class TestUpdateFieldOption:
    """Tests for PUT /api/v1/field-options/{option_id} endpoint."""

    @pytest.mark.asyncio
    async def test_update_label_success(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_option: FieldOption,
    ) -> None:
        response = await client.put(
            f"/api/v1/field-options/{sample_option.id}",
            json={"display_label": "Updated Label"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["display_label"] == "Updated Label"

    @pytest.mark.asyncio
    async def test_update_order_success(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_option: FieldOption,
    ) -> None:
        response = await client.put(
            f"/api/v1/field-options/{sample_option.id}",
            json={"display_order": 50},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["display_order"] == 50

    @pytest.mark.asyncio
    async def test_update_not_found(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ) -> None:
        response = await client.put(
            "/api/v1/field-options/99999",
            json={"display_label": "Test"},
            headers=auth_headers,
        )
        assert response.status_code == 404


class TestDeleteFieldOption:
    """Tests for DELETE /api/v1/field-options/{option_id} endpoint."""

    @pytest.mark.asyncio
    async def test_soft_delete_success(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_option: FieldOption,
    ) -> None:
        response = await client.delete(
            f"/api/v1/field-options/{sample_option.id}",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["soft_deleted"] is True

    @pytest.mark.asyncio
    async def test_hard_delete_success(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        sample_option: FieldOption,
    ) -> None:
        response = await client.delete(
            f"/api/v1/field-options/{sample_option.id}",
            params={"hard_delete": True},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["soft_deleted"] is False

    @pytest.mark.asyncio
    async def test_hard_delete_system_option_fails(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        system_option: FieldOption,
    ) -> None:
        response = await client.delete(
            f"/api/v1/field-options/{system_option.id}",
            params={"hard_delete": True},
            headers=auth_headers,
        )
        assert response.status_code == 400  # Cannot hard-delete system option

    @pytest.mark.asyncio
    async def test_delete_not_found(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ) -> None:
        response = await client.delete(
            "/api/v1/field-options/99999",
            headers=auth_headers,
        )
        assert response.status_code == 404
