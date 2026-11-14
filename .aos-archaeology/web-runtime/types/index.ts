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

/**
 * Size entry with optional fit/brand/notes
 * Used in size_profile for structured clothing and accessory sizes
 */
export interface SizeEntry {
  type: string;
  value: string;
  fit?: string;
  brand?: string;
  notes?: string;
}

/**
 * Jewelry sizes for style section
 */
export interface JewelrySizes {
  ring?: string;
  bracelet?: string;
  necklace?: string;
}

/**
 * Food and drink preferences
 * Captures dietary preferences, favorite cuisines, beverage preferences
 */
export interface FoodAndDrink {
  likes_wine?: boolean;
  wine_types?: string[];
  beverage_prefs?: string[];
  coffee_style?: string;
  tea_style?: string;
  spirits?: string[];
  dietary?: string[];
  favorite_cuisines?: string[];
  sweet_vs_savory?: string;
  favorite_treats?: string;
}

/**
 * Style and accessories preferences
 * Captures color preferences, jewelry, fragrances, and personal style
 */
export interface StyleAndAccessories {
  preferred_colors?: string[];
  avoid_colors?: string[];
  preferred_metals?: string[];
  fragrance_notes?: string[];
  jewelry_sizes?: JewelrySizes;
  accessory_prefs?: string[];
  style_notes?: string;
}

/**
 * Hobbies and media preferences
 * Captures hobbies, creative pursuits, entertainment preferences
 */
export interface HobbiesAndMedia {
  hobbies?: string[];
  creative_outlets?: string[];
  sports_played?: string[];
  sports_teams?: string[];
  reading_genres?: string[];
  music_genres?: string[];
  favorite_authors?: string[];
  favorite_artists?: string[];
  board_games?: string[];
  fandoms_or_series?: string[];
}

/**
 * Tech, travel, and experience preferences
 * Captures technology ecosystems, travel interests, and experience preferences
 */
export interface TechTravelExperiences {
  tech_ecosystem?: string[];
  gaming_platforms?: string[];
  smart_home?: string[];
  travel_styles?: string[];
  dream_destinations?: string[];
  experience_types?: string[];
  event_preferences?: string[];
}

/**
 * Gift preferences
 * Captures specific gift-giving preferences and boundaries
 */
export interface GiftPreferences {
  gift_card_ok?: boolean;
  likes_personalized?: boolean;
  collects?: string[];
  avoid_categories?: string[];
  budget_comfort?: string;
  notes?: string;
}

/**
 * Top-level advanced interests structure
 * Organizes person preferences into logical categories
 */
export interface AdvancedInterests {
  food_and_drink?: FoodAndDrink;
  style_and_accessories?: StyleAndAccessories;
  hobbies_and_media?: HobbiesAndMedia;
  tech_travel_experiences?: TechTravelExperiences;
  gift_preferences?: GiftPreferences;
}

export interface Person extends TimestampFields {
  id: number;
  display_name: string;
  relationship?: string;
  birthdate?: string; // ISO date string
  anniversary?: string; // ISO date string
  notes?: string;
  interests?: string[];
  size_profile?: SizeEntry[]; // NEW: Structured size data
  sizes?: Record<string, string>; // DEPRECATED: Keep for backward compatibility
  advanced_interests?: AdvancedInterests; // NEW: Structured preference data
  constraints?: string;
  photo_url?: string;
  groups?: GroupMinimal[];
  occasion_ids?: number[];
}

export interface PersonCreate {
  display_name: string;
  relationship?: string;
  birthdate?: string; // ISO date string
  anniversary?: string; // ISO date string
  notes?: string;
  interests?: string[];
  size_profile?: SizeEntry[];
  sizes?: Record<string, string>; // Keep for backward compatibility
  advanced_interests?: AdvancedInterests;
  constraints?: string;
  photo_url?: string;
  group_ids?: number[];
}

export interface PersonUpdate {
  display_name?: string;
  relationship?: string;
  birthdate?: string; // ISO date string
  anniversary?: string; // ISO date string
  notes?: string;
  interests?: string[];
  size_profile?: SizeEntry[];
  sizes?: Record<string, string>; // Keep for backward compatibility
  advanced_interests?: AdvancedInterests;
  constraints?: string;
  photo_url?: string;
  group_ids?: number[];
}

export interface PersonSummary {
  id: number;
  display_name: string;
}

// ============================================================================
// Group Types
// ============================================================================

export interface Group extends TimestampFields {
  id: number;
  name: string;
  color: string | null;
  description: string | null;
}

export interface GroupCreate {
  name: string;
  color?: string | null;
  description?: string | null;
}

export interface GroupUpdate {
  name?: string;
  color?: string | null;
  description?: string | null;
}

export interface GroupMinimal {
  id: number;
  name: string;
  color: string | null;
}

// ============================================================================
// Occasion Types
// ============================================================================

export enum OccasionType {
  HOLIDAY = 'holiday',
  RECURRING = 'recurring',
  OTHER = 'other',
}

/**
 * Recurrence rule for recurring occasions
 * Defines when an occasion repeats (e.g., birthdays, anniversaries)
 */
export interface RecurrenceRule {
  month: number;              // 1-12
  day?: number | null;        // 1-31, null for relative dates (e.g., "2nd Monday")
  weekday?: number | null;    // 0-6 (Monday-Sunday), for relative dates
  week_of_month?: number | null; // 1-5 or -1 for last week, for relative dates
}

export interface Occasion extends TimestampFields {
  id: number;
  name: string;
  type: OccasionType;
  date: string; // ISO date string
  description?: string;
  budget?: number | null;
  // New fields for recurring occasions
  recurrence_rule: RecurrenceRule | null;
  is_active: boolean;
  next_occurrence: string | null; // ISO date string
  subtype: string | null; // "birthday", "anniversary", etc.
  person_ids: number[];
}

export interface OccasionCreate {
  name: string;
  type: OccasionType;
  date: string; // ISO date string
  description?: string;
  budget?: number | null;
  // New fields for recurring occasions
  recurrence_rule?: RecurrenceRule | null;
  is_active?: boolean;
  subtype?: string | null;
  person_ids?: number[];
}

export interface OccasionUpdate {
  name?: string;
  type?: OccasionType;
  date?: string;
  description?: string;
  budget?: number | null;
  // New fields for recurring occasions
  recurrence_rule?: RecurrenceRule | null;
  is_active?: boolean;
  subtype?: string | null;
  person_ids?: number[];
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

/**
 * Gift priority levels
 * Matches backend GiftPriority enum
 */
export enum GiftPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

/**
 * Gift status levels
 * Matches backend GiftStatus enum
 */
export type GiftStatus = 'idea' | 'selected' | 'purchased' | 'received';

/**
 * Minimal store information included in gift responses
 */
export interface StoreMinimal {
  id: number;
  name: string;
  url: string | null;
}

/**
 * Full store entity
 */
export interface Store extends StoreMinimal, TimestampFields {}

/**
 * Person-gift relationship with role information
 * Matches backend GiftPersonLink schema
 */
export interface GiftPersonLink {
  person_id: number;
  role: 'recipient' | 'purchaser' | 'contributor';
}

/**
 * List item info for gift (minimal, from API)
 * Used for QuickPurchaseButton component
 * Matches backend GiftListItemInfo schema
 */
export interface GiftListItemInfo {
  id: number;           // list_item.id (for API calls)
  list_id: number;      // Which list
  list_name: string;    // List display name
  status: ListItemStatus; // Current status in that list
}

/**
 * Gift entity with all fields
 * Matches backend GiftResponse schema
 */
export interface Gift extends TimestampFields {
  id: number;
  name: string;
  url: string | null;
  price: number | null;
  image_url: string | null;
  source: string | null;
  // New fields
  description: string | null;
  notes: string | null;
  priority: GiftPriority;
  status: GiftStatus;
  quantity: number;
  sale_price: number | null;
  purchase_date: string | null; // ISO date string
  additional_urls: { label: string; url: string }[];
  stores: StoreMinimal[];
  person_ids: number[];
  // Additional fields
  extra_data: Record<string, unknown> | null;
  from_santa: boolean;
  // NEW: Person relationships with roles
  gift_people?: GiftPersonLink[];
  // NEW: List items containing this gift (from API)
  list_items?: GiftListItemInfo[];
}

/**
 * Gift creation DTO
 */
export interface GiftCreate {
  name: string;
  url?: string | null;
  price?: number | null;
  image_url?: string | null;
  source?: string | null;
  description?: string | null;
  notes?: string | null;
  priority?: GiftPriority;
  status?: GiftStatus;
  quantity?: number;
  sale_price?: number | null;
  purchase_date?: string | null; // ISO date string
  additional_urls?: { label: string; url: string }[];
  store_ids?: number[];
  person_ids?: number[];
  from_santa?: boolean;
}

/**
 * Gift update DTO
 */
export interface GiftUpdate {
  name?: string;
  url?: string | null;
  price?: number | null;
  image_url?: string | null;
  source?: string | null;
  description?: string | null;
  notes?: string | null;
  priority?: GiftPriority;
  status?: GiftStatus;
  quantity?: number;
  sale_price?: number | null;
  purchase_date?: string | null; // ISO date string
  additional_urls?: { label: string; url: string }[];
  store_ids?: number[];
  person_ids?: number[];
  extra_data?: Record<string, unknown>;
  from_santa?: boolean;
}

/**
 * Minimal gift summary for list items
 * Matches backend GiftSummary schema
 */
export interface GiftSummary {
  id: number;
  name: string;
  url: string | null;
  price: number | null;
  image_url: string | null;
  priority: GiftPriority;
  quantity: number;
  sale_price: number | null;
}

// ============================================================================
// Store Types
// ============================================================================

/**
 * Store creation DTO
 */
export interface StoreCreate {
  name: string;
  url?: string | null;
}

/**
 * Store update DTO
 */
export interface StoreUpdate {
  name?: string;
  url?: string | null;
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
  price?: number | null;
  discount_price?: number | null;
  quantity: number;
}

export interface ListItemCreate {
  gift_id: number;
  list_id: number;
  status?: ListItemStatus;
  assigned_to?: number;
  notes?: string;
  price?: number | null;
  discount_price?: number | null;
  quantity?: number;
}

export interface ListItemUpdate {
  status?: ListItemStatus;
  assigned_to?: number;
  notes?: string;
  price?: number | null;
  discount_price?: number | null;
  quantity?: number;
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

export type CommentEntityType = 'person' | 'list' | 'list_item' | 'occasion' | 'gift';

export type CommentVisibility = 'public' | 'private';

export interface Comment extends TimestampFields {
  id: number;
  // Canonical fields
  content: string;
  visibility: CommentVisibility;
  parent_type: CommentEntityType;
  parent_id: number;
  author_id: number;
  author_name: string;
  author_label: string;
  can_edit: boolean;

  // Alias fields for compatibility
  text: string;
  entity_type: CommentEntityType;
  entity_id: number;
  user_id: number;
  user_name: string;
}

export interface CommentCreate {
  entity_type: CommentEntityType;
  entity_id: number;
  text: string;
  visibility?: CommentVisibility;
}

export interface CommentUpdate {
  text?: string;
  visibility?: CommentVisibility;
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

// ============================================================================
// Activity Feed Types
// ============================================================================

export type ActivityAction =
  | 'gift_added'
  | 'gift_purchased'
  | 'gift_received'
  | 'list_created'
  | 'status_changed';

export type ActivityEntityType = 'list_item' | 'list' | 'person';

export interface ActivityActor {
  id: number;
  email: string;
}

export interface ActivityEvent {
  id: number;
  action: ActivityAction;
  actor: ActivityActor;
  entity_type: ActivityEntityType;
  entity_id: number;
  entity_name: string;
  extra_data: Record<string, unknown> | null;
  created_at: string;
  description: string;
}

export interface ActivityFeedResponse {
  events: ActivityEvent[];
  total: number;
}

// ============================================================================
// Budget Types
// ============================================================================

export * from './budget';

// ============================================================================
// Bulk Gift Action Types
// ============================================================================

export interface BulkGiftAction {
  gift_ids: number[];
  action: 'assign_recipient' | 'assign_purchaser' | 'mark_purchased' | 'delete';
  person_id?: number;
}

export interface BulkGiftResult {
  success_count: number;
  failed_ids: number[];
  errors: string[];
}
