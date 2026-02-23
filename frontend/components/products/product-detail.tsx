"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { useUI } from "@/context/ui-context";
import { productsApi } from "@/lib/api/products";
import { formatPrice } from "@/lib/utils";
import { PRODUCT_PAGE_CONFIG, cn } from "@/lib/product-page-config";
import { DESIGN_SYSTEM } from "@/lib/design-system";
import { PRODUCT_CONTENT } from "@/lib/content.config";
import { PRODUCT_USP_ICONS } from "@/components/products/product-usp-icons";
import { PremiumQualitySection } from "@/components/shared/premium-quality-section";
import { ProductComparisonTable } from "@/components/products/product-comparison-table";
import { ProductJsonLd } from "@/components/seo/product-json-ld";
import { BreadcrumbNavigation } from "@/components/seo/breadcrumb-navigation";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { FAQJsonLd } from "@/components/seo/faq-json-ld";
import { HowToJsonLd } from "@/components/seo/howto-json-ld";
import { RelatedProducts } from "@/components/products/related-products";
import { ProductImage } from "@/components/ui/product-image"; // ✅ ZOOM: ProductImage component met zoom functionaliteit
import { ProductHowItWorks } from "@/components/products/product-how-it-works"; // ✅ HOE WERKT HET: Nieuwe sectie
// ✅ HOE WERKT HET ACCORDION: Icons voor stappen
import { 
  PlugIcon,
  GritIcon,
  TrashBagIcon,
  PowerIcon,
  TimerIcon,
  CheckIcon,
} from "@/components/products/product-how-it-works-icons";
import type { Product } from "@/types/product";
import { getVariantImage } from "@/lib/variant-utils"; // ✅ VARIANT SYSTEM: Shared utility (modulair, geen hardcode)
import { BRAND_COLORS_HEX } from "@/lib/color-config"; // ✅ BLAUW: Voor vinkjes
import { PRODUCT_FETCH_CONFIG } from "@/lib/product-fetch.config"; // ✅ Slimme variabelen retry/messages
import { 
  ChevronLeft, 
  ChevronRight, 
  ShoppingCart, 
  Check, 
  Home, 
  ChevronRight as BreadcrumbChevron,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Box,
  Shield,
  Smartphone,
  Filter,
  Package,
  Droplet,
  Layers,
  Volume2,
  Settings,
  Maximize,
  Lock,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

interface ProductDetailProps {
  slug: string;
}

/**
 * PRODUCT DETAIL COMPONENT
 * 🎨 Geïnspireerd door moderne e-commerce (Pergolux style)
 * ✅ Breadcrumb navigation
 * ✅ Image gallery met thumbnails
 * ✅ Product info met rating, prijs, button
 * ✅ Tabs (Omschrijving, Specificaties, Reviews, FAQ)
 * ✅ Edge-to-edge image sections
 * ✅ Feature sections (2-kolom met afbeeldingen)
 * ✅ Related products
 * ✅ 100% Dynamic & DRY
 */
export function ProductDetail({ slug }: ProductDetailProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isCartOpen } = useUI();
  const CONFIG = PRODUCT_PAGE_CONFIG;
  
  // State management
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  /** ✅ 404 vs 5xx: alleen "Product niet gevonden" bij 404; bij 5xx "Server tijdelijk niet beschikbaar" + Probeer opnieuw */
  const [productError, setProductError] = useState<'not_found' | 'server_error' | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0); // Increment to re-run fetch (Probeer opnieuw)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showAllSpecs, setShowAllSpecs] = useState(false); // ✅ Toon meer specs state
  const [openSpecs, setOpenSpecs] = useState<Set<number>>(new Set());
  // ✅ ACCORDION TABS: Omschrijving standaard open (ook na refresh)
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set(['omschrijving']));
  // ✅ SWIPE: Touch/swipe state voor vloeiend swipen
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  
  // ✅ ACCORDION TABS: Toggle functie voor accordion secties
  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  // ✅ VARIANT SYSTEM: Selected variant state
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  // ✅ Vragen accordion: welke FAQ open (zoals openSpecs)
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set());
  // ✅ Q&A inline (beneden zigzag): één open item tegelijk
  const [openFaqInlineIndex, setOpenFaqInlineIndex] = useState<number | null>(null);
  /** Min. tijd dat skeleton/lading zichtbaar is (ms) – voorkomt "geen lading" / flits */
  const SKELETON_MIN_MS = 400;

  // 🚀 PERFORMANCE: Preload first valid image only (no placeholder/SVG)
  useEffect(() => {
    if (!product?.images?.length) return;
    const valid = (product.images as string[]).filter((img: string) => {
      if (!img || typeof img !== 'string') return false;
      if (img.startsWith('data:') || img.includes('placeholder') || img.includes('demo') || img.includes('default')) return false;
      return img.startsWith('/uploads/') || img.startsWith('/api/') || img.startsWith('http://') || img.startsWith('https://');
    });
    const firstImage = valid[0];
    if (firstImage) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = firstImage;
      link.fetchPriority = 'high';
      document.head.appendChild(link);
    }
  }, [product]);

  // Fetch product data – retry + 404 vs 5xx (slimme variabelen: PRODUCT_FETCH_CONFIG)
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const { MAX_RETRIES, RETRY_DELAY_MS, RATE_LIMIT_DELAY_MULTIPLIER } = PRODUCT_FETCH_CONFIG;

    const loadProduct = async () => {
      setProductError(null); // Clear previous error on (re)load
      try {
        const productData = await productsApi.getBySlug(slug);
        if (isMounted && productData) {
          setProduct(productData);
          // Skeleton min. SKELETON_MIN_MS zichtbaar houden
          setTimeout(() => { if (isMounted) setLoading(false); }, SKELETON_MIN_MS);
        } else if (isMounted) {
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            setTimeout(() => { if (isMounted) loadProduct(); }, RETRY_DELAY_MS * retryCount);
            return;
          }
          setTimeout(() => {
            if (isMounted) {
              setLoading(false);
              setProductError('not_found');
            }
          }, SKELETON_MIN_MS);
        }
      } catch (error: any) {
        if (typeof window === 'undefined') {
          console.error('Product load error:', error?.message || 'Unknown error');
        }
        const status = error?.status;
        const isRetryable = error?.isNetworkError || error?.isGatewayError ||
          status === 429 || status === 502 || status === 503 || status === 504 ||
          error?.message?.includes('verbinding') || error?.message?.includes('tijdelijk niet beschikbaar') ||
          error?.message?.includes('Bad Gateway') || error?.message?.includes('Service Unavailable') ||
          error?.message?.includes('Too many requests') || error?.message?.includes('rate limit');

        if (retryCount < MAX_RETRIES && isRetryable) {
          retryCount++;
          const delay = status === 429
            ? RETRY_DELAY_MS * retryCount * RATE_LIMIT_DELAY_MULTIPLIER
            : RETRY_DELAY_MS * retryCount;
          setTimeout(() => { if (isMounted) loadProduct(); }, delay);
          return;
        }

        if (isMounted) {
          setTimeout(() => {
            if (isMounted) {
              setLoading(false);
              if (status === 404) {
                setProductError('not_found');
              } else {
                setProductError('server_error');
              }
            }
          }, SKELETON_MIN_MS);
        }
      }
    };

    loadProduct();
    return () => { isMounted = false; };
  }, [slug, retryTrigger]);

  // 🚀 PERFORMANCE: Skeleton loading – altijd zichtbaar (geen lege pagina), E2E-detecteerbaar
  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: DESIGN_SYSTEM.colors.secondary }} data-testid="product-detail-loading" aria-busy="true" aria-label="Product wordt geladen">
        {/* Expliciete lading: zichtbare tekst + skeleton */}
        <div className="border-b" style={{ backgroundColor: DESIGN_SYSTEM.colors.secondary }}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <p className="text-sm text-gray-500 mt-2" aria-live="polite">Laden...</p>
          </div>
        </div>

        {/* Skeleton product content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image skeleton */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-20 h-20 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Content skeleton */}
            <div className="space-y-6">
              <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ 404: Product niet gevonden (alleen bij HTTP 404)
  if (!loading && productError === 'not_found') {
    const { title, description, ctaText } = PRODUCT_FETCH_CONFIG.NOT_FOUND;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <AlertTriangle className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-3xl font-semibold mb-4 text-center">{title}</h1>
        <p className="text-gray-600 mb-6 text-center max-w-md">{description}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-colors"
          style={{ backgroundColor: BRAND_COLORS_HEX.primary }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = BRAND_COLORS_HEX.primaryDark}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = BRAND_COLORS_HEX.primary}
        >
          <Home className="w-5 h-5" />
          {ctaText}
        </Link>
      </div>
    );
  }

  // ✅ 5xx / netwerk: Server tijdelijk niet beschikbaar + Probeer opnieuw
  if (!loading && productError === 'server_error') {
    const { title, description, ctaText } = PRODUCT_FETCH_CONFIG.SERVER_ERROR;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
        <h1 className="text-3xl font-semibold mb-4 text-center">{title}</h1>
        <p className="text-gray-600 mb-6 text-center max-w-md">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => {
              setProductError(null);
              setLoading(true);
              setRetryTrigger((t) => t + 1);
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg transition-colors"
            style={{ backgroundColor: BRAND_COLORS_HEX.primary }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = BRAND_COLORS_HEX.primaryDark; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = BRAND_COLORS_HEX.primary; }}
          >
            <RefreshCw className="w-5 h-5" />
            {ctaText}
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            Terug naar Home
          </Link>
        </div>
      </div>
    );
  }

  // Geen lege pagina: toon altijd iets (not_found of server_error wordt hierboven getoond)
  if (!loading && !product) {
    const { title, description, ctaText } = PRODUCT_FETCH_CONFIG.NOT_FOUND;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <AlertTriangle className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-3xl font-semibold mb-4 text-center">{title}</h1>
        <p className="text-gray-600 mb-6 text-center max-w-md">{description}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-colors"
          style={{ backgroundColor: BRAND_COLORS_HEX.primary }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = BRAND_COLORS_HEX.primaryDark}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = BRAND_COLORS_HEX.primary}
        >
          <Home className="w-5 h-5" />
          {ctaText}
        </Link>
      </div>
    );
  }

  // Geen product na alle checks: toon altijd fallback (nooit lege main)
  if (!product) {
    const { title, description, ctaText } = PRODUCT_FETCH_CONFIG.NOT_FOUND;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: DESIGN_SYSTEM.colors.secondary }}>
        <AlertTriangle className="w-16 h-16 text-gray-400 mb-4" aria-hidden />
        <h1 className="text-3xl font-semibold mb-4 text-center text-gray-900">{title}</h1>
        <p className="text-gray-600 mb-6 text-center max-w-md">{description}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-colors"
          style={{ backgroundColor: BRAND_COLORS_HEX.primary }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = BRAND_COLORS_HEX.primaryDark}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = BRAND_COLORS_HEX.primary}
        >
          <Home className="w-5 h-5" />
          {ctaText}
        </Link>
      </div>
    );
  }

  // ✅ VARIANT SYSTEM: Get selected variant or default to first variant
  const variants = product.variants || [];
  const activeVariant = selectedVariant 
    ? variants.find((v: any) => v.id === selectedVariant) 
    : variants.length > 0 ? variants[0] : null;
  
  // ✅ HELPER: Filter valid images (geen placeholder, geen SVG data URLs) - DRY + EDGE CASES
  const filterValidImages = (images: string[]): string[] => {
    return images.filter((img: string) => {
      // ✅ FILTER: Alleen geldige geüploade foto's (geen placeholder, geen SVG data URLs, geen oude paths)
      if (!img || typeof img !== 'string') return false;
      
      // ✅ EDGE CASE: Trim whitespace en decode URL encoding
      const trimmed = img.trim();
      if (trimmed.length === 0) return false;
      
      // Filter SVG data URLs (data:image/svg+xml)
      if (trimmed.startsWith('data:image/svg+xml') || trimmed.startsWith('data:')) return false;
      
      // Filter placeholder images (case-insensitive check)
      const lower = trimmed.toLowerCase();
      if (lower.includes('placeholder') || lower.includes('demo') || lower.includes('default')) return false;
      
      // Alleen geüploade foto's (van /uploads/ of /api/ of http/https)
      return trimmed.startsWith('/uploads/') || trimmed.startsWith('/api/') || trimmed.startsWith('http://') || trimmed.startsWith('https://');
    }).map(img => img.trim()); // ✅ EDGE CASE: Return trimmed URLs
  };

  // ✅ VARIANT SYSTEM: Get variant images via shared utility (modulair, geen hardcode)
  const variantImageUrl = getVariantImage(activeVariant, product.images as string[]);
  let variantImages: string[] | null = null;
  if (activeVariant) {
    // First, check if variant has images array
    if (activeVariant.images && Array.isArray(activeVariant.images) && activeVariant.images.length > 0) {
      // ✅ FILTER: Filter variant images om placeholders te verwijderen
      const filteredVariantImages = filterValidImages(activeVariant.images);
      if (filteredVariantImages.length > 0) {
        variantImages = filteredVariantImages;
      }
    } 
    // If no images array, use the variant image URL from utility
    else if (variantImageUrl) {
      // ✅ FILTER: Check of variant image URL geldig is (geen placeholder)
      const filteredUrl = filterValidImages([variantImageUrl]);
      if (filteredUrl.length > 0) {
        variantImages = filteredUrl;
      }
    }
  }
  
  // Get product images - ✅ FILTER: Alleen geüploade foto's (geen oude/placeholder, geen SVG data URLs)
  const productImages = product.images && Array.isArray(product.images) && product.images.length > 0
    ? filterValidImages(product.images)
    : [];
  
  // ✅ VARIANT SYSTEM: Use variant images if available, otherwise fall back to product images
  const images = variantImages && variantImages.length > 0 ? variantImages : productImages;
  
  // ✅ FALLBACK: Alleen wanneer er echt geen geldige foto's zijn – gebruik bestaande asset (geen 404)
  const GALLERY_FALLBACK = '/images/product-main-optimized.jpg';
  const displayImagesRaw = images.length > 0 ? images : [GALLERY_FALLBACK];
  const displayImages = displayImagesRaw.filter((u): u is string => typeof u === 'string' && u.length > 0);
  const displayImagesSafe = displayImages.length > 0 ? displayImages : [GALLERY_FALLBACK];
  const currentImage = displayImagesSafe[selectedImageIndex] ?? displayImagesSafe[0];
  
  // ✅ VARIANT SYSTEM: Calculate price with variant adjustment
  // ✅ SECURITY: Type-safe conversion - prevent string concatenation (1 + 0 = "10")
  const basePrice = typeof product.price === 'string' 
    ? parseFloat(product.price) 
    : (typeof product.price === 'number' ? product.price : 0);
  const variantAdjustment = activeVariant && activeVariant.priceAdjustment
    ? (typeof activeVariant.priceAdjustment === 'string'
        ? parseFloat(activeVariant.priceAdjustment)
        : (typeof activeVariant.priceAdjustment === 'number' ? activeVariant.priceAdjustment : 0))
    : 0;
  const displayPrice = basePrice + variantAdjustment;

  // ✅ VARIANT SYSTEM: Handle variant selection
  const handleVariantSelect = (variantId: string) => {
    setSelectedVariant(variantId);
    setSelectedImageIndex(0); // Reset to first image when variant changes
  };
  
  // Handle add to cart - ✅ DIRECTE VERWIJZING: Naar winkelwagenpagina
  // ✅ VARIANT SYSTEM: Include variant in cart item with variant image
  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      // ✅ VARIANT SYSTEM: Get variant image via shared utility (modulair, geen hardcode)
      const variantImage = getVariantImage(activeVariant, product?.images as string[] || []);
      
      // ✅ VARIANT SYSTEM: Create product with variant-adjusted price
      if (!product) return; // ✅ SECURITY: Early return if product is null
      
      const productToAdd = activeVariant ? {
        ...product,
        price: displayPrice, // Use variant-adjusted price
      } : product;
      
      // ✅ VARIANT SYSTEM: Pass variant info as separate parameter
      addItem(
        productToAdd, 
        quantity,
        activeVariant ? {
          id: activeVariant.id,
          name: activeVariant.name,
          color: activeVariant.colorCode || activeVariant.colorName || undefined,
          image: variantImage,
        } : undefined
      );
      // ✅ DIRECT: Navigeer direct naar winkelwagenpagina
      window.location.href = '/cart';
    } catch (error) {
      console.error('Error adding to cart:', error);
      setIsAdding(false);
    }
  };

  // Image navigation - ✅ FIX: Gebruik displayImagesSafe (altijd min. 1 item)
  const goToPreviousImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? displayImagesSafe.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setSelectedImageIndex((prev) => (prev === displayImagesSafe.length - 1 ? 0 : prev + 1));
  };

  // ✅ SWIPE: Touch/swipe handlers voor vloeiend en snel swipen
  const minSwipeDistance = 50; // ✅ SMOOTH: Minimale swipe afstand (50px)

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && displayImagesSafe.length > 1) {
      goToNextImage(); // ✅ SMOOTH: Swipe links = volgende afbeelding
    }
    if (isRightSwipe && displayImagesSafe.length > 1) {
      goToPreviousImage(); // ✅ SMOOTH: Swipe rechts = vorige afbeelding
    }

    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
  };


  // Specifications data - GEBASEERD OP ECHTE PRODUCT INFO (screenshots)
  // ✅ DUidelijker: In bullet point stijl zoals "Volledig automatisch • App bediening • Altijd schoon"
  const specifications = [
    {
      icon: Sparkles,
      title: 'Zelfreinigende Functie',
      description: 'Volledig automatisch • Reinigt na elk gebruik • Dubbele veiligheidssensoren voor 100% veiligheid',
    },
    {
      icon: Box,
      title: 'Open-Top Design',
      description: 'Low-stress design • Geen claustrofobisch gevoel • Ventilatie voor frisse lucht',
    },
    {
      icon: Shield,
      title: 'Dubbele Veiligheidssensoren',
      description: 'IR + gewichtssensor • Pauzeert automatisch bij beweging • Getest op meer dan 10.000 cycli',
    },
    {
      icon: Smartphone,
      title: 'App Bediening & Monitoring',
      description: 'iOS & Android app • Real-time notifications • Gezondheidsmonitoring & statistieken • Cloud-sync',
    },
    {
      icon: Filter,
      title: 'Geurfilter & Hygiëne',
      description: 'Hygiënisch voor kat en huis • Dempt vieze geuren effectief',
    },
    {
      icon: Package,
      title: 'Afvalbak Capaciteit',
      description: '10.5L XL capaciteit • 17% meer dan concurrentie • Voor 1 kat: 7-10 dagen • Meerdere katten: 3-5 dagen',
    },
    {
      icon: Droplet,
      title: 'Los te maken voor schoonmaak',
      description: 'Makkelijk te demonteren • Alle onderdelen goed bereikbaar • Grondig schoonmaken',
    },
    {
      icon: Layers,
      title: 'Makkelijk Te Demonteren',
      description: 'Modulair ontwerp • Geen tools nodig • Schoonmaken in 5 minuten',
    },
    {
      icon: Check,
      title: 'Ondersteunde Vulling Types',
      description: 'Klonterende klei vulling • Plantaardige vulling • Gemixte vulling • Kies wat jij het beste vindt',
    },
    {
      icon: Maximize,
      title: 'Compact Footprint, Groot Interieur',
      description: 'Buitenmaat: 65×53×65cm • Groot genoeg voor katten tot 7kg • Past onder meeste kasten',
    },
    {
      icon: Volume2,
      title: 'Ultra-Stil Motor (<40 dB)',
      description: 'Stiller dan conversatie • Verstoort niet tijdens slaap • Premium Japanse motor technologie',
    },
    {
      icon: Settings,
      title: 'Modulair Ontwerp (OEM-Friendly)',
      description: 'Professioneel modulair ontwerp • Makkelijk te upgraden • Duurzaam & toekomstbestendig',
    },
  ];

  const toggleSpec = (index: number) => {
    setOpenSpecs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  };

  const toggleFaq = (index: number) => {
    setOpenFaqs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  };

  // ✅ DYNAMISCH: Features data - Gebruik DIRECT product.images (originele array) voor 4e en 5e foto
  // ✅ FIX: Gebruik product.images DIRECT - deze bevat alle originele images zonder filtering
  // productImages is al gefilterd, maar we hebben de originele indices nodig (3 en 4)
  
  // ✅ DYNAMISCH: Originele product afbeeldingen voor vergelijkingstabel en andere secties
  const originalImages = product.images && Array.isArray(product.images) ? product.images : [];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: (DESIGN_SYSTEM.layout as { productDetail?: { pageBg?: string } }).productDetail?.pageBg ?? DESIGN_SYSTEM.colors.secondary }}
    >
      {/* ✅ SEO PHASE 1-3: JSON-LD Structured Data voor Google Rich Results */}
      {typeof window !== 'undefined' && !loading && product && (
        <>
          <ProductJsonLd product={product} />
          <BreadcrumbJsonLd />
          <FAQJsonLd 
            faqs={PRODUCT_CONTENT.faqs ? [...PRODUCT_CONTENT.faqs] : undefined} 
            productSlug={product.slug} 
          />
          <HowToJsonLd
            name="Automatische kattenbak installeren"
            description="Stap-voor-stap instructies voor het installeren en gebruiken van de automatische kattenbak"
            steps={[
              {
                name: "Plaats de kattenbak",
                text: "Plaats de kattenbak op een vlakke ondergrond, bij voorkeur in een rustige ruimte waar je kat zich comfortabel voelt.",
              },
              {
                name: "Sluit stroomadapter aan",
                text: "Sluit de meegeleverde stroomadapter aan op de kattenbak en op het stopcontact. Controleer of de LED-indicator brandt.",
              },
              {
                name: "Download de app",
                text: "Download de gratis app voor iOS of Android. Scan de QR-code in de handleiding of zoek naar 'CatSupply' in de app store.",
              },
              {
                name: "Volg setup instructies",
                text: "Volg de setup instructies in de app. De app leidt je door het verbindingsproces en helpt je bij het instellen van je eerste reinigingsschema.",
              },
            ]}
            totalTime="10"
            tool={[{ name: "Stroomadapter" }]}
            supply={[{ name: "Kattenbakvulling" }]}
          />
        </>
      )}
      
      {/* Main Product Section - ✅ EDGE-TO-EDGE: 0 padding tot navbar en zijkanten - MOBIEL: Geen padding-top, 0 padding zijkanten */}
      <div className={cn(CONFIG.layout.maxWidth, 'mx-auto', 'px-0', 'pb-8 sm:pb-10 md:pb-12 lg:pb-12', 'pt-0 md:pt-6 lg:pt-8')} style={{ marginTop: 0, paddingLeft: 0, paddingRight: 0 }}>
        {/* Product Grid - ✅ EDGE-TO-EDGE: Geen padding op zijkanten */}
        <div className={cn(
          'flex flex-col lg:flex-row', 
          'items-start', 
          'mt-0 md:mt-0', // ✅ MOBIEL: Direct onder navbar, DESKTOP: Container padding-top zorgt voor ruimte
          'gap-6 sm:gap-8 md:gap-10 lg:gap-10', // ✅ SYMMETRISCH: Gelijk tussen image en info
          'mb-6 sm:mb-8 md:mb-10 lg:mb-10' // ✅ SYMMETRISCH: Gelijk onder
        )}> {/* ✅ EDGE-TO-EDGE: Geen padding op zijkanten */}
          {/* Left: Image Gallery - ✅ STICKY: Blijft in beeld terwijl pagina scrollt */}
          <div className={cn(
            'flex flex-col w-full', // ✅ MOBIEL: full width
            CONFIG.layout.productGrid.imageWidth, // ✅ DESKTOP: Afbeelding breder, meer naar rechts
            'lg:sticky lg:top-28', // ✅ STICKY: Afbeelding blijft in beeld op desktop (top-28 = onder navbar)
            'lg:h-fit', // ✅ HEIGHT: Fit content
            'self-start', 
            'px-0' // ✅ EDGE-TO-EDGE: 0 padding tot navbar en zijkanten
          )}> {/* ✅ STICKY: Afbeelding blijft zichtbaar terwijl je scrollt */}
            {/* ✅ SEO: Breadcrumb altijd zichtbaar (desktop + mobiel) – compact op mobiel */}
            {!loading && product && (
              <div className="block mb-3 lg:mb-4 px-2 sm:px-4 lg:px-8 w-full">
                <BreadcrumbNavigation className="text-xs sm:text-sm" />
              </div>
            )}
            
            {/* Main Image Container - ✅ Afbeelding direct zichtbaar, minder gap */}
            <div className={cn(
              'flex flex-col', 
              'gap-2',
              'w-full'
            )}>
              {/* Main Image - ✅ Direct zichtbaar, ronde hoeken */}
              <div 
                className={cn(
                  'relative', 
                  'w-full',
                  'aspect-square',
                  'rounded-lg', // ✅ RONDE HOEKEN: Hoofdafbeelding altijd
                  CONFIG.gallery.mainImage.bgColor, 
                  'overflow-hidden', 
                  'flex items-center justify-center',
                  'min-h-[280px] sm:min-h-[360px] lg:min-h-[560px]', // ✅ Compacter: afbeelding direct meer zichtbaar
                  isSwiping && 'transition-transform duration-300 ease-out'
                )}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              > {/* ✅ 1200x1200 OPTIMAAL: Vierkant formaat voor perfecte weergave */}
                <ProductImage
                  src={currentImage}
                  alt={product?.name ?? 'Product'}
                  fill
                  enableZoom={true} // ✅ ZOOM: Hover zoom en click lightbox functionaliteit
                  zoomScale={2.5}
                  priority
                  className="object-contain" // ✅ 1200x1200: Behoud originele vierkante aspect ratio optimaal
                  fallbackSrc={GALLERY_FALLBACK}
                />
                
                {/* Navigation Arrows */}
                {displayImagesSafe.length > 1 && (
                  <>
                    <button
                      onClick={goToPreviousImage}
                      className={cn(
                        CONFIG.gallery.navigation.buttonSize,
                        CONFIG.gallery.navigation.buttonBg,
                        CONFIG.gallery.navigation.buttonHover,
                        CONFIG.gallery.navigation.borderRadius || 'rounded-full',
                        'absolute left-4',
                        CONFIG.gallery.navigation.position,
                        'flex items-center justify-center',
                        'transition-all'
                      )}
                      aria-label="Vorige afbeelding"
                    >
                      <ChevronLeft className={CONFIG.gallery.navigation.iconSize} />
                    </button>
                    <button
                      onClick={goToNextImage}
                      className={cn(
                        CONFIG.gallery.navigation.buttonSize,
                        CONFIG.gallery.navigation.buttonBg,
                        CONFIG.gallery.navigation.buttonHover,
                        CONFIG.gallery.navigation.borderRadius || 'rounded-full',
                        'absolute right-4',
                        CONFIG.gallery.navigation.position,
                        'flex items-center justify-center',
                        'transition-all'
                      )}
                      aria-label="Volgende afbeelding"
                    >
                      <ChevronRight className={CONFIG.gallery.navigation.iconSize} />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className={cn(
                  CONFIG.gallery.counter.position,
                  CONFIG.gallery.counter.bg,
                  CONFIG.gallery.counter.textColor,
                  CONFIG.gallery.counter.padding,
                  CONFIG.gallery.counter.fontSize,
                  CONFIG.gallery.counter.borderRadius
                )}>
                  {selectedImageIndex + 1} / {displayImagesSafe.length}
                </div>
              </div>

              {/* ✅ THUMBNAILS: Groter, ronde hoeken, direct zichtbaar */}
              {displayImagesSafe.length > 1 && (
                <div className={cn(
                  'flex flex-row gap-2 overflow-x-auto',
                  'w-full',
                  'px-2 md:px-4',
                  'smooth-scroll',
                  'py-2',
                  'max-w-full'
                )}>
                  {displayImagesSafe.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        'w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden', // ✅ Groter, ronde hoeken
                        CONFIG.gallery.thumbnails.hoverOpacity,
                        'relative bg-gray-100',
                        'transition-all',
                        'border-2',
                        'p-0.5',
                        index === selectedImageIndex 
                          ? 'border-black z-10'
                          : 'border-transparent',
                        index > 0 && 'ml-0'
                      )}
                    >
                      <Image
                        src={image}
                        alt={`${product?.name ?? 'Product'} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px" // 🚀 PERFORMANCE: Thumbnail size (80x80px) - exact size for fastest loading
                        quality={70} // 🚀 PERFORMANCE: Lower quality voor thumbnails (faster loading, still good quality)
                        loading="lazy" // 🚀 PERFORMANCE: Lazy load thumbnails (load only when visible)
                        unoptimized={image.startsWith('/uploads/') || image.includes('/uploads/')} // ✅ FIX: Disable Next.js optimization for /uploads/ paths (both relative and absolute)
                        placeholder="blur" // 🚀 PERFORMANCE: Blur placeholder for smooth loading
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==" // 🚀 PERFORMANCE: Instant blur placeholder
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Info - ✅ DESKTOP: Normaal scrollbaar, afbeelding is sticky */}
          <div className={cn(
            'flex flex-col w-full', 
            CONFIG.layout.productGrid.infoWidth, // ✅ DESKTOP: Info/winkelwagen smaller
            'self-start',
            'mt-6 sm:mt-8 md:mt-0 lg:mt-0', // ✅ SYMMETRISCH: Gelijk spacing op mobile, geen margin op desktop
            'mx-auto lg:mx-0', // ✅ SYMMETRISCH: Gecentreerd op mobile, links uitgelijnd op desktop
            'px-4 md:px-6 lg:px-8', // ✅ PADDING: Product info heeft padding (niet edge-to-edge, alleen productafbeelding is edge-to-edge)
            'lg:pt-0' // ✅ DESKTOP: Geen padding-top op desktop
          )}> {/* ✅ NORMAAL SCROLL: Pagina scrollt, afbeelding blijft sticky in beeld */}
            {/* ✅ DESKTOP: Spacer voor breadcrumb hoogte - Productnaam begint opzelfde hoogte als afbeelding top */}
            {!loading && product && (
              <div className="hidden lg:block mb-4 invisible">
                <div className="px-6 lg:px-8">
                  <div className="h-6 flex items-center text-sm" /> {/* ✅ SPACER: Exact zelfde hoogte als breadcrumb (mb-4 + h-6 met items-center = ~40px totaal) */}
                </div>
              </div>
            )}
            {/* ✅ GEEN EXTRA KAART: Direct op witte achtergrond */}
            <div>
              {/* Productnaam - ✅ DESKTOP: Opzelfde hoogte als afbeelding - SMOOTH */}
              <h1 className={cn(
                'text-2xl sm:text-3xl lg:text-4xl', // ✅ RESPONSIVE: Kleinere tekst op mobile
                CONFIG.info.title.fontWeight,
                CONFIG.info.title.textColor,
                'mb-2 lg:mb-3', // ✅ COMPACT: Minder margin-bottom op desktop
                'leading-tight', // ✅ RESPONSIVE: Tighter line height op mobile
                'mt-0 lg:mt-0', // ✅ DESKTOP: Geen margin-top op desktop (opzelfde hoogte als afbeelding)
                'transition-all duration-300 ease-out', // ✅ SMOOTH: Smooth transitions
                'animate-in fade-in slide-in-from-right-4 duration-500' // ✅ SMOOTH: Fade-in en slide-in animatie bij laden
              )}>
                {product?.name ?? 'Product'}
              </h1>
              

              {/* BOTTOM CART: Verticaal lijn met productnaam, dichtbij, letters dunner (config) */}
              <div
                className={cn(
                  CONFIG.info?.bottomCart?.container?.bg ?? 'bg-transparent',
                  CONFIG.info?.bottomCart?.container?.textColor ?? 'text-black',
                  CONFIG.info?.bottomCart?.container?.padding ?? 'pt-0 px-0 pb-0',
                  CONFIG.info?.bottomCart?.container?.marginTop ?? 'mt-2',
                  CONFIG.info?.bottomCart?.container?.borderRadius ?? 'rounded-none',
                  CONFIG.info?.bottomCart?.container?.textWeight ?? 'font-normal',
                  isCartOpen ? 'hidden md:block' : ''
                )}
              >
              {/* Price - dunner en kleiner (config) */}
              <div className={cn(CONFIG.info.price.spacing, 'mb-0')}>
                <span className={cn(
                  CONFIG.info?.bottomCart?.priceFontSize ?? 'text-xl',
                  CONFIG.info?.bottomCart?.priceFontWeight ?? 'font-light',
                  CONFIG.info?.bottomCart?.container?.textColor ?? 'text-black'
                )}>
                  {formatPrice(displayPrice)}
                </span>
                {/* ✅ FIX: Alleen compareAtPrice tonen als het > 0 EN > displayPrice (echte korting) */}
                {/* ✅ SECURITY: Type-safe conversion - prevent injection via string manipulation */}
                {(() => {
                  // ✅ SECURITY: Defensive type conversion with validation
                  let comparePrice: number = 0;
                  if (product.compareAtPrice !== null && product.compareAtPrice !== undefined) {
                    if (typeof product.compareAtPrice === 'string') {
                      const parsed = parseFloat(product.compareAtPrice);
                      comparePrice = isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
                    } else if (typeof product.compareAtPrice === 'number') {
                      comparePrice = isNaN(product.compareAtPrice) || !isFinite(product.compareAtPrice) ? 0 : product.compareAtPrice;
                    }
                  }
                  // ✅ FIX: Only show if > 0 AND > displayPrice (real discount) - NO € 0,00
                  if (comparePrice > 0 && comparePrice > displayPrice) {
                    // ✅ SECURITY: Same defensive conversion for display
                    let displayComparePrice: number = 0;
                    if (product.compareAtPrice !== null && product.compareAtPrice !== undefined) {
                      if (typeof product.compareAtPrice === 'string') {
                        const parsed = parseFloat(product.compareAtPrice);
                        displayComparePrice = isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
                      } else if (typeof product.compareAtPrice === 'number') {
                        displayComparePrice = isNaN(product.compareAtPrice) || !isFinite(product.compareAtPrice) ? 0 : product.compareAtPrice;
                      }
                    }
                    return (
                      <span className="text-sm text-gray-600 line-through ml-2 font-light">
                        {formatPrice(displayComparePrice)}
                      </span>
                    );
                  }
                  return null;
                })()}
                {/* ✅ FIX: Alleen variant adjustment tonen als het niet 0 is - NO € 0,00 */}
                {(() => {
                  if (!activeVariant) return null;
                  
                  // ✅ SECURITY: Type-safe conversion - prevent string concatenation
                  const adjustment = typeof activeVariant.priceAdjustment === 'string'
                    ? parseFloat(activeVariant.priceAdjustment)
                    : (typeof activeVariant.priceAdjustment === 'number' ? activeVariant.priceAdjustment : 0);
                  
                  // ✅ FIX: Only show if adjustment is not 0
                  if (adjustment === 0 || isNaN(adjustment) || !isFinite(adjustment)) {
                    return null;
                  }
                  
                  return (
                    <span className="text-sm text-gray-700 ml-2">
                      {adjustment > 0 ? '+' : ''}{formatPrice(adjustment)}
                    </span>
                  );
                })()}
              </div>

              {/* ✅ VARIANT SYSTEM: Variant Selector – label/variant/voorraad uit config, vetter (geen hardcode) */}
              {variants.length > 0 && (
                <div className="mt-4 mb-4">
                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    <label className={cn(
                      'text-sm whitespace-nowrap',
                      CONFIG.info?.bottomCart?.container?.textColor ?? 'text-black',
                      CONFIG.info?.bottomCart?.colorLabelWeight ?? 'font-semibold'
                    )}>
                      {PRODUCT_CONTENT.bottomCart.colorLabel}
                    </label>
                    {activeVariant && (
                      <span className={cn('text-sm', CONFIG.info?.bottomCart?.container?.textColor ?? 'text-black', CONFIG.info?.bottomCart?.variantNameWeight ?? 'font-semibold')}>
                        <span>{activeVariant.name}</span>
                        {activeVariant.stock > 0 && activeVariant.stock < 10 && (
                          <span className={cn('ml-2', CONFIG.info?.bottomCart?.stockTextWeight ?? 'font-semibold', CONFIG.info?.bottomCart?.stockTextColor ?? 'text-gray-800')}>
                            {PRODUCT_CONTENT.bottomCart.stockLabel.replace('{count}', String(activeVariant.stock))}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {variants.map((variant: any) => {
                      const isSelected = selectedVariant === variant.id || (!selectedVariant && variant === variants[0]);
                      // ✅ VARIANT SYSTEM: Get variant image via shared utility (modulair, geen hardcode)
                      const previewImage = getVariantImage(variant, product.images as string[]) || null;
                      const isOutOfStock = variant.stock <= 0;
                      
                      return (
                        <button
                          key={variant.id}
                          onClick={() => !isOutOfStock && handleVariantSelect(variant.id)}
                          disabled={isOutOfStock}
                          className={cn(
                            'relative',
                            'w-16 h-16 sm:w-20 sm:h-20',
                            'rounded-lg',
                            'border',
                            'transition-all',
                            'overflow-hidden',
                            isSelected
                              ? cn(
                                  CONFIG.info?.bottomCart?.variantSelected?.border ?? 'border-gray-900',
                                  CONFIG.info?.bottomCart?.variantSelected?.ring ?? 'ring-1 ring-gray-900',
                                  CONFIG.info?.bottomCart?.variantSelected?.ringOffset ?? 'ring-offset-1 ring-offset-gray-200'
                                )
                              : 'border-gray-500 hover:border-gray-600',
                            isOutOfStock && 'opacity-50 cursor-not-allowed grayscale'
                          )}
                          title={variant.name + (isOutOfStock ? PRODUCT_CONTENT.bottomCart.outOfStockSuffix : '')}
                        >
                          {previewImage ? (
                            <Image
                              src={previewImage}
                              alt={variant.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                              quality={70}
                              loading="lazy"
                              unoptimized={previewImage.startsWith('/uploads/') || previewImage.includes('/uploads/')}
                            />
                          ) : variant.colorHex ? (
                            <div
                              className="w-full h-full"
                              style={{ backgroundColor: variant.colorHex }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                              <span className="text-xs text-gray-300 text-center px-1">{variant.colorName || variant.name}</span>
                            </div>
                          )}
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                              <span className="text-xs text-white font-semibold">Uitverkocht</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ✅ SERVICE USPs - Vetgedrukt en opvallender (config: serviceUspTextWeight, serviceUspEmphasis) */}
              {PRODUCT_CONTENT.serviceUsps.length > 0 && (
                <div className="flex flex-col gap-0.5 sm:gap-1 mb-4 sm:mb-5">
                  {PRODUCT_CONTENT.serviceUsps.map((usp, index) => (
                    <div key={index} className={cn('flex items-center gap-2.5 text-base sm:text-lg', CONFIG.info?.bottomCart?.serviceUspEmphasis ?? '')}>
                      <span className="w-6 h-6 rounded-full bg-gray-100 border border-black/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4" strokeWidth={2.5} style={{ color: '#000000' }} />
                      </span>
                      <span className={cn(CONFIG.info?.bottomCart?.container?.textColor ?? 'text-black', CONFIG.info?.bottomCart?.serviceUspTextWeight ?? 'font-semibold')}>{usp.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add to Cart – design system: blauw, tekst wit (analoog navbar) */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={cn(
                  CONFIG.info.button.size,
                  CONFIG.info.button.fontSize,
                  CONFIG.info.button.fontWeight,
                  CONFIG.info.button.borderRadius,
                  CONFIG.info.button.transition,
                  'relative overflow-hidden group w-full shadow-md hover:shadow-xl duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mb-1 sm:mb-1.5',
                  isAdding && 'bg-green-600 text-white hover:bg-green-600'
                )}
                style={isAdding ? undefined : {
                  backgroundColor: (DESIGN_SYSTEM.layout.navbar as { cartButtonBg?: string }).cartButtonBg,
                  color: (DESIGN_SYSTEM.layout.navbar as { cartButtonText?: string }).cartButtonText,
                }}
                onMouseEnter={(e) => { if (!isAdding) e.currentTarget.style.opacity = '0.9'; }}
                onMouseLeave={(e) => { if (!isAdding) e.currentTarget.style.opacity = '1'; }}
              >
                {isAdding ? (
                  <>
                    <Check className={CONFIG.info.button.icon} style={{ color: DESIGN_SYSTEM.colors.text.inverse }} />
                    Toegevoegd
                  </>
                ) : (
                  <>
                    <ShoppingCart className={CONFIG.info.button.icon} style={{ color: (DESIGN_SYSTEM.layout.navbar as { cartButtonText?: string }).cartButtonText }} />
                    Winkelwagen
                  </>
                )}
              </button>

              {/* Bezorgtijd – alleen tekst, geen symbool */}
              <div
                className="mt-2 sm:mt-2.5 mb-0 whitespace-nowrap flex items-center justify-center w-full"
              >
                <span className={cn('text-sm sm:text-base', CONFIG.info?.bottomCart?.container?.textColor ?? 'text-black', CONFIG.info?.bottomCart?.serviceUspTextWeight ?? 'font-semibold')}>
                  {PRODUCT_CONTENT.delivery.label} <span className={CONFIG.info?.bottomCart?.container?.textColor ?? 'text-black'}>{PRODUCT_CONTENT.delivery.days}</span>
                </span>
              </div>
              </div>

              {/* ✅ LET OP: Dikker tekst zoals USPs - BOVEN specificaties */}
              <div className={cn(CONFIG.safetyNotice.container, 'mt-6')}>
                <div className={CONFIG.safetyNotice.header.container}>
                  <AlertTriangle className={cn(
                    CONFIG.safetyNotice.header.icon.size,
                    CONFIG.safetyNotice.header.icon.color
                  )} />
                  <h4 className={cn(
                    CONFIG.safetyNotice.header.title.fontSize,
                    'font-semibold', // ✅ DIKKER: font-semibold zoals USPs
                    CONFIG.safetyNotice.header.title.textColor
                  )}>
                    {PRODUCT_CONTENT.safetyNotice.title}
                  </h4>
                </div>
                <p className={cn(
                  CONFIG.safetyNotice.content.fontSize,
                  'font-medium', // ✅ DIKKER: font-medium zoals USPs
                  CONFIG.safetyNotice.content.textColor,
                  CONFIG.safetyNotice.content.lineHeight
                )}>
                  {PRODUCT_CONTENT.safetyNotice.text}
                </p>
              </div>

              {/* ✅ ACCORDION SECTIES: Omschrijving, Specificaties, Vragen - COMPACT & SMOOTH */}
              <div className="mt-6 space-y-2">
                {/* Omschrijving Accordion */}
                <div>
                  <button
                    onClick={() => toggleAccordion('omschrijving')}
                    className="w-full px-4 py-2.5 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-all duration-200 flex items-center justify-between group"
                  >
                    <span className="text-sm md:text-base font-medium text-gray-900">
                      Omschrijving
                    </span>
                    <ChevronDown 
                      className={cn(
                        'w-4 h-4 text-gray-500 transition-transform duration-200',
                        openAccordions.has('omschrijving') && 'rotate-180'
                      )}
                    />
                  </button>
                  
                  {openAccordions.has('omschrijving') && (
                    <div className="mt-4 px-6 py-4 bg-white border border-gray-200 rounded-lg border-t-0">
                      <div className={cn(CONFIG.tabs.content.fontSize, CONFIG.tabs.content.textColor, CONFIG.tabs.content.lineHeight)}>
                        <h3 className="text-base sm:text-lg font-semibold mb-2">Product Omschrijving</h3>
                        <p className="text-sm sm:text-base mb-3">
                          {product.description || 'Premium automatische kattenbak met zelfreinigende functie. Perfect voor katten tot 7kg. Volledig automatisch met app-bediening.'}
                        </p>
                        {product.description && (
                          <>
                            <h4 className="text-sm sm:text-base font-semibold mb-1.5">Standaard meegeleverd:</h4>
                            <ul className="space-y-1 ml-4 text-sm sm:text-base">
                              {PRODUCT_CONTENT.delivery.items.map((item) => (
                                <li key={item}>• {item}</li>
                              ))}
                            </ul>
                          </>
                        )}
                        <p className="mt-3 text-xs sm:text-sm text-gray-600 italic">
                          * Kattenbakvulling niet inbegrepen. Geschikt voor klonterende klei, plantaardige en gemixte vulling.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Specificaties Accordion */}
                <div>
                  <button
                    onClick={() => toggleAccordion('specificaties')}
                    className="w-full px-4 py-2.5 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-all duration-200 flex items-center justify-between group"
                  >
                    <span className="text-sm md:text-base font-medium text-gray-900">
                      Specificaties
                    </span>
                    <ChevronDown 
                      className={cn(
                        'w-4 h-4 text-gray-500 transition-transform duration-200',
                        openAccordions.has('specificaties') && 'rotate-180'
                      )}
                    />
                  </button>
                  
                  {openAccordions.has('specificaties') && (
                    <div className="mt-4 space-y-2">
                      {specifications.map((spec, index) => {
                        const Icon = spec.icon;
                        const isOpen = openSpecs.has(index);

                        return (
                          <div 
                            key={index}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <button
                              onClick={() => toggleSpec(index)}
                              className="w-full px-4 py-3 text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
                            >
                              <span className="text-sm md:text-base font-medium text-gray-900">
                                {spec.title}
                              </span>
                              <ChevronDown 
                                className={cn(
                                  'w-4 h-4 text-gray-600 transition-transform duration-200',
                                  isOpen && 'rotate-180'
                                )}
                              />
                            </button>

                            {isOpen && (
                              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                                  {spec.description}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Hoe werkt het Accordion */}
                <div>
                  <button
                    onClick={() => toggleAccordion('hoe-werkt-het')}
                    className={cn(
                      CONFIG.howItWorks.accordion.button.container
                    )}
                  >
                    <span className={CONFIG.howItWorks.accordion.button.text}>
                      Hoe werkt het?
                    </span>
                    <ChevronDown 
                      className={cn(
                        CONFIG.howItWorks.accordion.button.icon.size,
                        CONFIG.howItWorks.accordion.button.icon.color,
                        CONFIG.howItWorks.accordion.button.icon.transition,
                        openAccordions.has('hoe-werkt-het') && 'rotate-180'
                      )}
                    />
                  </button>
                  
                  {openAccordions.has('hoe-werkt-het') && (
                    <div className={CONFIG.howItWorks.accordion.content.container}>
                      {/* ✅ STAPPEN: DRY uit config; image vervangt icoon wanneer geüpload */}
                      {(() => {
                        const howItWorksImages = product.howItWorksImages || [];
                        const stepDefs = (CONFIG.howItWorksSteps as { steps?: readonly { title: string; description: string }[] }).steps
                          ?? (CONFIG.howItWorksSteps as { stepTitles?: readonly string[] }).stepTitles?.map((t, i) => ({ title: t, description: '' })) ?? [];
                        const icons = [PlugIcon, GritIcon, TrashBagIcon, PowerIcon, TimerIcon, CheckIcon];

                        return stepDefs.map((stepDef, index) => {
                          const stepImage = howItWorksImages[index];
                          const IconComponent = icons[index] ?? CheckIcon;
                          const step = { ...stepDef, number: index + 1, image: stepImage, icon: IconComponent };
                          return (
                            <div
                              key={step.number}
                              className={cn(
                                CONFIG.howItWorks.accordion.content.step.container,
                                'animate-in fade-in slide-in-from-bottom-4',
                                'duration-300'
                              )}
                              style={{
                                animationDelay: `${index * 50}ms`,
                              }}
                            >
                              <div className={CONFIG.howItWorks.accordion.content.step.spacing}>
                                {step.image && (
                                  <div 
                                    className={cn(CONFIG.howItWorks.accordion.content.step.image.container)}
                                    style={{ borderColor: `${BRAND_COLORS_HEX.primary}30` }}
                                  >
                                    <Image
                                      src={step.image}
                                      alt={step.title}
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 768px) 100vw, 400px"
                                      quality={90}
                                      loading="lazy"
                                      unoptimized={step.image.startsWith('/uploads/') || step.image.includes('/uploads/')}
                                      placeholder="blur"
                                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                    />
                                    <div 
                                      className={CONFIG.howItWorks.accordion.content.step.image.numberBadge.container}
                                      style={{ backgroundColor: BRAND_COLORS_HEX.primary }}
                                    >
                                      {step.number}
                                    </div>
                                  </div>
                                )}
                                <div className={CONFIG.howItWorks.accordion.content.step.content.container}>
                                  <div className={CONFIG.howItWorks.accordion.content.step.content.header.container}>
                                    {!step.image && (
                                      <IconComponent 
                                        className={cn(
                                          CONFIG.howItWorks.accordion.content.step.content.header.icon.size,
                                          CONFIG.howItWorks.accordion.content.step.content.header.icon.color
                                        )}
                                      />
                                    )}
                                    <h3 className={cn(
                                      CONFIG.howItWorks.accordion.content.step.content.header.title.fontSize,
                                      CONFIG.howItWorks.accordion.content.step.content.header.title.fontWeight,
                                      CONFIG.howItWorks.accordion.content.step.content.header.title.textColor
                                    )}>
                                      {step.title}
                                    </h3>
                                  </div>
                                  <p className={cn(
                                    CONFIG.howItWorks.accordion.content.step.content.description.fontSize,
                                    CONFIG.howItWorks.accordion.content.step.content.description.textColor,
                                    CONFIG.howItWorks.accordion.content.step.content.description.lineHeight
                                  )}>
                                    {step.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>

                {/* ✅ Vragen accordion - open blok zoals Specificaties, SEO op echte info (content.config) */}
                <div>
                  <button
                    onClick={() => toggleAccordion('vragen')}
                    className="w-full px-4 py-2.5 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-all duration-200 flex items-center justify-between group"
                  >
                    <span className="text-sm md:text-base font-medium text-gray-900">
                      {PRODUCT_CONTENT.vragenSection.title}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-gray-500 transition-transform duration-200',
                        openAccordions.has('vragen') && 'rotate-180'
                      )}
                    />
                  </button>
                  {openAccordions.has('vragen') && PRODUCT_CONTENT.faqs && PRODUCT_CONTENT.faqs.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {PRODUCT_CONTENT.faqs.map((faq, index) => {
                        const isOpen = openFaqs.has(index);
                        return (
                          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => toggleFaq(index)}
                              className="w-full px-4 py-3 text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
                            >
                              <span className="text-sm md:text-base font-medium text-gray-900">{faq.q}</span>
                              <ChevronDown className={cn('w-4 h-4 text-gray-600 transition-transform duration-200', isOpen && 'rotate-180')} />
                            </button>
                            {isOpen && (
                              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                                <p className="text-sm md:text-base text-gray-700 leading-relaxed">{faq.a}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* ✅ SCHEIDINGSTREEP: Tussen tabs/omschrijving en 6 stappen - IETS GRIJZER */}
      <div className={cn(CONFIG.layout.maxWidth, 'mx-auto', CONFIG.layout.containerPadding)}>
        <div className="border-t border-gray-300 my-6 sm:my-8"></div>
      </div>

      {/* ✅ Hoe werkt het – één sectie, 1 kolom, icoon per stap, responsive mobiel (niet dubbel) */}
      {(CONFIG.howItWorksSteps as { sectionTitle?: string })?.sectionTitle && (
        <section
          className={cn((CONFIG.howItWorksSteps as { wrapper?: string }).wrapper, (CONFIG.howItWorksSteps as { wrapperBg?: string }).wrapperBg)}
          data-testid="how-it-works-steps"
          aria-label="Hoe werkt het"
        >
          <h2 className={(CONFIG.howItWorksSteps as { sectionTitleClass?: string }).sectionTitleClass}>
            {(CONFIG.howItWorksSteps as { sectionTitle?: string }).sectionTitle}
          </h2>
          <div className={(CONFIG.howItWorksSteps as { list?: string }).list}>
            {((CONFIG.howItWorksSteps as { stepTitles?: readonly string[] }).stepTitles ?? []).map((title, index) => {
              const icons = [PlugIcon, GritIcon, TrashBagIcon, PowerIcon, TimerIcon, CheckIcon];
              const IconComponent = icons[index] ?? CheckIcon;
              const steps = CONFIG.howItWorksSteps as { iconWrapper?: string; iconWrapperFirstTwo?: string; imageWrapper?: string; imageWrapperFirstTwo?: string; numberBg?: string };
              const isFirstTwo = index < 2;
              const stepImage = product?.howItWorksImages?.[index];
              return (
                <div
                  key={index}
                  className={(CONFIG.howItWorksSteps as { stepRow?: string }).stepRow}
                >
                  {stepImage ? (
                    <div className={cn('relative', isFirstTwo ? steps.imageWrapperFirstTwo : steps.imageWrapper)}>
                      <Image
                        src={stepImage}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="56px"
                        unoptimized={stepImage.startsWith('/uploads/') || stepImage.includes('/uploads/')}
                      />
                    </div>
                  ) : (
                  <div
                    className={isFirstTwo ? (steps.iconWrapperFirstTwo ?? steps.iconWrapper) : steps.iconWrapper}
                    style={{
                      backgroundColor: isFirstTwo
                        ? (CONFIG.howItWorksSteps as { numberBg?: string }).numberBg
                        : `${(CONFIG.howItWorksSteps as { numberBg?: string }).numberBg}20`,
                    }}
                  >
                    <IconComponent className={cn(
                      isFirstTwo ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-5 h-5 sm:w-6 sm:h-6',
                      isFirstTwo ? 'text-white' : 'text-gray-700'
                    )} />
                  </div>
                  )}
                  <div
                    className={(CONFIG.howItWorksSteps as { number?: string }).number}
                    style={{ backgroundColor: (CONFIG.howItWorksSteps as { numberBg?: string }).numberBg }}
                  >
                    {index + 1}
                  </div>
                  <span className={(CONFIG.howItWorksSteps as { title?: string }).title}>
                    {title}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ✅ VERGELIJKINGSTABEL: mobiel edge-to-edge, desktop max-width */}
      <div className={cn(
        'w-full md:max-w-7xl md:mx-auto md:px-8 py-8 md:py-12 lg:py-16',
        'md:bg-transparent',
        PRODUCT_PAGE_CONFIG.comparisonTable?.mobile?.wrapperBg ?? ''
      )}>
        <div className={(PRODUCT_PAGE_CONFIG.comparisonTable?.mobile as { darkModeMobile?: boolean })?.darkModeMobile ? 'text-white md:text-inherit' : ''}>
          <ProductComparisonTable productImages={originalImages} darkModeMobile={(PRODUCT_PAGE_CONFIG.comparisonTable?.mobile as { darkModeMobile?: boolean })?.darkModeMobile} />
        </div>
      </div>

      {/* ✅ Q&A / Vragen – inline onder vergelijkingstabel (zelfde content als accordion, config) */}
      {PRODUCT_CONTENT.faqs && PRODUCT_CONTENT.faqs.length > 0 && (
        <section
          className={cn(CONFIG.faqInline.wrapper, CONFIG.faqInline.wrapperBg)}
          aria-label="Veelgestelde vragen"
        >
          <h2 className={CONFIG.faqInline.sectionTitleClass}>
            {PRODUCT_CONTENT.vragenSection?.title ?? 'Vragen'}
          </h2>
          <div className="space-y-2 sm:space-y-3 max-w-3xl mx-auto">
            {PRODUCT_CONTENT.faqs.map((faq, index) => {
              const isOpen = openFaqInlineIndex === index;
              return (
                <div key={index} className={CONFIG.faqInline.itemContainer}>
                  <button
                    type="button"
                    onClick={() => setOpenFaqInlineIndex(isOpen ? null : index)}
                    className="w-full px-4 py-3 text-left flex items-center justify-between gap-2"
                  >
                    <span className={CONFIG.faqInline.questionClass}>{faq.q}</span>
                    <ChevronDown className={cn('w-4 h-4 flex-shrink-0 text-gray-500 transition-transform duration-200', isOpen && 'rotate-180')} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 pt-0 border-t border-gray-100">
                      <p className={cn(CONFIG.faqInline.answerClass, 'pt-3')}>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ✅ FAQ sectie "Vragen over ALP1071" verwijderd; SEO behouden via FAQJsonLd (FAQPage schema) */}

    </div>
  );
}
