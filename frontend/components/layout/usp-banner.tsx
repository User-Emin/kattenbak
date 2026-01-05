/**
 * USP BANNER - BOVEN NAVBAR
 * WIT DESIGN met ORANJE accenten
 * Desktop: Alle 3 USPs naast elkaar
 * Mobiel: 1-voor-1 afwisselend met smooth animatie
 */

'use client';

import { useState, useEffect } from 'react';
import { Truck, Shield, Lock } from 'lucide-react';

export function UspBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const usps = [
    {
      icon: Truck,
      highlight: "Gratis",
      text: "verzending",
    },
    {
      icon: Shield,
      highlight: "30 dagen",
      text: "bedenktijd",
    },
    {
      icon: Lock,
      highlight: "Veilig",
      text: "betalen",
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
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 lg:px-10 max-w-[1400px] mx-auto">
        {/* DESKTOP: Alle 3 naast elkaar - IETS DUNNER */}
        <div className="hidden md:flex items-center justify-around h-10 gap-8">
          {usps.map((usp, index) => {
            const Icon = usp.icon;
            return (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-shrink-0 w-4 h-4 text-[#f76402] flex items-center justify-center">
                  <Icon className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <span className="text-sm whitespace-nowrap">
                  <span className="font-bold text-[#f76402]">{usp.highlight}</span>{" "}
                  <span className="font-normal text-gray-700">{usp.text}</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* MOBIEL: 1-voor-1 met smooth fade animatie */}
        <div className="md:hidden relative h-12 flex items-center justify-center overflow-hidden">
          {usps.map((usp, index) => {
            const Icon = usp.icon;
            const isActive = index === currentIndex;
            
            return (
              <div 
                key={index}
                className={`absolute inset-0 flex items-center justify-center gap-2 transition-all duration-500 ${
                  isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="flex-shrink-0 w-4 h-4 text-[#f76402] flex items-center justify-center">
                  <Icon className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <span className="text-xs whitespace-nowrap">
                  <span className="font-bold text-[#f76402]">{usp.highlight}</span>{" "}
                  <span className="font-normal text-gray-700">{usp.text}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

