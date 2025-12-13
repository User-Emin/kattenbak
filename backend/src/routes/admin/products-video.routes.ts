// DRY: Product Admin Interface - Video URL Management
// Backend endpoint voor admin product updates

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * PATCH /api/v1/admin/products/:id/video
 * Update product video URL (Admin only)
 */
router.patch('/:id/video', async (req, res) => {
  try {
    const { id } = req.params;
    const { videoUrl } = req.body;

    // Validate YouTube/Vimeo URL
    if (videoUrl && !isValidVideoUrl(videoUrl)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid video URL. Must be YouTube or Vimeo URL.'
      });
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: { videoUrl: videoUrl || null },
      include: { category: true }
    });

    res.json({
      success: true,
      data: product
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Video URL validation helper
function isValidVideoUrl(url: string): boolean {
  const youtubeRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
  return youtubeRegex.test(url) || vimeoRegex.test(url);
}

export default router;
