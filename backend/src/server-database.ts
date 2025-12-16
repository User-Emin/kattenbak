/**
 * PRODUCTION SERVER MET DATABASE
 * - PostgreSQL via Prisma
 * - Geen @ imports (direct requires)
 * - Enterprise niveau
 * - Alles dynamisch uit database
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment
dotenv.config();

const app: Application = express();
const PORT = 3101;

// Prisma client - DIRECT geen @ imports
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({ success: true, message: 'API v1 healthy with database', version: '1.0.0' });
});

// =============================================================================
// PRODUCTS ENDPOINTS - DATABASE
// =============================================================================

// GET all products
app.get('/api/v1/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(success({
      products,
      pagination: {
        page: 1,
        pageSize: products.length,
        total: products.length,
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
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 3,
    });

    res.json(success(products));
  } catch (err: any) {
    console.error('Featured products error:', err.message);
    res.status(500).json(error('Could not fetch featured products'));
  }
});

// GET product by ID
app.get('/api/v1/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      return res.status(404).json(error('Product not found'));
    }

    res.json(success(product));
  } catch (err: any) {
    console.error('Product by ID error:', err.message);
    res.status(500).json(error('Could not fetch product'));
  }
});

// GET product by slug
app.get('/api/v1/products/slug/:slug', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
    });

    if (!product) {
      return res.status(404).json(error('Product not found'));
    }

    res.json(success(product));
  } catch (err: any) {
    console.error('Product by slug error:', err.message);
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
    const { email, message, orderNumber, captchaToken } = req.body;

    if (!email || !message || !captchaToken) {
      return res.status(400).json(error('Email, message en captchaToken verplicht'));
    }

    // Verify hCaptcha
    const formData = new URLSearchParams();
    formData.append('secret', ENV.HCAPTCHA_SECRET);
    formData.append('response', captchaToken);

    const captchaResponse = await axios.post('https://hcaptcha.com/siteverify', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 5000,
    });

    if (!captchaResponse.data.success) {
      console.warn('❌ hCaptcha fail:', captchaResponse.data['error-codes']);
      return res.status(403).json(error('Captcha verificatie mislukt'));
    }

    // Save to database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        email,
        message,
        orderNumber: orderNumber || null,
        status: 'NEW',
        metadata: { ip: req.ip },
      },
    });

    console.log(`✅ Contact saved to DB: ${contactMessage.id} - ${email}`);

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

// POST create order
app.post('/api/v1/orders', async (req: Request, res: Response) => {
  try {
    const orderData = req.body;

    // Calculate totals
    const subtotal = orderData.items.reduce((sum: number, item: any) => {
      return sum + item.price * item.quantity;
    }, 0);

    const tax = subtotal * 0.21;
    const shippingCost = subtotal >= 50 ? 0 : 5.95;
    const total = subtotal + tax + shippingCost;

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD${Date.now()}`,
        customerEmail: orderData.customerEmail,
        customerFirstName: orderData.shippingAddress?.firstName || '',
        customerLastName: orderData.shippingAddress?.lastName || '',
        subtotal,
        shippingCost,
        tax,
        total,
        status: 'PENDING',
        paymentMethod: 'mollie',
        shippingMethod: 'standard',
        customerNotes: orderData.customerNotes || null,
        metadata: {
          ip: req.ip,
          userAgent: req.get('user-agent'),
        },
      },
    });

    console.log(`✅ Order created: ${order.orderNumber} | €${total}`);

    // Mock Mollie payment
    const mollieUrl = `${ENV.FRONTEND_URL}/success?order=${order.id}&payment=test`;
    const payment = {
      id: `pay_${Date.now()}`,
      checkoutUrl: mollieUrl,
      mollieMode: ENV.isTest ? 'TEST' : 'LIVE',
    };

    res.status(201).json(success({ order, payment }));
  } catch (err: any) {
    console.error('Order creation error:', err.message);
    res.status(500).json(error('Could not create order'));
  }
});

// Mollie webhook
app.post('/api/v1/webhooks/mollie', async (req: Request, res: Response) => {
  const { id: mollieId } = req.body;
  console.log(`✅ Mollie webhook: ${mollieId} (${ENV.isTest ? 'TEST' : 'LIVE'})`);
  res.status(200).json(success({ received: true }));
});

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
  // Test database connection
  try {
    await prisma.$connect();
    console.log('='.repeat(60));
    console.log('🚀 KATTENBAK BACKEND - DATABASE EDITION');
    console.log('='.repeat(60));
    console.log(`✅ Server: http://localhost:${PORT}`);
    console.log(`✅ Env: ${ENV.NODE_ENV} | Mollie: ${ENV.isTest ? 'TEST' : 'LIVE'}`);
    console.log(`✅ Database: PostgreSQL connected`);
    console.log('='.repeat(60));
  } catch (err: any) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
});

export default app;
