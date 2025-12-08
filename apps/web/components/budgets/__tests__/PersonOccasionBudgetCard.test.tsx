/**
 * PersonOccasionBudgetCard Component Tests
 *
 * Tests the person-occasion budget card with auto-save functionality,
 * loading states, error handling, and budget visualization.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersonOccasionBudgetCard } from '../PersonOccasionBudgetCard';
import * as usePersonHook from '@/hooks/usePersons';
import * as usePersonOccasionBudgetHook from '@/hooks/usePersonOccasionBudget';
import type { Person, PersonOccasionBudget } from '@/types';

// Mock hooks
vi.mock('@/hooks/usePersons');
vi.mock('@/hooks/usePersonOccasionBudget');

// Mock PersonBudgetBar component to avoid complex dependencies
vi.mock('@/components/people/PersonBudgetBar', () => ({
  PersonBudgetBar: ({ personId, occasionId }: any) => (
    <div data-testid="person-budget-bar">
      PersonBudgetBar for person {personId} and occasion {occasionId}
    </div>
  ),
}));

const mockUsePerson = vi.mocked(usePersonHook.usePerson);
const mockUsePersonOccasionBudget = vi.mocked(usePersonOccasionBudgetHook.usePersonOccasionBudget);
const mockUseUpdatePersonOccasionBudget = vi.mocked(usePersonOccasionBudgetHook.useUpdatePersonOccasionBudget);

// Create test wrapper
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// Mock data
const mockPerson: Person = {
  id: 1,
  display_name: 'John Doe',
  relationship: 'Brother',
  photo_url: 'https://example.com/photo.jpg',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockBudget: PersonOccasionBudget = {
  person_id: 1,
  occasion_id: 5,
  recipient_budget_total: 200,
  purchaser_budget_total: 150,
  recipient_spent: 120,
  purchaser_spent: 80,
  recipient_progress: 60,
  purchaser_progress: 53.33,
};

const mockMutate = vi.fn();
const mockMutateAsync = vi.fn();

describe('PersonOccasionBudgetCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    mockUsePerson.mockReturnValue({
      data: mockPerson,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    mockUsePersonOccasionBudget.mockReturnValue({
      data: mockBudget,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    mockUseUpdatePersonOccasionBudget.mockReturnValue({
      mutate: mockMutate,
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      error: null,
    } as any);
  });

  describe('Rendering', () => {
    it('renders person info correctly', () => {
      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Brother')).toBeInTheDocument();
    });

    it('renders person avatar with initials fallback', () => {
      mockUsePerson.mockReturnValue({
        data: { ...mockPerson, photo_url: undefined },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('JD')).toBeInTheDocument(); // Initials for John Doe
    });

    it('renders budget inputs with correct values', () => {
      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      const recipientInput = screen.getByLabelText(/budget for gifts this person will receive/i);
      const purchaserInput = screen.getByLabelText(/budget for gifts this person will buy/i);

      expect(recipientInput).toHaveValue(200);
      expect(purchaserInput).toHaveValue(150);
    });

    it('renders with null budget values as empty inputs', () => {
      mockUsePersonOccasionBudget.mockReturnValue({
        data: {
          ...mockBudget,
          recipient_budget_total: null,
          purchaser_budget_total: null,
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      const recipientInput = screen.getByLabelText(/budget for gifts this person will receive/i);
      const purchaserInput = screen.getByLabelText(/budget for gifts this person will buy/i);

      expect(recipientInput).toHaveValue(null);
      expect(purchaserInput).toHaveValue(null);
    });

    it('displays PersonBudgetBar component', () => {
      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByTestId('person-budget-bar')).toBeInTheDocument();
      expect(screen.getByText(/PersonBudgetBar for person 1 and occasion 5/i)).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading spinner while fetching person data', () => {
      mockUsePerson.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByLabelText(/loading budget data/i)).toBeInTheDocument();
    });

    it('shows loading spinner while fetching budget data', () => {
      mockUsePersonOccasionBudget.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByLabelText(/loading budget data/i)).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('shows error message when person data is missing', () => {
      mockUsePerson.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText(/unable to load budget data/i)).toBeInTheDocument();
    });

    it('shows error message when budget data is missing', () => {
      mockUsePersonOccasionBudget.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText(/unable to load budget data/i)).toBeInTheDocument();
    });

    it('shows error message when mutation fails', () => {
      mockUseUpdatePersonOccasionBudget.mockReturnValue({
        mutate: mockMutate,
        mutateAsync: mockMutateAsync,
        isPending: false,
        isError: true,
        error: new Error('Network error'),
      } as any);

      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/failed to save budget/i)).toBeInTheDocument();
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    it('shows generic error message for unknown errors', () => {
      mockUseUpdatePersonOccasionBudget.mockReturnValue({
        mutate: mockMutate,
        mutateAsync: mockMutateAsync,
        isPending: false,
        isError: true,
        error: { message: 'Unknown' }, // Not an Error instance
      } as any);

      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('updates recipient budget input on change', async () => {
      const user = userEvent.setup();

      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      const recipientInput = screen.getByLabelText(/budget for gifts this person will receive/i);

      await user.clear(recipientInput);
      await user.type(recipientInput, '300');

      expect(recipientInput).toHaveValue(300);
    });

    it('updates purchaser budget input on change', async () => {
      const user = userEvent.setup();

      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      const purchaserInput = screen.getByLabelText(/budget for gifts this person will buy/i);

      await user.clear(purchaserInput);
      await user.type(purchaserInput, '250');

      expect(purchaserInput).toHaveValue(250);
    });

    it('calls mutation on recipient budget blur with changed value', async () => {
      const user = userEvent.setup();

      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      const recipientInput = screen.getByLabelText(/budget for gifts this person will receive/i);

      await user.clear(recipientInput);
      await user.type(recipientInput, '300');
      await user.tab(); // Blur

      expect(mockMutate).toHaveBeenCalledWith(
        { recipient_budget_total: 300 },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        })
      );
    });

    it('calls mutation on purchaser budget blur with changed value', async () => {
      const user = userEvent.setup();

      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      const purchaserInput = screen.getByLabelText(/budget for gifts this person will buy/i);

      await user.clear(purchaserInput);
      await user.type(purchaserInput, '250');
      await user.tab(); // Blur

      expect(mockMutate).toHaveBeenCalledWith(
        { purchaser_budget_total: 250 },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        })
      );
    });

    it('calls mutation with null when input is cleared', async () => {
      const user = userEvent.setup();

      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      const recipientInput = screen.getByLabelText(/budget for gifts this person will receive/i);

      await user.clear(recipientInput);
      await user.tab(); // Blur

      expect(mockMutate).toHaveBeenCalledWith(
        { recipient_budget_total: null },
        expect.any(Object)
      );
    });

    it('does not call mutation if value has not changed', async () => {
      const user = userEvent.setup();

      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      const recipientInput = screen.getByLabelText(/budget for gifts this person will receive/i);

      // Input already has value 200, blur without changing
      await user.click(recipientInput);
      await user.tab(); // Blur

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('shows success indicator after successful save', async () => {
      const user = userEvent.setup();
      let onSuccessCallback: (() => void) | undefined;

      mockMutate.mockImplementation((data, options) => {
        onSuccessCallback = options?.onSuccess;
      });

      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      const recipientInput = screen.getByLabelText(/budget for gifts this person will receive/i);

      await user.clear(recipientInput);
      await user.type(recipientInput, '300');
      await user.tab();

      // Trigger success callback
      if (onSuccessCallback) {
        act(() => {
          onSuccessCallback!();
        });
      }

      await waitFor(() => {
        expect(screen.getByLabelText(/recipient budget saved/i)).toBeInTheDocument();
      });
    });

    it.skip('clears success indicator after 2 seconds', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      let onSuccessCallback: (() => void) | undefined;

      mockMutate.mockImplementation((data, options) => {
        onSuccessCallback = options?.onSuccess;
      });

      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      const recipientInput = screen.getByLabelText(/budget for gifts this person will receive/i);

      await user.clear(recipientInput);
      await user.type(recipientInput, '300');
      await user.tab();

      if (onSuccessCallback) {
        act(() => {
          onSuccessCallback!();
        });
      }

      await waitFor(() => {
        expect(screen.getByLabelText(/recipient budget saved/i)).toBeInTheDocument();
      });

      // Fast-forward 2 seconds
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.queryByLabelText(/recipient budget saved/i)).not.toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  describe('Mutation States', () => {
    it('disables inputs during pending mutation', () => {
      mockUseUpdatePersonOccasionBudget.mockReturnValue({
        mutate: mockMutate,
        mutateAsync: mockMutateAsync,
        isPending: true,
        isError: false,
        error: null,
      } as any);

      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      const recipientInput = screen.getByLabelText(/budget for gifts this person will receive/i);
      const purchaserInput = screen.getByLabelText(/budget for gifts this person will buy/i);

      expect(recipientInput).toBeDisabled();
      expect(purchaserInput).toBeDisabled();
    });

    it('shows spinner during pending mutation', () => {
      mockUseUpdatePersonOccasionBudget.mockReturnValue({
        mutate: mockMutate,
        mutateAsync: mockMutateAsync,
        isPending: true,
        isError: false,
        error: null,
      } as any);

      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByLabelText(/saving recipient budget/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for inputs', () => {
      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByLabelText(/budget for gifts this person will receive/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/budget for gifts this person will buy/i)).toBeInTheDocument();
    });

    it('has descriptive help text for screen readers', () => {
      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      expect(document.getElementById('recipient-budget-help')).toHaveTextContent(
        /set a budget limit for gifts this person will receive/i
      );
      expect(document.getElementById('purchaser-budget-help')).toHaveTextContent(
        /set a budget limit for gifts this person will buy/i
      );
    });

    it('has role="alert" for error messages', () => {
      mockUseUpdatePersonOccasionBudget.mockReturnValue({
        mutate: mockMutate,
        mutateAsync: mockMutateAsync,
        isPending: false,
        isError: true,
        error: new Error('Test error'),
      } as any);

      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles decimal budget values', async () => {
      const user = userEvent.setup();

      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      const recipientInput = screen.getByLabelText(/budget for gifts this person will receive/i);

      await user.clear(recipientInput);
      await user.type(recipientInput, '199.99');
      await user.tab();

      
        expect(mockMutate).toHaveBeenCalledWith(
          { recipient_budget_total: 199.99 },
          expect.any(Object)
        );
      });
    });

    it('handles person without relationship', () => {
      mockUsePerson.mockReturnValue({
        data: { ...mockPerson, relationship: undefined },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(
        <PersonOccasionBudgetCard personId={1} occasionId={5} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Brother')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <PersonOccasionBudgetCard
          personId={1}
          occasionId={5}
          className="custom-class"
        />,
        { wrapper: TestWrapper }
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });
});
