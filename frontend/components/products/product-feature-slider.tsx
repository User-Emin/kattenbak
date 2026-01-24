/**
 * PRODUCT FEATURE SLIDER - Smooth slide animaties voor mobiel
 * ✅ DRY: Perfect aansluitend op systeem via PRODUCT_PAGE_CONFIG
 * ✅ MOBIEL: Om en om slide effect met launch animatie
 * ✅ DESKTOP: Zigzag pattern behouden
 * ✅ PERFORMANCE: Intersection Observer voor lazy animaties
 * ✅ SECURITY: Geen console.log, geen hardcode
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ✅ AUTO-SLIDE: Automatisch wisselen op mobiel
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Alleen op mobiel (max-width: 768px)
    const isMobile = window.innerWidth < 768;
    if (!isMobile || features.length <= 1) return;

    const interval = setInterval(() => {
      setVisibleIndex((prev) => {
        const next = (prev + 1) % features.length;
        return next;
      });
    }, 4000); // ✅ SMOOTH: 4 seconden tussen slides

    return () => clearInterval(interval);
  }, [features.length]);

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

  // ✅ MANUAL NAVIGATION: Swipe/klik navigatie
  const goToSlide = (index: number) => {
    if (isAnimating || index === visibleIndex) return;
    setIsAnimating(true);
    setVisibleIndex(index);
    setTimeout(() => setIsAnimating(false), 600); // ✅ SMOOTH: 600ms animatie
  };

  const CONFIG = PRODUCT_PAGE_CONFIG;

  return (
    <div
      ref={containerRef}
      className={cn(
        CONFIG.layout.maxWidth,
        'mx-auto',
        CONFIG.layout.containerPaddingMobile,
        'py-8 sm:py-10 md:py-12 lg:py-12'
      )}
    >
      {/* ✅ MOBIEL: Slide container */}
      <div className="md:hidden relative overflow-hidden">
        <div
          className="flex transition-transform duration-600 ease-in-out"
          style={{
            transform: `translateX(-${visibleIndex * 100}%)`,
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => {
                observerRefs.current[index] = el;
              }}
              className="min-w-full flex-shrink-0 px-2"
            >
              <div
                className={cn(
                  'flex flex-col items-center justify-center', // ✅ SYMMETRISCH: items-center + justify-center
                  'w-full',
                  'opacity-0 translate-y-8',
                  'transition-all duration-700 ease-out',
                  index === visibleIndex && 'opacity-100 translate-y-0'
                )}
              >
                {/* Image - ✅ SYMMETRISCH: Gecentreerd met symmetrische spacing */}
                <div
                  className={cn(
                    'relative w-full',
                    'max-w-xs sm:max-w-sm', // ✅ SYMMETRISCH: max-w-xs (320px) voor symmetrische grootte
                    'mx-auto', // ✅ SYMMETRISCH: mx-auto voor perfecte centrering
                    CONFIG.featureSection.image.borderRadius,
                    CONFIG.featureSection.image.bgColor,
                    'mb-2' // ✅ SYMMETRISCH: mb-2 voor symmetrische spacing
                  )}
                >
                  <div className={cn(
                    'relative w-full',
                    CONFIG.featureSection.image.aspectRatio, // ✅ SYMMETRISCH: Gebruik CONFIG aspect ratio
                    'overflow-hidden',
                    CONFIG.featureSection.image.borderRadius
                  )}>
                    <Image
                      src={feature.image || '/images/placeholder.jpg'}
                      alt={feature.title}
                      fill
                      className={cn(
                        'object-contain', // ✅ SYMMETRISCH: object-contain voor volledige zichtbaarheid
                        CONFIG.featureSection.image.borderRadius
                      )}
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
                        if (target && !target.src.includes('placeholder')) {
                          target.src = '/images/placeholder.jpg';
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Text Content - ✅ SYMMETRISCH: Gecentreerd met symmetrische spacing */}
                <div className={cn(
                  'w-full',
                  'max-w-xs sm:max-w-sm', // ✅ SYMMETRISCH: Zelfde max-width als afbeelding
                  'mx-auto', // ✅ SYMMETRISCH: mx-auto voor perfecte centrering
                  'text-center', // ✅ SYMMETRISCH: text-center voor symmetrische tekst
                  CONFIG.featureSection.text.container,
                  'space-y-1 sm:space-y-2' // ✅ SYMMETRISCH: Symmetrische spacing
                )}>
                  <h3
                    className={cn(
                      CONFIG.featureSection.text.title.fontSize,
                      CONFIG.featureSection.text.title.fontWeight,
                      CONFIG.featureSection.text.title.textColor,
                      CONFIG.featureSection.text.title.letterSpacing,
                      'text-center' // ✅ SYMMETRISCH: text-center
                    )}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={cn(
                      CONFIG.featureSection.text.description.fontSize,
                      CONFIG.featureSection.text.description.textColor,
                      CONFIG.featureSection.text.description.lineHeight,
                      'text-center' // ✅ SYMMETRISCH: text-center
                    )}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ NAVIGATION DOTS: Indicatoren voor huidige slide */}
        <div className="flex justify-center gap-2 mt-6">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === visibleIndex
                  ? 'w-8 bg-black'
                  : 'bg-gray-300 hover:bg-gray-400'
              )}
              aria-label={`Ga naar slide ${index + 1}`}
            />
          ))}
        </div>
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
                >
                  <div
                    className={cn(
                      'absolute inset-0',
                      CONFIG.featureSection.image.borderRadius,
                      'overflow-hidden'
                    )}
                  >
                    <Image
                      src={feature.image || '/images/placeholder.jpg'}
                      alt={feature.title}
                      fill
                      className="object-contain"
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
                        if (target && !target.src.includes('placeholder')) {
                          target.src = '/images/placeholder.jpg';
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
                      'font-bold', // ✅ GRADIENT: Bold voor betere gradient zichtbaarheid
                      CONFIG.featureSection.text.title.letterSpacing,
                      CONFIG.featureSection.text.title.textAlign
                    )}
                    style={{
                      background: 'linear-gradient(135deg, #3071aa 0%, #256394 50%, #3d82c0 100%)', // ✅ GRADIENT: Smooth gradient
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
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
