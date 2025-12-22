/**
 * FieldsList Component Tests
 *
 * Tests the collapsible fields list that groups fields by category
 * and allows expanding/collapsing to show options for each field.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FieldsList } from '@/components/features/admin/FieldsList';

// Mock OptionsList component
vi.mock('@/components/features/admin/OptionsList', () => ({
  OptionsList: ({ entity, fieldName }: { entity: string; fieldName: string }) => (
    <div data-testid={`options-list-${fieldName}`}>
      OptionsList for {entity}.{fieldName}
    </div>
  ),
}));

describe('FieldsList', () => {
  const mockFields = [
    { name: 'wine_types', label: 'Wine Types', category: 'Food & Drink' },
    { name: 'beverage_prefs', label: 'Beverage Preferences', category: 'Food & Drink' },
    { name: 'hobbies', label: 'Hobbies', category: 'Hobbies & Interests' },
    { name: 'tech_ecosystem', label: 'Tech Ecosystem', category: 'Technology' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders fields grouped by category', () => {
    render(<FieldsList entity="person" fields={mockFields} />);

    // Category headers
    expect(screen.getByText('Food & Drink')).toBeInTheDocument();
    expect(screen.getByText('Hobbies & Interests')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('renders field labels and technical names', () => {
    render(<FieldsList entity="person" fields={mockFields} />);

    // Field labels
    expect(screen.getByText('Wine Types')).toBeInTheDocument();
    expect(screen.getByText('Beverage Preferences')).toBeInTheDocument();

    // Technical names
    expect(screen.getByText('wine_types')).toBeInTheDocument();
    expect(screen.getByText('beverage_prefs')).toBeInTheDocument();
  });

  it('fields start collapsed by default', () => {
    render(<FieldsList entity="person" fields={mockFields} />);

    // OptionsList should not be visible for any field
    expect(screen.queryByTestId('options-list-wine_types')).not.toBeInTheDocument();
    expect(screen.queryByTestId('options-list-beverage_prefs')).not.toBeInTheDocument();
    expect(screen.queryByTestId('options-list-hobbies')).not.toBeInTheDocument();
  });

  it('expands field on click', async () => {
    const user = userEvent.setup();
    render(<FieldsList entity="person" fields={mockFields} />);

    const wineTypesButton = screen.getByRole('button', { name: /Wine Types/i });
    await user.click(wineTypesButton);

    // OptionsList should now be visible
    expect(screen.getByTestId('options-list-wine_types')).toBeInTheDocument();
  });

  it('collapses field on second click', async () => {
    const user = userEvent.setup();
    render(<FieldsList entity="person" fields={mockFields} />);

    const wineTypesButton = screen.getByRole('button', { name: /Wine Types/i });

    // Expand
    await user.click(wineTypesButton);
    expect(screen.getByTestId('options-list-wine_types')).toBeInTheDocument();

    // Collapse
    await user.click(wineTypesButton);
    expect(screen.queryByTestId('options-list-wine_types')).not.toBeInTheDocument();
  });

  it('multiple fields can be expanded simultaneously', async () => {
    const user = userEvent.setup();
    render(<FieldsList entity="person" fields={mockFields} />);

    // Expand wine_types
    await user.click(screen.getByRole('button', { name: /Wine Types/i }));
    expect(screen.getByTestId('options-list-wine_types')).toBeInTheDocument();

    // Expand hobbies
    await user.click(screen.getByRole('button', { name: /Hobbies/i }));
    expect(screen.getByTestId('options-list-hobbies')).toBeInTheDocument();

    // Both should remain expanded
    expect(screen.getByTestId('options-list-wine_types')).toBeInTheDocument();
    expect(screen.getByTestId('options-list-hobbies')).toBeInTheDocument();
  });

  it('chevron icon rotates when field is expanded', async () => {
    const user = userEvent.setup();
    const { container } = render(<FieldsList entity="person" fields={mockFields} />);

    const wineTypesButton = screen.getByRole('button', { name: /Wine Types/i });

    // Find chevron icon (expand_more)
    const chevron = wineTypesButton.querySelector('.rotate-180');
    expect(chevron).not.toBeInTheDocument(); // Not rotated initially

    // Expand
    await user.click(wineTypesButton);

    // Chevron should now be rotated
    const rotatedChevron = wineTypesButton.querySelector('.rotate-180');
    expect(rotatedChevron).toBeInTheDocument();
  });

  it('handles empty fields array gracefully', () => {
    render(<FieldsList entity="person" fields={[]} />);

    // Should render without errors
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('groups multiple fields under same category', () => {
    render(<FieldsList entity="person" fields={mockFields} />);

    // Food & Drink category should have 2 fields
    const foodDrinkHeader = screen.getByText('Food & Drink');
    expect(foodDrinkHeader).toBeInTheDocument();

    expect(screen.getByText('Wine Types')).toBeInTheDocument();
    expect(screen.getByText('Beverage Preferences')).toBeInTheDocument();
  });

  it('field buttons have minimum touch target height', () => {
    render(<FieldsList entity="person" fields={mockFields} />);

    const wineTypesButton = screen.getByRole('button', { name: /Wine Types/i });
    expect(wineTypesButton).toHaveClass('min-h-[44px]');
  });

  it('field buttons are left-aligned', () => {
    render(<FieldsList entity="person" fields={mockFields} />);

    const wineTypesButton = screen.getByRole('button', { name: /Wine Types/i });
    expect(wineTypesButton).toHaveClass('text-left');
  });

  it('field buttons have correct type attribute', () => {
    render(<FieldsList entity="person" fields={mockFields} />);

    const wineTypesButton = screen.getByRole('button', { name: /Wine Types/i });
    expect(wineTypesButton).toHaveAttribute('type', 'button');
  });

  it('applies hover styles to field buttons', () => {
    render(<FieldsList entity="person" fields={mockFields} />);

    const wineTypesButton = screen.getByRole('button', { name: /Wine Types/i });
    expect(wineTypesButton.className).toContain('hover:bg-warm-50');
  });

  it('passes entity and fieldName to OptionsList', async () => {
    const user = userEvent.setup();
    render(<FieldsList entity="gift" fields={[{ name: 'priority', label: 'Priority', category: 'Classification' }]} />);

    const priorityButton = screen.getByRole('button', { name: /Priority/i });
    await user.click(priorityButton);

    const optionsList = screen.getByTestId('options-list-priority');
    expect(optionsList).toHaveTextContent('gift.priority');
  });

  it('renders fields in category order', () => {
    render(<FieldsList entity="person" fields={mockFields} />);

    const categories = screen.getAllByRole('heading', { level: 3 });
    expect(categories).toHaveLength(3);

    // Categories should appear in the order they were encountered in fields array
    expect(categories[0]).toHaveTextContent('Food & Drink');
    expect(categories[1]).toHaveTextContent('Hobbies & Interests');
    expect(categories[2]).toHaveTextContent('Technology');
  });

  it('applies correct styling to category headers', () => {
    render(<FieldsList entity="person" fields={mockFields} />);

    const foodDrinkHeader = screen.getByText('Food & Drink');
    expect(foodDrinkHeader.tagName).toBe('H3');
    expect(foodDrinkHeader).toHaveClass('text-base');
    expect(foodDrinkHeader).toHaveClass('font-semibold');
  });

  it('fields have rounded borders', () => {
    const { container } = render(<FieldsList entity="person" fields={mockFields} />);

    const fieldContainers = container.querySelectorAll('.rounded-xlarge');
    expect(fieldContainers.length).toBeGreaterThan(0);
  });

  it('expanded content has different background color', async () => {
    const user = userEvent.setup();
    const { container } = render(<FieldsList entity="person" fields={mockFields} />);

    const wineTypesButton = screen.getByRole('button', { name: /Wine Types/i });
    await user.click(wineTypesButton);

    // Expanded content should have bg-warm-50
    const expandedContent = container.querySelector('.bg-warm-50');
    expect(expandedContent).toBeInTheDocument();
  });

  it('handles fields with no category (defaults to "Other")', () => {
    const fieldsWithNoCategory = [
      { name: 'test_field', label: 'Test Field', category: '' },
    ];

    render(<FieldsList entity="person" fields={fieldsWithNoCategory} />);

    expect(screen.getByText('Other')).toBeInTheDocument();
  });
});
