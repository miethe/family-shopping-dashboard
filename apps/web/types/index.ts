/**
 * Domain Types for Family Gifting Dashboard
 *
 * These types match the API schemas from services/api/app/schemas
 * All types use snake_case to match backend DTOs exactly.
 */

/**
 * Base timestamp fields for all entities
 */
export interface TimestampFields {
  created_at: string;
  updated_at: string;
}

// ============================================================================
// User Types
// ============================================================================

export interface User extends TimestampFields {
  id: number;
  email: string;
  display_name: string;
  avatar_url?: string;
}

export interface UserCreate {
  email: string;
  password: string;
  display_name: string;
}

export interface UserUpdate {
  display_name?: string;
  avatar_url?: string;
}

// ============================================================================
// Person Types
// ============================================================================

export interface Person extends TimestampFields {
  id: number;
  display_name: string;
  relationship?: string;
  birthdate?: string; // ISO date string
  notes?: string;
  interests?: string[];
  sizes?: Record<string, string>;
  constraints?: string;
  photo_url?: string;
}

export interface PersonCreate {
  display_name: string;
  relationship?: string;
  birthdate?: string; // ISO date string
  notes?: string;
  interests?: string[];
  sizes?: Record<string, string>;
  constraints?: string;
  photo_url?: string;
}

export interface PersonUpdate {
  display_name?: string;
  relationship?: string;
  birthdate?: string; // ISO date string
  notes?: string;
  interests?: string[];
  sizes?: Record<string, string>;
  constraints?: string;
  photo_url?: string;
}

export interface PersonSummary {
  id: number;
  display_name: string;
}

// ============================================================================
// Occasion Types
// ============================================================================

export type OccasionType = 'birthday' | 'holiday' | 'other';

export interface Occasion extends TimestampFields {
  id: number;
  name: string;
  type: OccasionType;
  date: string; // ISO date string
  description?: string;
}

export interface OccasionCreate {
  name: string;
  type: OccasionType;
  date: string; // ISO date string
  description?: string;
}

export interface OccasionUpdate {
  name?: string;
  type?: OccasionType;
  date?: string;
  description?: string;
}

export interface OccasionSummary {
  id: number;
  name: string;
  type: OccasionType;
  date: string;
  list_count: number;
}

// ============================================================================
// Gift Types
// ============================================================================

export interface Gift extends TimestampFields {
  id: number;
  name: string;
  url?: string;
  price?: number;
  image_url?: string;
  source?: string;
  extra_data: Record<string, any>;
}

export interface GiftCreate {
  name: string;
  url?: string;
  price?: number;
  image_url?: string;
  source?: string;
}

export interface GiftUpdate {
  name?: string;
  url?: string;
  price?: number;
  image_url?: string;
  source?: string;
}

export interface GiftSummary {
  id: number;
  name: string;
  price?: number;
  image_url?: string;
}

// ============================================================================
// List Types
// ============================================================================

export type ListType = 'wishlist' | 'ideas' | 'assigned';
export type ListVisibility = 'private' | 'family' | 'public';

export interface GiftList extends TimestampFields {
  id: number;
  name: string;
  type: ListType;
  visibility: ListVisibility;
  user_id: number;
  person_id?: number;
  occasion_id?: number;
  item_count?: number;
}

export interface ListCreate {
  name: string;
  type: ListType;
  visibility: ListVisibility;
  person_id?: number;
  occasion_id?: number;
}

export interface ListUpdate {
  name?: string;
  type?: ListType;
  visibility?: ListVisibility;
  person_id?: number;
  occasion_id?: number;
}

export interface ListSummary {
  id: number;
  name: string;
  type: ListType;
  visibility: ListVisibility;
  item_count: number;
}

// ============================================================================
// List Item Types
// ============================================================================

export type ListItemStatus = 'idea' | 'selected' | 'purchased' | 'received';

export interface ListItem extends TimestampFields {
  id: number;
  gift_id: number;
  list_id: number;
  status: ListItemStatus;
  assigned_to?: number;
  notes?: string;
}

export interface ListItemCreate {
  gift_id: number;
  list_id: number;
  status?: ListItemStatus;
  assigned_to?: number;
  notes?: string;
}

export interface ListItemUpdate {
  status?: ListItemStatus;
  assigned_to?: number;
  notes?: string;
}

export interface ListItemWithGift extends ListItem {
  gift: GiftSummary;
}

export interface ListItemWithAssignee extends ListItem {
  assignee?: User;
}

export interface ListWithItems extends GiftList {
  items: ListItemWithGift[];
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface DashboardOccasionSummary {
  id: number;
  name: string;
  date: string;
  days_until: number;
  total_items: number;
  purchased_items: number;
}

export interface PersonSummaryDashboard {
  id: number;
  display_name: string;
  pending_gifts: number;
  photo_url?: string;
  next_occasion?: string; // ISO date string
  gift_counts: {
    idea: number;
    needed: number;
    purchased: number;
  };
}

export interface DashboardResponse {
  primary_occasion?: DashboardOccasionSummary;
  people_needing_gifts: PersonSummaryDashboard[];
  total_ideas: number;
  total_purchased: number;
  my_assignments: number;
}

// ============================================================================
// WebSocket Types
// ============================================================================

export type WSEventType = 'ADDED' | 'UPDATED' | 'DELETED' | 'STATUS_CHANGED';

export interface WSEvent<T = unknown> {
  topic: string;
  event: WSEventType;
  data: {
    entity_id: string;
    payload: T;
    user_id: string;
  };
}

// ============================================================================
// Comment Types
// ============================================================================

export type CommentEntityType = 'list' | 'occasion' | 'list_item';

export interface Comment extends TimestampFields {
  id: number;
  entity_type: CommentEntityType;
  entity_id: number;
  user_id: number;
  user_name: string;
  text: string;
}

export interface CommentCreate {
  entity_type: CommentEntityType;
  entity_id: number;
  text: string;
}

// ============================================================================
// API Error Types (from lib/api/types.ts)
// ============================================================================

export interface APIError {
  code: string;
  message: string;
  trace_id?: string;
}

export interface APIErrorResponse {
  error: APIError;
}
