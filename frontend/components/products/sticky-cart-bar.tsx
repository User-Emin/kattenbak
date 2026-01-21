'use client';

import { useState, useEffect, useRef } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/types/product';
// Defensive price formatting
const formatCurrency = (price: any): string => {
  const num = typeof price === 'number' ? price : parseFloat(String(price));
  return `€${(isNaN(num) ? 0 : num).toFixed(2)}`;
};

interface StickyCartBarProps {
  product: Product;
  addToCartButtonRef: React.RefObject<HTMLDivElement | null>;
  // ✅ VARIANT SYSTEM: Dynamische variant informatie (modulair, geen hardcode)
  selectedVariantId?: string | null;
  variants?: Array<{
    id: string;
    name: string;
    colorCode?: string;
    colorName?: string;
    images?: string[];
    previewImage?: string;
    colorImageUrl?: string;
    priceAdjustment?: number | string;
    stock?: number;
  }>;
  displayPrice?: number; // Variant-adjusted price
}

/**
 * STICKY CART BAR - SMOOTH BOTTOM BANNER
 * Toont alleen wanneer "In Winkelwagen" button uit beeld is
 * DRY: Hergebruikt cart context, niet overweldigend, smooth
 * Design: Clean banner met prijs + CTA
 */
export function StickyCartBar({ 
  product, 
  addToCartButtonRef,
  selectedVariantId,
  variants = [],
  displayPrice
}: StickyCartBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  
  // ✅ VARIANT SYSTEM: Dynamisch actieve variant herkennen (modulair, geen hardcode)
  const activeVariant = selectedVariantId 
    ? variants.find((v) => v.id === selectedVariantId)
    : variants.length > 0 ? variants[0] : null;
  
  // ✅ VARIANT SYSTEM: Dynamisch variant afbeelding ophalen via shared utility (modulair, geen hardcode)
  const variantImage = getVariantImage(activeVariant, product.images as string[]);
  const finalPrice = displayPrice !== undefined ? displayPrice : (typeof product.price === 'number' ? product.price : parseFloat(String(product.price || 0)));

  useEffect(() => {
    const handleScroll = () => {
      if (!addToCartButtonRef.current) return;

      const buttonRect = addToCartButtonRef.current.getBoundingClientRect();
      const isButtonVisible = buttonRect.top < window.innerHeight && buttonRect.bottom > 0;
      
      // Toon sticky bar alleen als button niet zichtbaar is EN gebruiker naar beneden scrolt
      setIsVisible(!isButtonVisible && window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [addToCartButtonRef]);

  // ✅ VARIANT SYSTEM: Dynamische variant herkenning bij winkelwagen klikken (modulair, geen hardcode)
  const handleAddToCart = () => {
    // ✅ VARIANT SYSTEM: Get variant image via shared utility (modulair, geen hardcode)
    const variantImageToUse = getVariantImage(activeVariant, product.images as string[]);
    
    // ✅ VARIANT SYSTEM: Create product with variant-adjusted price
    const productToAdd = activeVariant ? {
      ...product,
      price: finalPrice, // Use variant-adjusted price
    } : product;
    
    // ✅ VARIANT SYSTEM: Pass variant info as separate parameter (modulair, geen hardcode)
    addItem(
      productToAdd, 
      quantity,
      activeVariant ? {
        id: activeVariant.id,
        name: activeVariant.name,
        color: activeVariant.colorCode || activeVariant.colorName || undefined,
        image: variantImageToUse,
      } : undefined
    );
    // Direct naar winkelwagen zoals de hoofdbutton
    window.location.href = '/cart';
  };

  return (
    <div
      data-sticky-cart
      className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-500 ease-out ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      {/* Main bar - ZONDER extra padding */}
      <div className="bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Product info - RUSTIGER */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 bg-gray-50 flex-shrink-0 overflow-hidden">
                {/* ✅ VARIANT SYSTEM: Always use variant image as maatstaf if available, fallback to product image (modulair, geen hardcode) */}
                <img
                  src={variantImage || product.images?.[0] || '/images/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-700 text-sm truncate">
                  {product.name}
                  {/* ✅ VARIANT SYSTEM: Show variant name if selected (modulair, geen hardcode) */}
                  {activeVariant?.name && (
                    <span className="ml-1 text-xs text-gray-500">({activeVariant.name})</span>
                  )}
                </h3>
                <p className="text-base font-semibold text-gray-900">
                  {formatCurrency(finalPrice)}
                </p>
              </div>
            </div>

            {/* Quantity + CTA - RECHTHOEK ORANJE */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Quantity selector - compact */}
              <div className="hidden sm:flex items-center gap-2 border border-gray-300 px-2 py-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 font-semibold"
                  aria-label="Verminder aantal"
                >
                  -
                </button>
                <span className="w-8 text-center font-semibold text-gray-900 text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 font-semibold"
                  aria-label="Verhoog aantal"
                >
                  +
                </button>
              </div>

              {/* Add to cart button - ✅ EXACT ZELFDE HOEKEN: Zoals Let op kaart (rounded-xl) */}
              <button
                onClick={handleAddToCart}
                className="bg-accent hover:bg-accent-dark text-white font-bold px-6 py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] flex items-center gap-2 text-2xl"
              >
                <ShoppingCart className="h-6 w-6" />
                Winkelwagen {/* ✅ GROOT: text-2xl voor echt grote letters */}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
