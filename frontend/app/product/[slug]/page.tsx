import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/products/product-detail";
import { Metadata } from "next";
import { SEO_CONFIG } from "@/lib/seo.config";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

/**
 * ✅ SEO 10/10: Generate metadata for product pages
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
    
    return {
      title: `${productTitle} | ${SEO_CONFIG.site.name}`,
      description: productDescription,
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
 * ✅ SEO 10/10: Export metadata for product page
 * ✅ EXPERT FIX: Robuuste metadata fetch met fallback - nooit crash
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    
    // ✅ EXPERT: Try to fetch product metadata, but never crash
    try {
      return await getProductMetadata(slug);
    } catch (metadataError: any) {
      // ✅ SECURITY: Silent fallback - log server-side only
      if (typeof window === 'undefined') {
        console.error('[Server] Metadata fetch failed (using defaults):', metadataError?.name || 'Unknown');
      }
      // Return defaults with slug-based title for better SEO
      return {
        title: `${slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} | ${SEO_CONFIG.site.name}`,
        description: SEO_CONFIG.defaults.description,
      };
    }
  } catch (error: any) {
    // ✅ SECURITY: Ultimate fallback - never crash
    if (typeof window === 'undefined') {
      console.error('[Server] generateMetadata params error:', error?.name || 'Unknown');
    }
    return {
      title: SEO_CONFIG.defaults.title,
      description: SEO_CONFIG.defaults.description,
    };
  }
}

/**
 * ✅ SECURITY & STANDARDS: Product Detail Page
 * - Server component voor SEO metadata (best practice)
 * - Client-side ProductDetail component voor interactiviteit
 * - Robuuste error handling op alle niveaus
 * - Geen data leakage via errors
 */
export default async function ProductPage({ params }: ProductPageProps) {
  // ✅ SIMPLIFIED: Direct await params without Promise.race to avoid SSR errors
  let slug: string = 'automatische-kattenbak-premium'; // Safe fallback
  
  try {
    const resolvedParams = await params;
    if (resolvedParams?.slug && typeof resolvedParams.slug === 'string' && resolvedParams.slug.length > 0) {
      slug = resolvedParams.slug;
    }
  } catch (error: any) {
    // ✅ SECURITY: Silent fallback - no error details exposed
    if (typeof window === 'undefined') {
      console.error('[Server] ProductPage params error (using fallback):', error?.name || 'Unknown');
    }
  }

  // ✅ STANDARDS: Always render - client component handles loading/errors gracefully
  return <ProductDetail slug={slug} />;
}
