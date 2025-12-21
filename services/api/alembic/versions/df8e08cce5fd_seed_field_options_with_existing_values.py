"""seed field_options with existing values

Revision ID: df8e08cce5fd
Revises: 3905b0fc62cd
Create Date: 2025-12-21 15:07:59.452815

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime


# revision identifiers, used by Alembic.
revision = 'df8e08cce5fd'
down_revision = '3905b0fc62cd'
branch_labels = None
depends_on = None


def to_display_label(value: str) -> str:
    """Convert snake_case to Title Case for display labels."""
    return value.replace('_', ' ').title()


def upgrade() -> None:
    """Seed field_options table with all existing hardcoded values."""

    # Define all field options with their entity, field_name, and values
    # Format: (entity, field_name, values_list)
    field_options_data = [
        # Person fields - Wine and Beverage Preferences
        ('person', 'wine_types', ['red', 'white', 'rose', 'sparkling', 'natural_orange', 'dessert_fortified']),
        ('person', 'beverage_prefs', ['coffee', 'tea', 'cocktails', 'beer', 'spirits', 'mocktails']),
        ('person', 'coffee_styles', ['espresso_latte', 'pour_over', 'cold_brew', 'decaf', 'none']),
        ('person', 'tea_styles', ['black_green', 'herbal', 'chai', 'iced', 'none']),
        ('person', 'spirits', ['whiskey', 'gin', 'tequila', 'rum', 'vodka', 'amaro_liqueurs']),

        # Person fields - Food Preferences
        ('person', 'dietary', ['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'halal', 'kosher', 'low_sugar', 'none']),
        ('person', 'cuisines', ['italian', 'mexican', 'japanese', 'thai', 'indian', 'mediterranean', 'american', 'french', 'korean', 'middle_eastern', 'other']),
        ('person', 'sweet_savory', ['sweet', 'savory', 'balanced']),

        # Person fields - Style and Fashion
        ('person', 'preferred_metals', ['gold', 'silver', 'rose_gold', 'platinum', 'mixed', 'none']),
        ('person', 'fragrance_notes', ['citrus', 'floral', 'woody', 'fresh', 'warm_spice', 'gourmand', 'clean']),
        ('person', 'accessory_prefs', ['bags_totes', 'wallets', 'belts', 'scarves', 'hats', 'sunglasses', 'watches']),

        # Person fields - Hobbies and Activities
        ('person', 'hobbies', ['cooking', 'baking', 'gardening', 'photography', 'painting_drawing', 'crafts', 'fitness', 'yoga_pilates', 'running', 'cycling', 'hiking_camping']),
        ('person', 'creative_outlets', ['music_instrument', 'singing', 'writing', 'podcasting_streaming', 'woodworking', 'sewing_knitting']),
        ('person', 'sports_played', ['basketball', 'soccer', 'football', 'baseball', 'golf', 'tennis_pickleball', 'ski_snowboard', 'swimming']),

        # Person fields - Entertainment Preferences
        ('person', 'reading_genres', ['mystery_thriller', 'sci_fi', 'fantasy', 'romance', 'historical', 'non_fiction', 'biography', 'business', 'self_help']),
        ('person', 'music_genres', ['indie_alt', 'pop', 'rock', 'hip_hop', 'rnb_soul', 'jazz', 'classical', 'country_folk', 'edm']),

        # Person fields - Technology
        ('person', 'tech_ecosystem', ['apple', 'android', 'windows', 'chromeos']),
        ('person', 'gaming_platforms', ['playstation', 'xbox', 'nintendo', 'pc', 'mobile', 'vr']),
        ('person', 'smart_home', ['homekit', 'google_home', 'alexa', 'none']),

        # Person fields - Travel and Experiences
        ('person', 'travel_styles', ['city_breaks', 'beaches', 'national_parks', 'road_trips', 'luxury_stays', 'boutique_hotels', 'camping_glamping']),
        ('person', 'experience_types', ['concerts', 'theater', 'comedy', 'sports_events', 'cooking_classes', 'spa_wellness', 'outdoor_adventures', 'courses_workshops']),
        ('person', 'event_preferences', ['morning', 'afternoon', 'evening', 'weekend_only']),

        # Person fields - Collections and Preferences
        ('person', 'collects', ['vinyl', 'books', 'sneakers', 'watches', 'art_prints', 'figurines', 'cards', 'plants']),
        ('person', 'avoid_categories', ['fragrances', 'skincare', 'tech_gadgets', 'clothes', 'decor', 'kitchen_gear', 'alcohol', 'experiences']),
        ('person', 'budget_comfort', ['budget', 'mid', 'splurge']),

        # Gift fields
        ('gift', 'gift_priority', ['low', 'medium', 'high']),
        ('gift', 'gift_status', ['idea', 'selected', 'purchased', 'received']),

        # Occasion fields
        ('occasion', 'occasion_type', ['holiday', 'recurring', 'other']),

        # List fields
        ('list', 'list_type', ['wishlist', 'ideas', 'assigned']),
        ('list', 'list_visibility', ['private', 'family', 'public']),
    ]

    # Build bulk insert data
    insert_data = []
    now = datetime.utcnow()

    for entity, field_name, values in field_options_data:
        for idx, value in enumerate(values, start=1):
            insert_data.append({
                'entity': entity,
                'field_name': field_name,
                'value': value,
                'display_label': to_display_label(value),
                'display_order': idx,
                'is_system': True,
                'created_at': now,
                'updated_at': now,
            })

    # Bulk insert
    op.bulk_insert(
        sa.table(
            'field_options',
            sa.column('entity', sa.String),
            sa.column('field_name', sa.String),
            sa.column('value', sa.String),
            sa.column('display_label', sa.String),
            sa.column('display_order', sa.Integer),
            sa.column('is_system', sa.Boolean),
            sa.column('created_at', sa.DateTime),
            sa.column('updated_at', sa.DateTime),
        ),
        insert_data
    )


def downgrade() -> None:
    """Remove all system-seeded field options."""
    op.execute("DELETE FROM field_options WHERE is_system = true")
