"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
// Chat popup is nu in layout.tsx voor alle pagina's
import { Separator } from "@/components/ui/separator";
// ✅ VIDEO PLAYER IMPORT VERWIJDERD: Geen redundantie
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import type { Product } from "@/types/product";
import { API_CONFIG, SITE_CONFIG, apiFetch } from "@/lib/config";
import { IMAGE_CONFIG, getImageFillProps } from "@/lib/image-config";
import { useCart } from "@/context/cart-context";
import { useUI } from "@/context/ui-context";
import { DESIGN_SYSTEM } from "@/lib/design-system";
import { SHARED_CONTENT } from "@/lib/content.config";
import { BRAND_COLORS_HEX } from "@/lib/color-config";
import { MODERN_DESIGN } from "@/lib/modern-design-enhancements";
import { ProductVariantsSection } from "@/components/shared/product-variants-section";
import { ProductDescriptionSection } from "@/components/shared/product-description-section";
import { ProductEdgeImageSection } from "@/components/shared/product-edge-image-section";
import { HomepageJsonLd } from "@/components/seo/homepage-json-ld";
import { RichSnippets } from "@/components/seo/rich-snippets";

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
  {
    q: "Is deze kattenbak geschikt voor starters of eerste kat?",
    a: "Ja, perfect voor starters! Ideaal voor jonge stellen, net getrouwde stellen en drukke professionals met weinig tijd. Volledig automatisch, minimale onderhoud en app-bediening. Perfect voor je eerste kat zonder dagelijks schoonmaken."
  },
  {
    q: "Is de kattenbak geschikt voor drukke werkweken?",
    a: "Absoluut! Met de 10.5L capaciteit hoef je bij één kat slechts 1x per week te legen. De app stuurt meldingen wanneer het nodig is. Ideaal voor jonge stellen en professionals met drukke carrières - geen dagelijks onderhoud nodig."
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
    <>
      {/* ✅ SEO 10/10: Homepage Structured Data */}
      <HomepageJsonLd product={product} />
      {/* ✅ SEO 10/10: Rich Snippets (FAQ, HowTo) */}
      <RichSnippets />
      <div>
      {/* 🎨 HERO SECTION - RESPONSIVE: Mobile stacked, Desktop split (35/65) */}
      <section 
        className="relative flex flex-col md:flex-row items-center"
        style={{
          minHeight: DESIGN_SYSTEM.layout.hero.minHeightMobile, // ✅ MOBILE: Kleinere hoogte
        }}
      >
        {/* Container voor flexbox - ✅ RESPONSIVE: Mobile column (afbeelding eerst, dan tekst), Desktop row */}
        <div 
          className="w-full flex flex-col md:flex-row items-center" 
          style={{ 
            minHeight: `clamp(${DESIGN_SYSTEM.layout.hero.minHeightMobile}, 100vh, ${DESIGN_SYSTEM.layout.hero.minHeight})`, // ✅ RESPONSIVE: Clamp tussen mobile en desktop
          }}
        >
          {/* MOBIEL: AFBEELDING EERST - ✅ RESPONSIVE: Mobile order-1 (eerst), Desktop order-2 (rechts) */}
          <div 
            className="relative md:absolute top-0 right-0 w-full md:w-[65%] h-64 md:h-full overflow-hidden order-1 md:order-2" // ✅ MOBIEL: order-1 = eerst, Desktop: order-2 = rechts
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

          {/* MOBIEL: TEKST & CTA ONDER AFBEELDING - ✅ RESPONSIVE: Mobile order-2 (na afbeelding), Desktop order-1 (links) */}
          <div 
            className="space-y-4 md:space-y-6 z-10 w-full md:w-[35%] px-4 md:px-12 pt-4 md:pt-0 order-2 md:order-1" // ✅ MOBIEL: order-2 = na afbeelding, Desktop: order-1 = links
            style={{
              backgroundColor: DESIGN_SYSTEM.colors.secondary, // ✅ WIT: Was gray[50], nu wit
            }}
          >
            {/* Heading - ✅ KLEINER: Compacter voor betere balans */}
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1]" // ✅ KLEINER: text-3xl ipv text-4xl
              style={{
                fontFamily: DESIGN_SYSTEM.typography.fontFamily.headings,
                color: DESIGN_SYSTEM.colors.text.primary,
              }}
            >
              Automatische<br className="hidden md:block" />
              <span className="md:hidden"> </span>
              Kattenbak
            </h1>

            {/* Subtitle - ✅ PREMIUM: Moderner styling */}
            <p 
              className="text-lg sm:text-xl md:text-2xl font-light leading-relaxed text-gray-600" // ✅ PREMIUM: Groter, lichter
            >
              Zelfreinigende • Hygiënisch • Stil
            </p>

            {/* CTA Button - ✅ PREMIUM: Modern button met shadow en transform */}
            <div className="pt-6 pb-2 md:pb-4">
              <Link href={`/product/${productSlug}`}>
                <button 
                  className="relative overflow-hidden group inline-flex items-center gap-3 px-8 py-5 sm:px-10 sm:py-6 text-base sm:text-lg font-semibold rounded-lg text-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]" // ✅ PREMIUM: Modern button styling
                  style={{
                    backgroundColor: BRAND_COLORS_HEX.primary,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = BRAND_COLORS_HEX.primaryDark;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = BRAND_COLORS_HEX.primary;
                  }}
                >
                  <span>Bekijk Product</span>
                  <ArrowRight className="w-5 h-5" strokeWidth={2} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ TRUST BANNER VERWIJDERD: Onder hero weggehaald */}
      
      {/* ✅ VARIANTEN SECTIE: Direct na hero - Dynamisch, smooth effect, tekst in afbeelding - DRY & ZONDER HARDCODE */}
      <ProductVariantsSection />

      {/* ✅ EDGE-TO-EDGE IMAGE SECTIE: Desktop na varianten - 3e foto, dynamisch, secure - DRY & ZONDER HARDCODE */}
      <div className="hidden md:block">
        <ProductEdgeImageSection />
      </div>

      {/* ✅ PRODUCT BESCHRIJVING SECTIE: Desktop na edge-to-edge, Mobiel na zigzag - Dynamisch - DRY & ZONDER HARDCODE */}
      <div className="hidden md:block">
        <ProductDescriptionSection />
      </div>

      {/* SEPARATOR */}
      <div 
        className="w-full"
        style={{
          height: '1px',
          backgroundColor: DESIGN_SYSTEM.colors.border.default,
        }}
      />

      {/* ✅ EDGE-TO-EDGE SECTIE: Tussen zigzag einde en FAQ begin - Dynamisch - DRY & ZONDER HARDCODE */}
      <div className="block md:hidden mb-12">
        <ProductEdgeImageSection />
      </div>

      {/* ✅ MOBIEL: PRODUCT BESCHRIJVING SECTIE (ALP1017 + Premium zelfreinigende) na zigzag, boven FAQ - Dynamisch - DRY & ZONDER HARDCODE */}
      <div className="block md:hidden">
        <ProductDescriptionSection />
      </div>

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
    </>
  );
}
