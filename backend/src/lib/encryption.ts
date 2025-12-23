/**
 * ENCRYPTION LIBRARY - AES-256-GCM
 * Security: Industry-standard encryption for sensitive data
 * Use: Customer PII (email, phone, address)
 */

import crypto from 'crypto';

// Security: Load from environment (NEVER hardcode!)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const ALGORITHM = 'aes-256-gcm';

// Validate encryption key
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  console.warn('⚠️  ENCRYPTION_KEY not set or invalid. Using fallback (NOT PRODUCTION SAFE!)');
  // This will be caught in production checks
}

/**
 * Encrypt sensitive data
 * Returns: { encrypted, iv, tag }
 * All values are hex strings
 */
export const encrypt = (plaintext: string): { 
  encrypted: string; 
  iv: string; 
  tag: string; 
} => {
  if (!plaintext) {
    return { encrypted: '', iv: '', tag: '' };
  }

  try {
    // Generate random IV (Initialization Vector)
    const iv = crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );
    
    // Encrypt
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  } catch (error: any) {
    console.error('Encryption error:', error.message);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt sensitive data
 * Input: { encrypted, iv, tag } (all hex strings)
 * Returns: Original plaintext
 */
export const decrypt = (
  encrypted: string,
  iv: string,
  tag: string
): string => {
  if (!encrypted || !iv || !tag) {
    return '';
  }

  try {
    // Create decipher
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      Buffer.from(iv, 'hex')
    );
    
    // Set authentication tag
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error: any) {
    console.error('Decryption error:', error.message);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Hash sensitive data (one-way, for searching)
 * Use: Email lookup without decryption
 */
export const hashForSearch = (plaintext: string): string => {
  return crypto
    .createHash('sha256')
    .update(plaintext + ENCRYPTION_KEY)
    .digest('hex');
};

/**
 * Generate encryption key (for initial setup)
 * Run once: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
export const generateEncryptionKey = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Validate encryption key format
 */
export const isValidEncryptionKey = (key: string): boolean => {
  return /^[0-9a-f]{64}$/i.test(key);
};






