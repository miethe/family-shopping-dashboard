/**
 * API Client
 *
 * Typed fetch wrapper with automatic auth headers and error handling.
 * Integrates with localStorage for JWT tokens and provides consistent
 * error handling across all API calls.
 */

import { APIError, APIErrorResponse, RequestOptions } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Get JWT token from localStorage
 * Returns null if running on server or token not found
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  code: string;
  statusCode: number;
  traceId?: string;

  constructor(code: string, message: string, statusCode: number, traceId?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.traceId = traceId;
  }
}

/**
 * API Client class with typed methods
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make an HTTP request to the API
   */
  async request<T>(
    method: string,
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    // Construct URL by concatenating base + path (new URL() doesn't work with base path segments)
    const fullPath = `${this.baseUrl}${path}`;
    const url = new URL(fullPath);

    // Add query parameters
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Handle array parameters - append each value separately
          if (Array.isArray(value)) {
            value.forEach((item) => {
              url.searchParams.append(key, String(item));
            });
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge custom headers if provided
    if (options.headers) {
      const customHeaders = new Headers(options.headers);
      customHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    }

    // Add auth header if token exists
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = (await response.json()) as APIErrorResponse;
      throw new ApiError(
        errorData.error.code,
        errorData.error.message,
        response.status,
        errorData.error.trace_id
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  /**
   * GET request
   */
  get<T>(path: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>('GET', path, { params });
  }

  /**
   * POST request
   */
  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, { body });
  }

  /**
   * PUT request
   */
  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', path, { body });
  }

  /**
   * PATCH request
   */
  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PATCH', path, { body });
  }

  /**
   * DELETE request
   */
  delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }
}

/**
 * Singleton API client instance
 */
export const apiClient = new ApiClient();
