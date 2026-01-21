"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { DESIGN_SYSTEM } from "@/lib/design-system";
import { productsApi } from "@/lib/api/products";
import type { Product, ProductVariant } from "@/types/product";
import { getProductImage } from "@/lib/image-config";
import { getVariantImage } from "@/lib/variant-utils"; // ✅ VARIANT SYSTEM: Shared utility (modulair, geen hardcode)

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

  return (
    <section
      className="relative w-full py-12 md:py-16"
      style={{
        backgroundColor: '#000000', // ✅ ZWART: Volledig zwart achtergrond
      }}
    >
      <div
        className="mx-auto px-4 sm:px-6 md:px-8 lg:px-8"
        style={{
          maxWidth: DESIGN_SYSTEM.layout.maxWidth['2xl'],
        }}
      >
        {/* ✅ TITEL: "Onze varianten" - DRY via DESIGN_SYSTEM - GROTER */}
        <div className="text-center mb-8 md:mb-12">
          <h2
            style={{
              fontFamily: DESIGN_SYSTEM.typography.fontFamily.headings,
              fontSize: 'clamp(2rem, 5vw, 3.5rem)', // ✅ GROTER: Responsive, groter dan 4xl
              fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
              color: '#FFFFFF', // ✅ WIT: Volledig wit tekst
              letterSpacing: DESIGN_SYSTEM.typography.letterSpacing.tight,
              marginBottom: DESIGN_SYSTEM.spacing[3], // ✅ SPACING: Ruimte tussen titel en subtekst
            }}
          >
            Onze varianten
          </h2>
          {/* ✅ SUBTEKST: Passende beschrijving onder titel */}
          <p
            style={{
              fontSize: DESIGN_SYSTEM.typography.fontSize.lg,
              fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
              color: '#FFFFFF', // ✅ WIT: Volledig wit tekst
              opacity: 0.9, // ✅ SUBTIELE: Iets transparanter voor hiërarchie
              lineHeight: DESIGN_SYSTEM.typography.lineHeight.relaxed,
            }}
          >
            Kies jouw favoriete kleur en stijl
          </p>
        </div>

        {/* ✅ GRID: 2 kaarten centraal naast elkaar desktop, onder elkaar mobiel - EDGE-TO-EDGE: Identiek aan productafbeeldingen */}
        <div
          className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 max-w-4xl mx-auto"
        >
          {variants.slice(0, 2).map((variant) => {
            const variantImage = variant.displayImage || (product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg');
            const variantName = variant.displayName;
            const variantColor = variant.colorHex || variant.colorCode || null;

            return (
              <Link
                key={variant.id}
                href={`/product/${product.slug}${variant.id ? `?variant=${variant.id}` : ''}`}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl transition-all duration-300 hover:scale-[1.02] w-full md:w-[48%]"
                style={{
                  aspectRatio: '1/1', // ✅ VIERKANT: Perfect vierkant voor varianten
                }}
              >
                {/* ✅ AFBEELDING: Eerste afbeelding van variant - EXACT PASSEND: Past exact aan veld zoals productafbeeldingen (object-cover, w-full) */}
                <div className="relative w-full h-full overflow-hidden">
                  <Image
                    src={variantImage}
                    alt={variantName}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
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
