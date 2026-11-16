"""All persistence for occurrence gifting; legacy catalog and lists remain reusable."""

from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException, NotFoundError
from app.models.gift import Gift
from app.models.gift_person import GiftPerson, GiftPersonRole
from app.models.list import List, ListType, ListVisibility
from app.models.list_item import ListItem, ListItemStatus
from app.models.occasion import Occasion
from app.models.occurrence import Occurrence, OccurrenceGift, RecipientEnvelope
from app.models.person import Person, PersonOccasion


class GiftingRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def require(self, model, identifier):
        row = await self.session.get(model, identifier)
        if row is None:
            raise NotFoundError(message=f"{model.__name__} not found")
        return row

    async def save(self, row):
        self.session.add(row)
        try:
            await self.session.commit()
        except IntegrityError:
            await self.session.rollback()
            raise AppException(
                "CONFLICT", "This record already exists or conflicts with its references", 409
            ) from None
        await self.session.refresh(row)
        return row

    async def occurrences(self):
        return (
            await self.session.execute(
                select(Occurrence, Occasion)
                .join(Occasion, Occasion.id == Occurrence.occasion_id)
                .order_by(Occurrence.date, Occurrence.id)
            )
        ).all()

    async def envelopes(self):
        return (
            await self.session.execute(
                select(RecipientEnvelope, Person).join(
                    Person, Person.id == RecipientEnvelope.person_id
                )
            )
        ).all()

    async def placements(self, user_id: int):
        return (
            await self.session.execute(
                select(OccurrenceGift, Gift)
                .join(Gift, Gift.id == OccurrenceGift.gift_id)
                .outerjoin(ListItem, ListItem.id == OccurrenceGift.source_list_item_id)
                .outerjoin(List, List.id == ListItem.list_id)
                .where(
                    or_(
                        List.id.is_(None),
                        List.visibility != ListVisibility.private,
                        List.user_id == user_id,
                    )
                )
                .order_by(OccurrenceGift.id)
            )
        ).all()

    async def create_occurrence(self, data):
        await self.require(Occasion, data.occasion_id)
        row = Occurrence(**data.model_dump())
        self.session.add(row)
        try:
            await self.session.flush()
            links = (
                await self.session.scalars(
                    select(PersonOccasion).where(PersonOccasion.occasion_id == data.occasion_id)
                )
            ).all()
            for link in links:
                self.session.add(
                    RecipientEnvelope(
                        occurrence_id=row.id,
                        person_id=link.person_id,
                        money_allowance=link.recipient_budget_total,
                    )
                )
            return await self.save(row)
        except IntegrityError:
            await self.session.rollback()
            raise AppException(
                "CONFLICT", "An occurrence already exists for this date", 409
            ) from None

    async def allowance(self, occurrence_id, person_id, data):
        await self.require(Occurrence, occurrence_id)
        await self.require(Person, person_id)
        row = await self.session.scalar(
            select(RecipientEnvelope).where(
                RecipientEnvelope.occurrence_id == occurrence_id,
                RecipientEnvelope.person_id == person_id,
            )
        )
        if row is None:
            row = RecipientEnvelope(occurrence_id=occurrence_id, person_id=person_id)
        for key, value in data.model_dump().items():
            setattr(row, key, value)
        return await self.save(row)

    async def place(self, envelope_id, data):
        await self.require(RecipientEnvelope, envelope_id)
        gift = await self.require(Gift, data.gift_id)
        values = data.model_dump()
        if values["unit_price"] is None:
            values["unit_price"] = gift.sale_price if gift.sale_price is not None else gift.price
        return await self.save(OccurrenceGift(envelope_id=envelope_id, **values))

    async def person_lists(self, person_id, user_id):
        return (
            await self.session.execute(
                select(Gift, List.type)
                .join(ListItem, ListItem.gift_id == Gift.id)
                .join(List, List.id == ListItem.list_id)
                .where(
                    List.person_id == person_id,
                    List.type.in_([ListType.ideas, ListType.wishlist]),
                    or_(List.visibility != ListVisibility.private, List.user_id == user_id),
                )
                .order_by(Gift.id.desc())
            )
        ).all()

    async def floating_ideas(self, person_id=None):
        query = select(Gift).where(~Gift.list_items.any())
        if person_id is not None:
            query = query.join(GiftPerson, GiftPerson.gift_id == Gift.id).where(
                GiftPerson.person_id == person_id, GiftPerson.role == GiftPersonRole.RECIPIENT
            )
        return (await self.session.scalars(query.order_by(Gift.id.desc()))).all()

    async def idea_cards(self, user_id):
        listed = (
            await self.session.scalars(
                select(Gift)
                .join(ListItem, ListItem.gift_id == Gift.id)
                .join(List, List.id == ListItem.list_id)
                .where(
                    List.type == ListType.ideas,
                    or_(List.visibility != ListVisibility.private, List.user_id == user_id),
                )
                .order_by(Gift.id.desc())
            )
        ).all()
        return sorted(
            {g.id: g for g in [*listed, *await self.floating_ideas()]}.values(),
            key=lambda g: g.id,
            reverse=True,
        )

    async def capture(self, data, user_id):
        if data.person_id is not None:
            await self.require(Person, data.person_id)
        if data.occurrence_id is not None:
            await self.require(Occurrence, data.occurrence_id)
        gift = Gift(
            name=data.name.strip(), url=str(data.url) if data.url else None, price=data.price
        )
        self.session.add(gift)
        await self.session.flush()
        if data.person_id is not None:
            self.session.add(
                GiftPerson(gift_id=gift.id, person_id=data.person_id, role=GiftPersonRole.RECIPIENT)
            )
            gift_list = await self.session.scalar(
                select(List)
                .where(
                    List.person_id == data.person_id,
                    List.user_id == user_id,
                    List.type == ListType(data.kind),
                    List.occasion_id.is_(None),
                )
                .limit(1)
            )
            if gift_list is None:
                gift_list = List(
                    name=data.kind.title(),
                    type=ListType(data.kind),
                    visibility=ListVisibility.family,
                    person_id=data.person_id,
                    user_id=user_id,
                )
                self.session.add(gift_list)
                await self.session.flush()
            self.session.add(
                ListItem(
                    list_id=gift_list.id,
                    gift_id=gift.id,
                    status=ListItemStatus.idea,
                    price=data.price,
                )
            )
        if data.occurrence_id is not None and data.person_id is not None:
            envelope = await self.session.scalar(
                select(RecipientEnvelope).where(
                    RecipientEnvelope.occurrence_id == data.occurrence_id,
                    RecipientEnvelope.person_id == data.person_id,
                )
            )
            if envelope is None:
                envelope = RecipientEnvelope(
                    occurrence_id=data.occurrence_id, person_id=data.person_id
                )
                self.session.add(envelope)
                await self.session.flush()
            self.session.add(
                OccurrenceGift(envelope_id=envelope.id, gift_id=gift.id, unit_price=data.price)
            )
        return await self.save(gift)
