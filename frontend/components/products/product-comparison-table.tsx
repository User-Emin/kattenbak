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
    ourProduct: true,
    competitor: false, // ✅ NIET-AUTOMATISCH: Traditionele kattenbak
    highlight: true, // ✅ HIGHLIGHT: Onze automatische reiniging
  },
  {
    feature: 'Afvalbak capaciteit',
    ourProduct: '10.5L',
    competitor: 'Geen afvalbak',
    highlight: true, // ✅ HIGHLIGHT: Onze unieke 10.5L
  },
  {
    feature: 'Dagelijks scheppen',
    ourProduct: false,
    competitor: true, // ✅ NIET-AUTOMATISCH: Moet dagelijks scheppen
    highlight: true, // ✅ HIGHLIGHT: Geen scheppen nodig
  },
  {
    feature: 'Geurblokje nodig',
    ourProduct: false,
    competitor: true, // ✅ NIET-AUTOMATISCH: Heeft geurblokje nodig
    highlight: true, // ✅ HIGHLIGHT: Geen geurblokje nodig
  },
  {
    feature: 'Kwats op vloer',
    ourProduct: false,
    competitor: true, // ✅ NIET-AUTOMATISCH: Kwats op vloer
    highlight: true, // ✅ HIGHLIGHT: Geen kwats
  },
  {
    feature: 'Afvalzak vervangen',
    ourProduct: '1x per 4-6 dagen',
    competitor: 'Dagelijks schoonmaken',
    highlight: true, // ✅ HIGHLIGHT: Minder onderhoud
  },
  {
    feature: 'App bediening',
    ourProduct: true,
    competitor: false,
    highlight: true, // ✅ HIGHLIGHT: Smart control
  },
  {
    feature: 'Geluidsniveau',
    ourProduct: '<40 dB',
    competitor: 'Stil (geen motor)',
    highlight: false,
  },
  {
    feature: 'Gezondheidsmonitoring',
    ourProduct: true,
    competitor: false,
    highlight: true, // ✅ HIGHLIGHT: Inzicht in gezondheid
  },
  {
    feature: 'Tijdbesparing',
    ourProduct: '15 min/dag',
    competitor: '0 min/dag',
    highlight: true, // ✅ HIGHLIGHT: Tijdbesparing
  },
];

export function ProductComparisonTable() {
  const renderValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-600" />
      ) : (
        <X className="w-5 h-5 text-gray-300" />
      );
    }
    return <span className="text-sm font-medium text-gray-900">{value}</span>;
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Vergelijking</h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">Onze automatische kattenbak vs. traditionele kattenbak</p>
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
                  <span>Traditionele Kattenbak</span>
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
                    {renderValue(row.ourProduct)}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    {renderValue(row.competitor)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ MOBIEL: Cards layout voor betere leesbaarheid */}
      <div className="md:hidden divide-y divide-gray-200">
        {comparisonData.map((row, index) => (
          <div
            key={index}
            className={cn(
              'p-4 transition-colors',
              row.highlight && 'bg-green-50/50'
            )}
          >
            <div className="text-xs font-semibold text-gray-900 mb-3">{row.feature}</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center">
                <div className="text-xs text-gray-600 mb-1.5">Onze Kattenbak</div>
                <div className="flex items-center justify-center">
                  {renderValue(row.ourProduct)}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-xs text-gray-600 mb-1.5">Traditionele</div>
                <div className="flex items-center justify-center">
                  {renderValue(row.competitor)}
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
