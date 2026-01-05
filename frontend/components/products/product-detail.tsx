"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { ProductUsps } from "@/components/products/product-usps";
import { ProductUspFeatures } from "@/components/products/product-usp-features";
import { VideoPlayer } from "@/components/ui/video-player";
import { Separator } from "@/components/ui/separator";
import { SectionHeading } from "@/components/ui/section-heading";
import { ChatPopup } from "@/components/ui/chat-popup";
import { StickyCartBar } from "@/components/products/sticky-cart-bar";
import { ColorSelector } from "@/components/products/color-selector";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
import Link from "next/link";
import type { Product, ProductVariant } from "@/types/product";
import { API_CONFIG, apiFetch } from "@/lib/config";
import { productsApi } from "@/lib/api/products";
import { getProductImage, IMAGE_CONFIG } from "@/lib/image-config";
import { ProductHighlights } from "@/components/products/product-highlights";
import { ProductSpecsComparison } from "@/components/products/product-specs-comparison";
import { ProductNavigation } from "@/components/products/product-navigation";

// DRY: Site Settings Type (SYNC: admin-next/lib/api/settings.ts)
interface SiteSettings {
  productUsps: {
    usp1: {
      icon: string;
      color: string;
      title: string;
      description: string;
      image: string;
    };
    usp2: {
      icon: string;
      color: string;
      title: string;
      description: string;
      image: string;
    };
  };
}

// DRY: Product USP type voor component
interface ProductUsp {
  icon: string;
  color: string;
  title: string;
  description: string;
  image: string;
}

import { ProductUspBanner } from "@/components/products/product-usp-banner";

interface ProductDetailProps {
  slug: string;
}

export function ProductDetail({ slug }: ProductDetailProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const addToCartButtonRef = useRef<HTMLDivElement>(null);

  // DRY: Fetch product data using productsApi (includes price transformation!)
  useEffect(() => {
    productsApi.getBySlug(slug)
      .then(product => {
        setProduct(product);
        // DRY: Auto-select first variant if available
        if (product.variants && product.variants.length > 0) {
          setSelectedVariant(product.variants[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  // DRY: Fetch dynamic site settings for USPs
  useEffect(() => {
    fetch('/api/v1/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.productUsps) {
          setSettings(data.data);
        } else {
          // Fallback to default USPs if API fails
          setSettings({
            productUsps: {
              usp1: {
                title: "10.5L Capaciteit",
                description: "De grootste afvalbak in zijn klasse. Minder vaak legen betekent meer vrijheid voor jou.",
                icon: "capacity",
                color: "",
                image: ""
              },
              usp2: {
                title: "Ultra-Quiet Motor",
                description: "Werkt onder 40 decibel. Zo stil dat je het nauwelijks hoort, maar het doet zijn werk perfect.",
                icon: "quiet",
                color: "",
                image: ""
              }
            }
          } as SiteSettings);
        }
      })
      .catch(() => {
        // Fallback on error
        setSettings({
          productUsps: {
            usp1: {
              title: "10.5L Capaciteit",
              description: "De grootste afvalbak in zijn klasse. Minder vaak legen betekent meer vrijheid voor jou.",
              icon: "capacity",
              color: "",
              image: ""
            },
            usp2: {
              title: "Ultra-Quiet Motor",
              description: "Werkt onder 40 decibel. Zo stil dat je het nauwelijks hoort, maar het doet zijn werk perfect.",
              icon: "quiet",
              color: "",
              image: ""
            }
          }
        } as SiteSettings);
      });
  }, []);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    addItem(product, quantity);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsAdding(false);
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-4">Product niet gevonden</h1>
          <Link href="/">
            <Button variant="primary">Terug naar Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = Array.isArray(product.images) && product.images.length > 0 
    ? product.images.filter(img => img && img.trim() !== '') // ✅ SECURITY: Filter empty strings
    : [IMAGE_CONFIG.product.main];
  
  // DRY: If variant is selected and has images, use those instead
  const displayImages = selectedVariant && selectedVariant.images && selectedVariant.images.length > 0
    ? selectedVariant.images.filter(img => img && img.trim() !== '') // ✅ SECURITY: Filter empty strings
    : images;
  
  // DRY: Calculate final price (base + variant adjustment)
  const finalPrice = selectedVariant 
    ? product.price + selectedVariant.price 
    : product.price;
  
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > finalPrice;
  const discount = hasDiscount ? Math.round(((product.compareAtPrice! - finalPrice) / product.compareAtPrice!) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* COOLBLUE: Mobiel edge-to-edge, desktop normaal */}
      <div className="px-4 md:px-6 lg:px-10 pt-4 pb-0 max-w-[1400px] mx-auto">
        {/* Breadcrumb - STRAK (links boven) */}
        <nav className="flex items-center mb-3">
          <Link href="/" className="text-sm text-gray-700 hover:text-[#f76402] transition-colors font-medium">
            Home
          </Link>
          <span className="text-gray-400 mx-2 text-sm font-medium">/</span>
          <span className="text-sm text-gray-800 font-medium">{product.name}</span>
        </nav>
      </div>

      {/* Grid DIRECT na breadcrumb - GEEN titel hier */}
      <div className="px-4 md:px-6 lg:px-10 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 md:gap-8">
          {/* Product Images - DIRECT op achtergrond, geen vakje */}
          <div className="space-y-3">
            {/* Main image - GEEN border, GEEN bg-gray, DIRECT op wit + SWIPE BUTTONS */}
            <div className="relative aspect-square overflow-hidden group">
              <img
                src={displayImages[selectedImage] || '/images/placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-contain p-4 md:p-8 transition-opacity duration-300"
                loading="eager"
              />
              
              {/* Swipe buttons - ALLEEN TONEN als er meerdere afbeeldingen zijn */}
              {displayImages.length > 1 && (
                <>
                  {/* Previous button */}
                  {selectedImage > 0 && (
                    <button
                      onClick={() => setSelectedImage(selectedImage - 1)}
                      className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
                      aria-label="Vorige afbeelding"
                    >
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Next button */}
                  {selectedImage < displayImages.length - 1 && (
                    <button
                      onClick={() => setSelectedImage(selectedImage + 1)}
                      className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
                      aria-label="Volgende afbeelding"
                    >
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Image counter */}
                  <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-black/60 text-white text-xs md:text-sm px-3 py-1 rounded-full">
                    {selectedImage + 1} / {displayImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {displayImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0 overflow-hidden transition border-2 ${
                      selectedImage === idx ? 'border-brand' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img src={img || '/images/placeholder.jpg'} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info rechts */}
          <div className="space-y-6">
            {/* Productnaam - NORMAAL FONT */}
            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">{product.name}</h1>
            </div>

            {/* Color Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <ColorSelector
                  variants={product.variants}
                  selectedVariant={selectedVariant}
                  onSelect={(variant) => {
                    setSelectedVariant(variant);
                    if (variant.images && variant.images.length > 0) {
                      setSelectedImage(0);
                    }
                  }}
                />
              </div>
            )}

            {/* Prijs ONDER kleuropties - KLEINER */}
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900">{formatPrice(finalPrice)}</div>
              <p className="text-xs font-normal text-gray-600">Incl. BTW • Gratis verzending • Direct leverbaar</p>
            </div>

            {/* Add to Cart - STRAK & CLEAN */}
            <div className="space-y-4" ref={addToCartButtonRef}>
              {/* GROTE PROMINENTE BUTTON - GEEN SHADOW, GEEN TRANSFORM */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding || product.stock === 0}
                className="w-full h-16 bg-[#f76402] hover:bg-[#e55a00] text-white font-black text-lg px-8 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-3">
                  <ShoppingCart className="w-6 h-6" strokeWidth={2.5} />
                  <span>{isAdding ? 'Wordt toegevoegd...' : 'In winkelwagen'}</span>
                </div>
              </button>
              
              {/* USP BANNER - LICHTE FONTS MET DIKKE ACCENTEN */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <svg className="flex-shrink-0 w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700">Levertijd <span className="font-bold text-gray-900">1-2 werkdagen</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="flex-shrink-0 w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700"><span className="font-bold text-gray-900">30 dagen</span> bedenktijd • <span className="font-bold text-gray-900">Gratis</span> retour</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="flex-shrink-0 w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700"><span className="font-bold text-gray-900">1 jaar</span> garantie • <span className="font-bold text-gray-900">Altijd</span> betrouwbaar</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="flex-shrink-0 w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700">Inclusief: <span className="font-bold text-gray-900">1 rol strooisel + geurblokje</span></span>
                </div>
              </div>
            </div>

            {/* Product Specs - DIKKER */}
            <div className="space-y-3">
              <h3 className="font-bold text-base text-gray-900">Product specificaties</h3>
              <ProductSpecsComparison />
            </div>
          </div>
        </div>

        <Separator variant="float" spacing="xl" />

        {/* DRY: Product Demo Video - STRAK */}
        {product.videoUrl && (
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-normal text-gray-900 mb-6 text-center">
              Zie Het in Actie
            </h2>
            <VideoPlayer
              videoUrl={product.videoUrl}
              posterUrl={product.images?.[0] || ''}
              type="product"
              controls
              className="w-full aspect-video rounded-lg overflow-hidden border border-gray-200"
            />
          </div>
        )}

        {/* Product Description - STRAK & RELEVANT */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-normal text-gray-900 mb-6 text-center">
            Productinformatie
          </h2>
          
          {/* Plus- en minpunten - STRAK met lichte achtergrond */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
            
            {/* Product Highlights (PROs/CONs) - CUSTOM VECTORS */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 mb-4">Pluspunten</h3>
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-900 font-medium">Automatische reiniging na elk gebruik bespaart tijd</span>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-900 font-medium">Fluisterstille werking (32dB) stoort niet</span>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-900 font-medium">App bediening voor real-time monitoring</span>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-base font-bold text-gray-900 mb-4">Let op</h3>
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-sm text-gray-900 font-medium">Geschikt voor katten tot 7kg (max 12.5kg)</span>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-sm text-gray-900 font-medium">Niet geschikt voor kittens onder 6 maanden</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Veiligheidsinstructies - COMPACT */}
          <div className="mb-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h3 className="font-bold text-sm mb-3 text-gray-900 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Veiligheidsinstructies
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-800">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">•</span>
                <span>Niet geschikt voor kittens onder 6 maanden. Wen uw kat geleidelijk aan het apparaat.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">•</span>
                <span>Maximaal gewicht: 3.3-11.5KG (aanbevolen max 12.5KG voor optimale werking).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">•</span>
                <span>Plaats op een stabiel, vlak oppervlak. Niet op verhoogde plaatsen vanwege valgevaar.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">•</span>
                <span>Gebruik het originele netsnoer en adapter. Niet onderdompelen in water.</span>
              </li>
            </ul>
          </div>
          
          {/* Omschrijving - STRAK */}
          <div className="prose prose-sm max-w-none">
            <h3 className="font-bold text-base mb-4 text-gray-900">Omschrijving</h3>
            <p className="text-sm text-gray-800 leading-relaxed font-normal">{product.description}</p>
          </div>
        </div>

        <Separator variant="float" spacing="xl" />

        {/* Product USP Features - STRAK */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-normal text-gray-900 mb-4 text-center">
            Waarom deze kattenbak?
          </h2>
          <p className="text-base text-gray-700 mb-10 text-center font-medium">
            De twee belangrijkste features die het verschil maken
          </p>
          
          <ProductUspFeatures />
          </div>

        <Separator variant="float" spacing="xl" />
      </div>

      {/* Sticky Cart Bar - SMOOTH BOTTOM BANNER */}
      {/* Sticky Cart Bar */}
      <StickyCartBar product={product} addToCartButtonRef={addToCartButtonRef} />

      {/* Product Navigation - Smooth swipe buttons in footer */}
      <ProductNavigation currentProduct={product} />

      {/* Chat Popup - ALTIJD ZICHTBAAR */}
      <ChatPopup />
    </div>
  );
}
