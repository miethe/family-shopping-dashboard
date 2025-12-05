/**
 * AdvancedInterestsView Component
 *
 * View-only display of person's advanced interests organized by category.
 * Only renders categories that have populated data.
 */

'use client';

import type { AdvancedInterests } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Utensils,
  Palette,
  Gamepad2,
  Plane,
  Gift,
} from '@/components/ui/icons';

interface AdvancedInterestsViewProps {
  data: AdvancedInterests | null | undefined;
}

// Helper to format slug values to display labels
function formatLabel(slug: string): string {
  return slug.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

// Chip list with "+N more" overflow after 5 items
function ChipList({ items, maxVisible = 5 }: { items: string[]; maxVisible?: number }) {
  const visible = items.slice(0, maxVisible);
  const overflow = items.length - maxVisible;

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((item, i) => (
        <Badge key={i} variant="default" className="text-xs px-2 py-1">
          {formatLabel(item)}
        </Badge>
      ))}
      {overflow > 0 && (
        <Badge variant="primary" className="text-xs px-2 py-1">
          +{overflow} more
        </Badge>
      )}
    </div>
  );
}

// Boolean pill
function BoolPill({ value, label }: { value: boolean | undefined; label: string }) {
  if (value === undefined) return null;
  return (
    <Badge variant={value ? 'success' : 'default'} className="text-xs px-2 py-1">
      {value ? '✓' : '✗'} {label}
    </Badge>
  );
}

// Category card wrapper
function CategoryCard({
  title,
  icon: Icon,
  children,
  isEmpty,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  isEmpty?: boolean;
}) {
  if (isEmpty) return null;

  return (
    <Card variant="default" padding="sm" className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5 text-primary-500" />
        <h4 className="font-semibold text-warm-900">{title}</h4>
      </div>
      <div className="space-y-3">{children}</div>
    </Card>
  );
}

// Field row component
function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-xs font-medium text-warm-600 uppercase tracking-wide">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export function AdvancedInterestsView({ data }: AdvancedInterestsViewProps) {
  if (!data) {
    return (
      <div className="text-center py-8 text-warm-500">
        <p>No advanced interests recorded yet.</p>
        <p className="text-sm mt-1">Edit this person to add detailed preferences.</p>
      </div>
    );
  }

  const {
    food_and_drink,
    style_and_accessories,
    hobbies_and_media,
    tech_travel_experiences,
    gift_preferences,
  } = data;

  // Check if all categories are empty
  const hasData =
    food_and_drink ||
    style_and_accessories ||
    hobbies_and_media ||
    tech_travel_experiences ||
    gift_preferences;

  if (!hasData) {
    return (
      <div className="text-center py-8 text-warm-500">
        <p>No advanced interests recorded yet.</p>
        <p className="text-sm mt-1">Edit this person to add detailed preferences.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Food & Drink */}
      {food_and_drink && (
        <CategoryCard
          title="Food & Drink"
          icon={Utensils}
          isEmpty={
            !Object.values(food_and_drink).some(
              (v) =>
                v !== undefined &&
                v !== null &&
                (Array.isArray(v) ? v.length > 0 : true)
            )
          }
        >
          {food_and_drink.likes_wine !== undefined && (
            <BoolPill value={food_and_drink.likes_wine} label="Likes Wine" />
          )}
          {food_and_drink.wine_types && food_and_drink.wine_types.length > 0 && (
            <FieldRow label="Wine Types">
              <ChipList items={food_and_drink.wine_types} />
            </FieldRow>
          )}
          {food_and_drink.beverage_prefs &&
            food_and_drink.beverage_prefs.length > 0 && (
              <FieldRow label="Beverage Preferences">
                <ChipList items={food_and_drink.beverage_prefs} />
              </FieldRow>
            )}
          {food_and_drink.coffee_style && (
            <FieldRow label="Coffee Style">
              <span className="text-warm-800">{formatLabel(food_and_drink.coffee_style)}</span>
            </FieldRow>
          )}
          {food_and_drink.tea_style && (
            <FieldRow label="Tea Style">
              <span className="text-warm-800">{formatLabel(food_and_drink.tea_style)}</span>
            </FieldRow>
          )}
          {food_and_drink.spirits && food_and_drink.spirits.length > 0 && (
            <FieldRow label="Spirits">
              <ChipList items={food_and_drink.spirits} />
            </FieldRow>
          )}
          {food_and_drink.dietary && food_and_drink.dietary.length > 0 && (
            <FieldRow label="Dietary">
              <ChipList items={food_and_drink.dietary} />
            </FieldRow>
          )}
          {food_and_drink.favorite_cuisines &&
            food_and_drink.favorite_cuisines.length > 0 && (
              <FieldRow label="Favorite Cuisines">
                <ChipList items={food_and_drink.favorite_cuisines} />
              </FieldRow>
            )}
          {food_and_drink.sweet_vs_savory && (
            <FieldRow label="Sweet vs Savory">
              <span className="text-warm-800">
                {formatLabel(food_and_drink.sweet_vs_savory)}
              </span>
            </FieldRow>
          )}
          {food_and_drink.favorite_treats && (
            <FieldRow label="Favorite Treats">
              <p className="text-warm-800 text-sm">{food_and_drink.favorite_treats}</p>
            </FieldRow>
          )}
        </CategoryCard>
      )}

      {/* Style & Accessories */}
      {style_and_accessories && (
        <CategoryCard
          title="Style & Accessories"
          icon={Palette}
          isEmpty={
            !Object.values(style_and_accessories).some((v) =>
              v !== undefined &&
              v !== null &&
              (Array.isArray(v)
                ? v.length > 0
                : typeof v === 'object'
                  ? Object.values(v).some(Boolean)
                  : true)
            )
          }
        >
          {style_and_accessories.preferred_colors &&
            style_and_accessories.preferred_colors.length > 0 && (
              <FieldRow label="Preferred Colors">
                <ChipList items={style_and_accessories.preferred_colors} />
              </FieldRow>
            )}
          {style_and_accessories.avoid_colors &&
            style_and_accessories.avoid_colors.length > 0 && (
              <FieldRow label="Avoid Colors">
                <ChipList items={style_and_accessories.avoid_colors} />
              </FieldRow>
            )}
          {style_and_accessories.preferred_metals &&
            style_and_accessories.preferred_metals.length > 0 && (
              <FieldRow label="Preferred Metals">
                <ChipList items={style_and_accessories.preferred_metals} />
              </FieldRow>
            )}
          {style_and_accessories.fragrance_notes &&
            style_and_accessories.fragrance_notes.length > 0 && (
              <FieldRow label="Fragrance Notes">
                <ChipList items={style_and_accessories.fragrance_notes} />
              </FieldRow>
            )}
          {style_and_accessories.jewelry_sizes &&
            Object.values(style_and_accessories.jewelry_sizes).some(Boolean) && (
              <FieldRow label="Jewelry Sizes">
                <div className="flex flex-wrap gap-2">
                  {style_and_accessories.jewelry_sizes.ring && (
                    <Badge variant="default" className="text-xs">
                      Ring: {style_and_accessories.jewelry_sizes.ring}
                    </Badge>
                  )}
                  {style_and_accessories.jewelry_sizes.bracelet && (
                    <Badge variant="default" className="text-xs">
                      Bracelet: {style_and_accessories.jewelry_sizes.bracelet}
                    </Badge>
                  )}
                  {style_and_accessories.jewelry_sizes.necklace && (
                    <Badge variant="default" className="text-xs">
                      Necklace: {style_and_accessories.jewelry_sizes.necklace}
                    </Badge>
                  )}
                </div>
              </FieldRow>
            )}
          {style_and_accessories.accessory_prefs &&
            style_and_accessories.accessory_prefs.length > 0 && (
              <FieldRow label="Accessory Preferences">
                <ChipList items={style_and_accessories.accessory_prefs} />
              </FieldRow>
            )}
          {style_and_accessories.style_notes && (
            <FieldRow label="Style Notes">
              <p className="text-warm-800 text-sm">{style_and_accessories.style_notes}</p>
            </FieldRow>
          )}
        </CategoryCard>
      )}

      {/* Hobbies & Media */}
      {hobbies_and_media && (
        <CategoryCard
          title="Hobbies & Media"
          icon={Gamepad2}
          isEmpty={!Object.values(hobbies_and_media).some((v) => Array.isArray(v) && v.length > 0)}
        >
          {hobbies_and_media.hobbies && hobbies_and_media.hobbies.length > 0 && (
            <FieldRow label="Hobbies">
              <ChipList items={hobbies_and_media.hobbies} />
            </FieldRow>
          )}
          {hobbies_and_media.creative_outlets &&
            hobbies_and_media.creative_outlets.length > 0 && (
              <FieldRow label="Creative Outlets">
                <ChipList items={hobbies_and_media.creative_outlets} />
              </FieldRow>
            )}
          {hobbies_and_media.sports_played &&
            hobbies_and_media.sports_played.length > 0 && (
              <FieldRow label="Sports Played">
                <ChipList items={hobbies_and_media.sports_played} />
              </FieldRow>
            )}
          {hobbies_and_media.sports_teams && hobbies_and_media.sports_teams.length > 0 && (
            <FieldRow label="Sports Teams">
              <ChipList items={hobbies_and_media.sports_teams} />
            </FieldRow>
          )}
          {hobbies_and_media.reading_genres &&
            hobbies_and_media.reading_genres.length > 0 && (
              <FieldRow label="Reading Genres">
                <ChipList items={hobbies_and_media.reading_genres} />
              </FieldRow>
            )}
          {hobbies_and_media.music_genres && hobbies_and_media.music_genres.length > 0 && (
            <FieldRow label="Music Genres">
              <ChipList items={hobbies_and_media.music_genres} />
            </FieldRow>
          )}
          {hobbies_and_media.favorite_authors &&
            hobbies_and_media.favorite_authors.length > 0 && (
              <FieldRow label="Favorite Authors">
                <ChipList items={hobbies_and_media.favorite_authors} />
              </FieldRow>
            )}
          {hobbies_and_media.favorite_artists &&
            hobbies_and_media.favorite_artists.length > 0 && (
              <FieldRow label="Favorite Artists">
                <ChipList items={hobbies_and_media.favorite_artists} />
              </FieldRow>
            )}
          {hobbies_and_media.board_games && hobbies_and_media.board_games.length > 0 && (
            <FieldRow label="Board Games">
              <ChipList items={hobbies_and_media.board_games} />
            </FieldRow>
          )}
          {hobbies_and_media.fandoms_or_series &&
            hobbies_and_media.fandoms_or_series.length > 0 && (
              <FieldRow label="Fandoms / Series">
                <ChipList items={hobbies_and_media.fandoms_or_series} />
              </FieldRow>
            )}
        </CategoryCard>
      )}

      {/* Tech, Travel & Experiences */}
      {tech_travel_experiences && (
        <CategoryCard
          title="Tech, Travel & Experiences"
          icon={Plane}
          isEmpty={
            !Object.values(tech_travel_experiences).some(
              (v) => Array.isArray(v) && v.length > 0
            )
          }
        >
          {tech_travel_experiences.tech_ecosystem &&
            tech_travel_experiences.tech_ecosystem.length > 0 && (
              <FieldRow label="Tech Ecosystem">
                <ChipList items={tech_travel_experiences.tech_ecosystem} />
              </FieldRow>
            )}
          {tech_travel_experiences.gaming_platforms &&
            tech_travel_experiences.gaming_platforms.length > 0 && (
              <FieldRow label="Gaming Platforms">
                <ChipList items={tech_travel_experiences.gaming_platforms} />
              </FieldRow>
            )}
          {tech_travel_experiences.smart_home &&
            tech_travel_experiences.smart_home.length > 0 && (
              <FieldRow label="Smart Home">
                <ChipList items={tech_travel_experiences.smart_home} />
              </FieldRow>
            )}
          {tech_travel_experiences.travel_styles &&
            tech_travel_experiences.travel_styles.length > 0 && (
              <FieldRow label="Travel Styles">
                <ChipList items={tech_travel_experiences.travel_styles} />
              </FieldRow>
            )}
          {tech_travel_experiences.dream_destinations &&
            tech_travel_experiences.dream_destinations.length > 0 && (
              <FieldRow label="Dream Destinations">
                <ChipList items={tech_travel_experiences.dream_destinations} />
              </FieldRow>
            )}
          {tech_travel_experiences.experience_types &&
            tech_travel_experiences.experience_types.length > 0 && (
              <FieldRow label="Experience Types">
                <ChipList items={tech_travel_experiences.experience_types} />
              </FieldRow>
            )}
          {tech_travel_experiences.event_preferences &&
            tech_travel_experiences.event_preferences.length > 0 && (
              <FieldRow label="Event Preferences">
                <ChipList items={tech_travel_experiences.event_preferences} />
              </FieldRow>
            )}
        </CategoryCard>
      )}

      {/* Gift Preferences */}
      {gift_preferences && (
        <CategoryCard
          title="Gift Preferences"
          icon={Gift}
          isEmpty={
            !Object.values(gift_preferences).some(
              (v) =>
                v !== undefined &&
                v !== null &&
                (Array.isArray(v) ? v.length > 0 : true)
            )
          }
        >
          <div className="flex flex-wrap gap-2">
            <BoolPill value={gift_preferences.gift_card_ok} label="Gift Cards OK" />
            <BoolPill value={gift_preferences.likes_personalized} label="Likes Personalized" />
          </div>
          {gift_preferences.budget_comfort && (
            <FieldRow label="Budget Comfort">
              <Badge variant="default" className="text-xs capitalize">
                {gift_preferences.budget_comfort}
              </Badge>
            </FieldRow>
          )}
          {gift_preferences.collects && gift_preferences.collects.length > 0 && (
            <FieldRow label="Collects">
              <ChipList items={gift_preferences.collects} />
            </FieldRow>
          )}
          {gift_preferences.avoid_categories &&
            gift_preferences.avoid_categories.length > 0 && (
              <FieldRow label="Avoid Categories">
                <ChipList items={gift_preferences.avoid_categories} />
              </FieldRow>
            )}
          {gift_preferences.notes && (
            <FieldRow label="Notes">
              <p className="text-warm-800 text-sm">{gift_preferences.notes}</p>
            </FieldRow>
          )}
        </CategoryCard>
      )}
    </div>
  );
}
