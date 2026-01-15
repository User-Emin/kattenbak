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
  const heroImage = product?.images?.[0] || IMAGE_CONFIG.hero.main;

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
            className="space-y-4 md:space-y-6 z-10 w-full md:w-[35%] px-4 md:px-12" // ✅ RESPONSIVE: Mobile full width met padding, Desktop 35% width
            style={{
              backgroundColor: DESIGN_SYSTEM.colors.gray[50],
            }}
          >
            {/* Heading - ✅ RESPONSIVE: Mobile smaller, Laptop smaller, Desktop larger */}
            <h1 
              className="leading-tight text-3xl md:text-4xl lg:text-6xl" // ✅ RESPONSIVE: Laptop kleiner (md:text-4xl ipv md:text-5xl)
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
                  className="inline-flex items-center gap-2 md:gap-3 transition-opacity hover:opacity-80 text-sm md:text-base" // ✅ RESPONSIVE: Mobile kleinere gap en tekst
                  style={{
                    background: typeof DESIGN_SYSTEM.colors.primary === 'string' && DESIGN_SYSTEM.colors.primary.includes('gradient') 
                      ? DESIGN_SYSTEM.colors.primary 
                      : `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.primaryStart || '#3C3C3D'} 0%, ${DESIGN_SYSTEM.colors.primaryEnd || '#7A7A7D'} 100%)`, // ✅ GRADIENT
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
            className="relative md:absolute top-0 right-0 w-full md:w-[65%] h-64 md:h-full" // ✅ RESPONSIVE: Mobile relative met height, Desktop absolute 65%
            style={{
              backgroundImage: `url('${DESIGN_SYSTEM.layout.hero.imageUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>
      </section>

      {/* ✅ TRUST BANNER VERWIJDERD: Onder hero weggehaald */}
      
      {/* 🎨 PREMIUM KWALITEIT & VEILIGHEID - ✅ SHARED COMPONENT: Dynamisch, geen hardcode */}
      <PremiumQualitySection />

      {/* SEPARATOR */}
      <div 
        className="w-full"
        style={{
          height: '1px',
          backgroundColor: DESIGN_SYSTEM.colors.border.default,
        }}
      />

      {/* 🎨 USP FEATURES - ZIGZAG PATTERN */}
      <section 
        style={{
          padding: `${DESIGN_SYSTEM.spacing.section} 0`,
          backgroundColor: DESIGN_SYSTEM.colors.secondary,
        }}
      >
        <div 
          className="mx-auto"
          style={{
            maxWidth: DESIGN_SYSTEM.layout.maxWidth.xl,
            padding: `0 ${DESIGN_SYSTEM.spacing.containerPadding}`,
          }}
        >
          {/* Section Heading - Noto Sans MEDIUM (logo style) */}
          <div className="text-center mb-16">
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
              De twee belangrijkste features die het verschil maken
            </p>
          </div>
          
          {/* USP Features Component */}
          <ProductUspFeatures />
        </div>
      </section>

      {/* ✅ VIDEO SECTIE VERWIJDERD: Geen redundantie */}

      {/* 🎨 FAQ SECTION */}
      <section 
        style={{
          padding: `${DESIGN_SYSTEM.spacing.section} 0`,
          backgroundColor: DESIGN_SYSTEM.colors.secondary,
        }}
      >
        <div 
          className="mx-auto"
          style={{
            maxWidth: DESIGN_SYSTEM.layout.maxWidth.lg,
            padding: `0 ${DESIGN_SYSTEM.spacing.containerPadding}`,
          }}
        >
          {/* Section Heading - Noto Sans MEDIUM (logo style) */}
          <div className="text-center mb-12">
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
              Veelgestelde Vragen
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

          {/* FAQ Accordion */}
          <div className="space-y-4">
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
                  className="w-full flex items-center justify-between text-left transition-colors hover:bg-gray-50/50"
                  style={{
                    padding: DESIGN_SYSTEM.spacing[6],
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
                    <ChevronDown className="h-5 w-5 flex-shrink-0 ml-4" style={{ color: DESIGN_SYSTEM.colors.text.secondary }} />
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
