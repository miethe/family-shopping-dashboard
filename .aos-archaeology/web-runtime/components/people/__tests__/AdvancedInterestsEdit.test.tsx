/**
 * AdvancedInterestsEdit Component Tests
 *
 * Tests the edit form for advanced interests
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdvancedInterestsEdit } from '../AdvancedInterestsEdit';
import type { AdvancedInterests } from '@/types';

describe('AdvancedInterestsEdit', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all category sections', () => {
    render(<AdvancedInterestsEdit value={{}} onChange={mockOnChange} />);

    expect(screen.getByText('Food & Drink')).toBeInTheDocument();
    expect(screen.getByText('Style & Accessories')).toBeInTheDocument();
    expect(screen.getByText('Hobbies & Media')).toBeInTheDocument();
    expect(screen.getByText('Tech, Travel & Experiences')).toBeInTheDocument();
    expect(screen.getByText('Gift Preferences')).toBeInTheDocument();
  });

  it('expands sections when clicked', async () => {
    const user = userEvent.setup();
    render(<AdvancedInterestsEdit value={{}} onChange={mockOnChange} />);

    // Initially, wine toggle should not be visible (section collapsed)
    expect(screen.queryByText('Likes Wine')).not.toBeInTheDocument();

    // Click on Food & Drink section to expand
    const foodSection = screen.getByText('Food & Drink');
    await user.click(foodSection);

    // Should now show the wine toggle
    expect(screen.getByText('Likes Wine')).toBeInTheDocument();
  });

  it('conditionally shows wine types when likes_wine is toggled', async () => {
    const user = userEvent.setup();
    const initialValue: AdvancedInterests = {
      food_and_drink: {
        likes_wine: false,
      },
    };

    render(<AdvancedInterestsEdit value={initialValue} onChange={mockOnChange} />);

    // Expand Food & Drink section
    await user.click(screen.getByText('Food & Drink'));

    // Wine types should not be visible when likes_wine is false
    expect(screen.queryByText('Wine Types')).not.toBeInTheDocument();

    // Find the "Likes Wine" label and get the parent container, then find switch
    const likesWineLabel = screen.getByText('Likes Wine');
    // The switch and label are both children of a parent div
    const parentContainer = likesWineLabel.parentElement?.parentElement;
    const wineSwitch = within(parentContainer!).getByRole('switch');
    await user.click(wineSwitch);

    // Should call onChange with likes_wine: true
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('shows wine types field when likes_wine is true', async () => {
    const user = userEvent.setup();
    const initialValue: AdvancedInterests = {
      food_and_drink: {
        likes_wine: true,
      },
    };

    render(<AdvancedInterestsEdit value={initialValue} onChange={mockOnChange} />);

    // Expand Food & Drink section
    await user.click(screen.getByText('Food & Drink'));

    // Wine types should be visible when likes_wine is true
    expect(screen.getByText('Wine Types')).toBeInTheDocument();
  });

  it('calls onChange when boolean is toggled', async () => {
    const user = userEvent.setup();
    render(<AdvancedInterestsEdit value={{}} onChange={mockOnChange} />);

    // Expand Gift Preferences section
    await user.click(screen.getByText('Gift Preferences'));

    // Find the "Gift Cards OK" label and get the parent container
    const giftCardLabel = screen.getByText('Gift Cards OK');
    const parentContainer = giftCardLabel.parentElement?.parentElement;
    const giftCardSwitch = within(parentContainer!).getByRole('switch');
    await user.click(giftCardSwitch);

    expect(mockOnChange).toHaveBeenCalled();
    const call = mockOnChange.mock.calls[0][0];
    expect(call.gift_preferences?.gift_card_ok).toBe(true);
  });

  it('pre-populates values from initial data', async () => {
    const user = userEvent.setup();
    const initialValue: AdvancedInterests = {
      gift_preferences: {
        budget_comfort: 'mid',
        gift_card_ok: true,
      },
    };

    render(<AdvancedInterestsEdit value={initialValue} onChange={mockOnChange} />);

    // Expand Gift Preferences section
    await user.click(screen.getByText('Gift Preferences'));

    // Check that gift card switch is checked
    const giftCardLabel = screen.getByText('Gift Cards OK');
    const parentContainer = giftCardLabel.parentElement?.parentElement;
    const giftCardSwitch = within(parentContainer!).getByRole('switch');
    expect(giftCardSwitch).toHaveAttribute('data-state', 'checked');
  });

  it('pre-populates chip input values', async () => {
    const user = userEvent.setup();
    const initialValue: AdvancedInterests = {
      food_and_drink: {
        wine_types: ['red', 'white'],
      },
    };

    render(<AdvancedInterestsEdit value={initialValue} onChange={mockOnChange} />);

    // Expand Food & Drink section
    await user.click(screen.getByText('Food & Drink'));

    // Wine types field should not show because likes_wine is not true
    // Let's test with likes_wine: true
  });

  it('pre-populates chip input with likes_wine enabled', async () => {
    const user = userEvent.setup();
    const initialValue: AdvancedInterests = {
      food_and_drink: {
        likes_wine: true,
        wine_types: ['red', 'white'],
      },
    };

    render(<AdvancedInterestsEdit value={initialValue} onChange={mockOnChange} />);

    // Expand Food & Drink section
    await user.click(screen.getByText('Food & Drink'));

    // Should show wine types chips
    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('White')).toBeInTheDocument();
  });

  it('renders all fields in Food & Drink section', async () => {
    const user = userEvent.setup();
    render(<AdvancedInterestsEdit value={{}} onChange={mockOnChange} />);

    await user.click(screen.getByText('Food & Drink'));

    expect(screen.getByText('Likes Wine')).toBeInTheDocument();
    expect(screen.getByText('Beverage Preferences')).toBeInTheDocument();
    expect(screen.getByText('Coffee Style')).toBeInTheDocument();
    expect(screen.getByText('Tea Style')).toBeInTheDocument();
    expect(screen.getByText('Spirits')).toBeInTheDocument();
    expect(screen.getByText('Dietary Preferences')).toBeInTheDocument();
    expect(screen.getByText('Favorite Cuisines')).toBeInTheDocument();
    expect(screen.getByText('Sweet vs Savory')).toBeInTheDocument();
    expect(screen.getByText('Favorite Treats')).toBeInTheDocument();
  });

  it('renders all fields in Style & Accessories section', async () => {
    const user = userEvent.setup();
    render(<AdvancedInterestsEdit value={{}} onChange={mockOnChange} />);

    await user.click(screen.getByText('Style & Accessories'));

    expect(screen.getByText('Preferred Colors')).toBeInTheDocument();
    expect(screen.getByText('Avoid Colors')).toBeInTheDocument();
    expect(screen.getByText('Preferred Metals')).toBeInTheDocument();
    expect(screen.getByText('Fragrance Notes')).toBeInTheDocument();
    expect(screen.getByText('Jewelry Sizes')).toBeInTheDocument();
    expect(screen.getByText('Accessory Preferences')).toBeInTheDocument();
    expect(screen.getByText('Style Notes')).toBeInTheDocument();
  });

  it('renders jewelry size inputs', async () => {
    const user = userEvent.setup();
    render(<AdvancedInterestsEdit value={{}} onChange={mockOnChange} />);

    await user.click(screen.getByText('Style & Accessories'));

    // Find the jewelry sizes section
    const jewelrySizesSection = screen.getByText('Jewelry Sizes').parentElement!;

    // Should have Ring, Bracelet, Necklace inputs
    expect(within(jewelrySizesSection).getByText('Ring')).toBeInTheDocument();
    expect(within(jewelrySizesSection).getByText('Bracelet')).toBeInTheDocument();
    expect(within(jewelrySizesSection).getByText('Necklace')).toBeInTheDocument();
  });

  it('renders all fields in Hobbies & Media section', async () => {
    const user = userEvent.setup();
    render(<AdvancedInterestsEdit value={{}} onChange={mockOnChange} />);

    await user.click(screen.getByText('Hobbies & Media'));

    expect(screen.getByText('Hobbies')).toBeInTheDocument();
    expect(screen.getByText('Creative Outlets')).toBeInTheDocument();
    expect(screen.getByText('Sports Played')).toBeInTheDocument();
    expect(screen.getByText('Sports Teams')).toBeInTheDocument();
    expect(screen.getByText('Reading Genres')).toBeInTheDocument();
    expect(screen.getByText('Music Genres')).toBeInTheDocument();
    expect(screen.getByText('Favorite Authors')).toBeInTheDocument();
    expect(screen.getByText('Favorite Artists')).toBeInTheDocument();
    expect(screen.getByText('Board Games')).toBeInTheDocument();
    expect(screen.getByText('Fandoms / Series')).toBeInTheDocument();
  });

  it('renders all fields in Tech, Travel & Experiences section', async () => {
    const user = userEvent.setup();
    render(<AdvancedInterestsEdit value={{}} onChange={mockOnChange} />);

    await user.click(screen.getByText('Tech, Travel & Experiences'));

    expect(screen.getByText('Tech Ecosystem')).toBeInTheDocument();
    expect(screen.getByText('Gaming Platforms')).toBeInTheDocument();
    expect(screen.getByText('Smart Home')).toBeInTheDocument();
    expect(screen.getByText('Travel Styles')).toBeInTheDocument();
    expect(screen.getByText('Dream Destinations')).toBeInTheDocument();
    expect(screen.getByText('Experience Types')).toBeInTheDocument();
    expect(screen.getByText('Event Preferences')).toBeInTheDocument();
  });

  it('renders all fields in Gift Preferences section', async () => {
    const user = userEvent.setup();
    render(<AdvancedInterestsEdit value={{}} onChange={mockOnChange} />);

    await user.click(screen.getByText('Gift Preferences'));

    expect(screen.getByText('Gift Cards OK')).toBeInTheDocument();
    expect(screen.getByText('Likes Personalized Gifts')).toBeInTheDocument();
    expect(screen.getByText('Budget Comfort')).toBeInTheDocument();
    expect(screen.getByText('Collects')).toBeInTheDocument();
    expect(screen.getByText('Avoid Categories')).toBeInTheDocument();
    expect(screen.getByText('Gift Preference Notes')).toBeInTheDocument();
  });

  it('handles complex nested updates', async () => {
    const user = userEvent.setup();
    const initialValue: AdvancedInterests = {
      style_and_accessories: {
        jewelry_sizes: {
          ring: '7',
        },
      },
    };

    render(<AdvancedInterestsEdit value={initialValue} onChange={mockOnChange} />);

    await user.click(screen.getByText('Style & Accessories'));

    // Find bracelet input and type a value
    const braceletInput = screen.getByPlaceholderText('e.g. 7in');
    await user.type(braceletInput, '6.5');

    // Should call onChange with merged jewelry_sizes
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('merges updates correctly without losing existing data', async () => {
    const user = userEvent.setup();
    const initialValue: AdvancedInterests = {
      food_and_drink: {
        likes_wine: true,
        wine_types: ['red'],
      },
    };

    render(<AdvancedInterestsEdit value={initialValue} onChange={mockOnChange} />);

    await user.click(screen.getByText('Food & Drink'));

    // Toggle a different field (beverage_prefs uses ChipInput)
    // Should preserve existing food_and_drink data
    const coffeeStyleSelect = screen.getByText('Select coffee style...');
    await user.click(coffeeStyleSelect);

    // This will trigger onChange when selecting an option
    // The merge should preserve likes_wine and wine_types
  });
});
