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
  variants?: ProductVariant[]; // DRY: Color/size variants
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// ✅ VARIANT SYSTEM: Product Variant with colorCode and previewImage
export interface ProductVariant {
  id: string;
  productId?: string;
  name: string; // e.g. "Premium Wit"
  colorName?: string; // e.g. "Wit" (will be converted to colorCode)
  colorCode?: string; // e.g. "WIT", "ZWART", "GRIJS"
  colorHex?: string; // e.g. "#ffffff"
  previewImage?: string | null; // Preview image URL for variant selector
  colorImageUrl?: string | null; // Alias for previewImage (backend field name)
  priceAdjustment: number; // Price difference (+/- from base price)
  stock: number;
  sku: string;
  images: string[]; // Variant-specific images
  isActive?: boolean; // Optional field for backend compatibility
  sortOrder?: number; // Display order
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
  variants?: ProductVariant[]; // DRY: Variants
}

