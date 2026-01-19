import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './products.routes'; // ✅ FIX: Use database route, not mock route
import orderRoutes from './order.routes';
import categoryRoutes from './category.routes';
import shipmentRoutes from './shipment.routes';
import uploadRoutes from './upload.routes';
import settingsRoutes from './settings.routes'; // NEW: Site Settings
// REMOVED: returns.routes (uses MyParcel service -> database)
// REMOVED: variants.routes (uses variant.service -> database)
// REMOVED: products-video.routes (uses Prisma)

/**
 * ADMIN ROUTES INDEX - DRY & Complete
 * All resources voor React Admin dashboard
 */
const router = Router();

// DRY: Centralized route mounting
router.use('/auth', authRoutes);
// ✅ FIX: Use database route (products.routes), not mock route (product.routes)
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/categories', categoryRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/upload', uploadRoutes); // NEW: File upload
router.use('/settings', settingsRoutes); // NEW: Site Settings
// router.use('/returns', returnsRoutes); // DISABLED: Uses database
// router.use('/variants', variantRoutes); // DISABLED: Uses database

export default router;
