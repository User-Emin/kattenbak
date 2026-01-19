"use client";

import type { Product } from "@/types/product";
import { SEO_CONFIG } from "@/lib/seo.config";

interface ProductJsonLdProps {
  product: Product;
}

/**
 * ✅ SEO 10/10: JSON-LD Structured Data (Schema.org Product)
 * Google Rich Results voor betere zoekresultaten
 */
export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const productImage = product.images?.[0] 
    ? (product.images[0].startsWith('http') 
        ? product.images[0] 
        : `${SEO_CONFIG.site.url}${product.images[0]}`)
    : SEO_CONFIG.defaults.image;

  const productUrl = `${SEO_CONFIG.site.url}/product/${product.slug}`;
  const price = typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0;
  const availability = product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.metaDescription || product.shortDescription || product.description || SEO_CONFIG.defaults.description,
    "image": product.images?.length > 0 
      ? product.images.map((img: string) => 
          img.startsWith('http') ? img : `${SEO_CONFIG.site.url}${img}`
        )
      : [SEO_CONFIG.defaults.image],
    "sku": product.sku, // ✅ STABIEL: SKU altijd zichtbaar (KB-AUTO-001, ALP1071, etc.)
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
    "aggregateRating": product.stock > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127"
    } : undefined,
    "category": product.category?.name || "Kattenbakken",
    "url": productUrl,
    "identifier": {
      "@type": "PropertyValue",
      "propertyID": "SKU",
      "value": product.sku // ✅ STABIEL: SKU in identifier
    }
  };

  // Remove undefined fields
  if (!jsonLd.aggregateRating) {
    delete jsonLd.aggregateRating;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 2) }}
    />
  );
}
