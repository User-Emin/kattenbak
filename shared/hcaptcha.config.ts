/**
 * hCAPTCHA CONFIGURATION - GDPR Compliant Alternative
 * DRY: Single source voor hCaptcha settings
 * 
 * ✅ VOORDELEN hCaptcha vs reCAPTCHA:
 *    • EU-first privacy approach
 *    • Geen Google tracking
 *    • GDPR-compliant by design
 *    • Betere accessibility
 *    • EU data centers optie
 */

export const HCAPTCHA_CONFIG = {
  // Site key (frontend) - Vervang met echte hCaptcha key
  SITE_KEY: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001',
  
  // Secret key (backend) - Vervang met echte hCaptcha secret
  SECRET_KEY: process.env.HCAPTCHA_SECRET_KEY || '0x0000000000000000000000000000000000000000',
  
  // hCaptcha verify endpoint
  VERIFY_URL: 'https://hcaptcha.com/siteverify',
  
  // Minimum passing score threshold
  MIN_SCORE: 0.5,
  
  // Theme & UI
  THEME: 'light', // 'light' | 'dark'
  SIZE: 'normal', // 'normal' | 'compact' | 'invisible'
  
  // Privacy options (GDPR)
  PRIVACY: {
    // Data residency (EU servers)
    endpoint: 'https://hcaptcha.com', // Use EU endpoint if needed
    
    // Privacy policy URL
    privacyUrl: '/privacy-policy',
    
    // Cookie consent required before loading
    requiresConsent: true,
    consentCategory: 'functional',
  },
  
  // Timeout voor verificatie
  TIMEOUT: 5000,
} as const;

export type HCaptchaConfig = typeof HCAPTCHA_CONFIG;



