/**
 * DESIGN TOKENS - Maximaal DRY
 * Single source of truth voor alle design values
 * DUAL COLOR SYSTEM: Blauw (trust) + Oranje (conversie)
 */

export const designTokens = {
  colors: {
    primary: '#1a1a1a',
    secondary: '#fafafa',
    
    // BRAND - Serieuze blue-gray (navbar, trust elements)
    brand: '#415b6b',
    brandDark: '#314552',
    brandLight: '#567080',
    
    // ACCENT - Coolblue Oranje (CTA buttons, conversie)
    accent: '#f75d0a',
    accentDark: '#e65400',
    accentLight: '#ff7f1a',
    
    white: '#ffffff',
    black: '#000000',
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
  },
  
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },
  
  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },
  
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },
  
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    float: '0 8px 30px rgba(0, 0, 0, 0.04)',      // Zwevend effect
    floatHover: '0 12px 40px rgba(0, 0, 0, 0.06)', // Hover lift
  },
  
  transitions: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  animations: {
    fadeIn: 'fade-in 0.4s ease-out',
    slideUp: 'slide-up 0.5s ease-out',
    scaleIn: 'scale-in 0.3s ease-out',
  },
  
  separators: {
    float: {
      height: '1px',
      background: 'linear-gradient(90deg, transparent 0%, #e5e5e5 10%, #e5e5e5 90%, transparent 100%)',
      shadow: '0 1px 3px rgba(0,0,0,0.04)',
    },
  },
} as const;

export type DesignTokens = typeof designTokens;
