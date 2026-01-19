import { z } from 'zod';

/**
 * Product Validation Schemas
 * Security: Input validation prevents XSS, SQL injection, malformed data
 */

// ✅ FIX: Define ProductVariantCreateSchema FIRST to avoid circular dependency
export const ProductVariantCreateSchema = z.object({
  productId: z.string().cuid('Ongeldige product ID'),
  name: z.string().min(2).max(100).trim(),
  colorName: z.string().min(2).max(50).trim().optional(), // Optional, will be converted to colorCode
  colorCode: z.enum(['WIT', 'ZWART', 'GRIJS', 'ZILVER', 'BEIGE', 'BLAUW', 'ROOD', 'GROEN']).optional(), // ✅ SECURITY: Whitelist
  colorImageUrl: z.string()
    .refine(
      (val) => !val || (val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://')),
      'Preview image URL moet een geldige URL of pad zijn'
    )
    .refine(
      (val) => !val || (!val.includes('..') && !val.includes('//')),
      'Preview image URL mag geen path traversal bevatten'
    )
    .optional()
    .nullable(),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Ongeldige kleur hex code').optional(),
  priceAdjustment: z.number().min(-999999).max(999999).multipleOf(0.01).default(0),
  sku: z.string().regex(/^[A-Z0-9-]+$/).min(2).max(50),
  stock: z.number().int().min(0).max(999999),
  images: z.array(
    z.string()
      .min(1)
      .refine(
        (val) => val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
        'Afbeelding moet een geldige URL of pad zijn'
      )
  ).max(10).default([]),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0)
});

// Base product schema
export const ProductCreateSchema = z.object({
  name: z.string()
    .min(3, 'Naam moet minimaal 3 karakters zijn')
    .max(200, 'Naam mag maximaal 200 karakters zijn')
    .trim(),
  
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, 'Slug mag alleen lowercase letters, cijfers en streepjes bevatten')
    .min(3, 'Slug moet minimaal 3 karakters zijn')
    .max(200, 'Slug mag maximaal 200 karakters zijn'),
  
  sku: z.string()
    .regex(/^[A-Z0-9-]+$/, 'SKU mag alleen hoofdletters, cijfers en streepjes bevatten')
    .min(2, 'SKU moet minimaal 2 karakters zijn')
    .max(50, 'SKU mag maximaal 50 karakters zijn'),
  
  description: z.string()
    .min(10, 'Beschrijving moet minimaal 10 karakters zijn')
    .max(10000, 'Beschrijving mag maximaal 10000 karakters zijn')
    .optional(),
  
  shortDescription: z.string()
    .max(500, 'Korte beschrijving mag maximaal 500 karakters zijn')
    .optional(),
  
  price: z.number()
    .positive('Prijs moet positief zijn')
    .max(999999.99, 'Prijs mag maximaal €999.999,99 zijn')
    .multipleOf(0.01, 'Prijs moet 2 decimalen hebben'),
  
  compareAtPrice: z.number()
    .min(0, 'Compare at price kan niet negatief zijn') // ✅ FIX: Allow 0, only reject negative
    .max(999999.99)
    .multipleOf(0.01)
    .optional()
    .nullable(),
  
  costPrice: z.number()
    .min(0, 'Kostprijs kan niet negatief zijn')
    .max(999999.99)
    .multipleOf(0.01)
    .optional()
    .nullable(),
  
  stock: z.number()
    .int('Voorraad moet een geheel getal zijn')
    .min(0, 'Voorraad kan niet negatief zijn')
    .max(999999, 'Voorraad mag maximaal 999999 zijn'),
  
  lowStockThreshold: z.number()
    .int()
    .min(0)
    .max(9999)
    .default(10),
  
  trackInventory: z.boolean().default(true),
  
  weight: z.number()
    .min(0, 'Gewicht kan niet negatief zijn') // ✅ FIX: Allow 0, only reject negative
    .max(9999.99, 'Gewicht mag maximaal 9999.99 kg zijn')
    .optional()
    .nullable(),
  
  dimensions: z.object({
    length: z.number().min(0, 'Lengte kan niet negatief zijn').max(9999), // ✅ FIX: Allow 0, only reject negative
    width: z.number().min(0, 'Breedte kan niet negatief zijn').max(9999), // ✅ FIX: Allow 0, only reject negative
    height: z.number().min(0, 'Hoogte kan niet negatief zijn').max(9999) // ✅ FIX: Allow 0, only reject negative
  }).optional().nullable(),
  
  images: z.array(
    z.string()
      .min(1, 'Afbeelding pad mag niet leeg zijn')
      .refine(
        (val) => val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
        'Afbeelding moet een geldige URL of pad zijn (moet beginnen met / of http(s)://)'
      )
  ).max(10, 'Maximaal 10 afbeeldingen toegestaan').default([]),
  
  heroVideoUrl: z.string()
    .refine(
      (val) => !val || val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
      'Video URL moet een geldige URL of pad zijn (moet beginnen met / of http(s)://)'
    )
    .optional()
    .nullable(),
  videoUrl: z.string()
    .refine(
      (val) => !val || val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
      'Video URL moet een geldige URL of pad zijn (moet beginnen met / of http(s)://)'
    )
    .optional()
    .nullable(),
  
  metaTitle: z.string().max(200).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
  
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  
  categoryId: z.string().cuid('Ongeldige categorie ID'),
  
  // ✅ VARIANT SYSTEM: Optional variants array for product updates
  variants: z.array(ProductVariantCreateSchema.omit({ productId: true }).extend({
    id: z.string().optional() // Optional ID for updates
  })).optional()
});

// Update schema (all fields optional except validation)
export const ProductUpdateSchema = ProductCreateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Minimaal één veld moet worden bijgewerkt' }
);

// Query parameters validation
export const ProductQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1)).optional().default('1'),
  pageSize: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(100)).optional().default('20'),
  search: z.string().max(200).optional(),
  categoryId: z.string().cuid().optional(),
  isActive: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  isFeatured: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  sortBy: z.enum(['name', 'price', 'stock', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

export const ProductVariantUpdateSchema = ProductVariantCreateSchema.partial().omit({ productId: true });

/**
 * Sanitize HTML to prevent XSS
 * Security: Strips dangerous HTML tags and attributes
 */
export const sanitizeHtml = (html: string): string => {
  // Remove script tags
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  clean = clean.replace(/javascript:/gi, '');
  
  return clean;
};

/**
 * Validate and sanitize product data
 */
export const validateAndSanitizeProduct = (data: any) => {
  // Sanitize HTML fields
  if (data.description) {
    data.description = sanitizeHtml(data.description);
  }
  if (data.shortDescription) {
    data.shortDescription = sanitizeHtml(data.shortDescription);
  }
  
  return data;
};
