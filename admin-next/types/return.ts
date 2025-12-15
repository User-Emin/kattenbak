/**
 * SHARED TYPES - RETURNS
 * DRY: Single source of truth voor frontend
 * Sync met backend validation schemas
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENUMS (DRY: Match backend exactly)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export enum ReturnStatus {
  REQUESTED = 'REQUESTED',
  LABEL_CREATED = 'LABEL_CREATED',
  LABEL_SENT = 'LABEL_SENT',
  IN_TRANSIT = 'IN_TRANSIT',
  RECEIVED = 'RECEIVED',
  INSPECTED = 'INSPECTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REFUND_PENDING = 'REFUND_PENDING',
  REFUND_PROCESSED = 'REFUND_PROCESSED',
  CLOSED = 'CLOSED',
}

export enum ReturnReason {
  DEFECTIVE = 'DEFECTIVE',
  WRONG_ITEM = 'WRONG_ITEM',
  NOT_AS_DESCRIBED = 'NOT_AS_DESCRIBED',
  CHANGED_MIND = 'CHANGED_MIND',
  DAMAGED_SHIPPING = 'DAMAGED_SHIPPING',
  OTHER = 'OTHER',
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DISPLAY LABELS (DRY: Centralized translations)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  [ReturnStatus.REQUESTED]: 'Aangevraagd',
  [ReturnStatus.LABEL_CREATED]: 'Label gemaakt',
  [ReturnStatus.LABEL_SENT]: 'Email verstuurd',
  [ReturnStatus.IN_TRANSIT]: 'Onderweg',
  [ReturnStatus.RECEIVED]: 'Ontvangen',
  [ReturnStatus.INSPECTED]: 'Geïnspecteerd',
  [ReturnStatus.APPROVED]: 'Goedgekeurd',
  [ReturnStatus.REJECTED]: 'Afgekeurd',
  [ReturnStatus.REFUND_PENDING]: 'Terugbetaling in behandeling',
  [ReturnStatus.REFUND_PROCESSED]: 'Terugbetaald',
  [ReturnStatus.CLOSED]: 'Afgerond',
};

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  [ReturnReason.DEFECTIVE]: 'Product is defect',
  [ReturnReason.WRONG_ITEM]: 'Verkeerd artikel ontvangen',
  [ReturnReason.NOT_AS_DESCRIBED]: 'Niet zoals beschreven',
  [ReturnReason.CHANGED_MIND]: 'Van gedachten veranderd',
  [ReturnReason.DAMAGED_SHIPPING]: 'Beschadigd tijdens verzending',
  [ReturnReason.OTHER]: 'Anders',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERFACES (Type-safe)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ReturnItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  street: string;
  houseNumber: string;
  addition?: string;
  postalCode: string;
  city: string;
  country: string;
  phone?: string;
}

export interface CreateReturnRequest {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  reason: ReturnReason;
  reasonDetails?: string;
  items: ReturnItem[];
  customerNotes?: string;
  customerPhotos?: string[];
  sendEmail?: boolean;
}

export interface Return {
  id: string;
  orderId: string;
  myparcelId?: number;
  trackingCode?: string;
  trackingUrl?: string;
  labelUrl?: string;
  reason: ReturnReason;
  reasonDetails?: string;
  status: ReturnStatus;
  items: ReturnItem[];
  refundAmount?: number;
  customerNotes?: string;
  adminNotes?: string;
  emailSentAt?: string;
  createdAt: string;
  updatedAt: string;
  receivedAt?: string;
  refundedAt?: string;
  closedAt?: string;
}

export interface ReturnEligibility {
  eligible: boolean;
  reason?: string;
  returnDeadline?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// API RESPONSE TYPES (DRY)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
  message?: string;
}

export interface CreateReturnResponse {
  returnId: string;
  myparcelId?: number;
  trackingCode?: string;
  trackingUrl?: string;
  labelUrl?: string;
  emailSent: boolean;
  createdAt: string;
}
