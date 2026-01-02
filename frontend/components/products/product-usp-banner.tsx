"use client";

import { Shield, Truck, Lock } from "lucide-react";
import { useState, useEffect } from "react";

/**
 * COOLBLUE USP BANNER - ONDER NAVBAR
 * Mobiel: 1-voor-1 tonen met smooth afwisselend effect
 * Desktop: Alle 3 naast elkaar
 * DRY + Secure: Clean animatie met auto-rotate
 */
export function ProductUspBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
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

  // Auto-rotate op mobiel (elke 3 seconden)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % usps.length);
    }, 3000);
    
    return () => clearInterval(timer);
  }, [usps.length]);

  return (
    <div className="bg-white border-b border-gray-200 py-3 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-10">
        {/* DESKTOP: Alle 3 naast elkaar */}
        <div className="hidden md:flex items-center justify-center md:justify-start gap-8">
          {usps.map((usp, idx) => {
            const Icon = usp.icon;
            return (
              <div key={idx} className="flex items-center gap-2.5">
                <div className="flex-shrink-0 w-5 h-5 text-accent flex items-center justify-center">
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <span className="text-sm text-gray-700 whitespace-nowrap">
                  <strong className="font-semibold text-gray-900">{usp.highlight}</strong>
                  {' '}{usp.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* MOBIEL: 1-voor-1 met smooth fade animatie */}
        <div className="md:hidden relative h-8 flex items-center justify-center">
          {usps.map((usp, idx) => {
            const Icon = usp.icon;
            const isActive = idx === currentIndex;
            
            return (
              <div 
                key={idx}
                className={`absolute inset-0 flex items-center justify-center gap-2.5 transition-all duration-500 ${
                  isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="flex-shrink-0 w-5 h-5 text-accent flex items-center justify-center">
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <span className="text-sm text-gray-700 whitespace-nowrap">
                  <strong className="font-semibold text-gray-900">{usp.highlight}</strong>
                  {' '}{usp.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
