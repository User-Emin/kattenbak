import { Router } from 'express';
import { ProductController } from '@/controllers/product.controller';
import { validateRequest } from '@/middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// Validation schemas
const getProductsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    pageSize: z.string().optional().transform(val => val ? parseInt(val, 10) : 12),
    categoryId: z.string().optional(),
    isFeatured: z.string().optional().transform(val => val === 'true'),
    inStock: z.string().optional().transform(val => val === 'true'),
    minPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    maxPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    search: z.string().optional(),
    sortBy: z.enum(['name', 'price', 'createdAt', 'stock']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

const productIdSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid product ID'),
  }),
});

const productSlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Slug is required'),
  }),
});

// Public routes
router.get(
  '/',
  validateRequest(getProductsSchema),
  ProductController.getAllProducts
);

router.get(
  '/featured',
  ProductController.getFeaturedProducts
);

router.get(
  '/search',
  ProductController.searchProducts
);

router.get(
  '/slug/:slug',
  validateRequest(productSlugSchema),
  ProductController.getProductBySlug
);

router.get(
  '/:id',
  validateRequest(productIdSchema),
  ProductController.getProductById
);

export default router;
