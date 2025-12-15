/**
 * PRODUCT CREATE PAGE - DRY with React Query
 */

'use client';

import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/product-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useCreateProduct } from '@/lib/hooks/use-products';
import { ProductFormData } from '@/types/product';
import Link from 'next/link';

export default function ProductCreatePage() {
  const router = useRouter();
  const createMutation = useCreateProduct();

  const handleSubmit = async (data: ProductFormData) => {
    await createMutation.mutateAsync(data, {
      onSuccess: () => {
        // Auto-redirect na success
        setTimeout(() => router.push('/dashboard/products'), 500);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nieuw Product</h1>
          <p className="text-muted-foreground">Voeg een nieuw product toe</p>
        </div>
      </div>

      <ProductForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}

