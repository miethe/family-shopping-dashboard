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
  CommentEntityType,
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

export const occasionApi = {
  list: (params?: OccasionListParams) =>
    apiClient.get<PaginatedResponse<Occasion>>('/occasions', params),
  get: (id: number) => apiClient.get<Occasion>(`/occasions/${id}`),
  create: (data: OccasionCreate) => apiClient.post<Occasion>('/occasions', data),
  update: (id: number, data: OccasionUpdate) => apiClient.put<Occasion>(`/occasions/${id}`, data),
  delete: (id: number) => apiClient.delete<void>(`/occasions/${id}`),
};

// ============================================================================
// Gift API
// ============================================================================

export interface GiftListParams {
  cursor?: number;
  limit?: number;
  search?: string;
  tags?: string;
  sort?: 'price_asc' | 'price_desc' | 'recent';
}

export interface GiftFromUrlRequest {
  url: string;
}

export const giftApi = {
  list: (params?: GiftListParams) => apiClient.get<PaginatedResponse<Gift>>('/gifts', params),
  get: (id: number) => apiClient.get<Gift>(`/gifts/${id}`),
  create: (data: GiftCreate) => apiClient.post<Gift>('/gifts', data),
  createFromUrl: (data: GiftFromUrlRequest) => apiClient.post<Gift>('/gifts/from-url', data),
  update: (id: number, data: GiftUpdate) => apiClient.put<Gift>(`/gifts/${id}`, data),
  delete: (id: number) => apiClient.delete<void>(`/gifts/${id}`),
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
  delete: (id: number) => apiClient.delete<void>(`/comments/${id}`),
};
