"""Integration tests for person endpoints."""

from typing import Any

import pytest
from httpx import AsyncClient

from app.models.person import Person


@pytest.mark.asyncio
async def test_create_person(
    client: AsyncClient, auth_headers: dict[str, str], sample_person_data: dict[str, Any]
) -> None:
    """Test creating a person."""
    # Act
    response = await client.post(
        "/persons", json=sample_person_data, headers=auth_headers
    )

    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["display_name"] == sample_person_data["display_name"]
    assert data["interests"] == sample_person_data["interests"]
    assert data["size_profile"] == sample_person_data["size_profile"]
    assert data["sizes"] == {"Shirt": "L", "Pants": "32x32"}
    assert data["advanced_interests"]["gift_preferences"]["gift_card_ok"] is False
    assert "id" in data


@pytest.mark.asyncio
async def test_create_person_unauthenticated(
    client: AsyncClient, sample_person_data: dict[str, Any]
) -> None:
    """Test creating person without authentication returns 401."""
    # Act
    response = await client.post("/persons", json=sample_person_data)

    # Assert
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_get_person(
    client: AsyncClient, auth_headers: dict[str, str], test_person: Person
) -> None:
    """Test getting a person by ID."""
    # Act
    response = await client.get(f"/persons/{test_person.id}", headers=auth_headers)

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_person.id
    assert data["display_name"] == test_person.display_name
    assert data["size_profile"][0]["type"] == "Shirt"
    assert data["sizes"]["Shirt"] == "M"


@pytest.mark.asyncio
async def test_get_person_not_found(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    """Test getting non-existent person returns 404."""
    # Act
    response = await client.get("/persons/99999", headers=auth_headers)

    # Assert
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_persons(
    client: AsyncClient, auth_headers: dict[str, str], test_person: Person
) -> None:
    """Test listing persons."""
    # Act
    response = await client.get("/persons", headers=auth_headers)

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "items" in data
    assert isinstance(data["items"], list)
    assert data["items"][0]["display_name"] == test_person.display_name


@pytest.mark.asyncio
async def test_update_person(
    client: AsyncClient, auth_headers: dict[str, str], test_person: Person
) -> None:
    """Test updating a person."""
    # Arrange
    update_data = {
        "display_name": "Updated Name",
        "interests": ["New Interest"],
        "advanced_interests": {"food_and_drink": {"likes_wine": True}},
    }

    # Act
    response = await client.patch(
        f"/persons/{test_person.id}", json=update_data, headers=auth_headers
    )

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["display_name"] == "Updated Name"
    assert data["interests"] == ["New Interest"]
    assert data["advanced_interests"]["food_and_drink"]["likes_wine"] is True


@pytest.mark.asyncio
async def test_update_person_not_found(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    """Test updating non-existent person returns 404."""
    # Arrange
    update_data = {"display_name": "New Name"}

    # Act
    response = await client.patch(
        "/persons/99999", json=update_data, headers=auth_headers
    )

    # Assert
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_person(
    client: AsyncClient, auth_headers: dict[str, str], test_person: Person
) -> None:
    """Test deleting a person."""
    # Act
    response = await client.delete(f"/persons/{test_person.id}", headers=auth_headers)

    # Assert
    assert response.status_code == 204


@pytest.mark.asyncio
async def test_delete_person_not_found(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    """Test deleting non-existent person returns 404."""
    # Act
    response = await client.delete("/persons/99999", headers=auth_headers)

    # Assert
    assert response.status_code == 404
