# UI Overhaul V2 — Phase Details & Implementation Notes

Quick reference for implementing each phase of the UI overhaul.

---

## Phase 1: Design System Foundation

### DS-001: Update Tailwind Config

**File**: `/apps/web/tailwind.config.ts`

**Key Additions**:

```typescript
export default {
  theme: {
    colors: {
      'primary': '#E57373',
      'primary-dark': '#D32F2F',
      'background-light': '#FBF9F6',
      'background-dark': '#0f0f0f',
      'text-main': '#1a1a1a',
      'status': {
        'idea': { light: '#FEF3C7', dark: '#974B1A' },
        'to-buy': { light: '#FEE2E2', dark: '#991B1B' },
        'purchased': { light: '#D1FAE5', dark: '#065F46' },
        'gifted': { light: '#E9D5FF', dark: '#581C87' }
      }
    },
    fontFamily: {
      'display': ['Poppins', 'system-ui'],
      'body': ['Quicksand', 'system-ui'],
      'kanban': ['Spline Sans', 'system-ui']
    },
    borderRadius: {
      '3xl': '32px',
      '2xl': '24px',
      'xl': '16px'
    },
    boxShadow: {
      'soft': '0 1px 3px rgba(0,0,0,0.08)',
      'card': '0 4px 12px rgba(0,0,0,0.08)',
      'lg': '0 10px 25px rgba(0,0,0,0.1)'
    }
  },
  darkMode: 'class'
}
```

**Fonts to Import**:
- Google Fonts: `https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&family=Quicksand:wght@400;600;700&family=Spline+Sans:wght@400;600;700`

### DS-002: Global CSS & Animations

**File**: `/apps/web/app/globals.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700');

@layer base {
  body {
    @apply bg-background-light dark:bg-background-dark text-text-main transition-colors duration-300;
    font-feature-settings: "tnum";
  }

  /* Safe areas for iOS */
  main {
    padding-top: env(safe-area-inset-top);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@layer utilities {
  .fade-in {
    animation: fadeIn 300ms ease-out;
  }
  .slide-up {
    animation: slideUp 300ms ease-out;
  }
  .scale-in {
    animation: scaleIn 300ms ease-out;
  }

  /* Material Symbols font */
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

### DS-003: Material Symbols Icon Mapping

**File**: `/apps/web/components/ui/icon.tsx`

```typescript
import React from 'react';

interface IconProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: 'text-sm',
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-3xl'
};

export function Icon({ name, size = 'md', className = '' }: IconProps) {
  return (
    <span className={`material-symbols-outlined ${sizeMap[size]} ${className}`}>
      {name}
    </span>
  );
}
```

### DS-004: Dark Mode Hook

**File**: `/apps/web/hooks/useDarkMode.ts`

```typescript
'use client';

import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage and system preference
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldDark = stored === 'dark' || (!stored && prefersDark);

    setIsDark(shouldDark);
    document.documentElement.classList.toggle('dark', shouldDark);
  }, []);

  const toggleDarkMode = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    localStorage.setItem('theme', newValue ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newValue);
  };

  return { isDark, toggleDarkMode };
}
```

---

## Phase 2: Layout & Navigation

### LN-001: AppLayout Component

**File**: `/apps/web/components/layout/AppLayout.tsx`

Key pattern from inspiration:
- Fixed 100vh container
- Sidebar fixed left
- Main with ml-offset (ml-20 md:ml-24)
- Max-width 1600px inner container
- Overflow-y-auto on main

```typescript
interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-text-main">
      <Sidebar />
      <main className="flex-1 ml-20 md:ml-24 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
```

### LN-002: Sidebar Component

Reference: `inspiration/family-gifting-v2/components/Sidebar.tsx`

**Key Features**:
- Fixed `w-20 md:w-24` width
- Glassmorphism: `bg-white/60 dark:bg-black/20 backdrop-blur-md`
- Nav links with material-symbols-outlined icons
- Active state: `bg-primary text-white shadow-lg shadow-primary/30`
- Avatar + FAB button at bottom
- Tooltips on hover

### LN-003 & LN-004: Header & Mobile Nav

**Header Pattern**:
- Sticky top, full width
- Breadcrumbs on left, actions on right
- Responsive: stack on mobile

**Mobile Nav Pattern**:
- Bottom nav on sm: breakpoint
- Fixed bottom position
- Icons + labels
- Match sidebar nav items

---

## Phase 3: UI Component Library

### UC-001: Button Component

**Variants**: primary, secondary, ghost, outline
**Sizes**: sm (px-3 py-1.5), md (px-4 py-2), lg (px-6 py-3)
**States**: normal, hover, active, disabled, loading

```typescript
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-xl font-bold min-h-[44px] min-w-[44px] transition-all';
    const variantClasses = {
      primary: 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white',
      ghost: 'text-text-main hover:bg-slate-100 dark:hover:bg-slate-800',
      outline: 'border-2 border-slate-200 text-text-main hover:bg-slate-50'
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]}`}
        {...props}
      >
        {isLoading ? <span className="animate-spin">⏳</span> : props.children}
      </button>
    );
  }
);
```

### UC-004: Badge Component for Status

**Colors** (from Phase 1):
- Idea: `bg-yellow-100 text-yellow-800`
- To Buy: `bg-red-100 text-red-800`
- Purchased: `bg-teal-100 text-teal-800`
- Gifted: `bg-purple-100 text-purple-800`

```typescript
export interface BadgeProps {
  status: 'Idea' | 'To Buy' | 'Purchased' | 'Gifted';
  showIcon?: boolean;
}

const statusConfig = {
  'Idea': { color: 'bg-yellow-100 text-yellow-800', icon: 'lightbulb' },
  'To Buy': { color: 'bg-red-100 text-red-800', icon: 'shopping_cart' },
  'Purchased': { color: 'bg-teal-100 text-teal-800', icon: 'check_circle' },
  'Gifted': { color: 'bg-purple-100 text-purple-800', icon: 'volunteer_activism' }
};

export function Badge({ status, showIcon }: BadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.color}`}>
      {showIcon && <span className="material-symbols-outlined text-[14px]">{config.icon}</span>}
      {status}
    </span>
  );
}
```

### UC-006: Modal Component

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-[90vw] max-h-[90vh] overflow-y-auto scale-in">
        {children}
      </div>
    </div>
  );
}
```

---

## Phase 4: Page Implementations

### PG-002: Dashboard Page Structure

Reference: `inspiration/family-gifting-v2/pages/Dashboard.tsx`

**Layout**:
```
<div className="grid grid-cols-12 gap-8">
  {/* Left Column: 5/12 */}
  <div className="col-span-12 lg:col-span-5 space-y-8">
    {/* Stats Cards 3-column */}
    {/* View Occasion Button */}
    {/* Idea Inbox */}
  </div>

  {/* Right Column: 7/12 */}
  <div className="col-span-12 lg:col-span-7">
    {/* Activity Timeline */}
  </div>
</div>
```

**Stats Card Design**:
- Large rounded-3xl cards
- Center-aligned text
- Icon + number + label
- Hover: lift effect (-translate-y-1)

### PG-004: List Details - Kanban

Reference: `inspiration/family-gifting-v2/pages/ListDetails.tsx` (lines 171-198)

**4-Column Layout**:
```
<div className="flex gap-6 overflow-x-auto pb-4">
  <KanbanColumn title="Idea" count={X} items={items} />
  <KanbanColumn title="To Buy" count={X} items={items} />
  <KanbanColumn title="Purchased" count={X} items={items} />
  <KanbanColumn title="Gifted" count={X} items={items} />
</div>
```

**Kanban Card**:
- Image thumbnail (aspect-[16/10])
- Price badge (top-right)
- Title (2-line clamp)
- Recipient chip
- Status indicator dot
- Hover: scale image + lift card

### PG-005: List Details - Table View

Reference: `inspiration/family-gifting-v2/pages/ListDetails.tsx` (lines 200-263)

**Columns**: Gift Item (image + name), Recipient, Status (badge), Price, Category, Added By, Actions

**Features**:
- Sticky header
- Sortable columns (click header)
- Row hover effect
- Row click → open detail modal
- Actions menu (3-dot button)

---

## Phase 5: Feature Components & Backend Integration

### FC-001: React Query Hooks

**Pattern for useGifts**:
```typescript
export function useGifts(listId: string) {
  return useQuery({
    queryKey: ['gifts', listId],
    queryFn: () => apiCall(`/api/gifts?list_id=${listId}`),
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 30 * 60 * 1000,    // 30 min
  });
}

export function useCreateGift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiCall('/api/gifts', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
    }
  });
}
```

### FC-002: WebSocket Hook

**Pattern**:
```typescript
export function useWebSocket({ topic, onMessage }: UseWebSocketProps) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
    wsRef.current = new WebSocket(`${wsUrl}?topic=${topic}`);

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    wsRef.current.onerror = () => {
      console.error('WebSocket error');
      // Fallback: poll every 10s
      const interval = setInterval(onMessage, 10000);
      return () => clearInterval(interval);
    };

    return () => wsRef.current?.close();
  }, [topic]);
}
```

**Usage in Hook**:
```typescript
export function useGifts(listId: string) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['gifts', listId], ... });

  useWebSocket({
    topic: `gift-list:${listId}`,
    onMessage: (event) => {
      if (event.event === 'GIFT_ADDED' || event.event === 'GIFT_UPDATED') {
        queryClient.invalidateQueries({ queryKey: ['gifts', listId] });
      }
    }
  });

  return query;
}
```

### FC-005: Kanban Drag-Drop

**Using native Draggable API**:
```typescript
function KanbanCard({ item, onStatusChange }) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer?.setData('giftId', item.id)}
      className="..."
    >
      {/* Card content */}
    </div>
  );
}

function KanbanColumn({ title, items, onDrop }) {
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const giftId = e.dataTransfer?.getData('giftId');
        onDrop(giftId, title); // updates status
      }}
      className="..."
    >
      {items.map(item => <KanbanCard item={item} />)}
    </div>
  );
}
```

---

## Phase 6: Polish & Testing

### PT-003: Accessibility Audit

**Tools**: axe, WAVE, Lighthouse

**Checklist**:
- [ ] Color contrast ≥ 4.5:1
- [ ] All buttons/links keyboard accessible (Tab, Enter)
- [ ] Focus visible on all interactive elements
- [ ] ARIA labels on icons
- [ ] Form labels associated with inputs
- [ ] Modal has focus trap
- [ ] Prefers-reduced-motion respected

### PT-005: E2E Test Examples

**File**: `/apps/web/__tests__/e2e/gift-workflow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('create and update gift', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('/dashboard');

  // Navigate to list
  await page.click('a:has-text("Lists")');
  await page.click('text=Christmas 2026');
  await page.waitForURL(/\/lists\/\d+/);

  // Create gift
  await page.click('button:has-text("Add Gift")');
  await page.fill('input[placeholder="Gift name"]', 'LEGO Set');
  await page.fill('input[type="number"]', '79.99');
  await page.click('button:has-text("Save")');

  // Verify in Kanban
  await expect(page.locator('text=LEGO Set')).toBeVisible();
});
```

---

## Inspiration Project File Mapping

Use these files as visual & code reference:

| Inspiration File | Purpose | Reference For |
|-----------------|---------|----------------|
| `Layout.tsx` | Layout pattern | LN-001 (AppLayout) |
| `Sidebar.tsx` | Navigation + FAB | LN-002 (Sidebar) |
| `Dashboard.tsx` | Page layout + stats | PG-002 (Dashboard) |
| `ListDetails.tsx` | Kanban + Table + Modal | PG-004, PG-005, FC-003 |
| `types.ts` | Data models | Hook interfaces |
| `components/Modal.tsx` | Modal structure | UC-006 |

---

**Version**: 1.0
**Last Updated**: 2025-11-30
