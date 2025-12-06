/**
 * CommentCard Component Tests
 *
 * Tests the comment display card with edit/delete functionality,
 * visibility badges, and edit mode.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CommentCard } from '../CommentCard';
import type { Comment } from '@/types';

// Mock the comment hooks
const mockDeleteMutateAsync = vi.fn();
const mockUpdateMutateAsync = vi.fn();

const mockDeleteComment = {
  mutateAsync: mockDeleteMutateAsync,
  isPending: false,
  isError: false,
};

const mockUpdateComment = {
  mutateAsync: mockUpdateMutateAsync,
  isPending: false,
  isError: false,
};

vi.mock('@/hooks/useComments', () => ({
  useDeleteComment: () => mockDeleteComment,
  useUpdateComment: () => mockUpdateComment,
}));

// Mock the formatRelativeTime utility while preserving other exports like cn
vi.mock('@/lib/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/utils')>();
  return {
    ...actual,
    formatRelativeTime: (date: string) => 'just now',
  };
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const mockComment: Comment = {
  id: 1,
  content: 'Test comment',
  text: 'Test comment',
  visibility: 'public',
  parent_type: 'person',
  parent_id: 1,
  entity_type: 'person',
  entity_id: 1,
  author_id: 1,
  user_id: 1,
  author_name: 'John Doe',
  user_name: 'John Doe',
  author_label: 'john@example.com',
  can_edit: true,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

describe('CommentCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteComment.isPending = false;
    mockDeleteComment.isError = false;
    mockUpdateComment.isPending = false;
    mockUpdateComment.isError = false;
    mockDeleteMutateAsync.mockResolvedValue({});
    mockUpdateMutateAsync.mockResolvedValue({});
    // Mock window.confirm to automatically return true
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('renders comment text and user name', () => {
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });
    expect(screen.getByText('Test comment')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders timestamp', () => {
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });
    expect(screen.getByText('just now')).toBeInTheDocument();
  });

  it('shows edit button for author when can_edit is true', () => {
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });
    expect(screen.getByRole('button', { name: /edit comment/i })).toBeInTheDocument();
  });

  it('shows delete button for author when can_edit is true', () => {
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });
    expect(screen.getByRole('button', { name: /delete comment/i })).toBeInTheDocument();
  });

  it('hides edit and delete buttons when can_edit is false', () => {
    const nonEditableComment = { ...mockComment, can_edit: false };
    render(
      <CommentCard comment={nonEditableComment} entityType="person" entityId={1} />,
      { wrapper }
    );

    expect(screen.queryByRole('button', { name: /edit comment/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /delete comment/i })
    ).not.toBeInTheDocument();
  });

  it('shows private badge for private comments', () => {
    const privateComment = { ...mockComment, visibility: 'private' as const };
    render(<CommentCard comment={privateComment} entityType="person" entityId={1} />, {
      wrapper,
    });
    expect(screen.getByText(/private/i)).toBeInTheDocument();
  });

  it('does not show private badge for public comments', () => {
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });
    expect(screen.queryByText(/private/i)).not.toBeInTheDocument();
  });

  it('shows edited indicator when updated_at > created_at', () => {
    const editedComment = {
      ...mockComment,
      updated_at: '2025-01-02T00:00:00Z',
    };
    render(<CommentCard comment={editedComment} entityType="person" entityId={1} />, {
      wrapper,
    });
    expect(screen.getByText(/\(edited\)/i)).toBeInTheDocument();
  });

  it('does not show edited indicator when updated_at equals created_at', () => {
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });
    expect(screen.queryByText(/\(edited\)/i)).not.toBeInTheDocument();
  });

  it('enters edit mode when edit button clicked', async () => {
    const user = userEvent.setup();
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });

    await user.click(screen.getByRole('button', { name: /edit comment/i }));

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Test comment');
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('can cancel edit without saving', async () => {
    const user = userEvent.setup();
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });

    // Enter edit mode
    await user.click(screen.getByRole('button', { name: /edit comment/i }));

    // Modify text
    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'Modified text');

    // Cancel
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Original text should still be displayed
    expect(screen.getByText('Test comment')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('saves edited comment when save button clicked', async () => {
    const user = userEvent.setup();
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });

    // Enter edit mode
    await user.click(screen.getByRole('button', { name: /edit comment/i }));

    // Modify text
    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'Updated comment');

    // Save
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
      commentId: 1,
      data: {
        text: 'Updated comment',
        visibility: 'public',
      },
    });
  });

  it('shows visibility toggle in edit mode', async () => {
    const user = userEvent.setup();
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });

    await user.click(screen.getByRole('button', { name: /edit comment/i }));

    const toggles = screen.getAllByRole('switch');
    expect(toggles.length).toBeGreaterThan(0);
    expect(screen.getByText(/private \(only visible to you\)/i)).toBeInTheDocument();
  });

  it('can toggle visibility in edit mode', async () => {
    const user = userEvent.setup();
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });

    // Enter edit mode
    await user.click(screen.getByRole('button', { name: /edit comment/i }));

    // Toggle visibility to private
    const toggle = screen.getByRole('switch');
    await user.click(toggle);

    // Save
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
      commentId: 1,
      data: {
        text: 'Test comment',
        visibility: 'private',
      },
    });
  });

  it('shows character count in edit mode', async () => {
    const user = userEvent.setup();
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });

    await user.click(screen.getByRole('button', { name: /edit comment/i }));

    // 500 - 12 (length of "Test comment") = 488
    expect(screen.getByText('488 characters remaining')).toBeInTheDocument();
  });

  it('disables save when edit text is empty', async () => {
    const user = userEvent.setup();
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });

    await user.click(screen.getByRole('button', { name: /edit comment/i }));

    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeDisabled();
  });

  it('disables save when over character limit', async () => {
    const user = userEvent.setup();
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });

    await user.click(screen.getByRole('button', { name: /edit comment/i }));

    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'a'.repeat(505));

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeDisabled();
  });

  it('calls deleteComment when delete button clicked and confirmed', async () => {
    const user = userEvent.setup();
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });

    await user.click(screen.getByRole('button', { name: /delete comment/i }));

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this comment?'
    );
    expect(mockDeleteMutateAsync).toHaveBeenCalledWith(1);
  });

  it('does not delete when user cancels confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });

    await user.click(screen.getByRole('button', { name: /delete comment/i }));

    expect(mockDeleteMutateAsync).not.toHaveBeenCalled();
  });

  it('shows delete error message when deletion fails', () => {
    mockDeleteComment.isError = true;
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Failed to delete comment. Please try again.'
    );
  });

  it('shows update error message when update fails', async () => {
    mockUpdateComment.isError = true;
    const user = userEvent.setup();
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });

    // Enter edit mode to trigger the error display
    await user.click(screen.getByRole('button', { name: /edit comment/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Failed to update comment. Please try again.'
    );
  });

  it('disables delete button during deletion', () => {
    mockDeleteComment.isPending = true;
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });

    const deleteButton = screen.getByRole('button', { name: /delete comment/i });
    expect(deleteButton).toBeDisabled();
    expect(deleteButton).toHaveTextContent('Deleting...');
  });

  it('exits edit mode after successful save', async () => {
    const user = userEvent.setup();
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });

    // Enter edit mode
    await user.click(screen.getByRole('button', { name: /edit comment/i }));

    // Save
    await user.click(screen.getByRole('button', { name: /save/i }));

    // Wait for edit mode to exit
    await waitFor(() => {
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  it('trims whitespace from edited comment', async () => {
    const user = userEvent.setup();
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });

    await user.click(screen.getByRole('button', { name: /edit comment/i }));

    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, '  Updated comment  ');

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
      commentId: 1,
      data: {
        text: 'Updated comment',
        visibility: 'public',
      },
    });
  });

  it('shows correct character limit error message', async () => {
    const user = userEvent.setup();
    render(<CommentCard comment={mockComment} entityType="person" entityId={1} />, {
      wrapper,
    });

    await user.click(screen.getByRole('button', { name: /edit comment/i }));

    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'a'.repeat(510));

    expect(screen.getByText(/comment is 10 characters too long/i)).toBeInTheDocument();
  });

  it('preserves visibility when entering edit mode', async () => {
    const privateComment = { ...mockComment, visibility: 'private' as const };
    const user = userEvent.setup();
    render(<CommentCard comment={privateComment} entityType="person" entityId={1} />, {
      wrapper,
    });

    await user.click(screen.getByRole('button', { name: /edit comment/i }));

    const toggle = screen.getByRole('switch');
    expect(toggle).toBeChecked();
  });
});
