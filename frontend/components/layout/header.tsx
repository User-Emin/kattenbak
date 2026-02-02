"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Mail, Headphones, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useUI } from "@/context/ui-context";
import { MiniCart } from "@/components/ui/mini-cart";
import { DESIGN_SYSTEM } from "@/lib/design-system";
import { cn } from "@/lib/utils";

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

const NAV = DESIGN_SYSTEM.layout.navbar as { logoPath?: string; logoPathFallback?: string; textColor?: string };

export function Header() {
  const { itemCount } = useCart();
  const { isCartOpen, openCart, closeCart } = useUI();
  const pathname = usePathname();
  const [logoShowPlaceholder, setLogoShowPlaceholder] = useState(false);

  const isOnCartPage = pathname === '/cart';

  // Cart toggle handler - ✅ NAVBAR SYMBOOL: Sidebar openen, WINKELWAGENBUTTON: Direct verwijzing
  const handleCartToggle = () => {
    if (isOnCartPage) return;
    // ✅ NAVBAR SYMBOOL: Sidebar openen (niet direct navigeren)
    isCartOpen ? closeCart() : openCart();
  };
  
  // ✅ WINKELWAGENBUTTON: Direct verwijzing naar winkelwagenpagina (aparte handler)
  const handleCartButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOnCartPage) return;
    // ✅ DIRECT: Navigeer direct naar winkelwagenpagina
    window.location.href = '/cart';
  };

  return (
    <>
      {/* NAVBAR – passender grijs, logo + winkelwagen direct in balk (geen extra witruimte) */}
      <header 
        className="sticky top-0"
        style={{ 
          backgroundColor: DESIGN_SYSTEM.layout.navbar.bg,
          color: (DESIGN_SYSTEM.layout.navbar as { textColor?: string }).textColor ?? '#ffffff',
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 165,
        }}
      >
        <div 
          className="w-full mx-auto relative flex items-center justify-center md:grid md:grid-cols-3 px-3 sm:px-4 md:px-6 lg:px-12"
          style={{
            maxWidth: DESIGN_SYSTEM.layout.navbar.maxWidth,
            height: DESIGN_SYSTEM.layout.navbar.height,
            minHeight: DESIGN_SYSTEM.layout.navbar.height,
          }}
        >
          {/* LEFT: EMAIL + SUPPORT - MOBIEL: LEEG, DESKTOP: EMAIL + SUPPORT */}
          <div className="hidden md:flex items-center gap-6">
            {/* Email - Alleen desktop */}
            <a
              href={`mailto:${DESIGN_SYSTEM.contact.email}`}
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
              style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                color: (DESIGN_SYSTEM.layout.navbar as { textColor?: string }).textColor ?? '#ffffff',
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
              }}
            >
              <Mail className="w-4 h-4" strokeWidth={2} />
              <span>{DESIGN_SYSTEM.contact.email}</span>
            </a>

            {/* Support - Alleen desktop */}
            <a
              href={`tel:${DESIGN_SYSTEM.contact.phone}`}
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
              style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                color: (DESIGN_SYSTEM.layout.navbar as { textColor?: string }).textColor ?? '#ffffff',
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.normal,
              }}
              title="Klantenservice"
            >
              <Headphones className="w-4 h-4" strokeWidth={2} />
              <span className="hidden lg:inline">Support</span>
            </a>
          </div>

          {/* CENTER: LOGO - MOBIEL: CENTER, DESKTOP: CENTER - ✅ DRY: Via DESIGN_SYSTEM */}
          <div 
            className="flex items-center justify-center" 
            style={{ 
              height: '100%', 
              margin: 0, 
              padding: 0,
            }}
          >
            <Link 
              href="/" 
              className="transition-opacity hover:opacity-80 flex items-center justify-center"
              style={{ display: 'flex', alignItems: 'center', height: '100%', margin: 0, padding: 0 }}
            >
              {logoShowPlaceholder ? (
                <div
                  className="flex items-center justify-center bg-gray-600 text-white text-sm font-medium rounded md:max-h-[80px] md:max-w-[300px]"
                  style={{ height: '50px', maxHeight: '50px', minWidth: '120px', maxWidth: '150px' }}
                  title="Logo (placeholder)"
                >
                  Logo
                </div>
              ) : (
                <img
                  src={NAV.logoPath ?? '/logos/logo.png'}
                  alt="CatSupply Logo"
                  style={{
                    height: '50px',
                    maxHeight: '50px',
                    width: 'auto',
                    maxWidth: '150px',
                    display: 'block',
                    objectFit: 'contain',
                    margin: 0,
                    padding: 0,
                  }}
                  className="md:h-full md:max-h-[80px] md:max-w-[300px]"
                  loading="eager"
                  fetchPriority="high"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const fallback = NAV.logoPathFallback ?? '/logos/logo-navbar-original.png';
                    const base = typeof window !== 'undefined' ? window.location.origin : '';
                    const current = target.src.replace(base, '');
                    if (current.includes('logo.webp')) {
                      setLogoShowPlaceholder(true);
                      target.style.display = 'none';
                    } else if (current.includes('logo-navbar-original') || current.endsWith(fallback.replace(/^\//, ''))) {
                      target.src = '/logos/logo.webp';
                    } else {
                      target.src = fallback;
                    }
                  }}
                />
              )}
            </Link>
          </div>

          {/* RIGHT: Winkelwagenbutton direct in navbar – blauw, tekst wit (design system) */}
          <div className="absolute right-4 sm:right-5 md:relative md:right-auto flex items-center">
            <button
              onClick={handleCartToggle}
              className="relative flex items-center justify-center gap-1.5 py-2 px-3 rounded-md transition-opacity hover:opacity-90"
              style={{
                backgroundColor: (DESIGN_SYSTEM.layout.navbar as { cartButtonBg?: string }).cartButtonBg,
                color: (DESIGN_SYSTEM.layout.navbar as { cartButtonText?: string }).cartButtonText,
              }}
              aria-label="Winkelwagen"
              title={isOnCartPage ? 'Je bent al op de winkelwagen pagina' : 'Open winkelwagen'}
            >
              <ShoppingCart className="h-6 w-6" strokeWidth={2} style={{ color: (DESIGN_SYSTEM.layout.navbar as { cartButtonText?: string }).cartButtonText }} />
              {itemCount > 0 && (
                <span 
                  className="min-w-[20px] h-5 text-xs rounded-full flex items-center justify-center px-1.5 font-bold"
                  style={{
                    backgroundColor: (DESIGN_SYSTEM.layout.navbar as { cartButtonBg?: string }).cartButtonBg,
                    color: (DESIGN_SYSTEM.layout.navbar as { cartButtonText?: string }).cartButtonText,
                    fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary,
                  }}
                >
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* CART SIDEBAR - ✅ OPTIMAAL MOBIEL: Swipe to close, betere sluit functionaliteit */}
      {isCartOpen && (
        <>
          <div
            className={cn('fixed inset-0 backdrop-blur-sm', DESIGN_SYSTEM.layout.sidebarZIndex.sidebarBackdrop)}
            style={{
              background: 'linear-gradient(135deg, rgba(60, 60, 61, 0.2) 0%, rgba(122, 122, 125, 0.2) 100%)', // ✅ GRADIENT met opacity (was bg-black/20)
            }}
            onClick={closeCart}
          />
          <div 
            className={cn(
              'fixed right-0 w-full max-w-md bg-white shadow-2xl animate-slide-in-right flex flex-col',
              DESIGN_SYSTEM.layout.sidebarZIndex.sidebar,
              'md:w-96' // ✅ DESKTOP: Vaste breedte op desktop
            )}
            style={{
              top: DESIGN_SYSTEM.layout.header.totalHeight, // ✅ DRY: Start onder banner + navbar (geen overlap)
              height: `calc(100vh - ${DESIGN_SYSTEM.layout.header.totalHeight})`, // ✅ DRY: Volledige hoogte minus banner + navbar
            }}
          >
            {/* ✅ HEADER: Duidelijke sluit button */}
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
                aria-label="Sluit winkelwagen"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {/* ✅ CONTENT: Scrollbaar met optimale mobiele layout */}
            <div className="flex-1 overflow-hidden">
              <MiniCart onClose={closeCart} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
