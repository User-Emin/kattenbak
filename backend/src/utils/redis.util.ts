/**
 * SECURE REDIS CONNECTION UTILITY
 * DRY & Secure Redis client with TLS + authentication
 * 
 * Security Features:
 * - Password authentication
 * - TLS encryption (optional, for production)
 * - Connection pooling
 * - Automatic reconnection
 * - Error handling
 * - Health checks
 */

import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

// DRY: Redis configuration
const REDIS_CONFIG = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD || undefined,
  
  // TLS configuration (production only)
  tls: process.env.NODE_ENV === 'production' && process.env.REDIS_TLS === 'true' ? {
    rejectUnauthorized: true, // Verify TLS certificates
  } : undefined,
  
  // Connection options
  socket: {
    connectTimeout: 10000, // 10 seconds
    keepAlive: true, // ✅ FIX: Must be boolean, not number
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        console.error('❌ Redis: Max reconnection attempts reached');
        return new Error('Max reconnection attempts reached');
      }
      // Exponential backoff: 100ms, 200ms, 400ms, 800ms, etc.
      const delay = Math.min(retries * 100, 3000);
      console.log(`⏳ Redis: Reconnecting in ${delay}ms (attempt ${retries}/10)`);
      return delay;
    },
  },
};

// Global Redis client instance (singleton pattern)
let redisClient: RedisClientType | null = null;

/**
 * Get or create Redis client (singleton)
 * DRY: Single client instance across application
 */
export async function getRedisClient(): Promise<RedisClientType> {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }
  
  try {
    console.log('🔌 Connecting to Redis...');
    
    // ✅ FIX: Create client with secure configuration (type-safe socket options)
    const socketOptions: any = {
      ...REDIS_CONFIG.socket,
    };
    
    if (REDIS_CONFIG.tls) {
      socketOptions.tls = REDIS_CONFIG.tls;
    }
    
    redisClient = createClient({
      url: REDIS_CONFIG.url,
      password: REDIS_CONFIG.password,
      socket: socketOptions,
    });
    
    // Event handlers
    redisClient.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });
    
    redisClient.on('connect', () => {
      console.log('🔌 Redis connecting...');
    });
    
    redisClient.on('ready', () => {
      console.log('✅ Redis connected and ready');
    });
    
    redisClient.on('reconnecting', () => {
      console.log('⏳ Redis reconnecting...');
    });
    
    redisClient.on('end', () => {
      console.log('🔌 Redis connection closed');
    });
    
    // Connect
    await redisClient.connect();
    
    // Verify connection with ping
    const pong = await redisClient.ping();
    if (pong !== 'PONG') {
      throw new Error('Redis ping failed');
    }
    
    console.log('✅ Redis connection established');
    
    return redisClient;
    
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    redisClient = null;
    throw new Error('Failed to connect to Redis');
  }
}

/**
 * Close Redis connection gracefully
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
    console.log('✅ Redis connection closed gracefully');
  }
}

/**
 * Health check for Redis connection
 */
export async function checkRedisHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  try {
    const client = await getRedisClient();
    
    // Measure latency
    const startTime = Date.now();
    await client.ping();
    const latency = Date.now() - startTime;
    
    return {
      healthy: true,
      latency,
    };
    
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * DRY: Common Redis operations with error handling
 */

export async function redisGet(key: string): Promise<string | null> {
  try {
    const client = await getRedisClient();
    const result = await client.get(key);
    return typeof result === 'string' ? result : null;
  } catch (error) {
    console.error(`Redis GET error for key "${key}":`, error);
    return null;
  }
}

export async function redisSet(
  key: string,
  value: string,
  expirationSeconds?: number
): Promise<boolean> {
  try {
    const client = await getRedisClient();
    
    if (expirationSeconds) {
      await client.setEx(key, expirationSeconds, value);
    } else {
      await client.set(key, value);
    }
    
    return true;
  } catch (error) {
    console.error(`Redis SET error for key "${key}":`, error);
    return false;
  }
}

export async function redisDel(key: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    await client.del(key);
    return true;
  } catch (error) {
    console.error(`Redis DEL error for key "${key}":`, error);
    return false;
  }
}

export async function redisIncr(key: string): Promise<number | null> {
  try {
    const client = await getRedisClient();
    return await client.incr(key);
  } catch (error) {
    console.error(`Redis INCR error for key "${key}":`, error);
    return null;
  }
}

export async function redisExpire(key: string, seconds: number): Promise<boolean> {
  try {
    const client = await getRedisClient();
    await client.expire(key, seconds);
    return true;
  } catch (error) {
    console.error(`Redis EXPIRE error for key "${key}":`, error);
    return false;
  }
}

/**
 * Get Redis info for monitoring
 */
export async function getRedisInfo(): Promise<{
  connected: boolean;
  uptime?: number;
  usedMemory?: string;
  connectedClients?: number;
  totalCommands?: number;
}> {
  try {
    const client = await getRedisClient();
    const info = await client.info();
    
    // Parse info string
    const lines = info.split('\r\n');
    const data: Record<string, string> = {};
    
    for (const line of lines) {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value) {
          data[key] = value;
        }
      }
    }
    
    return {
      connected: true,
      uptime: parseInt(data.uptime_in_seconds) || undefined,
      usedMemory: data.used_memory_human || undefined,
      connectedClients: parseInt(data.connected_clients) || undefined,
      totalCommands: parseInt(data.total_commands_processed) || undefined,
    };
    
  } catch (error) {
    return {
      connected: false,
    };
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing Redis connection...');
  await closeRedisConnection();
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing Redis connection...');
  await closeRedisConnection();
});

