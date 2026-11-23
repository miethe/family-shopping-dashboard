"""Holiday persistence and linked dated events."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from app.core.exceptions import AppException
from app.models.holiday import Holiday
from app.models.occasion import Occasion


class HolidayRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list(self):
        return list((await self.session.scalars(select(Holiday))).all())

    async def get(self, holiday_id):
        return await self.session.get(Holiday, holiday_id)

    async def save(self, row):
        self.session.add(row)
        try:
            await self.session.commit()
        except IntegrityError:
            await self.session.rollback()
            raise AppException("CONFLICT", "Holiday key already exists", 409) from None
        await self.session.refresh(row)
        return row

    async def themed_occurrences(self, today):
        return (await self.session.execute(
            select(Holiday, Occasion.date).join(Occasion, Occasion.holiday_id == Holiday.id)
            .where(Holiday.theme_key.is_not(None), Occasion.is_active.is_(True), Occasion.date >= today)
            .order_by(Occasion.date, Holiday.id)
        )).all()
