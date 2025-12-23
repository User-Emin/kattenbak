/**
 * HEALTH CHECK & MONITORING ROUTES
 * Comprehensive health checks for all system components
 * 
 * Endpoints:
 * - GET /api/v1/health - Overall system health
 * - GET /api/v1/health/database - PostgreSQL connection
 * - GET /api/v1/health/redis - Redis connection
 * - GET /api/v1/health/encryption - Media encryption system
 * - GET /api/v1/health/detailed - Full system metrics
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { verifyEncryptionSetup } from '../utils/encryption.util';
import os from 'os';

const router = Router();
const prisma = new PrismaClient();

/**
 * Basic health check - overall system status
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Quick checks
    const dbHealthy = await checkDatabase();
    const redisHealthy = await checkRedis();
    
    const status = dbHealthy && redisHealthy ? 'healthy' : 'degraded';
    const httpStatus = status === 'healthy' ? 200 : 503;
    
    res.status(httpStatus).json({
      success: true,
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'System health check failed'
    });
  }
});

/**
 * Database health check
 */
router.get('/health/database', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Test database connection with simple query
    await prisma.$queryRaw`SELECT 1`;
    
    const responseTime = Date.now() - startTime;
    
    // Get database stats
    const productCount = await prisma.product.count();
    const orderCount = await prisma.order.count();
    
    res.json({
      success: true,
      status: 'healthy',
      database: 'PostgreSQL',
      responseTime: `${responseTime}ms`,
      stats: {
        products: productCount,
        orders: orderCount
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Redis health check
 */
router.get('/health/redis', async (req: Request, res: Response) => {
  try {
    const redisHealthy = await checkRedis();
    
    if (redisHealthy) {
      res.json({
        success: true,
        status: 'healthy',
        cache: 'Redis'
      });
    } else {
      throw new Error('Redis ping failed');
    }
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Redis connection failed'
    });
  }
});

/**
 * Encryption system health check
 */
router.get('/health/encryption', async (req: Request, res: Response) => {
  try {
    const isHealthy = await verifyEncryptionSetup();
    
    if (isHealthy) {
      res.json({
        success: true,
        status: 'healthy',
        encryption: 'AES-256-GCM',
        message: 'Media encryption system operational'
      });
    } else {
      throw new Error('Encryption verification failed');
    }
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Encryption system error'
    });
  }
});

/**
 * Detailed health check with full metrics
 */
router.get('/health/detailed', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Collect all health metrics
    const [dbHealthy, redisHealthy, encryptionHealthy] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      verifyEncryptionSetup()
    ]);
    
    // System metrics
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Overall status
    const allHealthy = dbHealthy && redisHealthy && encryptionHealthy;
    const status = allHealthy ? 'healthy' : 'degraded';
    const httpStatus = allHealthy ? 200 : 503;
    
    res.status(httpStatus).json({
      success: true,
      status,
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`,
      
      // System info
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        uptime: process.uptime(),
        pid: process.pid,
        environment: process.env.NODE_ENV || 'development'
      },
      
      // Resource usage
      resources: {
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
        },
        cpu: {
          user: `${Math.round(cpuUsage.user / 1000)}ms`,
          system: `${Math.round(cpuUsage.system / 1000)}ms`
        },
        system: {
          totalMemory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
          freeMemory: `${Math.round(os.freemem() / 1024 / 1024 / 1024)}GB`,
          cpuCount: os.cpus().length,
          loadAverage: os.loadavg()
        }
      },
      
      // Component health
      components: {
        database: {
          status: dbHealthy ? 'healthy' : 'unhealthy',
          type: 'PostgreSQL'
        },
        cache: {
          status: redisHealthy ? 'healthy' : 'unhealthy',
          type: 'Redis'
        },
        encryption: {
          status: encryptionHealthy ? 'healthy' : 'unhealthy',
          algorithm: 'AES-256-GCM'
        }
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Detailed health check failed'
    });
  }
});

/**
 * Helper: Check database connection
 */
async function checkDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper: Check Redis connection
 */
async function checkRedis(): Promise<boolean> {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const client = createClient({ url: redisUrl });
    
    await client.connect();
    const pong = await client.ping();
    await client.disconnect();
    
    return pong === 'PONG';
  } catch {
    return false;
  }
}

export default router;

