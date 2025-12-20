// ALLE PRODUCTKENMERKEN MET CUSTOM VECTORS - DRY Component
export const ProductSpecs = () => {
  return (
    <div className="max-w-6xl mx-auto mb-16">
      <h2 className="text-3xl font-medium mb-8 text-gray-900 text-center">Productkenmerken</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SPECS.map((spec, idx) => (
          <details key={idx} className="group bg-white rounded-xl border-2 border-gray-200 hover:border-brand/40 transition overflow-hidden">
            <summary className="flex items-center gap-4 p-5 cursor-pointer">
              <div className="w-12 h-12 flex-shrink-0" dangerouslySetInnerHTML={{ __html: spec.icon }} />
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{spec.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{spec.subtitle}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-5 pb-5 text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-4">
              {spec.description}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};

const SPECS = [
  {
    title: 'Zelfreinigende Functie',
    subtitle: 'Automatisch schoon na elk bezoek',
    icon: `<svg class="w-12 h-12 text-brand" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="2.5"/><path d="M24 12v12l8 4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 24h24M24 12v24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/><circle cx="24" cy="24" r="3" fill="currentColor"/></svg>`,
    description: 'Automatische reiniging start 3 minuten na elk bezoek van je kat. Het systeem scheidt vaste afval van schoon grit en verzamelt alles in een afgesloten container.'
  },
  {
    title: 'Open-Top, Low-Stress Design',
    subtitle: 'Minder stress voor je kat',
    icon: `<svg class="w-12 h-12 text-brand" viewBox="0 0 48 48" fill="none"><path d="M8 28c0-8 8-16 16-16s16 8 16 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="24" cy="32" r="4" fill="currentColor"/><path d="M16 28l8 4 8-4M12 24l12 6 12-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.4"/><path d="M20 20v8M28 20v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    description: 'Katten voelen zich veiliger in een open ruimte waar ze hun omgeving kunnen zien. Dit vermindert stress en angst, wat leidt tot meer gebruik.'
  },
  {
    title: '10.5L XL Afvalbak',
    subtitle: 'Grootste in zijn klasse',
    icon: `<svg class="w-12 h-12 text-brand" viewBox="0 0 48 48" fill="none"><path d="M14 8h20c2 0 3 1 3 3v26c0 2-1 3-3 3H14c-2 0-3-1-3-3V11c0-2 1-3 3-3z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 16h26M11 32h26" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="24" cy="24" r="3" fill="currentColor"/></svg>`,
    description: 'Met 10.5 liter de grootste afvalbak in zijn klasse. Voor één kat hoef je slechts 1x per week te legen, in plaats van 2-3x bij concurrenten.'
  },
  {
    title: 'Dubbele Veiligheidssensoren',
    subtitle: 'Extra veilig voor je kat',
    icon: `<svg class="w-12 h-12 text-brand" viewBox="0 0 48 48" fill="none"><circle cx="18" cy="24" r="7" stroke="currentColor" stroke-width="2.5"/><circle cx="30" cy="24" r="7" stroke="currentColor" stroke-width="2.5"/><circle cx="18" cy="24" r="3" fill="currentColor"/><circle cx="30" cy="24" r="3" fill="currentColor"/><path d="M11 24a7 7 0 0114 0M25 24a7 7 0 0114 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/></svg>`,
    description: 'Twee onafhankelijke sensoren detecteren wanneer je kat de bak benadert. De reiniging stopt onmiddellijk en start pas 3 minuten na het laatste bezoek.'
  },
  {
    title: 'Hoge-Efficiëntie Filter',
    subtitle: 'Multi-laags actieve koolstof',
    icon: `<svg class="w-12 h-12 text-brand" viewBox="0 0 48 48" fill="none"><rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" stroke-width="2.5"/><path d="M16 16h16M16 24h16M16 32h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M20 20v16M28 20v16M24 20v16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/></svg>`,
    description: 'Geavanceerd multi-laags filtersysteem met actieve koolstof vangt geuren en stofdeeltjes op voordat ze je huis in komen. Het filter is uitwasbaar en herbruikbaar, wat zorgt voor lagere onderhoudskosten.'
  },
  {
    title: 'Anti-Splash, Hoge Zijwanden',
    subtitle: '22cm verhoogde zijwanden',
    icon: `<svg class="w-12 h-12 text-brand" viewBox="0 0 48 48" fill="none"><path d="M12 32V16c0-2 1-3 3-3h18c2 0 3 1 3 3v16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 24c2-2 4-3 8-3s6 1 8 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/><circle cx="20" cy="28" r="1.5" fill="currentColor"/><circle cx="28" cy="28" r="1.5" fill="currentColor"/><circle cx="24" cy="32" r="1.5" fill="currentColor"/></svg>`,
    description: 'De verhoogde zijwanden van 22cm zijn speciaal ontworpen om morsen te voorkomen, zelfs bij katten die enthousiast graven. De vorm leidt grit terug naar beneden in plaats van naar buiten.'
  },
  {
    title: 'Gemakkelijk te Demonteren',
    subtitle: 'Volledig modulair ontwerp',
    icon: `<svg class="w-12 h-12 text-brand" viewBox="0 0 48 48" fill="none"><rect x="10" y="10" width="28" height="28" rx="4" stroke="currentColor" stroke-width="2.5"/><path d="M24 18v12M18 24h12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="24" cy="24" r="3" stroke="currentColor" stroke-width="2"/></svg>`,
    description: 'Volledig modulair ontwerp waarbij elk onderdeel los kan voor grondige reiniging. Geen verborgen hoeken waar vuil zich kan ophopen. Alle onderdelen zijn vaatwasserbestendig (top rack).'
  },
  {
    title: 'Geschikt voor Meeste Kattengrit',
    subtitle: 'Verstelbare zeef voor alle types',
    icon: `<svg class="w-12 h-12 text-brand" viewBox="0 0 48 48" fill="none"><circle cx="18" cy="20" r="3" fill="currentColor"/><circle cx="30" cy="20" r="3" fill="currentColor"/><circle cx="24" cy="28" r="3" fill="currentColor"/><circle cx="18" cy="36" r="2" fill="currentColor" opacity="0.6"/><circle cx="30" cy="36" r="2" fill="currentColor" opacity="0.6"/><path d="M8 12h32v24H8z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" rx="2"/></svg>`,
    description: 'Werkt met klonterende bentoniet, silica gel, en plantaardige grit. Alleen niet geschikt voor houtkorrels. De zeef heeft verstelbare openingen voor verschillende gritgroottes, in tegenstelling tot concurrenten die vaak maar één type accepteren.'
  },
  {
    title: 'Compact Formaat, Groot Inwendig',
    subtitle: '60×55×62cm buitenmaat',
    icon: `<svg class="w-12 h-12 text-brand" viewBox="0 0 48 48" fill="none"><rect x="12" y="12" width="24" height="24" rx="2" stroke="currentColor" stroke-width="2.5"/><path d="M12 12l24 24M36 12l-24 24" stroke="currentColor" stroke-width="1.5" opacity="0.3"/><path d="M20 12v24M28 12v24M12 20h24M12 28h24" stroke="currentColor" stroke-width="1" opacity="0.3"/></svg>`,
    description: 'Buitenmaat 60×55×62cm past in kleinere ruimtes, maar biedt een ruime binnenkant van 50×45cm waar je kat comfortabel kan draaien. Intelligente ruimte-optimalisatie zonder de kat te benauwen.'
  },
  {
    title: 'Ultra-Stille Motor (<40dB)',
    subtitle: 'Stiller dan een bibliotheek',
    icon: `<svg class="w-12 h-12 text-brand" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="4" fill="currentColor"/><path d="M16 20c-2 1-3 3-3 5s1 4 3 5M32 20c2 1 3 3 3 5s-1 4-3 5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M10 16c-3 2-5 6-5 9s2 7 5 9M38 16c3 2 5 6 5 9s-2 7-5 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/></svg>`,
    description: 'Met minder dan 40 decibel is de motor stiller dan een bibliotheek (40dB) en vergelijkbaar met gefluister (30dB). Andere bakken produceren vaak 50-60dB, vergelijkbaar met een normaal gesprek. Geschikt voor gebruik in slaapkamers.'
  },
  {
    title: 'Modulair Design (OEM-Vriendelijk)',
    subtitle: 'Alle onderdelen vervangbaar',
    icon: `<svg class="w-12 h-12 text-brand" viewBox="0 0 48 48" fill="none"><rect x="8" y="8" width="14" height="14" rx="2" stroke="currentColor" stroke-width="2.5"/><rect x="26" y="8" width="14" height="14" rx="2" stroke="currentColor" stroke-width="2.5"/><rect x="8" y="26" width="14" height="14" rx="2" stroke="currentColor" stroke-width="2.5"/><rect x="26" y="26" width="14" height="14" rx="2" stroke="currentColor" stroke-width="2.5"/><circle cx="15" cy="15" r="2" fill="currentColor"/><circle cx="33" cy="33" r="2" fill="currentColor"/></svg>`,
    description: 'Alle onderdelen zijn apart verkrijgbaar en vervangbaar. Geen sealed units zoals bij concurrenten - als één onderdeel kapot gaat, vervang je alleen dat deel. Dit verlengt de levensduur aanzienlijk en reduceert kosten.'
  },
  {
    title: 'App + Gezondheidsmonitoring',
    subtitle: 'iOS/Android tracking & alerts',
    icon: `<svg class="w-12 h-12 text-brand" viewBox="0 0 48 48" fill="none"><rect x="12" y="8" width="24" height="36" rx="3" stroke="currentColor" stroke-width="2.5"/><path d="M20 16h8M20 22h8M20 28h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="38" r="2" fill="currentColor"/><path d="M28 22l-4 4-2-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    description: 'De gratis app (iOS/Android) tracked aantal bezoeken, gewicht van afval, reinigingstijden en stuurt gezondheidsalerts. Bij plotselinge toename van bezoeken (mogelijk urineweginfectie) krijg je een notificatie om tijdig naar de dierenarts te gaan.'
  },
];
