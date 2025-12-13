/**
 * SHARED MOCK DATA - DRY Single Source of Truth
 * Used by both admin and public routes
 */

import { getDemoProductImages } from './demo-images';

export const MOCK_PRODUCT = {
  id: '1',
  sku: 'KB-AUTO-001',
  name: 'Automatische Kattenbak Premium',
  slug: 'automatische-kattenbak-premium',
  description: 'De beste automatische kattenbak met zelfreinigende functie. Perfect voor katten tot 7kg. Volledig automatisch met app-bediening.',
  shortDescription: 'Zelfreinigende kattenbak met app-bediening',
  price: 299.99,
  compareAtPrice: 399.99,
  costPrice: 250.00,
  stock: 15,
  lowStockThreshold: 10,
  trackInventory: true,
  weight: 8.5,
  dimensions: { length: 60, width: 55, height: 62 },
  // DRY: Self-contained demo images (Base64 SVG - werk altijd)
  // Transparant: Embedded data URLs, geen external dependencies
  images: getDemoProductImages(),
  metaTitle: 'Premium Automatische Kattenbak | Kattenbak',
  metaDescription: 'Beste zelfreinigende kattenbak voor je kat. Volledig automatisch met app-bediening.',
  isActive: true,
  isFeatured: true,
  categoryId: '1',
  category: { id: '1', name: 'Kattenbakken', slug: 'kattenbakken' },
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
};

// In-memory storage voor runtime changes (demonstratie doeleindes)
let productState = { ...MOCK_PRODUCT };

export const getProduct = () => ({ ...productState });

export const updateProduct = (updates: Partial<typeof MOCK_PRODUCT>) => {
  productState = { ...productState, ...updates, updatedAt: new Date().toISOString() };
  console.log('📝 PRODUCT UPDATED:', { 
    name: productState.name, 
    images: productState.images.length 
  });
  return { ...productState };
};

export const resetProduct = () => {
  productState = { ...MOCK_PRODUCT };
  return { ...productState };
};

