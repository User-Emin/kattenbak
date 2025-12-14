/**
 * COOKIES CONFIGURATION - GDPR Compliant
 * DRY: Single source voor alle cookie settings
 */

export const COOKIES_CONFIG = {
  // Cookie categories (GDPR required)
  CATEGORIES: {
    NECESSARY: {
      id: 'necessary',
      name: 'Noodzakelijk',
      description: 'Essentieel voor de werking van de website. Kunnen niet worden uitgeschakeld.',
      required: true,
      cookies: [
        { name: 'cart', purpose: 'Winkelwagen opslaan', duration: '7 dagen' },
        { name: 'session', purpose: 'Sessie beheren', duration: 'Sessie' },
        { name: 'cookie_consent', purpose: 'Cookie voorkeuren onthouden', duration: '1 jaar' },
      ],
    },
    FUNCTIONAL: {
      id: 'functional',
      name: 'Functioneel',
      description: 'Zorgen voor extra functionaliteit zoals chat en taalvoorkeuren.',
      required: false,
      cookies: [
        { name: 'hcaptcha', purpose: 'Spam preventie (hCaptcha)', duration: 'Sessie' },
        { name: 'language', purpose: 'Taalvoorkeur onthouden', duration: '1 jaar' },
      ],
    },
    ANALYTICS: {
      id: 'analytics',
      name: 'Analytisch',
      description: 'Helpen ons begrijpen hoe bezoekers de website gebruiken.',
      required: false,
      cookies: [
        { name: '_ga', purpose: 'Google Analytics', duration: '2 jaar' },
        { name: '_gid', purpose: 'Google Analytics', duration: '24 uur' },
      ],
    },
    MARKETING: {
      id: 'marketing',
      name: 'Marketing',
      description: 'Gebruikt voor gepersonaliseerde advertenties.',
      required: false,
      cookies: [
        { name: 'fbp', purpose: 'Facebook Pixel', duration: '3 maanden' },
        { name: 'ads', purpose: 'Advertentie tracking', duration: '1 jaar' },
      ],
    },
  },

  // LocalStorage keys (DRY)
  STORAGE_KEY: 'cookie_consent',
  
  // Consent expiry (1 jaar)
  CONSENT_DURATION: 365 * 24 * 60 * 60 * 1000,

  // Default consent (only necessary)
  DEFAULT_CONSENT: {
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
    timestamp: null as number | null,
  },
} as const;

export type CookieCategory = keyof typeof COOKIES_CONFIG.CATEGORIES;
export type CookieConsent = typeof COOKIES_CONFIG.DEFAULT_CONSENT;



