/**
 * ✅ SEO MAXIMIZED CONFIG - MAXIMALE VINDBARHEID
 * 
 * Diepgaande SEO optimalisatie voor maximale doelgroep aanspreking:
 * - Doelgroep-specifieke keywords (25-75 jaar, primair 41-55)
 * - E-E-A-T optimalisatie
 * - Rich snippets & structured data
 * - Local SEO (Nederland, Haarlem)
 * - Performance SEO
 * - Content clustering
 * - Conversational search
 */

import { KEYWORDS_BY_AUDIENCE, TARGET_AUDIENCE, EEAT_SIGNALS, LOCAL_SEO } from './seo-target-audience.config';

/**
 * ✅ ALLE KEYWORDS COMBINEREN - Voor meta tags
 */
export function getAllKeywords(): string {
  const allKeywords = [
    ...KEYWORDS_BY_AUDIENCE.common.primary,
    ...KEYWORDS_BY_AUDIENCE.common.secondary,
    ...KEYWORDS_BY_AUDIENCE.common.longTail,
    ...KEYWORDS_BY_AUDIENCE.primary.transactional.slice(0, 5),
    ...KEYWORDS_BY_AUDIENCE.secondary.transactional.slice(0, 5), // ✅ Verhoogd voor jonge stellen
    ...KEYWORDS_BY_AUDIENCE.tertiary.transactional.slice(0, 3),
    ...LOCAL_SEO.localKeywords,
    // ✅ JONGE STELLEN: Specifieke keywords voor net getrouwde stellen
    'kattenbak voor starters',
    'automatische kattenbak eerste kat',
    'kattenbak voor jonge stellen',
    'makkelijk kattenbak drukke baan',
    'starter kattenbak automatisch',
  ];
  
  // Remove duplicates and limit to 30 keywords (Google best practice)
  return [...new Set(allKeywords)].slice(0, 30).join(', ');
}

/**
 * ✅ OPTIMIZED META DESCRIPTIONS PER DOELGROEP
 */
export const OPTIMIZED_DESCRIPTIONS = {
  homepage: {
    primary: 'Premium automatische kattenbak met zelfreinigende functie. 10.5L capaciteit, dubbele veiligheidssensoren, app-bediening. Perfect voor katten tot 7kg. Gratis verzending in Nederland.',
    secondary: 'Smart kattenbak met app-bediening en WiFi-connectiviteit. Volledig automatisch, modern design, realtime monitoring. Perfect voor jonge stellen, starters en drukke professionals. De meest geavanceerde kattenbak van 2026.',
    tertiary: 'Eenvoudig te gebruiken automatische kattenbak. Minder onderhoud, meer gemak. Perfect voor senior katten. Betrouwbaar en onderhoudsvriendelijk.',
    default: 'Premium automatische kattenbak met zelfreinigende functie. Automatisch, hygiënisch, en stijlvol. 10.5L capaciteit, app-bediening, dubbele veiligheidssensoren. Perfect voor starters, jonge stellen en drukke professionals. Gratis verzending in Nederland.',
  },
  product: {
    primary: (productName: string, price: number) => 
      `${productName} - Premium automatische kattenbak met 10.5L capaciteit. Dubbele veiligheidssensoren, app-bediening, ultra-stil (<40dB). Perfect voor katten tot 7kg. Nu vanaf €${price.toFixed(2)}. Gratis verzending.`,
    secondary: (productName: string) => 
      `${productName} - Smart kattenbak met WiFi en app. Realtime monitoring, automatische reiniging, modern design. De meest geavanceerde kattenbak technologie.`,
    tertiary: (productName: string) => 
      `${productName} - Makkelijk te gebruiken automatische kattenbak. Minder vaak legen, eenvoudige bediening, betrouwbaar. Perfect voor minder onderhoud.`,
  },
} as const;

/**
 * ✅ RICH SNIPPETS SCHEMA - FAQ, HowTo, Product, Review
 */
export const RICH_SNIPPETS = {
  faq: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Hoe werkt de automatische kattenbak?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'De automatische kattenbak detecteert automatisch wanneer je kat klaar is via dubbele veiligheidssensoren (IR en gewicht). Na detectie start een reinigingscyclus waarbij alle afval wordt verzameld in een afgesloten 10.5L compartiment met anti-splash hoge wanden.',
        },
      },
      {
        '@type': 'Question',
        name: 'Voor welke katten is de automatische kattenbak geschikt?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'De automatische kattenbak is geschikt voor katten van 1,5KG tot 12,5KG. Niet geschikt voor kittens onder 6 maanden. Perfect voor volwassen en senior katten.',
        },
      },
      {
        '@type': 'Question',
        name: 'Hoe vaak moet ik de afvalbak legen?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Bij één kat ongeveer 1x per week, bij meerdere katten 2-3x per week. Dankzij de XL 10.5L capaciteit (grootste in zijn klasse) heb je tot 30% minder onderhoud dan bij concurrerende modellen met 7-9L capaciteit.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is de app-bediening inbegrepen?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ja, de app is gratis te downloaden en biedt realtime monitoring, reinigingsschema\'s, gezondheidsrapporten en push-notificaties. Werkt via WiFi (2.4GHz).',
        },
      },
      {
        '@type': 'Question',
        name: 'Hoe stil is de automatische kattenbak?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'De motor werkt onder 40 decibel, wat vergelijkbaar is met een rustige bibliotheek. Zo stil dat je het nauwelijks hoort, maar het doet zijn werk perfect.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is deze kattenbak geschikt voor starters of eerste kat?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ja, perfect voor starters! De automatische kattenbak is ideaal voor jonge stellen, net getrouwde stellen en drukke professionals met weinig tijd. Volledig automatisch, app-bediening en minimale onderhoud. Perfect voor je eerste kat.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is de kattenbak geschikt voor drukke werkweken?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absoluut! Met de 10.5L capaciteit hoef je bij één kat slechts 1x per week te legen. De app stuurt meldingen wanneer het nodig is. Ideaal voor jonge stellen en professionals met drukke carrières.',
        },
      },
    ],
  },
  
  howTo: {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Hoe gebruik je een automatische kattenbak',
    description: 'Stap-voor-stap handleiding voor het gebruik van de automatische kattenbak',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Plaats de kattenbak',
        text: 'Plaats de kattenbak op een vlakke, stabiele ondergrond. Zorg voor voldoende ruimte rondom (minimaal 30cm aan alle kanten).',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Vul met kattenbakvulling',
        text: 'Vul de kattenbak met je favoriete kattenbakvulling tot de aangegeven lijn. Alle soorten vulling zijn geschikt dankzij het high-efficiency filter.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Sluit aan op stroom',
        text: 'Sluit de kattenbak aan op een stopcontact. Het stroomverbruik is laag: 15W standby, 50W actief.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Download de app',
        text: 'Download de gratis app en verbind de kattenbak via WiFi (2.4GHz). Volg de instructies in de app voor eenvoudige setup.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Plaats afvalzak',
        text: 'Plaats de afvalzak over de 10.5L afvalbak. De afvalzak moet er overheen geplaatst worden voor optimale werking.',
      },
    ],
  },
} as const;

/**
 * ✅ CONTENT CLUSTERING - Thema's en subthema's
 */
export const CONTENT_CLUSTERS = {
  main: {
    theme: 'Automatische Kattenbak',
    subtopics: [
      'Hoe werkt automatische kattenbak',
      'Voordelen automatische kattenbak',
      'Automatische kattenbak vergelijken',
      'Automatische kattenbak onderhoud',
      'Automatische kattenbak voor meerdere katten',
      'Automatische kattenbak voor senior kat',
      'Smart kattenbak met app',
      'Kattenbak capaciteit',
      'Kattenbak veiligheidssensoren',
      'Kattenbak geluidsniveau',
    ],
  },
  features: {
    theme: 'Kattenbak Features',
    subtopics: [
      '10.5L afvalbak capaciteit',
      'Dubbele veiligheidssensoren',
      'App bediening',
      'WiFi connectiviteit',
      'Ultra-stille motor',
      'Zelfreinigende functie',
      'Open-top design',
      'Modulair ontwerp',
    ],
  },
  maintenance: {
    theme: 'Onderhoud en Gebruik',
    subtopics: [
      'Hoe vaak kattenbak legen',
      'Kattenbak schoonmaken',
      'Afvalzak vervangen',
      'Kattenbakvulling kiezen',
      'Problemen oplossen',
      'Onderhoudsschema',
    ],
  },
} as const;

/**
 * ✅ PERFORMANCE SEO - Core Web Vitals
 */
export const PERFORMANCE_SEO = {
  targets: {
    lcp: 2.5, // Largest Contentful Paint (seconds)
    fid: 100, // First Input Delay (milliseconds)
    cls: 0.1, // Cumulative Layout Shift
    fcp: 1.8, // First Contentful Paint (seconds)
    ttfb: 0.8, // Time to First Byte (seconds)
  },
  optimizations: [
    'Image optimization (WebP, lazy loading)',
    'Code splitting',
    'Font optimization',
    'CSS minification',
    'JavaScript minification',
    'CDN usage',
    'Caching strategies',
    'Preconnect to critical domains',
  ],
} as const;

/**
 * ✅ MOBILE SEO - Mobile-first indexing
 */
export const MOBILE_SEO = {
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  touchTargets: {
    minSize: 44, // pixels
    spacing: 8, // pixels between targets
  },
  responsive: {
    breakpoints: {
      mobile: 375,
      tablet: 768,
      desktop: 1024,
    },
  },
} as const;

/**
 * ✅ SOCIAL SEO - Open Graph & Twitter Cards
 */
export const SOCIAL_SEO = {
  og: {
    type: 'product',
    siteName: 'CatSupply',
    locale: 'nl_NL',
    imageWidth: 1200,
    imageHeight: 630,
    imageType: 'image/webp',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@CatSupply',
    creator: '@CatSupply',
  },
} as const;
