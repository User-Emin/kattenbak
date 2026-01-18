import { MetadataRoute } from 'next';
import { SEO_CONFIG } from '@/lib/seo.config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SEO_CONFIG.site.url;
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/producten`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/over-ons`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/retourneren`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/algemene-voorwaarden`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Fetch products from API
  let productPages: MetadataRoute.Sitemap = [];
  
  try {
    const productsResponse = await fetch(`${SEO_CONFIG.site.url}/api/v1/products`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      if (productsData.success && productsData.data) {
        productPages = productsData.data
          .filter((product: any) => product.isActive && product.slug)
          .map((product: any) => ({
            url: `${baseUrl}/product/${product.slug}`,
            lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
          }));
      }
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    // Fallback: Add default product if API fails
    productPages = [
      {
        url: `${baseUrl}/product/automatische-kattenbak-premium`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
    ];
  }

  return [...staticPages, ...productPages];
}
