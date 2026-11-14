# Comments Component

Polymorphic, reusable comment thread component for the Family Gifting Dashboard.

## Overview

The Comments component provides a complete commenting system that works across multiple entity types (lists, occasions, and list items). It includes a comment thread display, comment form, and individual comment cards with proper mobile-first design.

## Components

### CommentThread

Main component that displays the complete comment thread with form and list of comments.

**Props:**

```typescript
interface CommentThreadProps {
  entityType: CommentEntityType;  // 'list' | 'occasion' | 'list_item'
  entityId: number;                // ID of the entity
  currentUserId?: number;          // Current user ID for delete permissions
  className?: string;              // Optional className for styling
}
```

**Usage:**

```tsx
import { CommentThread } from '@/components/comments';

// On a list page
<CommentThread entityType="list" entityId={listId} currentUserId={userId} />

// On an occasion page
<CommentThread entityType="occasion" entityId={occasionId} currentUserId={userId} />

// On a list item
<CommentThread entityType="list_item" entityId={itemId} currentUserId={userId} />
```

**Features:**

- Displays comment count in header
- Add comment form at top
- Sorted comments (newest first)
- Loading and error states
- Empty state messaging
- Mobile-responsive design

### CommentCard

Individual comment display with user info, timestamp, and delete functionality.

**Props:**

```typescript
interface CommentCardProps {
  comment: Comment;
  currentUserId?: number;
  entityType: CommentEntityType;
  entityId: number;
}
```

**Features:**

- User avatar with initials fallback
- User name display
- Relative timestamp (e.g., "2h ago")
- Comment text with word wrapping
- Delete button (only for own comments)
- Hover state for better UX
- Confirmation dialog before deletion

### CommentForm

Form for adding new comments with character limit and validation.

**Props:**

```typescript
interface CommentFormProps {
  entityType: CommentEntityType;
  entityId: number;
}
```

**Features:**

- Textarea with 500 character limit
- Character counter with visual feedback
  - Gray: normal
  - Orange: warning (≤50 chars remaining)
  - Red: over limit
- Loading state during submission
- Error handling
- Auto-clear on success
- Disabled state during submission
- Mobile-friendly touch targets (44px min)

## Hooks

### useComments

React Query hook for fetching comments for an entity.

```typescript
const { data, isLoading, isError } = useComments(entityType, entityId);
```

### useCreateComment

React Query mutation hook for creating a new comment.

```typescript
const createComment = useCreateComment();

await createComment.mutateAsync({
  entity_type: 'list',
  entity_id: 123,
  text: 'Great list!',
});
```

### useDeleteComment

React Query mutation hook for deleting a comment.

```typescript
const deleteComment = useDeleteComment(entityType, entityId);

await deleteComment.mutateAsync(commentId);
```

## Types

All comment types are defined in `/types/index.ts`:

```typescript
export type CommentEntityType = 'list' | 'occasion' | 'list_item';

export interface Comment extends TimestampFields {
  id: number;
  entity_type: CommentEntityType;
  entity_id: number;
  user_id: number;
  user_name: string;
  text: string;
}

export interface CommentCreate {
  entity_type: CommentEntityType;
  entity_id: number;
  text: string;
}
```

## API Endpoints

Comment API endpoints are defined in `/lib/api/endpoints.ts`:

```typescript
export const commentApi = {
  list: (params: CommentListParams) => Comment[],
  create: (data: CommentCreate) => Comment,
  delete: (id: number) => void,
};
```

**Backend endpoints:**

- `GET /api/comments?entity_type=list&entity_id=123` - List comments
- `POST /api/comments` - Create comment
- `DELETE /api/comments/{id}` - Delete comment

## Utilities

### formatRelativeTime

Utility function for formatting timestamps as relative time strings.

```typescript
formatRelativeTime("2024-11-27T10:00:00Z") // "2h ago"
```

Defined in `/lib/utils.ts`.

## Mobile-First Design

All components follow mobile-first principles:

- **Touch targets:** Minimum 44x44px for all buttons
- **Responsive text:** Readable text sizes on mobile
- **Safe areas:** Proper spacing and padding
- **Hover states:** Desktop-only hover effects
- **Word wrapping:** Long text properly wraps
- **Truncation:** User names truncate with ellipsis

## Accessibility

- Proper ARIA labels on buttons
- Error messages with `role="alert"`
- Keyboard navigation support
- Focus visible states
- Semantic HTML structure
- Screen reader friendly

## Example Integration

### List Detail Page

```tsx
'use client';

import { CommentThread } from '@/components/comments';
import { useAuth } from '@/hooks/useAuth';

export default function ListDetailPage({ params }: { params: { id: string } }) {
  const listId = parseInt(params.id);
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* List content */}
      <div>{/* ... */}</div>

      {/* Comments section */}
      <CommentThread
        entityType="list"
        entityId={listId}
        currentUserId={user?.id}
      />
    </div>
  );
}
```

### Occasion Detail Page

```tsx
'use client';

import { CommentThread } from '@/components/comments';
import { useAuth } from '@/hooks/useAuth';

export default function OccasionDetailPage({ params }: { params: { id: string } }) {
  const occasionId = parseInt(params.id);
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Occasion content */}
      <div>{/* ... */}</div>

      {/* Comments section */}
      <CommentThread
        entityType="occasion"
        entityId={occasionId}
        currentUserId={user?.id}
      />
    </div>
  );
}
```

## Testing

### Unit Tests

Test individual components with mock data:

```typescript
import { render, screen } from '@testing-library/react';
import { CommentCard } from './CommentCard';

test('renders comment with user info', () => {
  const comment = {
    id: 1,
    user_name: 'John Doe',
    text: 'Great list!',
    created_at: new Date().toISOString(),
    // ...
  };

  render(<CommentCard comment={comment} entityType="list" entityId={1} />);

  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('Great list!')).toBeInTheDocument();
});
```

### Integration Tests

Test the complete comment flow:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentThread } from './CommentThread';

test('adds a new comment', async () => {
  const user = userEvent.setup();

  render(<CommentThread entityType="list" entityId={1} />);

  const textarea = screen.getByPlaceholderText('Add a comment...');
  await user.type(textarea, 'This is a test comment');

  const button = screen.getByText('Add Comment');
  await user.click(button);

  await waitFor(() => {
    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
  });
});
```

## Error Handling

All components include comprehensive error handling:

- **Network errors:** Display error message with retry
- **Validation errors:** Show inline error messages
- **Permission errors:** Hide delete button for non-owners
- **Loading states:** Show spinner during async operations

## Future Enhancements

Potential improvements for future iterations:

- **Edit comments:** Allow users to edit their own comments
- **Reactions:** Add emoji reactions to comments
- **Mentions:** @mention other users in comments
- **Rich text:** Support markdown or basic formatting
- **Real-time updates:** WebSocket integration for live comments
- **Pagination:** Load older comments on demand
- **Notifications:** Notify users of new comments
- **Sorting options:** Sort by newest/oldest
- **Threading:** Reply to specific comments

## File Structure

```
components/comments/
├── CommentThread.tsx    # Main thread component
├── CommentCard.tsx      # Individual comment display
├── CommentForm.tsx      # Add comment form
├── index.ts             # Public exports
└── README.md            # This file

hooks/
└── useComments.ts       # React Query hooks

types/
└── index.ts             # Comment type definitions

lib/api/
└── endpoints.ts         # Comment API endpoints

lib/
└── utils.ts             # formatRelativeTime utility

components/ui/
└── textarea.tsx         # Textarea component (created for comments)
```

## Dependencies

- **@tanstack/react-query** - Data fetching and caching
- **@radix-ui/react-avatar** - Avatar component
- **class-variance-authority** - Component variants
- **tailwind-merge** - Tailwind class merging
- **clsx** - Conditional classes

## Acceptance Criteria

- [x] CommentThread is reusable for any entity type (list, occasion, list_item)
- [x] Comments display with user info and timestamp
- [x] Can add new comments via form
- [x] Can delete own comments only
- [x] Mobile-responsive with proper touch targets (44px min)
- [x] Loading/error states handled
- [x] Character limit (500) with visual feedback
- [x] Sorted by newest first
- [x] Confirmation dialog before deletion
- [x] Accessible with ARIA labels and semantic HTML
