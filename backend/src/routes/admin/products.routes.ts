import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, adminMiddleware, rateLimitMiddleware } from '../../middleware/auth.middleware';
import { 
  ProductCreateSchema, 
  ProductUpdateSchema, 
  ProductQuerySchema,
  validateAndSanitizeProduct 
} from '../../validators/product.validator';
import { z } from 'zod';

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
          variants: {
            select: {
              id: true,
              name: true,
              colorName: true,
              stock: true,
              isActive: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);
    
    return res.json({
      success: true,
      data: products,
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
        variants: true,
        orderItems: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product niet gevonden'
      });
    }
    
    return res.json({
      success: true,
      data: product
    });
  } catch (error: any) {
    console.error('Get product error:', error);
    return res.status(500).json({
      success: false,
      error: 'Fout bij ophalen product'
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
    const product = await prisma.product.create({
      data: {
        ...data,
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
    
    return res.status(201).json({
      success: true,
      data: product
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
    
    // Update product
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...data,
        publishedAt: data.isActive === true && !existing.publishedAt 
          ? new Date() 
          : existing.publishedAt
      },
      include: {
        category: true,
        variants: true
      }
    });
    
    // Audit log
    console.log(`[AUDIT] Product updated by admin: ${(req as any).user.email}`, {
      productId: product.id,
      changes: Object.keys(data)
    });
    
    return res.json({
      success: true,
      data: product
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
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
