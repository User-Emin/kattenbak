import { PrismaClient } from '@prisma/client';
import { env } from './env.config';

/**
 * Prisma Client Singleton
 * Ensures single database connection instance
 */
class DatabaseClient {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!DatabaseClient.instance) {
      // ✅ CONNECTION POOLING: Optimize for production (prevents overload)
      DatabaseClient.instance = new PrismaClient({
        log: env.IS_DEVELOPMENT 
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
        errorFormat: env.IS_DEVELOPMENT ? 'pretty' : 'minimal',
        datasources: {
          db: {
            url: env.DATABASE_URL + (env.DATABASE_URL.includes('?') ? '&' : '?') + 
              'connection_limit=10' + // Max 10 connections per instance
              '&pool_timeout=20' + // 20s timeout
              '&connect_timeout=10' // 10s connect timeout
          }
        }
      });

      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        await DatabaseClient.instance.$disconnect();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        await DatabaseClient.instance.$disconnect();
        process.exit(0);
      });
    }

    return DatabaseClient.instance;
  }

  /**
   * Test database connection
   */
  public static async testConnection(): Promise<boolean> {
    try {
      const client = DatabaseClient.getInstance();
      await client.$queryRaw`SELECT 1`;
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }
}

export const prisma = DatabaseClient.getInstance();
export { DatabaseClient };


