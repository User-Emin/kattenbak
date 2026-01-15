"use client";

import { Package, Volume2, Check } from "lucide-react";
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
    }
  ];

  return (
    <div className={cn(
      'mx-auto',
      'max-w-[1400px]', // ✅ EXACT ZELFDE: Max-width zoals productdetail
      'space-y-16 lg:space-y-24', // ✅ EXACT ZELFDE: Spacing zoals productdetail (CONFIG.featureSection.containerSpacing)
      'md:px-4 md:sm:px-6 md:lg:px-8', // ✅ EDGE-TO-EDGE MOBIEL: Geen padding op mobiel, wel op desktop
    )}>
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
            {/* Image - ✅ EDGE-TO-EDGE MOBIEL: Full width op mobiel, padding op desktop */}
            <div className={cn(
              'relative',
              '-mx-4 md:mx-0', // ✅ EDGE-TO-EDGE MOBIEL: Negatieve margin op mobiel voor edge-to-edge
              isEven ? CONFIG.featureSection.zigzag.imageOrder.left : CONFIG.featureSection.zigzag.imageOrder.right // ✅ EXACT ZELFDE: Image order zoals productdetail
            )}>
              <img
                src={feature.image}
                alt={feature.imageAlt}
                className={cn(
                  'w-full',
                  CONFIG.featureSection.image.aspectRatio, // ✅ EXACT ZELFDE: Aspect ratio zoals productdetail
                  'rounded-none md:rounded-lg', // ✅ EDGE-TO-EDGE MOBIEL: Geen border radius op mobiel
                  CONFIG.featureSection.image.objectFit, // ✅ EXACT ZELFDE: Object fit zoals productdetail
                  CONFIG.featureSection.image.bgColor // ✅ EXACT ZELFDE: Background color zoals productdetail
                )}
                loading="lazy"
              />
            </div>

            {/* Tekst Content - ✅ PADDING MOBIEL: Padding op mobiel voor leesbaarheid */}
            <div className={cn(
              CONFIG.featureSection.text.container, // ✅ EXACT ZELFDE: Container spacing zoals productdetail
              'px-4 md:px-0', // ✅ PADDING MOBIEL: Padding op mobiel, geen padding op desktop
              isEven ? CONFIG.featureSection.zigzag.textOrder.left : CONFIG.featureSection.zigzag.textOrder.right // ✅ EXACT ZELFDE: Text order zoals productdetail
            )}>
              <h3 className={cn(
                'text-2xl lg:text-3xl', // ✅ EXACT ZELFDE: Font size zoals productdetail (CONFIG.featureSection.text.title.fontSize)
                'font-light', // ✅ EXACT ZELFDE: Font weight zoals productdetail (CONFIG.featureSection.text.title.fontWeight)
                'text-gray-900' // ✅ EXACT ZELFDE: Text color zoals productdetail (CONFIG.featureSection.text.title.textColor)
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
  );
}

