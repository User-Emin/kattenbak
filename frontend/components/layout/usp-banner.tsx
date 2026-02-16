"use client";

import { useState, useEffect } from "react";
import { DESIGN_SYSTEM } from "@/lib/design-system";

/**
 * 🎨 USP BANNER - BOVEN NAVBAR
 *
 * Geen vinkjes/iconen: alleen tekst (smooth wisselend).
 * Kleuren en hoogte via DESIGN_SYSTEM.layout.uspBanner (geen hardcode).
 */

const USPS = [
  { text: "Gratis verzending binnen Nederland" },
  { text: "30 dagen bedenktijd • Gratis retour" },
  { text: "1 jaar garantie" },
  { text: "Nooit meer scheppen" },
] as const;

export function UspBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const usp = DESIGN_SYSTEM.layout.uspBanner;

  useEffect(() => {
    const duration = parseInt(usp.animationDuration, 10) || 3000;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % USPS.length);
    }, duration);
    return () => clearInterval(interval);
  }, [usp.animationDuration]);

  return (
    <div
      data-usp="text-only"
      className="w-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: usp.bg,
        height: usp.height,
        zIndex: parseInt(usp.zIndex, 10) || 160,
        position: "sticky",
        top: 0,
      }}
    >
      {USPS.map((item, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={index}
            className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out"
            style={{
              opacity: isActive ? 1 : 0,
              transform: isActive ? "translateY(0)" : "translateY(10px)",
            }}
          >
            <span
              style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                color: usp.color,
              }}
            >
              {item.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
