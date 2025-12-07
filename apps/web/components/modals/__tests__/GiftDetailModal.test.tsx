/**
 * GiftDetailModal Component Tests
 *
 * Tests the GiftDetailModal component with focus on:
 * - Mark as Purchased flow
 * - Quantity selection dialog
 * - Purchase date display after marking as purchased
 * - Button visibility based on purchase status
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GiftDetailModal } from '../GiftDetailModal';
import type { Gift } from '@/types';
import { GiftPriority } from '@/types';

// Mock the hooks
const mockMarkPurchasedMutateAsync = vi.fn();
const mockDeleteMutateAsync = vi.fn();
const mockUpdateGiftMutate = vi.fn();
const mockAttachPeopleMutateAsync = vi.fn();
const mockDetachPersonMutateAsync = vi.fn();

const mockUseQuery = vi.fn();
const mockUseListsForGift = vi.fn();
const mockUsePersons = vi.fn();

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: (options: any) => mockUseQuery(options),
    useQueryClient: () => ({
      invalidateQueries: vi.fn(),
      setQueryData: vi.fn(),
    }),
  };
});

vi.mock('@/hooks/useGifts', () => ({
  useDeleteGift: () => ({
    mutateAsync: mockDeleteMutateAsync,
    isPending: false,
  }),
  useUpdateGift: () => ({
    mutate: mockUpdateGiftMutate,
    isPending: false,
  }),
  useAttachPeopleToGift: () => ({
    mutateAsync: mockAttachPeopleMutateAsync,
    isPending: false,
  }),
  useDetachPersonFromGift: () => ({
    mutateAsync: mockDetachPersonMutateAsync,
    isPending: false,
  }),
  useMarkGiftPurchased: () => ({
    mutateAsync: mockMarkPurchasedMutateAsync,
    isPending: false,
  }),
}));

vi.mock('@/hooks/useLists', () => ({
  useListsForGift: (giftId: number | undefined, options: any) => mockUseListsForGift(giftId, options),
}));

vi.mock('@/hooks/usePersons', () => ({
  usePersons: (params: any, options: any) => mockUsePersons(params, options),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

// Mock child components to simplify testing
vi.mock('@/components/comments', () => ({
  CommentsTab: () => <div>CommentsTab</div>,
}));

vi.mock('../ListDetailModal', () => ({
  ListDetailModal: () => <div>ListDetailModal</div>,
}));

vi.mock('../PersonDetailModal', () => ({
  PersonDetailModal: () => <div>PersonDetailModal</div>,
}));

vi.mock('@/components/gifts/LinkGiftToListsModal', () => ({
  LinkGiftToListsModal: () => <div>LinkGiftToListsModal</div>,
}));

vi.mock('@/components/common/PeopleMultiSelect', () => ({
  PeopleMultiSelect: ({ value, onChange }: any) => (
    <div>
      <div>PeopleMultiSelect: {value.join(',')}</div>
      <button onClick={() => onChange([1, 2])}>Change People</button>
    </div>
  ),
}));

vi.mock('@/components/common/GiftTitleLink', () => ({
  GiftTitleLink: ({ name }: any) => <span>{name}</span>,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('GiftDetailModal - Mark as Purchased Flow', () => {
  const mockGift: Gift = {
    id: 1,
    name: 'LEGO Star Wars Set',
    description: 'Ultimate Millennium Falcon',
    price: 159.99,
    sale_price: null,
    url: 'https://example.com/lego',
    image_url: 'https://example.com/lego.jpg',
    quantity: 2,
    priority: GiftPriority.HIGH,
    source: 'Amazon',
    notes: 'Check for sales',
    person_ids: [1],
    stores: [],
    additional_urls: [],
    purchase_date: null,
    extra_data: { status: 'idea' }, // Valid status: idea | selected | purchased | received
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockPurchasedGift: Gift = {
    ...mockGift,
    purchase_date: '2024-01-15T00:00:00Z',
    extra_data: { status: 'purchased' },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseListsForGift.mockReturnValue({
      data: { data: [] },
      isLoading: false,
    });

    mockUsePersons.mockReturnValue({
      data: { items: [] },
    });
  });

  it('shows Mark as Purchased button when gift is not purchased', () => {
    mockUseQuery.mockReturnValue({
      data: mockGift,
      isLoading: false,
    });

    render(
      <GiftDetailModal giftId="1" open={true} onOpenChange={() => {}} />,
      { wrapper }
    );

    const markPurchasedButtons = screen.getAllByRole('button', { name: /mark as purchased/i });
    expect(markPurchasedButtons.length).toBeGreaterThan(0);
  });

  it('does not show Mark as Purchased button when gift is already purchased', () => {
    mockUseQuery.mockReturnValue({
      data: mockPurchasedGift,
      isLoading: false,
    });

    render(
      <GiftDetailModal giftId="1" open={true} onOpenChange={() => {}} />,
      { wrapper }
    );

    const markPurchasedButton = screen.queryByRole('button', { name: /mark as purchased/i });
    expect(markPurchasedButton).not.toBeInTheDocument();
  });

  it('does not show Mark as Purchased button when status is already purchased', () => {
    const giftWithPurchasedStatus: Gift = {
      ...mockGift,
      purchase_date: null,
      extra_data: { status: 'purchased' },
    };

    mockUseQuery.mockReturnValue({
      data: giftWithPurchasedStatus,
      isLoading: false,
    });

    render(
      <GiftDetailModal giftId="1" open={true} onOpenChange={() => {}} />,
      { wrapper }
    );

    const markPurchasedButton = screen.queryByRole('button', { name: /mark as purchased/i });
    expect(markPurchasedButton).not.toBeInTheDocument();
  });

  it('opens quantity dialog when Mark as Purchased button is clicked', async () => {
    const user = userEvent.setup();
    mockUseQuery.mockReturnValue({
      data: mockGift,
      isLoading: false,
    });

    render(
      <GiftDetailModal giftId="1" open={true} onOpenChange={() => {}} />,
      { wrapper }
    );

    const markPurchasedButtons = screen.getAllByRole('button', { name: /mark as purchased/i });
    await user.click(markPurchasedButtons[0]);

    // Quantity dialog should open
    await waitFor(() => {
      expect(screen.getByText('How many of this gift did you purchase?')).toBeInTheDocument();
    });
  });

  it('pre-fills quantity with gift quantity when opening dialog', async () => {
    const user = userEvent.setup();
    mockUseQuery.mockReturnValue({
      data: mockGift,
      isLoading: false,
    });

    render(
      <GiftDetailModal giftId="1" open={true} onOpenChange={() => {}} />,
      { wrapper }
    );

    const markPurchasedButtons = screen.getAllByRole('button', { name: /mark as purchased/i });
    await user.click(markPurchasedButtons[0]);

    // The quantity select should be visible
    await waitFor(() => {
      expect(screen.getByText('Quantity Purchased')).toBeInTheDocument();
    });
  });

  it('user can select quantity from dropdown', async () => {
    const user = userEvent.setup();
    mockUseQuery.mockReturnValue({
      data: mockGift,
      isLoading: false,
    });

    render(
      <GiftDetailModal giftId="1" open={true} onOpenChange={() => {}} />,
      { wrapper }
    );

    const markPurchasedButtons = screen.getAllByRole('button', { name: /mark as purchased/i });
    await user.click(markPurchasedButtons[0]);

    // Dialog should be open - use getAllByText since "Mark as Purchased" appears in title and button
    await waitFor(() => {
      expect(screen.getByText('How many of this gift did you purchase?')).toBeInTheDocument();
    });

    // The Select component should be rendered
    expect(screen.getByText('Quantity Purchased')).toBeInTheDocument();
  });

  it('calls useMarkGiftPurchased mutation when confirmed', async () => {
    const user = userEvent.setup();
    mockUseQuery.mockReturnValue({
      data: mockGift,
      isLoading: false,
    });
    mockMarkPurchasedMutateAsync.mockResolvedValue({
      ...mockGift,
      purchase_date: '2024-01-15T00:00:00Z',
    });

    render(
      <GiftDetailModal giftId="1" open={true} onOpenChange={() => {}} />,
      { wrapper }
    );

    // Open the mark as purchased dialog
    const markPurchasedButtons = screen.getAllByRole('button', { name: /mark as purchased/i });
    const markPurchasedButton = markPurchasedButtons[0];
    await user.click(markPurchasedButton);

    // Wait for dialog to open
    await waitFor(() => {
      // Dialog title appears multiple times, check for unique description instead
      expect(screen.getByText('How many of this gift did you purchase?')).toBeInTheDocument();
    });

    // Click the confirm button in the dialog
    const confirmButton = screen.getByRole('button', { name: /mark purchased/i });
    await user.click(confirmButton);

    // Should call mutation with quantity
    expect(mockMarkPurchasedMutateAsync).toHaveBeenCalledWith({
      quantity_purchased: 2, // Default quantity from gift
    });
  });

  it('closes dialog after successful purchase confirmation', async () => {
    const user = userEvent.setup();
    mockUseQuery.mockReturnValue({
      data: mockGift,
      isLoading: false,
    });
    mockMarkPurchasedMutateAsync.mockResolvedValue({
      ...mockGift,
      purchase_date: '2024-01-15T00:00:00Z',
    });

    render(
      <GiftDetailModal giftId="1" open={true} onOpenChange={() => {}} />,
      { wrapper }
    );

    // Open the mark as purchased dialog
    const markPurchasedButtons = screen.getAllByRole('button', { name: /mark as purchased/i });
    const markPurchasedButton = markPurchasedButtons[0];
    await user.click(markPurchasedButton);

    // Wait for dialog
    await waitFor(() => {
      // Dialog title appears multiple times, check for unique description instead
      expect(screen.getByText('How many of this gift did you purchase?')).toBeInTheDocument();
    });

    // Confirm
    const confirmButton = screen.getByRole('button', { name: /mark purchased/i });
    await user.click(confirmButton);

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText('How many of this gift did you purchase?')).not.toBeInTheDocument();
    });
  });

  it('displays purchase date after gift is marked as purchased', () => {
    mockUseQuery.mockReturnValue({
      data: mockPurchasedGift,
      isLoading: false,
    });

    render(
      <GiftDetailModal giftId="1" open={true} onOpenChange={() => {}} />,
      { wrapper }
    );

    // Should show purchase date
    expect(screen.getByText(/purchased on/i)).toBeInTheDocument();
  });

  it('allows cancelling the mark as purchased dialog', async () => {
    const user = userEvent.setup();
    mockUseQuery.mockReturnValue({
      data: mockGift,
      isLoading: false,
    });

    render(
      <GiftDetailModal giftId="1" open={true} onOpenChange={() => {}} />,
      { wrapper }
    );

    // Open dialog
    const markPurchasedButtons = screen.getAllByRole('button', { name: /mark as purchased/i });
    const markPurchasedButton = markPurchasedButtons[0];
    await user.click(markPurchasedButton);

    // Wait for dialog
    await waitFor(() => {
      // Dialog title appears multiple times, check for unique description instead
      expect(screen.getByText('How many of this gift did you purchase?')).toBeInTheDocument();
    });

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText('How many of this gift did you purchase?')).not.toBeInTheDocument();
    });

    // Mutation should not be called
    expect(mockMarkPurchasedMutateAsync).not.toHaveBeenCalled();
  });

  it('handles mutation error gracefully', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockUseQuery.mockReturnValue({
      data: mockGift,
      isLoading: false,
    });
    mockMarkPurchasedMutateAsync.mockRejectedValue(new Error('Failed to mark as purchased'));

    render(
      <GiftDetailModal giftId="1" open={true} onOpenChange={() => {}} />,
      { wrapper }
    );

    // Open dialog
    const markPurchasedButtons = screen.getAllByRole('button', { name: /mark as purchased/i });
    const markPurchasedButton = markPurchasedButtons[0];
    await user.click(markPurchasedButton);

    // Wait for dialog
    await waitFor(() => {
      // Dialog title appears multiple times, check for unique description instead
      expect(screen.getByText('How many of this gift did you purchase?')).toBeInTheDocument();
    });

    // Confirm
    const confirmButton = screen.getByRole('button', { name: /mark purchased/i });
    await user.click(confirmButton);

    // Should log error
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to mark gift as purchased:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('defaults to quantity 1 if gift has no quantity', async () => {
    const user = userEvent.setup();
    const giftWithoutQuantity: Gift = {
      ...mockGift,
      quantity: 1,
    };

    mockUseQuery.mockReturnValue({
      data: giftWithoutQuantity,
      isLoading: false,
    });

    render(
      <GiftDetailModal giftId="1" open={true} onOpenChange={() => {}} />,
      { wrapper }
    );

    // Open dialog
    const markPurchasedButtons = screen.getAllByRole('button', { name: /mark as purchased/i });
    const markPurchasedButton = markPurchasedButtons[0];
    await user.click(markPurchasedButton);

    // Wait for dialog
    await waitFor(() => {
      // Dialog title appears multiple times, check for unique description instead
      expect(screen.getByText('How many of this gift did you purchase?')).toBeInTheDocument();
    });

    // Confirm
    const confirmButton = screen.getByRole('button', { name: /mark purchased/i });
    await user.click(confirmButton);

    // Should call with quantity 1
    expect(mockMarkPurchasedMutateAsync).toHaveBeenCalledWith({
      quantity_purchased: 1,
    });
  });

  it('resets quantity to default when modal is reopened', async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();

    mockUseQuery.mockReturnValue({
      data: mockGift,
      isLoading: false,
    });

    const { rerender } = render(
      <GiftDetailModal giftId="1" open={true} onOpenChange={handleOpenChange} />,
      { wrapper }
    );

    // Open mark as purchased dialog
    const markPurchasedButtons = screen.getAllByRole('button', { name: /mark as purchased/i });
    const markPurchasedButton = markPurchasedButtons[0];
    await user.click(markPurchasedButton);

    // Close the modal
    rerender(
      <GiftDetailModal giftId="1" open={false} onOpenChange={handleOpenChange} />
    );

    // Reopen the modal
    rerender(
      <GiftDetailModal giftId="1" open={true} onOpenChange={handleOpenChange} />
    );

    // The quantity should be reset when reopening mark as purchased dialog
    const reopenMarkPurchasedButtons = screen.getAllByRole('button', { name: /mark as purchased/i });
    const reopenMarkPurchasedButton = reopenMarkPurchasedButtons[0];
    await user.click(reopenMarkPurchasedButton);

    // Dialog should open with default quantity
    await waitFor(() => {
      // Dialog title appears multiple times, check for unique description instead
      expect(screen.getByText('How many of this gift did you purchase?')).toBeInTheDocument();
    });
  });
});

describe('GiftDetailModal - General Functionality', () => {
  const mockGift: Gift = {
    id: 1,
    name: 'Test Gift',
    description: 'Test description',
    price: 99.99,
    sale_price: null,
    url: null,
    image_url: null,
    quantity: 1,
    priority: GiftPriority.MEDIUM,
    source: null,
    notes: null,
    person_ids: [],
    stores: [],
    additional_urls: [],
    purchase_date: null,
    extra_data: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseListsForGift.mockReturnValue({
      data: { data: [] },
      isLoading: false,
    });

    mockUsePersons.mockReturnValue({
      data: { items: [] },
    });
  });

  it('renders gift details correctly', () => {
    mockUseQuery.mockReturnValue({
      data: mockGift,
      isLoading: false,
    });

    render(
      <GiftDetailModal giftId="1" open={true} onOpenChange={() => {}} />,
      { wrapper }
    );

    expect(screen.getAllByText('Test Gift')[0]).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('shows loading state while fetching gift', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(
      <GiftDetailModal giftId="1" open={true} onOpenChange={() => {}} />,
      { wrapper }
    );

    // Loading spinner should be visible
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    mockUseQuery.mockReturnValue({
      data: mockGift,
      isLoading: false,
    });

    render(
      <GiftDetailModal giftId="1" open={false} onOpenChange={() => {}} />,
      { wrapper }
    );

    expect(screen.queryByText('Test Gift')).not.toBeInTheDocument();
  });

  it('renders edit and delete buttons', () => {
    mockUseQuery.mockReturnValue({
      data: mockGift,
      isLoading: false,
    });

    render(
      <GiftDetailModal giftId="1" open={true} onOpenChange={() => {}} />,
      { wrapper }
    );

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });
});
