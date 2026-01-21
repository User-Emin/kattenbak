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
        <label className="text-base font-semibold text-gray-900">
          Kleur — <span className="font-normal text-gray-700">{selectedVariant?.colorName || 'Selecteer'}</span>
        </label>
        {selectedVariant && selectedVariant.price !== 0 && (
          <span className="text-sm font-semibold text-gray-900">
            {selectedVariant.price > 0 ? '+' : ''}€{Math.abs(selectedVariant.price).toFixed(2)}
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => {
          // ✅ PERGOLUX STYLE: Ronde kleur buttons
          const hasImage = variant.images && variant.images.length > 0;
          // ✅ VARIANT SYSTEM: Get variant image via shared utility (modulair, geen hardcode)
          const variantImage = getVariantImage(variant, product.images as string[]) || null;
          
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect(variant)}
              className={`
                relative w-14 h-14 rounded-full border-3 transition-all overflow-hidden
                ${
                  selectedVariant?.id === variant.id
                    ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                    : 'border-gray-300 hover:border-gray-500'
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
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(60, 60, 61, 0.2) 0%, rgba(122, 122, 125, 0.2) 100%)', // ✅ GRADIENT met opacity (was bg-black/20)
                  }}
                >
                  <Check className="w-7 h-7 text-white drop-shadow-lg" strokeWidth={3} />
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
        <p className="text-sm font-semibold text-blue-600">
          Nog maar {selectedVariant.stock} op voorraad!
        </p>
      )}
      
      {selectedVariant && selectedVariant.stock === 0 && (
        <p className="text-sm font-semibold text-red-600">
          Deze kleur is momenteel uitverkocht
        </p>
      )}
    </div>
  );
}
