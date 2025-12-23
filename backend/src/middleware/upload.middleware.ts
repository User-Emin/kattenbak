import multer from 'multer';
import sharp from 'sharp'; // IMAGE OPTIMIZATION - WebP conversion & compression
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { Request } from 'express';
import { encryptAndSaveFile } from '../utils/encryption.util'; // MEDIA ENCRYPTION

/**
 * SECURE IMAGE UPLOAD CONFIGURATION
 * Security measures:
 * - File type validation (MIME + extension)
 * - File size limits (10MB max)
 * - Unique filenames (UUID)
 * - Path traversal prevention
 * - Image optimization
 * - AES-256-GCM encryption at rest
 */

// Allowed image types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Allowed video types
const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
  'video/x-matroska' // .mkv
];

const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for images
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB for videos
const MAX_FILES = 10;
const UPLOAD_DIR = '/var/www/uploads/products';
const VIDEO_UPLOAD_DIR = '/var/www/uploads/videos';

// Ensure upload directory exists
const ensureUploadDir = async () => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(VIDEO_UPLOAD_DIR, { recursive: true });
    console.log('✅ Upload directory ready:', UPLOAD_DIR);
    console.log('✅ Video upload directory ready:', VIDEO_UPLOAD_DIR);
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
 * Image optimization with WebP auto-conversion + ENCRYPTION
 * - Resize to max 2400px (retina quality)
 * - Auto-rotate based on EXIF
 * - Strip EXIF metadata (security + privacy)
 * - Create WebP version (85% smaller than JPEG!)
 * - Compress original format as fallback
 * - Progressive JPEG for faster loading
 * - AES-256-GCM encryption at rest
 */
export const optimizeImage = async (filepath: string): Promise<string> => {
  try {
    const ext = path.extname(filepath).toLowerCase();
    const dir = path.dirname(filepath);
    const basename = path.basename(filepath, ext);
    
    // Create WebP version path
    const webpPath = path.join(dir, `${basename}.webp`);
    
    // Load image and validate
    const image = sharp(filepath);
    const metadata = await image.metadata();
    
    // Validate image format (security)
    if (!metadata.format || !['jpeg', 'png', 'webp'].includes(metadata.format)) {
      throw new Error('Invalid image format after loading');
    }
    
    // Auto-rotate and strip EXIF (security + privacy)
    let pipeline = image.rotate();
    
    // Resize if too large (max 2400px width for retina displays)
    if (metadata.width && metadata.width > 2400) {
      pipeline = pipeline.resize(2400, null, {
        fit: 'inside',
        withoutEnlargement: false
      });
    }
    
    // 🚀 CREATE WEBP VERSION (85% smaller, same quality!)
    const webpBuffer = await pipeline
      .clone() // Clone pipeline to reuse
      .webp({ quality: 85, effort: 6 }) // effort: 6 = good balance speed/size
      .toBuffer();
    
    // 🔒 ENCRYPT WebP and save
    await encryptAndSaveFile(webpBuffer, webpPath);
    
    console.log(`✅ WebP encrypted: ${path.basename(webpPath)} (${Math.round(webpBuffer.length / 1024)}KB)`);
    
    // Optimize original format as fallback for older browsers
    let optimizedBuffer: Buffer;
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        optimizedBuffer = await pipeline
          .jpeg({ quality: 85, progressive: true, mozjpeg: true })
          .toBuffer();
        break;
      case '.png':
        optimizedBuffer = await pipeline
          .png({ compressionLevel: 9, quality: 85, adaptiveFiltering: true })
          .toBuffer();
        break;
      case '.webp':
        // Already WebP, just optimize
        optimizedBuffer = await pipeline
          .webp({ quality: 85, effort: 6 })
          .toBuffer();
        break;
      default:
        throw new Error('Unsupported format');
    }
    
    // 🔒 ENCRYPT optimized original and save
    await encryptAndSaveFile(optimizedBuffer, filepath);
    
    const optimizedSize = Math.round(optimizedBuffer.length / 1024);
    console.log(`✅ Image encrypted: ${path.basename(filepath)} (${optimizedSize}KB)`);
    
    // Return WebP path for best performance (backend will serve this preferentially)
    return webpPath;
    
  } catch (error: any) {
    console.error('❌ Image optimization error:', error.message);
    // Clean up temp files
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
 * Get public URL for uploaded video
 */
export const getVideoPublicUrl = (filename: string): string => {
  return `/uploads/videos/${filename}`;
};

/**
 * Validate file size before processing
 */
export const validateFileSize = (size: number): boolean => {
  return size > 0 && size <= MAX_FILE_SIZE;
};

/**
 * Validate video file size
 */
export const validateVideoSize = (size: number): boolean => {
  return size > 0 && size <= MAX_VIDEO_SIZE;
};

/**
 * VIDEO UPLOAD CONFIGURATION
 * Security measures:
 * - File type validation (MIME + extension)
 * - File size limits (100MB max)
 * - Unique filenames (UUID)
 * - Path traversal prevention
 */

const videoStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(VIDEO_UPLOAD_DIR, { recursive: true });
      cb(null, VIDEO_UPLOAD_DIR);
    } catch (error: any) {
      cb(error, VIDEO_UPLOAD_DIR);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename with UUID
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

const videoFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check MIME type
  if (!ALLOWED_VIDEO_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`Ongeldig videobestandstype. Alleen MP4, WebM, MOV, AVI, MKV toegestaan. Ontvangen: ${file.mimetype}`));
  }
  
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_VIDEO_EXTENSIONS.includes(ext)) {
    return cb(new Error(`Ongeldige video extensie. Alleen ${ALLOWED_VIDEO_EXTENSIONS.join(', ')} toegestaan. Ontvangen: ${ext}`));
  }
  
  // Security: Prevent path traversal in filename
  const basename = path.basename(file.originalname);
  if (file.originalname !== basename) {
    return cb(new Error('Ongeldige bestandsnaam (path traversal detected)'));
  }
  
  cb(null, true);
};

export const videoUpload = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: MAX_VIDEO_SIZE,
    files: 1, // Only one video at a time
    fieldNameSize: 100,
    fieldSize: 1024 * 1024 // 1MB for field data
  }
});
