/**
 * PRODUCT APP BANNER - Edge-to-edge banner met app bediening
 * ✅ DRY: Perfect aansluitend op systeem
 * ✅ Links: Tekst over app bediening
 * ✅ Rechts: Telefoon met apps achtergrondkleur
 * ✅ Grafisch design met apps
 */

'use client';

import { Smartphone, Download, Settings, BarChart3 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { BRAND_COLORS_HEX } from '@/lib/color-config';

interface ProductAppBannerProps {
  className?: string;
}

export function ProductAppBanner({ className }: ProductAppBannerProps) {
  // ✅ APPS: App iconen voor grafisch design - alleen echte features
  const appIcons = [
    { icon: Settings, color: BRAND_COLORS_HEX.primary },
    { icon: BarChart3, color: BRAND_COLORS_HEX.primaryLight },
    { icon: Smartphone, color: BRAND_COLORS_HEX.primaryDark },
    { icon: Download, color: BRAND_COLORS_HEX.primary },
  ];

  return (
    <div className={cn(
      'relative w-full',
      'overflow-hidden',
      'my-4 sm:my-6 md:my-8 lg:my-10', // ✅ COMPACT: Minder margin voor compacte banner
      className
    )}
    style={{
      background: `linear-gradient(135deg, ${BRAND_COLORS_HEX.primaryLight}10 0%, ${BRAND_COLORS_HEX.primary}15 50%, ${BRAND_COLORS_HEX.primaryDark}10 100%)`, // ✅ BLAUW: Webshop blauw gradient
    }}>
      {/* ✅ GRAFISCH DESIGN: App iconen als achtergrond decoratie */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="grid grid-cols-4 gap-8 p-8">
          {appIcons.map((app, index) => {
            const IconComponent = app.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-center"
                style={{
                  transform: `rotate(${index * 15}deg) scale(${0.8 + index * 0.1})`,
                }}
              >
                <IconComponent className="w-16 h-16" style={{ color: app.color }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ CONTENT: Flex layout op mobiel (horizontaal), grid op desktop */}
      <div className={cn(
        'relative z-10',
        'max-w-7xl mx-auto',
        'flex flex-row items-center', // ✅ MOBIEL: Flex-row voor horizontale layout
        'lg:grid lg:grid-cols-2', // ✅ DESKTOP: Grid layout
        'gap-2 sm:gap-3 md:gap-6 lg:gap-12', // ✅ COMPACT: Minder gap (gap-2 op mobiel)
        'px-2 sm:px-4 md:px-6 lg:px-12', // ✅ COMPACT: Minder padding (px-2 op mobiel)
        'py-1 sm:py-2 md:py-3 lg:py-4' // ✅ COMPACT: Minimale padding (py-1 op mobiel)
      )}>
        {/* ✅ LINKS: Tekst over app bediening - ✅ MOBIEL: Compact, zelfde lijn als telefoon */}
        <div className="flex-1 min-w-0 space-y-1 sm:space-y-2 lg:space-y-4 text-left"> {/* ✅ MOBIEL: text-left, compact spacing */}
          {/* ✅ MOBIEL: Verborgen badge, alleen op desktop */}
          <div className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
            <Smartphone className="w-5 h-5" style={{ color: BRAND_COLORS_HEX.primary }} />
            <span className="text-sm font-semibold" style={{ color: BRAND_COLORS_HEX.primaryDark }}>
              App Bediening
            </span>
          </div>

          <h2 className={cn(
            'text-lg sm:text-xl md:text-2xl lg:text-4xl xl:text-5xl', // ✅ COMPACT: Kleinere fonts op mobiel (text-lg ipv text-2xl)
            'font-semibold',
            'tracking-tight',
            'leading-tight',
            'lg:max-w-xl' // ✅ DESKTOP: Max width alleen op desktop
          )}
          style={{ color: BRAND_COLORS_HEX.primaryDark }}>
            <span className="lg:hidden">App</span> {/* ✅ MOBIEL: Korte versie */}
            <span className="hidden lg:inline">
              Bedien je kattenbak
              <br />
              <span style={{ color: BRAND_COLORS_HEX.primary }}>via de app</span>
            </span>
          </h2>

          {/* ✅ MOBIEL: Verborgen beschrijving, alleen op desktop */}
          <p className={cn(
            'hidden lg:block',
            'text-base sm:text-lg md:text-xl',
            'font-light',
            'leading-relaxed',
            'max-w-xl'
          )}
          style={{ color: '#4b5563' }}>
            Volledige controle over je kattenbak via de smartphone app. 
            Monitor gebruik, pas instellingen aan en bepaal wanneer de kattenbak automatisch moet schoonmaken.
          </p>

          {/* ✅ MOBIEL: Verborgen features, alleen op desktop */}
          <div className="hidden lg:flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm">
                <Settings className="w-5 h-5" style={{ color: BRAND_COLORS_HEX.primary }} />
              </div>
              <span className="text-sm sm:text-base font-medium" style={{ color: BRAND_COLORS_HEX.primaryDark }}>
                Instellingen aanpassen
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm">
                <BarChart3 className="w-5 h-5" style={{ color: BRAND_COLORS_HEX.primary }} />
              </div>
              <span className="text-sm sm:text-base font-medium" style={{ color: BRAND_COLORS_HEX.primaryDark }}>
                Gebruik monitoren
              </span>
            </div>
          </div>
        </div>

        {/* ✅ RECHTS: Screenshot direct in achtergrond - ✅ MOBIEL: Zelfde lijn als tekst */}
        <div className="relative flex items-center justify-center flex-shrink-0"> {/* ✅ MOBIEL: items-center voor zelfde lijn */}
          {/* ✅ SCREENSHOT: Direct in achtergrond, geen kaart styling, echt groter */}
          <div className={cn(
            'relative',
            'w-24 h-auto sm:w-32 md:w-40 lg:w-full', // ✅ MOBIEL: Compact (w-24 = 96px), desktop volledig
            'lg:max-w-md xl:max-w-lg 2xl:max-w-xl', // ✅ DESKTOP: Groter op desktop
            'aspect-[9/19.5]' // ✅ OPTIMAAL: Telefoon aspect ratio
          )}>
            {/* ✅ ECHTE SCREENSHOT: Direct in achtergrond, geen rounded/shadow/container */}
            <Image
              src="/images/app-screenshot-optimized.webp" // ✅ ECHT: Screenshot uit bijlage (geoptimaliseerd)
              alt="App bediening kattenbak"
              fill
              className="object-contain" // ✅ OPTIMAAL: Behoud aspect ratio, volledig zichtbaar
              sizes="(max-width: 640px) 95vw, (max-width: 768px) 90vw, (max-width: 1024px) 50vw, 1000px" // ✅ ECHT GROTER: Veel groter op alle breakpoints (1000px ipv 800px)
              quality={90} // ✅ OPTIMAAL: Hoge kwaliteit voor screenshot
              priority={false}
              loading="lazy"
              onError={(e) => {
                // ✅ FALLBACK: Als geoptimaliseerde screenshot niet bestaat, gebruik bestaande
                const target = e.target as HTMLImageElement;
                if (target && !target.src.includes('app-bediening-smart')) {
                  target.src = '/images/app-bediening-smart.webp';
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
