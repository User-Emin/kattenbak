"use client";

import Image from "next/image";
import { PRODUCT_PAGE_CONFIG } from "@/lib/product-page-config";
import { PRODUCT_CONTENT } from "@/lib/content.config";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

/**
 * Product USP Features Component - 100% IDENTIEK AAN PRODUCTDETAIL
 * 
 * ✅ EXACT ZELFDE: Gebruikt PRODUCT_CONTENT.features (geen hardcode)
 * ✅ EXACT ZELFDE: Images dynamisch via product.images (index 3 en 4) zoals productdetail
 * ✅ EXACT ZELFDE: Layout, styling, en structuur als productdetail
 * ✅ GEEN REDUNDANTIE: Shared data en logica
 */
interface ProductUspFeaturesProps {
  product?: Product | null; // ✅ DYNAMISCH: Optionele product data voor images
}

export function ProductUspFeatures({ product = null }: ProductUspFeaturesProps = {}) {
  const CONFIG = PRODUCT_PAGE_CONFIG; // ✅ DRY: Gebruik zelfde config als productdetail
  
  // ✅ EXACT ZELFDE: Gebruik PRODUCT_CONTENT.features zoals productdetail
  // ✅ EXACT ZELFDE: Image logica identiek aan productdetail - dynamisch via product.images
  const originalImages = product?.images && Array.isArray(product.images) ? product.images : [];
  const fourthImage = originalImages[3]; // ✅ 4E FOTO: 10.5L Afvalbak (index 3)
  const fifthImage = originalImages[4];  // ✅ 5E FOTO: Geurblokje, Kwast & Afvalzak (index 4)
  
  const features = PRODUCT_CONTENT.features.map((feature, index) => {
    let imageUrl: string;
    
    if (index === 0) {
      // ✅ EXACT ZELFDE: 4E FOTO (index 3) - DIRECT uit product.images zoals productdetail
      if (fourthImage && typeof fourthImage === 'string' && !fourthImage.startsWith('data:') && !fourthImage.includes('placeholder')) {
        imageUrl = fourthImage;
      } else {
        imageUrl = '/images/capacity-10.5l-optimized.jpg';
      }
    } else if (index === 1) {
      // ✅ EXACT ZELFDE: Statische feature-2.jpg zoals productdetail
      imageUrl = '/images/feature-2.jpg';
    } else {
      // ✅ EXACT ZELFDE: 5E FOTO (index 4) - DIRECT uit product.images zoals productdetail
      if (fifthImage && typeof fifthImage === 'string' && !fifthImage.startsWith('data:') && !fifthImage.includes('placeholder')) {
        imageUrl = fifthImage;
      } else {
        imageUrl = '/images/feature-2.jpg';
      }
    }
    
    return {
      ...feature,
      image: imageUrl,
    };
  });

  return (
    <div className={cn(
      CONFIG.layout.maxWidth, // ✅ EXACT ZELFDE: Max-width zoals productdetail (max-w-7xl)
      'mx-auto',
      CONFIG.layout.containerPaddingMobile, // ✅ MOBIEL: Minder padding op mobiel (px-2 sm:px-4)
    )}>
      <div className={cn(
        CONFIG.featureSection.containerSpacing // ✅ EXACT ZELFDE: Container spacing zoals productdetail - GEEN max-w-4xl op desktop voor grotere afbeeldingen
      )}>
        {features.map((feature, index) => {
          const isEven = index % 2 === 0;
          
          return (
            <div 
              key={index} 
              className={isEven ? CONFIG.featureSection.zigzag.leftLayout : CONFIG.featureSection.zigzag.rightLayout}
            >
              {/* Image - ✅ EXACT ZELFDE: Identiek aan product detail - RONDE HOEKEN ECHT TOEGEPAST */}
              <div className={cn(
                'relative',
                'w-full md:w-auto', // ✅ MOBIEL: Full width centraal, desktop auto
                isEven ? CONFIG.featureSection.zigzag.imageOrder.left : CONFIG.featureSection.zigzag.imageOrder.right,
                CONFIG.featureSection.image.aspectRatio, // ✅ ASPECT RATIO: Meer verticale lengte (aspect-[3/4] mobiel, aspect-[4/5] desktop)
                CONFIG.featureSection.image.borderRadius, // ✅ RONDE HOEKEN: Container heeft ronde hoeken
                CONFIG.featureSection.image.bgColor,
                'overflow-hidden' // ✅ OVERFLOW: Zorgt dat afbeelding binnen container blijft met ronde hoeken
              )}
              style={{
                borderRadius: typeof window !== 'undefined' && window.innerWidth >= 1024 
                  ? CONFIG.featureSection.image.borderRadiusValue.desktop
                  : typeof window !== 'undefined' && window.innerWidth >= 768
                  ? CONFIG.featureSection.image.borderRadiusValue.tablet
                  : CONFIG.featureSection.image.borderRadiusValue.mobile
              }}>
                <Image
                  src={feature.image || '/images/placeholder.jpg'} // ✅ FIX: Geen lege string (fallback naar placeholder)
                  alt={feature.title}
                  fill // ✅ FILL: Vult container exact op
                  className="object-contain" // ✅ CONTAIN: Zigzag foto's volledig zichtbaar (niet object-cover)
                  style={{
                    borderRadius: 'inherit' // ✅ RONDE HOEKEN: Erft borderRadius van parent container
                  }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" // 🚀 PERFORMANCE: Responsive sizes voor zigzag (fastest loading)
                  quality={80} // 🚀 PERFORMANCE: Slightly lower quality for below-fold (faster)
                  loading="lazy" // 🚀 PERFORMANCE: Lazy load (below-the-fold, load only when visible)
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

              {/* Text Content - ✅ EXACT ZELFDE: Identiek aan product detail */}
              <div className={cn(
                CONFIG.featureSection.text.container,
                isEven ? CONFIG.featureSection.zigzag.textOrder.left : CONFIG.featureSection.zigzag.textOrder.right
              )}>
                <h3 className={cn(
                  CONFIG.featureSection.text.title.fontSize,
                  CONFIG.featureSection.text.title.fontWeight,
                  CONFIG.featureSection.text.title.textColor,
                  CONFIG.featureSection.text.title.letterSpacing, // ✅ EXACT ZELFDE: Letter spacing zoals productnaam
                  CONFIG.featureSection.text.title.textAlign // ✅ MOBIEL: Centraal, desktop links
                )}>
                  {feature.title}
                </h3>
                <p className={cn(
                  CONFIG.featureSection.text.description.fontSize,
                  CONFIG.featureSection.text.description.textColor,
                  CONFIG.featureSection.text.description.lineHeight,
                  CONFIG.featureSection.text.description.textAlign // ✅ MOBIEL: Centraal, desktop links
                )}>
                  {feature.description}
                </p>
                {/* ✅ BULLET POINTS VERWIJDERD: Alleen titel en beschrijving - EXACT ZELFDE ALS PRODUCTDETAIL */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

