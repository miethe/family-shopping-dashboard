/**
 * GiftDetailModal Link/Unlink Flow Tests
 *
 * Tests for linking and unlinking people to/from gifts in the GiftDetailModal.
 * Covers the edit flow, person selection via PeopleMultiSelect, and unlinking
 * with confirmation dialog.
 *
 * Test ID: QA-FR1-02-01
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GiftDetailModal } from '../GiftDetailModal';
import type { Gift } from '@/types';
import { GiftPriority } from '@/types';

// Mock hooks only - don't mock components
vi.mock('@/hooks/useGifts');
vi.mock('@/hooks/usePersons');
vi.mock('@/hooks/useLists');
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 1, email: 'test@example.com', display_name: 'Test User' } }),
}));

// Mock confirm dialog - simplified for testing
const mockConfirmFn = vi.fn(async () => true);

vi.mock('@/components/ui/confirm-dialog', () => ({
  useConfirmDialog: () => ({
    confirm: mockConfirmFn,
    dialog: null,
  }),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

import * as useGiftsModule from '@/hooks/useGifts';
import * as usePersonsModule from '@/hooks/usePersons';
import * as useListsModule from '@/hooks/useLists';

// Sample data
const mockGift: Gift = {
  id: 123,
  name: 'LEGO Star Wars Set',
  description: 'A cool LEGO set',
  url: 'https://example.com/lego',
  image_url: 'https://example.com/lego.jpg',
  price: 99.99,
  sale_price: null,
  quantity: 1,
  priority: GiftPriority.HIGH,
  source: 'Amazon',
  person_ids: [1],
  stores: [],
  additional_urls: [],
  notes: '',
  purchase_date: null,
  extra_data: { status: 'idea' },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockPersonsData = {
  items: [
    {
      id: 1,
      display_name: 'Alice Johnson',
      photo_url: null,
      relationship: 'Sister',
      groups: [],
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      display_name: 'Bob Smith',
      photo_url: null,
      relationship: 'Brother',
      groups: [],
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 3,
      display_name: 'Charlie Brown',
      photo_url: null,
      relationship: 'Friend',
      groups: [],
      created_at: '2024-01-01T00:00:00Z',
    },
  ],
  total: 3,
  next_cursor: null,
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('GiftDetailModal - Link/Unlink People Flows', () => {
  const mockAttachPeopleMutateAsync = vi.fn();
  const mockDetachPersonMutateAsync = vi.fn();

  // Helper to switch to Linked Entities tab and get the tab panel
  const switchToLinkedEntitiesTab = async () => {
    const linkedTab = screen.getByRole('tab', { name: /linked entities/i });
    await userEvent.click(linkedTab);
    return screen.getByRole('tabpanel', { name: /linked entities/i });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirmFn.mockClear();
    mockConfirmFn.mockResolvedValue(true); // Default to accepting confirmation
    queryClient.clear();

    // Setup useGifts mocks
    vi.mocked(useGiftsModule.useGift).mockReturnValue({
      data: mockGift,
      isLoading: false,
    } as any);

    vi.mocked(useGiftsModule.useDeleteGift).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useGiftsModule.useUpdateGift).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useGiftsModule.useAttachPeopleToGift).mockReturnValue({
      mutateAsync: mockAttachPeopleMutateAsync,
      isPending: false,
      isError: false,
    } as any);

    vi.mocked(useGiftsModule.useDetachPersonFromGift).mockReturnValue({
      mutateAsync: mockDetachPersonMutateAsync,
      isPending: false,
      isError: false,
    } as any);

    vi.mocked(useGiftsModule.useMarkGiftPurchased).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    // Setup usePersons mock
    vi.mocked(usePersonsModule.usePersons).mockReturnValue({
      data: mockPersonsData,
      isLoading: false,
    } as any);

    vi.mocked(usePersonsModule.useCreatePerson).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    // Setup useLists mock
    vi.mocked(useListsModule.useListsForGift).mockReturnValue({
      data: { data: [] },
      isLoading: false,
    } as any);

    // Set up query client with gift data
    queryClient.setQueryData(['gifts', 123], mockGift);
  });

  describe('Link Person Flow', () => {
    it('shows linked people section in Linked Entities tab', async () => {
      render(
        <GiftDetailModal giftId="123" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      // Switch to Linked Entities tab
      const linkedTab = screen.getByRole('tab', { name: /linked entities/i });
      await userEvent.click(linkedTab);

      // Should see the Linked People section
      expect(screen.getByText(/linked people/i)).toBeInTheDocument();
      expect(
        screen.getByText(/people this gift is for/i)
      ).toBeInTheDocument();
    });

    it('displays currently linked people', async () => {
      render(
        <GiftDetailModal giftId="123" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      // Switch to Linked Entities tab
      const linkedTab = screen.getByRole('tab', { name: /linked entities/i });
      await userEvent.click(linkedTab);

      // Should show Alice Johnson (ID 1) as linked
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    it('shows Edit button when not in editing mode', async () => {
      render(
        <GiftDetailModal giftId="123" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      // Switch to Linked Entities tab
      const linkedTab = screen.getByRole('tab', { name: /linked entities/i });
      await userEvent.click(linkedTab);

      // Get the tab panel and find Edit button within it
      const tabPanel = screen.getByRole('tabpanel', { name: /linked entities/i });
      const editButton = within(tabPanel).getByRole('button', { name: /^edit$/i });
      expect(editButton).toBeInTheDocument();
    });

    it('enters edit mode when Edit button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <GiftDetailModal giftId="123" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      // Switch to Linked Entities tab
      const linkedTab = screen.getByRole('tab', { name: /linked entities/i });
      await user.click(linkedTab);

      // Click Edit button within the tab panel
      const tabPanel = screen.getByRole('tabpanel', { name: /linked entities/i });
      const editButton = within(tabPanel).getByRole('button', { name: /^edit$/i });
      await user.click(editButton);

      // Should show Save and Cancel buttons within the tab panel
      expect(within(tabPanel).getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(within(tabPanel).getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('allows selecting additional people via PeopleMultiSelect', async () => {
      const user = userEvent.setup();
      render(
        <GiftDetailModal giftId="123" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      // Switch to Linked Entities tab and enter edit mode
      const tabPanel = await switchToLinkedEntitiesTab();
      const editButton = within(tabPanel).getByRole('button', { name: /^edit$/i });
      await user.click(editButton);

      // Should show Alice Johnson (Person 1) as already selected
      expect(within(tabPanel).getByText('Alice Johnson')).toBeInTheDocument();

      // Select Bob Smith (Person 2) by clicking the button with Plus icon
      const selectBobButton = within(tabPanel).getByRole('button', { name: /bob smith/i });
      await user.click(selectBobButton);

      // Should now see both people selected in the tab panel
      expect(within(tabPanel).getAllByText('Alice Johnson').length).toBeGreaterThan(0);
      expect(within(tabPanel).getAllByText('Bob Smith').length).toBeGreaterThan(0);
    });

    it('calls attachPeople API with correct person IDs when Save is clicked', async () => {
      const user = userEvent.setup();
      mockAttachPeopleMutateAsync.mockResolvedValue({
        ...mockGift,
        person_ids: [1, 2],
      });

      render(
        <GiftDetailModal giftId="123" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      // Switch to Linked Entities tab and enter edit mode
      const tabPanel = await switchToLinkedEntitiesTab();
      const editButton = within(tabPanel).getByRole('button', { name: /^edit$/i });
      await user.click(editButton);

      // Select Bob Smith (Person 2)
      const selectBobButton = within(tabPanel).getByRole('button', { name: /bob smith/i });
      await user.click(selectBobButton);

      // Click Save
      const saveButton = within(tabPanel).getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Should call attachPeople with [1, 2]
      await waitFor(() => {
        expect(mockAttachPeopleMutateAsync).toHaveBeenCalledWith([1, 2]);
      });
    });

    it('exits edit mode after successful save', async () => {
      const user = userEvent.setup();
      mockAttachPeopleMutateAsync.mockResolvedValue({
        ...mockGift,
        person_ids: [1, 2],
      });

      render(
        <GiftDetailModal giftId="123" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      // Switch to Linked Entities tab and enter edit mode
      const tabPanel = await switchToLinkedEntitiesTab();
      const editButton = within(tabPanel).getByRole('button', { name: /^edit$/i });
      await user.click(editButton);

      // Select Bob Smith (Person 2)
      const selectBobButton = within(tabPanel).getByRole('button', { name: /bob smith/i });
      await user.click(selectBobButton);

      // Click Save
      const saveButton = within(tabPanel).getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Should exit edit mode - the Save and Cancel buttons should be gone from tab panel
      await waitFor(() => {
        const updatedTabPanel = screen.getByRole('tabpanel', { name: /linked entities/i });
        expect(within(updatedTabPanel).queryByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
      });

      // Edit button should be back in the tab panel
      const updatedTabPanel = screen.getByRole('tabpanel', { name: /linked entities/i });
      expect(within(updatedTabPanel).getByRole('button', { name: /^edit$/i })).toBeInTheDocument();
    });

    it('cancels edit mode when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <GiftDetailModal giftId="123" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      // Switch to Linked Entities tab and enter edit mode
      const tabPanel = await switchToLinkedEntitiesTab();
      const editButton = within(tabPanel).getByRole('button', { name: /^edit$/i });
      await user.click(editButton);

      // Select Bob Smith (Person 2)
      const selectBobButton = within(tabPanel).getByRole('button', { name: /bob smith/i });
      await user.click(selectBobButton);

      // Click Cancel
      const cancelButton = within(tabPanel).getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Should exit edit mode without saving
      await waitFor(() => {
        const updatedTabPanel = screen.getByRole('tabpanel', { name: /linked entities/i });
        expect(within(updatedTabPanel).queryByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
      });
      expect(mockAttachPeopleMutateAsync).not.toHaveBeenCalled();

      // Edit button should be back in the tab panel
      const updatedTabPanel = screen.getByRole('tabpanel', { name: /linked entities/i });
      expect(within(updatedTabPanel).getByRole('button', { name: /^edit$/i })).toBeInTheDocument();
    });

    it('disables Save and Cancel buttons during submission', async () => {
      const user = userEvent.setup();

      // Update the mock to return isPending: true
      vi.mocked(useGiftsModule.useAttachPeopleToGift).mockReturnValue({
        mutateAsync: mockAttachPeopleMutateAsync,
        isPending: true,
        isError: false,
      } as any);

      render(
        <GiftDetailModal giftId="123" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      // Switch to Linked Entities tab and enter edit mode
      const tabPanel = await switchToLinkedEntitiesTab();
      const editButton = within(tabPanel).getByRole('button', { name: /^edit$/i });
      await user.click(editButton);

      // Should disable Save and Cancel buttons
      const saveButton = within(tabPanel).getByRole('button', { name: /save/i });
      const cancelButton = within(tabPanel).getByRole('button', { name: /cancel/i });

      expect(saveButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it('shows loading state on Save button during submission', async () => {
      const user = userEvent.setup();

      // Update the mock to return isPending: true
      vi.mocked(useGiftsModule.useAttachPeopleToGift).mockReturnValue({
        mutateAsync: mockAttachPeopleMutateAsync,
        isPending: true,
        isError: false,
      } as any);

      render(
        <GiftDetailModal giftId="123" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      // Switch to Linked Entities tab and enter edit mode
      const tabPanel = await switchToLinkedEntitiesTab();
      const editButton = within(tabPanel).getByRole('button', { name: /^edit$/i });
      await user.click(editButton);

      // Save button should be disabled when isPending
      const saveButton = within(tabPanel).getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Unlink Person Flow', () => {
    it('shows unlink button on linked person row', async () => {
      render(
        <GiftDetailModal giftId="123" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      // Switch to Linked Entities tab
      const linkedTab = screen.getByRole('tab', { name: /linked entities/i });
      await userEvent.click(linkedTab);

      // Should show unlink button for Alice Johnson
      const unlinkButton = screen.getByRole('button', {
        name: /unlink alice johnson/i,
      });
      expect(unlinkButton).toBeInTheDocument();
    });

    it('calls confirm dialog when unlink button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <GiftDetailModal giftId="123" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      // Switch to Linked Entities tab
      const linkedTab = screen.getByRole('tab', { name: /linked entities/i });
      await user.click(linkedTab);

      // Click unlink button
      const unlinkButton = screen.getByRole('button', {
        name: /unlink alice johnson/i,
      });
      await user.click(unlinkButton);

      // Should call confirm dialog with correct options
      await waitFor(() => {
        expect(mockConfirmFn).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Unlink Person",
            description: expect.stringContaining("Alice Johnson"),
          })
        );
      });
    });

    it('calls detachPerson API when confirmation is accepted', async () => {
      const user = userEvent.setup();
      mockConfirmFn.mockResolvedValueOnce(true);
      mockDetachPersonMutateAsync.mockResolvedValue({
        ...mockGift,
        person_ids: [],
      });

      render(
        <GiftDetailModal giftId="123" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      // Switch to Linked Entities tab and click unlink
      const linkedTab = screen.getByRole('tab', { name: /linked entities/i });
      await user.click(linkedTab);
      const unlinkButton = screen.getByRole('button', {
        name: /unlink alice johnson/i,
      });
      await user.click(unlinkButton);

      // Should call detachPerson with person ID 1
      await waitFor(() => {
        expect(mockDetachPersonMutateAsync).toHaveBeenCalledWith(1);
      });
    });

    it('does not call API when confirmation is cancelled', async () => {
      const user = userEvent.setup();
      mockConfirmFn.mockResolvedValueOnce(false); // User cancels

      render(
        <GiftDetailModal giftId="123" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      // Switch to Linked Entities tab and click unlink
      const linkedTab = screen.getByRole('tab', { name: /linked entities/i });
      await user.click(linkedTab);
      const unlinkButton = screen.getByRole('button', {
        name: /unlink alice johnson/i,
      });
      await user.click(unlinkButton);

      // Wait a bit to ensure no API call
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not call detachPerson
      expect(mockDetachPersonMutateAsync).not.toHaveBeenCalled();
    });

    it('disables unlink button during pending mutation', async () => {
      // Update the mock to return isPending: true
      vi.mocked(useGiftsModule.useDetachPersonFromGift).mockReturnValue({
        mutateAsync: mockDetachPersonMutateAsync,
        isPending: true,
        isError: false,
      } as any);

      render(
        <GiftDetailModal giftId="123" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      // Switch to Linked Entities tab
      const linkedTab = screen.getByRole('tab', { name: /linked entities/i });
      await userEvent.click(linkedTab);

      // Unlink button should be disabled
      const unlinkButton = screen.getByRole('button', {
        name: /unlink alice johnson/i,
      });
      expect(unlinkButton).toBeDisabled();
    });

    it('handles multiple people being linked', async () => {
      const giftWithMultiplePeople = { ...mockGift, person_ids: [1, 2, 3] };

      // Update both the hook mock and query client
      vi.mocked(useGiftsModule.useGift).mockReturnValue({
        data: giftWithMultiplePeople,
        isLoading: false,
      } as any);
      queryClient.setQueryData(['gifts', 123], giftWithMultiplePeople);

      render(
        <GiftDetailModal giftId="123" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      // Switch to Linked Entities tab
      const linkedTab = screen.getByRole('tab', { name: /linked entities/i });
      await userEvent.click(linkedTab);

      // Should show all three people
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument();

      // Should have unlink buttons for each
      expect(
        screen.getByRole('button', { name: /unlink alice johnson/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /unlink bob smith/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /unlink charlie brown/i })
      ).toBeInTheDocument();
    });

    it('shows empty state when no people are linked', async () => {
      const giftWithNoPeople = { ...mockGift, person_ids: [] };

      // Update both the hook mock and query client
      vi.mocked(useGiftsModule.useGift).mockReturnValue({
        data: giftWithNoPeople,
        isLoading: false,
      } as any);
      queryClient.setQueryData(['gifts', 123], giftWithNoPeople);

      render(
        <GiftDetailModal giftId="123" open={true} onOpenChange={vi.fn()} />,
        { wrapper }
      );

      // Switch to Linked Entities tab
      const linkedTab = screen.getByRole('tab', { name: /linked entities/i });
      await userEvent.click(linkedTab);

      // Should show empty state
      expect(
        screen.getByText(/no people linked to this gift/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /link people/i })
      ).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('resets editing state when modal is closed and reopened', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      const { rerender } = render(
        <GiftDetailModal giftId="123" open={true} onOpenChange={onOpenChange} />,
        { wrapper }
      );

      // Switch to Linked Entities tab and enter edit mode
      const tabPanel = await switchToLinkedEntitiesTab();
      const editButton = within(tabPanel).getByRole('button', { name: /^edit$/i });
      await user.click(editButton);

      // Should be in edit mode (Save button visible)
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();

      // Close modal
      rerender(
        <GiftDetailModal
          giftId="123"
          open={false}
          onOpenChange={onOpenChange}
        />
      );

      // Reopen modal
      rerender(
        <GiftDetailModal giftId="123" open={true} onOpenChange={onOpenChange} />
      );

      // Should NOT be in edit mode (Save button should not exist)
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
      });

      // Should be on Overview tab (default)
      expect(screen.getByRole('tab', { name: /overview/i })).toHaveAttribute(
        'data-state',
        'active'
      );
    });
  });
});
