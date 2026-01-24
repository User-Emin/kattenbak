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
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PRODUCT_PAGE_CONFIG } from '@/lib/product-page-config';
import { BRAND_COLORS_HEX } from '@/lib/color-config';

// ✅ OPTIMALE SYMBOLEN: Professionele en duidelijke SVG icons voor stekker en grit
const PlugIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    {/* ✅ STEEKER: Professionele Europese stekker met 2 pinnen */}
    {/* Body */}
    <rect x="7" y="11" width="10" height="8" rx="1.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" opacity={0.1} />
    {/* Linker pin */}
    <rect x="8.5" y="13" width="2.5" height="6" rx="0.5" fill="currentColor" />
    {/* Rechter pin */}
    <rect x="13" y="13" width="2.5" height="6" rx="0.5" fill="currentColor" />
    {/* Kabel */}
    <path d="M11.5 11V7a1.5 1.5 0 0 1 1.5-1.5h0a1.5 1.5 0 0 1 1.5 1.5v4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <path d="M12 5.5V3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
    <circle cx="12" cy="1.5" r="1" fill="currentColor" />
  </svg>
);

const GritIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    {/* ✅ GRIT: Professionele kattenbak met grit korrels en MAX lijn */}
    {/* Bak */}
    <rect x="3" y="7" width="18" height="13" rx="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" opacity={0.05} />
    {/* MAX lijn (duidelijk zichtbaar) */}
    <path d="M4 11.5h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} strokeDasharray="3 2" opacity={0.8} />
    <text x="20" y="12" fontSize="8" fill="currentColor" opacity={0.6} fontWeight="bold">MAX</text>
    {/* Grit korrels (realistisch patroon) */}
    <circle cx="6" cy="9.5" r="1.8" fill="currentColor" opacity={0.7} />
    <circle cx="11" cy="9.5" r="1.6" fill="currentColor" opacity={0.75} />
    <circle cx="16" cy="9.5" r="1.7" fill="currentColor" opacity={0.7} />
    <circle cx="18" cy="9.5" r="1.3" fill="currentColor" opacity={0.65} />
    <circle cx="8" cy="13" r="1.4" fill="currentColor" opacity={0.6} />
    <circle cx="13" cy="13" r="1.5" fill="currentColor" opacity={0.65} />
    <circle cx="15" cy="13" r="1.2" fill="currentColor" opacity={0.6} />
    <circle cx="6" cy="15.5" r="1.1" fill="currentColor" opacity={0.55} />
    <circle cx="11" cy="15.5" r="1.3" fill="currentColor" opacity={0.6} />
    <circle cx="17" cy="15.5" r="1.2" fill="currentColor" opacity={0.55} />
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
  image?: string; // ✅ ECHTE AFBEELDING: Optionele product afbeelding per stap
}

interface ProductHowItWorksProps {
  className?: string;
  howItWorksImages?: string[] | null; // ✅ HOW IT WORKS: Specifieke afbeeldingen voor "Hoe werkt het?" sectie (los van variant afbeeldingen)
}

export function ProductHowItWorks({ className, howItWorksImages = [] }: ProductHowItWorksProps) {
  const CONFIG = PRODUCT_PAGE_CONFIG;
  
  // ✅ DYNAMISCH: Stappen gebaseerd op echte product functionaliteit - perfect aansluitend op codebase
  // ✅ AFBEELDINGEN: Specifieke "Hoe werkt het?" afbeeldingen uit admin (los van variant/product images)
  const steps: HowItWorksStep[] = [
    {
      icon: PlugIcon,
      title: 'Stekker erin en klaarzetten',
      description: 'Plaats de kattenbak op een vlakke, stevige ondergrond. Sluit de stekker aan op een stopcontact.',
      number: 1,
      image: howItWorksImages && howItWorksImages.length > 0 ? howItWorksImages[0] : undefined, // ✅ SPECIFIEK: Eerste "Hoe werkt het?" afbeelding
    },
    {
      icon: GritIcon,
      title: 'Grit toevoegen tot MAX lijn',
      description: 'Vul de kattenbak met klonterend grit tot net onder de MAX lijn (ongeveer 8-10 kg).',
      number: 2,
      image: howItWorksImages && howItWorksImages.length > 1 ? howItWorksImages[1] : undefined, // ✅ SPECIFIEK: Tweede "Hoe werkt het?" afbeelding
    },
    {
      icon: TrashBagIcon,
      title: 'Afvalzak plaatsen over bak',
      description: 'Plaats de afvalzak over de afvalbak heen voor optimale werking. De zak moet goed aansluiten.',
      number: 3,
      image: howItWorksImages && howItWorksImages.length > 2 ? howItWorksImages[2] : undefined, // ✅ SPECIFIEK: Derde "Hoe werkt het?" afbeelding
    },
    {
      icon: PowerIcon,
      title: 'Aanzetten en klaar',
      description: 'Druk op de Power knop. Een blauw licht geeft aan dat de kattenbak klaar is voor gebruik.',
      number: 4,
      image: howItWorksImages && howItWorksImages.length > 3 ? howItWorksImages[3] : undefined, // ✅ SPECIFIEK: Vierde "Hoe werkt het?" afbeelding
    },
    {
      icon: TimerIcon,
      title: 'Timer instellen via app',
      description: 'Bepaal wanneer na de wcsessie de kattenbak automatisch moet schoonmaken. Stel de timer in via de app of op de kattenbak zelf.',
      number: 5,
      image: howItWorksImages && howItWorksImages.length > 4 ? howItWorksImages[4] : undefined, // ✅ SPECIFIEK: Vijfde "Hoe werkt het?" afbeelding
    },
    {
      icon: CheckIcon,
      title: 'Klaar! Automatisch schoon',
      description: 'De kattenbak reinigt automatisch na elk gebruik volgens je instellingen. De afvalzak hoeft slechts 1x per week geleegd te worden.',
      number: 6,
      image: howItWorksImages && howItWorksImages.length > 5 ? howItWorksImages[5] : undefined, // ✅ SPECIFIEK: Zesde "Hoe werkt het?" afbeelding
    },
  ];

  return (
    <div className={cn(
      'w-full', // ✅ EDGE-TO-EDGE: Volledige breedte
      'py-8 sm:py-12 md:py-14 lg:py-16', // ✅ COMPACT: Minder padding op desktop
      className
    )}>
      {/* ✅ CONTENT: Container met padding */}
      <div className={cn(
        CONFIG.layout.maxWidth,
        'mx-auto',
        CONFIG.layout.containerPadding
      )}>
        {/* ✅ TITEL: Direct in achtergrond met smooth animatie */}
        <div className={cn(
          'text-center mb-8 sm:mb-10 md:mb-12', // ✅ COMPACT: Minder margin op desktop
          'px-4 sm:px-6 md:px-8 lg:px-10' // ✅ COMPACT: Minder padding op desktop
        )}
        style={{
          animation: 'fadeInUp 0.8s ease-out', // ✅ SMOOTH: Fade-in animatie voor titel
        }}>
          <h2 className={cn(
            'text-2xl sm:text-3xl md:text-4xl lg:text-5xl', // ✅ COMPACT: Kleinere lettergrootte op desktop
            'font-bold', // ✅ GRADIENT: Bold voor betere gradient zichtbaarheid
            'mb-3 sm:mb-4 md:mb-5', // ✅ COMPACT: Minder margin
            'tracking-tight',
            'transition-all duration-500' // ✅ SMOOTH: Smooth transitions
          )}
          style={{ 
            background: `linear-gradient(135deg, ${BRAND_COLORS_HEX.primary} 0%, ${BRAND_COLORS_HEX.primaryDark} 50%, ${BRAND_COLORS_HEX.primaryLight} 100%)`, // ✅ GRADIENT: Smooth gradient
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none', // ✅ SMOOTH: Geen shadow bij gradient text
          }}> {/* ✅ GRADIENT: Smooth gradient titel */}
            Hoe werkt het?
          </h2>
          <p className={cn(
            'text-sm sm:text-base md:text-lg', // ✅ COMPACT: Kleinere lettergrootte op desktop
            'max-w-2xl mx-auto',
            'font-semibold', // ✅ LEVENDIG: Semibold voor levendige beschrijving
            'transition-all duration-500' // ✅ SMOOTH: Smooth transitions
          )}
          style={{ color: BRAND_COLORS_HEX.primaryDark }}> {/* ✅ BLAUW: Donkerder blauw */}
            In 6 eenvoudige stappen klaar voor gebruik
          </p>
        </div>

        {/* ✅ STAPPEN: Compacte desktop layout met webshop blauw en smooth animaties */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6"> {/* ✅ COMPACT: Minder spacing op desktop */}
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isLast = index === steps.length - 1;
            
            return (
              <div 
                key={step.number} 
                className="relative"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`, // ✅ SMOOTH: Staggered fade-in animatie
                }}
              >
                {/* ✅ STAP: Compacte card design met webshop blauw, gradiënten en smooth animaties */}
                <div className={cn(
                  'flex flex-col sm:flex-row',
                  'items-start sm:items-center',
                  'gap-3 sm:gap-4 md:gap-5 lg:gap-6', // ✅ COMPACT: Minder gap op desktop
                  'bg-white',
                  'rounded-lg sm:rounded-xl', // ✅ COMPACT: Kleinere border radius
                  'p-4 sm:p-5 md:p-6 lg:p-7', // ✅ COMPACT: Minder padding op desktop
                  'shadow-sm hover:shadow-lg', // ✅ SMOOTH: Meer shadow bij hover
                  'transition-all duration-500 ease-out', // ✅ SMOOTH: Langere transition voor vloeiendere animatie
                  'border',
                  'hover:scale-[1.02]', // ✅ SMOOTH: Subtiele scale bij hover
                  'hover:-translate-y-1', // ✅ SMOOTH: Subtiele lift bij hover
                )}
                style={{ 
                  borderColor: `${BRAND_COLORS_HEX.primary}30`, // ✅ BLAUWERIG: Iets meer zichtbare border
                  background: '#ffffff', // ✅ WIT: Puur witte achtergrond (geen gradient)
                }}>
                {/* ✅ DYNAMISCH: Product foto uit admin (via productImages prop) */}
                {step.image && (
                  <div className={cn(
                    'flex-shrink-0',
                    'relative',
                    'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32', // ✅ COMPACT: Responsive grootte
                    'rounded-lg sm:rounded-xl',
                    'overflow-hidden',
                    'bg-gray-100',
                    'border-2'
                  )}
                  style={{ borderColor: `${BRAND_COLORS_HEX.primary}30` }}>
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 96px, (max-width: 1024px) 112px, 128px"
                      quality={85}
                      loading="lazy"
                      unoptimized={step.image.startsWith('/uploads/')}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                    {/* ✅ NUMMER: Badge op afbeelding */}
                    <div className={cn(
                      'absolute top-2 right-2',
                      'w-6 h-6 sm:w-7 sm:h-7',
                      'flex items-center justify-center',
                      'text-white',
                      'rounded-full',
                      'text-xs sm:text-sm font-semibold',
                      'shadow-lg'
                    )}
                    style={{ backgroundColor: BRAND_COLORS_HEX.primary }}>
                      {step.number}
                    </div>
                  </div>
                )}
                
                {/* ✅ SYMBOOL: Icon als fallback (alleen als geen afbeelding) */}
                {!step.image && (
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
                )}

                {/* ✅ TEKST: Levendige titel en beschrijving */}
                <div className="flex-1 space-y-1.5 sm:space-y-2"> {/* ✅ COMPACT: Minder spacing */}
                  <h3 className={cn(
                    'text-lg sm:text-xl md:text-2xl', // ✅ COMPACT: Kleinere lettergrootte op desktop
                    'font-bold', // ✅ BOLD: Voor betere gradient zichtbaarheid
                    'tracking-tight'
                  )}
                  style={CONFIG.featureSection.text.title.gradient}> {/* ✅ GRADIENT: Via CONFIG (consistent met feature sectie) */}
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

              </div>

                {/* ✅ PIJL: Onder de kaart op zowel mobiel als desktop */}
                {!isLast && (
                  <div className={cn(
                    'flex',
                    'justify-center',
                    'my-3 md:my-4', // ✅ SPACING: Margin boven en onder pijl
                  )}>
                    <ArrowRight 
                      className="w-5 h-5 md:w-6 md:h-6 rotate-90 transition-transform duration-300" 
                      style={{ color: BRAND_COLORS_HEX.primary }} 
                    /> {/* ✅ BLAUW: Webshop blauw, naar beneden gericht */}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
