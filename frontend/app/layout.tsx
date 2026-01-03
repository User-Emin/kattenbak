import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google"; // ✅ CALM & EXPRESSIVE (maximaal dynamisch)
import "./globals.css";
import { Header } from "@/components/layout/header";
import { UspBanner } from "@/components/layout/usp-banner";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/context/cart-context";
import { UIProvider } from "@/context/ui-context";
import { Toaster } from "sonner";
import { CookieConsentManager } from "@/components/ui/cookie-consent-manager";

// ✅ Be Vietnam Pro - Calm, expressive, modern e-commerce gevoel
// https://fonts.google.com/specimen/Be+Vietnam+Pro
const beVietnamPro = Be_Vietnam_Pro({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ["latin"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Premium Zelfreinigende Kattenbak",
  description: "Automatische kattenbak met app-bediening en gezondheidsmonitoring",
  // ✅ PERFORMANCE: Preconnect to external domains
  other: {
    'link': 'preconnect',
    'href': 'https://fonts.googleapis.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={beVietnamPro.variable}>
      <head>
        {/* ✅ PERFORMANCE: DNS prefetch & preconnect */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* ✅ URL BAR GREY (Mobile Chrome/Safari) */}
        <meta name="theme-color" content="#374151" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased font-[family-name:var(--font-be-vietnam-pro)]">
        <UIProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              {/* Header & USP Banner NIET op homepage - hero video moet direct lopen */}
              <Header />
              {/* USP Banner alleen op non-homepage pagina's */}
              <UspBanner />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </CartProvider>
          <CookieConsentManager />
        </UIProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
