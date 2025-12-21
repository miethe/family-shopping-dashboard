"""Field option schemas (DTOs) for admin management."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.base import TimestampSchema


# Valid entities for field options
VALID_ENTITIES = {"person", "gift", "occasion", "list"}

# Valid field names per entity (for validation)
VALID_FIELDS = {
    "person": {
        "wine_types", "beverage_prefs", "coffee_style", "tea_style",
        "spirits", "dietary", "favorite_cuisines", "sweet_vs_savory",
        "preferred_metals", "fragrance_notes", "accessory_prefs",
        "hobbies", "creative_outlets", "sports_played", "reading_genres",
        "music_genres", "tech_ecosystem", "gaming_platforms", "smart_home",
        "travel_styles", "experience_types", "event_preferences",
        "collects", "avoid_categories", "budget_comfort",
    },
    "gift": {"priority", "status"},
    "occasion": {"type"},
    "list": {"type", "visibility"},
}


class FieldOptionCreate(BaseModel):
    """DTO for creating a new field option."""

    model_config = ConfigDict(extra="forbid")

    entity: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Entity type: person, gift, occasion, list",
        examples=["person", "gift"],
    )
    field_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Field name within the entity",
        examples=["wine_types", "priority"],
    )
    value: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Option value (key), immutable after creation",
        examples=["sake", "low"],
    )
    display_label: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Human-readable label for display",
        examples=["Sake", "Low Priority"],
    )
    display_order: int = Field(
        0,
        ge=0,
        description="Sort order in UI (0 = first)",
    )

    @field_validator("entity")
    @classmethod
    def validate_entity(cls, v: str) -> str:
        v = v.lower().strip()
        if v not in VALID_ENTITIES:
            raise ValueError(f"entity must be one of {sorted(VALID_ENTITIES)}, got '{v}'")
        return v

    @field_validator("value")
    @classmethod
    def normalize_value(cls, v: str) -> str:
        # Normalize to snake_case
        return v.strip().lower().replace(" ", "_").replace("-", "_")


class FieldOptionUpdate(BaseModel):
    """DTO for updating a field option (only label and order editable)."""

    model_config = ConfigDict(extra="forbid")

    display_label: Optional[str] = Field(
        None,
        min_length=1,
        max_length=255,
        description="Updated display label",
    )
    display_order: Optional[int] = Field(
        None,
        ge=0,
        description="Updated sort order",
    )


class FieldOptionResponse(TimestampSchema):
    """DTO for field option response with all fields."""

    id: int
    entity: str
    field_name: str
    value: str
    display_label: str
    display_order: int
    is_system: bool = Field(
        description="True if this is a hardcoded system default"
    )
    is_active: bool = Field(
        description="False if soft-deleted"
    )
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    usage_count: Optional[int] = Field(
        None,
        description="Number of records using this option (computed)"
    )


class FieldOptionListResponse(BaseModel):
    """DTO for paginated list of field options."""

    items: list[FieldOptionResponse]
    total: int
    has_more: bool = False
    next_cursor: Optional[int] = None


class FieldOptionDeleteResponse(BaseModel):
    """DTO for delete operation result."""

    success: bool
    id: int
    soft_deleted: bool = Field(
        description="True if soft-deleted, False if hard-deleted"
    )
    usage_count: Optional[int] = Field(
        None,
        description="Records using this option (if blocked)"
    )
    message: Optional[str] = None
