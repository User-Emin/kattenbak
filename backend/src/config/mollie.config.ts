/**
 * MOLLIE PAYMENT CONFIGURATION
 * Single source of truth: redirect, metadata keys, description.
 * Geen hardcode – alle URLs worden opgebouwd uit env; keys herbruikbaar.
 */

/** Query parameter name for order ID in success redirect (backend + frontend gelijk) */
export const MOLLIE_QUERY_ORDER_ID = 'order' as const;

/** Success page path (zonder domain) */
export const MOLLIE_SUCCESS_PATH = '/success' as const;

/** Prefix voor payment description in Mollie dashboard (herkenning bestelling) */
export const MOLLIE_DESCRIPTION_PREFIX = 'Bestelling' as const;

/** Metadata keys in Mollie payment (voor webhook/herkenning) */
export const MOLLIE_METADATA_KEYS = {
  ORDER_ID: 'orderId',
  ORDER_NUMBER: 'orderNumber',
} as const;

/** Bouw redirect URL voor succespagina (gebruik env.FRONTEND_URL) */
export function buildMollieRedirectUrl(frontendUrl: string, orderId: string): string {
  const base = frontendUrl.replace(/\/$/, '');
  const path = MOLLIE_SUCCESS_PATH.startsWith('/') ? MOLLIE_SUCCESS_PATH : `/${MOLLIE_SUCCESS_PATH}`;
  return `${base}${path}?${MOLLIE_QUERY_ORDER_ID}=${encodeURIComponent(orderId)}`;
}

/** Bouw payment description voor Mollie (herkenning als bestelling) */
export function buildMollieDescription(orderNumber: string): string {
  return `${MOLLIE_DESCRIPTION_PREFIX} ${orderNumber}`;
}
