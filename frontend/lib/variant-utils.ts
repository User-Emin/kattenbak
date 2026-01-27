/**
 * VARIANT UTILITIES - Maximaal DRY & MODULAIR
 * Single source of truth voor variant image priority logica
 * NO HARDCODE - Alles dynamisch via parameters
 */

import { ProductVariant } from '@/types/product';
import { getProductImage } from './image-config';

/**
 * ✅ HELPER: Filter valid images (geen placeholder, geen SVG data URLs) - DRY
 * Shared utility voor image filtering
 */
export function filterValidImages(images: string[]): string[] {
  return images.filter((img: string) => {
    // ✅ FILTER: Alleen geldige geüploade foto's (geen placeholder, geen SVG data URLs, geen oude paths)
    if (!img || typeof img !== 'string') return false;
    // Filter SVG data URLs (data:image/svg+xml)
    if (img.startsWith('data:image/svg+xml') || img.startsWith('data:')) return false;
    // Filter placeholder images
    if (img.includes('placeholder') || img.includes('demo') || img.includes('default')) return false;
    // Alleen geüploade foto's (van /uploads/ of /api/ of http/https)
    return img.startsWith('/uploads/') || img.startsWith('/api/') || img.startsWith('http://') || img.startsWith('https://');
  });
}

/**
 * ✅ VARIANT SYSTEM: Get variant image with priority (modulair, geen hardcode)
 * Priority: variant.images[0] (filtered) > previewImage (filtered) > colorImageUrl (filtered) > product.images[0]
 * 
 * @param variant - Product variant object
 * @param productImages - Fallback product images array
 * @returns Variant image URL or fallback product image (geen placeholder)
 */
export function getVariantImage(
  variant: ProductVariant | null | undefined,
  productImages?: string[] | null
): string | undefined {
  if (!variant) {
    const filtered = productImages ? filterValidImages(productImages) : [];
    return filtered.length > 0 ? filtered[0] : undefined;
  }

  // ✅ Priority 1: variant.images[0] (variant-specific images) - FILTERED
  if (variant.images && Array.isArray(variant.images) && variant.images.length > 0) {
    const filtered = filterValidImages(variant.images);
    if (filtered.length > 0) {
      return filtered[0];
    }
  }

  // ✅ Priority 2: previewImage (preview image for color selection) - FILTERED
  if (variant.previewImage) {
    const filtered = filterValidImages([variant.previewImage]);
    if (filtered.length > 0) {
      return filtered[0];
    }
  }

  // ✅ Priority 3: colorImageUrl (color preview image) - FILTERED
  if (variant.colorImageUrl) {
    const filtered = filterValidImages([variant.colorImageUrl]);
    if (filtered.length > 0) {
      return filtered[0];
    }
  }

  // ✅ Priority 4: Fallback to product images - FILTERED
  const filtered = productImages ? filterValidImages(productImages) : [];
  return filtered.length > 0 ? filtered[0] : undefined;
}

/**
 * ✅ VARIANT SYSTEM: Get display image (variant als maatstaf, fallback naar product)
 * Always use variant image as maatstaf if available, fallback to product image
 * 
 * @param variantImage - Variant image URL (from getVariantImage)
 * @param productImages - Fallback product images array
 * @returns Display image URL
 */
export function getDisplayImage(
  variantImage: string | undefined,
  productImages?: string[] | null
): string {
  // ✅ VARIANT SYSTEM: Always use variant image as maatstaf if available
  if (variantImage) {
    return variantImage;
  }

  // ✅ Fallback to product image
  return getProductImage(productImages);
}
