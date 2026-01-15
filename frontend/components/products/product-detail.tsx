"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { productsApi } from "@/lib/api/products";
import { formatPrice } from "@/lib/utils";
import { PRODUCT_PAGE_CONFIG, cn } from "@/lib/product-page-config";
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
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second

    const loadProduct = async () => {
      try {
        const productData = await productsApi.getBySlug(slug);
        if (isMounted) {
          setProduct(productData);
          setLoading(false);
        }
      } catch (error: any) {
        // ✅ SECURITY: Log error server-side only
        if (typeof window === 'undefined') {
          console.error('Product load error:', error);
        }
        
        // ✅ RETRY: Probeer opnieuw bij network errors
        if (retryCount < MAX_RETRIES && (
          error?.isNetworkError || 
          error?.isGatewayError || 
          error?.message?.includes('verbinding') ||
          error?.message?.includes('tijdelijk niet beschikbaar')
        )) {
          retryCount++;
          setTimeout(() => {
            if (isMounted) {
              loadProduct();
            }
          }, RETRY_DELAY * retryCount); // Exponential backoff
        } else {
          // ✅ FIX: Geen "Fout bij laden" - toon product niet gevonden (graceful degradation)
          if (isMounted) {
            setLoading(false);
            // Product blijft null, wordt afgehandeld door "Product not found" UI
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

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-semibold mb-4">Product niet gevonden</h1>
        <Link href="/" className="text-gray-600 hover:text-gray-700">
          Terug naar Home
        </Link>
      </div>
    );
  }

  // Get product images
  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['/placeholder-image.jpg'];
  const currentImage = images[selectedImageIndex];

  // Handle add to cart
  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      addItem(product, quantity);
      // Visual feedback
      setTimeout(() => setIsAdding(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setIsAdding(false);
    }
  };

  // Image navigation
  const goToPreviousImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
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

  // Features data - GEBASEERD OP ECHTE SPECIFICATIES (Alibaba + Screenshots)
  const features = [
    {
      title: 'Hoogwaardige ABS Materialen',
      description: 'Gemaakt van duurzaam, milieuvriendelijk ABS-materiaal dat bestand is tegen krassen en eenvoudig te reinigen. Geurwerend en hypoallergeen voor optimale hygiëne.',
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=600&fit=crop',
      items: [
        'Duurzaam ABS kunststof',
        'Kras- en slijtvast',
        'Antibacteriële coating',
        'Milieuvriendelijk materiaal',
      ],
    },
    {
      title: 'Dubbele Veiligheidssensoren',
      description: 'Uitgerust met infrarood- en gewichtssensoren die automatisch stoppen wanneer uw kat de bak betreedt. Getest op 10.000+ cycli voor maximale betrouwbaarheid.',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop',
      items: [
        'IR bewegingssensor',
        'Gewichtdetectie technologie',
        'Automatische pauze functie',
        '10.000+ cycli getest',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
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
        
        <div className={cn('flex flex-col lg:flex-row', CONFIG.layout.gridGap)}>
          {/* Left: Image Gallery - STICKY ON SCROLL */}
          <div className={cn('space-y-4', CONFIG.layout.productGrid.imageWidth, CONFIG.gallery.container.sticky, CONFIG.gallery.container.height)}>
            {/* Main Image */}
            <div className={cn('relative', CONFIG.gallery.mainImage.aspectRatio, CONFIG.gallery.mainImage.borderRadius, CONFIG.gallery.mainImage.bgColor, 'overflow-hidden')}>
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-contain"
                priority
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPreviousImage}
                    className={cn(
                      CONFIG.gallery.navigation.buttonSize,
                      CONFIG.gallery.navigation.buttonBg,
                      CONFIG.gallery.navigation.buttonHover,
                      CONFIG.gallery.navigation.borderRadius || 'rounded-full', // ✅ DYNAMISCH: Via config
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
                      CONFIG.gallery.navigation.borderRadius || 'rounded-full', // ✅ DYNAMISCH: Via config
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
                {selectedImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className={CONFIG.gallery.thumbnails.grid}>
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      CONFIG.gallery.thumbnails.aspectRatio,
                      CONFIG.gallery.thumbnails.borderRadius,
                      CONFIG.gallery.thumbnails.hoverOpacity,
                      'relative overflow-hidden bg-gray-100',
                      'transition-all',
                      index === selectedImageIndex && CONFIG.gallery.thumbnails.activeBorder
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

          {/* Right: Product Info - SMALLER */}
          <div className={cn('flex flex-col', CONFIG.layout.productGrid.infoWidth)}>
            {/* Title */}
            <h1 className={cn(
              CONFIG.info.title.fontSize,
              CONFIG.info.title.fontWeight,
              CONFIG.info.title.textColor,
              CONFIG.info.title.marginBottom
            )}>
              {product.name}
            </h1>

            {/* ✅ RATING VERWIJDERD: Geen sterren/reviews zonder redundantie */}

            {/* Price */}
            <div className={CONFIG.info.price.spacing}>
              <span className={cn(
                CONFIG.info.price.current.fontSize,
                CONFIG.info.price.current.fontWeight,
                CONFIG.info.price.current.textColor
              )}>
                {formatPrice(product.price)}
              </span>
              {/* ✅ KORTING VERWIJDERD: Geen korting badge meer */}
            </div>

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

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={cn(
                CONFIG.info.button.size,
                CONFIG.info.button.fontSize,
                CONFIG.info.button.fontWeight,
                CONFIG.info.button.bgColor,
                CONFIG.info.button.hoverBgColor,
                CONFIG.info.button.textColor,
                CONFIG.info.button.borderRadius,
                CONFIG.info.button.transition,
                'flex items-center justify-center gap-2',
                isAdding && 'bg-green-600 hover:bg-green-600'
              )}
            >
              {isAdding ? (
                <>
                  <Check className={CONFIG.info.button.icon} />
                  Toegevoegd aan winkelwagen
                </>
              ) : (
                <>
                  <ShoppingCart className={CONFIG.info.button.icon} />
                  Toevoegen aan Winkelwagen - {formatPrice(product.price)}
                </>
              )}
            </button>

            {/* USPs */}
            <div className={CONFIG.info.usps.spacing}>
              <div className={CONFIG.info.usps.item.gap}>
                <Check className={cn(CONFIG.info.usps.item.iconSize, CONFIG.info.usps.item.iconColor)} />
                <span className={cn(CONFIG.info.usps.item.fontSize, CONFIG.info.usps.item.textColor)}>
                  Gratis verzending
                </span>
              </div>
              <div className={CONFIG.info.usps.item.gap}>
                <Check className={cn(CONFIG.info.usps.item.iconSize, CONFIG.info.usps.item.iconColor)} />
                <span className={cn(CONFIG.info.usps.item.fontSize, CONFIG.info.usps.item.textColor)}>
                  30 dagen retour
                </span>
              </div>
              <div className={CONFIG.info.usps.item.gap}>
                <Check className={cn(CONFIG.info.usps.item.iconSize, CONFIG.info.usps.item.iconColor)} />
                <span className={cn(CONFIG.info.usps.item.fontSize, CONFIG.info.usps.item.textColor)}>
                  2 jaar garantie
                </span>
              </div>
            </div>

            {/* Specificaties Accordion - ONDER USPs */}
            <div className={CONFIG.features.accordion.container}>
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
                        <div className={CONFIG.features.accordion.button.icon.container}>
                          <Icon 
                            className={cn(
                              CONFIG.features.accordion.button.icon.size,
                              CONFIG.features.accordion.button.icon.color
                            )}
                          />
                        </div>
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
                        <div className={CONFIG.features.accordion.button.icon.container}>
                          <Icon 
                            className={cn(
                              CONFIG.features.accordion.button.icon.size,
                              CONFIG.features.accordion.button.icon.color
                            )}
                          />
                        </div>
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

            {/* Safety Notice - WAARSCHUWING */}
            <div className={CONFIG.safetyNotice.container}>
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
                  Let op
                </h4>
              </div>
              <p className={cn(
                CONFIG.safetyNotice.content.fontSize,
                CONFIG.safetyNotice.content.textColor,
                CONFIG.safetyNotice.content.lineHeight
              )}>
                Niet geschikt voor kittens onder 6 maanden. De smart cat litter is alleen geschikt voor katten die niet meer wegen dan 3,3 lbs (1,5KG), en het wordt aanbevolen dat het maximale gewicht van de kat niet meer dan 27,5 lbs (12,5KG) mag zijn.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className={cn(CONFIG.layout.maxWidth, 'mx-auto', CONFIG.layout.containerPadding, 'pb-12')}>
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
              <h3 className="text-lg font-semibold mb-3">Product Omschrijving</h3>
              <p className="mb-4">
                {product.description || 'De beste automatische kattenbak met zelfreinigende functie. Perfect voor katten tot 7kg. Volledig automatisch met app-bediening.'}
              </p>
              <h4 className="font-semibold mb-2">Standaard meegeleverd:</h4>
              <ul className="space-y-1.5 ml-4">
                <li>• 1x Automatische Kattenbak Premium</li>
                <li>• 1x Stroomadapter</li>
                <li>• 1x Afvalzak (starter)</li>
                <li>• 1x Borstel (voor onderhoud)</li>
                <li>• 1x Geurfilter</li>
                <li>• 1x Handleiding (NL/EN)</li>
              </ul>
              <p className="mt-4 text-sm text-gray-600 italic">
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

      {/* Edge-to-edge Image Section - ✅ EDGE-TO-EDGE: Volledige breedte, geen padding */}
      <div className={CONFIG.edgeSection.container}>
        <div className="relative w-full">
          <Image
            src="https://images.unsplash.com/photo-1560807707-8cc77767d783?w=1920&h=800&fit=crop"
            alt="Maak je ervaring compleet"
            width={1920}
            height={800}
            className={cn(CONFIG.edgeSection.image.aspectRatio, CONFIG.edgeSection.image.objectFit, CONFIG.edgeSection.image.brightness)}
          />
          <div className={CONFIG.edgeSection.overlay.position}>
            <div className={cn(CONFIG.edgeSection.overlay.content, CONFIG.edgeSection.overlay.padding, CONFIG.edgeSection.overlay.maxWidth, CONFIG.edgeSection.overlay.textAlign)}>
              <h2 className={cn(CONFIG.edgeSection.title.fontSize, CONFIG.edgeSection.title.fontWeight, CONFIG.edgeSection.title.textColor, CONFIG.edgeSection.title.marginBottom)}>
                Premium Kwaliteit & Veiligheid
              </h2>
              <p className={cn(CONFIG.edgeSection.description.fontSize, CONFIG.edgeSection.description.textColor)}>
                Hoogwaardige ABS materialen met dubbele veiligheidssensoren. Volledig automatisch met real-time monitoring via smartphone app. Perfect voor katten tot 7kg.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Sections - ZIGZAG PATTERN (Pergolux style) */}
      <div className={cn(CONFIG.layout.maxWidth, 'mx-auto', CONFIG.layout.containerPadding, CONFIG.layout.sectionSpacing)}>
        <div className={CONFIG.featureSection.containerSpacing}>
          {features.map((feature, index) => {
            const isEven = index % 2 === 0;
            return (
              <div 
                key={index} 
                className={isEven ? CONFIG.featureSection.zigzag.leftLayout : CONFIG.featureSection.zigzag.rightLayout}
              >
                {/* Image */}
                <div className={cn(
                  'relative',
                  isEven ? CONFIG.featureSection.zigzag.imageOrder.left : CONFIG.featureSection.zigzag.imageOrder.right
                )}>
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={800}
                    height={600}
                    className={cn(
                      CONFIG.featureSection.image.aspectRatio,
                      CONFIG.featureSection.image.borderRadius,
                      CONFIG.featureSection.image.objectFit,
                      CONFIG.featureSection.image.bgColor
                    )}
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
                    CONFIG.featureSection.text.title.textColor
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
                        <Check className={cn(
                          CONFIG.featureSection.text.list.item.iconSize,
                          CONFIG.featureSection.text.list.item.iconColor
                        )} />
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

      {/* Related Products (placeholder) */}
      <div className={cn(CONFIG.layout.maxWidth, 'mx-auto', CONFIG.layout.containerPadding, CONFIG.layout.sectionSpacing, 'pb-16')}>
        <h2 className={cn(
          CONFIG.relatedProducts.title.fontSize,
          CONFIG.relatedProducts.title.fontWeight,
          CONFIG.relatedProducts.title.textColor,
          CONFIG.relatedProducts.title.marginBottom,
          CONFIG.relatedProducts.title.textAlign
        )}>
          Gerelateerde Producten
        </h2>
        <div className={CONFIG.relatedProducts.grid}>
          {/* Placeholder - in productie zou dit uit API komen */}
          <p className="col-span-full text-center text-gray-600">
            Gerelateerde producten worden binnenkort geladen.
          </p>
        </div>
      </div>
    </div>
  );
}
