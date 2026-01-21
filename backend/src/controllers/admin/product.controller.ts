import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../../services/product.service';
import { successResponse } from '../../utils/response.util';
import { extractStringParam } from '../../utils/params.util';

/**
 * Admin Product Controller
 * Full CRUD operations for products
 */
export class AdminProductController {
  /**
   * Get all products (including inactive)
   * GET /api/v1/admin/products
   */
  static async getAllProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        page = 1,
        pageSize = 25,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        categoryId,
        isActive,
        isFeatured,
      } = req.query;

      const filters: any = {
        search: search as string,
        categoryId: categoryId as string,
      };

      // For admin, we can filter by active status
      if (isActive !== undefined) {
        filters.isActive = isActive === 'true';
      }

      if (isFeatured !== undefined) {
        filters.isFeatured = isFeatured === 'true';
      }

      const pagination = {
        page: parseInt(page as string, 10),
        pageSize: parseInt(pageSize as string, 10),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const { products } = await ProductService.getAllProducts(
        filters,
        pagination
      );

      successResponse(res, products, undefined, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product by ID
   * GET /api/v1/admin/products/:id
   */
  static async getProductById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = extractStringParam(req.params.id, 'id');
      const product = await ProductService.getProductById(id);

      successResponse(res, product);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create product
   * POST /api/v1/admin/products
   */
  static async createProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const productData = req.body;
      
      // Connect to category
      const data = {
        ...productData,
        category: {
          connect: { id: productData.categoryId },
        },
      };

      delete data.categoryId;

      const product = await ProductService.createProduct(data);

      successResponse(res, product, 'Product created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update product
   * PUT /api/v1/admin/products/:id
   */
  static async updateProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = extractStringParam(req.params.id, 'id');
      const updateData = req.body;

      // Handle category update
      if (updateData.categoryId) {
        updateData.category = {
          connect: { id: updateData.categoryId },
        };
        delete updateData.categoryId;
      }

      const product = await ProductService.updateProduct(id, updateData);

      successResponse(res, product);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete product (soft delete)
   * DELETE /api/v1/admin/products/:id
   */
  static async deleteProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = extractStringParam(req.params.id, 'id');
      await ProductService.deleteProduct(id);

      successResponse(res, null, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
