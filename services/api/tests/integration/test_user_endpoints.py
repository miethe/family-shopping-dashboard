"""Integration tests for account deletion."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


@pytest.mark.asyncio
async def test_cannot_delete_another_user(
    client: AsyncClient, auth_headers: dict[str, str], async_session: AsyncSession
) -> None:
    other = User(email="other@example.com", password_hash="unused")
    async_session.add(other)
    await async_session.commit()
    await async_session.refresh(other)
    other_id = other.id

    response = await client.delete(f"/api/v1/users/{other_id}", headers=auth_headers)

    assert response.status_code == 403
    assert response.json()["error"]["code"] == "FORBIDDEN"
    assert await async_session.get(User, other_id) is not None


@pytest.mark.asyncio
async def test_delete_own_account(
    client: AsyncClient, auth_headers: dict[str, str], test_user: User,
    async_session: AsyncSession,
) -> None:
    user_id = test_user.id
    response = await client.delete(f"/api/v1/users/{user_id}", headers=auth_headers)

    assert response.status_code == 204
    assert await async_session.get(User, user_id) is None
