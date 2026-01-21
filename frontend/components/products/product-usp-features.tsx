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
      title: "Gratis meegeleverd: Geurblokje, Kwast, Afvalzak en Inloopmat",
      description: "Bij aankoop krijg je gratis: geurblokje voor langdurige geurneutralisatie, kwast voor eenvoudige reiniging, afvalzak (1 rol) voor hygiënische afvalverwerking, en inloopmat voor schone poten. Alles wat je nodig hebt voor direct gebruik.",
      items: undefined, // ✅ VERWIJDERD: Geen bullet points zoals product detail
      image: "/images/feature-3.jpg", // ✅ FALLBACK: Placeholder tot echte foto beschikbaar
      imageAlt: "Gratis meegeleverd: geurblokje, kwast, afvalzak en inloopmat"
    }
  ];

  return (
    <div className={cn(
      CONFIG.layout.maxWidth, // ✅ EXACT ZELFDE: Max-width zoals productdetail (max-w-7xl)
      'mx-auto',
      CONFIG.layout.containerPadding, // ✅ EXACT ZELFDE: Container padding zoals productafbeeldingen en varianten (px-4 sm:px-6 md:px-8 lg:px-8)
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
              {/* Image - ✅ EXACT ZELFDE: Identiek aan product detail - rondige hoeken, edge-to-edge */}
              <div className={cn(
                'relative',
                'w-full md:w-auto', // ✅ MOBIEL: Full width centraal, desktop auto
                isEven ? CONFIG.featureSection.zigzag.imageOrder.left : CONFIG.featureSection.zigzag.imageOrder.right, // ✅ EXACT ZELFDE: Image order zoals productdetail
                CONFIG.featureSection.image.aspectRatio, // ✅ EXACT ZELFDE: Aspect ratio zoals productdetail
                CONFIG.featureSection.image.borderRadius, // ✅ EXACT ZELFDE: Rondige hoeken (rounded-2xl sm:rounded-3xl) zoals productdetail
                CONFIG.featureSection.image.bgColor, // ✅ EXACT ZELFDE: Background color zoals productdetail
                'overflow-hidden' // ✅ OVERFLOW: Zorgt dat afbeelding binnen container blijft
              )}>
                <Image
                  src={feature.image}
                  alt={feature.imageAlt}
                  fill
                  className="object-contain" // ✅ CONTAIN: Zigzag foto's volledig zichtbaar (niet object-cover) zoals product detail
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" // 🚀 PERFORMANCE: Responsive sizes voor zigzag
                  quality={80} // 🚀 PERFORMANCE: Slightly lower quality for below-fold (faster) zoals product detail
                  loading="lazy" // 🚀 PERFORMANCE: Lazy load (below-the-fold)
                  placeholder="blur" // 🚀 PERFORMANCE: Blur placeholder for smooth loading
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==" // 🚀 PERFORMANCE: Instant blur placeholder
                  unoptimized={feature.image?.startsWith('/uploads/') || feature.image?.startsWith('/images/') || feature.image?.startsWith('https://') || feature.image?.startsWith('http://')} // ✅ FIX: Disable Next.js optimization for /uploads/, /images/, and https:// paths
                  onError={(e) => {
                    // ✅ FALLBACK: Als afbeelding niet laadt, toon placeholder
                    const target = e.target as HTMLImageElement;
                    if (target && !target.src.includes('placeholder')) {
                      target.src = '/images/placeholder.jpg';
                    }
                  }}
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
                CONFIG.featureSection.text.title.textColor, // ✅ DYNAMISCH: Via config (nu text-black)
                CONFIG.featureSection.text.title.letterSpacing, // ✅ EXACT ZELFDE: Letter spacing zoals productnaam
                CONFIG.featureSection.text.title.textAlign // ✅ MOBIEL: Centraal, desktop links
              )}>
                {feature.title}
              </h3>
              <p className={cn(
                CONFIG.featureSection.text.description.fontSize, // ✅ DYNAMISCH: Via config
                CONFIG.featureSection.text.description.textColor, // ✅ DYNAMISCH: Via config
                CONFIG.featureSection.text.description.lineHeight, // ✅ DYNAMISCH: Via config
                CONFIG.featureSection.text.description.textAlign // ✅ MOBIEL: Centraal, desktop links
              )}>
                {feature.description}
              </p>
              {/* ✅ BULLET POINTS: Alleen tonen als items aanwezig zijn (niet voor gratis meegeleverd) */}
              {feature.items && Array.isArray(feature.items) && feature.items.length > 0 && (
                <ul className={CONFIG.featureSection.text.list.spacing}>
                  {feature.items.map((item, i) => (
                    <li key={i} className={CONFIG.featureSection.text.list.item.gap}>
                      <Check className={cn(
                        CONFIG.featureSection.text.list.item.iconSize,
                        CONFIG.featureSection.text.list.item.iconColor
                      )} />
                      <span className={cn(
                        CONFIG.featureSection.text.list.item.fontSize,
                        CONFIG.featureSection.text.list.item.textColor
                      )}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

