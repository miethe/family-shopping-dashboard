"""Dashboard aggregation endpoint."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard import DashboardService

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DashboardResponse:
    """
    Get aggregated dashboard data for the current user.

    Returns dashboard summary with:
    - primary_occasion: Next upcoming occasion with item statistics
    - people_needing_gifts: List of people with pending gifts (IDEA/SELECTED)
    - total_ideas: Total count of items in IDEA status
    - total_purchased: Total count of items in PURCHASED or RECEIVED status
    - my_assignments: Count of items assigned to current user (excluding RECEIVED)

    Args:
        current_user_id: ID of authenticated user (from JWT token)
        db: Database session dependency

    Returns:
        DashboardResponse: Aggregated dashboard data

    Example:
        ```python
        # GET /dashboard
        # Headers: Authorization: Bearer <token>

        # Response:
        {
            "primary_occasion": {
                "id": 1,
                "name": "Christmas 2025",
                "date": "2025-12-25",
                "days_until": 29,
                "total_items": 12,
                "purchased_items": 3
            },
            "people_needing_gifts": [
                {"id": 2, "name": "Sarah", "pending_gifts": 4},
                {"id": 3, "name": "Mom", "pending_gifts": 2}
            ],
            "total_ideas": 8,
            "total_purchased": 3,
            "my_assignments": 2
        }
        ```
    """
    service = DashboardService(db)
    return await service.get_dashboard(user_id=current_user_id)
