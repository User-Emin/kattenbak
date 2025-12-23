/**
 * MEDIA ENCRYPTION UTILITY - AES-256-GCM
 * DRY & Secure encryption for uploaded media files
 * 
 * Security Features:
 * - AES-256-GCM (Authenticated Encryption)
 * - Random IV per file (96-bit)
 * - Authentication tag (128-bit)
 * - Key derivation from env secret
 * - Constant-time operations
 */

import crypto from 'crypto';
import fs from 'fs/promises';

// DRY: Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits (recommended for GCM)
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

/**
 * Get encryption key from environment
 * Derives a consistent 256-bit key from MEDIA_ENCRYPTION_KEY
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.MEDIA_ENCRYPTION_KEY;
  
  if (!secret) {
    throw new Error('MEDIA_ENCRYPTION_KEY not set in environment');
  }

  // Derive a proper 256-bit key using PBKDF2
  return crypto.pbkdf2Sync(
    secret,
    'media-encryption-salt-v1', // Static salt (acceptable for key derivation)
    100000, // iterations
    KEY_LENGTH,
    'sha256'
  );
}

/**
 * Encrypt file buffer
 * Returns: { encrypted: Buffer, iv: Buffer, authTag: Buffer }
 */
export async function encryptFile(buffer: Buffer): Promise<{
  encrypted: Buffer;
  iv: Buffer;
  authTag: Buffer;
}> {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH); // Random IV per file
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(buffer),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    return { encrypted, iv, authTag };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('File encryption failed');
  }
}

/**
 * Decrypt file buffer
 * Requires: encrypted data, IV, and auth tag
 */
export async function decryptFile(
  encrypted: Buffer,
  iv: Buffer,
  authTag: Buffer
): Promise<Buffer> {
  try {
    const key = getEncryptionKey();
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('File decryption failed - data may be corrupted');
  }
}

/**
 * Encrypt and save file to disk
 * Stores: [IV (12 bytes)][Auth Tag (16 bytes)][Encrypted Data]
 * This format allows single-file storage with all metadata
 */
export async function encryptAndSaveFile(
  buffer: Buffer,
  filePath: string
): Promise<void> {
  const { encrypted, iv, authTag } = await encryptFile(buffer);
  
  // Combine IV + authTag + encrypted data for single-file storage
  const combined = Buffer.concat([iv, authTag, encrypted]);
  
  await fs.writeFile(filePath, combined);
}

/**
 * Load and decrypt file from disk
 * Extracts IV and auth tag from file header
 */
export async function loadAndDecryptFile(filePath: string): Promise<Buffer> {
  const combined = await fs.readFile(filePath);
  
  // Extract components
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  
  return decryptFile(encrypted, iv, authTag);
}

/**
 * Verify encryption is properly configured
 * Test encryption/decryption with sample data
 */
export async function verifyEncryptionSetup(): Promise<boolean> {
  try {
    const testData = Buffer.from('test-encryption-verification-' + Date.now());
    
    const { encrypted, iv, authTag } = await encryptFile(testData);
    const decrypted = await decryptFile(encrypted, iv, authTag);
    
    return testData.equals(decrypted);
  } catch (error) {
    console.error('Encryption verification failed:', error);
    return false;
  }
}

/**
 * Get file metadata for encrypted files
 * Returns original size before encryption overhead
 */
export function getEncryptionOverhead(): number {
  return IV_LENGTH + AUTH_TAG_LENGTH; // 28 bytes total
}

/**
 * Secure key rotation helper
 * Re-encrypts file with new key (when MEDIA_ENCRYPTION_KEY changes)
 */
export async function rotateFileEncryption(
  filePath: string,
  oldKey: string
): Promise<void> {
  // Temporarily set old key
  const currentKey = process.env.MEDIA_ENCRYPTION_KEY;
  process.env.MEDIA_ENCRYPTION_KEY = oldKey;
  
  try {
    // Decrypt with old key
    const decrypted = await loadAndDecryptFile(filePath);
    
    // Restore new key
    process.env.MEDIA_ENCRYPTION_KEY = currentKey;
    
    // Re-encrypt with new key
    await encryptAndSaveFile(decrypted, filePath);
  } finally {
    // Ensure key is restored
    process.env.MEDIA_ENCRYPTION_KEY = currentKey;
  }
}

