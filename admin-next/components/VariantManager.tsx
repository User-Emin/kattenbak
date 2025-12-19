'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Image as ImageIcon, Save, X } from 'lucide-react';
import { get, post, put, del } from '@/lib/api/client';
import { FileUpload } from './FileUpload';

/**
 * VARIANT MANAGER COMPONENT - DRY & SECURE
 * Manage product color variants with images and stock
 * 
 * Features:
 * - Add/Edit/Delete variants
 * - Upload color swatch images
 * - Upload multiple product images per variant
 * - Track stock per variant
 * - Sort order management
 */

interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  colorCode?: string;
  colorImageUrl?: string;
  priceAdjustment?: number;
  stock: number;
  images: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface VariantManagerProps {
  productId: string;
  productName: string;
}

export function VariantManager({ productId, productName }: VariantManagerProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state for create/edit
  const [formData, setFormData] = useState<Partial<ProductVariant>>({
    name: '',
    sku: '',
    colorCode: '#000000',
    colorImageUrl: '',
    priceAdjustment: 0,
    stock: 0,
    images: [],
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  const fetchVariants = async () => {
    try {
      setIsLoading(true);
      const response = await get<{ success: boolean; data: ProductVariant[] }>(
        `/admin/variants?productId=${productId}`
      );
      setVariants(response.data || []);
    } catch (error: any) {
      console.error('Error fetching variants:', error);
      toast.error('Fout bij ophalen varianten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      name: '',
      sku: '',
      colorCode: '#000000',
      colorImageUrl: '',
      priceAdjustment: 0,
      stock: 0,
      images: [],
      isActive: true,
      sortOrder: variants.length,
    });
  };

  const handleEdit = (variant: ProductVariant) => {
    setEditingId(variant.id);
    setIsCreating(false);
    setFormData({
      name: variant.name,
      sku: variant.sku,
      colorCode: variant.colorCode || '#000000',
      colorImageUrl: variant.colorImageUrl || '',
      priceAdjustment: variant.priceAdjustment || 0,
      stock: variant.stock,
      images: variant.images || [],
      isActive: variant.isActive,
      sortOrder: variant.sortOrder,
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({
      name: '',
      sku: '',
      colorCode: '#000000',
      colorImageUrl: '',
      priceAdjustment: 0,
      stock: 0,
      images: [],
      isActive: true,
      sortOrder: 0,
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.sku) {
        toast.error('Naam en SKU zijn verplicht');
        return;
      }

      if (isCreating) {
        // Create new variant
        await post('/admin/variants', {
          ...formData,
          productId,
        });
        toast.success('Variant toegevoegd!');
      } else if (editingId) {
        // Update existing variant
        await put(`/admin/variants/${editingId}`, formData);
        toast.success('Variant bijgewerkt!');
      }

      handleCancel();
      fetchVariants();
    } catch (error: any) {
      console.error('Error saving variant:', error);
      toast.error(error.response?.data?.error || 'Fout bij opslaan variant');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Variant "${name}" verwijderen?`)) return;

    try {
      await del(`/admin/variants/${id}`);
      toast.success('Variant verwijderd');
      fetchVariants();
    } catch (error: any) {
      console.error('Error deleting variant:', error);
      toast.error('Fout bij verwijderen variant');
    }
  };

  const handleAddImage = async (url: string) => {
    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), url],
    }));
  };

  const handleRemoveImage = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((img) => img !== url),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Kleurvarianten</h2>
          <p className="text-sm text-muted-foreground">
            Beheer kleuren met aparte foto's en voorraad
          </p>
        </div>
        {!isCreating && !editingId && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nieuwe Variant
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="bg-muted/50 rounded-lg border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {isCreating ? 'Nieuwe Variant' : 'Variant Bewerken'}
            </h3>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-background rounded transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">
                Naam (bijv. "Zwart", "Wit") *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Zwart"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                SKU *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="KB-AUTO-001-BLK"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Kleurcode (Hex)
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.colorCode}
                  onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.colorCode}
                  onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Voorraad
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Prijsaanpassing (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.priceAdjustment}
                onChange={(e) => setFormData({ ...formData, priceAdjustment: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground mt-1">
                +/- verschil t.o.v. basisprijs
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Sorteervolgorde
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                min="0"
              />
            </div>
          </div>

          <div>
            <FileUpload
              label="Kleur Swatch Afbeelding"
              accept="image/*"
              currentUrl={formData.colorImageUrl || ''}
              onUpload={(url) => setFormData({ ...formData, colorImageUrl: url })}
              helpText="Upload een afbeelding die de kleur toont (bijv. materiaalstaal)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Product Foto's in Deze Kleur
            </label>
            <div className="space-y-3">
              {(formData.images || []).map((url, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-background rounded-md border">
                  <img src={url} alt={`Image ${idx + 1}`} className="h-16 w-16 object-cover rounded" />
                  <span className="flex-1 text-sm truncate">{url}</span>
                  <button
                    onClick={() => handleRemoveImage(url)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              <FileUpload
                label=""
                accept="image/*"
                currentUrl=""
                onUpload={handleAddImage}
                helpText="Upload product foto's in deze kleur"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label className="text-sm font-medium">Actief</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Save className="h-4 w-4" />
              Opslaan
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2 border rounded-md hover:bg-muted transition-colors"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      {/* Variants List */}
      {variants.length === 0 && !isCreating && !editingId ? (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground mb-4">Geen varianten toegevoegd</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Eerste Variant Toevoegen
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className="flex items-center gap-4 p-4 bg-background rounded-lg border hover:shadow-sm transition-shadow"
            >
              {/* Color preview */}
              <div className="flex items-center gap-3">
                {variant.colorImageUrl ? (
                  <img
                    src={variant.colorImageUrl}
                    alt={variant.name}
                    className="h-12 w-12 object-cover rounded border"
                  />
                ) : (
                  <div
                    className="h-12 w-12 rounded border"
                    style={{ backgroundColor: variant.colorCode || '#cccccc' }}
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{variant.name}</h4>
                  {!variant.isActive && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      Inactief
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p>SKU: <span className="font-mono">{variant.sku}</span></p>
                  <p>Voorraad: <span className="font-medium">{variant.stock}</span></p>
                  <p>Foto's: <span className="font-medium">{variant.images?.length || 0}</span></p>
                  {variant.priceAdjustment !== 0 && variant.priceAdjustment !== undefined && (
                    <p>
                      Prijs: <span className="font-medium">
                        {variant.priceAdjustment > 0 ? '+' : ''}€{variant.priceAdjustment.toFixed(2)}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(variant)}
                  className="p-2 hover:bg-muted rounded transition-colors"
                  title="Bewerken"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(variant.id, variant.name)}
                  className="p-2 hover:bg-destructive/10 text-destructive rounded transition-colors"
                  title="Verwijderen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
