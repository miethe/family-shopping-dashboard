# Web App — Next.js Patterns

**Tech**: Next.js 15+ (App Router) + React 19+ + TypeScript + Tailwind + Radix
**Focus**: Mobile-first, iOS/Safari, PWA

---

## Directory Structure

```text
app/
├── (auth)/
│   ├── login/
│   └── register/
├── dashboard/
│   └── page.tsx            # Main dashboard
├── gifts/
│   ├── page.tsx            # Gift catalog
│   └── [id]/
│       └── page.tsx        # Gift detail
├── lists/
│   ├── page.tsx            # Lists index
│   └── [id]/
│       └── page.tsx        # List detail
├── people/
│   └── [id]/
│       └── page.tsx        # Person detail
├── layout.tsx              # Root layout
└── page.tsx                # Home

components/
├── ui/                     # Radix/shadcn wrappers
│   ├── button.tsx
│   ├── card.tsx
│   └── dialog.tsx
├── gifts/
│   ├── GiftCard.tsx
│   └── GiftForm.tsx
├── lists/
│   └── ListItem.tsx
└── shared/
    ├── Header.tsx
    └── Navigation.tsx

hooks/
├── useGifts.ts             # React Query + WebSocket
├── useLists.ts
├── useWebSocket.ts         # WebSocket client
└── useAuth.ts              # Auth context

lib/
├── api.ts                  # Fetch wrapper
├── websocket.ts            # WebSocket client
└── utils.ts                # Helpers
```

---

## Mobile-First Patterns

### Viewport Meta

```tsx
// app/layout.tsx
export const metadata = {
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1'
}
```

### Safe Areas (iOS)

```css
/* globals.css */
.header {
  padding-top: env(safe-area-inset-top);
}

.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### Touch Targets

```tsx
// Minimum 44x44px for all interactive elements
<button className="min-h-[44px] min-w-[44px]">...</button>
```

### 100vh Fix

```css
/* Use dynamic viewport height for iOS */
.full-height {
  height: 100dvh; /* Preferred */
  /* Fallback: height: calc(100vh - 60px); */
}
```

---

## React Query + WebSocket Pattern

### Data Hook

```typescript
// hooks/useGifts.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket';

export function useGifts(listId: string) {
  const queryClient = useQueryClient();

  // REST: Initial load
  const query = useQuery({
    queryKey: ['gifts', listId],
    queryFn: () => fetch(`/api/gifts?list=${listId}`).then(r => r.json())
  });

  // WebSocket: Real-time updates
  useWebSocket({
    topic: `gift-list:${listId}`,
    onMessage: (event) => {
      if (event.event === 'GIFT_ADDED' || event.event === 'GIFT_UPDATED') {
        // Invalidate to refetch
        queryClient.invalidateQueries({ queryKey: ['gifts', listId] });
      }
    }
  });

  return query;
}
```

### WebSocket Hook

```typescript
// hooks/useWebSocket.ts
import { useEffect, useRef } from 'react';

interface UseWebSocketProps {
  topic: string;
  onMessage: (event: any) => void;
}

export function useWebSocket({ topic, onMessage }: UseWebSocketProps) {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL!;
    ws.current = new WebSocket(`${url}?topic=${topic}`);

    ws.current.onmessage = (msg) => {
      const event = JSON.parse(msg.data);
      onMessage(event);
    };

    return () => ws.current?.close();
  }, [topic]);
}
```

---

## Component Patterns

### Server Component (Default)

```tsx
// app/gifts/page.tsx
export default async function GiftsPage() {
  const gifts = await fetch('http://api/gifts').then(r => r.json());

  return <GiftList gifts={gifts} />;
}
```

### Client Component (Interactive)

```tsx
// components/gifts/GiftCard.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function GiftCard({ gift }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setLiked(!liked)}>
        {liked ? 'Unlike' : 'Like'}
      </Button>
    </div>
  );
}
```

### Optimistic Updates

```typescript
// hooks/useUpdateGift.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateGift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => fetch('/api/gifts', { method: 'PATCH', body: JSON.stringify(data) }),
    onMutate: async (newGift) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['gifts'] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['gifts']);

      // Optimistically update
      queryClient.setQueryData(['gifts'], (old: any) => [...old, newGift]);

      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['gifts'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
    }
  });
}
```

---

## UI Component Library (Radix/shadcn)

### Button Example

```tsx
// components/ui/button.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium',
          'min-h-[44px] min-w-[44px]',  // Touch target
          variant === 'default' && 'bg-blue-600 text-white hover:bg-blue-700',
          variant === 'outline' && 'border border-gray-300 hover:bg-gray-100',
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-4 py-2',
          size === 'lg' && 'px-6 py-3 text-lg',
          className
        )}
        {...props}
      />
    );
  }
);
```

---

## Design System

Design docs provide specifications, tokens, and patterns for consistent UI.

| Use Case | Document | Purpose |
|----------|----------|---------|
| Building new component | `../../docs/designs/COMPONENTS.md` | Button, Card, Input, Avatar, Modal specs |
| Need color/spacing/typography value | `../../docs/designs/DESIGN-TOKENS.md` | Exact token values (colors, spacing, fonts) |
| Page layout patterns | `../../docs/designs/LAYOUT-PATTERNS.md` | Dashboard, sidebar, bottom nav |
| Tailwind/CSS setup | `../../docs/designs/DESIGN-IMPLEMENTATION.md` | Tailwind config, CSS vars, PWA |
| Design decisions/philosophy | `../../docs/designs/DESIGN-GUIDE.md` | Principles, checklist, rationale |

**Quick Reference**:
- Starting component → COMPONENTS.md for specs
- Need exact value → DESIGN-TOKENS.md
- Building page → LAYOUT-PATTERNS.md
- Config setup → DESIGN-IMPLEMENTATION.md

---

## Responsive Design (Tailwind)

### Breakpoints

```typescript
// tailwind.config.ts
{
  theme: {
    screens: {
      'xs': '375px',   // iPhone SE
      'sm': '640px',
      'md': '768px',   // iPad
      'lg': '1024px',
      'xl': '1280px'
    }
  }
}
```

### Mobile-First Classes

```tsx
<div className="
  w-full           /* Mobile: full width */
  md:w-1/2         /* Tablet: 50% */
  lg:w-1/3         /* Desktop: 33% */
  p-4              /* Mobile: padding */
  md:p-6           /* Tablet: more padding */
">
  Content
</div>
```

---

## PWA Configuration

### Manifest

```json
// public/manifest.json
{
  "name": "Family Gifting Dashboard",
  "short_name": "Gifting",
  "icons": [
    { "src": "/icons/icon-180.png", "sizes": "180x180", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/dashboard"
}
```

### Next.js Config

```javascript
// next.config.js
module.exports = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    return config;
  }
};
```

---

## Error Handling

### Error Boundary

```tsx
// app/error.tsx
'use client';

export default function Error({ error, reset }) {
  return (
    <div className="p-4">
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### API Error Handling

```typescript
// lib/api.ts
export async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error.message);
  }

  return res.json();
}
```

---

## Testing Patterns

### Component Tests (Vitest)

```typescript
// __tests__/components/GiftCard.test.tsx
import { render, screen } from '@testing-library/react';
import { GiftCard } from '@/components/gifts/GiftCard';

test('renders gift name', () => {
  render(<GiftCard gift={{ name: 'LEGO Set', price: 50 }} />);
  expect(screen.getByText('LEGO Set')).toBeInTheDocument();
});
```

### E2E Tests (Playwright)

```typescript
// __tests__/e2e/gift-workflow.spec.ts
import { test, expect } from '@playwright/test';

test('add gift to list', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('text=Add Gift');
  await page.fill('input[name="name"]', 'LEGO Set');
  await page.click('button:has-text("Save")');
  await expect(page.locator('text=LEGO Set')).toBeVisible();
});
```

---

## Common Anti-Patterns

| ✗ Anti-Pattern | ✓ Correct |
|----------------|-----------|
| 'use client' everywhere | Server components by default |
| Fetch in client components | Server components or React Query |
| Inline styles | Tailwind classes |
| Custom UI primitives | Radix/shadcn wrappers |
| Hardcoded API URLs | Environment variables |
| No touch target size | min-h-[44px] min-w-[44px] |

---

## Quick Reference

### Add New Page

```text
1. app/[route]/page.tsx
2. Server component (default) or 'use client'
3. Layout (if needed): app/[route]/layout.tsx
4. Metadata export
```

### Add New Component

```text
1. components/[domain]/Component.tsx
2. 'use client' if interactive
3. Import from @/components/ui/ for primitives
4. Ensure 44px touch targets
```

### Add React Query Hook

```text
1. hooks/useEntity.ts
2. useQuery for GET, useMutation for POST/PATCH/DELETE
3. Add WebSocket subscription if real-time
4. Optimistic updates for mutations
```

### Run Locally

```bash
pnpm dev        # Port 3000
pnpm build      # Production build
pnpm test       # Vitest
pnpm test:e2e   # Playwright
```

---

**Parent**: [../../CLAUDE.md](../../CLAUDE.md)
