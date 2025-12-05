"""Gift-Person association table for many-to-many relationship."""

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.gift import Gift
    from app.models.person import Person


class GiftPerson(BaseModel):
    """
    Association entity linking gifts to persons.

    This junction table enables many-to-many relationships between gifts and persons,
    allowing gifts to be associated with multiple recipients and persons to have
    multiple gifts.

    Attributes:
        id: Primary key (inherited from BaseModel)
        gift_id: Foreign key to gifts table
        person_id: Foreign key to persons table
        created_at: Timestamp of creation (inherited from BaseModel)
        updated_at: Timestamp of last update (inherited from BaseModel)
    """

    __tablename__ = "gift_people"

    gift_id: Mapped[int] = mapped_column(
        ForeignKey("gifts.id", ondelete="CASCADE"),
        nullable=False,
    )

    person_id: Mapped[int] = mapped_column(
        ForeignKey("persons.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Relationships to parent entities
    gift: Mapped["Gift"] = relationship(
        "Gift",
        foreign_keys=[gift_id],
        lazy="select",
    )

    person: Mapped["Person"] = relationship(
        "Person",
        foreign_keys=[person_id],
        lazy="select",
    )

    __table_args__ = (
        UniqueConstraint("gift_id", "person_id", name="uq_gift_person"),
    )

    def __repr__(self) -> str:
        """String representation of GiftPerson."""
        return f"<GiftPerson(id={self.id}, gift_id={self.gift_id}, person_id={self.person_id})>"
