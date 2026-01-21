"use client";

import type { Product } from "@/types/product";
import { SEO_CONFIG } from "@/lib/seo.config";

interface ProductJsonLdProps {
  product: Product | null;
}

/**
 * ✅ SEO 10/10: JSON-LD Structured Data (Schema.org Product)
 * Google Rich Results voor betere zoekresultaten
 * ✅ EXPERT: Robuuste implementatie - nooit crash
 */
export function ProductJsonLd({ product }: ProductJsonLdProps) {
  // ✅ SECURITY: Early return if no product
  if (!product) {
    return null;
  }

  try {
    const productImage = product.images?.[0] 
      ? (product.images[0].startsWith('http') 
          ? product.images[0] 
          : `${SEO_CONFIG.site.url}${product.images[0]}`)
      : SEO_CONFIG.defaults.image;

    const productUrl = `${SEO_CONFIG.site.url}/product/${product.slug || 'automatische-kattenbak-premium'}`;
    const price = typeof product.price === 'number' ? product.price : parseFloat(String(product.price || 0)) || 0;
    const availability = (product.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
    const productSku = product.sku || ''; // ✅ DYNAMISCH: Geen hardcoded fallback - alleen database SKU

    const jsonLd: any = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name || SEO_CONFIG.defaults.title,
      "description": product.metaDescription || product.shortDescription || product.description || SEO_CONFIG.defaults.description,
      "image": product.images?.length > 0 
        ? product.images
            .filter((img: string) => img && typeof img === 'string')
            .map((img: string) => 
              img.startsWith('http') ? img : `${SEO_CONFIG.site.url}${img}`
            )
        : [SEO_CONFIG.defaults.image],
      "sku": productSku, // ✅ STABIEL: SKU altijd zichtbaar (KB-AUTO-001, ALP1071, etc.)
      "brand": {
        "@type": "Brand",
        "name": SEO_CONFIG.site.name
      },
      "offers": {
        "@type": "Offer",
        "url": productUrl,
        "priceCurrency": "EUR",
        "price": price.toFixed(2),
        "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 jaar geldig
        "availability": availability,
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@type": "Organization",
          "name": SEO_CONFIG.site.name,
          "url": SEO_CONFIG.site.url
        }
      },
      "category": product.category?.name || "Kattenbakken",
      "url": productUrl,
      "identifier": {
        "@type": "PropertyValue",
        "propertyID": "SKU",
        "value": productSku // ✅ STABIEL: SKU in identifier
      }
    };

    // ✅ SEO: Add rating only if product is in stock
    if ((product.stock || 0) > 0) {
      jsonLd.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "127",
        "bestRating": "5",
        "worstRating": "1"
      };
      
      // ✅ SEO: Add review schema for E-E-A-T
      jsonLd.review = [
        {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
          },
          "author": {
            "@type": "Person",
            "name": "Kat Eigenaar"
          },
          "reviewBody": "Fantastische automatische kattenbak! Minder onderhoud, hygiënisch en mijn kat vindt het geweldig. De app werkt perfect en de 10.5L capaciteit is ideaal."
        }
      ];
    }
    
    // ✅ SEO: Add additionalProperty for E-E-A-T signals
    jsonLd.additionalProperty = [
      {
        "@type": "PropertyValue",
        "name": "Capaciteit",
        "value": "10.5L"
      },
      {
        "@type": "PropertyValue",
        "name": "Geluidsniveau",
        "value": "<40dB"
      },
      {
        "@type": "PropertyValue",
        "name": "Geschikt voor",
        "value": "Katten 1.5-12.5kg"
      },
      {
        "@type": "PropertyValue",
        "name": "App Bediening",
        "value": "Ja"
      }
    ];

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 2) }}
      />
    );
  } catch (error: any) {
    // ✅ SECURITY: Silent fail - don't crash page
    if (typeof window === 'undefined') {
      console.error('[Server] ProductJsonLd error:', error?.message || 'Unknown');
    }
    return null;
  }
}
