import { Decimal } from '@prisma/client/runtime/library';

/**
 * Utility to serialize Prisma models for JSON responses
 * Converts Decimal types to numbers and handles other transformations
 */

export function serializeProduct(product: any): any {
  if (!product) return null;

  return {
    ...product,
    // Convert Decimal fields to numbers
    price: product.price instanceof Decimal ? parseFloat(product.price.toString()) : product.price,
    compareAtPrice: product.compareAtPrice instanceof Decimal ? parseFloat(product.compareAtPrice.toString()) : product.compareAtPrice,
    costPrice: product.costPrice instanceof Decimal ? parseFloat(product.costPrice.toString()) : product.costPrice,
    weight: product.weight instanceof Decimal ? parseFloat(product.weight.toString()) : product.weight,
    preOrderDiscount: product.preOrderDiscount instanceof Decimal ? parseFloat(product.preOrderDiscount.toString()) : product.preOrderDiscount,
    
    // Serialize variants if present
    variants: product.variants ? product.variants.map((variant: any) => ({
      ...variant,
      priceAdjustment: variant.priceAdjustment instanceof Decimal 
        ? parseFloat(variant.priceAdjustment.toString()) 
        : variant.priceAdjustment,
    })) : undefined,
    
    // Convert dates to ISO strings
    createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt,
    updatedAt: product.updatedAt instanceof Date ? product.updatedAt.toISOString() : product.updatedAt,
    publishedAt: product.publishedAt instanceof Date ? product.publishedAt.toISOString() : product.publishedAt,
    releaseDate: product.releaseDate instanceof Date ? product.releaseDate.toISOString() : product.releaseDate,
  };
}

export function serializeProducts(products: any[]): any[] {
  return products.map(serializeProduct);
}

export function serializeVariant(variant: any): any {
  if (!variant) return null;

  return {
    ...variant,
    priceAdjustment: variant.priceAdjustment instanceof Decimal 
      ? parseFloat(variant.priceAdjustment.toString()) 
      : variant.priceAdjustment,
    createdAt: variant.createdAt instanceof Date ? variant.createdAt.toISOString() : variant.createdAt,
    updatedAt: variant.updatedAt instanceof Date ? variant.updatedAt.toISOString() : variant.updatedAt,
  };
}

export function serializeVariants(variants: any[]): any[] {
  return variants.map(serializeVariant);
}
