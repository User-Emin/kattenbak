/**
 * DEFAULT PRODUCT IMAGES - DRY & Self-Contained
 * Fundamentele oplossing: Base64 embedded images (werk altijd, offline ready)
 */

// DRY: Default product image (klein SVG, optimaal voor development)
export const DEFAULT_PRODUCT_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Crect fill='%2310b981' width='800' height='800'/%3E%3Cg fill='%23ffffff' font-family='Arial, sans-serif' font-size='48' font-weight='bold' text-anchor='middle'%3E%3Ctext x='400' y='350'%3EPremium%3C/text%3E%3Ctext x='400' y='420'%3EKattenbak%3C/text%3E%3C/g%3E%3C/svg%3E`;

// DRY: Product image set voor development/demo
export const DEMO_PRODUCT_IMAGES = {
  main: DEFAULT_PRODUCT_IMAGE,
  
  // Alternative views met verschillende kleuren voor distinctie
  front: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Crect fill='%23ef4444' width='800' height='800'/%3E%3Cg fill='%23ffffff' font-family='Arial, sans-serif' font-size='48' font-weight='bold' text-anchor='middle'%3E%3Ctext x='400' y='380'%3EVooraanzicht%3C/text%3E%3C/g%3E%3C/svg%3E`,
  
  side: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Crect fill='%230ea5e9' width='800' height='800'/%3E%3Cg fill='%23ffffff' font-family='Arial, sans-serif' font-size='48' font-weight='bold' text-anchor='middle'%3E%3Ctext x='400' y='380'%3EZijaanzicht%3C/text%3E%3C/g%3E%3C/svg%3E`,
  
  inside: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Crect fill='%238b5cf6' width='800' height='800'/%3E%3Cg fill='%23ffffff' font-family='Arial, sans-serif' font-size='48' font-weight='bold' text-anchor='middle'%3E%3Ctext x='400' y='380'%3EBinnenkant%3C/text%3E%3C/g%3E%3C/svg%3E`,
  
  detail: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Crect fill='%23f97316' width='800' height='800'/%3E%3Cg fill='%23ffffff' font-family='Arial, sans-serif' font-size='48' font-weight='bold' text-anchor='middle'%3E%3Ctext x='400' y='380'%3EDetail%3C/text%3E%3C/g%3E%3C/svg%3E`,
};

// DRY: Get demo images as array
export function getDemoProductImages(): string[] {
  return [
    DEMO_PRODUCT_IMAGES.main,
    DEMO_PRODUCT_IMAGES.front,
    DEMO_PRODUCT_IMAGES.side,
    DEMO_PRODUCT_IMAGES.inside,
    DEMO_PRODUCT_IMAGES.detail,
  ];
}

// DRY: Validate if image URL is accessible
export function isValidImageUrl(url: string): boolean {
  // Data URLs altijd valid
  if (url.startsWith('data:')) return true;
  
  // Relative URLs (uploads) altijd valid
  if (url.startsWith('/')) return true;
  
  // External URLs: moet http(s) zijn
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// DRY: Get fallback image
export function getFallbackImage(): string {
  return DEFAULT_PRODUCT_IMAGE;
}




