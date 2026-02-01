"use client";

import { PRODUCT_PAGE_CONFIG } from "@/lib/product-page-config";
import { PRODUCT_CONTENT } from "@/lib/content.config";
import { FeatureImageRounded } from "@/components/ui/feature-image-rounded";
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
              {/* Image - ✅ FeatureImageRounded: zigzag radius uit config */}
              <FeatureImageRounded
                src={feature.image || '/images/placeholder.jpg'}
                alt={feature.title}
                className={cn(
                  'w-full md:w-auto',
                  isEven ? CONFIG.featureSection.zigzag.imageOrder.left : CONFIG.featureSection.zigzag.imageOrder.right
                )}
                borderRadiusClassName={CONFIG.featureSection.image.borderRadius}
                innerClassName={cn(
                  'aspect-[3/4] md:aspect-[4/5]',
                  CONFIG.featureSection.image.bgColor,
                  'overflow-hidden'
                )}
                objectFit={(CONFIG.featureSection.image as { objectFit?: 'cover' | 'contain' }).objectFit ?? 'cover'}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                quality={80}
                unoptimized={
                  feature.image?.startsWith('/uploads/') ||
                  feature.image?.startsWith('/images/') ||
                  feature.image?.startsWith('https://') ||
                  feature.image?.startsWith('http://')
                }
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target && !target.src.includes('placeholder')) {
                    target.src = '/images/placeholder.jpg';
                  }
                }}
              />

              {/* Text Content - ✅ EXACT ZELFDE: Identiek aan product detail */}
              <div className={cn(
                CONFIG.featureSection.text.container,
                isEven ? CONFIG.featureSection.zigzag.textOrder.left : CONFIG.featureSection.zigzag.textOrder.right
              )}>
                <h3 
                  className={cn(
                    CONFIG.featureSection.text.title.fontSize,
                    CONFIG.featureSection.text.title.fontWeight,
                    CONFIG.featureSection.text.title.letterSpacing, // ✅ EXACT ZELFDE: Letter spacing zoals productnaam
                    CONFIG.featureSection.text.title.textAlign, // ✅ MOBIEL: Centraal, desktop links
                    'text-black' // ✅ ZWART: Zigzag titels zwart
                  )}
                  style={{ color: '#000000' }} // ✅ ZWART: Forceer zwart, geen gradient
                >
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

