"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DESIGN_SYSTEM } from "@/lib/design-system";
import { productsApi } from "@/lib/api/products";
import type { Product } from "@/types/product";
import { ArrowRight } from "lucide-react";

/**
 * ✅ PRODUCT BESCHRIJVING SECTIE - DYNAMISCH
 * 
 * Toont product naam en beschrijving onder variantensectie:
 * - Dynamisch: Haalt product op via API
 * - DRY: Geen hardcode, alles via DESIGN_SYSTEM
 * - Responsive: Mobile-friendly
 */
export function ProductDescriptionSection() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // ✅ DYNAMISCH: Haal featured product op
    const defaultSlug = 'automatische-kattenbak-premium';
    productsApi.getBySlug(defaultSlug)
      .then((data) => {
        if (isMounted && data) {
          setProduct(data);
        }
      })
      .catch((error) => {
        console.warn('Could not load product description:', error);
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

  if (loading || !product) {
    return null; // ✅ SMOOTH: Geen loading state
  }

  // ✅ BESTE TEKST: Haal de beste beschrijving uit product
  const displayName = product.name || 'ALP1071 Kattenbak';
  const displayDescription = product.description || product.shortDescription || 'De beste automatische kattenbak met zelfreinigende functie. Perfect voor katten tot 7kg. Volledig automatisch met app-bediening.';

  return (
    <section
      className="relative w-full py-12 md:py-16"
      style={{
        backgroundColor: DESIGN_SYSTEM.colors.secondary, // ✅ WIT: Wit achtergrond
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: DESIGN_SYSTEM.layout.maxWidth['2xl'],
          padding: `0 ${DESIGN_SYSTEM.spacing.containerPadding}`,
        }}
      >
        {/* ✅ PRODUCT NAAM & BESCHRIJVING: Dynamisch, geen hardcode */}
        <div className="text-center space-y-4 md:space-y-6">
          <h2
            style={{
              fontFamily: DESIGN_SYSTEM.typography.fontFamily.headings,
              fontSize: DESIGN_SYSTEM.typography.fontSize['3xl'],
              fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
              color: DESIGN_SYSTEM.colors.text.primary,
              letterSpacing: DESIGN_SYSTEM.typography.letterSpacing.tight,
            }}
          >
            {displayName}
          </h2>
          
          <p
            className="max-w-2xl mx-auto"
            style={{
              fontSize: DESIGN_SYSTEM.typography.fontSize.lg,
              fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
              color: DESIGN_SYSTEM.colors.text.secondary,
              lineHeight: DESIGN_SYSTEM.typography.lineHeight.relaxed,
            }}
          >
            {displayDescription}
          </p>

          {/* ✅ CTA BUTTON: Link naar product detail */}
          <div className="pt-4">
            <Link href={`/product/${product.slug}`}>
              <button
                className="inline-flex items-center gap-2 transition-all hover:opacity-90"
                style={{
                  background: DESIGN_SYSTEM.colors.text.primary, // ✅ ZWART
                  color: DESIGN_SYSTEM.colors.text.inverse,
                  padding: `${DESIGN_SYSTEM.spacing[3]} ${DESIGN_SYSTEM.spacing[6]}`,
                  fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                  borderRadius: DESIGN_SYSTEM.effects.borderRadius.xl,
                }}
              >
                <span>Bekijk Product</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
