"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SEO_CONFIG } from "@/lib/seo.config";
import { SHARED_CONTENT } from "@/lib/content.config";
import { SITE_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

/**
 * ✅ SEO PHASE 1: Breadcrumb Navigation Component
 * 
 * Modulair, veilig, geen hardcode
 * - Dynamisch via pathname
 * - XSS-veilig (Next.js Link)
 * - Aansluitend op SEO_CONFIG en SHARED_CONTENT
 */
interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbNavigationProps {
  className?: string;
  showHome?: boolean;
}

export function BreadcrumbNavigation({ 
  className,
  showHome = true 
}: BreadcrumbNavigationProps) {
  const pathname = usePathname();
  
  // ✅ SECURITY: Sanitize pathname - alleen geldige paths
  const sanitizePath = (path: string): string => {
    // Remove query params and hash
    const cleanPath = path.split('?')[0].split('#')[0];
    // Only allow alphanumeric, slashes, and hyphens
    return cleanPath.replace(/[^a-zA-Z0-9\/\-]/g, '');
  };
  
  // ✅ DYNAMIC: Build breadcrumbs from pathname
  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    const cleanPath = sanitizePath(pathname || '/');
    const segments = cleanPath.split('/').filter(Boolean);
    
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // ✅ HOME: Altijd eerste item (via SHARED_CONTENT)
    if (showHome) {
      breadcrumbs.push({
        label: SHARED_CONTENT.breadcrumb.home,
        href: '/',
      });
    }
    
    // ✅ DYNAMIC: Build path segments
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // ✅ SECURITY: Validate segment (geen injectie)
      const safeSegment = segment.replace(/[^a-zA-Z0-9\-]/g, '');
      if (!safeSegment) return;
      
      // ✅ LABEL: Human-readable; "product" → "Producten" (SEO product focus)
      const label = segment === 'product'
        ? 'Producten'
        : safeSegment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      // ✅ Product segment links to default product (producten redirect)
      const href = segment === 'product' ? `/product/${SITE_CONFIG.DEFAULT_PRODUCT_SLUG}` : currentPath;

      breadcrumbs.push({ label, href });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = buildBreadcrumbs();
  
  // ✅ SECURITY: Don't render if no breadcrumbs (except home)
  if (breadcrumbs.length === 0) {
    return null;
  }
  
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center min-w-0 text-xs md:text-sm', className)}
    >
      <ol className="flex items-center flex-wrap gap-x-1 md:gap-x-2 min-w-0" itemScope itemType="https://schema.org/BreadcrumbList">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li
              key={item.href}
              className="flex items-center min-w-0"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {isLast ? (
                <span
                  className="text-gray-600 font-medium truncate max-w-[140px] md:max-w-none"
                  itemProp="name"
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-gray-700 transition-colors whitespace-nowrap shrink-0"
                    itemProp="item"
                  >
                    <span itemProp="name">{item.label}</span>
                  </Link>
                  <meta itemProp="position" content={String(index + 1)} />
                  <span className="mx-1 md:mx-1.5 text-gray-300 shrink-0">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
