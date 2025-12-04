/**
 * API Client Type Definitions
 *
 * Core types for API communication, pagination, and error handling.
 * These types support the API client infrastructure.
 */

/**
 * API error structure from backend
 */
export interface APIError {
  code: string;
  message: string;
  trace_id?: string;
}

/**
 * Standard API error response envelope
 */
export interface APIErrorResponse {
  error: APIError;
}

/**
 * Cursor-based pagination info
 */
export interface PageInfo {
  has_more: boolean;
  next_cursor: number | null;
}

/**
 * Generic paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  has_more: boolean;
  next_cursor: number | null;
}

/**
 * Options for API requests
 */
export interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  headers?: HeadersInit;
}
