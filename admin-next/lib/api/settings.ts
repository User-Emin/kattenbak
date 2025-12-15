/**
 * SITE SETTINGS API - Frontend
 * DRY interface voor site-wide configuratie
 */

import { apiClient } from './client';

export interface SiteSettings {
  id: string;
  hero: {
    title: string;
    subtitle: string;
    image: string;
  };
  usps: {
    title: string;
    feature1: {
      title: string;
      description: string;
      image: string;
    };
    feature2: {
      title: string;
      description: string;
      image: string;
    };
  };
  updatedAt: string;
}

/**
 * Get site settings
 */
export const getSettings = async (): Promise<SiteSettings> => {
  const response = await apiClient.get<{ success: boolean; data: SiteSettings }>('/admin/settings');
  return response.data.data;
};

/**
 * Update site settings (admin only)
 */
export const updateSettings = async (settings: Partial<SiteSettings>): Promise<SiteSettings> => {
  const response = await apiClient.put<{ success: boolean; data: SiteSettings }>('/admin/settings', settings);
  return response.data.data;
};



