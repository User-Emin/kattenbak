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
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  return getProductMetadata(slug);
}

/**
 * Product Detail Page - Server component with metadata
 */
export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const { slug } = await params;

    // Fetch product client-side
    return <ProductDetail slug={slug} />;
  } catch (error) {
    // ✅ FIX: Catch any errors during params parsing or component rendering
    console.error('ProductPage render error:', error);
    // Still render the ProductDetail component - let it handle the error client-side
    const { slug } = await params;
    return <ProductDetail slug={slug} />;
  }
}
