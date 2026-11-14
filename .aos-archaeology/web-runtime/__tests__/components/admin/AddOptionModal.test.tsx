/**
 * AddOptionModal Component Tests
 *
 * Tests the modal form for creating new field options with validation
 * and auto-generation of technical values from display labels.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AddOptionModal } from '@/components/features/admin/AddOptionModal';

// Mock the mutation hook
vi.mock('@/hooks/useFieldOptionsMutation');

import { useCreateFieldOption } from '@/hooks/useFieldOptionsMutation';

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

describe('AddOptionModal', () => {
  const mockOnClose = vi.fn();
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCreateFieldOption).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    } as any);
  });

  it('renders form with all required fields', () => {
    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    expect(screen.getByLabelText(/Display Label/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Value \(Key\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Display Order/i)).toBeInTheDocument();
  });

  it('renders modal title', () => {
    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    expect(screen.getByText('Add New Option')).toBeInTheDocument();
  });

  it('renders Cancel and Create buttons', () => {
    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Option/i })).toBeInTheDocument();
  });

  it('auto-generates value from display_label', async () => {
    const user = userEvent.setup();
    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    const displayLabelInput = screen.getByLabelText(/Display Label/i);
    const valueInput = screen.getByLabelText(/Value \(Key\)/i);

    await user.type(displayLabelInput, 'Red Wine');

    expect(valueInput).toHaveValue('red_wine');
  });

  it('converts spaces to underscores in auto-generated value', async () => {
    const user = userEvent.setup();
    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    const displayLabelInput = screen.getByLabelText(/Display Label/i);
    const valueInput = screen.getByLabelText(/Value \(Key\)/i);

    await user.type(displayLabelInput, 'Super Spicy Ramen');

    expect(valueInput).toHaveValue('super_spicy_ramen');
  });

  it('removes special characters from auto-generated value', async () => {
    const user = userEvent.setup();
    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    const displayLabelInput = screen.getByLabelText(/Display Label/i);
    const valueInput = screen.getByLabelText(/Value \(Key\)/i);

    await user.type(displayLabelInput, 'Rosé & Champagne!');

    // Auto-generated value should only contain valid characters (lowercase, numbers, underscores)
    const autoValue = valueInput.value;
    expect(autoValue).toMatch(/^[a-z0-9_]*$/);
    // Should remove special chars and spaces
    expect(autoValue).not.toContain('&');
    expect(autoValue).not.toContain('!');
  });

  it('converts value to lowercase on manual input', async () => {
    const user = userEvent.setup();
    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    const valueInput = screen.getByLabelText(/Value \(Key\)/i);

    await user.type(valueInput, 'RED_WINE');

    expect(valueInput).toHaveValue('red_wine');
  });

  it('validates display_label is required', async () => {
    const user = userEvent.setup();
    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    const submitButton = screen.getByRole('button', { name: /Create Option/i });
    await user.click(submitButton);

    // Mutation should not be called when form is invalid
    await waitFor(() => {
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  it('validates value is required', async () => {
    const user = userEvent.setup();
    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    const displayLabelInput = screen.getByLabelText(/Display Label/i);
    const valueInput = screen.getByLabelText(/Value \(Key\)/i);

    // Type and then clear the value field
    await user.type(displayLabelInput, 'Test');
    await user.clear(valueInput);

    const submitButton = screen.getByRole('button', { name: /Create Option/i });
    await user.click(submitButton);

    // Mutation should not be called when value is empty
    await waitFor(() => {
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  it('validates value format (lowercase, numbers, underscores only)', async () => {
    const user = userEvent.setup();
    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    const displayLabelInput = screen.getByLabelText(/Display Label/i);
    const valueInput = screen.getByLabelText(/Value \(Key\)/i);

    await user.type(displayLabelInput, 'Test');
    await user.clear(valueInput);
    await user.type(valueInput, 'invalid-value!');

    const submitButton = screen.getByRole('button', { name: /Create Option/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/lowercase letters, numbers, and underscores only/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('submits form with correct data structure', async () => {
    const user = userEvent.setup();
    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    const displayLabelInput = screen.getByLabelText(/Display Label/i);
    const displayOrderInput = screen.getByLabelText(/Display Order/i);

    await user.type(displayLabelInput, 'Red Wine');
    await user.clear(displayOrderInput);
    await user.type(displayOrderInput, '5');

    const submitButton = screen.getByRole('button', { name: /Create Option/i });
    await user.click(submitButton);

    expect(mockMutate).toHaveBeenCalledWith({
      entity: 'person',
      field_name: 'wine_types',
      value: 'red_wine',
      display_label: 'Red Wine',
      display_order: 5,
    });
  });

  it('trims whitespace from submitted values', async () => {
    const user = userEvent.setup();
    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    const displayLabelInput = screen.getByLabelText(/Display Label/i);

    // Type with whitespace (auto-generation handles value)
    await user.type(displayLabelInput, '  Red Wine  ');

    const submitButton = screen.getByRole('button', { name: /Create Option/i });
    await user.click(submitButton);

    // Wait for the mutation to be called
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });

    // Check that display_label was trimmed
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        display_label: 'Red Wine',
      })
    );
  });

  it('shows loading state during submission', () => {
    vi.mocked(useCreateFieldOption).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null,
    } as any);

    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    expect(screen.getByRole('button', { name: /Creating.../i })).toBeInTheDocument();
  });

  it('disables form inputs during submission', () => {
    vi.mocked(useCreateFieldOption).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null,
    } as any);

    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    expect(screen.getByLabelText(/Display Label/i)).toBeDisabled();
    expect(screen.getByLabelText(/Value \(Key\)/i)).toBeDisabled();
    expect(screen.getByLabelText(/Display Order/i)).toBeDisabled();
  });

  it('disables submit button during submission', () => {
    vi.mocked(useCreateFieldOption).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null,
    } as any);

    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    const submitButton = screen.getByRole('button', { name: /Creating.../i });
    expect(submitButton).toBeDisabled();
  });

  it('closes modal on successful submit', async () => {
    const user = userEvent.setup();

    // Mock successful mutation
    vi.mocked(useCreateFieldOption).mockImplementation((entity, fieldName, options: any) => {
      return {
        mutate: (data: any) => {
          // Immediately call onSuccess
          options?.onSuccess?.();
        },
        isPending: false,
        error: null,
      } as any;
    });

    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    const displayLabelInput = screen.getByLabelText(/Display Label/i);
    await user.type(displayLabelInput, 'Red Wine');

    const submitButton = screen.getByRole('button', { name: /Create Option/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('closes modal on Cancel button click', async () => {
    const user = userEvent.setup();
    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows API error message on mutation failure', () => {
    vi.mocked(useCreateFieldOption).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: new Error('Duplicate value'),
    } as any);

    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    expect(screen.getByText(/Duplicate value/i)).toBeInTheDocument();
  });

  it('shows generic error message for unknown error type', () => {
    vi.mocked(useCreateFieldOption).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: 'Unknown error' as any,
    } as any);

    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    expect(screen.getByText(/Failed to create option/i)).toBeInTheDocument();
  });

  it('buttons have minimum touch target height', () => {
    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    const submitButton = screen.getByRole('button', { name: /Create Option/i });

    expect(cancelButton).toHaveClass('min-h-[44px]');
    expect(submitButton).toHaveClass('min-h-[44px]');
  });

  it('inputs have minimum touch target height', () => {
    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    const displayLabelInput = screen.getByLabelText(/Display Label/i);
    const valueInput = screen.getByLabelText(/Value \(Key\)/i);
    const displayOrderInput = screen.getByLabelText(/Display Order/i);

    expect(displayLabelInput).toHaveClass('min-h-[44px]');
    expect(valueInput).toHaveClass('min-h-[44px]');
    expect(displayOrderInput).toHaveClass('min-h-[44px]');
  });

  it('shows helpful placeholder text', () => {
    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    const displayLabelInput = screen.getByLabelText(/Display Label/i);
    const valueInput = screen.getByLabelText(/Value \(Key\)/i);

    expect(displayLabelInput).toHaveAttribute('placeholder', expect.stringContaining('Sake'));
    expect(valueInput).toHaveAttribute('placeholder', expect.stringContaining('sake'));
  });

  it('shows field descriptions', () => {
    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    expect(screen.getByText(/The label shown to users in dropdowns/i)).toBeInTheDocument();
    expect(screen.getByText(/Immutable after creation/i)).toBeInTheDocument();
    expect(screen.getByText(/Lower numbers appear first/i)).toBeInTheDocument();
  });

  it('default display_order is 0', () => {
    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    const displayOrderInput = screen.getByLabelText(/Display Order/i);
    expect(displayOrderInput).toHaveValue(0);
  });

  it('handles non-numeric display_order input', async () => {
    const user = userEvent.setup();
    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    const displayOrderInput = screen.getByLabelText(/Display Order/i);

    await user.clear(displayOrderInput);
    await user.type(displayOrderInput, 'abc');

    // Should default to 0 for invalid input
    expect(displayOrderInput).toHaveValue(0);
  });

  it('value field has monospace font', () => {
    renderWithClient(
      <AddOptionModal entity="person" fieldName="wine_types" onClose={mockOnClose} />
    );

    const valueInput = screen.getByLabelText(/Value \(Key\)/i);
    expect(valueInput).toHaveClass('font-mono');
  });
});
