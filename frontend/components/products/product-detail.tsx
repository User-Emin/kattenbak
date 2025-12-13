"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { ProductUsps } from "@/components/products/product-usps";
import { ProductVideo } from "@/components/ui/product-video";
import { Separator } from "@/components/ui/separator";
import { ChatPopup } from "@/components/ui/chat-popup";
import { useCart } from "@/context/cart-context";
import { useUI } from "@/context/ui-context";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { API_CONFIG, apiFetch } from "@/lib/config";
import { getProductImage, IMAGE_CONFIG } from "@/lib/image-config";
import { ProductHighlights } from "@/components/products/product-highlights";
import { ProductSpecsComparison } from "@/components/products/product-specs-comparison";

interface ProductDetailProps {
  slug: string;
}

export function ProductDetail({ slug }: ProductDetailProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isChatOpen, closeChat } = useUI(); // DRY: Global UI state
  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<any>(null); // DRY: Site settings met productUsps
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // DRY: Fetch site settings voor USPs
  useEffect(() => {
    apiFetch<{ success: boolean; data: any }>(API_CONFIG.ENDPOINTS.SETTINGS)
      .then(data => setSettings(data.data))
      .catch(() => {}); // Silent fail
  }, []);

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
              {/* Productnaam - DUNNER FONT */}
              <h1 className="text-2xl md:text-3xl font-normal mb-6 leading-tight text-gray-900 tracking-tight">{product.name}</h1>
              
              {/* USPs - DUNNER FONT */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <Check className="h-6 w-6 text-brand flex-shrink-0" />
                  <span className="text-base font-normal text-gray-900">Geen stank meer</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-6 w-6 text-brand flex-shrink-0" />
                  <span className="text-base font-normal text-gray-900">Nooit meer scheppen</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-6 w-6 text-brand flex-shrink-0" />
                  <span className="text-base font-normal text-gray-900">Veilig te gebruiken</span>
                </div>
              </div>

              <Separator variant="float" spacing="md" />

              {/* Prijs - COMPACT */}
              <div className="mb-6">
                <div className="text-4xl md:text-5xl font-bold text-gray-900">{formatPrice(product.price)}</div>
              </div>

              {/* CTA Button - DIK TEKST, GEEN PIJL */}
              <div className="mb-8">
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

                {/* Aantal Selector - COMPACTER */}
                <div className="flex items-center justify-center gap-4">
                  <span className="text-base font-bold text-gray-900">Aantal:</span>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-full border-2 border-gray-400 hover:border-blue-600 hover:bg-blue-50 flex items-center justify-center transition disabled:opacity-30 bg-white"
                    aria-label="Verlaag aantal"
                  >
                    <Minus className="h-4 w-4 text-gray-700" />
                  </button>
                  
                  <span className="text-xl font-bold text-gray-900 min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 rounded-full border-2 border-gray-400 hover:border-blue-600 hover:bg-blue-50 flex items-center justify-center transition disabled:opacity-30 bg-white"
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
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-900">Over dit product</h2>
          
          {/* DRY: Product Demo Video - EXACT zoals homepage, direct onder titel */}
          {product.videoUrl && (
            <div className="mb-12">
              <ProductVideo
                videoUrl={product.videoUrl}
                productName={product.name}
                className=""
              />
              <p className="text-center text-sm text-gray-500 mt-4">
                🎥 Bekijk de demo video
              </p>
            </div>
          )}
          
          <p className="text-gray-700 leading-relaxed text-base">{product.description}</p>
        </div>

        <Separator variant="float" spacing="xl" />

        {/* USPs - DRY: 2 belangrijkste features via site settings */}
        {settings?.productUsps && (
          <>
            <ProductUsps usps={[
              settings.productUsps.usp1,
              settings.productUsps.usp2,
            ]} />
            <Separator variant="float" spacing="xl" />
          </>
        )}


      </div>

      {/* Chat Popup - Global UI Component */}
      {isChatOpen && <ChatPopup onClose={closeChat} />}
    </div>
  );
}
