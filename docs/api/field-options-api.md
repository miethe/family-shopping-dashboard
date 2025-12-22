---
title: Field Options API Reference
description: Admin API for managing dynamic dropdown field options across entities (person, gift, occasion, list).
audience: [backend, frontend, qa, docs]
tags: [api, field-options, admin, dropdown]
created: 2025-12-22
updated: 2025-12-22
---

# Field Options API Reference

## Overview

The Field Options API manages **admin-configurable dropdown/select values** used throughout the Family Gifting Dashboard. Field options enable dynamic, user-managed configuration of dropdown fields across multiple entities without code changes.

**Use Cases:**
- Person preferences: wine types, tea styles, dietary restrictions, hobbies, travel styles
- Gift management: priority levels, status values
- Occasion types: celebrations, holidays, milestones
- List types: wish lists, registry types

## Base URL

```
/api/v1/field-options
```

## Authentication

All endpoints require **Bearer token** authentication via JWT in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Without valid authentication, all endpoints return **401 Unauthorized**.

## Valid Entities and Fields

Field options are only valid for specific entity/field combinations:

### Person Entity
Valid fields (25+ preference categories):
- `wine_types` - Wine preferences
- `beverage_prefs` - General beverages
- `coffee_style` - Coffee preferences
- `tea_style` - Tea preferences
- `spirits` - Liquor preferences
- `dietary` - Dietary restrictions/preferences
- `favorite_cuisines` - Food cuisines
- `sweet_vs_savory` - Sweet vs savory preference
- `preferred_metals` - Metal preferences for jewelry
- `fragrance_notes` - Fragrance preferences
- `accessory_prefs` - Accessory preferences
- `hobbies` - Hobbies
- `creative_outlets` - Creative interests
- `sports_played` - Sports activities
- `reading_genres` - Book genres
- `music_genres` - Music genres
- `tech_ecosystem` - Apple/Android/PC ecosystem
- `gaming_platforms` - Gaming platforms
- `smart_home` - Smart home preferences
- `travel_styles` - Travel styles
- `experience_types` - Experience preferences
- `event_preferences` - Event type preferences
- `collects` - Collections/collecting interests
- `avoid_categories` - Categories to avoid as gifts
- `budget_comfort` - Budget comfort levels

### Gift Entity
Valid fields:
- `priority` - Gift priority levels (e.g., low, medium, high)
- `status` - Gift status values (e.g., purchased, partial)

### Occasion Entity
Valid fields:
- `type` - Occasion types (e.g., birthday, holiday, anniversary)

### List Entity
Valid fields:
- `type` - List types (e.g., wish list, registry)
- `visibility` - List visibility settings (e.g., private, shared)

**Attempting to create options for invalid entity/field combinations returns 422 Validation Error.**

---

## Endpoints

### List Options

Get a paginated list of field options for a specific entity/field combination.

#### Request

```http
GET /api/v1/field-options?entity=person&field_name=wine_types&limit=50
Authorization: Bearer <token>
```

#### Query Parameters

| Parameter | Type | Required | Default | Constraints | Description |
|-----------|------|----------|---------|-------------|-------------|
| `entity` | string | Yes | — | Must be one of: person, gift, occasion, list | Entity type |
| `field_name` | string | Yes | — | Valid for the entity | Field name within entity |
| `include_inactive` | boolean | No | false | — | Include soft-deleted options |
| `skip` | integer | No | 0 | >= 0 | Pagination offset |
| `limit` | integer | No | 100 | 1-1000 | Maximum records to return |

#### Response (200 OK)

```json
{
  "items": [
    {
      "id": 1,
      "entity": "person",
      "field_name": "wine_types",
      "value": "red_wine",
      "display_label": "Red Wine",
      "display_order": 1,
      "is_system": false,
      "is_active": true,
      "created_by": 5,
      "updated_by": null,
      "usage_count": 3,
      "created_at": "2025-12-21T12:00:00Z",
      "updated_at": "2025-12-21T12:00:00Z"
    },
    {
      "id": 2,
      "entity": "person",
      "field_name": "wine_types",
      "value": "white_wine",
      "display_label": "White Wine",
      "display_order": 2,
      "is_system": false,
      "is_active": true,
      "created_by": 5,
      "updated_by": null,
      "usage_count": 2,
      "created_at": "2025-12-21T12:00:00Z",
      "updated_at": "2025-12-21T12:00:00Z"
    }
  ],
  "total": 2,
  "has_more": false,
  "next_cursor": null
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `items` | array | List of field option objects |
| `total` | integer | Total count of options (not affected by pagination) |
| `has_more` | boolean | Whether more results exist beyond this page |
| `next_cursor` | integer \| null | ID of last item for cursor-based pagination |

#### Error Responses

**422 Validation Error** - Invalid entity or field_name:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Entity must be one of ['gift', 'list', 'occasion', 'person'], got 'invalid'",
    "trace_id": "abc123def456"
  }
}
```

**401 Unauthorized** - Missing or invalid token:
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired authentication token",
    "trace_id": "abc123def456"
  }
}
```

#### Examples

**Get all wine type options:**
```bash
curl -X GET "http://localhost:8000/api/v1/field-options?entity=person&field_name=wine_types" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get gift priority options with pagination:**
```bash
curl -X GET "http://localhost:8000/api/v1/field-options?entity=gift&field_name=priority&skip=0&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Include soft-deleted options:**
```bash
curl -X GET "http://localhost:8000/api/v1/field-options?entity=person&field_name=wine_types&include_inactive=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Create Option

Create a new field option for an entity/field combination.

#### Request

```http
POST /api/v1/field-options
Authorization: Bearer <token>
Content-Type: application/json

{
  "entity": "person",
  "field_name": "wine_types",
  "value": "sparkling_wine",
  "display_label": "Sparkling Wine",
  "display_order": 3
}
```

#### Request Body

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `entity` | string | Yes | Must be valid entity (person, gift, occasion, list) | Entity type |
| `field_name` | string | Yes | Must be valid field for entity | Field name |
| `value` | string | Yes | 1-255 chars, normalized to snake_case | Option value/key (immutable, unique per field) |
| `display_label` | string | Yes | 1-255 chars | Human-readable label for UI display |
| `display_order` | integer | No | >= 0, default 0 | Sort order (lower numbers display first) |

#### Response (201 Created)

```json
{
  "id": 3,
  "entity": "person",
  "field_name": "wine_types",
  "value": "sparkling_wine",
  "display_label": "Sparkling Wine",
  "display_order": 3,
  "is_system": false,
  "is_active": true,
  "created_by": 5,
  "updated_by": null,
  "usage_count": 0,
  "created_at": "2025-12-22T10:30:00Z",
  "updated_at": "2025-12-22T10:30:00Z"
}
```

#### Error Responses

**422 Validation Error** - Invalid entity/field or missing required field:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field 'invalid_field' is not valid for entity 'person'",
    "trace_id": "abc123def456",
    "details": {
      "entity": "person",
      "field_name": "invalid_field",
      "valid_fields": ["wine_types", "beverage_prefs", "coffee_style", ...]
    }
  }
}
```

**400 Bad Request** - Duplicate value for entity/field:
```json
{
  "error": {
    "code": "DUPLICATE_VALUE",
    "message": "Option with value 'sparkling_wine' already exists for person.wine_types",
    "trace_id": "abc123def456"
  }
}
```

**401 Unauthorized** - Missing or invalid token

#### Notes

- **value field is immutable** after creation to prevent breaking references from other entities
- **display_label can have duplicates** - multiple options can share the same label
- **display_order determines dropdown order** - lower numbers appear first
- **is_active defaults to true** - new options are immediately active
- **is_system defaults to false** - user-created options are not system options

#### Examples

**Create a wine type:**
```bash
curl -X POST "http://localhost:8000/api/v1/field-options" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entity": "person",
    "field_name": "wine_types",
    "value": "sparkling_wine",
    "display_label": "Sparkling Wine",
    "display_order": 3
  }'
```

**Create a gift priority level:**
```bash
curl -X POST "http://localhost:8000/api/v1/field-options" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entity": "gift",
    "field_name": "priority",
    "value": "critical",
    "display_label": "Critical/Must Have",
    "display_order": 0
  }'
```

---

### Get Option by ID

Retrieve a single field option by its ID.

#### Request

```http
GET /api/v1/field-options/3
Authorization: Bearer <token>
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `option_id` | integer | Yes | Field option ID |

#### Response (200 OK)

```json
{
  "id": 3,
  "entity": "person",
  "field_name": "wine_types",
  "value": "sparkling_wine",
  "display_label": "Sparkling Wine",
  "display_order": 3,
  "is_system": false,
  "is_active": true,
  "created_by": 5,
  "updated_by": null,
  "usage_count": 0,
  "created_at": "2025-12-22T10:30:00Z",
  "updated_at": "2025-12-22T10:30:00Z"
}
```

#### Error Responses

**404 Not Found** - Option does not exist:
```json
{
  "error": {
    "code": "FIELD_OPTION_NOT_FOUND",
    "message": "Field option with ID 3 not found",
    "trace_id": "abc123def456",
    "details": {
      "option_id": 3
    }
  }
}
```

**401 Unauthorized** - Missing or invalid token

#### Examples

```bash
curl -X GET "http://localhost:8000/api/v1/field-options/3" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Update Option

Update an existing field option. Only `display_label` and `display_order` can be modified.

#### Request

```http
PUT /api/v1/field-options/3
Authorization: Bearer <token>
Content-Type: application/json

{
  "display_label": "Champagne & Sparkling Wine",
  "display_order": 1
}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `option_id` | integer | Yes | Field option ID to update |

#### Request Body

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `display_label` | string | No | 1-255 chars | Updated human-readable label |
| `display_order` | integer | No | >= 0 | Updated sort order |

**Both fields are optional** - partial updates are supported. Only provided fields are modified.

#### Response (200 OK)

```json
{
  "id": 3,
  "entity": "person",
  "field_name": "wine_types",
  "value": "sparkling_wine",
  "display_label": "Champagne & Sparkling Wine",
  "display_order": 1,
  "is_system": false,
  "is_active": true,
  "created_by": 5,
  "updated_by": 7,
  "usage_count": 0,
  "created_at": "2025-12-22T10:30:00Z",
  "updated_at": "2025-12-22T11:45:00Z"
}
```

#### Error Responses

**404 Not Found** - Option does not exist:
```json
{
  "error": {
    "code": "FIELD_OPTION_NOT_FOUND",
    "message": "Field option with ID 3 not found",
    "trace_id": "abc123def456"
  }
}
```

**422 Validation Error** - Invalid field values:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "display_label must be 1-255 characters",
    "trace_id": "abc123def456"
  }
}
```

**401 Unauthorized** - Missing or invalid token

#### Notes

- **entity and field_name are immutable** - cannot be changed after creation
- **value is immutable** - cannot be changed after creation
- **Partial updates supported** - only include fields you want to change
- **updated_by is set** to the user performing the update
- **updated_at is automatically set** to current timestamp

#### Examples

**Update label only:**
```bash
curl -X PUT "http://localhost:8000/api/v1/field-options/3" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "display_label": "Champagne & Sparkling Wine"
  }'
```

**Update order only:**
```bash
curl -X PUT "http://localhost:8000/api/v1/field-options/3" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "display_order": 1
  }'
```

**Update both fields:**
```bash
curl -X PUT "http://localhost:8000/api/v1/field-options/3" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "display_label": "Champagne & Sparkling Wine",
    "display_order": 1
  }'
```

---

### Delete Option

Delete a field option. Supports both **soft delete** (default, recommended) and **hard delete**.

#### Request (Soft Delete)

```http
DELETE /api/v1/field-options/3
Authorization: Bearer <token>
```

#### Request (Hard Delete)

```http
DELETE /api/v1/field-options/3?hard_delete=true
Authorization: Bearer <token>
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `option_id` | integer | Yes | Field option ID to delete |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `hard_delete` | boolean | No | false | If true, permanently delete; if false, soft delete |

#### Response (200 OK) - Soft Delete

```json
{
  "success": true,
  "id": 3,
  "soft_deleted": true,
  "usage_count": 0,
  "message": "Option soft-deleted successfully"
}
```

#### Response (200 OK) - Hard Delete

```json
{
  "success": true,
  "id": 3,
  "soft_deleted": false,
  "usage_count": 0,
  "message": "Option permanently deleted"
}
```

#### Response (400 Bad Request) - Cannot Delete In-Use Option

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Cannot delete option: still used by 5 records. Use soft delete instead.",
    "trace_id": "abc123def456",
    "details": {
      "usage_count": 5
    }
  }
}
```

#### Response (400 Bad Request) - Cannot Hard Delete System Option

```json
{
  "error": {
    "code": "CANNOT_DELETE_SYSTEM_OPTION",
    "message": "System options cannot be hard-deleted. Use soft delete instead.",
    "trace_id": "abc123def456",
    "details": {
      "option_id": 3,
      "entity": "person",
      "field_name": "wine_types",
      "value": "sparkling_wine"
    }
  }
}
```

#### Error Responses

**404 Not Found** - Option does not exist:
```json
{
  "error": {
    "code": "FIELD_OPTION_NOT_FOUND",
    "message": "Field option with ID 3 not found",
    "trace_id": "abc123def456"
  }
}
```

**401 Unauthorized** - Missing or invalid token

#### Delete Strategies

**Soft Delete (Recommended)**
- Sets `is_active = false` on the option
- Preserves all data for referential integrity
- Option no longer appears in normal queries (unless `include_inactive=true`)
- Can be reversed by creating a new option with the same value
- **Use when:** Option is in use by existing records

**Hard Delete**
- Permanently removes the option from database
- Cannot be reversed
- Blocked if option is still in use by records (`usage_count > 0`)
- Blocked for system options (`is_system = true`)
- **Use when:** Option was created by mistake and has never been used

#### Examples

**Soft delete (default, safe):**
```bash
curl -X DELETE "http://localhost:8000/api/v1/field-options/3" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Hard delete (permanent):**
```bash
curl -X DELETE "http://localhost:8000/api/v1/field-options/3?hard_delete=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Response Fields Reference

### FieldOptionResponse

Standard response returned by all endpoints (except list):

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | integer | No | Primary key, server-generated |
| `entity` | string | No | Entity type: person, gift, occasion, list |
| `field_name` | string | No | Field name within entity |
| `value` | string | No | Option value/key (normalized snake_case, unique per field) |
| `display_label` | string | No | Human-readable label for UI display |
| `display_order` | integer | No | Sort order (lower first, default 0) |
| `is_system` | boolean | No | True if hardcoded system default; false if user-created |
| `is_active` | boolean | No | False if soft-deleted |
| `created_by` | integer | Yes | ID of user who created the option |
| `updated_by` | integer | Yes | ID of user who last updated the option |
| `usage_count` | integer | Yes | Number of records currently using this option |
| `created_at` | string | No | ISO 8601 timestamp of creation |
| `updated_at` | string | No | ISO 8601 timestamp of last update |

### FieldOptionListResponse

Paginated list response:

| Field | Type | Description |
|-------|------|-------------|
| `items` | array | Array of FieldOptionResponse objects |
| `total` | integer | Total count of options matching filters (pagination-agnostic) |
| `has_more` | boolean | Whether additional results exist beyond current page |
| `next_cursor` | integer \| null | ID of last item for cursor-based pagination |

### FieldOptionDeleteResponse

Delete operation response:

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `success` | boolean | No | Whether delete succeeded |
| `id` | integer | No | ID of deleted option |
| `soft_deleted` | boolean | No | True if soft-deleted, false if hard-deleted |
| `usage_count` | integer | Yes | Records still using option (if delete blocked) |
| `message` | string | Yes | Status message or reason for failure |

---

## Error Response Format

All error responses follow a standardized envelope:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "trace_id": "unique-request-id",
    "details": {
      "field": "value",
      "additional_context": "..."
    }
  }
}
```

### Common Error Codes

| Code | HTTP | Meaning | Recovery |
|------|------|---------|----------|
| `VALIDATION_ERROR` | 422 | Invalid input data or business rule violated | Fix request payload and retry |
| `FIELD_OPTION_NOT_FOUND` | 404 | Option ID does not exist | Verify option ID exists |
| `UNAUTHORIZED` | 401 | Missing/invalid authentication token | Provide valid JWT token |
| `CANNOT_DELETE_SYSTEM_OPTION` | 400 | Attempted hard delete of system option | Use soft delete instead |
| `DUPLICATE_VALUE` | 400 | Option value already exists for entity/field | Use different value |
| `INVALID_ENTITY` | 422 | Entity type is invalid | Use one of: person, gift, occasion, list |
| `INVALID_FIELD` | 422 | Field name is invalid for entity | Check valid fields for entity |

---

## Best Practices

### For API Consumers

1. **Always use soft delete by default** - Preserves data integrity and allows recovery

2. **Cache field options locally** - These don't change frequently:
   ```javascript
   // Client-side: Cache for 5+ minutes, update on UI changes
   const cacheKey = `field-options:${entity}:${fieldName}`;
   const cached = localStorage.getItem(cacheKey);
   if (cached && Date.now() - JSON.parse(cached).timestamp < 5 * 60000) {
     return JSON.parse(cached).data;
   }
   ```

3. **Sort by display_order on the client** - Order is semantic, not guaranteed by pagination

4. **Include inactive options sparingly** - Most UI should only show active options (`include_inactive=false`)

5. **Validate against option values, not display labels** - Labels can change; values are stable

### For API Maintainers

1. **System options (is_system=true)** are hardcoded defaults and cannot be hard-deleted

2. **Always set created_by when creating options** - Audit trail of who created each option

3. **Return usage_count in responses** - Helps clients understand impact of changes (future feature)

4. **Plan for soft delete cleanup** - Implement periodic archive of old soft-deleted options if needed

---

## Integration Examples

### List Wine Types (React)

```typescript
async function fetchWineTypes(token: string) {
  const response = await fetch(
    '/api/v1/field-options?entity=person&field_name=wine_types',
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}

export function WineTypeSelect() {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWineTypes(token)
      .then(data => setOptions(data.items))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <select>
      {options.map(opt => (
        <option key={opt.id} value={opt.value}>
          {opt.display_label}
        </option>
      ))}
    </select>
  );
}
```

### Create and Manage Options (Admin)

```typescript
async function createOption(
  entity: string,
  fieldName: string,
  value: string,
  label: string,
  token: string
) {
  const response = await fetch('/api/v1/field-options', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      entity,
      field_name: fieldName,
      value,
      display_label: label,
      display_order: 0
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}

async function updateOptionOrder(
  optionId: number,
  newOrder: number,
  token: string
) {
  const response = await fetch(`/api/v1/field-options/${optionId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      display_order: newOrder
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}
```

---

## Rate Limiting

No specific rate limits are currently enforced on the Field Options API. However, follow standard API practices:

- **List operations**: Cache results locally; don't poll frequently
- **Create operations**: Batch when possible
- **Delete operations**: Avoid delete-recreate patterns; use soft delete

---

## Changelog

### v1.0 (2025-12-22)
- Initial release
- Full CRUD operations for field options
- Support for soft and hard deletes
- Pagination with cursor support
- Validation for entity/field combinations
