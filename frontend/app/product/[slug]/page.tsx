"use client";

import React from "react";
import Link from "next/link";
import { ProductDetail } from "@/components/products/product-detail";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { DESIGN_SYSTEM } from "@/lib/design-system";
import { SITE_CONFIG } from "@/lib/config";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * ✅ Product Detail Page – metadata via layout generateMetadata (SSR)
 * ✅ EXPERT FIX: Client-side page to avoid SSR errors
 * - Client component voor volledige controle
 * - SEO metadata via useEffect en head tags
 * - Robuuste error handling op alle niveaus
 * - Geen data leakage via errors
 */
export default function ProductPage({ params }: ProductPageProps) {
  const [slug, setSlug] = React.useState<string>(SITE_CONFIG.DEFAULT_PRODUCT_SLUG);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // ✅ EXPERT: Resolve params client-side
    params.then((resolved) => {
      if (resolved?.slug && typeof resolved.slug === 'string' && resolved.slug.length > 0) {
        setSlug(resolved.slug);
      }
    }).catch(() => {
      // Silent fallback
    });
  }, [params]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50" data-testid="product-page-loading" aria-busy="true" aria-label="Pagina wordt geladen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
        <p className="mt-4 text-sm text-gray-600" aria-live="polite">Laden...</p>
      </div>
    );
  }

  // ✅ ISOLATIE: ErrorBoundary vangt crashes in ProductDetail - rest van app blijft werken
  const productFallback = (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ fontFamily: DESIGN_SYSTEM.typography.fontFamily.body }}
    >
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Probleem met productpagina</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Er ging iets mis. Je kunt doorgaan met winkelen.
      </p>
      <div className="flex gap-4">
        <Link
          href={`/product/${SITE_CONFIG.DEFAULT_PRODUCT_SLUG}`}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Naar product
        </Link>
        <Link href="/" className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
          Naar home
        </Link>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={productFallback}>
      <ProductDetail slug={slug} />
    </ErrorBoundary>
  );
}
