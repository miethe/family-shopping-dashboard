"""Integration tests for list endpoints."""

from typing import Any

import pytest
from httpx import AsyncClient

from app.models.list import List
from app.models.occasion import Occasion
from app.models.person import Person


@pytest.mark.asyncio
async def test_create_list(
    client: AsyncClient,
    auth_headers: dict[str, str],
    sample_list_data: dict[str, Any],
    test_person: Person,
    test_occasion: Occasion,
) -> None:
    """Test creating a list."""
    list_data = {
        **sample_list_data,
        "person_id": test_person.id,
        "occasion_id": test_occasion.id,
    }

    response = await client.post("/lists", json=list_data, headers=auth_headers)

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == sample_list_data["name"]
    assert data["person_id"] == test_person.id


@pytest.mark.asyncio
async def test_get_list(
    client: AsyncClient, auth_headers: dict[str, str], test_list: List
) -> None:
    """Test getting a list by ID."""
    response = await client.get(f"/lists/{test_list.id}", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_list.id
    assert data["name"] == test_list.name


@pytest.mark.asyncio
async def test_list_all_lists(
    client: AsyncClient, auth_headers: dict[str, str], test_list: List
) -> None:
    """Test listing all lists."""
    response = await client.get("/lists", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


@pytest.mark.asyncio
async def test_filter_lists_by_person(
    client: AsyncClient, auth_headers: dict[str, str], test_list: List
) -> None:
    """Test filtering lists by person."""
    response = await client.get(
        f"/lists?person_id={test_list.person_id}", headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_update_list(
    client: AsyncClient, auth_headers: dict[str, str], test_list: List
) -> None:
    """Test updating a list."""
    update_data = {"name": "Updated List Name"}

    response = await client.patch(
        f"/lists/{test_list.id}", json=update_data, headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated List Name"


@pytest.mark.asyncio
async def test_delete_list(
    client: AsyncClient, auth_headers: dict[str, str], test_list: List
) -> None:
    """Test deleting a list."""
    response = await client.delete(f"/lists/{test_list.id}", headers=auth_headers)
    assert response.status_code == 204
