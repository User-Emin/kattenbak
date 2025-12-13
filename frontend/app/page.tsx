"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChatPopup } from "@/components/ui/chat-popup";
import { Separator } from "@/components/ui/separator";
import { ProductVideo } from "@/components/ui/product-video";
import { SectionHeading } from "@/components/ui/section-heading";
import { ArrowRight, Play, Check, MessageCircle, ChevronDown, ChevronUp, Package, Volume2, Sparkles, Smartphone } from "lucide-react";
import type { Product } from "@/types/product";
import { API_CONFIG, SITE_CONFIG, apiFetch } from "@/lib/config";
import { IMAGE_CONFIG, getImageFillProps } from "@/lib/image-config";
import { useUI } from "@/context/ui-context";
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

const faqs = [
  {
    q: "Hoe werkt de zelfreinigende functie?",
    a: "De kattenbak detecteert automatisch wanneer je kat klaar is en start een reinigingscyclus. Alle afval wordt verzameld in een afgesloten compartiment."
  },
  {
    q: "Voor welke katten is dit geschikt?",
    a: "Geschikt voor katten van alle maten tot 7kg. De ruime binnenruimte zorgt voor comfort."
  },
  {
    q: "Hoe vaak moet ik de afvalbak legen?",
    a: "Bij één kat ongeveer 1x per week. De 10L capaciteit betekent minder onderhoud."
  },
  {
    q: "Is de app-bediening inbegrepen?",
    a: "Ja! De app is gratis te downloaden en biedt realtime monitoring, schema's en gezondheidsrapporten."
  },
];

export default function HomePage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null); // NEW: Dynamic settings
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { isChatOpen, closeChat, openChat } = useUI();

  // DRY: Fetch settings from backend
  useEffect(() => {
    apiFetch<{ success: boolean; data: SiteSettings }>(API_CONFIG.ENDPOINTS.SETTINGS)
      .then(data => setSettings(data.data))
      .catch(() => {}); // Silent fail, use fallback
  }, []);

  // DRY: Fetch featured product (used for video on homepage)
  useEffect(() => {
    apiFetch<{ success: boolean; data: Product[] }>(API_CONFIG.ENDPOINTS.PRODUCTS_FEATURED)
      .then(data => setProduct(data.data?.[0] || null))
      .catch(() => {});
  }, []);

  // Auto-open chat na 5 seconden
  useEffect(() => {
    const timer = setTimeout(() => openChat(), 5000);
    return () => clearTimeout(timer);
  }, [openChat]);

  // Product slug - single source
  const productSlug = product?.slug || SITE_CONFIG.DEFAULT_PRODUCT_SLUG;

  // DRY: Get dynamic values with intelligent fallback
  const hero = settings?.hero || { title: 'Slimste Kattenbak', subtitle: 'Automatisch • Smart • Hygiënisch', image: IMAGE_CONFIG.hero.main };
  const usps = settings?.usps || {
    title: 'De Beste Innovatie',
    feature1: { title: '10.5L Capaciteit', description: 'De grootste afvalbak in zijn klasse. Minder vaak legen betekent meer vrijheid voor jou.', image: IMAGE_CONFIG.usps.capacity.src },
    feature2: { title: 'Ultra-Quiet Motor', description: 'Werkt onder 40 decibel. Zo stil dat je het nauwelijks hoort, maar het doet zijn werk perfect.', image: IMAGE_CONFIG.usps.quiet.src },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - DRY: Dynamisch via Featured Product Video */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        {/* Background Image OR Video - DRY: Uses featured product videoUrl */}
        <div className="absolute inset-0 z-0">
          {product?.videoUrl ? (
            /* DRY: Featured product video (same video as on product detail!) */
            <div className="w-full h-full">
              <ProductVideo
                videoUrl={product.videoUrl}
                productName={product.name}
                className="w-full h-full rounded-none"
              />
            </div>
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
            <h1 className="text-5xl md:text-7xl font-light mb-6 leading-tight text-white drop-shadow-lg">
              {hero.title}
            </h1>

            <p className="text-lg md:text-xl font-normal text-white/90 mb-10 drop-shadow-md max-w-2xl mx-auto">
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

      <Separator variant="float" spacing="xl" />

      {/* USP Section - COMPACT ZIGZAG - DYNAMISCH VIA ADMIN */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
          <SectionHeading className="mb-12">
            Waarom Kiezen Voor Deze Kattenbak?
          </SectionHeading>
          
          {/* Feature 1 - COMPACT ZIGZAG LINKS */}
          <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Package className="h-10 w-10 text-black" />
                <h3 className="text-xl font-bold text-gray-900">{usps.feature1.title}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{usps.feature1.description}</p>
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

          {/* Feature 2 - COMPACT ZIGZAG RECHTS */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="order-2 md:order-1 relative aspect-video rounded-xl overflow-hidden shadow-md">
              <Image
                src={usps.feature2.image}
                alt={usps.feature2.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-4 mb-4">
                <Volume2 className="h-10 w-10 text-black" />
                <h3 className="text-xl font-bold text-gray-900">{usps.feature2.title}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{usps.feature2.description}</p>
            </div>
          </div>
        </div>
      </section>

      <Separator variant="float" spacing="xl" />

      {/* Video/Demo Section */}
      <section id="video" className="py-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6 text-gray-900">Zie Het in Actie</h2>
          <p className="text-base text-gray-600 text-center mb-16">
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
              <p className="text-2xl font-light">2:30 min</p>
            </div>
          </div>
        </div>
      </section>

      <Separator variant="float" spacing="xl" />

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
          <SectionHeading className="mb-4">Veelgestelde Vragen</SectionHeading>
          <p className="text-base text-gray-600 text-center mb-12">
            Alles wat je moet weten
          </p>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden hover:border-accent transition-colors">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-lg">{faq.q}</span>
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

      {/* Contact Chat Popup - Altijd zichtbaar in balkje vorm */}
      {isChatOpen && <ChatPopup onClose={closeChat} />}
    </div>
  );
}
