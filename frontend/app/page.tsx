"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
// Chat popup is nu in layout.tsx voor alle pagina's
import { Separator } from "@/components/ui/separator";
// ✅ VIDEO PLAYER IMPORT VERWIJDERD: Geen redundantie
import { ProductUspFeatures } from "@/components/products/product-usp-features";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import type { Product } from "@/types/product";
import { API_CONFIG, SITE_CONFIG, apiFetch } from "@/lib/config";
import { IMAGE_CONFIG, getImageFillProps } from "@/lib/image-config";
import { useCart } from "@/context/cart-context";
import { useUI } from "@/context/ui-context";
import { DESIGN_SYSTEM } from "@/lib/design-system";
import { SHARED_CONTENT } from "@/lib/content.config";
import { BRAND_COLORS_HEX } from "@/lib/color-config";
import { ProductVariantsSection } from "@/components/shared/product-variants-section";
import { ProductDescriptionSection } from "@/components/shared/product-description-section";
import { ProductEdgeImageSection } from "@/components/shared/product-edge-image-section";

/**
 * 🎨 HOMEPAGE - MINIMALISTISCH ZWART-WIT DESIGN
 * 
 * Geïnspireerd door pergolux.nl:
 * ✅ Hero: Split design (50/50 tekst/beeld)
 * ✅ USP: Twee features edge-to-edge (zigzag pattern)
 * ✅ Video: Centered, clean presentation
 * ✅ FAQ: Minimalistisch, accordion style
 * ✅ Kleuren: Zwart-wit, geen oranje
 * ✅ Typography: Dunne headings, veel witruimte
 */

// FAQ's - Relevant en informatief
const faqs = [
  {
    q: "Wat maakt deze kattenbak beter dan andere zelfreinigende bakken?",
    a: "Onze kattenbak heeft een unieke combinatie van features: 10.5L afvalbak capaciteit (17% meer dan de concurrentie), dubbele veiligheidssensoren, open-top low-stress design, en een ultra-stille motor onder 40dB. Ook is hij volledig modulair en makkelijk te demonteren voor reiniging."
  },
  {
    q: "Hoe werkt de zelfreinigende functie?",
    a: "De kattenbak detecteert automatisch wanneer je kat klaar is via dubbele veiligheidssensoren. Deze sensoren zorgen ervoor dat de reinigingscyclus alleen start wanneer het 100% veilig is. Alle afval wordt verzameld in een afgesloten 10.5L compartiment met anti-splash hoge wanden."
  },
  {
    q: "Hoe vaak moet ik de afvalbak legen?",
    a: "Bij één kat ongeveer 1x per week, bij meerdere katten 2-3x per week. Dankzij de XL 10.5L capaciteit (grootste in zijn klasse) heb je tot 30% minder onderhoud dan bij concurrerende modellen met 7-9L capaciteit."
  },
  {
    q: "Is de kattenbak geschikt voor meerdere katten?",
    a: "Ja, geschikt voor huishoudens met meerdere katten dankzij de XL 10.5L capaciteit. Het compacte ontwerp met grote binnenruimte biedt comfort voor katten tot 7kg. Je kunt alle soorten kattenbakvulling gebruiken dankzij het high-efficiency filter."
  },
];

export default function HomePage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { itemCount } = useCart();
  const { openCart, closeCart } = useUI();

  // Fetch featured product with proper error handling
  useEffect(() => {
    let isMounted = true;
    
    apiFetch<{ success: boolean; data: Product[] }>(API_CONFIG.ENDPOINTS.PRODUCTS_FEATURED)
      .then(data => {
        if (isMounted && data?.data) {
          setProduct(data.data[0] || null);
        }
      })
      .catch((error) => {
        // ✅ FIX: Silent error handling - don't show Oeps page for missing featured product
        // The page will use default product slug and hero image
        if (isMounted) {
          console.warn('Could not load featured product, using defaults:', error);
          setProduct(null); // Will trigger fallback to DEFAULT_PRODUCT_SLUG
        }
      });
    
    return () => {
      isMounted = false;
    };
  }, []);

  const productSlug = product?.slug || SITE_CONFIG.DEFAULT_PRODUCT_SLUG;
  // 🚀 PERFORMANCE: Always show fallback hero image immediately (no waiting for product fetch)
  const heroImage = IMAGE_CONFIG.hero.main; // ✅ FIX: Direct fallback, no API dependency
  // ✅ OPTIONAL: Update hero image if product loads successfully (progressive enhancement)
  // ✅ FIX: Use real product image if available, otherwise use fallback hero image (geen hardcoded product ID)
  const optimizedHeroImage = product?.images?.[0] || heroImage;

  return (
    <div>
      {/* 🎨 HERO SECTION - RESPONSIVE: Mobile stacked, Desktop split (35/65) */}
      <section 
        className="relative flex flex-col md:flex-row items-center"
        style={{
          minHeight: DESIGN_SYSTEM.layout.hero.minHeightMobile, // ✅ MOBILE: Kleinere hoogte
        }}
      >
        {/* Container voor flexbox - ✅ RESPONSIVE: Mobile column, Desktop row */}
        <div 
          className="w-full flex flex-col md:flex-row items-center" 
          style={{ 
            minHeight: `clamp(${DESIGN_SYSTEM.layout.hero.minHeightMobile}, 100vh, ${DESIGN_SYSTEM.layout.hero.minHeight})`, // ✅ RESPONSIVE: Clamp tussen mobile en desktop
          }}
        >
          {/* LINKS: TEKST & CTA - ✅ RESPONSIVE: Mobile full width, Desktop 35% */}
          <div 
            className="space-y-4 md:space-y-6 z-10 w-full md:w-[35%] px-4 md:px-12 pt-6 md:pt-0" // ✅ RESPONSIVE: Mobile extra top padding voor witruimte tussen navbar
            style={{
              backgroundColor: DESIGN_SYSTEM.colors.secondary, // ✅ WIT: Was gray[50], nu wit
            }}
          >
            {/* Heading - ✅ RESPONSIVE: Mobile smaller, Laptop smaller, Desktop smaller */}
            <h1 
              className="leading-tight text-3xl md:text-3xl lg:text-5xl" // ✅ RESPONSIVE: Desktop kleiner (lg:text-5xl ipv lg:text-6xl)
              style={{
                fontFamily: DESIGN_SYSTEM.typography.fontFamily.headings,
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
                color: DESIGN_SYSTEM.colors.text.primary,
                letterSpacing: DESIGN_SYSTEM.typography.letterSpacing.tight,
              }}
            >
              Automatische<br className="hidden md:block" /> {/* ✅ RESPONSIVE: Line break alleen op desktop */}
              <span className="md:hidden"> </span> {/* ✅ MOBILE: Space in plaats van break */}
              Kattenbak
            </h1>

            {/* Subtitle - ✅ RESPONSIVE: Mobile smaller */}
            <p 
              className="text-base md:text-xl" // ✅ RESPONSIVE: Tailwind breakpoints
              style={{
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
                color: DESIGN_SYSTEM.colors.text.secondary,
                lineHeight: DESIGN_SYSTEM.typography.lineHeight.relaxed,
              }}
            >
              Zelfreinigende • Hygiënisch • Stil
            </p>

            {/* CTA Button - ✅ RESPONSIVE: Mobile margin-bottom, Desktop normale spacing */}
            <div className="pt-4 pb-8 md:pb-4"> {/* ✅ RESPONSIVE: Mobile extra bottom padding zodat button niet aan afbeelding plakt */}
              <Link href={`/product/${productSlug}`}>
                <button 
                  className="inline-flex items-center gap-2 md:gap-3 transition-all hover:opacity-90 text-sm md:text-base" // ✅ RESPONSIVE: Mobile kleinere gap en tekst
                  style={{
                    background: DESIGN_SYSTEM.colors.text.primary, // ✅ ZWART: Volledig zwart via design system (was buttonCta/blue)
                    color: DESIGN_SYSTEM.colors.text.inverse,
                    padding: `${DESIGN_SYSTEM.spacing[3]} ${DESIGN_SYSTEM.spacing[6]}`, // ✅ RESPONSIVE: Mobile kleinere padding (was spacing[4] spacing[8])
                    fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                    borderRadius: DESIGN_SYSTEM.effects.borderRadius.xl, // ✅ RONDER: xl (12px) voor buttons
                  }}
                >
                  <span>Bekijk Product</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} /> {/* ✅ RESPONSIVE: Mobile kleinere icon */}
                </button>
              </Link>
            </div>
          </div>

          {/* RECHTS: AFBEELDING - ✅ RESPONSIVE: Mobile full width/height, Desktop 65% */}
          <div 
            className="relative md:absolute top-0 right-0 w-full md:w-[65%] h-64 md:h-full overflow-hidden" // ✅ RESPONSIVE: Mobile relative met height, Desktop absolute 65%
          >
            {/* 🚀 PERFORMANCE: Show fallback immediately, upgrade to product image if available */}
            {optimizedHeroImage !== heroImage ? (
              <Image
                key="optimized-hero"
                src={optimizedHeroImage}
                alt="Premium automatische kattenbak"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 65vw" // 🚀 PERFORMANCE: Responsive sizes voor hero
                priority // 🚀 PERFORMANCE: Above-the-fold, load immediately
                quality={90} // 🚀 PERFORMANCE: Highest quality voor hero (above-the-fold)
                loading="eager" // 🚀 PERFORMANCE: Load immediately (priority image)
                unoptimized={optimizedHeroImage.startsWith('/uploads/')} // ✅ FIX: Disable Next.js optimization for /uploads/ paths
              />
            ) : (
              <Image
                key="fallback-hero"
                src={heroImage}
                alt="Premium automatische kattenbak"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 65vw" // 🚀 PERFORMANCE: Responsive sizes voor hero
                priority // 🚀 PERFORMANCE: Above-the-fold, load immediately
                quality={90} // 🚀 PERFORMANCE: Highest quality voor hero (above-the-fold)
                loading="eager" // 🚀 PERFORMANCE: Load immediately (priority image)
                unoptimized={heroImage.startsWith('/uploads/')} // ✅ FIX: Disable Next.js optimization for /uploads/ paths
              />
            )}
          </div>
        </div>
      </section>

      {/* ✅ TRUST BANNER VERWIJDERD: Onder hero weggehaald */}
      
      {/* ✅ VARIANTEN SECTIE: Direct na hero - Dynamisch, smooth effect, tekst in afbeelding - DRY & ZONDER HARDCODE */}
      <ProductVariantsSection />

      {/* ✅ EDGE-TO-EDGE IMAGE SECTIE: Na varianten, met tekst overlay - 3e foto, dynamisch, secure - DRY & ZONDER HARDCODE */}
      <ProductEdgeImageSection />

      {/* ✅ PRODUCT BESCHRIJVING SECTIE: Na edge-to-edge - Dynamisch - DRY & ZONDER HARDCODE */}
      <ProductDescriptionSection />

      {/* SEPARATOR */}
      <div 
        className="w-full"
        style={{
          height: '1px',
          backgroundColor: DESIGN_SYSTEM.colors.border.default,
        }}
      />

      {/* 🎨 USP FEATURES - ZIGZAG PATTERN - ✅ EXACT ZELFDE: Identiek aan varianten sectie */}
      <section 
        className="py-12 md:py-16"
        style={{
          backgroundColor: DESIGN_SYSTEM.colors.secondary,
        }}
      >
        {/* ✅ PADDING MOBIEL: Heading heeft padding op mobiel voor leesbaarheid */}
        <div className="text-center mb-12 px-4 md:px-0"> {/* ✅ PADDING MOBIEL: Padding op mobiel */}
          <h2 
            className="mb-4"
            style={{
              fontFamily: DESIGN_SYSTEM.typography.fontFamily.headings,
              fontSize: DESIGN_SYSTEM.typography.fontSize['4xl'],
              fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
              color: DESIGN_SYSTEM.colors.text.primary,
              letterSpacing: DESIGN_SYSTEM.typography.letterSpacing.tight,
            }}
          >
            Waarom deze kattenbak?
          </h2>
          <p 
            style={{
              fontSize: DESIGN_SYSTEM.typography.fontSize.lg,
              fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
              color: DESIGN_SYSTEM.colors.text.secondary,
            }}
          >
            De belangrijkste features die het verschil maken
          </p>
        </div>
        
        {/* USP Features Component - ✅ EDGE-TO-EDGE: Minder witruimte, identiek aan product detail */}
        <ProductUspFeatures product={product} />
      </section>

      {/* ✅ VIDEO SECTIE VERWIJDERD: Geen redundantie */}

      {/* 🎨 FAQ SECTION - ✅ EDGE-TO-EDGE MOBIEL: Mobielvriendelijker */}
      <section 
        style={{
          padding: `${DESIGN_SYSTEM.spacing.section} 0`,
          backgroundColor: DESIGN_SYSTEM.colors.secondary,
        }}
      >
        <div 
          className="mx-auto md:max-w-4xl" // ✅ EDGE-TO-EDGE MOBIEL: Geen max-width op mobiel, wel op desktop
          style={{
            padding: '0', // ✅ EDGE-TO-EDGE MOBIEL: Geen padding op container
          }}
        >
          {/* Section Heading - ✅ PADDING MOBIEL: Padding op mobiel voor leesbaarheid */}
          <div className="text-center mb-12 px-4 md:px-0"> {/* ✅ PADDING MOBIEL: Padding op mobiel */}
            <h2 
              className="mb-4"
              style={{
                fontFamily: DESIGN_SYSTEM.typography.fontFamily.headings,
                fontSize: DESIGN_SYSTEM.typography.fontSize['4xl'],
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
                color: DESIGN_SYSTEM.colors.text.primary,
                letterSpacing: DESIGN_SYSTEM.typography.letterSpacing.tight,
              }}
            >
              Vragen over ALP1071
            </h2>
            <p 
              style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.lg,
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
                color: DESIGN_SYSTEM.colors.text.secondary,
              }}
            >
              Alles wat je moet weten over de automatische kattenbak
            </p>
          </div>

          {/* FAQ Accordion - ✅ EDGE-TO-EDGE MOBIEL: Geen padding op container */}
          <div className="space-y-4 px-4 md:px-0"> {/* ✅ PADDING MOBIEL: Padding op mobiel voor leesbaarheid */}
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="overflow-hidden transition-all"
                style={{
                  backgroundColor: DESIGN_SYSTEM.colors.secondary,
                  border: `1px solid ${DESIGN_SYSTEM.colors.border.default}`,
                  borderRadius: DESIGN_SYSTEM.effects.borderRadius.sm,
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between text-left transition-colors"
                  style={{
                    padding: DESIGN_SYSTEM.spacing[6],
                    backgroundColor: DESIGN_SYSTEM.colors.secondary,
                  }}
                >
                  <span 
                    style={{
                      fontSize: DESIGN_SYSTEM.typography.fontSize.base,
                      fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                      color: DESIGN_SYSTEM.colors.text.primary,
                    }}
                  >
                    {faq.q}
                  </span>
                  {openFaq === i ? (
                    <ChevronUp className="h-5 w-5 flex-shrink-0 ml-4" style={{ color: DESIGN_SYSTEM.colors.text.primary }} />
                  ) : (
                    <ChevronDown className="h-5 w-5 flex-shrink-0 ml-4" style={{ color: DESIGN_SYSTEM.colors.text.primary }} />
                  )}
                </button>
                {openFaq === i && (
                  <div 
                    className="border-t"
                    style={{
                      padding: DESIGN_SYSTEM.spacing[6],
                      borderColor: DESIGN_SYSTEM.colors.border.default,
                      backgroundColor: DESIGN_SYSTEM.colors.gray[50],
                    }}
                  >
                    <p 
                      style={{
                        fontSize: DESIGN_SYSTEM.typography.fontSize.base,
                        fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
                        color: DESIGN_SYSTEM.colors.text.secondary,
                        lineHeight: DESIGN_SYSTEM.typography.lineHeight.relaxed,
                      }}
                    >
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chat popup is nu in layout.tsx voor alle pagina's */}
    </div>
  );
}
