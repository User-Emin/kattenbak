"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { Separator } from "@/components/ui/separator";
import { ColorSelector, type ProductVariant } from "@/components/products/color-selector";
// ProductSpecs component REMOVED - specs now in right column (Coolblue style)
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Plus, Minus, Check, Truck, Shield, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";
import { API_CONFIG, apiFetch } from "@/lib/config";
import { getProductImage, IMAGE_CONFIG, getImageFillProps } from "@/lib/image-config";

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
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  
  // Variant state
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    apiFetch<{ success: boolean; data: Product }>(API_CONFIG.ENDPOINTS.PRODUCT_BY_SLUG(slug))
      .then(data => {
        if (data.success && data.data) {
          setProduct(data.data);
          // Auto-select first variant if product has variants
          if (data.data.hasVariants && data.data.variants && data.data.variants.length > 0) {
            const firstActiveVariant = data.data.variants.find(v => v.isActive && v.stock > 0);
            if (firstActiveVariant) {
              setSelectedVariant(firstActiveVariant);
            }
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setSelectedImage(0); // Reset to first image of variant
  };

  // Sticky cart visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      const stickyCart = document.querySelector('[data-sticky-cart]') as HTMLElement;
      const mainCartButton = document.querySelector('[data-main-cart]') as HTMLElement;
      
      if (stickyCart && mainCartButton) {
        const mainCartRect = mainCartButton.getBoundingClientRect();
        const isMainCartVisible = mainCartRect.top >= 0 && mainCartRect.bottom <= window.innerHeight;
        
        if (isMainCartVisible) {
          // Main cart visible - hide sticky
          stickyCart.style.opacity = '0';
          stickyCart.style.transform = 'translateY(100%)';
          stickyCart.style.pointerEvents = 'none';
        } else {
          // Main cart not visible - show sticky
          stickyCart.style.opacity = '1';
          stickyCart.style.transform = 'translateY(0)';
          stickyCart.style.pointerEvents = 'auto';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    
    // Pass variant info to cart if applicable
    const cartItem = {
      ...product,
      ...(selectedVariant && {
        variantId: selectedVariant.id,
        variantName: selectedVariant.name,
        variantColor: selectedVariant.colorCode,
        // Override product images/price with variant's
        images: selectedVariant.images,
        price: product.price + (selectedVariant.priceAdjustment || 0),
      }),
    };
    
    addItem(cartItem, quantity);
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

  // Determine images and stock based on variant selection
  const displayImages = selectedVariant && selectedVariant.images.length > 0
    ? selectedVariant.images
    : (Array.isArray(product.images) && product.images.length > 0 
        ? product.images 
        : [IMAGE_CONFIG.product.main]);
  
  const displayStock = selectedVariant ? selectedVariant.stock : product.stock;
  const displayPrice = selectedVariant
    ? product.price + (selectedVariant.priceAdjustment || 0)
    : product.price;

  const images = displayImages;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > displayPrice;
  const discount = hasDiscount ? Math.round(((product.compareAtPrice! - displayPrice) / product.compareAtPrice!) * 100) : 0;

  // Pre-order calculations
  const isPreOrder = product.isPreOrder;
  const preOrderDiscountPercentage = product.preOrderDiscount || 0;
  const originalPrice = displayPrice;
  const discountedPrice = isPreOrder && preOrderDiscountPercentage > 0
    ? originalPrice * (1 - preOrderDiscountPercentage / 100)
    : originalPrice;
  const finalDisplayPrice = isPreOrder && preOrderDiscountPercentage > 0 ? discountedPrice : displayPrice;

  // STOCK CHECK - Kritiek voor voorraad systeem (uses displayStock)
  const trackInventory = product.trackInventory ?? true;
  const availableStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = trackInventory && availableStock <= 0;
  const isLowStock = trackInventory && availableStock > 0 && availableStock <= 5;

  return (
    <div className="min-h-screen bg-white py-6 pb-32">
      <div className="container mx-auto px-6 lg:px-10 max-w-7xl">
            {/* Breadcrumb - COMPACT zoals Coolblue */}
            <nav className="mb-3 text-xs">
              <Link href="/" className="text-brand hover:text-brand-dark transition">Home</Link>
              <span className="mx-1.5 text-gray-400">/</span>
              <span className="text-gray-700">{product.name}</span>
            </nav>

        {/* Product Titel - COMPACT zoals Coolblue */}
        <div className="mb-4">
          <h1 className="text-2xl font-medium leading-tight text-gray-900">{product.name}</h1>
          
          {/* Voorraad Status - Alleen bij problemen tonen */}
          {isOutOfStock ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg font-semibold mt-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Niet op voorraad
            </div>
          ) : isLowStock ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg font-semibold mt-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Laatste {displayStock} op voorraad
            </div>
          ) : null}
        </div>

        {/* SYMMETRISCHE LAYOUT: Afbeeldingen LINKS | Info RECHTS op zelfde hoogte */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* LINKS: Afbeeldingen (zonder titel, die staat erboven) */}
          <div className="space-y-4">
            {/* Main Product Image - Klik voor lightbox met zoom */}
            <div className="relative aspect-square bg-white rounded-3xl overflow-hidden shadow-sm">
              <ProductImage
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                enableZoom={true}
                zoomScale={2.5}
              />
            </div>

            {/* Thumbnail Gallery - DRY: Horizontaal scrollable, altijd alle images */}
            {images.length > 1 && (
              <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                <div className="flex gap-3 min-w-min">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative flex-shrink-0 w-24 h-24 bg-white rounded-2xl overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-brand shadow-sm' : 'border-transparent hover:border-gray-200'
                      }`}
                    >
                      <ProductImage src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RECHTS: Product Info - BEGINT OP ZELFDE HOOGTE ALS AFBEELDING */}
          <div className="space-y-6">
            {/* Pre-order Badge (optioneel) */}
              {isPreOrder && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 text-brand rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">Pre-order</span>
                  {product.releaseDate && (
                    <span className="text-sm">
                      • Verwacht: {new Date(product.releaseDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
              )}

              {/* Color Selector - Met subtiele separator */}
              {product.hasVariants && product.variants && product.variants.length > 0 && (
                <>
                  <div className="border-t border-gray-200 pt-6">
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-700">Kleur</span>
                    </div>
                    <ColorSelector
                      variants={product.variants}
                      selectedVariantId={selectedVariant?.id || null}
                      onSelectVariant={handleVariantSelect}
                      disabled={isAdding}
                    />
                  </div>
                </>
              )}

              {/* COOLBLUE: USPs vinkjes - MAX 3 */}
              <div className="border-t border-gray-200 pt-6 space-y-2.5">
                <div className="flex items-start gap-2"><Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" strokeWidth={3} /><span className="text-sm font-semibold text-gray-900 leading-snug">Zelfreinigend systeem met dubbele beveiliging</span></div>
                <div className="flex items-start gap-2"><Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" strokeWidth={3} /><span className="text-sm font-semibold text-gray-900 leading-snug">10.5L XL capaciteit - geschikt voor meerdere katten</span></div>
                <div className="flex items-start gap-2"><Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" strokeWidth={3} /><span className="text-sm font-semibold text-gray-900 leading-snug">Gratis verzending</span></div>
              </div>

              {/* Prijs - Dikker zoals productnaam */}
              <div className="pt-6 pb-4">
                {isPreOrder && preOrderDiscountPercentage > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-3">
                      <div className="text-5xl font-semibold text-brand">{formatPrice(discountedPrice)}</div>
                      <div className="text-2xl text-gray-400 line-through">{formatPrice(originalPrice)}</div>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-sm">{preOrderDiscountPercentage}% Pre-order Korting</span>
                      <span className="text-sm">• Bespaar {formatPrice(originalPrice - discountedPrice)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-5xl font-semibold text-gray-900">{formatPrice(displayPrice)}</div>
                )}
              </div>

              {/* COOLBLUE: CTA - Coolblue rechthoekig + DATA ATTR */}
              <div className="mb-6" data-main-cart>
                {isOutOfStock ? (
                  <button
                    disabled
                    className="w-full px-6 py-3.5 bg-gray-300 text-gray-600 font-bold rounded text-base cursor-not-allowed"
                  >
                    Niet beschikbaar
                  </button>
                ) : (
                  <>
                    {/* Mobile: Verticaal */}
                    <div className="lg:hidden space-y-3">
                      <button
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className="w-full px-6 py-3.5 bg-gradient-to-br from-brand to-brand-dark text-white font-bold rounded transition text-base disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-brand/30"
                      >
                        {isAdding ? (
                          <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            Toevoegen...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-5 w-5" />
                            In winkelwagen
                          </>
                        )}
                      </button>
                      
                      <div className="flex items-center justify-center gap-3 bg-gray-50 rounded px-4 py-2.5 border border-gray-200">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={isAdding || quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 transition"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-bold text-base min-w-[2ch] text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          disabled={isAdding || (trackInventory && quantity >= availableStock)}
                          className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 transition"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Desktop: Horizontaal - Coolblue rechthoekig */}
                    <div className="hidden lg:flex gap-3">
                      <div className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2 border border-gray-200">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={isAdding || quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 transition"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-bold text-base min-w-[2ch] text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          disabled={isAdding || (trackInventory && quantity >= availableStock)}
                          className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 transition"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className="flex-1 px-6 py-3 bg-gradient-to-br from-brand to-brand-dark text-white font-bold rounded transition text-base disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-brand/30"
                      >
                        {isAdding ? (
                          <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            Toevoegen...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-5 w-5" />
                            In winkelwagen
                          </>
                        )}
                      </button>
                    </div>
                    
                    {isLowStock && (
                      <p className="text-center text-sm text-orange-600 font-semibold mt-2">
                        ⚠️ Nog maar {availableStock} stuks beschikbaar
                      </p>
                    )}
                  </>
                )}
              </div>

              <Separator variant="float" spacing="sm" />

              {/* SPECIFICATIES - CLEAN & OPVALLEND */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-base mb-4 text-gray-900">
                  Specificaties
                </h3>
                
                {/* Alle specs in accordion - clean zonder extra background */}
                <div className="divide-y divide-gray-200">
                  <details className="group py-3 px-4 hover:bg-gray-50">
                    <summary className="flex justify-between items-center cursor-pointer hover:text-brand transition">
                      <span className="text-sm font-bold text-gray-900">Capaciteit: <span className="font-semibold text-brand">10.5L XL</span></span>
                      <svg className="w-5 h-5 text-brand transform group-open:rotate-180 transition-transform flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="pt-3 pb-2 text-sm text-gray-600 space-y-1.5 ml-1">
                      <p>• Afvalbak capaciteit: 10.5 liter</p>
                      <p>• Geschikt voor meerdere katten</p>
                      <p>• Minder vaak legen nodig</p>
                    </div>
                  </details>
                  
                  <details className="group py-3 px-4 hover:bg-gray-50">
                    <summary className="flex justify-between items-center cursor-pointer hover:text-brand transition">
                      <span className="text-sm font-bold text-gray-900">Geluidsniveau: <span className="font-semibold text-brand">&lt;40dB</span></span>
                      <svg className="w-5 h-5 text-brand transform group-open:rotate-180 transition-transform flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="pt-3 pb-2 text-sm text-gray-600 space-y-1.5 ml-1">
                      <p>• Gemeten geluidsniveau: &lt;40dB</p>
                      <p>• Geschikt voor slaapkamer gebruik</p>
                      <p>• Stil genoeg voor nachtelijke reiniging</p>
                    </div>
                  </details>
                  
                  <details className="group py-3 px-4 hover:bg-gray-50">
                    <summary className="flex justify-between items-center cursor-pointer hover:text-brand transition">
                      <span className="text-sm font-bold text-gray-900">Sensoren: <span className="font-semibold text-brand">Dubbel systeem</span></span>
                      <svg className="w-5 h-5 text-brand transform group-open:rotate-180 transition-transform flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="pt-3 pb-2 text-sm text-gray-600 space-y-1.5 ml-1">
                      <p>• Dubbel sensor systeem</p>
                      <p>• Automatische noodstop functie</p>
                      <p>• Detecteert beweging tijdens reiniging</p>
                    </div>
                  </details>
                  
                  <details className="group py-3 px-4 hover:bg-gray-50">
                    <summary className="flex justify-between items-center cursor-pointer hover:text-brand transition">
                      <span className="text-sm font-bold text-gray-900">Reiniging: <span className="font-semibold text-brand">Automatisch</span></span>
                      <svg className="w-5 h-5 text-brand transform group-open:rotate-180 transition-transform flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="pt-3 pb-2 text-sm text-gray-600 space-y-1.5 ml-1">
                      <p>• Automatisch reinigingscyclus na gebruik</p>
                      <p>• Actieve koolstof filter voor geurbestrijding</p>
                      <p>• Self-cleaning mechanisme</p>
                    </div>
                  </details>
                  
                  <details className="group py-3 px-4 hover:bg-gray-50">
                    <summary className="flex justify-between items-center cursor-pointer hover:text-brand transition">
                      <span className="text-sm font-bold text-gray-900">Design: <span className="font-semibold text-brand">Open-top</span></span>
                      <svg className="w-5 h-5 text-brand transform group-open:rotate-180 transition-transform flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="pt-3 pb-2 text-sm text-gray-600 space-y-1.5 ml-1">
                      <p>• Open-top ontwerp voor makkelijke toegang</p>
                      <p>• Materiaal: ABS kunststof</p>
                      <p>• Verkrijgbaar in zwart en wit</p>
                    </div>
                  </details>
                  
                  {/* Extra details bij "Toon meer" */}
                  {showAllSpecs && (
                    <>
                      <details className="group py-3 px-4 hover:bg-gray-50">
                        <summary className="flex justify-between items-center cursor-pointer hover:text-brand transition">
                          <span className="text-sm font-bold text-gray-900">Afmetingen: <span className="font-semibold text-brand">60×55×62cm</span></span>
                          <svg className="w-5 h-5 text-brand transform group-open:rotate-180 transition-transform flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className="pt-3 pb-2 text-sm text-gray-600 space-y-1.5 ml-1">
                          <p>• Buitenmaten: 60 × 55 × 62 cm (L×B×H)</p>
                          <p>• Binnenmaten: 50 × 45 cm</p>
                          <p>• Gewicht: 5.2 kg</p>
                          <p>• Footprint: Compact, tegen muur plaatsbaar</p>
                        </div>
                      </details>
                      
                      <details className="group py-3 px-4 hover:bg-gray-50">
                        <summary className="flex justify-between items-center cursor-pointer hover:text-brand transition">
                          <span className="text-sm font-bold text-gray-900">Stroom: <span className="font-semibold text-brand">230V | 15W</span></span>
                          <svg className="w-5 h-5 text-brand transform group-open:rotate-180 transition-transform flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className="pt-3 pb-2 text-sm text-gray-600 space-y-1.5 ml-1">
                          <p>• Voltage: 230V (standaard NL stopcontact)</p>
                          <p>• Vermogen: 15W</p>
                          <p>• Energieverbruik: ~0.015 kWh per cyclus</p>
                          <p>• Kabellengte: 1.5 meter</p>
                        </div>
                      </details>
                      
                      <details className="group py-3 px-4 hover:bg-gray-50">
                        <summary className="flex justify-between items-center cursor-pointer hover:text-brand transition">
                          <span className="text-sm font-bold text-gray-900">App Control: <span className="font-semibold text-brand">iOS & Android</span></span>
                          <svg className="w-5 h-5 text-brand transform group-open:rotate-180 transition-transform flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className="pt-3 pb-2 text-sm text-gray-600 space-y-1.5 ml-1">
                          <p>• Health monitoring via app</p>
                          <p>• Realtime notificaties</p>
                          <p>• Afvalbak niveau indicatie</p>
                          <p>• Historie en statistieken</p>
                        </div>
                      </details>
                      
                      <details className="group py-3 px-4 hover:bg-gray-50">
                        <summary className="flex justify-between items-center cursor-pointer hover:text-brand transition">
                          <span className="text-sm font-bold text-gray-900">Materiaal: <span className="font-semibold text-brand">ABS kunststof</span></span>
                          <svg className="w-5 h-5 text-brand transform group-open:rotate-180 transition-transform flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className="pt-3 pb-2 text-sm text-gray-600 space-y-1.5 ml-1">
                          <p>• Duurzaam ABS kunststof</p>
                          <p>• Krasbestendig oppervlak</p>
                          <p>• Eenvoudig schoon te maken</p>
                          <p>• Veilig en non-toxisch</p>
                        </div>
                      </details>
                      
                      <details className="group py-3 px-4 hover:bg-gray-50">
                        <summary className="flex justify-between items-center cursor-pointer hover:text-brand transition">
                          <span className="text-sm font-bold text-gray-900">Garantie: <span className="font-semibold text-brand">2 jaar</span></span>
                          <svg className="w-5 h-5 text-brand transform group-open:rotate-180 transition-transform flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className="pt-3 pb-2 text-sm text-gray-600 ml-1">
                          2 jaar fabrieksgarantie + NL-talige klantenservice
                        </div>
                      </details>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => setShowAllSpecs(!showAllSpecs)}
                  className="w-full py-3 px-4 mt-2 bg-brand/5 hover:bg-brand/10 text-brand font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {showAllSpecs ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                      </svg>
                      Verberg specificaties
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7 7" />
                      </svg>
                      Toon alle specificaties
                    </>
                  )}
                </button>
              </div>
          </div>
        </div>

        <Separator variant="float" spacing="xl" />

        {/* Product Video - Product in actie - DIKKER TITEL */}
        {product.videoUrl && (
          <>
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-semibold text-center mb-8 text-gray-900">Product in actie</h2>
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-200">
              <iframe
                src={product.videoUrl}
                title="Product demonstratie"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
          </>
        )}

        {/* PRODUCTINFORMATIE */}
        <div className="max-w-5xl mx-auto mb-16 px-4">
          <h2 className="text-2xl font-semibold mb-8 text-gray-900">Productinformatie</h2>
          <div className="space-y-8">
            {/* Omschrijving - ALLEEN DIT BEHOUDEN */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Omschrijving</h3>
              <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                <p><strong>SKU: ALP 1071222</strong> - De Premium Automatische Kattenbak biedt een complete oplossing voor automatisch kattenbak onderhoud. Dit intelligente zelfreinigende systeem met 10.5L capaciteit zorgt ervoor dat de bak altijd schoon is. Na elk gebruik start een reinigingscyclus die afval scheidt en verzamelt in de grote afvalbak.</p>
                <p>De dubbele veiligheidssensoren detecteren beweging en stoppen direct met reinigen wanneer je kat de bak nadert. De ultra-stille motor (&lt;40dB) maakt nachtelijke reiniging mogelijk zonder verstoring. Het open-top design vermindert stress en is toegankelijk voor alle kattenformaten.</p>
                <p>Gemaakt van duurzaam, krasbestendig ABS kunststof dat eenvoudig schoon te maken is. De meegeleverde app helpt je de gezondheid van je kat monitoren door toiletbezoeken en gebruikspatronen bij te houden. Inclusief 2 jaar garantie en gratis verzending.</p>
              </div>
            </div>
          </div>
        </div>

        <Separator variant="float" spacing="xl" />
      </div>

      {/* Sticky Cart - ALLEEN ZICHTBAAR BIJ SCROLLEN */}
      <div
        data-sticky-cart
        className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-40 border-t-2 border-brand opacity-0 translate-y-full transition-all duration-300"
        style={{ pointerEvents: 'none' }}
      >
        <div className="container mx-auto px-4 max-w-7xl py-3">
          {isOutOfStock ? (
            <div className="text-center py-2">
              <p className="text-sm font-semibold text-red-600">Dit product is momenteel uitverkocht</p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Product afbeelding + info */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  <ProductImage
                    src={images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="hidden md:flex flex-col">
                  <div className="text-xs text-gray-600 truncate max-w-[200px]">{product.name}</div>
                  <div className="text-xl font-bold text-gray-900">{formatPrice(displayPrice)}</div>
                </div>
                <div className="md:hidden">
                  <div className="text-xl font-bold text-gray-900">{formatPrice(displayPrice)}</div>
                  {isLowStock && (
                    <div className="text-xs text-orange-600 font-semibold">
                      ⚠️ {product.stock}x
                    </div>
                  )}
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center gap-3 flex-1 justify-end">
                {/* Quantity selector - alleen desktop - RECHTHOEKIG */}
                <div className="hidden lg:flex items-center gap-2 bg-gray-50 rounded px-3 py-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded bg-white border border-gray-300 hover:border-brand flex items-center justify-center transition disabled:opacity-30"
                    aria-label="Min"
                  >
                    <Minus className="h-3.5 w-3.5 text-gray-700" />
                  </button>
                  
                  <span className="text-lg font-bold text-gray-900 min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="w-8 h-8 rounded bg-white border border-gray-300 hover:border-brand flex items-center justify-center transition disabled:opacity-30"
                    aria-label="Plus"
                  >
                    <Plus className="h-3.5 w-3.5 text-gray-700" />
                  </button>
                </div>

                {/* Cart button - RECHTHOEKIG (geen Button component) */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="h-10 px-8 bg-gradient-to-br from-brand to-brand-dark text-white font-bold rounded text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap hover:shadow-lg hover:shadow-brand/30"
                >
                  {isAdding ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      <span className="hidden sm:inline">Toevoegen...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      <span className="hidden sm:inline">Winkelwagen</span>
                      <span className="sm:hidden">Toevoegen</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}