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
    title: 'Vragen over ALP1071',
    subtitle: 'Alles wat je moet weten',
  },
  
  // ✅ SEO PHASE 2: FAQ Uitbreiden (8+ vragen voor betere SEO)
  faqs: [
    {
      q: 'Hoe werkt de zelfreinigende functie?',
      a: 'De kattenbak detecteert automatisch wanneer je kat klaar is en start een reinigingscyclus. Alle afval wordt verzameld in een afgesloten compartiment van 10.5L. Dubbele veiligheidssensoren (IR- en gewichtssensoren) zorgen ervoor dat het systeem automatisch stopt als je kat de bak in gaat.',
    },
    {
      q: 'Voor welke katten is dit geschikt?',
      a: 'Geschikt voor katten van 1,5KG tot 12,5KG. Perfect voor volwassen en senior katten. Niet geschikt voor kittens onder 6 maanden. Het open-top design zonder deur vermindert stress en is geschikt voor katten die niet van gesloten ruimtes houden.',
    },
    {
      q: 'Hoe vaak moet ik de afvalbak legen?',
      a: 'Bij één kat: 1x per 4-6 dagen. Bij 2 katten: 1x per 3-5 dagen. Bij 3 katten: 1x per 2-3 dagen. De 10.5L capaciteit betekent minder onderhoud en meer vrijheid voor jou.',
    },
    {
      q: 'Is de app-bediening inbegrepen?',
      a: 'Ja! De app is gratis te downloaden voor iOS en Android. Er zijn geen verborgen kosten of abonnementen. De app biedt realtime monitoring, reinigingsschema\'s, gezondheidsrapporten en volledige controle over je kattenbak, waar je ook bent.',
    },
    {
      q: 'Welke kattenbakvulling moet ik gebruiken?',
      a: 'Je kunt klonterende klei vulling, plantaardige vulling, of gemixte vulling gebruiken. Het high-efficiency filter systeem werkt optimaal met alle klonterende vullingen. Kies wat het beste werkt voor jouw kat.',
    },
    {
      q: 'Hoe werkt de garantie?',
      a: 'Je krijgt 1 jaar volledige garantie op alle onderdelen. Bij problemen kun je contact opnemen met onze klantenservice voor een snelle oplossing of vervanging. De garantie dekt productdefecten en fabrieksfouten.',
    },
    {
      q: 'Is de kattenbak veilig voor mijn kat?',
      a: 'Ja, absoluut veilig. Dubbele veiligheidssensoren (IR- en gewichtssensoren) stoppen automatisch bij beweging. Getest op meer dan 10.000 cycli. Het systeem pauzeert onmiddellijk als je kat de bak in gaat tijdens een reinigingscyclus.',
    },
    {
      q: 'Hoe luid is de kattenbak?',
      a: 'De motor werkt onder 40 decibel - stiller dan een normaal gesprek. Het ultra-stille geluidsniveau zorgt ervoor dat je kat niet wordt verstoord tijdens het gebruik. Perfect voor gebruik in woonkamers en slaapkamers.',
    },
    {
      q: 'Wat zit er in de doos?',
      a: '1× automatische kattenbak, 1× stroomadapter, 1× inloopmat, 1× rol afvalzakken, 1× handleiding (EN). Alles wat je nodig hebt voor direct gebruik.',
    },
    {
      q: 'Hoe installeer ik de kattenbak?',
      a: 'De installatie is eenvoudig: plaats de kattenbak op een vlakke ondergrond, sluit de stroomadapter aan, download de app en volg de setup instructies. De hele installatie duurt minder dan 10 minuten. Geen gereedschap nodig.',
    },
  ],
} as const;

// ============================================
// PRODUCT PAGE CONTENT
// ============================================

export const PRODUCT_CONTENT = {
  // ✅ GS1-vriendelijk: concurrentiewaardige productbeschrijving met exacte specificaties
  mainDescription: `De Automatische Kattenbak Premium is een zelfreinigende kattenbak met 65L vulruimte en 10.5L afvalbak – groter dan de meeste concurrenten (9L). Voor katteneigenaren die zoeken naar gemak, hygiëne en innovatie. Volledig automatisch reinigingssysteem, bedienbaar via app (iOS/Android), met open-top design dat stress vermindert bij katten die niet van gesloten ruimtes houden.

Specificaties (leverancier-geverifieerd): afmetingen 55×51×54 cm (L×B×H), gewicht 11 kg, materiaal PP+ABS+POM. Dubbele veiligheidssensoren (IR + gewicht) stoppen de cyclus direct als je kat de bak betreedt – getest op 10.000+ cycli. WiFi 2.4GHz, voedingsadapter DC 12V/2A. Geschikt voor klonterende vulling (klei, plantaardig, gemengd). Katten van 1,5 tot 12,5 kg, vanaf 6 maanden. Geluidsniveau onder 40 dB.

Bij één kat leeg je de afvalzak ca. 1x per 4–6 dagen; bij 2–3 katten vaker. High-efficiency filter, anti-splash wanden, modulair ontwerp voor eenvoudige reiniging.

Leveringsinhoud: 1× automatische kattenbak, 1× stroomadapter, 1× inloopmat, 1× rol afvalzakken, 1× handleiding (EN).`,

  // UI Labels - DRY
  labels: {
    showMore: 'Meer',
    showLess: 'Minder',
    showAllSpecs: 'Meer specificaties',
    hideSpecs: 'Minder specificaties',
    ourProduct: 'Onze',
    versus: 'vs',
  },

  // ✅ Bottom cart (zwarte bar) – Kies een kleur, voorraad (geen hardcode)
  bottomCart: {
    colorLabel: 'Kies een kleur:',
    /** Gebruik: stockLabel.replace('{count}', String(count)) */
    stockLabel: '(Nog {count} op voorraad)',
    outOfStockSuffix: ' (Niet op voorraad)',
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

  // Feature sections (ZIGZAG) - ✅ ALLEEN TITEL EN BESCHRIJVING: Geen bullet points
  features: [
    {
      title: '10.5L Afvalbak',
      description: 'Extra grote afvalbak capaciteit. De afvalzak moet er overheen geplaatst worden voor optimale werking.',
      // ✅ BULLET POINTS VERWIJDERD: Alleen titel en beschrijving
    },
    {
      title: 'Dubbele Veiligheidssensoren',
      description: 'IR- en gewichtssensoren stoppen automatisch bij beweging. Getest op 10.000+ cycli. Ultieme veiligheid voor jouw kat.',
      // ✅ BULLET POINTS VERWIJDERD: Alleen titel en beschrijving
    },
    {
      title: 'Gratis meegeleverd',
      description: '1× inloopmat en 1× rol afvalzakken zijn inbegrepen. Plus stroomadapter en handleiding – direct klaar voor gebruik.',
    },
  ],

  // ✅ VERGELIJKINGSTABEL DATA: Gebaseerd op echte info van Poopy.nl
  comparison: {
    title: 'Vergelijking',
    subtitle: 'Onze kattenbak vs. concurrent',
    rows: [
      {
        feature: 'Vulruimte (litter)',
        ourProduct: '65L',
        competitor: '65L',
        highlight: false,
      },
      {
        feature: 'Afvalbak capaciteit',
        ourProduct: '10.5L',
        competitor: '9L',
        highlight: true,
      },
      {
        feature: 'Geluidsniveau',
        ourProduct: '<40 dB',
        competitor: '±55 dB',
        highlight: true,
      },
      {
        feature: 'Formaat (L×B×H)',
        ourProduct: '55 × 51 × 54 cm',
        competitor: '50 × 50 × 50 cm',
        highlight: false,
      },
      {
        feature: 'Gewicht',
        ourProduct: '11 kg',
        competitor: '9,5 kg',
        highlight: false,
      },
      {
        feature: 'Veiligheidssensoren',
        ourProduct: 'Dubbele sensoren (IR + gewicht)',
        competitor: 'Gewichtssensoren',
        highlight: true,
      },
      {
        feature: 'Geschikt voor katten',
        ourProduct: 'Tot 7kg',
        competitor: '1-3 katten (vanaf 1kg)',
        highlight: false,
      },
      {
        feature: 'Minimum leeftijd',
        ourProduct: '6 maanden',
        competitor: '3-4 maanden',
        highlight: false,
      },
      {
        feature: 'WiFi verbinding',
        ourProduct: '2.4GHz',
        competitor: '2.4GHz',
        highlight: false,
      },
      {
        feature: 'App bediening',
        ourProduct: true,
        competitor: true,
        highlight: false,
      },
      {
        feature: 'Garantie',
        ourProduct: '1 jaar',
        competitor: '1 jaar',
        highlight: false,
      },
      {
        feature: 'Materiaal',
        ourProduct: 'ABS',
        competitor: 'ABS',
        highlight: false,
      },
      {
        feature: 'Automatische reiniging',
        ourProduct: true,
        competitor: true,
        highlight: false,
      },
    ],
    footerNote: '* Gebaseerd op publiek beschikbare informatie. Specificaties kunnen variëren.',
  },

  // Safety Notice - ✅ VERKORT: Behoud doel, korter voor betere UX
  safetyNotice: {
    title: 'Let op',
    text: 'Niet geschikt voor kittens onder 6 maanden • Geschikt voor katten van 1,5KG tot 12,5KG • Perfect voor volwassen en senior katten',
  },

  // Edge-to-edge image section (tussen tabs en zigzag)
  edgeImageSection: {
    image: '/images/feature-2.jpg', // ✅ DYNAMISCH: Generieke statische image (geen hardcoded product ID)
    // Tekst wordt dynamisch uit product.description gehaald
  },
  
  // Service USPs - ✅ Compact: minder padding tussen items
  serviceUsps: [
    { text: 'Volledig automatisch • App bediening' },
    { text: 'Binnen 30 dagen gratis retour' },
    { text: 'Zelfreinigend systeem • Hygiënisch' },
  ],

  // Bezorgtijd + leveringsinhoud - centraal (geen hardcode)
  delivery: {
    label: 'Bezorgtijd:',
    days: '1-2 werkdagen',
    /** Items standaard meegeleverd – gebruikt in product-detail accordion */
    items: [
      '1× automatische kattenbak',
      '1× stroomadapter',
      '1× inloopmat',
      '1× rol afvalzakken',
      '1× handleiding (EN)',
    ] as const,
  },

  // Vragen sectie - titel accordion (zoals Specificaties)
  vragenSection: {
    title: 'Vragen',
    subtitle: 'Veelgestelde vragen op basis van productinformatie',
  },

  // Product-specifieke USPs - ✅ VERWIJDERD: Geen foto's meer, alleen service USPs met vinkjes
  productUsps: [],
  
  // ✅ SEO PHASE 2: FAQ voor product pagina (8+ vragen)
  faqs: [
    {
      q: 'Hoe werkt de zelfreinigende functie?',
      a: 'De kattenbak detecteert automatisch wanneer je kat klaar is en start een reinigingscyclus. Alle afval wordt verzameld in een afgesloten compartiment van 10.5L. Dubbele veiligheidssensoren (IR- en gewichtssensoren) zorgen ervoor dat het systeem automatisch stopt als je kat de bak in gaat.',
    },
    {
      q: 'Voor welke katten is dit geschikt?',
      a: 'Geschikt voor katten van 1,5KG tot 12,5KG. Perfect voor volwassen en senior katten. Niet geschikt voor kittens onder 6 maanden. Het open-top design zonder deur vermindert stress en is geschikt voor katten die niet van gesloten ruimtes houden.',
    },
    {
      q: 'Hoe vaak moet ik de afvalbak legen?',
      a: 'Bij één kat: 1x per 4-6 dagen. Bij 2 katten: 1x per 3-5 dagen. Bij 3 katten: 1x per 2-3 dagen. De 10.5L capaciteit betekent minder onderhoud en meer vrijheid voor jou.',
    },
    {
      q: 'Is de app-bediening inbegrepen?',
      a: 'Ja! De app is gratis te downloaden voor iOS en Android. Er zijn geen verborgen kosten of abonnementen. De app biedt realtime monitoring, reinigingsschema\'s, gezondheidsrapporten en volledige controle over je kattenbak, waar je ook bent.',
    },
    {
      q: 'Welke kattenbakvulling moet ik gebruiken?',
      a: 'Je kunt klonterende klei vulling, plantaardige vulling, of gemixte vulling gebruiken. Het high-efficiency filter systeem werkt optimaal met alle klonterende vullingen. Kies wat het beste werkt voor jouw kat.',
    },
    {
      q: 'Hoe werkt de garantie?',
      a: 'Je krijgt 1 jaar volledige garantie op alle onderdelen. Bij problemen kun je contact opnemen met onze klantenservice voor een snelle oplossing of vervanging. De garantie dekt productdefecten en fabrieksfouten.',
    },
    {
      q: 'Is de kattenbak veilig voor mijn kat?',
      a: 'Ja, absoluut veilig. Dubbele veiligheidssensoren (IR- en gewichtssensoren) stoppen automatisch bij beweging. Getest op meer dan 10.000 cycli. Het systeem pauzeert onmiddellijk als je kat de bak in gaat tijdens een reinigingscyclus.',
    },
    {
      q: 'Hoe luid is de kattenbak?',
      a: 'De motor werkt onder 40 decibel - stiller dan een normaal gesprek. Het ultra-stille geluidsniveau zorgt ervoor dat je kat niet wordt verstoord tijdens het gebruik. Perfect voor gebruik in woonkamers en slaapkamers.',
    },
    {
      q: 'Wat zit er in de doos?',
      a: '1× automatische kattenbak, 1× stroomadapter, 1× inloopmat, 1× rol afvalzakken, 1× handleiding (EN). Alles wat je nodig hebt voor direct gebruik.',
    },
    {
      q: 'Hoe installeer ik de kattenbak?',
      a: 'De installatie is eenvoudig: plaats de kattenbak op een vlakke ondergrond, sluit de stroomadapter aan, download de app en volg de setup instructies. De hele installatie duurt minder dan 10 minuten. Geen gereedschap nodig.',
    },
    {
      q: 'Wat zijn de afmetingen en het stroomverbruik?',
      a: 'De kattenbak heeft een compact footprint met groot interieur voor katten tot 7kg. Het apparaat werkt op netstroom via de meegeleverde adapter en verbruikt minimaal tijdens stand-by; het reinigingsproces duurt kort. Exacte afmetingen en wattage staan in de producthandleiding.',
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
    text: 'Gratis verzending • 30 dagen bedenktijd',
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
