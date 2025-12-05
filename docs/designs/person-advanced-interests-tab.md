---
title: Person Modal - Advanced Interests Tab
description: UX spec for the new Advanced Interests tab and multi-size input on Person modals.
audience: [designers, frontend-developers, product]
tags: [design, person, interests, sizes, modal]
created: 2025-12-05
updated: 2025-12-05
---

# Person Modal - Advanced Interests Tab

Design spec for adding an "Advanced Interests" tab to the Person detail modal (view + edit) and upgrading the size input to support multiple typed rows. Creation stays lightweight (Overview-only fields).

---

## Modal Structure
- **Tabs**: `Overview` (default) · `Advanced Interests` · `Linked Entities` · `History`.
- **States**:
  - **View**: Read-only cards; only populated categories render.
  - **Edit**: Sectioned form on the Advanced tab; Overview form handles primary fields.
- **Creation**: Uses Overview tab only (display name, relationship, birthdate, interests chips, constraints, notes, photo URL, groups, primary sizes). After creation, users can open Edit → Advanced tab to add details.

---

## Layout & Styling
- Use existing modal shell (`EntityModal`) with max width `xl`.
- **TabsList** full width; on mobile stack tabs or use horizontal scroll with underline indicator.
- **Spacing**: 24px section spacing, 12px between inputs; cards use existing `Card` component with `border` and `rounded-xl`.
- **Chips/Badges**: Reuse badge styles from interests/groups; when list > 5 items, show first 5 chips + "+N more" text chip.
- **Icons**: Minimal; use section-leading icons only where helpful (e.g., wine glass, brush, controller).
- **Responsiveness**: On <640px, stack inputs, collapse multi-column lists to single column, maintain 44px touch targets.

---

## Advanced Interests - Edit Form

**Form behaviors**
- Inputs auto-trim; arrays dedupe on add.
- Boolean toggles gate sub-fields (e.g., `Likes Wine?` reveals wine types).
- "+ Add" inline controls for freeform lists (press Enter or click to add).
- Helper text kept to one line (≤90 chars).

### Sections & Fields

1) **Food & Drink**
   - Toggle: `Likes wine?` (switch)
   - Checkbox group (visible when likes wine): `Red`, `White`, `Rosé`, `Sparkling`, `Natural/Orange`, `Dessert/Fortified`
   - Multi-select chips: `Beverage preferences` (Coffee, Tea, Cocktails, Beer, Spirits, Mocktails/NA)
   - Radio or select: `Coffee style` (Espresso/Latte, Pour-over/Drip, Cold brew, Decaf, None)
   - Radio or select: `Tea style` (Black/Green, Herbal, Chai, Iced, None)
   - Checkbox group: `Spirits` (Whiskey, Gin, Tequila, Rum, Vodka, Amaro/Liqueurs)
   - Multi-select chips: `Dietary preferences` (Vegetarian, Vegan, Gluten-free, Dairy-free, Halal, Kosher, Low-sugar, None)
   - Multi-select chips: `Favorite cuisines` (Italian, Mexican, Japanese, Thai, Indian, Mediterranean, American, French, Korean, Middle Eastern, Other)
   - Select: `Sweet vs savory` (Sweet-leaning, Savory-leaning, Balanced)
   - Textarea (2 rows): `Favorite treats or must-avoid foods`

2) **Style & Accessories**
   - Multi-select chips: `Preferred colors`
   - Multi-select chips: `Colors to avoid`
   - Checkbox group: `Jewelry metals` (Gold, Silver, Rose Gold, Platinum, Mixed, Prefers None)
   - Multi-select chips: `Fragrance notes` (Citrus, Floral, Woody, Fresh, Warm/Spice, Gourmand, Clean)
   - Inline fields: `Ring size`, `Bracelet size`, `Necklace length`
   - Checkbox group: `Accessory preferences` (Bags/Totes, Wallets, Belts, Scarves, Hats, Sunglasses, Watches)
   - Textarea (2 rows): `Style notes` (fit preferences, brands to avoid, etc.)

3) **Hobbies & Media**
   - Multi-select chips: `Hobbies` (Cooking, Baking, Gardening, Photography, Painting/Drawing, DIY/Crafts, Fitness, Yoga/Pilates, Running, Cycling, Hiking/Camping)
   - Multi-select chips: `Creative outlets` (Music/Instrument, Singing, Writing/Journal, Podcasting/Streaming, Woodworking, Sewing/Knitting)
   - Multi-select chips: `Sports played/followed` (Basketball, Soccer, Football, Baseball, Golf, Tennis/Pickleball, Ski/Snowboard, Swimming)
   - Pill list with freeform entries: `Favorite teams or clubs`
   - Multi-select chips: `Reading genres` (Mystery/Thriller, Sci-Fi, Fantasy, Romance, Historical, Non-fiction, Biography, Business, Self-help)
   - Multi-select chips: `Music genres` (Indie/Alt, Pop, Rock, Hip-hop/Rap, R&B/Soul, Jazz, Classical, Country/Folk, EDM)
   - Text inputs with "+ Add": `Favorite authors`, `Favorite artists`, `Board/party games`, `Fandoms/series`

4) **Tech, Travel & Experiences**
   - Checkbox group: `Tech ecosystem` (Apple, Android, Windows/PC, ChromeOS)
   - Checkbox group: `Gaming platforms` (PlayStation, Xbox, Nintendo, PC, Mobile, VR)
   - Checkbox group: `Smart home` (HomeKit, Google Home, Alexa, None)
   - Multi-select chips: `Travel styles` (City breaks, Beaches, National parks, Road trips, Luxury stays, Boutique/Design hotels, Camping/Glamping)
   - Text chips: `Dream destinations`
   - Checkbox group: `Experience types` (Concerts, Theater/Plays, Comedy shows, Sports events, Cooking classes, Spa/Wellness, Outdoor adventures, Courses/Workshops)
   - Checkbox group: `Event preferences` (Morning, Afternoon, Evening, Weekend-only)

5) **Gift Preferences**
   - Toggle: `Open to gift cards?`
   - Toggle: `Likes personalized/monogrammed gifts?`
   - Multi-select chips: `Collects` (Vinyl, Books, Sneakers, Watches, Art prints, Figurines, Cards, Plants)
   - Multi-select chips: `Categories to avoid` (Fragrances, Skincare, Tech gadgets, Clothes, Decor, Kitchen gear, Alcohol, Experiences)
   - Select: `Budget comfort` (Budget-conscious, Mid-range, Splurge-okay)
   - Textarea (2 rows): `Additional notes for gifting`

---

## Advanced Interests - View Mode
- Render sections only when at least one field inside is populated.
- Within a section:
  - Use title + subtle icon.
  - Display chips for arrays, inline values for singles, and muted labels.
  - For boolean toggles, show `Yes/No` pills.
  - For long text, limit to ~3 lines then "Show more" expander.
- Order: Food & Drink → Style & Accessories → Hobbies & Media → Tech/Travel/Experiences → Gift Preferences.

---

## Sizes UI (Overview Tab)
- **Edit**: Repeatable row with `Type` (select or freeform) + `Size` input and optional `Fit/Notes` text input revealed via "Add fit note" link. A "+" button adds another row beneath. Pre-populate type options: Shirt/Top, Pants, Dress, Shoes, Jacket/Coat, Ring, Hat, Other.
- **View**: Two-column grid of badges showing `Type — Size`; include fit note tooltip when present.
- **Creation**: Show up to 3 rows by default (Shirt, Pants, Shoes), each optional; users can add more via "+".

---

## Data & Validation Hints
- Strings trimmed; arrays deduped.
- Keep per-field max length reasonable (name chips 60 chars, textareas 2000 chars).
- Multi-select options stored as lowercase slugs; display labels Title Case.
- Empty categories not sent to API; client strips empty arrays/strings.

---

## Accessibility
- All toggles and chip groups are keyboard navigable (tab/arrow + space/enter).
- Maintain 44px hit targets; ensure focus ring visible on chips and "+ Add" buttons.
- Provide aria-describedby for helper text and error states; toast confirmations remain.

