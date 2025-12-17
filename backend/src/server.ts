import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
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
    this.initializeMiddleware();
    this.initializeRoutes().then(() => {
      this.initializeErrorHandling();
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
  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: env.IS_PRODUCTION,
      crossOriginEmbedderPolicy: env.IS_PRODUCTION,
    }));

    // CORS
    this.app.use(cors({
      origin: env.CORS_ORIGINS,
      credentials: true,
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
    
    // Webhook routes
    const webhookRoutes = (await import('./routes/webhook.routes')).default;
    this.app.use('/api/v1/webhooks', webhookRoutes);

    logger.info('✅ Routes initialized (admin + products + webhooks)');
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
      this.app.listen(env.BACKEND_PORT, () => {
        logger.info('='.repeat(50));
        logger.info('🚀 KATTENBAK WEBSHOP API SERVER');
        logger.info('='.repeat(50));
        logger.info(`Environment: ${env.NODE_ENV}`);
        logger.info(`Server: ${env.BACKEND_URL}`);
        logger.info(`Port: ${env.BACKEND_PORT}`);
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


