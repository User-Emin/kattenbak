"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { ProductUsps } from "@/components/products/product-usps";
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
      {/* COOLBLUE USP BANNER - ONDER NAVBAR */}
      <ProductUspBanner />
      
      {/* PRODUCT DETAIL: Aligned met navbar logo (px-6 lg:px-10, GEEN container) */}
      <div className="px-6 lg:px-10 py-6 bg-[#FFFFFF] max-w-[1400px] mx-auto">
        {/* Breadcrumb - compact */}
        {/* Breadcrumb - ✅ MAXIMAAL DONKER */}
        <nav className="mb-2">
          <Link href="/" className="text-sm text-gray-700 hover:text-brand transition-colors">
            Home
          </Link>
          <span className="text-gray-500 mx-2">/</span>
          <span className="text-sm text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* COOLBLUE STYLE: Title klein + direct product zichtbaar */}
        <h1 className="text-xl font-semibold mb-5 text-black leading-tight">{product.name}</h1>

        {/* COOLBLUE LAYOUT: Links afbeelding GROTER, rechts info compacter */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_360px] gap-6">
          {/* Product Images - COOLBLUE STYLE: GROTE product foto direct zichtbaar */}
          <div className="space-y-2">
            {/* Main image - MAXIMALE GROOTTE voor directe zichtbaarheid */}
            <div className="relative aspect-square bg-gray-50 overflow-hidden rounded-sm border border-gray-200">
              <img
                src={displayImages[selectedImage] || '/images/placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-contain cursor-zoom-in p-4"
                loading="eager"
              />
            </div>

            {/* COOLBLUE: Kleine thumbnails ONDER main image */}
            {displayImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-14 h-14 flex-shrink-0 bg-white border rounded-sm overflow-hidden transition ${
                      selectedImage === idx ? 'border-brand border-2' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img src={img || '/images/placeholder.jpg'} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COOLBLUE: Info rechts - SUPER COMPACT */}
          <div className="space-y-4">
            {/* Prijs - PROMINENT zoals Coolblue */}
            <div className="space-y-0.5">
              <div className="text-3xl font-bold text-black">{formatPrice(finalPrice)}</div>
              <p className="text-xs text-gray-600">Incl. BTW</p>
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
              <div className="space-y-1.5 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                  <span><strong className="font-semibold text-gray-900">Morgen</strong> bezorgd</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                  <span>Je krijgt <strong className="font-semibold text-gray-900">30 dagen</strong> bedenktijd</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                  <span><strong className="font-semibold text-gray-900">Gratis</strong> ruilen binnen 30 dagen</span>
                </div>
              </div>
            </div>

            {/* Product Specs - DIRECT OP ACHTERGROND, LICHTERE TITEL */}
            {/* Product specs - ✅ COMPACT maar ZWARTER */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-black">Product specificaties</h3>
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
          
          {/* Plus- en minpunten */}
          <div className="mb-8 p-6 bg-gray-50 rounded-sm">
            
            {/* Product Highlights (PROs/CONs) - ✅ MAXIMAAL DONKER ZWART */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-black">Automatische reiniging na elk gebruik bespaart tijd</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-black">Fluisterstille werking (32dB) stoort niet</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-black">App bediening voor real-time monitoring</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="h-5 w-5 text-gray-800 flex-shrink-0 mt-0.5 flex items-center justify-center text-xl">−</span>
                  <span className="text-sm text-black">Geschikt voor katten tot 7kg</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="h-5 w-5 text-gray-800 flex-shrink-0 mt-0.5 flex items-center justify-center text-xl">−</span>
                  <span className="text-sm text-black">Vereist regelmatige lediging van afvalbak</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Omschrijving - ✅ MAXIMAAL DONKER ZWART */}
          <div className="prose prose-sm max-w-none">
            <h3 className="font-semibold text-base mb-3 text-black">Omschrijving</h3>
            <p className="text-sm text-black leading-relaxed">{product.description}</p>
          </div>
        </div>

        <Separator variant="float" spacing="xl" />

        {/* Product USPs - DRY: Zigzag layout met dynamische content */}
        {settings?.productUsps && (
          <div className="container mx-auto px-6 lg:px-12">
            <ProductUsps usps={[settings.productUsps.usp1, settings.productUsps.usp2]} />
          </div>
        )}

        <Separator variant="float" spacing="xl" />
      </div>

      {/* Sticky Cart Bar - SMOOTH BOTTOM BANNER */}
      <StickyCartBar product={product} addToCartButtonRef={addToCartButtonRef} />

      {/* Chat Popup - ALTIJD ZICHTBAAR */}
      <ChatPopup />
    </div>
  );
}
