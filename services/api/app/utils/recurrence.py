"""
Recurrence utilities for computing and managing recurring occasions.

Supports two recurrence patterns:
1. Fixed date: {"month": 12, "day": 25} - Christmas (December 25)
2. Relative date: {"month": 3, "weekday": 0, "week_of_month": 2} - 2nd Monday of March

Examples:
    ```python
    from datetime import date
    from app.utils.recurrence import compute_next_occurrence

    # Fixed date (Christmas)
    next_christmas = compute_next_occurrence({"month": 12, "day": 25})

    # Relative date (2nd Monday of March)
    next_monday = compute_next_occurrence({
        "month": 3,
        "weekday": 0,
        "week_of_month": 2
    })
    ```
"""

from __future__ import annotations

from calendar import monthrange
from datetime import date, timedelta
from typing import Any


def compute_next_occurrence(
    recurrence_rule: dict[str, Any], reference_date: date | None = None
) -> date | None:
    """
    Compute the next occurrence from a recurrence rule.

    Recurrence rule formats:
    - Fixed: {"month": 12, "day": 25} - Fixed date (Christmas)
    - Relative: {"month": 3, "day": null, "weekday": 0, "week_of_month": 2}
                2nd Monday of March

    Args:
        recurrence_rule: Dictionary containing recurrence pattern
        reference_date: Date to compute from (default: today)

    Returns:
        Next occurrence date, or None if invalid rule

    Example:
        ```python
        # Christmas (fixed date)
        next_date = compute_next_occurrence({"month": 12, "day": 25})

        # Mother's Day (2nd Sunday of May - relative)
        next_date = compute_next_occurrence({
            "month": 5,
            "weekday": 6,  # Sunday
            "week_of_month": 2
        })
        ```

    Note:
        - If the computed date is in the past, returns next year's occurrence
        - Invalid dates (e.g., Feb 30) return None
        - Weekday: 0=Monday, 6=Sunday (Python convention)
    """
    if not recurrence_rule:
        return None

    today = reference_date or date.today()

    # Fixed date recurrence (month/day)
    if (
        "month" in recurrence_rule
        and "day" in recurrence_rule
        and recurrence_rule.get("day")
    ):
        month = recurrence_rule["month"]
        day = recurrence_rule["day"]

        # Try this year first
        try:
            this_year = date(today.year, month, day)
            if this_year >= today:
                return this_year
            # Otherwise, next year
            return date(today.year + 1, month, day)
        except ValueError:
            # Invalid date (e.g., Feb 30)
            return None

    # Relative recurrence (nth weekday of month)
    if "weekday" in recurrence_rule and "week_of_month" in recurrence_rule:
        month = recurrence_rule.get("month", today.month)
        weekday = recurrence_rule["weekday"]  # 0=Monday, 6=Sunday
        week_of_month = recurrence_rule["week_of_month"]  # 1-5, or -1 for last

        occurrence = get_nth_weekday_of_month(
            today.year, month, weekday, week_of_month
        )
        if occurrence and occurrence >= today:
            return occurrence
        # Try next year
        return get_nth_weekday_of_month(
            today.year + 1, month, weekday, week_of_month
        )

    return None


def get_nth_weekday_of_month(
    year: int, month: int, weekday: int, n: int
) -> date | None:
    """
    Get the nth weekday of a month.

    Args:
        year: Year
        month: Month (1-12)
        weekday: Day of week (0=Monday, 6=Sunday)
        n: Which occurrence (1=first, 2=second, ..., -1=last)

    Returns:
        Date of the nth weekday, or None if not found

    Example:
        ```python
        # Get 2nd Monday of March 2025
        date_obj = get_nth_weekday_of_month(2025, 3, 0, 2)

        # Get last Friday of December 2025
        date_obj = get_nth_weekday_of_month(2025, 12, 4, -1)
        ```

    Note:
        If requesting the 5th occurrence and it doesn't exist in the month,
        returns None (not the 4th occurrence).
    """
    first_day = date(year, month, 1)
    last_day = date(year, month, monthrange(year, month)[1])

    if n > 0:
        # Find first occurrence of weekday in month
        days_until_weekday = (weekday - first_day.weekday()) % 7
        first_occurrence = first_day + timedelta(days=days_until_weekday)

        # Add weeks for nth occurrence
        target = first_occurrence + timedelta(weeks=n - 1)

        if target.month == month:
            return target
        return None
    elif n == -1:
        # Last occurrence of weekday in month
        days_since_weekday = (last_day.weekday() - weekday) % 7
        return last_day - timedelta(days=days_since_weekday)

    return None


def should_roll_forward(occasion_date: date, next_occurrence: date | None) -> bool:
    """
    Check if an occasion's next_occurrence needs to be rolled forward.

    An occasion needs rolling forward if:
    - next_occurrence is None (never computed)
    - next_occurrence is in the past (already occurred)

    Args:
        occasion_date: The original occasion date (may be historical)
        next_occurrence: The currently stored next_occurrence

    Returns:
        True if next_occurrence should be recomputed, False otherwise

    Example:
        ```python
        from datetime import date

        # Occasion with next_occurrence in past
        needs_update = should_roll_forward(
            occasion_date=date(2020, 12, 25),
            next_occurrence=date(2024, 12, 25)
        )
        # Returns: True (if today is after 2024-12-25)

        # Occasion with future next_occurrence
        needs_update = should_roll_forward(
            occasion_date=date(2020, 12, 25),
            next_occurrence=date(2025, 12, 25)
        )
        # Returns: False (next_occurrence is still valid)
        ```

    Note:
        This function only checks if the date needs updating, not what
        the new date should be. Use compute_next_occurrence() for that.
    """
    if not next_occurrence:
        return True
    return next_occurrence < date.today()
