import { Router } from 'express';
import { upload, processImage, validateImageDimensions } from '@/services/image.service';
import { successResponse } from '@/utils/response.util';
import { Request, Response, NextFunction } from 'express';

const router = Router();

/**
 * Upload Product Image
 * POST /api/v1/upload/product
 * 
 * Returns multiple optimized sizes:
 * - thumbnail (200x200) - for cards, lists
 * - medium (600x600) - for product pages
 * - large (1200x1200) - for zoom/lightbox
 */
router.post('/product', upload.single('image'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
      });
    }

    // Validate dimensions
    const isValid = await validateImageDimensions(req.file.path);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Image must be at least 400x400 pixels',
      });
    }

    // Process image - convert to WebP + create sizes
    const imageUrls = await processImage(req.file.path, req.file.filename);

    res.json(successResponse({
      message: 'Image uploaded successfully',
      images: imageUrls,
      sizes: {
        thumbnail: '200x200 (WebP)',
        medium: '600x600 (WebP)',
        large: '1200x1200 (WebP)',
      },
    }));
  } catch (error) {
    next(error);
  }
});

/**
 * Upload Multiple Images
 * POST /api/v1/upload/products
 * Max 5 images per request
 */
router.post('/products', upload.array('images', 5), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No image files provided',
      });
    }

    const processedImages = await Promise.all(
      req.files.map(async (file) => {
        const isValid = await validateImageDimensions(file.path);
        if (!isValid) {
          throw new Error(`Image ${file.originalname} must be at least 400x400 pixels`);
        }

        return processImage(file.path, file.filename);
      })
    );

    res.json(successResponse({
      message: `${processedImages.length} images uploaded successfully`,
      images: processedImages,
    }));
  } catch (error) {
    next(error);
  }
});

export default router;
