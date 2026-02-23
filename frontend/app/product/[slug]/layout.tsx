import type { Metadata } from 'next';
import { SEO_CONFIG } from '@/lib/seo.config';
import { SITE_CONFIG } from '@/lib/config';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

async function getProductForMetadata(slug: string) {
  try {
    const base = typeof process.env.NEXT_PUBLIC_API_URL === 'string' && process.env.NEXT_PUBLIC_API_URL
      ? (process.env.NEXT_PUBLIC_API_URL.endsWith('/api/v1') ? process.env.NEXT_PUBLIC_API_URL : `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/api/v1`)
      : 'https://catsupply.nl/api/v1';
    const res = await fetch(`${base}/products/slug/${slug}`, {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.success && json?.data ? json.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductForMetadata(slug);

  if (!product) {
    return {
      title: SEO_CONFIG.defaults.title,
      description: SEO_CONFIG.defaults.description,
    };
  }

  const title = product.metaTitle || product.name || SEO_CONFIG.defaults.title;
  const description = (product.metaDescription || product.shortDescription || product.description || SEO_CONFIG.defaults.description)?.slice(0, 160) || SEO_CONFIG.defaults.description;
  const image = product.images?.[0]
    ? (product.images[0].startsWith('http') ? product.images[0] : `${SEO_CONFIG.site.url}${product.images[0]}`)
    : SEO_CONFIG.defaults.image;
  const url = `${SEO_CONFIG.site.url}/product/${slug}`;
  const keywords = product.sku ? `${product.name}, ${product.sku}, automatische kattenbak, zelfreinigende kattenbak` : undefined;

  return {
    title: `${title} | ${SEO_CONFIG.site.name}`,
    description,
    keywords: keywords ?? undefined,
    openGraph: {
      title: `${title} | ${SEO_CONFIG.site.name}`,
      description,
      url,
      siteName: SEO_CONFIG.site.name,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      locale: SEO_CONFIG.site.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SEO_CONFIG.site.name}`,
      description,
      images: [image],
    },
    alternates: { canonical: url },
  };
}

export default function ProductLayout({ children }: LayoutProps) {
  return children;
}
