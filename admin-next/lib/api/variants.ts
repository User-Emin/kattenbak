/**
 * VARIANTS API - Incrementele CRUD voor productvarianten
 * Voor stabiele variantbewerking zonder hele product op te slaan
 */

import { get, post, put, del } from './client';
import type { ProductVariant } from '@/types/product';

export interface VariantApiResponse {
  success: boolean;
  data: ProductVariant;
}

// Lijst varianten per product
export const getVariantsByProduct = async (productId: string) => {
  const res = await get<{ variants?: ProductVariant[] }>('/admin/variants', { productId });
  return res;
};

// Eén variant ophalen
export const getVariant = async (id: string) => {
  return get<ProductVariant>(`/admin/variants/${id}`);
};

// Nieuwe variant aanmaken (direct persisteren)
export const createVariant = async (productId: string, data: Omit<ProductVariant, 'id'>) => {
  const colorCode = (data.colorCode || (data.colorName as string)?.toUpperCase() || '').toUpperCase();
  const payload = {
    productId,
    name: data.name,
    colorName: data.colorName || colorCode,
    colorCode: colorCode || undefined,
    colorImageUrl: data.previewImage || data.colorImageUrl || null,
    colorHex: data.colorHex || '#000000',
    priceAdjustment: data.priceAdjustment ?? 0,
    stock: data.stock ?? 0,
    sku: data.sku,
    images: data.images ?? [],
  };
  return post<ProductVariant>('/admin/variants', payload);
};

// Bestaande variant bijwerken (direct persisteren)
export const updateVariant = async (id: string, data: Partial<ProductVariant>) => {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.colorName !== undefined) payload.colorName = data.colorName;
  if (data.colorCode !== undefined) payload.colorCode = data.colorCode;
  if (data.colorHex !== undefined) payload.colorHex = data.colorHex;
  if (data.previewImage !== undefined || data.colorImageUrl !== undefined) {
    payload.colorImageUrl = data.previewImage ?? data.colorImageUrl ?? null;
  }
  if (data.priceAdjustment !== undefined) payload.priceAdjustment = data.priceAdjustment;
  if (data.stock !== undefined) payload.stock = data.stock;
  if (data.sku !== undefined) payload.sku = data.sku;
  if (data.images !== undefined) payload.images = data.images;
  return put<ProductVariant>(`/admin/variants/${id}`, payload);
};

// Variant verwijderen (soft delete)
export const deleteVariant = async (id: string) => {
  return del<{ id: string }>(`/admin/variants/${id}`);
};
