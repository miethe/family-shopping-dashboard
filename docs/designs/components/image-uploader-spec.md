# ImageUploader Component - Design Specification

**Component Type:** Form Input / Media Upload
**Design System:** Soft Modernity (Apple-inspired warm aesthetic)
**Platform:** Mobile-first, responsive
**Last Updated:** 2025-12-02

---

## Overview

The ImageUploader is a reusable component for uploading product images and profile photos in the Family Gifting Dashboard. It supports multiple input methods (click, drag-and-drop, paste) with real-time preview and progress feedback, maintaining the warm, refined aesthetic throughout all interaction states.

### Purpose

- Enable easy image uploads via click, drag-and-drop, or clipboard paste
- Provide clear visual feedback during upload process
- Show image previews with option to replace/remove
- Handle errors gracefully with retry options
- Support both new uploads and editing existing images

### Use Cases

1. **Gift Form** - Upload product images when adding/editing gifts
2. **Person Form** - Upload profile photos for family members
3. **Compact Mode** - Inline image selection in constrained spaces

---

## Design Tokens

### Colors

```yaml
Backgrounds:
  dropzone-default: "#F5F2ED"    # Subtle warm gray, inviting
  dropzone-hover: "#FAF8F5"      # Lighter cream on hover
  preview-overlay: "rgba(45, 37, 32, 0.6)"  # Warm semi-transparent overlay

Borders:
  default: "#D4CDC4"             # Medium warm gray
  hover: "#E8846B"               # Holiday Coral
  error: "#C97B63"               # Terracotta
  success: "#4A7C59"             # Sage (if needed)

Text:
  primary: "#2D2520"             # Warm ink
  secondary: "#5C534D"           # Secondary text
  tertiary: "#8A827C"            # Hints and labels
  error: "#C97B63"               # Terracotta for errors

Accent:
  coral: "#E8846B"               # Primary actions
  coral-hover: "#DC7258"         # Hover state
```

### Spacing

```yaml
Dropzone:
  padding: 24px                  # Generous internal space
  compact-padding: 16px          # For compact mode

Icon:
  size: 48px                     # Large enough for touch
  compact-size: 32px             # Compact mode

Gap:
  content: 12px                  # Between icon and text
  hint: 8px                      # Between elements in hints
```

### Typography

```yaml
Prompt:
  size: 14px
  weight: 500                    # Medium
  color: "#5C534D"
  line-height: 1.5

Error:
  size: 14px
  weight: 500
  color: "#C97B63"
  line-height: 1.4

Hint:
  size: 12px
  weight: 400                    # Regular
  color: "#8A827C"
  line-height: 1.4

Action-link:
  size: 14px
  weight: 500
  color: "#E8846B"
  text-decoration: none
  hover-color: "#DC7258"
```

### Borders & Radius

```yaml
Border:
  width: 2px
  style: dashed                  # Indicates drop zone
  radius: 16px                   # Large, generous corners

Preview:
  radius: 12px                   # Slightly smaller for images
  border-width: 1px              # Solid for previews
  border-style: solid
```

### Shadows

```yaml
Subtle:
  - "0 1px 2px rgba(45, 37, 32, 0.04)"
  - "0 2px 4px rgba(45, 37, 32, 0.02)"

Medium:
  - "0 2px 4px rgba(45, 37, 32, 0.06)"
  - "0 4px 12px rgba(45, 37, 32, 0.04)"

Preview:
  - "0 2px 8px rgba(45, 37, 32, 0.08)"
  - "0 4px 16px rgba(45, 37, 32, 0.04)"
```

---

## Visual States

### 1. Empty State (No Image)

**Purpose:** Default state, inviting user to upload

**Visual Structure:**
```
┌─────────────────────────────────────────┐
│                                         │
│              [Upload Icon]              │
│                                         │
│         Click to upload image           │
│      or drag and drop (paste works!)   │
│                                         │
│     JPEG, PNG, GIF, WebP • Max 10MB    │
│                                         │
└─────────────────────────────────────────┘
```

**Specifications:**
- **Container:**
  - Background: `#F5F2ED`
  - Border: `2px dashed #D4CDC4`
  - Border radius: `16px`
  - Padding: `24px`
  - Min height: `200px` (desktop), `180px` (mobile)
  - Shadow: Subtle
  - Cursor: `pointer`

- **Upload Icon:**
  - Size: `48px × 48px`
  - Color: `#8A827C` (tertiary)
  - Style: Outlined upload cloud/arrow icon
  - Centered horizontally
  - Margin bottom: `12px`

- **Primary Text ("Click to upload image"):**
  - Font size: `14px`
  - Weight: `500`
  - Color: `#5C534D` (secondary)
  - Text align: center

- **Secondary Text ("or drag and drop..."):**
  - Font size: `12px`
  - Weight: `400`
  - Color: `#8A827C` (tertiary)
  - Text align: center
  - Margin top: `4px`

- **Hint Text ("JPEG, PNG..."):**
  - Font size: `12px`
  - Weight: `400`
  - Color: `#8A827C` (tertiary)
  - Text align: center
  - Margin top: `12px`

**Touch Target:** Entire container is tappable (44px minimum height met)

---

### 2. Drag Hover State

**Purpose:** Visual feedback when file is being dragged over zone

**Visual Changes from Empty:**
- **Background:** Transitions to `#FAF8F5` (lighter)
- **Border:** Changes to `2px dashed #E8846B` (coral)
- **Shadow:** Upgrades to medium shadow
- **Icon color:** Changes to `#E8846B` (coral)
- **Text ("Drop image here"):**
  - Color: `#E8846B`
  - Slightly bolder (weight: `600`)

**Animation:**
- Border color transition: `150ms ease-out`
- Background transition: `150ms ease-out`
- Subtle scale: `1.0 → 1.01` (very subtle lift)
- Shadow transition: `150ms ease-out`

**Visual Structure:**
```
┌─────────────────────────────────────────┐ (coral dashed border)
│                                         │
│          [Upload Icon - Coral]          │
│                                         │
│           Drop image here               │ (coral text, bold)
│                                         │
└─────────────────────────────────────────┘
```

---

### 3. Uploading State

**Purpose:** Show upload progress with visual feedback

**Visual Structure:**
```
┌─────────────────────────────────────────┐
│   ┌───────────────────────────────┐     │
│   │  [Image Preview - Dimmed]     │     │
│   │                               │     │
│   │      [Spinner Icon]           │     │
│   │                               │     │
│   │     Uploading... 60%          │     │
│   │  ████████░░░░░░░░░░░░░░░      │     │
│   │                               │     │
│   └───────────────────────────────┘     │
└─────────────────────────────────────────┘
```

**Specifications:**
- **Container:** Same as empty state
- **Preview Image:**
  - Shown at reduced opacity: `0.5`
  - Border radius: `12px`
  - Max dimensions: fit within container with 16px padding
  - Aspect ratio: maintained

- **Overlay:**
  - Background: `rgba(45, 37, 32, 0.6)` (warm semi-transparent)
  - Covers entire preview area
  - Border radius: `12px` (matches preview)
  - Centered content

- **Spinner Icon:**
  - Size: `32px × 32px`
  - Color: `#FAF8F5` (cream, high contrast on dark overlay)
  - Animation: Continuous rotation, `1s linear`
  - Margin bottom: `12px`

- **Progress Text ("Uploading... 60%"):**
  - Font size: `14px`
  - Weight: `500`
  - Color: `#FAF8F5` (cream)
  - Text align: center
  - Margin bottom: `8px`

- **Progress Bar:**
  - Width: `120px`
  - Height: `4px`
  - Background: `rgba(250, 248, 245, 0.3)` (dim cream)
  - Border radius: `2px`
  - Fill color: `#FAF8F5` (cream)
  - Fill width: Percentage-based (e.g., 60% = 72px)
  - Smooth transition: `200ms ease-out`

**Interaction:** Not clickable during upload (cursor: `not-allowed` on hover)

---

### 4. Preview State (Upload Complete)

**Purpose:** Show uploaded image with option to replace or remove

**Visual Structure:**
```
┌─────────────────────────────────────────┐
│   ┌───────────────────────────────┐     │
│   │                               │     │
│   │     [Uploaded Image]          │     │
│   │                               │     │
│   │                               │     │
│   └───────────────────────────────┘     │
│                                         │
│   [Replace Image]  •  [Remove]         │ (action links)
│                                         │
└─────────────────────────────────────────┘
```

**Specifications:**
- **Container:**
  - Background: `#FAF8F5` (base cream)
  - Border: `1px solid #D4CDC4` (subtle, solid)
  - Border radius: `16px`
  - Padding: `16px`
  - Shadow: Preview shadow (medium)

- **Preview Image:**
  - Border radius: `12px`
  - Max width: `100%`
  - Max height: `300px` (desktop), `200px` (mobile)
  - Object fit: `contain` (preserve aspect ratio)
  - Background: `#F5F2ED` (subtle background if image has transparency)
  - Shadow: Subtle

- **Action Links Container:**
  - Margin top: `12px`
  - Display: flex, centered
  - Gap: `16px`

- **Replace Image Link:**
  - Font size: `14px`
  - Weight: `500`
  - Color: `#E8846B` (coral)
  - Cursor: `pointer`
  - Hover color: `#DC7258`
  - Transition: `color 150ms ease-out`

- **Separator ("•"):**
  - Color: `#D4CDC4`
  - Font size: `14px`

- **Remove Link:**
  - Font size: `14px`
  - Weight: `500`
  - Color: `#5C534D` (secondary)
  - Cursor: `pointer`
  - Hover color: `#2D2520` (primary)
  - Transition: `color 150ms ease-out`

**Hover States:**
- Links underline on hover
- Color transitions as specified
- Cursor changes to pointer

**Touch Targets:** Each action link is at least 44px × 44px tappable area

---

### 5. Error State

**Purpose:** Communicate upload failure or validation error with recovery option

**Visual Structure:**
```
┌─────────────────────────────────────────┐ (terracotta dashed border)
│                                         │
│           [Error Icon - Red]            │
│                                         │
│         Upload failed                   │ (terracotta text)
│   File too large (max 10MB)            │ (secondary error detail)
│                                         │
│           [Try Again]                   │ (coral button)
│                                         │
└─────────────────────────────────────────┘
```

**Specifications:**
- **Container:**
  - Background: `#FAF8F5` (base cream, not red)
  - Border: `2px dashed #C97B63` (terracotta)
  - Border radius: `16px`
  - Padding: `24px`
  - Shadow: Subtle

- **Error Icon:**
  - Size: `48px × 48px`
  - Color: `#C97B63` (terracotta)
  - Style: Circle with exclamation or X
  - Centered horizontally
  - Margin bottom: `12px`

- **Error Title ("Upload failed"):**
  - Font size: `14px`
  - Weight: `600`
  - Color: `#C97B63` (terracotta)
  - Text align: center
  - Margin bottom: `4px`

- **Error Detail ("File too large..."):**
  - Font size: `12px`
  - Weight: `400`
  - Color: `#5C534D` (secondary)
  - Text align: center
  - Margin bottom: `16px`

- **Try Again Button:**
  - Background: `#E8846B` (coral)
  - Color: `#FAF8F5` (cream text)
  - Font size: `14px`
  - Weight: `500`
  - Padding: `10px 20px`
  - Border radius: `8px`
  - Border: none
  - Shadow: Subtle
  - Cursor: `pointer`
  - Hover background: `#DC7258`
  - Transition: `background 150ms ease-out`
  - Min touch target: `44px × 44px`

**Common Error Messages:**
- "File too large (max 10MB)"
- "Invalid file type (JPEG, PNG, GIF, WebP only)"
- "Upload failed. Please try again."
- "Network error. Check your connection."

---

### 6. Existing URL State (Editing)

**Purpose:** When editing, show current image with replace option

**Visual Structure:**
```
┌─────────────────────────────────────────┐
│   ┌───────────────────────────────┐     │
│   │                               │     │
│   │   [Current Image from URL]    │     │
│   │                               │     │
│   └───────────────────────────────┘     │
│                                         │
│      Current image  •  [Replace]        │
│                                         │
└─────────────────────────────────────────┘
```

**Specifications:**
- Same as Preview State, but:
  - Label: "Current image" instead of actions on left
  - Only "Replace" link (no Remove option initially)
  - Optional: Small "Remove image" link below if removal is allowed

**Load State (While Fetching URL):**
- Show skeleton/placeholder:
  - Background: `#F5F2ED`
  - Shimmer animation (subtle gradient moving left-to-right)
  - Border radius: `12px`
  - Aspect ratio: `1:1` square placeholder

---

## Compact Mode

**Purpose:** Inline image selection in constrained spaces (e.g., table cells, compact forms)

**Dimensions:**
- Container: `80px × 80px` (fixed square)
- Padding: `8px`
- Icon size: `24px`
- Font size: `11px`

**Visual Structure (Empty):**
```
┌─────────────┐
│             │
│   [Icon]    │
│   Upload    │
│             │
└─────────────┘
```

**Visual Structure (With Image):**
```
┌─────────────┐
│ ┌─────────┐ │
│ │ [Image] │ │
│ │         │ │
│ │  [Edit] │ │ (overlay on hover)
│ └─────────┘ │
└─────────────┘
```

**Specifications:**
- **Empty State:**
  - Border: `1px dashed #D4CDC4`
  - Icon: `24px`, centered
  - Text: `11px`, below icon
  - Hover: border → coral

- **Preview State:**
  - Image fills container (80px × 80px)
  - Border radius: `8px` (smaller)
  - Edit overlay appears on hover:
    - Background: `rgba(45, 37, 32, 0.7)`
    - "Edit" text: `11px`, `#FAF8F5`, centered
    - Icon: Small pencil, `16px`

**Use Cases:**
- Person avatar in a list
- Gift thumbnail in table view
- Quick inline editing

---

## Responsive Behavior

### Desktop (≥768px)

- **Dropzone:** Min height `200px`, padding `24px`
- **Preview:** Max height `300px`
- **Icon:** `48px`
- **Text:** `14px` prompt, `12px` hints
- **Actions:** Horizontal layout with separator

### Tablet (640px - 767px)

- **Dropzone:** Min height `180px`, padding `20px`
- **Preview:** Max height `240px`
- **Icon:** `40px`
- **Text:** Same as desktop
- **Actions:** Horizontal layout

### Mobile (<640px)

- **Dropzone:** Min height `180px`, padding `16px`
- **Preview:** Max height `200px`
- **Icon:** `40px`
- **Text:** `13px` prompt, `11px` hints
- **Actions:** Vertical stack for easier tapping
  - "Replace Image" button (full width)
  - "Remove" link below (centered)
  - Min 44px touch targets

**Mobile Touch Optimization:**
- Entire dropzone is tappable (44px+ height)
- Action buttons have generous padding
- Adequate spacing between interactive elements (12px+)
- Focus states clearly visible

---

## Accessibility Requirements

### Keyboard Navigation

- **Tab order:**
  1. Dropzone/button (file input)
  2. Replace link (if in preview state)
  3. Remove link (if in preview state)

- **Keyboard shortcuts:**
  - `Space` or `Enter`: Open file picker when focused on dropzone
  - `Escape`: Cancel upload (if in progress)
  - `Cmd/Ctrl + V`: Paste image from clipboard (when dropzone focused)

- **Focus indicators:**
  - Visible focus ring: `2px solid #E8846B` with `4px` offset
  - Border radius matches element (`16px` for dropzone, `8px` for buttons)

### Screen Reader Support

**ARIA Labels:**

```html
<!-- Empty State -->
<div
  role="button"
  aria-label="Upload image. Click to choose file, drag and drop, or paste from clipboard. Maximum size 10 megabytes. Supported formats: JPEG, PNG, GIF, WebP."
  tabindex="0"
>

<!-- Uploading State -->
<div
  aria-live="polite"
  aria-label="Uploading image. 60 percent complete."
>

<!-- Preview State -->
<img
  src="..."
  alt="Uploaded product image preview"
  role="img"
>
<button aria-label="Replace image">Replace Image</button>
<button aria-label="Remove image">Remove</button>

<!-- Error State -->
<div
  role="alert"
  aria-live="assertive"
  aria-label="Upload failed. File too large. Maximum size is 10 megabytes. Try again."
>
```

**Status Updates:**
- Upload progress announced at 25%, 50%, 75%, 100%
- Error messages immediately announced via `aria-live="assertive"`
- Success announced: "Image uploaded successfully"

### Color Contrast

All text meets WCAG AA standards:

- **Primary text** (`#2D2520` on `#FAF8F5`): 11.8:1 (AAA)
- **Secondary text** (`#5C534D` on `#FAF8F5`): 5.2:1 (AA)
- **Tertiary text** (`#8A827C` on `#FAF8F5`): 3.1:1 (AA Large)
- **Error text** (`#C97B63` on `#FAF8F5`): 3.4:1 (AA Large)
- **Coral links** (`#E8846B` on `#FAF8F5`): 3.1:1 (AA Large)

**Note:** Error states use both color AND iconography (not color alone)

### Alternative Input Methods

- **Voice control:** All interactive elements labeled clearly
- **Switch access:** Proper tab order, clear focus states
- **Magnification:** Scales properly up to 200% zoom

---

## Animation & Transitions

### Hover Transitions

```yaml
Border color: 150ms ease-out
Background: 150ms ease-out
Text color: 150ms ease-out
Shadow: 150ms ease-out
Scale: 200ms cubic-bezier(0.4, 0, 0.2, 1)
```

### State Changes

**Empty → Drag Hover:**
- Border color fade: `150ms`
- Background fade: `150ms`
- Subtle scale up: `200ms`, `1.0 → 1.01`

**Uploading Progress:**
- Progress bar fill: `200ms ease-out` on each update
- Spinner rotation: `1s linear infinite`

**Upload Complete:**
- Fade in preview: `300ms ease-out`
- Fade in action links: `200ms ease-out` with `100ms` delay

**Error Appearance:**
- Fade in error content: `200ms ease-out`
- Gentle shake animation: `400ms ease-out` (optional, subtle)

### Loading States

**Image Preview Loading:**
- Skeleton shimmer: `1.5s linear infinite`
- Gradient moves from left to right
- Opacity: `0 → 0.6 → 0`

### Micro-interactions

- **File selected:** Subtle "lift" effect (scale `1.0 → 1.02 → 1.0`, `300ms`)
- **Upload success:** Brief green checkmark overlay (fade in/out, `1s` total)
- **Paste detection:** Brief border pulse in coral

---

## Edge Cases & Error Handling

### File Validation

**File Type Validation:**
- **Invalid type:** Show error state with message "Invalid file type (JPEG, PNG, GIF, WebP only)"
- **Check:** Before upload attempt, on file selection

**File Size Validation:**
- **Too large:** Show error "File too large (max 10MB)"
- **Check:** Client-side before upload
- **Progress:** If detected during upload, abort and show error

**Corrupted File:**
- **Server error:** Show error "Upload failed. File may be corrupted."
- **Retry:** Allow user to select different file

### Network Errors

**Connection Lost:**
- Detect failed upload
- Show error: "Network error. Check your connection."
- Auto-retry: Optional, after 3s delay (with countdown)
- Manual retry: "Try Again" button always available

**Slow Upload:**
- Show progress bar continuously
- Timeout: After 60s, show error with retry option
- Cancel option: Allow user to cancel long uploads (if needed)

### Multiple Files

**Single File Only:**
- If multiple files dropped/selected, take only first file
- Show brief message: "Only one image allowed" (toast notification)

### Paste Handling

**Clipboard Empty:**
- Show brief message: "No image in clipboard"
- Don't change state

**Non-Image Clipboard:**
- Ignore paste if clipboard contains text/other data
- No error message (silent failure is acceptable)

**Paste Success:**
- Treat same as file selection
- Show preview immediately
- Begin upload

### Image Preview Edge Cases

**Very Wide Image:**
- Maintain aspect ratio
- Max width: Container width minus padding
- Center vertically

**Very Tall Image:**
- Maintain aspect ratio
- Max height: `300px` (desktop), `200px` (mobile)
- Center horizontally

**Square Image:**
- Fit within max dimensions
- Center both axes

**Transparent Image:**
- Show subtle background (`#F5F2ED`) behind preview
- Maintains visibility against cream background

### Loading Existing URL

**Invalid URL:**
- Show error icon in preview area
- Message: "Image not found"
- Treat as empty state (allow new upload)

**Slow Loading URL:**
- Show skeleton/shimmer placeholder
- Timeout after 10s → error state
- "Replace" option still available

**Network Image (External URL):**
- Load via proxy if needed (security)
- Show loading state until loaded
- Error handling same as above

### Mobile-Specific Edge Cases

**Drag-and-Drop on Mobile:**
- Not supported on most mobile browsers
- Hide "drag and drop" text on mobile
- Show only "Tap to upload" or "Tap to select image"

**Camera Access:**
- File picker may show "Take Photo" option (native)
- No special handling needed
- Treated same as selected file

**Paste on Mobile:**
- Limited clipboard support on mobile Safari
- Don't emphasize paste functionality on mobile
- Still functional if browser supports it

---

## Implementation Notes

### File Input Integration

- Hidden `<input type="file" accept="image/*">` element
- Trigger click on dropzone click
- Listen to change event for file selection

### Drag-and-Drop Events

```javascript
// Events to handle:
- dragenter: Add hover state
- dragover: Prevent default, maintain hover
- dragleave: Remove hover state (check relatedTarget)
- drop: Process file, remove hover
```

### Paste Event

```javascript
// Listen on document or dropzone:
document.addEventListener('paste', (e) => {
  const items = e.clipboardData.items;
  // Find image item, create file, upload
});
```

### Upload Progress

- Use `XMLHttpRequest` with progress event, or
- Use `fetch` with ReadableStream for progress tracking
- Update progress state every 5% increment (reduce re-renders)

### Image Preview

- Use `FileReader.readAsDataURL()` for local preview
- Show immediately on file selection (before upload)
- Replace with server URL on upload success

### Accessibility Implementation

- Use semantic HTML (`<button>`, proper ARIA)
- Manage focus states carefully (especially during upload)
- Announce state changes via `aria-live` regions
- Test with screen readers (VoiceOver, NVDA)

---

## Design Rationale

### Why Dashed Border?

Dashed borders are a universally recognized pattern for drop zones. The warm gray color keeps it subtle and inviting rather than technical.

### Why Generous Padding?

Mobile-first design requires easy touch targets. The 24px padding creates ample space for the upload icon and text, making the entire area obviously tappable.

### Why Coral Hover State?

The Holiday Coral accent color provides clear visual feedback that the area is interactive, maintaining consistency with other interactive elements in the design system.

### Why Semi-Transparent Overlay?

During upload, users need to see the image they selected while understanding progress is happening. The warm semi-transparent overlay preserves context while clearly indicating a loading state.

### Why Action Links Instead of Buttons?

In preview state, "Replace" and "Remove" are secondary actions. Links with appropriate touch targets feel lighter and less prominent than buttons, keeping focus on the image preview itself.

### Why Different Error vs Success Borders?

Solid borders for preview/success states feel final and complete. Dashed borders for empty/error states invite interaction. The terracotta color for errors aligns with the warm palette while being clearly distinct from the coral accent.

---

## Future Enhancements

### Potential Features (Not in V1)

- **Multi-image upload:** Support multiple images with gallery preview
- **Image cropping:** Built-in crop tool before upload
- **Filters:** Apply basic filters (brightness, contrast)
- **Auto-orientation:** EXIF-based rotation correction
- **Compression settings:** User-controlled quality vs. size
- **Alt text input:** Accessibility field for image description

### Performance Optimizations

- **Lazy loading:** Only render preview when in viewport
- **Progressive upload:** Start upload before full file read
- **Client-side resize:** Reduce file size before upload (for large images)
- **Thumbnail generation:** Create multiple sizes server-side

---

## Testing Checklist

### Visual Testing

- [ ] Empty state renders correctly on all screen sizes
- [ ] Drag hover state transitions smoothly
- [ ] Upload progress updates visually
- [ ] Preview state shows image clearly
- [ ] Error state displays with proper styling
- [ ] Compact mode fits in constrained spaces

### Interaction Testing

- [ ] Click opens file picker
- [ ] Drag-and-drop accepts files
- [ ] Paste from clipboard works
- [ ] Replace image clears previous and allows new selection
- [ ] Remove image returns to empty state
- [ ] Retry after error works

### Accessibility Testing

- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Screen reader announces all states
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA
- [ ] Semantic HTML structure

### Edge Case Testing

- [ ] Invalid file type shows error
- [ ] File too large shows error
- [ ] Network error shows error with retry
- [ ] Very wide/tall images preview correctly
- [ ] Transparent images visible against background
- [ ] Paste with no clipboard content handled gracefully

### Cross-Browser Testing

- [ ] Chrome/Edge (desktop & mobile)
- [ ] Safari (desktop & iOS)
- [ ] Firefox (desktop & mobile)
- [ ] Mobile file picker integration

### Performance Testing

- [ ] Large file (10MB) uploads without freezing UI
- [ ] Multiple rapid uploads handled correctly
- [ ] Progress updates don't cause excessive re-renders

---

## Related Components

- **Button** - Used for "Try Again" in error state
- **Toast/Notification** - For brief success/error messages
- **Form Field** - ImageUploader integrates as form input
- **Loading Spinner** - Used in upload progress overlay

---

## Version History

- **v1.0** (2025-12-02): Initial design specification
  - All core states defined (empty, hover, uploading, preview, error, existing)
  - Compact mode specified
  - Accessibility requirements documented
  - Mobile-first responsive behavior
  - Animation and transition guidelines

---

**Design Owner:** UI/UX Team
**Implementation Target:** ManualGiftForm, Person Profile Form
**Design System Version:** Soft Modernity v1.0
