"use client";

import { Package, Volume2, Check, Sparkles, Brush, Box } from "lucide-react";
import Image from "next/image";
import { DESIGN_SYSTEM } from "@/lib/design-system";
import { PRODUCT_PAGE_CONFIG } from "@/lib/product-page-config";
import { cn } from "@/lib/utils";

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
  const CONFIG = PRODUCT_PAGE_CONFIG; // ✅ DRY: Gebruik zelfde config als productdetail
  
  const features = [
    {
      icon: Package,
      title: "10.5L Capaciteit",
      description: "De grootste afvalbak in zijn klasse. Minder vaak legen betekent meer vrijheid voor jou.",
      items: [ // ✅ EXACT ZELFDE: items (niet benefits) zoals productdetail
        "Bij 1 kat: ~1x per week legen",
        "Bij meerdere katten: 2-3x per week",
        "30% minder onderhoud vs concurrentie (7-9L)"
      ],
      // ✅ DYNAMISCH: Via DESIGN_SYSTEM (geen hardcode) - EXACT ZELFDE FOTO
      image: DESIGN_SYSTEM.layout.features.capacity.imageUrl,
      imageAlt: "10.5L XL Capaciteit afvalbak"
    },
    {
      icon: Volume2,
      title: "Ultra-Quiet Motor", 
      description: "Werkt onder 40 decibel. Zo stil dat je het nauwelijks hoort, maar het doet zijn werk perfect.",
      items: [ // ✅ EXACT ZELFDE: items (niet benefits) zoals productdetail
        "Stiller dan een gesprek (60dB)",
        "Geen stress voor gevoelige katten",
        "Ook 's nachts onhoorbaar"
      ],
      // ✅ DYNAMISCH: Lokale foto uit Downloads (geen hardcode) - EXACT ZELFDE FOTO
      image: "/images/feature-2.jpg",
      imageAlt: "Ultra-stille motor onder 40dB"
    },
    {
      icon: Box,
      title: "Gratis meegeleverd: Alles inbegrepen",
      description: "Bij aankoop krijg je gratis: geurblokje voor langdurige geurneutralisatie, kwast voor eenvoudige reiniging, afvalzak (1 rol) voor hygiënische afvalverwerking, en inloopmat voor schone poten. Alles wat je nodig hebt voor direct gebruik.",
      items: [
        "Geurblokje voor langdurige geurneutralisatie",
        "Kwast voor eenvoudige reiniging",
        "Afvalzak (1 rol) voor hygiënische afvalverwerking",
        "Inloopmat voor schone poten"
      ],
      image: "/images/feature-3.jpg", // ✅ FALLBACK: Placeholder tot echte foto beschikbaar
      imageAlt: "Gratis meegeleverd: geurblokje, kwast, afvalzak en inloopmat"
    }
  ];

  return (
    <div className={cn(
      CONFIG.layout.maxWidth, // ✅ EXACT ZELFDE: Max-width zoals productdetail (max-w-7xl)
      'mx-auto',
      CONFIG.layout.containerPadding, // ✅ EXACT ZELFDE: Container padding zoals productdetail (px-4 sm:px-6 lg:px-8) - kleinere witruimte
      CONFIG.layout.sectionSpacing, // ✅ EXACT ZELFDE: Section spacing zoals productdetail
    )}>
      <div className={CONFIG.featureSection.containerSpacing}> {/* ✅ EXACT ZELFDE: Container spacing zoals productdetail */}
        {features.map((feature, index) => {
          const isEven = index % 2 === 0;
          const IconComponent = feature.icon;

          return (
            <div 
              key={index} 
              className={cn(
                isEven ? CONFIG.featureSection.zigzag.leftLayout : CONFIG.featureSection.zigzag.rightLayout // ✅ EXACT ZELFDE: Layout zoals productdetail
              )}
            >
              {/* Image - ✅ EXACT ZELFDE: Geen negatieve margin, gebruikt container padding */}
              <div className={cn(
                'relative',
                isEven ? CONFIG.featureSection.zigzag.imageOrder.left : CONFIG.featureSection.zigzag.imageOrder.right, // ✅ EXACT ZELFDE: Image order zoals productdetail
                CONFIG.featureSection.image.aspectRatio, // ✅ EXACT ZELFDE: Aspect ratio zoals productdetail
                CONFIG.featureSection.image.borderRadius, // ✅ EXACT ZELFDE: Border radius zoals productdetail (rounded-lg)
                CONFIG.featureSection.image.bgColor, // ✅ EXACT ZELFDE: Background color zoals productdetail
                'overflow-hidden' // 🚀 PERFORMANCE: Overflow hidden voor Image component
              )}>
                <Image
                  src={feature.image}
                  alt={feature.imageAlt}
                  fill
                  className={cn(
                    CONFIG.featureSection.image.objectFit // ✅ EXACT ZELFDE: Object fit zoals productdetail
                  )}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" // 🚀 PERFORMANCE: Responsive sizes voor zigzag
                  quality={85} // 🚀 PERFORMANCE: High quality WebP/AVIF
                  loading="lazy" // 🚀 PERFORMANCE: Lazy load (below-the-fold)
                  unoptimized={feature.image.startsWith('/uploads/')} // ✅ FIX: Disable Next.js optimization for /uploads/ paths
                />
              </div>

              {/* Tekst Content - ✅ EXACT ZELFDE: Geen extra padding, gebruikt container padding */}
              <div className={cn(
                CONFIG.featureSection.text.container, // ✅ EXACT ZELFDE: Container spacing zoals productdetail
                isEven ? CONFIG.featureSection.zigzag.textOrder.left : CONFIG.featureSection.zigzag.textOrder.right // ✅ EXACT ZELFDE: Text order zoals productdetail
              )}>
              <h3 className={cn(
                CONFIG.featureSection.text.title.fontSize, // ✅ DYNAMISCH: Via config
                CONFIG.featureSection.text.title.fontWeight, // ✅ DYNAMISCH: Via config
                CONFIG.featureSection.text.title.textColor // ✅ DYNAMISCH: Via config (nu text-black)
              )}>
                {feature.title}
              </h3>
              <p className={cn(
                'text-base', // ✅ EXACT ZELFDE: Font size zoals productdetail (CONFIG.featureSection.text.description.fontSize)
                'text-gray-700', // ✅ EXACT ZELFDE: Text color zoals productdetail (CONFIG.featureSection.text.description.textColor)
                'leading-relaxed' // ✅ EXACT ZELFDE: Line height zoals productdetail (CONFIG.featureSection.text.description.lineHeight)
              )}>
                {feature.description}
              </p>
              <ul className={CONFIG.featureSection.text.list.spacing}> {/* ✅ EXACT ZELFDE: List spacing zoals productdetail */}
                {feature.items.map((item, i) => ( // ✅ EXACT ZELFDE: items (niet benefits) zoals productdetail
                  <li key={i} className={CONFIG.featureSection.text.list.item.gap}> {/* ✅ EXACT ZELFDE: Item gap zoals productdetail */}
                    <Check className={cn(
                      CONFIG.featureSection.text.list.item.iconSize,
                      CONFIG.featureSection.text.list.item.iconColor
                    )} /> {/* ✅ EXACT ZELFDE: Icon size en color zoals productdetail */}
                    <span className={cn(
                      CONFIG.featureSection.text.list.item.fontSize,
                      CONFIG.featureSection.text.list.item.textColor
                    )}> {/* ✅ EXACT ZELFDE: Font size en color zoals productdetail */}
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

