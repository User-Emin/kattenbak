/**
 * COOKIES CONFIG - GDPR Compliant
 * DRY: Centralized cookie configuration
 * Maximaal maintainable, secure & transparent
 */

export type CookieConsent = {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp?: number;
};

export interface CookieDefinition {
  name: string;
  purpose: string;
  duration: string;
  provider?: string;
}

export interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  cookies: CookieDefinition[];
}

/**
 * ✅ GDPR-Compliant Cookie Categories
 */
export const COOKIES_CONFIG = {
  // Storage
  STORAGE_KEY: 'kattenbak_cookie_consent',
  CONSENT_DURATION: 365 * 24 * 60 * 60 * 1000, // 1 jaar

  // Cookie Categories
  CATEGORIES: {
    NECESSARY: {
      id: 'necessary',
      name: 'Noodzakelijke cookies',
      description: 'Deze cookies zijn essentieel voor de werking van de website en kunnen niet worden uitgeschakeld.',
      required: true,
      cookies: [
        {
          name: 'kattenbak_cart',
          purpose: 'Bewaart winkelwagen gegevens',
          duration: '7 dagen',
        },
        {
          name: 'kattenbak_session',
          purpose: 'Sessie identificatie voor veilige interacties',
          duration: 'Sessie',
        },
        {
          name: 'kattenbak_cookie_consent',
          purpose: 'Bewaart cookie voorkeuren',
          duration: '1 jaar',
        },
      ],
    } as CookieCategory,

    FUNCTIONAL: {
      id: 'functional',
      name: 'Functionele cookies',
      description: 'Deze cookies verbeteren de functionaliteit en gebruikservaring, zoals hCaptcha voor spam-preventie.',
      required: false,
      cookies: [
        {
          name: 'hcaptcha_*',
          purpose: 'Spam-preventie en bot-detectie voor formulieren',
          duration: 'Sessie',
          provider: 'hCaptcha (https://www.hcaptcha.com)',
        },
      ],
    } as CookieCategory,

    ANALYTICS: {
      id: 'analytics',
      name: 'Analytische cookies',
      description: 'Deze cookies helpen ons begrijpen hoe bezoekers de website gebruiken, zodat we deze kunnen verbeteren.',
      required: false,
      cookies: [
        {
          name: '_ga',
          purpose: 'Google Analytics - Bezoekersstatistieken',
          duration: '2 jaar',
          provider: 'Google Analytics',
        },
        {
          name: '_gid',
          purpose: 'Google Analytics - Sessie identificatie',
          duration: '24 uur',
          provider: 'Google Analytics',
        },
      ],
    } as CookieCategory,

    MARKETING: {
      id: 'marketing',
      name: 'Marketing cookies',
      description: 'Deze cookies worden gebruikt voor gerichte advertenties en remarketing campagnes.',
      required: false,
      cookies: [
        {
          name: '_fbp',
          purpose: 'Facebook Pixel - Conversie tracking',
          duration: '3 maanden',
          provider: 'Facebook',
        },
        {
          name: 'ads_*',
          purpose: 'Google Ads - Remarketing',
          duration: '90 dagen',
          provider: 'Google Ads',
        },
      ],
    } as CookieCategory,
  },
} as const;

/**
 * ✅ DRY: Check if cookie category is enabled
 */
export function hasCookieConsent(category: keyof CookieConsent): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const stored = localStorage.getItem(COOKIES_CONFIG.STORAGE_KEY);
    if (!stored) return category === 'necessary'; // Only necessary by default
    
    const consent = JSON.parse(stored) as CookieConsent;
    
    // Check expiration
    if (consent.timestamp && Date.now() - consent.timestamp > COOKIES_CONFIG.CONSENT_DURATION) {
      return category === 'necessary';
    }
    
    return consent[category] === true;
  } catch {
    return category === 'necessary';
  }
}

/**
 * ✅ DRY: Save cookie consent
 */
export function saveCookieConsent(consent: Partial<CookieConsent>): void {
  if (typeof window === 'undefined') return;
  
  const updated: CookieConsent = {
    necessary: true, // Always true
    functional: consent.functional ?? false,
    analytics: consent.analytics ?? false,
    marketing: consent.marketing ?? false,
    timestamp: Date.now(),
  };
  
  localStorage.setItem(COOKIES_CONFIG.STORAGE_KEY, JSON.stringify(updated));
  
  // Dispatch event voor real-time updates
  window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: updated }));
}
