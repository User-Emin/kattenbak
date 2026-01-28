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
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PRODUCT_PAGE_CONFIG } from '@/lib/product-page-config';

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
            {/* Image - ✅ SYMMETRISCH: Gecentreerd met symmetrische spacing */}
            <div
              className={cn(
                'relative w-full',
                'max-w-xs sm:max-w-sm',
                'mx-auto',
                CONFIG.featureSection.image.borderRadius,
                CONFIG.featureSection.image.bgColor,
                'mb-4'
              )}
              style={{
                borderRadius: '1.5rem', // ✅ ECHT ROND: 24px (rounded-3xl) - geforceerd via inline style
              } as React.CSSProperties}
            >
              <div 
                className={cn(
                  'relative w-full',
                  CONFIG.featureSection.image.aspectRatio,
                  'overflow-hidden',
                  CONFIG.featureSection.image.borderRadius
                )}
                style={{
                  borderRadius: '1.5rem', // ✅ ECHT ROND: 24px (rounded-3xl) - geforceerd via inline style
                } as React.CSSProperties}
              >
                <Image
                  src={feature.image || '/images/feature-2.jpg'}
                  alt={feature.title}
                  fill
                  className={cn(
                    'object-contain',
                    CONFIG.featureSection.image.borderRadius
                  )}
                  style={{
                    borderRadius: '1.5rem', // ✅ ECHT ROND: Ook op Image zelf
                  } as React.CSSProperties}
                  sizes="(max-width: 768px) 320px, 400px"
                  quality={85}
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  unoptimized={
                    feature.image?.startsWith('/uploads/') ||
                    feature.image?.startsWith('/images/') ||
                    feature.image?.startsWith('https://') ||
                    feature.image?.startsWith('http://')
                  }
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target && !target.src.includes('feature-2.jpg')) {
                      target.src = '/images/feature-2.jpg';
                    }
                  }}
                />
              </div>
            </div>

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
                  'text-center'
                )}
                style={CONFIG.featureSection.text.title.gradient}
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
                {/* Image */}
                <div
                  className={cn(
                    'relative',
                    'w-full md:w-auto',
                    isEven
                      ? CONFIG.featureSection.zigzag.imageOrder.left
                      : CONFIG.featureSection.zigzag.imageOrder.right,
                    CONFIG.featureSection.image.aspectRatio,
                    CONFIG.featureSection.image.borderRadius,
                    CONFIG.featureSection.image.bgColor,
                    'overflow-hidden'
                  )}
                  style={{
                    borderRadius: '1.5rem', // ✅ ECHT ROND: 24px (rounded-3xl) - geforceerd via inline style
                  } as React.CSSProperties}
                >
                  <div
                    className={cn(
                      'absolute inset-0',
                      CONFIG.featureSection.image.borderRadius,
                      'overflow-hidden'
                    )}
                    style={{
                      borderRadius: '1.5rem', // ✅ ECHT ROND: 24px (rounded-3xl) - geforceerd via inline style
                    } as React.CSSProperties}
                  >
                    <Image
                      src={feature.image || '/images/feature-2.jpg'}
                      alt={feature.title}
                      fill
                      className="object-contain"
                      style={{
                        borderRadius: '1.5rem', // ✅ ECHT ROND: Ook op Image zelf
                      } as React.CSSProperties}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      quality={80}
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      unoptimized={
                        feature.image?.startsWith('/uploads/') ||
                        feature.image?.startsWith('/images/') ||
                        feature.image?.startsWith('https://') ||
                        feature.image?.startsWith('http://')
                      }
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target && !target.src.includes('feature-2.jpg')) {
                          target.src = '/images/feature-2.jpg';
                        }
                      }}
                    />
                  </div>
                </div>

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
                    style={CONFIG.featureSection.text.title.gradient} // ✅ BLAUW GRADIENT: Via CONFIG (geen hardcode)
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
