"""Gift model representing individual gift items in the catalog."""

from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Index, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.list_item import ListItem
    from app.models.tag import Tag


class Gift(BaseModel):
    """
    Gift entity representing individual gift items.

    Gifts are catalog items that can be added to multiple lists via ListItem.
    They represent product ideas with optional URLs, pricing, and metadata.

    Attributes:
        id: Primary key (inherited from BaseModel)
        name: Gift name (required)
        url: Optional URL to purchase the gift
        price: Optional price in currency (DECIMAL(10,2) for precision)
        image_url: Optional URL for product image
        source: Optional text describing where the gift idea came from
        extra_data: JSON field for extensible data (uses JSONB for PostgreSQL)
        created_at: Timestamp of creation (inherited from BaseModel)
        updated_at: Timestamp of last update (inherited from BaseModel)
    """

    __tablename__ = "gifts"

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,  # Index for search queries
    )

    url: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    price: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),  # DECIMAL(10,2) for currency precision
        nullable=True,
    )

    image_url: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    source: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    extra_data: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default="{}",  # PostgreSQL default
    )

    # Many-to-many relationship to Tag
    tags: Mapped[list["Tag"]] = relationship(
        "Tag",
        secondary="gift_tags",
        back_populates="gifts",
        lazy="select",
    )

    # One-to-many relationship to ListItem (which lists contain this gift)
    list_items: Mapped[list["ListItem"]] = relationship(
        "ListItem",
        back_populates="gift",
        lazy="select",
        cascade="all, delete-orphan",  # Delete list items when gift is deleted
    )

    __table_args__ = (
        Index("ix_gifts_name", "name"),  # Explicit name for search index
    )

    def __repr__(self) -> str:
        """String representation of Gift."""
        return f"<Gift(id={self.id}, name='{self.name}', price={self.price})>"
