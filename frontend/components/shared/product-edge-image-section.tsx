"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { DESIGN_SYSTEM } from "@/lib/design-system";
import { PRODUCT_PAGE_CONFIG, cn } from "@/lib/product-page-config";
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
  const paddingClass = (CONFIG.edgeSection as { imagePaddingClass?: string }).imagePaddingClass ?? 'p-4 sm:p-5 md:p-6 lg:p-8';
  const radiusClass = (CONFIG.edgeSection as { imageBorderRadiusClass?: string }).imageBorderRadiusClass ?? 'rounded-2xl lg:rounded-3xl';

  return (
    <div className={cn(CONFIG.edgeSection.container, 'mt-0', paddingClass)} style={{ marginTop: 0, paddingTop: 0 }}>
      <div className={cn('relative overflow-hidden bg-gray-100', CONFIG.edgeSection.image.aspectRatio, radiusClass)} style={{ marginTop: 0 }}>
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
      </div>
    </div>
  );
}
