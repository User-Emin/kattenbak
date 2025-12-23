/**
 * ENCRYPTION UTILITY TESTS
 * Tests for AES-256-GCM media encryption
 */

import { 
  encryptFile, 
  decryptFile, 
  verifyEncryptionSetup,
  encryptAndSaveFile,
  loadAndDecryptFile
} from '../utils/encryption.util';
import fs from 'fs/promises';
import path from 'path';

describe('Encryption Utility', () => {
  // Setup test environment
  beforeAll(() => {
    process.env.MEDIA_ENCRYPTION_KEY = 'test-encryption-key-for-unit-tests';
  });
  
  afterAll(() => {
    delete process.env.MEDIA_ENCRYPTION_KEY;
  });
  
  describe('encryptFile / decryptFile', () => {
    it('should encrypt and decrypt data correctly', async () => {
      const testData = Buffer.from('Hello, World! This is a test.');
      
      // Encrypt
      const { encrypted, iv, authTag } = await encryptFile(testData);
      
      // Verify encrypted data is different from original
      expect(encrypted).not.toEqual(testData);
      expect(iv.length).toBe(12); // 96 bits
      expect(authTag.length).toBe(16); // 128 bits
      
      // Decrypt
      const decrypted = await decryptFile(encrypted, iv, authTag);
      
      // Verify decrypted matches original
      expect(decrypted).toEqual(testData);
    });
    
    it('should fail decryption with wrong auth tag', async () => {
      const testData = Buffer.from('Test data');
      const { encrypted, iv } = await encryptFile(testData);
      
      // Create invalid auth tag
      const invalidAuthTag = Buffer.alloc(16);
      
      // Should throw error
      await expect(
        decryptFile(encrypted, iv, invalidAuthTag)
      ).rejects.toThrow();
    });
    
    it('should fail decryption with wrong IV', async () => {
      const testData = Buffer.from('Test data');
      const { encrypted, authTag } = await encryptFile(testData);
      
      // Create invalid IV
      const invalidIV = Buffer.alloc(12);
      
      // Should throw error
      await expect(
        decryptFile(encrypted, invalidIV, authTag)
      ).rejects.toThrow();
    });
    
    it('should handle large files', async () => {
      // Create 10MB test file
      const largeData = Buffer.alloc(10 * 1024 * 1024, 'a');
      
      const { encrypted, iv, authTag } = await encryptFile(largeData);
      const decrypted = await decryptFile(encrypted, iv, authTag);
      
      expect(decrypted).toEqual(largeData);
    });
  });
  
  describe('encryptAndSaveFile / loadAndDecryptFile', () => {
    const testFilePath = path.join(__dirname, 'test-encrypted-file.enc');
    
    afterEach(async () => {
      try {
        await fs.unlink(testFilePath);
      } catch {
        // Ignore if file doesn't exist
      }
    });
    
    it('should save encrypted file and load it back', async () => {
      const testData = Buffer.from('File encryption test data');
      
      // Encrypt and save
      await encryptAndSaveFile(testData, testFilePath);
      
      // Verify file exists
      const stats = await fs.stat(testFilePath);
      expect(stats.size).toBeGreaterThan(testData.length); // Includes IV + authTag
      
      // Load and decrypt
      const decrypted = await loadAndDecryptFile(testFilePath);
      
      // Verify data matches
      expect(decrypted).toEqual(testData);
    });
  });
  
  describe('verifyEncryptionSetup', () => {
    it('should verify encryption is working', async () => {
      const isHealthy = await verifyEncryptionSetup();
      expect(isHealthy).toBe(true);
    });
    
    it('should fail without encryption key', async () => {
      delete process.env.MEDIA_ENCRYPTION_KEY;
      
      const isHealthy = await verifyEncryptionSetup();
      expect(isHealthy).toBe(false);
      
      // Restore key
      process.env.MEDIA_ENCRYPTION_KEY = 'test-encryption-key-for-unit-tests';
    });
  });
  
  describe('Security Tests', () => {
    it('should use unique IV for each encryption', async () => {
      const testData = Buffer.from('Same data');
      
      const result1 = await encryptFile(testData);
      const result2 = await encryptFile(testData);
      
      // IVs should be different
      expect(result1.iv).not.toEqual(result2.iv);
      
      // Encrypted data should be different (due to different IVs)
      expect(result1.encrypted).not.toEqual(result2.encrypted);
    });
    
    it('should not leak plaintext in encrypted output', async () => {
      const testData = Buffer.from('Secret password: admin123');
      const { encrypted } = await encryptFile(testData);
      
      // Encrypted data should not contain plaintext
      expect(encrypted.toString()).not.toContain('admin123');
      expect(encrypted.toString()).not.toContain('Secret');
    });
  });
});

