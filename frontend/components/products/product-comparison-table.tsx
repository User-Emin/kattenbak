"use client";

import { Check, X } from "lucide-react";
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
    feature: 'Afvalbak capaciteit',
    ourProduct: '10.5L',
    competitor: 'Niet vermeld',
    highlight: true, // ✅ HIGHLIGHT: Onze unieke 10.5L
  },
  {
    feature: 'Geluidsniveau',
    ourProduct: '<40 dB',
    competitor: '±55 dB',
    highlight: true, // ✅ HIGHLIGHT: Stiller
  },
  {
    feature: 'Formaat (L×B×H)',
    ourProduct: '65 × 53 × 65 cm',
    competitor: '48 × 52 × 50 cm',
    highlight: false,
  },
  {
    feature: 'Gewicht',
    ourProduct: '8.5 kg',
    competitor: '±7 kg',
    highlight: false,
  },
  {
    feature: 'Veiligheidssensoren',
    ourProduct: 'Dubbele sensoren (IR + gewicht)',
    competitor: 'Gewichtssensoren',
    highlight: true, // ✅ HIGHLIGHT: Dubbele veiligheid
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
    ourProduct: '2 jaar',
    competitor: '2 jaar',
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
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <h3 className="text-xl font-semibold text-gray-900">Vergelijking</h3>
        <p className="text-sm text-gray-600 mt-1">Onze kattenbak vs. concurrent</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
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
                Concurrent
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {comparisonData.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  'transition-colors hover:bg-gray-50',
                  row.highlight && 'bg-green-50/50' // ✅ HIGHLIGHT: Onze voordelen
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

      {/* Footer Note */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
        <p className="text-xs text-gray-500 text-center">
          * Gebaseerd op publiek beschikbare informatie. Specificaties kunnen variëren.
        </p>
      </div>
    </div>
  );
}
