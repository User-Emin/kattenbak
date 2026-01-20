/**
 * ADDRESS UTILITIES - Shared address parsing and validation
 * DRY: Single source for all address-related operations
 */

export interface ParsedAddress {
  street: string;
  houseNumber: string;
  addition?: string;
}

/**
 * Parse combined address string into street and houseNumber
 * Handles formats like "Straatnaam 123", "Straatnaam 123A", "Straatnaam 123-125"
 */
export const parseAddress = (address: string): ParsedAddress | null => {
  if (!address || typeof address !== 'string') return null;
  
  const trimmed = address.trim();
  // Match: street name followed by house number (with optional letter/suffix)
  const match = trimmed.match(/^(.+?)\s+(\d+[A-Za-z0-9\-]*.*?)$/);
  
  if (match) {
    return {
      street: match[1].trim(),
      houseNumber: match[2].trim(),
    };
  }
  
  return null;
};

/**
 * Normalize address - ensure street and houseNumber are never empty
 */
export const normalizeAddress = (
  street?: string,
  houseNumber?: string,
  address?: string
): { street: string; houseNumber: string } => {
  let normalizedStreet = street || '';
  let normalizedHouseNumber = houseNumber || '';
  
  // If separate fields are empty, try to parse from combined address
  if ((!normalizedStreet || !normalizedHouseNumber) && address) {
    const parsed = parseAddress(address);
    if (parsed) {
      normalizedStreet = normalizedStreet || parsed.street;
      normalizedHouseNumber = normalizedHouseNumber || parsed.houseNumber;
    }
  }
  
  // Fallback: ensure we have valid values
  if (!normalizedStreet && address) {
    normalizedStreet = address.trim();
  }
  if (!normalizedStreet) {
    normalizedStreet = 'Onbekende straat';
  }
  if (!normalizedHouseNumber) {
    normalizedHouseNumber = '1';
  }
  
  return {
    street: normalizedStreet,
    houseNumber: normalizedHouseNumber,
  };
};
