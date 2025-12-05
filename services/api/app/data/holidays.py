"""Standard holiday templates for occasion seeding."""

from typing import Any

# Standard holiday templates
# recurrence_rule format: {"month": M, "day": D} for fixed dates
# or {"month": M, "weekday": W, "week_of_month": N} for floating holidays
# weekday: 0=Monday, 1=Tuesday, ..., 6=Sunday (ISO weekday)
STANDARD_HOLIDAYS: list[dict[str, Any]] = [
    {
        "name": "Christmas",
        "recurrence_rule": {"month": 12, "day": 25},
        "subtype": None,
    },
    {
        "name": "Christmas Eve",
        "recurrence_rule": {"month": 12, "day": 24},
        "subtype": None,
    },
    {
        "name": "New Year's Day",
        "recurrence_rule": {"month": 1, "day": 1},
        "subtype": None,
    },
    {
        "name": "New Year's Eve",
        "recurrence_rule": {"month": 12, "day": 31},
        "subtype": None,
    },
    {
        "name": "Valentine's Day",
        "recurrence_rule": {"month": 2, "day": 14},
        "subtype": None,
    },
    {
        "name": "Mother's Day",
        "recurrence_rule": {
            "month": 5,
            "weekday": 6,  # Sunday
            "week_of_month": 2,  # 2nd Sunday in May
        },
        "subtype": None,
    },
    {
        "name": "Father's Day",
        "recurrence_rule": {
            "month": 6,
            "weekday": 6,  # Sunday
            "week_of_month": 3,  # 3rd Sunday in June
        },
        "subtype": None,
    },
    {
        "name": "Thanksgiving",
        "recurrence_rule": {
            "month": 11,
            "weekday": 3,  # Thursday
            "week_of_month": 4,  # 4th Thursday in November
        },
        "subtype": None,
    },
    {
        "name": "Halloween",
        "recurrence_rule": {"month": 10, "day": 31},
        "subtype": None,
    },
    {
        "name": "Independence Day",
        "recurrence_rule": {"month": 7, "day": 4},
        "subtype": None,
    },
]

# Optional religious holidays (can be enabled per user preference)
# These require special calculation algorithms (Easter, Hebrew calendar, etc.)
OPTIONAL_HOLIDAYS: list[dict[str, Any]] = [
    {
        "name": "Easter",
        "recurrence_rule": None,  # Easter date varies, needs special calculation
        "subtype": "easter",
    },
    {
        "name": "Hanukkah",
        "recurrence_rule": None,  # Hebrew calendar, needs special calculation
        "subtype": "hanukkah",
    },
    {
        "name": "Passover",
        "recurrence_rule": None,  # Hebrew calendar, needs special calculation
        "subtype": "passover",
    },
    {
        "name": "Rosh Hashanah",
        "recurrence_rule": None,  # Hebrew calendar, needs special calculation
        "subtype": "rosh_hashanah",
    },
]
