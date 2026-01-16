/**
 * CONTENT CONFIG - DRY & MAINTAINABLE
 * Alle website teksten op één plek
 * 
 * BELANGRIJK: Dit is de ENIGE plek waar content wordt gedefinieerd!
 * Vermijd hardcoded strings in components.
 */

// ============================================
// HOME PAGE CONTENT
// ============================================

export const HOME_CONTENT = {
  hero: {
    title: 'Slimme Kattenbak',
    subtitle: 'Automatisch • Smart • Hygiënisch',
  },
  
  uspSection: {
    title: 'Waarom Kiezen Voor Deze Kattenbak?',
  },
  
  features: [
    {
      icon: 'package',
      title: '10.5L Capaciteit',
      description: 'De grootste afvalbak in zijn klasse. Minder vaak legen betekent meer vrijheid voor jou.',
    },
    {
      icon: 'volume',
      title: 'Ultra-Quiet Motor',
      description: 'Werkt onder 40 decibel. Zo stil dat je het nauwelijks hoort, maar het doet zijn werk perfect.',
    },
  ],
  
  videoSection: {
    title: 'Zie Het in Actie',
    subtitle: '2:30 min demo video',
  },
  
  faqSection: {
    title: 'Veelgestelde Vragen',
    subtitle: 'Alles wat je moet weten',
  },
  
  faqs: [
    {
      q: 'Hoe werkt de zelfreinigende functie?',
      a: 'De kattenbak detecteert automatisch wanneer je kat klaar is en start een reinigingscyclus. Alle afval wordt verzameld in een afgesloten compartiment.',
    },
    {
      q: 'Voor welke katten is dit geschikt?',
      a: 'Geschikt voor katten van alle maten tot 7kg.',
    },
    {
      q: 'Hoe vaak moet ik de afvalbak legen?',
      a: 'Bij één kat ongeveer 1x per week. De 10L capaciteit betekent minder onderhoud.',
    },
    {
      q: 'Is de app-bediening inbegrepen?',
      a: 'Ja! De app is gratis te downloaden en biedt realtime monitoring, schema\'s en gezondheidsrapporten.',
    },
  ],
} as const;

// ============================================
// PRODUCT PAGE CONTENT
// ============================================

export const PRODUCT_CONTENT = {
  mainDescription: 'De automatische kattenbak met zelfreinigende functie. Perfect voor katten tot 7kg. Volledig automatisch met app-bediening.',

  // UI Labels - DRY
  labels: {
    showMore: 'Meer',
    showLess: 'Minder',
    showAllSpecs: 'Meer specificaties',
    hideSpecs: 'Minder specificaties',
    ourProduct: 'Onze',
    versus: 'vs',
  },

  // Top 3 USPs (boven prijs)
  topUsps: [
    {
      icon: 'check',
      text: 'Gratis verzending vanaf €50',
    },
    {
      icon: 'check',
      text: '10.5L capaciteit - Grootste afvalbak',
    },
    {
      icon: 'check',
      text: 'Ultra-stil motor (<40 decibel)',
    },
  ],
  
  // Marketing USPs (onder prijs)
  marketingUsps: [
    {
      icon: 'dot',
      text: '14 dagen bedenktijd',
    },
    {
      icon: 'dot',
      text: 'Veilig betalen met Mollie',
    },
  ],
  
  // Product sections
  sections: {
    description: {
      title: 'Over dit product',
      videoCaption: '🎥 Bekijk de demo video',
    },
  },
  
  // Specs comparison (accordion) - ALLE 12 specs uit screenshot
  specs: [
    // ✅ EERSTE 4 SPECS (altijd zichtbaar)
    {
      icon: 'sparkles',
      title: 'Zelfreinigende Functie',
      description: 'Volledig automatisch systeem dat na elk gebruik de bak reinigt. Intelligente sensoren detecteren wanneer je kat klaar is.',
      hasFeature: true,
    },
    {
      icon: 'package',
      title: 'Open-Top Design',
      description: 'Laag-stress ontwerp zonder deur. Je kat voelt zich vrij en niet opgesloten, wat stress vermindert.',
      hasFeature: true,
      competitors: [false, true],
    },
    {
      icon: 'shieldCheck',
      title: 'Dubbele Veiligheidssensoren',
      description: 'Twee onafhankelijke sensoren voor maximale veiligheid. Stopt automatisch als je kat de bak in gaat.',
      hasFeature: true,
      competitors: [false, false],
    },
    {
      icon: 'smartphone',
      title: 'App Bediening & Monitoring',
      description: 'Real-time monitoring via smartphone app. Bekijk status, plan reinigingen en ontvang gezondheidsdata.',
      hasFeature: true,
      competitors: [true, false],
    },
    
    // ✅ EXTRA SPECS (alleen zichtbaar na "Meer" klik)
    {
      icon: 'filter',
      title: 'High-Efficiency Filter',
      description: 'Geavanceerd filtersysteem voor optimale luchtzuivering. Houdt de lucht fris en geurvrij.',
      hasFeature: true,
      competitors: [false, false],
    },
    {
      icon: 'package',
      title: 'Afvalbak Capaciteit',
      description: 'De grootste afvalbak in zijn klasse. 10.5L betekent minder vaak legen - tot 7 dagen voor 1 kat.',
      value: '10.5L',
      competitors: ['9L', '7L'],
    },
    {
      icon: 'shield',
      title: 'Anti-Splash Hoge Wanden',
      description: 'Extra hoge wanden voorkomen morsen. Houdt de omgeving schoon, zelfs bij actieve katten.',
      hasFeature: true,
      competitors: [false, false],
    },
    {
      icon: 'layers',
      title: 'Makkelijk Te Demonteren',
      description: 'Modulair ontwerp voor eenvoudige reiniging. Alle onderdelen zijn afneembaar en afwasbaar.',
      hasFeature: true,
      competitors: [false, true],
    },
    {
      icon: 'checkCircle',
      title: 'All Clumping Litters Supported',
      description: '✅ CLUMPING CLAY LITTER: Efficiënte filter zorgt voor maximale retentie.\n✅ PLANT-BASED LITTER: Volledig compatibel met plantaardige vulling.\n✅ MIXED LITTER: Ook geschikt voor gemengde vullingen.',
      hasFeature: true,
      competitors: [true, false],
    },
    {
      icon: 'maximize',
      title: 'Compact Footprint, Groot Interieur',
      description: 'Klein aan de buitenkant, optimaal voor je huis.',
      hasFeature: true,
      competitors: [false, false],
    },
    {
      icon: 'volumeX',
      title: 'Ultra-Stil Motor (<40 dB)',
      description: 'Fluisterstille motor die je kat niet verstoort. Werkt onder 40 decibel - stiller dan een gesprek.',
      hasFeature: true,
      competitors: [true, false],
    },
    {
      icon: 'settings',
      title: 'Modulair Ontwerp (OEM-Friendly)',
      description: 'Professioneel modulair ontwerp. Makkelijk te upgraden en onderdelen vervangbaar.',
      hasFeature: true,
      competitors: [false, false],
    },
  ],
  
  // Aantal specs dat standaard zichtbaar is
  initialVisibleSpecs: 4,

  // Feature sections (ZIGZAG) - ✅ 10.5L AFVALBAK: Eerste zigzag met foto uit downloads
  features: [
    {
      title: '10.5L Afvalbak',
      description: 'Extra grote afvalbak capaciteit. De afvalzak moet er overheen geplaatst worden voor optimale werking.',
      items: [
        '10.5L XL capaciteit',
        '17% meer dan concurrentie',
        'Voor 1 kat: 7-10 dagen',
        'Meerdere katten: 3-5 dagen',
      ],
    },
    {
      title: 'Dubbele Veiligheidssensoren',
      description: 'IR- en gewichtssensoren stoppen automatisch bij beweging. Getest op 10.000+ cycli.',
      items: [
        'IR bewegingssensor',
        'Gewichtdetectie technologie',
        'Automatische pauze functie',
        '10.000+ cycli getest',
      ],
    },
  ],

  // Safety Notice - ✅ VERKORT: Behoud doel, korter voor betere UX
  safetyNotice: {
    title: 'Let op',
    text: 'Niet geschikt voor kittens onder 6 maanden. Geschikt voor katten van 1,5KG tot 12,5KG.',
  },
  
  // Product-specifieke USPs - ✅ AFBEELDINGEN: 3 naast elkaar onder winkelwagenbutton met afbeeldingen uit downloads
  productUsps: [
    {
      title: 'Hygiene',
      description: 'Nooit meer scheppen',
      image: '/images/usp-hygiene.jpg', // ✅ AFBEELDING: Uit downloads met witte achtergrond
    },
    {
      title: 'App Bediening',
      description: 'Smart control',
      image: '/images/usp-app.jpg', // ✅ AFBEELDING: Uit downloads met witte achtergrond
    },
    {
      title: 'Automatisch',
      description: 'Zelfreinigend',
      image: '/images/usp-automatic.jpg', // ✅ AFBEELDING: Uit downloads met witte achtergrond
    },
  ],
} as const;

// ============================================
// SHARED CONTENT
// ============================================

export const SHARED_CONTENT = {
  breadcrumb: {
    home: 'Home',
  },
  
  buttons: {
    addToCart: 'Winkelwagen', // ✅ 1 WOORD: "Winkelwagen" ipv "In Winkelwagen"
    addingToCart: 'Toevoegen...',
    viewProduct: 'Bekijk Product',
    viewCart: 'Bekijk Winkelwagen',
    checkout: 'Afrekenen',
    startChat: 'Start Chat',
    continueShopping: 'Verder Winkelen',
    placeOrder: 'Bestelling Plaatsen',
    processing: 'Verwerken...',
  },
  
  quantity: {
    label: 'Aantal:',
    increase: 'Verhoog aantal',
    decrease: 'Verlaag aantal',
  },
  
  cart: {
    empty: {
      title: 'Je winkelwagen is leeg',
      subtitle: 'Ontdek onze premium zelfreinigende kattenbak',
    },
    title: 'Winkelwagen',
    itemCount: (count: number) => `${count} ${count === 1 ? 'product' : 'producten'}`,
    summary: {
      title: 'Overzicht',
      subtotal: 'Subtotaal',
      shipping: 'Verzendkosten',
      shippingFree: 'Gratis',
      tax: 'BTW (21%)',
      total: 'Totaal',
    },
    benefits: [
      'Gratis verzending vanaf €50',
      'Veilig betalen met Mollie',
      '14 dagen bedenktijd',
    ],
    guestCheckout: 'Geen account nodig - direct afrekenen als gast',
  },
  
  checkout: {
    title: 'Afrekenen',
    steps: ['Gegevens', 'Betaling', 'Bevestiging'],
    shipping: {
      title: 'Verzendadres',
      useExisting: 'Gebruik bestaand adres',
      addNew: 'Nieuw adres',
    },
    payment: {
      title: 'Betaling',
      method: 'Selecteer betaalmethode',
    },
    summary: 'Overzicht',
    benefits: [
      'Veilig betalen met Mollie',
      'Gratis verzending vanaf €50',
      '14 dagen bedenktijd',
    ],
  },
  
  // ✅ DYNAMISCH: Trust banner content (onder hero)
  trustBanner: {
    text: 'Gratis verzending • 30 dagen bedenktijd • 2 jaar garantie',
  },
  
  success: {
    title: 'Bedankt voor je bestelling!',
    subtitle: 'We hebben je bestelling ontvangen en zijn deze aan het verwerken.',
    orderNumber: 'Bestelnummer',
    email: 'Je ontvangt een bevestiging op',
    nextSteps: {
      title: 'Wat gebeurt er nu?',
      steps: [
        {
          title: 'Bevestiging',
          description: 'Je ontvangt binnen enkele minuten een bevestigingsmail',
        },
        {
          title: 'Verwerking',
          description: 'We verwerken je bestelling en maken deze verzendklaar',
        },
        {
          title: 'Verzending',
          description: 'Je ontvangt een track & trace code zodra het pakket onderweg is',
        },
      ],
    },
    orderSummary: 'Jouw bestelling',
  },
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get content by key with fallback
 */
export function getContent<T>(obj: any, key: string, fallback: T): T {
  const keys = key.split('.');
  let value = obj;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return fallback;
    }
  }
  
  return value ?? fallback;
}

export default {
  HOME_CONTENT,
  PRODUCT_CONTENT,
  SHARED_CONTENT,
};
