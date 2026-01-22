"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SEO_CONFIG } from "@/lib/seo.config";
import { SHARED_CONTENT } from "@/lib/content.config";
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
      
      // ✅ LABEL: Human-readable label (capitalize, replace hyphens)
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
  
  // ✅ SECURITY: Don't render if no breadcrumbs (except home)
  if (breadcrumbs.length === 0) {
    return null;
  }
  
  return (
    <nav 
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-2 text-sm', className)}
    >
      <ol className="flex items-center space-x-2" itemScope itemType="https://schema.org/BreadcrumbList">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li 
              key={item.href}
              className="flex items-center"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {isLast ? (
                // ✅ LAST ITEM: Current page (no link)
                <span 
                  className="text-gray-600 font-medium"
                  itemProp="name"
                >
                  {item.label}
                </span>
              ) : (
                // ✅ LINK: Previous pages
                <>
                  <Link
                    href={item.href}
                    className="text-gray-500 hover:text-gray-900 transition-colors"
                    itemProp="item"
                  >
                    <span itemProp="name">{item.label}</span>
                  </Link>
                  <meta itemProp="position" content={String(index + 1)} />
                  <span className="mx-2 text-gray-400">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
