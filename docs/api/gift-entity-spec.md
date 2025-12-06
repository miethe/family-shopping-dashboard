---
title: Gift Entity Specification
description: Contract for Gift fields and supporting flows (linking, additional URLs, uploads, mark-as-purchased).
audience: [backend, frontend, qa, docs]
tags: [api, gift, media, links]
created: 2025-12-06
updated: 2025-12-06
---

# Gift Entity Specification

## Core Fields
| Field | Type | Notes |
|-------|------|-------|
| `id` | int | Server generated |
| `name` | string (1-255) | Required |
| `url` | string? | Primary product URL (optional) |
| `price` | number? | MSRP |
| `sale_price` | number? | Discounted/paid price |
| `description` | string? | Long-form copy |
| `notes` | string? | Internal-only |
| `priority` | enum `low|medium|high` | Defaults to `medium` |
| `quantity` | int >=1 | Needed quantity |
| `purchase_date` | date? | Set when purchased |
| `image_url` | string? | Stored upload URL or remote URL |
| `additional_urls` | `{label:string,url:string}[]` | Validated http/https, unique labels per client |
| `stores` | `StoreMinimal[]` | Linked stores (id, name, url?) |
| `person_ids` | int[] | Linked recipients via `gift_people` |
| `extra_data.status` | string? | Used for UI status pills (`purchased/partial`) |
| `extra_data.quantity_purchased` | int? | Captured by mark-as-purchased |

## Linking (Gift ↔ Person)
- **Attach**: `POST /api/v1/gifts/{id}/people` body `{ person_ids: number[] }` → returns updated `person_ids`.
- **Detach**: `DELETE /api/v1/gifts/{id}/people/{personId}` → returns updated `person_ids` (404 on missing link).
- **Patch support**: `PATCH /api/v1/gifts/{id}` accepts `person_ids` (replaces all links) and returns full `GiftResponse`.

## Additional URLs
- Shape: `{ label: string (1-120), url: http/https }`.
- Validation errors surfaced on create/update; legacy string arrays are normalized server-side to `[{label:"Link", url:value}]`.
- Stored in `gifts.additional_urls` (JSON) and emitted on `GiftResponse.additional_urls`.

## Image Upload / URL Ingestion
- Endpoint: `POST /api/v1/upload/image`
  - Multipart `file` (JPEG/PNG/GIF/WebP/HEIF/HEIC, <=10MB) **or** `url` form field (http/https).
  - Returns `{ image_url, filename? }`; uploaded files are served at `/uploads/{filename}` (or `CDN_BASE_URL/uploads/{filename}` when configured).
- Config helper: `GET /api/v1/upload/image/config` → `{ max_mb, allowed_content_types }`.
- Clients may continue to send `image_url` strings directly on gift/person/user payloads; upload endpoint is preferred for paste/drag-and-drop.

## Mark as Purchased
- Endpoint: `POST /api/v1/gifts/{id}/mark-purchased`
  - Body: `{ quantity_purchased: int>=1, status?: "purchased"|"partial", purchase_date?: date, sale_price?: number }`.
  - Behavior: sets `purchase_date` (default today), updates `extra_data.status` (derived from quantity vs `quantity` if not provided), and stores `extra_data.quantity_purchased`; optional `sale_price` persisted.
  - Returns updated `GiftResponse`.

## From URL (Add Gift flow)
- Manual create is the default. URL import remains available but UI should gray the “From URL” option with tooltip “Coming Soon”; backend continues to support `/gifts/from-url` for future enablement.

## Response Example (compressed)
```json
{
  "id": 12,
  "name": "Lego Falcon",
  "url": "https://example.com/falcon",
  "price": 199.99,
  "sale_price": 149.99,
  "description": "Ultimate Collector Series",
  "quantity": 1,
  "purchase_date": "2025-12-06",
  "image_url": "/uploads/abc123.jpg",
  "additional_urls": [
    { "label": "Reviews", "url": "https://example.com/reviews" },
    { "label": "Store Page", "url": "https://example.com/store" }
  ],
  "stores": [{ "id": 3, "name": "Amazon", "url": "https://amazon.com" }],
  "person_ids": [5, 8],
  "extra_data": { "status": "purchased", "quantity_purchased": 1 },
  "created_at": "2025-12-01T12:00:00Z",
  "updated_at": "2025-12-06T09:00:00Z"
}
```
