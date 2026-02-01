/**
 * ORDER & PAYMENT STATUS CONFIG – DRY, geen hardcode
 * Centraal beheer van labels en badge-variants voor admin orders.
 * Betalingsstatus wordt direct na Mollie webhook zichtbaar (backend normaliseert naar lowercase).
 */

import type { Order } from '@/types/common';

export const ORDER_STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'In afwachting',
  processing: 'Verwerken',
  shipped: 'Verzonden',
  delivered: 'Afgeleverd',
  cancelled: 'Geannuleerd',
};

export const ORDER_STATUS_VARIANTS: Record<Order['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  processing: 'default',
  shipped: 'default',
  delivered: 'outline',
  cancelled: 'destructive',
};

export const PAYMENT_STATUS_LABELS: Record<Order['paymentStatus'], string> = {
  pending: 'Niet betaald',
  paid: 'Betaald',
  failed: 'Mislukt',
  refunded: 'Terugbetaald',
};

export const PAYMENT_STATUS_VARIANTS: Record<Order['paymentStatus'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  paid: 'default',
  failed: 'destructive',
  refunded: 'outline',
};
