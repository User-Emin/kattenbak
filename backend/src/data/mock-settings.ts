/**
 * SITE SETTINGS MOCK DATA - DRY Single Source
 * Configuration voor hero, USPs, en andere site-wide settings
 * MAXIMAAL SHARED met product image pattern
 */

import { getDemoProductImages } from './demo-images';

export interface SiteSettings {
  id: string;
  // Hero Section
  hero: {
    title: string;
    subtitle: string;
    image: string;
  };
  // USP Section - "De Beste Innovatie" (Homepage)
  usps: {
    title: string; // "De Beste Innovatie"
    feature1: {
      title: string;
      description: string;
      image: string;
    };
    feature2: {
      title: string;
      description: string;
      image: string;
    };
  };
  // Product Detail USPs - DRY: 2 USPs (belangrijkste features uit vergelijkingstabel)
  productUsps: {
    usp1: {
      icon: 'sparkles' | 'shield' | 'truck' | 'star' | 'check' | 'zap' | 'package';
      color: 'orange' | 'blue' | 'brand';
      title: string;
      description: string;
      image: string;
    };
    usp2: {
      icon: 'sparkles' | 'shield' | 'truck' | 'star' | 'check' | 'zap' | 'package';
      color: 'orange' | 'blue' | 'brand';
      title: string;
      description: string;
      image: string;
    };
  };
  // Product Specifications - DRY: 6 belangrijkste specs uit vergelijkingstabel (2 kolommen, 3 per kolom)
  productSpecs: {
    spec1: { icon: 'sparkles'; label: string; value: string; };
    spec2: { icon: 'shield-check'; label: string; value: string; };
    spec3: { icon: 'smartphone'; label: string; value: string; };
    spec4: { icon: 'package'; label: string; value: string; highlight?: boolean; };
    spec5: { icon: 'volume-x'; label: string; value: string; };
    spec6: { icon: 'layers'; label: string; value: string; };
  };
  // General
  updatedAt: string;
}

// DRY: Get demo images (SHARED pattern met products)
const demoImages = getDemoProductImages();

// DRY: Mutable state voor development (CONSISTENT met mock-products)
let settingsState: SiteSettings = {
  id: 'site-settings',
  hero: {
    title: 'Slimste Kattenbak',
    subtitle: 'Automatisch • Smart • Hygiënisch',
    image: demoImages[0], // ✅ Groene SVG (zelfde als product main)
  },
  usps: {
    title: 'De Beste Innovatie',
    feature1: {
      title: '10.5L Capaciteit',
      description: 'De grootste afvalbak in zijn klasse. Minder vaak legen betekent meer vrijheid voor jou.',
      image: demoImages[1], // ✅ Rode SVG (zelfde pattern)
    },
    feature2: {
      title: 'Ultra-Quiet Motor',
      description: 'Werkt onder 40 decibel. Zo stil dat je het nauwelijks hoort, maar het doet zijn werk perfect.',
      image: demoImages[2], // ✅ Blauwe SVG (zelfde pattern)
    },
  },
  // Product Detail USPs - 2 belangrijkste (uit vergelijkingstabel)
  productUsps: {
    usp1: {
      icon: 'sparkles',
      color: 'orange',
      title: 'Volledig Automatisch',
      description: 'Zelfreinigende functie met dubbele veiligheidssensoren. Reinigt automatisch na elk bezoek voor een altijd schone kattenbak.',
      image: demoImages[0],
    },
    usp2: {
      icon: 'package',
      color: 'brand',
      title: '10.5L Capaciteit',
      description: 'De grootste afvalbak in zijn klasse. Minder vaak legen betekent meer vrijheid voor jou en je kat.',
      image: demoImages[1],
    },
  },
  // Product Specifications - DRY: 6 belangrijkste specs (uit vergelijkingstabel)
  productSpecs: {
    spec1: { icon: 'sparkles', label: 'Zelfreinigende functie', value: 'Volledig automatisch' },
    spec2: { icon: 'shield-check', label: 'Dubbele veiligheidssensoren', value: 'Ja' },
    spec3: { icon: 'smartphone', label: 'App-bediening & monitoring', value: 'iOS & Android' },
    spec4: { icon: 'package', label: 'Afvalbak capaciteit', value: '10.5L', highlight: true },
    spec5: { icon: 'volume-x', label: 'Ultra-stille motor', value: '<40 dB' },
    spec6: { icon: 'layers', label: 'Modulair design', value: 'OEM-friendly' },
  },
  updatedAt: new Date().toISOString(),
};

// DRY: Get settings (immutable copy)
export const getSettings = (): SiteSettings => {
  return JSON.parse(JSON.stringify(settingsState)); // Deep copy
};

// DRY: Update settings (for admin)
export const updateSettings = (updates: Partial<SiteSettings>): SiteSettings => {
  // Deep merge voor nested objects
  settingsState = {
    ...settingsState,
    ...updates,
    hero: updates.hero ? { ...settingsState.hero, ...updates.hero } : settingsState.hero,
    usps: updates.usps ? {
      ...settingsState.usps,
      ...updates.usps,
      feature1: updates.usps.feature1 ? { ...settingsState.usps.feature1, ...updates.usps.feature1 } : settingsState.usps.feature1,
      feature2: updates.usps.feature2 ? { ...settingsState.usps.feature2, ...updates.usps.feature2 } : settingsState.usps.feature2,
    } : settingsState.usps,
    productUsps: updates.productUsps ? {
      ...settingsState.productUsps,
      ...updates.productUsps,
      usp1: updates.productUsps.usp1 ? { ...settingsState.productUsps.usp1, ...updates.productUsps.usp1 } : settingsState.productUsps.usp1,
      usp2: updates.productUsps.usp2 ? { ...settingsState.productUsps.usp2, ...updates.productUsps.usp2 } : settingsState.productUsps.usp2,
    } : settingsState.productUsps,
    productSpecs: updates.productSpecs ? { ...settingsState.productSpecs, ...updates.productSpecs } : settingsState.productSpecs,
    updatedAt: new Date().toISOString(),
  };
  
  console.log('⚙️ SITE SETTINGS UPDATED:', {
    heroTitle: settingsState.hero.title,
    heroImage: settingsState.hero.image ? settingsState.hero.image.substring(0, 50) + '...' : 'EMPTY',
    uspTitle: settingsState.usps.title,
    feature1Image: settingsState.usps.feature1.image ? 'SET' : 'EMPTY',
    feature2Image: settingsState.usps.feature2.image ? 'SET' : 'EMPTY',
    productUsps: settingsState.productUsps ? 'SET (2 USPs)' : 'EMPTY',
    productSpecs: settingsState.productSpecs ? 'SET (6 specs)' : 'EMPTY',
  });
  
  return getSettings();
};



