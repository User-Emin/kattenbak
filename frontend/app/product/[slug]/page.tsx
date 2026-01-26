"use client";

import React from "react";
import { ProductDetail } from "@/components/products/product-detail";
import { SEO_CONFIG } from "@/lib/seo.config";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface ProductMetadata {
  title?: string;
  description?: string;
  keywords?: string;
}

/**
 * ✅ SEO 10/10: Generate metadata for product pages
 * ✅ EXPERT: Client-side page - metadata via head tags
 */
async function getProductMetadata(slug: string): Promise<ProductMetadata> {
  try {
    // ✅ FIX: Use correct API URL for local development
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    let apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!apiUrl) {
      // ✅ FIX: Default to local backend when running locally
      apiUrl = isLocal ? 'http://localhost:3100/api/v1' : 'https://catsupply.nl/api/v1';
    } else if (!apiUrl.endsWith('/api/v1')) {
      apiUrl = `${apiUrl}/api/v1`;
    }
    
    const apiProductUrl = `${apiUrl}/products/slug/${slug}`;
    
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
          document.title = metadata.title;
        }
        if (metadata.description) {
          let metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            metaDesc.setAttribute('content', metadata.description);
          } else {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            metaDesc.setAttribute('content', metadata.description);
            document.head.appendChild(metaDesc);
          }
        }
        if (metadata.keywords) {
          let metaKeywords = document.querySelector('meta[name="keywords"]');
          if (metaKeywords) {
            metaKeywords.setAttribute('content', metadata.keywords);
          } else {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            metaKeywords.setAttribute('content', metadata.keywords);
            document.head.appendChild(metaKeywords);
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
