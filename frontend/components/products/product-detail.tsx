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

  // DRY: Fetch site settings voor productUsps
  useEffect(() => {
    apiFetch<{ success: boolean; data: SiteSettings }>(API_CONFIG.ENDPOINTS.SETTINGS)
      .then(data => {
        if (data.success && data.data) {
          setSettings(data.data);
        }
      })
      .catch(() => {});
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
        {/* Breadcrumb - COOLBLUE COMPACT */}
        <nav className="mb-4 text-xs text-gray-600">
          <Link href="/" className="hover:text-brand transition">Home</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* COOLBLUE LAYOUT: Naam BOVEN afbeelding - MEDIUM weight (niet bold) */}
        <h1 className="text-2xl font-semibold mb-4 text-gray-900">{product.name}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
          {/* Product Images - COOLBLUE: Vierkant, compact, geen rounding */}
          <div className="space-y-3">
            {/* COOLBLUE: Vierkante image, NO border, volledig zichtbaar */}
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

          {/* COOLBLUE: Info rechts - DIRECT OP ACHTERGROND (GEEN BORDERS!) */}
          <div className="space-y-6">
            {/* Prijs - DIRECT OP ACHTERGROND */}
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-900">{formatPrice(finalPrice)}</div>
              {hasDiscount && (
                <div className="flex items-center gap-2">
                  <span className="text-lg text-gray-500 line-through">{formatPrice(product.compareAtPrice!)}</span>
                  <span className="bg-red-100 text-red-700 px-2 py-1 text-sm font-bold">-{discount}%</span>
                </div>
              )}
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

            {/* Add to Cart - DIRECT OP ACHTERGROND */}
            <div className="space-y-3" ref={addToCartButtonRef}>
              <div className="flex items-stretch gap-2">
                {/* Quantity - COOLBLUE style */}
                <div className="flex items-center border border-gray-300 bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-12 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 transition"
                    aria-label="Verminder aantal"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="w-12 h-12 flex items-center justify-center font-bold border-x border-gray-300">{quantity}</div>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="w-10 h-12 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 transition"
                    aria-label="Verhoog aantal"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* COOLBLUE: Vierkante button, DRY accent color */}
                <Button
                  onClick={handleAddToCart}
                  disabled={isAdding || product.stock === 0}
                  className="flex-1 h-12 font-bold bg-accent hover:bg-accent-dark text-white rounded-none transition"
                >
                  {isAdding ? 'Toevoegen...' : 'In winkelwagen'}
                </Button>
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

        {/* Product Description - DIRECT ZICHTBAAR CENTRAAL */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <SectionHeading className="mb-6" size="sm">
            Over dit product
          </SectionHeading>
          
          {/* DRY: Product Demo Video - EXACT zoals homepage, direct onder titel */}
          {product.videoUrl && (
            <div className="mb-12">
              <VideoPlayer
                videoUrl={product.videoUrl}
                posterUrl={product.images?.[0] || ''}
                type="product"
                controls
                className="w-full aspect-video rounded-lg overflow-hidden shadow-md border border-gray-200"
              />
              <p className="text-center text-sm text-gray-500 mt-4">
                🎥 Bekijk de demo video
              </p>
            </div>
          )}
          
          <p className="text-base md:text-lg font-semibold text-gray-700 leading-relaxed">{product.description}</p>
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
