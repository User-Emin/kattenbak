"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { DESIGN_SYSTEM } from "@/lib/design-system";
import { BRAND_COLORS_HEX } from "@/lib/color-config";

/**
 * 🎨 USP BANNER - BOVEN NAVBAR
 * 
 * ✅ Smooth wisselend (3 USPs, 3 seconden per USP)
 * ✅ Centraal gepositioneerd
 * ✅ Wit background, zwarte tekst
 * ✅ Responsive (mobiel: 1 USP, desktop: 1 USP smooth fade)
 * ✅ DRY: Alle config uit DESIGN_SYSTEM
 * ✅ Security: Geen user input, geen XSS vectors
 * ✅ BLAUWE VIJKJES: 3 blauwe vinkjes voor "Gratis verzending binnen Nederland" (exact logo blauw)
 */

// DRY: USPs configuratie - ✅ NIEUWE USPs met belangrijke woorden blauw
const USPS = [
  {
    text: "10.5L capaciteit • Grootste afvalbak",
    highlightWords: ["10.5L", "Grootste"],
    showCheckmarks: true,
  },
  {
    text: "Ultra-stille motor • Onder 40dB",
    highlightWords: ["Ultra-stille", "40dB"],
    showCheckmarks: true,
  },
  {
    text: "Volledig automatisch • App-bediening",
    highlightWords: ["Volledig automatisch", "App-bediening"],
    showCheckmarks: true,
  },
] as const;

export function UspBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Smooth cycling through USPs
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % USPS.length);
    }, parseInt(DESIGN_SYSTEM.layout.uspBanner.animationDuration));

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="w-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: DESIGN_SYSTEM.layout.uspBanner.bg, // ✅ GRADIENT
        height: DESIGN_SYSTEM.layout.uspBanner.height,
        zIndex: parseInt(DESIGN_SYSTEM.layout.uspBanner.zIndex), // ✅ ONDER sidebar (z-[170]) maar BOVEN navbar (z-165)
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Smooth fade animatie voor elk USP item */}
      {USPS.map((usp, index) => {
        const isActive = index === currentIndex;
        
        return (
          <div
            key={index}
            className="absolute inset-0 flex items-center justify-center gap-3 transition-all duration-700 ease-in-out"
            style={{
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'translateY(0)' : 'translateY(10px)',
            }}
          >
            {/* ✅ BLAUWE VIJKJES: 3 blauwe vinkjes (exact logo blauw) */}
            {usp.showCheckmarks ? (
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((i) => (
                  <Check
                    key={i}
                    className="w-4 h-4 flex-shrink-0"
                    strokeWidth={3}
                    style={{ color: BRAND_COLORS_HEX.primary }} // ✅ EXACT LOGO BLAUW: #005980
                  />
                ))}
              </div>
            ) : null}
            <span 
              style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                color: DESIGN_SYSTEM.layout.uspBanner.color,
              }}
            >
              {usp.text.split(' • ').map((part, idx, arr) => {
                const words = part.split(' ');
                return (
                  <span key={idx}>
                    {words.map((word, wordIdx) => {
                      const shouldHighlight = usp.highlightWords?.some(hw => 
                        word.toLowerCase().includes(hw.toLowerCase())
                      );
                      return (
                        <span key={wordIdx}>
                          {shouldHighlight ? (
                            <span style={{ color: BRAND_COLORS_HEX.primary }}>
                              {word}
                            </span>
                          ) : (
                            word
                          )}
                          {wordIdx < words.length - 1 && ' '}
                        </span>
                      );
                    })}
                    {idx < arr.length - 1 && ' • '}
                  </span>
                );
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
