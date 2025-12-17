"use client";

import { Truck, Shield, Clock } from "lucide-react";

export function MovingBanner() {
  const usps = [
    { icon: Truck, text: "Gratis verzending vanaf €50" },
    { icon: Shield, text: "2 jaar garantie" },
    { icon: Clock, text: "Vandaag besteld, morgen in huis" },
    { icon: Truck, text: "30 dagen bedenktijd" },
  ];

  return (
    <div className="bg-black text-white py-2 overflow-hidden relative">
      <div className="animate-marquee whitespace-nowrap flex items-center antialiased">
        {[...usps, ...usps, ...usps].map((usp, idx) => (
          <div key={idx} className="inline-flex items-center gap-2 mx-8">
            <usp.icon className="h-4 w-4 flex-shrink-0 text-white" />
            <span className="text-sm font-medium text-white" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
              {usp.text}
            </span>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%) translateZ(0); }
          100% { transform: translateX(-33.333%) translateZ(0); }
        }
        .animate-marquee {
          animation: marquee 12s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        @media (max-width: 768px) {
          .animate-marquee {
            animation: marquee 5s linear infinite;
          }
        }
      `}</style>
    </div>
  );
}
