"""Dashboard Pydantic schemas."""

import datetime

from pydantic import BaseModel

from app.schemas.base import BaseSchema


class DashboardOccasionSummary(BaseModel):
    """Summary of an occasion for dashboard."""

    id: int
    name: str
    date: datetime.date
    days_until: int
    total_items: int
    purchased_items: int


class PersonSummary(BaseModel):
    """Summary of a person needing gifts."""

    id: int
    name: str
    pending_gifts: int


class DashboardResponse(BaseSchema):
    """Dashboard aggregation response."""

    primary_occasion: DashboardOccasionSummary | None = None
    people_needing_gifts: list[PersonSummary] = []
    total_ideas: int = 0
    total_purchased: int = 0
    my_assignments: int = 0
