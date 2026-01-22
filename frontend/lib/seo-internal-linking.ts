/**
 * ✅ SEO PHASE 1: Internal Linking Utility
 * 
 * Modulair, veilig, geen hardcode
 * - Contextuele links via keywords
 * - XSS-veilig (Next.js Link)
 * - Aansluitend op SEO_IMPLEMENTATION_CONFIG
 */

import { SEO_IMPLEMENTATION_CONFIG } from './seo-implementation-strategy';
import { SEO_CONFIG } from './seo.config';

export interface InternalLink {
  text: string;
  url: string;
  anchor?: string | null;
  keywords: string[];
}

/**
 * ✅ SECURITY: Sanitize URL to prevent injection
 */
function sanitizeUrl(url: string): string {
  // Remove any protocol or domain
  const cleanUrl = url.replace(/^https?:\/\/[^\/]+/, '');
  // Only allow alphanumeric, slashes, hyphens, and hash
  return cleanUrl.replace(/[^a-zA-Z0-9\/\-#]/g, '');
}

/**
 * ✅ SECURITY: Sanitize anchor to prevent injection
 */
function sanitizeAnchor(anchor: string | null | undefined): string | null {
  if (!anchor) return null;
  // Only allow alphanumeric and hyphens
  const clean = anchor.replace(/[^a-zA-Z0-9\-]/g, '');
  return clean || null;
}

/**
 * Find internal links based on keywords in text
 */
export function findInternalLinks(text: string): InternalLink[] {
  if (!text || typeof text !== 'string') return [];
  
  const links: InternalLink[] = [];
  const lowerText = text.toLowerCase();
  
  // ✅ DYNAMIC: Check all keywords from config
  Object.entries(SEO_IMPLEMENTATION_CONFIG.internalLinking.keywords).forEach(([keyword, config]) => {
    if (lowerText.includes(keyword.toLowerCase())) {
      const safeUrl = sanitizeUrl(config.url);
      const safeAnchor = sanitizeAnchor(config.anchor);
      const fullUrl = safeAnchor ? `${safeUrl}#${safeAnchor}` : safeUrl;
      
      links.push({
        text: config.text,
        url: fullUrl,
        anchor: safeAnchor,
        keywords: [keyword],
      });
    }
  });
  
  // ✅ SECURITY: Remove duplicates
  return links.filter((link, index, self) => 
    index === self.findIndex(l => l.url === link.url)
  );
}

/**
 * Replace keywords in text with internal links
 * ✅ SECURITY: Returns React nodes safely
 */
export function replaceWithInternalLinks(
  text: string,
  renderLink: (link: InternalLink) => React.ReactNode
): React.ReactNode[] {
  if (!text || typeof text !== 'string') return [text];
  
  const links = findInternalLinks(text);
  if (links.length === 0) return [text];
  
  // ✅ SECURITY: Build safe replacement
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let currentText = text;
  
  links.forEach((link) => {
    link.keywords.forEach((keyword) => {
      const keywordLower = keyword.toLowerCase();
      const index = currentText.toLowerCase().indexOf(keywordLower, lastIndex);
      
      if (index !== -1) {
        // Add text before link
        if (index > lastIndex) {
          parts.push(currentText.substring(lastIndex, index));
        }
        
        // Add link
        parts.push(renderLink(link));
        
        lastIndex = index + keyword.length;
      }
    });
  });
  
  // Add remaining text
  if (lastIndex < currentText.length) {
    parts.push(currentText.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : [text];
}

/**
 * Get internal link for a specific keyword
 */
export function getInternalLink(keyword: string): InternalLink | null {
  const config = SEO_IMPLEMENTATION_CONFIG.internalLinking.keywords[keyword.toLowerCase()];
  if (!config) return null;
  
  const safeUrl = sanitizeUrl(config.url);
  const safeAnchor = sanitizeAnchor(config.anchor);
  const fullUrl = safeAnchor ? `${safeUrl}#${safeAnchor}` : safeUrl;
  
  return {
    text: config.text,
    url: fullUrl,
    anchor: safeAnchor,
    keywords: [keyword],
  };
}

/**
 * Get all available internal links
 */
export function getAllInternalLinks(): InternalLink[] {
  return Object.entries(SEO_IMPLEMENTATION_CONFIG.internalLinking.keywords).map(([keyword, config]) => {
    const safeUrl = sanitizeUrl(config.url);
    const safeAnchor = sanitizeAnchor(config.anchor);
    const fullUrl = safeAnchor ? `${safeUrl}#${safeAnchor}` : safeUrl;
    
    return {
      text: config.text,
      url: fullUrl,
      anchor: safeAnchor,
      keywords: [keyword],
    };
  });
}
