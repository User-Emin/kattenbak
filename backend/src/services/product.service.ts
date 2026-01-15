import { prisma } from '../config/database.config';
import { Product, Prisma } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errors.util';
import { ProductFilters, PaginationParams } from '../types';
import { logger } from '../config/logger.config';
import { redis, RedisClient } from '../config/redis.config';

/**
 * Enterprise Product Service
 * Handles all product-related business logic
 */
export class ProductService {
  private static readonly CACHE_TTL = 300; // 5 minutes
  private static readonly CACHE_PREFIX = 'product:';

  /**
   * Get all products with filters and pagination
   */
  static async getAllProducts(
    filters: ProductFilters = {},
    pagination: PaginationParams
  ): Promise<{ products: Product[]; total: number }> {
    const { page, pageSize, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.isFeatured !== undefined && { isFeatured: filters.isFeatured }),
      ...(filters.inStock && { stock: { gt: 0 } }),
      ...(filters.minPrice && { price: { gte: filters.minPrice } }),
      ...(filters.maxPrice && { price: { lte: filters.maxPrice } }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { sku: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    // Execute queries in parallel
    // ✅ FIX: Use select to avoid hero_video_url column that doesn't exist in database
    const [productsRaw, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          sku: true,
          name: true,
          slug: true,
          description: true,
          shortDescription: true,
          price: true,
          compareAtPrice: true,
          costPrice: true,
          stock: true,
          lowStockThreshold: true,
          trackInventory: true,
          weight: true,
          dimensions: true,
          images: true,
          videoUrl: true,
          // heroVideoUrl: false, // ✅ FIX: Exclude hero_video_url - column doesn't exist in DB
          metaTitle: true,
          metaDescription: true,
          isActive: true,
          isFeatured: true,
          createdAt: true,
          updatedAt: true,
          publishedAt: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // ✅ FIX: Add heroVideoUrl: null to match Product type (field doesn't exist in DB)
    const products = productsRaw.map(p => ({ ...p, heroVideoUrl: null })) as Product[];

    return { products, total };
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: string): Promise<Product> {
    // Try cache first
    if (RedisClient.isAvailable()) {
      const cached = await redis?.get(`${this.CACHE_PREFIX}${id}`);
      if (cached) {
        logger.debug(`Product ${id} served from cache`);
        const parsed = JSON.parse(cached);
        // ✅ FIX: Ensure heroVideoUrl is null if missing
        return { ...parsed, heroVideoUrl: parsed.heroVideoUrl || null } as Product;
      }
    }

    // ✅ FIX: Use select to avoid hero_video_url column that doesn't exist in database
    // Explicitly select only fields that exist to prevent Prisma errors
    const productRaw = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        sku: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        price: true,
        compareAtPrice: true,
        costPrice: true,
        stock: true,
        lowStockThreshold: true,
        trackInventory: true,
        weight: true,
        dimensions: true,
        images: true,
        videoUrl: true, // Keep videoUrl if it exists
        // heroVideoUrl: false, // ✅ FIX: Exclude hero_video_url - column doesn't exist in DB
        metaTitle: true,
        metaDescription: true,
        isActive: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            parentId: true,
            sortOrder: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    // ✅ FIX: Add heroVideoUrl: null to match Product type (field doesn't exist in DB)
    const product = productRaw ? { ...productRaw, heroVideoUrl: null } as Product : null;

    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    if (!product.isActive) {
      throw new NotFoundError('Product is not available');
    }

    // Cache the result
    if (RedisClient.isAvailable()) {
      await redis?.setex(
        `${this.CACHE_PREFIX}${id}`,
        this.CACHE_TTL,
        JSON.stringify(product)
      );
    }

    return product;
  }

  /**
   * Get product by slug
   */
  static async getProductBySlug(slug: string): Promise<Product> {
    // ✅ FIX: Use same select pattern to avoid hero_video_url column
    const productRaw = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        sku: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        price: true,
        compareAtPrice: true,
        costPrice: true,
        stock: true,
        lowStockThreshold: true,
        trackInventory: true,
        weight: true,
        dimensions: true,
        images: true,
        videoUrl: true,
        // heroVideoUrl: false, // ✅ FIX: Exclude hero_video_url - column doesn't exist in DB
        metaTitle: true,
        metaDescription: true,
        isActive: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            parentId: true,
            sortOrder: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    // ✅ FIX: Add heroVideoUrl: null to match Product type (field doesn't exist in DB)
    const product = productRaw ? { ...productRaw, heroVideoUrl: null } as Product : null;

    if (!product) {
      throw new NotFoundError(`Product with slug ${slug} not found`);
    }

    if (!product.isActive) {
      throw new NotFoundError('Product is not available');
    }

    return product;
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    // ✅ FIX: Use select to avoid hero_video_url column
    const productsRaw = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        sku: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        price: true,
        compareAtPrice: true,
        costPrice: true,
        stock: true,
        lowStockThreshold: true,
        trackInventory: true,
        weight: true,
        dimensions: true,
        images: true,
        videoUrl: true,
        // heroVideoUrl: false, // ✅ FIX: Exclude hero_video_url - column doesn't exist in DB
        metaTitle: true,
        metaDescription: true,
        isActive: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // ✅ FIX: Add heroVideoUrl: null to match Product type (field doesn't exist in DB)
    return productsRaw.map(p => ({ ...p, heroVideoUrl: null })) as Product[];
  }

  /**
   * Create product (admin only)
   */
  static async createProduct(data: Prisma.ProductCreateInput): Promise<Product> {
    // Validate SKU uniqueness
    const existing = await prisma.product.findUnique({
      where: { sku: data.sku },
      select: { id: true }, // ✅ FIX: Only select id for existence check
    });

    if (existing) {
      throw new ValidationError(`Product with SKU ${data.sku} already exists`);
    }

    // ✅ FIX: Remove heroVideoUrl from data if it doesn't exist in DB schema
    const { heroVideoUrl, ...productData } = data as any;
    
    const productRaw = await prisma.product.create({
      data: productData,
      select: {
        id: true,
        sku: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        price: true,
        compareAtPrice: true,
        costPrice: true,
        stock: true,
        lowStockThreshold: true,
        trackInventory: true,
        weight: true,
        dimensions: true,
        images: true,
        videoUrl: true,
        // heroVideoUrl: false, // ✅ FIX: Exclude hero_video_url - column doesn't exist in DB
        metaTitle: true,
        metaDescription: true,
        isActive: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            parentId: true,
            sortOrder: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    // ✅ FIX: Add heroVideoUrl: null to match Product type (field doesn't exist in DB)
    const product = { ...productRaw, heroVideoUrl: null } as Product;

    logger.info(`Product created: ${product.id} (${product.sku})`);

    return product;
  }

  /**
   * Update product (admin only)
   */
  static async updateProduct(
    id: string,
    data: Prisma.ProductUpdateInput
  ): Promise<Product> {
    // Check if product exists
    await this.getProductById(id);

    // ✅ FIX: Remove heroVideoUrl from data if it doesn't exist in DB schema
    const { heroVideoUrl, ...productData } = data as any;

    const productRaw = await prisma.product.update({
      where: { id },
      data: productData,
      select: {
        id: true,
        sku: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        price: true,
        compareAtPrice: true,
        costPrice: true,
        stock: true,
        lowStockThreshold: true,
        trackInventory: true,
        weight: true,
        dimensions: true,
        images: true,
        videoUrl: true,
        // heroVideoUrl: false, // ✅ FIX: Exclude hero_video_url - column doesn't exist in DB
        metaTitle: true,
        metaDescription: true,
        isActive: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            parentId: true,
            sortOrder: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    // ✅ FIX: Add heroVideoUrl: null to match Product type (field doesn't exist in DB)
    const product = { ...productRaw, heroVideoUrl: null } as Product;

    // Invalidate cache
    if (RedisClient.isAvailable()) {
      await redis?.del(`${this.CACHE_PREFIX}${id}`);
    }

    logger.info(`Product updated: ${product.id} (${product.sku})`);

    return product;
  }

  /**
   * Delete product (admin only)
   */
  static async deleteProduct(id: string): Promise<void> {
    // Check if product exists
    await this.getProductById(id);

    // Soft delete by marking as inactive
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    // Invalidate cache
    if (RedisClient.isAvailable()) {
      await redis?.del(`${this.CACHE_PREFIX}${id}`);
    }

    logger.info(`Product deleted (soft): ${id}`);
  }

  /**
   * Check product availability
   */
  static async checkAvailability(
    productId: string,
    quantity: number
  ): Promise<boolean> {
    // ✅ FIX: Use select to avoid hero_video_url column
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { 
        stock: true, 
        trackInventory: true, 
        isActive: true,
        // ✅ FIX: Only select needed fields, exclude hero_video_url
      },
    });

    if (!product || !product.isActive) {
      return false;
    }

    if (!product.trackInventory) {
      return true;
    }

    return product.stock >= quantity;
  }

  /**
   * Update stock after order
   */
  static async updateStock(productId: string, quantity: number): Promise<void> {
    // ✅ FIX: Use select to avoid hero_video_url column
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { 
        id: true,
        trackInventory: true,
        // ✅ FIX: Only select needed fields, exclude hero_video_url
      },
    });

    if (!product) {
      throw new NotFoundError(`Product ${productId} not found`);
    }

    if (product.trackInventory) {
      await prisma.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });

      logger.info(`Stock updated for product ${productId}: -${quantity}`);
    }
  }

  /**
   * Search products
   */
  static async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    // ✅ FIX: Use select to avoid hero_video_url column
    const productsRaw = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: {
        id: true,
        sku: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        price: true,
        compareAtPrice: true,
        costPrice: true,
        stock: true,
        lowStockThreshold: true,
        trackInventory: true,
        weight: true,
        dimensions: true,
        images: true,
        videoUrl: true,
        // heroVideoUrl: false, // ✅ FIX: Exclude hero_video_url - column doesn't exist in DB
        metaTitle: true,
        metaDescription: true,
        isActive: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // ✅ FIX: Add heroVideoUrl: null to match Product type (field doesn't exist in DB)
    return productsRaw.map(p => ({ ...p, heroVideoUrl: null })) as Product[];
  }
}


