import { Request, Response, NextFunction } from 'express';
import { ProductService } from '@/services/product.service';
import { successResponse } from '@/utils/response.util';
import { ProductFilters, PaginationParams } from '@/types';

/**
 * Product Controller
 * Handles HTTP requests for products
 */
export class ProductController {
  /**
   * Get all products with filters and pagination
   * GET /api/v1/products
   */
  static async getAllProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        page = 1,
        pageSize = 12,
        categoryId,
        isFeatured,
        inStock,
        minPrice,
        maxPrice,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const filters: ProductFilters = {
        categoryId: categoryId as string,
        isFeatured: isFeatured === 'true',
        inStock: inStock === 'true',
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        search: search as string,
      };

      const pagination: PaginationParams = {
        page: parseInt(page as string, 10),
        pageSize: parseInt(pageSize as string, 10),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const { products, total } = await ProductService.getAllProducts(
        filters,
        pagination
      );

      successResponse(res, {
        products,
        pagination: {
          page: pagination.page,
          pageSize: pagination.pageSize,
          total,
          totalPages: Math.ceil(total / pagination.pageSize),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product by ID
   * GET /api/v1/products/:id
   */
  static async getProductById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);

      successResponse(res, product);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product by slug
   * GET /api/v1/products/slug/:slug
   */
  static async getProductBySlug(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { slug } = req.params;
      const product = await ProductService.getProductBySlug(slug);

      successResponse(res, product);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get featured products
   * GET /api/v1/products/featured
   */
  static async getFeaturedProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
      const products = await ProductService.getFeaturedProducts(limit);

      successResponse(res, products);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search products
   * GET /api/v1/products/search?q=query
   */
  static async searchProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query.q as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      if (!query) {
        successResponse(res, []);
        return;
      }

      const products = await ProductService.searchProducts(query, limit);

      successResponse(res, products);
    } catch (error) {
      next(error);
    }
  }
}
