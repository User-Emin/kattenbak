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

// Serve static uploads directory
app.use('/uploads', express.static('public/uploads'));

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

// Import upload routes
const uploadRoutes = require('./routes/upload.routes').default;
app.use('/api/v1/upload', uploadRoutes);

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
// ADMIN AUTH ENDPOINT
// =============================================================================

app.post('/api/v1/admin/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@kattenbak.nl';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Generate simple token
      const token = Buffer.from(JSON.stringify({ 
        email, 
        role: 'ADMIN', 
        exp: Date.now() + 86400000 
      })).toString('base64');
      
      res.json({ 
        success: true, 
        data: { 
          token, 
          user: { 
            id: 'admin-1', 
            email, 
            role: 'ADMIN', 
            firstName: 'Admin', 
            lastName: 'User' 
          }
        }
      });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
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

// POST create order - COMPLEET MET RELATIES
app.post('/api/v1/orders', async (req: Request, res: Response) => {
  try {
    const orderData = req.body;

    // Validate required fields
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return res.status(400).json(error('Items required'));
    }

    if (!orderData.customerEmail) {
      return res.status(400).json(error('Customer email required'));
    }

    if (!orderData.shippingAddress) {
      return res.status(400).json(error('Shipping address required'));
    }

    // Fetch product details for price calculation
    const productIds = orderData.items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json(error('Invalid product IDs'));
    }

    // Calculate totals with pre-order discounts
    let subtotal = 0;
    const orderItems = orderData.items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error('Product not found');

      let itemPrice = parseFloat(product.price.toString());

      // Apply pre-order discount if applicable
      if (product.isPreOrder && product.preOrderDiscount) {
        const discount = parseFloat(product.preOrderDiscount.toString());
        itemPrice = itemPrice * (1 - discount / 100);
      }

      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      return {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        price: itemPrice,
        quantity: item.quantity,
        total: itemTotal,
      };
    });

    const tax = subtotal * 0.21;
    const shippingCost = 0; // Altijd gratis verzending
    const total = subtotal + tax + shippingCost;

    // Create order with addresses and items
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD${Date.now()}`,
        customerEmail: orderData.customerEmail,
        customerFirstName: orderData.shippingAddress.firstName,
        customerLastName: orderData.shippingAddress.lastName,
        customerPhone: orderData.customerPhone || null,
        subtotal,
        shippingCost,
        tax,
        total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        shippingMethod: 'standard',
        customerNotes: orderData.customerNotes || null,
        metadata: {
          ip: req.ip,
          userAgent: req.get('user-agent'),
        },
        shippingAddress: {
          create: {
            firstName: orderData.shippingAddress.firstName,
            lastName: orderData.shippingAddress.lastName,
            street: orderData.shippingAddress.street,
            houseNumber: orderData.shippingAddress.houseNumber,
            addition: orderData.shippingAddress.addition || null,
            postalCode: orderData.shippingAddress.postalCode,
            city: orderData.shippingAddress.city,
            country: orderData.shippingAddress.country || 'NL',
            phone: orderData.shippingAddress.phone || null,
          },
        },
        billingAddress: orderData.billingAddress ? {
          create: {
            firstName: orderData.billingAddress.firstName,
            lastName: orderData.billingAddress.lastName,
            street: orderData.billingAddress.street,
            houseNumber: orderData.billingAddress.houseNumber,
            addition: orderData.billingAddress.addition || null,
            postalCode: orderData.billingAddress.postalCode,
            city: orderData.billingAddress.city,
            country: orderData.billingAddress.country || 'NL',
            phone: orderData.billingAddress.phone || null,
          },
        } : undefined,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true,
      },
    });

    console.log(`✅ Order created: ${order.orderNumber} | €${total.toFixed(2)}`);

    // Mock Mollie payment
    const mollieUrl = `${ENV.FRONTEND_URL}/success?order=${order.id}&payment=test`;
    const payment = {
      id: `pay_${Date.now()}`,
      checkoutUrl: mollieUrl,
      mollieMode: ENV.isTest ? 'TEST' : 'LIVE',
    };

    res.status(201).json(success({ order, payment }));
  } catch (err: any) {
    console.error('❌ Order creation error:', err.message, err.stack);
    res.status(500).json(error(`Could not create order: ${err.message}`));
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
    const { categoryId, videoUrl, uspImage1, uspImage2, ...productData } = req.body;

    // Auto-generate slug if not provided
    const slug = productData.slug || productData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    // Build create data with proper Prisma relations
    const createData: any = {
      ...productData,
      slug,
      images: productData.images || [],
      videoUrl: videoUrl || null,
      uspImage1: uspImage1 || null,
      uspImage2: uspImage2 || null,
    };

    // Handle category relationship (optioneel)
    if (categoryId && categoryId !== '' && categoryId !== 'null') {
      createData.category = { connect: { id: categoryId } };
    }

    const product = await prisma.product.create({
      data: createData,
      include: { category: true },
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
    const { categoryId, videoUrl, uspImage1, uspImage2, ...productData } = req.body;
    
    // Build update data with proper Prisma relations
    const updateData: any = { 
      ...productData,
      videoUrl: videoUrl || null,
      uspImage1: uspImage1 || null,
      uspImage2: uspImage2 || null,
    };
    
    // Handle category relationship (optioneel)
    if (categoryId === null || categoryId === '' || categoryId === 'null') {
      updateData.category = { disconnect: true };
    } else if (categoryId) {
      updateData.category = { connect: { id: categoryId } };
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData,
      include: { category: true },
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

// =============================================================================
// ADMIN: ORDERS (DYNAMIC FROM DATABASE)
// =============================================================================

// ADMIN: Get all orders
app.get('/api/v1/admin/orders', async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        payment: true,
        shipment: true,
      },
      take: 100, // Limit voor performance
    });

    console.log(`✅ Admin fetched ${orders.length} orders`);
    res.json(success(orders));
  } catch (err: any) {
    console.error('Admin get orders error:', err.message);
    res.status(500).json(error('Could not fetch orders'));
  }
});

// ADMIN: Get single order
app.get('/api/v1/admin/orders/:id', async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        payment: true,
        shipment: true,
        shippingAddress: true,
        billingAddress: true,
      },
    });

    if (!order) {
      return res.status(404).json(error('Order not found'));
    }

    res.json(success(order));
  } catch (err: any) {
    console.error('Admin get order error:', err.message);
    res.status(500).json(error('Could not fetch order'));
  }
});

// ADMIN: Update order status
app.put('/api/v1/admin/orders/:id', async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status: req.body.status,
      },
      include: {
        orderItems: true,
        payment: true,
      },
    });

    console.log(`✅ Admin updated order: ${order.orderNumber}`);
    res.json(success(order));
  } catch (err: any) {
    console.error('Admin update order error:', err.message);
    res.status(500).json(error('Could not update order'));
  }
});

// =============================================================================
// ADMIN: CATEGORIES (DYNAMIC FROM DATABASE)
// =============================================================================

// ADMIN: Get all categories
app.get('/api/v1/admin/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    console.log(`✅ Admin fetched ${categories.length} categories`);
    res.json(success(categories));
  } catch (err: any) {
    console.error('Admin get categories error:', err.message);
    res.status(500).json(error('Could not fetch categories'));
  }
});

// ADMIN: Get single category
app.get('/api/v1/admin/categories/:id', async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json(error('Category not found'));
    }

    res.json(success(category));
  } catch (err: any) {
    console.error('Admin get category error:', err.message);
    res.status(500).json(error('Could not fetch category'));
  }
});

// ADMIN: Create category
app.post('/api/v1/admin/categories', async (req: Request, res: Response) => {
  try {
    const slug = req.body.slug || req.body.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const category = await prisma.category.create({
      data: {
        ...req.body,
        slug,
      },
    });

    console.log(`✅ Admin created category: ${category.name}`);
    res.json(success(category));
  } catch (err: any) {
    console.error('Admin create category error:', err.message);
    res.status(400).json(error(err.message || 'Could not create category'));
  }
});

// ADMIN: Update category
app.put('/api/v1/admin/categories/:id', async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body,
    });

    console.log(`✅ Admin updated category: ${category.name}`);
    res.json(success(category));
  } catch (err: any) {
    console.error('Admin update category error:', err.message);
    res.status(500).json(error('Could not update category'));
  }
});

// ADMIN: Delete category
app.delete('/api/v1/admin/categories/:id', async (req: Request, res: Response) => {
  try {
    // Check if category has products
    const productsCount = await prisma.product.count({
      where: { categoryId: req.params.id },
    });

    if (productsCount > 0) {
      return res.status(400).json(error(`Cannot delete category with ${productsCount} products. Remove products first.`));
    }

    await prisma.category.delete({
      where: { id: req.params.id },
    });

    console.log(`✅ Admin deleted category: ${req.params.id}`);
    res.json(success({ id: req.params.id }));
  } catch (err: any) {
    console.error('Admin delete category error:', err.message);
    res.status(500).json(error('Could not delete category'));
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
// RAG ENDPOINTS - AI Chat (No hCaptcha)
// =============================================================================

// Import RAG routes
const ragRoutes = require('./routes/rag.routes').default;
app.use('/api/v1/rag', ragRoutes);

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
