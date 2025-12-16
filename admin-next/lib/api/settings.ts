/**
 * SITE SETTINGS API - Frontend
 * DRY interface voor site-wide configuratie
 * SYNC: Backend interface (mock-settings.ts)
 */

import { apiClient } from './client';

export interface SiteSettings {
  id: string;
  // Hero Section
  hero: {
    title: string;
    subtitle: string;
    image: string;
    videoUrl?: string; // DRY: Optional hero video
  };
  // USP Section - Homepage
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
  // Product Detail USPs - DRY: 2 USPs (zigzag layout)
  productUsps: {
    usp1: {
      icon: 'sparkles' | 'shield' | 'truck' | 'star' | 'check' | 'zap' | 'package';
      color: 'orange' | 'blue' | 'brand' | 'accent';
      title: string;
      description: string;
      image: string;
    };
    usp2: {
      icon: 'sparkles' | 'shield' | 'truck' | 'star' | 'check' | 'zap' | 'package';
      color: 'orange' | 'blue' | 'brand' | 'accent';
      title: string;
      description: string;
      image: string;
    };
  };
  // Product Specifications - 6 specs
  productSpecs: {
    spec1: { icon: 'sparkles'; label: string; value: string; };
    spec2: { icon: 'shield-check'; label: string; value: string; };
    spec3: { icon: 'smartphone'; label: string; value: string; };
    spec4: { icon: 'package'; label: string; value: string; highlight?: boolean; };
    spec5: { icon: 'volume-x'; label: string; value: string; };
    spec6: { icon: 'layers'; label: string; value: string; };
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



