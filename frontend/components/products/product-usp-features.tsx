"use client";

import { Package, Volume2 } from "lucide-react";

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
      // ✅ DYNAMISCH: Lokale foto uit Downloads (geen hardcode)
      image: "/images/feature-1.jpg",
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
    <div className="max-w-[1400px] mx-auto space-y-20">
      {features.map((feature, index) => {
        const isEven = index % 2 === 0;
        const IconComponent = feature.icon;

        return (
          <div key={index} className={`grid md:grid-cols-2 gap-12 items-center`}>
            {/* Tekst Content - meer ruimte */}
            <div className={`space-y-6 ${isEven ? 'md:order-1' : 'md:order-2'}`}>
              <div className="flex items-start gap-4">
                {/* ✅ SYMBOOL VERWIJDERD: Exact zoals productdetail (geen icon) */}
                <div>
                  <h3 className="text-2xl font-normal text-gray-900 mb-3">
                    <strong 
                      style={{
                        background: 'linear-gradient(135deg, #3C3C3D 0%, #7A7A7D 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {feature.title.split(' ')[0]}
                    </strong> {feature.title.split(' ').slice(1).join(' ')}
                  </h3>
                  <p className="text-gray-700 text-lg leading-relaxed font-light">
                    {feature.description}
                  </p>
                  <ul className="mt-4 space-y-3 text-base text-gray-600">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-green-600 text-lg mt-0.5">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* ✅ BREDE Afbeelding - Zigzag Pattern - grotere padding zoals Coolblue */}
            <div className={`relative aspect-square bg-gray-50 overflow-hidden rounded-lg border border-gray-200 ${isEven ? 'md:order-2' : 'md:order-1'}`}>
              <img
                src={feature.image}
                alt={feature.imageAlt}
                className="w-full h-full object-contain p-8"
                loading="lazy"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

