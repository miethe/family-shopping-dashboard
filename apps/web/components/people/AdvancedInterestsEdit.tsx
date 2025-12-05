/**
 * AdvancedInterestsEdit Component
 *
 * Comprehensive form for editing person's advanced interests.
 * Features collapsible sections, conditional fields, and predefined options.
 */

'use client';

import * as React from 'react';
import type { AdvancedInterests } from '@/types';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ChipInput } from '@/components/ui/chip-input';
import { Select, type SelectOption } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Utensils,
  Palette,
  Gamepad2,
  Plane,
  Gift,
  ChevronDown,
} from '@/components/ui/icons';

interface AdvancedInterestsEditProps {
  value: AdvancedInterests;
  onChange: (value: AdvancedInterests) => void;
}

// Option sets from backend schema
const OPTIONS = {
  wine_types: ['red', 'white', 'rose', 'sparkling', 'natural_orange', 'dessert_fortified'],
  beverage_prefs: ['coffee', 'tea', 'cocktails', 'beer', 'spirits', 'mocktails'],
  coffee_style: ['espresso_latte', 'pour_over', 'cold_brew', 'decaf', 'none'],
  tea_style: ['black_green', 'herbal', 'chai', 'iced', 'none'],
  spirits: ['whiskey', 'gin', 'tequila', 'rum', 'vodka', 'amaro_liqueurs'],
  dietary: [
    'vegetarian',
    'vegan',
    'gluten_free',
    'dairy_free',
    'halal',
    'kosher',
    'low_sugar',
    'none',
  ],
  cuisines: [
    'italian',
    'mexican',
    'japanese',
    'thai',
    'indian',
    'mediterranean',
    'american',
    'french',
    'korean',
    'middle_eastern',
    'other',
  ],
  sweet_savory: ['sweet', 'savory', 'balanced'],
  preferred_metals: ['gold', 'silver', 'rose_gold', 'platinum', 'mixed', 'none'],
  fragrance_notes: ['citrus', 'floral', 'woody', 'fresh', 'warm_spice', 'gourmand', 'clean'],
  accessory_prefs: [
    'bags_totes',
    'wallets',
    'belts',
    'scarves',
    'hats',
    'sunglasses',
    'watches',
  ],
  hobbies: [
    'cooking',
    'baking',
    'gardening',
    'photography',
    'painting_drawing',
    'crafts',
    'fitness',
    'yoga_pilates',
    'running',
    'cycling',
    'hiking_camping',
  ],
  creative_outlets: [
    'music_instrument',
    'singing',
    'writing',
    'podcasting_streaming',
    'woodworking',
    'sewing_knitting',
  ],
  sports_played: [
    'basketball',
    'soccer',
    'football',
    'baseball',
    'golf',
    'tennis_pickleball',
    'ski_snowboard',
    'swimming',
  ],
  reading_genres: [
    'mystery_thriller',
    'sci_fi',
    'fantasy',
    'romance',
    'historical',
    'non_fiction',
    'biography',
    'business',
    'self_help',
  ],
  music_genres: [
    'indie_alt',
    'pop',
    'rock',
    'hip_hop',
    'rnb_soul',
    'jazz',
    'classical',
    'country_folk',
    'edm',
  ],
  tech_ecosystem: ['apple', 'android', 'windows', 'chromeos'],
  gaming_platforms: ['playstation', 'xbox', 'nintendo', 'pc', 'mobile', 'vr'],
  smart_home: ['homekit', 'google_home', 'alexa', 'none'],
  travel_styles: [
    'city_breaks',
    'beaches',
    'national_parks',
    'road_trips',
    'luxury_stays',
    'boutique_hotels',
    'camping_glamping',
  ],
  experience_types: [
    'concerts',
    'theater',
    'comedy',
    'sports_events',
    'cooking_classes',
    'spa_wellness',
    'outdoor_adventures',
    'courses_workshops',
  ],
  event_preferences: ['morning', 'afternoon', 'evening', 'weekend_only'],
  collects: [
    'vinyl',
    'books',
    'sneakers',
    'watches',
    'art_prints',
    'figurines',
    'cards',
    'plants',
  ],
  avoid_categories: [
    'fragrances',
    'skincare',
    'tech_gadgets',
    'clothes',
    'decor',
    'kitchen_gear',
    'alcohol',
    'experiences',
  ],
  budget_comfort: ['budget', 'mid', 'splurge'],
};

// Helper to format options for Select component
function formatOptions(options: string[]): SelectOption[] {
  return options.map((opt) => ({
    value: opt,
    label: opt.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
  }));
}

// Collapsible section wrapper
function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card variant="default" padding="none" className="overflow-hidden">
        <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-warm-50 transition-colors min-h-[44px]">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary-500" />
            <h3 className="font-semibold text-warm-900">{title}</h3>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-warm-600 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 py-4 space-y-4 border-t border-border-subtle">
            {children}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function AdvancedInterestsEdit({ value, onChange }: AdvancedInterestsEditProps) {
  const updateCategory = <K extends keyof AdvancedInterests>(
    category: K,
    data: Partial<AdvancedInterests[K]>
  ) => {
    onChange({
      ...value,
      [category]: {
        ...value[category],
        ...data,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Food & Drink */}
      <Section title="Food & Drink" icon={Utensils}>
        <Switch
          checked={value.food_and_drink?.likes_wine ?? false}
          onCheckedChange={(checked) =>
            updateCategory('food_and_drink', { likes_wine: checked })
          }
          label="Likes Wine"
        />

        {value.food_and_drink?.likes_wine && (
          <ChipInput
            label="Wine Types"
            value={value.food_and_drink?.wine_types ?? []}
            onChange={(v) => updateCategory('food_and_drink', { wine_types: v })}
            options={OPTIONS.wine_types}
            placeholder="Select wine types..."
          />
        )}

        <ChipInput
          label="Beverage Preferences"
          value={value.food_and_drink?.beverage_prefs ?? []}
          onChange={(v) => updateCategory('food_and_drink', { beverage_prefs: v })}
          options={OPTIONS.beverage_prefs}
          placeholder="Select beverages..."
        />

        <Select
          label="Coffee Style"
          value={value.food_and_drink?.coffee_style ?? ''}
          onChange={(v) => updateCategory('food_and_drink', { coffee_style: v })}
          options={formatOptions(OPTIONS.coffee_style)}
          placeholder="Select coffee style..."
        />

        <Select
          label="Tea Style"
          value={value.food_and_drink?.tea_style ?? ''}
          onChange={(v) => updateCategory('food_and_drink', { tea_style: v })}
          options={formatOptions(OPTIONS.tea_style)}
          placeholder="Select tea style..."
        />

        <ChipInput
          label="Spirits"
          value={value.food_and_drink?.spirits ?? []}
          onChange={(v) => updateCategory('food_and_drink', { spirits: v })}
          options={OPTIONS.spirits}
          placeholder="Select spirits..."
        />

        <ChipInput
          label="Dietary Preferences"
          value={value.food_and_drink?.dietary ?? []}
          onChange={(v) => updateCategory('food_and_drink', { dietary: v })}
          options={OPTIONS.dietary}
          placeholder="Select dietary preferences..."
        />

        <ChipInput
          label="Favorite Cuisines"
          value={value.food_and_drink?.favorite_cuisines ?? []}
          onChange={(v) => updateCategory('food_and_drink', { favorite_cuisines: v })}
          options={OPTIONS.cuisines}
          placeholder="Add cuisines..."
        />

        <Select
          label="Sweet vs Savory"
          value={value.food_and_drink?.sweet_vs_savory ?? ''}
          onChange={(v) => updateCategory('food_and_drink', { sweet_vs_savory: v })}
          options={formatOptions(OPTIONS.sweet_savory)}
          placeholder="Select preference..."
        />

        <Textarea
          label="Favorite Treats"
          value={value.food_and_drink?.favorite_treats ?? ''}
          onChange={(e) => updateCategory('food_and_drink', { favorite_treats: e.target.value })}
          placeholder="Describe favorite treats or snacks..."
          rows={3}
        />
      </Section>

      {/* Style & Accessories */}
      <Section title="Style & Accessories" icon={Palette}>
        <ChipInput
          label="Preferred Colors"
          value={value.style_and_accessories?.preferred_colors ?? []}
          onChange={(v) => updateCategory('style_and_accessories', { preferred_colors: v })}
          placeholder="Add colors..."
        />

        <ChipInput
          label="Avoid Colors"
          value={value.style_and_accessories?.avoid_colors ?? []}
          onChange={(v) => updateCategory('style_and_accessories', { avoid_colors: v })}
          placeholder="Add colors to avoid..."
        />

        <ChipInput
          label="Preferred Metals"
          value={value.style_and_accessories?.preferred_metals ?? []}
          onChange={(v) => updateCategory('style_and_accessories', { preferred_metals: v })}
          options={OPTIONS.preferred_metals}
          placeholder="Select metals..."
        />

        <ChipInput
          label="Fragrance Notes"
          value={value.style_and_accessories?.fragrance_notes ?? []}
          onChange={(v) => updateCategory('style_and_accessories', { fragrance_notes: v })}
          options={OPTIONS.fragrance_notes}
          placeholder="Select fragrance notes..."
        />

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-warm-800 uppercase tracking-wide">
            Jewelry Sizes
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Ring"
              value={value.style_and_accessories?.jewelry_sizes?.ring ?? ''}
              onChange={(e) =>
                updateCategory('style_and_accessories', {
                  jewelry_sizes: {
                    ...value.style_and_accessories?.jewelry_sizes,
                    ring: e.target.value,
                  },
                })
              }
              placeholder="e.g. 7"
            />
            <Input
              label="Bracelet"
              value={value.style_and_accessories?.jewelry_sizes?.bracelet ?? ''}
              onChange={(e) =>
                updateCategory('style_and_accessories', {
                  jewelry_sizes: {
                    ...value.style_and_accessories?.jewelry_sizes,
                    bracelet: e.target.value,
                  },
                })
              }
              placeholder="e.g. 7in"
            />
            <Input
              label="Necklace"
              value={value.style_and_accessories?.jewelry_sizes?.necklace ?? ''}
              onChange={(e) =>
                updateCategory('style_and_accessories', {
                  jewelry_sizes: {
                    ...value.style_and_accessories?.jewelry_sizes,
                    necklace: e.target.value,
                  },
                })
              }
              placeholder="e.g. 18in"
            />
          </div>
        </div>

        <ChipInput
          label="Accessory Preferences"
          value={value.style_and_accessories?.accessory_prefs ?? []}
          onChange={(v) => updateCategory('style_and_accessories', { accessory_prefs: v })}
          options={OPTIONS.accessory_prefs}
          placeholder="Select accessories..."
        />

        <Textarea
          label="Style Notes"
          value={value.style_and_accessories?.style_notes ?? ''}
          onChange={(e) =>
            updateCategory('style_and_accessories', { style_notes: e.target.value })
          }
          placeholder="Additional style notes or preferences..."
          rows={3}
        />
      </Section>

      {/* Hobbies & Media */}
      <Section title="Hobbies & Media" icon={Gamepad2}>
        <ChipInput
          label="Hobbies"
          value={value.hobbies_and_media?.hobbies ?? []}
          onChange={(v) => updateCategory('hobbies_and_media', { hobbies: v })}
          options={OPTIONS.hobbies}
          placeholder="Select hobbies..."
        />

        <ChipInput
          label="Creative Outlets"
          value={value.hobbies_and_media?.creative_outlets ?? []}
          onChange={(v) => updateCategory('hobbies_and_media', { creative_outlets: v })}
          options={OPTIONS.creative_outlets}
          placeholder="Select creative outlets..."
        />

        <ChipInput
          label="Sports Played"
          value={value.hobbies_and_media?.sports_played ?? []}
          onChange={(v) => updateCategory('hobbies_and_media', { sports_played: v })}
          options={OPTIONS.sports_played}
          placeholder="Select sports..."
        />

        <ChipInput
          label="Sports Teams"
          value={value.hobbies_and_media?.sports_teams ?? []}
          onChange={(v) => updateCategory('hobbies_and_media', { sports_teams: v })}
          placeholder="Add favorite sports teams..."
        />

        <ChipInput
          label="Reading Genres"
          value={value.hobbies_and_media?.reading_genres ?? []}
          onChange={(v) => updateCategory('hobbies_and_media', { reading_genres: v })}
          options={OPTIONS.reading_genres}
          placeholder="Select genres..."
        />

        <ChipInput
          label="Music Genres"
          value={value.hobbies_and_media?.music_genres ?? []}
          onChange={(v) => updateCategory('hobbies_and_media', { music_genres: v })}
          options={OPTIONS.music_genres}
          placeholder="Select genres..."
        />

        <ChipInput
          label="Favorite Authors"
          value={value.hobbies_and_media?.favorite_authors ?? []}
          onChange={(v) => updateCategory('hobbies_and_media', { favorite_authors: v })}
          placeholder="Add authors..."
        />

        <ChipInput
          label="Favorite Artists"
          value={value.hobbies_and_media?.favorite_artists ?? []}
          onChange={(v) => updateCategory('hobbies_and_media', { favorite_artists: v })}
          placeholder="Add artists..."
        />

        <ChipInput
          label="Board Games"
          value={value.hobbies_and_media?.board_games ?? []}
          onChange={(v) => updateCategory('hobbies_and_media', { board_games: v })}
          placeholder="Add board games..."
        />

        <ChipInput
          label="Fandoms / Series"
          value={value.hobbies_and_media?.fandoms_or_series ?? []}
          onChange={(v) => updateCategory('hobbies_and_media', { fandoms_or_series: v })}
          placeholder="Add fandoms or series..."
        />
      </Section>

      {/* Tech, Travel & Experiences */}
      <Section title="Tech, Travel & Experiences" icon={Plane}>
        <ChipInput
          label="Tech Ecosystem"
          value={value.tech_travel_experiences?.tech_ecosystem ?? []}
          onChange={(v) => updateCategory('tech_travel_experiences', { tech_ecosystem: v })}
          options={OPTIONS.tech_ecosystem}
          placeholder="Select ecosystems..."
        />

        <ChipInput
          label="Gaming Platforms"
          value={value.tech_travel_experiences?.gaming_platforms ?? []}
          onChange={(v) => updateCategory('tech_travel_experiences', { gaming_platforms: v })}
          options={OPTIONS.gaming_platforms}
          placeholder="Select platforms..."
        />

        <ChipInput
          label="Smart Home"
          value={value.tech_travel_experiences?.smart_home ?? []}
          onChange={(v) => updateCategory('tech_travel_experiences', { smart_home: v })}
          options={OPTIONS.smart_home}
          placeholder="Select smart home..."
        />

        <ChipInput
          label="Travel Styles"
          value={value.tech_travel_experiences?.travel_styles ?? []}
          onChange={(v) => updateCategory('tech_travel_experiences', { travel_styles: v })}
          options={OPTIONS.travel_styles}
          placeholder="Select travel styles..."
        />

        <ChipInput
          label="Dream Destinations"
          value={value.tech_travel_experiences?.dream_destinations ?? []}
          onChange={(v) => updateCategory('tech_travel_experiences', { dream_destinations: v })}
          placeholder="Add destinations..."
        />

        <ChipInput
          label="Experience Types"
          value={value.tech_travel_experiences?.experience_types ?? []}
          onChange={(v) => updateCategory('tech_travel_experiences', { experience_types: v })}
          options={OPTIONS.experience_types}
          placeholder="Select experiences..."
        />

        <ChipInput
          label="Event Preferences"
          value={value.tech_travel_experiences?.event_preferences ?? []}
          onChange={(v) => updateCategory('tech_travel_experiences', { event_preferences: v })}
          options={OPTIONS.event_preferences}
          placeholder="Select event times..."
        />
      </Section>

      {/* Gift Preferences */}
      <Section title="Gift Preferences" icon={Gift}>
        <Switch
          checked={value.gift_preferences?.gift_card_ok ?? false}
          onCheckedChange={(checked) =>
            updateCategory('gift_preferences', { gift_card_ok: checked })
          }
          label="Gift Cards OK"
        />

        <Switch
          checked={value.gift_preferences?.likes_personalized ?? false}
          onCheckedChange={(checked) =>
            updateCategory('gift_preferences', { likes_personalized: checked })
          }
          label="Likes Personalized Gifts"
        />

        <Select
          label="Budget Comfort"
          value={value.gift_preferences?.budget_comfort ?? ''}
          onChange={(v) => updateCategory('gift_preferences', { budget_comfort: v })}
          options={formatOptions(OPTIONS.budget_comfort)}
          placeholder="Select budget preference..."
        />

        <ChipInput
          label="Collects"
          value={value.gift_preferences?.collects ?? []}
          onChange={(v) => updateCategory('gift_preferences', { collects: v })}
          options={OPTIONS.collects}
          placeholder="Select collectibles..."
        />

        <ChipInput
          label="Avoid Categories"
          value={value.gift_preferences?.avoid_categories ?? []}
          onChange={(v) => updateCategory('gift_preferences', { avoid_categories: v })}
          options={OPTIONS.avoid_categories}
          placeholder="Select categories to avoid..."
        />

        <Textarea
          label="Gift Preference Notes"
          value={value.gift_preferences?.notes ?? ''}
          onChange={(e) => updateCategory('gift_preferences', { notes: e.target.value })}
          placeholder="Additional notes about gift preferences..."
          rows={3}
        />
      </Section>
    </div>
  );
}
