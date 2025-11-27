"""Integration tests for dashboard endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_dashboard(client: AsyncClient, auth_headers: dict[str, str]) -> None:
    """Test getting dashboard data."""
    response = await client.get("/dashboard", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()

    # Verify structure
    assert "primary_occasion" in data
    assert "people_needing_gifts" in data
    assert "total_ideas" in data
    assert "total_purchased" in data
    assert "my_assignments" in data

    # Verify types
    assert isinstance(data["people_needing_gifts"], list)
    assert isinstance(data["total_ideas"], int)
    assert isinstance(data["total_purchased"], int)
    assert isinstance(data["my_assignments"], int)


@pytest.mark.asyncio
async def test_get_dashboard_unauthenticated(client: AsyncClient) -> None:
    """Test getting dashboard without authentication returns 401."""
    response = await client.get("/dashboard")
    assert response.status_code in [401, 403]
