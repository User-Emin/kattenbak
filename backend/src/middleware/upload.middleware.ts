import multer from 'multer';
// import sharp from 'sharp'; // TEMP DISABLED - Will add after backend is stable
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { Request } from 'express';

/**
 * SECURE IMAGE UPLOAD CONFIGURATION
 * Security measures:
 * - File type validation (MIME + extension)
 * - File size limits (10MB max)
 * - Unique filenames (UUID)
 * - Path traversal prevention
 * - Image optimization
 */

// Allowed image types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 10;
const UPLOAD_DIR = '/var/www/uploads/products';

// Ensure upload directory exists
const ensureUploadDir = async () => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    console.log('✅ Upload directory ready:', UPLOAD_DIR);
  } catch (error) {
    console.error('❌ Error creating upload directory:', error);
  }
};

ensureUploadDir();

/**
 * Storage configuration
 * Security: UUID filenames prevent path traversal and collision
 */
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      cb(null, UPLOAD_DIR);
    } catch (error: any) {
      cb(error, UPLOAD_DIR);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename with UUID
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

/**
 * File filter
 * Security: Validates MIME type AND file extension
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`Ongeldig bestandstype. Alleen JPEG, PNG en WebP toegestaan. Ontvangen: ${file.mimetype}`));
  }
  
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`Ongeldige extensie. Alleen ${ALLOWED_EXTENSIONS.join(', ')} toegestaan. Ontvangen: ${ext}`));
  }
  
  // Security: Prevent path traversal in filename
  const basename = path.basename(file.originalname);
  if (file.originalname !== basename) {
    return cb(new Error('Ongeldige bestandsnaam (path traversal detected)'));
  }
  
  cb(null, true);
};

/**
 * Multer configuration
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
    // Additional limits for security
    fieldNameSize: 100,
    fieldSize: 1024 * 1024, // 1MB for field data
    fields: 10
  }
});

/**
 * Image optimization
 * TEMP: Disabled sharp optimization - will add back after backend is stable
 * Security: Re-processes image to strip EXIF data and malicious content
 */
export const optimizeImage = async (filepath: string): Promise<void> => {
  try {
    // TEMP: Skip optimization, just log success
    // TODO: Re-enable sharp optimization after npm install --os=linux --cpu=x64 sharp
    console.log('⚠️ Image uploaded (optimization disabled):', path.basename(filepath));
    return;
    
    /* ORIGINAL CODE - RE-ENABLE AFTER SHARP FIX
    const ext = path.extname(filepath).toLowerCase();
    const tempPath = `${filepath}.tmp`;
    
    // Load image and strip EXIF data (security)
    const image = sharp(filepath);
    const metadata = await image.metadata();
    
    // Validate image is actually an image
    if (!metadata.format || !['jpeg', 'png', 'webp'].includes(metadata.format)) {
      throw new Error('Invalid image format after loading');
    }
    
    // Resize if too large (max 2400px width)
    let pipeline = image.rotate(); // Auto-rotate based on EXIF
    
    if (metadata.width && metadata.width > 2400) {
      pipeline = pipeline.resize(2400, null, {
        fit: 'inside',
        withoutEnlargement: false
      });
    }
    
    // Optimize based on format
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        await pipeline
          .jpeg({ quality: 85, progressive: true })
          .toFile(tempPath);
        break;
      case '.png':
        await pipeline
          .png({ compressionLevel: 9, quality: 85 })
          .toFile(tempPath);
        break;
      case '.webp':
        await pipeline
          .webp({ quality: 85 })
          .toFile(tempPath);
        break;
      default:
        throw new Error('Unsupported format');
    }
    
    // Replace original with optimized
    await fs.unlink(filepath);
    await fs.rename(tempPath, filepath);
    
    console.log('✅ Image optimized:', path.basename(filepath));
    */
  } catch (error: any) {
    console.error('❌ Image optimization error:', error.message);
    // Clean up temp file if exists
    try {
      await fs.unlink(`${filepath}.tmp`);
    } catch {}
    throw error;
  }
};

/**
 * Delete uploaded file
 * Used for cleanup on error
 */
export const deleteFile = async (filepath: string): Promise<void> => {
  try {
    await fs.unlink(filepath);
    console.log('🗑️  File deleted:', path.basename(filepath));
  } catch (error: any) {
    console.error('❌ Error deleting file:', error.message);
  }
};

/**
 * Get public URL for uploaded file
 */
export const getPublicUrl = (filename: string): string => {
  return `/uploads/products/${filename}`;
};

/**
 * Validate file size before processing
 */
export const validateFileSize = (size: number): boolean => {
  return size > 0 && size <= MAX_FILE_SIZE;
};
