"""ListItem model - junction table connecting Gifts to Lists with status tracking."""

from decimal import Decimal
from enum import Enum
from typing import Optional

from sqlalchemy import Enum as SQLEnum, ForeignKey, Index, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class ListItemStatus(str, Enum):
    """Status enum for gift items in a list."""

    idea = "idea"  # Initial idea stage
    selected = "selected"  # Selected for purchase
    purchased = "purchased"  # Has been purchased
    received = "received"  # Gift has been received


class ListItem(BaseModel):
    """
    Junction table connecting Gifts to Lists with additional status tracking.

    A ListItem represents a gift added to a specific list, with its own lifecycle
    status (idea → selected → purchased → received) and optional assignment to
    a family member who will purchase it.

    Key Constraint: A gift can only appear once per list (composite unique constraint).

    Attributes:
        id: Primary key (inherited from BaseModel)
        gift_id: Foreign key to Gift (required)
        list_id: Foreign key to List (required)
        status: Current lifecycle status (idea/selected/purchased/received)
        assigned_to: Foreign key to User who will/did purchase (nullable)
        notes: Optional text notes about this list item
        price: List-specific price copied from Gift at creation (nullable, for budget tracking)
        discount_price: Optional sale/discount price (nullable)
        quantity: Number of items (default 1)
        created_at: Timestamp of creation (inherited from BaseModel)
        updated_at: Timestamp of last update (inherited from BaseModel)
    """

    __tablename__ = "list_items"

    # Foreign keys
    gift_id: Mapped[int] = mapped_column(
        ForeignKey("gifts.id", ondelete="CASCADE"),
        nullable=False,
    )
    list_id: Mapped[int] = mapped_column(
        ForeignKey("lists.id", ondelete="CASCADE"),
        nullable=False,
    )
    assigned_to: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Status and metadata
    status: Mapped[ListItemStatus] = mapped_column(
        SQLEnum(
            ListItemStatus,
            name="listitemstatus",
            native_enum=True,
            values_callable=lambda e: [m.value for m in e],
        ),
        nullable=False,
        default=ListItemStatus.idea,
        server_default="idea",
    )
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    # Pricing fields for budget tracking
    price: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),  # DECIMAL(10,2) for currency precision
        nullable=True,
        comment="List-specific price (copied from Gift at creation)",
    )
    discount_price: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),  # DECIMAL(10,2) for currency precision
        nullable=True,
        comment="Optional sale/discount price",
    )
    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        server_default="1",
        comment="Quantity of items (default 1)",
    )

    # Relationships (using string references to avoid circular imports)
    gift: Mapped["Gift"] = relationship(
        "Gift",
        back_populates="list_items",
        lazy="select",
    )
    list: Mapped["List"] = relationship(
        "List",
        back_populates="list_items",
        lazy="select",
    )
    assignee: Mapped["User | None"] = relationship(
        "User",
        back_populates="assigned_items",
        lazy="select",
    )

    # Table constraints and indexes
    __table_args__ = (
        # Composite unique constraint: gift can only be in a list once
        UniqueConstraint("gift_id", "list_id", name="uq_list_items_gift_list"),
        # Indexes for common queries
        Index("ix_list_items_gift_id", "gift_id"),
        Index("ix_list_items_list_id", "list_id"),
        Index("ix_list_items_status", "status"),
        Index("ix_list_items_assigned_to", "assigned_to"),
        # Composite index for list + status queries
        Index("ix_list_items_list_status", "list_id", "status"),
        {"comment": "Junction table linking gifts to lists with status tracking"},
    )

    @property
    def effective_price(self) -> Optional[Decimal]:
        """
        Calculate the effective price for budget calculations.

        Returns:
            discount_price if set, otherwise price, otherwise None
        """
        return self.discount_price if self.discount_price is not None else self.price

    @property
    def total_cost(self) -> Optional[Decimal]:
        """
        Calculate total cost (effective_price * quantity).

        Returns:
            Total cost or None if price is not set
        """
        if self.effective_price is not None:
            return self.effective_price * self.quantity
        return None

    def __repr__(self) -> str:
        """String representation of ListItem."""
        return (
            f"<ListItem(id={self.id}, gift_id={self.gift_id}, "
            f"list_id={self.list_id}, status={self.status.value}, "
            f"quantity={self.quantity}, total=${self.total_cost or 0})>"
        )
