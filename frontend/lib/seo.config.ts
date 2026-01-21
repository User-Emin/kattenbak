/**
 * SEO CONFIG - DRY & MAINTAINABLE
 * Alle SEO metadata op één plek
 * 
 * Gebruik: Voor consistent SEO over alle pagina's
 */

export const SEO_CONFIG = {
  site: {
    name: 'CatSupply',
    url: 'https://catsupply.nl',
    description: 'Premium automatische kattenbak met zelfreinigende functie. Automatisch, hygiënisch en stijlvol.',
    defaultImage: 'https://catsupply.nl/logos/logo.webp',
    locale: 'nl_NL',
    language: 'nl',
  },
  
  social: {
    twitter: {
      handle: '@CatSupply',
      card: 'summary_large_image',
    },
  },
  
  contact: {
    email: 'info@catsupply.nl',
    phone: '+31 6 123 456 78',
    address: {
      street: '',
      city: 'Haarlem',
      postalCode: '',
      country: 'NL',
    },
  },
  
  defaults: {
    title: 'CatSupply - Premium Automatische Kattenbak',
    description: 'Premium automatische kattenbak met zelfreinigende functie. 10.5L capaciteit, dubbele veiligheidssensoren, app-bediening. Perfect voor katten tot 7kg.',
    image: 'https://catsupply.nl/logos/logo.webp',
    type: 'website',
  },
} as const;

/**
 * Generate full URL for a path
 */
export function getFullUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SEO_CONFIG.site.url}${cleanPath}`;
}

/**
 * Generate Open Graph metadata
 */
export function getOpenGraphTags(data: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}) {
  const ogImage = data.image || SEO_CONFIG.defaults.image;
  const ogUrl = data.url ? getFullUrl(data.url) : SEO_CONFIG.site.url;
  const ogType = data.type || SEO_CONFIG.defaults.type;
  
  return {
    'og:title': data.title,
    'og:description': data.description,
    'og:image': ogImage,
    'og:url': ogUrl,
    'og:type': ogType,
    'og:site_name': SEO_CONFIG.site.name,
    'og:locale': SEO_CONFIG.site.locale,
  };
}

/**
 * Generate Twitter Card metadata
 */
export function getTwitterCardTags(data: {
  title: string;
  description: string;
  image?: string;
}) {
  const twitterImage = data.image || SEO_CONFIG.defaults.image;
  
  return {
    'twitter:card': SEO_CONFIG.social.twitter.card,
    'twitter:title': data.title,
    'twitter:description': data.description,
    'twitter:image': twitterImage,
    'twitter:site': SEO_CONFIG.social.twitter.handle,
  };
}
