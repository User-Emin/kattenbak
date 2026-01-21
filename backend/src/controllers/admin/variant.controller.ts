/**
 * VARIANT CONTROLLER - Admin endpoints
 * DRY, secure, type-safe
 */

import { Request, Response, NextFunction } from 'express';
import { VariantService, CreateVariantData } from '../../services/variant.service';
import { successResponse } from '../../utils/response.util';
import { extractStringParam } from '../../utils/params.util';
import { z } from 'zod';

// DRY: Validation schemas
const createVariantSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  colorName: z.string().min(1),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  priceAdjustment: z.number(),
  sku: z.string().min(1),
  stock: z.number().int().min(0),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

const updateVariantSchema = z.object({
  name: z.string().min(1).optional(),
  colorName: z.string().min(1).optional(),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  priceAdjustment: z.number().optional(),
  sku: z.string().min(1).optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export class VariantController {
  /**
   * GET /api/v1/admin/variants?productId=xxx
   * Get variants by product ID
   */
  static async getVariantsByProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId } = req.query;

      if (!productId || typeof productId !== 'string') {
        res.status(400).json({ error: 'productId is required' });
        return;
      }

      const variants = await VariantService.getVariantsByProductId(productId);

      successResponse(res, { variants });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/variants/:id
   * Get variant by ID
   */
  static async getVariantById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = extractStringParam(req.params.id, 'id');
      const variant = await VariantService.getVariantById(id);

      successResponse(res, variant);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/admin/variants
   * Create new variant
   */
  static async createVariant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createVariantSchema.parse(req.body);
      // ✅ FIX: Ensure productId is present (required by CreateVariantData)
      if (!parsed.productId) {
        throw new Error('productId is required');
      }
      const data = parsed as CreateVariantData;
      const variant = await VariantService.createVariant(data);

      successResponse(res, variant, 'Variant created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/admin/variants/:id
   * Update variant
   */
  static async updateVariant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = extractStringParam(req.params.id, 'id');
      const data = updateVariantSchema.parse(req.body);
      const variant = await VariantService.updateVariant(id, data);

      successResponse(res, variant);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/admin/variants/:id
   * Delete variant
   */
  static async deleteVariant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = extractStringParam(req.params.id, 'id');
      await VariantService.deleteVariant(id);

      successResponse(res, { success: true }, 'Variant deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
