"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
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
import type { Product } from "@/types/product";
import { getVariantImage } from "@/lib/variant-utils"; // ✅ VARIANT SYSTEM: Shared utility (modulair, geen hardcode)
import { BRAND_COLORS_HEX } from "@/lib/color-config"; // ✅ BLAUW: Voor vinkjes
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
  Truck,
  Lock,
  AlertTriangle
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
  const CONFIG = PRODUCT_PAGE_CONFIG;
  
  // State management
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showAllSpecs, setShowAllSpecs] = useState(false); // ✅ Toon meer specs state
  const [showAllFeatures, setShowAllFeatures] = useState(false); // ✅ Toon meer features state
  const [openSpecs, setOpenSpecs] = useState<Set<number>>(new Set());
  // ✅ ACCORDION TABS: State voor accordion secties (Omschrijving, Specificaties, Vragen)
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());
  
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
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null); // Variant ID

  // 🚀 PERFORMANCE: Preload first image for fastest loading
  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (firstImage && !firstImage.startsWith('/placeholder')) {
        // Preload main product image for instant display
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = firstImage;
        link.fetchPriority = 'high';
        document.head.appendChild(link);
      }
    }
  }, [product]);

  // Fetch product data - ✅ FIX: Retry logic voor betrouwbaar laden
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 5; // ✅ VERHOOGD: Meer retries voor betrouwbaarheid
    const RETRY_DELAY = 1000; // 1 second

    const loadProduct = async () => {
      try {
        const productData = await productsApi.getBySlug(slug);
        if (isMounted && productData) {
          setProduct(productData);
          setLoading(false);
        } else if (isMounted) {
          // ✅ FIX: Als product null is, probeer opnieuw (mogelijk tijdelijke fout)
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            setTimeout(() => {
              if (isMounted) {
                loadProduct();
              }
            }, RETRY_DELAY * retryCount);
            return;
          }
          setLoading(false);
        }
      } catch (error: any) {
        // ✅ SECURITY: Log error server-side only (geen gevoelige data)
        if (typeof window === 'undefined') {
          console.error('Product load error:', error?.message || 'Unknown error');
        }
        
        // ✅ RETRY: Probeer opnieuw bij network errors, 502, 503, 504, 429 (rate limit)
        if (retryCount < MAX_RETRIES && (
          error?.isNetworkError || 
          error?.isGatewayError || 
          error?.status === 429 || // ✅ FIX: Retry bij rate limiting
          error?.status === 502 ||
          error?.status === 503 ||
          error?.status === 504 ||
          error?.message?.includes('verbinding') ||
          error?.message?.includes('tijdelijk niet beschikbaar') ||
          error?.message?.includes('Bad Gateway') ||
          error?.message?.includes('Service Unavailable') ||
          error?.message?.includes('Too many requests') ||
          error?.message?.includes('rate limit')
        )) {
          retryCount++;
          // ✅ FIX: Langere delay bij rate limiting (429)
          const delay = error?.status === 429 ? RETRY_DELAY * retryCount * 2 : RETRY_DELAY * retryCount;
          setTimeout(() => {
            if (isMounted) {
              loadProduct();
            }
          }, delay); // Exponential backoff, langer bij rate limiting
          return;
        }
        
        // ✅ FIX: Alleen "Product niet gevonden" tonen bij 404, niet bij andere errors
        if (isMounted) {
          // Alleen set loading false als het echt niet gevonden is (404)
          // Bij andere errors blijven we proberen of tonen we een betere error
          if (error?.status === 404) {
            setLoading(false);
          } else {
            // ✅ FIX: Bij andere errors, blijf proberen of toon loading state
            // Dit voorkomt dat "Product niet gevonden" wordt getoond bij tijdelijke fouten
            if (retryCount >= MAX_RETRIES) {
              setLoading(false);
            }
          }
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // 🚀 PERFORMANCE: Show skeleton loading state (not blank spinner) for better UX
  if (loading) {
    return (
      <div className="min-h-screen">
        {/* 🚀 PERFORMANCE: Skeleton header with breadcrumb */}
        <div className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* 🚀 PERFORMANCE: Skeleton product content */}
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

  // ✅ FIX: Product not found - alleen tonen als loading klaar is EN product echt niet bestaat
  // Dit voorkomt dat "Product niet gevonden" wordt getoond tijdens retries
  if (!loading && !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <AlertTriangle className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-3xl font-semibold mb-4 text-center">Product niet gevonden</h1>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Het product dat je zoekt bestaat niet of is niet meer beschikbaar.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-colors"
          style={{ backgroundColor: BRAND_COLORS_HEX.primary }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = BRAND_COLORS_HEX.primaryDark}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = BRAND_COLORS_HEX.primary}
        >
          <Home className="w-5 h-5" />
          Terug naar Home
        </Link>
      </div>
    );
  }

  // ✅ SECURITY: Early return if product is null (should not happen after check above, but TypeScript safety)
  if (!product) {
    return null;
  }

  // ✅ VARIANT SYSTEM: Get selected variant or default to first variant
  const variants = product.variants || [];
  const activeVariant = selectedVariant 
    ? variants.find((v: any) => v.id === selectedVariant) 
    : variants.length > 0 ? variants[0] : null;
  
  // ✅ VARIANT SYSTEM: Get variant images via shared utility (modulair, geen hardcode)
  const variantImageUrl = getVariantImage(activeVariant, product.images as string[]);
  let variantImages: string[] | null = null;
  if (activeVariant) {
    // First, check if variant has images array
    if (activeVariant.images && Array.isArray(activeVariant.images) && activeVariant.images.length > 0) {
      variantImages = activeVariant.images;
    } 
    // If no images array, use the variant image URL from utility
    else if (variantImageUrl) {
      variantImages = [variantImageUrl];
    }
  }
  
  // Get product images - ✅ FILTER: Alleen geüploade foto's (geen oude/placeholder, geen SVG data URLs)
  const productImages = product.images && Array.isArray(product.images) && product.images.length > 0
    ? product.images.filter((img: string) => {
        // ✅ FILTER: Alleen geldige geüploade foto's (geen placeholder, geen SVG data URLs, geen oude paths)
        if (!img || typeof img !== 'string') return false;
        // Filter SVG data URLs (data:image/svg+xml)
        if (img.startsWith('data:image/svg+xml') || img.startsWith('data:')) return false;
        // Filter placeholder images
        if (img.includes('placeholder') || img.includes('demo') || img.includes('default')) return false;
        // Alleen geüploade foto's (van /uploads/ of /api/ of http/https)
        return img.startsWith('/uploads/') || img.startsWith('/api/') || img.startsWith('http://') || img.startsWith('https://');
      })
    : [];
  
  // ✅ VARIANT SYSTEM: Use variant images if available, otherwise fall back to product images
  const images = variantImages && variantImages.length > 0 ? variantImages : productImages;
  
  // ✅ FALLBACK: Als geen geüploade foto's, toon placeholder
  const displayImages = images.length > 0 ? images : ['/placeholder-image.jpg'];
  const currentImage = displayImages[selectedImageIndex] || displayImages[0];
  
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

  // Image navigation - ✅ FIX: Gebruik displayImages
  const goToPreviousImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setSelectedImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
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

  // Toggle specification open/close
  const toggleSpec = (index: number) => {
    setOpenSpecs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // ✅ DYNAMISCH: Features data - Gebruik DIRECT product.images (originele array) voor 4e en 5e foto
  // ✅ FIX: Gebruik product.images DIRECT - deze bevat alle originele images zonder filtering
  // productImages is al gefilterd, maar we hebben de originele indices nodig (3 en 4)
  
  // ✅ DEBUG: Log voor verificatie (altijd, ook in production voor troubleshooting)
  const originalImages = product.images && Array.isArray(product.images) ? product.images : [];
  const fourthImage = originalImages[3]; // ✅ 4E FOTO: 10.5L Afvalbak
  const fifthImage = originalImages[4];  // ✅ 5E FOTO: Geurblokje, Kwast & Afvalzak
  
  console.log('📸 Original Product Images Count:', originalImages.length);
  console.log('📸 Original Product Images:', originalImages);
  console.log('📸 4e foto (index 3):', fourthImage);
  console.log('📸 5e foto (index 4):', fifthImage);
  console.log('📸 4e foto valid:', fourthImage && typeof fourthImage === 'string' && !fourthImage.startsWith('data:') && !fourthImage.includes('placeholder'));
  console.log('📸 5e foto valid:', fifthImage && typeof fifthImage === 'string' && !fifthImage.startsWith('data:') && !fifthImage.includes('placeholder'));
  
  // ✅ DYNAMISCH: Features met 4e en 5e foto - GEBRUIK ORIGINELE product.images indices
  const features = PRODUCT_CONTENT.features.map((feature, index) => {
    let imageUrl: string;
    
    if (index === 0) {
      // ✅ 4E FOTO: 10.5L Afvalbak (index 3 = 4e foto) - DIRECT uit originele product.images
      // ✅ VALIDATIE: Check of image geldig is (geen placeholder, geen data URL)
      if (fourthImage && typeof fourthImage === 'string' && !fourthImage.startsWith('data:') && !fourthImage.includes('placeholder')) {
        imageUrl = fourthImage;
        console.log(`✅ Feature ${index} (${feature.title}): Using originalImages[3] = ${fourthImage}`);
      } else {
        imageUrl = '/images/capacity-10.5l-optimized.jpg';
        console.log(`⚠️ Feature ${index} (${feature.title}): FALLBACK - originalImages[3] invalid: ${fourthImage}`);
      }
    } else if (index === 1) {
      // ✅ MIDDELSTE: Statische feature-2.jpg
      imageUrl = '/images/feature-2.jpg';
    } else {
      // ✅ 5E FOTO: Geurblokje, kwast & afvalzak (index 4 = 5e foto) - DIRECT uit originele product.images
      // ✅ VALIDATIE: Check of image geldig is (geen placeholder, geen data URL)
      if (fifthImage && typeof fifthImage === 'string' && !fifthImage.startsWith('data:') && !fifthImage.includes('placeholder')) {
        imageUrl = fifthImage;
        console.log(`✅ Feature ${index} (${feature.title}): Using originalImages[4] = ${fifthImage}`);
      } else {
        imageUrl = '/images/feature-2.jpg';
        console.log(`⚠️ Feature ${index} (${feature.title}): FALLBACK - originalImages[4] invalid: ${fifthImage}`);
      }
    }
    
    return {
      ...feature,
      image: imageUrl,
    };
  });

  return (
    <div className="min-h-screen bg-white"> {/* ✅ WIT: Volledig witte achtergrond */}
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
      
      {/* Main Product Section - ✅ DESKTOP SPACING: Ruimte onder navbar op desktop, mobiel edge-to-edge */}
      <div className={cn(CONFIG.layout.maxWidth, 'mx-auto', 'px-0 md:px-6 lg:px-8', CONFIG.layout.sectionSpacing, 'pt-0 md:pt-6 lg:pt-8')} style={{ marginTop: 0 }}>
        {/* Product Grid - ✅ DESKTOP SPACING: Ruimte op desktop, mobiel direct onder navbar */}
        <div className={cn(
          'flex flex-col lg:flex-row', 
          'items-start', 
          'mt-0 md:mt-0', // ✅ MOBIEL: Direct onder navbar, DESKTOP: Container padding-top zorgt voor ruimte
          'gap-6 sm:gap-8 md:gap-10 lg:gap-10', // ✅ SYMMETRISCH: Gelijk tussen image en info
          'mb-6 sm:mb-8 md:mb-10 lg:mb-10' // ✅ SYMMETRISCH: Gelijk onder
        )}> {/* ✅ DESKTOP SPACING: Ruimte via container padding-top op desktop */}
          {/* Left: Image Gallery - ✅ GEEN PADDING MOBIEL: Voor echte edge-to-edge */}
          {/* ✅ SEO PHASE 1: Breadcrumb Navigation - DICHTBIJ PRODUCTAFBEELDING (Desktop) */}
          {!loading && product && (
            <div className="hidden lg:block absolute top-0 left-0 right-0" style={{ top: 'calc(40px + 72px + 24px)' }}>
              <div className={cn(CONFIG.layout.maxWidth, 'mx-auto', 'px-6 lg:px-8')}>
                <BreadcrumbNavigation />
              </div>
            </div>
          )}
          {/* ✅ MOBIEL: Breadcrumb boven productafbeelding */}
          {!loading && product && (
            <div className="lg:hidden w-full px-4 pt-4 pb-2">
              <BreadcrumbNavigation />
            </div>
          )}
          <div className={cn(
            'flex flex-col', 
            'w-full lg:w-[58%]', // ✅ RESPONSIVE: Full width op mobile, 58% op desktop
            CONFIG.gallery.container.sticky, 
            CONFIG.gallery.container.height, 
            'self-start', 
            'gap-3 sm:gap-4 md:gap-4 lg:gap-4',
            'px-4 md:px-0' // ✅ PADDING: Alleen thumbnails hebben padding, image niet
          )}> {/* ✅ GEEN PADDING MOBIEL: Image gallery heeft geen padding voor edge-to-edge */}
            {/* Main Image - ✅ ECHT EDGE-TO-EDGE: Geen negatieve margin nodig, parent heeft al px-0 */}
            <div className={cn(
              'relative', 
              'aspect-[3/2] sm:aspect-[3/2]', // ✅ RESPONSIVE: Consistent aspect ratio
              'md:rounded-lg', // ✅ DESKTOP: Border radius alleen op desktop
              CONFIG.gallery.mainImage.bgColor, 
              'overflow-hidden', 
              'w-full',
              'min-h-[200px] sm:min-h-[300px]' // ✅ RESPONSIVE: Minimum hoogte voor mobile
            )}> {/* ✅ ECHT EDGE-TO-EDGE: Geen padding, geen negatieve margin nodig */}
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover" // ✅ COVER: Productafbeelding past exact aan veld (geen ruimte)
                priority // 🚀 PERFORMANCE: Above-the-fold, load immediately
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px" // 🚀 PERFORMANCE: Optimized responsive sizes (fastest loading)
                quality={85} // 🚀 PERFORMANCE: High quality WebP/AVIF (optimal balance)
                loading="eager" // 🚀 PERFORMANCE: Load immediately (priority image)
                placeholder="blur" // 🚀 PERFORMANCE: Blur placeholder for instant perceived loading
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==" // 🚀 PERFORMANCE: Tiny 1x1 pixel blur (instant display)
                unoptimized={currentImage.startsWith('/uploads/')} // ✅ FIX: Disable Next.js optimization for /uploads/ paths (served by backend)
                fetchPriority="high" // 🚀 PERFORMANCE: High fetch priority (fastest loading)
              />
              
              {/* Navigation Arrows */}
              {displayImages.length > 1 && (
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
                {selectedImageIndex + 1} / {displayImages.length}
              </div>
            </div>

            {/* ✅ THUMBNAILS ONDER: Met padding (px-4 al in parent) */}
            {displayImages.length > 1 && (
              <div className={cn(
                'flex flex-row gap-2 overflow-x-auto', // ✅ RUIMTE: gap-2 tussen thumbnails
                'w-full', // ✅ PADDING: Parent heeft al px-4 md:px-0
                'smooth-scroll',
                'pb-2' // ✅ MOBILE: Extra padding voor scroll indicator
              )}>
                {displayImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      'w-20 h-20 flex-shrink-0', // ✅ COMPACT: Kleinere thumbnails
                      CONFIG.gallery.thumbnails.borderRadius,
                      CONFIG.gallery.thumbnails.hoverOpacity,
                      'relative overflow-hidden bg-gray-100',
                      'transition-all',
                      'border-2', // ✅ FIX: Base border voor alle thumbnails
                      index === selectedImageIndex 
                        ? 'border-black z-10' // ✅ FIX: Zwarte border met z-index voor geselecteerde thumbnail
                        : 'border-transparent', // ✅ FIX: Transparante border voor niet-geselecteerde
                      index > 0 && 'ml-0' // ✅ GEEN MARGIN: Direct naast elkaar
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px" // 🚀 PERFORMANCE: Thumbnail size (80x80px) - exact size for fastest loading
                      quality={70} // 🚀 PERFORMANCE: Lower quality voor thumbnails (faster loading, still good quality)
                      loading="lazy" // 🚀 PERFORMANCE: Lazy load thumbnails (load only when visible)
                      unoptimized={image.startsWith('/uploads/')} // ✅ FIX: Disable Next.js optimization for /uploads/ paths
                      placeholder="blur" // 🚀 PERFORMANCE: Blur placeholder for smooth loading
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==" // 🚀 PERFORMANCE: Instant blur placeholder
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info - GEEN EXTRA KAART - ✅ ALIGN TOP: Begint opzelfde hoogte als afbeelding */}
          <div className={cn(
            'flex flex-col', 
            'w-full lg:w-[42%]', // ✅ RESPONSIVE: Full width op mobile, 42% op desktop
            'self-start',
            'mt-6 sm:mt-8 md:mt-0 lg:mt-0', // ✅ SYMMETRISCH: Gelijk spacing op mobile, geen margin op desktop
            'mx-auto lg:mx-0', // ✅ SYMMETRISCH: Gecentreerd op mobile, links uitgelijnd op desktop
            'px-4 md:px-0' // ✅ PADDING: Product info heeft padding op mobiel
          )}> {/* ✅ SYMMETRISCH: Perfecte balans */}
            {/* ✅ GEEN EXTRA KAART: Direct op witte achtergrond */}
            <div>
              {/* Productnaam - ✅ BOVENAAN: Gelijk met afbeelding */}
              <h1 className={cn(
                'text-2xl sm:text-3xl lg:text-4xl', // ✅ RESPONSIVE: Kleinere tekst op mobile
                CONFIG.info.title.fontWeight,
                CONFIG.info.title.textColor,
                CONFIG.info.title.marginBottom,
                'leading-tight' // ✅ RESPONSIVE: Tighter line height op mobile
              )}>
                {product.name}
              </h1>
              

              {/* ✅ SCHEIDINGSTREEP: Dun of weg tussen naam en prijs */}
              <div className="border-t border-gray-200 my-2 opacity-50"></div>

              {/* Price - ✅ VARIANT SYSTEM: Show variant-adjusted price */}
              <div className={CONFIG.info.price.spacing}>
                <span className={cn(
                  CONFIG.info.price.current.fontSize,
                  CONFIG.info.price.current.fontWeight,
                  CONFIG.info.price.current.textColor
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
                      <span className="text-base text-gray-500 line-through ml-3">
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
                    <span className="text-sm text-gray-500 ml-2">
                      {adjustment > 0 ? '+' : ''}{formatPrice(adjustment)}
                    </span>
                  );
                })()}
              </div>
              
              {/* ✅ VARIANT SYSTEM: Variant Selector - OPTIMAAL: Label met gekozen kleur opzelfde regel */}
              {variants.length > 0 && (
                <div className="mt-6 mb-4">
                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Kies een kleur:
                    </label>
                    {/* ✅ Gekozen kleur opzelfde regel als label */}
                    {activeVariant && (
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">{activeVariant.name}</span>
                        {activeVariant.stock > 0 && activeVariant.stock < 10 && (
                          <span className="ml-2 text-orange-600">
                            (Nog {activeVariant.stock} op voorraad)
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
                              ? 'border-black'
                              : 'border-gray-300 hover:border-gray-400',
                            isOutOfStock && 'opacity-50 cursor-not-allowed grayscale'
                          )}
                          title={variant.name + (isOutOfStock ? ' (Niet op voorraad)' : '')}
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
                              unoptimized={previewImage.startsWith('/uploads/')}
                            />
                          ) : variant.colorHex ? (
                            <div
                              className="w-full h-full"
                              style={{ backgroundColor: variant.colorHex }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-500 text-center px-1">{variant.colorName || variant.name}</span>
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

              {/* ✅ SERVICE USPs - BOVEN WINKELWAGEN BUTTON: 3 USPs met DIKgedrukte woorden zoals "Gratis verzending" */}
              {PRODUCT_CONTENT.serviceUsps.length > 0 && (
                <div className="flex flex-col gap-2 sm:gap-2.5 mb-4 sm:mb-5">
                  {PRODUCT_CONTENT.serviceUsps.map((usp, index) => {
                    // ✅ DIKGEDRUKTE WOORDEN: Bepaalde woorden dikgedrukt zoals bij "Gratis verzending • Bezorgtijd: 1-2 werkdagen"
                    const renderUSPText = (text: string) => {
                      // ✅ DIKGEDRUKTE WOORDEN: Exacte phrases die dikgedrukt moeten worden
                      const boldPhrases = [
                        'Volledig automatisch',
                        'App bediening',
                        'Binnen 30 dagen',
                        '1 jaar garantie',
                        'Zelfreinigend systeem',
                        'Hygiënisch',
                        'gratis retour',
                      ];
                      
                      // Split op bullet points
                      const parts = text.split(' • ');
                      return parts.map((part, partIndex) => {
                        // Check of dit deel een bold phrase bevat
                        const matchedPhrase = boldPhrases.find(phrase => 
                          part.toLowerCase().includes(phrase.toLowerCase())
                        );
                        
                        if (matchedPhrase) {
                          // Vind de exacte positie van de phrase (case-insensitive)
                          const lowerPart = part.toLowerCase();
                          const lowerPhrase = matchedPhrase.toLowerCase();
                          const phraseIndex = lowerPart.indexOf(lowerPhrase);
                          
                          if (phraseIndex !== -1) {
                            const beforePhrase = part.substring(0, phraseIndex);
                            const phraseText = part.substring(phraseIndex, phraseIndex + matchedPhrase.length);
                            const afterPhrase = part.substring(phraseIndex + matchedPhrase.length);
                            
                            return (
                              <span key={partIndex}>
                                {beforePhrase}
                                <span style={{ fontWeight: 600 }}>{phraseText}</span>
                                {afterPhrase}
                                {partIndex < parts.length - 1 && ' • '}
                              </span>
                            );
                          }
                        }
                        
                        // Geen match, toon gewoon de tekst
                        return (
                          <span key={partIndex}>
                            {part}
                            {partIndex < parts.length - 1 && ' • '}
                          </span>
                        );
                      });
                    };
                    
                    return (
                      <div key={index} className="flex items-center gap-2 text-sm sm:text-base">
                        {/* ✅ BLAUW VIJKJE: Exact blauw #3071aa - alleen vinkje is blauw */}
                        <Check
                          className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                          strokeWidth={3}
                          style={{ color: BRAND_COLORS_HEX.primary }}
                        />
                        {/* ✅ DIKGEDRUKTE TEKST: Bepaalde woorden dikgedrukt zoals "Gratis verzending" */}
                        <span style={{ color: DESIGN_SYSTEM.colors.text.primary }} className="font-medium">
                          {renderUSPText(usp.text)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add to Cart Button - ✅ PREMIUM: Modern button met shadow en transform */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={cn(
                  'relative overflow-hidden group w-full py-5 sm:py-6 text-lg sm:text-xl font-semibold rounded-lg text-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 mb-1 sm:mb-1.5',
                  isAdding && 'bg-green-600 hover:bg-green-600'
                )}
                style={{
                  backgroundColor: isAdding ? '#16a34a' : BRAND_COLORS_HEX.primary,
                }}
                onMouseEnter={(e) => {
                  if (!isAdding) {
                    e.currentTarget.style.backgroundColor = BRAND_COLORS_HEX.primaryDark;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAdding) {
                    e.currentTarget.style.backgroundColor = BRAND_COLORS_HEX.primary;
                  }
                }}
              >
                {isAdding ? (
                  <>
                    <Check className={CONFIG.info.button.icon} />
                    Toegevoegd
                  </>
                ) : (
                  <>
                    <ShoppingCart className={CONFIG.info.button.icon} />
                    Winkelwagen
                  </>
                )}
              </button>

              {/* ✅ BEZORGTIJD - Direct onder winkelwagen button (iets meer padding) - BLAUW */}
              <div className="flex items-center justify-center mt-2 sm:mt-2.5 mb-0 -mx-2 sm:mx-0">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mr-1.5 text-brand" />
                <span className="text-sm sm:text-base" style={{ color: DESIGN_SYSTEM.colors.text.primary, fontWeight: 500 }}>
                  <span>Bezorgtijd: <span style={{ fontWeight: 600 }}>1-2 werkdagen</span></span>
                </span>
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

              {/* ✅ ACCORDION SECTIES: Omschrijving, Specificaties, Vragen - STICKY MET AFBEELDING */}
              <div className="mt-6 space-y-4">
                {/* Omschrijving Accordion */}
                <div>
                  <button
                    onClick={() => toggleAccordion('omschrijving')}
                    className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 flex items-center justify-between group"
                  >
                    <span className="text-base md:text-lg font-semibold text-gray-900">
                      Omschrijving
                    </span>
                    <ChevronDown 
                      className={cn(
                        'w-5 h-5 text-gray-600 transition-transform duration-200',
                        openAccordions.has('omschrijving') && 'rotate-180'
                      )}
                    />
                  </button>
                  
                  {openAccordions.has('omschrijving') && (
                    <div className="mt-4 px-6 py-4 bg-white border border-gray-200 rounded-lg border-t-0">
                      <div className={cn(CONFIG.tabs.content.fontSize, CONFIG.tabs.content.textColor, CONFIG.tabs.content.lineHeight)}>
                        <h3 className="text-base sm:text-lg font-semibold mb-2">Product Omschrijving</h3>
                        <p className="text-sm sm:text-base mb-3">
                          {product.description || 'De beste automatische kattenbak met zelfreinigende functie. Perfect voor katten tot 7kg. Volledig automatisch met app-bediening.'}
                        </p>
                        {product.description && (
                          <>
                            <h4 className="text-sm sm:text-base font-semibold mb-1.5">Standaard meegeleverd:</h4>
                            <ul className="space-y-1 ml-4 text-sm sm:text-base">
                              <li>• 1x {product.name}</li>
                              <li>• 1x Stroomadapter</li>
                              <li>• 1x Afvalzak (starter)</li>
                              <li>• 1x Borstel (voor onderhoud)</li>
                              <li>• 1x Geurfilter</li>
                              <li>• 1x Inloopmat</li>
                              <li>• 1x Handleiding (NL/EN)</li>
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
                    className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 flex items-center justify-between group"
                  >
                    <span className="text-base md:text-lg font-semibold text-gray-900">
                      Specificaties
                    </span>
                    <ChevronDown 
                      className={cn(
                        'w-5 h-5 text-gray-600 transition-transform duration-200',
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

                {/* Vragen Accordion */}
                <div>
                  <button
                    onClick={() => toggleAccordion('vragen')}
                    className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 flex items-center justify-between group"
                  >
                    <span className="text-base md:text-lg font-semibold text-gray-900">
                      Vragen
                    </span>
                    <ChevronDown 
                      className={cn(
                        'w-5 h-5 text-gray-600 transition-transform duration-200',
                        openAccordions.has('vragen') && 'rotate-180'
                      )}
                    />
                  </button>
                  
                  {openAccordions.has('vragen') && (
                    <div className="mt-4 px-6 py-4 bg-white border border-gray-200 rounded-lg border-t-0">
                      <div className={cn(CONFIG.tabs.content.fontSize, CONFIG.tabs.content.textColor)}>
                        <h3 className="text-lg font-semibold mb-4">Vragen over {product.name}</h3>
                        <div className="space-y-4">
                          {/* ✅ SEO PHASE 2: FAQ uitbreiden - gebruik PRODUCT_CONTENT.faqs */}
                          {PRODUCT_CONTENT.faqs?.map((faq: { q: string; a: string }, index: number) => (
                            <div key={index}>
                              <h4 className="font-semibold mb-1">{faq.q}</h4>
                              <p className="text-sm">{faq.a}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* ✅ SCHEIDINGSTREEP: Tussen tabs/omschrijving en edge-to-edge - IETS GRIJZER */}
      <div className={cn(CONFIG.layout.maxWidth, 'mx-auto', CONFIG.layout.containerPadding)}>
        <div className="border-t border-gray-300 my-6 sm:my-8"></div>
      </div>

      {/* ✅ EDGE-TO-EDGE IMAGE SECTION: Tussen tabs en zigzag - DRY & DYNAMISCH - OPTIMAAL MOBIEL - EDGE-TO-EDGE */}
      <div className={cn(CONFIG.edgeSection.container, 'my-4 sm:my-6 md:my-8 lg:my-10')}>
        <div className={cn('relative', CONFIG.edgeSection.image.aspectRatio, 'overflow-hidden', 'bg-gray-100')}>
          <Image
            src={
              // ✅ DYNAMISCH: Gebruik EERSTE geüploade product image (index 0) - dynamisch met eerste foto upload
              images && images.length > 0 && !images[0].startsWith('data:')
                ? images[0] // ✅ EERSTE FOTO: Dynamisch met eerste foto upload
                : (productImages && productImages.length > 0 && !productImages[0].startsWith('data:')
                  ? productImages[0] // ✅ FALLBACK: productImages als images leeg is
                  : (PRODUCT_CONTENT.edgeImageSection.image || '/images/feature-2.jpg'))
            }
            alt={product.name}
            fill
            className={cn(CONFIG.edgeSection.image.objectFit, CONFIG.edgeSection.image.brightness)}
            sizes="100vw" // 🚀 PERFORMANCE: Full viewport width (edge-to-edge)
            priority={false} // 🚀 PERFORMANCE: Below-the-fold, lazy load
            quality={80} // 🚀 PERFORMANCE: Slightly lower quality for below-fold (faster loading)
            loading="lazy" // 🚀 PERFORMANCE: Lazy load (below-the-fold, load only when scrolled)
            placeholder="blur" // 🚀 PERFORMANCE: Blur placeholder for smooth perceived loading
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            unoptimized={(images && images.length > 0 && (images[0].startsWith('/uploads/') || images[0].startsWith('https://'))) || (productImages && productImages.length > 0 && (productImages[0].startsWith('/uploads/') || productImages[0].startsWith('https://')))} // ✅ FIX: Disable Next.js optimization for /uploads/ and https:// paths
            onError={(e) => {
              // ✅ FALLBACK: Als afbeelding niet laadt, toon placeholder
              const target = e.target as HTMLImageElement;
              if (target && !target.src.includes('placeholder')) {
                target.src = '/images/feature-2.jpg';
              }
            }}
          />
          {/* Overlay met tekst - ✅ DYNAMISCH & MOBIEL OPTIMAAL: Gebruik product.description of fallback */}
          <div className={CONFIG.edgeSection.overlay.position}>
            <div className={cn(CONFIG.edgeSection.overlay.content, CONFIG.edgeSection.overlay.textAlign, 'px-4 sm:px-8 lg:px-16')}>
              <h2 className={cn(
                'text-xl sm:text-2xl md:text-3xl lg:text-4xl', // ✅ MOBIEL: Kleinere tekst op mobiel
                CONFIG.edgeSection.title.fontWeight,
                CONFIG.edgeSection.title.textColor,
                CONFIG.edgeSection.title.marginBottom
              )}>
                {product.name}
              </h2>
              {/* ✅ DYNAMISCH: Product beschrijving - gaat dynamisch mee met eerste foto upload */}
              <p className={cn(
                'text-sm sm:text-base md:text-lg', // ✅ MOBIEL: Responsive tekst
                CONFIG.edgeSection.description.textColor,
                'hidden sm:block' // ✅ MOBIEL: Verberg beschrijving op mobiel
              )}>
                {product.description || product.shortDescription || `${product.name} - Premium zelfreinigende kattenbak met app-bediening`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ SCHEIDINGSTREEP: Tussen edge-to-edge en zigzag begin */}
      <div className={cn(CONFIG.layout.maxWidth, 'mx-auto', CONFIG.layout.containerPadding)}>
        <div className="border-t border-gray-300 my-6 sm:my-8"></div>
      </div>

      {/* ✅ PREMIUM KWALITEIT SECTIE VERWIJDERD - Focus op 10.5L afvalbak */}

      {/* Feature Sections - ZIGZAG PATTERN - ✅ EXACT ZELFDE: Identiek aan productafbeeldingen container */}
      <div className={cn(
        CONFIG.layout.maxWidth, 
        'mx-auto', 
        CONFIG.layout.containerPadding, // ✅ EXACT ZELFDE: Container padding zoals productafbeeldingen (px-4 sm:px-6 md:px-8 lg:px-8)
        'py-8 sm:py-10 md:py-12 lg:py-12' // ✅ SYMMETRISCH: Gelijk boven/onder
      )}>
        <div className={CONFIG.featureSection.containerSpacing}>
          {features.map((feature, index) => {
            const isEven = index % 2 === 0;
            return (
              <div 
                key={index} 
                className={isEven ? CONFIG.featureSection.zigzag.leftLayout : CONFIG.featureSection.zigzag.rightLayout}
              >
                {/* Image - ✅ MOBIEL: Centraal, desktop zigzag */}
                <div className={cn(
                  'relative',
                  'w-full md:w-auto', // ✅ MOBIEL: Full width centraal, desktop auto
                  isEven ? CONFIG.featureSection.zigzag.imageOrder.left : CONFIG.featureSection.zigzag.imageOrder.right,
                  CONFIG.featureSection.image.aspectRatio, // ✅ ASPECT RATIO: Container heeft juiste ratio
                  CONFIG.featureSection.image.borderRadius,
                  CONFIG.featureSection.image.bgColor,
                  'overflow-hidden' // ✅ OVERFLOW: Zorgt dat afbeelding binnen container blijft
                )}>
                  <Image
                    src={feature.image || '/images/placeholder.jpg'} // ✅ FIX: Geen lege string (fallback naar placeholder)
                    alt={feature.title}
                    fill // ✅ FILL: Vult container exact op
                    className="object-contain" // ✅ CONTAIN: Zigzag foto's volledig zichtbaar (niet object-cover)
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" // 🚀 PERFORMANCE: Responsive sizes voor zigzag (fastest loading)
                    quality={80} // 🚀 PERFORMANCE: Slightly lower quality for below-fold (faster)
                    loading="lazy" // 🚀 PERFORMANCE: Lazy load (below-the-fold, load only when visible)
                    placeholder="blur" // 🚀 PERFORMANCE: Blur placeholder for smooth loading
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==" // 🚀 PERFORMANCE: Instant blur placeholder
                    unoptimized={feature.image?.startsWith('/uploads/') || feature.image?.startsWith('/images/') || feature.image?.startsWith('https://') || feature.image?.startsWith('http://')} // ✅ FIX: Disable Next.js optimization for /uploads/, /images/, and https:// paths
                    onError={(e) => {
                      // ✅ FALLBACK: Als afbeelding niet laadt, toon placeholder
                      const target = e.target as HTMLImageElement;
                      if (target && !target.src.includes('placeholder')) {
                        target.src = '/images/placeholder.jpg';
                      }
                    }}
                  />
                </div>

                {/* Text Content */}
                <div className={cn(
                  CONFIG.featureSection.text.container,
                  isEven ? CONFIG.featureSection.zigzag.textOrder.left : CONFIG.featureSection.zigzag.textOrder.right
                )}>
                  <h3 className={cn(
                    CONFIG.featureSection.text.title.fontSize,
                    CONFIG.featureSection.text.title.fontWeight,
                    CONFIG.featureSection.text.title.textColor,
                    CONFIG.featureSection.text.title.letterSpacing, // ✅ EXACT ZELFDE: Letter spacing zoals productnaam
                    CONFIG.featureSection.text.title.textAlign // ✅ MOBIEL: Centraal, desktop links
                  )}>
                    {feature.title}
                  </h3>
                  <p className={cn(
                    CONFIG.featureSection.text.description.fontSize,
                    CONFIG.featureSection.text.description.textColor,
                    CONFIG.featureSection.text.description.lineHeight,
                    CONFIG.featureSection.text.description.textAlign // ✅ MOBIEL: Centraal, desktop links
                  )}>
                    {feature.description}
                  </p>
                  {/* ✅ BULLET POINTS VERWIJDERD: Alleen titel en beschrijving */}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ VERGELIJKINGSTABEL: Modern, smooth, gebaseerd op echte info */}
      <div className={cn(CONFIG.layout.maxWidth, 'mx-auto', CONFIG.layout.containerPadding, 'py-12 lg:py-16')}>
        <ProductComparisonTable />
      </div>

    </div>
  );
}
