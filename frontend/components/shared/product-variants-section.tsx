"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { DESIGN_SYSTEM } from "@/lib/design-system";
import { PRODUCT_PAGE_CONFIG } from "@/lib/product-page-config"; // ✅ DRY: Via PRODUCT_PAGE_CONFIG
import { productsApi } from "@/lib/api/products";
import type { Product, ProductVariant } from "@/types/product";
import { getProductImage } from "@/lib/image-config";
import { getVariantImage } from "@/lib/variant-utils"; // ✅ VARIANT SYSTEM: Shared utility (modulair, geen hardcode)
import { cn } from "@/lib/utils";

/**
 * ✅ VARIANTEN SECTIE - DYNAMISCH & SMOOTH
 * 
 * Toont alle varianten van het featured product:
 * - Dynamisch: Haalt varianten op via API
 * - Smooth: Tekst direct in afbeelding met overlay effect
 * - DRY: Geen hardcode, alles via DESIGN_SYSTEM
 * - Responsive: Grid layout, mobile-friendly
 */
export function ProductVariantsSection() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // ✅ DYNAMISCH: Haal featured product op met varianten
    // ✅ FALLBACK: Gebruik default product slug als featured niet beschikbaar is
    const defaultSlug = 'automatische-kattenbak-premium';
    productsApi.getBySlug(defaultSlug)
      .then((data) => {
        if (isMounted && data) {
          setProduct(data);
        }
      })
      .catch((error) => {
        console.warn('Could not load product variants:', error);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ DYNAMISCH: Haal varianten op (of fallback naar product images)
  const variants: (ProductVariant & { displayImage: string; displayName: string })[] = 
    product?.variants && product.variants.length > 0
      ? product.variants
          .filter((v) => v.isActive !== false)
          .map((variant) => ({
            ...variant,
            displayImage: getVariantImage(variant, product.images as string[]) || getProductImage(product.images as string[]),
            displayName: variant.name || variant.colorName || 'Variant',
          }))
      : [];

  if (loading) {
    return null; // ✅ SMOOTH: Geen loading state, gewoon niet tonen tot data geladen is
  }

  if (!product || variants.length === 0) {
    return null; // ✅ SMOOTH: Geen sectie als geen varianten
  }

  // ✅ DRY: Config via PRODUCT_PAGE_CONFIG - geen hardcode
  const CONFIG = PRODUCT_PAGE_CONFIG.variants;

  return (
    <section
      className={cn(
        'relative w-full',
        CONFIG.container.backgroundColor,
        CONFIG.container.padding
      )}
    >
      {/* ✅ TITEL: Binnen container met padding op desktop; mobiel px-4 voor leesbaarheid */}
      <div
        className={cn(
          'mx-auto md:max-w-4xl',
          'px-4 md:px-6 lg:px-8' /* mobiel: kleine padding alleen voor titel; desktop: normaal */
        )}
      >
        <div className={cn(
          CONFIG.header.container,
          CONFIG.header.spacing.bottom
        )}>
          <h2
            className={cn(
              CONFIG.header.title.fontSize,
              CONFIG.header.title.fontWeight,
              CONFIG.header.title.textColor,
              CONFIG.header.title.letterSpacing,
            )}
            style={{
              fontFamily: DESIGN_SYSTEM.typography.fontFamily.headings,
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            }}
          >
            Onze varianten
          </h2>
        </div>
      </div>

      {/* ✅ MOBIEL: Horizontale snap-scroll met zijdelingse peek | DESKTOP: Grid centraal */}
      <div
        className={cn(
          'w-full',
          'md:mx-auto md:max-w-4xl md:px-6 lg:px-8',
          'flex md:flex-row overflow-x-auto md:overflow-visible gap-4 md:gap-8',
          'snap-x snap-mandatory md:snap-none',
          'scrollbar-hide',
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingLeft: '1rem',      /* ✅ MOBIEL: Links wat ruimte zodat 2e kaart zichtbaar pikt */
          paddingRight: '1rem',
          WebkitOverflowScrolling: 'touch', /* ✅ iOS: Smooth momentum scroll */
        } as React.CSSProperties}
      >
        {variants.slice(0, 2).map((variant) => {
          const variantImage = variant.displayImage || (product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg');
          const variantName = variant.displayName;

          return (
            <Link
              key={variant.id}
              href={`/product/${product.slug}${variant.id ? `?variant=${variant.id}` : ''}`}
              className={cn(
                'group relative overflow-hidden transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]',
                'flex-shrink-0 snap-start md:snap-align-none',
                'min-w-[80vw] w-[80vw] md:min-w-0 md:w-[48%]', /* ✅ 80vw zodat 2e kaart links peekt */
                CONFIG.card.borderRadius,
                CONFIG.card.aspectRatio
              )}
              style={{
                borderRadius: '1.5rem',
              } as React.CSSProperties}
            >
              <div
                className={cn('relative w-full h-full overflow-hidden', CONFIG.card.image.borderRadius)}
                style={{ borderRadius: '1.5rem' } as React.CSSProperties}
              >
                <Image
                  src={variantImage}
                  alt={variantName}
                  fill
                  className={cn(
                    CONFIG.card.image.objectFit,
                    'transition-transform duration-300 group-hover:scale-110'
                  )}
                  sizes="(max-width: 768px) 85vw, 48vw"
                  quality={85}
                  loading="lazy"
                  unoptimized={variantImage.startsWith('/uploads/') || variantImage.startsWith('/images/') || variantImage.startsWith('https://') || variantImage.startsWith('http://')}
                />

                <div
                  className="absolute inset-0 flex flex-col items-center justify-end p-4 md:p-6 transition-all duration-300 group-hover:bg-black/20"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 40%, transparent 70%)',
                  }}
                >
                  <h3
                    className="text-white text-center font-semibold transition-all duration-300"
                    style={{
                      fontSize: DESIGN_SYSTEM.typography.fontSize.lg,
                      fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                      textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)',
                    }}
                  >
                    {variantName}
                  </h3>
                </div>

                <div className="absolute bottom-4 right-4 transition-all duration-300 group-hover:scale-110">
                  <div className="bg-white/90 hover:bg-white rounded-full p-2 shadow-lg">
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
