"""List DTOs for gift lists."""

from __future__ import annotations

from typing import TYPE_CHECKING

from pydantic import BaseModel, Field

from app.models.list import ListType, ListVisibility
from app.schemas.base import TimestampSchema

if TYPE_CHECKING:
    from app.schemas.list_item import ListItemWithGift


class ListCreate(BaseModel):
    """DTO for creating a new list."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="List name",
        examples=["Christmas Wishlist", "Ideas for Mom", "Birthday Gifts"],
    )
    type: ListType = Field(
        ...,
        description="Type of list",
    )
    visibility: ListVisibility = Field(
        ...,
        description="Visibility level",
    )
    person_id: int | None = Field(
        None,
        description="Person this list is for (optional)",
    )
    occasion_id: int | None = Field(
        None,
        description="Occasion context (optional)",
    )


class ListUpdate(BaseModel):
    """DTO for updating a list (all fields optional)."""

    name: str | None = Field(None, min_length=1, max_length=255)
    type: ListType | None = None
    visibility: ListVisibility | None = None
    person_id: int | None = None
    occasion_id: int | None = None


class ListResponse(TimestampSchema):
    """DTO for list response."""

    id: int
    name: str
    type: ListType
    visibility: ListVisibility
    user_id: int
    person_id: int | None
    occasion_id: int | None
    item_count: int = Field(
        0,
        description="Number of items in this list",
    )


class ListSummary(BaseModel):
    """Lightweight list summary."""

    id: int
    name: str
    type: ListType
    visibility: ListVisibility
    item_count: int = Field(
        ...,
        description="Number of items in this list",
    )


class ListWithItems(ListResponse):
    """List response including list items."""

    items: list["ListItemWithGift"] = Field(
        default_factory=list,
        description="List items with gift details",
    )


# Resolve forward references at module load time
from app.schemas.list_item import ListItemWithGift  # noqa: E402

ListWithItems.model_rebuild()
