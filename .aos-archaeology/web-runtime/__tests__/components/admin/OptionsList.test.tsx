/**
 * OptionsList Component Tests
 *
 * Tests the options list that displays all field options with CRUD capabilities
 * including add, edit, and delete operations.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OptionsList } from '@/components/features/admin/OptionsList';
import type { FieldOptionDTO } from '@/lib/api/field-options';

// Mock the hooks
vi.mock('@/hooks/useFieldOptions');
vi.mock('@/components/features/admin/AddOptionModal', () => ({
  AddOptionModal: ({ entity, fieldName, onClose }: any) => (
    <div data-testid="add-option-modal">
      Add Modal for {entity}.{fieldName}
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));
vi.mock('@/components/features/admin/EditOptionModal', () => ({
  EditOptionModal: ({ optionId, entity, fieldName, onClose }: any) => (
    <div data-testid="edit-option-modal">
      Edit Modal for option {optionId} ({entity}.{fieldName})
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));
vi.mock('@/components/features/admin/DeleteConfirmationModal', () => ({
  DeleteConfirmationModal: ({ option, entity, fieldName, onClose }: any) => (
    <div data-testid="delete-confirmation-modal">
      Delete Modal for {option.display_label} ({entity}.{fieldName})
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

import { useFieldOptions } from '@/hooks/useFieldOptions';

const mockOptions: FieldOptionDTO[] = [
  {
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
  },
  {
    id: 2,
    entity: 'person',
    field_name: 'wine_types',
    value: 'white',
    display_label: 'White Wine',
    display_order: 2,
    is_active: true,
    is_system: true,
    usage_count: 3,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    entity: 'person',
    field_name: 'wine_types',
    value: 'rose',
    display_label: 'Rosé',
    display_order: 3,
    is_active: false,
    is_system: false,
    usage_count: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

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

describe('OptionsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    vi.mocked(useFieldOptions).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    renderWithClient(<OptionsList entity="person" fieldName="wine_types" />);

    expect(screen.getByText(/Loading options/i)).toBeInTheDocument();
  });

  it('shows error message on fetch failure', () => {
    vi.mocked(useFieldOptions).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch options'),
    } as any);

    renderWithClient(<OptionsList entity="person" fieldName="wine_types" />);

    expect(screen.getByText(/Failed to load options/i)).toBeInTheDocument();
    expect(screen.getByText(/Failed to fetch options/i)).toBeInTheDocument();
  });

  it('renders Add Option button', () => {
    vi.mocked(useFieldOptions).mockReturnValue({
      data: { items: mockOptions },
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<OptionsList entity="person" fieldName="wine_types" />);

    expect(screen.getByRole('button', { name: /Add Option/i })).toBeInTheDocument();
  });

  it('shows "No options" message when list is empty', () => {
    vi.mocked(useFieldOptions).mockReturnValue({
      data: { items: [] },
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<OptionsList entity="person" fieldName="wine_types" />);

    expect(screen.getByText(/No options defined yet/i)).toBeInTheDocument();
  });

  it('renders list of options with labels', () => {
    vi.mocked(useFieldOptions).mockReturnValue({
      data: { items: mockOptions },
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<OptionsList entity="person" fieldName="wine_types" />);

    expect(screen.getByText('Red Wine')).toBeInTheDocument();
    expect(screen.getByText('White Wine')).toBeInTheDocument();
    expect(screen.getByText('Rosé')).toBeInTheDocument();
  });

  it('shows option values', () => {
    vi.mocked(useFieldOptions).mockReturnValue({
      data: { items: mockOptions },
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<OptionsList entity="person" fieldName="wine_types" />);

    expect(screen.getByText('red')).toBeInTheDocument();
    expect(screen.getByText('white')).toBeInTheDocument();
    expect(screen.getByText('rose')).toBeInTheDocument();
  });

  it('renders edit and delete buttons for each option', () => {
    vi.mocked(useFieldOptions).mockReturnValue({
      data: { items: [mockOptions[0]] },
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<OptionsList entity="person" fieldName="wine_types" />);

    const editButtons = screen.getAllByTitle(/Edit option/i);
    const deleteButtons = screen.getAllByTitle(/Delete option/i);

    expect(editButtons).toHaveLength(1);
    expect(deleteButtons).toHaveLength(1);
  });

  it('shows "System" badge for system options', () => {
    vi.mocked(useFieldOptions).mockReturnValue({
      data: { items: [mockOptions[1]] }, // White Wine is system
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<OptionsList entity="person" fieldName="wine_types" />);

    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('shows "Inactive" badge for inactive options', () => {
    vi.mocked(useFieldOptions).mockReturnValue({
      data: { items: [mockOptions[2]] }, // Rosé is inactive
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<OptionsList entity="person" fieldName="wine_types" />);

    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('shows usage count badge for options in use', () => {
    vi.mocked(useFieldOptions).mockReturnValue({
      data: { items: [mockOptions[0]] }, // Red Wine used 5 times
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<OptionsList entity="person" fieldName="wine_types" />);

    expect(screen.getByText('Used: 5')).toBeInTheDocument();
  });

  it('shows "Unused" badge for options not in use', () => {
    vi.mocked(useFieldOptions).mockReturnValue({
      data: { items: [mockOptions[2]] }, // Rosé not used
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<OptionsList entity="person" fieldName="wine_types" />);

    expect(screen.getByText('Unused')).toBeInTheDocument();
  });

  it('disables edit button for system options', () => {
    vi.mocked(useFieldOptions).mockReturnValue({
      data: { items: [mockOptions[1]] }, // White Wine is system
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<OptionsList entity="person" fieldName="wine_types" />);

    const editButton = screen.getByTitle(/Edit option/i);
    expect(editButton).toBeDisabled();
  });

  it('disables delete button for system options', () => {
    vi.mocked(useFieldOptions).mockReturnValue({
      data: { items: [mockOptions[1]] }, // White Wine is system
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<OptionsList entity="person" fieldName="wine_types" />);

    const deleteButton = screen.getByTitle(/Delete option/i);
    expect(deleteButton).toBeDisabled();
  });

  it('opens AddOptionModal on Add button click', async () => {
    const user = userEvent.setup();
    vi.mocked(useFieldOptions).mockReturnValue({
      data: { items: [] },
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<OptionsList entity="person" fieldName="wine_types" />);

    const addButton = screen.getByRole('button', { name: /Add Option/i });
    await user.click(addButton);

    expect(screen.getByTestId('add-option-modal')).toBeInTheDocument();
  });

  it('opens EditOptionModal on edit button click', async () => {
    const user = userEvent.setup();
    vi.mocked(useFieldOptions).mockReturnValue({
      data: { items: [mockOptions[0]] },
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<OptionsList entity="person" fieldName="wine_types" />);

    const editButton = screen.getByTitle(/Edit option/i);
    await user.click(editButton);

    expect(screen.getByTestId('edit-option-modal')).toBeInTheDocument();
  });

  it('opens DeleteConfirmationModal on delete button click', async () => {
    const user = userEvent.setup();
    vi.mocked(useFieldOptions).mockReturnValue({
      data: { items: [mockOptions[0]] },
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<OptionsList entity="person" fieldName="wine_types" />);

    const deleteButton = screen.getByTitle(/Delete option/i);
    await user.click(deleteButton);

    expect(screen.getByTestId('delete-confirmation-modal')).toBeInTheDocument();
  });

  it('closes AddOptionModal when onClose is called', async () => {
    const user = userEvent.setup();
    vi.mocked(useFieldOptions).mockReturnValue({
      data: { items: [] },
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<OptionsList entity="person" fieldName="wine_types" />);

    // Open modal
    await user.click(screen.getByRole('button', { name: /Add Option/i }));
    expect(screen.getByTestId('add-option-modal')).toBeInTheDocument();

    // Close modal
    await user.click(screen.getByText('Close'));
    expect(screen.queryByTestId('add-option-modal')).not.toBeInTheDocument();
  });

  it('edit and delete buttons have minimum touch target size', () => {
    vi.mocked(useFieldOptions).mockReturnValue({
      data: { items: [mockOptions[0]] },
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<OptionsList entity="person" fieldName="wine_types" />);

    const editButton = screen.getByTitle(/Edit option/i);
    const deleteButton = screen.getByTitle(/Delete option/i);

    expect(editButton).toHaveClass('min-h-[44px]');
    expect(editButton).toHaveClass('min-w-[44px]');
    expect(deleteButton).toHaveClass('min-h-[44px]');
    expect(deleteButton).toHaveClass('min-w-[44px]');
  });

  it('Add Option button has minimum touch target height', () => {
    vi.mocked(useFieldOptions).mockReturnValue({
      data: { items: [] },
      isLoading: false,
      error: null,
    } as any);

    renderWithClient(<OptionsList entity="person" fieldName="wine_types" />);

    const addButton = screen.getByRole('button', { name: /Add Option/i });
    expect(addButton).toHaveClass('min-h-[44px]');
  });

  it('applies different opacity to inactive options', () => {
    vi.mocked(useFieldOptions).mockReturnValue({
      data: { items: [mockOptions[2]] }, // Rosé is inactive
      isLoading: false,
      error: null,
    } as any);

    const { container } = renderWithClient(<OptionsList entity="person" fieldName="wine_types" />);

    const optionItem = container.querySelector('.opacity-60');
    expect(optionItem).toBeInTheDocument();
  });

  it('handles unknown error type gracefully', () => {
    vi.mocked(useFieldOptions).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: 'Some string error' as any,
    } as any);

    renderWithClient(<OptionsList entity="person" fieldName="wine_types" />);

    expect(screen.getByText(/Unknown error/i)).toBeInTheDocument();
  });
});
