/**
 * IMAGE CONFIGURATION - Maximaal DRY
 * Single source voor alle afbeeldingen in de app
 */

export const IMAGE_CONFIG = {
  // Hero images - Gebruikt overal in de app
  hero: {
    main: '/images/test-cat.jpg',
    alt: 'Premium automatische kattenbak',
  },
  
  // USP section images
  usps: {
    capacity: {
      src: '/images/test-cat.jpg',
      alt: '10.5L grote capaciteit',
    },
    quiet: {
      src: '/images/test-cat.jpg',
      alt: 'Ultra-stille motor onder 40dB',
    },
  },
  
  // Product images - Voor detail, cart, checkout
  product: {
    main: '/images/test-cat.jpg',
    alt: 'Premium Kattenbak',
  },
  
  // Cart & Checkout images (alias voor product)
  cart: {
    thumbnail: '/images/test-cat.jpg',
    alt: 'Premium Kattenbak',
  },
  
  checkout: {
    thumbnail: '/images/test-cat.jpg',
    alt: 'Premium Kattenbak',
  },
  
  // Fallback placeholder
  placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPklNQUdFPC90ZXh0Pjwvc3ZnPg==',
} as const;

// Image optimization settings
export const IMAGE_QUALITY = 85;

/**
 * DRY Helper: Get product image with intelligent fallback
 * Single source voor alle product afbeeldingen
 */
export const getProductImage = (images: string[] | null | undefined): string => {
  // Probeer images array
  if (images && Array.isArray(images) && images.length > 0 && images[0]) {
    return images[0];
  }
  
  // Fallback naar centrale product afbeelding
  return IMAGE_CONFIG.product.main;
};

// Helper voor FILL images (geen width/height)
export const getImageFillProps = (config: { src?: string; alt: string }) => {
  console.log('🖼️ Loading image:', config.src || 'placeholder');
  return {
    src: config.src || IMAGE_CONFIG.placeholder,
    alt: config.alt,
    fill: true,
    quality: IMAGE_QUALITY,
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    onError: () => console.error('❌ Image failed to load:', config.src),
    onLoad: () => console.log('✅ Image loaded:', config.src),
  };
};

// Helper voor FIXED images (met width/height)
export const getImageFixedProps = (config: { 
  src?: string; 
  alt: string;
  width: number;
  height: number;
}) => ({
  src: config.src || IMAGE_CONFIG.placeholder,
  alt: config.alt,
  width: config.width,
  height: config.height,
  quality: IMAGE_QUALITY,
  onError: () => console.error('❌ Image failed to load:', config.src),
  onLoad: () => console.log('✅ Image loaded:', config.src),
});
