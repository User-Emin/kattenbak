"use client";

import { DESIGN_SYSTEM } from "@/lib/design-system";

/**
 * Premium Kwaliteit & Veiligheid Section - SHARED COMPONENT
 * ✅ DRY: Gebruikt op home en productdetail
 * ✅ Dynamisch: Via DESIGN_SYSTEM (geen hardcode)
 * ✅ Responsive: Mobile kleiner tekst, niet onderregelgaand
 */
export function PremiumQualitySection() {
  return (
    <section 
      className="relative flex items-center justify-center w-full py-8 md:py-12" // ✅ RESPONSIVE: Mobile minder padding
      style={{
        minHeight: '300px', // ✅ MOBILE: Kleinere hoogte (was 400px)
        // ✅ GEEN AFBEELDING: Alleen gradient zoals navbar
        background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.primaryStart} 0%, ${DESIGN_SYSTEM.colors.primaryEnd} 100%)`, // ✅ GRADIENT EXACT NAVBAR: Via DESIGN_SYSTEM (geen hardcode)
      }}
    >
      {/* Centered content - ✅ RESPONSIVE: Mobile padding, Desktop center */}
      <div 
        className="relative z-10 text-center space-y-4 md:space-y-6 px-4 md:px-12 max-w-4xl mx-auto" // ✅ RESPONSIVE: Mobile padding, Desktop max-width
      >
        <h2 
          className="text-2xl md:text-4xl lg:text-5xl" // ✅ RESPONSIVE: Mobile kleiner (text-2xl), Desktop groter
          style={{
            fontFamily: DESIGN_SYSTEM.typography.fontFamily.headings,
            fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
            color: DESIGN_SYSTEM.colors.text.inverse,
            letterSpacing: DESIGN_SYSTEM.typography.letterSpacing.tight,
          }}
        >
          Premium Kwaliteit & Veiligheid
        </h2>
        <p 
          className="text-sm md:text-lg lg:text-xl" // ✅ RESPONSIVE: Mobile kleiner (text-sm), Desktop groter
          style={{
            fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
            color: DESIGN_SYSTEM.colors.text.inverse,
            lineHeight: DESIGN_SYSTEM.typography.lineHeight.relaxed,
          }}
        >
          Hoogwaardige ABS materialen met dubbele veiligheidssensoren. Volledig automatisch met real-time monitoring via smartphone app. Perfect voor katten tot 7kg.
        </p>
      </div>
    </section>
  );
}
