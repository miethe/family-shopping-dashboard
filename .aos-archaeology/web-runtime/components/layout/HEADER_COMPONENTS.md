# Header Components - Design System V2

This document describes the header-related components implemented in Phase 2, Task LN-004.

## Components Overview

### 1. Header (Mobile)
**File**: `/components/layout/Header.tsx`

Mobile-only header component with glassmorphism styling and sticky positioning.

**Features**:
- Sticky to top with iOS safe-area support
- Glassmorphism background (`bg-white/70 backdrop-blur-xl`)
- Search toggle button (expandable search bar)
- Notifications button with badge indicator
- Quick Add button (primary action)
- User menu button
- Connection status indicator
- Dark mode support

**Usage**:
```tsx
import { Header } from '@/components/layout';

// Used in AppLayout - automatically shown on mobile
<Header />
```

**Responsive Behavior**:
- Mobile (< md): Visible with full functionality
- Desktop (>= md): Hidden (desktop uses sidebar only)

---

### 2. PageHeader (Desktop & Mobile)
**File**: `/components/layout/PageHeader.tsx`

Reusable page header component for page titles, breadcrumbs, and actions.

**Features**:
- Breadcrumb navigation (desktop only)
- Page title and subtitle
- Action buttons (right-aligned)
- Back button (mobile only)
- Dark mode support
- Responsive layout

**Props**:
```typescript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  backHref?: string | { pathname: string; query?: Record<string, string> };
  breadcrumbItems?: BreadcrumbItem[];
  breadcrumb?: React.ReactNode; // deprecated
}
```

**Usage**:
```tsx
import { PageHeader } from '@/components/layout';

<PageHeader
  title="Christmas 2024"
  subtitle="Gift list for family"
  breadcrumbItems={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Lists', href: '/lists' },
    { label: 'Christmas 2024' }
  ]}
  backHref="/lists"
  actions={
    <button className="...">Add Gift</button>
  }
/>
```

**Responsive Behavior**:
- Mobile: Shows back button, hides breadcrumbs
- Desktop: Shows breadcrumbs, hides back button

---

### 3. Breadcrumb
**File**: `/components/layout/Breadcrumb.tsx`

Navigation breadcrumb component showing current location in the app hierarchy.

**Features**:
- Clickable navigation links
- Current page highlighted
- Responsive with text truncation
- Separator icons (ChevronRight)
- Dark mode support
- Accessible with ARIA labels

**Props**:
```typescript
interface BreadcrumbItem {
  label: string;
  href?: string; // optional for last item
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}
```

**Usage**:
```tsx
import { Breadcrumb } from '@/components/layout';

<Breadcrumb items={[
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Lists', href: '/lists' },
  { label: 'Christmas 2024' } // current page - no href
]} />
```

**Responsive Behavior**:
- Mobile: Truncates long labels to 200px
- Desktop: Full label display

---

### 4. SearchInput
**File**: `/components/layout/SearchInput.tsx`

Search input component with glassmorphism styling and clear functionality.

**Features**:
- Glassmorphism background
- Search icon (left)
- Clear button (right) - shows when input has value
- Auto-focus support
- Live search callback
- Form submit support
- 44px minimum touch target
- Dark mode support

**Props**:
```typescript
interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  autoFocus?: boolean;
}
```

**Usage**:
```tsx
import { SearchInput } from '@/components/layout';

<SearchInput
  placeholder="Search gifts, lists, people..."
  onSearch={(query) => console.log('Search:', query)}
  autoFocus
/>
```

**Integration**:
- Used in mobile Header (expandable)
- Can be used standalone in any page

---

## New Icons Added

**File**: `/components/layout/icons.tsx`

Added the following icons for header components:

- `BellIcon` - Notifications
- `SearchIcon` - Search functionality
- `CogIcon` - Settings
- `XIcon` - Close/Clear actions

All icons follow the same pattern as existing icons:
- Default size: `w-6 h-6`
- Customizable via className prop
- Heroicons outline style
- Stroke-based SVG

---

## Responsive Strategy

Following the inspiration project's approach:

### Mobile (< md: 768px)
- **Header**: Sticky top header with app title, search toggle, notifications, quick add, user menu
- **PageHeader**: Shows back button + title + subtitle + actions
- **Breadcrumbs**: Hidden (back button provides navigation)
- **Search**: Expandable from header toggle button

### Desktop (>= md: 768px)
- **Header**: Hidden (desktop uses sidebar navigation)
- **PageHeader**: Shows breadcrumbs + title + subtitle + actions
- **Breadcrumbs**: Visible at top of PageHeader
- **Back Button**: Hidden (breadcrumbs provide navigation)
- **Search**: Can be shown inline or in page-specific locations

---

## Design Tokens Used

### Colors
- Background: `bg-white/70`, `bg-warm-900/70` (glassmorphism)
- Text: `text-warm-600`, `text-warm-900`, `text-warm-100`
- Primary: `bg-primary-500`, `text-primary-600`
- Borders: `border-white/20`, `border-warm-700/20`

### Shadows
- `shadow-glass` - Glassmorphism shadow
- `shadow-low`, `shadow-medium` - Elevation shadows

### Borders
- `border-white/20` - Glass border (light mode)
- `border-warm-700/20` - Glass border (dark mode)
- `rounded-large` - 14px border radius
- `rounded-full` - Fully rounded buttons

### Spacing
- Safe areas: `calc(0.75rem + env(safe-area-inset-top))`
- Touch targets: `min-h-[44px]`, `min-w-[44px]`

### Typography
- Title: `text-lg font-bold` (mobile header)
- Page title: `text-2xl md:text-3xl font-bold`
- Subtitle: `text-body-medium`
- Breadcrumb: `text-body-small`

---

## Accessibility

All components follow WCAG 2.1 AA standards:

1. **Touch Targets**: Minimum 44x44px for all interactive elements
2. **ARIA Labels**: All icon buttons have `aria-label`
3. **Keyboard Navigation**: All interactive elements are keyboard accessible
4. **Focus States**: Visible focus rings on all interactive elements
5. **Color Contrast**: Text meets minimum contrast ratios
6. **Screen Readers**: Breadcrumb has `aria-label="Breadcrumb"`, current page has `aria-current="page"`

---

## Dark Mode

All components support dark mode via Tailwind's `dark:` variant:

- Background colors adapt (white/70 → warm-900/70)
- Text colors adapt (warm-900 → warm-100)
- Border colors adapt (white/20 → warm-700/20)
- Hover states adapt for dark backgrounds

Dark mode is controlled by the `class` strategy in `tailwind.config.ts`.

---

## Example Page Implementation

See `/app/lists/[id]/page.tsx` for a complete example of using PageHeader with breadcrumbs:

```tsx
<PageHeader
  title={listData.name}
  subtitle={`${itemCount} items`}
  backHref="/lists"
  breadcrumbItems={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Lists', href: '/lists' },
    { label: listData.name }
  ]}
  actions={
    <div className="flex gap-3">
      <button>Filter</button>
      <button>Sort</button>
      <button>Add Gift</button>
    </div>
  }
/>
```

---

## Future Enhancements

Potential improvements for future phases:

1. **Search Functionality**: Implement actual search logic (currently just console.log)
2. **Notifications**: Build notifications panel/dropdown
3. **User Menu**: Create user menu dropdown with settings, profile, logout
4. **Breadcrumb Generation**: Auto-generate breadcrumbs from route path
5. **Search History**: Add recent searches to SearchInput
6. **Keyboard Shortcuts**: Add keyboard shortcut for search (cmd+k / ctrl+k)
7. **Mobile Search**: Consider persistent search bar option for mobile

---

## Testing

To test the components:

1. **Mobile Header**:
   - View on mobile viewport (< 768px)
   - Click search toggle - should expand search bar
   - Type in search - should show clear button
   - Click clear - should clear input
   - Check notification badge display
   - Verify safe area top padding on iOS

2. **PageHeader**:
   - View on desktop (>= 768px) - should show breadcrumbs
   - View on mobile (< 768px) - should show back button
   - Click breadcrumb links - should navigate
   - Verify action buttons align right
   - Test with/without subtitle

3. **Breadcrumb**:
   - Click navigation links - should navigate
   - Current page should be highlighted (no link)
   - Long labels should truncate on mobile
   - Check dark mode styling

4. **SearchInput**:
   - Type in input - should call onSearch callback
   - Input with value - should show clear button
   - Click clear - should clear and refocus
   - Submit form - should prevent default and call onSearch
   - Check auto-focus works

---

## Acceptance Criteria - Met

All requirements from Task LN-004 have been met:

- ✅ Header is sticky on mobile with glassmorphism
- ✅ Breadcrumbs show current navigation path (desktop)
- ✅ Search input is accessible via toggle button
- ✅ Action buttons are aligned to the right
- ✅ Glassmorphism effect visible on header
- ✅ Works with dark mode
- ✅ Mobile-first responsive design
- ✅ PageHeader handles breadcrumbs on desktop
- ✅ All touch targets meet 44px minimum
- ✅ iOS safe areas supported

---

**Version**: 1.0
**Last Updated**: 2025-12-01
**Phase**: Phase 2 - Layout & Navigation (Task LN-004)
