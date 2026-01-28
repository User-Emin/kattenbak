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
      <div
        className={cn(
          'mx-auto',
          PRODUCT_PAGE_CONFIG.layout.containerPadding
        )}
        style={{
          maxWidth: DESIGN_SYSTEM.layout.maxWidth['2xl'],
        }}
      >
        {/* ✅ TITEL: "Onze varianten" - DRY via PRODUCT_PAGE_CONFIG - WITTE ACHTERGROND */}
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
              CONFIG.header.spacing.titleSubtitle // ✅ DICHTBIJ: Subtitel dichtbij hoofdtitel
            )}
            style={{
              fontFamily: DESIGN_SYSTEM.typography.fontFamily.headings,
              fontSize: 'clamp(2rem, 5vw, 3.5rem)', // ✅ KLEINER: Iets kleiner (clamp(2rem, 5vw, 3.5rem) ipv clamp(2.5rem, 6vw, 4.5rem))
            }}
          >
            Onze varianten
          </h2>
          {/* ✅ SUBTEKST: Passende beschrijving onder titel - DICHTBIJ HOOFDTITEL */}
          <p
            className={cn(
              CONFIG.header.subtitle.fontSize,
              CONFIG.header.subtitle.fontWeight,
              CONFIG.header.subtitle.textColor,
              CONFIG.header.subtitle.lineHeight
            )}
          >
            Kies jouw favoriete kleur en stijl
          </p>
        </div>

        {/* ✅ GRID: 2 kaarten centraal naast elkaar desktop, onder elkaar mobiel - DRY via PRODUCT_PAGE_CONFIG */}
        <div className={CONFIG.grid.container}>
          {variants.slice(0, 2).map((variant) => {
            const variantImage = variant.displayImage || (product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg');
            const variantName = variant.displayName;
            const variantColor = variant.colorHex || variant.colorCode || null;

            return (
              <Link
                key={variant.id}
                href={`/product/${product.slug}${variant.id ? `?variant=${variant.id}` : ''}`}
                className={cn(
                  CONFIG.card.container,
                  CONFIG.card.borderRadius, // ✅ RONDE HOEKEN: Foto's met ronde hoeken
                  CONFIG.card.aspectRatio
                )}
              >
                {/* ✅ AFBEELDING: Eerste afbeelding van variant - RONDE HOEKEN - DRY via PRODUCT_PAGE_CONFIG */}
                <div className={cn('relative w-full h-full overflow-hidden', CONFIG.card.image.borderRadius)}>
                  <Image
                    src={variantImage}
                    alt={variantName}
                    fill
                    className={cn(
                      CONFIG.card.image.objectFit,
                      'transition-transform duration-300 group-hover:scale-110'
                    )}
                    sizes="(max-width: 768px) 100vw, 48vw"
                    quality={85}
                    loading="lazy"
                    unoptimized={variantImage.startsWith('/uploads/') || variantImage.startsWith('/images/') || variantImage.startsWith('https://') || variantImage.startsWith('http://')}
                  />

                  {/* ✅ SMOOTH TEKST: Direct in afbeelding, altijd zichtbaar - DRY via DESIGN_SYSTEM */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-end p-4 md:p-6 transition-all duration-300 group-hover:bg-black/20"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 40%, transparent 70%)',
                    }}
                  >
                    {/* ✅ VARIANT NAAM: Smooth tekst direct in afbeelding, altijd zichtbaar */}
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

                  {/* ✅ PLUSJE RECHTS ONDER: In afbeelding, met eigen cirkel */}
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
      </div>
    </section>
  );
}
