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
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 backdrop-blur-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(60, 60, 61, 0.5) 0%, rgba(122, 122, 125, 0.5) 100%)', // ✅ GRADIENT met opacity (was bg-black/50)
        }} 
        onClick={onClose}
      />
      
      {/* Modal - Compacter + meer naar midden */}
      <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] sm:max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header - Compact */}
        <div className={`sticky top-0 ${COMPONENT_COLORS.navbar.bg} border-b border-gray-700/20 px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Cookie className="h-6 w-6 text-white" />
            <h2 className="text-lg font-semibold text-white">Cookie instellingen</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content - CLEAN, geen onnodige icons */}
        <div className="overflow-y-auto max-h-[calc(85vh-140px)] px-4 py-4 space-y-3">
          {Object.entries(COOKIES_CONFIG.CATEGORIES).map(([categoryKey, category]) => {
            const consentKey = category.id as keyof CookieConsent;
            const isEnabled = consent[consentKey];
            const isRequired = category.required;

            return (
              <div 
                key={categoryKey}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-gray-900">{category.name}</h3>
                      {isRequired && (
                        <span className={`text-xs ${COMPONENT_COLORS.navbar.bg} text-white px-2 py-0.5 rounded-full`}>
                          Verplicht
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{category.description}</p>
                  </div>

                  {/* Toggle - CLEAN */}
                  <button
                    onClick={() => handleToggle(consentKey)}
                    disabled={isRequired}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
                      isRequired 
                        ? 'bg-brand cursor-not-allowed opacity-50' 
                        : isEnabled 
                          ? 'bg-black'
                          : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer - Compact, BUTTONS GELIJK DIK */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-3 flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
            size="sm"
            className="border-2 border-gray-900"
          >
            Annuleren
          </Button>
          <Button
            variant="cta"
            fullWidth
            onClick={handleSave}
            size="sm"
          >
            Voorkeuren opslaan
          </Button>
        </div>
      </div>
    </div>
  );
}



