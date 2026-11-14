/**
 * Field Options API
 *
 * API endpoints for managing field options (admin dropdown values).
 */

import { apiClient } from './client';

// Types
export interface FieldOptionDTO {
  id: number;
  entity: string;
  field_name: string;
  value: string;
  display_label: string;
  display_order: number;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  usage_count?: number;
}

export interface FieldOptionsListResponse {
  total: number;
  items: FieldOptionDTO[];
}

export interface FieldOptionCreate {
  entity: string;
  field_name: string;
  value: string;
  display_label: string;
  display_order?: number;
}

export interface FieldOptionUpdate {
  display_label?: string;
  display_order?: number;
}

export interface FieldOptionDeleteResponse {
  success: boolean;
  soft_deleted: boolean;
  message: string;
}

// API endpoint functions
export const fieldOptionsApi = {
  list: (params: {
    entity: string;
    field_name: string;
    include_inactive?: boolean;
    skip?: number;
    limit?: number;
  }) => apiClient.get<FieldOptionsListResponse>('/field-options', params),

  get: (id: number) => apiClient.get<FieldOptionDTO>(`/field-options/${id}`),

  create: (data: FieldOptionCreate) =>
    apiClient.post<FieldOptionDTO>('/field-options', data),

  update: (id: number, data: FieldOptionUpdate) =>
    apiClient.put<FieldOptionDTO>(`/field-options/${id}`, data),

  delete: (id: number, hardDelete: boolean = false) =>
    apiClient.delete<FieldOptionDeleteResponse>(
      `/field-options/${id}?hard_delete=${hardDelete}`
    ),
};
