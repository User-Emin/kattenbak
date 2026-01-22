"use client";

import { SEO_CONFIG } from "@/lib/seo.config";

/**
 * ✅ SEO PHASE 3: HowTo JSON-LD Schema
 * 
 * Modulair, veilig, geen hardcode
 * - Dynamisch via props
 * - XSS-veilig (JSON.stringify)
 * - Aansluitend op SEO_CONFIG
 */
interface HowToStep {
  name: string;
  text: string;
  image?: string;
  url?: string;
}

interface HowToJsonLdProps {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
  estimatedCost?: {
    currency: string;
    value: string;
  };
  tool?: Array<{ name: string }>;
  supply?: Array<{ name: string }>;
}

export function HowToJsonLd({
  name,
  description,
  steps,
  totalTime,
  estimatedCost,
  tool,
  supply,
}: HowToJsonLdProps) {
  // ✅ SECURITY: Validate inputs
  if (!name || !description || !steps || steps.length === 0) {
    return null;
  }
  
  // ✅ SECURITY: Sanitize steps
  const sanitizedSteps = steps
    .filter(step => step && step.name && step.text)
    .map(step => ({
      '@type': 'HowToStep',
      name: String(step.name).trim().substring(0, 100),
      text: String(step.text).trim().substring(0, 500),
      ...(step.image && {
        image: step.image.startsWith('http')
          ? step.image
          : `${SEO_CONFIG.site.url}${step.image.startsWith('/') ? step.image : `/${step.image}`}`,
      }),
      ...(step.url && {
        url: step.url.startsWith('http')
          ? step.url
          : `${SEO_CONFIG.site.url}${step.url.startsWith('/') ? step.url : `/${step.url}`}`,
      }),
    }))
    .slice(0, 20); // Max 20 steps
  
  if (sanitizedSteps.length === 0) {
    return null;
  }
  
  // ✅ SECURITY: Build JSON-LD safely
  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: String(name).trim().substring(0, 200),
    description: String(description).trim().substring(0, 500),
    step: sanitizedSteps,
  };
  
  // ✅ OPTIONAL: Add total time if provided
  if (totalTime) {
    jsonLd.totalTime = `PT${totalTime}`; // ISO 8601 duration format
  }
  
  // ✅ OPTIONAL: Add estimated cost if provided
  if (estimatedCost) {
    jsonLd.estimatedCost = {
      '@type': 'MonetaryAmount',
      currency: String(estimatedCost.currency).trim().substring(0, 10),
      value: String(estimatedCost.value).trim().substring(0, 50),
    };
  }
  
  // ✅ OPTIONAL: Add tools if provided
  if (tool && tool.length > 0) {
    jsonLd.tool = tool
      .filter(t => t && t.name)
      .map(t => ({
        '@type': 'HowToTool',
        name: String(t.name).trim().substring(0, 100),
      }))
      .slice(0, 10);
  }
  
  // ✅ OPTIONAL: Add supplies if provided
  if (supply && supply.length > 0) {
    jsonLd.supply = supply
      .filter(s => s && s.name)
      .map(s => ({
        '@type': 'HowToSupply',
        name: String(s.name).trim().substring(0, 100),
      }))
      .slice(0, 10);
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 2) }}
    />
  );
}
