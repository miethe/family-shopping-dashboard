# Animation System Documentation

## Overview

This document describes the comprehensive animation system implemented in the Family Gifting Dashboard. All animations are optimized for 60fps performance, respect accessibility preferences, and follow the design system tokens defined in `DESIGN-TOKENS.md`.

## Animation Philosophy

1. **Performance First**: All animations use `transform` and `opacity` for GPU acceleration
2. **Accessibility**: Respects `prefers-reduced-motion` media query
3. **Consistent Timing**: Uses design system tokens for durations and easing functions
4. **Mobile Optimized**: Smooth animations on mobile devices and iOS Safari

## Duration Variables

From the design system (`globals.css`):

```css
--duration-fast: 150ms;       /* Fast interactions */
--duration-default: 200ms;    /* Default interactions */
--duration-slow: 300ms;       /* Slower, more dramatic */
--duration-page: 400ms;       /* Page transitions */
```

## Easing Functions

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);        /* Entering elements */
--ease-in: cubic-bezier(0.7, 0, 0.84, 0);         /* Exiting elements */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);    /* Smooth both ways */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Bouncy (for delight) */
```

## Available Animations

### 1. Page Transitions

For route changes and page component mounting:

```tsx
// Fade in entire page on mount
<div className="min-h-screen animate-fade-in">
  {/* Page content */}
</div>

// Fast fade in for quick transitions
<div className="animate-fade-in-fast">
  {/* Content */}
</div>

// Fade out (for exits)
<div className="animate-fade-out">
  {/* Exiting content */}
</div>
```

**CSS Classes:**
- `animate-fade-in` - 400ms fade in with slight upward movement
- `animate-fade-in-fast` - 200ms quick fade in
- `animate-fade-out` - 200ms fade out

### 2. Card & Element Animations

For cards, panels, and content blocks that need entrance animations:

```tsx
// Card slides up on mount
<Card className="animate-slide-up">
  <CardContent>...</CardContent>
</Card>

// Other directions
<div className="animate-slide-down">...</div>
<div className="animate-slide-in-left">...</div>
<div className="animate-slide-in-right">...</div>
```

**CSS Classes:**
- `animate-slide-up` - 300ms slide up from bottom
- `animate-slide-down` - 300ms slide down from top
- `animate-slide-in-left` - 300ms slide in from left
- `animate-slide-in-right` - 300ms slide in from right

### 3. Modal & Dialog Animations

For modals, dialogs, sheets, and overlays:

```tsx
// Modal content scales in
<Dialog>
  <DialogContent className="animate-scale-in">
    {/* Modal content */}
  </DialogContent>
</Dialog>

// Modal backdrop fades in
<div className="fixed inset-0 bg-black/50 animate-modal-backdrop" />
```

**CSS Classes:**
- `animate-scale-in` - 300ms scale from 95% to 100%
- `animate-scale-out` - 300ms scale from 100% to 95%
- `animate-modal-backdrop` - 200ms fade in for overlays

### 4. Button & Interactive Effects

For buttons and clickable elements:

```tsx
// Press effect - scales down on active
<button className="press-effect">Click me</button>

// Lift effect - elevates on hover
<Card className="lift-effect">
  {/* Interactive card */}
</Card>

// Ripple effect - material design ripple
<button className="ripple-effect">
  Click for ripple
</button>
```

**CSS Classes:**
- `press-effect` - Scales to 98% when pressed
- `lift-effect` - Elevates with shadow on hover
- `ripple-effect` - Material design ripple on click

### 5. Status & Feedback Animations

For status changes and user feedback:

```tsx
// Pulse animation for attention
<div className="attention-pulse">
  New notification!
</div>

// Bounce for success feedback
<div className="success-bounce">
  Saved successfully!
</div>

// Flash on status change
<StatusPill className="status-flash">
  Updated
</StatusPill>
```

**CSS Classes:**
- `attention-pulse` - Continuous pulse animation (2s infinite)
- `success-bounce` - Single bounce animation (0.5s)
- `status-flash` - Quick flash effect (0.3s)

### 6. Loading States

For loading indicators and skeleton screens:

```tsx
// Shimmer loading effect
<div className="shimmer h-20 rounded-lg" />

// Spinning loader
<div className="animate-spin">
  <Icon name="refresh" />
</div>

// Pulsing placeholder
<div className="animate-pulse bg-gray-200 h-4 w-32 rounded" />
```

**CSS Classes:**
- `shimmer` - Gradient shimmer effect (1.5s infinite)
- `animate-spin` - Continuous rotation (1s infinite)
- `animate-pulse` - Opacity pulse (2s infinite)

### 7. Staggered Animations

For lists or grids where items should animate in sequence:

```tsx
// Apply to each item with increasing delay
<div className="space-y-4">
  {items.map((item, index) => (
    <Card
      key={item.id}
      className={`animate-stagger stagger-delay-${Math.min(index + 1, 5)}`}
    >
      {item.content}
    </Card>
  ))}
</div>
```

**CSS Classes:**
- `animate-stagger` - Base stagger animation
- `stagger-delay-1` through `stagger-delay-5` - Delays from 50ms to 250ms

### 8. Transition Utilities

For smooth transitions on hover/focus states:

```tsx
// Base transition (200ms)
<div className="transition-base hover:bg-gray-100">
  Hover me
</div>

// Fast transition (150ms)
<div className="transition-fast hover:scale-105">
  Quick response
</div>

// Slow transition (300ms)
<div className="transition-slow hover:shadow-lg">
  Smooth change
</div>
```

**CSS Classes:**
- `transition-base` - 200ms transition
- `transition-fast` - 150ms transition
- `transition-slow` - 300ms transition

## Performance Optimization

### GPU Acceleration

Use these classes for performance-critical animations:

```tsx
// Force GPU rendering
<div className="gpu-accelerated">
  {/* Animated content */}
</div>

// Hint what will change
<div className="will-change-transform">
  {/* Element that will transform */}
</div>

<div className="will-change-opacity">
  {/* Element that will fade */}
</div>
```

**CSS Classes:**
- `gpu-accelerated` - Forces GPU rendering with `translateZ(0)`
- `will-change-transform` - Hints that transform will change
- `will-change-opacity` - Hints that opacity will change

**Important:** Use `will-change` sparingly as it consumes memory.

### Transform Origin

Control the anchor point for scaling/rotating animations:

```tsx
<div className="origin-center animate-scale-in">
  Scale from center
</div>

<div className="origin-top animate-slide-down">
  Slide down from top
</div>
```

**CSS Classes:**
- `origin-center` - Transform from center
- `origin-top` - Transform from top
- `origin-bottom` - Transform from bottom

## Component-Specific Patterns

### Cards

```tsx
// Card with entrance animation
<Card className="animate-slide-up">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Interactive card with hover effect
<Card className="lift-effect cursor-pointer">
  {/* Clickable card */}
</Card>
```

### Buttons

```tsx
// Standard button with press effect
<Button className="press-effect">
  Click me
</Button>

// Button with ripple effect
<Button className="ripple-effect">
  Material design
</Button>
```

### Modals

```tsx
// Modal with proper animations
<Dialog>
  <DialogOverlay className="animate-modal-backdrop" />
  <DialogContent className="animate-scale-in">
    <DialogTitle>Modal Title</DialogTitle>
    <DialogDescription>Content</DialogDescription>
  </DialogContent>
</Dialog>
```

### Lists

```tsx
// Staggered list animation
<div className="space-y-3">
  {items.map((item, i) => (
    <div
      key={item.id}
      className={`animate-stagger stagger-delay-${Math.min(i + 1, 5)}`}
    >
      {item.content}
    </div>
  ))}
</div>
```

## Accessibility

### Reduced Motion

All animations automatically respect the `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Users who enable "Reduce Motion" in their OS settings will see instant transitions instead of animations.

### Disabling Animations on Load

To prevent animation flicker on page load for specific elements:

```tsx
<div className="no-animate-on-load">
  {/* No animations on initial render */}
</div>
```

## Best Practices

### 1. Choose the Right Duration

- **Fast (150ms)**: Simple hover states, button presses
- **Default (200ms)**: Most transitions, simple animations
- **Slow (300ms)**: Card entrances, modals, dramatic effects
- **Page (400ms)**: Full page transitions

### 2. Use GPU-Accelerated Properties

Always animate these properties for 60fps performance:

- ✅ `transform` (translate, scale, rotate)
- ✅ `opacity`
- ❌ Avoid: `width`, `height`, `top`, `left` (causes layout shifts)

### 3. Prevent Layout Shifts

All animations use `transform` and `opacity` to avoid triggering layout recalculations:

```tsx
// Good - uses transform
<div className="hover:scale-105">...</div>

// Bad - causes layout shift
<div className="hover:w-64">...</div>
```

### 4. Stagger Thoughtfully

Don't stagger more than 5-6 items or the delay becomes noticeable:

```tsx
// Good - limits to 5 items
stagger-delay-${Math.min(index + 1, 5)}

// Bad - can delay too long
stagger-delay-${index + 1}
```

### 5. Test on Mobile

Always test animations on actual mobile devices, especially iOS Safari:

- Check for jank or dropped frames
- Verify touch interactions feel responsive
- Test with low power mode enabled

## Debugging Animations

### Check if Animation is Running

```javascript
// In browser DevTools console
const element = document.querySelector('.animate-slide-up');
const animations = element.getAnimations();
console.log(animations); // Should show running animations
```

### Performance Profiling

1. Open Chrome DevTools
2. Go to Performance tab
3. Record while animation plays
4. Look for green bars (GPU accelerated) vs purple (CPU)
5. Check FPS stays at 60

### Common Issues

**Animation not appearing:**
- Check CSS class is applied in DOM
- Verify animation keyframes exist in compiled CSS
- Check for conflicting CSS (e.g., `animation: none`)

**Jank or low FPS:**
- Avoid animating layout properties
- Use `transform` and `opacity` only
- Add `gpu-accelerated` class
- Reduce number of simultaneous animations

**Animation conflicts:**
- Check for multiple animation classes on same element
- Verify custom animations don't override utility classes
- Use more specific selectors if needed

## Examples

### Complete Page Implementation

```tsx
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-cream p-6 animate-fade-in">
      {/* Hero Card */}
      <Card className="animate-slide-up mb-6">
        <CardHeader>
          <CardTitle>Welcome Back!</CardTitle>
        </CardHeader>
      </Card>

      {/* Stats Grid with Stagger */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Card
            key={stat.id}
            className={`animate-stagger stagger-delay-${i + 1}`}
          >
            <CardContent>{stat.value}</CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive Button */}
      <Button className="press-effect mt-6">
        Add New Item
      </Button>
    </div>
  );
}
```

### Modal with Animations

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogOverlay className="fixed inset-0 bg-black/50 animate-modal-backdrop" />
  <DialogContent className="animate-scale-in">
    <DialogTitle>Confirm Action</DialogTitle>
    <DialogDescription>
      Are you sure you want to continue?
    </DialogDescription>
    <div className="flex gap-2 mt-4">
      <Button className="press-effect">Cancel</Button>
      <Button className="press-effect success-bounce">Confirm</Button>
    </div>
  </DialogContent>
</Dialog>
```

## Testing Checklist

Before marking animations as complete, verify:

- [ ] All animations run at 60fps on desktop
- [ ] All animations run smoothly on mobile devices
- [ ] Animations respect `prefers-reduced-motion`
- [ ] No layout shifts occur during animations
- [ ] No animation flicker on page load
- [ ] Touch interactions feel responsive (no delay)
- [ ] Animations complete in documented durations
- [ ] Cards animate on mount smoothly
- [ ] Modals scale in without jank
- [ ] Page transitions are smooth
- [ ] Button interactions have immediate feedback

## Resources

- **Design Tokens**: `/docs/designs/DESIGN-TOKENS.md`
- **Component Library**: `/components/ui/`
- **Global Styles**: `/app/globals.css`
- **Performance Guide**: [Web.dev Animation Performance](https://web.dev/animations-guide/)

---

**Last Updated**: 2025-12-01
**Version**: 1.0
