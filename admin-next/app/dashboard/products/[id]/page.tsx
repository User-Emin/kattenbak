/**
 * PRODUCT EDIT PAGE - DRY with React Query
 * Auto-refresh, optimistic updates, cache management
 */

'use client';

import { useRouter, useParams } from 'next/navigation';
import { ProductForm } from '@/components/product-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useProduct, useUpdateProduct } from '@/lib/hooks/use-products';
import { ProductFormData } from '@/types/product';
import Link from 'next/link';

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const { data, isLoading, error } = useProduct(productId);
  const updateMutation = useUpdateProduct();

  const handleSubmit = async (formData: ProductFormData) => {
    // 🔥 TRANSFORM: Remove read-only fields and fix schema mismatch
    const { 
      id, 
      createdAt, 
      updatedAt, 
      publishedAt,
      category,  // Remove nested category object
      // ✅ FIX: Keep variants, don't remove them!
      ...updateData 
    } = formData as any;
    
    // Extract categoryId from category object if present
    const apiData: any = {
      ...updateData,
      categoryId: category?.id || formData.categoryId || undefined,
    };
    
    // Clean undefined/null values
    Object.keys(apiData).forEach(key => {
      if (apiData[key] === undefined) {
        delete apiData[key];
      }
    });

    await updateMutation.mutateAsync(
      { id: productId, data: apiData },
      {
        onSuccess: () => {
          // Auto-redirect na success
          setTimeout(() => router.push('/dashboard/products'), 500);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Product niet gevonden</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/dashboard/products">Terug naar overzicht</Link>
        </Button>
      </div>
    );
  }

  const product = data.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Bewerken</h1>
          <p className="text-muted-foreground">{product.name}</p>
        </div>
      </div>

      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}

