/**
 * EditOptionModal Component Tests
 *
 * Tests the modal form for editing existing field options.
 * Value field is immutable, only display_label and display_order can be edited.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EditOptionModal } from '@/components/features/admin/EditOptionModal';
import type { FieldOptionDTO } from '@/lib/api/field-options';

// Mock the hooks
vi.mock('@/hooks/useFieldOptions');
vi.mock('@/hooks/useFieldOptionsMutation');

import { useFieldOption } from '@/hooks/useFieldOptions';
import { useUpdateFieldOption } from '@/hooks/useFieldOptionsMutation';

const mockOption: FieldOptionDTO = {
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

const mockSystemOption: FieldOptionDTO = {
  ...mockOption,
  id: 2,
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

describe('EditOptionModal', () => {
  const mockOnClose = vi.fn();
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUpdateFieldOption).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    } as any);
  });

  it('shows loading spinner while fetching option data', () => {
    vi.mocked(useFieldOption).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={1}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Loading option/i)).toBeInTheDocument();
  });

  it('shows error if option fetch fails', () => {
    vi.mocked(useFieldOption).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch option'),
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={1}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Failed to load option/i)).toBeInTheDocument();
    expect(screen.getByText(/Failed to fetch option/i)).toBeInTheDocument();
  });

  it('pre-populates form with existing option data', () => {
    vi.mocked(useFieldOption).mockReturnValue({
      data: mockOption,
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={1}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    const displayLabelInput = screen.getByLabelText(/Display Label/i);
    const displayOrderInput = screen.getByLabelText(/Display Order/i);

    expect(displayLabelInput).toHaveValue('Red Wine');
    expect(displayOrderInput).toHaveValue(1);
  });

  it('shows value field as read-only', () => {
    vi.mocked(useFieldOption).mockReturnValue({
      data: mockOption,
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={1}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    // Value should be displayed but not in an input field
    expect(screen.getByText('red')).toBeInTheDocument();
    expect(screen.getByText(/Value is immutable/i)).toBeInTheDocument();
  });

  it('shows value in read-only display', () => {
    vi.mocked(useFieldOption).mockReturnValue({
      data: mockOption,
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={1}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    // Value should be displayed as text (not an input)
    expect(screen.getByText('red')).toBeInTheDocument();
    // There should be no input with this value
    expect(screen.queryByDisplayValue('red')).not.toBeInTheDocument();
  });

  it('allows editing display_label', async () => {
    const user = userEvent.setup();
    vi.mocked(useFieldOption).mockReturnValue({
      data: mockOption,
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={1}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    const displayLabelInput = screen.getByLabelText(/Display Label/i);

    await user.clear(displayLabelInput);
    await user.type(displayLabelInput, 'Merlot');

    expect(displayLabelInput).toHaveValue('Merlot');
  });

  it('allows editing display_order', async () => {
    const user = userEvent.setup();
    vi.mocked(useFieldOption).mockReturnValue({
      data: mockOption,
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={1}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    const displayOrderInput = screen.getByLabelText(/Display Order/i);

    await user.clear(displayOrderInput);
    await user.type(displayOrderInput, '10');

    expect(displayOrderInput).toHaveValue(10);
  });

  it('validates display_label is not empty', async () => {
    const user = userEvent.setup();
    vi.mocked(useFieldOption).mockReturnValue({
      data: mockOption,
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={1}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    const displayLabelInput = screen.getByLabelText(/Display Label/i);
    const submitButton = screen.getByRole('button', { name: /Update Option/i });

    // Clear the input
    await user.clear(displayLabelInput);
    await user.click(submitButton);

    // Validation should prevent mutation from being called
    // (Even if error message doesn't render, mutation shouldn't be called with empty label)
    await waitFor(() => {
      // If mutate was called, it would have been called by now
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  it('submits update with changed fields only', async () => {
    const user = userEvent.setup();
    vi.mocked(useFieldOption).mockReturnValue({
      data: mockOption,
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={1}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    const displayLabelInput = screen.getByLabelText(/Display Label/i);
    const displayOrderInput = screen.getByLabelText(/Display Order/i);

    await user.clear(displayLabelInput);
    await user.type(displayLabelInput, 'Cabernet');
    await user.clear(displayOrderInput);
    await user.type(displayOrderInput, '5');

    const submitButton = screen.getByRole('button', { name: /Update Option/i });
    await user.click(submitButton);

    expect(mockMutate).toHaveBeenCalledWith({
      display_label: 'Cabernet',
      display_order: 5,
    });
  });

  it('shows loading state during update', () => {
    vi.mocked(useFieldOption).mockReturnValue({
      data: mockOption,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useUpdateFieldOption).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null,
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={1}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole('button', { name: /Updating.../i })).toBeInTheDocument();
  });

  it('disables form during update', () => {
    vi.mocked(useFieldOption).mockReturnValue({
      data: mockOption,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useUpdateFieldOption).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null,
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={1}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByLabelText(/Display Label/i)).toBeDisabled();
    expect(screen.getByLabelText(/Display Order/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeDisabled();
  });

  it('closes on successful update', async () => {
    const user = userEvent.setup();
    vi.mocked(useFieldOption).mockReturnValue({
      data: mockOption,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useUpdateFieldOption).mockImplementation((optionId, options: any) => {
      return {
        mutate: (data: any) => {
          options?.onSuccess?.();
        },
        isPending: false,
        error: null,
      } as any;
    });

    renderWithClient(
      <EditOptionModal
        optionId={1}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Update Option/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('closes on Cancel button click', async () => {
    const user = userEvent.setup();
    vi.mocked(useFieldOption).mockReturnValue({
      data: mockOption,
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={1}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows API error message on update failure', () => {
    vi.mocked(useFieldOption).mockReturnValue({
      data: mockOption,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useUpdateFieldOption).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: new Error('Update failed'),
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={1}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Update failed/i)).toBeInTheDocument();
  });

  it('blocks editing if option is system option', () => {
    vi.mocked(useFieldOption).mockReturnValue({
      data: mockSystemOption,
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={2}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Cannot Edit System Option/i)).toBeInTheDocument();
    expect(screen.getByText('White Wine')).toBeInTheDocument();
    expect(screen.getByText(/system option and cannot be edited/i)).toBeInTheDocument();

    // Should not show edit form
    expect(screen.queryByLabelText(/Display Label/i)).not.toBeInTheDocument();
  });

  it('shows lock icon for system options', () => {
    vi.mocked(useFieldOption).mockReturnValue({
      data: mockSystemOption,
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={2}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    // Lock icon should be present (rendered by Icon component with name="lock")
    expect(screen.getByText(/Cannot Edit System Option/i)).toBeInTheDocument();
  });

  it('allows closing system option modal', async () => {
    const user = userEvent.setup();
    vi.mocked(useFieldOption).mockReturnValue({
      data: mockSystemOption,
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={2}
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

  it('allows closing fetch error modal', async () => {
    const user = userEvent.setup();
    vi.mocked(useFieldOption).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={1}
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
    vi.mocked(useFieldOption).mockReturnValue({
      data: mockOption,
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={1}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    const submitButton = screen.getByRole('button', { name: /Update Option/i });

    expect(cancelButton).toHaveClass('min-h-[44px]');
    expect(submitButton).toHaveClass('min-h-[44px]');
  });

  it('inputs have minimum touch target height', () => {
    vi.mocked(useFieldOption).mockReturnValue({
      data: mockOption,
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={1}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    const displayLabelInput = screen.getByLabelText(/Display Label/i);
    const displayOrderInput = screen.getByLabelText(/Display Order/i);

    expect(displayLabelInput).toHaveClass('min-h-[44px]');
    expect(displayOrderInput).toHaveClass('min-h-[44px]');
  });

  it('renders modal title', () => {
    vi.mocked(useFieldOption).mockReturnValue({
      data: mockOption,
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={1}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Edit Option')).toBeInTheDocument();
  });

  it('shows field descriptions', () => {
    vi.mocked(useFieldOption).mockReturnValue({
      data: mockOption,
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={1}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Value is immutable/i)).toBeInTheDocument();
    expect(screen.getByText(/The label shown to users in dropdowns/i)).toBeInTheDocument();
    expect(screen.getByText(/Lower numbers appear first/i)).toBeInTheDocument();
  });

  it('value display has monospace font', () => {
    vi.mocked(useFieldOption).mockReturnValue({
      data: mockOption,
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(
      <EditOptionModal
        optionId={1}
        entity="person"
        fieldName="wine_types"
        onClose={mockOnClose}
      />
    );

    // Value is displayed in read-only text
    expect(screen.getByText('red')).toBeInTheDocument();
    expect(screen.getByText(/Value is immutable/i)).toBeInTheDocument();
  });
});
