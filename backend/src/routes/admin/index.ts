import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import categoryRoutes from './category.routes';
import shipmentRoutes from './shipment.routes';
import returnsRoutes from './returns.routes';
import { authenticate, adminOnly } from '@/middleware/auth.middleware';

/**
 * ADMIN ROUTES INDEX - DRY & Complete with SECURITY
 * All resources voor React Admin dashboard
 */
const router = Router();

// Public: Auth routes (login)
router.use('/auth', authRoutes);

// 🔒 PROTECTED: All other admin routes require authentication + admin role
router.use('/products', authenticate, adminOnly, productRoutes);
router.use('/orders', authenticate, adminOnly, orderRoutes);
router.use('/categories', authenticate, adminOnly, categoryRoutes);
router.use('/shipments', authenticate, adminOnly, shipmentRoutes);
router.use('/returns', authenticate, adminOnly, returnsRoutes);

export default router;
