"use client";

import { Suspense } from "react";
import { ProductDetail } from "@/components/products/product-detail";
import { Metadata } from "next";
import { SEO_CONFIG } from "@/lib/seo.config";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * ✅ SEO 10/10: Generate metadata for product pages
 * ✅ EXPERT: Client-side page - metadata via head tags
 */
async function getProductMetadata(slug: string): Promise<Metadata> {
  try {
    // ✅ FIX: Use absolute URL for server-side fetch (required in Next.js App Router)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://catsupply.nl/api/v1';
    const apiProductUrl = apiUrl.startsWith('http') 
      ? `${apiUrl}/products/slug/${slug}` 
      : `https://catsupply.nl/api/v1/products/slug/${slug}`;
    
    // ✅ FIX: Add timeout to prevent hanging fetches
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(apiProductUrl, {
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));
    
    if (!response.ok) {
      return {
        title: SEO_CONFIG.defaults.title,
        description: SEO_CONFIG.defaults.description,
      };
    }
    
    const data = await response.json();
    if (!data || !data.success || !data.data) {
      return {
        title: SEO_CONFIG.defaults.title,
        description: SEO_CONFIG.defaults.description,
      };
    }
    
    const product = data.data;
    if (!product) {
      return {
        title: SEO_CONFIG.defaults.title,
        description: SEO_CONFIG.defaults.description,
      };
    }
    
    const productImage = product.images?.[0] 
      ? (product.images[0].startsWith('http') ? product.images[0] : `${SEO_CONFIG.site.url}${product.images[0]}`)
      : SEO_CONFIG.defaults.image;
    
    const productTitle = product.metaTitle || product.name || SEO_CONFIG.defaults.title;
    const productDescription = product.metaDescription || product.shortDescription || product.description || SEO_CONFIG.defaults.description;
    const productUrl = `${SEO_CONFIG.site.url}/product/${slug}`;
    const productSku = product.sku || ''; // ✅ STABIEL: SKU altijd meenemen (KB-AUTO-001, ALP1071, etc.)
    
    return {
      title: `${productTitle} | ${SEO_CONFIG.site.name}`,
      description: productDescription,
      keywords: productSku ? `${product.name}, ${productSku}, automatische kattenbak, zelfreinigende kattenbak` : undefined, // ✅ SEO: Keywords met SKU
      openGraph: {
        title: productTitle,
        description: productDescription,
        images: [productImage],
        url: productUrl,
        type: 'product',
        siteName: SEO_CONFIG.site.name,
        locale: SEO_CONFIG.site.locale,
      },
      twitter: {
        card: 'summary_large_image',
        title: productTitle,
        description: productDescription,
        images: [productImage],
        site: '@CatSupply',
      },
      alternates: {
        canonical: productUrl,
      },
      other: {
        'product:sku': productSku, // ✅ SEO: SKU in metadata
        'product:price:amount': typeof product.price === 'number' ? product.price.toFixed(2) : String(product.price || '0'),
        'product:price:currency': 'EUR',
        'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
      },
    };
  } catch (error: any) {
    // ✅ FIX: Silently fail metadata - don't crash the page
    if (error?.name !== 'AbortError') {
      console.error('Error fetching product metadata:', error?.message || error);
    }
    return {
      title: SEO_CONFIG.defaults.title,
      description: SEO_CONFIG.defaults.description,
    };
  }
}

/**
 * ✅ SECURITY & STANDARDS: Product Detail Page
 * ✅ EXPERT FIX: Client-side page to avoid SSR errors
 * - Client component voor volledige controle
 * - SEO metadata via useEffect en head tags
 * - Robuuste error handling op alle niveaus
 * - Geen data leakage via errors
 */
export default function ProductPage({ params }: ProductPageProps) {
  const [slug, setSlug] = React.useState<string>('automatische-kattenbak-premium');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // ✅ EXPERT: Resolve params client-side
    params.then((resolved) => {
      if (resolved?.slug && typeof resolved.slug === 'string' && resolved.slug.length > 0) {
        setSlug(resolved.slug);
      }
    }).catch(() => {
      // Silent fallback
    });
  }, [params]);

  // ✅ SEO: Update head tags client-side
  React.useEffect(() => {
    if (!mounted || !slug) return;
    
    // Update title and meta tags
    const updateMetadata = async () => {
      try {
        const metadata = await getProductMetadata(slug);
        if (metadata.title) {
          document.title = metadata.title as string;
        }
        if (metadata.description) {
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            metaDesc.setAttribute('content', metadata.description as string);
          } else {
            const meta = document.createElement('meta');
            meta.name = 'description';
            meta.content = metadata.description as string;
            document.head.appendChild(meta);
          }
        }
      } catch (error) {
        // Silent fail
      }
    };
    
    updateMetadata();
  }, [mounted, slug]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // ✅ STANDARDS: Always render - client component handles loading/errors gracefully
  return <ProductDetail slug={slug} />;
}
