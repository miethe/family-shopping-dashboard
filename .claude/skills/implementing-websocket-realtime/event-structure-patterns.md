# WebSocket Event Structure Patterns

## Generic Event Schema

```typescript
interface WebSocketEvent<T = unknown> {
  topic: string;              // Resource namespace and identifier
  event: EventType;           // Event type
  data: {
    entity_id: string;        // Affected resource ID
    payload: T;               // Event-specific data (DTO)
    user_id?: string;         // User who triggered event
    tenant_id?: string;       // Multi-tenant context (optional)
    timestamp: string;        // ISO 8601 timestamp
  };
  trace_id?: string;          // For distributed tracing
  version?: number;           // Event schema version
}

type EventType =
  | 'ADDED'
  | 'UPDATED'
  | 'DELETED'
  | 'STATUS_CHANGED'
  | string; // Allow custom events
```

## Topic Naming Conventions

### Pattern: `{resource-type}:{identifier}`

```
Examples:
- "gift-list:123"           → Specific gift list
- "user:456"                → Specific user
- "room:lobby"              → Specific room
- "order:789"               → Specific order
- "session:abc-def"         → Specific session
```

### Hierarchical Topics

```
Examples:
- "org:acme:team:dev"       → Team within org
- "user:123:notifications"  → User's notifications
- "room:lobby:messages"     → Messages in room
```

### Wildcard Topics (Server-Side)

```
Examples:
- "gift-list:*"             → All gift lists
- "user:*:notifications"    → All user notifications
- "*:messages"              → All message channels
```

**Note**: Wildcards typically server-side only for authorization/routing.

## Event Type Patterns

### CRUD Operations

```typescript
// CREATE
{
  topic: "gift-list:123",
  event: "ADDED",
  data: {
    entity_id: "gift-456",
    payload: {
      id: "gift-456",
      name: "New Gift",
      // ... full gift DTO
    }
  }
}

// UPDATE
{
  topic: "gift-list:123",
  event: "UPDATED",
  data: {
    entity_id: "gift-456",
    payload: {
      id: "gift-456",
      name: "Updated Name",
      // ... full or partial DTO
    }
  }
}

// DELETE
{
  topic: "gift-list:123",
  event: "DELETED",
  data: {
    entity_id: "gift-456",
    payload: null  // No payload needed for delete
  }
}
```

### Status Changes

```typescript
{
  topic: "gift-list:123",
  event: "STATUS_CHANGED",
  data: {
    entity_id: "gift-456",
    payload: {
      id: "gift-456",
      old_status: "available",
      new_status: "purchased",
      purchased_by: "user-789"
    }
  }
}
```

### Custom Events

```typescript
// User presence
{
  topic: "room:lobby",
  event: "USER_JOINED",
  data: {
    entity_id: "user-123",
    payload: {
      user_id: "user-123",
      username: "Alice",
      avatar_url: "https://..."
    }
  }
}

// Batch operation completed
{
  topic: "import:job-456",
  event: "IMPORT_COMPLETED",
  data: {
    entity_id: "job-456",
    payload: {
      total: 1000,
      imported: 950,
      errors: 50
    }
  }
}
```

## Payload Patterns

### Full DTO (Recommended)

**Pros**: Client has all data, no extra fetch
**Cons**: Larger payload

```typescript
{
  topic: "gift-list:123",
  event: "UPDATED",
  data: {
    entity_id: "gift-456",
    payload: {
      id: "gift-456",
      name: "Updated Gift",
      price: 29.99,
      url: "https://...",
      notes: "...",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-02T00:00:00Z"
    }
  }
}
```

### Partial DTO (Changed Fields Only)

**Pros**: Smaller payload
**Cons**: Client must merge with existing data

```typescript
{
  topic: "gift-list:123",
  event: "UPDATED",
  data: {
    entity_id: "gift-456",
    payload: {
      name: "Updated Gift",  // Only changed field
      updated_at: "2023-01-02T00:00:00Z"
    }
  }
}
```

### Reference Only (Minimal)

**Pros**: Smallest payload
**Cons**: Client must fetch full data

```typescript
{
  topic: "gift-list:123",
  event: "UPDATED",
  data: {
    entity_id: "gift-456",
    payload: null  // Client must fetch /api/gifts/456
  }
}
```

**Recommendation**: Use full DTO for <10KB payloads, partial for larger resources.

## Multi-Tenant Patterns

### Tenant in Topic

```typescript
{
  topic: "tenant:acme:gift-list:123",
  event: "UPDATED",
  data: { /* ... */ }
}
```

**Pros**: Clear tenant isolation
**Cons**: More complex topic management

### Tenant in Data

```typescript
{
  topic: "gift-list:123",
  event: "UPDATED",
  data: {
    entity_id: "gift-456",
    tenant_id: "acme",  // Tenant context in data
    payload: { /* ... */ }
  }
}
```

**Pros**: Simpler topic structure
**Cons**: Must check tenant_id on client

## Event Metadata

### Trace IDs (Observability)

```typescript
{
  topic: "gift-list:123",
  event: "UPDATED",
  data: { /* ... */ },
  trace_id: "a1b2c3d4-e5f6-7890"  // OpenTelemetry trace ID
}
```

**Usage**: Link WebSocket events to API requests in distributed tracing.

### Event Versions (Evolution)

```typescript
{
  topic: "gift-list:123",
  event: "UPDATED",
  data: { /* ... */ },
  version: 2  // Event schema version
}
```

**Usage**: Handle schema changes gracefully.

```typescript
// Client handles versions
ws.onmessage = (event) => {
  const wsEvent = JSON.parse(event.data);

  switch (wsEvent.version) {
    case 1:
      handleV1Event(wsEvent);
      break;
    case 2:
      handleV2Event(wsEvent);
      break;
    default:
      console.warn('Unknown event version:', wsEvent.version);
  }
};
```

## Validation Schemas

### Zod (TypeScript)

```typescript
import { z } from 'zod';

const WebSocketEventSchema = z.object({
  topic: z.string().regex(/^[a-z-]+:[a-z0-9-]+$/),
  event: z.enum(['ADDED', 'UPDATED', 'DELETED', 'STATUS_CHANGED']),
  data: z.object({
    entity_id: z.string(),
    payload: z.unknown(),
    user_id: z.string().optional(),
    tenant_id: z.string().optional(),
    timestamp: z.string().datetime(),
  }),
  trace_id: z.string().uuid().optional(),
  version: z.number().int().positive().optional(),
});

// Validate event
const result = WebSocketEventSchema.safeParse(event);
if (!result.success) {
  console.error('Invalid event:', result.error);
}
```

### Pydantic (Python)

```python
from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime

class WebSocketEventData(BaseModel):
    entity_id: str
    payload: Any
    user_id: Optional[str] = None
    tenant_id: Optional[str] = None
    timestamp: datetime

class WebSocketEvent(BaseModel):
    topic: str = Field(..., regex=r'^[a-z-]+:[a-z0-9-]+$')
    event: str
    data: WebSocketEventData
    trace_id: Optional[str] = None
    version: Optional[int] = None

# Validate event
try:
    event = WebSocketEvent(**data)
except ValidationError as e:
    print(f"Invalid event: {e}")
```

## Error Events

```typescript
{
  topic: "error",
  event: "ERROR",
  data: {
    entity_id: "request-123",
    payload: {
      code: "VALIDATION_ERROR",
      message: "Invalid gift name",
      details: { field: "name", error: "required" }
    }
  }
}
```

## System Events

### Connection Confirmation

```typescript
{
  topic: "system",
  event: "CONNECTED",
  data: {
    entity_id: "user-123",
    payload: {
      user_id: "user-123",
      session_id: "abc-def",
      server_time: "2023-01-01T00:00:00Z"
    }
  }
}
```

### Subscription Acknowledgment

```typescript
{
  topic: "system",
  event: "SUBSCRIBED",
  data: {
    entity_id: "subscription-1",
    payload: {
      topics: ["gift-list:123", "user:456"]
    }
  }
}
```

## Best Practices

1. **Consistent topic naming**: Use `{resource}:{id}` pattern
2. **Include timestamps**: Always add `timestamp` in ISO 8601 format
3. **Use full DTOs**: For payloads <10KB, send complete object
4. **Add trace IDs**: For observability and debugging
5. **Version events**: For schema evolution
6. **Validate on receive**: Use Zod/Pydantic to validate structure
7. **Document event types**: Maintain event catalog/documentation
8. **Use enums**: For event types to catch typos
9. **Include user context**: Add `user_id` for audit trails
10. **Keep payloads small**: <10KB ideal, <100KB maximum

## Anti-Patterns to Avoid

❌ **Nested topics**: `gift-list:123:gift:456` (too complex)
✅ **Use**: `gift-list:123` with `entity_id: "gift-456"`

❌ **Huge payloads**: Sending full database records with relations
✅ **Use**: Send DTOs with only necessary fields

❌ **Magic strings**: `event: "update"` (inconsistent casing)
✅ **Use**: `event: "UPDATED"` (consistent, enum)

❌ **No metadata**: Missing timestamps, user context
✅ **Use**: Always include `timestamp`, optionally `user_id`

❌ **Opaque events**: `event: "E001"` (unclear)
✅ **Use**: `event: "GIFT_PURCHASED"` (descriptive)
