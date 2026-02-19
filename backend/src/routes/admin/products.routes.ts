import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, adminMiddleware, rateLimitMiddleware } from '../../middleware/auth.middleware';
import { 
  ProductCreateSchema, 
  ProductUpdateSchema, 
  ProductQuerySchema,
  validateAndSanitizeProduct 
} from '../../validators/product.validator';
import { logAuditAction } from '../../lib/audit';
import { transformProduct, transformProducts } from '../../lib/transformers';
import { deleteFile } from '../../middleware/upload.middleware';
import { z } from 'zod';
import path from 'path';

const router = Router();
const prisma = new PrismaClient();

/**
 * Security: ALL routes require authentication + admin role
 */
router.use(authMiddleware);
router.use(adminMiddleware);
router.use(rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 100 }));

/**
 * GET /api/v1/admin/products
 * Get all products with pagination and filters
 */
router.get('/', async (req, res) => {
  try {
    // Validate query parameters
    const query = ProductQuerySchema.parse(req.query);
    
    const skip = (query.page - 1) * query.pageSize;
    
    // Build where clause
    const where: any = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;
    
    // Execute queries in parallel
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          // ✅ FIX: Temporarily disabled - colorName column doesn't exist in database
          // variants: {
          //   select: {
          //     id: true,
          //     name: true,
          //     colorName: true,
          //     stock: true,
          //     isActive: true
          //   }
          // }
        }
      }),
      prisma.product.count({ where })
    ]);
    
    // Transform Decimal to number for frontend
    const transformed = transformProducts(products);
    
    return res.json({
      success: true,
      data: transformed,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize)
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Ongeldige parameters',
        details: error.errors
      });
    }
    
    console.error('Get products error:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij ophalen producten'
    });
  }
});

/**
 * GET /api/v1/admin/products/:id
 * Get single product by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
        // ✅ FIX: orderItems removed - not needed for admin product view and may cause errors
      }
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product niet gevonden'
      });
    }
    
    // Transform Decimal to number
    const transformed = transformProduct(product);
    
    return res.json({
      success: true,
      data: transformed
    });
  } catch (error: any) {
    console.error('Get product error:', error);
    console.error('Error details:', error.message, error.stack);
    return res.status(500).json({
      success: false,
      error: 'Fout bij ophalen product',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/v1/admin/products
 * Create new product
 * Security: Input validation, XSS prevention, SQL injection safe (Prisma)
 */
router.post('/', async (req, res) => {
  try {
    // Validate input
    let data = ProductCreateSchema.parse(req.body);
    
    // Sanitize HTML content (XSS prevention)
    data = validateAndSanitizeProduct(data);
    
    // Check if SKU already exists
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku }
    });
    
    if (existingSku) {
      return res.status(400).json({
        success: false,
        error: 'SKU bestaat al'
      });
    }
    
    // Check if slug already exists
    const existingSlug = await prisma.product.findUnique({
      where: { slug: data.slug }
    });
    
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        error: 'Slug bestaat al'
      });
    }
    
    // Create product
    // ✅ FIX: Explicit type casting for Prisma
    const product = await prisma.product.create({
      data: {
        ...(data as any),
        publishedAt: data.isActive ? new Date() : null
      },
      include: {
        category: true
      }
    });
    
    // Audit log
    console.log(`[AUDIT] Product created by admin: ${(req as any).user.email}`, {
      productId: product.id,
      sku: product.sku,
      name: product.name
    });
    
    // Transform Decimal to number
    const transformed = transformProduct(product);
    
    return res.status(201).json({
      success: true,
      data: transformed
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Ongeldige product data',
        details: error.errors
      });
    }
    
    console.error('Create product error:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij aanmaken product'
    });
  }
});

/**
 * PUT /api/v1/admin/products/:id
 * Update existing product
 */
router.put('/:id', async (req, res) => {
  try {
    // 🔍 DEBUG: Log incoming request body
    console.log('[PRODUCT UPDATE] Received payload:', JSON.stringify(req.body, null, 2));
    
    // Validate input
    let data = ProductUpdateSchema.parse(req.body);
    
    // Sanitize HTML content
    data = validateAndSanitizeProduct(data);
    
    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id: req.params.id }
    });
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Product niet gevonden'
      });
    }
    
    // Check SKU uniqueness if being updated
    if (data.sku && data.sku !== existing.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: data.sku }
      });
      
      if (existingSku) {
        return res.status(400).json({
          success: false,
          error: 'SKU bestaat al'
        });
      }
    }
    
    // Check slug uniqueness if being updated
    if (data.slug && data.slug !== existing.slug) {
      const existingSlug = await prisma.product.findUnique({
        where: { slug: data.slug }
      });
      
      if (existingSlug) {
        return res.status(400).json({
          success: false,
          error: 'Slug bestaat al'
        });
      }
    }
    
    // ✅ FIX: Cleanup oude images die niet meer gebruikt worden
    if (data.images && Array.isArray(data.images) && Array.isArray(existing.images)) {
      const oldImages = existing.images as string[];
      const newImages = data.images as string[];
      
      // Vind images die niet meer gebruikt worden
      const imagesToDelete = oldImages.filter(img => !newImages.includes(img));
      
      // Verwijder ongebruikte images van disk
      for (const imagePath of imagesToDelete) {
        try {
          // Extract filename from path (e.g., "/uploads/products/filename.jpg" -> "filename.jpg")
          const filename = imagePath.replace('/uploads/products/', '').replace('/uploads/', '');
          const filePath = path.join('/var/www/uploads/products', filename);
          
          await deleteFile(filePath);
          console.log(`[CLEANUP] Deleted unused image: ${filePath}`);
          
          // Also delete WebP variants if they exist
          const baseName = path.parse(filename).name;
          const variants = ['thumbnail', 'medium', 'large'];
          for (const variant of variants) {
            const variantPath = path.join('/var/www/uploads/products', `${baseName}-${variant}.webp`);
            try {
              await deleteFile(variantPath);
            } catch {
              // Variant might not exist, that's ok
            }
          }
        } catch (error) {
          console.warn(`[CLEANUP] Failed to delete image ${imagePath}:`, error);
          // Continue with other images even if one fails
        }
      }
    }
    
    // ✅ VARIANT SYSTEM: Handle variants separately (create/update/delete)
    if (data.variants && Array.isArray(data.variants)) {
      // Get existing variants
      const existingVariants = await prisma.productVariant.findMany({
        where: { productId: req.params.id }
      });
      
      const existingVariantIds = existingVariants.map(v => v.id);
      const incomingVariantIds = data.variants
        .filter((v: any) => v.id && v.id.startsWith('variant-') === false) // Exclude temporary IDs
        .map((v: any) => v.id);
      
      // Delete variants that are no longer in the list
      const variantsToDelete = existingVariantIds.filter(id => !incomingVariantIds.includes(id));
      if (variantsToDelete.length > 0) {
        await prisma.productVariant.deleteMany({
          where: {
            id: { in: variantsToDelete },
            productId: req.params.id
          }
        });
      }
      
      // Create/update variants
      for (const variantData of data.variants) {
        const { id, ...variantFields } = variantData as any;
        
        // ✅ VARIANT SYSTEM: Convert colorName to colorCode, extract colorImageUrl
        const colorCode = variantFields.colorCode || (variantFields.colorName ? variantFields.colorName.toUpperCase() : null);
        const colorImageUrl = variantFields.previewImage || variantFields.colorImageUrl || null;
        
        // ✅ SECURITY: Validate colorCode against whitelist
        const validColorCodes = ['WIT', 'ZWART', 'GRIJS', 'ZILVER', 'BEIGE', 'BLAUW', 'ROOD', 'GROEN', 'BRUIN'];
        if (colorCode && !validColorCodes.includes(colorCode)) {
          console.warn(`[VARIANT] Invalid colorCode: ${colorCode}, skipping variant`);
          continue;
        }
        
        // ✅ SECURITY: Validate colorImageUrl to prevent path traversal
        if (colorImageUrl && (colorImageUrl.includes('..') || colorImageUrl.includes('//'))) {
          console.warn(`[VARIANT] Invalid colorImageUrl: ${colorImageUrl}, skipping`);
          continue;
        }
        
        const variantPayload: any = {
          name: variantFields.name,
          colorCode: colorCode,
          colorImageUrl: colorImageUrl,
          priceAdjustment: variantFields.priceAdjustment || 0,
          sku: variantFields.sku,
          stock: variantFields.stock || 0,
          images: variantFields.images || [],
          isActive: variantFields.isActive !== false,
          sortOrder: variantFields.sortOrder || 0,
        };
        
        if (id && !id.startsWith('variant-') && existingVariantIds.includes(id)) {
          // Update existing variant
          await prisma.productVariant.update({
            where: { id },
            data: variantPayload
          });
        } else {
          // Create new variant
          await prisma.productVariant.create({
            data: {
              ...variantPayload,
              productId: req.params.id
            }
          });
        }
      }
      
      // Remove variants from data to prevent Prisma from trying to update them directly
      delete (data as any).variants;
    }
    
    // Extract categoryId separately to avoid type conflicts
    const { categoryId, ...updateData } = data as any;
    const updatePayload: any = {
      ...updateData,
      publishedAt: data.isActive === true && !existing.publishedAt 
        ? new Date() 
        : existing.publishedAt
    };

    // Ensure howItWorksImages persists (productbewerking → productdetail)
    if ((data as any).howItWorksImages !== undefined) {
      updatePayload.howItWorksImages = (data as any).howItWorksImages;
    }
    
    // Only include categoryId if it's actually being updated
    if (categoryId) {
      updatePayload.categoryId = categoryId;
    }
    
    // Update product
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: updatePayload,
      include: {
        category: true,
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    
    // Audit log
    console.log(`[AUDIT] Product updated by admin: ${(req as any).user.email}`, {
      productId: product.id,
      changes: Object.keys(data)
    });
    
    // Transform Decimal to number
    const transformed = transformProduct(product);
    
    return res.json({
      success: true,
      data: transformed
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      // 🔍 DEBUG: Log Zod validation errors
      console.error('[PRODUCT UPDATE] Zod validation failed:', JSON.stringify(error.errors, null, 2));
      console.error('[PRODUCT UPDATE] Received body:', JSON.stringify(req.body, null, 2));
      
      return res.status(400).json({
        success: false,
        error: 'Ongeldige product data',
        details: error.errors
      });
    }
    
    console.error('Update product error:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij bijwerken product'
    });
  }
});

/**
 * DELETE /api/v1/admin/products/:id
 * Soft delete product (set isActive = false)
 * Security: Soft delete preserves data integrity
 */
router.delete('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product niet gevonden'
      });
    }
    
    // Soft delete
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { 
        isActive: false,
        updatedAt: new Date()
      }
    });
    
    // Audit log
    console.log(`[AUDIT] Product deleted by admin: ${(req as any).user.email}`, {
      productId: updated.id,
      sku: updated.sku
    });
    
    return res.json({
      success: true,
      message: 'Product gedeactiveerd',
      data: updated
    });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij verwijderen product'
    });
  }
});

export default router;
