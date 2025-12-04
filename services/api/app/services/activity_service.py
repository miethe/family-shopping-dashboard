"""Activity service for managing activity logs and feeds."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.activity import ActivityLog
from app.repositories.activity import ActivityRepository
from app.schemas.activity import ActivityActor, ActivityEvent, ActivityFeedResponse


class ActivityService:
    """
    Activity service providing business logic for activity logging.

    Handles:
    - Creating activity log entries
    - Retrieving recent activity feed
    - Converting ORM models to DTOs
    - Building human-readable activity descriptions

    Example:
        ```python
        async with async_session() as session:
            service = ActivityService(session)
            feed = await service.get_recent_activity(limit=10)
        ```

    Attributes:
        session: SQLAlchemy async session for database operations
        repo: ActivityRepository for data access
    """

    def __init__(self, session: AsyncSession) -> None:
        """
        Initialize activity service with async database session.

        Args:
            session: SQLAlchemy async session for database operations
        """
        self.session = session
        self.repo = ActivityRepository(session)

    async def get_recent_activity(self, limit: int = 10) -> ActivityFeedResponse:
        """
        Get recent activity events for the activity feed.

        Fetches the most recent activity logs and converts them to DTOs
        with actor information and human-readable descriptions.

        Args:
            limit: Maximum number of events to return (default: 10, max: 50)

        Returns:
            ActivityFeedResponse with events list and total count

        Example:
            ```python
            feed = await service.get_recent_activity(limit=20)
            for event in feed.events:
                print(f"{event.created_at}: {event.description}")
            ```
        """
        # Get recent activity from repository
        activity_logs = await self.repo.get_recent_activity(limit=limit)

        # Get total count
        total = await self.repo.count_all()

        # Convert ORM models to DTOs
        events = [self._activity_log_to_dto(log) for log in activity_logs]

        return ActivityFeedResponse(
            events=events,
            total=total,
        )

    async def log_activity(
        self,
        action: str,
        actor_id: int,
        entity_type: str,
        entity_id: int,
        entity_name: str,
        extra_data: dict | None = None,
    ) -> ActivityEvent:
        """
        Create a new activity log entry.

        This method should be called from other services (GiftService, ListService, etc.)
        whenever an action needs to be logged for the activity feed.

        Args:
            action: Type of action (e.g., "GIFT_ADDED", "STATUS_CHANGED")
            actor_id: ID of user who performed the action
            entity_type: Type of entity affected (e.g., "list_item", "list", "person")
            entity_id: ID of the affected entity
            entity_name: Display name of the entity
            extra_data: Optional additional context (e.g., {"old_status": "idea", "new_status": "purchased"})

        Returns:
            ActivityEvent DTO with the created activity

        Example:
            ```python
            # From GiftService.create_gift()
            activity = await activity_service.log_activity(
                action="GIFT_ADDED",
                actor_id=current_user_id,
                entity_type="list_item",
                entity_id=new_gift.id,
                entity_name=new_gift.name,
                extra_data={"list_name": "Christmas 2025"}
            )
            ```
        """
        # Create activity log in database
        activity_log = await self.repo.create_activity(
            action=action,
            actor_id=actor_id,
            entity_type=entity_type,
            entity_id=entity_id,
            entity_name=entity_name,
            extra_data=extra_data,
        )

        # Convert to DTO and return
        return self._activity_log_to_dto(activity_log)

    async def get_user_activity(
        self, user_id: int, limit: int = 10
    ) -> ActivityFeedResponse:
        """
        Get activity events for a specific user.

        Args:
            user_id: ID of the user to get activity for
            limit: Maximum number of events to return (default: 10)

        Returns:
            ActivityFeedResponse with user's activity events

        Example:
            ```python
            user_feed = await service.get_user_activity(user_id=123, limit=20)
            print(f"User has {len(user_feed.events)} recent actions")
            ```
        """
        activity_logs = await self.repo.get_by_actor(actor_id=user_id, limit=limit)
        events = [self._activity_log_to_dto(log) for log in activity_logs]

        return ActivityFeedResponse(
            events=events,
            total=len(events),
        )

    async def get_entity_history(
        self, entity_type: str, entity_id: int
    ) -> ActivityFeedResponse:
        """
        Get activity history for a specific entity.

        Useful for showing "what happened to this gift" or audit trails.

        Args:
            entity_type: Type of entity (e.g., "list_item", "list", "person")
            entity_id: ID of the entity

        Returns:
            ActivityFeedResponse with entity's activity history

        Example:
            ```python
            gift_history = await service.get_entity_history("list_item", 456)
            for event in gift_history.events:
                print(f"{event.created_at}: {event.description}")
            ```
        """
        activity_logs = await self.repo.get_by_entity(entity_type, entity_id)
        events = [self._activity_log_to_dto(log) for log in activity_logs]

        return ActivityFeedResponse(
            events=events,
            total=len(events),
        )

    def _activity_log_to_dto(self, log: ActivityLog) -> ActivityEvent:
        """
        Convert ActivityLog ORM model to ActivityEvent DTO.

        Internal helper method that performs the ORM → DTO conversion
        following the repository pattern (service layer converts to DTOs).

        Args:
            log: ActivityLog ORM model instance with actor relationship loaded

        Returns:
            ActivityEvent DTO ready for API response

        Note:
            Assumes actor relationship is already loaded (selectinload in repository).
        """
        return ActivityEvent(
            id=log.id,
            action=log.action,
            actor=ActivityActor(
                id=log.actor.id,
                email=log.actor.email,
            ),
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            entity_name=log.entity_name,
            extra_data=log.extra_data,
            created_at=log.created_at,
        )
