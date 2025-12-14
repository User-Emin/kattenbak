/**
 * HCAPTCHA CONFIG - GDPR Compliant
 * DRY: Centralized hCaptcha configuration
 * Secure & maintainable
 */

export const HCAPTCHA_CONFIG = {
  // Keys
  SITE_KEY: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001',
  SECRET_KEY: process.env.HCAPTCHA_SECRET_KEY || '0x0000000000000000000000000000000000000000',
  
  // API
  VERIFY_URL: 'https://hcaptcha.com/siteverify',
  MIN_SCORE: 0.5,
  
  // UI
  THEME: 'light' as const,
  SIZE: 'normal' as const,
  
  // Privacy (GDPR)
  PRIVACY: {
    endpoint: 'https://hcaptcha.com',
    privacyUrl: '/privacy-policy',
    requiresConsent: true,
    consentCategory: 'functional', // ✅ hCaptcha requires functional cookies
  },
  
  // Performance
  TIMEOUT: 5000,
} as const;


