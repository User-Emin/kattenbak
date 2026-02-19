/**
 * VARIANT MANAGER - Product Color/Size Variants
 * Stabiele bewerking met incrementele opslag
 * - Add/Edit/Delete variants
 * - Aparte foto-upload per variant
 * - Opslaan per variant (geen redirect, geen verlies)
 */

'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUpload } from '@/components/image-upload';
import { useCreateVariant, useUpdateVariant } from '@/lib/hooks/use-variants';
import type { ProductVariant } from '@/types/product';

interface VariantManagerProps {
  productId?: string;
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

const isTempId = (id: string) => id.startsWith('variant-');

export function VariantManager({ productId, variants = [], onChange }: VariantManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const createMutation = useCreateVariant(productId || '');
  const updateMutation = useUpdateVariant(productId || '');
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const canSaveIncrementally = !!productId;
  // ✅ VARIANT SYSTEM: Updated to use colorCode and colorImageUrl
  const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({
    name: '',
    colorName: '', // Will be converted to colorCode
    colorCode: '', // e.g. "WIT", "ZWART", "GRIJS"
    colorHex: '#000000',
    previewImage: '', // Preview image URL
    priceAdjustment: 0,
    stock: 0,
    sku: '',
    images: [],
  });

  // Handle add variant - ✅ VARIANT SYSTEM: Convert colorName to colorCode - STABLE
  const handleAdd = () => {
    if (!newVariant.name || (!newVariant.colorName && !newVariant.colorCode)) return;

    // ✅ VARIANT SYSTEM: Convert colorName to colorCode (uppercase)
    const colorCode = newVariant.colorCode || (newVariant.colorName ? newVariant.colorName.toUpperCase() : '');
    
    // ✅ STABLE: Preserve uploaded images - don't lose them
    const variant: ProductVariant = {
      id: `variant-${Date.now()}`,
      name: newVariant.name!,
      colorName: newVariant.colorName || colorCode,
      colorCode: colorCode,
      colorHex: newVariant.colorHex || '#000000',
      previewImage: newVariant.previewImage || null,
      priceAdjustment: newVariant.priceAdjustment || 0,
      stock: newVariant.stock || 0,
      sku: newVariant.sku || '',
      images: newVariant.images || [], // ✅ STABLE: Preserve uploaded images
    };

    // ✅ STABLE: Add variant with all images intact
    onChange([...variants, variant]);
    
    // Reset form (but images are already saved in variant above)
    setNewVariant({
      name: '',
      colorName: '',
      colorCode: '',
      colorHex: '#000000',
      previewImage: '',
      priceAdjustment: 0,
      stock: 0,
      sku: '',
      images: [],
    });
    setIsAdding(false);
  };

  // Handle update variant (alleen form state, sluit editor niet)
  const handleUpdate = (id: string, updates: Partial<ProductVariant>) => {
    onChange(
      variants.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  // Incrementeel opslaan: direct naar backend (geen redirect, blijf op pagina)
  const handleSaveVariant = async (variant: ProductVariant) => {
    if (!productId) {
      setEditingId(null);
      return;
    }
    const temp = isTempId(variant.id);
    try {
      if (temp) {
        const res = await createMutation.mutateAsync({
          name: variant.name,
          colorName: variant.colorName,
          colorCode: variant.colorCode,
          colorHex: variant.colorHex || '#000000',
          previewImage: variant.previewImage,
          priceAdjustment: variant.priceAdjustment ?? 0,
          stock: variant.stock ?? 0,
          sku: variant.sku,
          images: variant.images ?? [],
        });
        // API retourneert { success, data: ProductVariant }
        const newVariant = (res as { data?: ProductVariant })?.data ?? (res as unknown as ProductVariant);
        onChange(
          variants.map((v) => (v.id === variant.id ? { ...variant, ...newVariant, id: newVariant.id } : v))
        );
        setEditingId(newVariant.id);
        setIsAdding(false);
      } else {
        await updateMutation.mutateAsync({
          id: variant.id,
          data: {
            name: variant.name,
            colorName: variant.colorName,
            colorCode: variant.colorCode,
            colorHex: variant.colorHex,
            previewImage: variant.previewImage,
            priceAdjustment: variant.priceAdjustment,
            stock: variant.stock,
            sku: variant.sku,
            images: variant.images,
          },
        });
        setEditingId(null);
      }
    } catch {
      // Toast al in hook
    }
  };

  // Handle delete variant with confirmation
  const handleDelete = (id: string) => {
    const variant = variants.find((v) => v.id === id);
    if (!variant) return;
    
    // ✅ SECURITY: Confirmation dialog prevents accidental deletion
    const confirmed = window.confirm(
      `Weet je zeker dat je variant "${variant.name}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`
    );
    
    if (confirmed) {
      onChange(variants.filter((v) => v.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Product Varianten</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Variant Toevoegen
        </Button>
      </div>

      {/* Add New Variant Form */}
      {isAdding && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Variant Naam *</label>
                <Input
                  value={newVariant.name}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, name: e.target.value })
                  }
                  placeholder="Bijv: Premium Wit"
                />
              </div>

              <div>
                <label className="text-sm font-medium">SKU</label>
                <Input
                  value={newVariant.sku}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, sku: e.target.value })
                  }
                  placeholder="KB-AUTO-WIT"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Kleur Naam *</label>
                <Input
                  value={newVariant.colorName}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, colorName: e.target.value, colorCode: e.target.value.toUpperCase() })
                  }
                  placeholder="Wit (wordt WIT als colorCode)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Wordt automatisch omgezet naar colorCode (WIT, ZWART, GRIJS, etc.)
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Preview Image URL</label>
                <Input
                  value={newVariant.previewImage || ''}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, previewImage: e.target.value })
                  }
                  placeholder="/uploads/variant-wit-preview.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Preview afbeelding die getoond wordt in variant selector
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Kleur Hex</label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={newVariant.colorHex}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, colorHex: e.target.value })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={newVariant.colorHex}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, colorHex: e.target.value })
                    }
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Prijs Aanpassing</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newVariant.priceAdjustment}
                  onChange={(e) =>
                    setNewVariant({
                      ...newVariant,
                      priceAdjustment: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  +/- ten opzichte van basis prijs
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Voorraad</label>
                <Input
                  type="number"
                  value={newVariant.stock}
                  onChange={(e) =>
                    setNewVariant({
                      ...newVariant,
                      stock: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            {/* ✅ COOLBLUE-STYLE: Variant Images Upload - STABLE */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                🎨 Variant Afbeeldingen (Coolblue-style)
              </label>
              <ImageUpload
                value={newVariant.images || []}
                onChange={(images) => {
                  // ✅ STABLE: Update state immediately to prevent loss during upload
                  setNewVariant((prev) => ({ ...prev, images }));
                }}
                maxImages={10}
              />
              <p className="text-xs text-muted-foreground mt-2">
                💡 Upload aparte foto's voor deze kleurvariant. Deze worden getoond wanneer klant deze kleur selecteert.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAdding(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Annuleren
              </Button>
              <Button type="button" size="sm" onClick={handleAdd}>
                <Check className="w-4 h-4 mr-2" />
                Toevoegen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Variants List */}
      {variants.length === 0 && !isAdding && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Geen varianten toegevoegd. Klik op "Variant Toevoegen" om te beginnen.
            </p>
          </CardContent>
        </Card>
      )}

      {variants.map((variant) => (
        <Card key={variant.id}>
          <CardContent className="pt-6">
            {editingId === variant.id ? (
              // Edit Mode
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    value={variant.name}
                    onChange={(e) =>
                      handleUpdate(variant.id, { name: e.target.value })
                    }
                    placeholder="Variant naam"
                  />
                  <Input
                    value={variant.sku}
                    onChange={(e) =>
                      handleUpdate(variant.id, { sku: e.target.value })
                    }
                    placeholder="SKU"
                  />
                  <Input
                    value={variant.colorName}
                    onChange={(e) =>
                      handleUpdate(variant.id, { colorName: e.target.value })
                    }
                    placeholder="Kleur naam"
                  />
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={variant.colorHex}
                      onChange={(e) =>
                        handleUpdate(variant.id, { colorHex: e.target.value })
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={variant.colorHex}
                      onChange={(e) =>
                        handleUpdate(variant.id, { colorHex: e.target.value })
                      }
                      placeholder="#000000"
                    />
                  </div>
                  <Input
                    type="number"
                    step="0.01"
                    value={variant.priceAdjustment}
                    onChange={(e) =>
                      handleUpdate(variant.id, {
                        priceAdjustment: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Prijs aanpassing"
                  />
                  <Input
                    type="number"
                    value={variant.stock}
                    onChange={(e) =>
                      handleUpdate(variant.id, {
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Voorraad"
                  />
                </div>

                {/* ✅ COOLBLUE-STYLE: Edit Variant Images - STABLE */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    🎨 Variant Afbeeldingen
                  </label>
                  <ImageUpload
                    value={variant.images || []}
                    onChange={(images) => {
                      // ✅ STABLE: Update immediately to prevent loss during upload
                      handleUpdate(variant.id, { images });
                    }}
                    maxImages={10}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Deze foto's worden getoond wanneer klant deze kleur selecteert
                  </p>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(null)}
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Annuleren
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleSaveVariant(variant)}
                    disabled={isSaving || (isTempId(variant.id) && !productId)}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    {canSaveIncrementally ? 'Opslaan' : 'Sluiten'}
                  </Button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded border-2 border-gray-300"
                    style={{ backgroundColor: variant.colorHex }}
                  />
                  <div>
                    <p className="font-medium">{variant.name}</p>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span>{variant.colorName}</span>
                      {variant.sku && <span>• SKU: {variant.sku}</span>}
                      <span>• Voorraad: {variant.stock}</span>
                      {variant.priceAdjustment !== 0 && (
                        <span>
                          • Prijs: {variant.priceAdjustment > 0 ? '+' : ''}€
                          {variant.priceAdjustment.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(variant.id)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(variant.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
