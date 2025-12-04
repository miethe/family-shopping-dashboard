# Component Variants — CVA Patterns

Token-optimized component variant patterns using `class-variance-authority` (CVA). All examples use Tailwind classes configured in `apps/web/tailwind.config.ts`.

---

## Button Component

### Variants

```typescript
// CVA Definition
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-medium font-semibold transition-all duration-200",
  {
    variants: {
      variant: {
        primary: "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-low hover:shadow-medium",
        secondary: "bg-warm-100 text-warm-900 border border-warm-300 hover:bg-warm-200 hover:border-warm-400",
        ghost: "bg-transparent text-warm-800 hover:bg-warm-100 active:bg-warm-200",
        glass: "bg-surface-secondary backdrop-blur-xs border border-glass-border text-warm-900 hover:bg-surface-tertiary shadow-glass",
        destructive: "bg-status-warning-500 text-white hover:bg-status-warning-600 active:bg-status-warning-700 shadow-low"
      },
      size: {
        sm: "h-8 px-3 text-body-small min-w-[44px]",
        md: "h-11 px-6 text-body-large min-w-[44px]",
        lg: "h-13 px-8 text-heading-3 min-w-[44px]",
        xl: "h-15 px-10 text-heading-2 min-w-[44px]"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);
```

### Tailwind Examples

```tsx
// Primary (Coral CTA)
<button className="
  inline-flex items-center justify-center
  h-11 px-6 min-w-[44px]
  bg-primary-500 text-white
  hover:bg-primary-600 active:bg-primary-700
  rounded-medium font-semibold
  shadow-low hover:shadow-medium
  transition-all duration-200
">
  Add Gift
</button>

// Secondary (Warm Gray)
<button className="
  inline-flex items-center justify-center
  h-11 px-6 min-w-[44px]
  bg-warm-100 text-warm-900
  border border-warm-300
  hover:bg-warm-200 hover:border-warm-400
  rounded-medium font-semibold
  transition-all duration-200
">
  Cancel
</button>

// Ghost (Transparent)
<button className="
  inline-flex items-center justify-center
  h-11 px-6 min-w-[44px]
  bg-transparent text-warm-800
  hover:bg-warm-100 active:bg-warm-200
  rounded-medium font-semibold
  transition-all duration-200
">
  Learn More
</button>

// Glass (Glassmorphism)
<button className="
  inline-flex items-center justify-center
  h-11 px-6 min-w-[44px]
  bg-surface-secondary backdrop-blur-xs
  border border-glass-border text-warm-900
  hover:bg-surface-tertiary
  rounded-medium font-semibold
  shadow-glass
  transition-all duration-200
">
  Dashboard
</button>

// Destructive (Terracotta)
<button className="
  inline-flex items-center justify-center
  h-11 px-6 min-w-[44px]
  bg-status-warning-500 text-white
  hover:bg-status-warning-600 active:bg-status-warning-700
  rounded-medium font-semibold
  shadow-low
  transition-all duration-200
">
  Delete
</button>
```

### States

```tsx
// Focus (All Variants)
focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2

// Disabled (All Variants)
disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none

// Loading (All Variants)
// Add spinner overlay, maintain dimensions
```

---

## Card Component

### Variants

```typescript
// CVA Definition
const cardVariants = cva(
  "rounded-large transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-surface-primary border border-border-subtle shadow-low hover:shadow-medium",
        glass: "bg-surface-secondary backdrop-blur-xs border border-glass-border shadow-glass",
        elevated: "bg-surface-primary border border-border-subtle shadow-medium hover:shadow-high",
        interactive: "bg-surface-primary border border-border-subtle shadow-low hover:shadow-medium hover:border-border-medium hover:scale-[1.01] active:scale-[0.99] cursor-pointer",
        stat: "border-2 shadow-medium",  // Gradient bg added via inline style
        flat: "bg-surface-secondary border border-border-subtle shadow-subtle"
      },
      padding: {
        sm: "p-5",     // 20px
        md: "p-6",     // 24px
        lg: "p-8"      // 32px
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "md"
    }
  }
);
```

### Tailwind Examples

```tsx
// Default (Elevated White)
<div className="
  bg-surface-primary
  border border-border-subtle
  rounded-large p-6
  shadow-low hover:shadow-medium
  transition-all duration-300
">
  {content}
</div>

// Glass (Glassmorphism)
<div className="
  bg-surface-secondary backdrop-blur-xs
  border border-glass-border
  rounded-xlarge p-6
  shadow-glass
  transition-all duration-300
">
  {content}
</div>

// Interactive (Hover Lift)
<div className="
  bg-surface-primary
  border border-border-subtle
  rounded-large p-6
  shadow-low
  hover:shadow-medium hover:border-border-medium
  hover:scale-[1.01] active:scale-[0.99]
  cursor-pointer
  transition-all duration-300
">
  {content}
</div>

// Stat (Gradient Background)
<div className="
  bg-gradient-to-br from-status-idea-50 to-status-idea-100
  border-2 border-status-idea-200
  rounded-2xlarge p-8
  shadow-medium
">
  <div className="text-display-medium font-heavy text-status-idea-700">
    12
  </div>
  <div className="text-body-small font-semibold uppercase text-status-idea-600">
    Ideas
  </div>
</div>

// Flat (Minimal)
<div className="
  bg-surface-secondary
  border border-border-subtle
  rounded-large p-5
  shadow-subtle
">
  {content}
</div>
```

---

## StatusPill Component

### Variants

```typescript
// CVA Definition
const statusPillVariants = cva(
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-small text-label-small uppercase",
  {
    variants: {
      status: {
        idea:        "bg-status-idea-100 text-status-idea-800 border border-status-idea-300",
        shortlisted: "bg-status-idea-100 text-status-idea-800 border border-status-idea-300",
        buying:      "bg-status-progress-100 text-status-progress-800 border border-status-progress-300",
        ordered:     "bg-status-progress-100 text-status-progress-800 border border-status-progress-300",
        purchased:   "bg-status-success-100 text-status-success-800 border border-status-success-300",
        delivered:   "bg-status-success-100 text-status-success-800 border border-status-success-300",
        gifted:      "bg-status-success-100 text-status-success-800 border border-status-success-300",
        urgent:      "bg-status-warning-100 text-status-warning-800 border border-status-warning-300"
      }
    }
  }
);
```

### Tailwind Examples

```tsx
// Idea (Mustard)
<span className="
  inline-flex items-center gap-1.5
  px-3 py-1.5
  bg-status-idea-100 text-status-idea-800
  border border-status-idea-300
  rounded-small
  text-label-small uppercase font-semibold
">
  <span className="w-1.5 h-1.5 rounded-full bg-status-idea-600" />
  Idea
</span>

// Purchased (Sage)
<span className="
  inline-flex items-center gap-1.5
  px-3 py-1.5
  bg-status-success-100 text-status-success-800
  border border-status-success-300
  rounded-small
  text-label-small uppercase font-semibold
">
  <span className="w-1.5 h-1.5 rounded-full bg-status-success-600" />
  Purchased
</span>

// Urgent (Terracotta)
<span className="
  inline-flex items-center gap-1.5
  px-3 py-1.5
  bg-status-warning-100 text-status-warning-800
  border border-status-warning-300
  rounded-small
  text-label-small uppercase font-semibold
">
  <span className="w-1.5 h-1.5 rounded-full bg-status-warning-600" />
  Urgent
</span>

// Buying (Lavender)
<span className="
  inline-flex items-center gap-1.5
  px-3 py-1.5
  bg-status-progress-100 text-status-progress-800
  border border-status-progress-300
  rounded-small
  text-label-small uppercase font-semibold
">
  <span className="w-1.5 h-1.5 rounded-full bg-status-progress-600" />
  Buying
</span>
```

### Status Dot Colors

```yaml
idea:        bg-status-idea-600        # Mustard
shortlisted: bg-status-idea-600        # Mustard
buying:      bg-status-progress-600    # Lavender
ordered:     bg-status-progress-600    # Lavender
purchased:   bg-status-success-600     # Sage
delivered:   bg-status-success-600     # Sage
gifted:      bg-status-success-600     # Sage
urgent:      bg-status-warning-600     # Terracotta
```

---

## Avatar Component

### Variants

```typescript
// CVA Definition
const avatarVariants = cva(
  "rounded-full border-2 border-white shadow-low",
  {
    variants: {
      size: {
        xs: "w-6 h-6",      // 24px
        sm: "w-8 h-8",      // 32px
        md: "w-10 h-10",    // 40px
        lg: "w-14 h-14",    // 56px
        xl: "w-20 h-20"     // 80px
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);
```

### Tailwind Examples

```tsx
// Medium Avatar (40px, Default)
<div className="relative">
  <img
    src={avatarUrl}
    className="w-10 h-10 rounded-full border-2 border-white shadow-low object-cover"
    alt="User"
  />
</div>

// Large Avatar with Status Ring (56px)
<div className="relative">
  <img
    src={avatarUrl}
    className="w-14 h-14 rounded-full border-2 border-white shadow-low object-cover"
    alt="User"
  />
  {/* Status ring - online */}
  <div className="
    absolute -bottom-0.5 -right-0.5
    w-14 h-14 rounded-full
    ring-3 ring-status-success-500
    border-2 border-white
    pointer-events-none
  " />
</div>

// Avatar with Badge (Gift Count)
<div className="relative">
  <img
    src={avatarUrl}
    className="w-14 h-14 rounded-full border-2 border-white shadow-low object-cover"
    alt="User"
  />
  {/* Gift count badge */}
  <div className="
    absolute -bottom-1 -right-1
    w-6 h-6 rounded-full
    bg-primary-500 text-white
    border-2 border-white
    flex items-center justify-center
    text-xs font-bold
  ">
    3
  </div>
</div>

// Avatar Carousel (Overlap)
<div className="flex -space-x-3">
  <img className="w-10 h-10 rounded-full border-2 border-white shadow-low z-30" src={url1} />
  <img className="w-10 h-10 rounded-full border-2 border-white shadow-low z-20" src={url2} />
  <img className="w-10 h-10 rounded-full border-2 border-white shadow-low z-10" src={url3} />
  <div className="
    w-10 h-10 rounded-full border-2 border-white shadow-low z-0
    bg-warm-300 text-warm-800
    flex items-center justify-center
    text-xs font-bold
  ">
    +5
  </div>
</div>
```

### Status Ring Colors

```yaml
online:  ring-status-success-500   # Sage green
busy:    ring-status-warning-500   # Terracotta
away:    ring-status-idea-500      # Mustard
offline: ring-warm-400             # Warm gray
```

---

## Input Component

### Variants

```typescript
// CVA Definition
const inputVariants = cva(
  "w-full h-12 px-4 rounded-medium text-body-large transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-white border-2 border-border-medium focus:border-primary-500 focus:ring-2 focus:ring-primary-200",
        error: "bg-white border-2 border-status-warning-500 focus:ring-2 focus:ring-status-warning-200",
        success: "bg-white border-2 border-status-success-500 focus:ring-2 focus:ring-status-success-200"
      },
      size: {
        md: "h-12 px-4 text-body-large",
        lg: "h-14 px-5 text-heading-3"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);
```

### Tailwind Examples

```tsx
// Text Input (Default)
<input
  type="text"
  className="
    w-full h-12 px-4
    bg-white text-warm-900
    border-2 border-border-medium
    focus:border-primary-500 focus:ring-2 focus:ring-primary-200
    rounded-medium
    text-body-large placeholder:text-warm-400
    shadow-subtle
    transition-all duration-200
    outline-none
  "
  placeholder="Enter gift name..."
/>

// Textarea
<textarea
  className="
    w-full min-h-[120px] px-4 py-3
    bg-white text-warm-900
    border-2 border-border-medium
    focus:border-primary-500 focus:ring-2 focus:ring-primary-200
    rounded-medium
    text-body-large placeholder:text-warm-400
    shadow-subtle
    resize-y
    transition-all duration-200
    outline-none
  "
  placeholder="Add notes..."
/>

// Select
<select className="
  w-full h-12 px-4
  bg-white text-warm-900
  border-2 border-border-medium
  focus:border-primary-500 focus:ring-2 focus:ring-primary-200
  rounded-medium
  text-body-large
  shadow-subtle
  appearance-none
  bg-[url('data:image/svg+xml;base64,...')] bg-no-repeat bg-right-4 bg-[length:16px]
  transition-all duration-200
  outline-none
">
  <option>Select status...</option>
</select>

// Error State
<input
  className="
    w-full h-12 px-4
    bg-white text-warm-900
    border-2 border-status-warning-500
    focus:ring-2 focus:ring-status-warning-200
    rounded-medium
    text-body-large
    transition-all duration-200
    outline-none
  "
/>

// Disabled State
<input
  disabled
  className="
    w-full h-12 px-4
    bg-warm-100 text-warm-500
    border-2 border-border-subtle
    rounded-medium
    text-body-large
    opacity-40 cursor-not-allowed
  "
/>
```

---

## Modal Component

### Structure

```tsx
// Overlay
<div className="
  fixed inset-0 z-40
  bg-overlay-strong backdrop-blur-sm
  animate-fade-in
" />

// Container
<div className="
  fixed inset-0 z-50
  flex items-center justify-center
  p-6
">
  {/* Modal Box */}
  <div className="
    w-full max-w-lg
    bg-surface-primary
    border border-border-subtle
    rounded-2xlarge
    shadow-extra-high
    animate-scale-in
  ">
    {/* Header */}
    <div className="
      px-8 py-6
      border-b border-border-subtle
    ">
      <h2 className="text-heading-1 font-bold text-warm-900">
        Modal Title
      </h2>
      <p className="mt-1 text-body-medium text-warm-600">
        Optional subtitle
      </p>
    </div>

    {/* Content */}
    <div className="px-8 py-6">
      {content}
    </div>

    {/* Footer */}
    <div className="
      px-8 py-6
      border-t border-border-subtle
      flex items-center justify-end gap-3
    ">
      <Button variant="secondary" size="md">Cancel</Button>
      <Button variant="primary" size="md">Confirm</Button>
    </div>
  </div>
</div>
```

---

## Loading States

### Spinner

```tsx
<div className="
  w-8 h-8
  border-4 border-warm-200 border-t-primary-500
  rounded-full
  animate-spin
" />
```

### Skeleton Loader

```tsx
// Text Line
<div className="h-4 w-3/4 bg-warm-200 rounded-medium animate-pulse" />

// Image Block
<div className="h-48 w-full bg-warm-200 rounded-large animate-pulse" />

// Card Skeleton
<div className="bg-surface-primary border border-border-subtle rounded-large p-6 space-y-4">
  <div className="h-6 w-3/4 bg-warm-200 rounded-medium animate-pulse" />
  <div className="h-4 w-full bg-warm-200 rounded-medium animate-pulse" />
  <div className="h-4 w-5/6 bg-warm-200 rounded-medium animate-pulse" />
</div>
```

---

## Utility Classes

### Glassmorphism Panel

```tsx
// Pre-configured utility
<div className="glass-panel p-6 rounded-xlarge">
  {content}
</div>

// Manual (if utility not available)
<div className="
  bg-surface-secondary backdrop-blur-xs
  border border-glass-border
  shadow-glass
  p-6 rounded-xlarge
">
  {content}
</div>
```

### Focus Ring

```tsx
focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
```

### Truncate Text

```tsx
className="truncate"           // Single line
className="line-clamp-2"       // Two lines
className="line-clamp-3"       // Three lines
```

---

**Reference**: See `apps/web/tailwind.config.ts` for complete CVA patterns
**Version**: 1.0
**Last Updated**: 2025-11-28
