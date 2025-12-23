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

  // DRY: Fetch product data
  useEffect(() => {
    apiFetch<{ success: boolean; data: Product }>(API_CONFIG.ENDPOINTS.PRODUCT_BY_SLUG(slug))
      .then(data => {
        if (data.success && data.data) {
          setProduct(data.data);
          // DRY: Auto-select first variant if available
          if (data.data.variants && data.data.variants.length > 0) {
            setSelectedVariant(data.data.variants[0]);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  // TEMP: Hardcoded USPs (settings endpoint niet beschikbaar)
  // TODO: Re-enable when /api/v1/admin/settings is implemented
  useEffect(() => {
    // Hardcoded product USPs
    setSettings({
      productUsps: {
        usp1: {
          title: "10.5L Capaciteit",
          description: "De grootste afvalbak in zijn klasse. Minder vaak legen betekent meer vrijheid voor jou.",
          icon: "capacity"
        },
        usp2: {
          title: "Ultra-Quiet Motor",
          description: "Werkt onder 40 decibel. Zo stil dat je het nauwelijks hoort, maar het doet zijn werk perfect.",
          icon: "quiet"
        }
      }
    } as SiteSettings);
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
    ? product.images 
    : [IMAGE_CONFIG.product.main];
  
  // DRY: If variant is selected and has images, use those instead
  const displayImages = selectedVariant && selectedVariant.images && selectedVariant.images.length > 0
    ? selectedVariant.images
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
      
      {/* COOLBLUE-STYLE: Compact container, max-w-6xl, EXPLICIETE #FFFFFF achtergrond */}
      <div className="max-w-6xl mx-auto px-4 py-6 bg-[#FFFFFF]">
        {/* Breadcrumb - compact */}
        <nav className="mb-3">
          <Link href="/" className="text-sm text-gray-600 hover:text-brand transition-colors">
            Home
          </Link>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-sm text-gray-900">{product.name}</span>
        </nav>

        {/* Titel BOVEN afbeelding (niet overlay) */}
        <h1 className="text-2xl font-semibold mb-4 text-gray-900">{product.name}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Product Images - BREED zoals Coolblue */}
          <div className="space-y-3">
            {/* Afbeelding zonder titel overlay */}
            <div className="relative aspect-square bg-white overflow-hidden">
              <ProductImage
                src={displayImages[selectedImage]}
                alt={product.name}
                fill
                className="object-contain"
                priority
                enableZoom={true}
                zoomScale={2.5}
              />
            </div>

            {/* COOLBLUE: Kleine vierkante thumbnails */}
            {displayImages.length > 1 && (
              <div className="flex gap-2">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-16 h-16 bg-white border overflow-hidden transition ${
                      selectedImage === idx ? 'border-brand border-2' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <ProductImage src={img} alt={`${product.name} ${idx + 1}`} fill className="object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COOLBLUE: Info rechts - COMPACT */}
          <div className="space-y-5 lg:pl-6">
            {/* Prijs - RUSTIGER */}
            <div className="space-y-1">
              <div className="text-2xl font-semibold text-gray-900">{formatPrice(finalPrice)}</div>
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

            {/* Add to Cart - COOLBLUE EYECATCHERS */}
            <div className="space-y-4" ref={addToCartButtonRef}>
              {/* COOLBLUE: ECHT ORANJE BUTTON zoals sticky cart! */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding || product.stock === 0}
                className="w-full h-12 bg-accent hover:bg-accent-dark text-white font-bold px-6 py-2.5 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? 'Toevoegen...' : 'In winkelwagen'}
              </button>
              
              {/* COOLBLUE EYECATCHERS - onder button (ZONDER klantbeoordeling) */}
              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                  <span><strong>Morgen</strong> bezorgd</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                  <span>Je krijgt <strong>30 dagen</strong> bedenktijd</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                  <span><strong>Gratis</strong> ruilen binnen 30 dagen</span>
                </div>
              </div>
            </div>

            {/* Product Specs - DIRECT OP ACHTERGROND, LICHTERE TITEL */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-gray-700">Product specificaties</h3>
              <ProductSpecsComparison />
            </div>
          </div>
        </div>

        <Separator variant="float" spacing="xl" />

        {/* Product Description - COOLBLUE "PRODUCTINFORMATIE" */}
        <div className="max-w-4xl mx-auto mb-12">
          <SectionHeading className="mb-6" size="sm">
            Productinformatie
          </SectionHeading>
          
          {/* Plus- en minpunten */}
          <div className="mb-8 p-6 bg-gray-50 rounded-sm">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Plus- en minpunten</h3>
            <p className="text-sm text-gray-600 mb-3 italic">Volgens onze kattenbak specialist</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Automatische reiniging na elk gebruik bespaart tijd</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Fluisterstille werking (32dB) stoort niet</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">App bediening voor real-time monitoring</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5">−</span>
                  <span className="text-sm text-gray-700">Geschikt voor katten tot 7kg</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5">−</span>
                  <span className="text-sm text-gray-700">Vereist regelmatige lediging van afvalbak</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Omschrijving */}
          <div className="prose prose-sm max-w-none">
            <h3 className="font-semibold text-base mb-3 text-gray-900">Omschrijving</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
          </div>
          
          {/* DRY: Product Demo Video - EXACT zoals homepage, direct onder omschrijving */}
          {product.videoUrl && (
            <div className="mt-8">
              <VideoPlayer
                videoUrl={product.videoUrl}
                posterUrl={product.images?.[0] || ''}
                type="product"
                controls
                className="w-full aspect-video rounded-sm overflow-hidden border border-gray-200"
              />
            </div>
          )}
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
