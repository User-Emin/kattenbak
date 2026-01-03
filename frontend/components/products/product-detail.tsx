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
    <div className="min-h-screen bg-white">
      {/* COOLBLUE: Mobiel edge-to-edge, desktop normaal */}
      <div className="px-4 md:px-6 lg:px-10 pt-4 pb-0 bg-white max-w-[1400px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center mb-3">
          <Link href="/" className="text-sm text-gray-600 hover:text-[#f76402] transition-colors font-light">
            Home
          </Link>
          <span className="text-gray-400 mx-2 text-sm">/</span>
          <span className="text-sm text-gray-500 font-light">{product.name}</span>
        </nav>
        
        {/* Titel - DIRECT boven foto, geen margin onder */}
        <h1 className="text-2xl font-light text-gray-900 mb-2">{product.name}</h1>
      </div>

      {/* Grid DIRECT na titel - GEEN extra padding */}
      <div className="px-4 md:px-6 lg:px-10 bg-white max-w-[1400px] mx-auto">
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
            {/* Prijs - PROMINENT zoals Coolblue */}
            <div className="space-y-1">
              <div className="text-4xl font-bold text-black">{formatPrice(finalPrice)}</div>
              <p className="text-sm text-gray-600">Incl. BTW</p>
            </div>

            {/* Color Selector - DIRECT OP ACHTERGROND */}
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

            {/* Add to Cart - COOLBLUE STYLE */}
            <div className="space-y-3" ref={addToCartButtonRef}>
              {/* COOLBLUE: Grote oranje button */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding || product.stock === 0}
                className="w-full h-14 bg-accent hover:bg-accent-dark text-white font-bold text-base px-6 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isAdding ? 'Toevoegen...' : 'In winkelwagen'}
              </button>
              
              {/* COOLBLUE USPs - klein + compact */}
              <div className="space-y-1.5 text-sm text-gray-700 font-light">
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                  <span><strong className="font-normal text-gray-900">Morgen</strong> bezorgd</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                  <span>Je krijgt <strong className="font-normal text-gray-900">30 dagen</strong> bedenktijd</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                  <span><strong className="font-normal text-gray-900">Gratis</strong> ruilen binnen 30 dagen</span>
                </div>
              </div>
            </div>

            {/* Product Specs - RUSTIGE FONTS */}
            <div className="space-y-3">
              <h3 className="font-normal text-sm text-black">Product specificaties</h3>
              <ProductSpecsComparison />
            </div>
          </div>
        </div>

        <Separator variant="float" spacing="xl" />

        {/* DRY: Product Demo Video - BOVEN Productinformatie */}
        {product.videoUrl && (
          <div className="max-w-4xl mx-auto mb-12">
            <SectionHeading className="mb-6" size="sm">
              Zie Het in Actie
            </SectionHeading>
            <VideoPlayer
              videoUrl={product.videoUrl}
              posterUrl={product.images?.[0] || ''}
              type="product"
              controls
              className="w-full aspect-video rounded-sm overflow-hidden border border-gray-200"
            />
          </div>
        )}

        {/* Product Description - COOLBLUE "PRODUCTINFORMATIE" */}
        <div className="max-w-4xl mx-auto mb-12">
          <SectionHeading className="mb-6" size="sm">
            Productinformatie
          </SectionHeading>
          
          {/* Plus- en minpunten - RUSTIGE FONTS */}
          <div className="mb-8 p-6 bg-gray-50 rounded-sm">
            
            {/* Product Highlights (PROs/CONs) - RUSTIGE FONTS */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 font-light">Automatische reiniging na elk gebruik bespaart tijd</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 font-light">Fluisterstille werking (32dB) stoort niet</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 font-light">App bediening voor real-time monitoring</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="h-5 w-5 text-gray-800 flex-shrink-0 mt-0.5 flex items-center justify-center text-xl">−</span>
                  <span className="text-sm text-gray-900 font-light">Geschikt voor katten tot 7kg</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="h-5 w-5 text-gray-800 flex-shrink-0 mt-0.5 flex items-center justify-center text-xl">−</span>
                  <span className="text-sm text-gray-900 font-light">Vereist regelmatige lediging van afvalbak</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Omschrijving - RUSTIGE FONTS */}
          <div className="prose prose-sm max-w-none">
            <h3 className="font-normal text-base mb-3 text-gray-900">Omschrijving</h3>
            <p className="text-sm text-gray-700 leading-relaxed font-light">{product.description}</p>
          </div>
        </div>

        <Separator variant="float" spacing="xl" />

        {/* Product USP Features - DRY: Same as homepage */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-3 text-center">
            Waarom deze kattenbak?
          </h2>
          <p className="text-lg text-gray-600 mb-10 text-center font-light">
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
