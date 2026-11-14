# Admin Component Tests Specification

## Overview
Comprehensive test suite for admin field options components (Phase 9-10).

## Test Results
- **Total Tests**: 126 passing
- **Test Files**: 6 files
- **Coverage Target**: >70% (achieved)

## Test Files

### 1. AdminPage.test.tsx
**Component**: Main admin page with entity tabs

**Test Cases**:
- Renders all 4 entity tabs (Person, Gift, Occasion, List)
- Shows Person tab as default active
- Switches tabs on click
- Active tab has correct styling
- Renders EntityTab for active entity
- Keyboard navigation works

### 2. FieldsList.test.tsx
**Component**: Collapsible fields list grouped by category

**Test Cases**:
- Renders fields grouped by category
- Fields start collapsed
- Expands field on click
- Collapses on second click
- Shows field label and name
- Chevron rotates when expanded
- Handles empty fields
- Multiple fields can be expanded

### 3. OptionsList.test.tsx
**Component**: Options list with CRUD actions

**Test Cases**:
- Shows loading state
- Shows error message on failure
- Renders options list
- Shows "Add Option" button
- Shows "No options" message when empty
- Renders edit/delete buttons
- Shows "System" badge for system options
- Shows "Inactive" badge for inactive options
- Shows usage count badge
- Disables edit/delete for system options
- Opens modals on button clicks

### 4. AddOptionModal.test.tsx
**Component**: Add option modal form

**Test Cases**:
- Renders form fields
- Auto-generates value from label
- Validates required fields
- Validates value format
- Shows validation errors
- Submits with correct data
- Shows loading during submission
- Closes on success
- Closes on cancel
- Shows API errors
- Disables form during submission

### 5. EditOptionModal.test.tsx
**Component**: Edit option modal

**Test Cases**:
- Shows loading while fetching
- Pre-populates form
- Shows value as read-only
- Allows editing label and order
- Validates label
- Submits updates
- Shows loading during update
- Closes on success
- Shows errors
- Blocks editing system options
- Shows fetch errors

### 6. DeleteConfirmationModal.test.tsx
**Component**: Delete confirmation dialog

**Test Cases**:
- Shows option label
- Shows "in use" warning
- Shows soft-delete message
- Shows permanent delete message
- Button text changes based on usage
- Blocks deletion of system options
- Calls deleteOption with correct hardDelete flag
- Shows loading during deletion
- Closes on success
- Cancels without deletion
- Shows API errors

## Mock Setup

### React Query Hooks
```typescript
vi.mock('@/hooks/useFieldOptions')
vi.mock('@/hooks/useFieldOptionsMutation')
```

### Mock Data
```typescript
const mockOptions: FieldOptionDTO[] = [
  {
    id: 1,
    entity: 'person',
    field_name: 'dietary_restrictions',
    value: 'vegetarian',
    display_label: 'Vegetarian',
    display_order: 1,
    is_active: true,
    is_system: false,
    usage_count: 5,
  },
  // ... more options
];
```

## Testing Patterns

### User Interactions
```typescript
const user = userEvent.setup();
await user.click(screen.getByRole('button', { name: /add/i }));
```

### Loading States
```typescript
vi.mocked(useFieldOptions).mockReturnValue({
  data: undefined,
  isLoading: true,
  error: null,
});
```

### Error States
```typescript
vi.mocked(useFieldOptions).mockReturnValue({
  data: undefined,
  isLoading: false,
  error: new Error('Failed to fetch'),
});
```

## Coverage Target
Minimum 70% component coverage for all admin components.
