---
title: Person Entity Specification
description: Full contract for the Person entity, including new Advanced Interests profile and size handling.
audience: [backend, frontend, qa]
tags: [api, entity, person, interests, sizes]
created: 2025-12-05
updated: 2025-12-05
---

# Person Entity Specification

Canonical reference for all Person fields (existing + new), data shapes, validation, and surface responsibilities.

---

## Core Fields
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | int | Yes (server) | Primary key |
| `display_name` | string (1-100) | Yes | User-facing name |
| `relationship` | string (0-100) | No | e.g., Mom, Friend, Colleague |
| `birthdate` | date (YYYY-MM-DD) | No | Used for age/occasion generation |
| `anniversary` | date (YYYY-MM-DD) | No | Used for occasion generation |
| `photo_url` | string (<=500, URL) | No | Avatar source |
| `notes` | text (<=2000) | No | General notes |
| `constraints` | text (<=2000) | No | Allergies/avoidances/preferences |

## Interests (Lightweight)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `interests` | string[] | No | Freeform tags; surfaced on Overview and in creation |

## Sizes
- **`size_profile`** (preferred): `SizeEntry[]` (JSON, nullable)  
  - `type` (string, 1-60) — e.g., "Shirt", "Pants", "Shoes", "Ring", "Hat"  
  - `value` (string, 1-60) — e.g., "M", "32x30", "9.5", "7.25"  
  - `fit` (string, 0-120, optional) — e.g., "Prefers relaxed fit"  
  - `brand` (string, 0-120, optional) — e.g., "Lululemon tops run M"  
  - `notes` (string, 0-200, optional) — freeform clarifier  
- **`sizes`** (legacy/deprecated): `{ [type: string]: string }`  
  - Continue to emit for one release by deriving from `size_profile` (`type → value`).  
  - Incoming `sizes` should be migrated into `size_profile` on write.

## Advanced Interests Profile
`advanced_interests` (JSON, nullable) with optional categories and fields; empty keys omitted.

### `food_and_drink`
- `likes_wine`: bool
- `wine_types`: string[] (red, white, rosé, sparkling, natural_orange, dessert_fortified)
- `beverage_prefs`: string[] (coffee, tea, cocktails, beer, spirits, mocktails)
- `coffee_style`: string (espresso_latte, pour_over, cold_brew, decaf, none)
- `tea_style`: string (black_green, herbal, chai, iced, none)
- `spirits`: string[] (whiskey, gin, tequila, rum, vodka, amaro_liqueurs)
- `dietary`: string[] (vegetarian, vegan, gluten_free, dairy_free, halal, kosher, low_sugar, none)
- `favorite_cuisines`: string[] (italian, mexican, japanese, thai, indian, mediterranean, american, french, korean, middle_eastern, other)
- `sweet_vs_savory`: string (sweet, savory, balanced)
- `favorite_treats`: string (<=500)

### `style_and_accessories`
- `preferred_colors`: string[]
- `avoid_colors`: string[]
- `preferred_metals`: string[] (gold, silver, rose_gold, platinum, mixed, none)
- `fragrance_notes`: string[] (citrus, floral, woody, fresh, warm_spice, gourmand, clean)
- `jewelry_sizes`: object `{ ring?: string, bracelet?: string, necklace?: string }`
- `accessory_prefs`: string[] (bags_totes, wallets, belts, scarves, hats, sunglasses, watches)
- `style_notes`: string (<=500)

### `hobbies_and_media`
- `hobbies`: string[] (cooking, baking, gardening, photography, painting_drawing, crafts, fitness, yoga_pilates, running, cycling, hiking_camping)
- `creative_outlets`: string[] (music_instrument, singing, writing, podcasting_streaming, woodworking, sewing_knitting)
- `sports_played`: string[] (basketball, soccer, football, baseball, golf, tennis_pickleball, ski_snowboard, swimming)
- `sports_teams`: string[] (freeform team/club names)
- `reading_genres`: string[] (mystery_thriller, sci_fi, fantasy, romance, historical, non_fiction, biography, business, self_help)
- `music_genres`: string[] (indie_alt, pop, rock, hip_hop, rnb_soul, jazz, classical, country_folk, edm)
- `favorite_authors`: string[]
- `favorite_artists`: string[]
- `board_games`: string[]
- `fandoms_or_series`: string[]

### `tech_travel_experiences`
- `tech_ecosystem`: string[] (apple, android, windows, chromeos)
- `gaming_platforms`: string[] (playstation, xbox, nintendo, pc, mobile, vr)
- `smart_home`: string[] (homekit, google_home, alexa, none)
- `travel_styles`: string[] (city_breaks, beaches, national_parks, road_trips, luxury_stays, boutique_hotels, camping_glamping)
- `dream_destinations`: string[]
- `experience_types`: string[] (concerts, theater, comedy, sports_events, cooking_classes, spa_wellness, outdoor_adventures, courses_workshops)
- `event_preferences`: string[] (morning, afternoon, evening, weekend_only)

### `gift_preferences`
- `gift_card_ok`: bool
- `likes_personalized`: bool
- `collects`: string[] (vinyl, books, sneakers, watches, art_prints, figurines, cards, plants)
- `avoid_categories`: string[] (fragrances, skincare, tech_gadgets, clothes, decor, kitchen_gear, alcohol, experiences)
- `budget_comfort`: string (budget, mid, splurge)
- `notes`: string (<=500)

## Relationships
| Field | Type | Notes |
|-------|------|-------|
| `groups` | `GroupMinimal[]` | Many-to-many; minimal fields `id`, `name`, `color?` |
| `occasion_ids` | int[] | Linked occasions (e.g., birthday/anniversary) |
| `lists` | Gift lists (not returned by default person payload) |
| `gifts` | Gifts linked via `gift_people` (exposed on gift responses) |

## Derived (UI-only, not stored)
- `age`, `next_birthday`, `days_until_birthday` (computed client-side).

## Surface Responsibilities
- **Creation**: `display_name`, `relationship`, `birthdate`, `photo_url`, `interests`, `constraints`, `notes`, `size_profile` (limited rows), `group_ids`. Advanced profile omitted.
- **Edit (Overview tab)**: All creation fields + full `size_profile`.
- **Edit (Advanced tab)**: Entire `advanced_interests` object; optional, sparse allowed.
- **View (Overview tab)**: Primary fields + summarized sizes.
- **View (Advanced tab)**: Only populated categories/fields.

## Payload Example (response)
```json
{
  "id": 12,
  "display_name": "Alex Carter",
  "relationship": "Brother",
  "birthdate": "1990-04-12",
  "anniversary": null,
  "photo_url": "https://example.com/alex.jpg",
  "notes": "Prefers experiences over objects.",
  "constraints": "Allergic to shellfish.",
  "interests": ["Running", "Coffee"],
  "size_profile": [
    { "type": "Shirt", "value": "M", "fit": "Athletic", "brand": "Lululemon" },
    { "type": "Shoes", "value": "10", "notes": "Wide" }
  ],
  "sizes": { "Shirt": "M", "Shoes": "10" },
  "advanced_interests": {
    "food_and_drink": {
      "likes_wine": true,
      "wine_types": ["red", "sparkling"],
      "beverage_prefs": ["coffee", "cocktails"],
      "favorite_cuisines": ["italian", "japanese"]
    },
    "tech_travel_experiences": {
      "tech_ecosystem": ["apple"],
      "gaming_platforms": ["playstation"],
      "travel_styles": ["city_breaks", "national_parks"],
      "experience_types": ["concerts", "cooking_classes"]
    },
    "gift_preferences": {
      "gift_card_ok": false,
      "likes_personalized": true,
      "avoid_categories": ["fragrances"],
      "budget_comfort": "mid"
    }
  },
  "groups": [{ "id": 3, "name": "Family", "color": "#F97316" }],
  "occasion_ids": [101, 202],
  "created_at": "2025-12-01T18:05:00Z",
  "updated_at": "2025-12-05T14:10:00Z"
}
```

## Validation Rules
- Trim whitespace for strings; drop empty strings/arrays before save.
- Dedupe arrays; enforce lowercase slugs for enum-backed fields.
- Max lengths: textareas ≤2000 chars, short strings ≤120 chars unless noted.
- Unknown keys in `advanced_interests` rejected; enums validated against lists above.
- `size_profile` requires both `type` and `value`; at least one row allowed to be empty only on client before submit (not persisted).

