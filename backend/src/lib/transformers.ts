/**
 * DATA TRANSFORMERS - Convert Prisma types to API types
 * DRY: Single source for all data transformations
 * Security: Ensures consistent data format
 */

import { Product, ProductVariant, Prisma } from '@prisma/client';

/**
 * Transform Prisma Decimal to number
 * Prisma Decimal → JSON string → number
 * Returns 0 for null/undefined to ensure valid number type
 */
const decimalToNumber = (decimal: Prisma.Decimal | null | undefined): number => {
  if (!decimal) return 0;
  return parseFloat(decimal.toString());
};

/**
 * Transform Product from Prisma to API format
 * Converts all Decimal fields to numbers
 */
export const transformProduct = (product: any): any => {
  return {
    ...product,
    price: decimalToNumber(product.price),
    compareAtPrice: decimalToNumber(product.compareAtPrice),
    costPrice: decimalToNumber(product.costPrice),
    weight: decimalToNumber(product.weight),
    // Transform variants if included
    variants: product.variants?.map(transformVariant),
  };
};

/**
 * Transform ProductVariant from Prisma to API format
 * Maps priceAdjustment to both priceAdjustment AND price for frontend compatibility
 */
export const transformVariant = (variant: any): any => {
  const adjustment = decimalToNumber(variant.priceAdjustment);
  return {
    ...variant,
    priceAdjustment: adjustment,
    price: adjustment, // Frontend expects 'price'
    sortOrder: variant.sortOrder || 0,
  };
};

/**
 * Transform array of products
 */
export const transformProducts = (products: any[]): any[] => {
  return products.map(transformProduct);
};

/**
 * Transform Order with price fields
 */
export const transformOrder = (order: any): any => {
  return {
    ...order,
    subtotal: decimalToNumber(order.subtotal),
    shippingCost: decimalToNumber(order.shippingCost),
    tax: decimalToNumber(order.tax),
    discount: decimalToNumber(order.discount),
    total: decimalToNumber(order.total),
  };
};

/**
 * Transform array of orders
 */
export const transformOrders = (orders: any[]): any[] => {
  return orders.map(transformOrder);
};
