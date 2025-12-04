"""Integration tests for gift endpoints."""

from typing import Any

import pytest
from httpx import AsyncClient

from app.models.gift import Gift


@pytest.mark.asyncio
async def test_create_gift(
    client: AsyncClient, auth_headers: dict[str, str], sample_gift_data: dict[str, Any]
) -> None:
    """Test creating a gift."""
    response = await client.post("/gifts", json=sample_gift_data, headers=auth_headers)

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == sample_gift_data["name"]


@pytest.mark.asyncio
async def test_get_gift(
    client: AsyncClient, auth_headers: dict[str, str], test_gift: Gift
) -> None:
    """Test getting a gift by ID."""
    response = await client.get(f"/gifts/{test_gift.id}", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_gift.id
    assert data["name"] == test_gift.name


@pytest.mark.asyncio
async def test_get_gift_not_found(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    """Test getting non-existent gift returns 404."""
    response = await client.get("/gifts/99999", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_gifts(
    client: AsyncClient, auth_headers: dict[str, str], test_gift: Gift
) -> None:
    """Test listing gifts."""
    response = await client.get("/gifts", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


@pytest.mark.asyncio
async def test_search_gifts(
    client: AsyncClient, auth_headers: dict[str, str], test_gift: Gift
) -> None:
    """Test searching gifts by name."""
    response = await client.get(
        f"/gifts/search?q={test_gift.name}", headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_update_gift(
    client: AsyncClient, auth_headers: dict[str, str], test_gift: Gift
) -> None:
    """Test updating a gift."""
    update_data = {"name": "Updated Gift Name"}

    response = await client.patch(
        f"/gifts/{test_gift.id}", json=update_data, headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Gift Name"


@pytest.mark.asyncio
async def test_delete_gift(
    client: AsyncClient, auth_headers: dict[str, str], test_gift: Gift
) -> None:
    """Test deleting a gift."""
    response = await client.delete(f"/gifts/{test_gift.id}", headers=auth_headers)
    assert response.status_code == 204
