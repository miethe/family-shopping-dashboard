"""Integration tests for list item endpoints with status transitions."""

import pytest
from httpx import AsyncClient

from app.models.gift import Gift
from app.models.list import List
from app.models.list_item import ListItem


@pytest.mark.asyncio
async def test_create_list_item(
    client: AsyncClient,
    auth_headers: dict[str, str],
    test_gift: Gift,
    test_list: List,
) -> None:
    """Test creating a list item."""
    item_data = {
        "gift_id": test_gift.id,
        "list_id": test_list.id,
        "status": "idea",
        "notes": "Test notes",
    }

    response = await client.post("/list-items", json=item_data, headers=auth_headers)

    assert response.status_code == 201
    data = response.json()
    assert data["gift_id"] == test_gift.id
    assert data["list_id"] == test_list.id
    assert data["status"] == "idea"


@pytest.mark.asyncio
async def test_get_list_item(
    client: AsyncClient, auth_headers: dict[str, str], test_list_item: ListItem
) -> None:
    """Test getting a list item by ID."""
    response = await client.get(
        f"/list-items/{test_list_item.id}", headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_list_item.id


@pytest.mark.asyncio
async def test_get_list_items_for_list(
    client: AsyncClient, auth_headers: dict[str, str], test_list_item: ListItem
) -> None:
    """Test getting all list items for a list."""
    response = await client.get(
        f"/lists/{test_list_item.list_id}/items", headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


@pytest.mark.asyncio
async def test_update_list_item_status_valid_transition(
    client: AsyncClient, auth_headers: dict[str, str], test_list_item: ListItem
) -> None:
    """Test valid status transition: IDEA → SELECTED."""
    update_data = {"status": "selected"}

    response = await client.patch(
        f"/list-items/{test_list_item.id}/status",
        json=update_data,
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "selected"


@pytest.mark.asyncio
async def test_update_list_item_status_invalid_transition(
    client: AsyncClient, auth_headers: dict[str, str], test_list_item: ListItem
) -> None:
    """Test invalid status transition returns 400."""
    # IDEA → PURCHASED is invalid (must go through SELECTED)
    update_data = {"status": "purchased"}

    response = await client.patch(
        f"/list-items/{test_list_item.id}/status",
        json=update_data,
        headers=auth_headers,
    )

    assert response.status_code == 400
    data = response.json()
    assert "error" in data


@pytest.mark.asyncio
async def test_assign_list_item(
    client: AsyncClient, auth_headers: dict[str, str], test_list_item: ListItem
) -> None:
    """Test assigning list item to a user."""
    assign_data = {"assigned_to": 1}

    response = await client.patch(
        f"/list-items/{test_list_item.id}/assign",
        json=assign_data,
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["assigned_to"] == 1


@pytest.mark.asyncio
async def test_delete_list_item(
    client: AsyncClient, auth_headers: dict[str, str], test_list_item: ListItem
) -> None:
    """Test deleting a list item."""
    response = await client.delete(
        f"/list-items/{test_list_item.id}", headers=auth_headers
    )
    assert response.status_code == 204
