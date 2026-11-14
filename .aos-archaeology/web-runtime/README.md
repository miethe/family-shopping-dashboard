# Family Gifting Dashboard - Web App

Next.js 15 web application with Tailwind CSS and Radix UI.

## Setup

```bash
# Install dependencies
npm install
# or
pnpm install

# Run development server
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4+
- **UI Components**: Radix UI primitives
- **State Management**: React Query (to be added in FE-003)

## Directory Structure

```
app/                    # Next.js App Router pages
├── layout.tsx          # Root layout with metadata
├── page.tsx            # Home page
└── globals.css         # Global styles with Tailwind

components/
├── ui/                 # Radix UI component wrappers (FE-007)
├── gifts/              # Gift-related components
├── lists/              # List-related components
└── shared/             # Shared components

hooks/                  # Custom React hooks
lib/                    # Utilities
├── utils.ts            # cn() utility for class merging

types/                  # TypeScript type definitions
└── index.ts            # Common types
```

## Mobile-First Features

- Safe area insets for iOS devices
- Touch target enforcement (44x44px minimum)
- Dynamic viewport height (`100dvh`) for iOS
- Mobile-first breakpoints (xs: 375px, sm: 640px, md: 768px, etc.)

## Custom Tailwind Utilities

- `.safe-area-inset` - Applies iOS safe area padding
- `.h-screen-safe` - Uses dynamic viewport height
- `.touch-target` - Enforces minimum touch target size

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

## Build

```bash
# Production build
npm run build

# Start production server
npm start
```

## Related Documentation

See [CLAUDE.md](./CLAUDE.md) for Next.js patterns and best practices.
