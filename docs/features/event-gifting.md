---
title: Event gifting v1
status: implemented
---

# Event gifting

The dashboard opens to upcoming **dated occurrences**, with past and closed events
below. Create an occurrence from a new event or an existing recurring occasion.
The Calendar view button explains the deferred milestone; it does not implement a
timeline. Recurrence rules remain on the existing occasion, while each dated
occurrence has its own budget, recipient envelopes, and gift progress.

Open an event to add recipients and set their money allowance, gift count allowance,
or both. Blank means no cap; zero is a real zero allowance. Caps are guidance:
negative remaining values show an overage and do not block saving a gift. Attach
an existing person idea/wishlist item, or capture a new gift with the global +.
Each gift can be moved directly between **Considering**, **Bought**, **In hand**,
and **Given**, including backwards to correct mistakes or returns.

Considering contributes to planned totals but not spending or purchased counts.
The other three phases contribute `unit price × quantity` to spending and quantity
to purchased counts. Unknown prices are excluded from money totals and flagged as
incomplete. A zero price is known and included. Person allowances roll up through
occurrence and event to the selected calendar year. Allocated means the sum of set
recipient money allowances; an event budget is a separate cap. A year/event budget
is unknown if any constituent occurrence budget is unset.

The person page has collapsible wishlist, ideas, past gifts, events, and preference
sections. Ideas and wishlists use full cards; history uses compact rows. Given gifts
appear in history. The profile editor remains available from Preferences. Store
links open directly in another tab. The capture drawer saves once and opens Ideas,
so a saved thought can be found in one consistent place after capture. Wishlists
also remain on the selected person.

## API and storage

All `/api/v1/gifting` routes use the existing bearer authentication, DTOs, service,
and repository layers. They have no web-session or estate-shell dependency.

| Route | Behavior |
| --- | --- |
| `GET/POST /occurrences` | Read history or create one dated occurrence |
| `GET/PATCH /occurrences/{id}` | Read occurrence or close/reopen it |
| `PUT /occurrences/{id}/people/{person_id}` | Replace recipient money/count allowances; omitted caps clear |
| `POST /envelopes/{id}/gifts` | Attach a catalog gift with quantity and optional unit price |
| `PATCH /gifts/{placement_id}` | Change the occurrence-specific gift phase |
| `GET/POST /ideas` | Read visible ideas or capture a gift, optional person and occurrence |
| `GET /people/{id}` | Read person shelves and occurrence history |
| `GET /budgets?year=2026` | Roll up by recipient, occurrence, event, year |

An occurrence placement snapshots price and quantity. Later catalog price changes
do not change historical spending. An existing gift can be used in multiple
occurrences. Phases belong to placements; existing catalog/list status APIs retain
their legacy meanings and do not synchronize with placement phases. The new event
screens are the place to manage occurrence progress. Private legacy lists are
filtered by their owner in the new views too.

Migration `f3a1_event_occurrences` adds three tables. It copies each existing
occasion date and recipient money allowance, and backfills gifts from event-linked
lists with a known list recipient or gift recipient link. It maps idea/selected to
considering, purchased to bought, and received to in hand. It never infers given.
Duplicate catalog references per recipient are represented once at the furthest
phase, with provenance back to the source list item; all original rows, prices,
purchaser budgets, and statuses remain untouched. Lists without a known recipient
remain in the existing list interface. Downgrade removes the new feature tables
and their occurrence history; it leaves all legacy records intact.

## Verification

API coverage: `services/api/tests/integration/test_gifting_endpoints.py` and
`test_gifting_migration.py`. UI behavior coverage:
`apps/web/components/gifting/__tests__/gifting.test.tsx`.

For the real PostgreSQL auth regression, point `TEST_FRESH_POSTGRES_URL` at an empty,
disposable `postgresql+psycopg://…` database and run
`uv run --frozen pytest -q -s tests/integration/test_fresh_postgres_auth.py` from
`services/api`. It checks for an empty public schema, runs `alembic upgrade head`,
and exercises register/login/authenticated `/auth/me`. It is skipped in the default
SQLite suite; running it does not create tables through ORM metadata.
