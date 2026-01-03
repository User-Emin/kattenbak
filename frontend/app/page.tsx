"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChatPopup } from "@/components/ui/chat-popup";
import { Separator } from "@/components/ui/separator";
import { VideoPlayer } from "@/components/ui/video-player";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductUspFeatures } from "@/components/products/product-usp-features";
// ProductUspBanner only on product detail pages
import { ArrowRight, Play, Check, MessageCircle, ChevronDown, ChevronUp, Package, Volume2, Sparkles, Smartphone, ShoppingCart } from "lucide-react";
import type { Product } from "@/types/product";
import { API_CONFIG, SITE_CONFIG, apiFetch } from "@/lib/config";
import { IMAGE_CONFIG, getImageFillProps } from "@/lib/image-config";
import { TYPOGRAPHY } from "@/lib/theme-colors";
import { useCart } from "@/context/cart-context";
import { useUI } from "@/context/ui-context";

// DRY: Site Settings Type (sync met backend)
interface SiteSettings {
  hero: { title: string; subtitle: string; image: string; videoUrl?: string }; // DRY: Dynamic video
  usps: {
    title: string;
    feature1: { title: string; description: string; image: string };
    feature2: { title: string; description: string; image: string };
  };
}

// DRY: Realistische FAQ's gebaseerd op product features (vergelijkingstabel)
const faqs = [
  {
    q: "Wat maakt deze kattenbak beter dan andere zelfreinigende bakken?",
    a: "Onze kattenbak heeft een unieke combinatie van features: 10.5L afvalbak capaciteit (17% meer dan de concurrentie), dubbele veiligheidssensoren, open-top low-stress design, en een ultra-stille motor onder 40dB. Ook is hij volledig modulair en makkelijk te demonteren voor reiniging."
  },
  {
    q: "Hoe werkt de zelfreinigende functie en dubbele beveiliging?",
    a: "De kattenbak detecteert automatisch wanneer je kat klaar is via dubbele veiligheidssensoren. Deze sensoren zorgen ervoor dat de reinigingscyclus alleen start wanneer het 100% veilig is. Alle afval wordt verzameld in een afgesloten 10.5L compartiment met anti-splash hoge wanden."
  },
  {
    q: "Hoe vaak moet ik de 10.5L afvalbak legen?",
    a: "Bij één kat ongeveer 1x per week, bij meerdere katten 2-3x per week. Dankzij de XL 10.5L capaciteit (grootste in zijn klasse) heb je tot 30% minder onderhoud dan bij concurrerende modellen met 7-9L capaciteit."
  },
  {
    q: "Is de app-bediening en gezondheidsmonitoring inbegrepen?",
    a: "Ja! De app is gratis te downloaden voor iOS en Android. Je krijgt realtime notifications, kunt reinigingsschema's instellen, en ontvangt gedetailleerde gezondheidsrapporten over toiletbezoeken van je kat - ideaal voor vroege detectie van gezondheidsproblemen."
  },
  {
    q: "Is de kattenbak geschikt voor meerdere katten en welk kattenbakvulling?",
    a: "Ja, geschikt voor huishoudens met meerdere katten dankzij de XL 10.5L capaciteit. Het compacte ontwerp met grote binnenruimte biedt comfort voor katten tot 7kg. Je kunt alle soorten kattenbakvulling gebruiken (klontvormend, silica, houtkorrels) dankzij het high-efficiency filter."
  },
];

export default function HomePage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { itemCount } = useCart();
  const { openCart, closeCart } = useUI();

  // DRY: Fetch featured product (used for video on homepage)
  useEffect(() => {
    apiFetch<{ success: boolean; data: Product[] }>(API_CONFIG.ENDPOINTS.PRODUCTS_FEATURED)
      .then(data => setProduct(data.data?.[0] || null))
      .catch(() => {});
  }, []);

  // Product slug - single source
  const productSlug = product?.slug || SITE_CONFIG.DEFAULT_PRODUCT_SLUG;

  // DRY: Static values
  const hero = { title: 'Slimme Kattenbak', subtitle: 'Automatisch • Smart • Hygiënisch', image: IMAGE_CONFIG.hero.main };
  const usps = {
    title: 'Waarom Deze Kattenbak?',
    feature1: { title: '10.5L Capaciteit', description: 'De grootste afvalbak in zijn klasse. Minder vaak legen betekent meer vrijheid voor jou.', image: IMAGE_CONFIG.usps.capacity.src },
    feature2: { title: 'Ultra-Quiet Motor', description: 'Werkt onder 40 decibel. Zo stil dat je het nauwelijks hoort, maar het doet zijn werk perfect.', image: IMAGE_CONFIG.usps.quiet.src },
  };

  return (
    <div>
      {/* Hero Section - VANAF TOP - Logo & Cart DIRECT IN HERO */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        {/* Logo & Winkelwagen BOVENAAN IN HERO */}
        <div className="absolute top-0 left-0 right-0 z-20 px-6 lg:px-10 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center hover:opacity-90 transition">
              <div className="text-white font-bold text-3xl tracking-tight">
                Cat<span className="text-[#f76402]">Supply</span>
              </div>
            </Link>

            {/* Navigatie & Winkelwagen */}
            <div className="flex items-center gap-6 md:gap-8">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-8">
                <Link href="/" className="text-white hover:text-white/80 transition font-medium text-base">
                  Home
                </Link>
                <Link href="/over-ons" className="text-white hover:text-white/80 transition font-medium text-base">
                  Over Ons
                </Link>
                <Link href="/contact" className="text-white hover:text-white/80 transition font-medium text-base">
                  Contact
                </Link>
              </nav>

              {/* Winkelwagen Icon */}
              <button
                onClick={openCart}
                className="relative hover:opacity-80 transition cursor-pointer"
                aria-label="Winkelwagen"
              >
                <ShoppingCart className="h-7 w-7 text-white" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[22px] h-6 bg-[#f76402] text-white text-xs rounded-full flex items-center justify-center font-bold px-2">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Background Video OR Image */}
        <div className="absolute inset-0 z-0">
          {product?.heroVideoUrl && product.heroVideoUrl.endsWith('.mp4') ? (
            /* Hero Video: autoplay, muted, loop, optimized with dark grey glow */
            <>
              <VideoPlayer
                videoUrl={product.heroVideoUrl}
                posterUrl={hero.image}
                type="hero"
                autoplay
                muted
                loop
                className="w-full h-full"
              />
              {/* Smooth dark grey gradient glow for elegant look */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-800/40 to-gray-700/20 backdrop-blur-[1px]" />
            </>
          ) : (
            /* Fallback: Static hero image */
            <>
              <Image
                src={hero.image}
                alt={hero.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </>
          )}
        </div>

        {/* Hero tekst - LINKS BENEDEN in hero */}
        <div className="absolute bottom-12 md:bottom-16 left-6 lg:left-10 z-10 max-w-2xl">
          {/* Stabiele Titel - DRY: Via Settings - ULTRA LINKERHOEK */}
          <h1 className="text-4xl md:text-6xl font-light mb-4 leading-tight text-white">
            {hero.title}
          </h1>

          <p className="text-base md:text-lg font-light text-white/95 mb-6">
            {hero.subtitle}
          </p>

          {/* Compacte CTA Button */}
          <div className="">
            <Link href={`/product/${productSlug}`}>
              <button className="h-12 px-8 text-sm font-semibold text-white bg-[#f76402] hover:bg-[#e55a02] rounded-sm transition-all duration-200">
                Bekijk Product
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Separator variant="float" spacing="sm" />

      {/* USP Features - DRY: Shared component with product detail */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-3 text-center">
            Waarom deze kattenbak?
          </h2>
          <p className="text-lg text-gray-600 mb-10 text-center font-light">
            De twee belangrijkste features die het verschil maken
          </p>
          
          <ProductUspFeatures />
        </div>
      </section>

      <Separator variant="float" spacing="sm" />

      {/* Video/Demo Section - NA USPs: Exact zoals product detail */}
      <section id="video" className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-3">Zie Het in Actie</h2>
            <p className="text-lg text-gray-600 font-light">
              <strong className="font-normal">2:30 min</strong> demo video
            </p>
          </div>
          
          {/* Video Player - EXACT ZOALS PRODUCT DETAIL: w-full aspect-video */}
          {product?.videoUrl ? (
            <VideoPlayer
              videoUrl={product.videoUrl}
              posterUrl={hero.image}
              type="demo"
              controls
              className="w-full aspect-video rounded-sm overflow-hidden border border-gray-200"
            />
          ) : (
            /* Fallback: Video placeholder als geen video geüpload */
            <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-sm overflow-hidden border border-gray-200 group cursor-pointer">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-white/30 transition-all border-2 border-white/40">
                  <Play className="h-10 w-10 ml-1 drop-shadow-lg" />
                </div>
              </div>
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-sm font-semibold opacity-90 mb-1">Product Demo</p>
                <p className="text-3xl font-bold drop-shadow-lg">2:30 min</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <Separator variant="float" spacing="sm" />

      {/* FAQ Section - ALS LAATSTE */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-3">
              Veelgestelde Vragen over de Automatische Kattenbak
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Alles over <strong className="font-normal">zelfreiniging</strong>, <strong className="font-normal">capaciteit</strong>, <strong className="font-normal">app-bediening</strong> en <strong className="font-normal">gezondheidsmonitoring</strong>
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#f76402] hover:shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors group"
                >
                  <span className="font-normal text-base text-gray-900 pr-4 group-hover:text-[#f76402] transition-colors">
                    {faq.q}
                  </span>
                  {openFaq === i ? (
                    <ChevronUp className="h-5 w-5 text-[#f76402] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:text-[#f76402] transition-colors" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 pt-2 border-t border-gray-100 bg-gray-50/30">
                    <p className="text-gray-700 leading-relaxed font-light">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Chat Popup - ALTIJD ZICHTBAAR */}
      <ChatPopup />
    </div>
  );
}
