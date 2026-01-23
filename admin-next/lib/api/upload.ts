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
 * ✅ SECURITY: Comprehensive error handling with detailed messages
 */
export const uploadImage = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('images', file); // ✅ FIX 1: Changed 'file' → 'images'

    const response = await apiClient.post<{ success: boolean; data: UploadResponse[] }>(
      '/admin/upload/images', // ✅ FIX 2: Correct endpoint
      formData,
      {
        timeout: 60000, // ✅ UPLOAD: 60 seconden timeout voor file uploads
        headers: {
          // ✅ FIX: Don't set Content-Type - let browser set multipart/form-data with boundary
        },
      }
    );

    // ✅ Backend returns array, take first item
    if (!response.data?.data || response.data.data.length === 0) {
      throw new Error('Geen afbeelding URL ontvangen van server');
    }
    
    return response.data.data[0].url;
  } catch (error: any) {
    // ✅ SECURITY: Enhanced error handling
    if (error?.status === 0 || error?.code === 'ERR_NETWORK') {
      throw new Error('Netwerkfout: Kan geen verbinding maken met de server. Controleer je internetverbinding.');
    }
    if (error?.status === 401) {
      throw new Error('Niet geautoriseerd. Log opnieuw in.');
    }
    if (error?.status === 413) {
      const maxSizeMB = error?.details?.maxSizeMB || 20;
      const errorMessage = error?.details?.error || error?.message || `Bestand te groot. Maximum ${maxSizeMB}MB per afbeelding.`;
      throw new Error(errorMessage);
    }
    if (error?.status === 500) {
      throw new Error(error?.details?.error || error?.message || 'Serverfout bij uploaden. Probeer opnieuw.');
    }
    throw error;
  }
};

/**
 * ✅ STABLE: Upload multiple images with retry mechanism and queue management
 * Returns array of public URLs
 * Prevents haperen (stuttering) by processing uploads sequentially with proper error handling
 */
export const uploadImages = async (files: File[]): Promise<string[]> => {
  const uploadedUrls: string[] = [];
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second between retries
  
  // ✅ STABLE: Process uploads sequentially to prevent haperen (not parallel)
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    let retries = 0;
    let success = false;
    
    while (retries < MAX_RETRIES && !success) {
      try {
        const url = await uploadImage(file);
        uploadedUrls.push(url);
        success = true;
      } catch (error: any) {
        retries++;
        
        if (retries >= MAX_RETRIES) {
          // ✅ ERROR HANDLING: If all retries failed, throw error with file name
          throw new Error(`Upload mislukt voor ${file.name} na ${MAX_RETRIES} pogingen: ${error?.message || 'Onbekende fout'}`);
        }
        
        // ✅ RETRY: Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retries));
      }
    }
  }
  
  return uploadedUrls;
};




