'use client';

import { useState, useEffect, useRef } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/types/product';

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
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-500 ease-out ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      {/* Gradient fade effect */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-white pointer-events-none -translate-y-full" />
      
      {/* Main bar */}
      <div className="bg-white border-t-2 border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Product info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                <img
                  src={product.images?.[0] || '/images/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-brand">
                  €{product.price.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Quantity + CTA */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Quantity selector - compact */}
              <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded flex items-center justify-center hover:bg-white transition-colors text-gray-600 font-semibold"
                  aria-label="Verminder aantal"
                >
                  -
                </button>
                <span className="w-8 text-center font-semibold text-gray-900 text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded flex items-center justify-center hover:bg-white transition-colors text-gray-600 font-semibold"
                  aria-label="Verhoog aantal"
                >
                  +
                </button>
              </div>

              {/* Add to cart button */}
              <Button
                variant="cta"
                size="lg"
                onClick={handleAddToCart}
                leftIcon={<ShoppingCart className="h-5 w-5" />}
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                <span className="hidden sm:inline">In Winkelwagen</span>
                <span className="sm:hidden">Toevoegen</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
