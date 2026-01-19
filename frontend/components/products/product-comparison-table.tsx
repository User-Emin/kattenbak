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
        <Check className="w-6 h-6 text-green-600" /> // ✅ DUidelijker: Grotere vinkjes
      ) : (
        <X className="w-6 h-6 text-red-500" /> // ✅ DUidelijker: Rode kruisjes (was grijs)
      );
    }
    return <span className="text-sm sm:text-base font-medium text-gray-900">{value}</span>;
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header - ✅ MOBIEL: Centraal */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 text-center sm:text-left">Vergelijking</h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 text-center sm:text-left">Onze automatische kattenbak vs. traditionele kattenbak</p>
      </div>

      {/* ✅ RESPONSIVE TABLE: Desktop tabel, mobiel cards */}
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-1/3">
                Feature
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 w-1/3">
                Onze Kattenbak
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 w-1/3">
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-white">
                    <Image
                      src="/images/traditional-litter-box-optimized.jpg"
                      alt="Traditionele kattenbak"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-center">Traditionele Kattenbak</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {comparisonData.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  'transition-colors hover:bg-gray-50',
                  row.highlight && 'bg-green-50/50'
                )}
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {row.feature}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    {renderValue(row.ourProduct, true)}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    {renderValue(row.competitor, false)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ MOBIEL: Cards layout voor betere leesbaarheid - CENTRAAL */}
      <div className="md:hidden divide-y divide-gray-200">
        {comparisonData.map((row, index) => (
          <div
            key={index}
            className={cn(
              'p-4 transition-colors',
              row.highlight && 'bg-green-50/50'
            )}
          >
            <div className="text-sm font-semibold text-gray-900 mb-3 text-center">{row.feature}</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center">
                <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2 text-center">Onze Kattenbak</div>
                <div className="flex items-center justify-center">
                  {renderValue(row.ourProduct, true)}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2 text-center">Traditionele</div>
                <div className="flex items-center justify-center">
                  {renderValue(row.competitor, false)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-2.5 sm:py-3">
        <p className="text-xs text-gray-500 text-center">
          * Vergelijking met traditionele niet-automatische kattenbak. Specificaties kunnen variëren.
        </p>
      </div>
    </div>
  );
}
