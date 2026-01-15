/**
 * THEME COLORS + TYPOGRAPHY - MAXIMAAL DYNAMISCH & DRY
 * 
 * FUNDAMENTELE FIX:
 * - Direct Tailwind classes gebruiken (geen strings in objects)
 * - Tailwind JIT compiler kan deze WEL detecteren
 * - Alles via CSS variabelen voor maximale dynamiek
 * - TYPOGRAPHY: Centralized font weights & sizes
 * 
 * DRY Principles:
 * - Single source of truth
 * - Type-safe met TypeScript
 * - Maintainable & consistent
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPOGRAPHY - CENTRALIZED FONT SYSTEM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const TYPOGRAPHY = {
  // ✅ DIKKE TYPOGRAPHY - ALLES font-semibold (zoals FAQ balken)
  // Font Weights - MAXIMAAL DUIDELIJK & LEESBAAR
  weight: {
    light: 'font-normal',      // 400 (was: 300) ✅ DIKKER
    normal: 'font-semibold',   // 600 ✅ DEFAULT = SEMIBOLD!
    medium: 'font-semibold',   // 600 ✅ SEMIBOLD
    semibold: 'font-bold',     // 700 ✅ BOLD
    bold: 'font-bold',         // 700
  },
  
  // Font Sizes - Headlines - GROTER & ZICHTBAARDER
  heading: {
    hero: 'text-6xl md:text-8xl',      // ✅ +1 level (was 5xl/7xl)
    h1: 'text-5xl md:text-7xl',        // ✅ +1 level (was 5xl/6xl)
    h2: 'text-4xl md:text-5xl',        // ✅ Responsive (was 4xl)
    h3: 'text-3xl md:text-4xl',        // ✅ Responsive (was 3xl)
    h4: 'text-2xl md:text-3xl',        // ✅ Responsive (was 2xl)
    h5: 'text-xl md:text-2xl',         // ✅ Responsive (was xl)
  },
  
  // Font Sizes - Body - GROTER & LEESBAARDER
  body: {
    xl: 'text-2xl',                    // ✅ +1 level (was xl)
    lg: 'text-xl',                     // ✅ +1 level (was lg)
    base: 'text-lg',                   // ✅ +1 level (was base)
    sm: 'text-base',                   // ✅ +1 level (was sm)
    xs: 'text-sm',                     // ✅ +1 level (was xs)
  },
  
  // Complete Heading Styles - DIKKE TITELS
  heading_complete: {
    hero: 'text-6xl md:text-8xl font-semibold tracking-tight',     // ✅ SEMIBOLD
    h1: 'text-5xl md:text-7xl font-semibold tracking-tight',       // ✅ SEMIBOLD
    h2: 'text-4xl md:text-5xl font-semibold',                      // ✅ SEMIBOLD
    h3: 'text-3xl md:text-4xl font-semibold',                      // ✅ SEMIBOLD
    h4: 'text-2xl md:text-3xl font-semibold',                      // ✅ SEMIBOLD
    h5: 'text-xl md:text-2xl font-semibold',                       // ✅ SEMIBOLD
  },
  
  // Body Text Styles - DIKKE BODY TEKST (zoals FAQ)
  body_complete: {
    xl: 'text-2xl font-semibold leading-relaxed',                  // ✅ SEMIBOLD
    lg: 'text-xl font-semibold leading-relaxed',                   // ✅ SEMIBOLD
    base: 'text-lg font-semibold leading-relaxed',                 // ✅ SEMIBOLD
    sm: 'text-base font-semibold leading-relaxed',                 // ✅ SEMIBOLD
    xs: 'text-sm font-semibold leading-relaxed',                   // ✅ SEMIBOLD
  },
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DIRECT TAILWIND CLASSES (Detecteerbaar door JIT)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const GRADIENTS = {
  primary: 'bg-gradient-to-r from-gray-900 to-black',
  secondary: 'bg-gradient-to-r from-blue-500 to-blue-600',
  hero: 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
  cta: 'bg-gradient-to-br from-black to-gray-900',           // ✅ ZWART ipv ORANJE
  ctaHover: 'hover:from-gray-900 hover:to-gray-800',        // ✅ ZWART ipv ORANJE
  ctaReverse: 'bg-gradient-to-br from-blue-600 to-gray-900',
  subtle: 'bg-gradient-to-br from-gray-50 via-white to-gray-50',
  textGradient: 'bg-gradient-to-r from-gray-900 to-black bg-clip-text text-transparent',
} as const;

export const TEXT_COLORS = {
  // Primary is now BLACK (was cyan)
  primary: {
    50: 'text-gray-50',
    100: 'text-gray-100',
    200: 'text-gray-200',
    300: 'text-gray-300',
    400: 'text-gray-400',
    500: 'text-gray-500',
    600: 'text-gray-600',
    700: 'text-gray-700',
    800: 'text-gray-800',
    900: 'text-gray-900',
    black: 'text-black',
  },
  blue: {
    50: 'text-blue-50',
    100: 'text-blue-100',
    200: 'text-blue-200',
    300: 'text-blue-300',
    400: 'text-blue-400',
    500: 'text-blue-500',
    600: 'text-blue-600',
    700: 'text-blue-700',
    800: 'text-blue-800',
    900: 'text-blue-900',
  },
  // ✅ ORANJE VERVANGEN DOOR ZWART (maximaal dynamisch)
  accent: {
    500: 'text-gray-900',   // Was: orange-500
    600: 'text-black',      // Was: orange-600 ✅ HOOFDACCENT = ZWART
    700: 'text-black',      // Was: orange-700
  },
  gray: {
    50: 'text-gray-50',
    100: 'text-gray-100',
    200: 'text-gray-200',
    300: 'text-gray-300',
    400: 'text-gray-400',
    500: 'text-gray-500',
    600: 'text-gray-600',
    700: 'text-gray-700',
    800: 'text-gray-800',
    900: 'text-gray-900',
    black: 'text-black',
    white: 'text-white',
  },
} as const;

export const BG_COLORS = {
  // Primary is now BLACK (was cyan)
  primary: {
    50: 'bg-gray-50',
    100: 'bg-gray-100',
    200: 'bg-gray-200',
    300: 'bg-gray-300',
    400: 'bg-gray-400',
    500: 'bg-gray-500',
    600: 'bg-gray-600',
    700: 'bg-gray-700',
    800: 'bg-gray-800',
    900: 'bg-gray-900',
    black: 'bg-black',
  },
  blue: {
    50: 'bg-blue-50',
    100: 'bg-blue-100',
    200: 'bg-blue-200',
    300: 'bg-blue-300',
    400: 'bg-blue-400',
    500: 'bg-blue-500',
    600: 'bg-blue-600',
    700: 'bg-blue-700',
    800: 'bg-blue-800',
    900: 'bg-blue-900',
  },
  // ✅ ORANJE VERVANGEN DOOR ZWART (maximaal dynamisch)
  accent: {
    50: 'bg-gray-50',       // Was: orange-50
    100: 'bg-gray-100',     // Was: orange-100
    500: 'bg-gray-900',     // Was: orange-500
    600: 'bg-black',        // Was: orange-600 ✅ HOOFDACCENT = ZWART
    700: 'bg-black',        // Was: orange-700
    800: 'bg-black',        // Was: orange-800
  },
  // ✅ GEEN CREAM MEER - VERVANGEN DOOR ORANJE!
  // cream kleur #eff0cc is vervangen door oranje (bg-orange-50)
  gray: {
    50: 'bg-gray-50',
    100: 'bg-gray-100',
    200: 'bg-gray-200',
    300: 'bg-gray-300',
    400: 'bg-gray-400',
    500: 'bg-gray-500',
    600: 'bg-gray-600',
    700: 'bg-gray-700',
    800: 'bg-gray-800',
    900: 'bg-gray-900',
    black: 'bg-black',
    white: 'bg-white',
  },
} as const;

export const BORDER_COLORS = {
  primary: {
    100: 'border-gray-100',
    600: 'border-gray-600',
  },
  blue: {
    100: 'border-blue-100',
    600: 'border-blue-600',
  },
  gray: {
    600: 'border-gray-600',
    800: 'border-gray-800',
  },
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SEMANTIC COLORS (Status/feedback)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SEMANTIC_COLORS = {
  success: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-600',
    icon: 'text-green-600',
  },
  warning: {
    bg: 'bg-gray-50',       // Was: orange-50 ✅ ZWART
    text: 'text-black',     // Was: orange-600 ✅ ZWART
    border: 'border-black', // Was: orange-600 ✅ ZWART
    icon: 'text-black',     // Was: orange-600 ✅ ZWART
  },
  error: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-600',
    icon: 'text-red-600',
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-600',
    icon: 'text-blue-600',
  },
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENT-SPECIFIC COLORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ✅ DRY: NAVBAR KLEUR - Single source of truth
// Navbar gebruikt bg-brand class (zie globals.css: #005980)
const NAVBAR_COLOR = 'bg-brand' as const;

export const COMPONENT_COLORS = {
  button: {
    primary: 'bg-gradient-to-br from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white font-bold rounded-full',
    secondary: 'bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full',
    cta: 'bg-brand hover:bg-brand-dark text-white font-bold rounded-full transform hover:scale-[1.02] transition-all duration-200', // ✅ WINKELWAGEN BLAUW (was oranje)
    outline: 'border-2 border-current rounded-full',
  },
  navbar: {
    bg: `${NAVBAR_COLOR}`, // ✅ DRY: bg-brand (#005980)
    text: 'text-white',
    hover: 'hover:text-white/80',
  },
  sidebar: {
    bg: 'bg-white',                 // ✅ WIT zoals normaal
    text: 'text-gray-900',          // ✅ ZWARTE TEKST zoals normaal
    border: 'border-gray-200',      // ✅ Lichte border
    button: `${NAVBAR_COLOR} hover:bg-brand-dark text-white font-semibold transition-all`, // ✅ "Bekijk Winkelwagen" NAVBAR BLAUW
    ctaButton: 'bg-black hover:bg-gray-900 text-white font-bold transition-all', // ✅ "Afrekenen" ZWART
  },
  chat: {
    icon: NAVBAR_COLOR, // ✅ DRY: Exact bg-brand zoals navbar
    iconText: 'text-white',
  },
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get contrasting text color (DRY: Auto wit op donker)
 */
export function getTextColor(bgColor: 'dark' | 'light'): string {
  return bgColor === 'dark' ? 'text-white' : 'text-gray-900';
}

/**
 * Get text color based on background shade (DRY: Auto contrast)
 */
export function getContrastText(bgShade: number): string {
  // Donker: 700-900 = witte tekst
  // Licht: 50-600 = zwarte tekst
  return bgShade >= 700 ? 'text-white' : 'text-gray-900';
}

/**
 * Get button with automatic text color (DRY: Smart button)
 */
export function getButton(bgColor: string, type: 'solid' | 'gradient' = 'solid') {
  const isDark = bgColor.includes('black') || 
                 bgColor.includes('gray-900') || 
                 bgColor.includes('gray-800') ||
                 bgColor.includes('blue-600') ||
                 bgColor.includes('orange-600');
  
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  
  if (type === 'gradient') {
    return `${bgColor} ${textColor}`;
  }
  
  return `bg-${bgColor} hover:bg-${bgColor.replace('600', '700')} ${textColor}`;
}

/**
 * Get step color (DRY: For process flows)
 */
export function getStepColor(index: number) {
  const colors = [
    { text: TEXT_COLORS.blue[600], bg: BG_COLORS.blue[50] },
    { text: TEXT_COLORS.primary[900], bg: BG_COLORS.primary[50] },
    { text: SEMANTIC_COLORS.warning.text, bg: SEMANTIC_COLORS.warning.bg },
    { text: SEMANTIC_COLORS.success.text, bg: SEMANTIC_COLORS.success.bg },
  ];
  return colors[index % colors.length];
}

export const BACKGROUND_OPACITY = {
  full: 'opacity-100',
  high: 'opacity-90',
  medium: 'opacity-50',
  low: 'opacity-20',
  minimal: 'opacity-10',
  decoration: 'opacity-[0.07]',
} as const;

export const BORDER_RADIUS = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  default: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
} as const;

export const SHADOWS = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  default: 'shadow',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  glow: 'shadow-xl hover:shadow-2xl transition-shadow',
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DARK BACKGROUNDS (Auto witte tekst)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const DARK_BACKGROUNDS = {
  black: 'bg-black text-white',
  gray900: 'bg-gray-900 text-white',
  gray800: 'bg-gray-800 text-white',
  blue600: 'bg-blue-600 text-white',
  blue700: 'bg-blue-700 text-white',
  accent600: 'bg-black text-white',      // ✅ ZWART ipv ORANJE
  accent700: 'bg-black text-white',      // ✅ ZWART ipv ORANJE
  // Gradients met auto witte tekst
  gradientDark: 'bg-gradient-to-br from-gray-900 to-black text-white',
  gradientBlue: 'bg-gradient-to-br from-blue-600 to-blue-700 text-white',
  gradientAccent: 'bg-gradient-to-br from-black to-gray-900 text-white', // ✅ ZWART ipv ORANJE
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LEGACY SUPPORT (Backwards compatibility)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Keep old naming for backwards compatibility
export const BRAND_COLORS = {
  primary: BG_COLORS.primary,  // BLACK
  secondary: BG_COLORS.blue,   // BLUE (navbar)
  accent: BG_COLORS.accent,    // ✅ ZWART (was orange)
  neutral: BG_COLORS.gray,
} as const;

export { TEXT_COLORS as TEXT_COLORS_OLD };



