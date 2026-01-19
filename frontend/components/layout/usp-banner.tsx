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

// DRY: USPs configuratie - ✅ SERVICE-GERICHTE USPs: praktische voordelen voor klanten
const USPS = [
  {
    text: "Gratis verzending binnen Nederland",
    highlightWords: ["Gratis verzending"],
    showCheckmarks: true,
  },
  {
    text: "30 dagen bedenktijd • Gratis retour",
    highlightWords: ["30 dagen", "Gratis retour"],
    showCheckmarks: true,
  },
  {
    text: "Nooit meer scheppen • Altijd schoon",
    highlightWords: ["Nooit meer scheppen", "Altijd schoon"],
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
                color: DESIGN_SYSTEM.layout.uspBanner.color, // ✅ WIT: Tekst blijft wit in zwarte banner
              }}
            >
              {usp.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
