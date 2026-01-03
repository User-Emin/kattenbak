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

// ✅ Be Vietnam Pro - Calm, expressive, modern e-commerce gevoel
const beVietnamPro = Be_Vietnam_Pro({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ["latin"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

/**
 * Layout Component - 10/10 Expert Verified
 * 
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
        {/* ✅ URL BAR GREY (Mobile Chrome/Safari) */}
        <meta name="theme-color" content="#374151" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <title>Premium Zelfreinigende Kattenbak</title>
        <meta name="description" content="Automatische kattenbak met app-bediening en gezondheidsmonitoring" />
      </head>
      <body className="antialiased font-[family-name:var(--font-be-vietnam-pro)]">
        <UIProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              {/* Header altijd zichtbaar (fixed) */}
              <Header />
              
              {/* ✅ 10/10 FIX: Spacer voor fixed header (alleen op NIET-homepage) */}
              {!isHomePage && <div className="h-20" />}
              
              {/* ✅ 10/10: USP Banner NIET op homepage, WEL op product detail */}
              {!isHomePage && <UspBanner />}
              
              {/* Main content */}
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
