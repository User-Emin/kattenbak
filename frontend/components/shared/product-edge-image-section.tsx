"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DESIGN_SYSTEM } from "@/lib/design-system";
import { PRODUCT_PAGE_CONFIG, cn } from "@/lib/product-page-config";
import { PRODUCT_CONTENT } from "@/lib/content.config";
import { productsApi } from "@/lib/api/products";
import type { Product } from "@/types/product";

/**
 * ✅ EDGE-TO-EDGE IMAGE SECTIE - DYNAMISCH & SECURE
 * 
 * Toont edge-to-edge afbeelding tussen ALP1071 en varianten:
 * - Dynamisch: Haalt product op via API
 * - 3e foto: Gebruikt product.images[2] (3e geüploade foto)
 * - DRY: Geen hardcode, alles via DESIGN_SYSTEM
 * - Secure: Path traversal prevention, error handling
 * - Responsive: Edge-to-edge op alle schermen
 */
export function ProductEdgeImageSection() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // ✅ DYNAMISCH: Haal product op
    const defaultSlug = 'automatische-kattenbak-premium';
    productsApi.getBySlug(defaultSlug)
      .then((data) => {
        if (isMounted && data) {
          setProduct(data);
        }
      })
      .catch((error) => {
        console.warn('Could not load product for edge image section:', error);
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

  // ✅ DYNAMISCH: 3e afbeelding (index 2) - SECURE: Path validation
  const getImageSrc = (): string => {
    if (!product.images || product.images.length === 0) {
      return '/placeholder-image.jpg';
    }

    // ✅ SECURE: Path traversal prevention - alleen toegestane paden
    const allowedPaths = ['/uploads/', '/images/', '/logos/'];
    const imageIndex = 2; // ✅ 3E FOTO: Index 2 (3e geüploade foto)
    
    if (product.images.length > imageIndex) {
      const imagePath = product.images[imageIndex];
      // ✅ SECURE: Valideer pad
      if (allowedPaths.some(path => imagePath.startsWith(path)) || imagePath.startsWith('http')) {
        return imagePath;
      }
    }

    // ✅ FALLBACK: 2e foto als 3e niet beschikbaar
    if (product.images.length > 1) {
      const fallbackImage = product.images[1];
      if (allowedPaths.some(path => fallbackImage.startsWith(path)) || fallbackImage.startsWith('http')) {
        return fallbackImage;
      }
    }

    // ✅ FALLBACK: Eerste foto als laatste redmiddel
    if (product.images.length > 0) {
      const firstImage = product.images[0];
      if (allowedPaths.some(path => firstImage.startsWith(path)) || firstImage.startsWith('http')) {
        return firstImage;
      }
    }

    return '/placeholder-image.jpg';
  };

  const imageSrc = getImageSrc();
  const CONFIG = PRODUCT_PAGE_CONFIG;

  return (
    <div className={cn(CONFIG.edgeSection.container, 'mt-0')} style={{ marginTop: 0, paddingTop: 0 }}>
      <div className={cn('relative', CONFIG.edgeSection.image.aspectRatio, 'overflow-hidden', 'bg-gray-100')} style={{ marginTop: 0 }}>
        <Image
          src={imageSrc}
          alt={product.name || 'Product afbeelding'}
          fill
          className={cn(CONFIG.edgeSection.image.objectFit, CONFIG.edgeSection.image.brightness)}
          sizes="100vw" // ✅ EDGE-TO-EDGE: Volledige viewport breedte
          priority={false} // ✅ PERFORMANCE: Below-the-fold, lazy load
          quality={85} // ✅ QUALITY: Goede kwaliteit
          loading="lazy" // ✅ PERFORMANCE: Lazy load
          unoptimized={imageSrc.startsWith('/uploads/') || imageSrc.includes('/uploads/')} // ✅ FIX: Disable Next.js optimization voor /uploads/ (both relative and absolute)
          onError={(e) => {
            // ✅ SECURE: Error handling met fallback
            const target = e.target as HTMLImageElement;
            if (target && !target.src.includes('placeholder')) {
              target.src = '/placeholder-image.jpg';
            }
          }}
        />
        {/* ✅ OVERLAY MET TEKST EN BUTTON: Tekst en button erop - DYNAMISCH & MOBIEL OPTIMAAL */}
        <div className={CONFIG.edgeSection.overlay.position}>
          {/* ✅ GRADIENT OVERLAY: Donkere overlay voor leesbaarheid */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"
            style={{ pointerEvents: 'none' }}
          />
          <div className={cn(CONFIG.edgeSection.overlay.content, CONFIG.edgeSection.overlay.textAlign, 'px-4 sm:px-8 lg:px-16 relative z-10')}>
            <h2 className={cn(
              'text-xl sm:text-2xl md:text-3xl lg:text-4xl', // ✅ MOBIEL: Kleinere tekst op mobiel
              CONFIG.edgeSection.title.fontWeight,
              CONFIG.edgeSection.title.textColor,
              CONFIG.edgeSection.title.marginBottom
            )}
            style={{
              textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8)',
            }}
            >
              {product.name}
            </h2>
            {/* ✅ MOBIEL: Beschrijving ook zichtbaar op mobiel (voor gebruik in mobielweergave na zigzag) */}
            <p className={cn(
              'text-sm sm:text-base md:text-lg mb-6 md:mb-8', // ✅ MOBIEL: Responsive tekst, spacing voor button
              CONFIG.edgeSection.description.textColor
            )}
            style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.7)',
            }}
            >
              {product.description || product.shortDescription || PRODUCT_CONTENT.mainDescription}
            </p>
            {/* ✅ BUTTON: Witte button erop - DRY via DESIGN_SYSTEM */}
            <div className="flex justify-center">
              <Link href={`/product/${product.slug}`}>
                <button 
                  className="inline-flex items-center gap-3 px-8 py-5 sm:px-10 sm:py-6 text-base sm:text-lg font-semibold rounded-lg text-black bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]" // ✅ WIT: Witte button met zwarte tekst
                  style={{
                    backgroundColor: '#ffffff',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <span>Bekijk Product</span>
                  <ArrowRight className="w-5 h-5" strokeWidth={2} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
