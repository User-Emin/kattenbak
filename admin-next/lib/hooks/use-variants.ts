/**
 * VARIANTS HOOKS - Incrementele variant-opslag
 * Voor stabiele bewerking zonder hele product op te slaan
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createVariant, updateVariant } from '@/lib/api/variants';
import type { ProductVariant } from '@/types/product';
import { toast } from 'sonner';

const QUERY_KEYS = {
  product: (id: string) => ['products', id] as const,
};

export function useCreateVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<ProductVariant, 'id'>) => createVariant(productId, data),
    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.product(productId) });
      toast.success('Variant toegevoegd!');
    },
    onError: () => {
      toast.error('Variant toevoegen mislukt');
    },
  });
}

export function useUpdateVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductVariant> }) =>
      updateVariant(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.product(productId) });
      toast.success('Variant opgeslagen!');
    },
    onError: () => {
      toast.error('Variant opslaan mislukt');
    },
  });
}
