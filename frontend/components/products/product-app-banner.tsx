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
      'my-8 sm:my-10 md:my-12 lg:my-16',
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

      {/* ✅ CONTENT: Grid layout met tekst links en telefoon rechts */}
      <div className={cn(
        'relative z-10',
        'max-w-7xl mx-auto',
        'grid grid-cols-1 lg:grid-cols-2',
        'items-center',
        'gap-8 sm:gap-12 md:gap-16 lg:gap-20',
        'px-4 sm:px-6 md:px-8 lg:px-12',
        'py-12 sm:py-16 md:py-20 lg:py-24'
      )}>
        {/* ✅ LINKS: Tekst over app bediening */}
        <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
            <Smartphone className="w-5 h-5" style={{ color: BRAND_COLORS_HEX.primary }} />
            <span className="text-sm font-semibold" style={{ color: BRAND_COLORS_HEX.primaryDark }}> {/* ✅ DIK: Semibold zoals stap titels */}
              App Bediening
            </span>
          </div>

          <h2 className={cn(
            'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
            'font-semibold', // ✅ DIK: Semibold zoals stap titels
            'tracking-tight',
            'leading-tight'
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
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4">
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

        {/* ✅ RECHTS: Telefoon met echte screenshot in optimale grootte */}
        <div className="relative flex items-center justify-center">
          {/* ✅ TELEFOON: Mockup met echte screenshot */}
          <div className="relative w-full max-w-sm">
            {/* Telefoon frame */}
            <div className={cn(
              'relative',
              'bg-gray-900',
              'rounded-[3rem]',
              'p-3 sm:p-4',
              'shadow-2xl',
              'border-8 border-gray-800'
            )}>
              {/* Screen met echte screenshot */}
              <div className={cn(
                'relative',
                'bg-white',
                'rounded-[2.5rem]',
                'overflow-hidden',
                'aspect-[9/19.5]',
                'min-h-[400px] sm:min-h-[500px] md:min-h-[600px]' // ✅ OPTIMAAL: Grotere hoogte voor screenshot
              )}>
                {/* ✅ ECHTE SCREENSHOT: App bediening screenshot uit bijlage (geoptimaliseerd) */}
                <Image
                  src="/images/app-screenshot-optimized.webp" // ✅ ECHT: Screenshot uit bijlage (geoptimaliseerd)
                  alt="App bediening kattenbak"
                  fill
                  className="object-contain" // ✅ OPTIMAAL: Behoud aspect ratio, volledig zichtbaar
                  sizes="(max-width: 768px) 280px, (max-width: 1024px) 320px, 384px" // ✅ OPTIMAAL: Responsive sizes
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

                {/* ✅ NOTCH: Telefoon notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10"></div>
              </div>
            </div>

            {/* ✅ DECORATIE: Glow effect */}
            <div 
              className="absolute -inset-4 rounded-[3rem] opacity-20 blur-3xl -z-10"
              style={{ backgroundColor: BRAND_COLORS_HEX.primary }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
