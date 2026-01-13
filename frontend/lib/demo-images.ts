/**
 * DEMO IMAGES - DYNAMISCH BEHEERBAAR
 * DRY: Configureerbare SVG images
 * Self-contained, geen externe dependencies
 */

// DRY: Configuratie voor placeholder images - GEEN HARDCODE
const PLACEHOLDER_CONFIG = {
  colors: {
    background: '#ffffff',  // WIT achtergrond (was #10b981 groen)
    text: '#000000',        // ZWART tekst
  },
  dimensions: {
    width: 800,
    height: 800,
  },
  text: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 48,
    fontWeight: 'bold',
  },
};

// DRY: Helper functie om SVG te genereren
function generatePlaceholderSVG(text: string[], bgColor: string = PLACEHOLDER_CONFIG.colors.background): string {
  const { width, height } = PLACEHOLDER_CONFIG.dimensions;
  const { fontFamily, fontSize, fontWeight } = PLACEHOLDER_CONFIG.text;
  const textColor = PLACEHOLDER_CONFIG.colors.text;
  
  const textElements = text.map((line, index) => 
    `<text x='400' y='${350 + (index * 70)}'>${line}</text>`
  ).join('');
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect fill='${encodeURIComponent(bgColor)}' width='${width}' height='${height}'/%3E%3Cg fill='${encodeURIComponent(textColor)}' font-family='${fontFamily}' font-size='${fontSize}' font-weight='${fontWeight}' text-anchor='middle'%3E${textElements}%3C/g%3E%3C/svg%3E`;
}

// DRY: Default product image - DYNAMISCH
export const DEFAULT_PRODUCT_IMAGE = generatePlaceholderSVG(['Premium', 'Kattenbak']);

// DRY: Product image set - DYNAMISCH met individuele kleuren voor varianten
export const DEMO_PRODUCT_IMAGES = {
  main: DEFAULT_PRODUCT_IMAGE,
  front: generatePlaceholderSVG(['Vooraanzicht'], PLACEHOLDER_CONFIG.colors.background),
  side: generatePlaceholderSVG(['Zijaanzicht'], PLACEHOLDER_CONFIG.colors.background),
  inside: generatePlaceholderSVG(['Binnenkant'], PLACEHOLDER_CONFIG.colors.background),
  detail: generatePlaceholderSVG(['Detail'], PLACEHOLDER_CONFIG.colors.background),
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

// DRY: Get fallback image
export function getFallbackImage(): string {
  return DEFAULT_PRODUCT_IMAGE;
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



