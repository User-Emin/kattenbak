// PRODUCTKENMERKEN - Selectiekaarten onder elkaar (GEEN symbolen)
export const ProductSpecs = () => {
  return (
    <div className="max-w-5xl mx-auto mb-16">
      <h2 className="text-3xl font-medium mb-8 text-gray-900 text-center">Productkenmerken</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SPECS.map((spec, idx) => (
          <div key={idx} className="bg-white border-2 border-gray-200 hover:border-brand/40 p-4 rounded-xl transition cursor-default">
            <h4 className="font-bold text-gray-900 mb-2">{spec.title}</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{spec.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const SPECS = [
  {
    title: 'Zelfreinigende Functie',
    description: 'Automatische reiniging start 3 minuten na elk bezoek van je kat. Het systeem scheidt vaste afval van schoon grit en verzamelt alles in een afgesloten container.'
  },
  {
    title: 'Open-Top, Low-Stress Design',
    description: 'Katten voelen zich veiliger in een open ruimte waar ze hun omgeving kunnen zien. Dit vermindert stress en angst, wat leidt tot meer gebruik.'
  },
  {
    title: '10.5L XL Afvalbak',
    description: 'Met 10.5 liter de grootste afvalbak in zijn klasse. Voor één kat hoef je slechts 1x per week te legen, in plaats van 2-3x bij concurrenten.'
  },
  {
    title: 'Dubbele Veiligheidssensoren',
    description: 'Twee onafhankelijke sensoren detecteren wanneer je kat de bak benadert. De reiniging stopt onmiddellijk en start pas 3 minuten na het laatste bezoek.'
  },
  {
    title: 'Hoge-Efficiëntie Filter',
    description: 'Geavanceerd multi-laags filtersysteem met actieve koolstof vangt geuren en stofdeeltjes op voordat ze je huis in komen. Het filter is uitwasbaar en herbruikbaar.'
  },
  {
    title: 'Anti-Splash, Hoge Zijwanden (22cm)',
    description: 'De verhoogde zijwanden van 22cm zijn speciaal ontworpen om morsen te voorkomen, zelfs bij katten die enthousiast graven. De vorm leidt grit terug naar beneden.'
  },
  {
    title: 'Gemakkelijk te Demonteren',
    description: 'Volledig modulair ontwerp waarbij elk onderdeel los kan voor grondige reiniging. Geen verborgen hoeken waar vuil zich kan ophopen. Alle onderdelen zijn vaatwasserbestendig.'
  },
  {
    title: 'Geschikt voor Meeste Kattengrit',
    description: 'Werkt met klonterende bentoniet, silica gel, en plantaardige grit. De zeef heeft verstelbare openingen voor verschillende gritgroottes.'
  },
  {
    title: 'Compact Formaat, Groot Inwendig (60×55×62cm)',
    description: 'Buitenmaat 60×55×62cm past in kleinere ruimtes, maar biedt een ruime binnenkant van 50×45cm waar je kat comfortabel kan draaien. Intelligente ruimte-optimalisatie.'
  },
  {
    title: 'Ultra-Stille Motor (<40dB)',
    description: 'Met minder dan 40 decibel is de motor stiller dan een bibliotheek en vergelijkbaar met gefluister. Geschikt voor gebruik in slaapkamers.'
  },
  {
    title: 'Modulair Design (OEM-Vriendelijk)',
    description: 'Alle onderdelen zijn apart verkrijgbaar en vervangbaar. Geen sealed units - als één onderdeel kapot gaat, vervang je alleen dat deel. Dit verlengt de levensduur aanzienlijk.'
  },
  {
    title: 'App + Gezondheidsmonitoring',
    description: 'De gratis app (iOS/Android) tracked aantal bezoeken, gewicht van afval, reinigingstijden en stuurt gezondheidsalerts. Bij plotselinge toename van bezoeken krijg je een notificatie.'
  },
];
