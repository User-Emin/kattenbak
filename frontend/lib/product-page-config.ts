/**
 * PRODUCT DETAIL PAGE CONFIGURATION
 * 🎨 CENTRAAL DESIGN MANAGEMENT - Geïnspireerd door professionele e-commerce
 * ✅ DRY: Single source of truth voor alle styling
 * ✅ Dynamic: Alle kleuren, spacing, fonts centraal beheerd
 * ✅ Waterdicht: Type-safe configuratie
 */

import { DESIGN_SYSTEM } from './design-system';

/** Ronde hoek voor zigzag/feature afbeeldingen – ZELFDE als productafbeelding (rounded-lg = 0.5rem) */
export const ZIGZAG_IMAGE_RADIUS = '0.5rem' as const;

export const PRODUCT_PAGE_CONFIG = {
  // Layout configuratie - ✅ SYMMETRISCH: Perfecte balans op alle schermformaten
    layout: {
      /** ✅ Pagina-achtergrond: echt grijs, geen kaart – alles op achtergrond */
      pageBg: 'bg-gray-200',
      maxWidth: 'max-w-7xl',
      containerPadding: 'px-4 sm:px-6 md:px-8 lg:px-8', // ✅ SYMMETRISCH: Gelijk links/rechts op alle breakpoints
      containerPaddingMobile: 'px-2 sm:px-4 md:px-8 lg:px-8', // ✅ MOBIEL: Minder padding op mobiel (px-2 ipv px-4)
      sectionSpacing: 'py-8 sm:py-10 md:py-12 lg:py-12', // ✅ SYMMETRISCH: Gelijk boven/onder
      gridGap: 'gap-6 sm:gap-8 md:gap-10 lg:gap-10',      // ✅ SYMMETRISCH: Gelijk tussen elementen
      topMargin: 'mt-0',                // ✅ ULTRA COMPACT - breadcrumb direct tegen navbar
    // Product Grid Ratio: Afbeelding iets meer naar links, winkelwagen etc breder
    productGrid: {
      imageWidth: 'lg:w-[56%]', // Afbeelding iets smaller = meer naar links
      infoWidth: 'lg:w-[44%]',  // Winkelwagen/info breder
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
    containerPadding: 'pb-1 pt-2 px-4 md:px-0 md:pb-0.5 md:pt-0',   // ✅ COMPACT: Minder padding onder breadcrumb voor dichter bij afbeelding
    // Bottom border verwijderd - breadcrumb zit nu in grid
  },

  // Product Gallery configuratie
  gallery: {
    container: {
      sticky: 'lg:sticky lg:top-24', // Sticky op desktop, top offset voor navbar + USP banner
      height: 'lg:h-fit',
    },
    mainImage: {
      aspectRatio: 'aspect-square', // ✅ VIERKANT: 1200×1200 formaat (aspect-square = 1:1) - perfect voor vierkante foto's
      borderRadius: 'rounded-lg',
      bgColor: 'bg-white', // ✅ WIT: Witte achtergrond (geen grijs)
    },
    thumbnails: {
      grid: 'grid grid-cols-4 gap-4', // ✅ FALLBACK: Voor mobile (horizontaal)
      aspectRatio: 'aspect-square', // ✅ VIERKANT: Voor verticale slide
      borderRadius: 'rounded-lg', // ✅ RONDE HOEKEN: Thumbnails met ronde hoeken
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
      fontWeight: 'font-semibold', // ✅ CTA: Iets vetgedrukt, wit op blauw
      bgColor: 'bg-brand', // ✅ BLAUW: Blauw met wit tekst (slimme variabele)
      hoverBgColor: 'hover:bg-brand-dark', // ✅ BLAUW DARK: Hover (slimme variabele)
      textColor: 'text-white',
      borderRadius: DESIGN_SYSTEM.button.borderRadius, // ✅ DRY: Via DESIGN_SYSTEM
      transition: 'transition-all duration-200 hover:scale-[1.02]',
      icon: 'w-6 h-6 md:w-6 md:h-6',
    },
    // ✅ BOTTOM CART: Geen kaart – gewoon op grijze achtergrond, tekst zwart (zelfde dikte)
    bottomCart: {
      container: {
        bg: 'bg-transparent', // geen kaart, valt in achtergrond
        textColor: 'text-black',
        padding: 'p-5 sm:p-6',
        borderRadius: 'rounded-none',
        textWeight: 'font-medium',
      },
      productNameWeight: 'font-semibold',
      productNameSize: 'text-base sm:text-lg',
      colorLabelWeight: 'font-semibold',
      variantNameWeight: 'font-semibold',
      stockTextWeight: 'font-semibold',
      stockTextColor: 'text-gray-800',
      priceWeight: 'font-semibold',
      serviceUspTextWeight: 'font-semibold',
      serviceUspEmphasis: 'drop-shadow-sm',
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

  // Hoe werkt het accordion configuratie
  howItWorks: {
    accordion: {
      button: {
        container: 'w-full px-4 py-2.5 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-all duration-200 flex items-center justify-between group',
        text: 'text-sm md:text-base font-medium text-gray-900',
        icon: {
          size: 'w-4 h-4',
          color: 'text-gray-500',
          transition: 'transition-transform duration-200',
        },
      },
      content: {
        container: 'mt-4 space-y-4',
        step: {
          container: 'bg-white border border-gray-200 rounded-lg p-4 sm:p-5 transition-all duration-300 ease-out',
          spacing: 'space-y-3',
          image: {
            container: 'relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 border-2',
            numberBadge: {
              container: 'absolute top-2 right-2 w-7 h-7 flex items-center justify-center text-white rounded-full text-sm font-semibold shadow-lg',
            },
          },
          content: {
            container: 'space-y-2',
            header: {
              container: 'flex items-center gap-3',
              icon: {
                size: 'w-6 h-6',
                color: 'text-primary', // Via BRAND_COLORS_HEX
              },
              title: {
                fontSize: 'text-base md:text-lg',
                fontWeight: 'font-semibold',
                textColor: 'text-gray-900',
              },
            },
            description: {
              fontSize: 'text-sm md:text-base',
              textColor: 'text-gray-700',
              lineHeight: 'leading-relaxed',
            },
          },
        },
      },
    },
  },

  // Edge-to-edge section configuratie - ✅ MOBIEL: Verticaal langer, tekst korter
  edgeSection: {
    container: 'relative w-full', // ✅ EDGE-TO-EDGE: Volledige breedte
    image: {
      aspectRatio: 'aspect-[21/9] sm:aspect-[21/7] md:aspect-[21/6]', // ✅ MOBIEL: Verticaal langer op mobiel (21/9 ipv 21/7)
      objectFit: 'object-cover',
      brightness: 'brightness-75',
    },
    overlay: {
      position: 'absolute inset-0 flex items-center justify-center', // ✅ GECENTREERD VERTICAAL
      content: 'flex flex-col justify-center',
      padding: 'px-4 sm:px-8 lg:px-16', // ✅ EDGE-TO-EDGE: Minder padding op mobiel
      maxWidth: 'max-w-2xl',
      textAlign: 'text-center mx-auto', // ✅ GECENTREERD
    },
    title: {
      fontSize: 'text-2xl sm:text-3xl md:text-4xl', // ✅ MOBIEL: Kleinere tekst op mobiel
      fontWeight: 'font-light', // ✅ DUNNER (was semibold)
      textColor: 'text-white', // ✅ WIT: Tekst in edge-to-edge sectie is wit
      marginBottom: 'mb-2 sm:mb-4', // ✅ MOBIEL: Kleinere margin op mobiel
    },
    description: {
      fontSize: 'text-sm sm:text-base md:text-lg', // ✅ MOBIEL: Kleinere tekst op mobiel
      textColor: 'text-white/90', // ✅ WIT: Beschrijving in edge-to-edge sectie is wit met transparantie
      lineClamp: 'line-clamp-3 sm:line-clamp-none', // ✅ MOBIEL: Max 3 regels op mobiel, volledig op desktop
    },
    // Button verwijderd - geen accessoires beschikbaar
  },

  // Feature section (ZIGZAG met afbeeldingen - Pergolux style)
  featureSection: {
    containerSpacing: 'space-y-6 md:space-y-10 lg:space-y-12', // ✅ COMPACTER: Dunner/strakker, minder ruimte
    zigzag: {
      // Image LEFT, text RIGHT (default) - ✅ MOBIEL: Centraal met afbeelding boven, tekst eronder - MOBIEL: ECHT MINDER PADDING
      leftLayout: 'flex flex-col md:grid md:grid-cols-2 gap-0 md:gap-8 lg:gap-12 items-center justify-center text-center md:text-left', // ✅ MOBIEL: gap-0 (0px) - echt dichtbij, DESKTOP: gap-8 (32px) tablet, gap-12 (48px) desktop
      // Image RIGHT, text LEFT (reversed) - ✅ MOBIEL: Centraal met afbeelding boven, tekst eronder - MOBIEL: ECHT MINDER PADDING
      rightLayout: 'flex flex-col md:grid md:grid-cols-2 gap-0 md:gap-8 lg:gap-12 items-center justify-center text-center md:text-left', // ✅ MOBIEL: gap-0 (0px) - echt dichtbij, DESKTOP: gap-8 (32px) tablet, gap-12 (48px) desktop
      imageOrder: {
        left: 'order-1 md:order-1', // ✅ MOBIEL: Altijd eerste (boven)
        right: 'order-1 md:order-2', // ✅ MOBIEL: Altijd eerste (boven), desktop rechts
      },
      textOrder: {
        left: 'order-2 md:order-2', // ✅ MOBIEL: Altijd tweede (onder), desktop rechts
        right: 'order-2 md:order-1', // ✅ MOBIEL: Altijd tweede (onder), desktop links
      },
    },
    image: {
      aspectRatio: 'aspect-[3/4] md:aspect-[4/5]', // ✅ VERTICAAL: Meer verticale lengte voor acceptabelere groottes (was aspect-[5/3])
      borderRadius: 'rounded-xl md:rounded-2xl lg:rounded-3xl', // ✅ RONDER: Ronde hoeken (rounded-xl op mobiel, rounded-2xl op tablet, rounded-3xl op desktop)
      borderRadiusValue: {
        mobile: '0.75rem', // 12px - rounded-xl
        tablet: '1rem', // 16px - rounded-2xl
        desktop: '1.5rem', // 24px - rounded-3xl
      },
      objectFit: 'object-contain', // ✅ VOLLEDIG ZICHTBAAR: Zigzag foto's volledig zichtbaar (niet object-cover)
      bgColor: 'bg-white', // ✅ WIT: Witte achtergrond voor afbeeldingen
      gap: 'gap-0', // ✅ GEEN GAP: Geen grijze tussenruimtes tussen afbeeldingen
    },
    text: {
      container: 'space-y-2 md:space-y-6 w-full md:w-auto', // ✅ MOBIEL: ECHT MINDER spacing tussen titel en beschrijving (space-y-2 = 8px ipv space-y-3)
      title: {
        fontSize: 'text-xl sm:text-2xl lg:text-3xl', // ✅ MOBIEL: Kleiner op mobiel zodat titel op 1 regel past
        fontWeight: 'font-medium', // ✅ DUNNER: Zigzag titels dunner (was font-bold)
        textColor: 'text-black', // ✅ FALLBACK: Zwart als gradient niet werkt
        letterSpacing: 'tracking-tight', // ✅ EXACT ZELFDE: Zoals productnaam
        textAlign: 'text-center md:text-left', // ✅ MOBIEL: Centraal, desktop links
        // ✅ GRADIENT: Blauw gradient voor feature titels - CONSISTENT mobiel & desktop
        gradient: {
          background: 'linear-gradient(135deg, #3071aa 0%, #256394 50%, #3d82c0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
      },
      description: {
        fontSize: 'text-sm sm:text-base lg:text-lg', // ✅ MOBIEL: Kleiner op mobiel (text-sm = 14px ipv text-lg = 18px)
        textColor: 'text-gray-800', // ✅ DONKERDER: text-gray-800 voor beter contrast (was text-gray-700)
        lineHeight: 'leading-relaxed',
        textAlign: 'text-center md:text-left', // ✅ MOBIEL: Centraal, desktop links
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
        color: 'text-black hover:text-gray-800', // ✅ DONKERDER: Volledig zwart zoals "Let op" balk
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
          fontWeight: 'font-medium', // ✅ DONKERDER: font-medium voor meer opvallendheid
          textColor: 'text-black', // ✅ DONKERDER: Volledig zwart zoals "Let op" balk
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

  // Varianten sectie configuratie - ✅ DRY: Slimme variabelen, geen hardcode, volledige aansluiting
  variants: {
    container: {
      backgroundColor: 'bg-black', // ✅ ZWART: Zwarte achtergrond
      padding: 'py-12 md:py-16',
    },
    header: {
      container: 'text-center',
      spacing: {
        titleSubtitle: 'mb-2', // ✅ DICHTBIJ: Subtitel dichtbij hoofdtitel (was mb-3)
        bottom: 'mb-8 md:mb-12',
      },
      title: {
        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', // ✅ GROTER: clamp(2.5rem, 6vw, 4.5rem) ipv clamp(2rem, 5vw, 3.5rem)
        fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
        textColor: 'text-white', // ✅ WIT: Witte tekst op zwarte achtergrond
        letterSpacing: DESIGN_SYSTEM.typography.letterSpacing.tight,
      },
      subtitle: {
        fontSize: DESIGN_SYSTEM.typography.fontSize.lg,
        fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
        textColor: 'text-gray-300', // ✅ LICHT GRIJS: Subtitel in lichtgrijs op zwarte achtergrond
        lineHeight: DESIGN_SYSTEM.typography.lineHeight.relaxed,
      },
    },
    grid: {
      container: 'flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 max-w-4xl mx-auto',
    },
    card: {
      container: 'group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] w-full md:w-[48%]',
      borderRadius: 'rounded-2xl sm:rounded-3xl', // ✅ RONDE HOEKEN: Foto's met ronde hoeken
      borderRadiusValue: {
        mobile: '1rem', // 16px - rounded-2xl
        tablet: '1.5rem', // 24px - rounded-3xl
      },
      aspectRatio: 'aspect-square',
      image: {
        borderRadius: 'rounded-2xl sm:rounded-3xl', // ✅ RONDE HOEKEN: Foto's met ronde hoeken
        borderRadiusValue: {
          mobile: '1rem', // 16px - rounded-2xl
          tablet: '1.5rem', // 24px - rounded-3xl
        },
        objectFit: 'object-cover',
      },
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
        hover: 'group-hover:text-[#3071aa]',
        transition: 'transition-colors',
      },
    },
  },
} as const;

// Helper functie om class names samen te voegen
export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
