# Phase 6-8: Frontend - Foundation, Core, Advanced

**Plan ID**: `IMPL-2025-11-26-FAMILY-DASH-V1`
**Parent Document**: [Family Dashboard V1 Implementation Plan](../family-dashboard-v1-implementation.md)
**PRD**: `docs/project_plans/init/family-dashboard-v1.md`

---

## Overview

Phases 6-8 implement the complete Next.js frontend with mobile-first design, React Query, and real-time WebSocket integration.

| Phase | Duration | Effort | Focus |
|-------|----------|--------|-------|
| **6: Foundation** | 2-3 days | 10 pts | Next.js setup, auth, components, PWA |
| **7: Core Features** | 4-5 days | 14 pts | Dashboard, People, Occasions, Lists |
| **8: Advanced Features** | 3-4 days | 12 pts | Gifts, real-time, comments, assignments |

**Total Effort**: 36 story points
**Dependencies**: Phase 4 complete (REST API stable), Phase 5 after Phase 6
**Parallel Opportunity**: Phase 8 (advanced) can run parallel with Phase 5 (WebSocket)

---

## Mobile-First Constraints (CRITICAL)

All frontend development must follow these constraints:

```css
/* Viewport Configuration */
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />

/* Safe Areas (iOS) */
.container {
  padding-top: env(safe-area-inset-top);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
}

/* Touch Targets */
button, [role="button"], a[role="button"] {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}

/* Height Handling */
body, html {
  height: 100dvh;  /* Dynamic viewport height, not 100vh */
}

.fullscreen {
  height: 100dvh;
  /* Or: height: calc(100vh - 60px) for fixed header */
}
```

---

## Phase 6: Frontend Foundation

**Duration**: ~2-3 days
**Effort**: 10 story points
**Dependencies**: Phase 4 complete
**Primary Agent**: `frontend-developer`
**Supporting Agents**: `ui-engineer`, `ui-designer`

### Epic: FE-V1 - Frontend Setup & Infrastructure

Project scaffolding, authentication, base components, PWA.

| Task ID | Task Name | Description | Acceptance Criteria | Estimate |
|---------|-----------|-------------|-------------------|----------|
| FE-001 | Next.js Setup | Next.js 14+ with App Router, TypeScript, ESLint | Project runs at localhost:3000, TS strict mode, hot reload | 1 pt |
| FE-002 | Tailwind + Radix | Tailwind CSS with custom theme, Radix UI components | Theme colors, safe area utilities, dark mode support | 1 pt |
| FE-003 | React Query Setup | React Query 5+ with QueryClient, devtools, defaults | Stale time 5min, cache time 30min, automatic refetch | 1 pt |
| FE-004 | Auth Context | Auth state management (JWT token, user profile, login/logout) | useAuth hook, token stored in localStorage, auto-refresh | 2 pts |
| FE-005 | API Client | Typed fetch wrapper with axios or fetch-based client | All endpoints typed with TypeScript, automatic auth header | 1 pt |
| FE-006 | Layout Components | Shell layout, responsive nav, mobile-first, safe areas | Header, sidebar (desktop), bottom nav (mobile), 44px touch targets | 2 pts |
| FE-007 | Base Components | Button, Input, Card, Modal, Toast, Spinner (Radix-based) | Accessible, keyboard navigation, proper ARIA attributes | 1 pt |
| FE-008 | PWA Setup | manifest.json, icons (192x192, 512x512), service worker | Add to home screen, app icon, offline ready | 1 pt |

### Authentication Context Pattern

```typescript
// apps/web/lib/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load token from localStorage and validate
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
            validateToken(storedToken)
                .then(user => {
                    setToken(storedToken);
                    setUser(user);
                })
                .catch(() => {
                    localStorage.removeItem('auth_token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            setToken(response.token);
            setUser(response.user);
            localStorage.setItem('auth_token', response.token);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
```

### API Client Pattern

```typescript
// apps/web/lib/api/client.ts
import { useAuth } from '@/lib/context/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiClient {
    async request<T>(
        method: string,
        path: string,
        options?: {
            body?: any;
            params?: Record<string, any>;
        }
    ): Promise<T> {
        const url = new URL(path, API_BASE);
        if (options?.params) {
            Object.entries(options.params).forEach(([k, v]) =>
                url.searchParams.append(k, String(v))
            );
        }

        const token = localStorage.getItem('auth_token');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            method,
            headers,
            body: options?.body ? JSON.stringify(options.body) : undefined,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API error');
        }

        return response.json();
    }

    // Convenience methods
    async get<T>(path: string, params?: Record<string, any>): Promise<T> {
        return this.request<T>('GET', path, { params });
    }

    async post<T>(path: string, body?: any): Promise<T> {
        return this.request<T>('POST', path, { body });
    }

    async put<T>(path: string, body?: any): Promise<T> {
        return this.request<T>('PUT', path, { body });
    }

    async delete<T>(path: string): Promise<T> {
        return this.request<T>('DELETE', path);
    }
}

export const apiClient = new ApiClient();
```

### Mobile-First Layout Pattern

```typescript
// apps/web/components/layout/Shell.tsx
export function Shell({ children }: { children: React.ReactNode }) {
    const [isMobile, setIsMobile] = useState(true);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 768px)');
        setIsMobile(!mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    return (
        <div className="flex h-screen flex-col md:flex-row">
            {/* Header - Mobile only */}
            <header className="md:hidden sticky top-0 z-50 bg-white border-b safe-area-inset">
                <Header />
            </header>

            {/* Sidebar - Desktop only */}
            <aside className="hidden md:block w-64 bg-gray-50 border-r safe-area-inset">
                <Nav />
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto pb-16 md:pb-0">
                <div className="safe-area-inset">
                    {children}
                </div>
            </main>

            {/* Bottom nav - Mobile only */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t safe-area-inset">
                <MobileNav />
            </nav>
        </div>
    );
}
```

### Safe Area Utilities

```typescript
// apps/web/lib/styles/safe-areas.ts
export const safeAreaClasses = {
    inset: 'pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)]',
    top: 'pt-[env(safe-area-inset-top)]',
    bottom: 'pb-[env(safe-area-inset-bottom)]',
};

export const touchTarget = 'min-w-[44px] min-h-[44px]';
```

### Phase 6 Quality Gates

- [ ] Next.js app runs at `localhost:3000` without console errors
- [ ] Auth flow working: login → redirect to dashboard → logout → redirect to login
- [ ] Mobile-first layout with safe areas visible on iOS
- [ ] All touch targets minimum 44x44px
- [ ] React Query devtools accessible (for debugging)
- [ ] TypeScript strict mode enabled, no `any` types
- [ ] Radix UI components with proper ARIA labels
- [ ] PWA installable on iPhone (manifest + icons valid)
- [ ] Base component library complete (Button, Input, Card, Modal, Toast)

### Key Files to Create

```
apps/web/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Home/redirect to dashboard or login
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Dashboard layout (auth-required, shell)
│   │   └── page.tsx            # Dashboard home (stub)
│   └── manifest.json           # PWA manifest
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   └── Spinner.tsx
│   ├── layout/
│   │   ├── Shell.tsx
│   │   ├── Header.tsx
│   │   └── Nav.tsx
│   └── providers/
│       ├── QueryProvider.tsx
│       ├── AuthProvider.tsx
│       └── ToastProvider.tsx
├── lib/
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── api/
│   │   ├── client.ts
│   │   └── types.ts
│   ├── hooks/
│   │   └── useAuth.ts
│   └── styles/
│       └── safe-areas.ts
├── public/
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── manifest.json
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

### Dependencies to Add

```json
{
  "dependencies": {
    "next": "^14.0",
    "react": "^18.3",
    "react-dom": "^18.3",
    "react-query": "^5.0",
    "@radix-ui/react-dialog": "^1.1",
    "@radix-ui/react-dropdown-menu": "^2.0",
    "@radix-ui/react-toast": "^1.1",
    "tailwindcss": "^3.3",
    "clsx": "^2.0"
  }
}
```

---

## Phase 7: Frontend Features - Core

**Duration**: ~4-5 days
**Effort**: 14 story points
**Dependencies**: Phase 6 complete
**Primary Agent**: `frontend-developer`
**Supporting Agents**: `ui-engineer-enhanced`

### Epic: FE-CORE-V1 - Core Views & Pages

Dashboard, People, Occasions, Lists with full CRUD and React Query.

| Task ID | Task Name | Description | Acceptance Criteria | Estimate |
|---------|-----------|-------------|-------------------|----------|
| FE-C-001 | Dashboard Page | Overview with primary occasion, pipeline stats, people needing gifts, ideas inbox, activity | All 5 sections displayed, data loads from /dashboard endpoint | 3 pts |
| FE-C-002 | People List | People index with cards, search, responsive grid | List/grid toggle, search filter, paginated, cards show name + interests | 2 pts |
| FE-C-003 | Person Detail | Person view with name, interests, sizes, tabs for lists/history/notes | Tabs: Assigned Lists, Gift History, Notes (optional); edit button | 2 pts |
| FE-C-004 | Occasions List | Occasions index, date-sorted, type badges, upcoming/past filter | Filter upcoming/past, type badge, date display, new button | 1 pt |
| FE-C-005 | Occasion Detail | Occasion view with date, people, pipeline per person, edit controls | Pipeline table: person, idea count, selected, purchased, received | 2 pts |
| FE-C-006 | Lists View | Lists index with filters (type, person, occasion), responsive layout | Filter controls, list cards with item counts, new button | 2 pts |
| FE-C-007 | List Detail | List with items grouped by status, add item modal, edit list | Status groups: Ideas, Selected, Purchased, Received; drag-to-reorder (optional) | 2 pts |

### Dashboard Data Requirements

From PRD Section 4.2.1:

```typescript
interface DashboardResponse {
    // 1. Primary upcoming occasion
    primary_occasion: OccasionResponse | null;

    // 2. Pipeline summary (status counts across all lists)
    pipeline: {
        total_ideas: number;
        total_selected: number;
        total_purchased: number;
        total_received: number;
    };

    // 3. People needing gifts (summary)
    people_summary: Array<{
        person_id: string;
        name: string;
        needs_count: number;  // Count of items in their active lists
    }>;

    // 4. Idea Inbox (latest ideas not yet selected)
    idea_inbox: Array<ListItemResponse>;

    // 5. Recent Activity (latest comments/status changes)
    recent_activity: Array<{
        type: "status_change" | "comment" | "item_added";
        entity_type: string;
        entity_id: string;
        timestamp: string;
        user_name: string;
        description: string;
    }>;
}
```

### React Query Hook Pattern

```typescript
// apps/web/lib/hooks/usePersons.ts
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiClient } from '@/lib/api/client';

export function usePersons(cursor?: number) {
    return useQuery(
        ['persons', cursor],
        () => apiClient.get('/persons', { cursor }),
        {
            staleTime: 1000 * 60 * 5,      // 5 minutes
            cacheTime: 1000 * 60 * 30,     // 30 minutes
        }
    );
}

export function usePerson(id: number) {
    return useQuery(
        ['persons', id],
        () => apiClient.get(`/persons/${id}`),
        {
            staleTime: 1000 * 60 * 5,
            cacheTime: 1000 * 60 * 30,
            enabled: !!id,  // Don't fetch if no ID
        }
    );
}

export function useCreatePerson() {
    const queryClient = useQueryClient();

    return useMutation(
        (personData: any) => apiClient.post('/persons', personData),
        {
            onSuccess: () => {
                // Invalidate all persons queries
                queryClient.invalidateQueries(['persons']);
            },
        }
    );
}

export function useUpdatePerson(id: number) {
    const queryClient = useQueryClient();

    return useMutation(
        (personData: any) => apiClient.put(`/persons/${id}`, personData),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['persons']);
                queryClient.invalidateQueries(['persons', id]);
            },
        }
    );
}

export function useDeletePerson(id: number) {
    const queryClient = useQueryClient();

    return useMutation(
        () => apiClient.delete(`/persons/${id}`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['persons']);
            },
        }
    );
}
```

### Dashboard Component Pattern

```typescript
// apps/web/app/(dashboard)/page.tsx
'use client';

import { useDashboard } from '@/lib/hooks/useDashboard';
import { PipelineSummary } from '@/components/dashboard/PipelineSummary';
import { PeopleNeeding } from '@/components/dashboard/PeopleNeeding';
import { IdeaInbox } from '@/components/dashboard/IdeaInbox';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Spinner } from '@/components/ui/Spinner';

export default function DashboardPage() {
    const { data: dashboard, isLoading, error } = useDashboard();

    if (isLoading) return <Spinner />;
    if (error) return <div>Error: {error.message}</div>;
    if (!dashboard) return <div>No data</div>;

    return (
        <div className="space-y-6">
            {/* Primary Occasion */}
            {dashboard.primary_occasion && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h2 className="font-bold text-lg">Upcoming: {dashboard.primary_occasion.name}</h2>
                    <p className="text-sm text-gray-600">{dashboard.primary_occasion.date}</p>
                </div>
            )}

            {/* Pipeline Summary */}
            <PipelineSummary pipeline={dashboard.pipeline} />

            {/* People needing gifts */}
            <PeopleNeeding people={dashboard.people_summary} />

            {/* Idea Inbox */}
            <IdeaInbox ideas={dashboard.idea_inbox} />

            {/* Recent Activity */}
            <RecentActivity activities={dashboard.recent_activity} />
        </div>
    );
}
```

### Phase 7 Quality Gates

- [ ] Dashboard shows all 5 required sections with real data
- [ ] People CRUD working: create, list, detail, update, delete
- [ ] Occasions CRUD working with date filtering
- [ ] Lists display with status grouping working
- [ ] All views are mobile-responsive
- [ ] React Query caching working (no unnecessary API calls)
- [ ] Loading states visible with spinners
- [ ] Error states handled gracefully
- [ ] Touch targets all 44px minimum
- [ ] Forms validated on client side

### Key Files to Create

```
apps/web/app/(dashboard)/
├── page.tsx                    # Dashboard home
├── layout.tsx                  # Dashboard layout
├── people/
│   ├── page.tsx                # People list
│   ├── [id]/
│   │   ├── page.tsx            # Person detail
│   │   └── edit.tsx            # Person edit modal
│   └── new.tsx                 # Create person modal
├── occasions/
│   ├── page.tsx                # Occasions list
│   ├── [id]/
│   │   ├── page.tsx            # Occasion detail
│   │   └── edit.tsx            # Edit modal
│   └── new.tsx                 # Create occasion modal
└── lists/
    ├── page.tsx                # Lists index
    ├── [id]/
    │   ├── page.tsx            # List detail
    │   └── edit.tsx            # Edit modal
    └── new.tsx                 # Create list modal

apps/web/components/
├── dashboard/
│   ├── PipelineSummary.tsx
│   ├── PeopleNeeding.tsx
│   ├── IdeaInbox.tsx
│   └── RecentActivity.tsx
├── people/
│   ├── PersonList.tsx
│   ├── PersonCard.tsx
│   ├── PersonDetail.tsx
│   └── PersonForm.tsx
├── occasions/
│   ├── OccasionList.tsx
│   ├── OccasionCard.tsx
│   ├── OccasionDetail.tsx
│   └── OccasionForm.tsx
└── lists/
    ├── ListIndex.tsx
    ├── ListCard.tsx
    ├── ListDetail.tsx
    ├── ListItemGroup.tsx
    └── ListForm.tsx

apps/web/lib/hooks/
├── useDashboard.ts
├── usePersons.ts
├── useOccasions.ts
└── useLists.ts
```

---

## Phase 8: Frontend Features - Advanced

**Duration**: ~3-4 days
**Effort**: 12 story points
**Dependencies**: Phase 7 complete, Phase 5 (WebSocket) should be done or in progress
**Primary Agent**: `frontend-developer`
**Supporting Agents**: `ui-engineer-enhanced`

### Epic: FE-ADV-V1 - Advanced Features & Real-Time

Gift catalog, real-time updates, comments, assignments.

| Task ID | Task Name | Description | Acceptance Criteria | Estimate |
|---------|-----------|-------------|-------------------|----------|
| FE-A-001 | Gift Catalog | Gifts index with search, filter by tag, sort (price/date), pagination | Search bar, tag filter chips, sort dropdown, card grid | 2 pts |
| FE-A-002 | Gift Detail | Gift view with usage info (which lists/people), URL + image | Shows lists/people using this gift, edit/delete buttons | 1 pt |
| FE-A-003 | URL Gift Creation | Add gift from URL (auto-parse metadata) | Paste URL → fetch metadata (title, image, price) → preview → save | 2 pts |
| FE-A-004 | Quick Add Idea | Global "Add Idea" floating action button or header button | Modal: select person/occasion, enter gift name, category → add to ideas list | 1 pt |
| FE-A-005 | WebSocket Hook | useWebSocket hook with subscribe/unsubscribe | Custom hook manages connection, reconnection, topic subscription | 2 pts |
| FE-A-006 | Real-Time Integration | Real-time sync on ListItem updates via React Query | WS event → invalidate cache → refetch (or optimistic update) | 2 pts |
| FE-A-007 | Comments Component | Comment thread UI on lists/occasions/list items | Add comment form, list comments with timestamp, delete own comments | 1 pt |
| FE-A-008 | My Assignments | View all items assigned to me across all lists | Filter view showing only items assigned_to = current_user | 1 pt |

### WebSocket Hook Pattern

```typescript
// apps/web/lib/hooks/useWebSocket.ts
import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from 'react-query';

export function useWebSocket(token: string, topic: string) {
    const [connected, setConnected] = useState(false);
    const [reconnecting, setReconnecting] = useState(false);
    const queryClient = useQueryClient();
    const wsRef = useRef<WebSocket | null>(null);
    let reconnectTimeoutRef = useRef<NodeJS.Timeout>();

    const subscribe = useCallback(() => {
        if (!wsRef.current) return;
        wsRef.current.send(JSON.stringify({ action: 'subscribe', topic }));
    }, [topic]);

    const unsubscribe = useCallback(() => {
        if (!wsRef.current) return;
        wsRef.current.send(JSON.stringify({ action: 'unsubscribe', topic }));
    }, [topic]);

    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}`;

        const connect = () => {
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                setConnected(true);
                setReconnecting(false);
                subscribe();
            };

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                // Invalidate and refetch relevant cache
                queryClient.invalidateQueries([`list:${message.data.entity_id}`]);
            };

            ws.onerror = () => {
                setConnected(false);
            };

            ws.onclose = () => {
                setConnected(false);
                // Attempt reconnection
                setReconnecting(true);
                reconnectTimeoutRef.current = setTimeout(connect, 5000);
            };

            wsRef.current = ws;
        };

        if (token) {
            connect();
        }

        return () => {
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            unsubscribe();
            wsRef.current?.close();
        };
    }, [token, subscribe, unsubscribe, queryClient]);

    return { connected, reconnecting };
}
```

### Real-Time Sync Pattern

```typescript
// apps/web/lib/hooks/useRealtimeSync.ts
import { useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { useWebSocket } from './useWebSocket';

export function useRealtimeSync(token: string, topic: string, queryKey: string[]) {
    const queryClient = useQueryClient();
    const { connected } = useWebSocket(token, topic);

    useEffect(() => {
        if (!connected) return;

        // Setup listener for WebSocket events (via callback or context)
        const handler = (event: any) => {
            if (event.topic === topic) {
                queryClient.invalidateQueries(queryKey);
            }
        };

        // Would need event emitter or context to make this work
        // Alternative: manually subscribe in WebSocket hook

        return () => {
            // Cleanup
        };
    }, [connected, topic, queryKey, queryClient]);
}
```

### Quick Add Modal Pattern

```typescript
// apps/web/components/quick-add/QuickAddModal.tsx
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useListItems } from '@/lib/hooks/useListItems';

export function QuickAddModal({ isOpen, onClose }: Props) {
    const [giftName, setGiftName] = useState('');
    const [selectedList, setSelectedList] = useState<number | null>(null);
    const { mutate: addItem, isLoading } = useListItems(selectedList || 0);
    const { data: lists } = useLists();

    const handleSubmit = async () => {
        if (!giftName || !selectedList) return;

        await addItem(
            { gift_name: giftName, status: 'idea' },
            {
                onSuccess: () => {
                    setGiftName('');
                    onClose();
                },
            }
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Idea">
            <div className="space-y-4">
                <Input
                    label="Gift Idea"
                    value={giftName}
                    onChange={(e) => setGiftName(e.target.value)}
                    placeholder="e.g., Blue coffee mug"
                />

                <select
                    value={selectedList || ''}
                    onChange={(e) => setSelectedList(Number(e.target.value))}
                    className="border rounded px-3 py-2 w-full"
                >
                    <option value="">Select a list...</option>
                    {lists?.map((list) => (
                        <option key={list.id} value={list.id}>
                            {list.name}
                        </option>
                    ))}
                </select>

                <div className="flex gap-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} isLoading={isLoading}>Add</Button>
                </div>
            </div>
        </Modal>
    );
}
```

### Phase 8 Quality Gates

- [ ] Gift catalog with search working
- [ ] URL-based gift creation parses metadata correctly
- [ ] Quick Add accessible from header/FAB
- [ ] WebSocket hook connects without errors
- [ ] Real-time updates trigger React Query refetch
- [ ] Comments component working on all entity types
- [ ] "My Assignments" filter showing correct items
- [ ] No TypeScript errors or console warnings
- [ ] All touch targets 44px minimum
- [ ] 2-client WebSocket integration test passing

### Key Files to Create

```
apps/web/app/(dashboard)/
└── gifts/
    ├── page.tsx                # Gift catalog
    ├── [id]/
    │   └── page.tsx            # Gift detail
    └── new-from-url.tsx        # URL import modal

apps/web/components/
├── gifts/
│   ├── GiftCatalog.tsx
│   ├── GiftCard.tsx
│   ├── GiftDetail.tsx
│   ├── UrlGiftForm.tsx
│   └── GiftSearch.tsx
├── comments/
│   ├── CommentThread.tsx
│   ├── CommentForm.tsx
│   └── CommentList.tsx
├── assignments/
│   ├── MyAssignments.tsx
│   └── AssignmentCard.tsx
└── quick-add/
    └── QuickAddModal.tsx

apps/web/lib/
├── hooks/
│   ├── useGifts.ts
│   ├── useListItems.ts
│   ├── useWebSocket.ts
│   ├── useRealtimeSync.ts
│   └── useComments.ts
└── utils/
    └── url-parser.ts
```

---

## Phase 6-8 Summary

| Metric | Value |
|--------|-------|
| **Total Effort** | 36 story points |
| **Duration** | ~9-12 days |
| **Pages** | 15+ pages/views |
| **Components** | 40+ components |
| **React Query Hooks** | 15+ hooks |
| **API Integration** | 25+ endpoints consumed |
| **Real-Time Features** | WebSocket events, cache invalidation |

### Success Criteria

- All core features from PRD implemented
- Real-time collaboration working between 2 clients
- Mobile-first responsive design with safe areas
- React Query caching optimized
- All accessibility requirements met (ARIA, keyboard nav)
- Ready for testing and deployment in Phase 9

### Performance Targets

- Page load time: <3 seconds
- API response: <300ms
- React Query stale time: 5 minutes
- Cache time: 30 minutes
- WebSocket reconnection: <5 seconds

---

**Phase File Version**: 1.0
**Last Updated**: 2025-11-26
