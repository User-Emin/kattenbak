/**
 * PRODUCTS HOOKS - DRY React Query Integration
 * Automatische cache invalidation en refetch
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, getProduct, updateProduct, createProduct, deleteProduct } from '@/lib/api/products';
import { Product, ProductFormData } from '@/types/product';
import { toast } from 'sonner';

// DRY: Query keys
const QUERY_KEYS = {
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
};

// DRY: List products met cache
export function useProducts() {
  return useQuery({
    queryKey: QUERY_KEYS.products,
    queryFn: () => getProducts(),
  });
}

// DRY: Single product met cache
export function useProduct(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.product(id),
    queryFn: () => getProduct(id),
    enabled: !!id,
  });
}

// DRY: Update product met auto-refetch
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) =>
      updateProduct(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.product(id) });

      // Snapshot previous value
      const previousProduct = queryClient.getQueryData(QUERY_KEYS.product(id));

      // Optimistically update
      queryClient.setQueryData(QUERY_KEYS.product(id), (old: any) => ({
        ...old,
        data: { ...old?.data, ...data },
      }));

      return { previousProduct };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousProduct) {
        queryClient.setQueryData(
          QUERY_KEYS.product(variables.id),
          context.previousProduct
        );
      }
      toast.error('Update mislukt');
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.product(variables.id) });
      toast.success('Product bijgewerkt!');
    },
  });
}

// DRY: Create product met auto-refetch
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductFormData) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      toast.success('Product aangemaakt!');
    },
    onError: () => {
      toast.error('Aanmaken mislukt');
    },
  });
}

// DRY: Delete product met auto-refetch
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      toast.success('Product verwijderd!');
    },
    onError: () => {
      toast.error('Verwijderen mislukt');
    },
  });
}




