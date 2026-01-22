"use client";

import { SEO_CONFIG } from "@/lib/seo.config";
import { PRODUCT_CONTENT } from "@/lib/content.config";

/**
 * ✅ SEO PHASE 1: FAQ JSON-LD Schema
 * 
 * Modulair, veilig, geen hardcode
 * - Dynamisch via PRODUCT_CONTENT
 * - XSS-veilig (JSON.stringify)
 * - Aansluitend op SEO_CONFIG
 */
interface FAQJsonLdProps {
  faqs?: Array<{ q: string; a: string }>;
  productSlug?: string;
}

export function FAQJsonLd({ faqs, productSlug }: FAQJsonLdProps) {
  // ✅ DYNAMIC: Use provided FAQs or fallback to PRODUCT_CONTENT
  const faqData = faqs || [
    // ✅ FALLBACK: Use existing FAQs from content config
    ...PRODUCT_CONTENT.faqs || [],
  ];
  
  // ✅ SECURITY: Validate FAQs
  if (!faqData || faqData.length === 0) {
    return null;
  }
  
  // ✅ SECURITY: Sanitize FAQ data
  const sanitizedFAQs = faqData
    .filter(faq => faq && faq.q && faq.a)
    .map(faq => ({
      q: String(faq.q).trim().substring(0, 200), // Max length
      a: String(faq.a).trim().substring(0, 1000), // Max length
    }))
    .slice(0, 10); // Max 10 FAQs
  
  if (sanitizedFAQs.length === 0) {
    return null;
  }
  
  // ✅ SECURITY: Build JSON-LD safely
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: sanitizedFAQs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };
  
  // ✅ OPTIONAL: Add URL if product slug provided
  if (productSlug) {
    const safeSlug = productSlug.replace(/[^a-zA-Z0-9\-]/g, '');
    if (safeSlug) {
      jsonLd.url = `${SEO_CONFIG.site.url}/product/${safeSlug}#vragen`;
    }
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 2) }}
    />
  );
}
