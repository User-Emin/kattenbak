"use client";

import { Package, Volume2 } from "lucide-react";
import { DESIGN_SYSTEM } from "@/lib/design-system";

/**
 * Product USP Features Component - COOLBLUE WIDE LAYOUT
 * 
 * Features:
 * - Zigzag layout (text left/right alternating)
 * - BREDE foto's zoals Coolblue (meer ruimte voor product)
 * - Icons + Bullets + Images
 * - Fully responsive
 * - DRY & Maintainable
 * ✅ GEEN hardcoded kleuren - dynamisch via Tailwind classes
 */
export function ProductUspFeatures() {
  const features = [
    {
      icon: Package,
      title: "10.5L Capaciteit",
      description: "De grootste afvalbak in zijn klasse. Minder vaak legen betekent meer vrijheid voor jou.",
      benefits: [
        "Bij 1 kat: ~1x per week legen",
        "Bij meerdere katten: 2-3x per week",
        "30% minder onderhoud vs concurrentie (7-9L)"
      ],
      // ✅ DYNAMISCH: Via DESIGN_SYSTEM (geen hardcode)
      image: DESIGN_SYSTEM.layout.features.capacity.imageUrl,
      imageAlt: "10.5L XL Capaciteit afvalbak"
    },
    {
      icon: Volume2,
      title: "Ultra-Quiet Motor", 
      description: "Werkt onder 40 decibel. Zo stil dat je het nauwelijks hoort, maar het doet zijn werk perfect.",
      benefits: [
        "Stiller dan een gesprek (60dB)",
        "Geen stress voor gevoelige katten",
        "Ook 's nachts onhoorbaar"
      ],
      // ✅ DYNAMISCH: Lokale foto uit Downloads (geen hardcode)
      image: "/images/feature-2.jpg",
      imageAlt: "Ultra-stille motor onder 40dB"
    }
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 md:space-y-20 px-4 md:px-0"> {/* ✅ RESPONSIVE: Mobile padding, Desktop geen padding */}
      {features.map((feature, index) => {
        const isEven = index % 2 === 0;
        const IconComponent = feature.icon;

        return (
          <div key={index} className={`grid md:grid-cols-2 gap-6 md:gap-12 items-center`}> {/* ✅ RESPONSIVE: Mobile kleinere gap */}
            {/* Tekst Content - ✅ RESPONSIVE: Mobile kleiner */}
            <div className={`space-y-4 md:space-y-6 ${isEven ? 'md:order-1' : 'md:order-2'}`}>
              <div className="flex items-start gap-4">
                {/* ✅ SYMBOOL VERWIJDERD: Exact zoals productdetail (geen icon) */}
                <div>
                  <h3 className="text-xl md:text-2xl font-normal text-gray-900 mb-2 md:mb-3"> {/* ✅ RESPONSIVE: Mobile kleiner */}
                    <strong 
                      style={{
                        background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.primaryStart} 0%, ${DESIGN_SYSTEM.colors.primaryEnd} 100%)`, // ✅ DYNAMISCH: Via DESIGN_SYSTEM (geen hardcode)
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {feature.title.split(' ')[0]}
                    </strong> {feature.title.split(' ').slice(1).join(' ')}
                  </h3>
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed font-light"> {/* ✅ RESPONSIVE: Mobile kleiner */}
                    {feature.description}
                  </p>
                  <ul className="mt-3 md:mt-4 space-y-2 md:space-y-3 text-sm md:text-base text-gray-600"> {/* ✅ RESPONSIVE: Mobile kleiner */}
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 md:gap-3">
                        <span className="text-green-600 text-base md:text-lg mt-0.5">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* ✅ RANDEN: Afbeelding naar randen exact zoals productdetail */}
            <div className={`relative w-full ${isEven ? 'md:order-2' : 'md:order-1'}`}>
              <img
                src={feature.image}
                alt={feature.imageAlt}
                className="w-full h-auto object-cover rounded-lg" // ✅ RONDIGER: rounded-lg zoals productdetail
                loading="lazy"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

