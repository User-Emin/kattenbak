"use client";

import { RICH_SNIPPETS } from "@/lib/seo-maximized.config";

/**
 * ✅ SEO 10/10: Rich Snippets Component
 * 
 * FAQ en HowTo structured data voor Google rich results
 * - FAQ schema voor featured snippets
 * - HowTo schema voor step-by-step instructies
 */
export function RichSnippets() {
  return (
    <>
      {/* ✅ FAQ Schema - Voor featured snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(RICH_SNIPPETS.faq, null, 2),
        }}
      />
      
      {/* ✅ HowTo Schema - Voor step-by-step instructies */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(RICH_SNIPPETS.howTo, null, 2),
        }}
      />
    </>
  );
}
