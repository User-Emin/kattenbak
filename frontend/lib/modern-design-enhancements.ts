/**
 * ✅ MODERN DESIGN ENHANCEMENTS - 10/10 PREMIUM STYLING
 * 
 * Geïnspireerd door moderne webshops (Poopy.co, premium e-commerce):
 * - Premium spacing & typography
 * - Subtle shadows & depth
 * - Smooth micro-interactions
 * - Modern card designs
 * - Premium button styling
 * 
 * ✅ DRY: Alles via config, geen hardcode
 * ✅ MODULAIR: Aansluitend op bestaand systeem
 */

import { DESIGN_SYSTEM } from './design-system';
import { BRAND_COLORS_HEX } from './color-config';

export const MODERN_DESIGN = {
  /**
   * PREMIUM SPACING - Meer ruimte, premium feel
   */
  spacing: {
    section: {
      mobile: 'py-12 sm:py-16',
      desktop: 'md:py-20 lg:py-24',
    },
    container: {
      mobile: 'px-4 sm:px-6',
      desktop: 'md:px-8 lg:px-12',
    },
    card: {
      padding: 'p-6 sm:p-8',
      gap: 'gap-6',
    },
  },

  /**
   * PREMIUM SHADOWS - Subtle depth
   */
  shadows: {
    card: 'shadow-sm hover:shadow-lg transition-shadow duration-300',
    cardHover: 'shadow-xl',
    button: 'shadow-md hover:shadow-lg',
    hero: 'shadow-2xl',
  },

  /**
   * PREMIUM TYPOGRAPHY - Modern hierarchy
   */
  typography: {
    hero: {
      fontSize: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
      fontWeight: 'font-light',
      letterSpacing: 'tracking-tight',
      lineHeight: 'leading-[1.1]',
    },
    h1: {
      fontSize: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
      fontWeight: 'font-light',
      letterSpacing: 'tracking-tight',
    },
    h2: {
      fontSize: 'text-2xl sm:text-3xl md:text-4xl',
      fontWeight: 'font-light',
      letterSpacing: 'tracking-tight',
    },
    body: {
      fontSize: 'text-base sm:text-lg',
      lineHeight: 'leading-relaxed',
    },
  },

  /**
   * PREMIUM BUTTONS - Modern styling
   */
  buttons: {
    primary: {
      base: 'relative overflow-hidden group',
      padding: 'px-8 py-4 sm:px-10 sm:py-5',
      fontSize: 'text-base sm:text-lg',
      fontWeight: 'font-semibold',
      borderRadius: 'rounded-lg',
      transition: 'transition-all duration-300',
      shadow: 'shadow-md hover:shadow-xl',
      transform: 'transform hover:scale-[1.02] active:scale-[0.98]',
      // Background via inline style voor dynamische kleur
    },
    secondary: {
      base: 'relative overflow-hidden group',
      padding: 'px-8 py-4 sm:px-10 sm:py-5',
      fontSize: 'text-base sm:text-lg',
      fontWeight: 'font-semibold',
      borderRadius: 'rounded-lg',
      border: 'border-2',
      transition: 'transition-all duration-300',
      transform: 'transform hover:scale-[1.02] active:scale-[0.98]',
    },
  },

  /**
   * PREMIUM CARDS - Modern card design
   */
  cards: {
    product: {
      base: 'group relative overflow-hidden',
      borderRadius: 'rounded-xl',
      bg: 'bg-white',
      padding: 'p-0',
      shadow: 'shadow-sm hover:shadow-xl',
      transition: 'transition-all duration-500',
      transform: 'transform hover:-translate-y-2',
      border: 'border border-gray-100',
    },
    feature: {
      base: 'relative overflow-hidden',
      borderRadius: 'rounded-2xl',
      bg: 'bg-white',
      padding: 'p-8',
      shadow: 'shadow-md hover:shadow-2xl',
      transition: 'transition-all duration-500',
      border: 'border border-gray-100',
    },
  },

  /**
   * PREMIUM HERO - Modern hero section
   */
  hero: {
    overlay: {
      gradient: 'bg-gradient-to-br from-black/20 via-transparent to-transparent',
    },
    content: {
      spacing: 'space-y-6 sm:space-y-8',
      maxWidth: 'max-w-2xl',
    },
    cta: {
      spacing: 'mt-8 sm:mt-10',
    },
  },

  /**
   * PREMIUM ANIMATIONS - Smooth micro-interactions
   */
  animations: {
    fadeIn: 'animate-in fade-in duration-700',
    slideUp: 'animate-in slide-in-from-bottom-4 duration-700',
    scaleIn: 'animate-in zoom-in-95 duration-500',
    stagger: {
      delay: (index: number) => `delay-[${index * 100}ms]`,
    },
  },

  /**
   * PREMIUM COLORS - Modern color palette
   */
  colors: {
    primary: BRAND_COLORS_HEX.primary, // #3071aa
    primaryDark: BRAND_COLORS_HEX.primaryDark,
    primaryLight: BRAND_COLORS_HEX.primaryLight,
    text: {
      primary: DESIGN_SYSTEM.colors.text.primary,
      secondary: DESIGN_SYSTEM.colors.text.secondary,
      muted: DESIGN_SYSTEM.colors.text.muted,
    },
    bg: {
      primary: DESIGN_SYSTEM.colors.secondary,
      subtle: DESIGN_SYSTEM.colors.gray[50],
      card: DESIGN_SYSTEM.colors.secondary,
    },
  },
} as const;

/**
 * Helper: Get premium button styles
 */
export function getPremiumButtonStyles(variant: 'primary' | 'secondary' = 'primary') {
  const config = MODERN_DESIGN.buttons[variant];
  
  if (variant === 'primary') {
    return {
      className: `${config.base} ${config.padding} ${config.fontSize} ${config.fontWeight} ${config.borderRadius} ${config.transition} ${config.shadow} ${config.transform} text-white`,
      style: {
        backgroundColor: MODERN_DESIGN.colors.primary,
      } as React.CSSProperties,
    };
  }
  
  return {
    className: `${config.base} ${config.padding} ${config.fontSize} ${config.fontWeight} ${config.borderRadius} ${config.border} ${config.transition} ${config.transform} bg-transparent`,
    style: {
      borderColor: MODERN_DESIGN.colors.primary,
      color: MODERN_DESIGN.colors.primary,
    } as React.CSSProperties,
  };
}

/**
 * Helper: Get premium card styles
 */
export function getPremiumCardStyles(type: 'product' | 'feature' = 'product') {
  const config = MODERN_DESIGN.cards[type];
  return `${config.base} ${config.borderRadius} ${config.bg} ${config.padding} ${config.shadow} ${config.transition} ${config.transform} ${config.border}`;
}
