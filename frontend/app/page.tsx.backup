"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChatPopup } from "@/components/ui/chat-popup";
import { Separator } from "@/components/ui/separator";
import { VideoPlayer } from "@/components/ui/video-player";
import { SectionHeading } from "@/components/ui/section-heading";
import { ArrowRight, Play, Check, MessageCircle, ChevronDown, ChevronUp, Package, Volume2, Sparkles, Smartphone } from "lucide-react";
import type { Product } from "@/types/product";
import { API_CONFIG, SITE_CONFIG, apiFetch } from "@/lib/config";
import { IMAGE_CONFIG, getImageFillProps } from "@/lib/image-config";
import { TYPOGRAPHY } from "@/lib/theme-colors";

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
    <div className="min-h-screen bg-white">
      {/* Hero Section - DRY: Dynamisch via Featured Product Video */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        {/* Background Video OR Image */}
        <div className="absolute inset-0 z-0">
          {product?.heroVideoUrl && product.heroVideoUrl.endsWith('.mp4') ? (
            /* Hero Video: autoplay, muted, loop, optimized */
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
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
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
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
            </>
          )}
        </div>

        <div className="container mx-auto px-6 lg:px-12 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Stabiele Titel - DRY: Via Settings */}
            <h1 className="text-5xl md:text-7xl font-semibold mb-6 leading-tight text-white drop-shadow-lg">
              {hero.title}
            </h1>

            <p className="text-lg md:text-xl font-semibold text-white/90 mb-10 drop-shadow-md max-w-2xl mx-auto">
              {hero.subtitle}
            </p>

            {/* Compacte CTA Button */}
            <div className="flex justify-center">
              <Link href={`/product/${productSlug}`}>
                <button className="h-12 px-8 text-sm font-semibold text-white bg-black hover:bg-gray-900 rounded-full transition-all duration-200">
                  Bekijk Product
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Separator variant="float" spacing="md" />

      {/* USP Section - COMPACT + MINDER SPACING - MOBILE FIRST */}
      <section className="py-8 md:py-12 bg-white text-center">
        <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
          <SectionHeading className="mb-12 md:mb-16 text-center">
            Waarom Kiezen Voor Deze Kattenbak?
          </SectionHeading>
          
          {/* Feature 1 - ICONS NAAST TITEL (ook mobiel) */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center text-center md:text-left mb-6 md:mb-10">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <Package className="h-10 w-10 text-brand flex-shrink-0" />
                <h3 className="text-xl font-semibold text-gray-900">{usps.feature1.title}</h3>
              </div>
              <p className="text-base md:text-lg font-semibold text-gray-700 leading-relaxed">{usps.feature1.description}</p>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-md">
              <Image
                src={usps.feature1.image}
                alt={usps.feature1.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Feature 2 - COMPACT ZIGZAG RECHTS, USP TITEL CENTRAAL */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center text-center md:text-left">
            <div className="order-2 md:order-1 relative aspect-video rounded-xl overflow-hidden shadow-md">
              <Image
                src={usps.feature2.image}
                alt={usps.feature2.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <Volume2 className="h-10 w-10 text-brand flex-shrink-0" />
                <h3 className="text-xl font-semibold text-gray-900">{usps.feature2.title}</h3>
              </div>
              <p className="text-base md:text-lg font-semibold text-gray-700 leading-relaxed">{usps.feature2.description}</p>
            </div>
          </div>
        </div>
      </section>

      <Separator variant="float" spacing="sm" />

      {/* Video/Demo Section - COMPACT */}
      <section id="video" className="py-8 md:py-12">
        <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-3 text-gray-900">Zie Het in Actie</h2>
          <p className="text-base text-gray-600 text-center mb-6 md:mb-8">
            2:30 min demo video
          </p>
          
          {/* Video Placeholder - Zwart met witte tekst */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-float group cursor-pointer">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center group-hover:scale-110 transition-transform border-2 border-white/30">
                <Play className="h-10 w-10 ml-1" />
              </div>
            </div>
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-sm font-medium opacity-80">Product Demo</p>
              <p className="text-2xl font-semibold">2:30 min</p>
            </div>
          </div>
        </div>
      </section>

      <Separator variant="float" spacing="sm" />

      {/* FAQ Section - REALISTISCH & INFORMATIEF */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
          <SectionHeading className="mb-3">Veelgestelde Vragen over de Automatische Kattenbak</SectionHeading>
          <p className="text-base text-gray-600 text-center mb-6 md:mb-8">
            Alles over zelfreiniging, capaciteit, app-bediening en gezondheidsmonitoring
          </p>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden hover:border-accent transition-colors">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-base md:text-lg">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="h-5 w-5 text-accent flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <Separator variant="float" spacing="sm" />
                    <p className="text-gray-600 leading-relaxed">{faq.a}</p>
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
