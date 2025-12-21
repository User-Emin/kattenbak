"use client";

import { Package, Shield, Truck } from "lucide-react";

/**
 * COOLBLUE USP BANNER - ONDER NAVBAR
 * Geïnspireerd op Coolblue's "Voor 23.59 uur besteld, morgen gratis bezorgd" banner
 * Design: Wit background, oranje iconen, compact, prominent
 */
export function ProductUspBanner() {
  const usps = [
    {
      icon: Truck,
      text: "Gratis verzending",
      highlight: "gratis",
    },
    {
      icon: Shield,
      text: "30 dagen bedenktijd",
      highlight: "30 dagen",
    },
    {
      icon: Package,
      text: "Veilig betalen",
      highlight: "Veilig",
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 py-3">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-center md:justify-start gap-6 md:gap-8 flex-wrap">
          {usps.map((usp, idx) => {
            const Icon = usp.icon;
            return (
              <div key={idx} className="flex items-center gap-2">
                <div className="flex-shrink-0 w-5 h-5 text-accent">
                  <Icon className="w-full h-full" strokeWidth={2} />
                </div>
                <span className="text-sm text-gray-700">
                  <strong className="font-semibold text-gray-900">{usp.highlight}</strong>
                  {usp.text.replace(usp.highlight, '')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
