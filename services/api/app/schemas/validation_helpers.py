"""
Validation helpers for field options with DB-first, fallback-to-hardcoded strategy.
"""

from typing import Set, Optional
from functools import lru_cache

# Import will be lazy to avoid circular deps
_field_options_repo = None


def get_field_options_repo():
    """Lazy import to avoid circular dependencies."""
    global _field_options_repo
    if _field_options_repo is None:
        from app.repositories.field_option import FieldOptionsRepository

        _field_options_repo = FieldOptionsRepository
    return _field_options_repo


@lru_cache(maxsize=100)
def get_valid_options(entity: str, field_name: str, fallback: frozenset[str]) -> Set[str]:
    """
    Get valid options from DB first, fallback to hardcoded set.

    Uses LRU cache for performance. Cache should be cleared when options change.
    For now, returns fallback since DB integration is optional.

    Args:
        entity: Entity type (e.g., "person", "gift")
        field_name: Field name (e.g., "wine_types", "priority")
        fallback: Hardcoded set to use as fallback

    Returns:
        Set of valid option values
    """
    # Phase 1: Always use fallback (DB integration comes later)
    # This keeps existing behavior 100% intact
    return set(fallback)


def clear_options_cache():
    """Clear the options cache (call when options are modified via admin)."""
    get_valid_options.cache_clear()


def validate_slug_against_options(
    value: str | None,
    entity: str,
    field_name: str,
    fallback: frozenset[str],
) -> str | None:
    """
    Validate a slug value against allowed options.

    Args:
        value: The value to validate (may be None)
        entity: Entity type for DB lookup
        field_name: Field name for DB lookup
        fallback: Hardcoded fallback set

    Returns:
        The validated value or None

    Raises:
        ValueError: If value is not in allowed options
    """
    if value is None:
        return None

    allowed = get_valid_options(entity, field_name, fallback)
    if value not in allowed:
        raise ValueError(f"Invalid value '{value}' for {field_name}")
    return value


def validate_slug_list_against_options(
    values: list[str] | None,
    entity: str,
    field_name: str,
    fallback: frozenset[str],
) -> list[str] | None:
    """
    Validate a list of slug values against allowed options.

    Args:
        values: List of values to validate (may be None)
        entity: Entity type for DB lookup
        field_name: Field name for DB lookup
        fallback: Hardcoded fallback set

    Returns:
        List of validated values or None

    Raises:
        ValueError: If any value is not in allowed options
    """
    if values is None:
        return None

    allowed = get_valid_options(entity, field_name, fallback)
    validated = []
    for value in values:
        if value not in allowed:
            raise ValueError(f"Invalid value '{value}' for {field_name}")
        if value not in validated:
            validated.append(value)
    return validated or None
