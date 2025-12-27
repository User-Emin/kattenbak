import type { Metadata } from "next";
import { Montserrat } from "next/font/google"; // ✅ PROFESSIONEEL & MODERN (maximaal dynamisch)
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/context/cart-context";
import { UIProvider } from "@/context/ui-context";
import { Toaster } from "sonner";
import { CookieConsentManager } from "@/components/ui/cookie-consent-manager";

// ✅ Montserrat - Professioneel, modern, zakelijk gevoel
const montserrat = Montserrat({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ["latin"],
  variable: "--font-montserrat",
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
    <html lang="nl" className={montserrat.variable}>
      <head>
        {/* ✅ PERFORMANCE: DNS prefetch & preconnect */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased font-[family-name:var(--font-montserrat)]">
        <UIProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              {/* Geen spacer meer nodig - navbar is sticky top-0 edge-to-edge */}
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
