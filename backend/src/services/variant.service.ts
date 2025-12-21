/**
 * VARIANT SERVICE - DRY & Secure
 * CRUD operations for product variants
 */

import { prisma } from '@/config/database.config';
import { Prisma } from '@prisma/client';
import { AppError } from '@/utils/error.util';

export interface CreateVariantData {
  productId: string;
  name: string;
  colorName: string;
  colorHex: string;
  priceAdjustment: number;
  sku: string;
  stock: number;
  images?: string[];
  isActive?: boolean;
}

export interface UpdateVariantData {
  name?: string;
  colorName?: string;
  colorHex?: string;
  priceAdjustment?: number;
  sku?: string;
  stock?: number;
  images?: string[];
  isActive?: boolean;
}

export class VariantService {
  /**
   * Get all variants for a product
   */
  static async getVariantsByProductId(productId: string) {
    const variants = await prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' },
    });

    return variants;
  }

  /**
   * Get variant by ID
   */
  static async getVariantById(id: string) {
    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!variant) {
      throw new AppError('Variant niet gevonden', 404);
    }

    return variant;
  }

  /**
   * Create new variant
   */
  static async createVariant(data: CreateVariantData) {
    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new AppError('Product niet gevonden', 404);
    }

    // Check SKU uniqueness
    const existingSku = await prisma.productVariant.findUnique({
      where: { sku: data.sku },
    });

    if (existingSku) {
      throw new AppError('SKU already exists', 400);
    }

    // Create variant
    const variant = await prisma.productVariant.create({
      data: {
        productId: data.productId,
        name: data.name,
        colorName: data.colorName,
        colorHex: data.colorHex,
        priceAdjustment: data.priceAdjustment,
        sku: data.sku,
        stock: data.stock,
        images: data.images || [],
        isActive: data.isActive ?? true,
      },
    });

    return variant;
  }

  /**
   * Update variant
   */
  static async updateVariant(id: string, data: UpdateVariantData) {
    // Check variant exists
    await this.getVariantById(id);

    // If updating SKU, check uniqueness
    if (data.sku) {
      const existingSku = await prisma.productVariant.findFirst({
        where: {
          sku: data.sku,
          id: { not: id },
        },
      });

      if (existingSku) {
        throw new AppError('SKU already exists', 400);
      }
    }

    // Update variant
    const variant = await prisma.productVariant.update({
      where: { id },
      data,
    });

    return variant;
  }

  /**
   * Delete variant
   */
  static async deleteVariant(id: string) {
    // Check variant exists
    await this.getVariantById(id);

    // Delete variant
    await prisma.productVariant.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Bulk update variant stock
   */
  static async updateVariantStock(id: string, stock: number) {
    const variant = await prisma.productVariant.update({
      where: { id },
      data: { stock },
    });

    return variant;
  }
}
