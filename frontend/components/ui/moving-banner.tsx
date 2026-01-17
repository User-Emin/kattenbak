"use client";

/**
 * MOVING BANNER - CLEAN & SMOOTH
 * DRY: Gecentraliseerde USP teksten
 * Design: Geen strepen, gratis verzending standaard
 */
export function MovingBanner() {
  const usps = [
    "Gratis verzending",
    "1 jaar garantie",
    "Vandaag besteld, morgen in huis",
    "30 dagen bedenktijd",
  ];

  return (
    <div 
      className="text-white py-2 overflow-hidden relative"
      style={{
        background: '#000000', // ✅ ZWART (was gradient)
      }}
    >
      <div className="animate-marquee whitespace-nowrap flex items-center gap-12 antialiased">
        {[...usps, ...usps, ...usps].map((text, idx) => (
          <span 
            key={idx}
            className="text-sm font-semibold text-white tracking-wide" 
            style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
          >
            {text}
          </span>
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
