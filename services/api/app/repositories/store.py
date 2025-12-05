"""Store repository for database operations."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.store import GiftStore, Store
from app.repositories.base import BaseRepository


class StoreRepository(BaseRepository[Store]):
    """
    Repository for Store entity with specialized queries.

    Extends BaseRepository with:
    - Get or create by name (for inline store creation)
    - Get by name lookup
    - Gift count aggregation

    Example:
        ```python
        repo = StoreRepository(session)

        # Get or create store
        store, created = await repo.get_or_create("Amazon", "https://amazon.com")

        # Get by name
        store = await repo.get_by_name("Amazon")
        ```
    """

    def __init__(self, session: AsyncSession):
        """
        Initialize repository with async database session.

        Args:
            session: SQLAlchemy async session for database operations
        """
        super().__init__(session, Store)

    async def get_by_name(self, name: str) -> Store | None:
        """
        Get store by exact name match (case-sensitive).

        Args:
            name: Store name to search for

        Returns:
            Store instance if found, None otherwise

        Example:
            ```python
            amazon = await repo.get_by_name("Amazon")
            if amazon:
                print(f"Found store: {amazon.id}")
            ```

        Note:
            - Exact match only (use search_by_name for fuzzy matching)
            - Case-sensitive comparison
        """
        stmt = select(self.model).where(self.model.name == name)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_or_create(
        self, name: str, url: str | None = None
    ) -> tuple[Store, bool]:
        """
        Get existing store by name or create new one if not found.

        This is the key method for inline store creation when adding stores
        to gifts. It prevents duplicate store entries.

        Args:
            name: Store name
            url: Optional store URL

        Returns:
            Tuple of (store, created) where:
            - store: The Store instance (existing or new)
            - created: True if store was created, False if it already existed

        Example:
            ```python
            # First call - creates store
            store, created = await repo.get_or_create("Target", "https://target.com")
            assert created == True

            # Second call - returns existing
            store2, created = await repo.get_or_create("Target")
            assert created == False
            assert store.id == store2.id
            ```

        Note:
            - Name comparison is case-sensitive
            - URL is only used when creating (ignored if store exists)
            - Automatically commits to database
        """
        existing = await self.get_by_name(name)
        if existing:
            return existing, False

        # Create new store
        store = await self.create({"name": name, "url": url})
        return store, True

    async def get_with_gift_count(self, store_id: int) -> dict | None:
        """
        Get store with count of associated gifts.

        Args:
            store_id: Store ID to retrieve

        Returns:
            Dictionary with store data and gift_count, or None if not found

        Example:
            ```python
            result = await repo.get_with_gift_count(store_id=5)
            if result:
                print(f"{result['name']}: {result['gift_count']} gifts")
            ```
        """
        store = await self.get(store_id)
        if store is None:
            return None

        # Count associated gifts
        stmt = select(func.count(GiftStore.id)).where(GiftStore.store_id == store_id)
        result = await self.session.execute(stmt)
        gift_count = result.scalar_one()

        return {
            "id": store.id,
            "name": store.name,
            "url": store.url,
            "created_at": store.created_at,
            "updated_at": store.updated_at,
            "gift_count": gift_count,
        }

    async def search_by_name(self, query: str, limit: int = 20) -> list[Store]:
        """
        Search stores by name using case-insensitive pattern matching.

        Args:
            query: Search string to match against store names
            limit: Maximum number of results to return (default: 20)

        Returns:
            List of Store instances matching the search query

        Example:
            ```python
            # Find all stores with "amazon" in the name
            results = await repo.search_by_name("amazon")
            # Returns: ["Amazon", "Amazon Fresh", "amazon.co.uk"]
            ```

        Note:
            - Search uses substring matching (finds query anywhere in name)
            - Case-insensitive matching
            - Results ordered by name
        """
        stmt = (
            select(self.model)
            .where(self.model.name.ilike(f"%{query}%"))
            .order_by(self.model.name)
            .limit(limit)
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().all())
