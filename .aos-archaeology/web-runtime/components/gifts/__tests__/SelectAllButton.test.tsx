/**
 * SelectAllButton Component Tests
 *
 * Tests the page-level "Select All" button that appears below the GiftToolbar
 * when in selection mode. Toggles between "Select All (N)" and "Deselect All"
 * based on current selection state.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SelectAllButton } from '../SelectAllButton';

describe('SelectAllButton', () => {
  const defaultProps = {
    isSelectionMode: true,
    selectedCount: 0,
    totalCount: 10,
    onSelectAll: vi.fn(),
    onDeselectAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when selection mode is disabled', () => {
    const { container } = render(
      <SelectAllButton {...defaultProps} isSelectionMode={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should not render when total count is zero', () => {
    const { container } = render(
      <SelectAllButton {...defaultProps} totalCount={0} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should show "Select All" with count when not all selected', () => {
    render(<SelectAllButton {...defaultProps} selectedCount={3} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Select All (10)');
  });

  it('should show "Deselect All" when all items selected', () => {
    render(
      <SelectAllButton {...defaultProps} selectedCount={10} totalCount={10} />
    );
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Deselect All');
  });

  it('should call onSelectAll when clicking select all button', async () => {
    const user = userEvent.setup();
    render(<SelectAllButton {...defaultProps} />);

    const button = screen.getByRole('button', { name: 'Select All (10)' });
    await user.click(button);

    expect(defaultProps.onSelectAll).toHaveBeenCalledTimes(1);
    expect(defaultProps.onDeselectAll).not.toHaveBeenCalled();
  });

  it('should call onDeselectAll when clicking deselect all button', async () => {
    const user = userEvent.setup();
    render(
      <SelectAllButton {...defaultProps} selectedCount={10} totalCount={10} />
    );

    const button = screen.getByRole('button', { name: 'Deselect All' });
    await user.click(button);

    expect(defaultProps.onDeselectAll).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSelectAll).not.toHaveBeenCalled();
  });

  it('should have minimum 44px height for touch targets', () => {
    render(<SelectAllButton {...defaultProps} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('min-h-[44px]');
  });

  it('should render as a button element', () => {
    render(<SelectAllButton {...defaultProps} />);
    const button = screen.getByRole('button');
    expect(button.tagName).toBe('BUTTON');
  });
});
