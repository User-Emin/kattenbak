/**
 * PRODUCTS API - DRY CRUD Operations
 */

import { get, post, put, del } from './client';
import { Product, ProductFormData } from '@/types/product';

// DRY: List products with pagination
export const getProducts = async (params?: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  return get<Product[]>('/admin/products', params);
};

// DRY: Get single product
export const getProduct = async (id: string) => {
  return get<Product>(`/admin/products/${id}`);
};

// DRY: Create product
export const createProduct = async (data: ProductFormData) => {
  return post<Product>('/admin/products', data);
};

// DRY: Update product
export const updateProduct = async (id: string, data: Partial<ProductFormData>) => {
  return put<Product>(`/admin/products/${id}`, data);
};

// DRY: Delete product
export const deleteProduct = async (id: string) => {
  return del<{ id: string }>(`/admin/products/${id}`);
};

