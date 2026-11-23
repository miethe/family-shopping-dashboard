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
        "/api/v1/persons", json=sample_person_data, headers=auth_headers
    )

    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["display_name"] == sample_person_data["display_name"]
    assert data["interests"] == sample_person_data["interests"]
    # SizeEntry also serializes its optional fit/brand/notes fields (as null)
    assert [
        {"type": e["type"], "value": e["value"]} for e in data["size_profile"]
    ] == sample_person_data["size_profile"]
    assert data["sizes"] == {"Shirt": "L", "Pants": "32x32"}
    assert data["advanced_interests"]["gift_preferences"]["gift_card_ok"] is False
    assert "id" in data


@pytest.mark.asyncio
async def test_create_person_unauthenticated(
    client: AsyncClient, sample_person_data: dict[str, Any]
) -> None:
    """Test creating person without authentication returns 401."""
    # Act
    response = await client.post("/api/v1/persons", json=sample_person_data)

    # Assert
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_get_person(
    client: AsyncClient, auth_headers: dict[str, str], test_person: Person
) -> None:
    """Test getting a person by ID."""
    # Act
    response = await client.get(f"/api/v1/persons/{test_person.id}", headers=auth_headers)

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
    response = await client.get("/api/v1/persons/99999", headers=auth_headers)

    # Assert
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_persons(
    client: AsyncClient, auth_headers: dict[str, str], test_person: Person
) -> None:
    """Test listing persons."""
    # Act
    response = await client.get("/api/v1/persons", headers=auth_headers)

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
    response = await client.put(
        f"/api/v1/persons/{test_person.id}", json=update_data, headers=auth_headers
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
    response = await client.put(
        "/api/v1/persons/99999", json=update_data, headers=auth_headers
    )

    # Assert
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_person(
    client: AsyncClient, auth_headers: dict[str, str], test_person: Person
) -> None:
    """Test deleting a person."""
    # Act
    response = await client.delete(f"/api/v1/persons/{test_person.id}", headers=auth_headers)

    # Assert
    assert response.status_code == 204


@pytest.mark.asyncio
async def test_delete_person_not_found(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    """Test deleting non-existent person returns 404."""
    # Act
    response = await client.delete("/api/v1/persons/99999", headers=auth_headers)

    # Assert
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_person_with_group_round_trip(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    """Creating and reading a person preserves their group in responses."""
    group_response = await client.post(
        "/api/v1/groups",
        json={"name": "Orchard Circle", "color": "#123456"},
        headers=auth_headers,
    )
    assert group_response.status_code == 201
    group = group_response.json()
    expected_group = {"id": group["id"], "name": "Orchard Circle", "color": "#123456"}

    created = await client.post(
        "/api/v1/persons",
        json={"display_name": "Avery Orchard", "group_ids": [group["id"]]},
        headers=auth_headers,
    )
    assert created.status_code == 201
    assert created.json()["groups"] == [expected_group]
    person_id = created.json()["id"]

    listed = await client.get("/api/v1/persons", headers=auth_headers)
    assert listed.status_code == 200
    listed_person = next(p for p in listed.json()["items"] if p["id"] == person_id)
    assert listed_person["groups"] == [expected_group]

    fetched = await client.get(f"/api/v1/persons/{person_id}", headers=auth_headers)
    assert fetched.status_code == 200
    assert fetched.json()["groups"] == [expected_group]
