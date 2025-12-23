import { Router } from 'express';
import { authMiddleware, adminMiddleware, rateLimitMiddleware } from '../../middleware/auth.middleware';
import { upload, optimizeImage, deleteFile, getPublicUrl, validateFileSize } from '../../middleware/upload.middleware';

const router = Router();

/**
 * Security: ALL upload routes require authentication + admin role
 */
router.use(authMiddleware);
router.use(adminMiddleware);
router.use(rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 50 })); // Lower limit for uploads

/**
 * POST /api/v1/admin/upload/images
 * Upload multiple product images
 * Security:
 * - File type validation
 * - Size limits (10MB per file)
 * - Image optimization
 * - EXIF stripping
 * - UUID filenames
 */
router.post('/images', upload.array('images', 10), async (req, res) => {
  const uploadedFiles: Express.Multer.File[] = [];
  
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Geen bestanden geüpload'
      });
    }
    
    // Validate all files before processing
    for (const file of files) {
      if (!validateFileSize(file.size)) {
        // Clean up all uploaded files
        for (const f of files) {
          await deleteFile(f.path);
        }
        return res.status(400).json({
          success: false,
          error: `Bestand te groot: ${file.originalname} (max 10MB)`
        });
      }
      uploadedFiles.push(file);
    }
    
    // Process each image (optimize, strip EXIF)
    const processedFiles = await Promise.all(
      uploadedFiles.map(async (file) => {
        try {
          // Optimize image (security: strips EXIF, re-encodes)
          await optimizeImage(file.path);
          
          return {
            filename: file.filename,
            originalName: file.originalname,
            url: getPublicUrl(file.filename),
            size: file.size,
            mimetype: file.mimetype
          };
        } catch (error: any) {
          console.error(`Failed to process ${file.filename}:`, error);
          // Delete failed file
          await deleteFile(file.path);
          throw error;
        }
      })
    );
    
    // Audit log
    console.log(`[AUDIT] Images uploaded by admin: ${(req as any).user.email}`, {
      count: processedFiles.length,
      files: processedFiles.map(f => f.filename)
    });
    
    return res.json({
      success: true,
      data: processedFiles
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Clean up all uploaded files on error
    for (const file of uploadedFiles) {
      await deleteFile(file.path);
    }
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Fout bij uploaden afbeeldingen'
    });
  }
});

/**
 * POST /api/v1/admin/upload/video
 * Upload product video (hero or demo)
 * Security: Same as images but larger size limit (50MB)
 */
router.post('/video', upload.single('video'), async (req, res) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'Geen video geüpload'
      });
    }
    
    // TODO: Add video validation and optimization
    
    console.log(`[AUDIT] Video uploaded by admin: ${(req as any).user.email}`, {
      filename: file.filename,
      size: file.size
    });
    
    return res.json({
      success: true,
      data: {
        filename: file.filename,
        url: getPublicUrl(file.filename),
        size: file.size,
        mimetype: file.mimetype
      }
    });
  } catch (error: any) {
    console.error('Video upload error:', error);
    
    if (req.file) {
      await deleteFile(req.file.path);
    }
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Fout bij uploaden video'
    });
  }
});

/**
 * DELETE /api/v1/admin/upload/:filename
 * Delete uploaded file
 */
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security: Validate filename (no path traversal)
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        error: 'Ongeldige bestandsnaam'
      });
    }
    
    const filepath = `/var/www/uploads/products/${filename}`;
    await deleteFile(filepath);
    
    console.log(`[AUDIT] File deleted by admin: ${(req as any).user.email}`, {
      filename
    });
    
    return res.json({
      success: true,
      message: 'Bestand verwijderd'
    });
  } catch (error: any) {
    console.error('Delete file error:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij verwijderen bestand'
    });
  }
});

export default router;
