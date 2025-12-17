import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { promises as fs } from 'fs';
import { Request } from 'express';

/**
 * Image & Video Upload Service - DRY & Optimized
 * Team Sparring Results:
 * 
 * 1. DevOps: Store in /public/uploads, CDN ready
 * 2. Security: Validate file types, size limits, sanitize names
 * 3. Performance: Automatic WebP conversion, resize, optimize
 * 4. Frontend: Multiple sizes (thumbnail, medium, large)
 * 5. Video: Accept MP4, MOV - serve as-is (browser-optimized)
 */

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];

// Image sizes - responsive optimization
const IMAGE_SIZES = {
  thumbnail: { width: 200, height: 200 },
  medium: { width: 800, height: 800 },
  large: { width: 1600, height: 1600 },
} as const;

/**
 * Multer configuration - secure file upload
 */
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    const sanitized = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-]/g, '_');
    cb(null, `${sanitized}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);
  
  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(', ')}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: MAX_VIDEO_SIZE, // Max for videos (images are smaller)
  },
});

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir(): Promise<void> {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Process uploaded image - convert to WebP + create sizes
 * DRY: Single function for all image processing
 */
export async function processImage(
  filePath: string,
  originalFilename: string
): Promise<{ thumbnail: string; medium: string; large: string; original: string }> {
  const nameWithoutExt = path.basename(originalFilename, path.extname(originalFilename));
  
  // Convert and resize to all sizes in parallel
  const [thumbnail, medium, large] = await Promise.all([
    convertToWebP(filePath, nameWithoutExt, IMAGE_SIZES.thumbnail),
    convertToWebP(filePath, nameWithoutExt, IMAGE_SIZES.medium),
    convertToWebP(filePath, nameWithoutExt, IMAGE_SIZES.large),
  ]);

  // Delete original uploaded file (we only keep WebP versions)
  try {
    await fs.unlink(filePath);
  } catch (err) {
    console.warn('Could not delete original file:', err);
  }

  return {
    thumbnail: `/uploads/${thumbnail}`,
    medium: `/uploads/${medium}`,
    large: `/uploads/${large}`,
    original: `/uploads/${large}`, // Use large as original
  };
}

/**
 * Convert image to WebP format with specified size
 */
async function convertToWebP(
  inputPath: string,
  nameWithoutExt: string,
  size: { width: number; height: number }
): Promise<string> {
  const outputFilename = `${nameWithoutExt}-${size.width}x${size.height}.webp`;
  const outputPath = path.join(UPLOAD_DIR, outputFilename);

  await sharp(inputPath)
    .resize(size.width, size.height, {
      fit: 'cover',
      position: 'center',
    })
    .webp({ quality: 85 })
    .toFile(outputPath);

  return outputFilename;
}

/**
 * Validate image dimensions (minimum size)
 */
export async function validateImageDimensions(filePath: string): Promise<boolean> {
  try {
    const metadata = await sharp(filePath).metadata();
    const minSize = 200; // Minimum 200x200

    return (
      metadata.width !== undefined &&
      metadata.height !== undefined &&
      metadata.width >= minSize &&
      metadata.height >= minSize
    );
  } catch {
    return false;
  }
}

/**
 * Delete image files (all sizes)
 */
export async function deleteImage(filename: string): Promise<void> {
  const nameWithoutExt = path.basename(filename, path.extname(filename));
  
  // Delete all sizes
  const filesToDelete = [
    `${nameWithoutExt}-${IMAGE_SIZES.thumbnail.width}x${IMAGE_SIZES.thumbnail.height}.webp`,
    `${nameWithoutExt}-${IMAGE_SIZES.medium.width}x${IMAGE_SIZES.medium.height}.webp`,
    `${nameWithoutExt}-${IMAGE_SIZES.large.width}x${IMAGE_SIZES.large.height}.webp`,
  ];

  await Promise.all(
    filesToDelete.map(async (file) => {
      try {
        await fs.unlink(path.join(UPLOAD_DIR, file));
      } catch {
        // Ignore errors (file might not exist)
      }
    })
  );
}
