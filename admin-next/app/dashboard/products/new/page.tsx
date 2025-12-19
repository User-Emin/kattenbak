'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api/admin-client';
import { toast } from 'sonner';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await adminApi.get<{success: boolean; data: Category[]}>('/categories');
      setCategories(response.data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error('Fout bij ophalen categorieën');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      const formData = new FormData(e.currentTarget);
      
      const categoryId = formData.get('categoryId') as string;
      
      const productData = {
        name: formData.get('name') as string,
        sku: formData.get('sku') as string,
        description: formData.get('description') as string || null,
        shortDescription: formData.get('shortDescription') as string || null,
        price: parseFloat(formData.get('price') as string),
        compareAtPrice: formData.get('compareAtPrice') ? parseFloat(formData.get('compareAtPrice') as string) : null,
        stock: parseInt(formData.get('stock') as string),
        lowStockThreshold: parseInt(formData.get('lowStockThreshold') as string) || 10,
        trackInventory: formData.get('trackInventory') === 'on',
        isActive: formData.get('isActive') === 'on',
        isFeatured: formData.get('isFeatured') === 'on',
        categoryId: categoryId || null,
      };

      await adminApi.post('/products', productData);
      toast.success('Product succesvol aangemaakt!');
      router.push('/dashboard/products');
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(error.response?.data?.error || 'Fout bij aanmaken product');
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
          <h1 className="text-3xl font-bold tracking-tight">Nieuw Product</h1>
          <p className="text-muted-foreground">Voeg een nieuw product toe</p>
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
                placeholder="Bijv. Automatische Kattenbak"
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
                placeholder="Bijv. KB-AUTO-002"
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
              placeholder="Korte samenvatting voor lijstweergave"
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
              placeholder="Volledige productbeschrijving"
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
                defaultValue="0.00"
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
                placeholder="Optioneel"
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
                defaultValue="0"
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
              defaultValue="10"
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
                defaultChecked
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">Voorraad bijhouden</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">Actief</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isFeatured"
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
            <Plus className="h-4 w-4" />
            {isSaving ? 'Aanmaken...' : 'Product Aanmaken'}
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

