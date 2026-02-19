/**
 * DATA TRANSFORMERS - Convert Prisma types to API types
 * DRY: Single source for all data transformations
 * Security: Ensures consistent data format
 */

import { Product, ProductVariant, Prisma, PrismaClient } from '@prisma/client';

/** Normalise order status voor admin API (lowercase, compatibel met frontend type) – DRY, geen hardcode */
export function normalizeOrderStatus(s: string | undefined | null): string {
  if (!s) return 'pending';
  const u = String(s).toUpperCase();
  const map: Record<string, string> = {
    PENDING: 'pending',
    PAYMENT_PENDING: 'pending',
    PAID: 'processing',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'cancelled',
  };
  return map[u] ?? s.toLowerCase();
}

/** Normalise payment status voor admin API (lowercase, direct na Mollie webhook zichtbaar) – DRY */
export function normalizePaymentStatus(s: string | undefined | null): string {
  if (!s) return 'pending';
  const u = String(s).toUpperCase();
  const map: Record<string, string> = {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    CANCELLED: 'failed',
    REFUNDED: 'refunded',
    EXPIRED: 'failed',
  };
  return map[u] ?? s.toLowerCase();
}
import { decimalToNumber } from '../utils/price.util'; // ✅ DRY: Use shared utility
import { getVariantImage, getDisplayImage } from '../utils/variant.util'; // ✅ VARIANT SYSTEM: Shared utility (modulair, geen hardcode)

// ✅ VARIANT SYSTEM: Shared Prisma client instance for variant image fetching (modulair)
const prisma = new PrismaClient();

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
    previewImage: getVariantImage(variant), // ✅ VARIANT SYSTEM: Via shared utility (modulair, geen hardcode)
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
  'BRUIN': '#8B4513',
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
 * ✅ VARIANT SYSTEM: Now async to fetch variant images dynamically
 */
export const transformOrder = async (order: any): Promise<any> => {
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

    // ✅ VARIANT SYSTEM: Transform order items to include variant info and variant image (modulair, geen hardcode)
    const transformedItems = order.items && Array.isArray(order.items) 
      ? (await Promise.all(order.items.map(async (item: any) => {
        try {
          // ✅ VARIANT SYSTEM: Get variant image if variantId is available (modulair, geen hardcode)
          // Priority: variant.images[0] > variant.colorImageUrl > product.images[0]
          let variantImage: string | null = null;
          const variantId = item.variantId || item.variant_id || null;
          
          // ✅ VARIANT SYSTEM: Fetch variant image if variantId exists (modulair via Prisma, geen hardcode)
          if (variantId && !item.variant) {
            try {
              const variant = await prisma.productVariant.findUnique({
                where: { id: variantId },
                select: {
                  images: true,
                  colorImageUrl: true,
                },
              });
              
              if (variant) {
                // ✅ VARIANT SYSTEM: Get variant image via shared utility (modulair, geen hardcode)
                variantImage = getVariantImage(variant);
              }
            } catch (variantError: any) {
              // Silent fail - variant image is optional (geen dataverlies)
              console.warn('⚠️ Could not fetch variant image:', variantError.message);
            }
          } else if (item.variant) {
            // Variant is already included in query
            variantImage = getVariantImage(item.variant);
          }
          
          // ✅ VARIANT SYSTEM: Display image via shared utility (modulair, geen hardcode)
          const productImages = item.product?.images && Array.isArray(item.product.images) ? item.product.images : [];
          const displayImage = getDisplayImage(variantImage, productImages);
          
          return {
            id: item.id || 'unknown',
            productId: item.productId || null,
            productName: item.productName || item.product?.name || 'Onbekend product',
            productSku: item.productSku || item.product?.sku || null,
            quantity: item.quantity || 0,
            price: decimalToNumber(item.price),
            subtotal: decimalToNumber(item.subtotal || (item.price && item.quantity ? item.price * item.quantity : 0)),
            // ✅ VARIANT SYSTEM: Include variant info if present (modulair, geen hardcode)
            // Database has variant_id, variant_name, variant_color (NOT variant_sku)
            variantId: variantId,
            variantName: item.variantName || item.variant_name || null,
            variantSku: item.variantColor || item.variant_color || null, // Use variant_color as SKU fallback
            variantColor: item.variantColor || item.variant_color || null,
            variantImage: variantImage, // ✅ VARIANT SYSTEM: Variant-specific image (modulair)
            product: item.product ? {
              id: item.product.id,
              name: item.product.name,
              images: productImages,
            } : null,
            // ✅ VARIANT SYSTEM: Display image - altijd variant image als maatstaf indien beschikbaar
            displayImage: displayImage,
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
      })))
      : [];
    
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
      status: normalizeOrderStatus(order.status || 'PENDING'),
      paymentStatus: normalizePaymentStatus(order.payment?.status || order.paymentStatus || 'PENDING'),
      // ✅ VARIANT SYSTEM: Use transformed items with variant images
      items: transformedItems,
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
      // ✅ FIX: Include payment info if available (status genormaliseerd voor admin)
      payment: order.payment ? {
        id: order.payment.id,
        status: normalizePaymentStatus(order.payment.status),
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
export const transformOrders = async (orders: any[]): Promise<any[]> => {
  if (!Array.isArray(orders)) {
    console.warn('⚠️ transformOrders: Invalid input, expected array', { orders });
    return [];
  }
  
  return Promise.all(orders.map(async (order: any) => {
    try {
      return await transformOrder(order);
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
  }));
};
