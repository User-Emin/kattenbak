'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { get, put } from '@/lib/api/client';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string | null;
  images: string[];
  category?: {
    id: string;
    name: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchCategories();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await get<{success: boolean; data: Product}>(`/admin/products/${productId}`);
      setProduct(response.data);
    } catch (error: any) {
      console.error('Error fetching product:', error);
      toast.error('Fout bij ophalen product');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await get<{success: boolean; data: Category[]}>('/admin/categories');
      setCategories(response.data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;

    try {
      setIsSaving(true);
      const formData = new FormData(e.currentTarget);
      
      const categoryId = formData.get('categoryId') as string;
      
      const updateData = {
        name: formData.get('name') as string,
        sku: formData.get('sku') as string,
        description: formData.get('description') as string,
        shortDescription: formData.get('shortDescription') as string,
        price: parseFloat(formData.get('price') as string),
        compareAtPrice: formData.get('compareAtPrice') ? parseFloat(formData.get('compareAtPrice') as string) : null,
        stock: parseInt(formData.get('stock') as string),
        lowStockThreshold: parseInt(formData.get('lowStockThreshold') as string),
        trackInventory: formData.get('trackInventory') === 'on',
        isActive: formData.get('isActive') === 'on',
        isFeatured: formData.get('isFeatured') === 'on',
        categoryId: categoryId || null,
      };

      await put(`/admin/products/${productId}`, updateData);
      toast.success('Product succesvol bijgewerkt!');
      router.push('/dashboard/products');
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error('Fout bij bijwerken product');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Product niet gevonden</h2>
          <Link
            href="/dashboard/products"
            className="text-primary hover:underline"
          >
            Terug naar producten
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/products"
          className="p-2 hover:bg-muted rounded-md transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Bewerken</h1>
          <p className="text-muted-foreground">{product.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card rounded-lg border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Basis Informatie</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Product Naam *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={product.name}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="sku" className="block text-sm font-medium mb-2">
                SKU *
              </label>
              <input
                id="sku"
                name="sku"
                type="text"
                required
                defaultValue={product.sku}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="shortDescription" className="block text-sm font-medium mb-2">
              Korte Beschrijving
            </label>
            <input
              id="shortDescription"
              name="shortDescription"
              type="text"
              defaultValue={product.shortDescription || ''}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Beschrijving
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={product.description || ''}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Prijzen & Voorraad</h2>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-2">
                Prijs (€) *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                required
                defaultValue={product.price}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="compareAtPrice" className="block text-sm font-medium mb-2">
                Vergelijkprijs (€)
              </label>
              <input
                id="compareAtPrice"
                name="compareAtPrice"
                type="number"
                step="0.01"
                defaultValue={product.compareAtPrice || ''}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium mb-2">
                Voorraad *
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                required
                defaultValue={product.stock}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="lowStockThreshold" className="block text-sm font-medium mb-2">
              Lage Voorraad Drempel
            </label>
            <input
              id="lowStockThreshold"
              name="lowStockThreshold"
              type="number"
              defaultValue={product.lowStockThreshold}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Categorie & Instellingen</h2>
          
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium mb-2">
              Categorie
            </label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={product.categoryId || ''}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Geen categorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="trackInventory"
                defaultChecked={product.trackInventory}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">Voorraad bijhouden</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={product.isActive}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">Actief</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={product.isFeatured}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">Uitgelicht</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Opslaan...' : 'Opslaan'}
          </button>

          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 px-6 py-3 border rounded-md hover:bg-muted transition-colors"
          >
            Annuleren
          </Link>
        </div>
      </form>
    </div>
  );
}

