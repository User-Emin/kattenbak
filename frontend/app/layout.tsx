import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/context/cart-context";
import { ChatPopup } from "@/components/ui/chat-popup-rag";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Premium Zelfreinigende Kattenbak",
  description: "Automatische kattenbak met app-bediening en gezondheidsmonitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={montserrat.variable}>
      <body className="antialiased font-sans">
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            {/* Geen spacer meer nodig - navbar is sticky top-0 edge-to-edge */}
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          {/* Chat button - GLOBAL op alle paginas */}
          <ChatPopup />
        </CartProvider>
      </body>
    </html>
  );
}
