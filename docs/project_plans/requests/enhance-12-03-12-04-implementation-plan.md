# Enhancements 12-03 & 12-04 - Implementation Plan

## Overview

Plan to deliver all items from `enhance-12-03.md` and `enhance-12-04.md`, covering occasion correctness/automation, dashboard visibility, richer gift data and linking, and people grouping/UI polish.

---

## Task Breakdown

### 1) Occasion correctness & automation
**Goal**: Fix date drift, add standard/recurring occasions, and auto-manage occasions from people data.

**Backend**
- [ ] Normalize occasion date handling (UTC-safe date serialization) to eliminate N-1 display; add regression test around a known date.
- [ ] Migrate `OccasionType` to `{holiday, recurring, other}`; map existing `birthday` → `recurring` with subtype metadata for backward compatibility.
- [ ] Add recurrence metadata (e.g., `recurrence_rule` with month/day or weekday-of-month, `is_active`, `next_occurrence` helper) and service logic to roll recurring dates forward each year after they pass.
- [ ] Add `anniversary` field to `Person`; create `person_occasions` (person ↔ occasion link) to auto-link generated occasions.
- [ ] Create standard holiday templates (Christmas, Hanukkah, Easter, Valentine’s Day, etc.) and seed them on new dashboard/user creation; include guard to avoid duplicates per year.
- [ ] Add hooks in person create/update/delete to create/update/remove recurring birthday/anniversary occasions and keep links in sync.
- [ ] Expand occasion APIs/services to support recurrence fields, person linkage, and listing/filtering with `next_occurrence` for 90 days windows.

**Frontend**
- [ ] Update occasion types/enums and forms (add/edit modal, dashboard create flows) to use Holiday/Recurring/Other and capture recurrence details.
- [ ] Ensure date formatting uses local-safe parsing to avoid off-by-one; add unit coverage for `formatDate`/helpers.
- [ ] Surface person linkage and recurrence info in Occasion detail modal and creation flows.
- [ ] Adjust occasion list views to show `next_occurrence` and recurrence badge.

### 2) Dashboard occasion visibility (Home)
**Goal**: Show only occasions in next 3 months, make the next-up occasion interactive, and adjust CTA copy.

**Backend**
- [ ] Update dashboard service to source primary occasion from upcoming-within-90-days; if none, fall back gracefully.
- [ ] Expose an occasion list endpoint/filter for `within_days=90` to reuse on dashboard carousels.

**Frontend**
- [ ] Make primary occasion region/button open the Occasion modal directly.
- [ ] Rename dashboard CTA to “View All Occasions” and route to the full occasions list.
- [ ] Limit dashboard occasion carousels/widgets to 3-month data and show empty state when none exist.

### 3) Gift detail completeness & new fields
**Goal**: Overview tab shows all gift details; creation/edit supports new attributes and multiple URLs.

**Backend**
- [ ] Extend Gift model/schema with: description, notes, priority enum (low/medium/high), quantity (int), sale_price, purchase_date, additional_urls (array), and stores (new `Store` model + gift_stores join).
- [ ] Allow inline store creation via stores API; validate store IDs on gift create/update.
- [ ] Persist priority/quantity defaults and normalize prices; ensure extra_data remains backward compatible.
- [ ] Update gift serializers to return all new fields; add migration to backfill defaults.

**Frontend**
- [ ] Update gift types/hooks/forms to include new fields; add store multi-select with inline add, priority selector, quantity/price inputs, purchase date picker, notes/description text areas, and URL “+” adder.
- [ ] Render all non-linked fields on Gift modal Overview (including stores, purchase date, prices, priority, quantities, notes/description, URLs).
- [ ] Ensure list/detail pages consume the enriched payload without breaking existing status/tag displays.

### 4) Gift ↔ People linking
**Goal**: Gifts can be linked to people during create/edit and via Linked Entities tab.

**Backend**
- [ ] Introduce `gift_people` join table and relationships; expose people on gift responses.
- [ ] Add API endpoints/mutations to attach/detach people (batch-friendly) and filter gifts by linked people.
- [ ] Enforce cascading cleanup on person/gift delete; add integrity tests.

**Frontend**
- [ ] Add people multi-select to gift create/edit flows with inline person add entry.
- [ ] Update Gift modal Linked Entities tab to list linked people and support add/remove (reuse existing tab UX patterns).
- [ ] Reflect people links in hooks/caches so dashboards/filters can target gifts by person.

### 5) People layout polish & group taxonomy
**Goal**: Consistent card sizing on /people and flexible grouping/filtering.

**Backend**
- [ ] Create `Group` model with `person_groups` join; CRUD endpoints and list with member counts.
- [ ] Extend person schemas to accept `group_ids` and filter persons by groups on list endpoint.
- [ ] Backfill default group assignments from existing relationship heuristics (household/family/friends) to avoid empty UI.

**Frontend**
- [ ] Normalize PersonCard dimensions (fixed min/max height, consistent padding, truncation rules) and ensure grid alignment on /people.
- [ ] Add group multi-select to Add/Edit Person modal; show groups in Person detail modal.
- [ ] Add group filters to /people page (chips/dropdown) and wire to API filter; show group cards section with counts and click-to-filter behavior.
- [ ] Add UI to create groups inline from /people page and modals.

---

## Implementation Order
1) Occasion enum/date fix + recurrence data model (unblocks seeds and dashboard).  
2) Person anniversary + auto-generated occasions/hooks.  
3) Dashboard 3-month scope and CTA/modal interactivity.  
4) Gift model expansion (new fields + stores) then frontend form/modal updates.  
5) Gift↔people linking backend then Linked Entities/frontend wiring.  
6) People groups backend, then /people UI updates/card sizing polish.  
7) Regression/UX pass and docs.

## Files to Create
```
services/api/app/alembic/versions/*_occasion_recurrence.py
services/api/app/alembic/versions/*_person_anniversary.py
services/api/app/alembic/versions/*_gift_fields_and_store_links.py
services/api/app/alembic/versions/*_gift_people_link.py
services/api/app/alembic/versions/*_groups.py
services/api/app/models/store.py
services/api/app/models/gift_person.py
services/api/app/models/group.py
services/api/app/models/person_group.py
services/api/app/api/stores.py
services/api/app/api/groups.py
services/api/app/api/gift_people.py (or routes under gifts)
services/api/app/services/store.py
services/api/app/services/group.py
services/api/app/services/gift_people.py
```

## Files to Modify (non-exhaustive)
```
services/api/app/models/occasion.py
services/api/app/repositories/occasion.py
services/api/app/services/occasion.py
services/api/app/api/occasions.py
services/api/app/services/dashboard.py
services/api/app/models/gift.py
services/api/app/schemas/gift.py
services/api/app/services/gift.py
services/api/app/api/gifts.py
services/api/app/models/person.py
services/api/app/schemas/person.py
services/api/app/services/person.py
services/api/app/api/persons.py
apps/web/types/index.ts
apps/web/hooks/useOccasions.ts
apps/web/hooks/useGifts.ts
apps/web/hooks/usePersons.ts
apps/web/hooks/useGroups.ts (new) and related API client
apps/web/lib/api/endpoints.ts
apps/web/components/modals/OccasionDetailModal.tsx
apps/web/components/occasions/AddOccasionModal.tsx
apps/web/components/dashboard/DashboardHeader.tsx
apps/web/components/dashboard/StatsCards.tsx
apps/web/components/modals/GiftDetailModal.tsx
apps/web/components/gifts/GiftForm.tsx (and /gifts/[id]/edit page)
apps/web/components/modals/LinkGiftToListsModal / LinkedEntities tabs
apps/web/app/people/page.tsx
apps/web/components/people/PersonCard.tsx
apps/web/components/people/AddPersonModal.tsx
apps/web/components/people/PersonDetailModal.tsx
```

## Acceptance Notes
- Occasion dates display exactly as stored across timezones; recurring holidays/birthdays regenerate yearly without duplicates; deleting a person removes their generated occasions.
- Dashboard shows only next-90-days occasions; primary occasion opens modal; CTA reads “View All Occasions”.
- Gift modal overview surfaces every non-linked attribute; new gift fields persist end-to-end; multiple URLs and stores supported.
- Gifts can link to multiple people; Linked Entities tab manages people; filters can target gifts by person.
- /people cards align consistently; groups are creatable, visible, filterable, and reflected across person forms and detail modal.
