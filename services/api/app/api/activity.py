"""Activity feed endpoint for recent activity."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.schemas.activity import ActivityFeedResponse
from app.services.activity_service import ActivityService

router = APIRouter(prefix="/activity", tags=["activity"])


@router.get("", response_model=ActivityFeedResponse)
async def get_activity_feed(
    limit: int = Query(default=10, ge=1, le=50, description="Number of events to return"),
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ActivityFeedResponse:
    """
    Get recent activity feed for the dashboard.

    Returns a chronological list of recent actions taken by family members,
    ordered by timestamp descending (most recent first).

    Each event includes:
    - Actor information (who performed the action)
    - Entity details (what was affected)
    - Timestamp and action type
    - Human-readable description

    Args:
        limit: Maximum number of events to return (1-50, default: 10)
        current_user_id: ID of authenticated user (from JWT token)
        db: Database session dependency

    Returns:
        ActivityFeedResponse with recent events and total count

    Example:
        ```python
        # GET /api/v1/activity?limit=20
        # Headers: Authorization: Bearer <token>

        # Response:
        {
            "events": [
                {
                    "id": 123,
                    "action": "gift_added",
                    "actor": {
                        "id": 1,
                        "email": "sarah@example.com"
                    },
                    "entity_type": "list_item",
                    "entity_id": 456,
                    "entity_name": "LEGO Star Wars",
                    "metadata": {"list_name": "Christmas 2025"},
                    "created_at": "2025-12-01T14:30:00Z",
                    "description": "Sarah added LEGO Star Wars"
                },
                {
                    "id": 122,
                    "action": "status_changed",
                    "actor": {
                        "id": 2,
                        "email": "mom@example.com"
                    },
                    "entity_type": "list_item",
                    "entity_id": 455,
                    "entity_name": "Harry Potter Book",
                    "metadata": {
                        "old_status": "idea",
                        "new_status": "purchased"
                    },
                    "created_at": "2025-12-01T13:15:00Z",
                    "description": "Mom changed Harry Potter Book from idea to purchased"
                }
            ],
            "total": 42
        }
        ```

    Authentication:
        Requires valid JWT token in Authorization header.

    Rate Limiting:
        Standard rate limits apply (see API documentation).
    """
    service = ActivityService(db)
    return await service.get_recent_activity(limit=limit)


@router.get("/user/{user_id}", response_model=ActivityFeedResponse)
async def get_user_activity(
    user_id: int,
    limit: int = Query(default=10, ge=1, le=50, description="Number of events to return"),
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ActivityFeedResponse:
    """
    Get activity feed for a specific user.

    Returns all actions performed by a specific family member.

    Args:
        user_id: ID of the user to get activity for
        limit: Maximum number of events to return (1-50, default: 10)
        current_user_id: ID of authenticated user (from JWT token)
        db: Database session dependency

    Returns:
        ActivityFeedResponse with user's activity events

    Example:
        ```python
        # GET /api/v1/activity/user/2?limit=15
        # Headers: Authorization: Bearer <token>

        # Response:
        {
            "events": [
                {
                    "id": 123,
                    "action": "gift_purchased",
                    "actor": {
                        "id": 2,
                        "email": "sarah@example.com"
                    },
                    "entity_type": "list_item",
                    "entity_id": 456,
                    "entity_name": "LEGO Star Wars",
                    "created_at": "2025-12-01T14:30:00Z"
                }
            ],
            "total": 1
        }
        ```
    """
    service = ActivityService(db)
    return await service.get_user_activity(user_id=user_id, limit=limit)


@router.get("/entity/{entity_type}/{entity_id}", response_model=ActivityFeedResponse)
async def get_entity_history(
    entity_type: str,
    entity_id: int,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ActivityFeedResponse:
    """
    Get activity history for a specific entity.

    Returns all actions performed on a specific gift, list, or person.
    Useful for audit trails and "what happened to this item" views.

    Args:
        entity_type: Type of entity (e.g., "list_item", "list", "person")
        entity_id: ID of the entity
        current_user_id: ID of authenticated user (from JWT token)
        db: Database session dependency

    Returns:
        ActivityFeedResponse with entity's activity history

    Example:
        ```python
        # GET /api/v1/activity/entity/list_item/456
        # Headers: Authorization: Bearer <token>

        # Response:
        {
            "events": [
                {
                    "id": 124,
                    "action": "status_changed",
                    "entity_type": "list_item",
                    "entity_id": 456,
                    "entity_name": "LEGO Star Wars",
                    "created_at": "2025-12-01T15:00:00Z"
                },
                {
                    "id": 123,
                    "action": "gift_added",
                    "entity_type": "list_item",
                    "entity_id": 456,
                    "entity_name": "LEGO Star Wars",
                    "created_at": "2025-12-01T14:30:00Z"
                }
            ],
            "total": 2
        }
        ```
    """
    service = ActivityService(db)
    return await service.get_entity_history(entity_type=entity_type, entity_id=entity_id)
