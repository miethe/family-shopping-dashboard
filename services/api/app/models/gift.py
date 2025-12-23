"""Gift model representing individual gift items in the catalog."""

import enum
from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import JSON, Boolean, Date, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.gift_person import GiftPerson
    from app.models.list_item import ListItem
    from app.models.person import Person
    from app.models.store import Store
    from app.models.tag import Tag


class GiftPriority(str, enum.Enum):
    """Gift priority levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class GiftStatus(str, enum.Enum):
    """Gift lifecycle status."""

    IDEA = "idea"
    SELECTED = "selected"
    PURCHASED = "purchased"
    RECEIVED = "received"


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
        description: Optional detailed description of the gift
        notes: Optional internal notes about the gift
        priority: Gift priority level (low/medium/high), defaults to medium
        status: Gift lifecycle status (idea/selected/purchased/received), defaults to idea
        quantity: Number of items needed, defaults to 1
        sale_price: Optional sale/discounted price in currency
        purchase_date: Optional date when the gift was purchased
        additional_urls: Optional array of additional related URLs
        from_santa: Boolean flag indicating if the gift is from Santa (defaults to False)
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

    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    priority: Mapped[GiftPriority] = mapped_column(
        SQLEnum(
            GiftPriority,
            name="gift_priority",
            native_enum=True,
            values_callable=lambda e: [m.value for m in e],
        ),
        default=GiftPriority.MEDIUM,
        nullable=False,
    )

    status: Mapped[GiftStatus] = mapped_column(
        SQLEnum(
            GiftStatus,
            name="giftstatus",
            native_enum=True,
            values_callable=lambda e: [m.value for m in e],
        ),
        default=GiftStatus.IDEA,
        nullable=False,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    sale_price: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    purchase_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )

    additional_urls: Mapped[Optional[list[dict[str, str]]]] = mapped_column(
        JSON,
        nullable=True,
    )

    from_santa: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
    )

    extra_data: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
        server_default="{}",
    )

    # Foreign key to Person (gift purchaser)
    purchaser_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("persons.id", ondelete="SET NULL"),
        nullable=True,
        index=True,  # Index for filtering by purchaser
    )

    # Many-to-many relationship to Tag
    tags: Mapped[list["Tag"]] = relationship(
        "Tag",
        secondary="gift_tags",
        back_populates="gifts",
        lazy="select",
    )

    # Many-to-many relationship to Store
    stores: Mapped[list["Store"]] = relationship(
        "Store",
        secondary="gift_stores",
        back_populates="gifts",
        lazy="select",
    )

    # Many-to-many relationship to Person (gift recipients)
    people: Mapped[list["Person"]] = relationship(
        "Person",
        secondary="gift_people",
        back_populates="gifts",
        lazy="select",
    )

    # Direct relationship to GiftPerson (for accessing role information)
    gift_people_links: Mapped[list["GiftPerson"]] = relationship(
        "GiftPerson",
        foreign_keys="[GiftPerson.gift_id]",
        back_populates="gift",
        lazy="select",
        cascade="all, delete-orphan",
        overlaps="people",  # This relationship overlaps with the secondary 'people' relationship
    )

    # Many-to-one relationship to Person (gift purchaser)
    purchaser: Mapped[Optional["Person"]] = relationship(
        "Person",
        foreign_keys=[purchaser_id],
        back_populates="gifts_purchasing",
        lazy="select",
    )

    # One-to-many relationship to ListItem (which lists contain this gift)
    list_items: Mapped[list["ListItem"]] = relationship(
        "ListItem",
        back_populates="gift",
        lazy="select",
        cascade="all, delete-orphan",  # Delete list items when gift is deleted
    )

    # Index is defined on name column via index=True

    def __repr__(self) -> str:
        """String representation of Gift."""
        return f"<Gift(id={self.id}, name='{self.name}', price={self.price})>"
