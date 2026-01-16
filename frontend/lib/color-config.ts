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
  // Primary Brand Color (Navbar Blue / Winkelwagen Blauw)
  primary: '#005980',        // ✅ WINKELWAGEN BLAUW - Single source of truth
  primaryDark: '#004760',    // ✅ WINKELWAGEN BLAUW DARK
  primaryLight: '#007aa8',   // ✅ WINKELWAGEN BLAUW LIGHT
  
  // Accent Color - ✅ GRADIENT: #3C3C3D → #7A7A7D (was #000000)
  accent: 'linear-gradient(135deg, #3C3C3D 0%, #7A7A7D 100%)',  // ✅ GRADIENT (was #000000)
  accentStart: '#3C3C3D',   // ✅ GRADIENT START
  accentEnd: '#7A7A7D',     // ✅ GRADIENT END
  accentDark: '#111827',    // ✅ DARK GRAY (was orange-dark)
  accentLight: '#374151',   // ✅ GRAY (was orange-light)
  
  // Button Color (WINKELWAGEN BLAUW voor CTA buttons - vervangt oranje)
  buttonCta: '#005980',     // ✅ WINKELWAGEN BLAUW (was #2563eb blue-600, vervangt oranje)
  buttonCtaHover: '#004760', // ✅ WINKELWAGEN BLAUW DARK (was #1d4ed8 blue-700, vervangt oranje hover)
  
  // Oranje vervangen door WINKELWAGEN BLAUW - Single source of truth
  orangeReplacement: '#005980',      // ✅ WINKELWAGEN BLAUW (vervangt #f76402)
  orangeReplacementHover: '#004760', // ✅ WINKELWAGEN BLAUW DARK (vervangt #e55a02, #e55d00)
  
  // Neutral Colors - ✅ GRADIENT: #3C3C3D → #7A7A7D (was #000000)
  white: '#ffffff',
  black: 'linear-gradient(135deg, #3C3C3D 0%, #7A7A7D 100%)',  // ✅ GRADIENT (was #000000)
  blackStart: '#3C3C3D',    // ✅ GRADIENT START
  blackEnd: '#7A7A7D',      // ✅ GRADIENT END
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
    primary: 'bg-brand',           // ✅ WINKELWAGEN BLAUW (#005980)
    primaryDark: 'bg-brand-dark',  // ✅ WINKELWAGEN BLAUW DARK (#004760)
    accent: 'bg-black',            // ✅ ZWART (was orange)
    accentDark: 'bg-gray-900',     // ✅ DARK GRAY
    buttonCta: 'bg-brand',         // ✅ WINKELWAGEN BLAUW (was blue-600, vervangt oranje)
    orangeReplacement: 'bg-brand', // ✅ WINKELWAGEN BLAUW (vervangt oranje)
    white: 'bg-white',
    black: 'bg-black',
    gray50: 'bg-gray-50',
    gray100: 'bg-gray-100',
  },
  
  // Text Colors
  text: {
    primary: 'text-brand',
    accent: 'text-black',              // ✅ ZWART (was orange)
    orangeReplacement: 'text-brand',   // ✅ WINKELWAGEN BLAUW (vervangt oranje)
    white: 'text-white',
    black: 'text-black',
    gray600: 'text-gray-600',
    gray900: 'text-gray-900',
  },
  
  // Border Colors
  border: {
    primary: 'border-brand',
    accent: 'border-black',              // ✅ ZWART (was orange)
    orangeReplacement: 'border-brand',   // ✅ WINKELWAGEN BLAUW (vervangt oranje)
    gray200: 'border-gray-200',
    gray300: 'border-gray-300',
  },
  
  // Hover States
  hover: {
    accentDark: 'hover:bg-gray-900',         // ✅ DARK GRAY (was orange)
    buttonCta: 'hover:bg-brand-dark',        // ✅ WINKELWAGEN BLAUW DARK (was blue-700)
    orangeReplacement: 'hover:bg-brand-dark', // ✅ WINKELWAGEN BLAUW DARK (vervangt oranje hover)
    primaryDark: 'hover:bg-brand-dark',
  },
} as const;

// ============================================
// SEMANTIC COLORS - USE CASES
// ============================================

export const SEMANTIC_COLORS = {
  // CTA Buttons (BLAUW voor buttons)
  cta: {
    bg: COLOR_CLASSES.bg.buttonCta,         // ✅ BLAUW bg-blue-600
    bgHover: COLOR_CLASSES.hover.buttonCta, // ✅ BLAUW hover:bg-blue-700
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
  
  // Cart Badge (ZWART in plaats van oranje)
  cartBadge: {
    bg: COLOR_CLASSES.bg.accent,    // ✅ ZWART (was orange)
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

import { DESIGN_SYSTEM } from './design-system';

export const COMPONENT_COLORS = {
  button: {
    // CTA Button (BLAUW) - Checkout, Cart, etc.
    cta: `${SEMANTIC_COLORS.cta.bg} ${SEMANTIC_COLORS.cta.bgHover} ${SEMANTIC_COLORS.cta.text} font-semibold ${DESIGN_SYSTEM.button.borderRadius}`, // ✅ DRY: Via DESIGN_SYSTEM
    
    // Primary Button (Zwart)
    primary: `${SEMANTIC_COLORS.primary.bg} ${SEMANTIC_COLORS.primary.bgHover} ${SEMANTIC_COLORS.primary.text} font-semibold ${DESIGN_SYSTEM.button.borderRadius}`, // ✅ DRY: Via DESIGN_SYSTEM
    
    // Outline Button
    outline: `bg-transparent border-2 border-gray-300 hover:border-black text-gray-900 ${DESIGN_SYSTEM.button.borderRadius}`, // ✅ DRY: Via DESIGN_SYSTEM
  },
  
  badge: {
    // Cart Count Badge (ZWART in plaats van oranje)
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
