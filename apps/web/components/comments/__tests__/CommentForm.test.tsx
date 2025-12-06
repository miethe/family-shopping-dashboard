/**
 * CommentForm Component Tests
 *
 * Tests the comment creation form with character limits, visibility toggle,
 * and form submission behavior.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CommentForm } from '../CommentForm';

// Mock the useCreateComment hook
const mockMutateAsync = vi.fn();
const mockCreateComment = {
  mutateAsync: mockMutateAsync,
  isPending: false,
  isError: false,
};

vi.mock('@/hooks/useComments', () => ({
  useCreateComment: () => mockCreateComment,
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

describe('CommentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateComment.isPending = false;
    mockCreateComment.isError = false;
    mockMutateAsync.mockResolvedValue({ id: 1 });
  });

  it('renders textarea and submit button', () => {
    render(<CommentForm entityType="person" entityId={1} />, { wrapper });
    expect(screen.getByPlaceholderText(/add a comment/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add comment/i })).toBeInTheDocument();
  });

  it('disables submit when text is empty', () => {
    render(<CommentForm entityType="person" entityId={1} />, { wrapper });
    const submitButton = screen.getByRole('button', { name: /add comment/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit when text is entered', async () => {
    const user = userEvent.setup();
    render(<CommentForm entityType="person" entityId={1} />, { wrapper });

    const textarea = screen.getByPlaceholderText(/add a comment/i);
    await user.type(textarea, 'Test comment');

    const submitButton = screen.getByRole('button', { name: /add comment/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows character count with correct initial value', () => {
    render(<CommentForm entityType="person" entityId={1} />, { wrapper });
    expect(screen.getByText('500 characters remaining')).toBeInTheDocument();
  });

  it('updates character count as user types', async () => {
    const user = userEvent.setup();
    render(<CommentForm entityType="person" entityId={1} />, { wrapper });

    const textarea = screen.getByPlaceholderText(/add a comment/i);
    await user.type(textarea, 'Hello');

    expect(screen.getByText('495 characters remaining')).toBeInTheDocument();
  });

  it('changes character count color when near limit', async () => {
    const user = userEvent.setup();
    render(<CommentForm entityType="person" entityId={1} />, { wrapper });

    const textarea = screen.getByPlaceholderText(/add a comment/i);
    // Type 455 characters to get to 45 remaining (within warning threshold of 50)
    const longText = 'a'.repeat(455);
    await user.type(textarea, longText);

    const charCount = screen.getByText('45 characters remaining');
    expect(charCount).toHaveClass('text-orange-600');
  });

  it('changes character count color when over limit', async () => {
    const user = userEvent.setup();
    render(<CommentForm entityType="person" entityId={1} />, { wrapper });

    const textarea = screen.getByPlaceholderText(/add a comment/i);
    // Type 505 characters to exceed limit
    const tooLongText = 'a'.repeat(505);
    await user.type(textarea, tooLongText);

    const charCount = screen.getByText('-5 characters remaining');
    expect(charCount).toHaveClass('text-red-600');
    expect(charCount).toHaveClass('font-medium');
  });

  it('disables submit when over character limit', async () => {
    const user = userEvent.setup();
    render(<CommentForm entityType="person" entityId={1} />, { wrapper });

    const textarea = screen.getByPlaceholderText(/add a comment/i);
    const tooLongText = 'a'.repeat(505);
    await user.type(textarea, tooLongText);

    const submitButton = screen.getByRole('button', { name: /add comment/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows visibility toggle switch', () => {
    render(<CommentForm entityType="person" entityId={1} />, { wrapper });
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeInTheDocument();
    expect(screen.getByText(/private \(only visible to you\)/i)).toBeInTheDocument();
  });

  it('can toggle visibility to private', async () => {
    const user = userEvent.setup();
    render(<CommentForm entityType="person" entityId={1} />, { wrapper });

    const toggle = screen.getByRole('switch');
    expect(toggle).not.toBeChecked();

    await user.click(toggle);
    expect(toggle).toBeChecked();
  });

  it('calls createComment with correct data on valid submit', async () => {
    const user = userEvent.setup();
    render(<CommentForm entityType="person" entityId={1} />, { wrapper });

    const textarea = screen.getByPlaceholderText(/add a comment/i);
    await user.type(textarea, 'Test comment');

    const submitButton = screen.getByRole('button', { name: /add comment/i });
    await user.click(submitButton);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      entity_type: 'person',
      entity_id: 1,
      text: 'Test comment',
      visibility: 'public',
    });
  });

  it('calls createComment with private visibility when toggled', async () => {
    const user = userEvent.setup();
    render(<CommentForm entityType="person" entityId={1} />, { wrapper });

    const textarea = screen.getByPlaceholderText(/add a comment/i);
    await user.type(textarea, 'Private comment');

    const toggle = screen.getByRole('switch');
    await user.click(toggle);

    const submitButton = screen.getByRole('button', { name: /add comment/i });
    await user.click(submitButton);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      entity_type: 'person',
      entity_id: 1,
      text: 'Private comment',
      visibility: 'private',
    });
  });

  it('clears form after successful submit', async () => {
    const user = userEvent.setup();
    render(<CommentForm entityType="person" entityId={1} />, { wrapper });

    const textarea = screen.getByPlaceholderText(/add a comment/i);
    await user.type(textarea, 'Test comment');

    const toggle = screen.getByRole('switch');
    await user.click(toggle);

    const submitButton = screen.getByRole('button', { name: /add comment/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(textarea).toHaveValue('');
      expect(toggle).not.toBeChecked();
      expect(screen.getByText('500 characters remaining')).toBeInTheDocument();
    });
  });

  it('trims whitespace from comment text', async () => {
    const user = userEvent.setup();
    render(<CommentForm entityType="person" entityId={1} />, { wrapper });

    const textarea = screen.getByPlaceholderText(/add a comment/i);
    await user.type(textarea, '  Test comment  ');

    const submitButton = screen.getByRole('button', { name: /add comment/i });
    await user.click(submitButton);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      entity_type: 'person',
      entity_id: 1,
      text: 'Test comment',
      visibility: 'public',
    });
  });

  it('does not submit if text is only whitespace', async () => {
    const user = userEvent.setup();
    render(<CommentForm entityType="person" entityId={1} />, { wrapper });

    const textarea = screen.getByPlaceholderText(/add a comment/i);
    await user.type(textarea, '   ');

    const submitButton = screen.getByRole('button', { name: /add comment/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows error message when submission fails', async () => {
    mockCreateComment.isError = true;
    const user = userEvent.setup();
    render(<CommentForm entityType="person" entityId={1} />, { wrapper });

    const textarea = screen.getByPlaceholderText(/add a comment/i);
    await user.type(textarea, 'Test comment');

    const submitButton = screen.getByRole('button', { name: /add comment/i });
    await user.click(submitButton);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Failed to add comment. Please try again.'
    );
  });

  it('disables form during submission', () => {
    mockCreateComment.isPending = true;
    render(<CommentForm entityType="person" entityId={1} />, { wrapper });

    const textarea = screen.getByPlaceholderText(/add a comment/i);
    const toggle = screen.getByRole('switch');

    expect(textarea).toBeDisabled();
    expect(toggle).toBeDisabled();
  });

  it('shows loading state on submit button during submission', () => {
    mockCreateComment.isPending = true;
    render(<CommentForm entityType="person" entityId={1} />, { wrapper });

    const submitButton = screen.getByRole('button', { name: /add comment/i });
    expect(submitButton).toBeDisabled();
  });

  it('works with different entity types', async () => {
    const user = userEvent.setup();
    render(<CommentForm entityType="gift" entityId={42} />, { wrapper });

    const textarea = screen.getByPlaceholderText(/add a comment/i);
    await user.type(textarea, 'Gift comment');

    const submitButton = screen.getByRole('button', { name: /add comment/i });
    await user.click(submitButton);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      entity_type: 'gift',
      entity_id: 42,
      text: 'Gift comment',
      visibility: 'public',
    });
  });

  it('shows error when character limit is exceeded', async () => {
    const user = userEvent.setup();
    render(<CommentForm entityType="person" entityId={1} />, { wrapper });

    const textarea = screen.getByPlaceholderText(/add a comment/i);
    const tooLongText = 'a'.repeat(510);
    await user.type(textarea, tooLongText);

    // Check for error message in textarea (passed as error prop)
    expect(screen.getByText(/comment is 10 characters too long/i)).toBeInTheDocument();
  });
});
