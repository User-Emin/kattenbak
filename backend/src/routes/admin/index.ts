import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import categoryRoutes from './category.routes';
import shipmentRoutes from './shipment.routes';
import uploadRoutes from './upload.routes';
import settingsRoutes from './settings.routes'; // NEW: Site Settings
import returnsRoutes from './returns.routes'; // NEW: Returns
import variantRoutes from './variants.routes'; // NEW: Product Variants
// REMOVED: products-video.routes (uses Prisma)

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
router.use('/upload', uploadRoutes); // NEW: File upload
router.use('/settings', settingsRoutes); // NEW: Site Settings
router.use('/returns', returnsRoutes); // NEW: Returns
router.use('/variants', variantRoutes); // NEW: Product Variants

export default router;
