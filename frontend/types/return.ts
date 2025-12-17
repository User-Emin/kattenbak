export interface ReturnItem {
  id: string;
  orderId: string;
  orderNumber?: string;
  productId: string;
  productName: string;
  productSku: string;
  productImage?: string; // ← ADDED for return-item-selector
  quantity: number;
  price: number;
  reason?: string;
  status?: string;
  createdAt?: Date;
}
