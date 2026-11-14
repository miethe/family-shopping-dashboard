/**
 * AdvancedInterestsView Component Tests
 *
 * Tests the read-only advanced interests view component
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AdvancedInterestsView } from '../AdvancedInterestsView';
import type { AdvancedInterests } from '@/types';

describe('AdvancedInterestsView', () => {
  it('renders empty state when no data provided', () => {
    render(<AdvancedInterestsView data={null} />);
    expect(screen.getByText(/no advanced interests recorded/i)).toBeInTheDocument();
  });

  it('renders empty state when data is undefined', () => {
    render(<AdvancedInterestsView data={undefined} />);
    expect(screen.getByText(/no advanced interests recorded/i)).toBeInTheDocument();
  });

  it('renders empty state when data is empty object', () => {
    render(<AdvancedInterestsView data={{}} />);
    expect(screen.getByText(/no advanced interests recorded/i)).toBeInTheDocument();
  });

  it('renders only populated categories', () => {
    const data: AdvancedInterests = {
      food_and_drink: {
        likes_wine: true,
        wine_types: ['red', 'white'],
      },
      // Other categories undefined/null
    };

    render(<AdvancedInterestsView data={data} />);

    // Should show Food & Drink section
    expect(screen.getByText('Food & Drink')).toBeInTheDocument();
    expect(screen.getByText(/Likes Wine/i)).toBeInTheDocument();

    // Should NOT show other sections
    expect(screen.queryByText('Style & Accessories')).not.toBeInTheDocument();
    expect(screen.queryByText('Hobbies & Media')).not.toBeInTheDocument();
    expect(screen.queryByText('Tech, Travel & Experiences')).not.toBeInTheDocument();
    expect(screen.queryByText('Gift Preferences')).not.toBeInTheDocument();
  });

  it('shows chip overflow for lists with more than 5 items', () => {
    const data: AdvancedInterests = {
      hobbies_and_media: {
        hobbies: [
          'cooking',
          'baking',
          'gardening',
          'photography',
          'painting_drawing',
          'crafts',
          'fitness',
        ],
      },
    };

    render(<AdvancedInterestsView data={data} />);

    // Should show +2 more (7 items, 5 visible)
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('renders boolean pills correctly with checkmarks', () => {
    const data: AdvancedInterests = {
      gift_preferences: {
        gift_card_ok: true,
        likes_personalized: false,
      },
    };

    render(<AdvancedInterestsView data={data} />);

    // Check for the text content (the ✓ and ✗ are in the same element)
    expect(screen.getByText(/Gift Cards OK/)).toBeInTheDocument();
    expect(screen.getByText(/Likes Personalized/)).toBeInTheDocument();
  });

  it('renders jewelry sizes correctly', () => {
    const data: AdvancedInterests = {
      style_and_accessories: {
        jewelry_sizes: {
          ring: '7',
          bracelet: '6.5',
        },
      },
    };

    render(<AdvancedInterestsView data={data} />);

    expect(screen.getByText('Ring: 7')).toBeInTheDocument();
    expect(screen.getByText('Bracelet: 6.5')).toBeInTheDocument();
  });

  it('renders all jewelry size types when provided', () => {
    const data: AdvancedInterests = {
      style_and_accessories: {
        jewelry_sizes: {
          ring: '7',
          bracelet: '6.5',
          necklace: '18in',
        },
      },
    };

    render(<AdvancedInterestsView data={data} />);

    expect(screen.getByText('Ring: 7')).toBeInTheDocument();
    expect(screen.getByText('Bracelet: 6.5')).toBeInTheDocument();
    expect(screen.getByText('Necklace: 18in')).toBeInTheDocument();
  });

  it('renders multiple categories when populated', () => {
    const data: AdvancedInterests = {
      food_and_drink: {
        likes_wine: true,
        wine_types: ['red'],
      },
      gift_preferences: {
        gift_card_ok: true,
      },
    };

    render(<AdvancedInterestsView data={data} />);

    expect(screen.getByText('Food & Drink')).toBeInTheDocument();
    expect(screen.getByText('Gift Preferences')).toBeInTheDocument();
  });

  it('renders wine types as chips', () => {
    const data: AdvancedInterests = {
      food_and_drink: {
        likes_wine: true,
        wine_types: ['red', 'white', 'rose'],
      },
    };

    render(<AdvancedInterestsView data={data} />);

    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('White')).toBeInTheDocument();
    expect(screen.getByText('Rose')).toBeInTheDocument();
  });

  it('renders text fields correctly', () => {
    const data: AdvancedInterests = {
      food_and_drink: {
        favorite_treats: 'Dark chocolate and macarons',
      },
      style_and_accessories: {
        style_notes: 'Prefers minimalist designs',
      },
    };

    render(<AdvancedInterestsView data={data} />);

    expect(screen.getByText('Dark chocolate and macarons')).toBeInTheDocument();
    expect(screen.getByText('Prefers minimalist designs')).toBeInTheDocument();
  });

  it('renders single-select fields correctly', () => {
    const data: AdvancedInterests = {
      food_and_drink: {
        coffee_style: 'espresso_latte',
        tea_style: 'herbal',
        sweet_vs_savory: 'sweet',
      },
    };

    render(<AdvancedInterestsView data={data} />);

    expect(screen.getByText('Espresso Latte')).toBeInTheDocument();
    expect(screen.getByText('Herbal')).toBeInTheDocument();
    expect(screen.getByText('Sweet')).toBeInTheDocument();
  });

  it('renders budget comfort level', () => {
    const data: AdvancedInterests = {
      gift_preferences: {
        budget_comfort: 'mid',
      },
    };

    render(<AdvancedInterestsView data={data} />);

    expect(screen.getByText('mid')).toBeInTheDocument();
  });

  it('does not render empty categories even if object exists', () => {
    const data: AdvancedInterests = {
      food_and_drink: {
        // All fields undefined/empty
      },
      gift_preferences: {
        gift_card_ok: true, // This one has data
      },
    };

    render(<AdvancedInterestsView data={data} />);

    // Should NOT show Food & Drink (no actual data)
    expect(screen.queryByText('Food & Drink')).not.toBeInTheDocument();

    // Should show Gift Preferences (has data)
    expect(screen.getByText('Gift Preferences')).toBeInTheDocument();
  });

  it('handles sparse data across multiple categories', () => {
    const data: AdvancedInterests = {
      food_and_drink: {
        likes_wine: true,
      },
      hobbies_and_media: {
        hobbies: ['cooking'],
      },
      tech_travel_experiences: {
        tech_ecosystem: ['apple'],
      },
    };

    render(<AdvancedInterestsView data={data} />);

    expect(screen.getByText('Food & Drink')).toBeInTheDocument();
    expect(screen.getByText('Hobbies & Media')).toBeInTheDocument();
    expect(screen.getByText('Tech, Travel & Experiences')).toBeInTheDocument();

    // Should NOT show categories without data
    expect(screen.queryByText('Style & Accessories')).not.toBeInTheDocument();
    expect(screen.queryByText('Gift Preferences')).not.toBeInTheDocument();
  });
});
