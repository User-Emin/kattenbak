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
  productImages?: string[]; // ✅ DYNAMISCH: Product afbeeldingen voor afvalbak foto
}

export function ProductAppBanner({ className, productImages = [] }: ProductAppBannerProps) {
  // ✅ DYNAMISCH: Haal 4e afbeelding op (index 3 = afvalbak foto)
  const wasteBinImage = productImages && productImages.length > 3 ? productImages[3] : null;

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
        'flex flex-row items-center', // ✅ MOBIEL: Flex-row voor horizontale layout, items-center voor zelfde lijn
        'lg:grid lg:grid-cols-2 lg:items-start', // ✅ DESKTOP: Grid layout
        'gap-2 sm:gap-3 md:gap-4 lg:gap-12', // ✅ COMPACT: Minimale gap (gap-2 op mobiel)
        'px-2 sm:px-3 md:px-4 lg:px-12', // ✅ COMPACT: Minimale padding (px-2 op mobiel)
        'py-1 sm:py-1.5 md:py-2 lg:py-4' // ✅ COMPACT: Minimale padding (py-1 op mobiel)
      )}>
        {/* ✅ LINKS: Tekst over app bediening - ✅ MOBIEL: Compact, zelfde lijn als telefoon */}
        <div className="flex-1 min-w-0 text-left"> {/* ✅ MOBIEL: Geen space-y, direct compact */}
          {/* ✅ DESKTOP: Afvalbak foto boven titel */}
          {wasteBinImage && (
            <div className="hidden lg:block mb-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg">
                <Image
                  src={wasteBinImage}
                  alt="10.5L Afvalbak"
                  fill
                  className="object-cover"
                  sizes="96px"
                  quality={90}
                  loading="lazy"
                  unoptimized={wasteBinImage.startsWith('/uploads/')}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </div>
            </div>
          )}

          {/* ✅ MOBIEL: Verborgen badge, alleen op desktop */}
          <div className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-2 lg:mb-0">
            <Smartphone className="w-5 h-5" style={{ color: BRAND_COLORS_HEX.primary }} />
            <span className="text-sm font-semibold" style={{ color: BRAND_COLORS_HEX.primaryDark }}>
              App Bediening
            </span>
          </div>

          {/* ✅ MOBIEL: Afvalbak foto in strook (links van tekst) */}
          {wasteBinImage && (
            <div className="lg:hidden flex items-center gap-2 mb-2">
              <div className="relative w-12 h-12 rounded overflow-hidden border border-white/30 shadow-sm flex-shrink-0">
                <Image
                  src={wasteBinImage}
                  alt="10.5L Afvalbak"
                  fill
                  className="object-cover"
                  sizes="48px"
                  quality={90}
                  loading="lazy"
                  unoptimized={wasteBinImage.startsWith('/uploads/')}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </div>
            </div>
          )}

          <h2 className={cn(
            'text-sm sm:text-base md:text-lg lg:text-4xl xl:text-5xl', // ✅ COMPACT: text-sm op mobiel (14px)
            'font-semibold',
            'tracking-tight',
            'leading-tight',
            'lg:max-w-xl lg:mb-2' // ✅ DESKTOP: Max width en margin
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

        {/* ✅ RECHTS: Screenshot direct in achtergrond - ✅ ECHT GROOT: Veel groter op alle breakpoints */}
        <div className="relative flex items-center justify-center flex-shrink-0"> {/* ✅ MOBIEL: items-center voor zelfde baseline */}
          {/* ✅ SCREENSHOT: Direct in achtergrond, geen kaart styling, echt groot */}
          <div className={cn(
            'relative',
            'w-40 h-auto sm:w-52 md:w-64 lg:w-full', // ✅ ECHT GROOT: w-40 (160px) op mobiel, veel groter
            'lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl', // ✅ ECHT GROOT: Veel groter op desktop (max-w-3xl → max-w-5xl)
            'aspect-[9/19.5]' // ✅ OPTIMAAL: Telefoon aspect ratio
          )}>
            {/* ✅ ECHTE SCREENSHOT: Direct in achtergrond, geen rounded/shadow/container */}
            <Image
              src="/images/app-screenshot-optimized.webp" // ✅ ECHT: Screenshot uit bijlage (geoptimaliseerd)
              alt="App bediening kattenbak"
              fill
              className="object-contain" // ✅ OPTIMAAL: Behoud aspect ratio, volledig zichtbaar
              sizes="(max-width: 640px) 160px, (max-width: 768px) 208px, (max-width: 1024px) 50vw, 1400px" // ✅ ECHT GROOT: Veel groter (1400px ipv 1200px)
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
