---
title: "UI Overhaul Phase 2 Planning"
description: "Comprehensive planning for redesigning remaining pages to match new design language established in Phase 1"
audience: "Development team, UI engineers, frontend developers"
tags: ["UI/UX", "Design System", "Frontend", "Planning"]
created: 2025-11-29
updated: 2025-11-29
---

# UI Overhaul Phase 2 – Complete Planning Document

**Scope**: Redesign remaining 12 pages/page groups to match Phase 1 design language
**Completed Phase 1**: Dashboard, Lists Index, List Detail (Kanban), Navigation
**Timeline**: 3-4 weeks (10-12 story points per week)
**Team**: 1 UI Engineer + support from frontend developers
**Status**: Planning Phase

---

## Executive Summary

Phase 1 established a cohesive design language with glassmorphism, warm colors (salmon, mustard, sage), large rounded corners, and mobile-first patterns. Phase 2 applies this language systematically to all remaining pages.

**Key Metrics**:
- 12 pages/page groups to redesign
- 2 critical paths (Auth pages + Core CRUD pages)
- 8 new/enhanced components to create
- 100% mobile-first responsive
- All touch targets 44px+ minimum

**Success Criteria**:
- All pages match Phase 1 design language
- Mobile-first responsive (375px to 1440px)
- All components reusable across pages
- Design system complete and documented
- Zero design debt

---

## Phase 1 Design Language (Reference)

### Colors
- **Salmon**: `#E07A5F` (Primary action, highlights)
- **Mustard**: `#DDBEA9` (Accent, secondary elements)
- **Sage**: `#81B29A` (Success, secondary accent)
- **Cream**: `#F5F1E8` (Background, light surfaces)
- **Charcoal**: `#3D405B` (Text, dark elements)
- **Status Colors**: idea (gray), shortlisted (mustard), purchased (sage)

### Typography
- **Headings**: Charcoal, bold/extrabold, large sizes (2xl-4xl)
- **Body**: Charcoal/gray-600, regular/medium weight
- **Actions**: Bold font weight, 44px minimum height

### Glassmorphism
- Backdrop blur: `backdrop-blur-md` or `backdrop-blur-xl`
- Background opacity: `bg-white/60` or `bg-white/50`
- Shadow: `shadow-sm` for subtle depth
- Border radius: `rounded-[2rem]`, `rounded-[2.5rem]`, `rounded-full`

### Decorative Elements
- Background blobs with blur: `bg-[color]/opacity rounded-full blur-3xl`
- Positioned absolute, pointer-events-none
- Colors use brand palette with reduced opacity (10-15%)

### Components
- Cards: Glassmorphic with large rounded corners
- Buttons: Salmon primary, white secondary (with icons)
- Modals: Centered, glassmorphic overlay
- Forms: Clean, minimal styling with Tailwind
- Lists: Grid layouts (1 col mobile, 2-3 cols desktop)

---

## Remaining Pages – Priority & Complexity Matrix

### Tier 1 (CRITICAL) – High Priority, Must Do First

| Page | Complexity | Story Points | Dependencies | Notes |
|------|-----------|--------------|--------------|-------|
| **Login** | Simple | 2 pts | None | Auth entry point, establishes design language |
| **Register** | Simple | 2 pts | Login done | Mirrors login design |
| **People Index** | Medium | 3 pts | Lists index pattern | Card grid, search, filters |
| **People New/Edit** | Medium | 3 pts | People index done | Form modal or dedicated page |
| **Occasions Index** | Medium | 3 pts | Lists index pattern | Timeline/calendar view |
| **Occasions New/Edit** | Medium | 2 pts | Occasions index done | Form patterns |

**Subtotal Tier 1**: 15 story points

### Tier 2 (IMPORTANT) – High Priority, Core Functionality

| Page | Complexity | Story Points | Dependencies | Notes |
|------|-----------|--------------|--------------|-------|
| **Gift Catalog** | Medium | 3 pts | Lists pattern, search | Grid with search/filters |
| **Gift Detail** | Simple | 2 pts | Gift catalog done | Read-only info display |
| **Gift New/Edit** | Medium | 3 pts | Gift catalog done | Form with URL parsing UI |
| **Assignments** | Medium | 3 pts | Lists pattern | Filtered list view |
| **Person Detail** | Complex | 4 pts | People index done | Tabs, history, photos |
| **Occasion Detail** | Complex | 4 pts | Occasions index done | Pipeline view, participants |

**Subtotal Tier 2**: 19 story points

### Tier 3 (ENHANCEMENT) – Nice to Have, Can Do Later

| Page | Complexity | Story Points | Dependencies | Notes |
|------|-----------|--------------|--------------|-------|
| **List New/Edit** | Medium | 3 pts | Lists index done | Form modal |
| **Modals/Forms** | Medium | 2 pts | Various | Global form patterns |

**Subtotal Tier 3**: 5 story points

**Total Phase 2**: 39 story points (~4 weeks at 10 pts/week)

---

## Page-by-Page Design Specifications

### TIER 1: Authentication Pages

#### 1. Login Page (`apps/web/app/(auth)/login/page.tsx`)

**Current State**: Basic form with gray styling
**Target**: Glassmorphic, warm colors, centered, mobile-friendly

**Design Changes**:
- Background: Cream (`bg-cream`) with decorative blobs
- Container: Glassmorphic card (`bg-white/60 backdrop-blur-md rounded-[2rem]`)
- Header: Charcoal heading, warm accent color
- Form fields: Clean input styling with 44px min-height
- Button: Salmon primary button with shadow
- Links: Charcoal text with hover effect

**Components Needed**:
- `AuthCard` (glassmorphic container with blobs)
- `FormInput` (reusable input with label)
- Enhanced `Button` with loading state

**Mobile Considerations**:
- Single column layout
- Safe area padding on iOS
- Full-height container with centered form
- Touch targets 44px+

**Acceptance Criteria**:
- [ ] Matches design language exactly
- [ ] Responsive at 375px (mobile) to 1440px (desktop)
- [ ] All touch targets 44px+
- [ ] Form validation works
- [ ] Error messages styled consistently
- [ ] Loading state visible

---

#### 2. Register Page (`apps/web/app/(auth)/register/page.tsx`)

**Current State**: Not yet created (mirrored from login)
**Target**: Same design as login but with additional fields

**Design Changes**:
- Layout: Identical to login page
- Additional fields: Name, confirm password
- Form validation: Clear error indicators
- Success: Clear next steps

**Components Needed**:
- Reuse `AuthCard`, `FormInput`, enhanced `Button`

**Acceptance Criteria**:
- [ ] Consistent with login design
- [ ] All form fields 44px+ height
- [ ] Validation errors clear
- [ ] Submit button disabled while loading
- [ ] Success handling with redirect

---

### TIER 1: People Pages

#### 3. People Index (`apps/web/app/people/page.tsx`)

**Current State**: Basic card grid with search/filter
**Target**: Redesign to match Lists Index pattern

**Design Changes**:
- Header: Bold charcoal "People" with subtitle (count, filters active)
- Background: Cream with subtle blobs
- Filter/Sort buttons: White rounded buttons with icons (44px+ height)
- Card grid: Glassmorphic person cards
- Cards show: Avatar, name, relationship, next occasion, interests
- Actions: "Add Person" button (salmon, primary)
- Empty state: Centered with action button

**Person Card Structure**:
```
┌──────────────────────────┐
│ [Avatar] [Name]          │
│ [Relationship tag]       │
│ [Interests: tag chip...] │
│ Next: [Occasion] [Date]  │
│ [Quick action button]    │
└──────────────────────────┘
```

**Components Needed**:
- `PersonCard` (glassmorphic with avatar, info, actions)
- `PersonSearch` (enhance existing with modern styling)
- `FilterButton`, `SortButton` (reusable icon buttons)
- `PageHeader` (reuse from Lists)

**Grid Layout**:
- Mobile: 1 column (full width card)
- Tablet (768px): 2 columns
- Desktop (1024px): 3 columns
- Desktop (1440px): 3-4 columns

**Acceptance Criteria**:
- [ ] Matches Lists Index design language
- [ ] Search/filter buttons styled with icons
- [ ] Card grid responsive at all breakpoints
- [ ] Person cards show all required info
- [ ] "Add Person" action visible
- [ ] Empty state friendly
- [ ] Loading skeletons match card design

---

#### 4. People New/Edit Page (`apps/web/app/people/new/page.tsx`)

**Current State**: Form page (basic styling)
**Target**: Glassmorphic form with warm colors

**Design Changes**:
- Layout: Centered form container (max-width: 600px)
- Background: Cream with blobs
- Container: Glassmorphic (`bg-white/60 backdrop-blur-md`)
- Form sections: Grouped with gray dividers
- Section headers: Medium bold charcoal
- Form fields: Clean inputs with labels
- Buttons: Primary (salmon) + secondary (cancel)
- Photos: Avatar upload with preview

**Form Sections**:
1. **Basic Info**: Name, relationship, birthdate
2. **Appearance**: Avatar upload, size info
3. **Interests & Notes**: Interest tags, free-form notes
4. **Constraints**: Allergies, preferences (text area)

**Components Needed**:
- `FormCard` (glassmorphic container for forms)
- `FormSection` (grouped inputs with header)
- `AvatarUpload` (with preview)
- `TagInput` (add/remove interests)
- `FormButtons` (primary + secondary buttons)

**Acceptance Criteria**:
- [ ] Centered form layout
- [ ] All inputs 44px+ minimum height
- [ ] Avatar upload with preview
- [ ] Save/Cancel buttons clear
- [ ] Mobile: single column, stacked buttons
- [ ] Desktop: form max-width 600px
- [ ] Error messages visible and styled

---

### TIER 1: Occasions Pages

#### 5. Occasions Index (`apps/web/app/occasions/page.tsx`)

**Current State**: Basic list view
**Target**: Redesign matching People/Lists pattern

**Design Changes**:
- Header: Bold charcoal "Occasions" with count and timeline info
- Background: Cream with blobs
- Layout: Glassmorphic sections grouped by type or timeline
- Card type: Timeline/calendar view with occasion cards
- Cards show: Date, name, type (badge), people count, budget
- Filters: Type (Christmas, Birthday, Anniversary), timeframe (upcoming, past)
- Sort: By date, name, type
- Action: "Add Occasion" button (salmon)

**Occasion Card**:
```
┌──────────────────────────┐
│ [Date badge] [Name]      │
│ [Type badge] · [People]  │
│ Budget: $X / $Y          │
│ [Quick edit button]      │
└──────────────────────────┘
```

**Timeline View Option**:
- Vertical timeline with occasion cards as points
- Color-coded by type (Christmas=red tint, Birthday=sage, etc.)
- Grouped by month or quarter

**Components Needed**:
- `OccasionCard` (glassmorphic occasion info)
- `OccasionTimeline` (vertical or horizontal timeline)
- `TypeBadge` (occasion type visual indicator)
- Date picker or timeline component
- Reuse `PageHeader`, `FilterButton`

**Grid/Timeline Layout**:
- Mobile: Vertical timeline or single-column cards
- Tablet: 2-column card grid
- Desktop: Card grid 3 columns or timeline view

**Acceptance Criteria**:
- [ ] Timeline or card grid layout
- [ ] Occasion cards show all key info
- [ ] Date sorting and filtering working
- [ ] Type badges color-coded
- [ ] "Add Occasion" action visible
- [ ] Mobile friendly layout
- [ ] Empty state clear

---

#### 6. Occasions New/Edit Page (`apps/web/app/occasions/new/page.tsx`)

**Current State**: Form page (basic)
**Target**: Glassmorphic form, warm colors

**Design Changes**:
- Layout: Centered form (max-width: 600px)
- Background: Cream with blobs
- Container: Glassmorphic form card
- Sections: Name, date, type, people, budget, notes
- Date picker: Native or calendar UI
- Type selector: Radio buttons or dropdown with badges
- People selector: Multi-select dropdown or checkbox list
- Budget: Currency input with icon

**Form Sections**:
1. **Basic**: Name, type (dropdown/radio)
2. **Timeline**: Date/date range with calendar picker
3. **Scope**: People involved (multi-select)
4. **Budget**: Total budget (currency)
5. **Notes**: Description, theme notes

**Components Needed**:
- `FormCard` (reuse from People form)
- `DatePicker` (custom or library)
- `TypeSelector` (radio group with badges)
- `PeopleSelector` (multi-select)
- `CurrencyInput` (for budget)
- Reuse `FormSection`, `FormButtons`

**Acceptance Criteria**:
- [ ] Form max-width 600px, centered
- [ ] Date picker works on mobile
- [ ] Type selection clear (visually)
- [ ] People multi-select working
- [ ] Currency formatting
- [ ] Save/cancel buttons visible
- [ ] Mobile: single column
- [ ] Validation errors clear

---

### TIER 2: Gift Pages

#### 7. Gift Catalog (`apps/web/app/gifts/page.tsx`)

**Current State**: Basic grid with search
**Target**: Enhance to match Lists/People pattern with better search/filters

**Design Changes**:
- Header: Bold "Gift Catalog" with count
- Background: Cream with blobs
- Search bar: Enhanced with clear button
- Filters: Price range, tags, vendor, source (sidebar or button group)
- Sort: Recent, price (low-high), popularity
- Card grid: Glassmorphic gift cards
- Cards show: Image, name, price, tags, vendor links
- Action: "Add Gift" button (salmon)

**Gift Card**:
```
┌──────────────────────────┐
│ [Image - aspect-square]  │
│ [Name]                   │
│ [Tags: chip chip chip]   │
│ [$Price] · [Vendor badge]│
│ [View button]            │
└──────────────────────────┘
```

**Layout**:
- Mobile: 2 columns (full width)
- Tablet: 3 columns
- Desktop: 4 columns

**Components Needed**:
- `GiftCard` (enhance existing)
- `GiftSearch` (enhance existing)
- `PriceRangeSlider` (filter)
- `VendorFilter` (checkbox group)
- `SortDropdown` (price, recent, etc.)

**Filters**:
- Price range: Slider ($0-$500)
- Tags: Chip group, multi-select
- Vendor: Checkbox list (Amazon, Target, etc.)
- Source: Radio buttons (manual, scrape, etc.)

**Acceptance Criteria**:
- [ ] Search works smoothly (debounced)
- [ ] Filters update grid instantly
- [ ] Responsive grid at all breakpoints
- [ ] Gift cards show images well
- [ ] Price formatting consistent
- [ ] Vendor badges styled
- [ ] Empty state clear

---

#### 8. Gift Detail (`apps/web/app/gifts/[id]/page.tsx`)

**Current State**: Basic info page
**Target**: Enhanced detail page with usage info

**Design Changes**:
- Header: Gift image with overlay info
- Layout: 2-column (image + details)
- Image: Large, full-width on mobile
- Details section: Glassmorphic cards for grouping
- Sections: Basic info, links/deals, tags, usage, comments
- Links: Show multiple vendor options with price/availability
- Usage: Which lists and people have this gift
- Actions: Edit, delete, add to list (buttons)

**Page Structure**:
```
[Header with back button]
[Decorative blobs background]

[Image - large]    [Info Card]
                   - Name
                   - Price
                   - Description

[Links Card]
- Vendor 1: $XX
- Vendor 2: $XX
- Best deal indicator

[Usage Card]
- In lists: X times
- Given to people: Y
- View usage

[Tags Card]
- Tag chip list
- Edit button

[Comments Card]
- Comment thread
- Add comment form
```

**Components Needed**:
- `DetailHeader` (with back button)
- `DetailCard` (glassmorphic info container)
- `VendorLink` (with price and badges)
- `UsageList` (which lists/people)
- `CommentThread` (reuse from lists)

**Responsive**:
- Mobile: Single column (image, then all cards)
- Tablet (768px+): 2 column (image left, cards right)
- Desktop: Image left, cards right

**Acceptance Criteria**:
- [ ] Image loads and displays well
- [ ] All information sections visible
- [ ] Vendor links with prices
- [ ] Usage shows lists/people
- [ ] Comments section works
- [ ] Edit/delete actions clear
- [ ] Mobile stacking works

---

#### 9. Gift New/Edit Page (`apps/web/app/gifts/new/page.tsx`)

**Current State**: Form page
**Target**: Glassmorphic form with URL parsing UI

**Design Changes**:
- Layout: Two-step or single form
- Option 1: URL input first (with preview) → then manual fields
- Option 2: Unified form with optional URL field
- Background: Cream with blobs
- Container: Glassmorphic form card (max-width: 600px)
- Sections: Source, basic info, pricing, tags, notes

**Form Sections**:
1. **Source**: Radio buttons (manual, URL paste, upload)
2. **URL Input** (if URL selected):
   - Input with "Fetch" button
   - Loading state
   - Preview: Image + auto-filled fields
3. **Basic Info**: Name, description
4. **Pricing**: Price, currency
5. **Tags**: Multi-select or chip input
6. **Links**: Add vendor link (URL + price)
7. **Image**: Upload or use fetched image
8. **Notes**: Internal notes

**Components Needed**:
- `FormCard` (reuse)
- `URLPreview` (shows fetched image/title)
- `URLFetcher` (input with button, handles fetch)
- `PriceInput` (currency formatting)
- `TagSelector` (multi-select)
- `VendorLinkAdder` (repeatable form for links)
- `ImageUpload` (with preview)

**Acceptance Criteria**:
- [ ] URL fetch works (or graceful fallback)
- [ ] Manual input works
- [ ] Image preview after upload/fetch
- [ ] Tags auto-complete (if available)
- [ ] Vendor links repeatable
- [ ] Save/cancel buttons clear
- [ ] Mobile: single column form
- [ ] Form validation clear

---

### TIER 2: Assignments Page

#### 10. Assignments View (`apps/web/app/assignments/page.tsx`)

**Current State**: Not redesigned
**Target**: Filtered view of items assigned to current user

**Design Changes**:
- Header: "My Assignments" or "Assigned to Me"
- Background: Cream with blobs
- Content: List or card view of assigned items
- Grouping: By occasion, by list, or by status
- Cards show: Item name, list, occasion, date, assigned by, status
- Filters: Status, occasion, list, due date
- Sort: By date, occasion, status
- Actions: Mark complete, reassign

**Item Card**:
```
┌──────────────────────────┐
│ [Name] [Status badge]    │
│ [List] · [Occasion]      │
│ Assigned by [User]       │
│ Due: [Date]              │
│ [Complete button]        │
└──────────────────────────┘
```

**Layout Options**:
- Option 1: Card grid (2-3 columns)
- Option 2: Grouped by occasion (sections)
- Option 3: Grouped by status (Kanban-like)

**Components Needed**:
- `AssignmentCard` (glassmorphic)
- `AssignmentList` (grouped or flat)
- Status filter buttons
- Date range picker (optional)

**Acceptance Criteria**:
- [ ] Shows all user's assignments
- [ ] Filters work (status, occasion)
- [ ] Cards show all key info
- [ ] Mark complete action works
- [ ] Mobile responsive
- [ ] Empty state clear
- [ ] Sort/filter buttons visible

---

### TIER 2: Person Detail Page

#### 11. Person Detail (`apps/web/app/people/[id]/page.tsx`)

**Current State**: Basic info page
**Target**: Enhanced detail with tabs, history, photos

**Design Changes**:
- Header: Avatar + name + relationship
- Layout: Glassmorphic sections/tabs
- Tabs or sections: Overview, lists, history, notes, comments
- Overview: Interests, sizes, constraints, upcoming occasions
- Lists: Associated lists (wishlists, gift lists)
- History: Past gifts, organized by year/occasion
- Notes: Free-form notes + internal comments
- Actions: Edit, delete, add to list (buttons)

**Page Structure**:
```
[Back button + Edit + Delete]
[Avatar + Name + Relationship]
[Tabs: Overview | Lists | History | Notes]

Tab: Overview
├─ Interests section (tag chips)
├─ Sizes section (structured)
├─ Constraints section
└─ Upcoming occasions

Tab: Lists
├─ Associated lists (cards)

Tab: History
├─ By year or occasion
├─ Gift cards with dates

Tab: Notes
├─ Free-form text area
├─ Comments section
```

**Components Needed**:
- `DetailHeader` (reuse from gift detail)
- `TabsComponent` (tab navigation)
- `PersonInfoCard` (overview section)
- `ListsSection` (associated lists)
- `GiftHistory` (organized list)
- `NotesSection` (editable text + comments)
- `InterestChips` (display interests)

**Responsive**:
- Mobile: Single column, stacked tabs
- Tablet/Desktop: Same structure, wider containers

**Acceptance Criteria**:
- [ ] Avatar displays properly
- [ ] All tabs working
- [ ] Overview shows all info
- [ ] Lists section links to lists
- [ ] History shows past gifts
- [ ] Notes editable (if owner)
- [ ] Comments section working
- [ ] Mobile tabs accessible
- [ ] Edit/delete actions visible

---

### TIER 2: Occasion Detail Page

#### 12. Occasion Detail (`apps/web/app/occasions/[id]/page.tsx`)

**Current State**: Basic info page
**Target**: Enhanced detail with people, lists, budget, progress

**Design Changes**:
- Header: Occasion name, date, type badge
- Layout: Glassmorphic sections
- Sections: Summary, participants, lists, budget, pipeline, notes
- Summary: Name, date, scope, description
- Participants: People involved with gift counts
- Lists: Associated lists grouped by person
- Budget: Progress bar, spent vs planned
- Pipeline: Status breakdown (idea, shortlisted, purchased)
- Notes: Free-form + comments

**Page Structure**:
```
[Header: Name, Date, Type badge]
[Background blobs]

[Summary Card]
├─ Name, date, type
├─ Description
└─ Edit/Delete buttons

[Budget Card]
├─ Total: $X / $Y
├─ Progress bar
└─ Breakdown by person

[Pipeline Card]
├─ Status breakdown chart
├─ Idea: X
├─ Shortlisted: Y
├─ Purchased: Z

[Participants Card]
├─ People list with gift counts
├─ Add person button

[Lists Card]
├─ Associated lists
├─ Grouped by person
└─ View list links

[Notes Card]
├─ Description/notes
├─ Comments section
```

**Components Needed**:
- `DetailHeader` (reuse)
- `SummaryCard` (occasion info)
- `BudgetProgressCard` (with progress bar)
- `PipelineCard` (status breakdown)
- `ParticipantsCard` (people list)
- `ListsSection` (associated lists)
- `NotesSection` (editable)
- `ProgressBar` (budget visualization)

**Charts/Visualizations**:
- Budget progress bar (% complete)
- Pipeline status breakdown (could be simple numbers or small chart)
- People coverage (who needs gifts still)

**Responsive**:
- Mobile: Single column cards
- Tablet: 2-column layout (info + lists)
- Desktop: 3-column or grid layout

**Acceptance Criteria**:
- [ ] All sections visible and organized
- [ ] Budget progress shows correctly
- [ ] Pipeline counts accurate
- [ ] People list shows assignments
- [ ] Lists section links working
- [ ] Notes section editable (if owner)
- [ ] Comments working
- [ ] Edit/delete actions visible
- [ ] Mobile responsive

---

## Component Reuse Matrix

### Create These Components (Used Across Multiple Pages)

| Component | Purpose | Used In | Status |
|-----------|---------|---------|--------|
| `PageHeader` | Title, subtitle, actions | All pages | **Exists** (from Lists) |
| `DetailHeader` | Back button, title, actions | Person, Gift, Occasion detail | **New** |
| `DetailCard` | Glassmorphic info container | All detail pages | **New** |
| `FormCard` | Glassmorphic form container | All form pages | **New** |
| `FormSection` | Grouped form inputs | People, Occasions, Gift forms | **New** |
| `PersonCard` | Person display with info | People index | **Enhance** existing |
| `GiftCard` | Gift display with image | Gift catalog | **Enhance** existing |
| `OccasionCard` | Occasion display | Occasions index | **New** |
| `ListCard` | List display | Lists index, detail | **Exists** |
| `AssignmentCard` | Assignment item display | Assignments page | **New** |
| `FilterButton` | Icon + text filter button | All list pages | **New** |
| `SortButton` | Icon + text sort button | All list pages | **New** |
| `StatusBadge` | Status visual indicator | Gift, Occasion, Assignment cards | **Enhance** existing |
| `TypeBadge` | Type visual indicator | Occasion cards | **New** |
| `CommentThread` | Comment display/add | Detail pages | **Enhance** existing |
| `AvatarUpload` | Avatar upload with preview | People form | **New** |
| `TagInput` | Add/remove tag chips | People, Gift forms | **Enhance** existing |
| `DatePicker` | Date selection UI | Occasion form | **New or Library** |
| `PriceInput` | Currency input | Gift form | **New** |
| `ProgressBar` | Visual progress indicator | Occasion detail budget | **New** |

**Component Creation Estimate**: 12 new + 6 enhancements = 18 story points

---

## Implementation Phases

### Phase 2A: Foundation (Weeks 1)
**Effort**: 10 story points
**Focus**: Establish patterns and reusable components

1. **Create Core Components** (5 pts)
   - `DetailHeader`, `DetailCard`, `FormCard`, `FormSection`
   - Buttons: `FilterButton`, `SortButton`, enhanced `Button`
   - Utilities: Status/Type badges, progress bar

2. **Auth Pages** (5 pts)
   - Login page redesign
   - Register page redesign
   - `AuthCard` component with blobs
   - Enhanced form inputs

**Deliverable**: Design system components + auth pages complete

---

### Phase 2B: Core Pages (Weeks 2)
**Effort**: 10 story points
**Focus**: People and Occasions management pages

1. **People Pages** (6 pts)
   - People index redesign (cards + search/filter)
   - People new/edit form
   - `PersonCard` component

2. **Occasions Pages** (4 pts)
   - Occasions index redesign
   - Occasions new/edit form
   - `OccasionCard` component

**Deliverable**: Complete people and occasions CRUD

---

### Phase 2C: Gift Pages (Week 3)
**Effort**: 8 story points
**Focus**: Gift catalog and detail pages

1. **Gift Catalog** (3 pts)
   - Gift page redesign (enhanced search/filters)
   - `GiftCard` component enhancements
   - Filter/sort functionality

2. **Gift Detail** (2 pts)
   - Detail page redesign
   - Multi-vendor links display
   - Usage information

3. **Gift New/Edit** (3 pts)
   - Form redesign
   - URL preview/fetch UI
   - Image upload

**Deliverable**: Complete gift catalog and CRUD

---

### Phase 2D: Detail Pages + Enhancements (Week 4)
**Effort**: 8-10 story points
**Focus**: Complex detail pages and finishing touches

1. **Person Detail** (4 pts)
   - Tabs: Overview, lists, history, notes
   - Photo display
   - Gift history

2. **Occasion Detail** (4 pts)
   - Summary, participants, lists, budget
   - Pipeline visualization
   - Progress indicators

3. **Assignments Page** (2 pts)
   - Filtered view of assignments
   - Status grouping
   - Mark complete action

4. **List New/Edit** (1 pt)
   - Form modal or page
   - Quick patterns

5. **Polish & Refinement** (1-2 pts)
   - Design system finalization
   - Cross-page consistency check
   - Mobile testing
   - Accessibility review

**Deliverable**: All pages complete + design system finalized

---

## Design System Documentation

### To Create (as Planning Outputs)

1. **Component Library** (`docs/designs/COMPONENTS-PHASE2.md`)
   - Spec for each new/enhanced component
   - Props, variants, usage examples
   - Mobile considerations

2. **Design Tokens** (`docs/designs/DESIGN-TOKENS-PHASE2.md`)
   - Color palette (with RGB/HEX)
   - Spacing scale
   - Typography scale
   - Border radius tokens
   - Shadow tokens

3. **Patterns Guide** (`docs/designs/PATTERNS-PHASE2.md`)
   - Form patterns (single-page vs modal)
   - List patterns (grid, cards, timeline)
   - Detail page patterns
   - Empty states
   - Loading states
   - Error states

4. **Mobile Guidelines** (`docs/designs/MOBILE-GUIDELINES.md`)
   - Safe area implementation
   - Touch target sizes
   - Responsive breakpoints
   - Viewport meta tag
   - iOS/Safari specific notes

---

## Dependency Graph

```
Auth Pages (Login, Register)
    ↓ (establish auth context)

People Pages (Index, New/Edit, Detail)
    ← Core People Components
    ← Form Components
    ← Reuse from Lists

Occasions Pages (Index, New/Edit, Detail)
    ← Core Occasions Components
    ← Form Components
    ← Reuse from Lists

Gift Pages (Catalog, Detail, New/Edit)
    ← Core Gift Components
    ← Form Components with URL handling
    ← Reuse from Lists

Assignments Page
    ← Reuse from Lists
    ← Reuse from Gift
    ← Status/badge components

Advanced: Person Detail, Occasion Detail
    ← All core pages should be done first
    ← Tab components
    ← Advanced layouts
```

---

## Testing Strategy

### Component Testing
- All new components have visual stories (if using Storybook)
- Props and variants documented and tested
- Responsive behavior verified at 375px, 768px, 1440px
- Touch targets verified (44px minimum)
- Accessibility: ARIA labels, keyboard navigation

### Page Testing
- Responsive layout at all breakpoints
- Form validation and submission
- API integration with loading/error states
- Mobile-specific features (safe areas, orientation changes)
- Real data rendering (not just mocks)

### Design System Testing
- Color contrast ratio checks (WCAG AA minimum)
- Typography hierarchy verification
- Glassmorphism effects in various lighting
- Blob animations smoothness
- Dark mode (if applicable)

---

## Mobile-First Checklist

For Every Page:

- [ ] Viewport meta tag correct
- [ ] Safe area insets applied (iOS)
- [ ] All touch targets 44px+ (width and height)
- [ ] Single column layout on mobile
- [ ] Proper scrolling behavior (no horizontal scroll)
- [ ] Forms usable with mobile keyboard
- [ ] Images responsive and optimized
- [ ] Text readable (16px+ body, good contrast)
- [ ] Tap targets have visual feedback
- [ ] Modals/overlays mobile-friendly
- [ ] 100dvh vs 100vh correct usage
- [ ] Safe area padding on notch devices

---

## Success Metrics

### Completion
- [ ] All 12 pages/groups redesigned
- [ ] 18 components created/enhanced
- [ ] 0 pages using old design patterns
- [ ] 100% mobile-first responsive

### Quality
- [ ] Mobile testing on actual iOS device
- [ ] Desktop testing at 1440px
- [ ] No design inconsistencies across pages
- [ ] All color values use defined palette
- [ ] All spacing uses defined scale
- [ ] Accessibility audit passes (WCAG AA)

### Performance
- [ ] Page load time < 3s on 4G
- [ ] Animations smooth (60fps)
- [ ] Image optimization (WebP, srcset)
- [ ] No layout shift during load

---

## Timeline Summary

| Week | Phase | Focus | Output |
|------|-------|-------|--------|
| 1 | 2A | Foundation & Auth | Core components, auth pages |
| 2 | 2B | People & Occasions | CRUD pages for people/occasions |
| 3 | 2C | Gifts | Catalog, detail, form pages |
| 4 | 2D | Details & Polish | Complex detail pages, refinement |

**Total**: 4 weeks, 39 story points

---

## Notes & Open Questions

### Design Decisions
1. **Timeline vs Grid for Occasions**: Should occasions use vertical timeline or card grid? Recommend card grid for simplicity.
2. **Form Modal vs Dedicated Page**: Should new/edit pages be modals or dedicated pages? Recommend dedicated pages for better mobile experience.
3. **Sidebar Filters vs Inline**: Should filters be in sidebar or inline buttons? Recommend inline buttons that open filter panel on mobile.

### Technical Considerations
1. **URL Fetching**: How to handle gift URL parsing? Recommend client-side placeholder, backend parsing later.
2. **Image Optimization**: All images should use `next/image` with proper sizing.
3. **Real-time Updates**: Do pages need WebSocket updates? Defer to Phase 3.

### Future Enhancements (Post-Phase 2)
1. **Dark Mode**: Theme system for dark/light modes
2. **Animations**: Add micro-interactions (page transitions, button states)
3. **Advanced Filters**: Server-side filtering instead of client-side
4. **Search**: Full-text search across gifts, people, occasions
5. **Notifications**: Toast notifications for actions

---

## Resources & References

### Design Files
- Inspiration folder: `/inspiration/family-gifting/`
- Design tokens: Colors, spacing, typography
- Component specs: Use Lists/Dashboard as reference

### Documentation
- Phase 1 completion: Dashboard, Lists, Navigation
- Design CLAUDE.md: `/apps/web/CLAUDE.md`
- Project CLAUDE.md: `/CLAUDE.md`

### Tools
- Tailwind CSS for styling
- Radix UI for primitives
- React Query for state
- Next.js App Router

---

**Document Version**: 1.0
**Created**: 2025-11-29
**Status**: Ready for Implementation
**Next Steps**: Assign to UI Engineer → Begin Phase 2A
