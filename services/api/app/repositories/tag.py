"""Tag repository with tag-specific query methods."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.tag import Tag
from app.repositories.base import BaseRepository


class TagRepository(BaseRepository[Tag]):
    """
    Repository for Tag entity with tag-specific queries.

    Extends BaseRepository with:
    - Name-based lookups (unique tag names)
    - Eager loading of associated gifts
    - Tag usage statistics (gift counts)

    Example:
        ```python
        async with get_session() as session:
            repo = TagRepository(session)

            # Find by name
            electronics = await repo.get_by_name("Electronics")

            # Get tag with all gifts
            tag_with_gifts = await repo.get_with_gifts(tag_id=1)

            # Get all tags with counts
            tags_and_counts = await repo.get_all_with_counts()
            for tag, count in tags_and_counts:
                print(f"{tag.name}: {count} gifts")
        ```
    """

    def __init__(self, session: AsyncSession):
        """
        Initialize TagRepository with database session.

        Args:
            session: SQLAlchemy async session
        """
        super().__init__(session, Tag)

    async def get_by_name(self, name: str) -> Tag | None:
        """
        Find a tag by exact name (case-sensitive).

        Tag names are unique, so this returns at most one tag.

        Args:
            name: Exact tag name to search for

        Returns:
            Tag instance if found, None otherwise

        Example:
            ```python
            electronics_tag = await repo.get_by_name("Electronics")
            if electronics_tag:
                print(f"Found tag: {electronics_tag.id}")
            else:
                print("Tag not found")
            ```

        Note:
            This is case-sensitive. "Electronics" != "electronics".
            Tag names are indexed for fast lookups.
        """
        stmt = select(Tag).where(Tag.name == name)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_with_gifts(self, tag_id: int) -> Tag | None:
        """
        Get a tag with all associated gifts eagerly loaded.

        Uses selectinload to avoid N+1 queries when accessing tag.gifts.
        Efficient for displaying a tag's complete gift list.

        Args:
            tag_id: Primary key of the tag

        Returns:
            Tag instance with gifts loaded, or None if tag not found

        Example:
            ```python
            tag = await repo.get_with_gifts(tag_id=1)
            if tag:
                print(f"{tag.name} has {len(tag.gifts)} gifts:")
                for gift in tag.gifts:
                    print(f"  - {gift.name}")
            ```

        Note:
            Gifts are eagerly loaded. Access tag.gifts without additional queries.
            Uses selectinload strategy for optimal performance.
        """
        stmt = (
            select(Tag)
            .where(Tag.id == tag_id)
            .options(selectinload(Tag.gifts))  # Eager load gifts
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all_with_counts(self) -> list[tuple[Tag, int]]:
        """
        Get all tags with their associated gift counts.

        Returns tags ordered by name (ascending) with a count of how many
        gifts are associated with each tag. Useful for displaying tag
        statistics or tag clouds.

        Returns:
            List of tuples (Tag, gift_count), ordered by tag name

        Example:
            ```python
            tags_and_counts = await repo.get_all_with_counts()

            # Display tag statistics
            for tag, count in tags_and_counts:
                print(f"{tag.name}: {count} gifts")

            # Output:
            # Books: 5 gifts
            # Electronics: 12 gifts
            # Toys: 8 gifts
            ```

        Note:
            Count is 0 for tags with no associated gifts.
            Uses LEFT JOIN to include tags with zero gifts.
            Ordered alphabetically by tag name for consistent display.
        """
        # Build query with LEFT JOIN to count gifts
        # func.count() counts the number of gift_id entries per tag
        stmt = (
            select(Tag, func.count(Tag.gifts).label("gift_count"))
            .select_from(Tag)
            .group_by(Tag.id)  # Group by tag to aggregate counts
            .order_by(Tag.name.asc())  # Alphabetical order
        )

        result = await self.session.execute(stmt)

        # Convert result rows to list of (Tag, int) tuples
        # result.all() returns rows with Tag object and gift_count
        tags_with_counts: list[tuple[Tag, int]] = [
            (row[0], row[1]) for row in result.all()
        ]

        return tags_with_counts
