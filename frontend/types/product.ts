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
  videoUrl: string | null;
  uspImage1: string | null;
  uspImage2: string | null;
  hasVariants: boolean;
  variants?: ProductVariant[];
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  isFeatured: boolean;
  isPreOrder: boolean;
  preOrderDiscount: number | null;
  releaseDate: string | null;
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

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  colorCode?: string;
  colorImageUrl?: string;
  priceAdjustment?: number;
  stock: number;
  images: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  items: Array<{
    productId: string;
    quantity: number;
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
  variantId?: string;
  productName: string;
  productSku: string;
  variantName?: string;
  variantColor?: string;
  price: number;
  quantity: number;
  subtotal: number;
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
