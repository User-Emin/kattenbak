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
 * ✅ FIXED: Upload single image file
 * Backend expects field name 'images' (multer config: upload.array('images', 10))
 * Returns public URL that can be saved in database
 */
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('images', file); // ✅ FIX 1: Changed 'file' → 'images'

  const response = await apiClient.post<{ success: boolean; data: UploadResponse[] }>(
    '/admin/upload/images', // ✅ FIX 2: Correct endpoint
    formData
    // ✅ FIX 3: Removed Content-Type header (let Axios set it + boundary)
  );

  // ✅ Backend returns array, take first item
  return response.data.data[0].url;
};

/**
 * DRY: Upload multiple images
 * Returns array of public URLs
 */
export const uploadImages = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadImage(file));
  return Promise.all(uploadPromises);
};




