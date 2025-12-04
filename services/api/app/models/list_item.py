"""ListItem model - junction table connecting Gifts to Lists with status tracking."""

from enum import Enum
from typing import Optional

from sqlalchemy import ForeignKey, Index, String, Text, UniqueConstraint
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
        nullable=False,
        default=ListItemStatus.idea,
        server_default="idea",  # PostgreSQL default
    )
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
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

    def __repr__(self) -> str:
        """String representation of ListItem."""
        return (
            f"<ListItem(id={self.id}, gift_id={self.gift_id}, "
            f"list_id={self.list_id}, status={self.status.value})>"
        )
