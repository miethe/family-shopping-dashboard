/**
 * Upload API
 *
 * Typed endpoint functions for image upload operations.
 * Supports both file upload and URL-based image import.
 */

import { apiClient } from './client';

/**
 * Response from image upload endpoint
 */
export interface UploadImageResponse {
  image_url: string;
  filename: string | null;
}

/**
 * Upload configuration from backend
 */
export interface UploadConfig {
  max_size_mb: number;
  allowed_types: string[];
}

/**
 * Request body for URL-based image upload
 */
export interface UploadImageFromUrlRequest {
  url: string;
}

/**
 * Upload API endpoints
 */
export const uploadApi = {
  /**
   * Upload an image file
   *
   * @param file - Image file to upload
   * @returns Promise with uploaded image URLs
   */
  uploadImage: async (file: File): Promise<UploadImageResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    // Client will automatically handle FormData and set proper Content-Type
    return apiClient.request<UploadImageResponse>('POST', '/upload/image', {
      body: formData as any, // FormData instead of JSON
    });
  },

  /**
   * Upload an image from a URL
   *
   * @param url - Remote image URL to import
   * @returns Promise with uploaded image URLs
   */
  uploadImageFromUrl: (url: string): Promise<UploadImageResponse> =>
    apiClient.post<UploadImageResponse>('/upload/image', { url }),

  /**
   * Get upload configuration (max size, allowed types)
   *
   * @returns Promise with upload configuration
   */
  getConfig: (): Promise<UploadConfig> =>
    apiClient.get<UploadConfig>('/upload/image/config'),
};
