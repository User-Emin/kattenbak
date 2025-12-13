import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind classes
 * Handles conflicts intelligently
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price to EUR
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

/**
 * Format date
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("nl-NL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate placeholder image URL
 */
export function getPlaceholderImage(width: number = 600, height: number = 600, text?: string): string {
  const displayText = text || `${width}x${height}`;
  return `https://placehold.co/${width}x${height}/f5f5f5/1a1a1a?text=${encodeURIComponent(displayText)}`;
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}


