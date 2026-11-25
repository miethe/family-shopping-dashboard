"""Integration tests for authentication endpoints."""

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, settings
from app.models.user import User


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient, monkeypatch: pytest.MonkeyPatch) -> None:
    """Test successful user registration."""
    monkeypatch.setattr(settings, "APPLE_HOUSEHOLD_EMAILS", "")
    monkeypatch.setattr(settings, "HOUSEHOLD_EMAILS", "")
    # Arrange
    user_data = {
        "email": "newuser@example.com",
        "password": "password123",
    }

    # Act
    response = await client.post("/api/v1/auth/register", json=user_data)

    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert "id" in data
    assert "password" not in data
    assert "hashed_password" not in data


@pytest.mark.parametrize(
    ("primary", "alias", "email"),
    [
        (" Family@EXAMPLE.COM ,", "", "family@example.com"),
        ("family@example.com", "", "FAMILY@example.com"),
        ("family@example.com", "", "outsider@example.com"),
        ("", " Family@EXAMPLE.COM ,", "family@example.com"),
        (" , , ", "family@example.com", "outsider@example.com"),
        ("family@example.com", "alias@example.com", "alias@example.com"),
    ],
)
@pytest.mark.asyncio
async def test_register_closed_for_every_address(
    client: AsyncClient,
    async_session: AsyncSession,
    monkeypatch: pytest.MonkeyPatch,
    primary: str,
    alias: str,
    email: str,
) -> None:
    monkeypatch.setenv("APPLE_HOUSEHOLD_EMAILS", primary)
    monkeypatch.setenv("HOUSEHOLD_EMAILS", alias)
    config = Settings(_env_file=None)
    monkeypatch.setattr(settings, "APPLE_HOUSEHOLD_EMAILS", config.APPLE_HOUSEHOLD_EMAILS)
    monkeypatch.setattr(settings, "HOUSEHOLD_EMAILS", config.HOUSEHOLD_EMAILS)
    response = await client.post(
        "/api/v1/auth/register", json={"email": email, "password": "password123"}
    )
    assert response.status_code == 403
    error = response.json()["error"]
    assert error["code"] == "REGISTRATION_CLOSED"
    assert error["message"] == (
        "Account registration is closed. Sign in with Apple or use your existing account."
    )
    assert error["trace_id"]
    assert not (await async_session.scalars(select(User.id))).all()


@pytest.mark.asyncio
async def test_closed_registration_rejects_incomplete_form(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(settings, "APPLE_HOUSEHOLD_EMAILS", "family@example.com")
    response = await client.post("/api/v1/auth/register", json={})
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "REGISTRATION_CLOSED"


@pytest.mark.asyncio
@pytest.mark.parametrize("configured", [False, True])
async def test_registration_setting_preserves_existing_login(
    client: AsyncClient, test_user: User, monkeypatch: pytest.MonkeyPatch, configured: bool
) -> None:
    # Existing accounts continue to work even when their address is outside the allowlist.
    monkeypatch.setattr(
        settings, "APPLE_HOUSEHOLD_EMAILS", "family@example.com" if configured else ""
    )
    monkeypatch.setattr(settings, "HOUSEHOLD_EMAILS", "")
    response = await client.post(
        "/api/v1/auth/login", json={"email": test_user.email, "password": "password123"}
    )
    assert response.status_code == 200
    assert response.json()["id"] == test_user.id
    assert response.json()["token"]["access_token"]


@pytest.mark.asyncio
@pytest.mark.parametrize(("use_uppercase", "expected"), [(False, 400), (True, 201)])
async def test_register_duplicate_email(
    client: AsyncClient,
    test_user: User,
    monkeypatch: pytest.MonkeyPatch,
    use_uppercase: bool,
    expected: int,
) -> None:
    """Empty allowlist preserves the legacy case-sensitive duplicate check."""
    monkeypatch.setattr(settings, "APPLE_HOUSEHOLD_EMAILS", "")
    monkeypatch.setattr(settings, "HOUSEHOLD_EMAILS", "")
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": test_user.email.upper() if use_uppercase else test_user.email,
            "password": "password123",
        },
    )
    assert response.status_code == expected
    if expected == 400:
        assert response.json()["error"]["code"] == "DUPLICATE_EMAIL"


@pytest.mark.asyncio
async def test_update_profile_requires_self(
    client: AsyncClient,
    test_user: User,
    auth_headers: dict[str, str],
    async_session: AsyncSession,
) -> None:
    other = User(email="other@example.com", password_hash="!")
    async_session.add(other)
    await async_session.commit()

    response = await client.put(
        f"/api/v1/users/{other.id}",
        headers=auth_headers,
        json={"email": "changed@example.com"},
    )

    assert response.status_code == 403
    assert response.json()["error"]["code"] == "PROFILE_UPDATE_FORBIDDEN"
    await async_session.refresh(other)
    assert other.email == "other@example.com"


@pytest.mark.parametrize(
    ("allowlist", "subject", "new_email"),
    [
        ("", "bound-subject", "outside@example.com"),
        ("TEST@example.com", None, "outside@example.com"),
        ("test@example.com", None, "TEST@example.com"),
        ("family@example.com", None, "FAMILY@example.com"),
        ("family@example.com", None, " family@example.com "),
    ],
)
@pytest.mark.asyncio
async def test_update_profile_rejects_protected_email_changes(
    client: AsyncClient,
    test_user: User,
    auth_headers: dict[str, str],
    async_session: AsyncSession,
    monkeypatch: pytest.MonkeyPatch,
    allowlist: str,
    subject: str | None,
    new_email: str,
) -> None:
    monkeypatch.setattr(settings, "APPLE_HOUSEHOLD_EMAILS", allowlist)
    monkeypatch.setattr(settings, "HOUSEHOLD_EMAILS", "")
    test_user.apple_subject = subject
    await async_session.commit()

    path = f"/api/v1/users/{test_user.id}"
    response = await client.put(path, headers=auth_headers, json={"email": new_email})

    assert response.status_code == 403
    assert response.json()["error"]["code"] == "PROFILE_EMAIL_LOCKED"
    await async_session.refresh(test_user)
    assert test_user.email == "test@example.com"

    response = await client.put(path, headers=auth_headers, json={})
    assert response.status_code == 200
    assert response.json()["email"] == test_user.email


@pytest.mark.asyncio
async def test_update_profile_allows_ordinary_self_email_change(
    client: AsyncClient,
    test_user: User,
    auth_headers: dict[str, str],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(settings, "APPLE_HOUSEHOLD_EMAILS", "family@example.com")
    response = await client.put(
        f"/api/v1/users/{test_user.id}",
        headers=auth_headers,
        json={"email": "changed@example.com"},
    )

    assert response.status_code == 200
    assert response.json()["email"] == "changed@example.com"
    profile = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert profile.status_code == 200
    assert profile.json() == response.json()


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, test_user: User) -> None:
    """Test successful login returns user and token."""
    # Arrange
    login_data = {"email": test_user.email, "password": "password123"}

    # Act
    response = await client.post("/api/v1/auth/login", json=login_data)

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email
    assert "token" in data
    assert "access_token" in data["token"]
    assert data["token"]["token_type"] == "bearer"
    assert data["token"]["expires_in"] == 86400


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient) -> None:
    """Test login with invalid credentials returns 401."""
    # Arrange
    login_data = {"email": "nonexistent@example.com", "password": "wrongpassword"}

    # Act
    response = await client.post("/api/v1/auth/login", json=login_data)

    # Assert
    assert response.status_code == 401
    data = response.json()
    assert "error" in data


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, test_user: User) -> None:
    """Test login with correct email but wrong password returns 401."""
    # Arrange
    login_data = {"email": test_user.email, "password": "wrongpassword"}

    # Act
    response = await client.post("/api/v1/auth/login", json=login_data)

    # Assert
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_authenticated(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    """Test getting current user profile with valid token."""
    # Act
    response = await client.get("/api/v1/auth/me", headers=auth_headers)

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert "email" in data
    assert "id" in data
    assert "password" not in data


@pytest.mark.asyncio
async def test_get_current_user_unauthenticated(client: AsyncClient) -> None:
    """Test getting current user without token returns 401."""
    # Act
    response = await client.get("/api/v1/auth/me")

    # Assert
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_get_current_user_invalid_token(client: AsyncClient) -> None:
    """Test getting current user with invalid token returns 401."""
    # Arrange
    headers = {"Authorization": "Bearer invalid_token_here"}

    # Act
    response = await client.get("/api/v1/auth/me", headers=headers)

    # Assert
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_refresh_token_authenticated(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    """Test refreshing token with valid token."""
    # Act
    response = await client.post("/api/v1/auth/refresh", headers=auth_headers)

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["expires_in"] == 86400


@pytest.mark.asyncio
async def test_refresh_token_unauthenticated(client: AsyncClient) -> None:
    """Test refreshing token without authentication returns 401."""
    # Act
    response = await client.post("/api/v1/auth/refresh")

    # Assert
    assert response.status_code in [401, 403]
