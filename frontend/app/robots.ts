import { MetadataRoute } from 'next';
import { SEO_CONFIG } from '@/lib/seo.config';

/**
 * ✅ SEO 10/10: Robots.txt
 * 
 * Optimaliseert crawler toegang en indexing
 * - Sitemap locatie
 * - Crawl directives
 * - Disallow rules voor admin/API
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/dashboard/',
          '/checkout/',
          '/cart',
          '/orders/',
          '/success',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
        ],
      },
    ],
    sitemap: `${SEO_CONFIG.site.url}/sitemap.xml`,
  };
}
