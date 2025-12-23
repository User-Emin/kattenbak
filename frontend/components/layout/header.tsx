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
      {/* GRIJZE NAVBAR: DUN met MEGA GROOT uitstekend logo */}
      <header className="sticky top-0 z-50 bg-brand shadow-md">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Proportioneel: iets groter dan nav tekst */}
            <Link href="/" className="flex items-center hover:opacity-90 transition">
              <Image
                src="/images/logo-catsupply.png"
                alt="Catsupply"
                width={180}
                height={60}
                className="h-12 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-white hover:text-white/80 transition font-medium text-base">
                Home
              </Link>
              <Link href="/over-ons" className="text-white hover:text-white/80 transition font-medium text-base">
                Over Ons
              </Link>
              <Link href="/contact" className="text-white hover:text-white/80 transition font-medium text-base">
                Contact
              </Link>
            </nav>

            {/* Desktop: Cart Icon */}
            <button
              onClick={isOnCartPage ? () => {} : handleCartToggle}
              className={`hidden md:block relative transition ${
                isOnCartPage ? 'opacity-50 cursor-default' : 'hover:opacity-80 cursor-pointer'
              }`}
              aria-label="Winkelwagen"
              title={isOnCartPage ? 'Je bent al op de winkelwagen pagina' : 'Open winkelwagen'}
            >
              <ShoppingCart className="h-7 w-7 text-white" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[22px] h-6 bg-[#f76402] text-white text-xs rounded-full flex items-center justify-center font-bold px-2">
                    {itemCount}
                  </span>
                )}
            </button>

            {/* Mobile: Cart + Menu Icons */}
            <div className="md:hidden flex items-center gap-4">
              <button
                onClick={isOnCartPage ? () => {} : handleCartToggle}
                className={`relative transition ${
                  isOnCartPage ? 'opacity-50 cursor-default' : 'hover:opacity-80 cursor-pointer'
                }`}
                aria-label="Winkelwagen"
                title={isOnCartPage ? 'Je bent al op de winkelwagen pagina' : 'Open winkelwagen'}
              >
                <ShoppingCart className="h-7 w-7 text-white" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[22px] h-6 bg-[#f76402] text-white text-xs rounded-full flex items-center justify-center font-bold px-2">
                    {itemCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="hover:opacity-80 transition"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="h-7 w-7 text-white" /> : <Menu className="h-7 w-7 text-white" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <nav className="md:hidden pb-4 border-t border-white/20 mt-3 pt-4">
              <div className="flex flex-col gap-2">
                <Link href="/" className="text-white hover:text-white/80 transition font-medium px-4 py-3 hover:bg-white/10 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link href="/over-ons" className="text-white hover:text-white/80 transition font-medium px-4 py-3 hover:bg-white/10 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                  Over Ons
                </Link>
                <Link href="/contact" className="text-white hover:text-white/80 transition font-medium px-4 py-3 hover:bg-white/10 rounded" onClick={() => setIsMobileMenuOpen(false)}>
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
