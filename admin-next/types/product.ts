/**
 * PRODUCT TYPES - DRY & Backend Compatible
 * Exactly matches backend response structure
 */

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number;
  costPrice: number;
  stock: number;
  lowStockThreshold?: number;
  trackInventory: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images: string[];
  videoUrl?: string; // DRY: YouTube/Vimeo URL
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ProductFormData {
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  trackInventory: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images: string[];
  videoUrl?: string; // DRY: Video URL
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  categoryId?: string;
}

