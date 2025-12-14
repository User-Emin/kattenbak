import { z } from 'zod';

/**
 * RETURN VALIDATION SCHEMAS - DRY & Type-Safe
 * Shared between frontend and backend
 * Aligned with Prisma schema
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENUMS (DRY: Match Prisma enums exactly)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ReturnStatusEnum = z.enum([
  'REQUESTED',
  'LABEL_CREATED',
  'LABEL_SENT',
  'IN_TRANSIT',
  'RECEIVED',
  'INSPECTED',
  'APPROVED',
  'REJECTED',
  'REFUND_PENDING',
  'REFUND_PROCESSED',
  'CLOSED',
]);

export const ReturnReasonEnum = z.enum([
  'DEFECTIVE',
  'WRONG_ITEM',
  'NOT_AS_DESCRIBED',
  'CHANGED_MIND',
  'DAMAGED_SHIPPING',
  'OTHER',
]);

export const ProductConditionEnum = z.enum([
  'NEW',
  'GOOD',
  'DAMAGED',
  'DEFECTIVE',
]);

export const RefundMethodEnum = z.enum([
  'ORIGINAL_PAYMENT',
  'BANK_TRANSFER',
]);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SHARED SCHEMAS (DRY: Reusable pieces)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const returnItemSchema = z.object({
  productId: z.string().cuid(),
  productName: z.string().min(1),
  quantity: z.number().int().positive(),
  condition: ProductConditionEnum.optional(),
});

export const shippingAddressSchema = z.object({
  street: z.string().min(1, 'Straat is verplicht'),
  houseNumber: z.string().min(1, 'Huisnummer is verplicht'),
  addition: z.string().optional(),
  postalCode: z.string().regex(/^\d{4}\s?[A-Z]{2}$/i, 'Ongeldige postcode'),
  city: z.string().min(1, 'Plaats is verplicht'),
  country: z.string().length(2).default('NL'),
  phone: z.string().optional(),
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CUSTOMER RETURN REQUEST (Frontend → Backend)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const createReturnRequestSchema = z.object({
  orderId: z.string().cuid('Ongeldige order ID'),
  orderNumber: z.string().min(1, 'Order nummer is verplicht'),
  customerName: z.string().min(1, 'Naam is verplicht'),
  customerEmail: z.string().email('Ongeldig email adres'),
  shippingAddress: shippingAddressSchema,
  
  // Return details
  reason: ReturnReasonEnum,
  reasonDetails: z.string().max(1000, 'Maximaal 1000 karakters').optional(),
  items: z.array(returnItemSchema).min(1, 'Selecteer minimaal 1 product'),
  customerNotes: z.string().max(500, 'Maximaal 500 karakters').optional(),
  
  // Photo evidence (optional)
  customerPhotos: z.array(z.string().url()).max(5, 'Maximaal 5 fotos').optional(),
  
  // Options
  sendEmail: z.boolean().default(true),
});

export type CreateReturnRequest = z.infer<typeof createReturnRequestSchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN RETURN CREATION (Manual)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const adminCreateReturnSchema = createReturnRequestSchema.extend({
  adminNotes: z.string().max(1000).optional(),
  sendEmail: z.boolean().default(false), // Admin decides
});

export type AdminCreateReturn = z.infer<typeof adminCreateReturnSchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RETURN UPDATE (Admin Only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const updateReturnSchema = z.object({
  status: ReturnStatusEnum.optional(),
  adminNotes: z.string().max(1000).optional(),
  
  // Inspection fields
  inspectedBy: z.string().cuid().optional(),
  inspectionNotes: z.string().max(1000).optional(),
  productCondition: ProductConditionEnum.optional(),
  warehousePhotos: z.array(z.string().url()).max(10).optional(),
  
  // Refund fields
  refundAmount: z.number().positive().optional(),
  refundMethod: RefundMethodEnum.optional(),
  refundTransactionId: z.string().optional(),
});

export type UpdateReturn = z.infer<typeof updateReturnSchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RETURN QUERY (List/Filter)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const returnQuerySchema = z.object({
  // Pagination
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  
  // Sorting
  sortBy: z.enum(['createdAt', 'status', 'refundAmount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  
  // Filters
  status: z.array(ReturnStatusEnum).optional(),
  reason: z.array(ReturnReasonEnum).optional(),
  orderId: z.string().cuid().optional(),
  customerEmail: z.string().email().optional(),
  
  // Date range
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  
  // Search
  search: z.string().max(100).optional(), // Order number or customer name
});

export type ReturnQuery = z.infer<typeof returnQuerySchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RETURN ELIGIBILITY CHECK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const checkEligibilitySchema = z.object({
  orderId: z.string().cuid(),
});

export type CheckEligibility = z.infer<typeof checkEligibilitySchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VALIDATION HELPERS (DRY)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Validate request body
 * DRY: Centralized validation with clear errors
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.errors.map((err) => {
    const path = err.path.join('.');
    return path ? `${path}: ${err.message}` : err.message;
  });

  return { success: false, errors };
}

/**
 * Express middleware for request validation
 * DRY: Reusable validation middleware
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    const result = validateRequest(schema, req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: result.errors,
      });
    }

    // Attach validated data to request
    req.validatedBody = result.data;
    next();
  };
}

/**
 * Express middleware for query validation
 * DRY: Reusable query validation
 */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: any, res: any, next: any) => {
    const result = validateRequest(schema, req.query);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        errors: result.errors,
      });
    }

    req.validatedQuery = result.data;
    next();
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPE EXPORTS (For TypeScript)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ReturnStatus = z.infer<typeof ReturnStatusEnum>;
export type ReturnReason = z.infer<typeof ReturnReasonEnum>;
export type ProductCondition = z.infer<typeof ProductConditionEnum>;
export type RefundMethod = z.infer<typeof RefundMethodEnum>;
export type ReturnItem = z.infer<typeof returnItemSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;



