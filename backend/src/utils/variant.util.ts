/**
 * VARIANT UTILITIES - Maximaal DRY & MODULAIR
 * Single source of truth voor variant image priority logica (backend)
 * NO HARDCODE - Alles dynamisch via parameters
 */

/**
 * ✅ VARIANT SYSTEM: Get variant image with priority (modulair, geen hardcode)
 * Priority: variant.images[0] > colorImageUrl > null
 * 
 * @param variant - Product variant object from Prisma
 * @returns Variant image URL or null
 */
export function getVariantImage(variant: {
  images?: any;
  colorImageUrl?: string | null;
} | null | undefined): string | null {
  if (!variant) {
    return null;
  }

  // ✅ Priority 1: variant.images[0] (variant-specific images)
  if (variant.images && Array.isArray(variant.images) && variant.images.length > 0) {
    return variant.images[0] as string;
  }

  // ✅ Priority 2: colorImageUrl (color preview image)
  if (variant.colorImageUrl) {
    return variant.colorImageUrl;
  }

  return null;
}

/**
 * ✅ VARIANT SYSTEM: Get display image (variant als maatstaf, fallback naar product)
 * Always use variant image as maatstaf if available, fallback to product image
 * 
 * @param variantImage - Variant image URL (from getVariantImage)
 * @param productImages - Fallback product images array
 * @returns Display image URL or null
 */
export function getDisplayImage(
  variantImage: string | null,
  productImages?: string[] | null
): string | null {
  // ✅ VARIANT SYSTEM: Always use variant image as maatstaf if available
  if (variantImage) {
    return variantImage;
  }

  // ✅ Fallback to product image
  if (productImages && Array.isArray(productImages) && productImages.length > 0) {
    return productImages[0] as string;
  }

  return null;
}
