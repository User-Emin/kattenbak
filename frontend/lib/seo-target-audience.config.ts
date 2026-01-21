/**
 * ✅ SEO TARGET AUDIENCE CONFIG - DOELGROEP GERICHTE SEO
 * 
 * Gebaseerd op expert analyse van katteneigenaren in Nederland:
 * - Primaire doelgroep: 41-55 jaar (meest voorkomend, bewuste consumenten)
 * - Secundaire doelgroep: 25-40 jaar (tech-minded, early adopters)
 * - Tertiaire doelgroep: 55-75 jaar (gemak & comfort belangrijk)
 * 
 * 80% van katten zijn volwassen tot senior
 * Meeste katteneigenaren zijn vrouw
 * Opleiding: MBO/HBO
 */

export const TARGET_AUDIENCE = {
  primary: {
    ageRange: '41-55 jaar',
    characteristics: [
      'Bewuste consumenten',
      'Werkend met bestedingsruimte',
      'Vaak volwassen/senior katten',
      'Behoefte aan comfort, minder bukken/slepen',
      'Tijdsbesparing belangrijk',
      'Kwaliteit en duurzaamheid belangrijk',
    ],
    painPoints: [
      'Geen tijd om kattenbak dagelijks schoon te maken',
      'Fysieke klachten bij bukken/slepen',
      'Bezorgd over hygiëne en geur',
      'Wil gemak en comfort voor senior kat',
    ],
    searchBehavior: [
      'Zoekt naar "beste automatische kattenbak"',
      'Vergelijkt producten grondig',
      'Leest reviews en specificaties',
      'Waardeert duidelijke informatie',
    ],
  },
  secondary: {
    ageRange: '25-40 jaar',
    characteristics: [
      'Tech-minded',
      'Early adopters',
      'Open voor automatisering',
      'Vaak jonge tot volwassen katten',
      'Waardeert slimme features',
      'Design en stijl belangrijk',
    ],
    painPoints: [
      'Drukke levensstijl',
      'Wil moderne oplossingen',
      'App-connectiviteit belangrijk',
      'Design moet passen bij interieur',
    ],
    searchBehavior: [
      'Zoekt naar "smart kattenbak"',
      'Interesseert zich voor app features',
      'Zoekt naar moderne design',
      'Vergelijkt tech specificaties',
    ],
  },
  tertiary: {
    ageRange: '55-75 jaar',
    characteristics: [
      'Gemak & comfort belangrijk',
      'Fysieke klachten kunnen rol spelen',
      'Vaak senior katten',
      'Behoefte aan minder schoonmaakwerkzaamheden',
      'Eenvoudige bediening belangrijk',
    ],
    painPoints: [
      'Fysieke beperkingen',
      'Moeite met bukken',
      'Wil minder onderhoud',
      'Eenvoudige bediening nodig',
    ],
    searchBehavior: [
      'Zoekt naar "makkelijk te gebruiken kattenbak"',
      'Vraagt naar onderhoud',
      'Waardeert duidelijke uitleg',
      'Zoekt naar betrouwbaarheid',
    ],
  },
} as const;

/**
 * ✅ KEYWORDS PER DOELGROEP - Conversational & Long-tail
 * 
 * Gebaseerd op zoekgedrag per leeftijdsgroep
 */
export const KEYWORDS_BY_AUDIENCE = {
  primary: {
    // 41-55 jaar: Bewuste consumenten, vergelijkend zoeken
    transactional: [
      'beste automatische kattenbak kopen',
      'automatische kattenbak vergelijken',
      'premium kattenbak met app',
      'zelfreinigende kattenbak voor senior kat',
      'grote kattenbak capaciteit kopen',
      'hygiënische kattenbak automatisch',
      'kattenbak minder onderhoud',
      'automatische kattenbak Nederland',
    ],
    informational: [
      'hoe werkt automatische kattenbak',
      'welke kattenbak is het beste',
      'automatische kattenbak voor meerdere katten',
      'kattenbak capaciteit vergelijken',
      'voordelen automatische kattenbak',
      'is automatische kattenbak het waard',
    ],
    conversational: [
      'ik zoek een automatische kattenbak',
      'wat is de beste kattenbak voor mijn kat',
      'automatische kattenbak aanbeveling',
      'kattenbak die zichzelf schoonmaakt',
    ],
  },
  secondary: {
    // 25-40 jaar: Tech-minded, early adopters
    transactional: [
      'smart kattenbak met app kopen',
      'automatische kattenbak app bediening',
      'moderne kattenbak design',
      'slimme kattenbak WiFi',
      'automatische kattenbak 2026',
      'tech kattenbak kopen',
    ],
    informational: [
      'hoe werkt app kattenbak',
      'smart kattenbak features',
      'automatische kattenbak reviews',
      'beste smart kattenbak 2026',
      'kattenbak met monitoring',
    ],
    conversational: [
      'ik wil een slimme kattenbak',
      'kattenbak met app bediening',
      'moderne automatische kattenbak',
    ],
  },
  tertiary: {
    // 55-75 jaar: Gemak & comfort
    transactional: [
      'makkelijk te gebruiken kattenbak',
      'automatische kattenbak eenvoudig',
      'kattenbak minder schoonmaken',
      'grote kattenbak kopen',
      'betrouwbare automatische kattenbak',
    ],
    informational: [
      'hoe vaak kattenbak legen',
      'automatische kattenbak onderhoud',
      'kattenbak voor oudere katten',
      'makkelijkste kattenbak te gebruiken',
    ],
    conversational: [
      'ik zoek een makkelijke kattenbak',
      'kattenbak die weinig onderhoud vraagt',
      'automatische kattenbak voor senioren',
    ],
  },
  // ✅ GEMEENSCHAPPELIJKE KEYWORDS (alle leeftijdsgroepen)
  common: {
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
      'automatische kattenbak gratis verzending',
      'zelfreinigende kattenbak voor senior kat',
      'kattenbak minder vaak legen',
    ],
  },
} as const;

/**
 * ✅ CONTENT TONE PER DOELGROEP
 * 
 * Aanpassing van content tone voor verschillende leeftijdsgroepen
 */
export const CONTENT_TONE = {
  primary: {
    // 41-55 jaar: Professioneel, informatief, vertrouwenwekkend
    tone: 'professioneel en vertrouwenwekkend',
    focus: [
      'Kwaliteit en duurzaamheid',
      'Tijdsbesparing',
      'Hygiëne en gezondheid',
      'Betrouwbaarheid',
      'Waarde voor geld',
    ],
    language: [
      'Duidelijk en informatief',
      'Feitelijk',
      'Onderbouwd met specificaties',
      'Review-georiënteerd',
    ],
  },
  secondary: {
    // 25-40 jaar: Modern, tech-forward, innovatief
    tone: 'modern en innovatief',
    focus: [
      'Tech features',
      'App functionaliteit',
      'Design en stijl',
      'Innovatie',
      'Gebruikerservaring',
    ],
    language: [
      'Enthousiast',
      'Tech-termen',
      'Feature-focused',
      'Visueel',
    ],
  },
  tertiary: {
    // 55-75 jaar: Eenvoudig, duidelijk, geruststellend
    tone: 'eenvoudig en geruststellend',
    focus: [
      'Eenvoudige bediening',
      'Minder onderhoud',
      'Betrouwbaarheid',
      'Comfort',
      'Ondersteuning',
    ],
    language: [
      'Eenvoudig en duidelijk',
      'Stap-voor-stap',
      'Geruststellend',
      'Ondersteunend',
    ],
  },
} as const;

/**
 * ✅ E-E-A-T SIGNALS (Experience, Expertise, Authoritativeness, Trustworthiness)
 * 
 * Voor Google ranking en vertrouwen
 */
export const EEAT_SIGNALS = {
  experience: [
    'Gebruikerservaringen en reviews',
    'Echte gebruikersfoto\'s',
    'Video demonstraties',
    'Case studies',
  ],
  expertise: [
    'Technische specificaties',
    'Dierenarts aanbevelingen',
    'Product vergelijkingen',
    'Onderhoudsrichtlijnen',
  ],
  authoritativeness: [
    'Certificeringen',
    'Kwaliteitsgaranties',
    'Bedrijfsinformatie',
    'Contactgegevens',
  ],
  trustworthiness: [
    'Veilige betaling',
    'Privacy policy',
    'Retourbeleid',
    'Klantenservice',
    'Transparante prijzen',
  ],
} as const;

/**
 * ✅ LOCAL SEO - Nederland & Haarlem
 */
export const LOCAL_SEO = {
  primaryLocation: {
    city: 'Haarlem',
    region: 'Noord-Holland',
    country: 'Nederland',
    coordinates: {
      latitude: 52.3792,
      longitude: 4.9003,
    },
  },
  serviceArea: [
    'Nederland',
    'België',
    'Luxemburg',
  ],
  localKeywords: [
    'automatische kattenbak Nederland',
    'kattenbak kopen Haarlem',
    'automatische kattenbak Noord-Holland',
    'kattenbak online Nederland',
    'gratis verzending Nederland',
  ],
} as const;
