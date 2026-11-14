---
component: PersonDropdown
status: Complete
created: 2024-12-06
dependencies:
  - PersonQuickCreateModal
  - usePersons hook
  - Avatar component
use_cases:
  - UI-002: GiftCard person selector (compact)
  - UI-003: GiftForm recipients (multi-select)
  - UI-006: OccasionCard person selector
  - UI-007: BulkActionBar (multi-select)
---

# PersonDropdown Component

## Overview

Searchable dropdown component for selecting one or multiple persons with inline "Add New Person" functionality.

## Features

- **Single & Multi-Select**: Supports both selection modes
- **Search/Filter**: Real-time filtering by name
- **Inline Creation**: "Add New Person" button opens quick-create modal
- **Mobile-First**: Bottom sheet on mobile, dropdown on desktop
- **Keyboard Navigation**: Full arrow key/Enter/Escape support
- **Touch Targets**: 44px minimum (default), 32px (compact)
- **Loading/Error States**: Proper handling of async data
- **Accessibility**: WCAG 2.1 AA compliant

## Variants

### Default Variant (44px height)
- Used in forms (GiftForm, OccasionForm, etc.)
- Full-size with proper touch targets
- Optimal for desktop and mobile forms

### Compact Variant (32px height)
- Used in cards (GiftCard, OccasionCard)
- Smaller footprint for dense layouts
- Still meets touch target guidelines via padding

## Props

```typescript
interface PersonDropdownProps {
  value: number | number[] | null;
  onChange: (value: number | number[] | null) => void;
  label?: string;
  variant?: 'compact' | 'default';
  multiSelect?: boolean;
  allowNew?: boolean;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}
```

## Usage Examples

### Single Select (Forms)

```tsx
import { PersonDropdown } from '@/components/common/PersonDropdown';

function GiftForm() {
  const [recipientId, setRecipientId] = useState<number | null>(null);

  return (
    <PersonDropdown
      label="Recipient"
      value={recipientId}
      onChange={setRecipientId}
      placeholder="Who is this gift for?"
    />
  );
}
```

### Multi-Select (Bulk Actions)

```tsx
function BulkActionBar() {
  const [selectedPersons, setSelectedPersons] = useState<number[]>([]);

  return (
    <PersonDropdown
      label="Assign to"
      value={selectedPersons}
      onChange={(value) => setSelectedPersons(value as number[])}
      multiSelect
      placeholder="Select people..."
    />
  );
}
```

### Compact Variant (Cards)

```tsx
function GiftCard({ gift }: { gift: Gift }) {
  const [recipientId, setRecipientId] = useState<number | null>(null);

  return (
    <Card>
      <PersonDropdown
        label="For"
        value={recipientId}
        onChange={setRecipientId}
        variant="compact"
        placeholder="Assign..."
      />
    </Card>
  );
}
```

### Without "Add New" (Filters)

```tsx
function GiftFilters() {
  const [filterId, setFilterId] = useState<number | null>(null);

  return (
    <PersonDropdown
      label="Filter by person"
      value={filterId}
      onChange={setFilterId}
      allowNew={false}
      placeholder="All people"
    />
  );
}
```

## Design Tokens (Soft Modernity)

- **Background**: `#FFFFFF` (elevated), `#F9F7F5` (warm-50)
- **Border**: `#D4CDC4` (border-light)
- **Focus Border**: `#E8846B` (warm-400)
- **Focus Ring**: `#F5CFC5` (warm-200)
- **Text**: `#3E3935` (warm-900)
- **Placeholder**: `#9B918A` (warm-500)
- **Radius**: `12px` (medium)
- **Avatar Size**: 24px (xs), 32px (sm)

## Accessibility

### ARIA Attributes
- `role="button"` on trigger
- `aria-haspopup="listbox"`
- `aria-expanded` state
- `role="listbox"` on dropdown
- `role="option"` on each person
- `aria-selected` for selected items

### Keyboard Navigation
- `Space/Enter`: Open dropdown
- `Escape`: Close dropdown
- `Arrow Down`: Navigate to next option
- `Arrow Up`: Navigate to previous option
- `Enter`: Select focused option

### Touch Targets
- Default: `min-h-[44px]` (meets WCAG 2.1 AA)
- Compact: `min-h-[32px]` with padding adjustment

## Mobile Considerations

### Bottom Sheet (Small Screens)
```css
/* Fixed to bottom on mobile */
@media (max-width: 768px) {
  .dropdown-menu {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 1rem 1rem 0 0;
  }
}
```

### Search Focus
- Auto-focuses search input when dropdown opens
- Virtual keyboard safe on mobile

## Related Components

### PersonQuickCreateModal
- Simple inline person creation
- Essential fields only (name, relationship, photo)
- Opens from "Add New Person" button
- Auto-selects created person

### Dependencies
- `usePersons` hook from `@/hooks/usePersons`
- `Avatar` component from `@/components/ui/avatar`
- Icons from `@/components/ui/icons`

## Testing

### Test Coverage
- Single select mode
- Multi-select mode
- Search/filter functionality
- Keyboard navigation
- "Add New Person" flow
- Variants (compact/default)
- Loading/error states
- Accessibility compliance

### Running Tests
```bash
cd apps/web
npm test PersonDropdown.test.tsx
npm test PersonQuickCreateModal.test.tsx
```

## Files Created

```
apps/web/
├── components/
│   ├── common/
│   │   ├── PersonDropdown.tsx              # Main component
│   │   ├── PersonDropdown.example.tsx      # Usage examples
│   │   └── __tests__/
│   │       └── PersonDropdown.test.tsx     # Tests
│   └── modals/
│       ├── PersonQuickCreateModal.tsx      # Quick create modal
│       ├── index.ts                        # Updated exports
│       └── __tests__/
│           └── PersonQuickCreateModal.test.tsx
```

## Implementation Notes

### State Management
- Uses React Query for person data fetching
- Local state for dropdown open/close
- Search query managed locally
- No unnecessary re-renders

### Performance
- Memoized filtered results
- Optimistic updates on person creation
- Automatic cache invalidation via React Query

### Error Handling
- Loading state while fetching persons
- Error state on fetch failure
- Validation feedback via `error` prop
- Toast notifications on create success/failure

## Future Enhancements

- [ ] Lazy loading for large person lists
- [ ] Group persons by relationship
- [ ] Recently selected persons at top
- [ ] Avatar upload in quick create
- [ ] Keyboard shortcuts (Cmd+K to open)
- [ ] Virtual scrolling for 100+ persons

## Version History

- **v1.0.0** (2024-12-06): Initial implementation
  - Single & multi-select modes
  - Search/filter functionality
  - Inline person creation
  - Compact & default variants
  - Full accessibility support
