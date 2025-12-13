import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { promises as fs } from 'fs';
import { Request } from 'express';

/**
 * Image Upload Service - DRY & Optimized
 * Team Sparring Results:
 * 
 * 1. DevOps: Store in /uploads, met CDN ready structuur
 * 2. Security: Validate file types, size limits, sanitize names
 * 3. Performance: Automatic WebP conversion, resize, optimize
 * 4. Frontend: Multiple sizes (thumbnail, medium, large)
 */

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Image sizes - responsive optimization
const IMAGE_SIZES = {
  thumbnail: { width: 200, height: 200 },
  medium: { width: 600, height: 600 },
  large: { width: 1200, height: 1200 },
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
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitized}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
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
 * Process image - convert to WebP + create multiple sizes
 * Returns URLs for all sizes
 */
export async function processImage(
  filePath: string,
  filename: string
): Promise<{
  thumbnail: string;
  medium: string;
  large: string;
  original: string;
}> {
  const baseFilename = path.parse(filename).name;
  const results: any = { original: `/uploads/${filename}` };

  for (const [size, dimensions] of Object.entries(IMAGE_SIZES)) {
    const outputFilename = `${baseFilename}-${size}.webp`;
    const outputPath = path.join(UPLOAD_DIR, outputFilename);

    await sharp(filePath)
      .resize(dimensions.width, dimensions.height, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 85, effort: 6 })
      .toFile(outputPath);

    results[size] = `/uploads/${outputFilename}`;
  }

  // Delete original if not WebP
  if (!filename.endsWith('.webp')) {
    await fs.unlink(filePath);
  }

  return results;
}

/**
 * Delete image and all its sizes
 */
export async function deleteImage(filename: string): Promise<void> {
  const baseFilename = path.parse(filename).name;
  
  // Delete all sizes
  for (const size of Object.keys(IMAGE_SIZES)) {
    const filepath = path.join(UPLOAD_DIR, `${baseFilename}-${size}.webp`);
    try {
      await fs.unlink(filepath);
    } catch {
      // File might not exist, that's ok
    }
  }

  // Delete original
  try {
    await fs.unlink(path.join(UPLOAD_DIR, filename));
  } catch {
    // File might not exist
  }
}

/**
 * Validate image dimensions
 */
export async function validateImageDimensions(
  filePath: string,
  minWidth: number = 400,
  minHeight: number = 400
): Promise<boolean> {
  const metadata = await sharp(filePath).metadata();
  
  if (!metadata.width || !metadata.height) {
    return false;
  }

  return metadata.width >= minWidth && metadata.height >= minHeight;
}
