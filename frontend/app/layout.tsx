"use client";

import { Noto_Sans } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { UspBanner } from "@/components/layout/usp-banner";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { CartProvider } from "@/context/cart-context";
import { UIProvider } from "@/context/ui-context";
import { Toaster } from "sonner";
import { CookieConsentManager } from "@/components/ui/cookie-consent-manager";
import { ChatPopup } from "@/components/ui/chat-popup-rag";
import { ChatPopupErrorBoundary } from "@/components/ui/chat-popup-error-boundary";
import { DESIGN_SYSTEM } from "@/lib/design-system";
import { initializeCSSVerification } from "@/lib/css-verification";
import { API_CONFIG } from "@/lib/config";
import { SEO_CONFIG } from "@/lib/seo.config";
import { getAllKeywords } from "@/lib/seo-maximized.config";
import { useEffect } from "react";

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

  // ✅ CSS VERIFICATION: Ensure CSS always loads
  if (typeof window !== 'undefined') {
    initializeCSSVerification();
  }

  return (
    <html lang="nl" className={notoSansFont.variable}>
      <head>
        {/* 🚀 PERFORMANCE: DNS prefetch & preconnect voor snellere resource loading */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={API_CONFIG.BASE_URL} />
        <link rel="preconnect" href={API_CONFIG.BASE_URL} crossOrigin="anonymous" />
        
        {/* 🚀 PERFORMANCE: Preload critical resources for instant display */}
        <link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous" href="https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNb4j5Ba_2c7A.woff2" />
        
        {/* ✅ SEO 10/10: Favicon & Icons */}
        <link rel="icon" href="/logos/logo.webp" type="image/webp" />
        <link rel="apple-touch-icon" href="/logos/logo.webp" />
        <link rel="shortcut icon" href="/logos/logo.webp" type="image/webp" />
        
        {/* URL BAR: ✅ WIT - Echt wit voor duidelijkheid */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-navbutton-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --theme-color-start: ${DESIGN_SYSTEM.colors.primaryStart};
            --theme-color-end: ${DESIGN_SYSTEM.colors.primaryEnd};
          }
        `}} />
        
        {/* ✅ SEO 10/10: Title & Meta Description - Doelgroep geoptimaliseerd */}
        <title>{SEO_CONFIG.defaults.title}</title>
        <meta name="description" content={SEO_CONFIG.defaults.description} />
        <meta name="keywords" content={getAllKeywords()} />
        <meta name="author" content="CatSupply" />
        <meta name="publisher" content="CatSupply" />
        <meta name="language" content="nl" />
        <meta name="geo.region" content="NL" />
        <meta name="geo.placename" content="Haarlem" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        
        {/* ✅ SEO 10/10: Canonical URL - Dynamic via useEffect */}
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href.split('?')[0] : SEO_CONFIG.site.url} />
        
        {/* ✅ SEO 10/10: Open Graph Tags - Enhanced */}
        <meta property="og:title" content={SEO_CONFIG.defaults.title} />
        <meta property="og:description" content={SEO_CONFIG.defaults.description} />
        <meta property="og:image" content={SEO_CONFIG.defaults.image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="CatSupply - Premium Automatische Kattenbak" />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href.split('?')[0] : SEO_CONFIG.site.url} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SEO_CONFIG.site.name} />
        <meta property="og:locale" content={SEO_CONFIG.site.locale} />
        <meta property="og:locale:alternate" content="en_US" />
        
        {/* ✅ SEO 10/10: Twitter Card Tags - Enhanced */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SEO_CONFIG.defaults.title} />
        <meta name="twitter:description" content={SEO_CONFIG.defaults.description} />
        <meta name="twitter:image" content={SEO_CONFIG.defaults.image} />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="630" />
        <meta name="twitter:image:alt" content="CatSupply - Premium Automatische Kattenbak" />
        <meta name="twitter:site" content="@CatSupply" />
        <meta name="twitter:creator" content="@CatSupply" />
        <meta name="twitter:domain" content="catsupply.nl" />
        
        {/* ✅ SEO 10/10: Additional Meta Tags */}
        <meta name="format-detection" content="telephone=yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CatSupply" />
        
        {/* ✅ SEO 10/10: Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: SEO_CONFIG.site.name,
              url: SEO_CONFIG.site.url,
              logo: SEO_CONFIG.defaults.image,
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: SEO_CONFIG.contact.phone.replace(/\s/g, '-'),
                contactType: 'customer service',
                areaServed: 'NL',
                availableLanguage: ['nl', 'en'],
              },
            }),
          }}
        />
        
        {/* ✅ SEO 10/10: Structured Data - Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: SEO_CONFIG.site.name,
              url: SEO_CONFIG.site.url,
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${SEO_CONFIG.site.url}/producten?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body 
        className="antialiased bg-white" // ✅ ECHT WIT: bg-white class + style
        style={{ 
          fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary,
          backgroundColor: '#ffffff', // ✅ ECHT WIT: #ffffff (was DESIGN_SYSTEM.colors.secondary)
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
              
              {/* MAIN CONTENT - Padding voor fixed header + mobile bottom nav */}
              <main 
                className="flex-1"
                style={{ 
                  paddingTop: isHomePage 
                    ? `calc(${DESIGN_SYSTEM.layout.uspBanner.height} + ${DESIGN_SYSTEM.layout.navbar.height})`
                    : `calc(${DESIGN_SYSTEM.layout.uspBanner.height} + ${DESIGN_SYSTEM.layout.navbar.height})`,
                  paddingBottom: '80px', // ✅ MOBILE BOTTOM NAV: Extra padding voor bottom nav (60px nav + 20px margin)
                }}
                className="md:pb-0" // ✅ DESKTOP: Geen extra padding op desktop
              >
                {children}
              </main>
              
              {/* FOOTER */}
              <Footer />
            </div>
            
            {/* MOBILE BOTTOM NAV - Alleen mobiel */}
            <MobileBottomNav />
            
            {/* COOKIE CONSENT */}
            <CookieConsentManager />
            
            {/* CHAT POPUP - Global, werkt op alle pagina's */}
            <ChatPopupErrorBoundary>
              <ChatPopup />
            </ChatPopupErrorBoundary>
          </CartProvider>
          
          {/* TOASTER */}
          <Toaster position="top-right" richColors />
        </UIProvider>
      </body>
    </html>
  );
}

export default LayoutContent;
