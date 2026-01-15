/**
 * IMAGE CONFIGURATION - Maximaal DRY & DYNAMISCH
 * Sync met backend demo images voor consistentie
 * NO HARDCODED PATHS - Alles via API of demo fallback
 */

import { DEFAULT_PRODUCT_IMAGE, getFallbackImage } from './demo-images';

export const IMAGE_CONFIG = {
  // DRY: Alle images gebruiken demo fallback (sync met backend)
  // Deze worden ALLEEN gebruikt als fallback - echte images komen van API
  hero: {
    main: DEFAULT_PRODUCT_IMAGE,
    alt: 'Premium automatische kattenbak',
  },
  
  usps: {
    capacity: {
      src: DEFAULT_PRODUCT_IMAGE,
      alt: '10.5L grote capaciteit',
    },
    quiet: {
      src: DEFAULT_PRODUCT_IMAGE,
      alt: 'Ultra-stille motor onder 40dB',
    },
  },
  
  // Product images - ALLEEN fallback, echte data via API
  product: {
    main: DEFAULT_PRODUCT_IMAGE,
    alt: 'Premium Kattenbak',
  },
  
  // Cart & Checkout - ALLEEN fallback, echte data via API
  cart: {
    thumbnail: DEFAULT_PRODUCT_IMAGE,
    alt: 'Premium Kattenbak',
  },
  
  checkout: {
    thumbnail: DEFAULT_PRODUCT_IMAGE,
    alt: 'Premium Kattenbak',
  },
  
  // Fallback placeholder (zelfde als demo main)
  placeholder: DEFAULT_PRODUCT_IMAGE,
} as const;

// Image optimization settings
export const IMAGE_QUALITY = 85;

/**
 * DRY Helper: Get product image with intelligent fallback
 * MAXIMAAL DYNAMISCH: Eerst proberen vanuit API, dan demo fallback
 * Single source voor alle product afbeeldingen
 */
export const getProductImage = (images: string[] | null | undefined): string => {
  // 1. Probeer images array vanuit API (DYNAMISCH)
  if (images && Array.isArray(images) && images.length > 0 && images[0]) {
    return images[0];
  }
  
  // 2. Fallback naar demo image (sync met backend)
  return getFallbackImage();
};

// Helper voor FILL images (geen width/height)
export const getImageFillProps = (config: { src?: string; alt: string }) => {
  const imageSrc = config.src && config.src.trim() !== '' ? config.src : IMAGE_CONFIG.placeholder; // ✅ FIX: Geen lege string
  return {
    src: imageSrc,
    alt: config.alt,
    fill: true,
    quality: IMAGE_QUALITY,
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    onError: () => console.error('❌ Image failed to load:', imageSrc),
  };
};

// Helper voor FIXED images (met width/height)
export const getImageFixedProps = (config: { 
  src?: string; 
  alt: string;
  width: number;
  height: number;
}) => {
  const imageSrc = config.src && config.src.trim() !== '' ? config.src : IMAGE_CONFIG.placeholder; // ✅ FIX: Geen lege string
  return {
    src: imageSrc,
    alt: config.alt,
    width: config.width,
    height: config.height,
    quality: IMAGE_QUALITY,
    onError: () => console.error('❌ Image failed to load:', imageSrc),
  };
};
