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

// DRY: URL validation
const urlSchema = z.string().url('Ongeldige URL').or(z.string().startsWith('/'));

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
  
  // DRY: Images with URL validation
  images: z.array(urlSchema)
    .min(1, 'Minimaal 1 afbeelding is verplicht')
    .max(20, 'Maximaal 20 afbeeldingen toegestaan'),
  
  // DRY: Optional video URL (YouTube/Vimeo)
  videoUrl: z.string()
    .url('Ongeldige video URL')
    .optional()
    .or(z.literal(''))
    .transform(val => val || undefined),
  
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
});

export type ProductValidation = z.infer<typeof productValidationSchema>;




