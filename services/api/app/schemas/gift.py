"""Gift DTOs for gift items."""

from __future__ import annotations

from datetime import date
from decimal import Decimal
from enum import Enum
from typing import TYPE_CHECKING, Literal
from urllib.parse import urlparse

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator

from app.schemas.base import TimestampSchema

if TYPE_CHECKING:
    from app.schemas.tag import TagResponse


class GiftPriority(str, Enum):
    """Gift priority levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class AdditionalUrl(BaseModel):
    """Labeled URL for gift other links."""

    label: str = Field(..., min_length=1, max_length=120, description="Display label for the link")
    url: str = Field(..., max_length=2048, description="HTTP or HTTPS link to external resource")

    @field_validator("url")
    def validate_url(cls, value: str) -> str:
        parsed = urlparse(value)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("URL must start with http:// or https:// and include a host")
        return value


class MarkPurchasedRequest(BaseModel):
    """Payload for marking a gift as purchased."""

    quantity_purchased: int = Field(
        ...,
        ge=1,
        description="How many units were purchased in this action",
    )
    status: str | None = Field(
        default=None,
        pattern="^(purchased|partial)$",
        description="Optional override for derived status (purchased|partial)",
    )
    purchase_date: date | None = Field(
        default=None,
        description="Optional purchase date (defaults to today)",
    )
    sale_price: Decimal | None = Field(
        default=None,
        ge=0,
        decimal_places=2,
        description="Optional sale/paid price for the gift",
    )


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
    description: str | None = Field(
        None,
        description="Detailed description of the gift",
    )
    notes: str | None = Field(
        None,
        description="Internal notes about the gift",
    )
    priority: GiftPriority = Field(
        default=GiftPriority.MEDIUM,
        description="Priority level for this gift",
    )
    quantity: int = Field(
        default=1,
        ge=1,
        description="Number of items needed",
    )
    sale_price: Decimal | None = Field(
        None,
        ge=0,
        decimal_places=2,
        description="Sale or discounted price",
    )
    purchase_date: date | None = Field(
        None,
        description="Date when the gift was purchased",
    )
    additional_urls: list[AdditionalUrl] = Field(
        default_factory=list,
        description="Additional related URLs",
    )
    store_ids: list[int] = Field(
        default_factory=list,
        description="Optional store IDs to link",
    )
    person_ids: list[int] = Field(
        default_factory=list,
        description="Optional person IDs to link",
    )


class GiftUpdate(BaseModel):
    """DTO for updating a gift (all fields optional)."""

    name: str | None = Field(None, min_length=1, max_length=255)
    url: str | None = None
    price: Decimal | None = Field(None, ge=0, decimal_places=2)
    image_url: str | None = None
    source: str | None = None
    description: str | None = None
    notes: str | None = None
    priority: GiftPriority | None = None
    quantity: int | None = Field(None, ge=1)
    sale_price: Decimal | None = Field(None, ge=0, decimal_places=2)
    purchase_date: date | None = None
    additional_urls: list[AdditionalUrl] | None = None
    store_ids: list[int] | None = None
    person_ids: list[int] | None = None


class StoreMinimal(BaseModel):
    """Minimal store information for embedding in gift responses."""

    id: int
    name: str
    url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class GiftPersonLink(BaseModel):
    """Person-gift relationship with role information."""

    person_id: int = Field(..., description="ID of the person linked to this gift")
    role: str = Field(
        ...,
        description="Role of the person for this gift (recipient, purchaser, contributor)",
        pattern="^(recipient|purchaser|contributor)$"
    )

    model_config = ConfigDict(from_attributes=True)


class GiftListItemInfo(BaseModel):
    """Minimal list item info for embedding in gift responses."""

    id: int = Field(..., description="List item ID (for QuickPurchaseButton)")
    list_id: int = Field(..., description="ID of the list containing this gift")
    list_name: str = Field(..., description="Name of the list containing this gift")
    status: str = Field(..., description="Status of the gift in this list (idea/selected/purchased/received)")

    model_config = ConfigDict(from_attributes=True)


class GiftResponse(TimestampSchema):
    """DTO for gift response."""

    id: int
    name: str
    url: str | None
    price: Decimal | None
    image_url: str | None
    source: str | None
    description: str | None = None
    notes: str | None = None
    priority: GiftPriority = GiftPriority.MEDIUM
    quantity: int = 1
    sale_price: Decimal | None = None
    purchase_date: date | None = None
    additional_urls: list[AdditionalUrl] = Field(default_factory=list)
    extra_data: dict = Field(default_factory=dict)
    stores: list[StoreMinimal] = Field(
        default_factory=list,
        description="Stores where this gift is available",
    )
    person_ids: list[int] = Field(
        default_factory=list,
        description="Person IDs linked to this gift",
    )
    gift_people: list[GiftPersonLink] = Field(
        default_factory=list,
        description="Person relationships with role information (recipient/purchaser/contributor)",
    )
    list_items: list[GiftListItemInfo] = Field(
        default_factory=list,
        description="Lists containing this gift with status",
    )

    @field_serializer('price')
    def serialize_price(self, price: Decimal | None) -> float | None:
        return float(price) if price is not None else None

    @field_serializer('sale_price')
    def serialize_sale_price(self, sale_price: Decimal | None) -> float | None:
        return float(sale_price) if sale_price is not None else None


class GiftSummary(BaseModel):
    """Lightweight gift summary."""

    id: int
    name: str
    price: Decimal | None
    image_url: str | None
    priority: GiftPriority = GiftPriority.MEDIUM
    quantity: int = 1
    sale_price: Decimal | None = None

    @field_serializer('price')
    def serialize_price(self, price: Decimal | None) -> float | None:
        return float(price) if price is not None else None

    @field_serializer('sale_price')
    def serialize_sale_price(self, sale_price: Decimal | None) -> float | None:
        return float(sale_price) if sale_price is not None else None


class GiftWithTags(GiftResponse):
    """Gift response including tags."""

    tags: list["TagResponse"] = Field(
        default_factory=list,
        description="Tags associated with this gift",
    )


class GiftPeopleLink(BaseModel):
    """DTO for attaching people to a gift."""

    person_ids: list[int] = Field(
        ...,
        min_length=1,
        description="List of person IDs to attach to the gift",
        examples=[[1, 2, 3]],
    )


class BulkGiftAction(BaseModel):
    """Request body for bulk gift actions."""

    gift_ids: list[int] = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Gift IDs to perform action on"
    )
    action: Literal["assign_recipient", "assign_purchaser", "mark_purchased", "delete"] = Field(
        ...,
        description="Action to perform"
    )
    person_id: int | None = Field(
        None,
        description="Person ID for assign actions (required for assign_recipient/assign_purchaser)"
    )


class BulkGiftResult(BaseModel):
    """Result of a bulk gift action."""

    success_count: int = Field(description="Number of successfully processed gifts")
    failed_ids: list[int] = Field(default_factory=list, description="Gift IDs that failed")
    errors: list[str] = Field(default_factory=list, description="Error messages for failed gifts")
