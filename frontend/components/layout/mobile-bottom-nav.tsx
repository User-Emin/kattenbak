"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useUI } from "@/context/ui-context";
import { usePathname } from "next/navigation";
import { DESIGN_SYSTEM } from "@/lib/design-system";
import { cn } from "@/lib/utils";

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
  
  // ✅ NIET TONEN: Als niet op productpagina of cart sidebar open
  if (!isProductPage || isCartOpen) {
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

  const nav = DESIGN_SYSTEM.layout.mobileBottomNav as typeof DESIGN_SYSTEM.layout.mobileBottomNav & {
    barBg?: string;
    barBorderColor?: string;
    buttonBg?: string;
    buttonText?: string;
    badgeBg?: string;
    badgeText?: string;
  };

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-[200] shadow-lg border-t"
      style={{
        backgroundColor: nav.barBg ?? DESIGN_SYSTEM.colors.text.primary,
        borderColor: nav.barBorderColor ?? DESIGN_SYSTEM.colors.gray[800],
      }}
    >
      <div className="flex items-center justify-center py-2.5 px-3">
        <button
          onClick={handleCartClick}
          disabled={isOnCartPage}
          className={cn(
            'relative flex items-center justify-center rounded-md transition-transform duration-200 ease-out active:scale-[0.97]',
            nav.buttonPaddingY ?? 'py-2.5',
            nav.buttonPaddingX ?? 'px-4',
            nav.buttonRounded ?? 'rounded-md',
            nav.buttonGap ?? 'gap-1.5',
            isOnCartPage ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:opacity-90'
          )}
          style={{
            backgroundColor: nav.buttonBg ?? DESIGN_SYSTEM.colors.secondary,
            color: nav.buttonText ?? DESIGN_SYSTEM.colors.text.primary,
          }}
          aria-label="Winkelwagen"
        >
          <ShoppingCart className="h-5 w-5 shrink-0" strokeWidth={2} style={{ color: nav.buttonText ?? DESIGN_SYSTEM.colors.text.primary }} />
          <span className="text-sm font-semibold">Winkelwagen</span>
          {itemCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5 font-bold tabular-nums text-xs"
              style={{
                backgroundColor: nav.badgeBg ?? DESIGN_SYSTEM.colors.text.primary,
                color: nav.badgeText ?? DESIGN_SYSTEM.colors.text.inverse,
                fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary,
              }}
            >
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
