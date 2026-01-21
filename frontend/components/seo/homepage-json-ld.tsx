"use client";

import { SEO_CONFIG } from "@/lib/seo.config";
import type { Product } from "@/types/product";

interface HomepageJsonLdProps {
  product?: Product | null;
}

/**
 * ✅ SEO 10/10: Homepage Structured Data
 * 
 * Schema.org structured data voor homepage:
 * - WebSite schema
 * - Organization schema
 * - Product schema (featured product)
 * - BreadcrumbList schema
 */
export function HomepageJsonLd({ product }: HomepageJsonLdProps) {
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SEO_CONFIG.site.name,
    url: SEO_CONFIG.site.url,
    description: SEO_CONFIG.site.description,
    inLanguage: 'nl-NL',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SEO_CONFIG.site.url}/producten?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SEO_CONFIG.site.name,
    url: SEO_CONFIG.site.url,
    logo: SEO_CONFIG.defaults.image,
    description: SEO_CONFIG.site.description,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SEO_CONFIG.contact.phone.replace(/\s/g, '-'),
      contactType: 'customer service',
      areaServed: 'NL',
      availableLanguage: ['nl', 'en'],
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '17:00',
      },
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NL',
      addressLocality: SEO_CONFIG.contact.address.city,
    },
  };

  // Featured product JSON-LD (if available)
  let productJsonLd = null;
  if (product) {
    const productImage = product.images?.[0] 
      ? (product.images[0].startsWith('http') ? product.images[0] : `${SEO_CONFIG.site.url}${product.images[0]}`)
      : SEO_CONFIG.defaults.image;
    const price = typeof product.price === 'number' ? product.price : parseFloat(String(product.price || 0)) || 0;
    const availability = (product.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';

    productJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name || SEO_CONFIG.defaults.title,
      description: product.metaDescription || product.shortDescription || product.description || SEO_CONFIG.defaults.description,
      image: product.images?.length > 0 
        ? product.images
            .filter((img: string) => img && typeof img === 'string')
            .map((img: string) => img.startsWith('http') ? img : `${SEO_CONFIG.site.url}${img}`)
        : [SEO_CONFIG.defaults.image],
      sku: product.sku || '',
      brand: {
        '@type': 'Brand',
        name: SEO_CONFIG.site.name,
      },
      offers: {
        '@type': 'Offer',
        url: `${SEO_CONFIG.site.url}/product/${product.slug || 'automatische-kattenbak-premium'}`,
        priceCurrency: 'EUR',
        price: price.toFixed(2),
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availability: availability,
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: SEO_CONFIG.site.name,
          url: SEO_CONFIG.site.url,
        },
      },
      category: product.category?.name || 'Kattenbakken',
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd, null, 2) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd, null, 2) }}
      />
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd, null, 2) }}
        />
      )}
    </>
  );
}
