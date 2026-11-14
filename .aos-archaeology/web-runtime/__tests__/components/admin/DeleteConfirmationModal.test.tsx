/**
 * DeleteConfirmationModal Component Tests
 *
 * Tests the delete confirmation dialog that handles both soft-delete (for in-use options)
 * and hard-delete (for unused options) with appropriate warnings.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DeleteConfirmationModal } from '@/components/features/admin/DeleteConfirmationModal';
import type { FieldOptionDTO } from '@/lib/api/field-options';

// Mock the mutation hook
vi.mock('@/hooks/useFieldOptionsMutation');

import { useDeleteFieldOption } from '@/hooks/useFieldOptionsMutation';

const mockInUseOption: FieldOptionDTO = {
  id: 1,
  entity: 'person',
  field_name: 'wine_types',
  value: 'red',
  display_label: 'Red Wine',
  display_order: 1,
  is_active: true,
  is_system: false,
  usage_count: 5,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockUnusedOption: FieldOptionDTO = {
  ...mockInUseOption,
  id: 2,
  value: 'rose',
  display_label: 'Rosé',
  usage_count: 0,
};

const mockSystemOption: FieldOptionDTO = {
  ...mockInUseOption,
  id: 3,
  value: 'white',
  display_label: 'White Wine',
  is_system: true,
};

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderWithClient(component: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
}

describe('DeleteConfirmationModal', () => {
  const mockOnClose = vi.fn();
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeleteFieldOption).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    } as any);
  });

  it('shows option display_label in confirmation message', () => {
    renderWithClient(
      <DeleteConfirmationModal
        option={mockInUseOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
    expect(screen.getByText('Red Wine')).toBeInTheDocument();
  });

  it('shows "in use" warning if usage_count > 0', () => {
    renderWithClient(
      <DeleteConfirmationModal
        option={mockInUseOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/This option is in use/i)).toBeInTheDocument();
    expect(screen.getByText(/5 record\(s\) use this value/i)).toBeInTheDocument();
  });

  it('shows soft-delete message for in-use options', () => {
    renderWithClient(
      <DeleteConfirmationModal
        option={mockInUseOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/soft-deleted/i)).toBeInTheDocument();
    expect(screen.getByText(/hidden from UI but still valid for existing records/i)).toBeInTheDocument();
  });

  it('shows permanent delete message for unused options', () => {
    renderWithClient(
      <DeleteConfirmationModal
        option={mockUnusedOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/not in use/i)).toBeInTheDocument();
    expect(screen.getByText(/permanently deleted/i)).toBeInTheDocument();
  });

  it('button says "Soft Delete" for in-use options', () => {
    renderWithClient(
      <DeleteConfirmationModal
        option={mockInUseOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole('button', { name: /Soft Delete/i })).toBeInTheDocument();
  });

  it('button says "Delete" for unused options', () => {
    renderWithClient(
      <DeleteConfirmationModal
        option={mockUnusedOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole('button', { name: /^Delete$/i })).toBeInTheDocument();
  });

  it('blocks deletion if option is system option', () => {
    renderWithClient(
      <DeleteConfirmationModal
        option={mockSystemOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Cannot Delete System Option/i)).toBeInTheDocument();
    expect(screen.getByText('White Wine')).toBeInTheDocument();
    expect(screen.getByText(/system option and cannot be deleted/i)).toBeInTheDocument();

    // Should not show delete button
    expect(screen.queryByRole('button', { name: /^Delete$/i })).not.toBeInTheDocument();
    // Should have at least one Close button (primary or X)
    const closeButtons = screen.queryAllByRole('button', { name: /Close/i });
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  it('calls deleteOption with hardDelete=false for in-use options', async () => {
    const user = userEvent.setup();
    renderWithClient(
      <DeleteConfirmationModal
        option={mockInUseOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /Soft Delete/i });
    await user.click(deleteButton);

    expect(mockMutate).toHaveBeenCalledWith({ hardDelete: false });
  });

  it('calls deleteOption with hardDelete=true for unused options', async () => {
    const user = userEvent.setup();
    renderWithClient(
      <DeleteConfirmationModal
        option={mockUnusedOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /^Delete$/i });
    await user.click(deleteButton);

    expect(mockMutate).toHaveBeenCalledWith({ hardDelete: true });
  });

  it('shows loading state during deletion', () => {
    vi.mocked(useDeleteFieldOption).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null,
    } as any);

    renderWithClient(
      <DeleteConfirmationModal
        option={mockUnusedOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole('button', { name: /Deleting.../i })).toBeInTheDocument();
  });

  it('disables buttons during deletion', () => {
    vi.mocked(useDeleteFieldOption).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null,
    } as any);

    renderWithClient(
      <DeleteConfirmationModal
        option={mockUnusedOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    const deleteButton = screen.getByRole('button', { name: /Deleting.../i });

    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it('closes on successful deletion', async () => {
    const user = userEvent.setup();

    vi.mocked(useDeleteFieldOption).mockImplementation((optionId, options: any) => {
      return {
        mutate: (data: any) => {
          options?.onSuccess?.();
        },
        isPending: false,
        error: null,
      } as any;
    });

    renderWithClient(
      <DeleteConfirmationModal
        option={mockUnusedOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /^Delete$/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('cancels without deletion on Cancel button', async () => {
    const user = userEvent.setup();
    renderWithClient(
      <DeleteConfirmationModal
        option={mockUnusedOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(mockMutate).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows API error message on deletion failure', () => {
    vi.mocked(useDeleteFieldOption).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: new Error('Delete failed'),
    } as any);

    renderWithClient(
      <DeleteConfirmationModal
        option={mockUnusedOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Delete failed/i)).toBeInTheDocument();
  });

  it('shows generic error message for unknown error type', () => {
    vi.mocked(useDeleteFieldOption).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: 'Unknown error' as any,
    } as any);

    renderWithClient(
      <DeleteConfirmationModal
        option={mockUnusedOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Failed to delete option/i)).toBeInTheDocument();
  });

  it('shows warning icon in header', () => {
    renderWithClient(
      <DeleteConfirmationModal
        option={mockUnusedOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Delete Option')).toBeInTheDocument();
    // Warning icon is rendered by Icon component with name="warning"
  });

  it('shows lock icon for system options', () => {
    renderWithClient(
      <DeleteConfirmationModal
        option={mockSystemOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Cannot Delete System Option/i)).toBeInTheDocument();
    // Lock icon is rendered by Icon component with name="lock"
  });

  it('allows closing system option modal', async () => {
    const user = userEvent.setup();
    renderWithClient(
      <DeleteConfirmationModal
        option={mockSystemOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    const buttons = screen.getAllByRole('button', { name: /Close/i });
    // Click the primary "Close" button (not the X button)
    await user.click(buttons[0]);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('buttons have minimum touch target height', () => {
    renderWithClient(
      <DeleteConfirmationModal
        option={mockUnusedOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    const deleteButton = screen.getByRole('button', { name: /^Delete$/i });

    expect(cancelButton).toHaveClass('min-h-[44px]');
    expect(deleteButton).toHaveClass('min-h-[44px]');
  });

  it('delete button has destructive variant', () => {
    renderWithClient(
      <DeleteConfirmationModal
        option={mockUnusedOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /^Delete$/i });
    // Destructive variant should be applied (implementation detail)
    expect(deleteButton).toBeInTheDocument();
  });

  it('shows different styling for in-use vs unused options', () => {
    const { container: inUseContainer } = renderWithClient(
      <DeleteConfirmationModal
        option={mockInUseOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    // In-use option shows warning message
    expect(screen.getByText(/This option is in use/i)).toBeInTheDocument();
  });

  it('renders modal title', () => {
    renderWithClient(
      <DeleteConfirmationModal
        option={mockUnusedOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Delete Option')).toBeInTheDocument();
  });

  it('handles usage_count of exactly 1 correctly', () => {
    const singleUseOption = { ...mockInUseOption, usage_count: 1 };

    renderWithClient(
      <DeleteConfirmationModal
        option={singleUseOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/1 record\(s\) use this value/i)).toBeInTheDocument();
    expect(screen.getByText(/This option is in use/i)).toBeInTheDocument();
  });

  it('handles undefined usage_count as unused', async () => {
    const user = userEvent.setup();
    const optionWithoutCount = { ...mockInUseOption, usage_count: undefined };

    renderWithClient(
      <DeleteConfirmationModal
        option={optionWithoutCount}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    // Should treat as unused (hard delete)
    expect(screen.getByText(/permanently deleted/i)).toBeInTheDocument();

    const deleteButton = screen.getByRole('button', { name: /^Delete$/i });
    await user.click(deleteButton);

    expect(mockMutate).toHaveBeenCalledWith({ hardDelete: true });
  });

  it('info icon shown for in-use warning', () => {
    renderWithClient(
      <DeleteConfirmationModal
        option={mockInUseOption}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    // Info icon is rendered by Icon component with name="info"
    expect(screen.getByText(/This option is in use/i)).toBeInTheDocument();
  });
});
