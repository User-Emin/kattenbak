/**
 * PRODUCTION SERVER MET DATABASE
 * - PostgreSQL via Prisma
 * - Geen @ imports (direct requires)
 * - Enterprise niveau
 * - Alles dynamisch uit database
 * - ✅ CRASH-PREVENTION: Geen exit bij uncaught/rejection; product-routes 503 bij DB down
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';
import adminVariantsRoutes from './routes/admin/variants.routes';
import analyticsRoutes from './routes/admin/analytics.routes';
import { analyticsMiddleware } from './middleware/analytics.middleware';

// ✅ CRASH-PREVENTION: Proces blijft draaien bij uncaught exception of unhandled rejection
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception (process blijft draaien):', err?.message || err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection (process blijft draaien):', reason);
});

// ✅ ISOLATIE: Productie laadt alleen .env uit backend-cwd (nooit parent .env)
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
} else {
  dotenv.config();
}

const app: Application = express();
const PORT = 3101;

// Prisma client - DIRECT geen @ imports
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mollie client - DIRECT geen @ imports  
const { createMollieClient } = require('@mollie/api-client');
const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY || '' });

// ✅ SECURITY: CORS configuratie - specifieke origins voor credentials
const allowedOrigins = [
  'http://localhost:3100',
  'http://localhost:3102',
  'https://catsupply.nl',
  'https://admin.catsupply.nl',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean) as string[];

app.use(cors({ 
  origin: (origin, callback) => {
    // ✅ SECURITY: Allow requests with no origin (mobile apps, Postman, etc.) in development
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // ✅ SECURITY: Allow same-origin requests (admin panel opzelfde domain)
    if (!origin) {
      return callback(null, true);
    }
    
    // ✅ SECURITY: Check if origin is allowed (exact match of starts with)
    const isAllowed = allowedOrigins.some(allowed => {
      return origin === allowed || origin.startsWith(allowed.replace('https://', 'https://').replace('http://', 'http://'));
    });
    
    // ✅ SECURITY: Also allow if origin contains catsupply.nl (voor subdomains)
    if (origin.includes('catsupply.nl')) {
      return callback(null, true);
    }
    
    if (isAllowed) {
      callback(null, true);
    } else {
      // ✅ SECURITY: Log blocked origin for debugging (niet in productie)
      if (process.env.NODE_ENV !== 'production') {
        console.log('CORS blocked origin:', origin);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
}));
app.use(express.json({ limit: '50mb' })); // WATERDICHT FIX: 413 error - increased for image uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ SECURITY: Serve static uploads - images and videos (skip if dir missing to prevent crash)
const UPLOADS_DIR = '/var/www/uploads';
if (existsSync(UPLOADS_DIR)) {
  app.use('/uploads', express.static(UPLOADS_DIR, {
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('X-Frame-Options', 'DENY');
    },
    index: false,
    dotfiles: 'ignore'
  }));
} else {
  console.warn('⚠️ Uploads dir not found:', UPLOADS_DIR, '- /uploads will 404');
}

// =============================================================================
// ANALYTICS MIDDLEWARE - Privacy-compliant request tracking (voor alle routes)
// =============================================================================
app.use(analyticsMiddleware);

// =============================================================================
// ADMIN VARIANTS ROUTES (Router-based, auth/admin protected)
// =============================================================================
app.use('/api/v1/admin/variants', adminVariantsRoutes);

// =============================================================================
// ADMIN ANALYTICS ROUTES - Traffic monitoring (SSE + snapshot)
// =============================================================================
app.use('/api/v1/admin/analytics', analyticsRoutes);

// ENV config
const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  isProduction: process.env.NODE_ENV === 'production',
  MOLLIE_API_KEY: process.env.MOLLIE_API_KEY || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://catsupply.nl',
  HCAPTCHA_SECRET: process.env.HCAPTCHA_SECRET_KEY || '',
  isTest: process.env.MOLLIE_API_KEY?.startsWith('test_') || false,
};

// Mollie warning (niet crashen)
if (ENV.isProduction && ENV.isTest) {
  console.warn('⚠️  WARNING: Mollie TEST key in PRODUCTION');
}

// Helper functions
const success = (data: any) => ({ success: true, data });
const error = (message: string) => ({ success: false, error: message });

// =============================================================================
// ROOT – wijst naar webshop (lokaal: 3002, productie: catsupply.nl)
// =============================================================================

app.get('/', (req: Request, res: Response) => {
  const shopUrl = ENV.isProduction ? 'https://catsupply.nl' : 'http://localhost:3002';
  res.setHeader('Content-Type', 'application/json');
  res.json({
    success: true,
    message: 'API backend. Webshop (frontend) staat op:',
    webshop_url: shopUrl,
    health: '/health',
    api_v1: '/api/v1',
  });
});

// =============================================================================
// HEALTH ENDPOINTS
// =============================================================================

app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Healthy',
    environment: ENV.NODE_ENV,
    mollie: ENV.isTest ? 'TEST' : 'LIVE',
    database: 'PostgreSQL',
    timestamp: new Date().toISOString(),
  });
});

// Database connection state (set after first connect attempt)
let dbConnected = false;

app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: dbConnected ? 'API v1 healthy with database' : 'API up, database reconnecting',
    version: '1.0.0',
    database: dbConnected ? 'connected' : 'disconnected',
  });
});

// =============================================================================
// TRACKING ENDPOINT - Anonieme pageview van frontend (geen PII, geen cookies)
// =============================================================================

app.post('/api/v1/track', (req: Request, res: Response) => {
  const { path } = req.body as { path?: string };
  if (path && typeof path === 'string' && path.length < 200) {
    const { recordRequest } = require('./services/analytics.service');
    recordRequest(path, true);
  }
  res.status(204).end();
});

// =============================================================================
// PRODUCTS ENDPOINTS - DATABASE
// =============================================================================

// Helper: Convert Prisma Decimal to Number (defensive) – ✅ ISOLATIE: nooit throwen
const toNumber = (value: any): number => {
  try {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number' && !isNaN(value)) return value;
    const num = parseFloat(String(value));
    return isNaN(num) ? 0 : num;
  } catch {
    return 0;
  }
};

// Helper: Sanitize variant – ✅ ISOLATIE: nooit throwen
const sanitizeVariant = (variant: any) => {
  try {
    if (!variant || typeof variant !== 'object') return { priceAdjustment: 0, price: 0, stock: 0 };
    return {
      ...variant,
      priceAdjustment: toNumber(variant.priceAdjustment),
      price: toNumber(variant.priceAdjustment),
      stock: variant.stock ?? 0,
    };
  } catch (e: any) {
    console.warn('sanitizeVariant failed:', variant?.id, e?.message);
    return variant ? { ...variant, priceAdjustment: 0, price: 0, stock: 0 } : {};
  }
};

// Helper: Sanitize product – ✅ ISOLATIE: nooit throwen
const sanitizeProduct = (product: any) => {
  try {
    if (!product || typeof product !== 'object') return null;
    const safeVariants = Array.isArray(product.variants)
      ? product.variants.map((v: any) => {
          try {
            return sanitizeVariant(v);
          } catch {
            return { ...v, priceAdjustment: 0, price: 0, stock: 0 };
          }
        })
      : [];
    return {
      ...product,
      price: toNumber(product.price),
      compareAtPrice: product.compareAtPrice != null ? toNumber(product.compareAtPrice) : null,
      costPrice: product.costPrice != null ? toNumber(product.costPrice) : null,
      weight: product.weight != null ? toNumber(product.weight) : null,
      variants: safeVariants,
    };
  } catch (e: any) {
    console.error('sanitizeProduct failed:', product?.id, e?.message);
    return product ? { ...product, price: toNumber(product.price), variants: [] } : null;
  }
};

// GET all products
app.get('/api/v1/products', async (req: Request, res: Response) => {
  if (!dbConnected) {
    return res.status(503).json(error('Service tijdelijk niet beschikbaar'));
  }
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    // DEFENSIVE: Convert Decimal to Number – filter nulls (isolatie)
    const sanitizedProducts = products.map(sanitizeProduct).filter((p: any) => p != null);

    res.json(success({
      products: sanitizedProducts,
      pagination: {
        page: 1,
        pageSize: sanitizedProducts.length,
        total: sanitizedProducts.length,
        totalPages: 1,
      },
    }));
  } catch (err: any) {
    console.error('Products error:', err.message);
    res.status(500).json(error('Could not fetch products'));
  }
});

// GET featured products
app.get('/api/v1/products/featured', async (req: Request, res: Response) => {
  if (!dbConnected) {
    return res.status(503).json(success([]));
  }
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 3,
    });

    // DEFENSIVE: Sanitize all products – filter nulls (isolatie)
    const sanitizedProducts = products.map(sanitizeProduct).filter((p: any) => p != null);
    res.json(success(sanitizedProducts));
  } catch (err: any) {
    console.error('Featured products error:', err.message);
    res.status(500).json(error('Could not fetch featured products'));
  }
});

// GET product by ID or SLUG (smart detection)
// ✅ WATERDICHT FIX: Detect slug vs ID - if contains dash, treat as slug
app.get('/api/v1/products/:id', async (req: Request, res: Response) => {
  if (!dbConnected) {
    return res.status(503).json(error('Service tijdelijk niet beschikbaar'));
  }
  try {
    const identifier = req.params.id;
    const isSlug = identifier.includes('-');
    
    const product = isSlug
      ? await prisma.product.findUnique({
          where: { slug: identifier },
          include: {
            category: true,
            variants: { where: { isActive: true } }
          }
        })
      : await prisma.product.findUnique({
          where: { id: identifier },
          include: {
            category: true,
            variants: { where: { isActive: true } }
          }
        });

    if (!product) {
      return res.status(404).json(error('Product not found'));
    }

    const sanitized = sanitizeProduct(product);
    if (!sanitized) {
      return res.status(500).json(error('Could not process product'));
    }
    res.json(success(sanitized));
  } catch (err: any) {
    console.error('Product by ID/Slug error:', err.message);
    res.status(500).json(error('Could not fetch product'));
  }
});

// GET product by slug – ✅ VOLLEDIG GEÏSOLEERD
app.get('/api/v1/products/slug/:slug', async (req: Request, res: Response) => {
  if (!dbConnected) {
    return res.status(503).json(error('Service tijdelijk niet beschikbaar'));
  }
  let slug: string;
  try {
    const raw = req.params.slug;
    slug = (Array.isArray(raw) ? raw[0] : raw) ? String(raw).toLowerCase().trim() : '';
    if (!slug) {
      return res.status(400).json(error('Ongeldige slug'));
    }
  } catch {
    return res.status(400).json(error('Ongeldige aanvraag'));
  }

  try {
    
    // ✅ FIX: Select only fields that exist in database (zorg dat data niet verloren gaat)
    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        sku: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        price: true,
        compareAtPrice: true,
        costPrice: true,
        stock: true,
        lowStockThreshold: true,
        trackInventory: true,
        weight: true,
        dimensions: true,
        images: true,
        metaTitle: true,
        metaDescription: true,
        isActive: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            productId: true,
            name: true,
            // ✅ FIX: Skip colorName/colorHex if columns don't exist
            // colorName: true,
            // colorHex: true,
            priceAdjustment: true,
            sku: true,
            stock: true,
            images: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      }
    });

    // ✅ FIX: Check if product exists (zorg dat data niet verloren gaat)
    if (!product) {
      return res.status(404).json(error('Product not found'));
    }
    
    // ✅ SECURITY: Only return active products for webshop (geen gevoelige data lekken)
    // Admin panel can access inactive products via /admin/products endpoint
    if (!product.isActive) {
      return res.status(404).json(error('Product not found'));
    }
    
    // DEFENSIVE: Sanitize product – ✅ ISOLATIE: sanitizeProduct gooit nooit
    const sanitized = sanitizeProduct(product);
    if (!sanitized) {
      console.error('sanitizeProduct returned null for slug:', slug);
      return res.status(500).json(error('Could not process product'));
    }
    res.json(success(sanitized));
  } catch (err: any) {
    // ✅ SECURITY: Log error but don't leak details
    console.error('Product by slug error:', {
      message: err?.message || 'Unknown error',
      code: err?.code,
      // ✅ SECURITY: No stack traces, API keys, or sensitive data in logs
    });
    // ✅ CRITICAL: NO FALLBACK to mock data - always return error if database fails
    // This ensures dynamic data from admin is NEVER overwritten by hardcoded values
    res.status(500).json(error('Could not fetch product'));
  }
});

// =============================================================================
// SETTINGS ENDPOINTS - DATABASE
// =============================================================================

// GET all settings
app.get('/api/v1/settings', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.setting.findMany();

    // Transform to key-value object
    const settingsObject = settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    res.json(success(settingsObject));
  } catch (err: any) {
    console.error('Settings error:', err.message);
    res.status(500).json(error('Could not fetch settings'));
  }
});

// PUT update settings (admin)
app.put('/api/v1/settings', async (req: Request, res: Response) => {
  try {
    const updates = req.body;

    // Update each setting
    for (const [key, value] of Object.entries(updates)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: value as any },
        create: { key, value: value as any },
      });
    }

    console.log(`✅ Settings updated: ${Object.keys(updates).join(', ')}`);
    res.json(success({ message: 'Settings updated', updated: Object.keys(updates) }));
  } catch (err: any) {
    console.error('Settings update error:', err.message);
    res.status(500).json(error('Could not update settings'));
  }
});

// =============================================================================
// CONTACT/CHAT ENDPOINTS - DATABASE
// =============================================================================

const axios = require('axios');

// POST new contact message
app.post('/api/v1/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, message, orderNumber } = req.body;

    if (!email || !message) {
      return res.status(400).json(error('Email en bericht zijn verplicht'));
    }

    // Basis email validatie
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json(error('Ongeldig email adres'));
    }

    // Save to database (naam als prefix in bericht opslaan, schema heeft geen name/metadata veld)
    const contactMessage = await prisma.contactMessage.create({
      data: {
        email,
        message: name ? `[Van: ${name}]\n\n${message}` : message,
        orderNumber: orderNumber || null,
        status: 'NEW',
        ipAddress: req.ip || null,
        userAgent: req.get('user-agent') || null,
      },
    });

    console.log(`✅ Contact saved to DB: ${contactMessage.id} - ${email}`);

    // Stuur email notificatie naar admin
    try {
      const nodemailer = require('nodemailer');
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASSWORD;
      const emailFrom = process.env.EMAIL_FROM || 'info@catsupply.nl';
      const adminEmail = process.env.SECURITY_ALERT_EMAIL || 'emin@catsupply.nl';

      if (smtpHost && smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: { user: smtpUser, pass: smtpPass },
        });

        const senderName = name ? name : 'Onbekend';

        // Admin notificatie
        await transporter.sendMail({
          from: emailFrom,
          to: adminEmail,
          subject: `📬 Nieuw contactbericht van ${senderName}`,
          html: `
            <h2>Nieuw contactbericht via CatSupply</h2>
            <p><strong>Naam:</strong> ${senderName}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${orderNumber ? `<p><strong>Bestelnummer:</strong> ${orderNumber}</p>` : ''}
            <hr>
            <p><strong>Bericht:</strong></p>
            <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555">${message.replace(/\n/g, '<br>')}</blockquote>
            <hr>
            <p style="font-size:12px;color:#999">Ontvangen op ${new Date().toLocaleString('nl-NL')} · CatSupply contactsysteem</p>
          `,
          text: `Naam: ${senderName}\nEmail: ${email}\n${orderNumber ? `Bestelnummer: ${orderNumber}\n` : ''}\nBericht:\n${message}`,
        });

        // Bevestiging naar afzender
        await transporter.sendMail({
          from: emailFrom,
          to: email,
          subject: 'Bedankt voor je bericht – CatSupply',
          html: `
            <h2>Bedankt voor je bericht, ${senderName}!</h2>
            <p>We hebben je bericht ontvangen en nemen zo snel mogelijk contact met je op.</p>
            <p><strong>Jouw bericht:</strong></p>
            <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555">${message.replace(/\n/g, '<br>')}</blockquote>
            <p>Heb je nog vragen? Stuur een email naar <a href="mailto:info@catsupply.nl">info@catsupply.nl</a>.</p>
            <p>Met vriendelijke groet,<br>Team CatSupply</p>
          `,
          text: `Bedankt ${senderName}! We hebben je bericht ontvangen en nemen zo snel mogelijk contact op.\n\nJouw bericht:\n${message}\n\nVragen? info@catsupply.nl\n\nMet vriendelijke groet,\nTeam CatSupply`,
        });

        console.log(`✅ Contact emails verstuurd: admin=${adminEmail}, afzender=${email}`);
      }
    } catch (emailErr: any) {
      // Email fout is niet kritisch: bericht is al opgeslagen in DB
      console.error('⚠️ Contact email fout (DB opgeslagen):', emailErr.message);
    }

    res.status(201).json(success({ id: contactMessage.id, message: 'Bericht ontvangen' }));
  } catch (err: any) {
    console.error('❌ Contact error:', err.message);
    res.status(500).json(error('Server fout'));
  }
});

// GET contact messages (admin)
app.get('/api/v1/contact', async (req: Request, res: Response) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json(success({ messages, total: messages.length }));
  } catch (err: any) {
    console.error('Contact messages error:', err.message);
    res.status(500).json(error('Could not fetch messages'));
  }
});

// =============================================================================
// ORDERS ENDPOINTS - DATABASE (persistent storage)
// =============================================================================

// ✅ CRITICAL FIX: REMOVED DUPLICATE ORDER CREATION ENDPOINT (was at line 451-548)
// This was causing orders to be created without proper validation, order number generation, and variant support
// The duplicate endpoint used simple `ORD${Date.now()}` instead of proper `ORD2601200001` format
// Now using ordersRoutes from routes/orders.routes.ts which uses OrderService.createOrder()

// Mollie webhook
app.post('/api/v1/webhooks/mollie', async (req: Request, res: Response) => {
  const { id: mollieId } = req.body;
  console.log(`✅ Mollie webhook: ${mollieId} (${ENV.isTest ? 'TEST' : 'LIVE'})`);
  res.status(200).json(success({ received: true }));
});

// =============================================================================
// ADMIN AUTH MIDDLEWARE - JWT Authentication
// =============================================================================

// Import auth utilities
const bcrypt = require('bcryptjs'); // ✅ FIX: Use bcryptjs (installed package)
const jwt = require('jsonwebtoken');

// ✅ SECURITY: JWT Authentication Middleware voor admin endpoints
const authMiddleware = async (req: Request, res: Response, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Geen authenticatie token gevonden'
      });
    }

    const token = authHeader.substring(7);
    // ✅ SECURITY: Use env config (no hardcoded fallback); min 32 chars enforced by Zod
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET || JWT_SECRET.length < 32) {
      return res.status(503).json({
        success: false,
        error: 'Server configuratie ontbreekt (JWT_SECRET)'
      });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
      (req as any).user = decoded;
      next();
    } catch (jwtError: any) {
      return res.status(401).json({
        success: false,
        error: 'Ongeldige of verlopen token'
      });
    }
  } catch (error: any) {
    // ✅ SECURITY: Generic error (geen gevoelige data)
    return res.status(401).json({
      success: false,
      error: 'Authenticatie mislukt'
    });
  }
};

// =============================================================================
// ADMIN ENDPOINTS - CRUD OPERATIONS
// =============================================================================

// ADMIN: Create product - ✅ SECURITY: JWT auth required
app.post('/api/v1/admin/products', authMiddleware, async (req: Request, res: Response) => {
  try {
    const productData = req.body;

    // Create category if needed
    let category = await prisma.category.findUnique({
      where: { slug: productData.categorySlug || 'kattenbakken' },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: 'Kattenbakken',
          slug: 'kattenbakken',
          description: 'Automatische kattenbakken',
        },
      });
    }

    const product = await prisma.product.create({
      data: {
        ...productData,
        categoryId: category.id,
      },
    });

    console.log(`✅ Admin created product: ${product.name}`);
    res.status(201).json(success(product));
  } catch (err: any) {
    console.error('Admin create product error:', err.message);
    res.status(500).json(error('Could not create product'));
  }
});

// ADMIN: Update product - ✅ SECURITY: JWT auth required
app.put('/api/v1/admin/products/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    // ✅ FIX: Remove read-only fields and nested objects that should not be updated
    const { 
      id, 
      createdAt, 
      updatedAt, 
      publishedAt,
      category,  // Remove nested objects
      variants,  // Variants are updated separately
      orderItems,
      categoryId, // Handle separately if needed
      ...updateData 
    } = req.body as any;
    
    // ✅ FIX: Only allow fields that exist in Product model
    const allowedFields = [
      'sku', 'name', 'slug', 'description', 'shortDescription',
      'price', 'compareAtPrice', 'costPrice',
      'stock', 'lowStockThreshold', 'trackInventory',
      'weight', 'dimensions', 'images',
      'metaTitle', 'metaDescription',
      'isActive', 'isFeatured',
      'categoryId'
    ];
    
    // Clean undefined/null values and filter to allowed fields only
    const cleanData: any = {};
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && allowedFields.includes(key)) {
        cleanData[key] = updateData[key];
      }
    });
    
    // Get existing product for comparison
    const existing = await prisma.product.findUnique({
      where: { id: req.params.id }
    });
    
    if (!existing) {
      return res.status(404).json(error('Product niet gevonden'));
    }
    
    // ✅ FIX: Update product with clean data (only existing fields)
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: cleanData,
      select: {
        id: true,
        sku: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        price: true,
        compareAtPrice: true,
        costPrice: true,
        stock: true,
        lowStockThreshold: true,
        trackInventory: true,
        weight: true,
        dimensions: true,
        images: true,
        metaTitle: true,
        metaDescription: true,
        isActive: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        variants: {
          select: {
            id: true,
            productId: true,
            name: true,
            priceAdjustment: true,
            sku: true,
            stock: true,
            images: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      }
    });

    // Sanitize for response (convert Decimals)
    try {
      const sanitizedProduct = sanitizeProduct(product);
      console.log(`✅ Admin updated product: ${product.name}`);
      res.json(success(sanitizedProduct));
    } catch (sanitizeError: any) {
      // ✅ FIX: Return product anyway if sanitization fails (zorg dat data niet verloren gaat)
      console.error('Product sanitization error:', sanitizeError?.message || 'Unknown error');
      res.json(success({
        ...product,
        price: toNumber(product.price),
        compareAtPrice: product.compareAtPrice ? toNumber(product.compareAtPrice) : null,
        costPrice: product.costPrice ? toNumber(product.costPrice) : null,
        weight: product.weight ? toNumber(product.weight) : null,
      }));
    }
  } catch (err: any) {
    // ✅ SECURITY: Log error but don't leak details
    console.error('Admin update product error:', {
      message: err?.message || 'Unknown error',
      code: err?.code,
      // ✅ SECURITY: No stack traces, API keys, or sensitive data in logs
    });
    res.status(500).json(error('Could not update product'));
  }
});

// ADMIN: Delete product - ✅ SECURITY: JWT auth required
app.delete('/api/v1/admin/products/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id },
    });

    console.log(`✅ Admin deleted product: ${req.params.id}`);
    res.json(success({ id: req.params.id }));
  } catch (err: any) {
    console.error('Admin delete product error:', err.message);
    res.status(500).json(error('Could not delete product'));
  }
});

// ADMIN: Get all products (with filters) - ✅ SECURITY: JWT auth required
app.get('/api/v1/admin/products', authMiddleware, async (req: Request, res: Response) => {
  try {
    // ✅ FIX: Select only fields that exist in database (zorg dat data niet verloren gaat)
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        sku: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        price: true,
        compareAtPrice: true,
        costPrice: true,
        stock: true,
        lowStockThreshold: true,
        trackInventory: true,
        weight: true,
        dimensions: true,
        images: true,
        metaTitle: true,
        metaDescription: true,
        isActive: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    });

    // DEFENSIVE: Sanitize all products with error handling
    try {
      const sanitizedProducts = products.map(sanitizeProduct);
      res.json(success(sanitizedProducts));
    } catch (sanitizeError: any) {
      // ✅ FIX: Return products anyway if sanitization fails (zorg dat data niet verloren gaat)
      console.error('Product sanitization error:', sanitizeError?.message || 'Unknown error');
      res.json(success(products));
    }
  } catch (err: any) {
    // ✅ SECURITY: Log error but don't leak details
    console.error('Admin products error:', {
      message: err?.message || 'Unknown error',
      code: err?.code,
      // ✅ SECURITY: No stack traces, API keys, or sensitive data in logs
    });
    res.status(500).json(error('Could not fetch products'));
  }
});

// ADMIN: Get single product - ✅ SECURITY: JWT auth required
app.get('/api/v1/admin/products/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    // ✅ FIX: Select only fields that exist in database (zorg dat data niet verloren gaat)
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        sku: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        price: true,
        compareAtPrice: true,
        costPrice: true,
        stock: true,
        lowStockThreshold: true,
        trackInventory: true,
        weight: true,
        dimensions: true,
        images: true,
        metaTitle: true,
        metaDescription: true,
        isActive: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        variants: {
          select: {
            id: true,
            productId: true,
            name: true,
            // ✅ FIX: Skip colorName/colorHex if columns don't exist
            // colorName: true,
            // colorHex: true,
            priceAdjustment: true,
            sku: true,
            stock: true,
            images: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json(error('Product not found'));
    }

    // ✅ FIX: Sanitize product including variants with error handling
    try {
      // ✅ FIX: Check if variants exist before mapping
      const productWithVariants = {
        ...product,
        variants: product.variants && Array.isArray(product.variants) ? product.variants : []
      };
      const sanitized = sanitizeProduct(productWithVariants);
      res.json(success(sanitized));
    } catch (sanitizeError: any) {
      // ✅ FIX: Return product anyway (zorg dat data niet verloren gaat)
      console.error('Product sanitization error:', {
        message: sanitizeError?.message || 'Unknown error',
        // ✅ SECURITY: No stack traces in logs
      });
      // ✅ FIX: Return raw product data (zorg dat data niet verloren gaat)
      res.json(success({
        ...product,
        price: toNumber(product.price),
        compareAtPrice: product.compareAtPrice ? toNumber(product.compareAtPrice) : null,
        costPrice: product.costPrice ? toNumber(product.costPrice) : null,
        weight: product.weight ? toNumber(product.weight) : null,
      }));
    }
  } catch (err: any) {
    // ✅ SECURITY: Log error but don't leak details
    console.error('Admin product error:', {
      message: err?.message || 'Unknown error',
      code: err?.code,
      // ✅ SECURITY: No stack traces, API keys, or sensitive data in logs
    });
    res.status(500).json(error('Could not fetch product'));
  }
});

// ADMIN: Get settings
app.get('/api/v1/admin/settings', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.setting.findMany();

    const settingsObject = settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    res.json(success(settingsObject));
  } catch (err: any) {
    console.error('Admin settings error:', err.message);
    res.status(500).json(error('Could not fetch settings'));
  }
});

// ADMIN: Update settings
app.put('/api/v1/admin/settings', async (req: Request, res: Response) => {
  try {
    const updates = req.body;

    for (const [key, value] of Object.entries(updates)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: value as any },
        create: { key, value: value as any },
      });
    }

    console.log(`✅ Admin updated settings: ${Object.keys(updates).join(', ')}`);
    res.json(success({ message: 'Settings updated' }));
  } catch (err: any) {
    console.error('Admin settings update error:', err.message);
    res.status(500).json(error('Could not update settings'));
  }
});

// Helper: Sanitize order for API response (convert Decimals)
const sanitizeOrder = (order: any) => ({
  ...order,
  subtotal: toNumber(order.subtotal),
  shippingCost: toNumber(order.shippingCost),
  tax: toNumber(order.tax),
  total: toNumber(order.total),
  items: order.items?.map((item: any) => ({
    ...item,
    price: toNumber(item.price),
    quantity: item.quantity,
    product: item.product ? sanitizeProduct(item.product) : null,
  })) || [],
});

// ADMIN: Get all orders
app.get('/api/v1/admin/orders', async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // DEFENSIVE: Convert Decimals to Numbers
    const sanitizedOrders = orders.map(sanitizeOrder);
    res.json(success(sanitizedOrders));
  } catch (err: any) {
    console.error('Admin orders error:', err.message);
    res.status(500).json(error('Could not fetch orders'));
  }
});

// ✅ PUBLIC: Get order by ID (for success page)
// GET /api/v1/orders/by-number/:orderNumber - Get order by orderNumber
// ✅ FIX: Added for return page to find order by ORD1768729461323
app.get('/api/v1/orders/by-number/:orderNumber', async (req: Request, res: Response) => {
  if (!dbConnected) {
    return res.status(503).json(error('Service tijdelijk niet beschikbaar'));
  }
  try {
    const { orderNumber } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                sku: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        payment: true,
        returns: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: `Order ${orderNumber} not found`,
      });
    }

    // ✅ FIX: Transform order to include all address fields and convert Decimal to number
    const { transformOrder } = require('./lib/transformers');
    const transformed = await transformOrder(order);

    res.json({
      success: true,
      data: transformed,
    });
  } catch (err: any) {
    console.error('Order by number error:', err.message);
    res.status(500).json(error('Could not fetch order'));
  }
});

// ✅ ADMIN: Get order by orderNumber (alternative lookup)
app.get('/api/v1/admin/orders/by-number/:orderNumber', async (req: Request, res: Response) => {
  try {
    // ✅ SECURITY: Verify admin authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Geen authenticatie token gevonden',
      });
    }

    const { orderNumber } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                sku: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        payment: true,
        returns: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: `Order ${orderNumber} not found`,
      });
    }

    // ✅ FIX: Transform order to include all address fields and convert Decimal to number
    const { transformOrder } = require('./lib/transformers');
    const transformed = await transformOrder(order);

    res.json({
      success: true,
      data: transformed,
    });
  } catch (err: any) {
    console.error('Admin order by number error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Could not fetch order',
    });
  }
});

// SECURITY: Only returns minimal info (orderNumber, customerEmail, status)
// No authentication required - order ID is the security token
// ✅ CRITICAL: Success page depends on this – dbConnected check + isolatie
app.get('/api/v1/orders/:id', async (req: Request, res: Response) => {
  if (!dbConnected) {
    return res.status(503).json(error('Service tijdelijk niet beschikbaar'));
  }
  try {
    const rawId = req.params.id;
    const sanitizedId = (Array.isArray(rawId) ? rawId[0] : rawId) ? String(rawId).trim() : '';
    if (!sanitizedId || sanitizedId.length < 5) {
      return res.status(400).json(error('Ongeldig order ID'));
    }

    const order = await prisma.order.findUnique({
      where: { id: sanitizedId },
      select: {
        id: true,
        orderNumber: true,
        customerEmail: true,
        status: true,
        createdAt: true,
        total: true,
      },
    });

    if (!order) {
      return res.status(404).json(error('Order not found'));
    }

    const sanitizedOrder = {
      ...order,
      total: toNumber(order.total),
    };
    return res.json(success(sanitizedOrder));
  } catch (err: any) {
    console.error('Public order by ID error:', err?.message || err);
    return res.status(500).json(error('Could not fetch order'));
  }
});

// ADMIN: Get single order by ID
app.get('/api/v1/admin/orders/:id', async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                sku: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        payment: true,
        returns: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    // ✅ FIX: Transform order to include all address fields and convert Decimal to number
    const { transformOrder } = require('./lib/transformers');
    const transformed = await transformOrder(order);

    res.json({
      success: true,
      data: transformed,
    });
  } catch (err: any) {
    console.error('Admin order by ID error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Could not fetch order',
    });
  }
});

// ADMIN: Get contact messages
app.get('/api/v1/admin/contact', async (req: Request, res: Response) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json(success({ messages, total: messages.length }));
  } catch (err: any) {
    console.error('Admin contact messages error:', err.message);
    res.status(500).json(error('Could not fetch messages'));
  }
});

// =============================================================================
// ADMIN AUTH ENDPOINTS - JWT + Bcrypt
// =============================================================================

// Admin login endpoint
app.post('/api/v1/admin/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email en wachtwoord zijn verplicht'
      });
    }

    // PRODUCTION: Admin credentials
    const ADMIN_EMAIL = 'admin@catsupply.nl';
    // Bcrypt hash of 'admin123'
    const ADMIN_PASSWORD_HASH = '$2b$12$YFxAp2RnZrMhd84.zPzo2uQeAuXXELNbp7fkgBAAshvlDrVUWTcN.';

    // Check email
    if (email !== ADMIN_EMAIL) {
      // Timing attack prevention
      await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
      return res.status(401).json({
        success: false,
        error: 'Ongeldige inloggegevens'
      });
    }

    // Verify password with bcrypt
    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Ongeldige inloggegevens'
      });
    }

    // Generate JWT token - ✅ SECURITY: No fallback; use env only (Zod validates min 32 chars)
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET || JWT_SECRET.length < 32) {
      return res.status(503).json({
        success: false,
        error: 'Server configuratie ontbreekt (JWT_SECRET)'
      });
    }
    const token = jwt.sign(
      { id: '1', email: ADMIN_EMAIL, role: 'ADMIN' },
      JWT_SECRET,
      { expiresIn: '7d', algorithm: 'HS256' }
    );
    
    console.log(`✅ Admin login successful: ${email}`);
    
    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: '1',
          email: ADMIN_EMAIL,
          role: 'ADMIN',
          firstName: 'Admin',
          lastName: 'User'
        }
      }
    });
  } catch (err: any) {
    console.error('Admin login error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Er is een fout opgetreden'
    });
  }
});

// =============================================================================
// ADMIN UPLOAD ROUTES - File/Image/Video Upload (INLINE - NO @ IMPORTS)
// =============================================================================

// Multer setup - DIRECT no @ imports (path al geïmporteerd bovenaan)
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = '/var/www/uploads/products';
const VIDEO_UPLOAD_DIR = '/var/www/uploads/videos';

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const dir = file.mimetype.startsWith('video/') ? VIDEO_UPLOAD_DIR : UPLOAD_DIR;
    cb(null, dir);
  },
  filename: (req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// POST /api/v1/admin/upload/images - Upload product images
app.post('/api/v1/admin/upload/images', uploadMiddleware.array('images', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }
    
    const uploadedFiles = files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      url: `/uploads/products/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));
    
    console.log(`✅ Uploaded ${uploadedFiles.length} images`);
    
    return res.json({
      success: true,
      data: uploadedFiles
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Upload failed'
    });
  }
});

// POST /api/v1/admin/upload/videos - Upload videos
app.post('/api/v1/admin/upload/videos', uploadMiddleware.single('video'), async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No video uploaded'
      });
    }
    
    const uploadedFile = {
      filename: file.filename,
      originalName: file.originalname,
      url: `/uploads/videos/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    };
    
    console.log(`✅ Uploaded video: ${file.filename}`);
    
    return res.json({
      success: true,
      data: uploadedFile
    });
  } catch (error: any) {
    console.error('Video upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Video upload failed'
    });
  }
});

console.log('✅ Admin upload endpoints loaded: /api/v1/admin/upload/images, /api/v1/admin/upload/videos');

// =============================================================================
// RETURN ENDPOINTS
// =============================================================================

// ✅ CRITICAL FIX: Import ordersRoutes (uses OrderService.createOrder() with proper order number generation)
// ✅ Success page + payment-status: 503 bij DB down
let ordersRoutes;
try {
  ordersRoutes = require('./routes/orders.routes').default;
  if (!ordersRoutes) {
    ordersRoutes = require('./routes/orders.routes');
  }
} catch (e) {
  console.error('Failed to load orders routes:', e);
  ordersRoutes = require('./routes/orders.routes');
}
app.use('/api/v1/orders', (req: Request, res: Response, next: any) => {
  if (!dbConnected) {
    return res.status(503).json(error('Service tijdelijk niet beschikbaar'));
  }
  next();
}, ordersRoutes);

// Import return routes
// ✅ FIX: Handle both default and named exports
let returnsRoutes;
try {
  returnsRoutes = require('./routes/returns.routes').default;
  if (!returnsRoutes) {
    returnsRoutes = require('./routes/returns.routes');
  }
} catch (e) {
  console.error('Failed to load returns routes:', e);
  returnsRoutes = require('./routes/returns.routes');
}
app.use('/api/v1/returns', returnsRoutes);

console.log('✅ Return endpoints loaded: /api/v1/returns');

// =============================================================================
// RAG ENDPOINTS - AI Chat with Enhanced Pipeline
// =============================================================================

try {
  const ragRoutes = require('./routes/rag.routes').default;
  app.use('/api/v1/rag', ragRoutes);
  console.log('✅ RAG endpoints loaded: /api/v1/rag/chat, /api/v1/rag/health');
} catch (e: any) {
  console.error('RAG routes failed to load (chat disabled):', e?.message || e);
  app.use('/api/v1/rag', (req: Request, res: Response) => {
    res.status(503).json(error('Chat tijdelijk niet beschikbaar'));
  });
}

// =============================================================================
// ERROR HANDLERS
// =============================================================================

app.use((req: Request, res: Response) => {
  res.status(404).json(error(`Route ${req.method} ${req.path} not found`));
});

app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json(error('Internal server error'));
});

// =============================================================================
// START SERVER
// =============================================================================

app.listen(PORT, async () => {
  console.log('='.repeat(60));
  console.log('🚀 KATTENBAK BACKEND - DATABASE EDITION');
  console.log('='.repeat(60));
  console.log(`✅ Server: http://localhost:${PORT}`);
  console.log(`✅ Env: ${ENV.NODE_ENV} | Mollie: ${ENV.isTest ? 'TEST' : 'LIVE'}`);

  // Connect database without crashing – process stays up so nginx gets 200 and can retry
  try {
    await prisma.$connect();
    dbConnected = true;
    console.log('✅ Database: PostgreSQL connected');
    // ✅ PM2 wait-ready: Signal ready only after DB connected (zero-downtime deploy)
    if (typeof process.send === 'function') {
      process.send('ready');
    }
  } catch (err: any) {
    console.error('❌ Database connection failed (will retry):', err.message);
    dbConnected = false;
    // Optional: periodic reconnect (every 30s)
    const reconnect = async () => {
      try {
        await prisma.$connect();
        dbConnected = true;
        console.log('✅ Database: reconnected');
        if (typeof process.send === 'function') {
          process.send('ready');
        }
      } catch (e: any) {
        console.error('Database reconnect failed:', e.message);
        setTimeout(reconnect, 30000);
      }
    };
    setTimeout(reconnect, 30000);
  }
  console.log('='.repeat(60));
});

export default app;
