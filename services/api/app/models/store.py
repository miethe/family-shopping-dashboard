"""Store model representing retailers or shopping locations."""

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.gift import Gift


class Store(BaseModel):
    """
    Store entity representing retailers or shopping locations.

    Stores are associated with gifts via a many-to-many relationship,
    allowing multiple stores per gift (e.g., Amazon, Target, local shop).

    Attributes:
        id: Primary key (inherited from BaseModel)
        name: Store name (required)
        url: Optional URL to store's website or product page
        created_at: Timestamp of creation (inherited from BaseModel)
        updated_at: Timestamp of last update (inherited from BaseModel)
    """

    __tablename__ = "stores"

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,  # Index for search queries
    )

    url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Many-to-many relationship to Gift
    gifts: Mapped[list["Gift"]] = relationship(
        "Gift",
        secondary="gift_stores",
        back_populates="stores",
        lazy="select",
    )

    def __repr__(self) -> str:
        """String representation of Store."""
        return f"<Store(id={self.id}, name='{self.name}')>"


class GiftStore(BaseModel):
    """
    Association table for the many-to-many relationship between Gift and Store.

    Attributes:
        id: Primary key (inherited from BaseModel)
        gift_id: Foreign key to gifts table
        store_id: Foreign key to stores table
        created_at: Timestamp of creation (inherited from BaseModel)
        updated_at: Timestamp of last update (inherited from BaseModel)
    """

    __tablename__ = "gift_stores"

    gift_id: Mapped[int] = mapped_column(
        ForeignKey("gifts.id", ondelete="CASCADE"),
        nullable=False,
    )

    store_id: Mapped[int] = mapped_column(
        ForeignKey("stores.id", ondelete="CASCADE"),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("gift_id", "store_id", name="uq_gift_store"),
    )

    def __repr__(self) -> str:
        """String representation of GiftStore."""
        return f"<GiftStore(gift_id={self.gift_id}, store_id={self.store_id})>"
