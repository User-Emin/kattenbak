import type { Metadata } from "next";
import { Roboto_Flex } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/context/cart-context";
import { ChatPopup } from "@/components/ui/chat-popup-rag";

const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  variable: "--font-roboto-flex",
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
    <html lang="nl" className={robotoFlex.variable}>
      <body className="antialiased">
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
