/**
 * COLOR CONFIG - DRY & SECURE
 * Alle kleuren op één plek - Single Source of Truth
 * 
 * BELANGRIJK: Dit is de ENIGE plek waar brand colors worden gedefinieerd!
 * Vermijd hardcoded hex codes in components.
 */

// ============================================
// BRAND COLORS - PRIMARY PALETTE
// ============================================

export const BRAND_COLORS_HEX = {
  // Primary Brand Color (Navbar Blue)
  primary: '#005980',
  primaryDark: '#004760',
  primaryLight: '#007aa8',
  
  // Accent Color (Orange CTA)
  accent: '#f76402',
  accentDark: '#e55a02',
  accentLight: '#ff8533',
  
  // Neutral Colors
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

// ============================================
// TAILWIND SAFE CLASSES - JIT COMPATIBLE
// ============================================

export const COLOR_CLASSES = {
  // Background Colors
  bg: {
    primary: 'bg-brand',
    primaryDark: 'bg-brand-dark',
    accent: 'bg-[#f76402]',
    accentDark: 'bg-[#e55a02]',
    white: 'bg-white',
    black: 'bg-black',
    gray50: 'bg-gray-50',
    gray100: 'bg-gray-100',
  },
  
  // Text Colors
  text: {
    primary: 'text-brand',
    accent: 'text-[#f76402]',
    white: 'text-white',
    black: 'text-black',
    gray600: 'text-gray-600',
    gray900: 'text-gray-900',
  },
  
  // Border Colors
  border: {
    primary: 'border-brand',
    accent: 'border-[#f76402]',
    gray200: 'border-gray-200',
    gray300: 'border-gray-300',
  },
  
  // Hover States
  hover: {
    accentDark: 'hover:bg-[#e55a02]',
    primaryDark: 'hover:bg-brand-dark',
  },
} as const;

// ============================================
// SEMANTIC COLORS - USE CASES
// ============================================

export const SEMANTIC_COLORS = {
  // CTA Buttons (Oranje)
  cta: {
    bg: COLOR_CLASSES.bg.accent,
    bgHover: COLOR_CLASSES.hover.accentDark,
    text: COLOR_CLASSES.text.white,
  },
  
  // Primary Buttons (Zwart)
  primary: {
    bg: COLOR_CLASSES.bg.black,
    bgHover: 'hover:bg-gray-900',
    text: COLOR_CLASSES.text.white,
  },
  
  // Navigation (Blauw)
  nav: {
    bg: COLOR_CLASSES.bg.primary,
    bgHover: COLOR_CLASSES.hover.primaryDark,
    text: COLOR_CLASSES.text.white,
  },
  
  // Cart Badge (Oranje)
  cartBadge: {
    bg: COLOR_CLASSES.bg.accent,
    text: COLOR_CLASSES.text.white,
  },
  
  // Success States
  success: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-600',
  },
  
  // Error States
  error: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-600',
  },
} as const;

// ============================================
// COMPONENT SPECIFIC COLORS
// ============================================

export const COMPONENT_COLORS = {
  button: {
    // CTA Button (Oranje) - Checkout, Cart, etc.
    cta: `${SEMANTIC_COLORS.cta.bg} ${SEMANTIC_COLORS.cta.bgHover} ${SEMANTIC_COLORS.cta.text} font-semibold rounded-md`,
    
    // Primary Button (Zwart)
    primary: `${SEMANTIC_COLORS.primary.bg} ${SEMANTIC_COLORS.primary.bgHover} ${SEMANTIC_COLORS.primary.text} font-semibold rounded-md`,
    
    // Outline Button
    outline: 'bg-transparent border-2 border-gray-300 hover:border-[#f76402] text-gray-900 rounded-md',
  },
  
  badge: {
    // Cart Count Badge (Oranje)
    cart: `${SEMANTIC_COLORS.cartBadge.bg} ${SEMANTIC_COLORS.cartBadge.text} rounded-full`,
    
    // Stock Badge
    inStock: 'bg-green-50 text-green-600',
    outOfStock: 'bg-red-50 text-red-600',
  },
  
  nav: {
    bg: SEMANTIC_COLORS.nav.bg,
    text: SEMANTIC_COLORS.nav.text,
    hover: SEMANTIC_COLORS.nav.bgHover,
  },
} as const;

// ============================================
// HELPER FUNCTIONS - TYPE SAFE
// ============================================

/**
 * Get button class based on variant
 */
export function getButtonClass(variant: 'cta' | 'primary' | 'outline' = 'cta'): string {
  return COMPONENT_COLORS.button[variant];
}

/**
 * Get badge class based on type
 */
export function getBadgeClass(type: 'cart' | 'inStock' | 'outOfStock'): string {
  return COMPONENT_COLORS.badge[type];
}

/**
 * Check if color is dark (for text contrast)
 */
export function isDarkColor(hex: string): boolean {
  // Convert hex to RGB
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >>  8) & 0xff;
  const b = (rgb >>  0) & 0xff;
  
  // Calculate luminance
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  
  return luma < 128;
}

export default {
  BRAND_COLORS_HEX,
  COLOR_CLASSES,
  SEMANTIC_COLORS,
  COMPONENT_COLORS,
};
