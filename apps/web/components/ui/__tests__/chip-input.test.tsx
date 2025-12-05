/**
 * ChipInput Component Tests
 *
 * Tests the multi-select chip input component behavior
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChipInput } from '../chip-input';

describe('ChipInput', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders existing values as chips', () => {
    render(
      <ChipInput
        value={['red', 'white']}
        onChange={mockOnChange}
        label="Wine Types"
      />
    );

    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('White')).toBeInTheDocument();
  });

  it('removes chip when X is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ChipInput
        value={['red', 'white']}
        onChange={mockOnChange}
        label="Wine Types"
      />
    );

    // Find and click the remove button for 'red'
    const removeButton = screen.getByLabelText('Remove Red');
    await user.click(removeButton);

    expect(mockOnChange).toHaveBeenCalledWith(['white']);
  });

  it('adds new value from input when Enter is pressed', async () => {
    const user = userEvent.setup();
    render(
      <ChipInput
        value={[]}
        onChange={mockOnChange}
        label="Custom Values"
        placeholder="Add value..."
      />
    );

    const input = screen.getByPlaceholderText('Add value...');
    await user.type(input, 'new value{Enter}');

    expect(mockOnChange).toHaveBeenCalledWith(['new value']);
  });

  it('shows overflow toggle for many items', () => {
    const manyItems = Array.from({ length: 15 }, (_, i) => `item${i}`);
    render(
      <ChipInput
        value={manyItems}
        onChange={mockOnChange}
        label="Many Items"
        maxVisible={10}
      />
    );

    // Should show "+5 more" button (15 total - 10 visible)
    expect(screen.getByText('+5 more')).toBeInTheDocument();
  });

  it('expands to show all items when overflow is clicked', async () => {
    const user = userEvent.setup();
    const manyItems = Array.from({ length: 15 }, (_, i) => `item${i}`);
    render(
      <ChipInput
        value={manyItems}
        onChange={mockOnChange}
        label="Many Items"
        maxVisible={10}
      />
    );

    // Click the "+5 more" button
    const moreButton = screen.getByText('+5 more');
    await user.click(moreButton);

    // Should now show "Show less" button
    expect(screen.getByText('Show less')).toBeInTheDocument();

    // All items should be visible
    expect(screen.getByText('Item10')).toBeInTheDocument();
    expect(screen.getByText('Item14')).toBeInTheDocument();
  });

  it('shows suggestions when typing', async () => {
    const user = userEvent.setup();
    render(
      <ChipInput
        value={[]}
        onChange={mockOnChange}
        options={['red', 'white', 'rose']}
        label="Wine Types"
        placeholder="Type to add..."
      />
    );

    const input = screen.getByPlaceholderText('Type to add...');
    await user.type(input, 'r');

    // Should show suggestions containing 'r'
    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('Rose')).toBeInTheDocument();
  });

  it('adds value when suggestion is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ChipInput
        value={[]}
        onChange={mockOnChange}
        options={['red', 'white', 'rose']}
        label="Wine Types"
        placeholder="Type to add..."
      />
    );

    const input = screen.getByPlaceholderText('Type to add...');
    await user.type(input, 'r');

    // Click on the 'Red' suggestion
    const redSuggestion = screen.getAllByText('Red')[0]; // Get from suggestions dropdown
    await user.click(redSuggestion);

    expect(mockOnChange).toHaveBeenCalledWith(['red']);
  });

  it('removes last chip when backspace is pressed on empty input', async () => {
    const user = userEvent.setup();
    render(
      <ChipInput
        value={['red', 'white', 'rose']}
        onChange={mockOnChange}
        label="Wine Types"
        placeholder="Type to add..."
      />
    );

    const input = screen.getByPlaceholderText('Type to add...');
    await user.click(input);
    await user.keyboard('{Backspace}');

    expect(mockOnChange).toHaveBeenCalledWith(['red', 'white']);
  });

  it('does not add duplicate values', async () => {
    const user = userEvent.setup();
    render(
      <ChipInput
        value={['red']}
        onChange={mockOnChange}
        label="Wine Types"
        placeholder="Type to add..."
      />
    );

    const input = screen.getByPlaceholderText('Type to add...');
    await user.type(input, 'red{Enter}');

    // Should not call onChange since 'red' already exists
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('trims whitespace from new values', async () => {
    const user = userEvent.setup();
    render(
      <ChipInput
        value={[]}
        onChange={mockOnChange}
        label="Wine Types"
        placeholder="Type to add..."
      />
    );

    const input = screen.getByPlaceholderText('Type to add...');
    await user.type(input, '  red  {Enter}');

    expect(mockOnChange).toHaveBeenCalledWith(['red']);
  });

  it('renders label when provided', () => {
    render(
      <ChipInput
        value={[]}
        onChange={mockOnChange}
        label="Test Label"
      />
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders helper text when provided', () => {
    render(
      <ChipInput
        value={[]}
        onChange={mockOnChange}
        label="Test"
        helperText="This is helper text"
      />
    );

    expect(screen.getByText('This is helper text')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(
      <ChipInput
        value={['red']}
        onChange={mockOnChange}
        label="Wine Types"
        disabled={true}
      />
    );

    // Input should not be rendered when disabled
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
