"""Activity repository for querying activity logs."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.activity import ActivityLog
from app.models.user import User
from app.repositories.base import BaseRepository


class ActivityRepository(BaseRepository[ActivityLog]):
    """
    Repository for ActivityLog model with specialized queries.

    Extends BaseRepository with activity-specific operations:
    - Get recent activity with actor details
    - Filter by entity type or actor
    - Efficient queries with proper eager loading
    """

    def __init__(self, session: AsyncSession):
        """
        Initialize repository with database session.

        Args:
            session: SQLAlchemy async session
        """
        super().__init__(session, ActivityLog)

    async def get_recent_activity(self, limit: int = 10) -> list[ActivityLog]:
        """
        Get recent activity events ordered by timestamp descending.

        Eagerly loads the actor relationship to avoid N+1 queries when
        building the activity feed response.

        Args:
            limit: Maximum number of events to return (default: 10, max: 50)

        Returns:
            List of ActivityLog instances with actor relationship loaded

        Example:
            ```python
            recent = await repo.get_recent_activity(limit=20)
            for log in recent:
                print(f"{log.actor.email} performed {log.action}")
            ```
        """
        # Cap limit at 50 to prevent excessive data transfer
        limit = min(limit, 50)

        stmt = (
            select(ActivityLog)
            .options(selectinload(ActivityLog.actor))
            .order_by(ActivityLog.created_at.desc())
            .limit(limit)
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_actor(self, actor_id: int, limit: int = 10) -> list[ActivityLog]:
        """
        Get activity events for a specific user.

        Args:
            actor_id: Foreign key of the user
            limit: Maximum number of events to return (default: 10)

        Returns:
            List of ActivityLog instances for the specified actor

        Example:
            ```python
            user_activity = await repo.get_by_actor(actor_id=123, limit=20)
            print(f"User has {len(user_activity)} recent actions")
            ```
        """
        stmt = (
            select(ActivityLog)
            .where(ActivityLog.actor_id == actor_id)
            .options(selectinload(ActivityLog.actor))
            .order_by(ActivityLog.created_at.desc())
            .limit(limit)
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_entity(
        self, entity_type: str, entity_id: int
    ) -> list[ActivityLog]:
        """
        Get all activity events for a specific entity.

        Useful for showing the history of a particular gift, list, or person.

        Args:
            entity_type: Type of entity (e.g., "list_item", "list", "person")
            entity_id: ID of the entity

        Returns:
            List of ActivityLog instances for the entity, ordered by timestamp desc

        Example:
            ```python
            gift_history = await repo.get_by_entity("list_item", 456)
            for event in gift_history:
                print(f"{event.created_at}: {event.action}")
            ```
        """
        stmt = (
            select(ActivityLog)
            .where(
                ActivityLog.entity_type == entity_type,
                ActivityLog.entity_id == entity_id,
            )
            .options(selectinload(ActivityLog.actor))
            .order_by(ActivityLog.created_at.desc())
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_entity_type(
        self, entity_type: str, limit: int = 10
    ) -> list[ActivityLog]:
        """
        Get recent activity for a specific entity type.

        Args:
            entity_type: Type of entity (e.g., "list_item", "list", "person")
            limit: Maximum number of events to return (default: 10)

        Returns:
            List of ActivityLog instances for the entity type

        Example:
            ```python
            gift_activity = await repo.get_by_entity_type("list_item", limit=20)
            print(f"Recent gift activity: {len(gift_activity)} events")
            ```
        """
        stmt = (
            select(ActivityLog)
            .where(ActivityLog.entity_type == entity_type)
            .options(selectinload(ActivityLog.actor))
            .order_by(ActivityLog.created_at.desc())
            .limit(limit)
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def count_all(self) -> int:
        """
        Get total count of all activity logs.

        Returns:
            Total number of activity log entries in the database

        Example:
            ```python
            total = await repo.count_all()
            print(f"Total activity events: {total}")
            ```
        """
        stmt = select(func.count(ActivityLog.id))
        result = await self.session.execute(stmt)
        return result.scalar() or 0

    async def create_activity(
        self,
        action: str,
        actor_id: int,
        entity_type: str,
        entity_id: int,
        entity_name: str,
        extra_data: dict | None = None,
    ) -> ActivityLog:
        """
        Create a new activity log entry.

        Convenience method that wraps the base create() with proper typing
        and returns the created log with actor relationship loaded.

        Args:
            action: Type of action (e.g., "GIFT_ADDED", "STATUS_CHANGED")
            actor_id: ID of user who performed the action
            entity_type: Type of entity affected (e.g., "list_item", "list")
            entity_id: ID of the affected entity
            entity_name: Display name of the entity
            extra_data: Optional additional context

        Returns:
            Created ActivityLog instance with actor loaded

        Example:
            ```python
            log = await repo.create_activity(
                action="GIFT_ADDED",
                actor_id=123,
                entity_type="list_item",
                entity_id=456,
                entity_name="LEGO Star Wars",
                extra_data={"list_name": "Christmas 2025"}
            )
            ```
        """
        activity = await self.create(
            {
                "action": action,
                "actor_id": actor_id,
                "entity_type": entity_type,
                "entity_id": entity_id,
                "entity_name": entity_name,
                "extra_data": extra_data,
            }
        )

        # Reload with actor relationship
        stmt = (
            select(ActivityLog)
            .where(ActivityLog.id == activity.id)
            .options(selectinload(ActivityLog.actor))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one()
