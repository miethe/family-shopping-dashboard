"""Pytest configuration and fixtures for API tests."""

import asyncio
from collections.abc import AsyncGenerator, Generator
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Any

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import Settings, settings
from app.core.database import Base, get_db
from app.main import app
from app.models.comment import Comment, CommentParentType
from app.models.gift import Gift
from app.models.list import List, ListType, ListVisibility
from app.models.list_item import ListItem, ListItemStatus
from app.models.occasion import Occasion, OccasionType
from app.models.person import Person
from app.models.user import User
from app.services.auth import AuthService


# Test database configuration (in-memory SQLite for fast tests)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """
    Create an event loop for the entire test session.

    Yields:
        Event loop for async tests
    """
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def async_engine() -> AsyncGenerator[Any, None]:
    """
    Create async database engine for testing.

    Yields:
        Async SQLAlchemy engine
    """
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        poolclass=StaticPool,
    )

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Drop all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def async_session(async_engine: Any) -> AsyncGenerator[AsyncSession, None]:
    """
    Create async database session for testing.

    Args:
        async_engine: Async SQLAlchemy engine fixture

    Yields:
        Async SQLAlchemy session
    """
    async_session_maker = async_sessionmaker(
        async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with async_session_maker() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def client(async_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Create async HTTP client for integration tests.

    Overrides the database dependency with test session.

    Args:
        async_session: Test database session

    Yields:
        HTTPX async client
    """

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield async_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture(scope="session")
def auth_service() -> AuthService:
    """
    Create auth service instance for tests.

    Returns:
        AuthService instance
    """
    return AuthService()


# Database fixture factories


@pytest_asyncio.fixture
async def test_user(async_session: AsyncSession) -> User:
    """
    Create test user in database.

    Args:
        async_session: Test database session

    Returns:
        Created user instance
    """
    auth = AuthService()
    user = User(
        email="test@example.com",
        password_hash=auth.hash_password("password123"),
    )
    async_session.add(user)
    await async_session.commit()
    await async_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_person(async_session: AsyncSession) -> Person:
    """
    Create test person in database.

    Args:
        async_session: Test database session

    Returns:
        Created person instance
    """
    person = Person(
        name="Test Person",
        interests=["Reading", "Hiking"],
        sizes={"shirt": "M", "shoe": "10"},
    )
    async_session.add(person)
    await async_session.commit()
    await async_session.refresh(person)
    return person


@pytest_asyncio.fixture
async def test_occasion(async_session: AsyncSession) -> Occasion:
    """
    Create test occasion in database.

    Args:
        async_session: Test database session

    Returns:
        Created occasion instance
    """
    occasion = Occasion(
        name="Test Birthday",
        type=OccasionType.birthday,
        date=date(2025, 12, 25),
        description="Test occasion",
    )
    async_session.add(occasion)
    await async_session.commit()
    await async_session.refresh(occasion)
    return occasion


@pytest_asyncio.fixture
async def test_gift(async_session: AsyncSession) -> Gift:
    """
    Create test gift in database.

    Args:
        async_session: Test database session

    Returns:
        Created gift instance
    """
    gift = Gift(
        name="Test Gift",
        url="https://example.com/gift",
        price=Decimal("29.99"),
        image_url="https://example.com/image.jpg",
        source="Test",
    )
    async_session.add(gift)
    await async_session.commit()
    await async_session.refresh(gift)
    return gift


@pytest_asyncio.fixture
async def test_list(
    async_session: AsyncSession, test_user: User, test_person: Person, test_occasion: Occasion
) -> List:
    """
    Create test list in database.

    Args:
        async_session: Test database session
        test_user: Test user fixture
        test_person: Test person fixture
        test_occasion: Test occasion fixture

    Returns:
        Created list instance
    """
    list_obj = List(
        name="Test List",
        type=ListType.wishlist,
        visibility=ListVisibility.family,
        user_id=test_user.id,
        person_id=test_person.id,
        occasion_id=test_occasion.id,
    )
    async_session.add(list_obj)
    await async_session.commit()
    await async_session.refresh(list_obj)
    return list_obj


@pytest_asyncio.fixture
async def test_list_item(
    async_session: AsyncSession, test_gift: Gift, test_list: List
) -> ListItem:
    """
    Create test list item in database.

    Args:
        async_session: Test database session
        test_gift: Test gift fixture
        test_list: Test list fixture

    Returns:
        Created list item instance
    """
    list_item = ListItem(
        gift_id=test_gift.id,
        list_id=test_list.id,
        status=ListItemStatus.idea,
        notes="Test notes",
    )
    async_session.add(list_item)
    await async_session.commit()
    await async_session.refresh(list_item)
    return list_item


@pytest_asyncio.fixture
async def test_comment(
    async_session: AsyncSession, test_user: User, test_list_item: ListItem
) -> Comment:
    """
    Create test comment in database.

    Args:
        async_session: Test database session
        test_user: Test user fixture
        test_list_item: Test list item fixture

    Returns:
        Created comment instance
    """
    comment = Comment(
        content="Test comment",
        author_id=test_user.id,
        parent_type=CommentParentType.list_item,
        parent_id=test_list_item.id,
    )
    async_session.add(comment)
    await async_session.commit()
    await async_session.refresh(comment)
    return comment


# Authentication helpers


@pytest.fixture
def auth_headers(test_user: User, auth_service: AuthService) -> dict[str, str]:
    """
    Create authorization headers with valid JWT token.

    Args:
        test_user: Test user fixture
        auth_service: Auth service fixture

    Returns:
        Dictionary with Authorization header
    """
    token = auth_service.create_access_token(user_id=test_user.id)
    return {"Authorization": f"Bearer {token}"}


# Mock data factories


@pytest.fixture
def sample_person_data() -> dict[str, Any]:
    """
    Sample person creation data.

    Returns:
        Dictionary with person fields
    """
    return {
        "name": "Sample Person",
        "interests": ["Sports", "Music"],
        "sizes": {"shirt": "L", "pants": "32x32"},
    }


@pytest.fixture
def sample_occasion_data() -> dict[str, Any]:
    """
    Sample occasion creation data.

    Returns:
        Dictionary with occasion fields
    """
    return {
        "name": "Sample Birthday",
        "type": "birthday",
        "date": "2025-06-15",
        "description": "Sample description",
    }


@pytest.fixture
def sample_gift_data() -> dict[str, Any]:
    """
    Sample gift creation data.

    Returns:
        Dictionary with gift fields
    """
    return {
        "name": "Sample Gift",
        "url": "https://example.com/product",
        "price": "49.99",
        "image_url": "https://example.com/image.png",
        "source": "Amazon",
    }


@pytest.fixture
def sample_list_data() -> dict[str, Any]:
    """
    Sample list creation data.

    Returns:
        Dictionary with list fields
    """
    return {
        "name": "Sample List",
        "type": "wishlist",
        "visibility": "family",
    }


@pytest.fixture
def sample_comment_data() -> dict[str, Any]:
    """
    Sample comment creation data.

    Returns:
        Dictionary with comment fields
    """
    return {
        "content": "Sample comment text",
        "parent_type": "list_item",
        "parent_id": 1,
    }
