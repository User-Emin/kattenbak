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

// Mollie client - DIRECT geen @ imports  
const { createMollieClient } = require('@mollie/api-client');
const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY || '' });

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

// Helper: Convert Prisma Decimal to Number (defensive)
const toNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const num = parseFloat(String(value));
  return isNaN(num) ? 0 : num;
};

// Helper: Sanitize product for API response
const sanitizeProduct = (product: any) => ({
  ...product,
  price: toNumber(product.price),
  compareAtPrice: product.compareAtPrice ? toNumber(product.compareAtPrice) : null,
  costPrice: product.costPrice ? toNumber(product.costPrice) : null,
  weight: product.weight ? toNumber(product.weight) : null,
});

// GET all products
app.get('/api/v1/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    // DEFENSIVE: Convert Decimal to Number for frontend
    const sanitizedProducts = products.map(sanitizeProduct);

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
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 3,
    });

    // DEFENSIVE: Sanitize all products
    const sanitizedProducts = products.map(sanitizeProduct);
    res.json(success(sanitizedProducts));
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

    // DEFENSIVE: Sanitize product
    res.json(success(sanitizeProduct(product)));
  } catch (err: any) {
    console.error('Product by ID error:', err.message);
    res.status(500).json(error('Could not fetch product'));
  }
});

// GET product by slug
app.get('/api/v1/products/slug/:slug', async (req: Request, res: Response) => {
  try {
    // SECURITY: Sanitize slug input
    const slug = String(req.params.slug).toLowerCase().trim();
    
    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product) {
      return res.status(404).json(error('Product not found'));
    }

    // DEFENSIVE: Sanitize product
    res.json(success(sanitizeProduct(product)));
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
        customerEmail: orderData.customer?.email || orderData.customerEmail,
        subtotal,
        shippingCost,
        tax,
        total,
        status: 'PENDING',
        customerNotes: orderData.customerNotes || null,
        shippingAddress: {
          create: {
            firstName: orderData.customer?.firstName || orderData.shippingAddress?.firstName || '',
            lastName: orderData.customer?.lastName || orderData.shippingAddress?.lastName || '',
            street: orderData.shipping?.address || '',
            houseNumber: '',
            postalCode: orderData.shipping?.postalCode || '',
            city: orderData.shipping?.city || '',
            country: orderData.shipping?.country || 'NL',
            phone: orderData.customer?.phone || '',
          },
        },
      },
    });

    console.log(`✅ Order created: ${order.orderNumber} | €${total}`);

    // ✅ REAL Mollie payment integration (direct client, geen @ imports)
    const redirectUrl = `${ENV.FRONTEND_URL}/success?order=${order.id}`;
    const payment = await mollieClient.payments.create({
      amount: {
        currency: 'EUR',
        value: total.toFixed(2),
      },
      description: `Order ${order.orderNumber}`,
      redirectUrl,
      webhookUrl: `${ENV.FRONTEND_URL}/api/webhooks/mollie`,
      metadata: {
        orderId: order.id,
      },
      method: orderData.paymentMethod || 'ideal',
    });

    res.status(201).json(success({ 
      order, 
      payment: {
        id: payment.id,
        checkoutUrl: payment.getCheckoutUrl(),
      }
    }));
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
// ADMIN ENDPOINTS - CRUD OPERATIONS
// =============================================================================

// ADMIN: Create product
app.post('/api/v1/admin/products', async (req: Request, res: Response) => {
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

// ADMIN: Update product
app.put('/api/v1/admin/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });

    console.log(`✅ Admin updated product: ${product.name}`);
    res.json(success(product));
  } catch (err: any) {
    console.error('Admin update product error:', err.message);
    res.status(500).json(error('Could not update product'));
  }
});

// ADMIN: Delete product
app.delete('/api/v1/admin/products/:id', async (req: Request, res: Response) => {
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

// ADMIN: Get all products (with filters)
app.get('/api/v1/admin/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });

    // DEFENSIVE: Sanitize all products
    const sanitizedProducts = products.map(sanitizeProduct);
    res.json(success(sanitizedProducts));
  } catch (err: any) {
    console.error('Admin products error:', err.message);
    res.status(500).json(error('Could not fetch products'));
  }
});

// ADMIN: Get single product
app.get('/api/v1/admin/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    });

    if (!product) {
      return res.status(404).json(error('Product not found'));
    }

    res.json(success(product));
  } catch (err: any) {
    console.error('Admin product error:', err.message);
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

// ADMIN: Get single order by ID
app.get('/api/v1/admin/orders/:id', async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        shippingAddress: true,
        payment: true,
      },
    });

    if (!order) {
      return res.status(404).json(error('Order not found'));
    }

    // DEFENSIVE: Convert Decimals to Numbers
    res.json(success(sanitizeOrder(order)));
  } catch (err: any) {
    console.error('Admin order by ID error:', err.message);
    res.status(500).json(error('Could not fetch order'));
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

// Import auth utilities
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
    // Bcrypt hash of 'admin124'
    const ADMIN_PASSWORD_HASH = '$2b$12$lRC/k4ipEq8qq5UPSGxi8u4tba90ZAPn1Wj.WczdTT0ngri9FQc.G';

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

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const token = jwt.sign(
      { id: '1', email: ADMIN_EMAIL, role: 'ADMIN' },
      JWT_SECRET,
      { expiresIn: '7d' }
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
// RAG ENDPOINTS - AI Chat with Enhanced Pipeline
// =============================================================================

// Import RAG routes - ENABLED with full security
const ragRoutes = require('./routes/rag.routes').default;
app.use('/api/v1/rag', ragRoutes);

console.log('✅ RAG endpoints loaded: /api/v1/rag/chat, /api/v1/rag/health');

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
