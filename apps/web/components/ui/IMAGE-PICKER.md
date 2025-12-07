# ImagePicker Component

A comprehensive image selection component for entity create/edit forms with multiple input methods and validation.

## Features

- **Multiple Input Methods**:
  - File upload via click
  - Drag and drop
  - Paste from clipboard (Ctrl+V / Cmd+V)
  - URL input for remote images

- **Validation**:
  - File type validation (JPEG, PNG, WebP, GIF, HEIF/HEIC)
  - File size validation (max 10MB)
  - Clear error messages

- **UX**:
  - Image preview after selection
  - Loading states during upload
  - Hover-to-reveal remove button
  - Mobile-friendly (44px touch targets)
  - Soft Modernity design system

## Installation

The component is already installed. Import from:

```typescript
import { ImagePicker } from '@/components/ui/image-picker';
```

## API Endpoints

The component requires these backend endpoints:

- `POST /upload/image` - Upload file or URL
  - Accepts: `FormData` with `file` field OR JSON with `{ url: string }`
  - Returns: `{ url: string, thumbnail_url: string }`

- `GET /upload/image/config` - Get upload configuration
  - Returns: `{ max_size_mb: number, allowed_types: string[] }`

## Usage

### Basic Usage

```tsx
import { useState } from 'react';
import { ImagePicker } from '@/components/ui/image-picker';

function MyForm() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <ImagePicker
      value={imageUrl}
      onChange={setImageUrl}
    />
  );
}
```

### With Error Handling

```tsx
function MyForm() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <ImagePicker
      value={imageUrl}
      onChange={setImageUrl}
      onError={(error) => {
        console.error('Upload failed:', error);
        // Show toast notification, etc.
      }}
    />
  );
}
```

### In a Gift Form

```tsx
function GiftForm() {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    image_url: null as string | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await giftApi.create(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Gift Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      <div>
        <label className="block mb-2 text-xs font-semibold text-warm-800">
          Image
        </label>
        <ImagePicker
          value={formData.image_url}
          onChange={(url) => setFormData({ ...formData, image_url: url })}
        />
      </div>

      <Button type="submit">Create Gift</Button>
    </form>
  );
}
```

### With Disabled State

```tsx
function MyForm() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <ImagePicker
      value={imageUrl}
      onChange={setImageUrl}
      disabled={isSubmitting}
    />
  );
}
```

### Pre-populated (Edit Form)

```tsx
function EditGiftForm({ gift }: { gift: Gift }) {
  const [imageUrl, setImageUrl] = useState<string | null>(gift.image_url);

  return (
    <ImagePicker
      value={imageUrl}
      onChange={setImageUrl}
    />
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `value` | `string \| null` | No | `undefined` | Current image URL |
| `onChange` | `(url: string \| null) => void` | Yes | - | Callback when image changes |
| `onError` | `(error: string) => void` | No | `undefined` | Callback when upload fails |
| `className` | `string` | No | `undefined` | Additional CSS classes |
| `disabled` | `boolean` | No | `false` | Disable all interactions |

## Input Methods

### 1. File Upload (Click)

Click anywhere on the picker area to open file browser.

**Accepted Types**: JPEG, PNG, WebP, GIF, HEIF/HEIC
**Max Size**: 10MB

### 2. Drag and Drop

Drag an image file from your desktop and drop it on the picker area.

- Hover feedback with border highlight
- Only accepts image files

### 3. Paste from Clipboard

Copy an image (from browser, screenshot tool, etc.) and press Ctrl+V / Cmd+V while the picker is in "Upload" mode.

- Works globally when in file upload mode
- Automatically detects image data in clipboard

### 4. URL Input

Switch to "URL" tab and paste a remote image URL.

- Validates URL format
- Backend downloads and re-hosts the image
- Useful for importing from product pages

## Validation

### File Type Validation

Only these MIME types are accepted:
- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`
- `image/heif`
- `image/heic`

### File Size Validation

Maximum file size: **10MB**

Files larger than 10MB will be rejected with a clear error message.

### Error Messages

Clear, actionable error messages are shown for:
- Invalid file type
- File too large
- Network errors
- Invalid URL format

## Design Tokens

The component uses the Soft Modernity design system:

**Colors**:
- Border: `border-border-medium`
- Background: `bg-warm-50`, `bg-warm-100`
- Error: `bg-status-warning-50`, `text-status-warning-600`
- Primary: `border-primary-500`, `bg-primary-50`

**Spacing**:
- Padding: `p-6` (24px)
- Gap: `gap-2` (8px), `gap-3` (12px)
- Min height: `min-h-[200px]`

**Border Radius**:
- Container: `rounded-large` (12px)
- Button: `rounded-full` (9999px)

**Touch Targets**:
- All interactive elements: `min-h-[44px] min-w-[44px]`

## Accessibility

- Proper ARIA labels for remove button
- Hidden file input with keyboard accessibility
- Focus states on all interactive elements
- Alt text for preview image
- Error messages with ARIA role="alert"

## Mobile Considerations

- 44px minimum touch targets (iOS guideline)
- Responsive layout
- Works with iOS photo picker
- Paste works on mobile (from photo gallery)

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Clipboard API for paste functionality
- Drag and Drop API
- FormData for file upload

## Backend Integration

### Upload API Helper

```typescript
import { uploadApi } from '@/lib/api/upload';

// Upload file
const response = await uploadApi.uploadImage(file);
console.log(response.url); // Full image URL
console.log(response.thumbnail_url); // Thumbnail URL

// Upload from URL
const response = await uploadApi.uploadImageFromUrl('https://example.com/image.jpg');

// Get config
const config = await uploadApi.getConfig();
console.log(config.max_size_mb); // 10
console.log(config.allowed_types); // ['image/jpeg', 'image/png', ...]
```

### API Client Enhancement

The API client automatically handles `FormData`:
- Detects FormData in request body
- Omits `Content-Type` header to let browser set multipart boundary
- Preserves JSON serialization for non-FormData requests

## Examples

See `image-picker.example.tsx` for complete examples:
- Basic usage
- Gift form integration
- Disabled state
- Custom error handling
- Edit form with existing image

## Testing

To test all input methods:

1. **Click Upload**: Click picker → select file from browser
2. **Drag & Drop**: Drag image file from desktop onto picker
3. **Paste**: Copy image (screenshot, browser) → focus picker → Ctrl+V
4. **URL**: Switch to URL tab → paste image URL → submit

Test validation:
- Try uploading a `.txt` file (should reject)
- Try uploading a file > 10MB (should reject)
- Try invalid URL (should reject)

## Troubleshooting

**Paste not working**:
- Make sure you're in "Upload" mode (not "URL" mode)
- Ensure image is in clipboard (not file path)
- Check browser console for errors

**Drag & Drop not working**:
- Ensure you're dragging an image file (not URL)
- Check if `disabled` prop is set
- Verify browser supports Drag & Drop API

**Upload fails**:
- Check browser network tab for API errors
- Verify backend `/upload/image` endpoint is running
- Check file size and type are valid

**Preview doesn't show**:
- Verify `value` prop contains valid URL
- Check Next.js Image optimization settings
- Look for CORS errors in console

## Future Enhancements

Potential improvements:
- Image cropping/editing before upload
- Multiple image upload
- Progress bar for large files
- Thumbnail preview grid
- Image compression before upload
- Webcam capture
- AI-powered image suggestions

---

**Version**: 1.0
**Last Updated**: 2024-12-06
**Requirements**: FE-FR8-01
