/**
 * API Endpoints
 *
 * Typed endpoint functions for all backend API routes.
 * These functions use the ApiClient and return properly typed responses.
 */

import { apiClient } from './client';
import { PaginatedResponse } from './types';
import type {
  // User types
  User,
  UserCreate,
  UserUpdate,
  // Person types
  Person,
  PersonCreate,
  PersonUpdate,
  PersonSummary,
  // Group types
  Group,
  GroupCreate,
  GroupUpdate,
  GroupMinimal,
  // Occasion types
  Occasion,
  OccasionCreate,
  OccasionUpdate,
  OccasionSummary,
  // Gift types
  Gift,
  GiftCreate,
  GiftUpdate,
  GiftSummary,
  // Store types
  Store,
  StoreCreate,
  // List types
  GiftList,
  ListCreate,
  ListUpdate,
  ListSummary,
  ListWithItems,
  // List Item types
  ListItem,
  ListItemCreate,
  ListItemUpdate,
  ListItemWithGift,
  ListItemWithAssignee,
  // Dashboard types
  DashboardResponse,
  // Comment types
  Comment,
  CommentCreate,
  CommentUpdate,
  CommentEntityType,
  // Activity types
  ActivityFeedResponse,
  // Budget types
  BudgetMeterData,
  BudgetWarning,
  EntityBudget,
  SetBudgetRequest,
  SetEntityBudgetRequest,
  // Bulk Gift types
  BulkGiftAction,
  BulkGiftResult,
} from '@/types';

// ============================================================================
// Auth API
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterRequest extends UserCreate {}

export interface RegisterResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authApi = {
  login: (data: LoginRequest) => apiClient.post<LoginResponse>('/auth/login', data),
  register: (data: RegisterRequest) => apiClient.post<RegisterResponse>('/auth/register', data),
  refresh: () => apiClient.post<LoginResponse>('/auth/refresh'),
  me: () => apiClient.get<User>('/auth/me'),
};

// ============================================================================
// User API
// ============================================================================

export const userApi = {
  list: () => apiClient.get<User[]>('/users'),
  get: (id: number) => apiClient.get<User>(`/users/${id}`),
  update: (id: number, data: UserUpdate) => apiClient.put<User>(`/users/${id}`, data),
  delete: (id: number) => apiClient.delete<void>(`/users/${id}`),
};

// ============================================================================
// Person API
// ============================================================================

export interface PersonListParams {
  cursor?: number;
  limit?: number;
}

export const personApi = {
  list: (params?: PersonListParams) => apiClient.get<PaginatedResponse<Person>>('/persons', params),
  get: (id: number) => apiClient.get<Person>(`/persons/${id}`),
  create: (data: PersonCreate) => apiClient.post<Person>('/persons', data),
  update: (id: number, data: PersonUpdate) => apiClient.put<Person>(`/persons/${id}`, data),
  delete: (id: number) => apiClient.delete<void>(`/persons/${id}`),
};

// ============================================================================
// Occasion API
// ============================================================================

export interface OccasionListParams {
  cursor?: number;
  limit?: number;
  filter?: 'upcoming' | 'past';
}

export interface UpcomingOccasionsParams {
  within_days?: number; // Default: 90 days
}

export const occasionApi = {
  list: (params?: OccasionListParams) =>
    apiClient.get<PaginatedResponse<Occasion>>('/occasions', params),
  get: (id: number) => apiClient.get<Occasion>(`/occasions/${id}`),
  create: (data: OccasionCreate) => apiClient.post<Occasion>('/occasions', data),
  update: (id: number, data: OccasionUpdate) => apiClient.put<Occasion>(`/occasions/${id}`, data),
  delete: (id: number) => apiClient.delete<void>(`/occasions/${id}`),
  upcoming: (params?: UpcomingOccasionsParams) =>
    apiClient.get<Occasion[]>('/occasions/upcoming', params),
};

// ============================================================================
// Gift API
// ============================================================================

export interface GiftListParams {
  cursor?: number;
  limit?: number;
  search?: string;
  tags?: string;
  person_ids?: number[];    // Filter by recipient
  statuses?: string[];      // Filter by status (idea, selected, purchased, received)
  list_ids?: number[];      // Filter by list
  occasion_ids?: number[];  // Filter by occasion
  sort?: 'price_asc' | 'price_desc' | 'recent';
}

export interface GiftFromUrlRequest {
  url: string;
}

export interface MarkPurchasedRequest {
  quantity_purchased?: number;
}

export const giftApi = {
  list: (params?: GiftListParams) => apiClient.get<PaginatedResponse<Gift>>('/gifts', params),
  get: (id: number) => apiClient.get<Gift>(`/gifts/${id}`),
  create: (data: GiftCreate) => apiClient.post<Gift>('/gifts', data),
  createFromUrl: (data: GiftFromUrlRequest) => apiClient.post<Gift>('/gifts/from-url', data),
  update: (id: number, data: GiftUpdate) => apiClient.patch<Gift>(`/gifts/${id}`, data),
  delete: (id: number) => apiClient.delete<void>(`/gifts/${id}`),
  attachPeople: (giftId: number, personIds: number[]) =>
    apiClient.post<Gift>(`/gifts/${giftId}/people`, { person_ids: personIds }),
  detachPerson: (giftId: number, personId: number) =>
    apiClient.delete<Gift>(`/gifts/${giftId}/people/${personId}`),
  markPurchased: (giftId: number, data: MarkPurchasedRequest) =>
    apiClient.post<Gift>(`/gifts/${giftId}/mark-purchased`, data),
  bulkAction: (data: BulkGiftAction) =>
    apiClient.patch<BulkGiftResult>('/gifts/bulk', data),
};

// ============================================================================
// List API
// ============================================================================

export interface ListListParams {
  cursor?: number;
  limit?: number;
  type?: string;
  occasion_id?: number;
  person_id?: number;
}

export const listApi = {
  list: (params?: ListListParams) => apiClient.get<PaginatedResponse<GiftList>>('/lists', params),
  get: (id: number) => apiClient.get<ListWithItems>(`/lists/${id}`),
  create: (data: ListCreate) => apiClient.post<GiftList>('/lists', data),
  update: (id: number, data: ListUpdate) => apiClient.put<GiftList>(`/lists/${id}`, data),
  delete: (id: number) => apiClient.delete<void>(`/lists/${id}`),
};

// ============================================================================
// List Item API
// ============================================================================

export interface ListItemListParams {
  list_id: number; // Required - items are nested under lists
  assigned_to?: number;
  status?: string;
}

export const listItemApi = {
  /**
   * Get all items in a list.
   * Uses nested resource: GET /lists/{list_id}/items
   */
  list: (params: ListItemListParams) =>
    apiClient.get<ListItemWithGift[]>(`/lists/${params.list_id}/items`),

  /**
   * Add item to a list.
   * Uses nested resource: POST /lists/{list_id}/items
   */
  create: (listId: number, data: Omit<ListItemCreate, 'list_id'>) =>
    apiClient.post<ListItem>(`/lists/${listId}/items`, data),

  /**
   * Update item status.
   * Uses: PUT /list-items/{id}/status
   */
  updateStatus: (id: number, status: string) =>
    apiClient.put<ListItem>(`/list-items/${id}/status`, { status }),

  /**
   * Assign item to user.
   * Uses: PUT /list-items/{id}/assign
   */
  assign: (id: number, assignedToId: number | null) =>
    apiClient.put<ListItem>(`/list-items/${id}/assign`, { assigned_to_id: assignedToId }),
};

// ============================================================================
// Dashboard API
// ============================================================================

export const dashboardApi = {
  summary: () => apiClient.get<DashboardResponse>('/dashboard'),
};

// ============================================================================
// Comment API
// ============================================================================

export interface CommentListParams {
  entity_type: CommentEntityType;
  entity_id: number;
}

export const commentApi = {
  list: (params: CommentListParams) => apiClient.get<Comment[]>('/comments', params),
  create: (data: CommentCreate) => apiClient.post<Comment>('/comments', data),
  update: (id: number, data: CommentUpdate) => apiClient.patch<Comment>(`/comments/${id}`, data),
  delete: (id: number) => apiClient.delete<void>(`/comments/${id}`),
};

// ============================================================================
// Activity API
// ============================================================================

export interface ActivityListParams {
  limit?: number;
}

export const activityApi = {
  recent: (params?: ActivityListParams) =>
    apiClient.get<ActivityFeedResponse>('/activity', params),
};

// ============================================================================
// Ideas API
// ============================================================================

export interface IdeaInboxResponse {
  ideas: Array<{
    id: number;
    name: string;
    image_url: string | null;
    price: number | null;
    created_at: string;
    added_by: {
      id: number;
      email: string;
    };
  }>;
  total: number;
}

export interface AddIdeaToListRequest {
  list_id: number;
}

export const ideasApi = {
  inbox: (limit = 10) => apiClient.get<IdeaInboxResponse>(`/ideas/inbox?limit=${limit}`),
  addToList: (ideaId: number, data: AddIdeaToListRequest) =>
    apiClient.post<Gift>(`/ideas/${ideaId}/add-to-list`, data),
};

// ============================================================================
// Budget API
// ============================================================================

export const budgetsApi = {
  getMeter: (occasionId: number) =>
    apiClient.get<BudgetMeterData>(`/budgets/occasions/${occasionId}/meter`),

  setOccasionBudget: (occasionId: number, data: SetBudgetRequest) =>
    apiClient.post<BudgetMeterData>(`/budgets/occasions/${occasionId}`, data),

  getWarning: (occasionId: number) =>
    apiClient.get<BudgetWarning>(`/budgets/occasions/${occasionId}/warning`),

  getEntityBudgets: (occasionId: number) =>
    apiClient.get<EntityBudget[]>(`/budgets/occasions/${occasionId}/entities`),

  setEntityBudget: (occasionId: number, data: SetEntityBudgetRequest) =>
    apiClient.post<EntityBudget>(`/budgets/occasions/${occasionId}/entities`, data),

  getEntityBudget: (occasionId: number, entityType: string, entityId: number) =>
    apiClient.get<EntityBudget>(`/budgets/occasions/${occasionId}/entities/${entityType}/${entityId}`),

  deleteEntityBudget: (occasionId: number, entityType: string, entityId: number) =>
    apiClient.delete<void>(`/budgets/occasions/${occasionId}/entities/${entityType}/${entityId}`),
};

// ============================================================================
// Group API
// ============================================================================

export const groupApi = {
  list: () => apiClient.get<Group[]>('/groups'),
  get: (id: number) => apiClient.get<Group>(`/groups/${id}`),
  create: (data: GroupCreate) => apiClient.post<Group>('/groups', data),
  update: (id: number, data: GroupUpdate) => apiClient.put<Group>(`/groups/${id}`, data),
  delete: (id: number) => apiClient.delete<void>(`/groups/${id}`),
};

// ============================================================================
// Store API
// ============================================================================

export interface StoreListParams {
  cursor?: number;
  limit?: number;
}

export const storeApi = {
  list: (params?: StoreListParams) => apiClient.get<PaginatedResponse<Store>>('/stores', params),
  search: (q: string) => apiClient.get<Store[]>(`/stores/search?q=${encodeURIComponent(q)}`),
  get: (id: number) => apiClient.get<Store>(`/stores/${id}`),
  create: (data: StoreCreate) => apiClient.post<Store>('/stores', data),
  delete: (id: number) => apiClient.delete<void>(`/stores/${id}`),
};
