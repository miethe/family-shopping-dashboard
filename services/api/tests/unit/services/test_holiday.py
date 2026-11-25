from datetime import date, timedelta
from types import SimpleNamespace
import pytest
from app.services.holiday import active_theme, next_date


def holiday(id, theme="festive", window=45):
    return SimpleNamespace(id=id, theme_key=theme, theme_window_days=window)


@pytest.mark.parametrize("offset, expected", [(45, "festive"), (0, "festive"), (-1, None), (46, None)])
def test_theme_window(offset, expected):
    today = date(2026, 11, 10)
    assert active_theme([(holiday(1), today + timedelta(days=offset))], today) == expected


def test_nearest_holiday_wins():
    today = date(2026, 11, 10)
    assert active_theme([(holiday(1, "later"), today + timedelta(days=20)),
                         (holiday(2, "nearer"), today + timedelta(days=2))], today) == "nearer"


def test_leap_day():
    assert next_date({"month": 2, "day": 29}, date(2026, 3, 1)) == date(2028, 2, 29)
