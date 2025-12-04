# Layout & Mobile Patterns

Token-optimized layout patterns for responsive, mobile-first design. Covers shell layouts, safe areas, touch targets, and responsive breakpoints.

---

## App Shell Layout

### Desktop: Sidebar + Main Content

```tsx
<div className="flex h-screen">
  {/* Sidebar - 240px fixed, hidden on mobile */}
  <aside className="
    hidden md:block
    w-60                        /* 240px fixed width */
    bg-surface-secondary backdrop-blur-xs
    border-r border-border-subtle
    shadow-translucent
    overflow-y-auto
  ">
    {/* Logo */}
    <div className="p-6 border-b border-border-subtle">
      <Logo />
    </div>

    {/* Navigation */}
    <nav className="p-4 space-y-2">
      <NavItem href="/dashboard" icon={HomeIcon}>Dashboard</NavItem>
      <NavItem href="/people" icon={UsersIcon}>People</NavItem>
      <NavItem href="/occasions" icon={CalendarIcon}>Occasions</NavItem>
      <NavItem href="/lists" icon={ListIcon}>Lists</NavItem>
      <NavItem href="/gifts" icon={GiftIcon}>Gifts</NavItem>
    </nav>

    {/* User Profile (Bottom) */}
    <div className="mt-auto p-4 border-t border-border-subtle">
      <UserProfile />
    </div>
  </aside>

  {/* Main Content Area - flex-1 */}
  <main className="
    flex-1
    overflow-y-auto
    bg-bg-base
  ">
    {children}
  </main>
</div>
```

### Mobile: Bottom Navigation

```tsx
{/* Main content with bottom padding for nav */}
<main className="
  pb-20 md:pb-0              /* Space for bottom nav on mobile */
  overflow-y-auto
  bg-bg-base
">
  {children}
</main>

{/* Bottom Navigation - Fixed, Mobile Only */}
<nav className="
  fixed bottom-0 left-0 right-0
  md:hidden                   /* Hide on tablet+ */
  h-14                        /* 56px */
  pb-safe-area-inset-bottom   /* iOS safe area */
  bg-surface-secondary backdrop-blur-xs
  border-t border-border-subtle
  shadow-translucent
  flex items-center justify-around
  z-50
">
  {/* Nav Items (4-5 max) */}
  <NavButton href="/dashboard" icon={HomeIcon}>
    Dashboard
  </NavButton>
  <NavButton href="/people" icon={UsersIcon}>
    People
  </NavButton>
  <NavButton href="/occasions" icon={CalendarIcon}>
    Occasions
  </NavButton>
  <NavButton href="/lists" icon={ListIcon}>
    Lists
  </NavButton>
</nav>
```

### NavButton Component (Mobile Bottom Nav)

```tsx
<a
  href={href}
  className="
    flex flex-col items-center justify-center
    min-w-[44px] min-h-[44px]     /* Touch target */
    px-2 py-1
    text-warm-700
    hover:text-primary-500
    transition-colors duration-200
  "
>
  <Icon className="w-6 h-6" />
  <span className="text-xs mt-0.5">{label}</span>
</a>

{/* Active State */}
<a className="
  ...
  text-primary-500
  font-semibold
">
  <Icon className="w-6 h-6 fill-current" />
  <span className="text-xs mt-0.5">{label}</span>
</a>
```

---

## Safe Areas (iOS/Safari)

### Fixed Header with Safe Area

```tsx
<header className="
  fixed top-0 left-0 right-0
  pt-safe-area-inset-top        /* iOS notch padding */
  pl-safe-area-inset-left
  pr-safe-area-inset-right
  h-14                          /* + safe-area-inset-top */
  bg-surface-primary
  border-b border-border-subtle
  shadow-low
  z-40
">
  <div className="h-14 px-4 flex items-center justify-between">
    <Logo />
    <MenuButton />
  </div>
</header>
```

### Bottom Navigation with Safe Area

```tsx
<nav className="
  fixed bottom-0 left-0 right-0
  pb-safe-area-inset-bottom     /* iOS home indicator padding */
  pl-safe-area-inset-left
  pr-safe-area-inset-right
  h-14                          /* + safe-area-inset-bottom */
  ...
">
  {navItems}
</nav>
```

### Full-Width Background with Safe Area

```tsx
<div className="
  w-screen                      /* Full viewport width */
  bg-primary-100
  pl-safe-area-inset-left       /* Avoid notch/camera */
  pr-safe-area-inset-right
  pt-safe-area-inset-top
  pb-safe-area-inset-bottom
">
  {content}
</div>
```

---

## Viewport Height (100dvh Fix)

### Full-Height Container

```tsx
{/* ALWAYS use 100dvh (dynamic) instead of 100vh */}
<div className="h-dvh">         {/* Fixes iOS address bar issue */}
  {content}
</div>

{/* Fallback for older browsers */}
<div className="h-screen">      {/* Tailwind default: 100vh */}
  {content}
</div>

{/* Manual calculation (avoid if possible) */}
<div style={{ height: 'calc(100vh - 60px)' }}>
  {content}
</div>
```

### Full-Height with Header/Footer

```tsx
<div className="flex flex-col h-dvh">
  {/* Header - Fixed height */}
  <header className="h-14 flex-shrink-0">
    {header}
  </header>

  {/* Main - Flexible */}
  <main className="flex-1 overflow-y-auto">
    {content}
  </main>

  {/* Footer - Fixed height */}
  <footer className="h-14 flex-shrink-0">
    {footer}
  </footer>
</div>
```

---

## Touch Targets (44px Minimum)

### Button Touch Target

```tsx
{/* Minimum 44x44px for all interactive elements */}
<button className="
  min-h-[44px] min-w-[44px]     /* Minimum touch area */
  px-6 py-2                     /* Visual padding */
  ...
">
  Click Me
</button>
```

### Icon-Only Button

```tsx
<button className="
  w-11 h-11                     /* 44px exactly */
  flex items-center justify-center
  rounded-full
  hover:bg-warm-100
  transition-colors duration-200
">
  <Icon className="w-6 h-6" />  /* 24px icon */
</button>
```

### Checkbox/Radio Touch Area

```tsx
<label className="
  flex items-center
  min-h-[44px]                  /* Touch target height */
  cursor-pointer
">
  <input
    type="checkbox"
    className="
      w-5 h-5                   /* Visual size */
      cursor-pointer
    "
  />
  <span className="ml-3 text-body-large">
    Accept terms
  </span>
</label>
```

---

## Responsive Breakpoints

### Breakpoint Values

```yaml
xs:  375px   # iPhone SE
sm:  640px   # Small tablets
md:  768px   # Tablets (sidebar shows, bottom nav hides)
lg:  1024px  # Laptops
xl:  1280px  # Desktops
2xl: 1536px  # Large desktops
```

### Mobile-First Responsive Pattern

```tsx
<div className="
  w-full               /* Mobile: full width */
  md:w-1/2             /* Tablet: 50% */
  lg:w-1/3             /* Desktop: 33% */
  p-4                  /* Mobile: padding */
  md:p-6               /* Tablet: more padding */
  lg:p-8               /* Desktop: even more */
">
  Content
</div>
```

### Grid Responsive Pattern

```tsx
{/* Single column mobile, 2 cols tablet, 3 cols desktop */}
<div className="
  grid
  grid-cols-1          /* Mobile: 1 column */
  md:grid-cols-2       /* Tablet: 2 columns */
  lg:grid-cols-3       /* Desktop: 3 columns */
  gap-4                /* Mobile: 16px gap */
  md:gap-6             /* Tablet: 24px gap */
">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Show/Hide Based on Breakpoint

```tsx
{/* Visible on mobile only */}
<div className="block md:hidden">
  Mobile content
</div>

{/* Hidden on mobile, visible on tablet+ */}
<div className="hidden md:block">
  Desktop content
</div>

{/* Visible on desktop only */}
<div className="hidden lg:block">
  Desktop-only content
</div>
```

---

## Dashboard Layout

### Stat Cards Grid

```tsx
<div className="
  grid
  grid-cols-1           /* Mobile: stacked */
  md:grid-cols-3        /* Desktop: 3 columns */
  gap-6
  mb-12
">
  <StatCard value={12} label="Ideas" color="idea" />
  <StatCard value={8} label="To Buy" color="warning" />
  <StatCard value={4} label="Purchased" color="success" />
</div>
```

### Avatar Carousel (Horizontal Scroll)

```tsx
<div className="
  bg-surface-primary
  border border-border-subtle
  rounded-xlarge p-6
  shadow-low
">
  <h3 className="text-heading-2 font-semibold mb-4">
    Family Members
  </h3>

  {/* Horizontal scroll container */}
  <div className="
    flex gap-6
    overflow-x-auto          /* Horizontal scroll */
    pb-2                     /* Space for scrollbar */
    scrollbar-hide           /* Hide scrollbar (optional) */
  ">
    {members.map(member => (
      <div key={member.id} className="
        flex-shrink-0          /* Prevent shrinking */
        text-center
      ">
        <Avatar
          size="lg"
          src={member.avatar}
          status={member.status}
          badge={member.giftCount}
        />
        <p className="text-body-small font-semibold mt-2">
          {member.name}
        </p>
      </div>
    ))}
  </div>
</div>
```

### Kanban Columns (List Detail)

```tsx
{/* Desktop: Horizontal scroll, Mobile: Vertical stack */}
<div className="
  flex
  flex-col md:flex-row         /* Stack mobile, row desktop */
  gap-6
  overflow-x-auto              /* Horizontal scroll desktop */
  pb-6
">
  {/* Each column */}
  <div className="
    w-full md:w-80               /* Full mobile, 320px desktop */
    flex-shrink-0                /* Prevent shrinking */
    bg-surface-primary
    border border-border-subtle
    rounded-large
    shadow-low
  ">
    {/* Column Header */}
    <div className="
      px-4 py-3
      bg-gradient-to-br from-status-idea-50 to-status-idea-100
      border-b-4 border-status-idea-500
      rounded-t-large
    ">
      <h4 className="text-heading-3 font-semibold text-status-idea-700">
        Ideas <span className="text-body-small">(5)</span>
      </h4>
    </div>

    {/* Column Content */}
    <div className="
      p-4
      space-y-4
      min-h-[400px]
    ">
      {items.map(item => (
        <GiftCard key={item.id} {...item} />
      ))}
    </div>
  </div>

  {/* Repeat for other columns */}
</div>
```

---

## Content Spacing Patterns

### Page Container

```tsx
<div className="
  max-w-7xl mx-auto             /* Max 1280px, centered */
  px-4 md:px-6 lg:px-8          /* Responsive horizontal padding */
  py-6 md:py-8 lg:py-12        /* Responsive vertical padding */
">
  {pageContent}
</div>
```

### Section Spacing

```tsx
<section className="mb-12">     {/* 48px bottom margin */}
  <h2 className="text-heading-1 font-bold mb-6">
    Section Title
  </h2>
  {content}
</section>
```

### Card Grid Spacing

```tsx
<div className="
  grid
  grid-cols-1 md:grid-cols-2 lg:grid-cols-3
  gap-4 md:gap-6               /* Responsive gap */
">
  {cards}
</div>
```

---

## Z-Index Hierarchy

```yaml
z-0:    Base layer (backgrounds)
z-10:   Default content
z-20:   Sticky headers
z-30:   Dropdowns
z-40:   Modal overlays
z-50:   Modals, bottom nav
z-60+:  Tooltips, popovers
```

### Example Z-Index Usage

```tsx
{/* Modal Overlay */}
<div className="fixed inset-0 z-40 bg-overlay-strong" />

{/* Modal Content */}
<div className="fixed inset-0 z-50 flex items-center justify-center">
  {modal}
</div>

{/* Bottom Nav */}
<nav className="fixed bottom-0 left-0 right-0 z-50">
  {navItems}
</nav>
```

---

## Accessibility Considerations

### Focus Visible

```tsx
{/* All interactive elements */}
focus:outline-none
focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
```

### Skip to Content Link

```tsx
<a
  href="#main-content"
  className="
    sr-only                      /* Screen reader only by default */
    focus:not-sr-only            /* Visible when focused */
    focus:absolute focus:top-4 focus:left-4
    focus:z-50
    focus:px-4 focus:py-2
    focus:bg-primary-500 focus:text-white
    focus:rounded-medium
  "
>
  Skip to main content
</a>
```

### Responsive Font Sizes

```tsx
{/* Heading responsive sizing */}
<h1 className="
  text-display-small           /* Mobile: 28px */
  md:text-display-medium       /* Tablet: 36px */
  lg:text-display-large        /* Desktop: 48px */
">
  Page Title
</h1>
```

---

## Performance Optimizations

### Lazy Loading Images

```tsx
<img
  src={imageUrl}
  loading="lazy"                 /* Native lazy loading */
  className="rounded-large"
/>
```

### Scroll Snap (Carousels)

```tsx
<div className="
  flex gap-6
  overflow-x-auto
  snap-x snap-mandatory          /* Snap scrolling */
">
  <div className="snap-start flex-shrink-0">
    {item}
  </div>
</div>
```

---

## Common Layout Examples

### Modal Layout

```tsx
{/* Full pattern from component-variants.md */}
<div className="fixed inset-0 z-40 bg-overlay-strong backdrop-blur-sm" />
<div className="fixed inset-0 z-50 flex items-center justify-center p-6">
  <div className="
    w-full max-w-lg
    bg-surface-primary
    rounded-2xlarge
    shadow-extra-high
  ">
    {modalContent}
  </div>
</div>
```

### Sidebar Detail Panel

```tsx
<div className="flex h-screen">
  {/* Main content */}
  <main className="flex-1 overflow-y-auto">
    {content}
  </main>

  {/* Detail panel - slide in from right */}
  <aside className="
    w-96                         /* 384px */
    border-l border-border-subtle
    bg-surface-primary
    overflow-y-auto
    transform transition-transform duration-300
    translate-x-full             /* Hidden by default */
    data-[open=true]:translate-x-0  /* Visible when open */
  ">
    {detailContent}
  </aside>
</div>
```

---

**Reference**: See `docs/designs/LAYOUT-PATTERNS.md` for comprehensive layout specs
**Version**: 1.0
**Last Updated**: 2025-11-28
