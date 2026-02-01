/**
 * PRODUCT FEATURE SLIDER - Smooth slide animaties voor mobiel
 * ✅ DRY: Perfect aansluitend op systeem via PRODUCT_PAGE_CONFIG
 * ✅ MOBIEL: Om en om slide effect met launch animatie
 * ✅ DESKTOP: Zigzag pattern behouden
 * ✅ PERFORMANCE: Intersection Observer voor lazy animaties
 * ✅ SECURITY: Geen console.log, geen hardcode
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { PRODUCT_PAGE_CONFIG } from '@/lib/product-page-config';
import { FeatureImageRounded } from '@/components/ui/feature-image-rounded';

interface Feature {
  title: string;
  description: string;
  image?: string;
}

interface ProductFeatureSliderProps {
  features: Feature[];
}

export function ProductFeatureSlider({ features }: ProductFeatureSliderProps) {
  const observerRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ✅ INTERSECTION OBSERVER: Lazy animaties voor performance
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observerRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observerRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const CONFIG = PRODUCT_PAGE_CONFIG;

  return (
    <div
      className={cn(
        CONFIG.layout.maxWidth,
        'mx-auto',
        CONFIG.layout.containerPaddingMobile,
        'py-8 sm:py-10 md:py-12 lg:py-12'
      )}
    >
      {/* ✅ MOBIEL: Onder elkaar (geen slide) - OPTIMAAL */}
      <div className="md:hidden space-y-6">
        {features.map((feature, index) => (
          <div
            key={index}
            ref={(el) => {
              observerRefs.current[index] = el;
            }}
            className={cn(
              'flex flex-col items-center justify-center',
              'w-full',
              'opacity-0 translate-y-8',
              'transition-all duration-700 ease-out',
              'animate-in'
            )}
          >
            {/* Image - ✅ FeatureImageRounded: zigzag radius uit config voor duidelijkheid */}
            <FeatureImageRounded
              src={feature.image || '/images/feature-2.jpg'}
              alt={feature.title}
              className="max-w-xs sm:max-w-sm mx-auto mb-4"
              borderRadiusClassName={CONFIG.featureSection.image.borderRadius}
              innerClassName={cn(
                CONFIG.featureSection.image.aspectRatio,
                CONFIG.featureSection.image.bgColor
              )}
              objectFit="contain"
              sizes="(max-width: 768px) 320px, 400px"
              quality={85}
              unoptimized={
                !!feature.image &&
                (feature.image.startsWith('/uploads/') ||
                  feature.image.startsWith('/images/') ||
                  feature.image.startsWith('https://') ||
                  feature.image.startsWith('http://'))
              }
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target && !target.src.includes('feature-2.jpg')) {
                  target.src = '/images/feature-2.jpg';
                }
              }}
            />

            {/* Text Content - ✅ SYMMETRISCH: Gecentreerd met symmetrische spacing */}
            <div className={cn(
              'w-full',
              'max-w-xs sm:max-w-sm',
              'mx-auto',
              'text-center',
              CONFIG.featureSection.text.container,
              'space-y-1 sm:space-y-2'
            )}>
              <h3
                className={cn(
                  CONFIG.featureSection.text.title.fontSize,
                  CONFIG.featureSection.text.title.fontWeight,
                  CONFIG.featureSection.text.title.letterSpacing,
                  'text-center text-black' // ✅ ZWART: Zigzag titels zwart
                )}
                style={{ color: '#000000' }} // ✅ ZWART: Forceer zwart, geen gradient
              >
                {feature.title}
              </h3>
              <p
                className={cn(
                  CONFIG.featureSection.text.description.fontSize,
                  CONFIG.featureSection.text.description.textColor,
                  CONFIG.featureSection.text.description.lineHeight,
                  'text-center'
                )}
              >
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ DESKTOP: Zigzag pattern (behouden) */}
      <div className="hidden md:block">
        <div className={CONFIG.featureSection.containerSpacing}>
          {features.map((feature, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={index}
                ref={(el) => {
                  observerRefs.current[index] = el;
                }}
                className={cn(
                  isEven
                    ? CONFIG.featureSection.zigzag.leftLayout
                    : CONFIG.featureSection.zigzag.rightLayout,
                  'opacity-0 translate-y-8',
                  'transition-all duration-700 ease-out',
                  'animate-in'
                )}
              >
                {/* Image - ✅ FeatureImageRounded: zigzag radius uit config voor duidelijkheid */}
                <FeatureImageRounded
                  src={feature.image || '/images/feature-2.jpg'}
                  alt={feature.title}
                  className={cn(
                    'w-full md:w-auto',
                    isEven
                      ? CONFIG.featureSection.zigzag.imageOrder.left
                      : CONFIG.featureSection.zigzag.imageOrder.right
                  )}
                  borderRadiusClassName={CONFIG.featureSection.image.borderRadius}
                  innerClassName={cn(
                    CONFIG.featureSection.image.aspectRatio,
                    CONFIG.featureSection.image.bgColor
                  )}
                  objectFit="contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={80}
                  unoptimized={
                    !!feature.image &&
                    (feature.image.startsWith('/uploads/') ||
                      feature.image.startsWith('/images/') ||
                      feature.image.startsWith('https://') ||
                      feature.image.startsWith('http://'))
                  }
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target && !target.src.includes('feature-2.jpg')) {
                      target.src = '/images/feature-2.jpg';
                    }
                  }}
                />

                {/* Text Content - ✅ DESKTOP: Behoud originele styling met gradient titels */}
                <div
                  className={cn(
                    CONFIG.featureSection.text.container,
                    isEven
                      ? CONFIG.featureSection.zigzag.textOrder.left
                      : CONFIG.featureSection.zigzag.textOrder.right
                  )}
                >
                  <h3
                    className={cn(
                      CONFIG.featureSection.text.title.fontSize,
                      CONFIG.featureSection.text.title.fontWeight, // ✅ VIA CONFIG: font-bold
                      CONFIG.featureSection.text.title.letterSpacing,
                      CONFIG.featureSection.text.title.textAlign
                    )}
                    style={{ color: '#000000' }} // ✅ ZWART: Forceer zwart, geen gradient
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={cn(
                      CONFIG.featureSection.text.description.fontSize,
                      CONFIG.featureSection.text.description.textColor,
                      CONFIG.featureSection.text.description.lineHeight,
                      CONFIG.featureSection.text.description.textAlign
                    )}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(2rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: slideIn 0.7s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
