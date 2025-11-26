# Family Gifting Dashboard – V1 Product Requirements Document (PRD)

---

## 1. Overview

**Product:** Family Gifting Dashboard
**Version:** V1 (MVP+)
**Audience:** You and your spouse (plus potentially 1–2 more core family users)
**Deployment:** Self-hosted web app (homelab), responsive for desktop and mobile

**V1 Vision:**
Deliver a reliable, pleasant, and collaborative “gift planning control center” for upcoming occasions (especially Christmas) with:

* Centralized information about people, occasions, lists, and gifts
* Simple, reliable collaboration between two users
* Fast capture of ideas and basic URL-based item creation
* A tasteful, slightly seasonal UI that still feels modern and minimal

This is the first shippable version, built to be actually used for real holiday planning. All future features should layer on top without major refactors.

---

## 2. Goals & Non-Goals (V1)

### 2.1 Goals

* **G1 – Single Source of Truth:**
  All gift planning data (people, occasions, lists, gifts) lives here, not spread across notes/spreadsheets.

* **G2 – Practical Christmas-Ready Workflow:**
  Enable you and your spouse to plan at least one major holiday (e.g., Christmas) and a few birthdays entirely within the app.

* **G3 – Low-Friction Capture:**
  Capture gift ideas quickly from within the app and via pasted URLs.

* **G4 – Clear Coordination:**
  See who is responsible for which gifts, and current status (idea → purchased → gifted).

* **G5 – Solid Foundations:**
  Implement a clean domain model, API, and front end that can support later phases (board view, deals, guests) without rewrites.

### 2.2 Non-Goals (For V1)

* No board/moodboard/“family table” drag-and-drop UI (planned for later).
* No external guest accounts or multi-family SaaS.
* No advanced deal tracking (only static links + optional approximate prices).
* No browser extensions or mobile share sheet integrations (manual URL paste only).
* No email/SMS/push notifications (basic activity display only).

---

## 3. Target Users & Core Use Cases (V1)

### 3.1 Users

* **Primary User 1:** You (Family Planner, Admin)
* **Primary User 2:** Spouse (Co-planner)
* Possibly future additional core family members, but V1 UX optimized for 2–3 frequent users.

### 3.2 Core Use Cases for V1

**UC1 – Capture a new idea quickly**

* I see a potential gift online or think of an idea.
* I open the app (desktop or mobile), hit “Add Gift Idea”.
* I optionally paste a URL and the app pulls basic details.
* I save it to the general Idea Inbox or a specific person/occasion list.

**UC2 – Plan Christmas gifts for each person**

* I create or open the “Christmas 2025” occasion.
* I ensure all relevant family members exist as People.
* For each person, I open their lists for Christmas and add/curate Gift items.
* I track status (idea, shortlisted, buying, ordered, delivered, gifted).
* I assign certain gifts to myself or my spouse as buyer.

**UC3 – Coordinate without double-buying**

* I can see lists and status updates in real time.
* I see which gifts are assigned to me vs my spouse.
* We can leave comments on specific gifts/lists/persons to discuss.
* I can filter “Assigned to me” gifts to know my tasks.

**UC4 – Quickly see planning progress**

* From the dashboard, I see how many people have at least one planned gift.
* I see pipeline counts (Idea vs Purchased vs Gifted) for the main upcoming occasion.
* I see recent changes my spouse made.

**UC5 – Track basic gift history**

* For a person, I can see which gifts we gave them in previous occasions (within data lifetime of the app).

---

## 4. Scope – Functional Requirements (V1)

### 4.1 Entities (V1 Implementation)

V1 must implement these entities and relationships in the backend and expose them via API.

#### 4.1.1 User

* Core fields:

  * `id`, `name`, `email`, `avatar_url`, `is_admin`, password-based auth
* V1 behaviors:

  * Register (admin creates second user via UI or direct DB seeding OK).
  * Login/logout.
  * Update profile (name, avatar link).

#### 4.1.2 Person

* Core fields:

  * `id`, `display_name`, `relationship`, optional `birthdate`, `notes`, `interests` (text), `sizes` (JSON), `constraints`, `photo_url`
* V1 behaviors:

  * CRUD: create/edit/archive Person.
  * Display on People index with key details.
  * Link to:

    * Lists where Person is `target_person`.
    * Occasions where Person is in scope (via lists/gifts).
  * Show simple gift history: previous ListItems (gifted status) involving this Person.

#### 4.1.3 Occasion

* Core fields:

  * `id`, `name`, `type` (Christmas, Birthday, Anniversary, Other), `date`, optional `budget_total`, `notes`
* V1 behaviors:

  * CRUD for Occasions.
  * Occasions index: ordered by date, highlight upcoming.
  * Occasion detail:

    * Summary & notes.
    * List of People with linked lists for this occasion.
    * Lists section (all lists with `occasion_id`).

#### 4.1.4 List

* Core fields:

  * `id`, `name`, `type` (GIFT, IDEA, WISHLIST), `owner_user_id`, `target_person_id?`, `occasion_id?`, `visibility` (at minimum: `all_users`, `hidden_from_target_person`), `notes`
* V1 behaviors:

  * CRUD for Lists.
  * Lists index with filters: by `type`, `occasion`, `target_person`.
  * List detail:

    * Show ListItems in a grouped-by-status view.
    * Show summary counts by status.

#### 4.1.5 Gift

* Core fields:

  * `id`, `title`, `description`, `image_url`, `approx_price`, `source`, `link_primary_url`, `created_by_user_id`
* V1 behaviors:

  * Create Gift:

    * From scratch (form).
    * From URL (backend attempts to fetch title/image; price optional).
  * Edit Gift metadata.
  * Gift catalog:

    * Search by text, filter by tags.
  * Show where the gift is used (lists and persons via ListItems).

#### 4.1.6 ListItem

* Core fields:

  * `id`, `list_id`, `gift_id`, `status` (idea, shortlisted, buying, ordered, delivered, wrapped, gifted), `assigned_buyer_user_id?`, `quantity`, `planned_price`, `actual_price`, `notes`
* V1 behaviors:

  * Add Gift to List as ListItem.
  * Change status via dropdown or inline controls.
  * Assign to a user.
  * Edit prices and notes.
  * List-level summary of counts (per status) and simple budget (sum of planned or actual).

#### 4.1.7 Tag

* Core fields:

  * `id`, `name`, `type` (interest, occasion, mood, budget, custom), optional `color`
* V1 behaviors:

  * CRUD tags.
  * Attach tags to Gifts and Persons.
  * Filter Gifts and People by tags.

#### 4.1.8 Comment

* Core fields:

  * `id`, `parent_type` (person, occasion, list, gift, list_item), `parent_id`, `author_user_id`, `body`, `created_at`, `resolved`
* V1 behaviors:

  * Add/view comments on:

    * Person, Occasion, List, Gift, ListItem.
  * Simple display (chronological).
  * Mark `resolved = true`.
  * @mentions can be simple text (no special highlighting required in V1, but desirable if cheap).

> **Not included in V1:** DealLink, Theme entity as separate models. Theming in V1 is implemented as config-level design tokens, not dynamic DB objects.

---

### 4.2 Key Features & Flows

#### 4.2.1 Dashboard (V1)

**Must-have:**

* Show **primary upcoming Occasion** (soonest upcoming with at least one linked list).
* For that Occasion:

  * Count of People with at least one ListItem vs total.
  * Pipeline summary:

    * Number of ListItems in each status for that occasion.
* “People needing gifts” section:

  * People with zero or few non-dropped ListItems for that occasion.
* “Idea Inbox”:

  * General List(s) of type IDEA without `target_person_id` or `occasion_id`.
  * Show top N ideas.
* “Recent Activity” feed:

  * Last ~10 events (new gifts, status changes, new comments).

#### 4.2.2 People Management

**Must-have:**

* People index:

  * Card/list layout with:

    * Display name
    * Relationship
    * Next upcoming occasion involving them (if any)
    * Quick interest tags
* Person detail:

  * Overview: interests, constraints, sizes, notes.
  * Section: “Upcoming Occasions involving this person”.
  * Section: “Lists for this person”.
  * Section: “Past Gifts” (list of gifted ListItems by occasion + year).
  * Comments panel.

#### 4.2.3 Occasions Management

**Must-have:**

* Occasions index:

  * List or calendar view showing name, date, and type.
  * Visual marker for “primary upcoming” occasion.
* Occasion detail:

  * Summary (name, type, date, notes, optional budget).
  * People card section:

    * For each relevant person (with at least one list for this occasion):

      * # of ListItems by status.
  * Lists section:

    * All lists for this occasion (with target person and owner indicated).
  * Comments panel for global occasion discussion.

#### 4.2.4 List & Pipeline View

**Must-have:**

* Lists index:

  * Filter by:

    * List type (GIFT / IDEA / WISHLIST)
    * Occasion
    * Target person
* List detail:

  * Layout:

    * Table or simple grouped-by-status sections (e.g., headings: Idea, Shortlisted, Buying, Ordered, Delivered, Wrapped, Gifted).
  * For each ListItem row:

    * Gift title (clickable).
    * Status selector.
    * Assigned buyer.
    * Planned/actual price.
    * Notes icon/preview.
  * List summary:

    * Count per status.
    * Budget summary (sum of planned vs actual price).
  * Comments for the list as a whole.

#### 4.2.5 Gift Catalog & Detail

**Must-have:**

* Gift catalog:

  * Search by name/description.
  * Filter by:

    * Tag(s).
  * Sort by:

    * Recent creation.
* Gift creation:

  * **Form-based:** Title (required), description, approx price, tags, primary URL, image URL (optional).
  * **URL-based:**

    * Paste URL → backend tries to fetch:

      * Title
      * Image
      * Approx price (best-effort)
    * User reviews and edits before saving.
* Gift detail:

  * Main fields plus:

    * Which Lists / Persons / Occasions use this Gift (ListItems summary).
  * Comments.

#### 4.2.6 Capturing Ideas

**Must-have:**

* Quick “Add Idea” button visible from multiple contexts (e.g., dashboard header).
* Ability to save idea to:

  * General Idea Inbox (List of type IDEA; no target_person or occasion).
  * Existing List (select from dropdown).
* URL-based idea creation as above.

#### 4.2.7 Collaboration & Coordination

**Must-have:**

* Real-time updates for:

  * Status changes on ListItems.
  * New comments.
  * New gifts/list items created.
* Basic presence:

  * Optionally show “User X is viewing this list” (if easy).
* Assignment:

  * For each ListItem, assign to a User.
  * “My Assignments” filter:

    * View across lists/occasions listing all ListItems assigned to me.

---

## 5. Non-Functional Requirements (V1)

### 5.1 Performance

* Responsive experience within a home network environment.
* Most list/detail views should load in <300ms (excluding network overhead outside homelab).

### 5.2 Reliability

* Designed for low user count (2–3 concurrent users), but stable.
* Changes must not be lost on conflict:

  * Last-write-wins acceptable, but show “Updated just now by Nick/Jaden” to reduce confusion.

### 5.3 Security

* Password-based authentication with hashed passwords.
* Enforce HTTPS via reverse proxy.
* No open registration (admin adds users).

### 5.4 UX/Design

* Mobile-friendly; must be usable on iPhone in Safari.
* Basic PWA manifest and icons (add to home screen) if feasible, but not required for V1 launch.
* Clean, modern UI with a **simple seasonal accent** (e.g., Christmas theme enabled via static design tokens):

  * Light overall theme with minimal color palette.
  * No noisy patterns; subtle hints only.

---

## 6. Architecture & Implementation Constraints (V1)

### 6.1 Frontend

* Next.js (React, TypeScript) with app router.
* Tailwind + small component library (Radix/shadcn) for consistency.
* Data fetching via REST or tRPC from backend.
* Realtime: WebSocket client to subscribe to event streams (or minimal SSE if simpler).

### 6.2 Backend

* FastAPI or equivalent (Python) with typed models.
* Persistence: Postgres.
* Expose CRUD endpoints for all V1 entities.
* Real-time pub/sub:

  * On certain events (ListItem update, comment added), backend pushes events over WebSocket channel scoped to entity or user.

### 6.3 Deployability

* Docker-based deployment stack for app + DB.
* Suitable for K8s/OpenShift or docker-compose in homelab.
* Single environment (prod) is sufficient for V1, but codebase should not preclude dev/stage later.

---

## 7. Out-of-Scope (Explicitly Deferred)

* Board-style “Family Table” drag-and-drop UI.
* Moodboards with images tied to occasions.
* DealLink model, periodic price refresh, and deal highlighting.
* Guest users with scoped visibility and advanced visibility rules beyond `hidden_from_target_person`.
* Email/push notifications, or integration with external messaging services.
* Browser extensions/iOS share sheet for direct capture.
* AI recommendations or predictive features.

---

## 8. Success Criteria (V1)

**Qualitative:**

* You and your spouse are able to plan Christmas (and at least one other occasion) entirely in the app without needing spreadsheets/Notes for core tracking.
* You feel confident at a glance about:

  * Who has enough gift coverage.
  * Which gifts you personally need to purchase.

**Quantitative (internal/self-measured):**

* At least:

  * 10+ People records created.
  * 5+ Occasions tracked.
  * 50+ Gifts stored.
  * 100+ ListItems created over the first main season.
* “Zero double-buy” incidents for any person where the app was used as the primary planner.

---

## 9. Risks & Mitigations (V1)

* **R1: UI/Scope Overload** – Trying to add board view or deals in V1.

  * *Mitigation:* Keep V1 focused strictly on CRUD + simple dashboards + basic realtime.

* **R2: Scraping Fragility** – URL parsing fails often.

  * *Mitigation:* Treat scraping as “nice-to-have autopopulate”; always allow manual override; failure is not fatal.

* **R3: Time-to-Ship** – Perfectionist tendencies leading to polish over shipping before the next major holiday.

  * *Mitigation:* Hold to V1 scope; treat anything not defined here as strictly V2+.

* **R4: Data Model Drift vs North Star PRD** – V1 schema deviates from North Star and causes migration pain later.

  * *Mitigation:* Implement V1 entities in a way that is compatible with the North Star PRD: same core tables, leaving room to add `DealLink` and `Theme` later without schema revolutions.

---

## 10. Definition of Done (V1)

V1 is considered complete when:

1. All V1 entities and relationships are implemented and stable.
2. The workflows in Use Cases UC1–UC5 can be executed entirely in the app without manual workarounds.
3. Real-time updates for basic collaboration (status changes, comments, new items) work reliably between two logged-in users.
4. The app is deployed in your homelab, accessible securely from your household devices, and actively used for at least one real-world occasion planning cycle.
