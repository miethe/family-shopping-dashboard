"""Schema validation tests for person DTOs."""

from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.schemas.person import AdvancedInterests, PersonCreate, PersonResponse, SizeEntry


def test_size_entry_trims_and_limits() -> None:
    """SizeEntry trims whitespace and enforces required fields."""
    entry = SizeEntry(type=" Shirt ", value=" M ", notes="  comfy fit  ")

    assert entry.type == "Shirt"
    assert entry.value == "M"
    assert entry.notes == "comfy fit"


def test_advanced_interests_enforces_enums() -> None:
    """Invalid enum values raise validation errors."""
    with pytest.raises(ValidationError):
        PersonCreate(
            display_name="Alex",
            advanced_interests={"food_and_drink": {"wine_types": ["invalid"]}},
            group_ids=[],
        )


def test_advanced_interests_dedupes_and_slugs() -> None:
    """Enum-backed lists are slugged and deduped."""
    interests = AdvancedInterests(
        food_and_drink={
            "wine_types": ["Red", "red", "rose "],
            "beverage_prefs": ["Coffee", "coffee"],
        }
    )

    assert interests.food_and_drink
    assert interests.food_and_drink.wine_types == ["red", "rose"]
    assert interests.food_and_drink.beverage_prefs == ["coffee"]


def test_person_response_derives_sizes_from_profile() -> None:
    """sizes map is derived from size_profile when omitted."""
    now = datetime.now(timezone.utc)
    response = PersonResponse.model_validate(
        {
            "id": 1,
            "display_name": "Taylor",
            "relationship": None,
            "birthdate": None,
            "anniversary": None,
            "notes": None,
            "interests": ["Reading"],
            "size_profile": [{"type": "Hat", "value": "M"}],
            "sizes": None,
            "advanced_interests": None,
            "constraints": None,
            "photo_url": None,
            "groups": [],
            "occasion_ids": [],
            "created_at": now,
            "updated_at": now,
        }
    )

    assert response.sizes == {"Hat": "M"}
