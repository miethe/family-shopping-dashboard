'use client';

import { useMemo } from 'react';
import { FieldsList } from './FieldsList';

/**
 * Field configuration for each entity
 */
interface FieldConfig {
  name: string;
  label: string;
  category: string;
}

/**
 * Known fields for each entity type
 * These match the field_options table structure
 */
const ENTITY_FIELDS: Record<string, FieldConfig[]> = {
  person: [
    // Food & Drink
    { name: 'wine_types', label: 'Wine Types', category: 'Food & Drink' },
    { name: 'beverage_prefs', label: 'Beverage Preferences', category: 'Food & Drink' },
    { name: 'coffee_style', label: 'Coffee Style', category: 'Food & Drink' },
    { name: 'tea_style', label: 'Tea Style', category: 'Food & Drink' },
    { name: 'spirits', label: 'Spirits', category: 'Food & Drink' },
    { name: 'dietary', label: 'Dietary Restrictions', category: 'Food & Drink' },
    { name: 'favorite_cuisines', label: 'Favorite Cuisines', category: 'Food & Drink' },
    { name: 'sweet_vs_savory', label: 'Sweet vs Savory', category: 'Food & Drink' },
    // Style & Accessories
    { name: 'preferred_metals', label: 'Preferred Metals', category: 'Style & Accessories' },
    { name: 'fragrance_notes', label: 'Fragrance Notes', category: 'Style & Accessories' },
    { name: 'accessory_prefs', label: 'Accessory Preferences', category: 'Style & Accessories' },
    // Hobbies & Interests
    { name: 'hobbies', label: 'Hobbies', category: 'Hobbies & Interests' },
    { name: 'creative_outlets', label: 'Creative Outlets', category: 'Hobbies & Interests' },
    { name: 'sports_played', label: 'Sports', category: 'Hobbies & Interests' },
    { name: 'reading_genres', label: 'Reading Genres', category: 'Hobbies & Interests' },
    { name: 'music_genres', label: 'Music Genres', category: 'Hobbies & Interests' },
    // Technology
    { name: 'tech_ecosystem', label: 'Tech Ecosystem', category: 'Technology' },
    { name: 'gaming_platforms', label: 'Gaming Platforms', category: 'Technology' },
    { name: 'smart_home', label: 'Smart Home', category: 'Technology' },
    // Travel & Experiences
    { name: 'travel_styles', label: 'Travel Styles', category: 'Travel & Experiences' },
    { name: 'experience_types', label: 'Experience Types', category: 'Travel & Experiences' },
    { name: 'event_preferences', label: 'Event Preferences', category: 'Travel & Experiences' },
    // Gift Preferences
    { name: 'collects', label: 'Collections', category: 'Gift Preferences' },
    { name: 'avoid_categories', label: 'Avoid Categories', category: 'Gift Preferences' },
    { name: 'budget_comfort', label: 'Budget Comfort', category: 'Gift Preferences' },
  ],
  gift: [
    { name: 'priority', label: 'Priority', category: 'Classification' },
    { name: 'status', label: 'Status', category: 'Lifecycle' },
  ],
  occasion: [
    { name: 'type', label: 'Occasion Type', category: 'Classification' },
  ],
  list: [
    { name: 'type', label: 'List Type', category: 'Classification' },
    { name: 'visibility', label: 'Visibility', category: 'Sharing' },
  ],
};

interface EntityTabProps {
  entity: 'person' | 'gift' | 'occasion' | 'list';
}

/**
 * EntityTab displays all fields for a given entity type
 * Organizes fields by category with expandable sections
 */
export function EntityTab({ entity }: EntityTabProps) {
  const fields = useMemo(() => ENTITY_FIELDS[entity] || [], [entity]);

  if (fields.length === 0) {
    return (
      <div className="text-warm-500 p-4">
        No fields configured for this entity.
      </div>
    );
  }

  return <FieldsList entity={entity} fields={fields} />;
}
