import { Router, Request, Response, NextFunction } from 'express';
import { upload, processImage, validateImageDimensions } from '../services/image.service';

const router = Router();

/**
 * Upload Single Image
 * POST /api/v1/upload/image
 * Returns: WebP optimized images (thumbnail, medium, large)
 */
router.post('/image', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // Validate dimensions for images
    if (req.file.mimetype.startsWith('image/')) {
      const isValid = await validateImageDimensions(req.file.path);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: 'Image must be at least 200x200 pixels',
        });
      }

      // Process image - convert to WebP
      const imageUrls = await processImage(req.file.path, req.file.filename);

      return res.json({
        success: true,
        data: {
          message: 'Image uploaded and optimized successfully',
          urls: imageUrls,
        },
      });
    }

    // For videos - just return the path
    const videoUrl = `/uploads/${req.file.filename}`;
    return res.json({
      success: true,
      data: {
        message: 'Video uploaded successfully',
        url: videoUrl,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Upload failed',
    });
  }
});

/**
 * Upload Multiple Images
 * POST /api/v1/upload/images
 * Max 5 images
 */
router.post('/images', upload.array('files', 5), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded',
      });
    }

    const processedImages = await Promise.all(
      req.files.map(async (file) => {
        if (file.mimetype.startsWith('image/')) {
          const isValid = await validateImageDimensions(file.path);
          if (!isValid) {
            throw new Error(`Image ${file.originalname} must be at least 200x200 pixels`);
          }
          return processImage(file.path, file.filename);
        }
        // Video
        return { url: `/uploads/${file.filename}` };
      })
    );

    return res.json({
      success: true,
      data: {
        message: `${processedImages.length} files uploaded successfully`,
        files: processedImages,
      },
    });
  } catch (error: any) {
    console.error('Multiple upload error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Upload failed',
    });
  }
});

export default router;
