/**
 * PRICE UTILITIES - Shared price calculation and formatting
 * DRY: Single source for all price-related operations
 * Security: Type-safe conversions, prevents injection
 */

import { Decimal } from 'decimal.js';
import { Prisma } from '@prisma/client';

/**
 * Convert Prisma Decimal to number
 * Returns 0 for null/undefined to ensure valid number type
 */
export const decimalToNumber = (decimal: Prisma.Decimal | null | undefined): number => {
  if (!decimal) return 0;
  return parseFloat(decimal.toString());
};

/**
 * Convert number to Decimal for database storage
 */
export const numberToDecimal = (value: number | string | null | undefined): Decimal => {
  if (value === null || value === undefined) return new Decimal(0);
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? new Decimal(0) : new Decimal(parsed);
  }
  return new Decimal(value);
};

/**
 * Calculate tax from total (21% BTW)
 * Input: total incl. BTW
 * Output: tax amount
 */
export const calculateTax = (totalInclBtw: number | Decimal): Decimal => {
  const total = typeof totalInclBtw === 'number' ? new Decimal(totalInclBtw) : totalInclBtw;
  const totalExclBtw = total.div(new Decimal(1.21));
  return total.minus(totalExclBtw);
};

/**
 * Extract BTW from total (21%)
 * Returns: { totalExclBtw, tax, totalInclBtw }
 */
export const extractTax = (totalInclBtw: number | Decimal) => {
  const total = typeof totalInclBtw === 'number' ? new Decimal(totalInclBtw) : totalInclBtw;
  const totalExclBtw = total.div(new Decimal(1.21));
  const tax = total.minus(totalExclBtw);
  
  return {
    totalInclBtw: total,
    totalExclBtw,
    tax,
  };
};

/**
 * Format price for display (EUR)
 */
export const formatPrice = (price: number | Decimal): string => {
  const amount = typeof price === 'number' ? price : price.toNumber();
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

/**
 * Validate price is valid (positive, finite, not NaN)
 */
export const isValidPrice = (price: number | string | null | undefined): boolean => {
  if (price === null || price === undefined) return false;
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return !isNaN(num) && isFinite(num) && num >= 0;
};
