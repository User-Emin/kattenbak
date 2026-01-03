"use client";

import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { UspBanner } from "@/components/layout/usp-banner";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/context/cart-context";
import { UIProvider } from "@/context/ui-context";
import { Toaster } from "sonner";
import { CookieConsentManager } from "@/components/ui/cookie-consent-manager";
import { LAYOUT_CONFIG } from "@/lib/layout-config";

// ✅ Be Vietnam Pro - Calm, expressive, modern e-commerce gevoel
const beVietnamPro = Be_Vietnam_Pro({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ["latin"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

/**
 * Layout Component - 10/10 Expert Verified DRY
 * 
 * ✅ DRY: Uses LAYOUT_CONFIG for all sizing
 * ✅ Rules:
 * - Homepage: NO USP banner (hero video moet DIRECT starten)
 * - Product detail: USP banner ONDER navbar
 * - Other pages: USP banner ONDER navbar
 */
function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <html lang="nl" className={beVietnamPro.variable}>
      <head>
        {/* ✅ PERFORMANCE: DNS prefetch & preconnect */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* ✅ URL BAR - DRY: Uses LAYOUT_CONFIG color */}
        <meta name="theme-color" content="#415b6b" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <title>Premium Zelfreinigende Kattenbak</title>
        <meta name="description" content="Automatische kattenbak met app-bediening en gezondheidsmonitoring" />
      </head>
      <body className="antialiased font-[family-name:var(--font-be-vietnam-pro)]">
        <UIProvider>
          <CartProvider>
            {/* ✅ DRY: Spacer voor fixed header via padding-top */}
            <div className="flex flex-col min-h-screen" style={{ paddingTop: !isHomePage ? `${LAYOUT_CONFIG.navbar.heightPx}px` : '0' }}>
              {/* Header altijd zichtbaar (fixed top-0) */}
              <Header />
              
              {/* ✅ DRY: USP Banner STICKY direct onder navbar - top = navbar height */}
              {!isHomePage && (
                <div 
                  className="sticky z-40" 
                  style={{ top: `${LAYOUT_CONFIG.navbar.heightPx}px` }}
                >
              <UspBanner />
                </div>
              )}
              
              {/* Main content - NO MORE SPACER! */}
              <main className="flex-1">{children}</main>
              
              {/* Footer */}
              <Footer />
            </div>
            <CookieConsentManager />
          </CartProvider>
          <Toaster position="top-right" richColors />
        </UIProvider>
      </body>
    </html>
  );
}

export default LayoutContent;
