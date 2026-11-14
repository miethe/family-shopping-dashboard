/**
 * PersonDropdown Component Tests
 *
 * Test coverage:
 * - Single select mode
 * - Multi-select mode
 * - Search/filter functionality
 * - Keyboard navigation
 * - "Add New Person" action
 * - Compact vs default variants
 * - Loading/error states
 * - Accessibility
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PersonDropdown } from '../PersonDropdown';
import { usePersons } from '@/hooks/usePersons';
import type { Person } from '@/types';

// Mock hooks
vi.mock('@/hooks/usePersons');

// Mock PersonQuickCreateModal
vi.mock('@/components/modals/PersonQuickCreateModal', () => ({
  PersonQuickCreateModal: ({ isOpen, onClose, onSuccess }: any) => (
    <div data-testid="quick-create-modal">
      {isOpen && (
        <div>
          <button onClick={() => {
            const mockPerson: Person = {
              id: 999,
              display_name: 'New Person',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            onSuccess?.(mockPerson);
            onClose();
          }}>
            Create Person
          </button>
        </div>
      )}
    </div>
  ),
}));

const mockPersons: Person[] = [
  {
    id: 1,
    display_name: 'Alice Smith',
    relationship: 'Friend',
    photo_url: 'https://example.com/alice.jpg',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    display_name: 'Bob Johnson',
    relationship: 'Colleague',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    display_name: 'Carol Williams',
    relationship: 'Family',
    photo_url: 'https://example.com/carol.jpg',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

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

describe('PersonDropdown', () => {
  beforeEach(() => {
    (usePersons as any).mockReturnValue({
      data: { items: mockPersons, total: mockPersons.length },
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Single Select Mode', () => {
    it('renders with placeholder when no selection', () => {
      const onChange = vi.fn();
      render(
        <PersonDropdown value={null} onChange={onChange} placeholder="Choose a person" />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Choose a person')).toBeInTheDocument();
    });

    it('displays selected person with avatar', () => {
      const onChange = vi.fn();
      render(<PersonDropdown value={1} onChange={onChange} />, { wrapper: createWrapper() });

      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    it('opens dropdown on click and shows all persons', async () => {
      const onChange = vi.fn();
      render(<PersonDropdown value={null} onChange={onChange} />, { wrapper: createWrapper() });

      const button = screen.getByRole('button', { name: /select person/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
        expect(screen.getByText('Carol Williams')).toBeInTheDocument();
      });
    });

    it('selects person and closes dropdown', async () => {
      const onChange = vi.fn();
      render(<PersonDropdown value={null} onChange={onChange} />, { wrapper: createWrapper() });

      const button = screen.getByRole('button', { name: /select person/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      });

      const aliceOption = screen.getByRole('option', { name: /alice smith/i });
      fireEvent.click(aliceOption);

      expect(onChange).toHaveBeenCalledWith(1);
    });
  });

  describe('Multi-Select Mode', () => {
    it('allows selecting multiple persons', async () => {
      const onChange = vi.fn();
      render(
        <PersonDropdown value={[]} onChange={onChange} multiSelect />,
        { wrapper: createWrapper() }
      );

      const button = screen.getByRole('button', { name: /select person/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      });

      const aliceOption = screen.getByRole('option', { name: /alice smith/i });
      fireEvent.click(aliceOption);

      expect(onChange).toHaveBeenCalledWith([1]);

      // Dropdown should stay open in multi-select mode
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('displays selected persons as chips', () => {
      const onChange = vi.fn();
      render(
        <PersonDropdown value={[1, 2]} onChange={onChange} multiSelect />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('removes person when clicking X on chip', () => {
      const onChange = vi.fn();
      render(
        <PersonDropdown value={[1, 2]} onChange={onChange} multiSelect />,
        { wrapper: createWrapper() }
      );

      const removeButton = screen.getByLabelText('Remove Alice Smith');
      fireEvent.click(removeButton);

      expect(onChange).toHaveBeenCalledWith([2]);
    });
  });

  describe('Search Functionality', () => {
    it('filters persons based on search query', async () => {
      const onChange = vi.fn();
      render(<PersonDropdown value={null} onChange={onChange} />, { wrapper: createWrapper() });

      const button = screen.getByRole('button', { name: /select person/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search persons...')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search persons...');
      fireEvent.change(searchInput, { target: { value: 'alice' } });

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
        expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
      });
    });

    it('shows "No persons found" when search has no results', async () => {
      const onChange = vi.fn();
      render(<PersonDropdown value={null} onChange={onChange} />, { wrapper: createWrapper() });

      const button = screen.getByRole('button', { name: /select person/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search persons...')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search persons...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText('No persons found')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens dropdown on Enter key', () => {
      const onChange = vi.fn();
      render(<PersonDropdown value={null} onChange={onChange} />, { wrapper: createWrapper() });

      const button = screen.getByRole('button', { name: /select person/i });
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(screen.getByPlaceholderText('Search persons...')).toBeInTheDocument();
    });

    it('closes dropdown on Escape key', async () => {
      const onChange = vi.fn();
      render(<PersonDropdown value={null} onChange={onChange} />, { wrapper: createWrapper() });

      const button = screen.getByRole('button', { name: /select person/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search persons...')).toBeInTheDocument();
      });

      fireEvent.keyDown(button, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Search persons...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Add New Person', () => {
    it('shows "Add New Person" button when allowNew is true', async () => {
      const onChange = vi.fn();
      render(<PersonDropdown value={null} onChange={onChange} allowNew />, { wrapper: createWrapper() });

      const button = screen.getByRole('button', { name: /select person/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Add New Person')).toBeInTheDocument();
      });
    });

    it('hides "Add New Person" button when allowNew is false', async () => {
      const onChange = vi.fn();
      render(
        <PersonDropdown value={null} onChange={onChange} allowNew={false} />,
        { wrapper: createWrapper() }
      );

      const button = screen.getByRole('button', { name: /select person/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search persons...')).toBeInTheDocument();
      });

      expect(screen.queryByText('Add New Person')).not.toBeInTheDocument();
    });

    it('opens PersonQuickCreateModal when clicking "Add New Person"', async () => {
      const onChange = vi.fn();
      render(<PersonDropdown value={null} onChange={onChange} allowNew />, { wrapper: createWrapper() });

      const button = screen.getByRole('button', { name: /select person/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Add New Person')).toBeInTheDocument();
      });

      const addNewButton = screen.getByText('Add New Person');
      fireEvent.click(addNewButton);

      await waitFor(() => {
        expect(screen.getByTestId('quick-create-modal')).toBeInTheDocument();
      });
    });

    it('adds newly created person to selection', async () => {
      const onChange = vi.fn();
      render(<PersonDropdown value={null} onChange={onChange} allowNew />, { wrapper: createWrapper() });

      const button = screen.getByRole('button', { name: /select person/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Add New Person')).toBeInTheDocument();
      });

      const addNewButton = screen.getByText('Add New Person');
      fireEvent.click(addNewButton);

      const createButton = await screen.findByText('Create Person');
      fireEvent.click(createButton);

      expect(onChange).toHaveBeenCalledWith(999);
    });
  });

  describe('Variants', () => {
    it('applies compact variant styles', () => {
      const onChange = vi.fn();
      const { container } = render(
        <PersonDropdown value={null} onChange={onChange} variant="compact" />,
        { wrapper: createWrapper() }
      );

      const button = screen.getByRole('button', { name: /select person/i });
      expect(button).toHaveClass('min-h-[32px]');
    });

    it('applies default variant styles', () => {
      const onChange = vi.fn();
      const { container } = render(
        <PersonDropdown value={null} onChange={onChange} variant="default" />,
        { wrapper: createWrapper() }
      );

      const button = screen.getByRole('button', { name: /select person/i });
      expect(button).toHaveClass('min-h-[44px]');
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading state', async () => {
      (usePersons as any).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      const onChange = vi.fn();
      render(<PersonDropdown value={null} onChange={onChange} />, { wrapper: createWrapper() });

      const button = screen.getByRole('button', { name: /select person/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Loading persons...')).toBeInTheDocument();
      });
    });

    it('shows error state', async () => {
      (usePersons as any).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch'),
      });

      const onChange = vi.fn();
      render(<PersonDropdown value={null} onChange={onChange} />, { wrapper: createWrapper() });

      const button = screen.getByRole('button', { name: /select person/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Failed to load persons')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const onChange = vi.fn();
      render(
        <PersonDropdown value={null} onChange={onChange} label="Select a person" />,
        { wrapper: createWrapper() }
      );

      const button = screen.getByRole('button', { name: /select a person/i });
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('meets minimum touch target size (44px)', () => {
      const onChange = vi.fn();
      render(<PersonDropdown value={null} onChange={onChange} />, { wrapper: createWrapper() });

      const button = screen.getByRole('button', { name: /select person/i });
      expect(button).toHaveClass('min-h-[44px]');
    });

    it('shows error message with proper role', () => {
      const onChange = vi.fn();
      render(
        <PersonDropdown value={null} onChange={onChange} error="This field is required" />,
        { wrapper: createWrapper() }
      );

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('This field is required');
    });
  });

  describe('Disabled State', () => {
    it('prevents interaction when disabled', () => {
      const onChange = vi.fn();
      render(<PersonDropdown value={null} onChange={onChange} disabled />, { wrapper: createWrapper() });

      const button = screen.getByRole('button', { name: /select person/i });
      fireEvent.click(button);

      expect(screen.queryByPlaceholderText('Search persons...')).not.toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
