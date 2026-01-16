import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path'; // FIX: Import path module
import { env } from './config/env.config';
import { DatabaseClient } from './config/database.config';
import { logger } from './config/logger.config';
import { requestLogger } from './middleware/logger.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiRateLimiter } from './middleware/ratelimit.middleware';

/**
 * Enterprise Express Server
 * Production-ready with security, logging, and error handling
 */
class Server {
  private app: Application;

  constructor() {
    this.app = express();
    this.validateEnvironment();
    this.initializeMiddleware().then(() => {
      this.initializeRoutes().then(() => {
        this.initializeErrorHandling();
      });
    });
  }

  /**
   * Validate environment configuration
   */
  private validateEnvironment(): void {
    try {
      env.validate();
    } catch (error) {
      logger.error('Environment validation failed:', error);
      process.exit(1);
    }
  }

  /**
   * Initialize middleware
   */
  private async initializeMiddleware(): Promise<void> {
    // ✅ FIX: Trust proxy for Nginx reverse proxy (X-Forwarded-For, rate limiting)
    this.app.set('trust proxy', 1);

    // ✅ OPTIMIZED: Security middleware (disabled unnecessary checks in dev)
    this.app.use(helmet({
      contentSecurityPolicy: env.IS_PRODUCTION,
      crossOriginEmbedderPolicy: false, // Disabled in dev for performance
      dnsPrefetchControl: false,
      frameguard: env.IS_PRODUCTION,
      hidePoweredBy: true,
      hsts: env.IS_PRODUCTION,
      ieNoOpen: false,
      noSniff: true,
      originAgentCluster: false,
      permittedCrossDomainPolicies: false,
      referrerPolicy: { policy: 'no-referrer' },
      xssFilter: true,
    }));

    // CORS - WATERDICHT: Preflight + Actual Requests
    // ✅ SIMPLIFIED: Allow all origins during development
    this.app.use(cors({
      origin: true, // Allow all origins in development
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['Content-Range', 'X-Content-Range'],
      maxAge: 86400, // 24 hours preflight cache
      preflightContinue: false,
      optionsSuccessStatus: 204,
    }));

    // Body parsing
    // ✅ UPLOAD: Increased limits for file uploads (must be BEFORE multer routes)
    // Note: For multipart/form-data (file uploads), body parser doesn't apply, but we set high limits for other requests
    // ✅ CRITICAL: Body parsers must NOT interfere with multipart/form-data (Multer handles that)
    this.app.use(express.json({ limit: '50mb' })); // Increased for uploads
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // ✅ UPLOAD: Serve encrypted uploads via decrypt middleware
    // Files are stored encrypted in /var/www/uploads/ and need decryption on-the-fly
    // Note: Nginx also serves /uploads/ directly, but encrypted files need backend decryption
    const { decryptMediaMiddleware } = await import('./middleware/decrypt.middleware');
    this.app.use('/uploads', decryptMediaMiddleware);

    // Request logging
    this.app.use(requestLogger);

    // Rate limiting
    this.app.use('/api/', apiRateLimiter);

    logger.info('✅ Middleware initialized');
  }

  /**
   * Initialize routes
   */
  private async initializeRoutes(): Promise<void> {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Healthy',
        environment: env.NODE_ENV,
        mollie: env.MOLLIE_API_KEY.startsWith('live_') ? 'LIVE' : 'TEST',
        timestamp: new Date().toISOString(),
      });
    });

    // API v1 routes
    this.app.get('/api/v1/health', (req, res) => {
      res.json({
        success: true,
        message: 'API v1 is healthy',
        version: '1.0.0',
      });
    });

    // Load simple product routes (no database needed)
    const productRoutes = (await import('./routes/product.routes.simple')).default;
    this.app.use('/api/v1/products', productRoutes);
    
    // Admin routes - IMPORTANT for admin panel
    const adminRoutes = (await import('./routes/admin/index')).default;
    this.app.use('/api/v1/admin', adminRoutes);
    
    // RAG routes - AI Chatbot
    const ragRoutes = (await import('./routes/rag.routes')).default;
    this.app.use('/api/v1/rag', ragRoutes);
    
    // Return routes - DRY: Customer + Admin returns
    const returnRoutes = (await import('./routes/returns.routes')).default;
    this.app.use('/api/v1/returns', returnRoutes);
    
    // Orders routes - DRY: Public order creation with payment
    const orderRoutes = (await import('./routes/orders.routes')).default;
    this.app.use('/api/v1/orders', orderRoutes);
    
    // Contact routes - SIMPLE: No database, no @ imports
    const contactRoutes = (await import('./routes/contact.routes.simple')).default;
    this.app.use('/api/v1/contact', contactRoutes);
    
    // Payment methods routes - DRY: Fetch available Mollie payment methods
    const paymentMethodsRoutes = (await import('./routes/payment-methods.routes')).default;
    this.app.use('/api/v1/payment-methods', paymentMethodsRoutes);
    
    // Webhook routes
    const webhookRoutes = (await import('./routes/webhook.routes')).default;
    this.app.use('/api/v1/webhooks', webhookRoutes);

    // Test email routes - ✅ DEVELOPMENT: For testing email configuration
    const testEmailRoutes = (await import('./routes/test-email.routes')).default;
    this.app.use('/api/v1/test-email', testEmailRoutes);

    logger.info('✅ Routes initialized (admin + products + orders + returns + contact + payment-methods + webhooks + test-email)');
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);

    logger.info('✅ Error handling initialized');
  }

  /**
   * Start server
   */
  public async start(): Promise<void> {
    try {
      // Try database connection (but don't fail if not available)
      try {
        const dbConnected = await DatabaseClient.testConnection();
        if (dbConnected) {
          logger.info('✅ Database connected');
        }
      } catch (error) {
        logger.warn('⚠️ Database not available, using mock data');
      }

      // Start listening
      this.app.listen(env.PORT, () => {
        logger.info('='.repeat(50));
        logger.info('🚀 KATTENBAK WEBSHOP API SERVER');
        logger.info('='.repeat(50));
        logger.info(`Environment: ${env.NODE_ENV}`);
        logger.info(`Server: ${env.BACKEND_URL}`);
        logger.info(`Port: ${env.PORT}`);
        logger.info(`Redis: ${env.REDIS_HOST}:${env.REDIS_PORT}`);
        logger.info(`Mollie: ${env.MOLLIE_API_KEY.substring(0, 15)}...`);
        logger.info('='.repeat(50));
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    logger.info('Shutting down server...');
    process.exit(0);
  }
}

// Start server
const server = new Server();
server.start();

// Handle shutdown signals
process.on('SIGTERM', () => server.shutdown());
process.on('SIGINT', () => server.shutdown());

export default server;


