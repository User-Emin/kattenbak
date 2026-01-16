/**
 * PRODUCT DETAIL PAGE CONFIGURATION
 * 🎨 CENTRAAL DESIGN MANAGEMENT - Geïnspireerd door professionele e-commerce
 * ✅ DRY: Single source of truth voor alle styling
 * ✅ Dynamic: Alle kleuren, spacing, fonts centraal beheerd
 * ✅ Waterdicht: Type-safe configuratie
 */

import { DESIGN_SYSTEM } from './design-system';

export const PRODUCT_PAGE_CONFIG = {
  // Layout configuratie
  layout: {
    maxWidth: 'max-w-7xl',
    containerPadding: 'px-4 sm:px-6 lg:px-8',
    sectionSpacing: 'py-8 lg:py-12', // ✅ Minder ruimte (was py-12 lg:py-16)
    gridGap: 'gap-6 lg:gap-10',      // ✅ RUIMTE: gap-6 lg:gap-10 tussen afbeelding en product info
    topMargin: 'mt-0',                // ✅ ULTRA COMPACT - breadcrumb direct tegen navbar
    // Product Grid Ratio: Image vs Info (zoals Pergolux)
    productGrid: {
      imageWidth: 'lg:w-[58%]', // Image neemt meer ruimte
      infoWidth: 'lg:w-[42%]',  // Info smaller
    },
    separator: {
      color: 'border-gray-300', // ✅ GRIJZER: Iets donkerder voor betere zichtbaarheid
      height: 'border-t', // ✅ BORDER TOP: Horizontale lijn
      fullWidth: 'w-full',
      spacing: 'my-8', // ✅ SPACING: Ruimte rond scheidingstreep
    },
  },

  // Breadcrumb configuratie - ✅ RESPONSIVE: Mobile kleiner
  breadcrumb: {
    fontSize: 'text-xs md:text-sm',        // ✅ RESPONSIVE: Mobile text-xs, Desktop text-sm
    textColor: 'text-gray-600',
    hoverColor: 'hover:text-gray-900',
    separator: '/',
    spacing: 'flex items-center space-x-1 md:space-x-1.5', // ✅ RESPONSIVE: Mobile kleinere spacing
    iconSize: 'w-3 h-3 md:w-3.5 md:h-3.5',    // ✅ RESPONSIVE: Mobile kleinere icons
    containerPadding: 'pb-2 pt-2 px-4 md:px-0 md:pb-1 md:pt-0',   // ✅ RESPONSIVE: Mobile meer padding (pt-2 pb-2), Desktop normale padding
    // Bottom border verwijderd - breadcrumb zit nu in grid
  },

  // Product Gallery configuratie
  gallery: {
    container: {
      sticky: 'lg:sticky lg:top-24', // Sticky op desktop, top offset voor navbar + USP banner
      height: 'lg:h-fit',
    },
    mainImage: {
      aspectRatio: 'aspect-[3/2]', // ✅ HORIZONTAAL: Horizontale rechthoek (3/2) - horizontaal langer, verticaal korter
      borderRadius: 'rounded-lg',
      bgColor: 'bg-white', // ✅ WIT: Witte achtergrond (geen grijs)
    },
    thumbnails: {
      grid: 'grid grid-cols-4 gap-4', // ✅ FALLBACK: Voor mobile (horizontaal)
      aspectRatio: 'aspect-square', // ✅ VIERKANT: Voor verticale slide
      borderRadius: 'rounded-md',
      activeBorder: 'ring-2 ring-black ring-offset-2', // ✅ FIX: ring-offset-2 voorkomt overlap
      hoverOpacity: 'hover:opacity-75',
      // ✅ VERTICALE SLIDE: Links van hoofdafbeelding
      verticalSlide: {
        container: 'w-20 lg:w-24', // ✅ DRY: Breedte via config
        maxHeight: 'max-h-[600px]', // ✅ DRY: Maximale hoogte
        thumbnailSize: 'w-20 h-20 lg:w-24 lg:h-24', // ✅ DRY: Thumbnail grootte
        transition: 'smooth-scroll', // ✅ SMOOTH: Smooth scroll effect
        border: 'border-2 border-transparent', // ✅ FIX: Transparante border voorkomt overlap
        activeBorder: 'ring-2 ring-black ring-offset-2', // ✅ FIX: ring-offset-2 voorkomt overlap
      },
    },
    navigation: {
      buttonSize: 'w-10 h-10',
      buttonBg: 'bg-white/90',
      buttonHover: 'hover:bg-white',
      iconSize: 'w-6 h-6',
      position: 'absolute inset-y-1/2 -translate-y-1/2',
      borderRadius: 'rounded-full', // ✅ ROND: Volledig ronde navigation buttons
    },
    counter: {
      position: 'absolute bottom-4 right-4',
      bg: 'bg-black/60',
      textColor: 'text-white',
      padding: 'px-3 py-1',
      fontSize: 'text-sm',
      borderRadius: 'rounded-full',
    },
  },

  // Product Info configuratie
  info: {
    title: {
      fontSize: 'text-3xl lg:text-4xl',
      fontWeight: 'font-medium',    // ✅ Dunner maar vet zwart (500 weight - logo style)
      textColor: 'text-gray-900',
      marginBottom: 'mb-4',
      letterSpacing: 'tracking-tight', // ✅ Logo style - strak & clean
    },
    rating: {
      starColor: 'text-yellow-400',
      reviewColor: 'text-gray-600',
      fontSize: 'text-sm',
      spacing: 'flex items-center gap-2 mb-4',
    },
    price: {
      current: {
        fontSize: 'text-3xl', // ✅ KLEINER: Iets kleiner (text-3xl ipv text-4xl)
        fontWeight: 'font-light',
        textColor: 'text-gray-900',
      },
      original: {
        fontSize: 'text-xl',
        fontWeight: 'font-normal',
        textColor: 'text-gray-500',
        decoration: 'line-through',
      },
      discount: {
        fontSize: 'text-sm',
        fontWeight: 'font-normal', // ✅ DUNNER (was medium)
        textColor: 'text-white',
        bgColor: 'bg-gray-600', // ✅ GRIJS: Geen blauw/oranje (was bg-blue-500)
        padding: 'px-2 py-1',
        borderRadius: 'rounded',
      },
      spacing: 'flex items-center gap-3 mb-4',
    },
    description: {
      fontSize: 'text-base',
      textColor: 'text-gray-700',
      lineHeight: 'leading-relaxed',
      marginBottom: 'mb-6',
    },
    button: {
      size: 'w-full py-6 md:py-6', // ✅ DRUK MIJ: Verticaal langer (py-6 ipv py-4) - meer prominent
      fontSize: 'text-2xl md:text-2xl', // ✅ GROOT: Echt grote tekst (text-2xl ipv text-lg) - veel opvallender
      fontWeight: 'font-bold', // ✅ DIKKER: font-bold - vooral mobiel
      bgColor: 'bg-blue-600',
      hoverBgColor: 'hover:bg-blue-700',
      textColor: 'text-white',
      borderRadius: DESIGN_SYSTEM.button.borderRadius, // ✅ DRY: Via DESIGN_SYSTEM (exact zoals Let op kaart)
      transition: 'transition-all duration-200 hover:scale-[1.02]', // ✅ DRUK MIJ: Scale effect voor "druk mij" vibe
      icon: 'w-6 h-6 md:w-6 md:h-6', // ✅ DRUK MIJ: Groter icon (w-6 h-6 ipv w-5 h-5) - meer prominent
    },
    usps: {
      spacing: 'grid grid-cols-3 gap-3 mt-6', // ✅ COMPACTER: Kleinere gap (gap-3 ipv gap-4)
      item: {
        container: 'flex flex-col items-center text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors', // ✅ COMPACTER: Kleinere padding (p-3 ipv p-4)
        iconContainer: 'mb-2 flex items-center justify-center', // ✅ COMPACTER: Kleinere margin (mb-2 ipv mb-3)
        iconSize: 'w-16 h-16', // ✅ COMPACTER: Kleinere icons (w-16 h-16 ipv w-24 h-24)
        title: {
          fontSize: 'text-xs font-semibold', // ✅ COMPACTER: Kleinere tekst (text-xs ipv text-sm)
          textColor: 'text-gray-900',
          marginBottom: 'mb-0.5', // ✅ COMPACTER: Kleinere margin
        },
        description: {
          fontSize: 'text-[10px]', // ✅ COMPACTER: Extra kleine tekst
          textColor: 'text-gray-600',
        },
      },
    },
  },

  // Tabs configuratie
  tabs: {
    container: {
      borderBottom: 'border-b border-gray-200',
      spacing: 'flex gap-8',
    },
    button: {
      fontSize: 'text-base',
      fontWeight: 'font-normal', // ✅ DUNNER (was medium)
      textColor: 'text-gray-600',
      activeTextColor: 'text-black',
      hoverTextColor: 'hover:text-gray-900',
      padding: 'pb-4',
      activeBorder: 'border-b-2 border-black',
      transition: 'transition-colors',
    },
    content: {
      padding: 'py-6', // ✅ KORTER: Verticaal korter (py-6 ipv py-8)
      fontSize: 'text-base',
      textColor: 'text-gray-700',
      lineHeight: 'leading-relaxed',
      spacing: 'space-y-3', // ✅ KORTER: Kleinere spacing (space-y-3 ipv space-y-4)
    },
  },

  // Edge-to-edge section configuratie - ✅ KORTER: Verticaal korter
  edgeSection: {
    container: 'relative w-full', // ✅ EDGE-TO-EDGE: Volledige breedte
    image: {
      aspectRatio: 'aspect-[21/6]', // ✅ KORTER: Verticaal korter (was aspect-[21/9])
      objectFit: 'object-cover',
      brightness: 'brightness-75',
    },
    overlay: {
      position: 'absolute inset-0 flex items-center justify-center', // ✅ GECENTREERD VERTICAAL
      content: 'flex flex-col justify-center',
      padding: 'px-8 lg:px-16',
      maxWidth: 'max-w-2xl',
      textAlign: 'text-center mx-auto', // ✅ GECENTREERD
    },
    title: {
      fontSize: 'text-3xl lg:text-4xl',
      fontWeight: 'font-light', // ✅ DUNNER (was semibold)
      textColor: 'text-white',
      marginBottom: 'mb-4',
    },
    description: {
      fontSize: 'text-lg',
      textColor: 'text-white/90',
    },
    // Button verwijderd - geen accessoires beschikbaar
  },

  // Feature section (ZIGZAG met afbeeldingen - Pergolux style)
  featureSection: {
    containerSpacing: 'space-y-20 lg:space-y-32', // ✅ GROTER: Meer ruimte tussen zigzag secties (was space-y-16 lg:space-y-24)
    zigzag: {
      // Image LEFT, text RIGHT (default) - ✅ GROTER EN DUIDELIJKER
      leftLayout: 'grid md:grid-cols-2 gap-8 lg:gap-12 items-center', // ✅ GROTER: gap-8 lg:gap-12 voor meer ruimte en duidelijkheid
      // Image RIGHT, text LEFT (reversed) - ✅ GROTER EN DUIDELIJKER
      rightLayout: 'grid md:grid-cols-2 gap-8 lg:gap-12 items-center', // ✅ GROTER: gap-8 lg:gap-12 voor meer ruimte en duidelijkheid
      imageOrder: {
        left: 'order-1 md:order-1',
        right: 'order-1 md:order-2',
      },
      textOrder: {
        left: 'order-2 md:order-2',
        right: 'order-2 md:order-1',
      },
    },
    image: {
      aspectRatio: 'aspect-[5/3]', // ✅ GROTER: Bredere afbeeldingen voor duidelijkheid (was aspect-[6/3])
      borderRadius: 'rounded-xl', // ✅ GROTER: Grotere border radius (was rounded-lg)
      objectFit: 'object-contain', // ✅ VOLLEDIG ZICHTBAAR: Zigzag foto's volledig zichtbaar (niet object-cover)
      bgColor: 'bg-white', // ✅ WIT: Witte achtergrond voor afbeeldingen
      gap: 'gap-0', // ✅ GEEN GAP: Geen grijze tussenruimtes tussen afbeeldingen
    },
    text: {
      container: 'space-y-6', // ✅ GROTER: Meer ruimte tussen elementen (was space-y-4)
      title: {
        fontSize: 'text-3xl lg:text-4xl', // ✅ GROTER: Grotere titels voor duidelijkheid (was text-2xl lg:text-3xl)
        fontWeight: 'font-medium', // ✅ DUNNER: Exact zoals productnaam (font-medium ipv font-semibold)
        textColor: 'text-black', // ✅ ZWARTER: Volledig zwart voor zigzag titles
        letterSpacing: 'tracking-tight', // ✅ EXACT ZELFDE: Zoals productnaam
      },
      description: {
        fontSize: 'text-lg lg:text-xl', // ✅ GROTER: Grotere beschrijving (was text-base)
        textColor: 'text-gray-800', // ✅ DONKERDER: text-gray-800 voor beter contrast (was text-gray-700)
        lineHeight: 'leading-relaxed',
      },
      list: {
        spacing: 'space-y-3 mt-6', // ✅ GROTER: Meer ruimte tussen items (was space-y-2 mt-4)
        item: {
          fontSize: 'text-base lg:text-lg', // ✅ GROTER: Grotere tekst voor duidelijkheid (was text-sm)
          textColor: 'text-gray-800', // ✅ DONKERDER: text-gray-800 voor beter contrast (was text-gray-700)
          iconColor: 'text-green-600',
          iconSize: 'w-6 h-6', // ✅ GROTER: Grotere icons (was w-5 h-5)
          gap: 'flex items-center gap-3', // ✅ GROTER: Meer ruimte tussen icon en tekst (was gap-2)
          // ✅ SYMBOLEN: Direct in witte achtergrond met lichte border
          iconContainer: 'bg-white border border-gray-200 rounded-md p-1.5', // ✅ WIT: Witte achtergrond met lichte border
        },
      },
    },
  },

  // Specifications Accordion (RECHTS onder USPs + button)
  specifications: {
    container: 'space-y-4',
    item: {
      layout: 'flex justify-between py-3 border-b border-gray-200',
      label: {
        fontSize: 'text-sm',
        fontWeight: 'font-medium',
        textColor: 'text-gray-900',
      },
      value: {
        fontSize: 'text-sm',
        textColor: 'text-gray-600',
      },
    },
    // Toon meer functionaliteit
    showMore: {
      initialVisible: 5,
      buttonText: {
        more: 'Toon meer specificaties',
        less: 'Toon minder',
      },
      buttonStyle: {
        base: 'mt-4 text-sm font-medium transition-colors',
        color: 'text-gray-600 hover:text-gray-700', // ✅ GRIJS: Geen blauw (was text-blue-600)
        icon: 'w-4 h-4 ml-1 inline-block transition-transform',
      },
    },
  },

  // Features Accordion (onder specifications in tab)
  features: {
    showMore: {
      initialVisible: 3,          // ✅ Toon eerste 3 features
      buttonText: {
        more: 'Toon meer functies',
        less: 'Toon minder',
      },
      buttonStyle: {
        base: 'mt-4 text-sm font-medium transition-colors',
        color: 'text-gray-600 hover:text-gray-700', // ✅ GRIJS: Geen blauw (was text-blue-600)
        icon: 'w-4 h-4 ml-1 inline-block transition-transform',
      },
    },
    accordion: {
      container: 'space-y-2 mt-6',
      item: {
        border: 'border border-gray-200 rounded-lg overflow-hidden',
        hover: 'hover:border-gray-300 hover:shadow-sm transition-all',
      },
      button: {
        container: 'w-full flex items-center justify-between px-4 py-3 text-left bg-white',
        icon: {
          container: 'flex-shrink-0 mr-3',
          size: 'w-5 h-5',
          color: 'text-gray-900',
        },
        title: {
          fontSize: 'text-sm',
          fontWeight: 'font-normal',
          textColor: 'text-gray-900',
        },
        arrow: {
          size: 'w-5 h-5',
          color: 'text-gray-400',
          transition: 'transition-transform duration-200',
        },
      },
      content: {
        container: 'px-4 pb-3 pt-2 bg-gray-50/50 border-t border-gray-100',
        text: {
          fontSize: 'text-sm',
          textColor: 'text-gray-700',
          lineHeight: 'leading-relaxed',
        },
      },
    },
  },

  // Safety Notice (Let op / Waarschuwing)
  safetyNotice: {
    container: 'mt-6 p-4 border border-red-300 rounded-xl bg-red-50', // ✅ SMOOTH: Rondere hoeken, subtielere border
    header: {
      container: 'flex items-start gap-2.5 mb-2',
      icon: {
        size: 'w-5 h-5',
        color: 'text-black', // ✅ ZWART: Icon in zwart zoals gevraagd (kaart blijft rood)
      },
      title: {
        fontSize: 'text-sm',
        fontWeight: 'font-semibold', // ✅ BLIJFT BOLD voor waarschuwingen
        textColor: 'text-black', // ✅ ZWART: "Let op" tekst ook zwart zoals gevraagd
      },
    },
    content: {
      fontSize: 'text-sm',
      textColor: 'text-black', // ✅ ZWART: Tekst in zwart zoals gevraagd
      lineHeight: 'leading-relaxed',
    },
  },

  // Related products configuratie
  relatedProducts: {
    title: {
      fontSize: 'text-2xl lg:text-3xl',
      fontWeight: 'font-light', // ✅ DUNNER (was semibold)
      textColor: 'text-gray-900',
      marginBottom: 'mb-8',
      textAlign: 'text-center',
    },
    grid: 'grid grid-cols-2 md:grid-cols-4 gap-6',
    card: {
      container: 'group cursor-pointer',
      image: {
        aspectRatio: 'aspect-square',
        borderRadius: 'rounded-lg',
        objectFit: 'object-cover',
        marginBottom: 'mb-4',
        hover: 'group-hover:opacity-75 transition-opacity',
      },
      rating: {
        starColor: 'text-yellow-400',
        fontSize: 'text-sm',
        marginBottom: 'mb-2',
      },
      title: {
        fontSize: 'text-base',
        fontWeight: 'font-normal', // ✅ DUNNER (was medium)
        textColor: 'text-gray-900',
        hover: 'group-hover:text-blue-600',
        transition: 'transition-colors',
      },
    },
  },
} as const;

// Helper functie om class names samen te voegen
export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
