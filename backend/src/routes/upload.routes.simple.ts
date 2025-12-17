import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';

const router = Router();

/**
 * SIMPLE FILE UPLOAD - ZONDER SHARP
 * Voor video's en afbeeldingen zonder conversie
 * Team Sparring: Defensive - werkt altijd, geen dependencies
 */

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// Ensure upload directory exists
async function ensureUploadDir(): Promise<void> {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    console.log('✅ Created upload directory:', UPLOAD_DIR);
  }
}

// Multer configuration - simple storage
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
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/quicktime', 'video/webm'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

/**
 * Upload Single File (Image or Video)
 * POST /api/v1/upload/image
 */
router.post('/image', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    console.log(`✅ File uploaded: ${req.file.originalname} → ${fileUrl}`);

    return res.json({
      success: true,
      data: {
        message: 'File uploaded successfully',
        url: fileUrl,
        urls: {
          thumbnail: fileUrl,
          medium: fileUrl,
          large: fileUrl,
          original: fileUrl,
        },
      },
    });
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Upload failed',
    });
  }
});

/**
 * Upload Multiple Files
 * POST /api/v1/upload/images
 */
router.post('/images', upload.array('files', 5), async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded',
      });
    }

    const uploadedFiles = req.files.map((file) => ({
      url: `/uploads/${file.filename}`,
      originalName: file.originalname,
    }));

    console.log(`✅ ${uploadedFiles.length} files uploaded`);

    return res.json({
      success: true,
      data: {
        message: `${uploadedFiles.length} files uploaded successfully`,
        files: uploadedFiles,
      },
    });
  } catch (error: any) {
    console.error('❌ Multiple upload error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Upload failed',
    });
  }
});

export default router;

