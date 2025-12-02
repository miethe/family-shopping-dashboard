"""Idea Inbox service for fetching gift ideas not yet in formal lists."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.gift import Gift
from app.models.list import List
from app.models.list_item import ListItem, ListItemStatus
from app.models.user import User
from app.schemas.idea import IdeaInboxItem, IdeaInboxResponse, UserSummary


class IdeaService:
    """
    Service for managing the Idea Inbox.

    The Idea Inbox displays gift ideas that are in "IDEA" status and not yet
    formally assigned to lists. This provides a centralized view of all
    floating gift ideas across the family.

    Example:
        ```python
        async with async_session() as session:
            service = IdeaService(session)
            inbox = await service.get_inbox_ideas(limit=20)
            for idea in inbox.ideas:
                print(f"{idea.name} - added by {idea.added_by.email}")
        ```

    Attributes:
        session: SQLAlchemy async session for database operations.
    """

    def __init__(self, session: AsyncSession) -> None:
        """
        Initialize idea service with async database session.

        Args:
            session: SQLAlchemy async session for database operations.
        """
        self.session = session

    async def get_inbox_ideas(self, limit: int = 10) -> IdeaInboxResponse:
        """
        Get gift ideas in the inbox (status=IDEA).

        Fetches list items that are in IDEA status, ordered by most recently
        created first. Includes gift details and user information about who
        added each idea.

        Args:
            limit: Maximum number of ideas to return (default: 10, max: 50).

        Returns:
            IdeaInboxResponse with list of ideas and total count.

        Example:
            ```python
            inbox = await service.get_inbox_ideas(limit=20)
            print(f"Found {inbox.total} ideas")
            for idea in inbox.ideas:
                print(f"- {idea.name} (${idea.price})")
                print(f"  Added by: {idea.added_by.email}")
                print(f"  Added on: {idea.created_at}")
            ```

        Note:
            - Only returns items with status=IDEA
            - Results ordered by created_at DESC (newest first)
            - Eager loads gift, list, and user relationships to avoid N+1 queries
            - Limit is capped at 50 to prevent excessive data transfer
        """
        # Cap limit at 50
        limit = min(limit, 50)

        # Query list items with status=IDEA, ordered by created_at DESC
        # Eager load gift, list, and list.user relationships
        stmt = (
            select(ListItem)
            .where(ListItem.status == ListItemStatus.idea)
            .options(
                selectinload(ListItem.gift),
                selectinload(ListItem.list).selectinload(List.user),
            )
            .order_by(ListItem.created_at.desc())
            .limit(limit)
        )

        result = await self.session.execute(stmt)
        list_items = list(result.scalars().all())

        # Build IdeaInboxItem DTOs
        ideas = []
        for item in list_items:
            # Get user from the list owner (who added this idea)
            user = item.list.user

            idea = IdeaInboxItem(
                id=item.id,
                name=item.gift.name,
                image_url=item.gift.image_url,
                price=float(item.gift.price) if item.gift.price else None,
                created_at=item.created_at,
                added_by=UserSummary(
                    id=user.id,
                    email=user.email,
                ),
            )
            ideas.append(idea)

        return IdeaInboxResponse(
            ideas=ideas,
            total=len(ideas),
        )
