# Entity Modal System

A beautiful, animated modal system for displaying entity details with organic animations and entity-specific theming.

## Design Vision

The modal system follows an **"Organic Premium"** aesthetic:
- **Warm, intimate feel** - Perfect for a family-focused application
- **Fluid elastic animations** - Natural, delightful motion with staggered reveals
- **Entity-specific themes** - Each entity type has its own color gradient and visual identity
- **Premium glass morphism** - Frosted glass effects with soft glows and shadows

## Components

### EntityModal (Base Component)

The foundation component that provides:
- Entity-specific color themes and gradients
- Smooth animations (fade, zoom, slide with elastic easing)
- Responsive sizing (sm, md, lg, xl)
- Frosted glass backdrop with radial gradients
- Sticky header/footer with blur effects

```tsx
import { EntityModal } from "@/components/modals";

<EntityModal
  open={open}
  onOpenChange={setOpen}
  entityType="person" // "person" | "gift" | "list" | "occasion"
  title="Modal Title"
  size="md" // "sm" | "md" | "lg" | "xl"
  footer={<>Footer content</>}
>
  Modal content goes here
</EntityModal>
```

### Entity Themes

Each entity type has a distinct visual theme:

| Entity | Gradient | Accent Glow | Primary Color |
|--------|----------|-------------|---------------|
| **Person** | Orange → Pink → Rose | Orange glow | Orange-500 |
| **Gift** | Purple → Fuchsia → Pink | Purple glow | Purple-500 |
| **List** | Blue → Cyan → Teal | Blue glow | Blue-500 |
| **Occasion** | Amber → Yellow → Orange | Amber glow | Amber-500 |

### Entity-Specific Modals

Pre-built modals for each entity type with full data fetching and display:

#### PersonDetailModal

```tsx
import { PersonDetailModal, useEntityModal } from "@/components/modals";

const { open, entityId, openModal, closeModal } = useEntityModal("person");

// Trigger modal
<button onClick={() => openModal(personId)}>View Person</button>

// Modal component
<PersonDetailModal
  personId={entityId}
  open={open}
  onOpenChange={closeModal}
/>
```

**Features:**
- Large avatar with initials fallback
- Birthday info with countdown
- Relationship badge
- Interests as animated badges
- Metadata with timestamps

#### GiftDetailModal

```tsx
import { GiftDetailModal, useEntityModal } from "@/components/modals";

const { open, entityId, openModal, closeModal } = useEntityModal("gift");

<GiftDetailModal
  giftId={entityId}
  open={open}
  onOpenChange={closeModal}
/>
```

**Features:**
- Large product image or placeholder
- Price with prominent display
- External link to product
- Source badge
- Extra data display
- Grid layout (image + info)

#### ListDetailModal

```tsx
import { ListDetailModal, useEntityModal } from "@/components/modals";

const { open, entityId, openModal, closeModal } = useEntityModal("list");

<ListDetailModal
  listId={entityId}
  open={open}
  onOpenChange={closeModal}
/>
```

**Features:**
- List type icon and badge
- Visibility indicator
- Item count and total value stats
- Grid of list items with images
- Per-item status badges
- Empty state for lists with no items

#### OccasionDetailModal

```tsx
import { OccasionDetailModal, useEntityModal } from "@/components/modals";

const { open, entityId, openModal, closeModal } = useEntityModal("occasion");

<OccasionDetailModal
  occasionId={entityId}
  open={open}
  onOpenChange={closeModal}
/>
```

**Features:**
- Occasion type icon with themed background
- Large formatted date display
- Dynamic countdown badge (days until/today/days ago)
- Description section
- Decorative gradient backgrounds

## useEntityModal Hook

Convenient hook for managing modal state:

```tsx
const {
  open,        // boolean - modal open state
  entityId,    // string | null - ID of entity being viewed
  openModal,   // (id: string) => void - open modal with entity ID
  closeModal,  // () => void - close modal and clear entity ID
  setOpen,     // (open: boolean) => void - manual control
} = useEntityModal("person");
```

## Animation System

All modals use a staggered animation system:

1. **Backdrop**: Fades in with blur (300ms)
2. **Modal container**: Zoom + fade + slide (300ms)
3. **Content sections**: Staggered fade-in with delays
   - First section: 100ms delay
   - Second section: 200ms delay
   - Subsequent sections: +50-100ms each

Uses Tailwind's `animate-in` utilities with custom delays via `[animation-delay:Nms]`.

## Integration with Entity Cards

To convert entity cards to use modals instead of navigation:

### Before (Navigation)
```tsx
import Link from "next/link";

<Link href={`/people/${person.id}`}>
  <Card>...</Card>
</Link>
```

### After (Modal)
```tsx
import { PersonDetailModal, useEntityModal } from "@/components/modals";

const { open, entityId, openModal, closeModal } = useEntityModal("person");

<button onClick={() => openModal(person.id)}>
  <Card>...</Card>
</button>

<PersonDetailModal
  personId={entityId}
  open={open}
  onOpenChange={closeModal}
/>
```

## Accessibility

- Proper ARIA labels on close buttons
- Keyboard navigation support (ESC to close)
- Focus management via Radix Dialog
- 44px minimum touch targets for mobile
- Readable color contrasts

## Mobile Optimization

- Responsive sizing: 90vh on mobile, 85vh on desktop
- Sticky header/footer with backdrop blur
- Scrollable content area
- Safe area aware
- Touch-friendly spacing and targets

## Performance

- Lazy loading: Modals only fetch data when opened
- React Query integration for caching
- Conditional rendering based on `enabled` flag
- Cleanup on close (delayed to allow exit animation)

## Customization

### Custom Footer Actions

```tsx
<EntityModal
  footer={
    <div className="flex gap-3 justify-end">
      <Button onClick={handleAction}>Custom Action</Button>
      <Button onClick={closeModal}>Close</Button>
    </div>
  }
>
  ...
</EntityModal>
```

### Custom Content Layout

All entity modals accept children for custom content:

```tsx
<EntityModal entityType="person" title="Custom">
  <div className="space-y-6">
    <YourCustomSection />
    <AnotherSection />
  </div>
</EntityModal>
```

## Future Enhancements

- [ ] Add edit mode within modals
- [ ] Inline actions (quick add to list, mark status)
- [ ] Share/export functionality
- [ ] Deep linking support (open modal from URL)
- [ ] Gesture support (swipe to close on mobile)
- [ ] Transition from card position (shared element transition)
