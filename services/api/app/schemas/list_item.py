"""ListItem DTOs for gift items in lists."""

from __future__ import annotations

from typing import TYPE_CHECKING

from pydantic import BaseModel, Field

from app.models.list_item import ListItemStatus
from app.schemas.base import TimestampSchema
from app.schemas.gift import GiftSummary

if TYPE_CHECKING:
    from app.schemas.user import UserResponse


class ListItemCreate(BaseModel):
    """DTO for adding a gift to a list."""

    gift_id: int = Field(
        ...,
        description="ID of the gift to add",
    )
    list_id: int | None = Field(
        None,
        description="ID of the list (optional - typically provided via URL path)",
    )
    status: ListItemStatus = Field(
        default=ListItemStatus.idea,
        description="Initial status (defaults to idea)",
    )
    assigned_to: int | None = Field(
        None,
        description="User ID who will purchase this gift",
    )
    notes: str | None = Field(
        None,
        description="Optional notes about this list item",
    )


class ListItemUpdate(BaseModel):
    """DTO for updating a list item (all fields optional)."""

    status: ListItemStatus | None = None
    assigned_to: int | None = None
    notes: str | None = None


class ListItemResponse(TimestampSchema):
    """DTO for list item response."""

    id: int
    gift_id: int
    list_id: int
    status: ListItemStatus
    assigned_to: int | None
    notes: str | None


class ListItemWithGift(ListItemResponse):
    """List item response including gift details."""

    gift: GiftSummary = Field(
        ...,
        description="Gift details",
    )


class ListItemWithAssignee(ListItemResponse):
    """List item response including assignee info."""

    assignee: "UserResponse | None" = Field(
        None,
        description="User assigned to purchase this gift",
    )


# Resolve forward references at module load time
from app.schemas.user import UserResponse  # noqa: E402

ListItemWithAssignee.model_rebuild()
