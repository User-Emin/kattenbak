"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChatPopup } from "@/components/ui/chat-popup";
import { Separator } from "@/components/ui/separator";
import { VideoPlayer } from "@/components/ui/video-player";
import { SectionHeading } from "@/components/ui/section-heading";
// ProductUspBanner only on product detail pages
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
      <section className="relative min-h-[80vh] flex items-end overflow-hidden">
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
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

        <div className="container mx-auto px-6 lg:px-12 pb-12 md:pb-16 relative z-10">
          <div className="max-w-2xl">
            {/* Stabiele Titel - DRY: Via Settings */}
            <h1 className="text-4xl md:text-6xl font-normal mb-4 leading-tight text-white drop-shadow-lg">
              {hero.title}
            </h1>

            <p className="text-base md:text-lg font-light text-white/90 mb-6 drop-shadow-md max-w-2xl mx-auto">
              {hero.subtitle}
            </p>

            {/* Compacte CTA Button */}
            <div className="">
              <Link href={`/product/${productSlug}`}>
                <button className="h-12 px-8 text-sm font-semibold text-white bg-[#f76402] hover:bg-[#e55a02] rounded-sm shadow-xl transition-all duration-200">
                  Bekijk Product
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table - Waarom deze kattenbak beter is */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
              Vergelijk de Verschillen
            </h2>
            <p className="text-base text-gray-600">
              Ontdek waarom onze kattenbak superieur is
            </p>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700 bg-gray-50">Feature</th>
                    <th className="py-4 px-4 text-center text-sm font-semibold text-white bg-[#f76402]">Onze Kattenbak</th>
                    <th className="py-4 px-4 text-center text-sm font-semibold text-gray-700 bg-gray-50">Andere Merken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 text-sm text-gray-700">Zelfreinigende Functie</td>
                    <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors bg-blue-50/30">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">Open-Top, Low-Stress Design</td>
                    <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-4 text-center text-gray-400">×</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors bg-blue-50/30">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">Dubbele Veiligheidssensoren</td>
                    <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-4 text-center text-gray-400">×</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 text-sm text-gray-700">App Bediening & Gezondheidsmonitoring</td>
                    <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors bg-blue-50/30">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">High-Efficiency Filter</td>
                    <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-4 text-center text-gray-400">×</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors bg-orange-50">
                    <td className="py-4 px-4 text-sm font-bold text-gray-900">Afvalbak Capaciteit</td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-lg font-bold text-[#f76402]">10.5L</span>
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-gray-500">7-9L</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors bg-blue-50/30">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">Anti-Splash Hoge Wanden</td>
                    <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-4 text-center text-gray-400">×</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors bg-blue-50/30">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">Makkelijk Te Demonteren</td>
                    <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-4 text-center text-gray-400">×</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 text-sm text-gray-700">Alle Soorten Kattenbakvulling</td>
                    <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors bg-blue-50/30">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">Compact Design, Groot Interieur</td>
                    <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-4 text-center text-gray-400">×</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 text-sm text-gray-700">Ultra-Quiet Motor (&lt;40dB)</td>
                    <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors bg-blue-50/30">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">Modulair Design (OEM-Friendly)</td>
                    <td className="py-4 px-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                    <td className="py-4 px-4 text-center text-gray-400">×</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href={`/product/${productSlug}`}>
              <button className="h-12 px-8 text-sm font-semibold text-white bg-[#f76402] hover:bg-[#e55a02] rounded-sm shadow-lg transition-all duration-200">
                Bekijk Alle Details
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Separator variant="float" spacing="sm" />

      {/* Video/Demo Section - Consistent styling met rest van pagina */}
      <section id="video" className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Zie Het in Actie</h2>
            <p className="text-base text-gray-600">
              <strong>2:30 min</strong> demo video
            </p>
          </div>
          
          {/* Video Player - DYNAMISCH: Toont geüploade video van product */}
          {product?.videoUrl ? (
            <VideoPlayer
              videoUrl={product.videoUrl}
              posterUrl={hero.image}
              type="demo"
              controls
              className="rounded-lg overflow-hidden shadow-lg"
            />
          ) : (
            /* Fallback: Video placeholder als geen video geüpload */
            <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden shadow-lg group cursor-pointer">
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

      {/* FAQ Section - ORANJE HOVER: Strakke accordion met oranje accenten */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
              Veelgestelde Vragen over de Automatische Kattenbak
            </h2>
            <p className="text-base text-gray-600">
              Alles over <strong>zelfreiniging</strong>, <strong>capaciteit</strong>, <strong>app-bediening</strong> en <strong>gezondheidsmonitoring</strong>
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
                  <span className="font-semibold text-base text-gray-900 pr-4 group-hover:text-[#f76402] transition-colors">
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
                    <p className="text-gray-700 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator variant="float" spacing="sm" />

      {/* USP Features - Met afbeeldingen onderaan */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2 text-center">
            Waarom Kiezen Voor Deze Kattenbak?
          </h2>
          <p className="text-base text-gray-600 mb-10 text-center">
            De belangrijkste features met visuele demonstraties
          </p>
          
          {/* Feature 1 - Links: Image, Rechts: Content */}
          <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-sm">
              <Image
                src={usps.feature1.image}
                alt="10.5L Capaciteit"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-start gap-4 mb-4">
                <Package className="h-8 w-8 text-[#f76402] flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    <strong className="text-[#f76402]">10.5L</strong> Capaciteit
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    De <strong>grootste afvalbak</strong> in zijn klasse. Minder vaak legen betekent meer vrijheid voor jou.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 - ZIGZAG: Links: Content, Rechts: Image */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <div className="flex items-start gap-4 mb-4">
                <Volume2 className="h-8 w-8 text-[#f76402] flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    <strong className="text-[#f76402]">Ultra-Quiet</strong> Motor
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Werkt onder <strong>40 decibel</strong>. Zo stil dat je het nauwelijks hoort, maar het doet zijn werk perfect.
                  </p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 relative aspect-video rounded-lg overflow-hidden shadow-sm">
              <Image
                src={usps.feature2.image}
                alt="Ultra-Quiet Motor"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Chat Popup - ALTIJD ZICHTBAAR */}
      <ChatPopup />
    </div>
  );
}
