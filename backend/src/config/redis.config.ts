import Redis from 'ioredis';
import { env } from './env.config';
import { logger } from './logger.config';

/**
 * Redis Client Singleton
 * Voor caching en session management
 */
class RedisClient {
  private static instance: Redis | null = null;
  private static isEnabled = false;

  private constructor() {}

  public static getInstance(): Redis | null {
    if (!RedisClient.instance && !RedisClient.isEnabled) {
      try {
        RedisClient.instance = new Redis({
          host: env.REDIS_HOST,
          port: env.REDIS_PORT,
          password: env.REDIS_PASSWORD || undefined,
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          maxRetriesPerRequest: 3,
          // ✅ FIX: keepAlive must be boolean, not number
          keepAlive: true,
        });

        RedisClient.instance.on('connect', () => {
          logger.info('✅ Redis connected');
          RedisClient.isEnabled = true;
        });

        RedisClient.instance.on('error', (error) => {
          logger.warn('Redis connection error (caching disabled):', error.message);
          RedisClient.isEnabled = false;
        });

        RedisClient.instance.on('close', () => {
          logger.warn('Redis connection closed');
          RedisClient.isEnabled = false;
        });
      } catch (error) {
        logger.warn('Redis initialization failed (caching disabled):', error);
        RedisClient.instance = null;
      }
    }

    return RedisClient.instance;
  }

  /**
   * Check if Redis is available
   */
  public static isAvailable(): boolean {
    return RedisClient.isEnabled && RedisClient.instance !== null;
  }

  /**
   * Graceful disconnect
   */
  public static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
      RedisClient.instance = null;
      RedisClient.isEnabled = false;
    }
  }
}

export const redis = RedisClient.getInstance();
export { RedisClient };


