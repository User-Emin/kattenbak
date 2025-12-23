/**
 * VARIANT MANAGER - Product Color/Size Variants
 * DRY, Secure, Type-Safe
 * Features:
 * - Add/Edit/Delete variants
 * - Color picker
 * - Stock management per variant
 * - Images per variant
 */

'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ProductVariant } from '@/types/product';

interface VariantManagerProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

export function VariantManager({ variants = [], onChange }: VariantManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({
    name: '',
    colorName: '',
    colorHex: '#000000',
    priceAdjustment: 0,
    stock: 0,
    sku: '',
    images: [],
  });

  // Handle add variant
  const handleAdd = () => {
    if (!newVariant.name || !newVariant.colorName) return;

    const variant: ProductVariant = {
      id: `variant-${Date.now()}`,
      name: newVariant.name!,
      colorName: newVariant.colorName!,
      colorHex: newVariant.colorHex || '#000000',
      priceAdjustment: newVariant.priceAdjustment || 0,
      stock: newVariant.stock || 0,
      sku: newVariant.sku || '',
      images: newVariant.images || [],
    };

    onChange([...variants, variant]);
    
    // Reset form
    setNewVariant({
      name: '',
      colorName: '',
      colorHex: '#000000',
      priceAdjustment: 0,
      stock: 0,
      sku: '',
      images: [],
    });
    setIsAdding(false);
  };

  // Handle update variant
  const handleUpdate = (id: string, updates: Partial<ProductVariant>) => {
    onChange(
      variants.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
    setEditingId(null);
  };

  // Handle delete variant
  const handleDelete = (id: string) => {
    onChange(variants.filter((v) => v.id !== id));
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
                    setNewVariant({ ...newVariant, colorName: e.target.value })
                  }
                  placeholder="Wit"
                />
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
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(null)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Annuleren
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setEditingId(null)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Opslaan
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
