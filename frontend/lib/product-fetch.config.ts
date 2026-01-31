/**
 * PRODUCT FETCH CONFIG – Slimme variabelen (geen magic values)
 * Retry, delays en gebruikersmessages voor productdetail.
 * Beleid: LEAKAGE PREVENTION (generic errors), CODE QUALITY (centralized constants).
 */

export const PRODUCT_FETCH_CONFIG = {
  /** Max retries bij 5xx / netwerk (exponential backoff) */
  MAX_RETRIES: 5,
  /** Basis delay ms tussen retries */
  RETRY_DELAY_MS: 1000,
  /** Multiplier voor delay bij 429 (rate limit) */
  RATE_LIMIT_DELAY_MULTIPLIER: 2,

  /** Alleen bij HTTP 404: product bestaat niet */
  NOT_FOUND: {
    title: 'Product niet gevonden',
    description: 'Het product dat je zoekt bestaat niet of is niet meer beschikbaar.',
    ctaText: 'Terug naar Home',
  } as const,

  /** Bij 5xx / netwerk na max retries: server tijdelijk niet beschikbaar */
  SERVER_ERROR: {
    title: 'Server tijdelijk niet beschikbaar',
    description: 'We konden het product nu niet laden. Probeer het over een moment opnieuw.',
    ctaText: 'Probeer opnieuw',
  } as const,
} as const;

export type ProductFetchConfig = typeof PRODUCT_FETCH_CONFIG;
