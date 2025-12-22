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
}

/**
 * STICKY CART BAR - SMOOTH BOTTOM BANNER
 * Toont alleen wanneer "In Winkelwagen" button uit beeld is
 * DRY: Hergebruikt cart context, niet overweldigend, smooth
 * Design: Clean banner met prijs + CTA
 */
export function StickyCartBar({ product, addToCartButtonRef }: StickyCartBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

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

  const handleAddToCart = () => {
    addItem(product, quantity);
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
      style={{ paddingBottom: '80px' }} // Ruimte voor chat button (64px + 16px margin)
    >
      {/* Main bar - RUSTIGER DESIGN */}
      <div className="bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Product info - RUSTIGER */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 bg-gray-50 flex-shrink-0 overflow-hidden">
                <img
                  src={product.images?.[0] || '/images/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-700 text-sm truncate">
                  {product.name}
                </h3>
                <p className="text-base font-semibold text-gray-900">
                  {formatCurrency(product.price)}
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

              {/* Add to cart button - RECHTHOEK ORANJE */}
              <button
                onClick={handleAddToCart}
                className="bg-accent hover:bg-accent-dark text-white font-bold px-6 py-2.5 rounded-none transition-colors flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">In Winkelwagen</span>
                <span className="sm:hidden">Toevoegen</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
