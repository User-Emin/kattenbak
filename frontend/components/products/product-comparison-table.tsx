"use client";

import { useState, useEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
        // ✅ COMPACT VINKJE: Kleinere, subtielere vinkjes
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#3071aa' }}>
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
      {/* Header - ✅ SUBTIELE ACCENT: Minder overweldigend maar opvallend */}
      <div className="bg-gradient-to-r from-[#3071aa] to-[#256394] text-white px-4 sm:px-6 py-3 sm:py-4">
        <h3 className="text-lg sm:text-xl font-bold text-center">Vergelijking</h3>
        <p className="text-xs sm:text-sm text-blue-100 mt-1 text-center">Automatische kattenbak vs. Handmatige kattenbak</p>
      </div>

      {/* ✅ RESPONSIVE TABLE: Desktop compact, mobiel swipe-vriendelijk */}
      {/* Desktop Table - ✅ COMPACT: Minder padding, subtielere highlights */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 w-2/5">
                Feature
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold text-white w-[30%]" style={{ backgroundColor: '#3071aa' }}>
                Automatische kattenbak
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-700 bg-gray-100 w-[30%]">
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
                  'px-3 py-2.5 text-xs font-medium',
                  row.highlight ? 'text-[#3071aa]' : 'text-gray-900'
                )}>
                  {row.feature}
                </td>
                <td className={cn(
                  'px-3 py-2.5 text-center',
                  row.highlight && 'bg-blue-50'
                )}>
                  <div className="flex items-center justify-center gap-2">
                    {/* ✅ DYNAMISCH: Eerste afbeelding voor Automatische kattenbak */}
                    {firstImage && (
                      <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded overflow-hidden border border-gray-200">
                        <Image
                          src={firstImage}
                          alt="Automatische kattenbak"
                          fill
                          className="object-cover"
                          sizes="40px"
                          quality={85}
                          loading="lazy"
                          unoptimized={firstImage.startsWith('/uploads/')}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                      </div>
                    )}
                    {renderValue(row.ourProduct, true)}
                  </div>
                </td>
                <td className={cn(
                  'px-3 py-2.5 text-center',
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                )}>
                  <div className="flex items-center justify-center gap-2">
                    {/* ✅ DYNAMISCH: 6e afbeelding voor Handmatige kattenbak */}
                    {sixthImage && (
                      <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded overflow-hidden border border-gray-200">
                        <Image
                          src={sixthImage}
                          alt="Handmatige kattenbak"
                          fill
                          className="object-cover"
                          sizes="40px"
                          quality={85}
                          loading="lazy"
                          unoptimized={sixthImage.startsWith('/uploads/')}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                      </div>
                    )}
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
                      ? 'bg-blue-50 border-[#3071aa]/30 shadow-sm' 
                      : 'bg-white border-gray-200'
                  )}
                >
                  <div className={cn(
                    'text-xs font-semibold mb-3 text-center leading-tight',
                    row.highlight ? 'text-[#3071aa]' : 'text-gray-900'
                  )}>
                    {row.feature}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 rounded-md bg-[#3071aa]/10 border border-[#3071aa]/20">
                      <div className="flex items-center gap-2">
                        {/* ✅ DYNAMISCH: Eerste afbeelding voor Automatische kattenbak */}
                        {firstImage && (
                          <div className="relative w-8 h-8 flex-shrink-0 rounded overflow-hidden border border-gray-200">
                            <Image
                              src={firstImage}
                              alt="Automatische kattenbak"
                              fill
                              className="object-cover"
                              sizes="32px"
                              quality={85}
                              loading="lazy"
                              unoptimized={firstImage.startsWith('/uploads/')}
                              placeholder="blur"
                              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                            />
                          </div>
                        )}
                        <span className="text-xs font-medium text-[#3071aa]">Automatische kattenbak</span>
                      </div>
                      <div className="flex items-center justify-center">
                        {renderValue(row.ourProduct, true)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-md bg-gray-100 border border-gray-200">
                      <div className="flex items-center gap-2">
                        {/* ✅ DYNAMISCH: 6e afbeelding voor Handmatige kattenbak */}
                        {sixthImage && (
                          <div className="relative w-8 h-8 flex-shrink-0 rounded overflow-hidden border border-gray-200">
                            <Image
                              src={sixthImage}
                              alt="Handmatige kattenbak"
                              fill
                              className="object-cover"
                              sizes="32px"
                              quality={85}
                              loading="lazy"
                              unoptimized={sixthImage.startsWith('/uploads/')}
                              placeholder="blur"
                              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                            />
                          </div>
                        )}
                        <span className="text-xs font-medium text-gray-700">Handmatige kattenbak</span>
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
                  ? 'bg-[#3071aa] w-6' 
                  : 'bg-gray-300 hover:bg-gray-400'
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
