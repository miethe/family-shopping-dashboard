"""Holiday dates and theme selection."""
from datetime import date
from app.models.holiday import Holiday
from app.repositories.holiday import HolidayRepository
from app.schemas.holiday import HolidayResponse
from app.utils.recurrence import compute_next_occurrence


def next_date(rule, today):
    # The existing recurrence helper handles fixed and relative rules; retry leap years.
    result = compute_next_occurrence(rule, today)
    if result is None and rule.get("month") == 2 and rule.get("day") == 29:
        for year in range(today.year, today.year + 9):
            try:
                candidate = date(year, 2, 29)
                if candidate >= today:
                    return candidate
            except ValueError:
                continue
    return result


def active_theme(rows, today):
    eligible = [(day, holiday.id, holiday.theme_key) for holiday, day in rows
                if holiday.theme_key and 0 <= (day - today).days <= holiday.theme_window_days]
    return min(eligible)[2] if eligible else None


class HolidayService:
    def __init__(self, session):
        self.repo = HolidayRepository(session)

    def response(self, row, today):
        day = next_date(row.recurrence_rule, today)
        return HolidayResponse(id=row.id, name=row.name, key=row.key,
            month=row.recurrence_rule["month"], day=row.recurrence_rule["day"],
            is_major=row.is_major, theme_key=row.theme_key, theme_window_days=row.theme_window_days,
            next_date=day, days_until=(day - today).days)

    async def list(self):
        today = date.today()
        return sorted((self.response(row, today) for row in await self.repo.list()),
                      key=lambda row: (row.next_date, row.name, row.id))

    async def create(self, data):
        values = data.model_dump(exclude={"month", "day"})
        row = Holiday(**values, recurrence_rule={"month": data.month, "day": data.day})
        return self.response(await self.repo.save(row), date.today())

    async def edit(self, holiday_id, data):
        row = await self.repo.get(holiday_id)
        if row is None:
            return None
        for key, value in data.model_dump(exclude={"month", "day"}).items():
            setattr(row, key, value)
        row.recurrence_rule = {"month": data.month, "day": data.day}
        return self.response(await self.repo.save(row), date.today())

    async def active_theme(self):
        today = date.today()
        return active_theme(await self.repo.themed_occurrences(today), today)
