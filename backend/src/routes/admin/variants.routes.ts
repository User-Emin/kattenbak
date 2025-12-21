/**
 * VARIANT ROUTES - Admin API
 */

import { Router } from 'express';
import { VariantController } from '@/controllers/admin/variant.controller';
import { authenticateAdmin } from '@/middleware/auth.middleware';

const router = Router();

// All routes require admin authentication
router.use(authenticateAdmin);

// GET /api/v1/admin/variants?productId=xxx - Get variants by product
router.get('/', VariantController.getVariantsByProduct);

// GET /api/v1/admin/variants/:id - Get variant by ID
router.get('/:id', VariantController.getVariantById);

// POST /api/v1/admin/variants - Create variant
router.post('/', VariantController.createVariant);

// PUT /api/v1/admin/variants/:id - Update variant
router.put('/:id', VariantController.updateVariant);

// DELETE /api/v1/admin/variants/:id - Delete variant
router.delete('/:id', VariantController.deleteVariant);

export default router;
