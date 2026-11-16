"""Surface-independent DTOs for event gifting."""

from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import Field, HttpUrl

from app.schemas.base import BaseSchema

Phase = Literal["considering", "bought", "in_hand", "given"]


class OccurrenceCreate(BaseSchema):
    occasion_id: int
    date: date
    budget_total: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)


class OccurrenceUpdate(BaseSchema):
    closed: bool


class Allowance(BaseSchema):
    money_allowance: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)
    count_allowance: int | None = Field(default=None, ge=0)


class PlacementCreate(BaseSchema):
    gift_id: int
    quantity: int = Field(default=1, ge=1)
    unit_price: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)


class PlacementUpdate(BaseSchema):
    phase: Phase


class CaptureCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    url: HttpUrl | None = None
    price: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)
    person_id: int | None = None
    occurrence_id: int | None = None
    kind: Literal["ideas", "wishlist"] = "ideas"


class GiftCard(BaseSchema):
    id: int
    name: str
    url: str | None = None
    price: Decimal | None = None
    placement_id: int | None = None
    phase: Phase = "considering"
    quantity: int = 1


class Totals(BaseSchema):
    spent: Decimal = Decimal("0")
    planned: Decimal = Decimal("0")
    purchased_count: int = 0
    unknown_prices: int = 0
    phases: dict[str, int] = Field(
        default_factory=lambda: dict.fromkeys(["considering", "bought", "in_hand", "given"], 0)
    )


class EnvelopeView(Allowance, Totals):
    id: int
    person_id: int
    person_name: str
    remaining_money: Decimal | None = None
    remaining_count: int | None = None
    gifts: list[GiftCard]


class OccurrenceView(Totals):
    id: int
    occasion_id: int
    name: str
    date: date
    closed: bool
    budget_total: Decimal | None = None
    allocated: Decimal = Decimal("0")
    remaining_money: Decimal | None = None
    envelopes: list[EnvelopeView]


class PersonView(BaseSchema):
    id: int
    name: str
    interests: list[str]
    ideas: list[GiftCard]
    wishlist: list[GiftCard]
    past_gifts: list[GiftCard]
    occasions: list[OccurrenceView]


class EventRollup(Totals):
    occasion_id: int
    name: str
    budget_total: Decimal | None = None
    allocated: Decimal
    occurrences: list[OccurrenceView]


class YearRollup(Totals):
    year: int
    allocated: Decimal
    budget_total: Decimal | None = None
    events: list[EventRollup]
