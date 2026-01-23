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

      {/* ✅ CONTENT: Grid layout met tekst links en screenshot rechts direct in achtergrond */}
      <div className={cn(
        'relative z-10',
        'max-w-7xl mx-auto',
        'grid grid-cols-1 lg:grid-cols-2',
        'items-center',
        'gap-4 sm:gap-6 md:gap-12 lg:gap-16', // ✅ COMPACT: Minder gap op mobiel
        'px-4 sm:px-6 md:px-8 lg:px-12',
        'py-2 sm:py-3 md:py-4 lg:py-5' // ✅ ECHT KORTER: Net meer dan waar tekst stopt (py-2/3/4/5)
      )}>
        {/* ✅ LINKS: Tekst over app bediening */}
        <div className="space-y-2 sm:space-y-3 lg:space-y-4 text-center lg:text-left"> {/* ✅ COMPACT: Minder spacing tussen elementen */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
            <Smartphone className="w-5 h-5" style={{ color: BRAND_COLORS_HEX.primary }} />
            <span className="text-sm font-semibold" style={{ color: BRAND_COLORS_HEX.primaryDark }}> {/* ✅ DIK: Semibold zoals stap titels */}
              App Bediening
            </span>
          </div>

          <h2 className={cn(
            'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl', // ✅ 2 REGELS: Kleinere font zodat het op 2 regels past
            'font-semibold', // ✅ DIK: Semibold zoals stap titels
            'tracking-tight',
            'leading-tight',
            'max-w-xl mx-auto lg:mx-0' // ✅ 2 REGELS: Max width zodat het netjes op 2 regels past
          )}
          style={{ color: BRAND_COLORS_HEX.primaryDark }}>
            Bedien je kattenbak
            <br />
            <span style={{ color: BRAND_COLORS_HEX.primary }}>via de app</span>
          </h2>

          <p className={cn(
            'text-base sm:text-lg md:text-xl',
            'font-light',
            'leading-relaxed',
            'max-w-xl mx-auto lg:mx-0'
          )}
          style={{ color: '#4b5563' }}>
            Volledige controle over je kattenbak via de smartphone app. 
            Monitor gebruik, pas instellingen aan en bepaal wanneer de kattenbak automatisch moet schoonmaken.
          </p>

          {/* ✅ FEATURES: App features lijst - alleen echte features */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-3"> {/* ✅ COMPACT: Minder gap en padding */}
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

        {/* ✅ RECHTS: Screenshot direct in achtergrond, geen extra kaart, echt groter */}
        <div className="relative flex items-center justify-center w-full">
          {/* ✅ SCREENSHOT: Direct in achtergrond, geen kaart styling, echt groter */}
          <div className={cn(
            'relative',
            'w-full',
            'max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl', // ✅ ECHT GROTER: Veel groter op alle breakpoints (max-w-md → max-w-4xl)
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
