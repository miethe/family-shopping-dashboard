"""Store service for store management and inline creation."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.store import StoreRepository
from app.schemas.store import StoreCreate, StoreResponse, StoreUpdate, StoreWithGiftCount


class StoreService:
    """
    Store service handling CRUD operations and inline store creation.

    Converts ORM models to DTOs. Includes get_or_create for seamless
    inline store creation when adding stores to gifts.

    Example:
        ```python
        async with async_session() as session:
            service = StoreService(session)

            # Create store manually
            store = await service.create(StoreCreate(
                name="Amazon",
                url="https://amazon.com"
            ))

            # Get or create (inline creation)
            store = await service.get_or_create("Target", "https://target.com")

            # List all stores
            stores = await service.list_stores()
        ```
    """

    def __init__(self, session: AsyncSession) -> None:
        """
        Initialize store service with database session.

        Args:
            session: SQLAlchemy async session for database operations
        """
        self.session = session
        self.repo = StoreRepository(session)

    async def create(self, data: StoreCreate) -> StoreResponse:
        """
        Create a new store from provided data.

        Args:
            data: Store creation data (name required, url optional)

        Returns:
            StoreResponse DTO with created store details

        Example:
            ```python
            store = await service.create(StoreCreate(
                name="Best Buy",
                url="https://bestbuy.com"
            ))
            print(f"Created store: {store.name}")
            ```
        """
        store = await self.repo.create({"name": data.name, "url": data.url})

        return StoreResponse(
            id=store.id,
            name=store.name,
            url=store.url,
            created_at=store.created_at,
            updated_at=store.updated_at,
        )

    async def get_or_create(self, name: str, url: str | None = None) -> StoreResponse:
        """
        Get existing store by name or create new one.

        This is the key method for inline store creation when adding stores
        to gifts. It prevents duplicate store entries and allows seamless
        creation of stores on-the-fly.

        Args:
            name: Store name
            url: Optional store URL (only used when creating)

        Returns:
            StoreResponse DTO (existing or newly created)

        Example:
            ```python
            # In gift creation flow
            store = await service.get_or_create("Amazon")

            # With URL
            store = await service.get_or_create(
                "Target",
                "https://target.com"
            )
            ```

        Note:
            - Name comparison is case-sensitive
            - URL is only used when creating new stores
            - Returns same result whether store existed or was created
        """
        store, _created = await self.repo.get_or_create(name, url)

        return StoreResponse(
            id=store.id,
            name=store.name,
            url=store.url,
            created_at=store.created_at,
            updated_at=store.updated_at,
        )

    async def get(self, store_id: int) -> StoreResponse | None:
        """
        Get store by ID.

        Args:
            store_id: Store ID to retrieve

        Returns:
            StoreResponse DTO if found, None otherwise

        Example:
            ```python
            store = await service.get(store_id=42)
            if store:
                print(f"Found store: {store.name}")
            else:
                print("Store not found")
            ```
        """
        store = await self.repo.get(store_id)
        if store is None:
            return None

        return StoreResponse(
            id=store.id,
            name=store.name,
            url=store.url,
            created_at=store.created_at,
            updated_at=store.updated_at,
        )

    async def get_with_gift_count(self, store_id: int) -> StoreWithGiftCount | None:
        """
        Get store with count of associated gifts.

        Args:
            store_id: Store ID to retrieve

        Returns:
            StoreWithGiftCount DTO if found, None otherwise

        Example:
            ```python
            store = await service.get_with_gift_count(store_id=5)
            if store:
                print(f"{store.name}: {store.gift_count} gifts")
            ```
        """
        result = await self.repo.get_with_gift_count(store_id)
        if result is None:
            return None

        return StoreWithGiftCount(**result)

    async def list_stores(
        self, cursor: int | None = None, limit: int = 50
    ) -> tuple[list[StoreResponse], bool, int | None]:
        """
        Get paginated list of stores using cursor-based pagination.

        Args:
            cursor: ID of last item from previous page (None for first page)
            limit: Maximum number of items to return (default: 50)

        Returns:
            Tuple of (items, has_more, next_cursor):
            - items: List of StoreResponse DTOs (up to `limit` items)
            - has_more: True if more items exist after this page
            - next_cursor: ID to use for next page (None if no more items)

        Example:
            ```python
            # First page - all stores
            stores, has_more, next_cursor = await service.list_stores(limit=20)

            # Second page
            if has_more:
                stores, has_more, next_cursor = await service.list_stores(
                    cursor=next_cursor,
                    limit=20
                )
            ```
        """
        stores, has_more, next_cursor = await self.repo.get_multi(
            cursor=cursor, limit=limit, order_by="name"
        )

        # Convert ORM models to DTOs
        store_dtos = [
            StoreResponse(
                id=store.id,
                name=store.name,
                url=store.url,
                created_at=store.created_at,
                updated_at=store.updated_at,
            )
            for store in stores
        ]

        return store_dtos, has_more, next_cursor

    async def search(self, query: str, limit: int = 20) -> list[StoreResponse]:
        """
        Search stores by name using case-insensitive pattern matching.

        Args:
            query: Search string to match against store names
            limit: Maximum number of results to return (default: 20)

        Returns:
            List of StoreResponse DTOs matching the search query

        Example:
            ```python
            # Find all stores with "amazon" in the name
            results = await service.search("amazon")
            for store in results:
                print(f"{store.name} - {store.url}")
            ```

        Note:
            - Search uses substring matching
            - Case-insensitive matching
            - Results ordered by name
        """
        stores = await self.repo.search_by_name(query, limit=limit)

        return [
            StoreResponse(
                id=store.id,
                name=store.name,
                url=store.url,
                created_at=store.created_at,
                updated_at=store.updated_at,
            )
            for store in stores
        ]

    async def update(self, store_id: int, data: StoreUpdate) -> StoreResponse | None:
        """
        Update an existing store.

        Args:
            store_id: Store ID to update
            data: Update data (all fields optional)

        Returns:
            Updated StoreResponse DTO if store found, None otherwise

        Example:
            ```python
            store = await service.update(
                store_id=42,
                data=StoreUpdate(
                    url="https://new-url.com"
                )
            )
            if store:
                print(f"Updated store: {store.name}")
            ```

        Note:
            Only updates provided fields (partial update).
            Returns None if store not found.
        """
        # Check store exists
        existing_store = await self.repo.get(store_id)
        if existing_store is None:
            return None

        # Build update dict (only non-None fields)
        update_data = {}
        if data.name is not None:
            update_data["name"] = data.name
        if data.url is not None:
            update_data["url"] = data.url

        # Update store if there are changes
        if update_data:
            updated_store = await self.repo.update(store_id, update_data)
            if updated_store is None:
                return None
            store = updated_store
        else:
            store = existing_store

        return StoreResponse(
            id=store.id,
            name=store.name,
            url=store.url,
            created_at=store.created_at,
            updated_at=store.updated_at,
        )

    async def delete(self, store_id: int) -> bool:
        """
        Delete a store by ID.

        Args:
            store_id: Store ID to delete

        Returns:
            True if store was deleted, False if not found

        Example:
            ```python
            deleted = await service.delete(store_id=42)
            if deleted:
                print("Store deleted successfully")
            else:
                print("Store not found")
            ```

        Note:
            - CASCADE delete removes all gift_store associations
            - Safe to call even if store doesn't exist
        """
        return await self.repo.delete(store_id)
