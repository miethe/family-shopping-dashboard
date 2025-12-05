"""Gift service for gift catalog management."""

from __future__ import annotations

import re
from decimal import Decimal, InvalidOperation

import httpx
from bs4 import BeautifulSoup
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.gift import GiftRepository
from app.schemas.gift import GiftCreate, GiftResponse, GiftUpdate


class GiftService:
    """
    Gift service handling CRUD operations, search, and URL metadata parsing.

    Converts ORM models to DTOs. Includes best-effort URL parsing for creating
    gifts from product URLs.

    Example:
        ```python
        async with async_session() as session:
            service = GiftService(session)

            # Create gift manually
            gift = await service.create(GiftCreate(
                name="LEGO Star Wars",
                url="https://amazon.com/...",
                price=Decimal("79.99")
            ))

            # Create gift from URL (auto-extract metadata)
            gift = await service.create_from_url("https://amazon.com/product/...")

            # Search gifts
            results = await service.search("lego")
        ```
    """

    def __init__(self, session: AsyncSession) -> None:
        """
        Initialize gift service with database session.

        Args:
            session: SQLAlchemy async session for database operations
        """
        self.session = session
        self.repo = GiftRepository(session)

    async def create(self, data: GiftCreate) -> GiftResponse:
        """
        Create a new gift from provided data.

        Args:
            data: Gift creation data (name, url, price, etc.)

        Returns:
            GiftResponse DTO with created gift details

        Example:
            ```python
            gift = await service.create(GiftCreate(
                name="Coffee Maker",
                url="https://example.com/product",
                price=Decimal("49.99"),
                image_url="https://example.com/image.jpg",
                source="Amazon wishlist"
            ))
            print(f"Created gift: {gift.name}")
            ```

        Note:
            All fields except name are optional in GiftCreate.
        """
        # Create gift in database
        gift = await self.repo.create(
            {
                "name": data.name,
                "url": data.url,
                "price": data.price,
                "image_url": data.image_url,
                "source": data.source,
            }
        )

        # Convert ORM model to DTO
        return GiftResponse(
            id=gift.id,
            name=gift.name,
            url=gift.url,
            price=gift.price,
            image_url=gift.image_url,
            source=gift.source,
            extra_data=gift.extra_data,
            created_at=gift.created_at,
            updated_at=gift.updated_at,
        )

    async def create_from_url(self, url: str) -> GiftResponse:
        """
        Create a gift by parsing URL metadata (best-effort).

        Attempts to extract title, price, and image from product page HTML.
        If parsing fails, creates gift with just the URL as the name.

        Args:
            url: Product URL to parse and create gift from

        Returns:
            GiftResponse DTO with extracted or minimal gift data

        Example:
            ```python
            # Parse Amazon product page
            gift = await service.create_from_url(
                "https://www.amazon.com/dp/B08H93ZRK9"
            )
            print(f"Extracted: {gift.name} - ${gift.price}")

            # If parsing fails, falls back to URL as name
            # gift.name = "https://www.amazon.com/dp/B08H93ZRK9"
            ```

        Note:
            - Best-effort parsing (not guaranteed to work for all sites)
            - Timeout: 10 seconds
            - Falls back gracefully on failure
            - Extracts: og:title, og:image, common price patterns
        """
        # Parse URL for metadata
        metadata = await self._parse_url_metadata(url)

        # Create gift with extracted data
        gift_data = GiftCreate(
            name=metadata.get("name", url),
            url=url,
            price=metadata.get("price"),
            image_url=metadata.get("image_url"),
            source="URL import",
        )

        return await self.create(gift_data)

    async def get(self, gift_id: int) -> GiftResponse | None:
        """
        Get gift by ID.

        Args:
            gift_id: Gift ID to retrieve

        Returns:
            GiftResponse DTO if found, None otherwise

        Example:
            ```python
            gift = await service.get(gift_id=42)
            if gift:
                print(f"Found gift: {gift.name}")
            else:
                print("Gift not found")
            ```
        """
        gift = await self.repo.get(gift_id)
        if gift is None:
            return None

        return GiftResponse(
            id=gift.id,
            name=gift.name,
            url=gift.url,
            price=gift.price,
            image_url=gift.image_url,
            source=gift.source,
            extra_data=gift.extra_data,
            created_at=gift.created_at,
            updated_at=gift.updated_at,
        )

    async def list(
        self,
        cursor: int | None = None,
        limit: int = 50,
        search: str | None = None,
        person_ids: list[int] | None = None,
        statuses: list[str] | None = None,
        list_ids: list[int] | None = None,
        occasion_ids: list[int] | None = None,
        sort_by: str = "recent",
    ) -> tuple[list[GiftResponse], bool, int | None]:
        """
        Get paginated and filtered list of gifts using cursor-based pagination.

        Supports filtering by recipient (person), status, list, occasion, and search.
        Can be used for both general listing and filtered queries.

        Args:
            cursor: ID of last item from previous page (None for first page)
            limit: Maximum number of items to return (default: 50)
            search: Case-insensitive substring search on gift name
            person_ids: Filter by recipient person IDs (OR within group)
            statuses: Filter by list item statuses (OR within group)
            list_ids: Filter by list IDs (OR within group)
            occasion_ids: Filter by occasion IDs (OR within group)
            sort_by: Sort order ('recent', 'price_asc', 'price_desc')

        Returns:
            Tuple of (items, has_more, next_cursor):
            - items: List of GiftResponse DTOs (up to `limit` items)
            - has_more: True if more items exist after this page
            - next_cursor: ID to use for next page (None if no more items)

        Example:
            ```python
            # First page - all gifts
            gifts, has_more, next_cursor = await service.list(limit=20)

            # Filter by person and status
            gifts, has_more, next_cursor = await service.list(
                person_ids=[5],
                statuses=['purchased', 'selected'],
                limit=20
            )

            # Search and sort by price
            gifts, has_more, next_cursor = await service.list(
                search="lego",
                sort_by="price_asc",
                limit=20
            )
            ```

        Note:
            - If no filters are provided, returns all gifts
            - Empty list and None are treated the same (no filter)
            - AND logic across filter groups, OR within groups
            - Cursor-based pagination for performance
        """
        # Determine if we should use filtered query or simple listing
        has_filters = any(
            [search, person_ids, statuses, list_ids, occasion_ids, sort_by != "recent"]
        )

        if has_filters:
            # Use filtered query
            gifts, has_more, next_cursor = await self.repo.get_filtered(
                cursor=cursor,
                limit=limit,
                search=search,
                person_ids=person_ids,
                statuses=statuses,
                list_ids=list_ids,
                occasion_ids=occasion_ids,
                sort_by=sort_by,
            )
        else:
            # Use simple pagination (no filters)
            gifts, has_more, next_cursor = await self.repo.get_multi(
                cursor=cursor, limit=limit
            )

        # Convert ORM models to DTOs
        gift_dtos = [
            GiftResponse(
                id=gift.id,
                name=gift.name,
                url=gift.url,
                price=gift.price,
                image_url=gift.image_url,
                source=gift.source,
                extra_data=gift.extra_data,
                created_at=gift.created_at,
                updated_at=gift.updated_at,
            )
            for gift in gifts
        ]

        return gift_dtos, has_more, next_cursor

    async def search(self, query: str, limit: int = 20) -> list[GiftResponse]:
        """
        Search gifts by name using case-insensitive pattern matching.

        Args:
            query: Search string to match against gift names
            limit: Maximum number of results to return (default: 20)

        Returns:
            List of GiftResponse DTOs matching the search query

        Example:
            ```python
            # Find all gifts with "lego" in the name
            results = await service.search("lego")
            for gift in results:
                print(f"{gift.name} - ${gift.price}")

            # Case-insensitive: "LEGO" = "lego" = "Lego"
            results = await service.search("LEGO")
            ```

        Note:
            - Search uses substring matching (finds "lego" anywhere in name)
            - Case-insensitive matching
            - Returns empty list if no matches found
            - Results ordered by name
        """
        # Search using repository
        gifts = await self.repo.search_by_name(query, limit=limit)

        # Convert ORM models to DTOs
        return [
            GiftResponse(
                id=gift.id,
                name=gift.name,
                url=gift.url,
                price=gift.price,
                image_url=gift.image_url,
                source=gift.source,
                extra_data=gift.extra_data,
                created_at=gift.created_at,
                updated_at=gift.updated_at,
            )
            for gift in gifts
        ]

    async def update(self, gift_id: int, data: GiftUpdate) -> GiftResponse | None:
        """
        Update an existing gift.

        Args:
            gift_id: Gift ID to update
            data: Update data (all fields optional)

        Returns:
            Updated GiftResponse DTO if gift found, None otherwise

        Example:
            ```python
            gift = await service.update(
                gift_id=42,
                data=GiftUpdate(
                    price=Decimal("59.99"),
                    image_url="https://example.com/new-image.jpg"
                )
            )
            if gift:
                print(f"Updated price: ${gift.price}")
            ```

        Note:
            Only updates provided fields (partial update).
            Returns None if gift not found.
        """
        # Check gift exists
        existing_gift = await self.repo.get(gift_id)
        if existing_gift is None:
            return None

        # Build update dict (only non-None fields)
        update_data = {}
        if data.name is not None:
            update_data["name"] = data.name
        if data.url is not None:
            update_data["url"] = data.url
        if data.price is not None:
            update_data["price"] = data.price
        if data.image_url is not None:
            update_data["image_url"] = data.image_url
        if data.source is not None:
            update_data["source"] = data.source

        # Update gift if there are changes
        if update_data:
            updated_gift = await self.repo.update(gift_id, update_data)
            if updated_gift is None:
                # Should not happen since we checked existence, but handle gracefully
                return None
            gift = updated_gift
        else:
            gift = existing_gift

        # Convert ORM model to DTO
        return GiftResponse(
            id=gift.id,
            name=gift.name,
            url=gift.url,
            price=gift.price,
            image_url=gift.image_url,
            source=gift.source,
            extra_data=gift.extra_data,
            created_at=gift.created_at,
            updated_at=gift.updated_at,
        )

    async def delete(self, gift_id: int) -> bool:
        """
        Delete a gift by ID.

        Args:
            gift_id: Gift ID to delete

        Returns:
            True if gift was deleted, False if not found

        Example:
            ```python
            deleted = await service.delete(gift_id=42)
            if deleted:
                print("Gift deleted successfully")
            else:
                print("Gift not found")
            ```
        """
        return await self.repo.delete(gift_id)

    async def get_linked_people(self, gift_id: int) -> list[int]:
        """
        Get person IDs linked to a gift.

        Args:
            gift_id: Gift ID to get linked people for

        Returns:
            List of person IDs linked to the gift

        Example:
            ```python
            person_ids = await service.get_linked_people(gift_id=42)
            print(f"Gift is for {len(person_ids)} people")
            ```
        """
        return await self.repo.get_linked_people(gift_id)

    async def attach_people(self, gift_id: int, person_ids: list[int]) -> None:
        """
        Attach people to a gift (batch operation).

        Args:
            gift_id: Gift ID to attach people to
            person_ids: List of person IDs to attach

        Example:
            ```python
            await service.attach_people(gift_id=42, person_ids=[1, 2, 3])
            ```

        Note:
            Automatically skips duplicate links.
        """
        await self.repo.attach_people(gift_id, person_ids)

    async def detach_person(self, gift_id: int, person_id: int) -> bool:
        """
        Detach a person from a gift.

        Args:
            gift_id: Gift ID to detach person from
            person_id: Person ID to detach

        Returns:
            True if link was removed, False if link didn't exist

        Example:
            ```python
            deleted = await service.detach_person(gift_id=42, person_id=5)
            if deleted:
                print("Person unlinked")
            ```
        """
        return await self.repo.detach_person(gift_id, person_id)

    async def list_by_linked_person(self, person_id: int) -> list[GiftResponse]:
        """
        Get all gifts directly linked to a specific person via gift_people table.

        This is different from filtering by list ownership. This method returns
        gifts that are directly associated with a person as a recipient.

        Args:
            person_id: Person ID to get linked gifts for

        Returns:
            List of GiftResponse DTOs for gifts linked to the person

        Example:
            ```python
            # Get all gifts for person 5
            gifts = await service.list_by_linked_person(person_id=5)
            for gift in gifts:
                print(f"{gift.name} - ${gift.price}")
            ```

        Note:
            - Returns gifts directly linked via gift_people table
            - Does NOT filter by list ownership
            - Returns empty list if person has no linked gifts
        """
        gifts = await self.repo.get_by_linked_person(person_id)
        return [self._to_response(gift) for gift in gifts]

    async def list_by_linked_persons(self, person_ids: list[int]) -> list[GiftResponse]:
        """
        Get all gifts directly linked to any of the specified persons via gift_people table.

        Args:
            person_ids: List of person IDs to get linked gifts for

        Returns:
            List of GiftResponse DTOs for gifts linked to any of the persons

        Example:
            ```python
            # Get all gifts for persons 1, 2, or 3
            gifts = await service.list_by_linked_persons(person_ids=[1, 2, 3])
            ```

        Note:
            - Returns gifts linked to ANY of the specified persons (OR logic)
            - Returns empty list if no person_ids provided or no gifts found
        """
        gifts = await self.repo.get_by_linked_persons(person_ids)
        return [self._to_response(gift) for gift in gifts]

    def _to_response(self, gift: "Gift") -> GiftResponse:
        """
        Convert ORM Gift model to GiftResponse DTO.

        Args:
            gift: Gift ORM model instance

        Returns:
            GiftResponse DTO

        Note:
            This is a helper method to centralize ORM → DTO conversion.
        """
        return GiftResponse(
            id=gift.id,
            name=gift.name,
            url=gift.url,
            price=gift.price,
            image_url=gift.image_url,
            source=gift.source,
            extra_data=gift.extra_data,
            created_at=gift.created_at,
            updated_at=gift.updated_at,
        )

    async def _parse_url_metadata(self, url: str) -> dict:
        """
        Parse URL for gift metadata (best-effort).

        Attempts to extract:
        - name: From og:title, twitter:title, or <title> tag
        - image_url: From og:image or twitter:image
        - price: From common price patterns in HTML

        Args:
            url: URL to parse

        Returns:
            Dictionary with extracted metadata (name, image_url, price)
            Falls back to minimal data on failure

        Note:
            - Timeout: 10 seconds
            - Follows redirects
            - Returns fallback data on any error (network, parsing, etc.)
            - Price extraction uses regex patterns (not guaranteed)
        """
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                response = await client.get(url)
                response.raise_for_status()

                # Parse HTML
                soup = BeautifulSoup(response.text, "html.parser")

                # Extract title (try og:title, twitter:title, then <title>)
                name = None
                og_title = soup.find("meta", property="og:title")
                if og_title and og_title.get("content"):
                    name = og_title["content"]
                else:
                    twitter_title = soup.find("meta", attrs={"name": "twitter:title"})
                    if twitter_title and twitter_title.get("content"):
                        name = twitter_title["content"]
                    else:
                        title_tag = soup.find("title")
                        if title_tag and title_tag.string:
                            name = title_tag.string.strip()

                # Extract image (try og:image, twitter:image)
                image_url = None
                og_image = soup.find("meta", property="og:image")
                if og_image and og_image.get("content"):
                    image_url = og_image["content"]
                else:
                    twitter_image = soup.find("meta", attrs={"name": "twitter:image"})
                    if twitter_image and twitter_image.get("content"):
                        image_url = twitter_image["content"]

                # Extract price (best-effort using regex patterns)
                price = None
                price_patterns = [
                    # $XX.XX or $XX
                    r"\$\s*(\d+(?:\.\d{2})?)",
                    # XX.XX USD or XX USD
                    r"(\d+(?:\.\d{2})?)\s*(?:USD|usd)",
                    # price: XX.XX
                    r"price[\"']?\s*:\s*[\"']?(\d+(?:\.\d{2})?)",
                ]

                for pattern in price_patterns:
                    match = re.search(pattern, response.text)
                    if match:
                        try:
                            price = Decimal(match.group(1))
                            break
                        except (InvalidOperation, ValueError):
                            continue

                # Return extracted metadata
                result = {}
                if name:
                    result["name"] = name
                if image_url:
                    result["image_url"] = image_url
                if price:
                    result["price"] = price

                return result if result else {"name": url}

        except Exception:
            # On any error (network, parsing, etc.), fall back to URL as name
            return {"name": url}
