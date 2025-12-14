"use client";

import { useState, useEffect } from "react";
import { COOKIES_CONFIG, type CookieConsent } from "../../shared/cookies.config";

/**
 * useCookieConsent Hook - GDPR Compliant
 * DRY: Centralized cookie consent management
 */

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent>(() => ({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
    timestamp: Date.now(),
  }));
  const [showBanner, setShowBanner] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load consent from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(COOKIES_CONFIG.STORAGE_KEY);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CookieConsent;
        
        // Check if consent is still valid (1 jaar)
        const isExpired = parsed.timestamp && 
          (Date.now() - parsed.timestamp > COOKIES_CONFIG.CONSENT_DURATION);
        
        if (isExpired) {
          // Consent expired, show banner again
          setShowBanner(true);
        } else {
          setConsent(parsed);
        }
      } catch (error) {
        console.error('❌ Failed to parse cookie consent:', error);
        setShowBanner(true);
      }
    } else {
      // No consent yet, show banner
      setShowBanner(true);
    }

    setIsLoaded(true);
  }, []);

  // Save consent to localStorage
  const saveConsent = (newConsent: Partial<CookieConsent>) => {
    const updated = {
      necessary: true, // Always true (GDPR requirement)
      functional: newConsent.functional ?? false,
      analytics: newConsent.analytics ?? false,
      marketing: newConsent.marketing ?? false,
      timestamp: Date.now(),
    } as CookieConsent;

    setConsent(updated);
    localStorage.setItem(COOKIES_CONFIG.STORAGE_KEY, JSON.stringify(updated));
    setShowBanner(false);

    console.log('✅ Cookie consent saved:', updated);
  };

  // Accept all cookies
  const acceptAll = () => {
    setConsent({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    } as any);
    localStorage.setItem(COOKIES_CONFIG.STORAGE_KEY, JSON.stringify({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    }));
    setShowBanner(false);
  };

  // Reject all (only necessary)
  const rejectAll = () => {
    setConsent({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    } as any);
    localStorage.setItem(COOKIES_CONFIG.STORAGE_KEY, JSON.stringify({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    }));
    setShowBanner(false);
  };

  // Custom consent (from settings page)
  const updateConsent = (categories: Partial<CookieConsent>) => {
    saveConsent(categories);
  };

  // Check if specific category is enabled
  const hasConsent = (category: keyof CookieConsent): boolean => {
    return consent[category] === true;
  };

  return {
    consent,
    showBanner,
    isLoaded,
    acceptAll,
    rejectAll,
    updateConsent,
    hasConsent,
  };
}



