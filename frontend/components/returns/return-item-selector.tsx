'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ReturnItem } from '@/types/return';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '../../lib/utils/price';

/**
 * RETURN ITEM SELECTOR - DRY Component
 * Selecteer producten om te retourneren (multi-select)
 * Quantity selector per product
 * NO HARDCODED DATA!
 */

interface ReturnItemSelectorProps {
  orderItems: Array<{
    productId: string;
    productName: string;
    productImage?: string;
    quantity: number;
    price: number;
  }>;
  selectedItems: ReturnItem[];
  onChange: (items: ReturnItem[]) => void;
  error?: string;
  disabled?: boolean;
}

export function ReturnItemSelector({
  orderItems,
  selectedItems,
  onChange,
  error,
  disabled = false,
}: ReturnItemSelectorProps) {
  const handleToggleItem = (productId: string) => {
    const item = orderItems.find((i) => i.productId === productId);
    if (!item) return;

    const isSelected = selectedItems.some((i) => i.productId === productId);

    if (isSelected) {
      // Remove
      onChange(selectedItems.filter((i) => i.productId !== productId));
    } else {
      // Add with default quantity = 1
      onChange([
        ...selectedItems,
        {
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          quantity: 1,
          price: item.price,
        },
      ]);
    }
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    onChange(
      selectedItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const getMaxQuantity = (productId: string): number => {
    return orderItems.find((i) => i.productId === productId)?.quantity || 1;
  };

  return (
    <div className="space-y-4">
      <Label>
        Selecteer producten om te retourneren{' '}
        <span className="text-red-500">*</span>
      </Label>

      <div className="space-y-3">
        {orderItems.map((item) => {
          const isSelected = selectedItems.some(
            (i) => i.productId === item.productId
          );
          const selectedItem = selectedItems.find(
            (i) => i.productId === item.productId
          );
          const maxQty = getMaxQuantity(item.productId);

          return (
            <div
              key={item.productId}
              className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
                isSelected
                  ? 'border-brand bg-brand/5'
                  : 'border-gray-200 hover:border-gray-300'
              } ${disabled ? 'opacity-50' : ''}`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggleItem(item.productId)}
                disabled={disabled}
                className="w-5 h-5 text-brand rounded focus:ring-2 focus:ring-brand"
              />

              {/* Product Image */}
              {item.productImage && (
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}

              {/* Product Info */}
              <div className="flex-1">
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(item.price)} × {item.quantity}
                </p>
              </div>

              {/* Quantity Selector (only when selected) */}
              {isSelected && (
                <div className="flex items-center gap-2">
                  <Label htmlFor={`qty-${item.productId}`} className="text-sm">
                    Aantal:
                  </Label>
                  <Input
                    id={`qty-${item.productId}`}
                    name={`qty-${item.productId}`}
                    type="number"
                    min={1}
                    max={maxQty}
                    value={selectedItem?.quantity || 1}
                    onChange={(e) =>
                      handleQuantityChange(
                        item.productId,
                        parseInt(e.target.value) || 1
                      )
                    }
                    disabled={disabled}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-500">/ {maxQty}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {selectedItems.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium mb-2">Geselecteerd:</p>
          <ul className="text-sm space-y-1">
            {selectedItems.map((item) => (
              <li key={item.productId}>
                {item.productName} × {item.quantity}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}



