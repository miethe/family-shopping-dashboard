/**
 * QuickPurchaseButton Component Tests
 *
 * Tests the quick purchase button that allows marking gifts as purchased
 * directly from the gift card without opening the modal.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuickPurchaseButton } from '@/components/gifts/QuickPurchaseButton';
import type { ListItemInfo } from '@/components/gifts/QuickPurchaseButton';

// Mock the hooks and API - use vi.hoisted to ensure these are available during mocking
const { mockMutate, mockUpdateStatus, mockUpdateStatusMutation } = vi.hoisted(() => {
  const mockMutate = vi.fn();
  const mockUpdateStatus = vi.fn();
  const mockUpdateStatusMutation = {
    mutate: mockMutate,
    isPending: false,
  };

  return { mockMutate, mockUpdateStatus, mockUpdateStatusMutation };
});

vi.mock('@/hooks/useListItems', () => ({
  useUpdateListItemStatus: vi.fn(() => mockUpdateStatusMutation),
}));

vi.mock('@/lib/api/endpoints', () => ({
  listItemApi: {
    updateStatus: mockUpdateStatus,
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('QuickPurchaseButton', () => {
  const singleListItem: ListItemInfo[] = [
    { id: 1, list_id: 10, list_name: 'Christmas List', status: 'selected' },
  ];

  const purchasedItem: ListItemInfo[] = [
    { id: 1, list_id: 10, list_name: 'Christmas List', status: 'purchased' },
  ];

  const multipleListItems: ListItemInfo[] = [
    { id: 1, list_id: 10, list_name: 'Christmas List', status: 'selected' },
    { id: 2, list_id: 20, list_name: 'Birthday List', status: 'idea' },
  ];

  const mixedStatusItems: ListItemInfo[] = [
    { id: 1, list_id: 10, list_name: 'Christmas List', status: 'purchased' },
    { id: 2, list_id: 20, list_name: 'Birthday List', status: 'selected' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateStatusMutation.isPending = false;
    mockUpdateStatus.mockResolvedValue({});
  });

  it('renders nothing when listItems is empty', () => {
    const { container } = render(
      <QuickPurchaseButton giftId={1} listItems={[]} />,
      { wrapper: createWrapper() }
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows purchased state when all items purchased', () => {
    render(
      <QuickPurchaseButton giftId={1} listItems={purchasedItem} />,
      { wrapper: createWrapper() }
    );

    const button = screen.getByRole('button', { name: 'Purchased' });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('shows actionable button for single unpurchased item', () => {
    render(
      <QuickPurchaseButton giftId={1} listItems={singleListItem} />,
      { wrapper: createWrapper() }
    );

    const button = screen.getByRole('button', { name: 'Mark as purchased' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('shows dropdown button for multiple list items', () => {
    render(
      <QuickPurchaseButton giftId={1} listItems={multipleListItems} />,
      { wrapper: createWrapper() }
    );

    const button = screen.getByRole('button', { name: 'Mark as purchased (select list)' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('triggers mutation for single list case', async () => {
    const user = userEvent.setup();
    render(
      <QuickPurchaseButton giftId={1} listItems={singleListItem} />,
      { wrapper: createWrapper() }
    );

    const button = screen.getByRole('button', { name: 'Mark as purchased' });
    await user.click(button);

    expect(mockMutate).toHaveBeenCalledWith(
      {
        itemId: 1,
        status: 'purchased',
      },
      expect.any(Object)
    );
  });

  it('stops propagation on single list click', async () => {
    const user = userEvent.setup();
    const mockParentClick = vi.fn();

    render(
      <div onClick={mockParentClick}>
        <QuickPurchaseButton giftId={1} listItems={singleListItem} />
      </div>,
      { wrapper: createWrapper() }
    );

    const button = screen.getByRole('button', { name: 'Mark as purchased' });
    await user.click(button);

    // Should call mutation
    expect(mockMutate).toHaveBeenCalled();

    // Should NOT propagate to parent
    expect(mockParentClick).not.toHaveBeenCalled();
  });

  it('opens dropdown when multiple lists button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <QuickPurchaseButton giftId={1} listItems={multipleListItems} />,
      { wrapper: createWrapper() }
    );

    const button = screen.getByRole('button', { name: 'Mark as purchased (select list)' });
    await user.click(button);

    // Dropdown should open and show list options
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Mark as purchased in:')).toBeInTheDocument();
    expect(screen.getByText('Christmas List')).toBeInTheDocument();
    expect(screen.getByText('Birthday List')).toBeInTheDocument();
  });

  it('stops propagation on dropdown button click', async () => {
    const user = userEvent.setup();
    const mockParentClick = vi.fn();

    render(
      <div onClick={mockParentClick}>
        <QuickPurchaseButton giftId={1} listItems={multipleListItems} />
      </div>,
      { wrapper: createWrapper() }
    );

    const button = screen.getByRole('button', { name: 'Mark as purchased (select list)' });
    await user.click(button);

    // Should open dropdown
    expect(button).toHaveAttribute('aria-expanded', 'true');

    // Should NOT propagate to parent
    expect(mockParentClick).not.toHaveBeenCalled();
  });

  it('calls API when list is selected from dropdown', async () => {
    const user = userEvent.setup();
    render(
      <QuickPurchaseButton giftId={1} listItems={multipleListItems} />,
      { wrapper: createWrapper() }
    );

    // Open dropdown
    const button = screen.getByRole('button', { name: 'Mark as purchased (select list)' });
    await user.click(button);

    // Click on Christmas List option
    const christmasOption = screen.getByText('Christmas List');
    await user.click(christmasOption);

    expect(mockUpdateStatus).toHaveBeenCalledWith(1, 'purchased');
  });

  it('closes dropdown after list selection', async () => {
    const user = userEvent.setup();
    render(
      <QuickPurchaseButton giftId={1} listItems={multipleListItems} />,
      { wrapper: createWrapper() }
    );

    // Open dropdown
    const button = screen.getByRole('button', { name: 'Mark as purchased (select list)' });
    await user.click(button);

    // Click on Christmas List option
    const christmasOption = screen.getByText('Christmas List');
    await user.click(christmasOption);

    // Dropdown should close
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('calls onPurchaseComplete callback on successful single list purchase', async () => {
    const user = userEvent.setup();
    const mockOnComplete = vi.fn();

    render(
      <QuickPurchaseButton
        giftId={1}
        listItems={singleListItem}
        onPurchaseComplete={mockOnComplete}
      />,
      { wrapper: createWrapper() }
    );

    const button = screen.getByRole('button', { name: 'Mark as purchased' });
    await user.click(button);

    // Verify mutation was called with onSuccess callback
    expect(mockMutate).toHaveBeenCalled();

    // Execute the onSuccess callback manually (simulating successful mutation)
    const mutateCall = mockMutate.mock.calls[0];
    const options = mutateCall[1];
    if (options && options.onSuccess) {
      options.onSuccess();
    }

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('shows loading state during mutation', () => {
    mockUpdateStatusMutation.isPending = true;

    render(
      <QuickPurchaseButton giftId={1} listItems={singleListItem} />,
      { wrapper: createWrapper() }
    );

    const button = screen.getByRole('button', { name: 'Marking as purchased...' });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('stops propagation during loading state', async () => {
    const user = userEvent.setup();
    const mockParentClick = vi.fn();
    mockUpdateStatusMutation.isPending = true;

    render(
      <div onClick={mockParentClick}>
        <QuickPurchaseButton giftId={1} listItems={singleListItem} />
      </div>,
      { wrapper: createWrapper() }
    );

    const button = screen.getByRole('button', { name: 'Marking as purchased...' });
    await user.click(button);

    // Should NOT propagate to parent
    expect(mockParentClick).not.toHaveBeenCalled();
  });

  it('filters out already purchased items from dropdown', async () => {
    const user = userEvent.setup();
    render(
      <QuickPurchaseButton giftId={1} listItems={mixedStatusItems} />,
      { wrapper: createWrapper() }
    );

    // Open dropdown
    const button = screen.getByRole('button', { name: 'Mark as purchased (select list)' });
    await user.click(button);

    // Should only show Birthday List (not purchased)
    expect(screen.getByText('Birthday List')).toBeInTheDocument();
    // Christmas List should not appear since it's already purchased
    expect(screen.queryByText('Christmas List')).not.toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <QuickPurchaseButton
        giftId={1}
        listItems={singleListItem}
        className="custom-class"
      />,
      { wrapper: createWrapper() }
    );

    const button = container.querySelector('.custom-class');
    expect(button).toBeInTheDocument();
  });

  it('has proper button type attributes', () => {
    render(
      <QuickPurchaseButton giftId={1} listItems={singleListItem} />,
      { wrapper: createWrapper() }
    );

    const button = screen.getByRole('button', { name: 'Mark as purchased' });
    // Should be a button element (not a div or other element)
    expect(button.tagName).toBe('BUTTON');
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <QuickPurchaseButton giftId={1} listItems={multipleListItems} />
        <div data-testid="outside-element">Outside</div>
      </div>,
      { wrapper: createWrapper() }
    );

    // Open dropdown
    const button = screen.getByRole('button', { name: 'Mark as purchased (select list)' });
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    // Click outside
    const outsideElement = screen.getByTestId('outside-element');
    await user.click(outsideElement);

    // Dropdown should close
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('stops propagation when clicking inside dropdown menu', async () => {
    const user = userEvent.setup();
    const mockParentClick = vi.fn();

    render(
      <div onClick={mockParentClick}>
        <QuickPurchaseButton giftId={1} listItems={multipleListItems} />
      </div>,
      { wrapper: createWrapper() }
    );

    // Open dropdown
    const button = screen.getByRole('button', { name: 'Mark as purchased (select list)' });
    await user.click(button);

    // Click on the dropdown menu container (not a list item)
    const dropdownHeader = screen.getByText('Mark as purchased in:');
    await user.click(dropdownHeader);

    // Should NOT propagate to parent
    expect(mockParentClick).not.toHaveBeenCalled();
  });

  it('does not render when all lists are purchased', () => {
    const allPurchased: ListItemInfo[] = [
      { id: 1, list_id: 10, list_name: 'Christmas List', status: 'purchased' },
      { id: 2, list_id: 20, list_name: 'Birthday List', status: 'purchased' },
    ];

    render(
      <QuickPurchaseButton giftId={1} listItems={allPurchased} />,
      { wrapper: createWrapper() }
    );

    // Should show purchased state button
    const button = screen.getByRole('button', { name: 'Purchased' });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('handles minimum touch target size (44x44px)', () => {
    render(
      <QuickPurchaseButton giftId={1} listItems={singleListItem} />,
      { wrapper: createWrapper() }
    );

    const button = screen.getByRole('button', { name: 'Mark as purchased' });
    expect(button).toHaveClass('min-h-[44px]');
    expect(button).toHaveClass('min-w-[44px]');
  });
});
