"use client";

import { useState, useEffect, useRef } from "react";
import { Check, X, Sparkles, Wind, Shovel, Clock, Smartphone, Coins } from "lucide-react";
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
  description?: string; // ✅ BESCHRIJVING: Extra uitleg bij feature (zoals in screenshot)
  icon?: React.ComponentType<{ className?: string }>; // ✅ ICON: Optioneel icoon voor feature
  ourProduct: string | boolean;
  competitor: string | boolean;
  highlight?: boolean; // ✅ HIGHLIGHT: Onze voordelen
}

interface ProductComparisonTableProps {
  productImages?: string[]; // ✅ DYNAMISCH: Product afbeeldingen voor vergelijking
}

// ✅ DRY: Shared constants
const BLUR_PLACEHOLDER = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

// ✅ DRY: Image component helper - Grotere afbeeldingen zoals in screenshot
const ComparisonImage = ({ src, alt, size = 'md' }: { src: string; alt: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20 md:w-24 md:h-24',
    lg: 'w-24 h-24 md:w-32 md:h-32'
  };
  return (
    <div className={cn('relative flex-shrink-0 rounded-lg overflow-hidden border-2 shadow-md', sizeClasses[size])}
      style={{ borderColor: `${BRAND_COLORS_HEX.primary}40` }}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 80px, 96px"
        quality={90}
        loading="lazy"
        unoptimized={src.startsWith('/uploads/')}
        placeholder="blur"
        blurDataURL={BLUR_PLACEHOLDER}
      />
    </div>
  );
};

const comparisonData: ComparisonRow[] = [
  {
    feature: 'Altijd een schone kattenbak',
    description: 'Jij gaat toch ook niet op een vieze wc zitten?',
    icon: Sparkles,
    ourProduct: true,
    competitor: false,
    highlight: true,
  },
  {
    feature: 'Geen nare geurtjes thuis',
    description: 'Ontlasting direct gescheiden voor een geurvrij huis.',
    icon: Wind,
    ourProduct: true,
    competitor: false,
    highlight: true,
  },
  {
    feature: 'Nooit meer poep scheppen',
    description: 'Soms de zak verwisselen en geen vieze klusjes meer.',
    icon: Shovel,
    ourProduct: true,
    competitor: false,
    highlight: true,
  },
  {
    feature: 'Tijdbesparend (1,5 uur per week)',
    description: 'Tot wel 10 minuten per dag, meer dan 1 uur per week!',
    icon: Clock,
    ourProduct: true,
    competitor: false,
    highlight: true,
  },
  {
    feature: 'Kattengedrag inzien via APP',
    description: 'Zie het gewicht, activiteiten en de gezondheid in de app.',
    icon: Smartphone,
    ourProduct: true,
    competitor: false,
    highlight: true,
  },
  {
    feature: 'Bespaar geld door minder grind',
    description: 'Minder grind, verspilling en milieuvriendelijker.',
    icon: Coins,
    ourProduct: true,
    competitor: false,
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

  const renderValue = (value: string | boolean, isOurProduct: boolean = false, isDesktop: boolean = false) => {
    if (typeof value === 'boolean') {
      return value ? (
        // ✅ DRY: Gebruik BRAND_COLORS_HEX - RONDER EN DUIDELIJKER IN BLAUWE KOLOM (DESKTOP)
        <div 
          className={cn(
            'rounded-full flex items-center justify-center flex-shrink-0',
            isDesktop ? 'w-10 h-10' : 'w-6 h-6 sm:w-7 sm:h-7'
          )}
          style={{ 
            backgroundColor: isDesktop ? BRAND_COLORS_HEX.white : BRAND_COLORS_HEX.primary,
            border: isDesktop ? `3px solid ${BRAND_COLORS_HEX.white}` : 'none',
            boxShadow: isDesktop ? `0 2px 8px ${BRAND_COLORS_HEX.gray[900]}40` : 'none'
          }}
        >
          <Check 
            className={cn(
              isDesktop ? 'w-6 h-6' : 'w-4 h-4 sm:w-4.5 sm:h-4.5'
            )}
            style={{ 
              color: isDesktop ? BRAND_COLORS_HEX.primary : BRAND_COLORS_HEX.white,
              strokeWidth: isDesktop ? 3 : 2.5
            }} 
          />
        </div>
      ) : (
        // ✅ COMPACT KRUISJE: Subtieler kruisje - DRY via BRAND_COLORS_HEX
        <div 
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border flex items-center justify-center flex-shrink-0"
          style={{ borderColor: BRAND_COLORS_HEX.gray[300] }}
        >
          <X 
            className="w-4 h-4 sm:w-4.5 sm:h-4.5" 
            strokeWidth={2.5}
            style={{ color: BRAND_COLORS_HEX.gray[400] }}
          />
        </div>
      );
    }
    return (
      <span 
        className="text-xs sm:text-sm font-medium"
        style={{ color: BRAND_COLORS_HEX.gray[900] }}
      >
        {value}
      </span>
    );
  };

  return (
    <div 
      className="w-full bg-white rounded-xl overflow-hidden shadow-2xl"
      style={{ 
        boxShadow: `0 10px 40px ${BRAND_COLORS_HEX.primary}30, 0 4px 20px ${BRAND_COLORS_HEX.gray[900]}20`
      }}
    >

      {/* ✅ RESPONSIVE TABLE: Desktop compact, mobiel swipe-vriendelijk */}
      {/* Desktop Table - ✅ SMOOTH: Vinkjes symmetrisch gecentreerd, duidelijke scheiding */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead style={{ backgroundColor: BRAND_COLORS_HEX.gray[50] }}>
            <tr>
              <th 
                className="px-6 py-5 text-left text-sm font-semibold w-2/5"
                style={{ color: BRAND_COLORS_HEX.gray[700] }}
              >
                Feature
              </th>
              <th 
                className="px-6 py-5 text-center text-sm font-semibold text-white w-[30%]" 
                style={{ backgroundColor: BRAND_COLORS_HEX.primary }}
              >
                <div className="flex flex-col items-center justify-center gap-3">
                  {/* ✅ DESKTOP: Grotere afbeelding in header voor Automatische kattenbak */}
                  {firstImage && (
                    <div className="hidden md:block">
                      <ComparisonImage src={firstImage} alt="Automatische kattenbak" size="lg" />
                    </div>
                  )}
                  <span className="font-bold">Automatische kattenbak</span>
                </div>
              </th>
              <th 
                className="px-6 py-5 text-center text-sm font-semibold w-[30%]"
                style={{ 
                  color: BRAND_COLORS_HEX.gray[700],
                  backgroundColor: BRAND_COLORS_HEX.gray[100]
                }}
              >
                <div className="flex flex-col items-center justify-center gap-3">
                  {/* ✅ DESKTOP: Grotere afbeelding in header voor Handmatige kattenbak */}
                  {sixthImage && (
                    <div className="hidden md:block">
                      <ComparisonImage src={sixthImage} alt="Handmatige kattenbak" size="lg" />
                    </div>
                  )}
                  <span className="font-bold">Handmatige kattenbak</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, index) => (
              <tr
                key={index}
                className="transition-all duration-200"
                style={{
                  backgroundColor: row.highlight 
                    ? (index === 0 ? `${BRAND_COLORS_HEX.primary}0B` : `${BRAND_COLORS_HEX.primary}0D`)
                    : (index % 2 === 0 ? BRAND_COLORS_HEX.white : `${BRAND_COLORS_HEX.gray[50]}80`),
                  ...(row.highlight && index === 0 ? { 
                    borderLeft: `4px solid ${BRAND_COLORS_HEX.primary}` 
                  } : {})
                }}
              >
                <td className={cn(
                  'px-6 py-5'
                )}>
                  <div className="flex items-start gap-4">
                    {/* ✅ ICON: Feature icoon (zoals in screenshot) */}
                    {row.icon && (
                      <div className="flex-shrink-0 mt-0.5">
                        <row.icon 
                          className="w-6 h-6" 
                          style={{ color: row.highlight ? BRAND_COLORS_HEX.primary : BRAND_COLORS_HEX.gray[500] }} 
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div 
                        className={cn(
                          'text-base font-bold mb-2',
                          row.highlight ? '' : 'text-gray-900'
                        )}
                        style={row.highlight ? { color: BRAND_COLORS_HEX.primary } : { color: BRAND_COLORS_HEX.gray[900] }}
                      >
                        {row.feature}
                      </div>
                      {/* ✅ BESCHRIJVING: Extra uitleg (zoals in screenshot) */}
                      {row.description && (
                        <p 
                          className="text-sm leading-relaxed"
                          style={{ color: BRAND_COLORS_HEX.gray[600] }}
                        >
                          {row.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                {/* ✅ SYMMETRISCH: Vinkjes perfect gecentreerd onder kolomnamen - HELE KOLOM BLAUW - RONDER EN DUIDELIJKER */}
                <td 
                  className="px-6 py-5"
                  style={{ backgroundColor: BRAND_COLORS_HEX.primary }}
                >
                  <div className="flex items-center justify-center">
                    {renderValue(row.ourProduct, true, true)}
                  </div>
                </td>
                <td 
                  className="px-6 py-5"
                  style={{
                    backgroundColor: index % 2 === 0 
                      ? BRAND_COLORS_HEX.white 
                      : `${BRAND_COLORS_HEX.gray[50]}80`
                  }}
                >
                  <div className="flex items-center justify-center">
                    {renderValue(row.competitor, false)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ MOBIEL: Smooth om-en-om slide (zoals slider) - RESPONSIEF SYMMETRISCH CENTRAAL ZONDER OVERLAP */}
      <div className="md:hidden" ref={containerRef}>
        <div className="relative overflow-hidden mx-auto max-w-sm w-full px-4" style={{ boxSizing: 'border-box' }}>
          <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${visibleIndex * 100}%)` }}>
            {comparisonData.map((row, index) => (
              <div
                key={index}
                className={cn(
                  'flex-shrink-0 w-full'
                )}
                style={{ 
                  boxSizing: 'border-box'
                }}
              >
                <div
                  className={cn(
                    'w-full p-5 rounded-xl border transition-all',
                    row.highlight 
                      ? 'shadow-md' 
                      : 'shadow-sm'
                  )}
                  style={row.highlight 
                    ? { 
                        backgroundColor: `${BRAND_COLORS_HEX.primary}0D`,
                        borderColor: `${BRAND_COLORS_HEX.primary}4D` 
                      } 
                    : { 
                        backgroundColor: BRAND_COLORS_HEX.white,
                        borderColor: BRAND_COLORS_HEX.gray[200]
                      }
                  }
                >
                  <div className="mb-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {/* ✅ ICON: Feature icoon */}
                      {row.icon && (
                        <row.icon 
                          className="w-6 h-6" 
                          style={{ color: row.highlight ? BRAND_COLORS_HEX.primary : BRAND_COLORS_HEX.gray[500] }} 
                        />
                      )}
                      <div 
                        className={cn(
                          'text-sm font-bold leading-tight',
                          row.highlight ? '' : 'text-gray-900'
                        )}
                        style={row.highlight ? { color: BRAND_COLORS_HEX.primary } : { color: BRAND_COLORS_HEX.gray[900] }}
                      >
                        {row.feature}
                      </div>
                    </div>
                    {/* ✅ BESCHRIJVING: Extra uitleg */}
                    {row.description && (
                      <p 
                        className="text-xs text-center leading-relaxed px-3"
                        style={{ color: BRAND_COLORS_HEX.gray[600] }}
                      >
                        {row.description}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div 
                      className="flex items-center justify-between p-4 rounded-lg mx-auto"
                      style={{ 
                        backgroundColor: `${BRAND_COLORS_HEX.primary}1A`,
                        borderColor: `${BRAND_COLORS_HEX.primary}33`,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        maxWidth: '100%'
                      }}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {/* ✅ DRY: Gebruik ComparisonImage helper */}
                        {firstImage && <ComparisonImage src={firstImage} alt="Automatische kattenbak" size="sm" />}
                        <span 
                          className="text-xs font-semibold truncate"
                          style={{ color: BRAND_COLORS_HEX.primary }}
                        >
                          Automatische
                        </span>
                      </div>
                      <div className="flex items-center justify-center flex-shrink-0 ml-2">
                        {renderValue(row.ourProduct, true, false)}
                      </div>
                    </div>
                    <div 
                      className="flex items-center justify-between p-4 rounded-lg mx-auto" 
                      style={{ 
                        maxWidth: '100%',
                        backgroundColor: BRAND_COLORS_HEX.gray[100],
                        borderColor: BRAND_COLORS_HEX.gray[200],
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {/* ✅ DRY: Gebruik ComparisonImage helper */}
                        {sixthImage && <ComparisonImage src={sixthImage} alt="Handmatige kattenbak" size="sm" />}
                        <span 
                          className="text-xs font-semibold truncate"
                          style={{ color: BRAND_COLORS_HEX.gray[700] }}
                        >
                          Handmatige
                        </span>
                      </div>
                      <div className="flex items-center justify-center flex-shrink-0 ml-2">
                        {renderValue(row.competitor, false, false)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* ✅ MOBIEL: Navigation dots - CENTRAAL */}
        <div className="flex justify-center items-center gap-2 mt-5 mb-4 mx-auto">
          {comparisonData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === visibleIndex && 'w-6'
              )}
              style={index === visibleIndex 
                ? { backgroundColor: BRAND_COLORS_HEX.primary } 
                : { backgroundColor: BRAND_COLORS_HEX.gray[300] }
              }
              onMouseEnter={(e) => {
                if (index !== visibleIndex) {
                  e.currentTarget.style.backgroundColor = BRAND_COLORS_HEX.gray[400];
                }
              }}
              onMouseLeave={(e) => {
                if (index !== visibleIndex) {
                  e.currentTarget.style.backgroundColor = BRAND_COLORS_HEX.gray[300];
                }
              }}
              aria-label={`Ga naar slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
