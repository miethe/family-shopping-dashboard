"""Allowance rules and DTO assembly. Null allowances mean unset; zero is a real cap."""

from decimal import Decimal

from app.core.exceptions import ValidationError
from app.models.occurrence import Occurrence, OccurrenceGift
from app.models.person import Person
from app.repositories.gifting import GiftingRepository
from app.schemas.gifting import (
    EnvelopeView,
    EventRollup,
    GiftCard,
    OccurrenceView,
    PersonView,
    Totals,
    YearRollup,
)


def sum_totals(rows) -> Totals:
    result = Totals()
    for row in rows:
        for field in ("spent", "planned", "purchased_count", "unknown_prices"):
            setattr(result, field, getattr(result, field) + getattr(row, field))
        for phase, count in row.phases.items():
            result.phases[phase] += count
    return result


class GiftingService:
    def __init__(self, session):
        self.repo = GiftingRepository(session)

    async def occurrences(self, user_id: int) -> list[OccurrenceView]:
        placements = await self.repo.placements(user_id)
        envelope_rows = await self.repo.envelopes()
        views = []
        for occurrence, occasion in await self.repo.occurrences():
            envelopes = []
            for envelope, person in envelope_rows:
                if envelope.occurrence_id != occurrence.id:
                    continue
                gifts = [
                    GiftCard(
                        id=gift.id,
                        name=gift.name,
                        url=gift.url,
                        price=item.unit_price,
                        placement_id=item.id,
                        phase=item.phase,
                        quantity=item.quantity,
                    )
                    for item, gift in placements
                    if item.envelope_id == envelope.id
                ]
                totals = Totals()
                for gift in gifts:
                    totals.phases[gift.phase] += gift.quantity
                    cost = (gift.price or Decimal("0")) * gift.quantity
                    totals.planned += cost
                    if gift.price is None:
                        totals.unknown_prices += gift.quantity
                    if gift.phase != "considering":
                        totals.spent += cost
                        totals.purchased_count += gift.quantity
                envelopes.append(
                    EnvelopeView(
                        id=envelope.id,
                        person_id=person.id,
                        person_name=person.display_name,
                        money_allowance=envelope.money_allowance,
                        count_allowance=envelope.count_allowance,
                        remaining_money=None
                        if envelope.money_allowance is None
                        else envelope.money_allowance - totals.spent,
                        remaining_count=None
                        if envelope.count_allowance is None
                        else envelope.count_allowance - totals.purchased_count,
                        gifts=gifts,
                        **totals.model_dump(),
                    )
                )
            totals = sum_totals(envelopes)
            views.append(
                OccurrenceView(
                    id=occurrence.id,
                    occasion_id=occasion.id,
                    name=occasion.name,
                    date=occurrence.date,
                    closed=occurrence.closed,
                    budget_total=occurrence.budget_total,
                    allocated=sum(
                        (e.money_allowance or Decimal("0") for e in envelopes), Decimal("0")
                    ),
                    remaining_money=None
                    if occurrence.budget_total is None
                    else occurrence.budget_total - totals.spent,
                    envelopes=envelopes,
                    **totals.model_dump(),
                )
            )
        return views

    async def occurrence(self, identifier, user_id) -> OccurrenceView:
        await self.repo.require(Occurrence, identifier)
        return next(row for row in await self.occurrences(user_id) if row.id == identifier)

    async def create(self, data, user_id):
        row = await self.repo.create_occurrence(data)
        return await self.occurrence(row.id, user_id)

    async def close(self, identifier, data, user_id):
        row = await self.repo.require(Occurrence, identifier)
        row.closed = data.closed
        await self.repo.save(row)
        return await self.occurrence(identifier, user_id)

    async def allowance(self, identifier, person_id, data, user_id):
        await self.repo.allowance(identifier, person_id, data)
        return await self.occurrence(identifier, user_id)

    async def place(self, envelope_id, data, user_id):
        row = await self.repo.place(envelope_id, data)
        return next(
            GiftCard(
                id=gift.id,
                name=gift.name,
                url=gift.url,
                price=item.unit_price,
                placement_id=item.id,
                quantity=item.quantity,
                phase=item.phase,
            )
            for item, gift in await self.repo.placements(user_id)
            if item.id == row.id
        )

    async def phase(self, identifier, data, user_id):
        # Checking visible placements also protects private legacy list items.
        visible = {item.id for item, _ in await self.repo.placements(user_id)}
        if identifier not in visible:
            from app.core.exceptions import NotFoundError

            raise NotFoundError()
        item = await self.repo.require(OccurrenceGift, identifier)
        # All four phases are directly selectable, allowing corrections and returns.
        item.phase = data.phase
        await self.repo.save(item)
        return {"id": item.id, "phase": item.phase}

    async def capture(self, data, user_id):
        if not data.name.strip():
            raise ValidationError(message="Give the idea a name")
        if data.occurrence_id is not None and data.person_id is None:
            raise ValidationError(message="Choose a recipient for an event gift")
        row = await self.repo.capture(data, user_id)
        return GiftCard(id=row.id, name=row.name, url=row.url, price=row.price)

    async def ideas(self, user_id):
        return [
            GiftCard(id=g.id, name=g.name, url=g.url, price=g.price)
            for g in await self.repo.idea_cards(user_id)
        ]

    async def person(self, identifier, user_id):
        person = await self.repo.require(Person, identifier)
        groups = {"ideas": {}, "wishlist": {}}
        for gift, kind in await self.repo.person_lists(identifier, user_id):
            groups[kind.value][gift.id] = GiftCard(
                id=gift.id, name=gift.name, url=gift.url, price=gift.price
            )
        for gift in await self.repo.floating_ideas(identifier):
            groups["ideas"][gift.id] = GiftCard(
                id=gift.id, name=gift.name, url=gift.url, price=gift.price
            )
        occurrences = [
            o
            for o in await self.occurrences(user_id)
            if any(e.person_id == identifier for e in o.envelopes)
        ]
        past = [
            g
            for o in occurrences
            for e in o.envelopes
            if e.person_id == identifier
            for g in e.gifts
            if g.phase == "given"
        ]
        return PersonView(
            id=person.id,
            name=person.display_name,
            interests=person.interests or [],
            ideas=list(groups["ideas"].values()),
            wishlist=list(groups["wishlist"].values()),
            past_gifts=past,
            occasions=occurrences,
        )

    async def rollup(self, year, user_id):
        occurrences = [o for o in await self.occurrences(user_id) if o.date.year == year]
        groups = {}
        for row in occurrences:
            groups.setdefault(row.occasion_id, []).append(row)
        events = []
        for occasion_id, rows in groups.items():
            budgets = [r.budget_total for r in rows]
            events.append(
                EventRollup(
                    occasion_id=occasion_id,
                    name=rows[0].name,
                    budget_total=sum(budgets, Decimal("0"))
                    if all(b is not None for b in budgets)
                    else None,
                    allocated=sum((r.allocated for r in rows), Decimal("0")),
                    occurrences=rows,
                    **sum_totals(rows).model_dump(),
                )
            )
        budgets = [e.budget_total for e in events]
        return YearRollup(
            year=year,
            events=events,
            allocated=sum((e.allocated for e in events), Decimal("0")),
            budget_total=sum(budgets, Decimal("0"))
            if budgets and all(b is not None for b in budgets)
            else None,
            **sum_totals(events).model_dump(),
        )
