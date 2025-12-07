"""Person DTOs for gift recipients."""

from __future__ import annotations

import unicodedata
from datetime import date
from decimal import Decimal
from typing import Any

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_serializer,
    field_validator,
    model_validator,
)

from app.schemas.base import TimestampSchema
from app.schemas.group import GroupMinimal

SHORT_TEXT_MAX = 120
NOTE_MAX = 2000
ADVANCED_NOTE_MAX = 500
SIZE_FIELD_MAX = 60

WINE_TYPES = {"red", "white", "rose", "sparkling", "natural_orange", "dessert_fortified"}
BEVERAGE_PREFS = {"coffee", "tea", "cocktails", "beer", "spirits", "mocktails"}
COFFEE_STYLES = {"espresso_latte", "pour_over", "cold_brew", "decaf", "none"}
TEA_STYLES = {"black_green", "herbal", "chai", "iced", "none"}
SPIRITS = {"whiskey", "gin", "tequila", "rum", "vodka", "amaro_liqueurs"}
DIETARY = {
    "vegetarian",
    "vegan",
    "gluten_free",
    "dairy_free",
    "halal",
    "kosher",
    "low_sugar",
    "none",
}
CUISINES = {
    "italian",
    "mexican",
    "japanese",
    "thai",
    "indian",
    "mediterranean",
    "american",
    "french",
    "korean",
    "middle_eastern",
    "other",
}
SWEET_SAVORY = {"sweet", "savory", "balanced"}
PREFERRED_METALS = {"gold", "silver", "rose_gold", "platinum", "mixed", "none"}
FRAGRANCE_NOTES = {
    "citrus",
    "floral",
    "woody",
    "fresh",
    "warm_spice",
    "gourmand",
    "clean",
}
ACCESSORY_PREFS = {
    "bags_totes",
    "wallets",
    "belts",
    "scarves",
    "hats",
    "sunglasses",
    "watches",
}
HOBBIES = {
    "cooking",
    "baking",
    "gardening",
    "photography",
    "painting_drawing",
    "crafts",
    "fitness",
    "yoga_pilates",
    "running",
    "cycling",
    "hiking_camping",
}
CREATIVE_OUTLETS = {
    "music_instrument",
    "singing",
    "writing",
    "podcasting_streaming",
    "woodworking",
    "sewing_knitting",
}
SPORTS_PLAYED = {
    "basketball",
    "soccer",
    "football",
    "baseball",
    "golf",
    "tennis_pickleball",
    "ski_snowboard",
    "swimming",
}
READING_GENRES = {
    "mystery_thriller",
    "sci_fi",
    "fantasy",
    "romance",
    "historical",
    "non_fiction",
    "biography",
    "business",
    "self_help",
}
MUSIC_GENRES = {
    "indie_alt",
    "pop",
    "rock",
    "hip_hop",
    "rnb_soul",
    "jazz",
    "classical",
    "country_folk",
    "edm",
}
TECH_ECOSYSTEM = {"apple", "android", "windows", "chromeos"}
GAMING_PLATFORMS = {"playstation", "xbox", "nintendo", "pc", "mobile", "vr"}
SMART_HOME = {"homekit", "google_home", "alexa", "none"}
TRAVEL_STYLES = {
    "city_breaks",
    "beaches",
    "national_parks",
    "road_trips",
    "luxury_stays",
    "boutique_hotels",
    "camping_glamping",
}
EXPERIENCE_TYPES = {
    "concerts",
    "theater",
    "comedy",
    "sports_events",
    "cooking_classes",
    "spa_wellness",
    "outdoor_adventures",
    "courses_workshops",
}
EVENT_PREFERENCES = {"morning", "afternoon", "evening", "weekend_only"}
COLLECTS = {"vinyl", "books", "sneakers", "watches", "art_prints", "figurines", "cards", "plants"}
AVOID_CATEGORIES = {
    "fragrances",
    "skincare",
    "tech_gadgets",
    "clothes",
    "decor",
    "kitchen_gear",
    "alcohol",
    "experiences",
}
BUDGET_COMFORT = {"budget", "mid", "splurge"}


def _normalize_slug(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    return ascii_value.strip().lower().replace(" ", "_").replace("-", "_")


def _clean_optional_text(value: str | None, *, max_length: int | None = None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    if not cleaned:
        return None
    if max_length is not None and len(cleaned) > max_length:
        raise ValueError(f"Must be at most {max_length} characters")
    return cleaned


def _clean_required_text(value: str | None, *, max_length: int) -> str:
    cleaned = _clean_optional_text(value, max_length=max_length)
    if cleaned is None:
        raise ValueError("Must not be empty")
    return cleaned


def _clean_slug_value(
    value: str | None, *, allowed: set[str], max_length: int = SHORT_TEXT_MAX
) -> str | None:
    cleaned = _clean_optional_text(value, max_length=max_length)
    if cleaned is None:
        return None
    slug = _normalize_slug(cleaned)
    if slug not in allowed:
        raise ValueError(f"Invalid value '{slug}'")
    return slug


def _clean_slug_list(
    values: list[str] | None, *, allowed: set[str], max_length: int = SHORT_TEXT_MAX
) -> list[str] | None:
    if values is None:
        return None
    cleaned_values: list[str] = []
    for value in values:
        slug = _clean_slug_value(value, allowed=allowed, max_length=max_length)
        if slug is None:
            continue
        if slug not in cleaned_values:
            cleaned_values.append(slug)
    return cleaned_values or None


def _clean_freeform_list(
    values: list[str] | None, *, max_length: int = SHORT_TEXT_MAX
) -> list[str] | None:
    if values is None:
        return None
    cleaned_values: list[str] = []
    for value in values:
        cleaned = _clean_optional_text(value, max_length=max_length)
        if cleaned is None:
            continue
        if cleaned not in cleaned_values:
            cleaned_values.append(cleaned)
    return cleaned_values or None


def _clean_size_map(value: dict[str, Any] | None) -> dict[str, str] | None:
    if value is None:
        return None
    cleaned: dict[str, str] = {}
    for raw_type, raw_value in value.items():
        size_type = _clean_optional_text(
            str(raw_type) if raw_type is not None else None,
            max_length=SIZE_FIELD_MAX,
        )
        size_value = _clean_optional_text(
            str(raw_value) if raw_value is not None else None,
            max_length=SIZE_FIELD_MAX,
        )
        if size_type and size_value:
            cleaned[size_type] = size_value
    return cleaned or None


class SizeEntry(BaseModel):
    """Structured size entry."""

    model_config = ConfigDict(extra="forbid")

    type: str = Field(..., min_length=1, max_length=SIZE_FIELD_MAX)
    value: str = Field(..., min_length=1, max_length=SIZE_FIELD_MAX)
    fit: str | None = Field(None, max_length=SHORT_TEXT_MAX)
    brand: str | None = Field(None, max_length=SHORT_TEXT_MAX)
    notes: str | None = Field(None, max_length=200)

    @field_validator("type", "value")
    @classmethod
    def _validate_required(cls, value: str) -> str:
        return _clean_required_text(value, max_length=SIZE_FIELD_MAX)

    @field_validator("fit", "brand")
    @classmethod
    def _validate_optional(cls, value: str | None) -> str | None:
        return _clean_optional_text(value, max_length=SHORT_TEXT_MAX)

    @field_validator("notes")
    @classmethod
    def _validate_notes(cls, value: str | None) -> str | None:
        return _clean_optional_text(value, max_length=200)


class JewelrySizes(BaseModel):
    """Structured jewelry sizes."""

    model_config = ConfigDict(extra="forbid")

    ring: str | None = Field(None, max_length=SIZE_FIELD_MAX)
    bracelet: str | None = Field(None, max_length=SIZE_FIELD_MAX)
    necklace: str | None = Field(None, max_length=SIZE_FIELD_MAX)

    @field_validator("ring", "bracelet", "necklace")
    @classmethod
    def _validate_sizes(cls, value: str | None) -> str | None:
        return _clean_optional_text(value, max_length=SIZE_FIELD_MAX)

    @model_validator(mode="after")
    def _drop_empty(self) -> "JewelrySizes":
        if not self.model_dump(exclude_none=True):
            return JewelrySizes()
        return self


class FoodAndDrink(BaseModel):
    """Food and drink preferences."""

    model_config = ConfigDict(extra="forbid")

    likes_wine: bool | None = None
    wine_types: list[str] | None = None
    beverage_prefs: list[str] | None = None
    coffee_style: str | None = None
    tea_style: str | None = None
    spirits: list[str] | None = None
    dietary: list[str] | None = None
    favorite_cuisines: list[str] | None = None
    sweet_vs_savory: str | None = None
    favorite_treats: str | None = Field(None, max_length=ADVANCED_NOTE_MAX)

    @field_validator("wine_types")
    @classmethod
    def _validate_wine_types(cls, value: list[str] | None) -> list[str] | None:
        return _clean_slug_list(value, allowed=WINE_TYPES, max_length=SIZE_FIELD_MAX)

    @field_validator("beverage_prefs")
    @classmethod
    def _validate_beverage_prefs(cls, value: list[str] | None) -> list[str] | None:
        return _clean_slug_list(value, allowed=BEVERAGE_PREFS)

    @field_validator("coffee_style")
    @classmethod
    def _validate_coffee_style(cls, value: str | None) -> str | None:
        return _clean_slug_value(value, allowed=COFFEE_STYLES)

    @field_validator("tea_style")
    @classmethod
    def _validate_tea_style(cls, value: str | None) -> str | None:
        return _clean_slug_value(value, allowed=TEA_STYLES)

    @field_validator("spirits")
    @classmethod
    def _validate_spirits(cls, value: list[str] | None) -> list[str] | None:
        return _clean_slug_list(value, allowed=SPIRITS)

    @field_validator("dietary")
    @classmethod
    def _validate_dietary(cls, value: list[str] | None) -> list[str] | None:
        return _clean_slug_list(value, allowed=DIETARY)

    @field_validator("favorite_cuisines")
    @classmethod
    def _validate_cuisines(cls, value: list[str] | None) -> list[str] | None:
        return _clean_slug_list(value, allowed=CUISINES)

    @field_validator("sweet_vs_savory")
    @classmethod
    def _validate_sweet_savory(cls, value: str | None) -> str | None:
        return _clean_slug_value(value, allowed=SWEET_SAVORY)

    @field_validator("favorite_treats")
    @classmethod
    def _validate_treats(cls, value: str | None) -> str | None:
        return _clean_optional_text(value, max_length=ADVANCED_NOTE_MAX)


class StyleAndAccessories(BaseModel):
    """Style, color, and accessories preferences."""

    model_config = ConfigDict(extra="forbid")

    preferred_colors: list[str] | None = None
    avoid_colors: list[str] | None = None
    preferred_metals: list[str] | None = None
    fragrance_notes: list[str] | None = None
    jewelry_sizes: JewelrySizes | None = None
    accessory_prefs: list[str] | None = None
    style_notes: str | None = Field(None, max_length=ADVANCED_NOTE_MAX)

    @field_validator("preferred_colors", "avoid_colors")
    @classmethod
    def _validate_colors(cls, value: list[str] | None) -> list[str] | None:
        return _clean_freeform_list(value)

    @field_validator("preferred_metals")
    @classmethod
    def _validate_metals(cls, value: list[str] | None) -> list[str] | None:
        return _clean_slug_list(value, allowed=PREFERRED_METALS)

    @field_validator("fragrance_notes")
    @classmethod
    def _validate_fragrance_notes(cls, value: list[str] | None) -> list[str] | None:
        return _clean_slug_list(value, allowed=FRAGRANCE_NOTES)

    @field_validator("jewelry_sizes")
    @classmethod
    def _validate_jewelry_sizes(cls, value: JewelrySizes | None) -> JewelrySizes | None:
        if value is None:
            return None
        if not value.model_dump(exclude_none=True):
            return None
        return value

    @field_validator("accessory_prefs")
    @classmethod
    def _validate_accessory_prefs(cls, value: list[str] | None) -> list[str] | None:
        return _clean_slug_list(value, allowed=ACCESSORY_PREFS)

    @field_validator("style_notes")
    @classmethod
    def _validate_style_notes(cls, value: str | None) -> str | None:
        return _clean_optional_text(value, max_length=ADVANCED_NOTE_MAX)


class HobbiesAndMedia(BaseModel):
    """Hobbies, media, and fandoms."""

    model_config = ConfigDict(extra="forbid")

    hobbies: list[str] | None = None
    creative_outlets: list[str] | None = None
    sports_played: list[str] | None = None
    sports_teams: list[str] | None = None
    reading_genres: list[str] | None = None
    music_genres: list[str] | None = None
    favorite_authors: list[str] | None = None
    favorite_artists: list[str] | None = None
    board_games: list[str] | None = None
    fandoms_or_series: list[str] | None = None

    @field_validator("hobbies")
    @classmethod
    def _validate_hobbies(cls, value: list[str] | None) -> list[str] | None:
        return _clean_slug_list(value, allowed=HOBBIES)

    @field_validator("creative_outlets")
    @classmethod
    def _validate_creative_outlets(cls, value: list[str] | None) -> list[str] | None:
        return _clean_slug_list(value, allowed=CREATIVE_OUTLETS)

    @field_validator("sports_played")
    @classmethod
    def _validate_sports_played(cls, value: list[str] | None) -> list[str] | None:
        return _clean_slug_list(value, allowed=SPORTS_PLAYED)

    @field_validator("reading_genres")
    @classmethod
    def _validate_reading(cls, value: list[str] | None) -> list[str] | None:
        return _clean_slug_list(value, allowed=READING_GENRES)

    @field_validator("music_genres")
    @classmethod
    def _validate_music(cls, value: list[str] | None) -> list[str] | None:
        return _clean_slug_list(value, allowed=MUSIC_GENRES)

    @field_validator(
        "sports_teams",
        "favorite_authors",
        "favorite_artists",
        "board_games",
        "fandoms_or_series",
    )
    @classmethod
    def _validate_freeform_lists(cls, value: list[str] | None) -> list[str] | None:
        return _clean_freeform_list(value)


class TechTravelExperiences(BaseModel):
    """Technology, travel, and experiences."""

    model_config = ConfigDict(extra="forbid")

    tech_ecosystem: list[str] | None = None
    gaming_platforms: list[str] | None = None
    smart_home: list[str] | None = None
    travel_styles: list[str] | None = None
    dream_destinations: list[str] | None = None
    experience_types: list[str] | None = None
    event_preferences: list[str] | None = None

    @field_validator("tech_ecosystem")
    @classmethod
    def _validate_tech(cls, value: list[str] | None) -> list[str] | None:
        return _clean_slug_list(value, allowed=TECH_ECOSYSTEM)

    @field_validator("gaming_platforms")
    @classmethod
    def _validate_gaming(cls, value: list[str] | None) -> list[str] | None:
        return _clean_slug_list(value, allowed=GAMING_PLATFORMS)

    @field_validator("smart_home")
    @classmethod
    def _validate_smarthome(cls, value: list[str] | None) -> list[str] | None:
        return _clean_slug_list(value, allowed=SMART_HOME)

    @field_validator("travel_styles")
    @classmethod
    def _validate_travel(cls, value: list[str] | None) -> list[str] | None:
        return _clean_slug_list(value, allowed=TRAVEL_STYLES)

    @field_validator("experience_types")
    @classmethod
    def _validate_experiences(cls, value: list[str] | None) -> list[str] | None:
        return _clean_slug_list(value, allowed=EXPERIENCE_TYPES)

    @field_validator("event_preferences")
    @classmethod
    def _validate_events(cls, value: list[str] | None) -> list[str] | None:
        return _clean_slug_list(value, allowed=EVENT_PREFERENCES)

    @field_validator("dream_destinations")
    @classmethod
    def _validate_destinations(cls, value: list[str] | None) -> list[str] | None:
        return _clean_freeform_list(value)


class GiftPreferences(BaseModel):
    """Gift preferences and constraints."""

    model_config = ConfigDict(extra="forbid")

    gift_card_ok: bool | None = None
    likes_personalized: bool | None = None
    collects: list[str] | None = None
    avoid_categories: list[str] | None = None
    budget_comfort: str | None = None
    notes: str | None = Field(None, max_length=ADVANCED_NOTE_MAX)

    @field_validator("collects")
    @classmethod
    def _validate_collects(cls, value: list[str] | None) -> list[str] | None:
        return _clean_slug_list(value, allowed=COLLECTS)

    @field_validator("avoid_categories")
    @classmethod
    def _validate_avoid_categories(cls, value: list[str] | None) -> list[str] | None:
        return _clean_slug_list(value, allowed=AVOID_CATEGORIES)

    @field_validator("budget_comfort")
    @classmethod
    def _validate_budget(cls, value: str | None) -> str | None:
        return _clean_slug_value(value, allowed=BUDGET_COMFORT)

    @field_validator("notes")
    @classmethod
    def _validate_notes(cls, value: str | None) -> str | None:
        return _clean_optional_text(value, max_length=ADVANCED_NOTE_MAX)


class AdvancedInterests(BaseModel):
    """Top-level advanced interests profile."""

    model_config = ConfigDict(extra="forbid")

    food_and_drink: FoodAndDrink | None = None
    style_and_accessories: StyleAndAccessories | None = None
    hobbies_and_media: HobbiesAndMedia | None = None
    tech_travel_experiences: TechTravelExperiences | None = None
    gift_preferences: GiftPreferences | None = None

    @model_validator(mode="after")
    def _drop_empty_sections(self) -> "AdvancedInterests":
        if self.food_and_drink and not self.food_and_drink.model_dump(exclude_none=True):
            self.food_and_drink = None
        if self.style_and_accessories and not self.style_and_accessories.model_dump(
            exclude_none=True
        ):
            self.style_and_accessories = None
        if self.hobbies_and_media and not self.hobbies_and_media.model_dump(
            exclude_none=True
        ):
            self.hobbies_and_media = None
        if self.tech_travel_experiences and not self.tech_travel_experiences.model_dump(
            exclude_none=True
        ):
            self.tech_travel_experiences = None
        if self.gift_preferences and not self.gift_preferences.model_dump(
            exclude_none=True
        ):
            self.gift_preferences = None
        return self


class PersonCreate(BaseModel):
    """DTO for creating a new person."""

    model_config = ConfigDict(extra="forbid")

    display_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Person's display name",
        examples=["Mom", "Dad", "Sarah"],
    )
    relationship: str | None = Field(
        None,
        max_length=100,
        description="Relationship to user",
        examples=["Mom", "Sister", "Friend", "Colleague"],
    )
    birthdate: date | None = Field(
        None,
        description="Person's birthdate",
        examples=["1985-03-15"],
    )
    anniversary: date | None = Field(
        None,
        description="Person's anniversary date",
        examples=["2010-06-20"],
    )
    notes: str | None = Field(
        None,
        max_length=NOTE_MAX,
        description="Additional notes about the person",
        examples=["Loves mystery novels and gardening"],
    )
    interests: list[str] | None = Field(
        None,
        description="List of interests/hobbies",
        examples=[["Reading", "Hiking", "Photography"]],
    )
    size_profile: list[SizeEntry] | None = Field(
        None,
        description="Structured size entries (preferred)",
    )
    sizes: dict[str, Any] | None = Field(
        None,
        description=(
            "Legacy clothing/shoe sizes (deprecated; derived from size_profile on response)."
        ),
        json_schema_extra={"deprecated": True},
    )
    advanced_interests: AdvancedInterests | None = Field(
        None,
        description="Advanced interests profile grouped by category.",
    )
    constraints: str | None = Field(
        None,
        max_length=NOTE_MAX,
        description="Gift constraints or restrictions",
        examples=["Allergic to nuts", "Prefers sustainable products only"],
    )
    photo_url: str | None = Field(
        None,
        max_length=500,
        description="URL to person's photo",
        examples=["https://example.com/photos/person.jpg"],
    )
    group_ids: list[int] = Field(
        default_factory=list,
        description="List of group IDs to link this person to",
        examples=[[1, 2], []],
    )

    @field_validator("display_name", "relationship")
    @classmethod
    def _validate_names(cls, value: str | None) -> str | None:
        if value is None:
            return value
        return _clean_required_text(value, max_length=100)

    @field_validator("notes", "constraints")
    @classmethod
    def _validate_long_text(cls, value: str | None) -> str | None:
        return _clean_optional_text(value, max_length=NOTE_MAX)

    @field_validator("interests")
    @classmethod
    def _validate_interests(cls, value: list[str] | None) -> list[str] | None:
        return _clean_freeform_list(value)

    @field_validator("size_profile")
    @classmethod
    def _normalize_size_profile(cls, value: list[SizeEntry] | None) -> list[SizeEntry] | None:
        if isinstance(value, list) and not value:
            return None
        return value

    @field_validator("sizes", mode="before")
    @classmethod
    def _normalize_sizes(cls, value: dict[str, Any] | None) -> dict[str, str] | None:
        return _clean_size_map(value)

    @field_validator("advanced_interests")
    @classmethod
    def _prune_empty_advanced(
        cls, value: AdvancedInterests | dict[str, Any] | None
    ) -> AdvancedInterests | dict[str, Any] | None:
        if value is None:
            return None
        if isinstance(value, AdvancedInterests) and not value.model_dump(exclude_none=True):
            return None
        if isinstance(value, dict) and not value:
            return None
        return value

    @field_validator("size_profile")
    @classmethod
    def _normalize_size_profile(cls, value: list[SizeEntry] | None) -> list[SizeEntry] | None:
        if isinstance(value, list) and not value:
            return None
        return value

    @field_validator("sizes", mode="before")
    @classmethod
    def _normalize_sizes(cls, value: dict[str, Any] | None) -> dict[str, str] | None:
        return _clean_size_map(value)

    @field_validator("advanced_interests")
    @classmethod
    def _prune_empty_advanced(
        cls, value: AdvancedInterests | dict[str, Any] | None
    ) -> AdvancedInterests | dict[str, Any] | None:
        if value is None:
            return None
        if isinstance(value, AdvancedInterests) and not value.model_dump(exclude_none=True):
            return None
        if isinstance(value, dict) and not value:
            return None
        return value


class PersonUpdate(BaseModel):
    """DTO for updating a person (all fields optional)."""

    model_config = ConfigDict(extra="forbid")

    display_name: str | None = Field(None, min_length=1, max_length=100)
    relationship: str | None = Field(None, max_length=100)
    birthdate: date | None = None
    anniversary: date | None = None
    notes: str | None = Field(None, max_length=NOTE_MAX)
    interests: list[str] | None = None
    size_profile: list[SizeEntry] | None = Field(
        None,
        description="Structured size entries (preferred).",
    )
    sizes: dict[str, Any] | None = Field(
        None,
        description=(
            "Legacy clothing/shoe sizes (deprecated; derived from size_profile on response)."
        ),
        json_schema_extra={"deprecated": True},
    )
    advanced_interests: AdvancedInterests | None = Field(
        None,
        description="Advanced interests profile grouped by category.",
    )
    constraints: str | None = Field(None, max_length=NOTE_MAX)
    photo_url: str | None = Field(None, max_length=500)
    group_ids: list[int] | None = Field(
        None,
        description="List of group IDs to link this person to (None means don't change)",
    )

    @field_validator("display_name", "relationship")
    @classmethod
    def _validate_names(cls, value: str | None) -> str | None:
        if value is None:
            return value
        return _clean_required_text(value, max_length=100)

    @field_validator("notes", "constraints")
    @classmethod
    def _validate_long_text(cls, value: str | None) -> str | None:
        return _clean_optional_text(value, max_length=NOTE_MAX)

    @field_validator("interests")
    @classmethod
    def _validate_interests(cls, value: list[str] | None) -> list[str] | None:
        return _clean_freeform_list(value)


class PersonResponse(TimestampSchema):
    """DTO for person response."""

    id: int
    display_name: str
    relationship: str | None
    birthdate: date | None
    anniversary: date | None
    notes: str | None
    interests: list[str] | None
    size_profile: list[SizeEntry] | None
    sizes: dict[str, Any] | None = Field(
        default=None,
        description="Legacy sizes map derived from size_profile (deprecated).",
        json_schema_extra={"deprecated": True},
    )
    advanced_interests: AdvancedInterests | None
    constraints: str | None
    photo_url: str | None
    groups: list[GroupMinimal] = Field(
        default_factory=list,
        description="Groups this person belongs to",
    )
    occasion_ids: list[int] = Field(
        default_factory=list,
        description="IDs of occasions linked to this person",
    )

    @model_validator(mode="before")
    @classmethod
    def _ensure_size_profile(cls, values: Any) -> Any:
        if not isinstance(values, dict):
            return values
        size_profile = values.get("size_profile")
        sizes_map_raw = values.get("sizes")
        sizes_map = _clean_size_map(sizes_map_raw) if isinstance(sizes_map_raw, dict) else None
        if size_profile is None and sizes_map:
            values["size_profile"] = [
                {"type": size_type, "value": size_value}
                for size_type, size_value in sizes_map.items()
            ]
        return values

    @model_validator(mode="after")
    def _derive_sizes(self) -> "PersonResponse":
        if self.size_profile:
            derived = {entry.type: entry.value for entry in self.size_profile}
            self.sizes = derived or None
        return self


class PersonSummary(BaseModel):
    """Lightweight person summary for lists."""

    id: int
    display_name: str


class PersonBudget(BaseModel):
    """Budget calculation result for a person."""

    person_id: int
    occasion_id: int | None = None
    gifts_assigned_count: int
    gifts_assigned_total: Decimal
    gifts_purchased_count: int
    gifts_purchased_total: Decimal

    @field_serializer("gifts_assigned_total", "gifts_purchased_total")
    def serialize_decimal(self, value: Decimal) -> float:
        """Serialize Decimal fields to float for JSON."""
        return float(value)
