"use client";

/**
 * MOVING BANNER - SNELLE MARQUEE MET STREEPJES
 * DRY: Gecentraliseerde USP teksten
 * Performance: 8s desktop, 4s mobiel
 */
export function MovingBanner() {
  const usps = [
    "Gratis verzending vanaf €50",
    "2 jaar garantie",
    "Vandaag besteld, morgen in huis",
    "30 dagen bedenktijd",
  ];

  return (
    <div className="bg-black text-white py-2 overflow-hidden relative">
      <div className="animate-marquee whitespace-nowrap flex items-center antialiased">
        {[...usps, ...usps, ...usps].map((text, idx) => (
          <div key={idx} className="inline-flex items-center mx-6">
            <span className="text-sm font-semibold text-white tracking-wide" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
              {text}
            </span>
            <span className="mx-6 text-white/40 font-bold text-lg">-</span>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%) translateZ(0); }
          100% { transform: translateX(-33.333%) translateZ(0); }
        }
        .animate-marquee {
          animation: marquee 8s linear infinite;
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
            animation: marquee 4s linear infinite;
          }
        }
      `}</style>
    </div>
  );
}
