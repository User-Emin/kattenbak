export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  weight: number | null;
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
  } | null;
  images: string[];
  heroVideoUrl?: string | null; // 10-20MB MP4 for homepage hero background
  videoUrl?: string | null; // 20-50MB MP4 for product demo + "Zie Het in Actie" (DRY)
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  isFeatured: boolean;
  variants?: ProductVariant[]; // DRY: Color/size variants
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

// DRY: Product Variant (Color/Size)
// ✅ VARIANT SYSTEM: Includes preview image for color selection
export interface ProductVariant {
  id: string;
  productId?: string;
  name: string; // e.g. "Premium Wit"
  colorName?: string; // e.g. "Wit" (from colorCode)
  colorHex?: string | null; // e.g. "#ffffff" (converted from colorCode)
  colorCode?: string | null; // e.g. "WIT", "ZWART"
  previewImage?: string | null; // Preview image URL for this color variant
  priceAdjustment?: number; // Price difference (+/- from base price)
  price: number; // Price difference (+/- from base price)
  stock: number;
  sku: string;
  images: string[]; // Variant-specific images
  sortOrder?: number; // Display order
  isActive?: boolean;
}

export interface CreateOrderData {
  items: Array<{
    productId: string;
    quantity: number;
    // ✅ VARIANT SYSTEM: Variant info (optional)
    variantId?: string;
    variantName?: string;
    variantSku?: string;
  }>;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    houseNumber: string;
    addition?: string;
    postalCode: string;
    city: string;
    country: string;
    phone?: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    street: string;
    houseNumber: string;
    addition?: string;
    postalCode: string;
    city: string;
    country: string;
    phone?: string;
  };
  customerNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerPhone: string | null;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
  customerNotes: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  items: OrderItem[];
  payment?: Payment;
  shipment?: any;
  shippingAddress?: Address;
  billingAddress?: Address;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  price: number;
  quantity: number;
  subtotal: number;
  // ✅ VARIANT SYSTEM: Variant info (optional)
  variantId?: string;
  variantName?: string;
  variantSku?: string;
  product: Product;
}

export interface Payment {
  id: string;
  orderId: string;
  mollieId: string | null;
  amount: number;
  currency: string;
  method: string | null;
  status: string;
  checkoutUrl: string | null;
  webhookUrl: string | null;
  redirectUrl: string | null;
  description: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  expiresAt: string | null;
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  street: string;
  houseNumber: string;
  addition: string | null;
  postalCode: string;
  city: string;
  country: string;
  phone: string | null;
}
