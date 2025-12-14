/**
 * FILE UPLOAD ROUTES - DRY Backend Handler
 * Transparant: Receive files → Save to disk → Return public URLs
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const router = Router();

// DRY: Configure upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// DRY: Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// DRY: File filter - images only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Alleen afbeeldingen zijn toegestaan (jpg, png, gif, webp)'));
  }
};

// DRY: Upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

/**
 * POST /admin/upload
 * Upload single file
 */
router.post('/', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Geen bestand geüpload',
    });
  }

  // Return public URL
  const publicUrl = `/uploads/${req.file.filename}`;

  res.json({
    success: true,
    data: {
      url: publicUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

/**
 * POST /admin/upload/multiple
 * Upload multiple files
 */
router.post('/multiple', upload.array('files', 10), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Geen bestanden geüpload',
    });
  }

  // Return public URLs
  const uploadedFiles = files.map(file => ({
    url: `/uploads/${file.filename}`,
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
  }));

  res.json({
    success: true,
    data: uploadedFiles,
  });
});

export default router;




