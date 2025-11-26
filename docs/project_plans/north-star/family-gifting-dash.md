# Family Gifting Dashboard – Product Requirements Document (PRD)

---

## 1. Overview

**Product Name (working):** Family Gifting Dashboard
**Primary Audience:** Couples and small families coordinating gifts across occasions (Christmas, birthdays, anniversaries, etc.).
**Form Factor:** Modern web app, self-hosted, mobile-first, with strong alignment to Apple ecosystem (Safari, iOS, macOS; PWA).

**Vision (North Star):**
A private, always-on “family gifting table”: a shared space where spouses and close family can see people, occasions, ideas, lists, deals, and notes in one place—like planning Christmas on a big kitchen table with catalogs, post-its, and calendars, but realized as a 2026-grade collaborative web and mobile app.

---

## 2. Goals & Non-Goals

### 2.1 Goals

* **G1 – Centralized Gift Brain:**
  One canonical source of truth for people, occasions, lists, gifts, and history.
* **G2 – Frictionless Capture:**
  Make it trivial to capture gift ideas anytime (on phone, from Safari, via URLs).
* **G3 – High-Trust Collaboration:**
  Real-time multi-user experience where partners coordinate without double-buying, with rich comments and assignments.
* **G4 – Occasion-Centric Planning:**
  Treat holidays and events (especially Christmas) as first-class citizens, with theming, dashboards, and timelines.
* **G5 – Apple-Ecosystem Friendly:**
  Works beautifully on iPhone, iPad, and Mac; feels like a natural extension of Apple’s UX patterns.
* **G6 – Extensible Platform:**
  Architecture supports easy future features: deal tracking, AI suggestions, calendar integration, guest accounts, etc.

### 2.2 Non-Goals (for foreseeable roadmap)

* **NG1:** Public social network, feed, or discovery platform for strangers.
* **NG2:** Full e-commerce platform (no direct fulfillment or payment processing).
* **NG3:** Complex multi-tenant SaaS management (v1–v3 focus on single-family instance, multi-tenant as a later spin-out).
* **NG4:** Deep vendor integration for every retailer; focus on a small set plus generic URL parsing.

---

## 3. Target Users & Use Cases

### 3.1 Primary Personas

1. **Family Planner (Owner Admin)**

   * Typically one partner who drives planning.
   * Needs: overview, budgets, who is covered, status by person/occasion, and quick capture of ideas.

2. **Co-Planner (Core Collaborator)**

   * Spouse/partner who participates but doesn’t own the system.
   * Needs: simple experience, clear place to add ideas, see what’s assigned to them, and comment.

3. **Extended Collaborator (Guest)** – Future

   * Sibling, grandparent, or close friend invited for specific occasions.
   * Needs: limited-scoped access (e.g., only kids’ lists for Christmas), simple UX, minimal onboarding.

### 3.2 Core Use Cases (North Star)

* **UC1 – Plan Christmas for a large family**

  * Track everyone (kids, parents, siblings).
  * Maintain gift ideas and final choices by person.
  * Avoid duplicates, keep budgets in check.
  * See a “progress snapshot” for Christmas.

* **UC2 – Capture random ideas year-round**

  * See a LEGO set on a website → capture URL + quick tags → later assign to Peyton for her birthday.

* **UC3 – Coordinate between partners**

  * Partner A adds idea and assigns to Partner B as buyer.
  * Both see comments and decisions in one place.

* **UC4 – Track gift history**

  * “What did we get Parker last year?”
  * Avoid repeats and see patterns/preferences over time.

* **UC5 – Deal-aware planning** (later phases)

  * Monitor prices of key gifts.
  * Show best vendor/deal.
  * Flag “price drop” or “deal ending” alerts.

---

## 4. Functional Requirements

### 4.1 Domain Model / Entities

All entities must be represented as backend models, with API and UI surfaces.

#### 4.1.1 User

* Attributes:

  * `id`
  * `name`
  * `email`
  * `avatar_url`
  * `is_admin` (bool)
  * `linked_person_id` (optional)
  * Auth metadata (password hash OR Apple sign-in ID/token, etc.)
* Capabilities:

  * Log in/out, manage own profile.
  * Manage linked `Person` record (if any).
  * Receive notifications.
  * Permissions: admin vs standard user vs future guest.

#### 4.1.2 Person

* Attributes:

  * `id`
  * `display_name`
  * `legal_name` (optional)
  * `relationship` (enum: child, spouse, parent, sibling, friend, other)
  * `birthdate` (optional)
  * `notes`
  * `interests` (text + tags)
  * `sizes` (structured JSON: clothes/shoes/etc.)
  * `constraints` (allergies, “no plushies”, etc.)
  * `photo_url` or avatar
* Capabilities:

  * Attach lists (wishlists, gift lists).
  * Attach occasions where they are a key person.
  * Attach tags representing long-term preferences.

#### 4.1.3 Occasion

* Attributes:

  * `id`
  * `name` (Christmas 2025, Parker’s 4th Birthday, etc.)
  * `type` (enum: Christmas, Birthday, Anniversary, Other)
  * `date` or `date_range`
  * `scope`:

    * Global (e.g., Christmas)
    * Person-specific (e.g., “Peyton’s Birthday 2026”)
    * Group (e.g., “Trip to Disney July 2027”)
  * `budget_total` (optional)
  * `notes`
* Capabilities:

  * Have multiple lists linked.
  * Set or inherit Themes.
  * Provide progress metrics (gifts planned vs needed, budget used, etc.).
  * Drive UI theming when “current” or “upcoming”.

#### 4.1.4 List

* Attributes:

  * `id`
  * `name`
  * `type` (enum: GIFT, IDEA, WISHLIST)
  * `owner_user_id`
  * `target_person_id` (optional; null for general/shared lists)
  * `occasion_id` (optional)
  * `visibility`:

    * `all_users`
    * `owners_only`
    * `hidden_from_target_person` (for lists about them)
  * `notes`
* Capabilities:

  * Contain `ListItem`s.
  * Serve as main planning tool for a person/occasion.
  * Support filtering and sorting (status, tags, budget).

#### 4.1.5 Gift

* Attributes:

  * `id`
  * `title`
  * `description`
  * `image_url`
  * `approx_price`
  * `source` (manual, amazon, target, wirecutter, other)
  * `link_primary_url`
  * `created_by_user_id`
  * `created_at`, `updated_at`
* Capabilities:

  * Shared across multiple lists/people/occasions (canonical item).
  * Tagged with `Tag`s.
  * Linked to `DealLink`s (per vendor).
  * Have comments, notes, and “internal” notes that don’t show to other parties in future advanced sharing models.

#### 4.1.6 ListItem

* Attributes:

  * `id`
  * `list_id`
  * `gift_id`
  * `status` (enum: idea, shortlisted, buying, ordered, delivered, wrapped, gifted, dropped)
  * `assigned_buyer_user_id` (optional)
  * `quantity`
  * `planned_price` (budget expectation)
  * `actual_price`
  * `privacy` (visible_to_all, hidden_from_target, internal_note_only)
  * `notes`
* Capabilities:

  * Provide pipeline-like status tracking per gift per list.
  * Serve as locus for comments, assignments, and to-dos.

#### 4.1.7 Tag

* Attributes:

  * `id`
  * `name`
  * `type` (interest, occasion, mood, budget, custom)
  * `color` (optional, for UI chips)
* Capabilities:

  * Attach to Gifts, Persons, and potentially Lists.
  * Used for filtering and recommendations.

#### 4.1.8 Comment

* Attributes:

  * `id`
  * `parent_type` (gift, list, person, occasion, list_item)
  * `parent_id`
  * `author_user_id`
  * `body`
  * `created_at`
  * `resolved` (bool)
* Capabilities:

  * Support @mentions (`@Nick`, `@Jaden`).
  * Threaded display at UI level (optional for v1; at minimum, ordered comments).

#### 4.1.9 DealLink

* Attributes:

  * `id`
  * `gift_id`
  * `vendor` (Amazon, Target, etc.)
  * `url`
  * `current_price`
  * `currency`
  * `last_checked_at`
  * `is_best_current_deal` (bool)
* Capabilities:

  * Track multiple vendors for same Gift.
  * Allow price refresh and best-deal highlighting.
  * Provide data for “Deal Highlights” dashboard cards.

#### 4.1.10 Theme

* Attributes:

  * `id`
  * `name`
  * `design_tokens` (JSON: primary, accent, bg, border radius, icon set, etc.)
  * `applies_to` (global, occasion_type, specific_occasion_id, date_range)
* Capabilities:

  * Drive seasonal theming (Christmas, birthdays, fall, etc.).
  * Applied to entire app or per-occasion mode.

#### 4.1.11 Notification (Future-ready, may be partial in v1)

* Attributes:

  * `id`
  * `user_id`
  * `type` (comment, assignment, status_change, price_drop, reminder, etc.)
  * `payload` (JSON)
  * `read_at`
* Capabilities:

  * In-app notification center.
  * Optional email / push in future.

---

## 5. Feature Set by Theme (Target State)

### 5.1 Dashboard / Home

**Requirements:**

* At login, show **Home Dashboard**:

  * Featured Occasion (current or next major one).
  * Stats:

    * Number of people with at least one planned gift vs total.
    * Pipeline counts by status: idea → gifted.
    * Budget usage vs planned budgets (per occasion and global).
  * “People still needing gifts” cards (with count and urgency).
  * “Idea Inbox” panel: general ideas not yet assigned to person/occasion.
  * “Deal Highlights” panel: gifts with best deals or recent price changes.
  * “Recent Activity” feed: new gifts, status changes, comments.

* Support quick actions:

  * “Add Idea”, “Add Person”, “Add Occasion”, “Add List”.

### 5.2 People Management

**Requirements:**

* People list:

  * Cards with avatar, relationship, next occasion date(s), and quick interest tags.
* Person detail page:

  * Overview:

    * Interests (tag chips + text).
    * Sizes and constraints.
    * Upcoming occasions for this person.
  * Lists:

    * Linked lists for this person (wishlists, gift lists, etc.).
  * History:

    * Past gifts (by year, by occasion).
  * Notes:

    * Free-form notes about long-term preferences or changes.
  * Comments:

    * Internal discussion, e.g., “She’s into STEM kits this year”.

### 5.3 Occasions Management

**Requirements:**

* Occasions index:

  * Calendar/timeline with upcoming events.
  * Sorting by date, type, importance.
* Occasion detail:

  * Summary:

    * Name, date, scope, notes.
    * Budget overview (spent vs planned).
  * Participants:

    * People involved with quick stats (# gifts planned vs given).
  * Lists section:

    * All lists associated with the occasion, grouped/folded by person or type.
  * Progress view:

    * Visual indicator of pipeline per participant.
  * Moodboard:

    * Pinned images, links, and notes that represent the vibe (e.g., “cozy Nordic Christmas”).

### 5.4 Lists & Pipelines

**Requirements:**

* Lists index:

  * Filters: type (GIFT/IDEA/WISHLIST), person, occasion, owner, visibility.
* List detail:

  * Tabular or Kanban-style layout:

    * Columns by status (idea → gifted) or list grouped by status.
  * Inline editing of:

    * Status
    * Quantity
    * Assigned buyer
    * Planned price / actual price
  * Comments per list and per list item.
  * Summary stats:

    * Count by status.
    * Budget summary for that list.

### 5.5 Gifts & Catalog

**Requirements:**

* Gifts catalog view:

  * Search by name, tag, vendor.
  * Filters:

    * Tags, price range, status usage (how often used), vendor presence.
* Gift detail:

  * Core info: title, description, image, approx price.
  * Links & Deals:

    * Primary URL.
    * List of DealLinks, with best-deal indicator.
  * Usage:

    * Lists and people/occasions where this gift appears.
  * Tags:

    * Add/remove tags.
  * Comments:

    * Gift-level discussion.

### 5.6 “Family Table” / Board View

**Requirements:**

* Visual “board” mode to mirror the “family planning table” metaphor:

  * Horizontal lanes:

    * Option A: People (each lane per person).
    * Option B: Occasions or roles, selectable.
  * Cards:

    * Represent Gift ideas (from idea inbox or assigned lists).
  * Interactions:

    * Drag-and-drop cards between lanes to assign/associate gifts with people/occasions.
    * Context menus for status changes, assignments, and quick notes.
* Real-time collaboration:

  * Show presence indicators (who is on the board).
  * Live movement of cards by other users.

### 5.7 Capturing Ideas (Input Channels)

**Requirements:**

* In-app:

  * “Add Gift Idea” modal:

    * Title, optional URL, tags, approximate price, notes.
  * Ability to add idea to:

    * General “Idea Inbox”.
    * Specific person’s list.
    * Specific occasion list.

* URL-based:

  * Paste URL:

    * Backend attempts to fetch:

      * Page title
      * Image
      * Price (best-effort)
    * Suggest vendor and approximate price.
  * Support common sites: Amazon, Target, Wirecutter, major retailers (best-effort generic scraping).

* Future (not required for v1, target state spec):

  * Browser bookmarklet or iOS share sheet extension:

    * “Share to Family Gifting” → choose target person/occasion/list or Idea Inbox.
  * Email ingestion:

    * Forward or BCC a link to a connected address (e.g., `ideas@familygifting.local`) to auto-capture ideas.

### 5.8 Deals & Price Awareness

**Requirements (target state, may phase gradually):**

* DealLinks on Gift detail:

  * Track at least vendor URL and current_price.
* Background process:

  * Scheduled job to refresh prices for selected gifts.
* UI:

  * “Deal Highlights” card showing:

    * Top N gifts with significant price drops.
    * Notable deals for upcoming occasions.
* Optional notifications:

  * Notify assigned buyer/user when price drops below a threshold or a deal is ending.

### 5.9 Collaboration & Communication

**Requirements:**

* Comments:

  * On Person, Occasion, List, Gift, ListItem.
  * @mentions that highlight user and optionally notify.
  * Resolvable comments (checkbox/flag “resolved”).
* Assignment:

  * Assign `ListItem` to a buyer user.
  * Filter “My Assignments” across all lists.
* Activity feed:

  * At least on dashboard: high-level log of important events.

### 5.10 Theming & Seasons

**Requirements:**

* Theme application:

  * Global theme engine via design tokens.
  * For each theme:

    * Colors, accent, background pattern, iconography hints.
* Theme selection:

  * Automatic:

    * Based on date proximity to major Occasion(s) (e.g., Christmas in December).
  * Manual:

    * User can override theme from settings.
* UX:

  * Theming is tasteful and subtle:

    * E.g., Christmas theme might show soft red/green accent, subtle snowflake pattern, not overbearing.

### 5.11 Privacy & Visibility

**Requirements:**

* Ability to hide lists/items from:

  * The person who is the target (e.g., Jaden cannot see “Jaden’s surprise gifts” list).
* Visibility rules:

  * `all_users`, `owners_only`, `hidden_from_target_person`.
* Future expansion:

  * Per-guest scoped visibility (invite grandparents to see only kids’ lists, not partner gifts).

---

## 6. Non-Functional Requirements

### 6.1 Performance & Scalability

* App optimized for:

  * <10 active users for a single family instance (initially).
  * Smooth real-time updates with minimal latency.
* Backend must support:

  * WebSockets or equivalent real-time channel.
  * Reasonably fast response times (<300ms for typical endpoints on local network).

### 6.2 Reliability & Availability

* Self-hosting friendly:

  * Docker/Kubernetes-friendly deployment.
* Backup:

  * DB backup strategy recommended (daily snapshots).

### 6.3 Security & Privacy

* All traffic over HTTPS (TLS terminated at reverse proxy).
* Role-based access (admin vs standard vs future guest).
* No anonymous access; local accounts or OAuth (Sign in with Apple) for production.
* Sensitive config (API keys for scraping, etc.) stored in environment variables/secrets.

### 6.4 UX & Design

* Mobile-first layouts, with responsive design for desktop.
* Apple ecosystem alignment:

  * Safari optimizations.
  * PWA support: “Add to Home Screen” on iOS.
* Accessibility:

  * Basic accessibility (contrast, keyboard navigation, ARIA roles).

---

## 7. Technical Architecture (High-Level)

### 7.1 Proposed Stack

* **Frontend**

  * Next.js (React, TypeScript).
  * Styling: Tailwind + component library (Radix/shadcn or similar).
  * State: TanStack Query for server data; lightweight local store for UI state.
  * PWA support: manifest, offline caching for static assets.

* **Backend**

  * FastAPI or equivalent modern web framework.
  * Postgres database (relational, normalized).
  * Real-time: WebSockets endpoint for:

    * Entity changes (CRUD notifications).
    * Presence data (who’s on what page).
    * Board drag/drop events.

* **Integrations**

  * Generic HTTP scraper for URLs (serve as microservice or part of backend).
  * Optional integration for Apple Sign In in future phase.

---

## 8. Roadmap / Phasing

### 8.1 Phase 1 – Core Planning & Collaboration (MVP+)

* Entities: User, Person, Occasion, List, Gift, ListItem, Tag, Comment.
* Features:

  * Dashboard (basic stats, Idea Inbox, recent activity).
  * People management & detail pages.
  * Occasions management & detail pages.
  * Lists with pipeline statuses.
  * Gift catalog and detail.
  * Comments and assignments.
  * Basic theming (light vs dark + one seasonal theme).
  * URL-based gift creation (simple scraping).
  * Basic real-time updates for key changes.

### 8.2 Phase 2 – Moodboard & Board View

* “Family Table” board view with drag-and-drop between people/lanes.
* Moodboard section on occasion pages (images and links).
* Richer presence indicators.

### 8.3 Phase 3 – Deals & Price Awareness

* DealLinks with scheduled price refresh.
* Deal Highlights section on dashboard.
* Price-drop notifications in-app.

### 8.4 Phase 4 – Apple Ecosystem & Capture Enhancements

* PWA polishing for iOS and macOS.
* iOS Share Sheet integration or browser bookmarklet.
* Optional Sign in with Apple for auth.

### 8.5 Phase 5 – Extended Sharing & Guests

* Invite-based guest accounts with scoped access (e.g., grandparents).
* Per-guest visibility rules.
* “View-only” or “comment-only” modes.

### 8.6 Phase 6 – Intelligence & Recommendations (Stretch)

* Gift recommendations:

  * Based on person interests, tag similarity, gift history.
* Smart clustering:

  * Group similar gift ideas and suggest de-duplication.
* Budget intelligence:

  * Alerts if trending over budget.
  * “Coverage” analysis for each occasion (who is under/over gifted).

---

## 9. Success Metrics

* **Adoption & Engagement**

  * Number of active users (within family).
  * Number of active occasions per year.
  * Number of gifts captured and assigned per major holiday.

* **Usability & Work Reduction**

  * Reduction in “double gift” incidents vs pre-app.
  * Subjective: perception of reduced planning stress and confusion (self-reported).

* **Data Quality**

  * % of gifts with tags and at least one link.
  * % of people with completed interest + size info.

* **Feature Utilization**

  * Board view usage rate during major holiday planning.
  * Utilization of comments and assignments.

---

## 10. Risks & Open Questions

### 10.1 Risks

* **R1 – Scope Creep:**
  The domain encourages “Notion-level” complexity: need disciplined phasing.
* **R2 – Scraping Fragility:**
  Retailer sites change; scraping might break and will require ongoing tweaks.
* **R3 – UX Overload:**
  Too many views (lists, board, catalog) could confuse casual users if not coherent.
* **R4 – Privacy at Scale:**
  Future guest expansion requires careful visibility rules to avoid spoiling surprises.

### 10.2 Open Questions

* **OQ1 – Auth Strategy:**
  Start with local accounts, or build Apple Sign In from day one?
* **OQ2 – Guests vs Multi-Family:**
  Is the long-term vision single-family instance with guests, or eventual multi-tenant SaaS?
* **OQ3 – Notifications Channels:**
  In-app only vs email/push vs iOS-native notifications through PWA or app wrapper.
* **OQ4 – AI Integration Depth:**
  What level of AI involvement is desired long-term (simple suggestions vs deep planning assistant)?

---

## 11. Definition of “Done” for North Star Alignment

The product is considered aligned to its North Star when:

* Every person, occasion, gift, and list is trackable and interlinked in a way that feels intuitive.
* Partners can sit down (physically or virtually), open the dashboard, and reliably answer:

  * “Who do we still need to buy for?”
  * “What ideas do we have?”
  * “What did we get them before?”
  * “What are the best options to buy where we’ll save time and money?”
* Seasonal planning (especially Christmas) feels like using a calm, modern control center instead of juggling spreadsheets, notes apps, and browser tabs.
