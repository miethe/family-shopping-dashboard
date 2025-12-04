"""Idea Inbox DTOs for gift ideas not yet in formal lists."""

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.base import BaseSchema


class UserSummary(BaseModel):
    """Summary of user information for idea display."""

    id: int
    email: str


class IdeaInboxItem(BaseSchema):
    """Individual idea item in the inbox."""

    id: int = Field(..., description="List item ID")
    name: str = Field(..., description="Gift name")
    image_url: str | None = Field(None, description="Gift image URL")
    price: float | None = Field(None, description="Gift price")
    created_at: datetime = Field(..., description="When the idea was added")
    added_by: UserSummary = Field(..., description="User who added this idea")


class IdeaInboxResponse(BaseSchema):
    """Response containing list of inbox ideas."""

    ideas: list[IdeaInboxItem] = Field(
        default_factory=list,
        description="List of gift ideas in the inbox",
    )
    total: int = Field(..., description="Total count of inbox ideas")
