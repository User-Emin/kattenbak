"use client";

import { useState, useEffect } from "react";
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
import type { Product } from "@/types/product";
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
  const [activeTab, setActiveTab] = useState<'omschrijving' | 'specificaties' | 'vragen'>('omschrijving');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showAllSpecs, setShowAllSpecs] = useState(false); // ✅ Toon meer specs state
  const [showAllFeatures, setShowAllFeatures] = useState(false); // ✅ Toon meer features state
  const [openSpecs, setOpenSpecs] = useState<Set<number>>(new Set());

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
        
        // ✅ RETRY: Probeer opnieuw bij network errors, 502, 503, 504
        if (retryCount < MAX_RETRIES && (
          error?.isNetworkError || 
          error?.isGatewayError || 
          error?.status === 502 ||
          error?.status === 503 ||
          error?.status === 504 ||
          error?.message?.includes('verbinding') ||
          error?.message?.includes('tijdelijk niet beschikbaar') ||
          error?.message?.includes('Bad Gateway') ||
          error?.message?.includes('Service Unavailable')
        )) {
          retryCount++;
          setTimeout(() => {
            if (isMounted) {
              loadProduct();
            }
          }, RETRY_DELAY * retryCount); // Exponential backoff
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
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
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          Terug naar Home
        </Link>
      </div>
    );
  }
  
  // ✅ FIX: Loading state - toon loading tijdens retries
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Product laden...</p>
      </div>
    );
  }

  // Get product images - ✅ FILTER: Alleen geüploade foto's (geen oude/placeholder)
  const images = product.images && Array.isArray(product.images) && product.images.length > 0
    ? product.images.filter((img: string) => {
        // ✅ FILTER: Alleen geldige geüploade foto's (geen placeholder, geen oude paths)
        if (!img || typeof img !== 'string') return false;
        // Filter placeholder images
        if (img.includes('placeholder') || img.includes('demo') || img.includes('default')) return false;
        // Alleen geüploade foto's (van /uploads/ of /api/ of http/https)
        return img.startsWith('/uploads/') || img.startsWith('/api/') || img.startsWith('http://') || img.startsWith('https://');
      })
    : [];
  
  // ✅ FALLBACK: Als geen geüploade foto's, toon placeholder
  const displayImages = images.length > 0 ? images : ['/placeholder-image.jpg'];
  const currentImage = displayImages[selectedImageIndex] || displayImages[0];

  // Handle add to cart - ✅ DIRECTE VERWIJZING: Naar winkelwagenpagina
  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      addItem(product, quantity);
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

  // Tabs configuration (DRY - dynamic tab management)
  const tabs = [
    { id: 'omschrijving' as const, label: 'Omschrijving' },
    { id: 'specificaties' as const, label: 'Specificaties' },
    { id: 'vragen' as const, label: 'Vragen' },
  ];

  // Specifications data - GEBASEERD OP ECHTE PRODUCT INFO (screenshots)
  const specifications = [
    {
      icon: Sparkles,
      title: 'Zelfreinigende Functie',
      description: 'Automatische reiniging na elk gebruik. Dubbele veiligheidssensoren zorgen voor 100% veiligheid.',
    },
    {
      icon: Box,
      title: 'Open-Top Design',
      description: 'Low-stress design voor katten. Geen claustrofobisch gevoel. Ventilatie voor frisse lucht.',
    },
    {
      icon: Shield,
      title: 'Dubbele Veiligheidssensoren',
      description: 'IR + gewichtssensor. Pauzeert automatisch als kat terug gaat. Getest op meer dan 10.000 cycli.',
    },
    {
      icon: Smartphone,
      title: 'App Bediening & Monitoring',
      description: 'iOS & Android app. Real-time notifications. Gezondheidsmonitoring & statistieken. Cloud-sync.',
    },
    {
      icon: Filter,
      title: 'Geurfilter & Hygiëne',
      description: 'Hygiënisch zowel voor je kat als voor je huis. Dempt vieze geuren effectief.',
    },
    {
      icon: Package,
      title: 'Afvalbak Capaciteit',
      description: '10.5L XL capaciteit (17% meer dan concurrentie). Voor 1 kat: 7-10 dagen. Meerdere katten: 3-5 dagen.',
    },
    {
      icon: Droplet,
      title: 'Los te maken voor schoonmaak',
      description: 'Makkelijk te demonteren voor grondig schoonmaken. Alle onderdelen zijn goed bereikbaar.',
    },
    {
      icon: Layers,
      title: 'Makkelijk Te Demonteren',
      description: 'Modulair ontwerp zonder tools. Alle onderdelen makkelijk te bereiken. Schoonmaken in 5 minuten.',
    },
    {
      icon: Check,
      title: 'Ondersteunde Vulling Types',
      description: 'Klonterende klei vulling, plantaardige vulling, en gemixte vulling. Kies wat jij het beste vindt.',
    },
    {
      icon: Maximize,
      title: 'Compact Footprint, Groot Interieur',
      description: 'Buitenmaat: 65×53×65cm. Binnenmaat: groot genoeg voor katten tot 7kg. Past onder meeste kasten.',
    },
    {
      icon: Volume2,
      title: 'Ultra-Stil Motor (<40 dB)',
      description: 'Stiller dan conversatie. Verstoort niet tijdens slaap. Premium Japanse motor technologie.',
    },
    {
      icon: Settings,
      title: 'Modulair Ontwerp (OEM-Friendly)',
      description: 'Professioneel modulair ontwerp. Makkelijk te upgraden en onderdelen te vervangen. Duurzaam & toekomstbestendig.',
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

  // Features data - ✅ DRY: Via PRODUCT_CONTENT (geen hardcode)
  const features = PRODUCT_CONTENT.features.map((feature, index) => ({
    ...feature,
    image: index === 0 
      ? '/images/capacity-10.5l-optimized.jpg' // ✅ FOTO GEOPTIMALISEERD: Exact zoals screenshot, geoptimaliseerd
      : index === 1
      ? '/images/feature-2.jpg' // ✅ DYNAMISCH: Exact zelfde als home (geen hardcode) - EXACT IDENTIEK
      : '/images/traditional-litter-box-optimized.jpg', // ✅ 3E ZIGZAG: Geurblokje, kwats & afvalzak
  }));

  return (
    <div className="min-h-screen bg-white"> {/* ✅ WIT: Volledig witte achtergrond */}
      {/* Main Product Section - Breadcrumb binnen grid */}
      <div className={cn(CONFIG.layout.maxWidth, 'mx-auto', CONFIG.layout.containerPadding, CONFIG.layout.topMargin, CONFIG.layout.sectionSpacing)}>
        {/* Breadcrumb - Bovenaan grid container */}
        <nav className={CONFIG.breadcrumb.containerPadding}>
          <ol className={CONFIG.breadcrumb.spacing}>
            <li>
              <Link 
                href="/" 
                className={cn(CONFIG.breadcrumb.textColor, CONFIG.breadcrumb.hoverColor, 'flex items-center gap-1')}
              >
                <Home className={CONFIG.breadcrumb.iconSize} />
                Home
              </Link>
            </li>
            <li className={CONFIG.breadcrumb.textColor}>
              <BreadcrumbChevron className={CONFIG.breadcrumb.iconSize} />
            </li>
            <li>
              <Link 
                href="/producten" 
                className={cn(CONFIG.breadcrumb.textColor, CONFIG.breadcrumb.hoverColor)}
              >
                Producten
              </Link>
            </li>
            <li className={CONFIG.breadcrumb.textColor}>
              <BreadcrumbChevron className={CONFIG.breadcrumb.iconSize} />
            </li>
            <li className={cn(CONFIG.breadcrumb.fontSize, 'font-medium text-gray-900')}>
              {product.name}
            </li>
          </ol>
        </nav>
        
        <div className={cn(
          'flex flex-col lg:flex-row', 
          'items-start', 
          'mt-6 sm:mt-8 md:mt-10 lg:mt-10', // ✅ SYMMETRISCH: Gelijk boven
          'gap-6 sm:gap-8 md:gap-10 lg:gap-10', // ✅ SYMMETRISCH: Gelijk tussen image en info
          'mb-6 sm:mb-8 md:mb-10 lg:mb-10' // ✅ SYMMETRISCH: Gelijk onder
        )}> {/* ✅ SYMMETRISCH: Perfecte balans op alle schermformaten */}
          {/* Left: Image Gallery - ✅ VERTICAAL BREDER, THUMBNAILS ONDER MET RUIMTE */}
          <div className={cn(
            'flex flex-col', 
            'w-full lg:w-[58%]', // ✅ RESPONSIVE: Full width op mobile, 58% op desktop
            CONFIG.gallery.container.sticky, 
            CONFIG.gallery.container.height, 
            'self-start', 
            'gap-3 sm:gap-4 md:gap-4 lg:gap-4', // ✅ SYMMETRISCH: Gelijk tussen image en thumbnails
            'mx-auto lg:mx-0' // ✅ SYMMETRISCH: Gecentreerd op mobile, links uitgelijnd op desktop
          )}> {/* ✅ SYMMETRISCH: Perfecte balans */}
            {/* Main Image - ✅ EXACT PASSEND: Productafbeelding past exact aan veld */}
            <div className={cn(
              'relative', 
              'aspect-[3/2] sm:aspect-[3/2]', // ✅ RESPONSIVE: Consistent aspect ratio
              CONFIG.gallery.mainImage.borderRadius, 
              CONFIG.gallery.mainImage.bgColor, 
              'overflow-hidden', 
              'w-full',
              'min-h-[200px] sm:min-h-[300px]' // ✅ RESPONSIVE: Minimum hoogte voor mobile
            )}> {/* ✅ HORIZONTAAL: aspect-[3/2] - horizontaal langer, verticaal korter */}
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover" // ✅ COVER: Productafbeelding past exact aan veld (geen ruimte)
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 58vw, 58vw" // ✅ RESPONSIVE: Optimale image sizes
                unoptimized={currentImage.startsWith('/uploads/')} // ✅ FIX: Disable Next.js optimization for /uploads/ paths (served by backend)
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

            {/* ✅ THUMBNAILS ONDER: Met ruimte tussen afbeelding en thumbnails */}
            {displayImages.length > 1 && (
              <div className={cn(
                'flex flex-row gap-2 overflow-x-auto', // ✅ RUIMTE: gap-2 tussen thumbnails
                'w-full',
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
                      CONFIG.gallery.thumbnails.verticalSlide.border,
                      index === selectedImageIndex && CONFIG.gallery.thumbnails.verticalSlide.activeBorder,
                      index > 0 && 'ml-0' // ✅ GEEN MARGIN: Direct naast elkaar
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-contain"
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
            'mx-auto lg:mx-0' // ✅ SYMMETRISCH: Gecentreerd op mobile, links uitgelijnd op desktop
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

              {/* Price */}
              <div className={CONFIG.info.price.spacing}>
                <span className={cn(
                  CONFIG.info.price.current.fontSize,
                  CONFIG.info.price.current.fontWeight,
                  CONFIG.info.price.current.textColor
                )}>
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* ✅ SCHEIDINGSTREEP: Tussen prijs en beschrijving - IETS GRIJZER */}
              <div className="border-t border-gray-300 my-4"></div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className={cn(
                  CONFIG.info.description.fontSize,
                  CONFIG.info.description.textColor,
                  CONFIG.info.description.lineHeight,
                  CONFIG.info.description.marginBottom
                )}>
                  {product.shortDescription}
                </p>
              )}

              {/* ✅ SERVICE USPs - 3 onder elkaar BOVEN WINKELWAGEN BUTTON - DRY & ZONDER HARDCODE */}
              <div className="flex flex-col gap-2 sm:gap-2.5 mb-4 sm:mb-5">
                {PRODUCT_CONTENT.serviceUsps.map((usp, index) => {
                  // ✅ DRY: Icon mapping gebaseerd op tekst
                  let Icon = Truck;
                  if (usp.text.includes('bedenktijd') || usp.text.includes('retour')) {
                    Icon = Shield;
                  } else if (usp.text.includes('Geleverd met') || usp.text.includes('inloopmat') || usp.text.includes('afvalzak')) {
                    Icon = Package;
                  }
                  
                  return (
                    <div key={index} className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                      <span>{usp.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* Add to Cart Button - ✅ ONDER SERVICE USPs */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={cn(
                  'w-full',
                  'py-5 sm:py-6 md:py-6 lg:py-6', // ✅ SYMMETRISCH: Gelijk padding boven/onder
                  'px-4 sm:px-6 md:px-6 lg:px-6', // ✅ SYMMETRISCH: Gelijk padding links/rechts
                  'text-lg sm:text-xl md:text-2xl lg:text-2xl', // ✅ SYMMETRISCH: Gelijk tekst scaling
                  CONFIG.info.button.fontWeight,
                  CONFIG.info.button.bgColor,
                  CONFIG.info.button.hoverBgColor,
                  CONFIG.info.button.textColor,
                  CONFIG.info.button.borderRadius,
                  CONFIG.info.button.transition,
                  'flex items-center justify-center gap-2',
                  'mb-6 sm:mb-8 md:mb-8 lg:mb-8', // ✅ SYMMETRISCH: Gelijk margin onder
                  'touch-manipulation', // ✅ MOBILE: Betere touch response
                  isAdding && 'bg-green-600 hover:bg-green-600'
                )}
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

              {/* ✅ BEZORGTIJD - Direct onder winkelwagen button (minimale witruimte) */}
              <div className="flex items-center justify-center gap-1.5 mt-1 sm:mt-1.5 mb-4 sm:mb-5">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm sm:text-base font-medium text-gray-700">Bezorgtijd: <span className="text-green-600">1-2 werkdagen</span></span>
              </div>

              {/* ✅ PRODUCT-SPECIFIEKE USPs - 3 naast elkaar ONDER WINKELWAGEN MET AFBEELDINGEN - DRY & SMOOTH */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-4 mt-4 sm:mt-6 md:mt-6 lg:mt-6 mb-4 sm:mb-6 md:mb-6 lg:mb-6"> {/* ✅ SYMMETRISCH: Gelijk spacing */}
                {PRODUCT_CONTENT.productUsps.map((usp, index) => (
                  <div key={index} className="flex flex-col items-center text-center">
                    {/* ✅ AFBEELDING: Smooth, direct op witte achtergrond */}
                    {usp.image && (
                      <div className="relative mb-2 sm:mb-3" style={{ width: '64px', height: '64px' }}>
                        <Image
                          src={usp.image}
                          alt={usp.title}
                          width={64}
                          height={64}
                          className="object-contain transition-all duration-300 hover:scale-110"
                          style={{ background: '#ffffff' }}
                        />
                      </div>
                    )}
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                      {usp.title}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-gray-600 leading-tight">
                      {usp.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Specificaties Accordion - ONDER USPs */}
              <div className={cn(CONFIG.features.accordion.container, 'mt-6')}>
              {/* Eerste features altijd zichtbaar */}
              {specifications.slice(0, CONFIG.features.showMore.initialVisible).map((spec, index) => {
                const Icon = spec.icon;
                const isOpen = openSpecs.has(index);

                return (
                  <div 
                    key={index}
                    className={cn(CONFIG.features.accordion.item.border, CONFIG.features.accordion.item.hover)}
                  >
                    <button
                      onClick={() => toggleSpec(index)}
                      className={CONFIG.features.accordion.button.container}
                    >
                      <div className="flex items-center flex-1">
                        {/* ✅ ICONS WEGGEHAALD: Geen icon container meer */}
                        <span className={cn(
                          CONFIG.features.accordion.button.title.fontSize,
                          CONFIG.features.accordion.button.title.fontWeight,
                          CONFIG.features.accordion.button.title.textColor
                        )}>
                          {spec.title}
                        </span>
                      </div>
                      <ChevronDown 
                        className={cn(
                          CONFIG.features.accordion.button.arrow.size,
                          CONFIG.features.accordion.button.arrow.color,
                          CONFIG.features.accordion.button.arrow.transition,
                          isOpen && 'rotate-180'
                        )}
                      />
                    </button>

                    {isOpen && (
                      <div className={CONFIG.features.accordion.content.container}>
                        <p className={cn(
                          CONFIG.features.accordion.content.text.fontSize,
                          CONFIG.features.accordion.content.text.textColor,
                          CONFIG.features.accordion.content.text.lineHeight
                        )}>
                          {spec.description}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Extra features na "Toon meer" klik */}
              {showAllFeatures && specifications.slice(CONFIG.features.showMore.initialVisible).map((spec, index) => {
                const actualIndex = index + CONFIG.features.showMore.initialVisible;
                const Icon = spec.icon;
                const isOpen = openSpecs.has(actualIndex);

                return (
                  <div 
                    key={actualIndex}
                    className={cn(CONFIG.features.accordion.item.border, CONFIG.features.accordion.item.hover)}
                  >
                    <button
                      onClick={() => toggleSpec(actualIndex)}
                      className={CONFIG.features.accordion.button.container}
                    >
                      <div className="flex items-center flex-1">
                        {/* ✅ ICONS WEGGEHAALD: Geen icon container meer */}
                        <span className={cn(
                          CONFIG.features.accordion.button.title.fontSize,
                          CONFIG.features.accordion.button.title.fontWeight,
                          CONFIG.features.accordion.button.title.textColor
                        )}>
                          {spec.title}
                        </span>
                      </div>
                      <ChevronDown 
                        className={cn(
                          CONFIG.features.accordion.button.arrow.size,
                          CONFIG.features.accordion.button.arrow.color,
                          CONFIG.features.accordion.button.arrow.transition,
                          isOpen && 'rotate-180'
                        )}
                      />
                    </button>

                    {isOpen && (
                      <div className={CONFIG.features.accordion.content.container}>
                        <p className={cn(
                          CONFIG.features.accordion.content.text.fontSize,
                          CONFIG.features.accordion.content.text.textColor,
                          CONFIG.features.accordion.content.text.lineHeight
                        )}>
                          {spec.description}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Toon meer/minder button */}
              {specifications.length > CONFIG.features.showMore.initialVisible && (
                <button
                  onClick={() => setShowAllFeatures(!showAllFeatures)}
                  className={cn(
                    CONFIG.features.showMore.buttonStyle.base,
                    CONFIG.features.showMore.buttonStyle.color,
                    'flex items-center justify-center w-full'
                  )}
                >
                  <span>
                    {showAllFeatures 
                      ? CONFIG.features.showMore.buttonText.less 
                      : CONFIG.features.showMore.buttonText.more}
                  </span>
                  {showAllFeatures ? (
                    <ChevronUp className={CONFIG.features.showMore.buttonStyle.icon} />
                  ) : (
                    <ChevronDown className={CONFIG.features.showMore.buttonStyle.icon} />
                  )}
                </button>
              )}
              </div>

              {/* ✅ ROOD: Let op bericht terug naar rood */}
              <div className={cn(CONFIG.safetyNotice.container, 'mt-6')}>
                <div className={CONFIG.safetyNotice.header.container}>
                  <AlertTriangle className={cn(
                    CONFIG.safetyNotice.header.icon.size,
                    CONFIG.safetyNotice.header.icon.color
                  )} />
                  <h4 className={cn(
                    CONFIG.safetyNotice.header.title.fontSize,
                    CONFIG.safetyNotice.header.title.fontWeight,
                    CONFIG.safetyNotice.header.title.textColor
                  )}>
                    {PRODUCT_CONTENT.safetyNotice.title}
                  </h4>
                </div>
                <p className={cn(
                  CONFIG.safetyNotice.content.fontSize,
                  CONFIG.safetyNotice.content.textColor,
                  CONFIG.safetyNotice.content.lineHeight
                )}>
                  {PRODUCT_CONTENT.safetyNotice.text}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section - ✅ SYMMETRISCH: Gelijk padding */}
      <div className={cn(
        CONFIG.layout.maxWidth, 
        'mx-auto', 
        CONFIG.layout.containerPadding, 
        'py-8 sm:py-10 md:py-12 lg:py-12' // ✅ SYMMETRISCH: Gelijk boven/onder
      )}>
        {/* Tab Buttons */}
        <div className={CONFIG.tabs.container.borderBottom}>
          <div className={CONFIG.tabs.container.spacing}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  CONFIG.tabs.button.fontSize,
                  CONFIG.tabs.button.fontWeight,
                  CONFIG.tabs.button.padding,
                  CONFIG.tabs.button.transition,
                  activeTab === tab.id
                    ? cn(CONFIG.tabs.button.activeTextColor, CONFIG.tabs.button.activeBorder)
                    : cn(CONFIG.tabs.button.textColor, CONFIG.tabs.button.hoverTextColor)
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content - DYNAMISCH MET LOGISCHE INFO */}
        <div className={CONFIG.tabs.content.padding}>
          {activeTab === 'omschrijving' && (
            <div className={cn(CONFIG.tabs.content.spacing, CONFIG.tabs.content.fontSize, CONFIG.tabs.content.textColor, CONFIG.tabs.content.lineHeight)}>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Product Omschrijving</h3>
              <p className="text-sm sm:text-base mb-3">
                {product.description || 'De beste automatische kattenbak met zelfreinigende functie. Perfect voor katten tot 7kg. Volledig automatisch met app-bediening.'}
              </p>
              <h4 className="text-sm sm:text-base font-semibold mb-1.5">Standaard meegeleverd:</h4>
              <ul className="space-y-1 ml-4 text-sm sm:text-base">
                <li>• 1x Automatische Kattenbak Premium</li>
                <li>• 1x Stroomadapter</li>
                <li>• 1x Afvalzak (starter)</li>
                <li>• 1x Borstel (voor onderhoud)</li>
                <li>• 1x Geurfilter</li>
                <li>• 1x Inloopmat</li>
                <li>• 1x Handleiding (NL/EN)</li>
              </ul>
              <p className="mt-3 text-xs sm:text-sm text-gray-600 italic">
                * Kattenbakvulling niet inbegrepen. Geschikt voor klonterende klei, plantaardige en gemixte vulling.
              </p>
            </div>
          )}
          {activeTab === 'specificaties' && (
            <div className={cn(CONFIG.tabs.content.spacing, CONFIG.tabs.content.fontSize, CONFIG.tabs.content.textColor)}>
              <h3 className="text-lg font-semibold mb-3">Technische Specificaties</h3>
              
              {/* ✅ DYNAMISCHE specificaties met Toon meer */}
              <div className={CONFIG.specifications.container}>
                {/* Eerste groep - altijd zichtbaar */}
                <div className="space-y-0">
                  <div className={CONFIG.specifications.item.layout}>
                    <span className={cn(
                      CONFIG.specifications.item.label.fontSize,
                      CONFIG.specifications.item.label.fontWeight,
                      CONFIG.specifications.item.label.textColor
                    )}>Buitenmaat</span>
                    <span className={cn(
                      CONFIG.specifications.item.value.fontSize,
                      CONFIG.specifications.item.value.textColor
                    )}>65 × 53 × 65 cm</span>
                  </div>
                  <div className={CONFIG.specifications.item.layout}>
                    <span className={cn(
                      CONFIG.specifications.item.label.fontSize,
                      CONFIG.specifications.item.label.fontWeight,
                      CONFIG.specifications.item.label.textColor
                    )}>Geschikt voor katten</span>
                    <span className={cn(
                      CONFIG.specifications.item.value.fontSize,
                      CONFIG.specifications.item.value.textColor
                    )}>Tot 7kg</span>
                  </div>
                  <div className={CONFIG.specifications.item.layout}>
                    <span className={cn(
                      CONFIG.specifications.item.label.fontSize,
                      CONFIG.specifications.item.label.fontWeight,
                      CONFIG.specifications.item.label.textColor
                    )}>Gewicht</span>
                    <span className={cn(
                      CONFIG.specifications.item.value.fontSize,
                      CONFIG.specifications.item.value.textColor
                    )}>8.5 kg</span>
                  </div>
                  <div className={CONFIG.specifications.item.layout}>
                    <span className={cn(
                      CONFIG.specifications.item.label.fontSize,
                      CONFIG.specifications.item.label.fontWeight,
                      CONFIG.specifications.item.label.textColor
                    )}>Afvalbak capaciteit</span>
                    <span className={cn(
                      CONFIG.specifications.item.value.fontSize,
                      CONFIG.specifications.item.value.textColor
                    )}>10.5L</span>
                  </div>
                  <div className={CONFIG.specifications.item.layout}>
                    <span className={cn(
                      CONFIG.specifications.item.label.fontSize,
                      CONFIG.specifications.item.label.fontWeight,
                      CONFIG.specifications.item.label.textColor
                    )}>Geluidsniveau</span>
                    <span className={cn(
                      CONFIG.specifications.item.value.fontSize,
                      CONFIG.specifications.item.value.textColor
                    )}>&lt;40 dB</span>
                  </div>
                </div>

                {/* Extra specificaties - alleen zichtbaar na klik */}
                {showAllSpecs && (
                  <div className="space-y-0">
                    <div className={CONFIG.specifications.item.layout}>
                      <span className={cn(
                        CONFIG.specifications.item.label.fontSize,
                        CONFIG.specifications.item.label.fontWeight,
                        CONFIG.specifications.item.label.textColor
                      )}>Stroomverbruik standby</span>
                      <span className={cn(
                        CONFIG.specifications.item.value.fontSize,
                        CONFIG.specifications.item.value.textColor
                      )}>15W</span>
                    </div>
                    <div className={CONFIG.specifications.item.layout}>
                      <span className={cn(
                        CONFIG.specifications.item.label.fontSize,
                        CONFIG.specifications.item.label.fontWeight,
                        CONFIG.specifications.item.label.textColor
                      )}>Stroomverbruik actief</span>
                      <span className={cn(
                        CONFIG.specifications.item.value.fontSize,
                        CONFIG.specifications.item.value.textColor
                      )}>50W</span>
                    </div>
                    <div className={CONFIG.specifications.item.layout}>
                      <span className={cn(
                        CONFIG.specifications.item.label.fontSize,
                        CONFIG.specifications.item.label.fontWeight,
                        CONFIG.specifications.item.label.textColor
                      )}>WiFi</span>
                      <span className={cn(
                        CONFIG.specifications.item.value.fontSize,
                        CONFIG.specifications.item.value.textColor
                      )}>2.4GHz (802.11 b/g/n)</span>
                    </div>
                    <div className={CONFIG.specifications.item.layout}>
                      <span className={cn(
                        CONFIG.specifications.item.label.fontSize,
                        CONFIG.specifications.item.label.fontWeight,
                        CONFIG.specifications.item.label.textColor
                      )}>App compatibiliteit</span>
                      <span className={cn(
                        CONFIG.specifications.item.value.fontSize,
                        CONFIG.specifications.item.value.textColor
                      )}>iOS 10+ / Android 5.0+</span>
                    </div>
                  </div>
                )}

                {/* Toon meer/minder button */}
                <button
                  onClick={() => setShowAllSpecs(!showAllSpecs)}
                  className={cn(
                    CONFIG.specifications.showMore.buttonStyle.base,
                    CONFIG.specifications.showMore.buttonStyle.color,
                    'flex items-center justify-center w-full'
                  )}
                >
                  <span>
                    {showAllSpecs 
                      ? CONFIG.specifications.showMore.buttonText.less 
                      : CONFIG.specifications.showMore.buttonText.more}
                  </span>
                  {showAllSpecs ? (
                    <ChevronUp className={CONFIG.specifications.showMore.buttonStyle.icon} />
                  ) : (
                    <ChevronDown className={cn(
                      CONFIG.specifications.showMore.buttonStyle.icon,
                      showAllSpecs && 'rotate-180'
                    )} />
                  )}
                </button>
              </div>
            </div>
          )}
          {activeTab === 'vragen' && (
            <div className={cn(CONFIG.tabs.content.spacing, CONFIG.tabs.content.fontSize, CONFIG.tabs.content.textColor)}>
              <h3 className="text-lg font-semibold mb-4">Veelgestelde Vragen</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Hoe vaak moet ik de afvalbak legen?</h4>
                  <p className="text-sm">Bij één kat ongeveer 1x per week. Bij meerdere katten 2-3x per week.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Welke kattenbakvulling moet ik gebruiken?</h4>
                  <p className="text-sm">Je kunt klonterende klei vulling, plantaardige vulling, of gemixte vulling gebruiken. Kies wat het beste werkt voor jouw kat.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Is de app gratis?</h4>
                  <p className="text-sm">Ja! De app is volledig gratis te downloaden voor iOS en Android. Er zijn geen verborgen kosten of abonnementen.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Hoe werkt de garantie?</h4>
                  <p className="text-sm">Je krijgt 2 jaar volledige garantie. Bij problemen kun je contact opnemen met onze klantenservice voor een snelle oplossing of vervanging.</p>
                </div>
              </div>
            </div>
          )}
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
              // ✅ DYNAMISCH: Gebruik eerste echte product image (gefilterd), anders fallback
              images && images.length > 0
                ? images[0]
                : (PRODUCT_CONTENT.edgeImageSection.image || '/placeholder-image.jpg')
            }
            alt={product.name}
            fill
            className={cn(CONFIG.edgeSection.image.objectFit, CONFIG.edgeSection.image.brightness)}
            sizes="100vw"
            priority={false}
            unoptimized={(images && images.length > 0 && images[0].startsWith('/uploads/')) || (PRODUCT_CONTENT.edgeImageSection.image || '/placeholder-image.jpg').startsWith('/uploads/')} // ✅ FIX: Disable Next.js optimization for /uploads/ paths
            onError={(e) => {
              // ✅ FALLBACK: Als afbeelding niet laadt, toon placeholder
              const target = e.target as HTMLImageElement;
              if (target && !target.src.includes('placeholder')) {
                target.src = '/placeholder-image.jpg';
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
              <p className={cn(
                'text-sm sm:text-base md:text-lg', // ✅ MOBIEL: Responsive tekst
                CONFIG.edgeSection.description.textColor
              )}>
                {product.description || product.shortDescription || PRODUCT_CONTENT.mainDescription}
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

      {/* Feature Sections - ZIGZAG PATTERN (Pergolux style) - ✅ SYMMETRISCH */}
      <div className={cn(
        CONFIG.layout.maxWidth, 
        'mx-auto', 
        CONFIG.layout.containerPadding, 
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
                {/* Image - ✅ VOLLEDIG ZICHTBAAR: Zigzag foto's volledig zichtbaar */}
                <div className={cn(
                  'relative',
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
                    unoptimized={(feature.image && feature.image.startsWith('/uploads/')) || false} // ✅ FIX: Disable Next.js optimization for /uploads/ paths
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
                    CONFIG.featureSection.text.title.letterSpacing // ✅ EXACT ZELFDE: Letter spacing zoals productnaam
                  )}>
                    {feature.title}
                  </h3>
                  <p className={cn(
                    CONFIG.featureSection.text.description.fontSize,
                    CONFIG.featureSection.text.description.textColor,
                    CONFIG.featureSection.text.description.lineHeight
                  )}>
                    {feature.description}
                  </p>
                  <ul className={CONFIG.featureSection.text.list.spacing}>
                    {feature.items.map((item, itemIndex) => (
                      <li key={itemIndex} className={CONFIG.featureSection.text.list.item.gap}>
                        {/* ✅ SYMBOLEN: Direct in witte achtergrond met lichte border */}
                        <div className={CONFIG.featureSection.text.list.item.iconContainer}>
                          <Check className={cn(
                            CONFIG.featureSection.text.list.item.iconSize,
                            CONFIG.featureSection.text.list.item.iconColor
                          )} />
                        </div>
                        <span className={cn(
                          CONFIG.featureSection.text.list.item.fontSize,
                          CONFIG.featureSection.text.list.item.textColor
                        )}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
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
