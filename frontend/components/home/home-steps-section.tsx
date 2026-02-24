/**
 * HOME STEPS SECTION – "Zo werkt het" zigzag
 * ✅ DRY: Gebruikt dezelfde config als ProductUspFeatures
 * ✅ Admin-configureerbaar: foto's via product.howItWorksImages
 * ✅ 3 stappen: stekker + app, afvalzak, grit + beginnen
 * ✅ Zigzag layout identiek aan product-usp-features
 */

'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PRODUCT_PAGE_CONFIG } from '@/lib/product-page-config';
import type { Product } from '@/types/product';

// Gedeelde stap-definities uit single source of truth
const STEP_DEFINITIONS = PRODUCT_PAGE_CONFIG.howItWorksSteps.steps;

// ─── Config ──────────────────────────────────────────────────────────────────

const STEPS_CONFIG = {
  section: {
    padding: 'py-16 md:py-24',
    bg: 'bg-white',
  },
  title: {
    wrapper: 'text-center mb-12 md:mb-16 px-4',
    eyebrow: 'text-xs font-semibold tracking-[0.2em] uppercase text-gray-400 mb-3',
    heading: 'text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-black',
    sub: 'mt-4 text-base sm:text-lg text-gray-500 font-light max-w-xl mx-auto',
  },
  step: {
    number: {
      wrapper: 'w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0 mb-3 mx-auto md:mx-0',
      text: 'text-xs font-bold text-white',
    },
    title: 'text-xl sm:text-2xl md:text-3xl font-medium text-black tracking-tight mb-3',
    desc: 'text-base text-gray-500 leading-relaxed',
  },
  image: {
    wrapper: 'relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-sm',
  },
} as const;

// Standaard fallback afbeeldingen (wanneer admin nog niets heeft ingesteld)
const DEFAULT_IMAGES = [
  '/images/capacity-10.5l-optimized.jpg',
  '/images/feature-2.jpg',
  '/images/feature-2.jpg',
] as const;

// ─── Component ───────────────────────────────────────────────────────────────

interface HomeStepsSectionProps {
  product?: Product | null;
}

export function HomeStepsSection({ product = null }: HomeStepsSectionProps) {
  const CONFIG = PRODUCT_PAGE_CONFIG;

  // Admin-configureerbare foto's via product.howItWorksImages
  const adminImages: string[] = (product?.howItWorksImages ?? []) as string[];

  const getImage = (index: number): string => {
    const admin = adminImages[index];
    if (admin && typeof admin === 'string' && !admin.startsWith('data:') && !admin.includes('placeholder')) {
      return admin;
    }
    return DEFAULT_IMAGES[index] ?? DEFAULT_IMAGES[0];
  };

  return (
    <section className={cn(STEPS_CONFIG.section.bg, STEPS_CONFIG.section.padding)} aria-label="Hoe werkt het">
      {/* Titel */}
      <div className={STEPS_CONFIG.title.wrapper}>
        <p className={STEPS_CONFIG.title.eyebrow}>Zo werkt het</p>
        <h2 className={STEPS_CONFIG.title.heading}>In 3 stappen klaar</h2>
        <p className={STEPS_CONFIG.title.sub}>
          Van uitpakken tot eerste automatische reiniging — in minder dan 10 minuten.
        </p>
      </div>

      {/* Zigzag stappen */}
      <div className={cn(CONFIG.layout.maxWidth, 'mx-auto', CONFIG.layout.containerPaddingMobile)}>
        <div className={CONFIG.featureSection.containerSpacing}>
          {STEP_DEFINITIONS.map((step, index) => {
            const isEven = index % 2 === 0;
            const imageSrc = getImage(index);

            return (
              <div
                key={step.number}
                className={isEven
                  ? CONFIG.featureSection.zigzag.leftLayout
                  : CONFIG.featureSection.zigzag.rightLayout}
              >
                {/* Afbeelding */}
                <div
                  className={cn(
                    CONFIG.featureSection.image.containerMaxWidth,
                    'w-full md:w-auto',
                    isEven
                      ? CONFIG.featureSection.zigzag.imageOrder.left
                      : CONFIG.featureSection.zigzag.imageOrder.right
                  )}
                >
                  <div className={STEPS_CONFIG.image.wrapper}>
                    <Image
                      src={imageSrc}
                      alt={step.title}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      quality={85}
                      unoptimized={
                        imageSrc.startsWith('/uploads/') ||
                        imageSrc.startsWith('/images/') ||
                        imageSrc.startsWith('http')
                      }
                    />
                  </div>
                </div>

                {/* Tekst */}
                <div
                  className={cn(
                    CONFIG.featureSection.text.container,
                    isEven
                      ? CONFIG.featureSection.zigzag.textOrder.left
                      : CONFIG.featureSection.zigzag.textOrder.right
                  )}
                >
                  {/* Stap nummer */}
                  <div className={STEPS_CONFIG.step.number.wrapper}>
                    <span className={STEPS_CONFIG.step.number.text}>{step.number}</span>
                  </div>

                  <h3
                    className={cn(
                      CONFIG.featureSection.text.title.fontSize,
                      CONFIG.featureSection.text.title.fontWeight,
                      CONFIG.featureSection.text.title.letterSpacing,
                      CONFIG.featureSection.text.title.textAlign,
                      'text-black'
                    )}
                    style={{ color: '#000000' }}
                  >
                    {step.title}
                  </h3>

                  <p
                    className={cn(
                      CONFIG.featureSection.text.description.fontSize,
                      CONFIG.featureSection.text.description.textColor,
                      CONFIG.featureSection.text.description.lineHeight,
                      CONFIG.featureSection.text.description.textAlign
                    )}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
