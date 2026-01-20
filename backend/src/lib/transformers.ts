/**
 * DATA TRANSFORMERS - Convert Prisma types to API types
 * DRY: Single source for all data transformations
 * Security: Ensures consistent data format
 */

import { Product, ProductVariant, Prisma } from '@prisma/client';
import { decimalToNumber } from '../utils/price.util'; // ✅ DRY: Use shared utility

/**
 * Transform Product from Prisma to API format
 * Converts all Decimal fields to numbers
 */
export const transformProduct = (product: any): any => {
  return {
    ...product,
    price: decimalToNumber(product.price),
    // ✅ FIX: Preserve null for optional fields (don't convert to 0)
    compareAtPrice: product.compareAtPrice !== null && product.compareAtPrice !== undefined 
      ? decimalToNumber(product.compareAtPrice) 
      : null,
    costPrice: product.costPrice !== null && product.costPrice !== undefined
      ? decimalToNumber(product.costPrice)
      : null,
    weight: product.weight !== null && product.weight !== undefined
      ? decimalToNumber(product.weight)
      : null,
    // ✅ FIX: Preserve null for dimensions (don't convert to {length: 0, ...})
    dimensions: product.dimensions || null,
    // Transform variants if included
    variants: product.variants?.map(transformVariant),
  };
};

/**
 * Transform ProductVariant from Prisma to API format
 * Maps priceAdjustment to both priceAdjustment AND price for frontend compatibility
 * ✅ VARIANT SYSTEM: Includes colorCode and colorImageUrl for preview images
 */
export const transformVariant = (variant: any): any => {
  const adjustment = decimalToNumber(variant.priceAdjustment);
  return {
    ...variant,
    priceAdjustment: adjustment,
    price: adjustment, // Frontend expects 'price'
    sortOrder: variant.sortOrder || 0,
    // ✅ VARIANT SYSTEM: Include color information and preview image
    colorName: variant.colorCode || variant.name, // Fallback to name if no colorCode
    colorHex: variant.colorCode ? getColorHex(variant.colorCode) : null, // Convert color code to hex
    previewImage: variant.colorImageUrl || (Array.isArray(variant.images) && variant.images.length > 0 ? variant.images[0] : null),
  };
};

/**
 * ✅ VARIANT SYSTEM: Convert color code to hex color
 * Security: Whitelist only known color codes to prevent injection
 */
const COLOR_CODE_TO_HEX: Record<string, string> = {
  'WIT': '#FFFFFF',
  'ZWART': '#000000',
  'GRIJS': '#808080',
  'ZILVER': '#C0C0C0',
  'BEIGE': '#F5F5DC',
  'BLAUW': '#0000FF',
  'ROOD': '#FF0000',
  'GROEN': '#008000',
};

const getColorHex = (colorCode: string | null | undefined): string | null => {
  if (!colorCode) return null;
  const upperCode = colorCode.toUpperCase();
  return COLOR_CODE_TO_HEX[upperCode] || null; // ✅ SECURITY: Only return whitelisted colors
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
 * ✅ VARIANT SYSTEM: Includes variant info in order items
 * ✅ SECURITY: Defensive error handling - never throw, always return valid object
 */
export const transformOrder = (order: any): any => {
  try {
    // ✅ SECURITY: Defensive null/undefined checks
    if (!order || typeof order !== 'object') {
      console.warn('⚠️ transformOrder: Invalid order input', { order });
      return {
        id: 'unknown',
        orderNumber: 'UNKNOWN',
        customerEmail: '',
        total: 0,
        subtotal: 0,
        shippingCost: 0,
        tax: 0,
        discount: 0,
        status: 'UNKNOWN',
        items: [],
        shippingAddress: null,
        billingAddress: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      ...order,
      // ✅ SECURITY: Preserve orderNumber (critical for admin)
      orderNumber: order.orderNumber || `ORDER-${order.id?.substring(0, 8) || 'UNKNOWN'}`,
      customerEmail: order.customerEmail || '',
      customerPhone: order.customerPhone || null,
      customerName: order.customerName || (order.shippingAddress 
        ? `${order.shippingAddress.firstName || ''} ${order.shippingAddress.lastName || ''}`.trim()
        : null),
      subtotal: decimalToNumber(order.subtotal),
      shippingCost: decimalToNumber(order.shippingCost),
      tax: decimalToNumber(order.tax),
      discount: decimalToNumber(order.discount),
      total: decimalToNumber(order.total),
      status: order.status || 'PENDING',
      paymentStatus: order.payment?.status || order.paymentStatus || 'PENDING',
      // ✅ VARIANT SYSTEM: Transform order items to include variant info
      items: order.items && Array.isArray(order.items) ? order.items.map((item: any) => {
        try {
          return {
            id: item.id || 'unknown',
            productId: item.productId || null,
            productName: item.productName || item.product?.name || 'Onbekend product',
            productSku: item.productSku || item.product?.sku || null,
            quantity: item.quantity || 0,
            price: decimalToNumber(item.price),
            subtotal: decimalToNumber(item.subtotal || (item.price && item.quantity ? item.price * item.quantity : 0)),
            // ✅ VARIANT SYSTEM: Include variant info if present
            variantId: item.variantId || null,
            variantName: item.variantName || null,
            variantSku: item.variantSku || null,
            product: item.product ? {
              id: item.product.id,
              name: item.product.name,
              images: item.product.images || [],
            } : null,
          };
        } catch (itemError: any) {
          console.warn('⚠️ transformOrder: Error transforming item', { item, error: itemError.message });
          return {
            id: item.id || 'unknown',
            productId: item.productId || null,
            productName: 'Error loading product',
            quantity: 0,
            price: 0,
            subtotal: 0,
          };
        }
      }) : [],
      // ✅ FIX: Ensure shippingAddress and billingAddress are included
      shippingAddress: order.shippingAddress ? {
        firstName: order.shippingAddress.firstName || '',
        lastName: order.shippingAddress.lastName || '',
        street: order.shippingAddress.street || '',
        houseNumber: order.shippingAddress.houseNumber || '',
        addition: order.shippingAddress.addition || null,
        postalCode: order.shippingAddress.postalCode || '',
        city: order.shippingAddress.city || '',
        country: order.shippingAddress.country || 'NL',
        phone: order.shippingAddress.phone || null,
      } : null,
      billingAddress: order.billingAddress ? {
        firstName: order.billingAddress.firstName || '',
        lastName: order.billingAddress.lastName || '',
        street: order.billingAddress.street || '',
        houseNumber: order.billingAddress.houseNumber || '',
        addition: order.billingAddress.addition || null,
        postalCode: order.billingAddress.postalCode || '',
        city: order.billingAddress.city || '',
        country: order.billingAddress.country || 'NL',
        phone: order.billingAddress.phone || null,
      } : null,
      // ✅ FIX: Ensure dates are strings
      createdAt: order.createdAt ? (order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt) : new Date().toISOString(),
      updatedAt: order.updatedAt ? (order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt) : new Date().toISOString(),
      // ✅ FIX: Include payment info if available
      payment: order.payment ? {
        id: order.payment.id,
        status: order.payment.status,
        mollieId: order.payment.mollieId || null,
      } : null,
    };
  } catch (error: any) {
    // ✅ SECURITY: Never throw - always return valid object
    console.error('❌ transformOrder: Critical error', { error: error.message, orderId: order?.id });
    return {
      id: order?.id || 'error',
      orderNumber: order?.orderNumber || 'ERROR',
      customerEmail: order?.customerEmail || '',
      total: 0,
      subtotal: 0,
      shippingCost: 0,
      tax: 0,
      discount: 0,
      status: 'ERROR',
      items: [],
      shippingAddress: null,
      billingAddress: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _error: 'Transform error - data may be incomplete',
    };
  }
};

/**
 * Transform array of orders
 * ✅ SECURITY: Defensive error handling - never throw, always return array
 */
export const transformOrders = (orders: any[]): any[] => {
  if (!Array.isArray(orders)) {
    console.warn('⚠️ transformOrders: Invalid input, expected array', { orders });
    return [];
  }
  
  return orders.map((order: any) => {
    try {
      return transformOrder(order);
    } catch (error: any) {
      console.warn('⚠️ transformOrders: Error transforming order', { orderId: order?.id, error: error.message });
      // ✅ SECURITY: Return minimal valid order object instead of throwing
      return {
        id: order?.id || 'unknown',
        orderNumber: order?.orderNumber || 'UNKNOWN',
        customerEmail: order?.customerEmail || '',
        total: 0,
        status: order?.status || 'ERROR',
        items: [],
        _error: 'Transform failed',
      };
    }
  });
};
