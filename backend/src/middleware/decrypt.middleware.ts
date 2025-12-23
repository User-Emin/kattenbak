/**
 * MEDIA DECRYPTION MIDDLEWARE
 * Transparently decrypts encrypted media files on-the-fly
 * 
 * Security:
 * - Files stored encrypted at rest (AES-256-GCM)
 * - Decrypted only when served (in-memory)
 * - No plaintext files on disk
 * - Cache-Control headers for performance
 */

import { Request, Response, NextFunction } from 'express';
import { loadAndDecryptFile } from '../utils/encryption.util';
import path from 'path';
import fs from 'fs/promises';

/**
 * Decrypt and serve encrypted media files
 * Usage: app.get('/uploads/*', decryptMediaMiddleware, (req, res) => ...)
 */
export async function decryptMediaMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get file path from URL
    const requestPath = req.path.replace('/uploads/', '');
    const filePath = path.join('/var/www/uploads', requestPath);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return next(); // File doesn't exist, let Next.js handle 404
    }
    
    // 🔓 DECRYPT FILE
    const decryptedBuffer = await loadAndDecryptFile(filePath);
    
    // Determine content type from extension
    const ext = path.extname(filePath).toLowerCase();
    const contentType = getContentType(ext);
    
    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', decryptedBuffer.length);
    
    // Cache for 1 year (files have UUID names, immutable)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Send decrypted file
    res.send(decryptedBuffer);
  } catch (error) {
    console.error('Media decryption error:', error);
    
    // Don't expose encryption errors to client
    res.status(500).json({
      success: false,
      message: 'Failed to load media file'
    });
  }
}

/**
 * Get MIME type from file extension
 */
function getContentType(ext: string): string {
  const types: Record<string, string> = {
    // Images
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    
    // Videos
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    
    // Default
    default: 'application/octet-stream'
  };
  
  return types[ext] || types.default;
}

/**
 * Health check for encryption system
 * Add to routes: app.get('/api/health/encryption', encryptionHealthCheck)
 */
export async function encryptionHealthCheck(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { verifyEncryptionSetup } = await import('../utils/encryption.util');
    const isHealthy = await verifyEncryptionSetup();
    
    if (isHealthy) {
      res.json({
        success: true,
        status: 'healthy',
        encryption: 'AES-256-GCM',
        message: 'Media encryption system operational'
      });
    } else {
      throw new Error('Encryption verification failed');
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      message: 'Encryption system error'
    });
  }
}

