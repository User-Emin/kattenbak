"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { DESIGN_SYSTEM } from "@/lib/design-system";
import { productsApi } from "@/lib/api/products";
import type { Product, ProductVariant } from "@/types/product";

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
            displayImage: variant.previewImage || variant.colorImageUrl || (variant.images && variant.images.length > 0 ? variant.images[0] : null) || (product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg'),
            displayName: variant.name || variant.colorName || 'Variant',
          }))
      : [];

  if (loading) {
    return null; // ✅ SMOOTH: Geen loading state, gewoon niet tonen tot data geladen is
  }

  if (!product || variants.length === 0) {
    return null; // ✅ SMOOTH: Geen sectie als geen varianten
  }

  return (
    <section
      className="relative w-full py-12 md:py-16"
      style={{
        backgroundColor: '#000000', // ✅ ZWART: Volledig zwart achtergrond
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: DESIGN_SYSTEM.layout.maxWidth['2xl'],
          padding: `0 ${DESIGN_SYSTEM.spacing.containerPadding}`,
        }}
      >
        {/* ✅ TITEL: "Onze varianten" - DRY via DESIGN_SYSTEM */}
        <h2
          className="text-center mb-8 md:mb-12"
          style={{
            fontFamily: DESIGN_SYSTEM.typography.fontFamily.headings,
            fontSize: DESIGN_SYSTEM.typography.fontSize['4xl'],
            fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
            color: '#FFFFFF', // ✅ WIT: Volledig wit tekst
            letterSpacing: DESIGN_SYSTEM.typography.letterSpacing.tight,
          }}
        >
          Onze varianten
        </h2>

        {/* ✅ GRID: Varianten naast elkaar - DRY & RESPONSIVE */}
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {variants.map((variant) => {
            const variantImage = variant.displayImage || (product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg');
            const variantName = variant.displayName;
            const variantColor = variant.colorHex || variant.colorCode || null;

            return (
              <Link
                key={variant.id}
                href={`/product/${product.slug}${variant.id ? `?variant=${variant.id}` : ''}`}
                className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-[1.02]"
                style={{
                  aspectRatio: '1/1', // ✅ VIERKANT: Perfect vierkant voor varianten
                }}
              >
                {/* ✅ AFBEELDING: Eerste afbeelding van variant */}
                <div className="relative w-full h-full">
                  <Image
                    src={variantImage}
                    alt={variantName}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    quality={85}
                    loading="lazy"
                    unoptimized={variantImage.startsWith('/uploads/')}
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

                    {/* ✅ KLEUR INDICATOR: Alleen tonen als kleur beschikbaar */}
                    {variantColor && (
                      <div
                        className="mt-2 w-6 h-6 rounded-full border-2 border-white/90 transition-all duration-300 group-hover:scale-110"
                        style={{
                          backgroundColor: variantColor,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.7)',
                        }}
                      />
                    )}
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
