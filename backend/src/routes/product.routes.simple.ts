import { Router } from 'express';
import { getProduct } from '@/data/mock-products';

const router = Router();

/**
 * PUBLIC PRODUCT ROUTES - DRY & Database-free
 * Uses SHARED mock data source - changes from admin are visible here!
 */

// DRY helper - Prevents redundancy
const jsonResponse = (res: any, data: any) => {
  res.json({ success: true, data });
};

// Get all products
router.get('/', (req, res) => {
  const product = getProduct();
  jsonResponse(res, {
    products: [product],
    pagination: { page: 1, pageSize: 12, total: 1, totalPages: 1 },
  });
});

// Get featured products
router.get('/featured', (req, res) => {
  const product = getProduct();
  jsonResponse(res, [product]);
});

// Get product by slug - CRITICAL for product detail page
router.get('/slug/:slug', (req, res) => {
  const product = getProduct();
  jsonResponse(res, product);
});

// Get product by ID
router.get('/:id', (req, res) => {
  const product = getProduct();
  jsonResponse(res, product);
});

export default router;
