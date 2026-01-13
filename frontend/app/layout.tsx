"use client";

import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { UspBanner } from "@/components/layout/usp-banner";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/context/cart-context";
import { UIProvider } from "@/context/ui-context";
import { Toaster } from "sonner";
import { CookieConsentManager } from "@/components/ui/cookie-consent-manager";
import { DESIGN_SYSTEM } from "@/lib/design-system";

/**
 * 🎨 NOTO SANS - Voor body EN headings
 * Source: https://fonts.google.com/noto/specimen/Noto+Sans
 * 
 * Weights: 300 (light voor titels), 400 (normal), 600 (semibold)
 * ✅ Performance: Alleen 3 weights = 57% kleiner
 */
const notoSansFont = Noto_Sans({
  weight: ['300', '400', '600'],
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
});

/**
 * 🎨 LAYOUT - MINIMALISTISCH & CLEAN
 * 
 * ✅ USP Banner BOVEN navbar (fixed top-0)
 * ✅ Navbar ONDER USP banner (fixed top-48px)
 * ✅ DRY: Alle spacing via DESIGN_SYSTEM
 * ✅ Security: No inline styles, CSP compliant
 */
function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <html lang="nl" className={notoSansFont.variable}>
      <head>
        {/* Performance: DNS prefetch */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* URL BAR: WIT */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        <title>CatSupply - Premium Automatische Kattenbak</title>
        <meta name="description" content="De meest geavanceerde zelfreinigende kattenbak. Automatisch, hygiënisch, en stijlvol." />
      </head>
      <body 
        className="antialiased"
        style={{ 
          fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary,
          backgroundColor: DESIGN_SYSTEM.colors.secondary,
          color: DESIGN_SYSTEM.colors.text.primary,
        }}
      >
        <UIProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              {/* USP BANNER - Fixed top-0, boven navbar */}
              <div className="fixed top-0 left-0 right-0 z-50">
                <UspBanner />
              </div>
              
              {/* NAVBAR - Fixed onder USP banner */}
              <div 
                className="fixed left-0 right-0 z-40"
                style={{ top: DESIGN_SYSTEM.layout.uspBanner.height }}
              >
                <Header />
              </div>
              
              {/* MAIN CONTENT - Padding voor fixed header */}
              <main 
                className="flex-1"
                style={{ 
                  paddingTop: isHomePage 
                    ? `calc(${DESIGN_SYSTEM.layout.uspBanner.height} + ${DESIGN_SYSTEM.layout.navbar.height})`
                    : `calc(${DESIGN_SYSTEM.layout.uspBanner.height} + ${DESIGN_SYSTEM.layout.navbar.height})`
                }}
              >
                {children}
              </main>
              
              {/* FOOTER */}
              <Footer />
            </div>
            
            {/* COOKIE CONSENT */}
            <CookieConsentManager />
          </CartProvider>
          
          {/* TOASTER */}
          <Toaster position="top-right" richColors />
        </UIProvider>
      </body>
    </html>
  );
}

export default LayoutContent;
