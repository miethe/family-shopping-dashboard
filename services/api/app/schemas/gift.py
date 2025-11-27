"""Gift DTOs for gift items."""

from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING

from pydantic import BaseModel, Field

from app.schemas.base import TimestampSchema

if TYPE_CHECKING:
    from app.schemas.tag import TagResponse


class GiftCreate(BaseModel):
    """DTO for creating a new gift."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Gift name",
        examples=["LEGO Star Wars Set", "Running Shoes", "Coffee Maker"],
    )
    url: str | None = Field(
        None,
        description="URL to purchase the gift",
        examples=["https://www.amazon.com/dp/B08H93ZRK9"],
    )
    price: Decimal | None = Field(
        None,
        ge=0,
        decimal_places=2,
        description="Price in currency",
        examples=[29.99],
    )
    image_url: str | None = Field(
        None,
        description="URL for product image",
    )
    source: str | None = Field(
        None,
        description="Where the gift idea came from",
        examples=["Amazon wishlist", "Mentioned in conversation", "Saw at store"],
    )


class GiftUpdate(BaseModel):
    """DTO for updating a gift (all fields optional)."""

    name: str | None = Field(None, min_length=1, max_length=255)
    url: str | None = None
    price: Decimal | None = Field(None, ge=0, decimal_places=2)
    image_url: str | None = None
    source: str | None = None


class GiftResponse(TimestampSchema):
    """DTO for gift response."""

    id: int
    name: str
    url: str | None
    price: Decimal | None
    image_url: str | None
    source: str | None
    extra_data: dict = Field(default_factory=dict)


class GiftSummary(BaseModel):
    """Lightweight gift summary."""

    id: int
    name: str
    price: Decimal | None
    image_url: str | None


class GiftWithTags(GiftResponse):
    """Gift response including tags."""

    tags: list["TagResponse"] = Field(
        default_factory=list,
        description="Tags associated with this gift",
    )
