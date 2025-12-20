"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { MiniCart } from "@/components/ui/mini-cart";
import { MovingBanner } from "@/components/ui/moving-banner";

export function Header() {
  const { itemCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isOnCartPage = pathname === '/cart';
  
  useEffect(() => {
    if (isOnCartPage && isCartOpen) {
      setIsCartOpen(false);
    }
  }, [isOnCartPage, isCartOpen]);

  const handleCartToggle = () => {
    if (isOnCartPage) {
      setIsCartOpen(false);
      return;
    }
    setIsCartOpen(!isCartOpen);
  };

  return (
    <>
      {/* MOVING BANNER - BOVEN navbar */}
      <MovingBanner />

      {/* NAVBAR - ONDER banner */}
      <header className="sticky top-0 z-50 w-full">
        <div className="bg-gradient-to-br from-brand to-brand-dark">
          <div className="container mx-auto px-6 lg:px-10">
            <div className="flex items-center justify-between h-16 relative">
            {/* LOGO - Echte PNG zonder filter */}
            <Link href="/" className="flex items-center hover:opacity-90 transition absolute left-2 top-1/2 -translate-y-1/2">
              <img 
                src="/logo-catsupply.png" 
                alt="Catsupply Logo" 
                className="h-40 w-auto object-contain drop-shadow-lg"
                style={{
                  maxHeight: 'none', 
                  minHeight: '160px', 
                  height: '160px',
                }}
              />
            </Link>

            {/* Desktop Navigation - WITTE text voor blauwe navbar */}
            <nav className="hidden md:flex items-center gap-6 ml-auto mr-4">
              <Link href="/" className="text-white hover:text-white/80 transition font-semibold text-sm">
                Home
              </Link>
              <Link href="/over-ons" className="text-white hover:text-white/80 transition font-semibold text-sm">
                Over Ons
              </Link>
              <Link href="/contact" className="text-white hover:text-white/80 transition font-semibold text-sm">
                Contact
              </Link>
            </nav>

            {/* Desktop: Cart Icon - WIT */}
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
                <span className="absolute -top-2 -right-2 min-w-[18px] h-4 bg-accent text-white text-xs rounded-full flex items-center justify-center font-bold px-1">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile: Cart + Menu Icons - WIT */}
            <div className="md:hidden flex items-center gap-2 ml-auto">
              <button
                onClick={isOnCartPage ? () => {} : handleCartToggle}
                className={`relative transition ${
                  isOnCartPage ? 'opacity-50 cursor-default' : 'hover:opacity-80 cursor-pointer'
                }`}
                aria-label="Winkelwagen"
                title={isOnCartPage ? 'Je bent al op de winkelwagen pagina' : 'Open winkelwagen'}
              >
                <ShoppingCart className="h-5 w-5 text-white" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-accent text-white text-xs rounded-full flex items-center justify-center font-bold px-1">
                    {itemCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="hover:opacity-80 transition"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu - BLAUWE achtergrond met witte text */}
          {isMobileMenuOpen && (
            <nav className="md:hidden pb-3 border-t border-brand-dark pt-3 bg-gradient-to-br from-brand to-brand-dark">
              <div className="flex flex-col gap-1">
                <Link href="/" className="text-white hover:text-white/80 hover:bg-white/10 transition font-semibold px-3 py-2 text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link href="/over-ons" className="text-white hover:text-white/80 hover:bg-white/10 transition font-semibold px-3 py-2 text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  Over Ons
                </Link>
                <Link href="/contact" className="text-white hover:text-white/80 hover:bg-white/10 transition font-semibold px-3 py-2 text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  Contact
                </Link>
              </div>
            </nav>
          )}
          </div>
        </div>
      </header>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-50 animate-slide-in-right flex flex-col border-t-2 border-brand">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-medium">Winkelwagen</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <MiniCart onClose={() => setIsCartOpen(false)} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
