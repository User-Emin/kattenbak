/**
 * BACKEND HEALTH CHECK ENDPOINT
 * Comprehensive system health monitoring
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database.config';
import { logger } from '../config/logger.config';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
    };
    redis?: {
      status: 'up' | 'down';
      responseTime?: number;
    };
  };
  system: {
    memory: {
      total: number;
      free: number;
      used: number;
      percentUsed: number;
    };
    cpu: {
      count: number;
      loadAverage: number[];
    };
    disk?: {
      available: string;
      used: string;
      percentUsed: string;
    };
  };
}

export class HealthCheckController {
  /**
   * GET /api/v1/health
   * Detailed health check endpoint
   */
  static async getHealth(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Database health check
      const dbStart = Date.now();
      let dbStatus: 'up' | 'down' = 'down';
      let dbResponseTime: number | undefined;
      
      try {
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = 'up';
        dbResponseTime = Date.now() - dbStart;
      } catch (error) {
        logger.error('Database health check failed:', error);
        dbStatus = 'down';
      }
      
      // System metrics
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const percentUsed = (usedMem / totalMem) * 100;
      
      // Disk space (only on Linux)
      let diskInfo;
      try {
        if (process.platform === 'linux') {
          const { stdout } = await execAsync('df -h / | tail -1');
          const parts = stdout.trim().split(/\s+/);
          diskInfo = {
            available: parts[3],
            used: parts[2],
            percentUsed: parts[4],
          };
        }
      } catch (error) {
        logger.warn('Could not fetch disk info:', error);
      }
      
      // Determine overall health status
      let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      
      if (dbStatus === 'down') {
        overallStatus = 'unhealthy';
      } else if (percentUsed > 90) {
        overallStatus = 'degraded';
      }
      
      const health: HealthStatus = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        services: {
          database: {
            status: dbStatus,
            responseTime: dbResponseTime,
          },
        },
        system: {
          memory: {
            total: totalMem,
            free: freeMem,
            used: usedMem,
            percentUsed: Math.round(percentUsed * 100) / 100,
          },
          cpu: {
            count: os.cpus().length,
            loadAverage: os.loadavg(),
          },
          disk: diskInfo,
        },
      };
      
      const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
      
      res.status(statusCode).json(health);
      
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      });
    }
  }

  /**
   * GET /api/v1/health/ready
   * Kubernetes-style readiness probe
   */
  static async getReadiness(req: Request, res: Response): Promise<void> {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;
      
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Readiness check failed:', error);
      res.status(503).json({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * GET /api/v1/health/live
   * Kubernetes-style liveness probe
   */
  static async getLiveness(req: Request, res: Response): Promise<void> {
    // Simple check that process is running
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }
}

