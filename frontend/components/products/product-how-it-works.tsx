/**
 * PRODUCT HOW IT WORKS SECTION
 * ✅ DRY: Perfect aansluitend op systeem
 * ✅ Realistische stappen gebaseerd op echte product info
 * ✅ Custom symbolen voor grit etc. met webshop blauw
 * ✅ Compacte desktop layout met passende lettergrootte
 */

'use client';

import { 
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRODUCT_PAGE_CONFIG } from '@/lib/product-page-config';
import { BRAND_COLORS_HEX } from '@/lib/color-config';

// ✅ CUSTOM SYMBOLEN: Custom SVG icons voor grit, stekker, etc.
const PlugIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4" />
  </svg>
);

const GritIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    <circle cx="16" cy="8" r="1.5" fill="currentColor" />
    <circle cx="8" cy="16" r="1.5" fill="currentColor" />
    <circle cx="16" cy="16" r="1.5" fill="currentColor" />
  </svg>
);

const TrashBagIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11h8" />
  </svg>
);

const PowerIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    <circle cx="12" cy="12" r="3" strokeWidth={2} />
  </svg>
);

const TimerIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface HowItWorksStep {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  number: number;
}

interface ProductHowItWorksProps {
  className?: string;
}

export function ProductHowItWorks({ className }: ProductHowItWorksProps) {
  const CONFIG = PRODUCT_PAGE_CONFIG;
  
  // ✅ ECHTE INFO: Stappen gebaseerd op echte product functionaliteit
  const steps: HowItWorksStep[] = [
    {
      icon: PlugIcon,
      title: 'Stekker erin',
      description: 'Plaats de kattenbak op een vlakke, stevige ondergrond. Sluit de stekker aan op een stopcontact.',
      number: 1,
    },
    {
      icon: GritIcon,
      title: 'Grit toevoegen',
      description: 'Vul de kattenbak met klonterend grit tot net onder de MAX lijn (ongeveer 8-10 kg).',
      number: 2,
    },
    {
      icon: TrashBagIcon,
      title: 'Afvalzak plaatsen',
      description: 'Plaats de afvalzak over de afvalbak heen voor optimale werking. De zak moet goed aansluiten.',
      number: 3,
    },
    {
      icon: PowerIcon,
      title: 'Aanzetten',
      description: 'Druk op de Power knop. Een blauw licht geeft aan dat de kattenbak klaar is voor gebruik.',
      number: 4,
    },
    {
      icon: TimerIcon,
      title: 'Timer instellen',
      description: 'Bepaal wanneer na de wcsessie de kattenbak automatisch moet schoonmaken. Stel de timer in via de app of op de kattenbak zelf.',
      number: 5,
    },
    {
      icon: CheckIcon,
      title: 'Klaar voor gebruik',
      description: 'De kattenbak reinigt automatisch na elk gebruik volgens je instellingen. De afvalzak hoeft slechts 1x per week geleegd te worden.',
      number: 6,
    },
  ];

  return (
    <div className={cn(
      CONFIG.layout.maxWidth,
      'mx-auto',
      CONFIG.layout.containerPadding,
      'py-8 sm:py-12 md:py-14 lg:py-16', // ✅ COMPACT: Minder padding op desktop
      className
    )}>
      {/* ✅ MOOI DESIGN: Titel met webshop blauw achtergrond */}
      <div className={cn(
        'text-center mb-8 sm:mb-10 md:mb-12', // ✅ COMPACT: Minder margin op desktop
        'rounded-xl sm:rounded-2xl',
        'px-4 sm:px-6 md:px-8 lg:px-10', // ✅ COMPACT: Minder padding op desktop
        'py-6 sm:py-8 md:py-10' // ✅ COMPACT: Minder padding op desktop
      )}
      style={{
        background: `linear-gradient(135deg, ${BRAND_COLORS_HEX.primaryLight}15 0%, ${BRAND_COLORS_HEX.primary}20 100%)`, // ✅ BLAUW: Webshop blauw met transparantie
        border: `1px solid ${BRAND_COLORS_HEX.primary}30`, // ✅ BLAUW: Subtiele border
      }}>
        <h2 className={cn(
          'text-2xl sm:text-3xl md:text-4xl lg:text-5xl', // ✅ COMPACT: Kleinere lettergrootte op desktop
          'font-light',
          'mb-3 sm:mb-4 md:mb-5', // ✅ COMPACT: Minder margin
          'tracking-tight'
        )}
        style={{ color: BRAND_COLORS_HEX.primary }}> {/* ✅ BLAUW: Webshop blauw */}
          Hoe werkt het?
        </h2>
        <p className={cn(
          'text-sm sm:text-base md:text-lg', // ✅ COMPACT: Kleinere lettergrootte op desktop
          'max-w-2xl mx-auto',
          'font-medium' // ✅ LEVENDIG: Medium weight voor duidelijkheid
        )}
        style={{ color: BRAND_COLORS_HEX.primaryDark }}> {/* ✅ BLAUW: Donkerder blauw */}
          In 6 eenvoudige stappen klaar voor gebruik
        </p>
      </div>

      {/* ✅ STAPPEN: Compacte desktop layout met webshop blauw */}
      <div className="space-y-4 sm:space-y-5 md:space-y-6"> {/* ✅ COMPACT: Minder spacing op desktop */}
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.number} className="relative">
              {/* ✅ STAP: Compacte card design met webshop blauw */}
              <div className={cn(
                'flex flex-col sm:flex-row',
                'items-start sm:items-center',
                'gap-3 sm:gap-4 md:gap-5 lg:gap-6', // ✅ COMPACT: Minder gap op desktop
                'bg-white',
                'rounded-lg sm:rounded-xl', // ✅ COMPACT: Kleinere border radius
                'p-4 sm:p-5 md:p-6 lg:p-7', // ✅ COMPACT: Minder padding op desktop
                'shadow-sm hover:shadow-md',
                'transition-all duration-300',
                'border',
              )}
              style={{ borderColor: `${BRAND_COLORS_HEX.primary}20` }}> {/* ✅ BLAUW: Subtiele border */}
                {/* ✅ SYMBOOL: Icon met webshop blauw */}
                <div className={cn(
                  'flex-shrink-0',
                  'relative',
                  'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16', // ✅ COMPACT: Kleinere icons op desktop
                  'flex items-center justify-center',
                  'rounded-full',
                  'border-2'
                )}
                style={{
                  background: `linear-gradient(135deg, ${BRAND_COLORS_HEX.primaryLight}20 0%, ${BRAND_COLORS_HEX.primary}30 100%)`, // ✅ BLAUW: Webshop blauw gradient
                  borderColor: `${BRAND_COLORS_HEX.primary}40`, // ✅ BLAUW: Border
                }}>
                  <IconComponent className={cn(
                    'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8' // ✅ COMPACT: Kleinere icon size
                  )}
                  style={{ color: BRAND_COLORS_HEX.primary }} /> {/* ✅ BLAUW: Webshop blauw */}
                  {/* ✅ NUMMER: Badge met webshop blauw */}
                  <div className={cn(
                    'absolute -top-1.5 -right-1.5',
                    'w-6 h-6 sm:w-7 sm:h-7',
                    'flex items-center justify-center',
                    'text-white',
                    'rounded-full',
                    'text-xs sm:text-sm font-semibold', // ✅ COMPACT: Kleinere tekst
                    'shadow-lg'
                  )}
                  style={{ backgroundColor: BRAND_COLORS_HEX.primary }}> {/* ✅ BLAUW: Webshop blauw */}
                    {step.number}
                  </div>
                </div>

                {/* ✅ TEKST: Compacte titel en beschrijving */}
                <div className="flex-1 space-y-1.5 sm:space-y-2"> {/* ✅ COMPACT: Minder spacing */}
                  <h3 className={cn(
                    'text-lg sm:text-xl md:text-2xl', // ✅ COMPACT: Kleinere lettergrootte op desktop
                    'font-medium',
                    'tracking-tight'
                  )}
                  style={{ color: BRAND_COLORS_HEX.primaryDark }}> {/* ✅ BLAUW: Donkerder blauw */}
                    {step.title}
                  </h3>
                  <p className={cn(
                    'text-xs sm:text-sm md:text-base', // ✅ COMPACT: Kleinere lettergrootte op desktop
                    'font-light',
                    'leading-relaxed',
                    'max-w-2xl'
                  )}
                  style={{ color: '#4b5563' }}> {/* ✅ GRIJS: Subtiele tekst */}
                    {step.description}
                  </p>
                </div>

                {/* ✅ PIJL: Webshop blauw pijl tussen stappen */}
                {!isLast && (
                  <div className={cn(
                    'hidden sm:flex',
                    'flex-col items-center',
                    'justify-center',
                    'flex-shrink-0',
                    'w-6 h-6' // ✅ COMPACT: Kleinere pijl
                  )}>
                    <ArrowRight className="w-5 h-5 rotate-90 sm:rotate-0" style={{ color: BRAND_COLORS_HEX.primary }} /> {/* ✅ BLAUW: Webshop blauw */}
                  </div>
                )}
              </div>

              {/* ✅ MOBIEL PIJL: Verticale pijl met webshop blauw */}
              {!isLast && (
                <div className={cn(
                  'flex sm:hidden',
                  'justify-center',
                  'my-3' // ✅ COMPACT: Minder margin
                )}>
                  <ArrowRight className="w-5 h-5 rotate-90" style={{ color: BRAND_COLORS_HEX.primary }} /> {/* ✅ BLAUW: Webshop blauw */}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
