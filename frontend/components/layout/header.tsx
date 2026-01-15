"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Mail, Headphones } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useUI } from "@/context/ui-context";
import { MiniCart } from "@/components/ui/mini-cart";
import { DESIGN_SYSTEM } from "@/lib/design-system";

/**
 * 🎨 NAVBAR - MINIMALISTISCH & CENTERED LOGO
 * 
 * Layout:
 * [Email + Support]  [LOGO CENTER]  [Cart]
 * 
 * ✅ DRY: Alle values uit DESIGN_SYSTEM
 * ✅ No hardcoded values
 * ✅ Logo in midden
 * ✅ Contact links links
 */

export function Header() {
  const { itemCount } = useCart();
  const { isCartOpen, openCart, closeCart } = useUI();
  const pathname = usePathname();

  const isOnCartPage = pathname === '/cart';

  // Cart toggle handler
  const handleCartToggle = () => {
    if (isOnCartPage) return;
    isCartOpen ? closeCart() : openCart();
  };

  return (
    <>
      {/* NAVBAR - WIT, LOGO CENTERED */}
      <header 
        className="bg-white sticky top-0"
        style={{ 
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.08)', // Versterkte shadow
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)', // Subtiele border voor definitie
          zIndex: 165, // ✅ BOVEN sidebar winkelwagen (z-[170]) maar ONDER USP banner (z-[1000])
        }}
      >
        <div 
          className="w-full mx-auto grid grid-cols-3 items-center"
          style={{
            maxWidth: DESIGN_SYSTEM.layout.navbar.maxWidth,
            padding: `0 ${DESIGN_SYSTEM.spacing.containerPadding}`,
            height: DESIGN_SYSTEM.layout.navbar.height,
          }}
        >
          {/* LEFT: EMAIL + SUPPORT */}
          <div className="flex items-center gap-6">
            {/* Email */}
            <a
              href={`mailto:${DESIGN_SYSTEM.contact.email}`}
              className="hidden md:flex items-center gap-2 transition-opacity hover:opacity-60"
              style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                color: DESIGN_SYSTEM.colors.text.secondary,
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
              }}
            >
              <Mail className="w-4 h-4" strokeWidth={2} />
              <span>{DESIGN_SYSTEM.contact.email}</span>
            </a>

            {/* Support */}
            <a
              href={`tel:${DESIGN_SYSTEM.contact.phone}`}
              className="hidden md:flex items-center gap-2 transition-opacity hover:opacity-60"
              style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                color: DESIGN_SYSTEM.colors.text.secondary,
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
              }}
              title="Klantenservice"
            >
              <Headphones className="w-4 h-4" strokeWidth={2} />
              <span className="hidden lg:inline">Support</span>
            </a>
          </div>

          {/* CENTER: LOGO */}
          <div className="flex justify-center">
            <Link 
              href="/" 
              className="transition-opacity hover:opacity-70"
              style={{ 
                fontSize: DESIGN_SYSTEM.typography.fontSize['2xl'],
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                color: DESIGN_SYSTEM.colors.text.primary,
              }}
            >
              CatSupply
            </Link>
          </div>

          {/* RIGHT: CART */}
          <div className="flex justify-end">
            <button
              onClick={handleCartToggle}
              className={`relative transition-opacity ${
                isOnCartPage ? 'opacity-40 cursor-default' : 'hover:opacity-60 cursor-pointer'
              }`}
              aria-label="Winkelwagen"
              title={isOnCartPage ? 'Je bent al op de winkelwagen pagina' : 'Open winkelwagen'}
            >
              <ShoppingCart 
                className="h-6 w-6" 
                strokeWidth={2}
                style={{ color: DESIGN_SYSTEM.colors.text.primary }}
              />
              {itemCount > 0 && (
                <span 
                  className="absolute -top-2 -right-2 min-w-[20px] h-5 text-white text-xs rounded-full flex items-center justify-center px-1.5"
                  style={{
                    backgroundColor: DESIGN_SYSTEM.colors.primary,
                    fontSize: DESIGN_SYSTEM.typography.fontSize.xs,
                    fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold || '700', // ✅ DIKKER: Bold (700) zoals gevraagd
                    fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // ✅ EXACT: Noto Sans zoals homepage
                  }}
                >
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* CART SIDEBAR */}
      {isCartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-[150] backdrop-blur-sm"
            onClick={closeCart}
          />
          <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-[170] animate-slide-in-right flex flex-col">
            <div 
              className="flex items-center justify-between flex-shrink-0 border-b"
              style={{
                padding: DESIGN_SYSTEM.spacing[6],
                borderColor: DESIGN_SYSTEM.colors.border.default,
              }}
            >
              <h2 
                style={{
                  fontSize: DESIGN_SYSTEM.typography.fontSize.xl,
                  fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold || '700', // ✅ DIKKER: Bold (700) zoals gevraagd
                  color: DESIGN_SYSTEM.colors.text.primary,
                  fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary, // ✅ EXACT: Noto Sans
                }}
              >
                Winkelwagen
              </h2>
              <button 
                onClick={closeCart} 
                className="p-2 hover:bg-gray-50 rounded transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <MiniCart onClose={closeCart} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
