"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Play, Check, ChevronDown, ChevronUp } from "lucide-react";
import type { Product } from "@/types/product";
import { API_CONFIG, SITE_CONFIG, apiFetch } from "@/lib/config";
import { IMAGE_CONFIG, getImageFillProps } from "@/lib/image-config";

const faqs = [
  {
    q: "Waarom is deze kattenbak beter dan concurrenten?",
    a: "Onze kattenbak heeft een 10.5L afvalbak (grootste op de markt), dubbele veiligheidssensoren, open-top design voor minder stress, en een ultra-stille motor (<40dB). Plus: modulair ontwerp voor gemakkelijke reiniging."
  },
  {
    q: "Hoe werken de dubbele veiligheidssensoren?",
    a: "Twee onafhankelijke sensoren detecteren wanneer je kat de bak benadert of binnenkomt. De reiniging stopt onmiddellijk en start pas 3 minuten na het laatste bezoek. Dit is uniek - andere merken hebben maar één sensor."
  },
  {
    q: "Wat maakt het open-top design beter?",
    a: "Katten zijn van nature waakzaam. Een open bovenkant zorgt dat ze alles kunnen zien, waardoor ze zich veiliger voelen en minder gestrest zijn. Dit vermindert gedragsproblemen en zorgt voor meer gebruik."
  },
  {
    q: "Is de 10.5L afvalbak echt zo belangrijk?",
    a: "Ja! Met 10.5L hoef je bij één kat slechts 1x per week te legen (vs. 2-3x bij 7-9L concurrenten). Dit bespaart tijd en vermindert geur doordat afval langer afgesloten blijft."
  },
  {
    q: "Welk type kattengrit moet ik gebruiken?",
    a: "Geschikt voor de meeste soorten: klonterende bentoniet, silica gel, en plantaardige grit. Alleen niet geschikt voor houtkorrels of zeer grove korrels. Concurrent bakken werken vaak alleen met specifieke dure merken."
  },
  {
    q: "Hoe stil is de motor echt?",
    a: "Met <40dB is onze motor stil genoeg voor gebruik in slaapkamers. Vergelijkbaar met fluisteren. Andere bakken produceren vaak 50-60dB (vergelijkbaar met een normaal gesprek)."
  },
  {
    q: "Wat houdt de app-monitoring precies in?",
    a: "Track het aantal bezoeken, gewicht van afval, reinigingstijden en ontvang gezondheidsalerts. Bijv. bij plotselinge toename van bezoeken (mogelijk urineweginfectie) krijg je een notificatie."
  },
  {
    q: "Hoe eenvoudig is het om te reinigen?",
    a: "Volledig modulair: alle onderdelen kunnen los voor grondige reiniging. Geen verborgen hoeken waar vuil zich ophoopt. Dit is uniek - de meeste concurrenten hebben sealed units die moeilijk te reinigen zijn."
  },
];

export default function HomePage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    apiFetch<{ success: boolean; data: Product[] }>(API_CONFIG.ENDPOINTS.PRODUCTS_FEATURED)
      .then(data => setProduct(data.data?.[0] || null))
      .catch(() => {});
  }, []);


  // Check cart state from window (set by Header component)
  useEffect(() => {
    const checkCartState = () => {
      if (typeof window !== 'undefined') {
        const cartOpen = (window as any).__isCartOpen || false;
        setIsCartOpen(cartOpen);
      }
    };
    
    const interval = setInterval(checkCartState, 100);
    return () => clearInterval(interval);
  }, []);

  // Product slug - single source
  const productSlug = product?.slug || SITE_CONFIG.DEFAULT_PRODUCT_SLUG;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Met Volledige Afbeelding */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        {/* Background Image - Volledig zichtbaar */}
        <div className="absolute inset-0 z-0">
          <Image
            {...getImageFillProps(IMAGE_CONFIG.hero)}
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-light mb-6 leading-tight animate-fade-in text-white drop-shadow-lg">
              Slimste Kattenbak
            </h1>

            <p className="text-xl md:text-2xl text-white mb-10 drop-shadow-md">
              Automatisch • Smart • Hygiënisch
            </p>

            <div className="flex flex-row gap-2 sm:gap-4 justify-center mb-12 max-w-2xl mx-auto px-4">
              <Link href={`/product/${productSlug}`} className="flex-1">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />} fullWidth className="text-sm sm:text-base">
                  Bekijk Product
                </Button>
              </Link>
              <Link href="#video" className="flex-1">
                <Button size="lg" variant="brand" leftIcon={<Play className="h-4 w-4 sm:h-5 sm:w-5" />} fullWidth className="text-sm sm:text-base">
                  Demo Video
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-accent" />
                <span>Gratis verzending</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-accent" />
                <span>2 jaar garantie</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-accent" />
                <span>14 dagen retour</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator variant="float" spacing="xl" />

      {/* USP Section - 2 Beste Features */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
          <h2 className="text-4xl font-semibold text-center mb-20">De Beste Innovatie</h2>
          
          {/* Feature 1 - 10.5L Capaciteit MET Afbeelding */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="mb-6">
                <h3 className="text-3xl font-medium">10.5L Capaciteit</h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-xl">
                De grootste afvalbak in zijn klasse. Minder vaak legen betekent meer vrijheid voor jou.
              </p>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden">
              <Image
                {...getImageFillProps(IMAGE_CONFIG.usps.capacity)}
                className="object-cover"
              />
            </div>
          </div>

          <Separator variant="float" spacing="xl" />

          {/* Feature 2 - Ultra-Quiet <40dB MET Afbeelding */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative aspect-square rounded-3xl overflow-hidden">
              <Image
                {...getImageFillProps(IMAGE_CONFIG.usps.quiet)}
                className="object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <div className="mb-6">
                <h3 className="text-3xl font-medium">Ultra-Quiet Motor</h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-xl">
                Werkt onder 40 decibel. Zo stil dat je het nauwelijks hoort, maar het doet zijn werk perfect.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator variant="float" spacing="xl" />

      {/* Video/Demo Section */}
      <section id="video" className="py-20">
        <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
          <h2 className="text-4xl font-semibold text-center mb-6">Zie Het in Actie</h2>
          <p className="text-lg text-gray-600 text-center mb-12">
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
          <h2 className="text-4xl font-semibold text-center mb-4">Vragen Over ALP 1071</h2>
          <p className="text-gray-600 text-center mb-12">
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

    </div>
  );
}
