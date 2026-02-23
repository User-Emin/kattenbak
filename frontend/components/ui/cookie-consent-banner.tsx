"use client";

import { Button } from "./button";
import { Cookie, Settings } from "lucide-react";
import Link from "next/link";
import { BRAND_COLORS_HEX } from "@/lib/color-config";

interface CookieConsentBannerProps {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onShowSettings: () => void;
  onClose: () => void;
}

/**
 * Cookie Consent Banner - GDPR Compliant
 * VIERKANT ZAKELIJK DESIGN - Coolblue inspired
 */
export function CookieConsentBanner({ 
  onAcceptAll, 
  onRejectAll, 
  onShowSettings,
  onClose 
}: CookieConsentBannerProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[300] animate-in slide-in-from-bottom duration-300">
      {/* VIERKANT ZAKELIJK DESIGN */}
      <div className="bg-white border-t-2 border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Icon + Content - COMPACT */}
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Cookie className="h-5 w-5 text-gray-700" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">
                  Deze website gebruikt cookies
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-2">
                  Wij gebruiken <strong>noodzakelijke cookies</strong> voor de werking van de website. 
                  Met je toestemming gebruiken we ook <strong>functionele cookies</strong> (zoals hCaptcha voor spam-preventie). 
                  Analytische en marketing cookies worden alleen gebruikt na jouw expliciete toestemming.
                </p>
                <p className="text-xs text-gray-500">
                  Meer informatie in ons{" "}
                  <Link 
                    href="/privacy-policy" 
                    className="text-brand hover:underline"
                  >
                    privacybeleid
                  </Link>
                  {" "}en{" "}
                  <Link 
                    href="/cookie-policy" 
                    className="text-brand hover:underline"
                  >
                    cookiebeleid
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Actions - VIERKANT BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <button
                onClick={onRejectAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors rounded-none whitespace-nowrap"
              >
                Alleen noodzakelijk
              </button>
              
              <button
                onClick={onShowSettings}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors rounded-none whitespace-nowrap flex items-center justify-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Instellingen
              </button>
              
              <button
                onClick={onAcceptAll}
                className="px-4 py-2 text-sm font-bold text-white transition-colors rounded-none whitespace-nowrap"
                style={{ backgroundColor: BRAND_COLORS_HEX.primary }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = BRAND_COLORS_HEX.primaryDark}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = BRAND_COLORS_HEX.primary}
              >
                Alles accepteren
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



