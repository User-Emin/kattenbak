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
    <div className="bg-black border-b border-gray-800 py-4 px-4 shadow-sm" style={{ background: '#000000' }}>
      <div className="container mx-auto">
        <div className="flex items-center justify-center md:justify-around gap-6 md:gap-10 flex-wrap">
          {usps.map((usp, index) => {
            const Icon = usp.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-2.5"
              >
                <Icon 
                  className="w-6 h-6 flex-shrink-0" 
                  strokeWidth={2.5} 
                  style={{ color: '#ffffff' }} // ✅ ZWART: Witte icon op zwarte banner
                />
                <span className="text-base md:text-lg whitespace-nowrap text-white">
                  <span 
                    className="font-extrabold text-white"
                    style={{
                      color: '#ffffff', // ✅ ZWART: Witte highlight op zwarte banner
                    }}
                  >
                    {usp.highlight}
                  </span>{" "}
                  <span className="font-normal text-white">{usp.text}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
