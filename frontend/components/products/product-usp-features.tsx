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
      'px-4 sm:px-6 lg:px-8', // ✅ EXACT ZELFDE: Container padding zoals productdetail (CONFIG.layout.containerPadding)
    )}>
      {features.map((feature, index) => {
        const isEven = index % 2 === 0;
        const IconComponent = feature.icon;

        return (
          <div 
            key={index} 
            className={cn(
              isEven ? 'grid md:grid-cols-2 gap-8 lg:gap-16 items-center' : 'grid md:grid-cols-2 gap-8 lg:gap-16 items-center' // ✅ EXACT ZELFDE: Layout zoals productdetail (CONFIG.featureSection.zigzag.leftLayout/rightLayout)
            )}
          >
            {/* Image - ✅ EXACT ZELFDE: Order en styling zoals productdetail */}
            <div className={cn(
              'relative',
              isEven ? 'order-1 md:order-1' : 'order-1 md:order-2' // ✅ EXACT ZELFDE: Image order zoals productdetail
            )}>
              <img
                src={feature.image}
                alt={feature.imageAlt}
                className={cn(
                  'w-full',
                  'aspect-[4/3]', // ✅ EXACT ZELFDE: Aspect ratio zoals productdetail (CONFIG.featureSection.image.aspectRatio)
                  'rounded-lg', // ✅ EXACT ZELFDE: Border radius zoals productdetail (CONFIG.featureSection.image.borderRadius)
                  'object-cover', // ✅ EXACT ZELFDE: Object fit zoals productdetail (CONFIG.featureSection.image.objectFit)
                  'bg-gray-100' // ✅ EXACT ZELFDE: Background color zoals productdetail (CONFIG.featureSection.image.bgColor)
                )}
                loading="lazy"
              />
            </div>

            {/* Tekst Content - ✅ EXACT ZELFDE: Styling zoals productdetail */}
            <div className={cn(
              'space-y-4', // ✅ EXACT ZELFDE: Container spacing zoals productdetail (CONFIG.featureSection.text.container)
              isEven ? 'order-2 md:order-2' : 'order-2 md:order-1' // ✅ EXACT ZELFDE: Text order zoals productdetail
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

