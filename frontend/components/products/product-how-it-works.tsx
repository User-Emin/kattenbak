/**
 * PRODUCT HOW IT WORKS SECTION
 * ✅ DRY: Perfect aansluitend op systeem
 * ✅ Realistische stappen gebaseerd op echte product info
 * ✅ Mooi design met symbolen en achtergrondkleur
 */

'use client';

import { 
  Plug, 
  Package, 
  Trash2, 
  Power, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRODUCT_PAGE_CONFIG } from '@/lib/product-page-config';

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
  
  // ✅ REALISTISCH: Stappen gebaseerd op echte product info
  const steps: HowItWorksStep[] = [
    {
      icon: Plug,
      title: 'Stekker erin',
      description: 'Plaats de kattenbak op een vlakke, stevige ondergrond. Sluit de stekker aan op een stopcontact.',
      number: 1,
    },
    {
      icon: Package,
      title: 'Grit toevoegen',
      description: 'Vul de kattenbak met klonterend grit tot net onder de MAX lijn (ongeveer 8-10 kg).',
      number: 2,
    },
    {
      icon: Trash2,
      title: 'Afvalzak plaatsen',
      description: 'Plaats de afvalzak over de afvalbak heen voor optimale werking. De zak moet goed aansluiten.',
      number: 3,
    },
    {
      icon: Power,
      title: 'Aanzetten',
      description: 'Druk op de Power knop. Een blauw licht geeft aan dat de kattenbak klaar is voor gebruik.',
      number: 4,
    },
    {
      icon: CheckCircle2,
      title: 'Klaar voor gebruik',
      description: 'De kattenbak reinigt automatisch na elk gebruik. De afvalzak hoeft slechts 1x per week geleegd te worden.',
      number: 5,
    },
  ];

  return (
    <div className={cn(
      CONFIG.layout.maxWidth,
      'mx-auto',
      CONFIG.layout.containerPadding,
      'py-12 sm:py-16 md:py-20 lg:py-24',
      className
    )}>
      {/* ✅ MOOI DESIGN: Titel met achtergrondkleur */}
      <div className={cn(
        'text-center mb-12 sm:mb-16',
        'bg-gradient-to-br from-gray-50 to-gray-100', // ✅ ACHTERGRONDKLEUR: Subtiele gradient
        'rounded-2xl',
        'px-6 sm:px-8 md:px-12',
        'py-8 sm:py-10 md:py-12'
      )}>
        <h2 className={cn(
          'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
          'font-light', // ✅ FONT: Lichtere font weight
          'text-gray-900',
          'mb-4 sm:mb-6',
          'tracking-tight'
        )}>
          Hoe werkt het?
        </h2>
        <p className={cn(
          'text-base sm:text-lg md:text-xl',
          'text-gray-600',
          'max-w-2xl mx-auto',
          'font-light'
        )}>
          In 5 eenvoudige stappen klaar voor gebruik
        </p>
      </div>

      {/* ✅ STAPPEN: Mooi design met symbolen */}
      <div className="space-y-6 sm:space-y-8 md:space-y-10">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.number} className="relative">
              {/* ✅ STAP: Card design met icon en nummer */}
              <div className={cn(
                'flex flex-col sm:flex-row',
                'items-start sm:items-center',
                'gap-4 sm:gap-6 md:gap-8',
                'bg-white',
                'rounded-xl sm:rounded-2xl',
                'p-6 sm:p-8 md:p-10',
                'shadow-sm hover:shadow-md',
                'transition-all duration-300',
                'border border-gray-100'
              )}>
                {/* ✅ SYMBOOL: Icon met nummer */}
                <div className={cn(
                  'flex-shrink-0',
                  'relative',
                  'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24',
                  'flex items-center justify-center',
                  'bg-gradient-to-br from-gray-50 to-gray-100',
                  'rounded-full',
                  'border-2 border-gray-200'
                )}>
                  <IconComponent className={cn(
                    'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12',
                    'text-gray-700'
                  )} />
                  {/* ✅ NUMMER: Badge rechtsboven */}
                  <div className={cn(
                    'absolute -top-2 -right-2',
                    'w-8 h-8 sm:w-9 sm:h-9',
                    'flex items-center justify-center',
                    'bg-gray-900 text-white',
                    'rounded-full',
                    'text-sm sm:text-base font-semibold',
                    'shadow-lg'
                  )}>
                    {step.number}
                  </div>
                </div>

                {/* ✅ TEKST: Titel en beschrijving */}
                <div className="flex-1 space-y-2 sm:space-y-3">
                  <h3 className={cn(
                    'text-xl sm:text-2xl md:text-3xl',
                    'font-medium', // ✅ FONT: Medium weight voor titel
                    'text-gray-900',
                    'tracking-tight'
                  )}>
                    {step.title}
                  </h3>
                  <p className={cn(
                    'text-sm sm:text-base md:text-lg',
                    'text-gray-600',
                    'font-light', // ✅ FONT: Lichte weight voor beschrijving
                    'leading-relaxed',
                    'max-w-2xl'
                  )}>
                    {step.description}
                  </p>
                </div>

                {/* ✅ PIJL: Alleen tussen stappen, niet na laatste */}
                {!isLast && (
                  <div className={cn(
                    'hidden sm:flex',
                    'flex-col items-center',
                    'justify-center',
                    'flex-shrink-0',
                    'w-8 h-8',
                    'text-gray-400'
                  )}>
                    <ArrowRight className="w-6 h-6 rotate-90 sm:rotate-0" />
                  </div>
                )}
              </div>

              {/* ✅ MOBIEL PIJL: Verticale pijl tussen stappen op mobiel */}
              {!isLast && (
                <div className={cn(
                  'flex sm:hidden',
                  'justify-center',
                  'my-4',
                  'text-gray-400'
                )}>
                  <ArrowRight className="w-6 h-6 rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
