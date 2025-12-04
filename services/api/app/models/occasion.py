"""Occasion model for gifting events (birthdays, holidays, etc.)."""

from datetime import date
from decimal import Decimal
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import Date, Index, Numeric, String, Text
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.models.list import List

from app.models.base import BaseModel


class OccasionType(str, Enum):
    """Enum for occasion types."""

    birthday = "birthday"
    holiday = "holiday"
    other = "other"


class Occasion(BaseModel):
    """
    Occasion model representing gifting events.

    Attributes:
        id: Primary key (inherited from BaseModel)
        name: Name of the occasion (e.g., "Christmas 2024", "Mom's Birthday")
        type: Type of occasion (birthday, holiday, other)
        date: Date when the occasion occurs
        description: Optional description of the occasion
        budget_total: Optional total budget for the occasion
        created_at: Timestamp of creation (inherited from BaseModel)
        updated_at: Timestamp of last update (inherited from BaseModel)
    """

    __tablename__ = "occasions"

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=False,
    )

    type: Mapped[OccasionType] = mapped_column(
        ENUM(OccasionType, name="occasiontype", create_type=False),
        nullable=False,
        index=True,
    )

    date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    budget_total: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    # Relationships
    lists: Mapped[list["List"]] = relationship(
        "List",
        back_populates="occasion",
        lazy="selectin",
    )

    __table_args__ = (
        Index("idx_occasions_date", "date"),
        Index("idx_occasions_type", "type"),
    )

    def __repr__(self) -> str:
        """String representation of Occasion."""
        return f"<Occasion(id={self.id}, name='{self.name}', type={self.type.value}, date={self.date})>"
