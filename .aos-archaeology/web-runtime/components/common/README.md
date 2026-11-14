# Common Components

Reusable components shared across the application.

## GiftImage

A robust image component that gracefully handles loading errors and missing images.

### Features

- **Error Handling**: Automatically displays a styled placeholder when images fail to load
- **Loading States**: Manages image loading with smooth transitions
- **Fallback UI**: Shows a gift icon placeholder with gradient background
- **Next.js Image Support**: Works with both Next.js `Image` and standard `img` elements
- **Dark Mode**: Supports dark mode styling for placeholders
- **Flexible Styling**: Accepts custom className and fallbackClassName props

### Usage

#### Basic Usage

```tsx
import { GiftImage } from '@/components/common/GiftImage';

<GiftImage
  src={gift.image_url}
  alt={gift.name}
  width={320}
  height={200}
  className="rounded-xl"
/>
```

#### With Fill (Next.js Image)

```tsx
<div className="relative aspect-square">
  <GiftImage
    src={gift.image_url}
    alt={gift.name}
    fill
    className="object-cover"
    sizes="(max-width: 640px) 100vw, 50vw"
  />
</div>
```

#### With Custom Fallback

```tsx
<GiftImage
  src={gift.image_url}
  alt={gift.name}
  width={48}
  height={48}
  className="w-12 h-12 rounded-xl object-cover"
  fallbackClassName="w-12 h-12 rounded-xl"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string \| null \| undefined` | - | Image source URL |
| `alt` | `string` | - | Alt text for image (required) |
| `className` | `string` | - | CSS classes for the image |
| `fallbackClassName` | `string` | - | CSS classes for fallback placeholder |
| `width` | `number` | - | Image width |
| `height` | `number` | - | Image height |
| `fill` | `boolean` | `false` | Use Next.js fill mode |
| `sizes` | `string` | - | Responsive image sizes |
| `priority` | `boolean` | `false` | Load image with priority |
| `unoptimized` | `boolean` | `true` | Disable Next.js image optimization |
| `draggable` | `boolean` | `false` | Allow image dragging |
| `onLoad` | `() => void` | - | Callback when image loads |
| `onError` | `() => void` | - | Callback when image fails |

### Fallback Design

When an image fails to load or no `src` is provided, the component displays:
- Gradient background (purple to pink)
- Material Symbols "redeem" (gift) icon
- Dark mode support

### Implementation Details

- Uses React state to track loading and error states
- Automatically chooses between Next.js `Image` and standard `img` based on props
- Opacity transition for smooth loading
- Prevents broken image icons from showing

### Where It's Used

- `KanbanCard.tsx` - Gift cards in Kanban board
- `ListDetailModal.tsx` - Gift items in list detail view
- `IdeaInbox.tsx` - Gift ideas in the inbox

### Best Practices

1. Always provide meaningful `alt` text for accessibility
2. Use `fallbackClassName` when you need specific sizing for the placeholder
3. Set `unoptimized={true}` for external images (default)
4. Use `fill` for responsive containers with aspect ratios
5. Provide `width` and `height` for fixed-size images
