/**
 * 🎨 DESIGN SYSTEM - CENTRALE CONFIGURATIE
 * 
 * Geïnspireerd door: pergolux.nl
 * - Minimalistisch zwart-wit design
 * - Premium positioning
 * - Maximum witruimte
 * - Dunne maar leesbare typography
 * 
 * ✅ DRY: Single source of truth voor alle design tokens
 * ✅ Type-safe: Alle values zijn strictly typed
 * ✅ Maintainable: 1 plek om design te wijzigen
 */

export const DESIGN_SYSTEM = {
  /**
   * KLEUREN - Minimalistisch zwart-wit palet
   */
  colors: {
    // Primary colors - ✅ GRADIENT: #3C3C3D → #7A7A7D (was #000000)
    primary: 'linear-gradient(135deg, #3C3C3D 0%, #7A7A7D 100%)',  // ✅ GRADIENT: Main text, borders
    primaryStart: '#3C3C3D',  // ✅ GRADIENT START
    primaryEnd: '#7A7A7D',   // ✅ GRADIENT END
    secondary: '#ffffff',     // Wit - backgrounds, inverse text
    
    // Grays - voor subtiele accenten
    gray: {
      50: '#fafafa',         // Lightest - subtle backgrounds
      100: '#f5f5f5',        // Very light - hover states
      200: '#e5e5e5',        // Light - borders
      300: '#d4d4d4',        // Medium light
      400: '#a3a3a3',        // Medium
      500: '#737373',        // Medium dark - secondary text
      600: '#525252',        // Dark
      700: '#404040',        // Darker
      800: '#262626',        // Very dark
      900: '#171717',        // Darkest
    },
    
    // Text colors - ✅ ZWARTER: Titels en belangrijke teksten zwarter gemaakt
    text: {
      primary: '#000000',     // ✅ ZWART: Volledig zwart voor titels (was gradient)
      primaryStart: '#000000',  // ✅ ZWART: Voor compatibiliteit
      primaryEnd: '#000000',    // ✅ ZWART: Voor compatibiliteit
      dark: '#000000',          // ✅ ZWART: Nieuwe dark variant voor titels zoals "Waarom deze kattenbak?"
      secondary: '#666666',   // Secondary tekst
      muted: '#999999',       // Muted/disabled tekst
      inverse: '#ffffff',     // Tekst op donkere achtergrond
    },
    
    // UI colors
    border: {
      light: '#f5f5f5',       // Subtle borders
      default: '#e5e5e5',     // Default borders
      dark: '#d4d4d4',        // Emphasized borders
    },
    
    // State colors (minimaal gebruikt)
    state: {
      success: '#22c55e',     // Groen - success messages
      error: '#ef4444',       // Rood - errors
      warning: '#f59e0b',     // Geel - warnings
      info: '#129DD8',       // Sync met BRAND_COLORS_HEX.primary (lib/color-config.ts)
    }
  },

  /**
   * TYPOGRAPHY - Noto Sans, dunne weights
   */
  typography: {
    // Font families
    fontFamily: {
      primary: 'var(--font-noto-sans), system-ui, sans-serif',
      headings: 'var(--font-noto-sans), system-ui, sans-serif', // Noto Sans voor titels
    },
    
    // Font weights - ONLY 4 weights voor performance
    fontWeight: {
      light: '300',          // Subtitles, descriptions
      normal: '400',         // Body text, readable
      medium: '500',         // ✅ Titles (logo style - dunner maar vet)
      semibold: '600',       // Headings - DIKKER voor duidelijkheid
      bold: '700',            // ✅ DIKKER: Voor winkelwagen badge en belangrijke UI elementen
    },
    
    // Font sizes - Type scale (1.25 ratio)
    fontSize: {
      xs: '0.75rem',        // 12px
      sm: '0.875rem',       // 14px
      base: '1rem',         // 16px
      lg: '1.125rem',       // 18px
      xl: '1.25rem',        // 20px
      '2xl': '1.5rem',      // 24px
      '3xl': '1.875rem',    // 30px
      '4xl': '2.25rem',     // 36px
      '5xl': '3rem',        // 48px
      '6xl': '3.75rem',     // 60px
    },
    
    // Line heights
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
      loose: '2',
    },
    
    // Letter spacing
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',    // ✅ Voor logo-style titles
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
    }
  },

  /**
   * SPACING - 4px base grid system
   */
  spacing: {
    // Base units (4px grid)
    0: '0',
    1: '0.25rem',     // 4px
    2: '0.5rem',      // 8px
    3: '0.75rem',     // 12px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    8: '2rem',        // 32px
    10: '2.5rem',     // 40px
    12: '3rem',       // 48px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    32: '8rem',       // 128px
    
    // Semantic spacing
    section: '5rem',          // 80px - tussen secties
    containerPadding: '3rem', // 48px - container padding (desktop)
    containerPaddingMobile: '1.5rem', // 24px - container padding (mobile)
  },

  /**
   * LAYOUT - Containers, grids, etc.
   */
  layout: {
    // Container max-widths
    maxWidth: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1400px',      // Main content max-width
      full: '100%',
    },
    
    // Navbar
    navbar: {
      height: '80px',
      bg: '#ffffff',
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      maxWidth: '100%',     // Edge-to-edge
      padding: '0 48px',
    },
    
    // Hero – afbeelding zwevend: ronde hoeken + marge (geen hardcode)
    hero: {
      minHeight: '600px',
      minHeightMobile: '500px',
      splitRatio: {
        text: '35%',
        image: '65%',
      },
      spacing: '32px',
      imageUrl: '/images/hero-main.jpg',
      /** Zwevend effect: marge rond afbeelding (responsive via Tailwind) */
      imageMargin: '1rem',       // 16px base
      imageMarginSm: '1.25rem',  // 20px sm
      imageMarginMd: '1.5rem',   // 24px md
      imageMarginLg: '2rem',    // 32px lg
      imageRounded: '1rem',      // rounded-2xl (16px)
      imageRoundedLg: '1.5rem',  // rounded-3xl op groot
      imageShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    },
    
    // Trust banner (onder hero) - ✅ ZWART: #000000
    trustBanner: {
      bg: '#000000',  // ✅ ZWART (was gradient)
      bgStart: '#000000',    // ✅ ZWART
      bgEnd: '#000000',      // ✅ ZWART
      color: '#ffffff',
      height: '60px',
      padding: '0 48px',
    },
    
    // URLveld / themebalk boven USP – zelfde blauw als banner (browser chrome + top strip)
    topBar: {
      bg: '#000000',
      height: '4px',
    },
    // USP banner (boven navbar) – zwart, witte tekst
    uspBanner: {
      bg: '#000000',
      bgStart: '#000000',
      bgEnd: '#000000',
      color: '#ffffff',
      height: '32px',
      animationDuration: '3000ms',
      zIndex: '160',
    },
    
    // Navbar – wit; logo CATSUPPLY (bijlage), links en winkelwagen symbool donker
    navbar: {
      height: '72px',
      maxWidth: '1920px',
      bg: '#ffffff',
      textColor: '#000000',
      cartSymbolColor: '#000000',
      cartSymbolBg: 'transparent',
      /** CTA-knop "Winkelwagen" op pagina’s: zwart */
      cartButtonBg: '#000000',
      cartButtonText: '#ffffff',
      cartBadge: {
        minWidth: '20px',
        height: '20px',
        fontSize: '0.75rem',
        fontWeight: '700',
        borderRadius: '9999px',
        badgeBg: '#000000',
        badgeText: '#ffffff',
      },
      zIndex: '999',
      logoPath: '/logos/logo.png',
      logoPathFallback: '/logos/logo-navbar-original.png',
    },
    // Productdetailpagina – achtergrond gewoon wit (aansluitend op colors.secondary)
    productDetail: {
      pageBg: '#ffffff',     // = colors.secondary
    },
    
    // ✅ DRY: Totale header hoogte (banner + navbar) voor sidebar positioning
    header: {
      totalHeight: 'calc(32px + 72px)', // ✅ DRY: uspBanner.height + navbar.height
    },
    
    // ✅ Z-INDEX MANAGEMENT: Centrale z-index configuratie (geen hardcode)
    sidebarZIndex: {
      sidebar: 'z-[170]', // ✅ BOVEN header (z-[165]) en mobile bottom nav (z-[200]) - sidebar moet boven header
      sidebarBackdrop: 'z-[160]', // ✅ ONDER sidebar maar BOVEN header (z-[165])
    },
    
    // ✅ MOBILE BOTTOM NAV: Zwarte balk, witte knop (mobiel) – centrale configuratie (geen hardcode)
    mobileBottomNav: {
      height: '80px',
      heightPx: 80,
      zIndex: 'z-[200]',
      zIndexValue: 200,
      chatButtonOffset: '72px',
      chatButtonOffsetPx: 72,
      chatButtonZIndex: 'z-[201]',
      chatButtonZIndexValue: 201,
      /** Balk/border: zwart */
      barBg: '#000000',
      barBorderColor: '#262626',
      /** Knop op mobiel: wit, zwarte tekst */
      buttonBg: '#ffffff',
      buttonText: '#000000',
      /** Badge op witte knop: zwart vlak, witte cijfers */
      badgeBg: '#000000',
      badgeText: '#ffffff',
      /** Knop: compacter horizontaal en verticaal */
      buttonPaddingY: 'py-2.5',
      buttonPaddingX: 'px-4',
      buttonRounded: 'rounded-md',
      buttonGap: 'gap-1.5',
    },

    // CHAT: button positie + modal (variabelensysteem, geen hardcode)
    chatButton: {
      right: 'right-2', // compact: minder padding tot rechter zijkant
    },
    chatModal: {
      headerBg: '#000000',
      headerTextColor: '#ffffff',
      borderRadius: 'rounded-3xl',
      borderRadiusLg: 'rounded-[1.5rem]',
      modalBorderRadius: 'rounded-3xl sm:rounded-[2rem]',
      headerBorderRadius: 'rounded-t-3xl sm:rounded-t-[2rem]',
      messagesBg: '#ffffff',
      inputBorderRadius: 'rounded-2xl',
      borderColor: 'border-gray-200',
      /** Typgebied (onderkant modal): zwart, ook mobiel ronde hoeken */
      inputBg: '#000000',
      inputTextColor: '#ffffff',
      inputFieldBg: '#262626',
      inputFieldBorder: 'border-gray-600',
      inputBottomBorderRadius: 'rounded-b-3xl',
      closeButtonPadding: 'p-2',
      closeButtonRounded: 'rounded-md',
    },
    
    // Feature section (edge-to-edge afbeelding) - ✅ SMOOTH PASSEND: Legale foto onder hero
    featureSection: {
      minHeight: '400px',
      // ✅ DYNAMISCH: Legale afbeelding Unsplash (smooth passend bij hero, modern interieur)
      imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2000&auto=format&fit=crop',
      overlayOpacity: 0.4,  // Iets donkerder voor betere leesbaarheid
    },
    
    // Edge section (Premium Kwaliteit & Veiligheid) - ✅ GRADIENT EXACT NAVBAR (GEEN AFBEELDING)
    edgeSection: {
      // ✅ DYNAMISCH: Gradient exact zoals navbar (geen afbeelding, geen hardcode)
      // Gradient wordt direct in component gebruikt via DESIGN_SYSTEM.colors.primaryStart/End
    },
    
    // Feature images - ✅ DYNAMISCH: Centrale configuratie voor zigzag features
    features: {
      capacity: {
        // ✅ DYNAMISCH: 10.5L Capaciteit afbeelding (wordt dynamisch gezet)
        imageUrl: '/images/capacity-10.5l.jpg', // Standaard, kan worden overschreven
      },
      quiet: {
        // ✅ DYNAMISCH: Ultra-Quiet Motor afbeelding
        imageUrl: '/images/feature-2.jpg',
      },
    },
    
    // Sections
    section: {
      padding: '80px 0',
      paddingMobile: '48px 0',
    }
  },

  /**
   * BUTTON STYLING - ✅ DRY: Centrale button configuratie
   */
  button: {
    borderRadius: 'rounded-xl', // ✅ EXACT ZELFDE: Zoals Let op kaart (rounded-xl)
  },

  /**
   * BORDERS & SHADOWS
   */
  effects: {
    // Border radius - ✅ DYNAMISCH: Alle border radius waarden
    borderRadius: {
      none: '0',
      sm: '0.125rem',     // 2px - subtle
      base: '0.25rem',    // 4px - default
      md: '0.375rem',     // 6px
      lg: '0.5rem',       // 8px
      xl: '0.75rem',      // 12px - ✅ RONDER: Voor buttons en icons
      '2xl': '1rem',      // 16px - ✅ RONDER: Voor grote buttons
      full: '9999px',     // ✅ ROND: Voor volledig ronde elementen
    },
    
    // Box shadows - minimalistisch
    shadow: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    }
  },

  /**
   * TRANSITIONS - Smooth interactions
   */
  transitions: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
    },
    timing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    }
  },

  /**
   * LAYOUT UTILITIES - Dynamische layout classes (DRY)
   */
  layoutUtils: {
    // Positioning
    position: {
      fixed: 'fixed',
      absolute: 'absolute',
      relative: 'relative',
      sticky: 'sticky',
      static: 'static',
    },
    // Display
    display: {
      flex: 'flex',
      block: 'block',
      inline: 'inline',
      inlineBlock: 'inline-block',
      grid: 'grid',
      none: 'hidden',
    },
    // Flexbox
    flex: {
      direction: {
        row: 'flex-row',
        col: 'flex-col',
      },
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
      },
      wrap: {
        wrap: 'flex-wrap',
        nowrap: 'flex-nowrap',
      },
      grow: {
        grow: 'flex-grow',
        shrink: 'flex-shrink',
        none: 'flex-none',
      },
    },
    // Sizing
    sizing: {
      full: 'w-full h-full',
      widthFull: 'w-full',
      heightFull: 'h-full',
      auto: 'w-auto h-auto',
      widthAuto: 'w-auto',
      heightAuto: 'h-auto',
    },
    // Overflow
    overflow: {
      auto: 'overflow-auto',
      hidden: 'overflow-hidden',
      visible: 'overflow-visible',
      scroll: 'overflow-scroll',
      yAuto: 'overflow-y-auto',
      xAuto: 'overflow-x-auto',
    },
    // Pointer events
    pointerEvents: {
      none: 'pointer-events-none',
      auto: 'pointer-events-auto',
    },
    // Z-index
    zIndex: {
      backdrop: 'z-[110]',
      modal: 'z-[120]',
      dropdown: 'z-[50]',
      sticky: 'z-[10]',
      sidebar: 'z-[170]', // ✅ BOVEN header (z-[165]) en mobile bottom nav (z-[200]) - sidebar moet boven header
      sidebarBackdrop: 'z-[160]', // ✅ ONDER sidebar maar BOVEN header (z-[165])
      base: 'z-0',
    },
    // Transitions (utility classes)
    transitions: {
      all: 'transition-all',
      colors: 'transition-colors',
      transform: 'transition-transform',
      opacity: 'transition-opacity',
    },
  },

  /**
   * CONTACT INFO - Centrale locatie
   */
  contact: {
    email: 'info@catsupply.nl' as const,
    phone: '+31 6 12345678' as const,
    phoneDisplay: '+31 6 123 456 78' as const,
  }
} as const;

/**
 * TYPE EXPORTS - Voor TypeScript type-safety
 */
export type DesignSystem = typeof DESIGN_SYSTEM;
export type ColorScale = keyof typeof DESIGN_SYSTEM.colors.gray;
export type FontWeight = keyof typeof DESIGN_SYSTEM.typography.fontWeight;
export type FontSize = keyof typeof DESIGN_SYSTEM.typography.fontSize;
export type Spacing = keyof typeof DESIGN_SYSTEM.spacing;
