"""Gift service for gift catalog management."""

from __future__ import annotations

import re
from datetime import date
from decimal import Decimal, InvalidOperation

import httpx
from bs4 import BeautifulSoup
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.gift import GiftRepository
from app.schemas.gift import (
    AdditionalUrl,
    GiftCreate,
    GiftResponse,
    GiftUpdate,
    MarkPurchasedRequest,
    StoreMinimal,
)


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
        additional_urls = [url.model_dump() for url in data.additional_urls]

        gift = await self.repo.create(
            {
                "name": data.name,
                "url": data.url,
                "price": data.price,
                "image_url": data.image_url,
                "source": data.source,
                "description": data.description,
                "notes": data.notes,
                "priority": data.priority,
                "quantity": data.quantity,
                "sale_price": data.sale_price,
                "purchase_date": data.purchase_date,
                "additional_urls": additional_urls,
            }
        )

        # Handle relationships
        if data.person_ids:
            await self.repo.set_people(gift.id, data.person_ids)
        if data.store_ids:
            await self.repo.set_stores(gift.id, data.store_ids)

        gift_with_relations = await self.repo.get_with_relations(gift.id) or gift
        return self._to_response(gift_with_relations)

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
        gift = await self.repo.get_with_relations(gift_id) or await self.repo.get(gift_id)
        if gift is None:
            return None

        return self._to_response(gift)

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

        The person_ids filter uses a UNION approach to include gifts from both:
        1. List ownership (gifts added to lists owned by the person)
        2. Direct linking (gifts linked via GiftPerson table with role=RECIPIENT)

        Args:
            cursor: ID of last item from previous page (None for first page)
            limit: Maximum number of items to return (default: 50)
            search: Case-insensitive substring search on gift name
            person_ids: Filter by recipient person IDs (list-based OR GiftPerson-based, OR within group)
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
                cursor=cursor, limit=limit, descending=True
            )

        gift_dtos = [self._to_response(gift) for gift in gifts]

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

        return [self._to_response(gift) for gift in gifts]

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
        if data.description is not None:
            update_data["description"] = data.description
        if data.notes is not None:
            update_data["notes"] = data.notes
        if data.priority is not None:
            update_data["priority"] = data.priority
        if data.quantity is not None:
            update_data["quantity"] = data.quantity
        if data.sale_price is not None:
            update_data["sale_price"] = data.sale_price
        if data.purchase_date is not None:
            update_data["purchase_date"] = data.purchase_date
        if data.additional_urls is not None:
            update_data["additional_urls"] = [
                url.model_dump() for url in data.additional_urls
            ]
        # Update gift if there are changes
        if update_data:
            updated_gift = await self.repo.update(gift_id, update_data)
            if updated_gift is None:
                # Should not happen since we checked existence, but handle gracefully
                return None
            gift = updated_gift
        else:
            gift = existing_gift

        # Refresh linked people and stores when provided
        if data.person_ids is not None:
            await self.repo.set_people(gift_id, data.person_ids)
        if data.store_ids is not None:
            await self.repo.set_stores(gift_id, data.store_ids)

        refreshed = await self.repo.get_with_relations(gift_id)
        return self._to_response(refreshed or gift)

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

    async def mark_as_purchased(self, gift_id: int, data: MarkPurchasedRequest) -> GiftResponse | None:
        """
        Mark a gift as purchased/partial purchased, stamping purchase date and quantity purchased metadata.
        """
        gift = await self.repo.get(gift_id)
        if gift is None:
            return None

        derived_status = (
            data.status
            if data.status
            else ("purchased" if data.quantity_purchased >= (gift.quantity or 1) else "partial")
        )
        purchase_date = data.purchase_date or date.today()

        extra_data = dict(gift.extra_data or {})
        extra_data["status"] = derived_status
        extra_data["quantity_purchased"] = data.quantity_purchased

        update_payload = {
            "purchase_date": purchase_date,
            "extra_data": extra_data,
        }
        if data.sale_price is not None:
            update_payload["sale_price"] = data.sale_price

        updated = await self.repo.update(gift_id, update_payload)
        refreshed = await self.repo.get_with_relations(gift_id)
        return self._to_response(refreshed or updated or gift)

    async def list_by_purchaser(
        self,
        purchaser_id: int,
        cursor: int | None = None,
        limit: int = 50,
    ) -> tuple[list[GiftResponse], bool, int | None]:
        """
        Get all gifts purchased by a specific person.

        Returns gifts where the person is assigned as the purchaser via
        the Gift.purchaser_id field. Uses cursor-based pagination for
        efficient querying of large result sets.

        Args:
            purchaser_id: Person ID who is the purchaser
            cursor: Optional cursor for pagination (ID of last item from previous page)
            limit: Maximum number of items to return (default: 50)

        Returns:
            Tuple of (GiftResponse DTOs, has_more, next_cursor):
            - List of GiftResponse DTOs (up to `limit` items)
            - has_more: True if more items exist after this page
            - next_cursor: ID to use for next page (None if no more items)

        Example:
            ```python
            # Get first page of gifts purchased by person 5
            gifts, has_more, cursor = await service.list_by_purchaser(
                purchaser_id=5,
                limit=20
            )

            # Get next page
            if has_more:
                gifts, has_more, cursor = await service.list_by_purchaser(
                    purchaser_id=5,
                    cursor=cursor,
                    limit=20
                )
            ```

        Note:
            - Returns gifts where Gift.purchaser_id matches the provided person ID
            - Results ordered by gift ID descending (most recent first)
            - Returns empty list if person has no purchased gifts
        """
        gifts, has_more, next_cursor = await self.repo.get_by_purchaser_id(
            purchaser_id=purchaser_id,
            cursor=cursor,
            limit=limit,
        )
        return [self._to_response(g) for g in gifts], has_more, next_cursor

    async def assign_purchaser(
        self,
        gift_id: int,
        purchaser_id: int | None,
    ) -> GiftResponse | None:
        """
        Assign or clear the purchaser on a gift.

        Sets or clears the Gift.purchaser_id field to track who is responsible
        for purchasing this gift. This is separate from the actual purchase_date
        which is set when the gift is marked as purchased.

        Args:
            gift_id: Gift to update
            purchaser_id: Person ID to assign as purchaser (or None to clear)

        Returns:
            Updated GiftResponse DTO if gift found, None if gift not found

        Raises:
            ValueError: If purchaser_id is provided but person doesn't exist

        Example:
            ```python
            # Assign person 5 as purchaser
            gift = await service.assign_purchaser(gift_id=123, purchaser_id=5)
            if gift:
                print(f"Purchaser assigned to {gift.name}")

            # Clear purchaser assignment
            gift = await service.assign_purchaser(gift_id=123, purchaser_id=None)
            ```

        Note:
            - Validates that the person exists before assignment (if not None)
            - Returns None if gift not found
            - Clears purchaser if purchaser_id is None
        """
        # Import PersonRepository here to avoid circular imports
        from app.repositories.person import PersonRepository

        # Validate person exists if purchaser_id is provided
        if purchaser_id is not None:
            person_repo = PersonRepository(self.session)
            person = await person_repo.get(purchaser_id)
            if person is None:
                raise ValueError(f"Person with ID {purchaser_id} not found")

        # Update purchaser via repository
        updated_gift = await self.repo.update_purchaser(
            gift_id=gift_id,
            purchaser_id=purchaser_id,
        )

        # Return None if gift not found
        if updated_gift is None:
            return None

        # Convert to DTO and return
        return self._to_response(updated_gift)

    async def bulk_action(
        self,
        gift_ids: list[int],
        action: str,
        person_id: int | None = None,
    ) -> dict:
        """
        Perform bulk action on multiple gifts.

        Processes multiple gifts with a single action, continuing even if some
        gifts fail. This is useful for batch operations in the UI where partial
        success is acceptable.

        Args:
            gift_ids: List of gift IDs to process
            action: One of 'assign_recipient', 'assign_purchaser', 'mark_purchased', 'delete'
            person_id: Required for assign actions, ignored otherwise

        Returns:
            Dict with success_count, failed_ids, errors:
            - success_count: Number of successfully processed gifts
            - failed_ids: List of gift IDs that failed
            - errors: List of error messages for failed gifts

        Example:
            ```python
            # Assign recipient to multiple gifts
            result = await service.bulk_action(
                gift_ids=[1, 2, 3],
                action="assign_recipient",
                person_id=5
            )
            print(f"Success: {result['success_count']}, Failed: {len(result['failed_ids'])}")

            # Mark multiple gifts as purchased
            result = await service.bulk_action(
                gift_ids=[1, 2, 3],
                action="mark_purchased"
            )
            ```

        Note:
            - Continues processing even if some gifts fail
            - Returns partial success results
            - Validates person_id for assign actions
            - Each gift is processed independently
        """
        success_count = 0
        failed_ids = []
        errors = []

        for gift_id in gift_ids:
            try:
                if action == "assign_recipient":
                    if person_id is None:
                        raise ValueError("person_id required for assign_recipient")
                    await self.repo.attach_people(gift_id, [person_id])
                elif action == "assign_purchaser":
                    if person_id is None:
                        raise ValueError("person_id required for assign_purchaser")
                    await self.assign_purchaser(gift_id, person_id)
                elif action == "mark_purchased":
                    gift = await self.repo.get(gift_id)
                    if gift:
                        await self.repo.update(gift_id, {"purchase_date": date.today()})
                    else:
                        raise ValueError(f"Gift {gift_id} not found")
                elif action == "delete":
                    deleted = await self.repo.delete(gift_id)
                    if not deleted:
                        raise ValueError(f"Gift {gift_id} not found")
                success_count += 1
            except Exception as e:
                failed_ids.append(gift_id)
                errors.append(f"Gift {gift_id}: {str(e)}")

        return {
            "success_count": success_count,
            "failed_ids": failed_ids,
            "errors": errors,
        }

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
        raw_urls = gift.additional_urls or []
        normalized_urls: list[AdditionalUrl] = []
        for entry in raw_urls:
            try:
                if isinstance(entry, dict):
                    normalized_urls.append(AdditionalUrl(**entry))
                else:
                    normalized_urls.append(
                        AdditionalUrl(label="Link", url=str(entry))
                    )
            except Exception:
                # Skip invalid entries but keep response generation resilient
                continue

        stores = getattr(gift, "stores", []) or []
        people = getattr(gift, "people", []) or []

        return GiftResponse(
            id=gift.id,
            name=gift.name,
            url=gift.url,
            price=gift.price,
            image_url=gift.image_url,
            source=gift.source,
            description=getattr(gift, "description", None),
            notes=getattr(gift, "notes", None),
            priority=getattr(gift, "priority", None),
            quantity=getattr(gift, "quantity", 1),
            sale_price=getattr(gift, "sale_price", None),
            purchase_date=getattr(gift, "purchase_date", None),
            additional_urls=normalized_urls,
            extra_data=gift.extra_data,
            stores=[
                StoreMinimal(id=store.id, name=store.name, url=store.url)
                for store in stores
            ],
            person_ids=[person.id for person in people],
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
