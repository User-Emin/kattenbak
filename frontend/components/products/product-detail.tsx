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
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        {/* Breadcrumb - DIKKE TEKST */}
        <nav className="mb-8 text-sm">
          <Link href="/" className="text-brand hover:text-brand-dark transition font-semibold">Home</Link>
          <span className="mx-2 text-gray-400 font-semibold">/</span>
          <span className="text-gray-900 font-semibold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images - VIERKANT & COMPACT */}
          <div className="space-y-4">
            {/* Main Product Image - Vierkantiger (rounded-lg) */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
              <ProductImage
                src={displayImages[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                enableZoom={true}
                zoomScale={2.5}
              />
            </div>

            {/* Thumbnail Gallery - Vierkantiger (rounded-md) */}
            {displayImages.length > 1 && (
              <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                <div className="flex gap-3 min-w-min">
                  {displayImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative flex-shrink-0 w-24 h-24 bg-white rounded-md overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-brand shadow-sm' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <ProductImage src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Info - COMPACT & BOXED */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {/* Productnaam - COMPACT */}
              <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight text-gray-900">{product.name}</h1>
              
              {/* USPs - COMPACT */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-brand flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700">Gratis verzending vanaf €50</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-brand flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700">10.5L capaciteit - Grootste afvalbak</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-brand flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700">Ultra-stil motor (&lt;40 decibel)</span>
                </div>
              </div>

              <Separator variant="float" spacing="sm" />

              {/* Prijs - COMPACT & PROMINENT */}
              <div className="my-4">
                <div className="text-3xl md:text-4xl font-bold text-gray-900">{formatPrice(finalPrice)}</div>
              </div>

              {/* Marketing USPs */}

              {/* Color Selector - DRY: Alleen als er variants zijn */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <ColorSelector
                    variants={product.variants}
                    selectedVariant={selectedVariant}
                    onSelect={(variant) => {
                      setSelectedVariant(variant);
                      // DRY: Switch images if variant has custom images
                      if (variant.images && variant.images.length > 0) {
                        setSelectedImage(0);
                      }
                    }}
                  />
                </div>
              )}

              {/* Marketing USPs - Minimaal, zonder kaartje */}
              <div className="mb-6 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-brand rounded-full"></div>
                  <span className="text-sm font-semibold text-gray-600">14 dagen bedenktijd</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-brand rounded-full"></div>
                  <span className="text-sm font-semibold text-gray-600">Veilig betalen met Mollie</span>
                </div>
              </div>

              {/* CTA Button - DIK TEKST, GEEN PIJL */}
              <div ref={addToCartButtonRef} className="mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="w-full h-16 text-lg font-bold text-white bg-black hover:bg-gray-900 rounded-full transition-all duration-200 mb-4"
                >
                  <div className="flex items-center justify-center gap-3">
                    {isAdding ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-3 border-current border-t-transparent" />
                        <span className="tracking-wide">Toevoegen...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-6 w-6" />
                        <span className="tracking-wide">In Winkelwagen</span>
                      </>
                    )}
                  </div>
                </button>

                {/* Aantal Selector - ALTIJD HORIZONTAAL, HOVER NAVBAR BLAUW */}
                <div className="flex flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-12 h-12 rounded-full border-2 border-gray-400 hover:border-brand hover:bg-brand/5 flex items-center justify-center transition disabled:opacity-30 bg-white"
                    aria-label="Verlaag aantal"
                  >
                    <Minus className="h-4 w-4 text-gray-700" />
                  </button>
                  
                  <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="w-12 h-12 rounded-full border-2 border-gray-400 hover:border-brand hover:bg-brand/5 flex items-center justify-center transition disabled:opacity-30 bg-white"
                    aria-label="Verhoog aantal"
                  >
                    <Plus className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              </div>

              <Separator variant="float" spacing="md" />

              {/* Product Specs Comparison - ACCORDION BALKEN */}
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
