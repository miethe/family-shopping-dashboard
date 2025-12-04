"""Ideas endpoint for fetching the Idea Inbox."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.schemas.idea import IdeaInboxResponse
from app.services.idea_service import IdeaService

router = APIRouter(prefix="/ideas", tags=["ideas"])


@router.get("/inbox", response_model=IdeaInboxResponse)
async def get_inbox_ideas(
    limit: int = Query(default=10, le=50, description="Maximum number of ideas to return"),
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> IdeaInboxResponse:
    """
    Get gift ideas in the inbox.

    Fetches all gift ideas that are in IDEA status and not yet formally
    assigned to lists. These are "floating" ideas that family members have
    added but haven't committed to specific occasions or people yet.

    Args:
        limit: Maximum number of ideas to return (default: 10, max: 50)
        current_user_id: ID of authenticated user (from JWT token)
        db: Database session dependency

    Returns:
        IdeaInboxResponse: List of ideas with gift details and who added them

    Example:
        ```python
        # GET /api/v1/ideas/inbox?limit=20
        # Headers: Authorization: Bearer <token>

        # Response:
        {
            "ideas": [
                {
                    "id": 123,
                    "name": "LEGO Star Wars Set",
                    "image_url": "https://example.com/lego.jpg",
                    "price": 89.99,
                    "created_at": "2025-11-28T10:30:00Z",
                    "added_by": {
                        "id": 1,
                        "email": "user@example.com"
                    }
                },
                {
                    "id": 124,
                    "name": "Running Shoes",
                    "image_url": null,
                    "price": 120.00,
                    "created_at": "2025-11-27T15:45:00Z",
                    "added_by": {
                        "id": 2,
                        "email": "family@example.com"
                    }
                }
            ],
            "total": 2
        }
        ```

    Raises:
        401: If user is not authenticated
        500: If database error occurs
    """
    service = IdeaService(db)
    return await service.get_inbox_ideas(limit=limit)
