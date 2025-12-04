"""Unit tests for GiftService."""

from decimal import Decimal
from unittest.mock import AsyncMock, patch

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gift import Gift
from app.repositories.gift import GiftRepository
from app.schemas.gift import GiftCreate, GiftResponse, GiftUpdate
from app.services.gift import GiftService


@pytest.fixture
def mock_gift_repo() -> AsyncMock:
    """Create mock GiftRepository."""
    return AsyncMock(spec=GiftRepository)


@pytest.fixture
def gift_service(mock_gift_repo: AsyncMock) -> GiftService:
    """Create GiftService with mocked repository."""
    service = GiftService(session=AsyncMock(spec=AsyncSession))
    service.repo = mock_gift_repo
    return service


class TestGiftService:
    """Test suite for GiftService."""

    @pytest.mark.asyncio
    async def test_create_gift(
        self, gift_service: GiftService, mock_gift_repo: AsyncMock
    ) -> None:
        """Test creating a gift."""
        # Arrange
        gift_data = GiftCreate(
            name="LEGO Star Wars",
            url="https://amazon.com/product",
            price=Decimal("79.99"),
            image_url="https://amazon.com/image.jpg",
            source="Amazon",
        )

        mock_gift = Gift(
            id=1,
            name="LEGO Star Wars",
            url="https://amazon.com/product",
            price=Decimal("79.99"),
            image_url="https://amazon.com/image.jpg",
            source="Amazon",
        )
        mock_gift_repo.create.return_value = mock_gift

        # Act
        result = await gift_service.create(gift_data)

        # Assert
        assert isinstance(result, GiftResponse)
        assert result.id == 1
        assert result.name == "LEGO Star Wars"
        assert result.price == Decimal("79.99")

    @pytest.mark.asyncio
    async def test_create_gift_minimal(
        self, gift_service: GiftService, mock_gift_repo: AsyncMock
    ) -> None:
        """Test creating gift with only required fields."""
        # Arrange
        gift_data = GiftCreate(name="Simple Gift")

        mock_gift = Gift(id=2, name="Simple Gift")
        mock_gift_repo.create.return_value = mock_gift

        # Act
        result = await gift_service.create(gift_data)

        # Assert
        assert result.name == "Simple Gift"
        assert result.url is None
        assert result.price is None

    @pytest.mark.asyncio
    async def test_get_gift_found(
        self, gift_service: GiftService, mock_gift_repo: AsyncMock
    ) -> None:
        """Test getting an existing gift."""
        # Arrange
        mock_gift = Gift(id=1, name="Test Gift")
        mock_gift_repo.get.return_value = mock_gift

        # Act
        result = await gift_service.get(gift_id=1)

        # Assert
        assert result is not None
        assert result.id == 1
        assert result.name == "Test Gift"

    @pytest.mark.asyncio
    async def test_get_gift_not_found(
        self, gift_service: GiftService, mock_gift_repo: AsyncMock
    ) -> None:
        """Test getting non-existent gift returns None."""
        # Arrange
        mock_gift_repo.get.return_value = None

        # Act
        result = await gift_service.get(gift_id=999)

        # Assert
        assert result is None

    @pytest.mark.asyncio
    async def test_list_gifts(
        self, gift_service: GiftService, mock_gift_repo: AsyncMock
    ) -> None:
        """Test listing gifts with pagination."""
        # Arrange
        mock_gifts = [
            Gift(id=1, name="Gift 1"),
            Gift(id=2, name="Gift 2"),
        ]
        mock_gift_repo.get_multi.return_value = (mock_gifts, True, 2)

        # Act
        gifts, has_more, next_cursor = await gift_service.list(limit=2)

        # Assert
        assert len(gifts) == 2
        assert gifts[0].name == "Gift 1"
        assert has_more is True
        assert next_cursor == 2

    @pytest.mark.asyncio
    async def test_search_gifts(
        self, gift_service: GiftService, mock_gift_repo: AsyncMock
    ) -> None:
        """Test searching gifts by name."""
        # Arrange
        mock_gifts = [
            Gift(id=1, name="LEGO Star Wars"),
            Gift(id=2, name="LEGO Harry Potter"),
        ]
        mock_gift_repo.search_by_name.return_value = mock_gifts

        # Act
        result = await gift_service.search(query="lego")

        # Assert
        assert len(result) == 2
        assert all("LEGO" in gift.name for gift in result)
        mock_gift_repo.search_by_name.assert_called_once_with("lego", limit=20)

    @pytest.mark.asyncio
    async def test_update_gift(
        self, gift_service: GiftService, mock_gift_repo: AsyncMock
    ) -> None:
        """Test updating a gift."""
        # Arrange
        existing = Gift(id=1, name="Old Name", price=Decimal("50.00"))
        updated = Gift(id=1, name="New Name", price=Decimal("59.99"))

        mock_gift_repo.get.return_value = existing
        mock_gift_repo.update.return_value = updated

        update_data = GiftUpdate(name="New Name", price=Decimal("59.99"))

        # Act
        result = await gift_service.update(gift_id=1, data=update_data)

        # Assert
        assert result is not None
        assert result.name == "New Name"
        assert result.price == Decimal("59.99")

    @pytest.mark.asyncio
    async def test_update_gift_not_found(
        self, gift_service: GiftService, mock_gift_repo: AsyncMock
    ) -> None:
        """Test updating non-existent gift returns None."""
        # Arrange
        mock_gift_repo.get.return_value = None

        update_data = GiftUpdate(name="New Name")

        # Act
        result = await gift_service.update(gift_id=999, data=update_data)

        # Assert
        assert result is None
        mock_gift_repo.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_delete_gift_success(
        self, gift_service: GiftService, mock_gift_repo: AsyncMock
    ) -> None:
        """Test deleting a gift successfully."""
        # Arrange
        mock_gift_repo.delete.return_value = True

        # Act
        result = await gift_service.delete(gift_id=1)

        # Assert
        assert result is True
        mock_gift_repo.delete.assert_called_once_with(1)

    @pytest.mark.asyncio
    async def test_delete_gift_not_found(
        self, gift_service: GiftService, mock_gift_repo: AsyncMock
    ) -> None:
        """Test deleting non-existent gift returns False."""
        # Arrange
        mock_gift_repo.delete.return_value = False

        # Act
        result = await gift_service.delete(gift_id=999)

        # Assert
        assert result is False

    @pytest.mark.asyncio
    @patch("app.services.gift.httpx.AsyncClient")
    async def test_parse_url_metadata_success(
        self, mock_httpx: AsyncMock, gift_service: GiftService
    ) -> None:
        """Test URL metadata parsing successfully extracts title and price."""
        # Arrange
        mock_response = AsyncMock()
        mock_response.text = """
        <html>
            <head>
                <meta property="og:title" content="Amazing Product" />
                <meta property="og:image" content="https://example.com/img.jpg" />
            </head>
            <body>
                <div>Price: $49.99</div>
            </body>
        </html>
        """
        mock_response.raise_for_status = AsyncMock()

        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client.get.return_value = mock_response
        mock_httpx.return_value = mock_client

        # Act
        result = await gift_service._parse_url_metadata("https://example.com/product")

        # Assert
        assert "name" in result
        assert result["name"] == "Amazing Product"
        assert "image_url" in result
        assert result["image_url"] == "https://example.com/img.jpg"
        assert "price" in result
        assert result["price"] == Decimal("49.99")

    @pytest.mark.asyncio
    @patch("app.services.gift.httpx.AsyncClient")
    async def test_parse_url_metadata_failure_fallback(
        self, mock_httpx: AsyncMock, gift_service: GiftService
    ) -> None:
        """Test URL parsing falls back gracefully on error."""
        # Arrange
        mock_client = AsyncMock()
        mock_client.__aenter__.return_value = mock_client
        mock_client.__aexit__.return_value = None
        mock_client.get.side_effect = Exception("Network error")
        mock_httpx.return_value = mock_client

        url = "https://example.com/error"

        # Act
        result = await gift_service._parse_url_metadata(url)

        # Assert
        assert result == {"name": url}

    @pytest.mark.asyncio
    @patch.object(GiftService, "_parse_url_metadata")
    async def test_create_from_url(
        self,
        mock_parse: AsyncMock,
        gift_service: GiftService,
        mock_gift_repo: AsyncMock,
    ) -> None:
        """Test creating gift from URL."""
        # Arrange
        url = "https://example.com/product"
        mock_parse.return_value = {
            "name": "Extracted Product",
            "price": Decimal("29.99"),
            "image_url": "https://example.com/img.jpg",
        }

        mock_gift = Gift(
            id=1,
            name="Extracted Product",
            url=url,
            price=Decimal("29.99"),
            image_url="https://example.com/img.jpg",
            source="URL import",
        )
        mock_gift_repo.create.return_value = mock_gift

        # Act
        result = await gift_service.create_from_url(url)

        # Assert
        assert result.name == "Extracted Product"
        assert result.url == url
        assert result.price == Decimal("29.99")
        assert result.source == "URL import"
        mock_parse.assert_called_once_with(url)
