"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useUI } from "@/context/ui-context";
import { usePathname } from "next/navigation";
import { BRAND_COLORS_HEX } from "@/lib/color-config";

/**
 * ✅ MOBILE BOTTOM NAV - Smooth winkelwagenbutton
 * 
 * Alleen zichtbaar op mobiel (< 768px) EN alleen op productpagina's
 * Slim: Checkt pathname pattern /product/ zonder hardcode
 * Smooth animatie, altijd zichtbaar onderaan
 */
export function MobileBottomNav() {
  const { itemCount } = useCart();
  const { openCart, closeCart, isCartOpen } = useUI();
  const pathname = usePathname();
  const isOnCartPage = pathname === '/cart';
  
  // ✅ SLIM: Alleen tonen op productpagina's (pattern: /product/...)
  const isProductPage = pathname?.startsWith('/product/') || false;
  
  // ✅ NIET TONEN: Als niet op productpagina
  if (!isProductPage) {
    return null;
  }

  const handleCartClick = () => {
    if (isOnCartPage) {
      return;
    }
    if (isCartOpen) {
      closeCart();
    } else {
      openCart();
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[200] bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-center py-3 px-4">
        <button
          onClick={handleCartClick}
          disabled={isOnCartPage}
          className={`
            relative flex items-center justify-center gap-2 px-6 py-3 rounded-lg
            transition-all duration-300 transform active:scale-95
            ${isOnCartPage ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
          `}
          style={{
            backgroundColor: '#ffffff',
            color: '#129DD8',
          }}
          aria-label="Winkelwagen"
        >
          <ShoppingCart className="h-5 w-5" strokeWidth={2} style={{ color: '#129DD8' }} />
          <span className="text-sm font-semibold">Winkelwagen</span>
          {itemCount > 0 && (
            <span 
              className="absolute -top-2 -right-2 min-w-[20px] h-5 text-white text-xs rounded-full flex items-center justify-center px-1.5 font-bold"
              style={{
                backgroundColor: BRAND_COLORS_HEX.primary,
              }}
            >
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
