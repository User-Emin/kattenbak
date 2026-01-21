/**
 * ✅ SEO ENHANCED CONFIG - DIEPGAANDE SEO OPTIMALISATIE
 * 
 * Uitgebreide SEO configuratie voor maximale vindbaarheid:
 * - Keywords research (Nederlandse markt)
 * - Meta tags optimalisatie
 * - Structured data (Schema.org)
 * - Social media tags
 * - Local SEO
 * - Technical SEO
 */

export const SEO_ENHANCED = {
  // ✅ KEYWORDS: Nederlandse zoektermen (high volume, relevant)
  keywords: {
    primary: [
      'automatische kattenbak',
      'zelfreinigende kattenbak',
      'premium kattenbak',
      'kattenbak met app',
      'automatische kattenbak Nederland',
      'beste automatische kattenbak',
      'kattenbak kopen',
      'ALP1017',
      'ALP1071',
    ],
    secondary: [
      'kattenbak automatisch',
      'kattenbak zelfreinigend',
      'smart kattenbak',
      'app kattenbak',
      'hygiënische kattenbak',
      'stille kattenbak',
      'grote kattenbak',
      'kattenbak voor meerdere katten',
      'kattenbak capaciteit',
      '10.5L kattenbak',
    ],
    longTail: [
      'automatische kattenbak met app bediening',
      'beste zelfreinigende kattenbak 2026',
      'automatische kattenbak voor grote katten',
      'kattenbak met dubbele veiligheidssensoren',
      'automatische kattenbak onder 40dB',
      'kattenbak met 10.5L afvalbak',
      'premium automatische kattenbak kopen',
    ],
  },

  // ✅ META TAGS: Uitgebreide meta informatie
  meta: {
    viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    googlebot: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    author: 'CatSupply',
    publisher: 'CatSupply',
    language: 'nl',
    geo: {
      region: 'NL',
      placename: 'Haarlem',
      position: '52.3792;4.9003', // Haarlem coordinates
    },
  },

  // ✅ STRUCTURED DATA: Schema.org types
  structuredData: {
    organization: {
      '@type': 'Organization',
      name: 'CatSupply',
      url: 'https://catsupply.nl',
      logo: 'https://catsupply.nl/logos/logo.webp',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+31-6-12345678',
        contactType: 'customer service',
        areaServed: 'NL',
        availableLanguage: ['nl', 'en'],
      },
      sameAs: [
        // Social media links (toevoegen wanneer beschikbaar)
      ],
    },
    website: {
      '@type': 'WebSite',
      name: 'CatSupply',
      url: 'https://catsupply.nl',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://catsupply.nl/producten?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
    },
  },

  // ✅ LOCAL SEO: Nederlandse markt focus
  local: {
    country: 'NL',
    language: 'nl',
    currency: 'EUR',
    businessHours: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
  },

  // ✅ TECHNICAL SEO
  technical: {
    canonicalBase: 'https://catsupply.nl',
    sitemapUrl: 'https://catsupply.nl/sitemap.xml',
    robotsUrl: 'https://catsupply.nl/robots.txt',
    hreflang: [
      { lang: 'nl', url: 'https://catsupply.nl' },
      // Toevoegen wanneer andere talen beschikbaar zijn
    ],
  },
} as const;

/**
 * Generate keywords string for meta tag
 */
export function getKeywordsString(additionalKeywords: string[] = []): string {
  const allKeywords = [
    ...SEO_ENHANCED.keywords.primary,
    ...SEO_ENHANCED.keywords.secondary,
    ...additionalKeywords,
  ];
  return [...new Set(allKeywords)].join(', ');
}

/**
 * Generate Organization JSON-LD
 */
export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    ...SEO_ENHANCED.structuredData.organization,
  };
}

/**
 * Generate Website JSON-LD
 */
export function getWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    ...SEO_ENHANCED.structuredData.website,
  };
}
