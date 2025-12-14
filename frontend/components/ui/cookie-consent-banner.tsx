"use client";

import { Button } from "./button";
import { Cookie, Settings } from "lucide-react";
import Link from "next/link";

interface CookieConsentBannerProps {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onShowSettings: () => void;
  onClose: () => void;
}

/**
 * Cookie Consent Banner - GDPR Compliant
 * DRY & Glashelder design (geen emoji)
 */
export function CookieConsentBanner({ 
  onAcceptAll, 
  onRejectAll, 
  onShowSettings,
  onClose 
}: CookieConsentBannerProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] animate-in slide-in-from-bottom duration-500">
      {/* Glassmorphism backdrop */}
      <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Icon + Content */}
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Cookie className="h-6 w-6 text-black" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Deze website gebruikt cookies
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  Wij gebruiken <strong>noodzakelijke cookies</strong> voor de werking van de website. 
                  Met je toestemming gebruiken we ook <strong>functionele cookies</strong> (zoals hCaptcha voor spam-preventie). 
                  Analytische en marketing cookies worden alleen gebruikt na jouw expliciete toestemming.
                </p>
                <p className="text-xs text-gray-500">
                  Meer informatie in ons{" "}
                  <Link 
                    href="/privacy-policy" 
                    className="text-blue-600 hover:underline font-medium"
                  >
                    privacybeleid
                  </Link>
                  {" "}en{" "}
                  <Link 
                    href="/cookie-policy" 
                    className="text-blue-600 hover:underline font-medium"
                  >
                    cookiebeleid
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={onRejectAll}
                className="whitespace-nowrap"
              >
                Alleen noodzakelijk
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Settings className="h-4 w-4" />}
                onClick={onShowSettings}
                className="whitespace-nowrap"
              >
                Instellingen
              </Button>
              
              <Button
                variant="cta"
                size="sm"
                onClick={onAcceptAll}
                className="whitespace-nowrap"
              >
                Alles accepteren
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



