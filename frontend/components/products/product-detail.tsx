"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { Separator } from "@/components/ui/separator";
import { ColorSelector, type ProductVariant } from "@/components/products/color-selector";
import { ProductSpecs } from "@/components/products/product-detail-specs";
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
  const isOutOfStock = displayStock <= 0;
  const isLowStock = displayStock > 0 && displayStock <= product.lowStockThreshold;

  return (
    <div className="min-h-screen bg-gray-50 py-12 pb-32">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
            {/* Breadcrumb - PADDING TOP voor zwevende navbar */}
            <nav className="mb-8 text-sm">
              <Link href="/" className="text-brand hover:text-brand-dark transition font-bold">Home</Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-900 font-bold">{product.name}</span>
            </nav>

        {/* Product Titel - BOVEN ALLES (Coolblue stijl) */}
        <div className="mb-6">
          <h1 className="text-4xl font-medium leading-tight text-gray-900">{product.name}</h1>
          
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
              
              <Separator variant="float" spacing="sm" />

              {/* USPs - ONDER ELKAAR compact */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-brand/5 to-transparent rounded-lg">
                  <svg className="w-7 h-7 text-brand flex-shrink-0" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5"/>
                    <path d="M24 12v12l8 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="24" cy="24" r="2" fill="currentColor"/>
                  </svg>
                  <span className="font-semibold text-sm text-gray-900">Automatische zelfrei niging</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-brand/5 to-transparent rounded-lg">
                  <svg className="w-7 h-7 text-brand flex-shrink-0" viewBox="0 0 48 48" fill="none">
                    <path d="M14 8h20c2 0 3 1 3 3v26c0 2-1 3-3 3H14c-2 0-3-1-3-3V11c0-2 1-3 3-3z" stroke="currentColor" strokeWidth="2.5"/>
                    <path d="M11 16h26M11 32h26" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
                    <text x="24" y="28" text-anchor="middle" fill="currentColor" font-size="10" font-weight="bold">10.5L</text>
                  </svg>
                  <span className="font-semibold text-sm text-gray-900">10.5L XL capaciteit</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-brand/5 to-transparent rounded-lg">
                  <svg className="w-7 h-7 text-brand flex-shrink-0" viewBox="0 0 48 48" fill="none">
                    <path d="M24 10v8M10 24h8M30 24h8M24 30v8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    <circle cx="24" cy="24" r="3" fill="currentColor"/>
                    <path d="M16 16l4 4M28 16l-4 4M16 32l4-4M28 32l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                  </svg>
                  <span className="font-semibold text-sm text-gray-900">Dubbele veiligheidssensoren</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-brand/5 to-transparent rounded-lg">
                  <svg className="w-7 h-7 text-brand flex-shrink-0" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="3" fill="currentColor"/>
                    <path d="M16 20c-2 1-3 3-3 5s1 4 3 5M32 20c2 1 3 3 3 5s-1 4-3 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    <text x="24" y="38" text-anchor="middle" fill="currentColor" font-size="8" font-weight="bold">&lt;40dB</text>
                  </svg>
                  <span className="font-semibold text-sm text-gray-900">Ultra-stil (&lt;40dB)</span>
                </div>
              </div>

              <Separator variant="float" spacing="sm" />

              {/* Color Selector - Toon alleen als product varianten heeft */}
              {product.hasVariants && product.variants && product.variants.length > 0 && (
                <>
                  <ColorSelector
                    variants={product.variants}
                    selectedVariantId={selectedVariant?.id || null}
                    onSelectVariant={handleVariantSelect}
                    disabled={isAdding}
                  />
                  <Separator variant="float" spacing="sm" />
                </>
              )}

              {/* Prijs - Dikker zoals productnaam */}
              <div className="mb-6">
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

              {/* Inline CTA - Responsive: Mobile verticaal, Desktop horizontaal */}
              <div className="mb-6">
                {isOutOfStock ? (
                  <div className="space-y-3">
                    <Button
                      disabled
                      size="lg"
                      variant="primary"
                      fullWidth
                      className="bg-gray-300 cursor-not-allowed opacity-60"
                    >
                      Niet beschikbaar
                    </Button>
                    <p className="text-center text-sm text-gray-600">
                      Dit product is momenteel uitverkocht.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Mobile: Verticaal (button boven, quantity onder) */}
                    <div className="lg:hidden space-y-3">
                      <Button
                        onClick={handleAddToCart}
                        loading={isAdding}
                        size="lg"
                        variant="brand"
                        fullWidth
                        leftIcon={<ShoppingCart className="h-5 w-5" />}
                      >
                        In winkelwagen
                      </Button>
                      
                      <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="w-10 h-10 rounded-full bg-white border border-gray-300 hover:border-brand flex items-center justify-center transition disabled:opacity-30"
                        >
                          <Minus className="h-4 w-4 text-gray-700" />
                        </button>
                        <span className="text-xl font-bold text-gray-900 min-w-[3rem] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          disabled={quantity >= product.stock}
                          className="w-10 h-10 rounded-full bg-white border border-gray-300 hover:border-brand flex items-center justify-center transition disabled:opacity-30"
                        >
                          <Plus className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Desktop: Horizontaal (button + quantity naast elkaar) */}
                    <div className="hidden lg:flex items-center gap-3">
                      <Button
                        onClick={handleAddToCart}
                        loading={isAdding}
                        size="lg"
                        variant="brand"
                        leftIcon={<ShoppingCart className="h-5 w-5" />}
                        className="flex-1"
                      >
                        In winkelwagen
                      </Button>
                      
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="w-10 h-10 rounded-full bg-white border border-gray-300 hover:border-brand flex items-center justify-center transition disabled:opacity-30"
                        >
                          <Minus className="h-4 w-4 text-gray-700" />
                        </button>
                        <span className="text-xl font-bold text-gray-900 min-w-[3rem] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          disabled={quantity >= product.stock}
                          className="w-10 h-10 rounded-full bg-white border border-gray-300 hover:border-brand flex items-center justify-center transition disabled:opacity-30"
                        >
                          <Plus className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                    </div>
                    
                    {isLowStock && (
                      <p className="text-center text-sm text-orange-600 font-semibold">
                        ⚠️ Nog maar {product.stock} stuks beschikbaar
                      </p>
                    )}
                  </div>
                )}
              </div>

              <Separator variant="float" spacing="sm" />

              {/* Extra Specs - Collapsible */}
              {showAllSpecs && (
                <div className="space-y-2 mb-4">
                  {[
                    { title: 'Hoge-Efficiëntie Filter', note: 'Geavanceerd multi-laags filtersysteem met actieve koolstof vangt geuren en stofdeeltjes op voordat ze je huis in komen. Het filter is uitwasbaar en herbruikbaar, wat zorgt voor lagere onderhoudskosten.' },
                    { title: 'Anti-Splash, Hoge Zijwanden', note: 'De verhoogde zijwanden van 22cm zijn speciaal ontworpen om morsen te voorkomen, zelfs bij katten die enthousiast graven. De vorm leidt grit terug naar beneden in plaats van naar buiten.' },
                    { title: 'Gemakkelijk te Demonteren', note: 'Volledig modulair ontwerp waarbij elk onderdeel los kan voor grondige reiniging. Geen verborgen hoeken waar vuil zich kan ophopen. Alle onderdelen zijn vaatwasserbestendig (top rack).' },
                    { title: 'Geschikt voor Meeste Kattengrit', note: 'Werkt met klonterende bentoniet, silica gel, en plantaardige grit. Alleen niet geschikt voor houtkorrels. De zeef heeft verstelbare openingen voor verschillende gritgroottes, in tegenstelling tot concurrenten die vaak maar één type accepteren.' },
                    { title: 'Compact Formaat, Groot Inwendig', note: 'Buitenmaat 60×55×62cm past in kleinere ruimtes, maar biedt een ruime binnenkant van 50×45cm waar je kat comfortabel kan draaien. Intelligente ruimte-optimalisatie zonder de kat te benauwen.' },
                    { title: 'Ultra-Stille Motor (<40dB)', note: 'Met minder dan 40 decibel is de motor stiller dan een bibliotheek (40dB) en vergelijkbaar met gefluister (30dB). Andere bakken produceren vaak 50-60dB, vergelijkbaar met een normaal gesprek. Geschikt voor gebruik in slaapkamers.' },
                    { title: 'Modulair Design (OEM-Vriendelijk)', note: 'Alle onderdelen zijn apart verkrijgbaar en vervangbaar. Geen sealed units zoals bij concurrenten - als één onderdeel kapot gaat, vervang je alleen dat deel. Dit verlengt de levensduur aanzienlijk en reduceert kosten.' },
                    { title: 'App + Gezondheidsmonitoring', note: 'De gratis app (iOS/Android) tracked aantal bezoeken, gewicht van afval, reinigingstijden en stuurt gezondheidsalerts. Bij plotselinge toename van bezoeken (mogelijk urineweginfectie) krijg je een notificatie om tijdig naar de dierenarts te gaan.' },
                  ].map((spec, idx) => (
                    <details key={idx} className="group">
                      <summary className="flex justify-between items-center py-3 cursor-pointer hover:text-brand transition border-b border-gray-200">
                        <span className="font-semibold text-gray-900">{spec.title}</span>
                        <svg className="w-5 h-5 text-gray-400 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="pb-3 pt-2 text-sm text-gray-600">
                        {spec.note}
                      </div>
                    </details>
                  ))}
                </div>
              )}

              {/* "Meer" Button */}
              <button
                onClick={() => setShowAllSpecs(!showAllSpecs)}
                className="w-full text-center py-3 text-sm font-bold text-brand hover:text-brand-dark transition"
              >
                {showAllSpecs ? 'Minder kenmerken' : 'Meer kenmerken'} {showAllSpecs ? '▲' : '▼'}
              </button>
          </div>
        </div>

        <Separator variant="float" spacing="xl" />

        {/* Product Description - EERST */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-medium mb-6 text-gray-900">Over dit product</h2>
          <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>
        </div>

        <Separator variant="float" spacing="xl" />

        {/* Productkenmerken - Direct zichtbaar, compact */}
        <ProductSpecs />

        <Separator variant="float" spacing="xl" />

        {/* Product Video - Dynamisch van admin */}
        {product.videoUrl && (
          <>
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-medium text-center mb-8 text-gray-900">Bekijk het Product in Actie</h2>
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
              <iframe
                src={product.videoUrl}
                title="Product demonstratie"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
            <Separator variant="float" spacing="xl" />
          </>
        )}

        {/* USP Section met Zigzag Layout + Afbeeldingen - Exact zoals Home */}
        <div className="max-w-6xl mx-auto py-20">
          {/* Feature 1 - 10.5L Capaciteit (Afbeelding RECHTS) */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="mb-6">
                <h3 className="text-3xl font-medium text-gray-900">10.5L Capaciteit</h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-xl">
                De grootste afvalbak in zijn klasse. Minder vaak legen betekent meer vrijheid voor jou en minder stress voor je kat.
              </p>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-sm">
              <Image
                {...getImageFillProps(IMAGE_CONFIG.usps.capacity)}
                className="object-cover"
              />
            </div>
          </div>

          <Separator variant="float" spacing="xl" />

          {/* Feature 2 - Ultra-Quiet Motor (Afbeelding LINKS - zigzag) */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative aspect-square rounded-3xl overflow-hidden shadow-sm">
              <Image
                {...getImageFillProps(IMAGE_CONFIG.usps.quiet)}
                className="object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <div className="mb-6">
                <h3 className="text-3xl font-medium text-gray-900">Ultra-Quiet Motor</h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-xl">
                Werkt onder 40 decibel. Zo stil dat je het nauwelijks hoort, zelfs 's nachts in je slaapkamer. Perfect voor appartement of slaapkamer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Cart - Mobile: alleen button, Desktop: button + quantity */}
      <div
        data-sticky-cart
        className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-40"
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
                {/* Quantity selector - alleen desktop */}
                <div className="hidden lg:flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-full bg-white border border-gray-300 hover:border-brand flex items-center justify-center transition disabled:opacity-30"
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
                    className="w-8 h-8 rounded-full bg-white border border-gray-300 hover:border-brand flex items-center justify-center transition disabled:opacity-30"
                    aria-label="Plus"
                  >
                    <Plus className="h-3.5 w-3.5 text-gray-700" />
                  </button>
                </div>

                {/* Cart button - altijd zichtbaar */}
                <Button
                  onClick={handleAddToCart}
                  loading={isAdding}
                  size="md"
                  variant="brand"
                  leftIcon={<ShoppingCart className="h-4 w-4" />}
                  className="h-10 px-5 text-sm lg:px-8"
                >
                  <span className="hidden sm:inline">Winkelwagen</span>
                  <span className="sm:hidden">Toevoegen</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}