"""Dated event history and recipient envelopes, separate from evergreen gift ideas."""

from datetime import date
from decimal import Decimal

from sqlalchemy import CheckConstraint, Date, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class Occurrence(BaseModel):
    __tablename__ = "occurrences"
    occasion_id: Mapped[int] = mapped_column(ForeignKey("occasions.id"), index=True)
    date: Mapped[date] = mapped_column(Date)
    budget_total: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    closed: Mapped[bool] = mapped_column(default=False, server_default="false")
    __table_args__ = (
        UniqueConstraint("occasion_id", "date", name="uq_occurrence_date"),
        CheckConstraint("budget_total >= 0", name="ck_occurrence_budget"),
    )


class RecipientEnvelope(BaseModel):
    __tablename__ = "recipient_envelopes"
    occurrence_id: Mapped[int] = mapped_column(ForeignKey("occurrences.id"), index=True)
    person_id: Mapped[int] = mapped_column(ForeignKey("persons.id"), index=True)
    money_allowance: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    count_allowance: Mapped[int | None] = mapped_column(Integer)
    __table_args__ = (
        UniqueConstraint("occurrence_id", "person_id", name="uq_envelope_person"),
        CheckConstraint("money_allowance >= 0", name="ck_envelope_money"),
        CheckConstraint("count_allowance >= 0", name="ck_envelope_count"),
    )


class OccurrenceGift(BaseModel):
    __tablename__ = "occurrence_gifts"
    envelope_id: Mapped[int] = mapped_column(ForeignKey("recipient_envelopes.id"), index=True)
    gift_id: Mapped[int] = mapped_column(ForeignKey("gifts.id"), index=True)
    phase: Mapped[str] = mapped_column(
        String(20), default="considering", server_default="considering"
    )
    quantity: Mapped[int] = mapped_column(Integer, default=1, server_default="1")
    unit_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    # Preserve provenance when migrating existing list-specific prices/statuses.
    source_list_item_id: Mapped[int | None] = mapped_column(
        ForeignKey("list_items.id", ondelete="SET NULL")
    )
    __table_args__ = (
        UniqueConstraint("envelope_id", "gift_id", name="uq_envelope_gift"),
        CheckConstraint(
            "phase IN ('considering', 'bought', 'in_hand', 'given')", name="ck_occurrence_phase"
        ),
        CheckConstraint("quantity > 0", name="ck_occurrence_quantity"),
        CheckConstraint("unit_price >= 0", name="ck_occurrence_price"),
    )
