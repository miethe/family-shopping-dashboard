"""Tests for validation_helpers module."""

import pytest
from app.schemas.validation_helpers import (
    get_valid_options,
    validate_slug_against_options,
    validate_slug_list_against_options,
    clear_options_cache,
)


class TestGetValidOptions:
    """Test get_valid_options function."""

    def test_returns_fallback_as_set(self):
        """Should return fallback frozenset converted to set."""
        fallback = frozenset({"red", "white", "rose"})
        result = get_valid_options("person", "wine_types", fallback)

        assert isinstance(result, set)
        assert result == {"red", "white", "rose"}

    def test_caches_results(self):
        """Should cache results for performance."""
        fallback = frozenset({"option1", "option2"})

        # Call twice with same parameters
        result1 = get_valid_options("entity", "field", fallback)
        result2 = get_valid_options("entity", "field", fallback)

        # Should return same object (cached)
        assert result1 is result2

    def test_different_params_different_cache(self):
        """Should maintain separate cache entries for different parameters."""
        fallback1 = frozenset({"a", "b"})
        fallback2 = frozenset({"c", "d"})

        result1 = get_valid_options("entity1", "field1", fallback1)
        result2 = get_valid_options("entity2", "field2", fallback2)

        assert result1 != result2
        assert result1 == {"a", "b"}
        assert result2 == {"c", "d"}


class TestValidateSlugAgainstOptions:
    """Test validate_slug_against_options function."""

    def test_valid_value_returns_value(self):
        """Should return the value if it's valid."""
        fallback = frozenset({"red", "white", "rose"})
        result = validate_slug_against_options("red", "person", "wine_types", fallback)

        assert result == "red"

    def test_none_returns_none(self):
        """Should return None if value is None."""
        fallback = frozenset({"red", "white", "rose"})
        result = validate_slug_against_options(None, "person", "wine_types", fallback)

        assert result is None

    def test_invalid_value_raises_error(self):
        """Should raise ValueError if value is not in allowed options."""
        fallback = frozenset({"red", "white", "rose"})

        with pytest.raises(ValueError) as exc_info:
            validate_slug_against_options("invalid", "person", "wine_types", fallback)

        assert "Invalid value 'invalid' for wine_types" in str(exc_info.value)


class TestValidateSlugListAgainstOptions:
    """Test validate_slug_list_against_options function."""

    def test_valid_list_returns_list(self):
        """Should return the list if all values are valid."""
        fallback = frozenset({"red", "white", "rose"})
        result = validate_slug_list_against_options(
            ["red", "white"], "person", "wine_types", fallback
        )

        assert result == ["red", "white"]

    def test_none_returns_none(self):
        """Should return None if values is None."""
        fallback = frozenset({"red", "white", "rose"})
        result = validate_slug_list_against_options(None, "person", "wine_types", fallback)

        assert result is None

    def test_empty_list_returns_none(self):
        """Should return None if list is empty or contains only invalid values."""
        fallback = frozenset({"red", "white", "rose"})
        result = validate_slug_list_against_options([], "person", "wine_types", fallback)

        assert result is None

    def test_deduplicates_values(self):
        """Should deduplicate values while preserving order."""
        fallback = frozenset({"red", "white", "rose"})
        result = validate_slug_list_against_options(
            ["red", "red", "white", "red"], "person", "wine_types", fallback
        )

        assert result == ["red", "white"]

    def test_invalid_value_in_list_raises_error(self):
        """Should raise ValueError if any value is not in allowed options."""
        fallback = frozenset({"red", "white", "rose"})

        with pytest.raises(ValueError) as exc_info:
            validate_slug_list_against_options(
                ["red", "invalid"], "person", "wine_types", fallback
            )

        assert "Invalid value 'invalid' for wine_types" in str(exc_info.value)


class TestClearOptionsCache:
    """Test clear_options_cache function."""

    def test_clears_cache(self):
        """Should clear the LRU cache."""
        fallback = frozenset({"option1", "option2"})

        # Populate cache
        result1 = get_valid_options("entity", "field", fallback)

        # Clear cache
        clear_options_cache()

        # Get again - should be new object, not cached
        result2 = get_valid_options("entity", "field", fallback)

        # Values should be equal but not same object
        assert result1 == result2
        assert result1 is not result2
