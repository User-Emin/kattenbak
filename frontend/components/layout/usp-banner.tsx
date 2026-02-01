"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { DESIGN_SYSTEM } from "@/lib/design-system";

/** Hardcoded zodat deploy/cache geen oude kleuren toont - overschrijft config */
const USP_BANNER_BG = "#ffffff";
const USP_BANNER_TEXT = "#000000";
const USP_BANNER_CHECK_BLUE = "#129DD8";

/**
 * 🎨 USP BANNER - BOVEN NAVBAR
 * 
 * ✅ Smooth wisselend (3 USPs, 3 seconden per USP)
 * ✅ Centraal gepositioneerd
 * ✅ Wit achtergrond, zwarte tekst (hardcoded #ffffff / #000000)
 * ✅ Vinkjes: hardcoded #129DD8 (nieuwe blauw)
 * ✅ Responsive (mobiel: 1 USP, desktop: 1 USP smooth fade)
 * ✅ Security: Geen user input, geen XSS vectors
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
    text: "Nooit meer scheppen",
    highlightWords: ["Nooit meer scheppen"],
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
        background: USP_BANNER_BG,
        height: DESIGN_SYSTEM.layout.uspBanner.height,
        zIndex: parseInt(DESIGN_SYSTEM.layout.uspBanner.zIndex),
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
            {/* Vinkjes: hardcoded #129DD8 */}
            {usp.showCheckmarks ? (
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((i) => (
                  <Check
                    key={i}
                    className="w-4 h-4 flex-shrink-0"
                    strokeWidth={3}
                    style={{ color: USP_BANNER_CHECK_BLUE }}
                  />
                ))}
              </div>
            ) : null}
            <span 
              style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                color: USP_BANNER_TEXT,
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
