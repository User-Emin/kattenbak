"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Plus, Minus, Check, Truck, Shield, Star } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { API_CONFIG, apiFetch } from "@/lib/config";
import { getProductImage, IMAGE_CONFIG } from "@/lib/image-config";

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

  useEffect(() => {
    apiFetch<{ success: boolean; data: Product }>(API_CONFIG.ENDPOINTS.PRODUCT_BY_SLUG(slug))
      .then(data => {
        if (data.success && data.data) {
          setProduct(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

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

  const images = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : [IMAGE_CONFIG.product.main];
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discount = hasDiscount ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100) : 0;

  // Pre-order calculations
  const isPreOrder = product.isPreOrder;
  const preOrderDiscountPercentage = product.preOrderDiscount || 0;
  const originalPrice = product.price;
  const discountedPrice = isPreOrder && preOrderDiscountPercentage > 0
    ? originalPrice * (1 - preOrderDiscountPercentage / 100)
    : originalPrice;
  const displayPrice = isPreOrder && preOrderDiscountPercentage > 0 ? discountedPrice : product.price;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <Link href="/" className="text-brand hover:text-brand-dark transition font-medium">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Images - Met zoom op hover */}
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

          {/* Product Info - Direct op achtergrond */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-light mb-6 leading-tight text-gray-900">{product.name}</h1>
              
              {/* Pre-order Badge */}
              {isPreOrder && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 text-brand rounded-full mb-4">
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
              
              {/* USPs - Direct op achtergrond */}
              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-brand flex-shrink-0" />
                  <span className="font-medium text-gray-700">Geen stank meer</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-brand flex-shrink-0" />
                  <span className="font-medium text-gray-700">Nooit meer scheppen</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-brand flex-shrink-0" />
                  <span className="font-medium text-gray-700">Veilig te gebruiken</span>
                </div>
              </div>

              <Separator variant="float" spacing="md" />

              {/* Prijs - Direct op achtergrond */}
              <div className="mb-8">
                {isPreOrder && preOrderDiscountPercentage > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-3">
                      <div className="text-5xl font-light text-brand">{formatPrice(discountedPrice)}</div>
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
                  <div className="text-5xl font-light text-gray-900">{formatPrice(product.price)}</div>
                )}
              </div>

              {/* CTA Button - Hoger voor MacBook view */}
              <div className="mb-8">
                <Button
                  onClick={handleAddToCart}
                  loading={isAdding}
                  size="lg"
                  variant="primary"
                  fullWidth
                  leftIcon={<ShoppingCart className="h-5 w-5" />}
                  className="mb-4"
                >
                  {isPreOrder ? 'Pre-order Nu' : 'Aan winkelwagen toevoegen'} - {formatPrice(displayPrice)}
                </Button>
                
                {/* Aantal Selector - Compacter onder button */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <span className="text-sm font-medium text-gray-700">Aantal:</span>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-pill border-2 border-gray-300 hover:border-brand hover:bg-white flex items-center justify-center transition disabled:opacity-30 bg-white shadow-sm"
                    aria-label="Verlaag aantal"
                  >
                    <Minus className="h-4 w-4 text-gray-700" />
                  </button>
                  
                  <span className="text-xl font-semibold text-gray-900 min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 rounded-pill border-2 border-gray-300 hover:border-brand hover:bg-white flex items-center justify-center transition disabled:opacity-30 bg-white shadow-sm"
                    aria-label="Verhoog aantal"
                  >
                    <Plus className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              </div>

              <Separator variant="float" spacing="md" />

              {/* Beschikbaarheid */}
              <div className="flex items-center gap-3 mb-8">
                <Check className="h-6 w-6 text-brand flex-shrink-0" />
                <div>
                  <p className="font-semibold text-brand text-lg">Op voorraad - Direct leverbaar</p>
                  <p className="text-sm text-gray-600">Vandaag besteld, morgen in huis</p>
                </div>
              </div>

              {/* Trust badges - Direct op achtergrond */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Truck className="h-6 w-6 text-brand" />
                  <p className="text-xs font-medium text-gray-700">Gratis verzending</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Shield className="h-6 w-6 text-brand" />
                  <p className="text-xs font-medium text-gray-700">2 jaar garantie</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Check className="h-6 w-6 text-brand" />
                  <p className="text-xs font-medium text-gray-700">30 dagen retour</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator variant="float" spacing="xl" />

        {/* Product Description - Direct op achtergrond */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-light mb-6 text-gray-900">Over dit product</h2>
          <p className="text-gray-600 leading-relaxed text-lg">{product.description}</p>
        </div>

        <Separator variant="float" spacing="xl" />

        {/* USPs - Direct op achtergrond */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-light text-center mb-12 text-gray-900">Waarom deze kattenbak?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-3 text-gray-900">Volledig Automatisch</h3>
              <p className="text-gray-600">Reinigt het grit na elk bezoek, altijd een schone kattenbak</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-3 text-gray-900">Geen Stank</h3>
              <p className="text-gray-600">Ingebouwde deodorizer houdt vieze geurtjes uit je huis</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand flex items-center justify-center">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-3 text-gray-900">Morgen in Huis</h3>
              <p className="text-gray-600">Voor 16:00 besteld? Morgen al bij je thuis!</p>
            </div>
          </div>
        </div>

        <Separator variant="float" spacing="xl" />

        {/* Specificaties - Direct op achtergrond */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-light text-center mb-10 text-gray-900">Specificaties</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Kolom 1 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3">
                <span className="font-medium text-gray-700">Materiaal</span>
                <span className="text-gray-900 font-semibold">Premium kunststof</span>
              </div>
              <Separator variant="float" spacing="sm" />
              <div className="flex justify-between items-center pb-3">
                <span className="font-medium text-gray-700">Afmetingen</span>
                <span className="text-gray-900 font-semibold">60 × 55 × 62 cm</span>
              </div>
              <Separator variant="float" spacing="sm" />
              <div className="flex justify-between items-center pb-3">
                <span className="font-medium text-gray-700">Gewicht</span>
                <span className="text-gray-900 font-semibold">8,5 kg</span>
              </div>
              <Separator variant="float" spacing="sm" />
              <div className="flex justify-between items-center pb-3">
                <span className="font-medium text-gray-700">Kleur</span>
                <span className="text-gray-900 font-semibold">Wit</span>
              </div>
              <Separator variant="float" spacing="sm" />
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Geschikt voor</span>
                <span className="text-gray-900 font-semibold">Alle katten</span>
              </div>
            </div>

            {/* Kolom 2 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3">
                <span className="font-medium text-gray-700">Stroomverbruik</span>
                <span className="text-gray-900 font-semibold">Laag energieverbruik</span>
              </div>
              <Separator variant="float" spacing="sm" />
              <div className="flex justify-between items-center pb-3">
                <span className="font-medium text-gray-700">Zelfreinigend</span>
                <span className="text-gray-900 font-semibold flex items-center gap-1"><Check className="h-4 w-4 text-brand" /> Ja</span>
              </div>
              <Separator variant="float" spacing="sm" />
              <div className="flex justify-between items-center pb-3">
                <span className="font-medium text-gray-700">App ondersteuning</span>
                <span className="text-gray-900 font-semibold flex items-center gap-1"><Check className="h-4 w-4 text-brand" /> Ja</span>
              </div>
              <Separator variant="float" spacing="sm" />
              <div className="flex justify-between items-center pb-3">
                <span className="font-medium text-gray-700">Garantie</span>
                <span className="text-gray-900 font-semibold">2 jaar</span>
              </div>
              <Separator variant="float" spacing="sm" />
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Geluidsarm</span>
                <span className="text-gray-900 font-semibold flex items-center gap-1"><Check className="h-4 w-4 text-brand" /> Ja</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
