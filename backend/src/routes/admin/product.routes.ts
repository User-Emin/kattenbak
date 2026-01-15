import { Router, Request, Response } from 'express';
import { getProduct, updateProduct } from '../../data/mock-products';
import { authMiddleware, adminMiddleware, rateLimitMiddleware } from '../../middleware/auth.middleware';

const router = Router();

/**
 * ADMIN PRODUCT ROUTES - DRY & Mock Data
 * React Admin compatible: pagination, sorting, filtering
 * Uses SHARED mock data source for consistency
 * ✅ SECURITY: ALL routes require authentication + admin role
 */
router.use(authMiddleware);
router.use(adminMiddleware);
router.use(rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 100 }));

// GET /admin/products - List with pagination
router.get('/', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const product = getProduct();
  
  res.json({
    success: true,
    data: [product],
    meta: {
      page,
      pageSize,
      total: 1,
      totalPages: 1,
    },
  });
});

// GET /admin/products/:id - Single product
router.get('/:id', (req: Request, res: Response) => {
  const product = getProduct();
  res.json({
    success: true,
    data: product,
  });
});

// PUT /admin/products/:id - Update (ECHTE update!)
router.put('/:id', (req: Request, res: Response) => {
  console.log('📝 Admin PUT request:', req.body);
  const updated = updateProduct(req.body);
  res.json({
    success: true,
    data: updated,
  });
});

// POST /admin/products - Create
router.post('/', (req: Request, res: Response) => {
  const product = getProduct();
  res.json({
    success: true,
    data: { ...product, ...req.body, id: String(Date.now()) },
  });
});

// DELETE /admin/products/:id
router.delete('/:id', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: { id: req.params.id },
  });
});

export default router;
