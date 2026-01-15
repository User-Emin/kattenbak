"use client";

import { Shield, Truck, Lock } from "lucide-react";
import { DESIGN_SYSTEM } from "@/lib/design-system";

/**
 * KLANTGERICHTE USP BANNER - ONDER NAVBAR
 * WIT met BLAUW accenten (primary) en ZWARTE tekst
 * Altijd alle 3 zichtbaar, responsive
 * ✅ DRY: Dynamisch via DESIGN_SYSTEM - GEEN hardcoded kleuren
 */
export function ProductUspBanner() {
  
  const usps = [
    {
      icon: Truck,
      text: "verzending",
      highlight: "Gratis",
    },
    {
      icon: Shield,
      text: "bedenktijd",
      highlight: "30 dagen",
    },
    {
      icon: Lock,
      text: "betalen",
      highlight: "Veilig",
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 py-4 px-4 shadow-sm">
      <div className="container mx-auto">
        <div className="flex items-center justify-center md:justify-around gap-6 md:gap-10 flex-wrap">
          {usps.map((usp, index) => {
            const Icon = usp.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-2.5"
              >
                <div 
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #3C3C3D 0%, #7A7A7D 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  <Icon className="w-6 h-6" strokeWidth={2.5} style={{ color: '#3C3C3D' }} />
                </div>
                <span className="text-base md:text-lg whitespace-nowrap">
                  <span 
                    className="font-extrabold"
                    style={{
                      background: 'linear-gradient(135deg, #3C3C3D 0%, #7A7A7D 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {usp.highlight}
                  </span>{" "}
                  <span className="font-normal text-gray-900">{usp.text}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
