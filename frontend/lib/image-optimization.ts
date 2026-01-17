/**
 * 🚀 IMAGE OPTIMIZATION UTILITIES - Fastest Load Times
 * Best practices for Next.js 15 image performance
 */

/**
 * Generate optimized sizes attribute for responsive images
 * Ensures browser only loads image size needed for viewport
 */
export function getOptimizedSizes(context: 'product-main' | 'product-thumbnail' | 'product-gallery' | 'hero'): string {
  switch (context) {
    case 'product-main':
      // Main product image: full width on mobile, half on tablet, fixed on desktop
      return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px";
    case 'product-thumbnail':
      // Thumbnails: smaller sizes for faster loading
      return "(max-width: 640px) 100px, 150px";
    case 'product-gallery':
      // Gallery images: responsive grid
      return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
    case 'hero':
      // Hero images: full width
      return "100vw";
    default:
      return "(max-width: 640px) 100vw, 600px";
  }
}

/**
 * Blur placeholder data URL (tiny 1x1 pixel)
 * Shows instantly while image loads for perceived performance
 */
export const BLUR_PLACEHOLDER = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

/**
 * Optimal image quality settings
 * 85 = best balance between quality and file size for fastest loading
 */
export const OPTIMAL_QUALITY = 85;

/**
 * Preload image for critical above-the-fold images
 */
export function preloadImage(src: string) {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  link.fetchPriority = 'high';
  document.head.appendChild(link);
}

/**
 * Check if image is in viewport (for lazy loading)
 */
export function isInViewport(element: HTMLElement): boolean {
  if (typeof window === 'undefined') return false;
  
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Generate srcset for responsive images (manual optimization)
 */
export function generateSrcSet(baseSrc: string, sizes: number[]): string {
  return sizes
    .map((size) => `${baseSrc}?w=${size} ${size}w`)
    .join(', ');
}
