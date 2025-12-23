import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, adminMiddleware, rateLimitMiddleware } from '../../middleware/auth.middleware';
import { ProductVariantCreateSchema, ProductVariantUpdateSchema } from '../../validators/product.validator';
import { transformVariant } from '../../lib/transformers';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Security: Auth + Admin required
router.use(authMiddleware);
router.use(adminMiddleware);
router.use(rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 100 }));

/**
 * GET /api/v1/admin/variants
 * Get all product variants
 */
router.get('/', async (req, res) => {
  try {
    const { productId } = req.query;
    
    const where: any = {};
    if (productId) where.productId = productId;
    
    const variants = await prisma.productVariant.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Transform Decimal to number
    const transformed = transformVariants(variants);
    
    return res.json({
      success: true,
      data: transformed
    });
  } catch (error: any) {
    console.error('Get variants error:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij ophalen varianten'
    });
  }
});

/**
 * GET /api/v1/admin/variants/:id
 * Get single variant
 */
router.get('/:id', async (req, res) => {
  try {
    const variant = await prisma.productVariant.findUnique({
      where: { id: req.params.id },
      include: {
        product: true
      }
    });
    
    if (!variant) {
      return res.status(404).json({
        success: false,
        error: 'Variant niet gevonden'
      });
    }
    
    // Transform Decimal to number
    const transformed = transformVariant(variant);
    
    return res.json({
      success: true,
      data: transformed
    });
  } catch (error: any) {
    console.error('Get variant error:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij ophalen variant'
    });
  }
});

/**
 * POST /api/v1/admin/variants
 * Create new product variant
 */
router.post('/', async (req, res) => {
  try {
    const data = ProductVariantCreateSchema.parse(req.body);
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId }
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product niet gevonden'
      });
    }
    
    // Check SKU uniqueness
    const existingSku = await prisma.productVariant.findUnique({
      where: { sku: data.sku }
    });
    
    if (existingSku) {
      return res.status(400).json({
        success: false,
        error: 'Variant SKU bestaat al'
      });
    }
    
    // Create variant
    const variant = await prisma.productVariant.create({
      data,
      include: {
        product: true
      }
    });
    
    console.log(`[AUDIT] Variant created by admin: ${(req as any).user.email}`, {
      variantId: variant.id,
      productId: data.productId
    });
    
    // Transform Decimal to number
    const transformed = transformVariant(variant);
    
    return res.status(201).json({
      success: true,
      data: transformed
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Ongeldige variant data',
        details: error.errors
      });
    }
    
    console.error('Create variant error:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij aanmaken variant'
    });
  }
});

/**
 * PUT /api/v1/admin/variants/:id
 * Update variant
 */
router.put('/:id', async (req, res) => {
  try {
    const data = ProductVariantUpdateSchema.parse(req.body);
    
    const existing = await prisma.productVariant.findUnique({
      where: { id: req.params.id }
    });
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Variant niet gevonden'
      });
    }
    
    // Check SKU uniqueness if updating
    if (data.sku && data.sku !== existing.sku) {
      const existingSku = await prisma.productVariant.findUnique({
        where: { sku: data.sku }
      });
      
      if (existingSku) {
        return res.status(400).json({
          success: false,
          error: 'Variant SKU bestaat al'
        });
      }
    }
    
    const variant = await prisma.productVariant.update({
      where: { id: req.params.id },
      data,
      include: {
        product: true
      }
    });
    
    console.log(`[AUDIT] Variant updated by admin: ${(req as any).user.email}`, {
      variantId: variant.id
    });
    
    // Transform Decimal to number
    const transformed = transformVariant(variant);
    
    return res.json({
      success: true,
      data: transformed
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Ongeldige variant data',
        details: error.errors
      });
    }
    
    console.error('Update variant error:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij bijwerken variant'
    });
  }
});

/**
 * DELETE /api/v1/admin/variants/:id
 * Soft delete variant
 */
router.delete('/:id', async (req, res) => {
  try {
    const variant = await prisma.productVariant.findUnique({
      where: { id: req.params.id }
    });
    
    if (!variant) {
      return res.status(404).json({
        success: false,
        error: 'Variant niet gevonden'
      });
    }
    
    const updated = await prisma.productVariant.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });
    
    console.log(`[AUDIT] Variant deleted by admin: ${(req as any).user.email}`, {
      variantId: updated.id
    });
    
    return res.json({
      success: true,
      message: 'Variant gedeactiveerd',
      data: updated
    });
  } catch (error: any) {
    console.error('Delete variant error:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij verwijderen variant'
    });
  }
});

export default router;
