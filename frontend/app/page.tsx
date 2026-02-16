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
      <section
        className="relative w-full overflow-hidden"
        style={{ minHeight: DESIGN_SYSTEM.layout.hero.minHeightMobile }}
      >
        <div
          className="relative w-full flex flex-col md:flex-row items-stretch"
          style={{
            minHeight: `clamp(${DESIGN_SYSTEM.layout.hero.minHeightMobile}, 100vh, ${DESIGN_SYSTEM.layout.hero.minHeight})`,
          }}
        >
          <div
            className="w-full md:w-[50%] flex flex-col items-center justify-center md:items-start md:justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16 lg:py-20 order-2 md:order-1 bg-white"
          >
            <div className="space-y-5 md:space-y-6 lg:space-y-8 text-center md:text-left w-full max-w-xl">
              {/* Heading - ✅ RUSTIGER: Minder groot, passender */}
              <h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] text-black" // ✅ RUSTIGER: Kleiner (text-3xl ipv text-4xl, etc.)
                style={{
                  fontFamily: DESIGN_SYSTEM.typography.fontFamily.headings,
                }}
              >
                Automatische<br className="hidden md:block" />
                <span className="md:hidden"> </span>
                Kattenbak
              </h1>

              {/* Subtitle - ✅ ZWART: Tekst in zwart */}
              <p 
                className="text-xl sm:text-2xl md:text-3xl font-light leading-relaxed text-gray-800" // ✅ ZWART: Tekst in zwart/grijs
              >
                Zelfreinigende • Hygiënisch • Stil
              </p>

              {/* CTA Button - ✅ PREMIUM: Modern button */}
              <div className="pt-4 md:pt-6">
                <Link href={`/product/${productSlug}`}>
                  <button 
                    className="relative overflow-hidden group inline-flex items-center gap-3 px-8 py-5 sm:px-10 sm:py-6 md:px-12 md:py-7 text-base sm:text-lg md:text-xl font-semibold rounded-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: '#000000',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1a1a1a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#000000';
                    }}
                  >
                    <span>Bekijk Product</span>
                    <ArrowRight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Beeld: zwevend (marge + ronde hoeken uit layout.hero) */}
          <div
            className="relative w-full md:w-[50%] h-72 sm:h-80 md:h-auto min-h-[320px] sm:min-h-[380px] md:min-h-0 order-1 md:order-2 flex items-center justify-center p-4 sm:p-5 md:p-6 lg:p-8"
            style={{ fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary }}
          >
            <div
              className="relative w-full h-full min-h-[280px] sm:min-h-[340px] rounded-2xl lg:rounded-3xl overflow-hidden bg-gray-100"
              style={{
                boxShadow: (DESIGN_SYSTEM.layout.hero as { imageShadow?: string }).imageShadow ?? DESIGN_SYSTEM.effects.shadow.lg,
              }}
            >
              {optimizedHeroImage !== heroImage ? (
                <Image
                  key="optimized-hero"
                  src={optimizedHeroImage}
                  alt="Premium automatische kattenbak"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  quality={90}
                  loading="eager"
                  unoptimized={optimizedHeroImage.startsWith('/uploads/') || optimizedHeroImage.includes('/uploads/')}
                />
              ) : (
                <Image
                  key="fallback-hero"
                  src={heroImage}
                  alt="Premium automatische kattenbak"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  quality={90}
                  loading="eager"
                  unoptimized={heroImage.startsWith('/uploads/') || heroImage.includes('/uploads/')}
                />
              )}
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
      {/* ✅ FAQ SECTIE VERWIJDERD: Verplaatst naar productdetail voor betere SEO */}

      {/* Chat popup is nu in layout.tsx voor alle pagina's */}
    </div>
    </>
  );
}
