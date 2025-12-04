"""Integration tests for occasion endpoints."""

from typing import Any

import pytest
from httpx import AsyncClient

from app.models.occasion import Occasion


@pytest.mark.asyncio
async def test_create_occasion(
    client: AsyncClient,
    auth_headers: dict[str, str],
    sample_occasion_data: dict[str, Any],
) -> None:
    """Test creating an occasion."""
    response = await client.post(
        "/occasions", json=sample_occasion_data, headers=auth_headers
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == sample_occasion_data["name"]
    assert data["type"] == sample_occasion_data["type"]


@pytest.mark.asyncio
async def test_get_occasion(
    client: AsyncClient, auth_headers: dict[str, str], test_occasion: Occasion
) -> None:
    """Test getting an occasion by ID."""
    response = await client.get(f"/occasions/{test_occasion.id}", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_occasion.id
    assert data["name"] == test_occasion.name


@pytest.mark.asyncio
async def test_get_occasion_not_found(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    """Test getting non-existent occasion returns 404."""
    response = await client.get("/occasions/99999", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_occasions(
    client: AsyncClient, auth_headers: dict[str, str], test_occasion: Occasion
) -> None:
    """Test listing occasions."""
    response = await client.get("/occasions", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


@pytest.mark.asyncio
async def test_update_occasion(
    client: AsyncClient, auth_headers: dict[str, str], test_occasion: Occasion
) -> None:
    """Test updating an occasion."""
    update_data = {"name": "Updated Occasion"}

    response = await client.patch(
        f"/occasions/{test_occasion.id}", json=update_data, headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Occasion"


@pytest.mark.asyncio
async def test_delete_occasion(
    client: AsyncClient, auth_headers: dict[str, str], test_occasion: Occasion
) -> None:
    """Test deleting an occasion."""
    response = await client.delete(
        f"/occasions/{test_occasion.id}", headers=auth_headers
    )
    assert response.status_code == 204
