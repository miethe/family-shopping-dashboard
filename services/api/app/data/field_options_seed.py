"""
Field Options Seed Data

Reference data for seeding the field_options table.
These values match the existing Python enums and hardcoded sets
to ensure backward compatibility during migration.

This file is used by:
- Alembic migration to seed initial field options
- Tests to verify backward compatibility
- Admin page to display system options
"""

from typing import TypedDict


class FieldOptionSeed(TypedDict):
    """Type definition for field option seed data."""

    entity: str
    field_name: str
    value: str
    display_label: str
    display_order: int
    is_system: bool


# Gift entity options (from GiftPriority, GiftStatus enums)
GIFT_OPTIONS: list[FieldOptionSeed] = [
    # Priority options (from GiftPriority enum)
    {
        "entity": "gift",
        "field_name": "priority",
        "value": "low",
        "display_label": "Low",
        "display_order": 1,
        "is_system": True,
    },
    {
        "entity": "gift",
        "field_name": "priority",
        "value": "medium",
        "display_label": "Medium",
        "display_order": 2,
        "is_system": True,
    },
    {
        "entity": "gift",
        "field_name": "priority",
        "value": "high",
        "display_label": "High",
        "display_order": 3,
        "is_system": True,
    },
    # Status options (from GiftStatus enum)
    {
        "entity": "gift",
        "field_name": "status",
        "value": "idea",
        "display_label": "Idea",
        "display_order": 1,
        "is_system": True,
    },
    {
        "entity": "gift",
        "field_name": "status",
        "value": "selected",
        "display_label": "Selected",
        "display_order": 2,
        "is_system": True,
    },
    {
        "entity": "gift",
        "field_name": "status",
        "value": "purchased",
        "display_label": "Purchased",
        "display_order": 3,
        "is_system": True,
    },
    {
        "entity": "gift",
        "field_name": "status",
        "value": "received",
        "display_label": "Received",
        "display_order": 4,
        "is_system": True,
    },
]

# Occasion entity options (from OccasionType enum)
OCCASION_OPTIONS: list[FieldOptionSeed] = [
    {
        "entity": "occasion",
        "field_name": "type",
        "value": "holiday",
        "display_label": "Holiday",
        "display_order": 1,
        "is_system": True,
    },
    {
        "entity": "occasion",
        "field_name": "type",
        "value": "recurring",
        "display_label": "Recurring",
        "display_order": 2,
        "is_system": True,
    },
    {
        "entity": "occasion",
        "field_name": "type",
        "value": "other",
        "display_label": "Other",
        "display_order": 99,
        "is_system": True,
    },
]

# List entity options (from ListType, ListVisibility enums)
LIST_OPTIONS: list[FieldOptionSeed] = [
    # Type options (from ListType enum)
    {
        "entity": "list",
        "field_name": "type",
        "value": "wishlist",
        "display_label": "Wishlist",
        "display_order": 1,
        "is_system": True,
    },
    {
        "entity": "list",
        "field_name": "type",
        "value": "ideas",
        "display_label": "Ideas",
        "display_order": 2,
        "is_system": True,
    },
    {
        "entity": "list",
        "field_name": "type",
        "value": "assigned",
        "display_label": "Assigned",
        "display_order": 3,
        "is_system": True,
    },
    # Visibility options (from ListVisibility enum)
    {
        "entity": "list",
        "field_name": "visibility",
        "value": "private",
        "display_label": "Private",
        "display_order": 1,
        "is_system": True,
    },
    {
        "entity": "list",
        "field_name": "visibility",
        "value": "family",
        "display_label": "Family",
        "display_order": 2,
        "is_system": True,
    },
    {
        "entity": "list",
        "field_name": "visibility",
        "value": "public",
        "display_label": "Public",
        "display_order": 3,
        "is_system": True,
    },
]

# All options combined for seeding
ALL_FIELD_OPTIONS: list[FieldOptionSeed] = (
    GIFT_OPTIONS + OCCASION_OPTIONS + LIST_OPTIONS
)


def get_options_for_entity(entity: str) -> list[FieldOptionSeed]:
    """
    Get all field options for a specific entity.

    Args:
        entity: Entity name (e.g., "gift", "occasion", "list")

    Returns:
        List of field option seed data for the entity
    """
    return [opt for opt in ALL_FIELD_OPTIONS if opt["entity"] == entity]


def get_options_for_field(entity: str, field_name: str) -> list[FieldOptionSeed]:
    """
    Get field options for a specific entity and field.

    Args:
        entity: Entity name (e.g., "gift", "occasion", "list")
        field_name: Field name (e.g., "priority", "status", "type", "visibility")

    Returns:
        List of field option seed data for the specific field
    """
    return [
        opt
        for opt in ALL_FIELD_OPTIONS
        if opt["entity"] == entity and opt["field_name"] == field_name
    ]
