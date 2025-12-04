"""Integration tests for authentication endpoints."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.services.auth import AuthService


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient) -> None:
    """Test successful user registration."""
    # Arrange
    user_data = {
        "email": "newuser@example.com",
        "username": "newuser",
        "password": "password123",
    }

    # Act
    response = await client.post("/auth/register", json=user_data)

    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["username"] == "newuser"
    assert "id" in data
    assert "password" not in data
    assert "hashed_password" not in data


@pytest.mark.asyncio
async def test_register_duplicate_email(
    client: AsyncClient, test_user: User
) -> None:
    """Test registration with duplicate email returns error."""
    # Arrange
    user_data = {
        "email": test_user.email,  # Duplicate email
        "username": "different",
        "password": "password123",
    }

    # Act
    response = await client.post("/auth/register", json=user_data)

    # Assert
    assert response.status_code == 400
    data = response.json()
    assert "error" in data


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, test_user: User) -> None:
    """Test successful login returns user and token."""
    # Arrange
    login_data = {"email": test_user.email, "password": "password123"}

    # Act
    response = await client.post("/auth/login", json=login_data)

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
    response = await client.post("/auth/login", json=login_data)

    # Assert
    assert response.status_code == 401
    data = response.json()
    assert "error" in data


@pytest.mark.asyncio
async def test_login_wrong_password(
    client: AsyncClient, test_user: User
) -> None:
    """Test login with correct email but wrong password returns 401."""
    # Arrange
    login_data = {"email": test_user.email, "password": "wrongpassword"}

    # Act
    response = await client.post("/auth/login", json=login_data)

    # Assert
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_authenticated(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    """Test getting current user profile with valid token."""
    # Act
    response = await client.get("/auth/me", headers=auth_headers)

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
    response = await client.get("/auth/me")

    # Assert
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_get_current_user_invalid_token(client: AsyncClient) -> None:
    """Test getting current user with invalid token returns 401."""
    # Arrange
    headers = {"Authorization": "Bearer invalid_token_here"}

    # Act
    response = await client.get("/auth/me", headers=headers)

    # Assert
    assert response.status_code in [401, 403]


@pytest.mark.asyncio
async def test_refresh_token_authenticated(
    client: AsyncClient, auth_headers: dict[str, str]
) -> None:
    """Test refreshing token with valid token."""
    # Act
    response = await client.post("/auth/refresh", headers=auth_headers)

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
    response = await client.post("/auth/refresh")

    # Assert
    assert response.status_code in [401, 403]
