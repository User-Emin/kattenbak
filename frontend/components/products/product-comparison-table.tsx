"use client";

import { Check, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Product Comparison Table - Modern & Smooth
 * ✅ DRY: Gebaseerd op echte info van Poopy.nl en Alibaba
 * ✅ Modern design met smooth animaties
 */

interface ComparisonRow {
  feature: string;
  ourProduct: string | boolean;
  competitor: string | boolean;
  highlight?: boolean; // ✅ HIGHLIGHT: Onze voordelen
}

const comparisonData: ComparisonRow[] = [
  {
    feature: 'Automatische reiniging',
    ourProduct: true, // ✅ VINKJE: Onze kattenbak reinigt automatisch
    competitor: false, // ❌ KRUISJE: Traditionele kattenbak reinigt niet automatisch
    highlight: true,
  },
  {
    feature: '10.5L afvalbak capaciteit',
    ourProduct: true, // ✅ VINKJE: Onze kattenbak heeft 10.5L afvalbak
    competitor: false, // ❌ KRUISJE: Traditionele kattenbak heeft geen afvalbak
    highlight: true,
  },
  {
    feature: 'Geen dagelijks scheppen',
    ourProduct: true, // ✅ VINKJE: Geen scheppen nodig
    competitor: false, // ❌ KRUISJE: Moet dagelijks scheppen
    highlight: true,
  },
  {
    feature: 'Geen geurblokje nodig',
    ourProduct: true, // ✅ VINKJE: Geen geurblokje nodig
    competitor: false, // ❌ KRUISJE: Heeft geurblokje nodig
    highlight: true,
  },
  {
    feature: 'Geen kwast op vloer',
    ourProduct: true, // ✅ VINKJE: Geen kwast
    competitor: false, // ❌ KRUISJE: Kwast op vloer
    highlight: true,
  },
  {
    feature: 'Minder onderhoud (1x per 4-6 dagen)',
    ourProduct: true, // ✅ VINKJE: Minder onderhoud
    competitor: false, // ❌ KRUISJE: Dagelijks schoonmaken
    highlight: true,
  },
  {
    feature: 'App bediening',
    ourProduct: true, // ✅ VINKJE: App bediening beschikbaar
    competitor: false, // ❌ KRUISJE: Geen app bediening
    highlight: true,
  },
  {
    feature: 'Stil geluidsniveau (<40 dB)',
    ourProduct: true, // ✅ VINKJE: Zeer stil
    competitor: true, // ✅ VINKJE: Ook stil (geen motor)
    highlight: false, // Geen highlight (beide stil)
  },
  {
    feature: 'Gezondheidsmonitoring',
    ourProduct: true, // ✅ VINKJE: Gezondheidsmonitoring beschikbaar
    competitor: false, // ❌ KRUISJE: Geen monitoring
    highlight: true,
  },
  {
    feature: 'Tijdbesparing (15 min/dag)',
    ourProduct: true, // ✅ VINKJE: Bespaart tijd
    competitor: false, // ❌ KRUISJE: Geen tijdbesparing
    highlight: true,
  },
];

export function ProductComparisonTable() {
  const renderValue = (value: string | boolean, isOurProduct: boolean = false) => {
    if (typeof value === 'boolean') {
      return value ? (
        // ✅ BLAUW VINKJE: #3071aa achtergrond, witte vink
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3071aa' }}>
          <Check className="w-5 h-5 text-white" />
        </div>
      ) : (
        // ✅ ZWART-WIT KRUISJE: Witte achtergrond, zwart kruis
        <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
          <X className="w-5 h-5 text-gray-400" />
        </div>
      );
    }
    return <span className="text-sm sm:text-base font-medium text-gray-900">{value}</span>;
  };

  return (
    <div className="w-full bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden">
      {/* Header - ✅ ZWART-WIT: Speelser met contrast */}
      <div className="bg-black text-white px-4 sm:px-6 py-4 sm:py-5">
        <h3 className="text-xl sm:text-2xl font-bold text-center sm:text-left">Vergelijking</h3>
        <p className="text-sm sm:text-base text-gray-200 mt-2 text-center sm:text-left">Onze automatische kattenbak vs. traditionele kattenbak</p>
      </div>

      {/* ✅ RESPONSIVE TABLE: Desktop tabel, mobiel cards - ZWART-WIT CONTRAST */}
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white border-b-2 border-gray-300">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 w-1/3">
                Feature
              </th>
              <th className="px-6 py-4 text-center text-sm font-bold text-white w-1/3" style={{ backgroundColor: '#3071aa' }}>
                Onze Kattenbak
              </th>
              <th className="px-6 py-4 text-center text-sm font-bold text-white bg-gray-800 w-1/3">
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-400 bg-white">
                    <Image
                      src="/images/traditional-litter-box-optimized.jpg"
                      alt="Traditionele kattenbak"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-center text-white">Traditionele Kattenbak</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {comparisonData.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50', // ✅ ZEBRA STRIPES: Alternerend wit/grijs
                  row.highlight && 'bg-black text-white' // ✅ HIGHLIGHT: Zwarte achtergrond voor onze voordelen
                  // ✅ GEEN HOVER: Geen hover effect (geen wit worden)
                )}
              >
                <td className={cn(
                  'px-6 py-4 text-sm font-semibold',
                  row.highlight ? 'text-white' : 'text-gray-900'
                )}>
                  {row.feature}
                </td>
                <td className={cn(
                  'px-6 py-4 text-center',
                  row.highlight && 'text-white'
                )} style={row.highlight ? { backgroundColor: '#3071aa' } : undefined}>
                  <div className="flex items-center justify-center">
                    {renderValue(row.ourProduct, true)}
                  </div>
                </td>
                <td className={cn(
                  'px-6 py-4 text-center',
                  row.highlight ? 'bg-gray-800 text-white' : index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'
                )}>
                  <div className="flex items-center justify-center">
                    {renderValue(row.competitor, false)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ MOBIEL: Cards layout - ZWART-WIT CONTRAST, SPEELSER */}
      <div className="md:hidden divide-y-2 divide-gray-300">
        {comparisonData.map((row, index) => (
          <div
            key={index}
            className={cn(
              'p-4 transition-colors',
              row.highlight ? 'bg-black text-white' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50' // ✅ ZEBRA STRIPES + HIGHLIGHT
            )}
          >
            <div className={cn(
              'text-sm font-bold mb-4 text-center',
              row.highlight ? 'text-white' : 'text-gray-900'
            )}>
              {row.feature}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={cn(
                'flex flex-col items-center p-3 rounded-lg',
                'text-white'
              )} style={{ backgroundColor: '#3071aa' }}>
                <div className={cn(
                  'text-xs sm:text-sm font-bold mb-3 text-center',
                  'text-white'
                )}>Onze Kattenbak</div>
                <div className="flex items-center justify-center">
                  {renderValue(row.ourProduct, true)}
                </div>
              </div>
              <div className={cn(
                'flex flex-col items-center p-3 rounded-lg border-2',
                row.highlight ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-100 border-gray-400 text-gray-900'
              )}>
                <div className={cn(
                  'text-xs sm:text-sm font-bold mb-3 text-center',
                  row.highlight ? 'text-white' : 'text-gray-900'
                )}>Traditionele</div>
                <div className="flex items-center justify-center">
                  {renderValue(row.competitor, false)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note - ✅ ZWART-WIT: Consistent met header */}
      <div className="bg-gray-100 border-t-2 border-gray-300 px-4 sm:px-6 py-3 sm:py-4">
        <p className="text-xs sm:text-sm text-gray-600 text-center font-medium">
          * Vergelijking met traditionele niet-automatische kattenbak. Specificaties kunnen variëren.
        </p>
      </div>
    </div>
  );
}
