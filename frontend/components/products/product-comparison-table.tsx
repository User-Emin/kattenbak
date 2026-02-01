"use client";

import { useState, useEffect, useRef } from "react";
import { Check, X, Sparkles, Wind, Shovel, Clock, Smartphone, Coins } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND_COLORS_HEX } from "@/lib/color-config";
import { PRODUCT_PAGE_CONFIG } from "@/lib/product-page-config";

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

// ✅ SLIMME VARIABELEN: Desktop vergelijkingstabel configuratie
const DESKTOP_COMPARISON_CONFIG = {
  table: {
    cellPadding: 'px-6 py-5',
    headerTextSize: 'text-sm',
    featureColWidth: 'w-2/5',
    productColWidth: 'w-[30%]',
  },
  feature: {
    iconSize: 'w-6 h-6',
    titleSize: 'text-base',
    titleWeight: 'font-bold',
    titleMargin: 'mb-2',
    descriptionSize: 'text-sm',
    descriptionLineHeight: 'leading-relaxed',
    gap: 'gap-4',
  },
  header: {
    imageGap: 'gap-3',
  },
  checkmark: {
    desktop: {
      size: 'w-10 h-10',
      iconSize: 'w-6 h-6',
    },
    mobile: {
      size: 'w-6 h-6 sm:w-7 sm:h-7',
      iconSize: 'w-4 h-4 sm:w-4.5 sm:h-4.5',
    },
  },
  cross: {
    size: 'w-6 h-6 sm:w-7 sm:h-7',
    iconSize: 'w-4 h-4 sm:w-4.5 sm:h-4.5',
  },
  text: {
    small: 'text-xs sm:text-sm',
  },
} as const;

// ✅ SLIMME VARIABELEN: Mobiele vergelijkingstabel configuratie - OPTIMAAL RESPONSIVE & LEESBAAR
// ✅ DRY: Volledige aansluiting op PRODUCT_PAGE_CONFIG - geen duplicaten, geen hardcode, geen redundantie
const MOBILE_COMPARISON_CONFIG = {
  // Container configuratie - ✅ FIX: Cards blijven altijd zichtbaar, geen verdwijnen
  container: {
    maxWidth: 'max-w-sm',
    slidePadding: '0.5rem', // 8px - optimaal voor zichtbaarheid zonder overlap
    // ✅ FIX: overflow-visible op outer container, overflow-hidden alleen op inner voor slide effect
    overflow: 'overflow-visible', // ✅ FIX: Cards verdwijnen niet meer
  },
  // Card configuratie
  card: {
    padding: 'p-2.5', // 10px - compact maar leesbaar
    borderRadius: 'rounded-xl',
    spacing: {
      header: 'mb-2', // Spacing tussen header en stroken
      stroken: 'space-y-1.5', // Spacing tussen stroken
    },
  },
  // Header configuratie (feature titel + beschrijving)
  header: {
    spacing: {
      container: 'mb-2',
      iconTitle: 'gap-1.5 mb-1.5', // Gap tussen icon en titel, margin bottom
      description: 'mt-1.5 px-1', // Margin top en padding voor beschrijving
    },
    icon: {
      size: 'w-4 h-4', // 16px - compact
    },
    title: {
      fontSize: 'text-sm', // 14px - optimaal leesbaar
      fontWeight: 'font-bold',
      lineHeight: 'leading-tight',
    },
    description: {
      fontSize: 'text-xs', // 12px - compact
      lineHeight: 'leading-snug',
    },
  },
  // Strook configuratie (Automatische/Handmatige rijen) - OPTIMAAL COMPACT & LEESBAAR
  strook: {
    padding: 'p-1.5', // 6px - compact maar nog leesbaar
    borderRadius: 'rounded-lg',
    spacing: {
      container: 'gap-1.5', // Gap tussen image en tekst
      checkmark: 'ml-0.5', // Margin left voor checkmark
    },
    label: {
      fontSize: 'text-xs', // 12px - compact maar leesbaar
      fontWeight: 'font-semibold',
    },
    image: {
      size: 'sm' as const, // ComparisonImage size (w-12 h-12)
    },
  },
  // Navigation dots configuratie - ✅ DRY: Aansluiting op DESIGN_SYSTEM
  navigation: {
    container: 'flex justify-center items-center gap-2 mt-5 mb-4 mx-auto',
    dot: {
      base: 'w-2 h-2 rounded-full transition-all duration-300', // ✅ SMOOTH: Transition duration
      active: 'w-6',
    },
  },
} as const;

// ✅ DRY: Image component helper - Grotere afbeeldingen zoals in screenshot
const ComparisonImage = ({ src, alt, size = 'md' }: { src: string; alt: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-12 h-12', // ✅ COMPACTER: 48px ipv 64px voor mobiel - optimaal voor stroken
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
        unoptimized={src.startsWith('/uploads/') || src.includes('/uploads/')}
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
        // ✅ DRY: Gebruik BRAND_COLORS_HEX + SLIMME VARIABELEN - RONDER EN DUIDELIJKER IN BLAUWE KOLOM (DESKTOP)
        <div 
          className={cn(
            'rounded-full flex items-center justify-center flex-shrink-0',
            isDesktop 
              ? DESKTOP_COMPARISON_CONFIG.checkmark.desktop.size 
              : DESKTOP_COMPARISON_CONFIG.checkmark.mobile.size
          )}
          style={{ 
            backgroundColor: isDesktop ? BRAND_COLORS_HEX.white : '#129DD8',
            border: isDesktop ? `3px solid ${BRAND_COLORS_HEX.white}` : 'none',
            boxShadow: isDesktop ? `0 2px 8px ${BRAND_COLORS_HEX.gray[900]}40` : 'none'
          }}
        >
          <Check 
            className={cn(
              isDesktop 
                ? DESKTOP_COMPARISON_CONFIG.checkmark.desktop.iconSize 
                : DESKTOP_COMPARISON_CONFIG.checkmark.mobile.iconSize
            )}
            style={{ 
              color: isDesktop ? '#129DD8' : BRAND_COLORS_HEX.white,
              strokeWidth: isDesktop ? 3 : 2.5
            }} 
          />
        </div>
      ) : (
        // ✅ COMPACT KRUISJE: Subtieler kruisje - DRY via BRAND_COLORS_HEX + SLIMME VARIABELEN
        <div 
          className={cn(
            DESKTOP_COMPARISON_CONFIG.cross.size,
            'rounded-full bg-white border flex items-center justify-center flex-shrink-0'
          )}
          style={{ borderColor: BRAND_COLORS_HEX.gray[300] }}
        >
          <X 
            className={DESKTOP_COMPARISON_CONFIG.cross.iconSize} 
            strokeWidth={2.5}
            style={{ color: BRAND_COLORS_HEX.gray[400] }}
          />
        </div>
      );
    }
    return (
      <span 
        className={cn(DESKTOP_COMPARISON_CONFIG.text.small, 'font-medium')}
        style={{ color: BRAND_COLORS_HEX.gray[900] }}
      >
        {value}
      </span>
    );
  };

  return (
    <div 
      className="w-full bg-white rounded-xl shadow-2xl"
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
                className={cn(
                  DESKTOP_COMPARISON_CONFIG.table.cellPadding,
                  'text-left',
                  DESKTOP_COMPARISON_CONFIG.table.headerTextSize,
                  'font-semibold',
                  DESKTOP_COMPARISON_CONFIG.table.featureColWidth
                )}
                style={{ color: BRAND_COLORS_HEX.gray[700] }}
              >
                Feature
              </th>
              <th 
                className={cn(
                  DESKTOP_COMPARISON_CONFIG.table.cellPadding,
                  'text-center',
                  DESKTOP_COMPARISON_CONFIG.table.headerTextSize,
                  'font-semibold text-white',
                  DESKTOP_COMPARISON_CONFIG.table.productColWidth
                )} 
                style={{ backgroundColor: BRAND_COLORS_HEX.primary }}
              >
                <div className={cn('flex flex-col items-center justify-center', DESKTOP_COMPARISON_CONFIG.header.imageGap)}>
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
                className={cn(
                  DESKTOP_COMPARISON_CONFIG.table.cellPadding,
                  'text-center',
                  DESKTOP_COMPARISON_CONFIG.table.headerTextSize,
                  'font-semibold',
                  DESKTOP_COMPARISON_CONFIG.table.productColWidth
                )}
                style={{ 
                  color: BRAND_COLORS_HEX.gray[700],
                  backgroundColor: BRAND_COLORS_HEX.gray[100]
                }}
              >
                <div className={cn('flex flex-col items-center justify-center', DESKTOP_COMPARISON_CONFIG.header.imageGap)}>
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
                <td className={DESKTOP_COMPARISON_CONFIG.table.cellPadding}>
                  <div className={cn('flex items-start', DESKTOP_COMPARISON_CONFIG.feature.gap)}>
                    {/* ✅ ICON: Feature icoon (zoals in screenshot) - SLIMME VARIABELEN */}
                    {row.icon && (
                      <div className="flex-shrink-0 mt-0.5">
                        <row.icon 
                          className={DESKTOP_COMPARISON_CONFIG.feature.iconSize} 
                          style={{ color: row.highlight ? BRAND_COLORS_HEX.primary : BRAND_COLORS_HEX.gray[500] }} 
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div 
                        className={cn(
                          DESKTOP_COMPARISON_CONFIG.feature.titleSize,
                          DESKTOP_COMPARISON_CONFIG.feature.titleWeight,
                          DESKTOP_COMPARISON_CONFIG.feature.titleMargin,
                          row.highlight ? '' : 'text-gray-900'
                        )}
                        style={row.highlight ? { color: BRAND_COLORS_HEX.primary } : { color: BRAND_COLORS_HEX.gray[900] }}
                      >
                        {row.feature}
                      </div>
                      {/* ✅ BESCHRIJVING: Extra uitleg (zoals in screenshot) - SLIMME VARIABELEN */}
                      {row.description && (
                        <p 
                          className={cn(
                            DESKTOP_COMPARISON_CONFIG.feature.descriptionSize,
                            DESKTOP_COMPARISON_CONFIG.feature.descriptionLineHeight
                          )}
                          style={{ color: BRAND_COLORS_HEX.gray[600] }}
                        >
                          {row.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                {/* ✅ SYMMETRISCH: Vinkjes perfect gecentreerd onder kolomnamen - HELE KOLOM BLAUW - RONDER EN DUIDELIJKER - SLIMME VARIABELEN */}
                <td 
                  className={DESKTOP_COMPARISON_CONFIG.table.cellPadding}
                  style={{ backgroundColor: BRAND_COLORS_HEX.primary }}
                >
                  <div className="flex items-center justify-center">
                    {renderValue(row.ourProduct, true, true)}
                  </div>
                </td>
                <td 
                  className={DESKTOP_COMPARISON_CONFIG.table.cellPadding}
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

      {/* ✅ MOBIEL: Smooth om-en-om slide - SLIMME VARIABELEN SYSTEEM - ALTIJD ZICHTBAAR - DRY via PRODUCT_PAGE_CONFIG */}
      <div className={cn('md:hidden', PRODUCT_PAGE_CONFIG.layout.containerPaddingMobile)} ref={containerRef}>
        {/* ✅ FIX: Outer wrapper - cards blijven zichtbaar, geen overflow-hidden hier */}
        <div 
          className={cn(
            'relative mx-auto w-full',
            MOBILE_COMPARISON_CONFIG.container.maxWidth
          )} 
          style={{ boxSizing: 'border-box' }}
        >
          {/* ✅ FIX: Inner container met overflow-hidden voor slide effect - maar cards blijven binnen viewport */}
          <div 
            className="relative overflow-hidden w-full" 
            style={{ 
              boxSizing: 'border-box',
              width: '100%',
              minWidth: '100%',
              // ✅ FIX: Zorg dat container altijd volledige breedte heeft en cards niet verdwijnen
              maxWidth: '100%'
            }}
          >
            <div 
              className="flex transition-transform duration-700 ease-out" 
              style={{ 
                transform: `translateX(-${visibleIndex * 100}%)`,
                width: `${comparisonData.length * 100}%`,
                boxSizing: 'border-box',
                // ✅ FIX: Zorg dat flex container correcte breedte heeft
                minWidth: `${comparisonData.length * 100}%`,
                // ✅ FIX: Zorg dat cards altijd binnen viewport blijven
                willChange: 'transform'
              }}
            >
              {comparisonData.map((row, index) => {
                // ✅ DRY: Bereken card width eenmalig
                const cardWidthPercent = 100 / comparisonData.length;
                return (
                  <div
                    key={index}
                    className="flex-shrink-0"
                    style={{ 
                      width: `${cardWidthPercent}%`,
                      minWidth: `${cardWidthPercent}%`, // ✅ FIX: Min width voor consistentie
                      maxWidth: `${cardWidthPercent}%`, // ✅ FIX: Max width voorkomt overflow
                      boxSizing: 'border-box',
                      paddingLeft: MOBILE_COMPARISON_CONFIG.container.slidePadding,
                      paddingRight: MOBILE_COMPARISON_CONFIG.container.slidePadding,
                      // ✅ FIX: Zorg dat card altijd zichtbaar blijft
                      flexBasis: `${cardWidthPercent}%`
                    }}
                  >
                <div
                  className={cn(
                    'w-full border transition-all',
                    MOBILE_COMPARISON_CONFIG.card.padding,
                    MOBILE_COMPARISON_CONFIG.card.borderRadius,
                    row.highlight 
                      ? 'shadow-md' 
                      : 'shadow-sm'
                  )}
                  style={{ 
                    ...(row.highlight 
                      ? { 
                          backgroundColor: `${BRAND_COLORS_HEX.primary}0D`,
                          borderColor: `${BRAND_COLORS_HEX.primary}4D` 
                        } 
                      : { 
                          backgroundColor: BRAND_COLORS_HEX.white,
                          borderColor: BRAND_COLORS_HEX.gray[200]
                        }),
                    boxSizing: 'border-box'
                  }}
                >
                  {/* ✅ HEADER: Feature titel + beschrijving */}
                  <div className={cn('text-center', MOBILE_COMPARISON_CONFIG.header.spacing.container)}>
                    <div className={cn(
                      'flex items-center justify-center',
                      MOBILE_COMPARISON_CONFIG.header.spacing.iconTitle
                    )}>
                      {row.icon && (
                        <row.icon 
                          className={cn('flex-shrink-0', MOBILE_COMPARISON_CONFIG.header.icon.size)} 
                          style={{ color: row.highlight ? BRAND_COLORS_HEX.primary : BRAND_COLORS_HEX.gray[500] }} 
                        />
                      )}
                      <div 
                        className={cn(
                          MOBILE_COMPARISON_CONFIG.header.title.fontSize,
                          MOBILE_COMPARISON_CONFIG.header.title.fontWeight,
                          MOBILE_COMPARISON_CONFIG.header.title.lineHeight,
                          'text-center'
                        )}
                        style={row.highlight ? { color: BRAND_COLORS_HEX.primary } : { color: BRAND_COLORS_HEX.gray[900] }}
                      >
                        {row.feature}
                      </div>
                    </div>
                    {row.description && (
                      <p 
                        className={cn(
                          MOBILE_COMPARISON_CONFIG.header.description.fontSize,
                          MOBILE_COMPARISON_CONFIG.header.description.lineHeight,
                          'text-center',
                          MOBILE_COMPARISON_CONFIG.header.spacing.description
                        )}
                        style={{ color: BRAND_COLORS_HEX.gray[600] }}
                      >
                        {row.description}
                      </p>
                    )}
                  </div>
                  
                  {/* ✅ STROKEN: Automatische + Handmatige */}
                  <div className={cn('w-full', MOBILE_COMPARISON_CONFIG.card.spacing.stroken)}>
                    {/* Automatische strook */}
                    <div 
                      className={cn(
                        'flex items-center justify-between w-full',
                        MOBILE_COMPARISON_CONFIG.strook.borderRadius,
                        MOBILE_COMPARISON_CONFIG.strook.padding
                      )}
                      style={{ 
                        backgroundColor: `${BRAND_COLORS_HEX.primary}1A`,
                        borderColor: `${BRAND_COLORS_HEX.primary}33`,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div className={cn(
                        'flex items-center flex-1 min-w-0 overflow-hidden',
                        MOBILE_COMPARISON_CONFIG.strook.spacing.container
                      )}>
                        {firstImage && (
                          <div className="flex-shrink-0">
                            <ComparisonImage 
                              src={firstImage} 
                              alt="Automatische kattenbak" 
                              size={MOBILE_COMPARISON_CONFIG.strook.image.size} 
                            />
                          </div>
                        )}
                        <span 
                          className={cn(
                            MOBILE_COMPARISON_CONFIG.strook.label.fontSize,
                            MOBILE_COMPARISON_CONFIG.strook.label.fontWeight,
                            'truncate whitespace-nowrap'
                          )}
                          style={{ color: BRAND_COLORS_HEX.primary }}
                        >
                          Automatische
                        </span>
                      </div>
                      <div className={cn(
                        'flex items-center justify-center flex-shrink-0',
                        MOBILE_COMPARISON_CONFIG.strook.spacing.checkmark
                      )}>
                        {renderValue(row.ourProduct, true, false)}
                      </div>
                    </div>
                    
                    {/* Handmatige strook */}
                    <div 
                      className={cn(
                        'flex items-center justify-between w-full',
                        MOBILE_COMPARISON_CONFIG.strook.borderRadius,
                        MOBILE_COMPARISON_CONFIG.strook.padding
                      )} 
                      style={{ 
                        backgroundColor: BRAND_COLORS_HEX.gray[100],
                        borderColor: BRAND_COLORS_HEX.gray[200],
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        boxSizing: 'border-box'
                      }}
                    >
                      <div className={cn(
                        'flex items-center flex-1 min-w-0 overflow-hidden',
                        MOBILE_COMPARISON_CONFIG.strook.spacing.container
                      )}>
                        {sixthImage && (
                          <div className="flex-shrink-0">
                            <ComparisonImage 
                              src={sixthImage} 
                              alt="Handmatige kattenbak" 
                              size={MOBILE_COMPARISON_CONFIG.strook.image.size} 
                            />
                          </div>
                        )}
                        <span 
                          className={cn(
                            MOBILE_COMPARISON_CONFIG.strook.label.fontSize,
                            MOBILE_COMPARISON_CONFIG.strook.label.fontWeight,
                            'truncate whitespace-nowrap'
                          )}
                          style={{ color: BRAND_COLORS_HEX.gray[700] }}
                        >
                          Handmatige
                        </span>
                      </div>
                      <div className={cn(
                        'flex items-center justify-center flex-shrink-0',
                        MOBILE_COMPARISON_CONFIG.strook.spacing.checkmark
                      )}>
                        {renderValue(row.competitor, false, false)}
                      </div>
                    </div>
                  </div>
                </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* ✅ MOBIEL: Navigation dots - CENTRAAL - SLIMME VARIABELEN - DRY via PRODUCT_PAGE_CONFIG */}
        <div className={MOBILE_COMPARISON_CONFIG.navigation.container}>
          {comparisonData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                MOBILE_COMPARISON_CONFIG.navigation.dot.base,
                index === visibleIndex && MOBILE_COMPARISON_CONFIG.navigation.dot.active
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
