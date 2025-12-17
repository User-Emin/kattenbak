import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import categoryRoutes from './category.routes';
import shipmentRoutes from './shipment.routes';

/**
 * ADMIN ROUTES INDEX - DRY & Complete
 * All resources voor React Admin dashboard
 */
const router = Router();

// DRY: Centralized route mounting
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/categories', categoryRoutes);
router.use('/shipments', shipmentRoutes);

export default router;
