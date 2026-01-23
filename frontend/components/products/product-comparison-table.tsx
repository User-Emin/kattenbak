"use client";

import { useState, useEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND_COLORS_HEX } from "@/lib/color-config";

/**
 * Product Comparison Table - Modern & Smooth
 * ✅ DRY: Gebaseerd op echte info van Poopy.nl en Alibaba
 * ✅ Modern design met smooth animaties
 * ✅ MOBIEL: Smooth om-en-om beweging (zoals slider)
 * ✅ PERFORMANCE: Lazy loading en optimale laadtijden
 * ✅ DYNAMISCH: Product afbeeldingen voor Automatische en Handmatige kattenbak
 */

interface ComparisonRow {
  feature: string;
  ourProduct: string | boolean;
  competitor: string | boolean;
  highlight?: boolean; // ✅ HIGHLIGHT: Onze voordelen
}

interface ProductComparisonTableProps {
  productImages?: string[]; // ✅ DYNAMISCH: Product afbeeldingen voor vergelijking
}

// ✅ DRY: Shared constants
const BLUR_PLACEHOLDER = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

// ✅ DRY: Image component helper
const ComparisonImage = ({ src, alt }: { src: string; alt: string }) => (
  <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded overflow-hidden border border-gray-200 shadow-sm">
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 640px) 48px, 64px"
      quality={90}
      loading="lazy"
      unoptimized={src.startsWith('/uploads/')}
      placeholder="blur"
      blurDataURL={BLUR_PLACEHOLDER}
    />
  </div>
);

const comparisonData: ComparisonRow[] = [
  {
    feature: 'Automatische reiniging',
    ourProduct: true, // ✅ VINKJE: Onze kattenbak reinigt automatisch
    competitor: false, // ❌ KRUISJE: Traditionele kattenbak reinigt niet automatisch
    highlight: true,
  },
  {
    feature: 'Geen dagelijks scheppen',
    ourProduct: true, // ✅ VINKJE: Geen scheppen nodig
    competitor: false, // ❌ KRUISJE: Moet dagelijks scheppen
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

export function ProductComparisonTable({ productImages = [] }: ProductComparisonTableProps) {
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ DYNAMISCH: Haal eerste en 6e afbeelding op (index 0 en 5)
  const firstImage = productImages && productImages.length > 0 ? productImages[0] : null;
  const sixthImage = productImages && productImages.length > 5 ? productImages[5] : null;

  // ✅ AUTO-SLIDE: Smooth om-en-om beweging op mobiel (zoals slider)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Alleen op mobiel (max-width: 768px)
    const isMobile = window.innerWidth < 768;
    if (!isMobile || comparisonData.length <= 1) return;

    const interval = setInterval(() => {
      setVisibleIndex((prev) => {
        const next = (prev + 1) % comparisonData.length;
        return next;
      });
    }, 4000); // ✅ SMOOTH: 4 seconden tussen slides

    return () => clearInterval(interval);
  }, []);

  // ✅ MANUAL NAVIGATION: Swipe/klik navigatie
  const goToSlide = (index: number) => {
    if (isAnimating || index === visibleIndex) return;
    setIsAnimating(true);
    setVisibleIndex(index);
    setTimeout(() => setIsAnimating(false), 600); // ✅ SMOOTH: 600ms animatie
  };

  const renderValue = (value: string | boolean, isOurProduct: boolean = false) => {
    if (typeof value === 'boolean') {
      return value ? (
        // ✅ DRY: Gebruik BRAND_COLORS_HEX
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: BRAND_COLORS_HEX.primary }}>
          <Check className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" strokeWidth={2.5} />
        </div>
      ) : (
        // ✅ COMPACT KRUISJE: Subtieler kruisje
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-gray-300 flex items-center justify-center flex-shrink-0">
          <X className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray-400" strokeWidth={2.5} />
        </div>
      );
    }
    return <span className="text-xs sm:text-sm font-medium text-gray-900">{value}</span>;
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden">
      {/* Header - ✅ DRY: Gebruik BRAND_COLORS_HEX */}
      <div 
        className="text-white px-4 sm:px-6 py-3 sm:py-4"
        style={{ 
          background: `linear-gradient(to right, ${BRAND_COLORS_HEX.primary}, ${BRAND_COLORS_HEX.primaryDark})` 
        }}
      >
        <h3 className="text-lg sm:text-xl font-bold text-center">Vergelijking</h3>
        <p className="text-xs sm:text-sm text-blue-100 mt-1 text-center">Automatische kattenbak vs. Handmatige kattenbak</p>
      </div>

      {/* ✅ RESPONSIVE TABLE: Desktop compact, mobiel swipe-vriendelijk */}
      {/* Desktop Table - ✅ COMPACT: Minder padding, subtielere highlights */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 w-2/5">
                Feature
              </th>
              <th 
                className="px-4 py-4 text-center text-sm font-semibold text-white w-[30%]" 
                style={{ backgroundColor: BRAND_COLORS_HEX.primary }}
              >
                Automatische kattenbak
              </th>
              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 bg-gray-100 w-[30%]">
                Handmatige kattenbak
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {comparisonData.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  'transition-colors',
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50',
                  row.highlight && 'bg-blue-50'
                )}
              >
                <td className={cn(
                  'px-4 py-4 text-sm font-medium',
                  row.highlight ? 'text-gray-900' : 'text-gray-900'
                )} style={row.highlight ? { color: BRAND_COLORS_HEX.primary } : {}}>
                  {row.feature}
                </td>
                <td className={cn(
                  'px-4 py-4 text-center',
                  row.highlight && 'bg-blue-50'
                )}>
                  <div className="flex items-center justify-center gap-3">
                    {/* ✅ DRY: Gebruik ComparisonImage helper */}
                    {firstImage && <ComparisonImage src={firstImage} alt="Automatische kattenbak" />}
                    {renderValue(row.ourProduct, true)}
                  </div>
                </td>
                <td className={cn(
                  'px-4 py-4 text-center',
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                )}>
                  <div className="flex items-center justify-center gap-3">
                    {/* ✅ DRY: Gebruik ComparisonImage helper */}
                    {sixthImage && <ComparisonImage src={sixthImage} alt="Handmatige kattenbak" />}
                    {renderValue(row.competitor, false)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ MOBIEL: Smooth om-en-om slide (zoals slider) */}
      <div className="md:hidden" ref={containerRef}>
        <div className="relative overflow-hidden">
          <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${visibleIndex * 100}%)` }}>
            {comparisonData.map((row, index) => (
              <div
                key={index}
                className={cn(
                  'min-w-full flex-shrink-0 px-4',
                  'opacity-0 translate-x-4',
                  'transition-all duration-700 ease-out',
                  index === visibleIndex && 'opacity-100 translate-x-0'
                )}
              >
                <div
                  className={cn(
                    'w-full p-4 rounded-lg border transition-all',
                    row.highlight 
                      ? 'bg-blue-50 shadow-sm' 
                      : 'bg-white border-gray-200'
                  )}
                  style={row.highlight ? { borderColor: `${BRAND_COLORS_HEX.primary}4D` } : {}}
                >
                  <div 
                    className={cn(
                      'text-xs font-semibold mb-3 text-center leading-tight',
                      row.highlight ? '' : 'text-gray-900'
                    )}
                    style={row.highlight ? { color: BRAND_COLORS_HEX.primary } : {}}
                  >
                    {row.feature}
                  </div>
                  <div className="space-y-4">
                    <div 
                      className="flex items-center justify-between p-4 rounded-md border"
                      style={{ 
                        backgroundColor: `${BRAND_COLORS_HEX.primary}1A`,
                        borderColor: `${BRAND_COLORS_HEX.primary}33`
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* ✅ DRY: Gebruik ComparisonImage helper */}
                        {firstImage && <ComparisonImage src={firstImage} alt="Automatische kattenbak" />}
                        <span className="text-sm font-medium" style={{ color: BRAND_COLORS_HEX.primary }}>Automatische kattenbak</span>
                      </div>
                      <div className="flex items-center justify-center">
                        {renderValue(row.ourProduct, true)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-md bg-gray-100 border border-gray-200">
                      <div className="flex items-center gap-3">
                        {/* ✅ DRY: Gebruik ComparisonImage helper */}
                        {sixthImage && <ComparisonImage src={sixthImage} alt="Handmatige kattenbak" />}
                        <span className="text-sm font-medium text-gray-700">Handmatige kattenbak</span>
                      </div>
                      <div className="flex items-center justify-center">
                        {renderValue(row.competitor, false)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* ✅ MOBIEL: Navigation dots */}
        <div className="flex justify-center gap-2 mt-4 mb-3">
          {comparisonData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === visibleIndex 
                  ? 'w-6' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }
              style={index === visibleIndex ? { backgroundColor: BRAND_COLORS_HEX.primary } : {}}
              )}
              aria-label={`Ga naar slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Footer Note - ✅ SUBTIELE: Minder opvallend */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-2.5 sm:py-3">
        <p className="text-xs text-gray-500 text-center">
          * Vergelijking met handmatige kattenbak
        </p>
      </div>
    </div>
  );
}
