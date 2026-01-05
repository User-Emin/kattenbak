/**
 * COLOR SELECTOR - Webshop Product Detail
 * DRY, responsive, accessible
 * Shows product variants with color swatches
 */

'use client';

import { ProductVariant } from '@/types/product';
import { Check } from 'lucide-react';

interface ColorSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelect: (variant: ProductVariant) => void;
}

export function ColorSelector({ variants, selectedVariant, onSelect }: ColorSelectorProps) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Kleur: <span className="text-gray-900">{selectedVariant?.colorName || 'Selecteer'}</span>
        </label>
        {selectedVariant && selectedVariant.price !== 0 && (
          <span className="text-sm text-gray-600">
            {selectedVariant.price > 0 ? '+' : ''}€{Math.abs(selectedVariant.price).toFixed(2)}
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => {
          // ✅ FIX: Show variant image in square if available, otherwise fallback to colorHex
          const hasImage = variant.images && variant.images.length > 0;
          const variantImage = hasImage ? variant.images[0] : null;
          
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect(variant)}
              className={`
                relative w-12 h-12 rounded border-2 transition-all overflow-hidden
                ${
                  selectedVariant?.id === variant.id
                    ? 'border-brand shadow-lg scale-110'
                    : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                }
                ${variant.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              style={!hasImage ? { backgroundColor: variant.colorHex } : undefined}
              title={`${variant.colorName}${variant.stock === 0 ? ' (Uitverkocht)' : ''}`}
              disabled={variant.stock === 0}
              aria-label={`Selecteer kleur ${variant.colorName}`}
            >
              {/* ✅ Show variant image if available */}
              {variantImage && (
                <img
                  src={variantImage}
                  alt={variant.colorName}
                  className="w-full h-full object-cover"
                />
              )}
              
              {selectedVariant?.id === variant.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <Check className="w-6 h-6 text-white drop-shadow-lg" strokeWidth={3} />
                </div>
              )}
              {variant.stock === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                  <div className="w-full h-0.5 bg-red-500 rotate-45" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {selectedVariant && selectedVariant.stock < 5 && selectedVariant.stock > 0 && (
        <p className="text-sm text-orange-600">
          Nog maar {selectedVariant.stock} op voorraad!
        </p>
      )}
      
      {selectedVariant && selectedVariant.stock === 0 && (
        <p className="text-sm text-red-600">
          Deze kleur is momenteel uitverkocht
        </p>
      )}
    </div>
  );
}
