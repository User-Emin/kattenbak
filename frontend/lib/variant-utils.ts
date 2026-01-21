/**
 * VARIANT UTILITIES - Maximaal DRY & MODULAIR
 * Single source of truth voor variant image priority logica
 * NO HARDCODE - Alles dynamisch via parameters
 */

import { ProductVariant } from '@/types/product';
import { getProductImage } from './image-config';

/**
 * ✅ VARIANT SYSTEM: Get variant image with priority (modulair, geen hardcode)
 * Priority: variant.images[0] > previewImage > colorImageUrl > product.images[0]
 * 
 * @param variant - Product variant object
 * @param productImages - Fallback product images array
 * @returns Variant image URL or fallback product image
 */
export function getVariantImage(
  variant: ProductVariant | null | undefined,
  productImages?: string[] | null
): string | undefined {
  if (!variant) {
    return productImages && productImages.length > 0 ? productImages[0] : undefined;
  }

  // ✅ Priority 1: variant.images[0] (variant-specific images)
  if (variant.images && Array.isArray(variant.images) && variant.images.length > 0) {
    return variant.images[0] as string;
  }

  // ✅ Priority 2: previewImage (preview image for color selection)
  if (variant.previewImage) {
    return variant.previewImage;
  }

  // ✅ Priority 3: colorImageUrl (color preview image)
  if (variant.colorImageUrl) {
    return variant.colorImageUrl;
  }

  // ✅ Priority 4: Fallback to product images
  return productImages && productImages.length > 0 ? productImages[0] : undefined;
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
