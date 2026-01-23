/**
 * PRODUCT VALIDATION SCHEMA - DRY Security
 */

import { z } from 'zod';

// DRY: Sanitize HTML input
const sanitizeString = (val: string) => {
  return val
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
};

// DRY: Product validation with sanitization
export const productValidationSchema = z.object({
  sku: z.string()
    .min(1, 'SKU is verplicht')
    .max(50, 'SKU te lang')
    .transform(sanitizeString),
  
  name: z.string()
    .min(1, 'Naam is verplicht')
    .max(200, 'Naam te lang')
    .transform(sanitizeString),
  
  slug: z.string()
    .min(1, 'Slug is verplicht')
    .max(200, 'Slug te lang')
    .regex(/^[a-z0-9-]+$/, 'Slug moet lowercase letters, cijfers en streepjes bevatten')
    .transform(sanitizeString),
  
  description: z.string()
    .min(10, 'Beschrijving te kort')
    .max(5000, 'Beschrijving te lang')
    .transform(sanitizeString),
  
  shortDescription: z.string()
    .min(10, 'Korte beschrijving te kort')
    .max(500, 'Korte beschrijving te lang')
    .transform(sanitizeString),
  
  price: z.coerce.number()
    .min(0, 'Prijs moet positief zijn')
    .max(999999, 'Prijs te hoog'),
  
  compareAtPrice: z.coerce.number()
    .min(0)
    .max(999999)
    .optional(),
  
  costPrice: z.coerce.number()
    .min(0)
    .max(999999)
    .optional(),
  
  stock: z.coerce.number()
    .int('Voorraad moet een geheel getal zijn')
    .min(0, 'Voorraad kan niet negatief zijn')
    .max(999999, 'Voorraad te hoog'),
  
  lowStockThreshold: z.coerce.number()
    .int()
    .min(0)
    .max(999999)
    .optional(),
  
  trackInventory: z.boolean(),
  
  weight: z.coerce.number()
    .min(0)
    .max(999999)
    .optional(),
  
  // DRY: Images with URL or path validation (including data: URLs for inline SVG/images)
  images: z.array(
    z.string()
      .min(1, 'Afbeelding pad mag niet leeg zijn')
      .refine(
        (val) => val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:'),
        'Afbeelding moet een geldige URL of pad zijn (begin met /, http(s)://, of data:)'
      )
  )
    .min(1, 'Minimaal 1 afbeelding is verplicht')
    .max(20, 'Maximaal 20 afbeeldingen toegestaan'),
  
  // ✅ HOW IT WORKS: Specifieke afbeeldingen voor "Hoe werkt het?" sectie (los van variant afbeeldingen)
  howItWorksImages: z.array(
    z.string()
      .min(1, 'Afbeelding pad mag niet leeg zijn')
      .refine(
        (val) => val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:'),
        'Afbeelding moet een geldige URL of pad zijn (begin met /, http(s)://, of data:)'
      )
  )
    .max(6, 'Maximaal 6 afbeeldingen voor "Hoe werkt het?" sectie')
    .optional()
    .default([]),
  
  // DRY: Optional video URL (YouTube/Vimeo) - truly optional
  videoUrl: z.string()
    .optional()
    .transform(val => {
      if (!val || val.trim() === '') return undefined;
      return val;
    })
    .refine(
      (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/'),
      'Video URL moet een geldige URL zijn'
    ),
  
  metaTitle: z.string()
    .max(200, 'Meta title te lang')
    .optional()
    .transform(val => val ? sanitizeString(val) : undefined),
  
  metaDescription: z.string()
    .max(500, 'Meta description te lang')
    .optional()
    .transform(val => val ? sanitizeString(val) : undefined),
  
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  
  dimensions: z.object({
    length: z.coerce.number().min(0).max(9999),
    width: z.coerce.number().min(0).max(9999),
    height: z.coerce.number().min(0).max(9999),
  }).optional(),
  
  // ✅ VARIANT SYSTEM: Product variants with colorCode and previewImage
  variants: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, 'Variant naam verplicht'),
      colorName: z.string().min(1, 'Kleur naam verplicht').optional(), // Optional, converted to colorCode
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
      previewImage: z.string()
        .refine(
          (val) => !val || (val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://')),
          'Preview image URL moet een geldige URL of pad zijn'
        )
        .optional()
        .nullable(),
      colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Ongeldige hex kleur').optional(),
      priceAdjustment: z.coerce.number(),
      stock: z.coerce.number().int().min(0),
      sku: z.string().min(1, 'Variant SKU verplicht'),
      images: z.array(
        z.string()
          .min(1)
          .refine(
            (val) => val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:'),
            'Afbeelding moet een geldige URL of pad zijn (/, http(s)://, of data:)'
          )
      ).default([]),
      isActive: z.boolean().optional(),
      sortOrder: z.number().int().min(0).optional().default(0),
    })
  ).optional(),
  
  categoryId: z.string().optional(),
});

export type ProductValidation = z.infer<typeof productValidationSchema>;




