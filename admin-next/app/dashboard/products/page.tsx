'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { get } from '@/lib/api/client';
import { Package, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  category: {
    name: string;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await get<{success: boolean; data: Product[]}>('/admin/products');
      setProducts(response.data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Fout bij ophalen producten');
    } finally {
      setIsLoading(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Producten</h1>
          <p className="text-muted-foreground">Beheer je productcatalogus</p>
        </div>
        <Link
          href="/admin/dashboard/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nieuw Product
        </Link>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">SKU</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Naam</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Categorie</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Prijs</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Voorraad</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Geen producten gevonden</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono">{product.sku}</td>
                    <td className="px-4 py-3 text-sm font-medium">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{product.category.name}</td>
                    <td className="px-4 py-3 text-sm text-right">€{product.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={product.stock <= 10 ? 'text-destructive font-medium' : ''}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          product.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.isActive ? 'Actief' : 'Inactief'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/dashboard/products/${product.id}`}
                          className="p-2 hover:bg-muted rounded-md transition-colors"
                          title="Bewerken"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                          title="Verwijderen"
                          onClick={() => toast.info('Verwijderen nog niet geïmplementeerd')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Totaal: {products.length} product{products.length !== 1 ? 'en' : ''}
      </div>
    </div>
  );
}

