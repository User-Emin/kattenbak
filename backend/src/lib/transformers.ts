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
 * Transform Order with price fields and address info
 * ✅ CRITICAL: Includes all address fields for admin panel
 */
export const transformOrder = (order: any): any => {
  return {
    ...order,
    subtotal: decimalToNumber(order.subtotal),
    shippingCost: decimalToNumber(order.shippingCost),
    tax: decimalToNumber(order.tax),
    discount: decimalToNumber(order.discount),
    total: decimalToNumber(order.total),
    // ✅ FIX: Ensure shippingAddress and billingAddress are included
    shippingAddress: order.shippingAddress ? {
      firstName: order.shippingAddress.firstName,
      lastName: order.shippingAddress.lastName,
      street: order.shippingAddress.street,
      houseNumber: order.shippingAddress.houseNumber,
      addition: order.shippingAddress.addition,
      postalCode: order.shippingAddress.postalCode,
      city: order.shippingAddress.city,
      country: order.shippingAddress.country,
      phone: order.shippingAddress.phone,
    } : null,
    billingAddress: order.billingAddress ? {
      firstName: order.billingAddress.firstName,
      lastName: order.billingAddress.lastName,
      street: order.billingAddress.street,
      houseNumber: order.billingAddress.houseNumber,
      addition: order.billingAddress.addition,
      postalCode: order.billingAddress.postalCode,
      city: order.billingAddress.city,
      country: order.billingAddress.country,
      phone: order.billingAddress.phone,
    } : null,
  };
};

/**
 * Transform array of orders
 */
export const transformOrders = (orders: any[]): any[] => {
  return orders.map(transformOrder);
};
