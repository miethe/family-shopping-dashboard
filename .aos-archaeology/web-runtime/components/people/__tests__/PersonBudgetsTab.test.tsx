/**
 * PersonBudgetsTab Component Tests
 *
 * Tests the person budgets tab with occasion filtering, budget inputs,
 * empty states, and budget progress visualization.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersonBudgetsTab } from '../PersonBudgetsTab';
import * as useOccasionsHook from '@/hooks/useOccasions';
import * as usePersonOccasionBudgetHook from '@/hooks/usePersonOccasionBudget';
import type { Occasion, PersonOccasionBudget } from '@/types';
import { OccasionType } from '@/types';

// Mock hooks
vi.mock('@/hooks/useOccasions');
vi.mock('@/hooks/usePersonOccasionBudget');

// Mock PersonBudgetBar component to avoid complex dependencies
vi.mock('@/components/people/PersonBudgetBar', () => ({
  PersonBudgetBar: ({ personId, occasionId }: any) => (
    <div data-testid="person-budget-bar">
      PersonBudgetBar for person {personId} and occasion {occasionId}
    </div>
  ),
}));

const mockUseOccasions = vi.mocked(useOccasionsHook.useOccasions);
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
const mockActiveOccasion: Occasion = {
  id: 1,
  name: 'Christmas 2024',
  type: OccasionType.HOLIDAY,
  date: '2024-12-25',
  is_active: true,
  recurrence_rule: null,
  next_occurrence: null,
  subtype: null,
  person_ids: [1, 2],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockPastOccasion: Occasion = {
  id: 2,
  name: 'Christmas 2023',
  type: OccasionType.HOLIDAY,
  date: '2023-12-25',
  is_active: false,
  recurrence_rule: null,
  next_occurrence: null,
  subtype: 'holiday',
  person_ids: [1],
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

const mockBirthdayOccasion: Occasion = {
  id: 3,
  name: "John's Birthday",
  type: OccasionType.RECURRING,
  date: '2024-06-15',
  is_active: true,
  recurrence_rule: { month: 6, day: 15 },
  next_occurrence: '2025-06-15',
  subtype: 'birthday',
  person_ids: [1],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockBudget: PersonOccasionBudget = {
  person_id: 1,
  occasion_id: 1,
  recipient_budget_total: 200,
  purchaser_budget_total: 150,
  recipient_spent: 120,
  purchaser_spent: 80,
  recipient_progress: 60,
  purchaser_progress: 53.33,
};

const mockMutate = vi.fn();

describe('PersonBudgetsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    mockUseOccasions.mockReturnValue({
      data: {
        items: [mockActiveOccasion, mockPastOccasion, mockBirthdayOccasion],
        total: 3,
      },
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
      isPending: false,
      isError: false,
      error: null,
    } as any);
  });

  describe('Rendering', () => {
    it('renders list of linked occasions', () => {
      render(
        <PersonBudgetsTab personId={1} occasionIds={[1, 3]} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Christmas 2024')).toBeInTheDocument();
      expect(screen.getByText("John's Birthday")).toBeInTheDocument();
    });

    it('renders occasion metadata correctly', () => {
      render(
        <PersonBudgetsTab personId={1} occasionIds={[1]} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Christmas 2024')).toBeInTheDocument();
      expect(screen.getByText(/Dec.*2024/)).toBeInTheDocument();
      expect(screen.getByText('holiday')).toBeInTheDocument();
    });

    it('shows occasion subtype when present', () => {
      render(
        <PersonBudgetsTab personId={1} occasionIds={[3]} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('birthday')).toBeInTheDocument();
    });

    it('renders budget inputs for each occasion', () => {
      render(
        <PersonBudgetsTab personId={1} occasionIds={[1]} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByLabelText(/gifts to receive budget/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/gifts to buy budget/i)).toBeInTheDocument();
    });

    it('displays PersonBudgetBar for each occasion', () => {
      render(
        <PersonBudgetsTab personId={1} occasionIds={[1]} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByTestId('person-budget-bar')).toBeInTheDocument();
    });

    it('shows toggle switch for past occasions', () => {
      render(
        <PersonBudgetsTab personId={1} occasionIds={[1, 2]} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByRole('switch')).toBeInTheDocument();
      expect(screen.getByText(/show past occasions/i)).toBeInTheDocument();
    });

    it('displays count of past occasions in toggle description', () => {
      render(
        <PersonBudgetsTab personId={1} occasionIds={[1, 2]} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText(/1 past occasion available/i)).toBeInTheDocument();
    });

    it('handles plural past occasions count', () => {
      const multiplePastOccasions: Occasion[] = [
        mockActiveOccasion,
        mockPastOccasion,
        { ...mockPastOccasion, id: 4, name: 'Birthday 2022' },
      ];

      mockUseOccasions.mockReturnValue({
        data: { items: multiplePastOccasions, total: 3 },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(
        <PersonBudgetsTab personId={1} occasionIds={[1, 2, 4]} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText(/2 past occasions available/i)).toBeInTheDocument();
    });
  });

  describe('Filter Toggle', () => {
    it('hides past occasions by default', () => {
      render(
        <PersonBudgetsTab personId={1} occasionIds={[1, 2]} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Christmas 2024')).toBeInTheDocument();
      expect(screen.queryByText('Christmas 2023')).not.toBeInTheDocument();
    });

    it('shows past occasions when toggle is enabled', async () => {
      const user = userEvent.setup();

      render(
        <PersonBudgetsTab personId={1} occasionIds={[1, 2]} />,
        { wrapper: TestWrapper }
      );

      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      expect(screen.getByText('Christmas 2024')).toBeInTheDocument();
      expect(screen.getByText('Christmas 2023')).toBeInTheDocument();
    });

    it('shows (Past) badge for inactive occasions', async () => {
      const user = userEvent.setup();

      render(
        <PersonBudgetsTab personId={1} occasionIds={[1, 2]} />,
        { wrapper: TestWrapper }
      );

      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      // Find the Past badge
      const pastBadge = screen.getByText('Past');
      expect(pastBadge).toBeInTheDocument();
      expect(pastBadge).toHaveClass('bg-warm-200');
    });

    it('toggles between active and all occasions', async () => {
      const user = userEvent.setup();

      render(
        <PersonBudgetsTab personId={1} occasionIds={[1, 2, 3]} />,
        { wrapper: TestWrapper }
      );

      // Initially shows only active (2 occasions)
      expect(screen.getByText('Christmas 2024')).toBeInTheDocument();
      expect(screen.getByText("John's Birthday")).toBeInTheDocument();
      expect(screen.queryByText('Christmas 2023')).not.toBeInTheDocument();

      // Toggle to show all
      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      expect(screen.getByText('Christmas 2024')).toBeInTheDocument();
      expect(screen.getByText("John's Birthday")).toBeInTheDocument();
      expect(screen.getByText('Christmas 2023')).toBeInTheDocument();

      // Toggle back to hide past
      await user.click(toggle);

      expect(screen.queryByText('Christmas 2023')).not.toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no occasions are linked', () => {
      render(
        <PersonBudgetsTab personId={1} occasionIds={[]} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText(/no linked occasions/i)).toBeInTheDocument();
      expect(
        screen.getByText(/this person is not linked to any occasions yet/i)
      ).toBeInTheDocument();
    });

    it('shows empty state when all linked occasions are past and toggle is off', () => {
      render(
        <PersonBudgetsTab personId={1} occasionIds={[2]} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText(/no active occasions/i)).toBeInTheDocument();
      expect(
        screen.getByText(/all linked occasions are in the past/i)
      ).toBeInTheDocument();
    });

    it('shows toggle in empty state for past occasions', () => {
      render(
        <PersonBudgetsTab personId={1} occasionIds={[2]} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByRole('switch')).toBeInTheDocument();
      expect(screen.getByText(/1 past occasion/)).toBeInTheDocument();
    });

    it('shows occasions after enabling toggle in empty state', async () => {
      const user = userEvent.setup();

      render(
        <PersonBudgetsTab personId={1} occasionIds={[2]} />,
        { wrapper: TestWrapper }
      );

      // Initially empty
      expect(screen.getByText(/no active occasions/i)).toBeInTheDocument();

      // Enable toggle
      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      // Now shows past occasion
      expect(screen.queryByText(/no active occasions/i)).not.toBeInTheDocument();
      expect(screen.getByText('Christmas 2023')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading skeleton while fetching occasions', () => {
      mockUseOccasions.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      render(
        <PersonBudgetsTab personId={1} occasionIds={[1]} />,
        { wrapper: TestWrapper }
      );

      // Check for loading animation
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows loading skeleton for individual occasion budget', () => {
      mockUsePersonOccasionBudget.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      render(
        <PersonBudgetsTab personId={1} occasionIds={[1]} />,
        { wrapper: TestWrapper }
      );

      const loadingRow = document.querySelector('.animate-pulse.bg-warm-50');
      expect(loadingRow).toBeInTheDocument();
    });
  });

  describe('Budget Input Interactions', () => {
    it('updates recipient budget on change', async () => {
      const user = userEvent.setup();

      render(
        <PersonBudgetsTab personId={1} occasionIds={[1]} />,
        { wrapper: TestWrapper }
      );

      const recipientInput = screen.getByLabelText(/gifts to receive budget/i);

      await user.clear(recipientInput);
      await user.type(recipientInput, '300');

      expect(recipientInput).toHaveValue(300);
    });

    it('updates purchaser budget on change', async () => {
      const user = userEvent.setup();

      render(
        <PersonBudgetsTab personId={1} occasionIds={[1]} />,
        { wrapper: TestWrapper }
      );

      const purchaserInput = screen.getByLabelText(/gifts to buy budget/i);

      await user.clear(purchaserInput);
      await user.type(purchaserInput, '250');

      expect(purchaserInput).toHaveValue(250);
    });

    it('calls mutation on budget blur', async () => {
      const user = userEvent.setup();

      render(
        <PersonBudgetsTab personId={1} occasionIds={[1]} />,
        { wrapper: TestWrapper }
      );

      const recipientInput = screen.getByLabelText(/gifts to receive budget/i);

      await user.clear(recipientInput);
      await user.type(recipientInput, '300');
      await user.tab(); // Blur

      expect(mockMutate).toHaveBeenCalledWith({ recipient_budget_total: 300 });
    });

    it('handles null budget values on empty input blur', async () => {
      const user = userEvent.setup();

      render(
        <PersonBudgetsTab personId={1} occasionIds={[1]} />,
        { wrapper: TestWrapper }
      );

      const recipientInput = screen.getByLabelText(/gifts to receive budget/i);

      await user.clear(recipientInput);
      await user.tab(); // Blur with empty input

      expect(mockMutate).toHaveBeenCalledWith({ recipient_budget_total: null });
    });
  });

  describe('Multiple Occasions', () => {
    it('renders multiple occasions with separate budget inputs', () => {
      render(
        <PersonBudgetsTab personId={1} occasionIds={[1, 3]} />,
        { wrapper: TestWrapper }
      );

      const budgetInputs = screen.getAllByLabelText(/gifts to receive budget/i);
      expect(budgetInputs).toHaveLength(2);
    });

    it('manages budget state independently for each occasion', async () => {
      const user = userEvent.setup();

      render(
        <PersonBudgetsTab personId={1} occasionIds={[1, 3]} />,
        { wrapper: TestWrapper }
      );

      const recipientInputs = screen.getAllByLabelText(/gifts to receive budget/i);

      // Update first occasion
      await user.clear(recipientInputs[0]);
      await user.type(recipientInputs[0], '300');

      expect(recipientInputs[0]).toHaveValue(300);
      expect(recipientInputs[1]).toHaveValue(200); // Unchanged
    });
  });

  describe('Edge Cases', () => {
    it('handles occasions with no budget set', () => {
      mockUsePersonOccasionBudget.mockReturnValue({
        data: {
          person_id: 1,
          occasion_id: 1,
          recipient_budget_total: null,
          purchaser_budget_total: null,
          recipient_spent: 0,
          purchaser_spent: 0,
          recipient_progress: null,
          purchaser_progress: null,
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(
        <PersonBudgetsTab personId={1} occasionIds={[1]} />,
        { wrapper: TestWrapper }
      );

      const recipientInput = screen.getByLabelText(/gifts to receive budget/i);
      const purchaserInput = screen.getByLabelText(/gifts to buy budget/i);

      expect(recipientInput).toHaveValue(null);
      expect(purchaserInput).toHaveValue(null);
    });

    it('filters out occasions not in occasionIds prop', () => {
      render(
        <PersonBudgetsTab personId={1} occasionIds={[1]} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('Christmas 2024')).toBeInTheDocument();
      expect(screen.queryByText("John's Birthday")).not.toBeInTheDocument();
      expect(screen.queryByText('Christmas 2023')).not.toBeInTheDocument();
    });

    it('handles occasion without subtype', () => {
      render(
        <PersonBudgetsTab personId={1} occasionIds={[1]} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText('holiday')).toBeInTheDocument();
      // Subtype is null, so should not render extra metadata
    });

    it('handles decimal budget values', () => {
      mockUsePersonOccasionBudget.mockReturnValue({
        data: {
          person_id: 1,
          occasion_id: 1,
          recipient_budget_total: 199.99,
          purchaser_budget_total: 149.50,
          recipient_spent: 50.25,
          purchaser_spent: 30.75,
          recipient_progress: 25.13,
          purchaser_progress: 20.57,
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(
        <PersonBudgetsTab personId={1} occasionIds={[1]} />,
        { wrapper: TestWrapper }
      );

      const recipientInput = screen.getByLabelText(/gifts to receive budget/i);
      const purchaserInput = screen.getByLabelText(/gifts to buy budget/i);

      expect(recipientInput).toHaveValue(199.99);
      expect(purchaserInput).toHaveValue(149.5);
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for toggle switch', () => {
      render(
        <PersonBudgetsTab personId={1} occasionIds={[1, 2]} />,
        { wrapper: TestWrapper }
      );

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAccessibleName(/show past occasions/i);
    });

    it('provides helper text for budget inputs', () => {
      render(
        <PersonBudgetsTab personId={1} occasionIds={[1]} />,
        { wrapper: TestWrapper }
      );

      expect(screen.getByText(/budget for gifts TO this person/i)).toBeInTheDocument();
      expect(screen.getByText(/budget for gifts BY this person/i)).toBeInTheDocument();
    });
  });

  describe('Data Flow', () => {
    it('passes correct personId and occasionId to hooks', () => {
      // Mock the occasions data to include occasion 5
      mockUseOccasions.mockReturnValue({
        data: {
          items: [
            {
              ...mockActiveOccasion,
              id: 5,
              name: 'Test Occasion',
            },
          ],
          total: 1,
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      render(
        <PersonBudgetsTab personId={42} occasionIds={[5]} />,
        { wrapper: TestWrapper }
      );

      expect(mockUsePersonOccasionBudget).toHaveBeenCalledWith(42, 5);
      expect(mockUseUpdatePersonOccasionBudget).toHaveBeenCalledWith(42, 5);
    });

    it('fetches budget data for each linked occasion', () => {
      render(
        <PersonBudgetsTab personId={1} occasionIds={[1, 3]} />,
        { wrapper: TestWrapper }
      );

      expect(mockUsePersonOccasionBudget).toHaveBeenCalledWith(1, 1);
      expect(mockUsePersonOccasionBudget).toHaveBeenCalledWith(1, 3);
    });
  });
});
