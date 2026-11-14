/**
 * LinkedEntityIcons Component Tests
 *
 * Tests the linked entity icons component that displays recipients and lists
 * in a compact, clickable format with tooltips and overflow handling.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LinkedEntityIcons } from '@/components/gifts/LinkedEntityIcons';
import type { LinkedPerson, LinkedList } from '@/components/gifts/LinkedEntityIcons';

describe('LinkedEntityIcons', () => {
  const mockRecipients: LinkedPerson[] = [
    { id: 1, display_name: 'John Doe', photo_url: 'https://example.com/john.jpg' },
    { id: 2, display_name: 'Jane Smith' },
  ];

  const mockLists: LinkedList[] = [
    { id: 10, name: 'Christmas 2024' },
    { id: 20, name: 'Birthday Ideas' },
  ];

  const mockOnRecipientClick = vi.fn();
  const mockOnListClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when no entities provided', () => {
    const { container } = render(<LinkedEntityIcons />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when empty arrays provided', () => {
    const { container } = render(
      <LinkedEntityIcons recipients={[]} lists={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders recipient icons with correct aria-labels', () => {
    render(<LinkedEntityIcons recipients={mockRecipients} />);
    expect(screen.getByLabelText('View John Doe')).toBeInTheDocument();
    expect(screen.getByLabelText('View Jane Smith')).toBeInTheDocument();
  });

  it('renders list icons with correct aria-labels', () => {
    render(<LinkedEntityIcons lists={mockLists} />);
    expect(screen.getByLabelText('View list: Christmas 2024')).toBeInTheDocument();
    expect(screen.getByLabelText('View list: Birthday Ideas')).toBeInTheDocument();
  });

  it('renders both recipients and lists together', () => {
    render(
      <LinkedEntityIcons
        recipients={mockRecipients}
        lists={mockLists}
      />
    );
    expect(screen.getByLabelText('View John Doe')).toBeInTheDocument();
    expect(screen.getByLabelText('View list: Christmas 2024')).toBeInTheDocument();
  });

  it('shows overflow indicator when exceeding maxVisible', () => {
    const manyRecipients: LinkedPerson[] = [
      { id: 1, display_name: 'Person 1' },
      { id: 2, display_name: 'Person 2' },
      { id: 3, display_name: 'Person 3' },
      { id: 4, display_name: 'Person 4' },
    ];
    render(<LinkedEntityIcons recipients={manyRecipients} maxVisible={3} />);

    // Should show 3 visible + overflow indicator
    expect(screen.getByLabelText('View Person 1')).toBeInTheDocument();
    expect(screen.getByLabelText('View Person 2')).toBeInTheDocument();
    expect(screen.getByLabelText('View Person 3')).toBeInTheDocument();

    // Fourth person should not be visible
    expect(screen.queryByLabelText('View Person 4')).not.toBeInTheDocument();

    // Overflow indicator should show +1
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('shows correct overflow count for multiple items', () => {
    const manyRecipients: LinkedPerson[] = [
      { id: 1, display_name: 'Person 1' },
      { id: 2, display_name: 'Person 2' },
      { id: 3, display_name: 'Person 3' },
      { id: 4, display_name: 'Person 4' },
      { id: 5, display_name: 'Person 5' },
    ];
    render(<LinkedEntityIcons recipients={manyRecipients} maxVisible={2} />);

    // Should show +3 more
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('respects maxVisible across recipients and lists', () => {
    const recipients: LinkedPerson[] = [
      { id: 1, display_name: 'Person 1' },
      { id: 2, display_name: 'Person 2' },
    ];
    const lists: LinkedList[] = [
      { id: 10, name: 'List 1' },
      { id: 20, name: 'List 2' },
    ];

    render(
      <LinkedEntityIcons
        recipients={recipients}
        lists={lists}
        maxVisible={3}
      />
    );

    // Should show 2 recipients + 1 list (maxVisible=3)
    expect(screen.getByLabelText('View Person 1')).toBeInTheDocument();
    expect(screen.getByLabelText('View Person 2')).toBeInTheDocument();
    expect(screen.getByLabelText('View list: List 1')).toBeInTheDocument();
    expect(screen.queryByLabelText('View list: List 2')).not.toBeInTheDocument();

    // Should show +1 overflow
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('calls onRecipientClick with correct ID', async () => {
    const user = userEvent.setup();
    render(
      <LinkedEntityIcons
        recipients={mockRecipients}
        onRecipientClick={mockOnRecipientClick}
      />
    );

    await user.click(screen.getByLabelText('View John Doe'));
    expect(mockOnRecipientClick).toHaveBeenCalledWith(1);
    expect(mockOnRecipientClick).toHaveBeenCalledTimes(1);
  });

  it('calls onListClick with correct ID', async () => {
    const user = userEvent.setup();
    render(
      <LinkedEntityIcons
        lists={mockLists}
        onListClick={mockOnListClick}
      />
    );

    await user.click(screen.getByLabelText('View list: Christmas 2024'));
    expect(mockOnListClick).toHaveBeenCalledWith(10);
    expect(mockOnListClick).toHaveBeenCalledTimes(1);
  });

  it('stops propagation on recipient click', async () => {
    const user = userEvent.setup();
    const mockParentClick = vi.fn();

    const { container } = render(
      <div onClick={mockParentClick}>
        <LinkedEntityIcons
          recipients={mockRecipients}
          onRecipientClick={mockOnRecipientClick}
        />
      </div>
    );

    await user.click(screen.getByLabelText('View John Doe'));

    // Should call the recipient click handler
    expect(mockOnRecipientClick).toHaveBeenCalledWith(1);

    // Should NOT call the parent click handler (propagation stopped)
    expect(mockParentClick).not.toHaveBeenCalled();
  });

  it('stops propagation on list click', async () => {
    const user = userEvent.setup();
    const mockParentClick = vi.fn();

    render(
      <div onClick={mockParentClick}>
        <LinkedEntityIcons
          lists={mockLists}
          onListClick={mockOnListClick}
        />
      </div>
    );

    await user.click(screen.getByLabelText('View list: Christmas 2024'));

    // Should call the list click handler
    expect(mockOnListClick).toHaveBeenCalledWith(10);

    // Should NOT call the parent click handler (propagation stopped)
    expect(mockParentClick).not.toHaveBeenCalled();
  });

  it('renders avatars for recipients with photos', () => {
    render(<LinkedEntityIcons recipients={mockRecipients} />);

    // Should render button for John Doe (has photo_url)
    const johnButton = screen.getByLabelText('View John Doe');
    expect(johnButton).toBeInTheDocument();

    // Avatar component should be rendered (implementation detail - just verify button exists)
    // The actual image rendering is handled by the Avatar component
  });

  it('renders fallback icon for recipients without photos', () => {
    render(<LinkedEntityIcons recipients={mockRecipients} />);

    // Jane Smith has no photo_url, should render User icon fallback
    const janeButton = screen.getByLabelText('View Jane Smith');
    expect(janeButton).toBeInTheDocument();

    // Check for the User icon component (rendered as an svg or div with User icon)
    const iconContainer = janeButton.querySelector('div');
    expect(iconContainer).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <LinkedEntityIcons
        recipients={mockRecipients}
        className="custom-class"
      />
    );

    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
  });

  it('applies size variant correctly', () => {
    const { container } = render(
      <LinkedEntityIcons
        recipients={mockRecipients}
        size="sm"
      />
    );

    // Check that the container has the small gap class
    const wrapper = container.querySelector('.gap-1');
    expect(wrapper).toBeInTheDocument();
  });

  it('has correct button type attribute', () => {
    render(<LinkedEntityIcons recipients={mockRecipients} />);

    const button = screen.getByLabelText('View John Doe');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('does not call click handlers when none are provided', async () => {
    const user = userEvent.setup();

    // Render without click handlers - should not throw errors
    render(<LinkedEntityIcons recipients={mockRecipients} lists={mockLists} />);

    // Clicking should work without errors
    await user.click(screen.getByLabelText('View John Doe'));
    await user.click(screen.getByLabelText('View list: Christmas 2024'));

    // No assertions needed - just verify no errors thrown
    expect(true).toBe(true);
  });

  it('overflow indicator has correct aria-label', () => {
    const manyRecipients: LinkedPerson[] = [
      { id: 1, display_name: 'Person 1' },
      { id: 2, display_name: 'Person 2' },
      { id: 3, display_name: 'Person 3' },
      { id: 4, display_name: 'Person 4' },
    ];

    render(<LinkedEntityIcons recipients={manyRecipients} maxVisible={3} />);

    const overflowIndicator = screen.getByLabelText('1 more item');
    expect(overflowIndicator).toBeInTheDocument();
  });

  it('overflow indicator shows plural for multiple items', () => {
    const manyItems: LinkedPerson[] = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      display_name: `Person ${i + 1}`,
    }));

    render(<LinkedEntityIcons recipients={manyItems} maxVisible={3} />);

    const overflowIndicator = screen.getByLabelText('3 more items');
    expect(overflowIndicator).toBeInTheDocument();
  });
});
