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
        "status": "idea",
        "notes": "Test notes",
    }

    # Items are created through the nested list resource (POST /lists/{id}/items)
    response = await client.post(
        f"/api/v1/lists/{test_list.id}/items", json=item_data, headers=auth_headers
    )

    assert response.status_code == 201
    data = response.json()
    assert data["gift_id"] == test_gift.id
    assert data["list_id"] == test_list.id
    assert data["status"] == "idea"


@pytest.mark.asyncio
async def test_get_list_items_for_list(
    client: AsyncClient, auth_headers: dict[str, str], test_list_item: ListItem
) -> None:
    """Test getting all list items for a list."""
    response = await client.get(
        f"/api/v1/lists/{test_list_item.list_id}/items", headers=auth_headers
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

    response = await client.put(
        f"/api/v1/list-items/{test_list_item.id}/status",
        json=update_data,
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "selected"


@pytest.mark.asyncio
async def test_update_list_item_status_skip_transition_allowed(
    client: AsyncClient, auth_headers: dict[str, str], test_list_item: ListItem
) -> None:
    """Any-to-any transitions are allowed for the Kanban board (784b755)."""
    response = await client.put(
        f"/api/v1/list-items/{test_list_item.id}/status",
        json={"status": "purchased"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json()["status"] == "purchased"


@pytest.mark.asyncio
async def test_update_list_item_status_unknown_status_rejected(
    client: AsyncClient, auth_headers: dict[str, str], test_list_item: ListItem
) -> None:
    """A status outside the lifecycle is rejected by request validation."""
    response = await client.put(
        f"/api/v1/list-items/{test_list_item.id}/status",
        json={"status": "shipped"},
        headers=auth_headers,
    )

    assert response.status_code == 422
    assert "error" in response.json()


@pytest.mark.asyncio
async def test_assign_list_item(
    client: AsyncClient, auth_headers: dict[str, str], test_list_item: ListItem
) -> None:
    """Test assigning list item to a user."""
    assign_data = {"assigned_to_id": 1}

    response = await client.put(
        f"/api/v1/list-items/{test_list_item.id}/assign",
        json=assign_data,
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["assigned_to"] == 1
