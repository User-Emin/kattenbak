"use client";

import { useState, useEffect } from "react";
import { Truck, Shield, Lock } from "lucide-react";
import { DESIGN_SYSTEM } from "@/lib/design-system";

/**
 * 🎨 USP BANNER - BOVEN NAVBAR
 * 
 * ✅ Smooth wisselend (3 USPs, 3 seconden per USP)
 * ✅ Centraal gepositioneerd
 * ✅ Wit background, zwarte tekst
 * ✅ Responsive (mobiel: 1 USP, desktop: 1 USP smooth fade)
 * ✅ DRY: Alle config uit DESIGN_SYSTEM
 * ✅ Security: Geen user input, geen XSS vectors
 */

// DRY: USPs configuratie
const USPS = [
  {
    icon: Truck,
    text: "Gratis verzending binnen Nederland",
  },
  {
    icon: Shield,
    text: "30 dagen bedenktijd • Gratis retour",
  },
  {
    icon: Lock,
    text: "Veilig betalen • SSL beveiligd",
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
        const Icon = usp.icon;
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
            <Icon 
              className="w-4 h-4 flex-shrink-0" 
              strokeWidth={2}
              style={{ color: DESIGN_SYSTEM.layout.uspBanner.color }}
            />
            <span 
              style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                color: DESIGN_SYSTEM.layout.uspBanner.color,
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
