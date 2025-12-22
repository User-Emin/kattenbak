import express from 'express';
import type { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import adminAuthRoutes from './routes/admin-auth.routes';
import adminRoutes from './routes/admin'; // ✅ FIX: Import admin routes
import ragRoutes from './routes/rag.routes'; // ✅ RAG Chat routes

// Load environment variables
dotenv.config();

/**
 * SECURE: Load Claude API key from /Emin/claudekey (NOOIT in git/chat!)
 */
const CLAUDE_KEY_PATH = '/Emin/claudekey';
let CLAUDE_API_KEY = '';

try {
  if (fs.existsSync(CLAUDE_KEY_PATH)) {
    const keyContent = fs.readFileSync(CLAUDE_KEY_PATH, 'utf-8');
    // Extract key from file (skip comments/placeholders)
    const keyMatch = keyContent.match(/sk-ant-api03-[A-Za-z0-9_-]+/);
    if (keyMatch) {
      CLAUDE_API_KEY = keyMatch[0];
      process.env.CLAUDE_API_KEY = CLAUDE_API_KEY;
      console.log('✅ Claude API key loaded from /Emin/claudekey (SECURE)');
    } else {
      console.warn('⚠️  Claude key file exists but contains placeholder');
    }
  } else {
    console.warn('⚠️  Claude key file not found at', CLAUDE_KEY_PATH);
  }
} catch (err: any) {
  console.error('❌ Error loading Claude key:', err.message);
}

const app: Application = express();
const PORT = 3101;

/**
 * ENVIRONMENT CONFIGURATION
 * Maximaal transparant, secure en maintainable
 * Development vs Production scheiding
 */
const MOLLIE_KEY = process.env.MOLLIE_API_KEY || 'test_ePFM8bCr6NEqN7fFq2qKS6x7KEzjJ7';
const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  MOLLIE_API_KEY: MOLLIE_KEY,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3100',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
  // Validate Mollie key type
  mollieKeyType: MOLLIE_KEY.startsWith('test_') ? 'TEST' : 'LIVE',
};

// WARNING: Test key in production (allow maar warn)
if (ENV.isProduction && ENV.mollieKeyType === 'TEST') {
  console.warn('');
  console.warn('========================================');
  console.warn('⚠️  WARNING: Mollie TEST key in PRODUCTION');
  console.warn('========================================');
  console.warn('Consider upgrading to live_... key');
  console.warn('Current: test mode');
  console.warn('========================================');
  console.warn('');
}

// Warn if live key in development
if (ENV.isDevelopment && ENV.mollieKeyType === 'LIVE') {
  console.warn('');
  console.warn('========================================');
  console.warn('⚠️  WARNING: Live Mollie key in DEVELOPMENT');
  console.warn('========================================');
  console.warn('Using LIVE Mollie key outside production');
  console.warn('Consider using test_... key for development');
  console.warn('========================================');
  console.warn('');
}

app.use(helmet());
app.use(cors({ origin: ['http://localhost:3100', 'http://localhost:3102'], credentials: true }));
app.use(express.json());

// Mock Product - Premium Zelfreinigende Kattenbak
const mockProduct = {
  id: '1',
  sku: 'KB-AUTO-001',
  name: 'Automatische Kattenbak Premium',
  slug: 'automatische-kattenbak-premium',
  description: 'Premium zelfreinigende kattenbak met app-bediening. Automatische reiniging na elk gebruik, fluisterstille werking (32dB), meervoudige veiligheidssensoren, UV-sterilisatie voor geurcontrole, en real-time gezondheidsmonitoring via app. Geschikt voor katten tot 7kg. Grote capaciteit (10L afvalbak), compatibel met alle strooiselsoorten.',
  shortDescription: 'Zelfreinigende kattenbak met app-bediening en gezondheidsmonitoring',
  price: 299.99,
  compareAtPrice: 399.99,
  costPrice: null,
  stock: 15,
  lowStockThreshold: 10,
  trackInventory: true,
  weight: 5.2,
  dimensions: { length: 55, width: 45, height: 35 },
  images: [
    '/images/test-cat.jpg',
    '/images/test-cat.jpg',
    '/images/test-cat.jpg',
  ],
  metaTitle: 'Automatische Kattenbak Premium - Zelfreinigende Kattenbak',
  metaDescription: 'Premium zelfreinigende kattenbak met app-bediening en gezondheidsmonitoring',
  isActive: true,
  isFeatured: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
  categoryId: '1',
  category: { id: '1', name: 'Kattenbakken', slug: 'kattenbakken' }
};

const success = (data: any) => ({ success: true, data });
const error = (message: string) => ({ success: false, error: message });

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Healthy', environment: ENV.NODE_ENV, mollie: ENV.isTest ? 'TEST' : 'LIVE', timestamp: new Date().toISOString() });
});

app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({ success: true, message: 'API v1 healthy', version: '1.0.0' });
});

app.get('/api/v1/products', (req: Request, res: Response) => {
  res.json(success({ products: [mockProduct], pagination: { page: 1, pageSize: 12, total: 1, totalPages: 1 } }));
});

app.get('/api/v1/products/featured', (req: Request, res: Response) => {
  res.json(success([mockProduct]));
});

app.get('/api/v1/products/:id', (req: Request, res: Response) => {
  res.json(success(mockProduct));
});

app.get('/api/v1/products/slug/:slug', (req: Request, res: Response) => {
  res.json(success(mockProduct));
});

// ADMIN: PUT /api/v1/products/:id - Update product
app.put('/api/v1/products/:id', (req: Request, res: Response) => {
  console.log('📝 Admin PUT /products/:id - Update product:', req.body);
  
  // Update mockProduct with new data
  const updates = req.body;
  Object.assign(mockProduct, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
  
  console.log('✅ Product updated:', mockProduct.name);
  res.json(success(mockProduct));
});

app.post('/api/v1/orders', (req: Request, res: Response) => {
  const orderData = req.body;
  const order = {
    id: Math.random().toString(36).substr(2, 9),
    orderNumber: `ORD${Date.now()}`,
    customerEmail: orderData.customerEmail,
    total: (orderData.items[0]?.quantity || 1) * mockProduct.price,
    subtotal: (orderData.items[0]?.quantity || 1) * mockProduct.price,
    shippingCost: 0,
    tax: ((orderData.items[0]?.quantity || 1) * mockProduct.price) * 0.21,
    status: 'PENDING',
    items: [{ productId: mockProduct.id, productName: mockProduct.name, price: mockProduct.price, quantity: orderData.items[0]?.quantity || 1 }],
    createdAt: new Date().toISOString(),
  };
  
  const mollieUrl = `${ENV.FRONTEND_URL}/success?order=${order.id}&payment=test`;
  const payment = { id: Math.random().toString(36).substr(2, 9), checkoutUrl: mollieUrl, mollieMode: ENV.isTest ? 'TEST' : 'LIVE' };

  console.log(`✅ Order: ${order.orderNumber} | Mollie: ${ENV.isTest ? 'TEST' : 'LIVE'}`);
  res.status(201).json(success({ order, payment }));
});

app.post('/api/v1/webhooks/mollie', (req: Request, res: Response) => {
  const { id: mollieId } = req.body;
  console.log(`✅ Mollie webhook: ${mollieId} (${ENV.isTest ? 'TEST' : 'LIVE'})`);
  res.status(200).json(success({ received: true }));
});

// ENTERPRISE: Contact/Chat endpoints
const contactMessages: any[] = [];
const HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET_KEY || '';

app.post('/api/v1/contact', async (req: Request, res: Response) => {
  try {
    const { email, message, orderNumber, captchaToken } = req.body;

    if (!email || !message || !captchaToken) {
      return res.status(400).json(error('Email, message en captchaToken verplicht'));
    }

    // hCaptcha verificatie
    const axios = require('axios');
    const formData = new URLSearchParams();
    formData.append('secret', HCAPTCHA_SECRET);
    formData.append('response', captchaToken);

    const captchaResponse = await axios.post('https://hcaptcha.com/siteverify', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 5000,
    });

    if (!captchaResponse.data.success) {
      console.warn('❌ hCaptcha fail:', captchaResponse.data['error-codes']);
      return res.status(403).json(error('Captcha verificatie mislukt'));
    }

    // Store message (in-memory)
    const newMessage = {
      id: Date.now().toString(),
      email,
      message,
      orderNumber: orderNumber || null,
      createdAt: new Date().toISOString(),
      status: 'new',
      ip: req.ip,
    };

    contactMessages.push(newMessage);
    console.log(`✅ Contact: ${email} - "${message.substring(0, 50)}..."`);

    res.status(201).json(success({ id: newMessage.id, message: 'Bericht ontvangen' }));
  } catch (err: any) {
    console.error('❌ Contact error:', err.message);
    res.status(500).json(error('Server fout'));
  }
});

app.get('/api/v1/contact', (req: Request, res: Response) => {
  res.json(success({ messages: contactMessages.reverse(), total: contactMessages.length }));
});

// SECURITY: Admin authentication routes (JWT + bcrypt)
app.use('/api/v1/admin/auth', adminAuthRoutes);

// ADMIN API: Full admin panel routes (products, orders, returns, etc.)
app.use('/api/v1/admin', adminRoutes);

// ✅ RAG API: AI Chat (Claude + Vector Store)
app.use('/api/v1/rag', ragRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json(error(`Route ${req.method} ${req.path} not found`));
});

app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json(error('Internal server error'));
});

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 KATTENBAK BACKEND - CLEAN & STABLE');
  console.log('='.repeat(60));
  console.log(`✅ Server: http://localhost:${PORT}`);
  console.log(`✅ Env: ${ENV.NODE_ENV} | Mollie: ${ENV.mollieKeyType}`);
  console.log(`✅ Product: ${mockProduct.name}`);
  console.log('='.repeat(60));
});

export default app;
