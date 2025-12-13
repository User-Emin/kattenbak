"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useUI } from "@/context/ui-context";
import { MiniCart } from "@/components/ui/mini-cart";
import { MovingBanner } from "@/components/ui/moving-banner";

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
      {/* Moving USP Banner + Navbar - Sticky als groep (DRY) */}
      <div className="sticky top-0 z-50">
        <MovingBanner />
        
        {/* Navbar - Direct onder banner */}
        <header className="bg-brand shadow-md">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="text-xl font-bold text-white hover:text-white/90 transition">
              Kattenbak
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-white hover:text-white/80 transition font-medium">
                Home
              </Link>
              <Link href="/over-ons" className="text-white hover:text-white/80 transition font-medium">
                Over Ons
              </Link>
              <Link href="/contact" className="text-white hover:text-white/80 transition font-medium">
                Contact
              </Link>
            </nav>

            {/* Desktop: Cart Icon - Smart routing */}
            <button
              onClick={isOnCartPage ? () => {} : handleCartToggle}
              className={`hidden md:block relative transition ${
                isOnCartPage ? 'opacity-50 cursor-default' : 'hover:opacity-80 cursor-pointer'
              }`}
              aria-label="Winkelwagen"
              title={isOnCartPage ? 'Je bent al op de winkelwagen pagina' : 'Open winkelwagen'}
            >
              <ShoppingCart className="h-6 w-6 text-white" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-bold px-1.5">
                    {itemCount}
                  </span>
                )}
            </button>

            {/* Mobile: Cart + Menu Icons - Smart routing */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={isOnCartPage ? () => {} : handleCartToggle}
                className={`relative transition ${
                  isOnCartPage ? 'opacity-50 cursor-default' : 'hover:opacity-80 cursor-pointer'
                }`}
                aria-label="Winkelwagen"
                title={isOnCartPage ? 'Je bent al op de winkelwagen pagina' : 'Open winkelwagen'}
              >
                <ShoppingCart className="h-6 w-6 text-white" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-bold px-1.5">
                    {itemCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="hover:opacity-80 transition"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <nav className="md:hidden pb-4 border-t border-white/20 mt-2 pt-4">
              <div className="flex flex-col gap-2">
                <Link href="/" className="text-white hover:text-white/80 transition font-medium px-4 py-3 hover:bg-white/10 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link href="/over-ons" className="text-white hover:text-white/80 transition font-medium px-4 py-3 hover:bg-white/10 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                  Over Ons
                </Link>
                <Link href="/contact" className="text-white hover:text-white/80 transition font-medium px-4 py-3 hover:bg-white/10 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                  Contact
                </Link>
              </div>
            </nav>
          )}
        </div>
        </header>
      </div>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
            onClick={closeCart}
          />
          <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-50 animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-medium">Winkelwagen</h2>
              <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-lg transition">
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
