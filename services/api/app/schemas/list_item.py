"""ListItem DTOs for gift items in lists."""

from __future__ import annotations

from decimal import Decimal
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
    price: Decimal | None = Field(
        None,
        description="List-specific price (copied from Gift if not provided)",
        ge=0,
    )
    discount_price: Decimal | None = Field(
        None,
        description="Optional sale/discount price",
        ge=0,
    )
    quantity: int = Field(
        default=1,
        description="Quantity of items (default 1)",
        ge=1,
    )


class ListItemUpdate(BaseModel):
    """DTO for updating a list item (all fields optional)."""

    status: ListItemStatus | None = None
    assigned_to: int | None = None
    notes: str | None = None
    price: Decimal | None = Field(None, ge=0)
    discount_price: Decimal | None = Field(None, ge=0)
    quantity: int | None = Field(None, ge=1)


class ListItemResponse(TimestampSchema):
    """DTO for list item response."""

    id: int
    gift_id: int
    list_id: int
    status: ListItemStatus
    assigned_to: int | None
    notes: str | None
    price: Decimal | None
    discount_price: Decimal | None
    quantity: int

    @property
    def effective_price(self) -> Decimal | None:
        """Calculate effective price (discount_price if set, otherwise price)."""
        return self.discount_price if self.discount_price is not None else self.price

    @property
    def total_cost(self) -> Decimal | None:
        """Calculate total cost (effective_price * quantity)."""
        if self.effective_price is not None:
            return self.effective_price * self.quantity
        return None


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
