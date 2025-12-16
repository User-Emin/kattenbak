/**
 * DEFENSIVE PRICE UTILITIES
 * Maximale veiligheid tegen type errors en vulnerabilities
 */

/**
 * Format price defensively - NOOIT crashes
 * @param price - Any value (number, string, null, undefined)
 * @param decimals - Number of decimals (default 2)
 * @returns Formatted price string
 */
export function formatPrice(price: any, decimals: number = 2): string {
  // DEFENSIVE: Handle all edge cases
  if (price === null || price === undefined) return '0.00';
  
  // Convert to number safely
  const numPrice = typeof price === 'number' 
    ? price 
    : parseFloat(String(price));
  
  // DEFENSIVE: Check if valid number
  if (isNaN(numPrice) || !isFinite(numPrice)) {
    console.warn('Invalid price value:', price);
    return '0.00';
  }
  
  // DEFENSIVE: Sanitize negative prices
  const sanitizedPrice = Math.max(0, numPrice);
  
  // DEFENSIVE: Safe toFixed
  try {
    return sanitizedPrice.toFixed(decimals);
  } catch (err) {
    console.error('Price formatting error:', err);
    return '0.00';
  }
}

/**
 * Format price with currency symbol
 */
export function formatCurrency(price: any, currency: string = '€'): string {
  return `${currency}${formatPrice(price)}`;
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(
  originalPrice: any,
  salePrice: any
): number {
  const original = parseFloat(String(originalPrice)) || 0;
  const sale = parseFloat(String(salePrice)) || 0;
  
  if (original <= 0 || sale <= 0 || sale >= original) return 0;
  
  return Math.round(((original - sale) / original) * 100);
}

/**
 * Parse price safely
 */
export function parsePrice(price: any): number {
  if (typeof price === 'number') return Math.max(0, price);
  
  const parsed = parseFloat(String(price));
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}
