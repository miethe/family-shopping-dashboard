/**
 * PersonQuickCreateModal Component Tests
 *
 * Test coverage:
 * - Form rendering and validation
 * - Person creation flow
 * - Success/error handling
 * - Form reset on close
 * - Accessibility
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PersonQuickCreateModal } from '../PersonQuickCreateModal';
import { useCreatePerson } from '@/hooks/usePersons';
import type { Person } from '@/types';

// Mock hooks
vi.mock('@/hooks/usePersons');
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock EntityModal
vi.mock('@/components/modals/EntityModal', () => ({
  EntityModal: ({ children, open, title }: any) => (
    <div data-testid="entity-modal">
      {open && (
        <div>
          <h2>{title}</h2>
          {children}
        </div>
      )}
    </div>
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestQueryClientWrapper';
  return Wrapper;
};

describe('PersonQuickCreateModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    (useCreatePerson as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open', () => {
    render(
      <PersonQuickCreateModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Add New Person')).toBeInTheDocument();
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <PersonQuickCreateModal isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText('Add New Person')).not.toBeInTheDocument();
  });

  it('shows all form fields', () => {
    render(
      <PersonQuickCreateModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/relationship/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/photo url/i)).toBeInTheDocument();
  });

  it('requires display name', () => {
    render(
      <PersonQuickCreateModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    const nameInput = screen.getByLabelText(/display name/i);
    expect(nameInput).toBeRequired();
  });

  it('submits form with valid data', async () => {
    const mockMutate = vi.fn((data, { onSuccess }) => {
      const mockPerson: Person = {
        id: 1,
        display_name: data.display_name,
        relationship: data.relationship,
        photo_url: data.photo_url,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      onSuccess(mockPerson);
    });

    (useCreatePerson as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(
      <PersonQuickCreateModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    const nameInput = screen.getByLabelText(/display name/i);
    const relationshipSelect = screen.getByLabelText(/relationship/i);
    const photoInput = screen.getByLabelText(/photo url/i);

    fireEvent.change(nameInput, { target: { value: 'Alice Smith' } });
    fireEvent.change(relationshipSelect, { target: { value: 'Friend' } });
    fireEvent.change(photoInput, { target: { value: 'https://example.com/alice.jpg' } });

    const submitButton = screen.getByText('Add Person');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          display_name: 'Alice Smith',
          relationship: 'Friend',
          photo_url: 'https://example.com/alice.jpg',
        },
        expect.any(Object)
      );
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        display_name: 'Alice Smith',
        relationship: 'Friend',
      })
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('omits optional fields if not provided', async () => {
    const mockMutate = vi.fn((data, { onSuccess }) => {
      const mockPerson: Person = {
        id: 1,
        display_name: data.display_name,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      onSuccess(mockPerson);
    });

    (useCreatePerson as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(
      <PersonQuickCreateModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    const nameInput = screen.getByLabelText(/display name/i);
    fireEvent.change(nameInput, { target: { value: 'Bob Johnson' } });

    const submitButton = screen.getByText('Add Person');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          display_name: 'Bob Johnson',
          relationship: undefined,
          photo_url: undefined,
        },
        expect.any(Object)
      );
    });
  });

  it('shows loading state during submission', () => {
    (useCreatePerson as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    });

    render(
      <PersonQuickCreateModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Adding...')).toBeInTheDocument();
  });

  it('disables submit button when pending', () => {
    (useCreatePerson as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    });

    render(
      <PersonQuickCreateModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    const submitButton = screen.getByText('Adding...');
    expect(submitButton).toBeDisabled();
  });

  it('disables submit button when display name is empty', () => {
    render(
      <PersonQuickCreateModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    const submitButton = screen.getByText('Add Person');
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when display name is provided', () => {
    render(
      <PersonQuickCreateModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    const nameInput = screen.getByLabelText(/display name/i);
    fireEvent.change(nameInput, { target: { value: 'Alice' } });

    const submitButton = screen.getByText('Add Person');
    expect(submitButton).not.toBeDisabled();
  });

  it('handles submission error', async () => {
    const mockMutate = vi.fn((data, { onError }) => {
      onError(new Error('Failed to create person'));
    });

    (useCreatePerson as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(
      <PersonQuickCreateModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    const nameInput = screen.getByLabelText(/display name/i);
    fireEvent.change(nameInput, { target: { value: 'Alice' } });

    const submitButton = screen.getByText('Add Person');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });

    // Modal should not close on error
    expect(mockOnClose).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('resets form when modal closes', () => {
    const { rerender } = render(
      <PersonQuickCreateModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    const nameInput = screen.getByLabelText(/display name/i);
    fireEvent.change(nameInput, { target: { value: 'Alice' } });

    expect(nameInput).toHaveValue('Alice');

    // Close modal
    rerender(
      <PersonQuickCreateModal isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    // Reopen modal
    rerender(
      <PersonQuickCreateModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />
    );

    const nameInputAfterReopen = screen.getByLabelText(/display name/i);
    expect(nameInputAfterReopen).toHaveValue('');
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <PersonQuickCreateModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('prevents close when submission is pending', () => {
    (useCreatePerson as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    });

    render(
      <PersonQuickCreateModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeDisabled();
  });

  it('has proper accessibility attributes', () => {
    render(
      <PersonQuickCreateModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    const nameInput = screen.getByLabelText(/display name/i);
    expect(nameInput).toHaveAttribute('required');
    expect(nameInput).toHaveAttribute('autofocus');
  });

  it('shows all relationship options', () => {
    render(
      <PersonQuickCreateModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    const relationshipSelect = screen.getByLabelText(/relationship/i);

    // Check for all expected options
    const expectedOptions = [
      'Select a relationship',
      'Parent',
      'Sibling',
      'Child',
      'Extended Family',
      'Friend',
      'Colleague',
      'Other',
    ];

    const options = Array.from(relationshipSelect.querySelectorAll('option')).map(
      (option) => option.textContent
    );

    expectedOptions.forEach((expectedOption) => {
      expect(options).toContain(expectedOption);
    });
  });

  it('meets minimum touch target size (44px)', () => {
    render(
      <PersonQuickCreateModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
      { wrapper: createWrapper() }
    );

    const submitButton = screen.getByText('Add Person');
    const cancelButton = screen.getByText('Cancel');

    expect(submitButton).toHaveClass('min-h-[44px]');
    expect(cancelButton).toHaveClass('min-h-[44px]');
  });
});
