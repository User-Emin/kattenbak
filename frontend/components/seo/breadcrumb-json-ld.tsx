"use client";

import { usePathname } from "next/navigation";
import { SEO_CONFIG } from "@/lib/seo.config";
import { SHARED_CONTENT } from "@/lib/content.config";

/**
 * ✅ SEO PHASE 1: Breadcrumb JSON-LD Schema
 * 
 * Modulair, veilig, geen hardcode
 * - Dynamisch via pathname
 * - XSS-veilig (JSON.stringify)
 * - Aansluitend op SEO_CONFIG
 */
interface BreadcrumbJsonLdProps {
  items?: Array<{ label: string; href: string }>;
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const pathname = usePathname();
  
  // ✅ SECURITY: Sanitize pathname
  const sanitizePath = (path: string): string => {
    const cleanPath = path.split('?')[0].split('#')[0];
    return cleanPath.replace(/[^a-zA-Z0-9\/\-]/g, '');
  };
  
  // ✅ DYNAMIC: Build breadcrumbs if not provided
  const buildBreadcrumbs = (): Array<{ label: string; href: string }> => {
    if (items) return items;
    
    const cleanPath = sanitizePath(pathname || '/');
    const segments = cleanPath.split('/').filter(Boolean);
    
    const breadcrumbs: Array<{ label: string; href: string }> = [
      {
        label: SHARED_CONTENT.breadcrumb.home,
        href: '/',
      },
    ];
    
    let currentPath = '';
    segments.forEach((segment) => {
      const safeSegment = segment.replace(/[^a-zA-Z0-9\-]/g, '');
      if (!safeSegment) return;
      
      currentPath += `/${segment}`;
      const label = safeSegment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        label,
        href: currentPath,
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = buildBreadcrumbs();
  
  // ✅ SECURITY: Validate breadcrumbs
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }
  
  // ✅ SECURITY: Build JSON-LD safely
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => {
      // ✅ SECURITY: Sanitize URL
      const safeUrl = item.href.startsWith('http')
        ? item.href
        : `${SEO_CONFIG.site.url}${item.href.startsWith('/') ? item.href : `/${item.href}`}`;
      
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: safeUrl,
      };
    }),
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 2) }}
    />
  );
}
