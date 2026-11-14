/**
 * GroupSelectAllButton Component Tests
 *
 * Tests the status-group specific "Select All" button that appears in grouped
 * section headers. Shows count of items in group and allows selecting/deselecting
 * all items within a specific status group.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GroupSelectAllButton } from '../GroupSelectAllButton';

describe('GroupSelectAllButton', () => {
  const defaultProps = {
    statusLabel: 'Ideas',
    groupGiftIds: [1, 2, 3, 4, 5],
    selectedIds: new Set<number>(),
    isSelectionMode: true,
    onSelectGroup: vi.fn(),
    onDeselectGroup: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when selection mode is disabled', () => {
    const { container } = render(
      <GroupSelectAllButton {...defaultProps} isSelectionMode={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should not render when group has no gifts', () => {
    const { container } = render(
      <GroupSelectAllButton {...defaultProps} groupGiftIds={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should show select all with status label and count', () => {
    render(<GroupSelectAllButton {...defaultProps} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Select All Ideas (5)');
  });

  it('should show deselect when all group items selected', () => {
    render(
      <GroupSelectAllButton
        {...defaultProps}
        selectedIds={new Set([1, 2, 3, 4, 5])}
      />
    );
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Deselect Ideas');
  });

  it('should call onSelectGroup with group IDs when clicking select', async () => {
    const user = userEvent.setup();
    render(<GroupSelectAllButton {...defaultProps} />);

    const button = screen.getByRole('button', {
      name: 'Select All Ideas (5)',
    });
    await user.click(button);

    expect(defaultProps.onSelectGroup).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSelectGroup).toHaveBeenCalledWith([1, 2, 3, 4, 5]);
    expect(defaultProps.onDeselectGroup).not.toHaveBeenCalled();
  });

  it('should call onDeselectGroup when clicking deselect', async () => {
    const user = userEvent.setup();
    render(
      <GroupSelectAllButton
        {...defaultProps}
        selectedIds={new Set([1, 2, 3, 4, 5])}
      />
    );

    const button = screen.getByRole('button', { name: 'Deselect Ideas' });
    await user.click(button);

    expect(defaultProps.onDeselectGroup).toHaveBeenCalledTimes(1);
    expect(defaultProps.onDeselectGroup).toHaveBeenCalledWith([1, 2, 3, 4, 5]);
    expect(defaultProps.onSelectGroup).not.toHaveBeenCalled();
  });

  it('should stop event propagation on click', async () => {
    const user = userEvent.setup();
    const mockParentClick = vi.fn();

    render(
      <div onClick={mockParentClick}>
        <GroupSelectAllButton {...defaultProps} />
      </div>
    );

    const button = screen.getByRole('button', {
      name: 'Select All Ideas (5)',
    });
    await user.click(button);

    // Should call the group selection handler
    expect(defaultProps.onSelectGroup).toHaveBeenCalled();

    // Should NOT propagate to parent
    expect(mockParentClick).not.toHaveBeenCalled();
  });

  it('should show select all when only some items selected', () => {
    render(
      <GroupSelectAllButton
        {...defaultProps}
        selectedIds={new Set([1, 2])}
      />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Select All Ideas (5)');
  });

  it('should have minimum 44px height for touch targets', () => {
    render(<GroupSelectAllButton {...defaultProps} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('min-h-[44px]');
  });
});
