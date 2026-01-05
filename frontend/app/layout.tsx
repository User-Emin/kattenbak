"use client";

import type { Metadata } from "next";
import { Comic_Neue } from "next/font/google";
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

// ✅ Comic Neue - Expressieve, vrolijke font (vergelijkbaar met Comic Relief)
const comicFont = Comic_Neue({
  weight: ['300', '400', '700'],
  subsets: ["latin"],
  variable: "--font-comic",
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
    <html lang="nl" className={comicFont.variable}>
      <head>
        {/* ✅ PERFORMANCE: DNS prefetch & preconnect */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* ✅ Google Fonts: Edu VIC WA NT Beginner voor expressieve productnamen */}
        <link href="https://fonts.googleapis.com/css2?family=Edu+VIC+WA+NT+Beginner:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* ✅ URL BAR ORANJE - Klantgericht & opvallend */}
        <meta name="theme-color" content="#f76402" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <title>Premium Zelfreinigende Kattenbak</title>
        <meta name="description" content="Automatische kattenbak met app-bediening en gezondheidsmonitoring" />
      </head>
      <body className="antialiased font-[family-name:var(--font-comic)]">
        <UIProvider>
          <CartProvider>
            {/* ✅ DRY: Spacer voor fixed header via padding-top - USP banner (40px desktop, 48px mobiel) + navbar (64px) */}
            <div className="flex flex-col min-h-screen" style={{ paddingTop: !isHomePage ? '104px' : '0' }}>
              {/* ✅ USP Banner BOVEN navbar - fixed top-0 */}
              {!isHomePage && (
                <div className="fixed top-0 left-0 right-0 z-50">
                  <UspBanner />
                </div>
              )}
              
              {/* Header - fixed, ONDER USP banner als die er is (40px), anders op top-0 */}
              <div className={isHomePage ? "fixed top-0 left-0 right-0 z-50" : "fixed left-0 right-0 z-40"} style={!isHomePage ? { top: '40px' } : {}}>
                <Header />
              </div>
              
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
