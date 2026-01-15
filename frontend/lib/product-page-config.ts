/**
 * PRODUCT DETAIL PAGE CONFIGURATION
 * 🎨 CENTRAAL DESIGN MANAGEMENT - Geïnspireerd door professionele e-commerce
 * ✅ DRY: Single source of truth voor alle styling
 * ✅ Dynamic: Alle kleuren, spacing, fonts centraal beheerd
 * ✅ Waterdicht: Type-safe configuratie
 */

export const PRODUCT_PAGE_CONFIG = {
  // Layout configuratie
  layout: {
    maxWidth: 'max-w-7xl',
    containerPadding: 'px-4 sm:px-6 lg:px-8',
    sectionSpacing: 'py-8 lg:py-12', // ✅ Minder ruimte (was py-12 lg:py-16)
    gridGap: 'gap-6 lg:gap-10',      // ✅ Minder gap (was gap-8 lg:gap-12)
    topMargin: 'mt-0',                // ✅ ULTRA COMPACT - breadcrumb direct tegen navbar
    // Product Grid Ratio: Image vs Info (zoals Pergolux)
    productGrid: {
      imageWidth: 'lg:w-[58%]', // Image neemt meer ruimte
      infoWidth: 'lg:w-[42%]',  // Info smaller
    },
    separator: {
      color: 'bg-gray-100',
      height: 'h-px',
      fullWidth: 'w-full',
    },
  },

  // Breadcrumb configuratie
  breadcrumb: {
    fontSize: 'text-xs',        // ✅ Compacter (was text-sm)
    textColor: 'text-gray-600',
    hoverColor: 'hover:text-gray-900',
    separator: '/',
    spacing: 'flex items-center space-x-1.5', // ✅ Compacter spacing (was space-x-2)
    iconSize: 'w-3.5 h-3.5',    // ✅ Kleinere icons (was w-4 h-4)
    containerPadding: 'pb-1',   // ✅ ULTRA COMPACT - minimale ruimte onder breadcrumb
    // Bottom border verwijderd - breadcrumb zit nu in grid
  },

  // Product Gallery configuratie
  gallery: {
    container: {
      sticky: 'lg:sticky lg:top-24', // Sticky op desktop, top offset voor navbar + USP banner
      height: 'lg:h-fit',
    },
    mainImage: {
      aspectRatio: 'aspect-square',
      borderRadius: 'rounded-lg',
      bgColor: 'bg-gray-100',
    },
    thumbnails: {
      grid: 'grid grid-cols-4 gap-4',
      aspectRatio: 'aspect-square',
      borderRadius: 'rounded-md',
      activeBorder: 'ring-2 ring-black',
      hoverOpacity: 'hover:opacity-75',
    },
    navigation: {
      buttonSize: 'w-10 h-10',
      buttonBg: 'bg-white/90',
      buttonHover: 'hover:bg-white',
      iconSize: 'w-6 h-6',
      position: 'absolute inset-y-1/2 -translate-y-1/2',
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
        fontSize: 'text-4xl',
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
        bgColor: 'bg-blue-500',
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
      size: 'w-full py-4',
      fontSize: 'text-base',
      fontWeight: 'font-normal', // ✅ DUNNER (was medium)
      bgColor: 'bg-blue-600',
      hoverBgColor: 'hover:bg-blue-700',
      textColor: 'text-white',
      borderRadius: 'rounded-lg',
      transition: 'transition-colors',
      icon: 'w-5 h-5',
    },
    usps: {
      spacing: 'flex flex-col gap-2 mt-6',
      item: {
        fontSize: 'text-sm',
        textColor: 'text-gray-700',
        iconColor: 'text-green-600',
        iconSize: 'w-5 h-5',
        gap: 'flex items-center gap-2',
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
      padding: 'py-8',
      fontSize: 'text-base',
      textColor: 'text-gray-700',
      lineHeight: 'leading-relaxed',
      spacing: 'space-y-4',
    },
  },

  // Edge-to-edge section configuratie
  edgeSection: {
    container: 'relative w-full',
    image: {
      aspectRatio: 'aspect-[21/9]',
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
    containerSpacing: 'space-y-16 lg:space-y-24',
    zigzag: {
      // Image LEFT, text RIGHT (default)
      leftLayout: 'grid md:grid-cols-2 gap-8 lg:gap-16 items-center',
      // Image RIGHT, text LEFT (reversed)
      rightLayout: 'grid md:grid-cols-2 gap-8 lg:gap-16 items-center',
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
      aspectRatio: 'aspect-[4/3]',
      borderRadius: 'rounded-lg',
      objectFit: 'object-cover',
      bgColor: 'bg-gray-100',
    },
    text: {
      container: 'space-y-4',
      title: {
        fontSize: 'text-2xl lg:text-3xl',
        fontWeight: 'font-light', // ✅ DUNNER (was semibold)
        textColor: 'text-gray-900',
      },
      description: {
        fontSize: 'text-base',
        textColor: 'text-gray-700',
        lineHeight: 'leading-relaxed',
      },
      list: {
        spacing: 'space-y-2 mt-4',
        item: {
          fontSize: 'text-sm',
          textColor: 'text-gray-700',
          iconColor: 'text-green-600',
          iconSize: 'w-5 h-5',
          gap: 'flex items-center gap-2',
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
        color: 'text-blue-600 hover:text-blue-700',
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
        color: 'text-blue-600 hover:text-blue-700',
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
