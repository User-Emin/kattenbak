/**
 * IMAGE UPLOAD API - DRY File Upload Handler
 * Transparant: Upload files → Get public URLs
 */

import { apiClient } from './client';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

/**
 * DRY: Upload single image file
 * Returns public URL that can be saved in database
 */
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<{ success: boolean; data: UploadResponse }>(
    '/admin/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.data.url;
};

/**
 * DRY: Upload multiple images
 * Returns array of public URLs
 */
export const uploadImages = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadImage(file));
  return Promise.all(uploadPromises);
};




