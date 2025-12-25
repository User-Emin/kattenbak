import express from 'express';
import type { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';

// Admin Routes (SECURE)
import adminAuthRoutes from './routes/admin-auth.routes';
import adminProductsRoutes from './routes/admin/products.routes';
import adminVariantsRoutes from './routes/admin/variants.routes';
import adminOrdersRoutes from './routes/admin/orders.routes';
import adminReturnsRoutes from './routes/admin/returns.routes';
import adminUploadRoutes from './routes/admin/upload.routes';
import ragRoutes from './routes/rag.routes';

// Public Routes (Webshop)
import ordersRoutes from './routes/orders.routes';
import returnsRoutes from './routes/returns.routes';

// Data Transformers
import { transformProducts, transformProduct } from './lib/transformers';

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
    const keyMatch = keyContent.match(/sk-ant-api03-[A-Za-z0-9_-]+/);
    if (keyMatch) {
      CLAUDE_API_KEY = keyMatch[0];
      process.env.CLAUDE_API_KEY = CLAUDE_API_KEY;
      console.log('✅ Claude API key loaded from /Emin/claudekey (SECURE)');
    }
  }
} catch (err: any) {
  console.error('❌ Error loading Claude key:', err.message);
}

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

const app: Application = express();
const PORT = 3101;

/**
 * ENVIRONMENT CONFIGURATION
 */
const MOLLIE_KEY = process.env.MOLLIE_API_KEY || 'test_ePFM8bCr6NEqN7fFq2qKS6x7KEzjJ7';
const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  MOLLIE_API_KEY: MOLLIE_KEY,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3100',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
  mollieKeyType: MOLLIE_KEY.startsWith('test_') ? 'TEST' : 'LIVE',
};

// ✅ SECURITY: Trust proxy for NGINX (fixes rate limiter X-Forwarded-For)
app.set('trust proxy', true);

// Security middleware
app.use(helmet());
app.use(cors({ 
  origin: [
    'http://localhost:3100',
    'http://localhost:3102',
    'https://catsupply.nl',
    'http://185.224.139.74:3102',
    'http://185.224.139.74:3100'
  ], 
  credentials: true 
}));
app.use(express.json());

// Serve static uploads
app.use('/uploads', express.static('/var/www/uploads'));

/**
 * HEALTH CHECK ROUTES
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    message: 'Healthy', 
    environment: ENV.NODE_ENV, 
    mollie: ENV.mollieKeyType,
    database: 'PostgreSQL',
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/v1/health', async (req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      success: true, 
      message: 'API v1 healthy', 
      version: '1.0.0',
      database: 'connected'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

/**
 * PUBLIC API ROUTES (Webshop)
 */

// Get all products
app.get('/api/v1/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        variants: {
          where: { isActive: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Transform Decimal to number
    const transformed = transformProducts(products);
    res.json({ success: true, data: transformed });
  } catch (error: any) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Fout bij ophalen producten' 
    });
  }
});

// Get featured products
app.get('/api/v1/products/featured', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { 
        isActive: true,
        isFeatured: true 
      },
      include: {
        category: true,
        variants: {
          where: { isActive: true }
        }
      },
      take: 10
    });
    
    // Transform Decimal to number
    const transformed = transformProducts(products);
    res.json({ success: true, data: transformed });
  } catch (error: any) {
    console.error('Get featured products error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Fout bij ophalen producten' 
    });
  }
});

// Get product by slug
app.get('/api/v1/products/slug/:slug', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { 
        slug: req.params.slug,
        isActive: true
      },
      include: {
        category: true,
        variants: {
          where: { isActive: true }
        }
      }
    });
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product niet gevonden' 
      });
    }
    
    // Transform Decimal to number
    const transformed = transformProduct(product);
    res.json({ success: true, data: transformed });
  } catch (error: any) {
    console.error('Get product by slug error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Fout bij ophalen product' 
    });
  }
});

// Get product by ID
app.get('/api/v1/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        variants: {
          where: { isActive: true }
        }
      }
    });
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product niet gevonden' 
      });
    }
    
    // Transform Decimal to number
    const transformed = transformProduct(product);
    res.json({ success: true, data: transformed });
  } catch (error: any) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Fout bij ophalen product' 
    });
  }
});

/**
 * PUBLIC ROUTES (Webshop Orders + Payment + Returns)
 */
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/v1/returns', returnsRoutes);

/**
 * ADMIN ROUTES (SECURE)
 */
app.use('/api/v1/admin/auth', adminAuthRoutes);
app.use('/api/v1/admin/products', adminProductsRoutes);
app.use('/api/v1/admin/variants', adminVariantsRoutes);
app.use('/api/v1/admin/orders', adminOrdersRoutes);
app.use('/api/v1/admin/returns', adminReturnsRoutes);
app.use('/api/v1/admin/upload', adminUploadRoutes);

/**
 * RAG API
 */
app.use('/api/v1/rag', ragRoutes);

/**
 * 404 Handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    success: false, 
    error: `Route ${req.method} ${req.path} not found` 
  });
});

/**
 * Error Handler
 */
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: ENV.isProduction ? 'Internal server error' : err.message 
  });
});

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected (PostgreSQL)');
    
    // Check if we have products
    const productCount = await prisma.product.count();
    console.log(`✅ Products in database: ${productCount}`);
    
    app.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log('🚀 KATTENBAK BACKEND - PRODUCTION (PostgreSQL)');
      console.log('='.repeat(60));
      console.log(`✅ Server: http://localhost:${PORT}`);
      console.log(`✅ Env: ${ENV.NODE_ENV} | Mollie: ${ENV.mollieKeyType}`);
      console.log(`✅ Database: PostgreSQL (Dynamic)`);
      console.log(`✅ Products: ${productCount} items`);
      console.log('='.repeat(60));
    });
  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message);
    console.error('⚠️  Starting in fallback mode without database...');
    
    app.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log('⚠️  KATTENBAK BACKEND - FALLBACK MODE');
      console.log('='.repeat(60));
      console.log(`✅ Server: http://localhost:${PORT}`);
      console.log(`❌ Database: Connection failed`);
      console.log('='.repeat(60));
    });
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;
