"use client";

import { useState } from "react";
import { Button } from "./button";
import { X, Cookie, Shield, BarChart, Target } from "lucide-react";
import { COOKIES_CONFIG, type CookieConsent } from "../../shared/cookies.config";
import { COMPONENT_COLORS } from "@/lib/theme-colors";

interface CookieSettingsModalProps {
  currentConsent: CookieConsent;
  onSave: (consent: Partial<CookieConsent>) => void;
  onClose: () => void;
}

// DRY: Icon mapping voor categorieën
const CATEGORY_ICONS = {
  NECESSARY: Shield,
  FUNCTIONAL: Cookie,
  ANALYTICS: BarChart,
  MARKETING: Target,
} as const;

/**
 * Cookie Settings Modal - GDPR Compliant
 * DRY: Uses COOKIES_CONFIG + theme colors
 */
export function CookieSettingsModal({ 
  currentConsent, 
  onSave, 
  onClose 
}: CookieSettingsModalProps) {
  const [consent, setConsent] = useState(currentConsent);

  const handleToggle = (category: keyof CookieConsent) => {
    // Necessary cookies cannot be disabled
    if (category === 'necessary') return;
    
    setConsent(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSave = () => {
    onSave(consent);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header - Cookie icon direct op achtergrond (geen extra veld) */}
        <div className={`sticky top-0 ${COMPONENT_COLORS.navbar.bg} border-b border-gray-700/20 px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <Cookie className="h-8 w-8 text-white" />
            <div>
              <h2 className="text-xl font-semibold text-white">Cookie instellingen</h2>
              <p className="text-sm text-white/80">Beheer je cookie voorkeuren</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-6 space-y-6">
          {Object.entries(COOKIES_CONFIG.CATEGORIES).map(([categoryKey, category]) => {
            // DRY: Get icon via uppercase key mapping
            const IconComponent = CATEGORY_ICONS[categoryKey as keyof typeof CATEGORY_ICONS];
            const consentKey = category.id as keyof CookieConsent;
            const isEnabled = consent[consentKey];
            const isRequired = category.required;

            return (
              <div 
                key={categoryKey}
                className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Icon direct op achtergrond, geen extra cirkel veld */}
                    <IconComponent className={`h-6 w-6 mt-1 flex-shrink-0 ${
                      isRequired ? 'text-brand' : 'text-gray-600'
                    }`} />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        {isRequired && (
                          <span className={`text-xs ${COMPONENT_COLORS.navbar.bg} text-white px-2 py-0.5 rounded-full font-medium`}>
                            Verplicht
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                      
                      {/* Cookie details */}
                      <div className="space-y-2">
                        {category.cookies.map((cookie, idx) => (
                          <div key={idx} className="text-xs text-gray-500 flex items-start gap-2">
                            <Cookie className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-mono font-medium text-gray-700">{cookie.name}</span>
                              {" - "}
                              <span>{cookie.purpose}</span>
                              {" "}
                              <span className="text-gray-400">({cookie.duration})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(consentKey)}
                    disabled={isRequired}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isRequired 
                        ? 'bg-brand cursor-not-allowed opacity-50' 
                        : isEnabled 
                          ? 'bg-black' // ✅ ZWART ipv ORANJE 
                          : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
          >
            Annuleren
          </Button>
          <Button
            variant="cta"
            fullWidth
            onClick={handleSave}
          >
            Voorkeuren opslaan
          </Button>
        </div>
      </div>
    </div>
  );
}



