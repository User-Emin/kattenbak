"use client";

import { useState } from "react";
import { useCookieConsent } from "@/lib/hooks/use-cookie-consent";
import { CookieConsentBanner } from "./cookie-consent-banner";
import { CookieSettingsModal } from "./cookie-settings-modal";

/**
 * Cookie Consent Manager - GDPR Compliant
 * DRY: Orchestrates banner and settings modal
 */
export function CookieConsentManager() {
  const [showSettings, setShowSettings] = useState(false);
  const { 
    showBanner, 
    isLoaded, 
    consent, 
    acceptAll, 
    rejectAll, 
    updateConsent 
  } = useCookieConsent();

  // Don't render until loaded (avoid hydration mismatch)
  if (!isLoaded) return null;

  // Don't show anything if consent already given
  if (!showBanner && !showSettings) return null;

  return (
    <>
      {showBanner && (
        <CookieConsentBanner
          onAcceptAll={acceptAll}
          onRejectAll={rejectAll}
          onShowSettings={() => setShowSettings(true)}
          onClose={rejectAll}
        />
      )}

      {showSettings && (
        <CookieSettingsModal
          currentConsent={consent}
          onSave={(newConsent) => {
            updateConsent(newConsent);
            setShowSettings(false);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}



