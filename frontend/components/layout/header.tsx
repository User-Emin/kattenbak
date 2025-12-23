"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useUI } from "@/context/ui-context";
import { MiniCart } from "@/components/ui/mini-cart";

export function Header() {
  const { itemCount } = useCart();
  const { isCartOpen, openCart, closeCart } = useUI();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dynamisch checken of we op cart pagina zijn - DRY & Maintainable
  const isOnCartPage = pathname === '/cart';
  
  // Auto-close cart wanneer we naar cart pagina navigeren
  useEffect(() => {
    if (isOnCartPage && isCartOpen) {
      closeCart();
    }
  }, [isOnCartPage, isCartOpen, closeCart]);

  // Handler voor cart toggle met page detection
  const handleCartToggle = () => {
    if (isOnCartPage) {
      closeCart();
      return;
    }
    if (isCartOpen) {
      closeCart();
    } else {
      openCart();
    }
  };

  return (
    <>
      {/* MINIMALE NAVBAR: Super dun met groot uitstekend logo */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Logo - GROOT maar past in dunne navbar */}
            <Link href="/" className="flex items-center hover:opacity-90 transition -my-2">
              <Image
                src="/images/logo-catsupply.png"
                alt="Catsupply"
                width={280}
                height={90}
                className="h-20 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation - Compact */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-gray-700 hover:text-brand transition text-sm font-medium">
                Home
              </Link>
              <Link href="/over-ons" className="text-gray-700 hover:text-brand transition text-sm font-medium">
                Over Ons
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-brand transition text-sm font-medium">
                Contact
              </Link>
            </nav>

            {/* Desktop: Cart Icon - Compact */}
            <button
              onClick={isOnCartPage ? () => {} : handleCartToggle}
              className={`hidden md:block relative transition ${
                isOnCartPage ? 'opacity-50 cursor-default' : 'hover:opacity-80 cursor-pointer'
              }`}
              aria-label="Winkelwagen"
              title={isOnCartPage ? 'Je bent al op de winkelwagen pagina' : 'Open winkelwagen'}
            >
              <ShoppingCart className="h-6 w-6 text-brand" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-[#f76402] text-white text-xs rounded-full flex items-center justify-center font-bold px-1.5">
                    {itemCount}
                  </span>
                )}
            </button>

            {/* Mobile: Cart + Menu Icons */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={isOnCartPage ? () => {} : handleCartToggle}
                className={`relative transition ${
                  isOnCartPage ? 'opacity-50 cursor-default' : 'hover:opacity-80 cursor-pointer'
                }`}
                aria-label="Winkelwagen"
                title={isOnCartPage ? 'Je bent al op de winkelwagen pagina' : 'Open winkelwagen'}
              >
                <ShoppingCart className="h-6 w-6 text-brand" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-[#f76402] text-white text-xs rounded-full flex items-center justify-center font-bold px-1.5">
                    {itemCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="hover:opacity-80 transition"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6 text-brand" /> : <Menu className="h-6 w-6 text-brand" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu - Compact */}
          {isMobileMenuOpen && (
            <nav className="md:hidden pb-3 border-t border-gray-200 pt-3">
              <div className="flex flex-col gap-1">
                <Link href="/" className="text-gray-700 hover:text-brand hover:bg-gray-50 transition text-sm font-medium px-4 py-2 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link href="/over-ons" className="text-gray-700 hover:text-brand hover:bg-gray-50 transition text-sm font-medium px-4 py-2 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                  Over Ons
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-brand hover:bg-gray-50 transition text-sm font-medium px-4 py-2 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                  Contact
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-[150] backdrop-blur-sm"
            onClick={closeCart}
          />
          <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-[160] animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-medium">Winkelwagen</h2>
              <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded transition">
                <X className="h-6 w-6" />
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
