/**
 * LAYOUT CONFIGURATION - DRY & DYNAMIC
 * Centralized navbar & logo sizing
 * DRY: Single source of truth voor alle layout maten
 */

export const LAYOUT_CONFIG = {
  navbar: {
    // FIXED navbar height - NEVER changes with logo size
    height: 'h-16', // 64px - absoluut vast
    heightPx: 64,
    background: 'bg-brand',
    shadow: 'shadow-md',
  },
  
  logo: {
    // Dynamic logo size - independently adjustable
    height: 'h-24', // 96px - dynamisch aanpasbaar
    heightPx: 96,
    width: 300,
    aspectRatio: 100, // Voor Next.js Image width/height
    
    // CSS trick: negatieve margin om uit navbar te steken
    // Formula: -(logoHeight - navbarHeight) / 2
    // Example: -(96px - 64px) / 2 = -16px = -my-4
    negativeMargin: '-my-4', // Logo steekt uit navbar
    
    // z-index voor logo boven content
    zIndex: 'relative z-10',
  },
  
  // Helper function om logo margin te berekenen
  calculateLogoMargin: (logoHeightPx: number, navbarHeightPx: number): string => {
    const diff = logoHeightPx - navbarHeightPx;
    if (diff <= 0) return ''; // Logo past in navbar
    
    const marginPx = Math.floor(diff / 2);
    // Convert px to Tailwind classes
    const marginRem = marginPx / 4; // 4px = 1 unit in Tailwind
    return `-my-${marginRem}`;
  }
} as const;

// Type exports voor TypeScript
export type LayoutConfig = typeof LAYOUT_CONFIG;
