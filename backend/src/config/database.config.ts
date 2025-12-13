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
      DatabaseClient.instance = new PrismaClient({
        log: env.IS_DEVELOPMENT 
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
        errorFormat: env.IS_DEVELOPMENT ? 'pretty' : 'minimal',
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


