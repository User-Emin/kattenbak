export interface ReturnItem {
  id: string;
  orderId: string;
  orderNumber?: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  price: number;
  reason?: string;
  status?: string;
  createdAt?: Date;
}

