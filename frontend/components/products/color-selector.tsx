'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import Image from 'next/image';

/**
 * COLOR VARIANT SELECTOR - DRY & SECURE
 * Allows users to select product color variants
 * Shows color swatch with checkmark when selected
 * Updates product images and price based on selection
 */

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  colorCode?: string;
  colorImageUrl?: string;
  priceAdjustment?: number;
  stock: number;
  images: string[];
  isActive: boolean;
  sortOrder: number;
}

interface ColorSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: string | null;
  onSelectVariant: (variant: ProductVariant) => void;
  disabled?: boolean;
}

export function ColorSelector({
  variants,
  selectedVariantId,
  onSelectVariant,
  disabled = false,
}: ColorSelectorProps) {
  // Filter alleen actieve varianten en sorteer op sortOrder
  const activeVariants = variants
    .filter((v) => v.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (activeVariants.length === 0) {
    return null; // Geen varianten, toon niets
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-900">
        Kleur
      </label>

      <div className="flex flex-wrap gap-3">
        {activeVariants.map((variant) => {
          const isSelected = variant.id === selectedVariantId;
          const isOutOfStock = variant.stock <= 0;
          const isDisabled = disabled || isOutOfStock;

          return (
            <button
              key={variant.id}
              onClick={() => !isDisabled && onSelectVariant(variant)}
              disabled={isDisabled}
              className={`
                relative group
                ${isDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
              `}
              title={`${variant.name}${isOutOfStock ? ' - Niet op voorraad' : ''}`}
            >
              {/* Color Swatch Container */}
              <div
                className={`
                  relative w-14 h-14 rounded-full overflow-hidden
                  border-2 transition-all
                  ${isSelected
                    ? 'border-brand shadow-lg ring-2 ring-brand/30'
                    : 'border-gray-200 hover:border-brand/50'
                  }
                  ${isDisabled ? 'grayscale' : ''}
                `}
              >
                {/* Afbeelding indien beschikbaar */}
                {variant.colorImageUrl ? (
                  <Image
                    src={variant.colorImageUrl}
                    alt={variant.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  // Anders: solid color
                  <div
                    className="w-full h-full"
                    style={{ backgroundColor: variant.colorCode || '#cccccc' }}
                  />
                )}

                {/* Checkmark overlay wanneer geselecteerd */}
                {isSelected && (
                  <div className="absolute inset-0 bg-brand/20 flex items-center justify-center">
                    <div className="bg-white rounded-full p-1">
                      <Check className="h-4 w-4 text-brand" strokeWidth={3} />
                    </div>
                  </div>
                )}

                {/* Uitverkocht streep */}
                {isOutOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-red-500 rotate-45" />
                  </div>
                )}
              </div>

              {/* Naam onder swatch (optioneel, voor duidelijkheid) */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span
                  className={`
                    text-xs font-medium
                    ${isSelected ? 'text-brand' : 'text-gray-500'}
                    group-hover:text-brand transition-colors
                  `}
                >
                  {variant.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Extra ruimte voor labels onder swatches */}
      <div className="h-6" />
    </div>
  );
}
