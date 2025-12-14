/**
 * CENTRALIZED ENVIRONMENT CONFIG
 * Single source of truth voor alle environment variables
 * Maximaal DRY, type-safe, productie-ready
 */

export type Environment = 'development' | 'production' | 'test';

export interface EnvConfig {
  NODE_ENV: Environment;
  BACKEND_PORT: number;
  BACKEND_URL: string;
  FRONTEND_PORT: number;
  FRONTEND_URL: string;
  ADMIN_PORT: number;
  ADMIN_URL: string;
  MOLLIE_API_KEY: string;
  MOLLIE_IS_TEST: boolean;
  DATABASE_URL?: string;
  REDIS_URL?: string;
  CORS_ORIGINS: string[];
  API_VERSION: string;
}

const parsePort = (value: string | undefined, defaultPort: number): number => {
  return value ? parseInt(value, 10) : defaultPort;
};

const parseCorsOrigins = (value: string | undefined): string[] => {
  if (!value) return [];
  return value.split(',').map(origin => origin.trim());
};

/**
 * Load and validate environment configuration
 * Fails fast in production with invalid config
 */
export const loadEnvConfig = (): EnvConfig => {
  const NODE_ENV = (process.env.NODE_ENV || 'development') as Environment;
  
  const MOLLIE_API_KEY = process.env.MOLLIE_API_KEY || 'test_ePFM8bCr6NEqN7fFq2qKS6x7KEzjJ7';
  const MOLLIE_IS_TEST = MOLLIE_API_KEY.startsWith('test_');

  // CRITICAL: Validate Mollie key in production
  if (NODE_ENV === 'production' && MOLLIE_IS_TEST) {
    throw new Error('FATAL: Cannot use Mollie TEST key in PRODUCTION environment');
  }

  const BACKEND_PORT = parsePort(process.env.BACKEND_PORT, 3101);
  const FRONTEND_PORT = parsePort(process.env.FRONTEND_PORT, 3100);
  const ADMIN_PORT = parsePort(process.env.ADMIN_PORT, 3102);

  const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${BACKEND_PORT}`;
  const FRONTEND_URL = process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:${FRONTEND_PORT}`;
  const ADMIN_URL = process.env.ADMIN_URL || `http://localhost:${ADMIN_PORT}`;

  const CORS_ORIGINS = parseCorsOrigins(
    process.env.CORS_ORIGINS || `${FRONTEND_URL},${ADMIN_URL}`
  );

  return {
    NODE_ENV,
    BACKEND_PORT,
    BACKEND_URL,
    FRONTEND_PORT,
    FRONTEND_URL,
    ADMIN_PORT,
    ADMIN_URL,
    MOLLIE_API_KEY,
    MOLLIE_IS_TEST,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    CORS_ORIGINS,
    API_VERSION: 'v1',
  };
};

/**
 * Singleton config instance
 */
export const ENV = loadEnvConfig();

/**
 * Helper functions - DRY
 */
export const isProduction = () => ENV.NODE_ENV === 'production';
export const isDevelopment = () => ENV.NODE_ENV === 'development';
export const isTest = () => ENV.NODE_ENV === 'test';

export const getApiUrl = (path: string = '') => {
  const base = `${ENV.BACKEND_URL}/api/${ENV.API_VERSION}`;
  return path ? `${base}${path.startsWith('/') ? path : `/${path}`}` : base;
};

export const getMollieMode = () => ENV.MOLLIE_IS_TEST ? 'TEST' : 'LIVE';

/**
 * Validation helpers
 */
export const validateEnv = () => {
  const required = ['MOLLIE_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
  }

  console.log('='.repeat(60));
  console.log('🔧 ENVIRONMENT CONFIG');
  console.log('='.repeat(60));
  console.log(`Environment: ${ENV.NODE_ENV}`);
  console.log(`Backend: ${ENV.BACKEND_URL}`);
  console.log(`Frontend: ${ENV.FRONTEND_URL}`);
  console.log(`Admin: ${ENV.ADMIN_URL}`);
  console.log(`Mollie: ${getMollieMode()} mode`);
  console.log(`API Version: ${ENV.API_VERSION}`);
  console.log(`CORS: ${ENV.CORS_ORIGINS.join(', ')}`);
  console.log('='.repeat(60));
};

export default ENV;
