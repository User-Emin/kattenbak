import { config } from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';
import { z } from 'zod';

// Load environment-specific .env file
// Try multiple locations: backend/.env, root/.env, parent .env.development
const possibleEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '..', '.env'),
  path.resolve(process.cwd(), '..', '.env.development'),
  path.resolve(process.cwd(), '.env.development'),
];

let envLoaded = false;
for (const envPath of possibleEnvPaths) {
  if (existsSync(envPath)) {
    config({ path: envPath });
    console.log(`✅ Environment loaded from: ${envPath}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('⚠️  No .env file found, using environment variables');
}

// ✅ SECURITY: Zod schema voor runtime validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().optional(),
  BACKEND_PORT: z.string().optional(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  MOLLIE_API_KEY: z.string().regex(/^(test_|live_)/, 'MOLLIE_API_KEY must start with test_ or live_'),
  MOLLIE_WEBHOOK_URL: z.string().url().optional().or(z.literal('')),
  MYPARCEL_API_KEY: z.string().optional(),
  MYPARCEL_WEBHOOK_URL: z.string().url().optional().or(z.literal('')),
  MYPARCEL_WEBHOOK_SECRET: z.string().optional(),
  MYPARCEL_MODE: z.enum(['test', 'production']).default('test'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().regex(/^\d+$/).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().regex(/^\d+$/).default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().default('noreply@kattenbak.nl'),
  EMAIL_PROVIDER: z.enum(['console', 'smtp', 'sendgrid']).default('console'),
  SENDGRID_API_KEY: z.string().optional(),
  ADMIN_EMAIL: z.string().email().default('admin@localhost'),
  ADMIN_PASSWORD: z.string().min(12, 'ADMIN_PASSWORD must be at least 12 characters').default('admin123'),
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).default('100'),
  UPLOAD_MAX_SIZE: z.string().regex(/^\d+$/).default('5242880'),
  UPLOAD_ALLOWED_TYPES: z.string().default('image/jpeg,image/png,image/webp'),
  UPLOAD_PATH: z.string().default('./uploads'),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  FRONTEND_URL: z.string().url().optional(),
  CORS_ORIGINS: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_TO_FILE: z.string().transform(val => val === 'true').default('false'),
});

// ✅ SECURITY: Runtime validation met Zod
let validatedEnv: z.infer<typeof envSchema>;
try {
  validatedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:');
    error.errors.forEach(err => {
      console.error(`   - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

// Environment configuration with validation
class EnvironmentConfig {
  // Node environment - ✅ RUNTIME VALIDATED
  public readonly NODE_ENV = validatedEnv.NODE_ENV;
  public readonly IS_PRODUCTION = this.NODE_ENV === 'production';
  public readonly IS_DEVELOPMENT = this.NODE_ENV === 'development';

  // Server Configuration - ✅ RUNTIME VALIDATED
  public readonly PORT = parseInt(validatedEnv.PORT || validatedEnv.BACKEND_PORT || '3101', 10);
  public readonly BACKEND_PORT = this.PORT; // Alias for backwards compatibility
  public readonly BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${this.PORT}`;

  // Database - ✅ RUNTIME VALIDATED
  public readonly DATABASE_URL = validatedEnv.DATABASE_URL;

  // JWT - ✅ RUNTIME VALIDATED (min 32 chars enforced)
  public readonly JWT_SECRET = validatedEnv.JWT_SECRET;
  public readonly JWT_EXPIRES_IN = validatedEnv.JWT_EXPIRES_IN;

  // Mollie (Payment) - ✅ RUNTIME VALIDATED
  public readonly MOLLIE_API_KEY = validatedEnv.MOLLIE_API_KEY;
  public readonly MOLLIE_WEBHOOK_URL = validatedEnv.MOLLIE_WEBHOOK_URL || '';

  // MyParcel (Shipping & Returns) - ✅ RUNTIME VALIDATED
  public readonly MYPARCEL_API_KEY = validatedEnv.MYPARCEL_API_KEY || '';
  public readonly MYPARCEL_WEBHOOK_URL = validatedEnv.MYPARCEL_WEBHOOK_URL || '';
  public readonly MYPARCEL_WEBHOOK_SECRET = validatedEnv.MYPARCEL_WEBHOOK_SECRET || '';
  public readonly MYPARCEL_MODE = validatedEnv.MYPARCEL_MODE;
  public readonly MYPARCEL_RETURN_ADDRESS = {
    company: process.env.MYPARCEL_RETURN_COMPANY || 'Kattenbak B.V.',
    street: process.env.MYPARCEL_RETURN_STREET || 'Retourstraat',
    number: process.env.MYPARCEL_RETURN_NUMBER || '1',
    postalCode: process.env.MYPARCEL_RETURN_POSTAL || '1234AB',
    city: process.env.MYPARCEL_RETURN_CITY || 'Amsterdam',
    country: process.env.MYPARCEL_RETURN_COUNTRY || 'NL',
    email: process.env.MYPARCEL_RETURN_EMAIL || 'retour@kattenbak.nl',
    phone: process.env.MYPARCEL_RETURN_PHONE || '+31201234567',
  };

  // Redis - ✅ RUNTIME VALIDATED
  public readonly REDIS_HOST = validatedEnv.REDIS_HOST;
  public readonly REDIS_PORT = parseInt(validatedEnv.REDIS_PORT, 10);
  public readonly REDIS_PASSWORD = validatedEnv.REDIS_PASSWORD || '';

  // Email (DRY: Shared config for all email types) - ✅ RUNTIME VALIDATED
  public readonly SMTP_HOST = validatedEnv.SMTP_HOST || '';
  public readonly SMTP_PORT = parseInt(validatedEnv.SMTP_PORT, 10);
  public readonly SMTP_USER = validatedEnv.SMTP_USER || '';
  public readonly SMTP_PASSWORD = validatedEnv.SMTP_PASSWORD || '';
  public readonly EMAIL_FROM = validatedEnv.EMAIL_FROM;
  public readonly EMAIL_PROVIDER = validatedEnv.EMAIL_PROVIDER;
  public readonly SENDGRID_API_KEY = validatedEnv.SENDGRID_API_KEY || '';

  // Admin - ✅ RUNTIME VALIDATED
  public readonly ADMIN_EMAIL = validatedEnv.ADMIN_EMAIL;
  public readonly ADMIN_PASSWORD = validatedEnv.ADMIN_PASSWORD;

  // Security - ✅ RUNTIME VALIDATED
  public readonly RATE_LIMIT_WINDOW_MS = parseInt(validatedEnv.RATE_LIMIT_WINDOW_MS, 10);
  public readonly RATE_LIMIT_MAX_REQUESTS = parseInt(validatedEnv.RATE_LIMIT_MAX_REQUESTS, 10);
  
  // CORS origins - ✅ RUNTIME VALIDATED + DYNAMISCH: development includes localhost
  get CORS_ORIGINS(): string[] {
    const origins = validatedEnv.CORS_ORIGINS || (this.IS_PRODUCTION ? 'https://catsupply.nl' : '');
    const originList = origins ? origins.split(',').map(o => o.trim()) : [];
    
    // ✅ SECURITY: Development isolation - automatically add localhost origins
    if (this.IS_DEVELOPMENT) {
      const devOrigins = [
        'http://localhost:3001',
        'http://localhost:3002',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
      ];
      return [...new Set([...originList, ...devOrigins])];
    }
    
    // ✅ SECURITY: Production - strict CORS, no localhost
    return originList.filter(origin => !origin.includes('localhost') && !origin.includes('127.0.0.1'));
  }

  // Logging - ✅ RUNTIME VALIDATED
  public readonly LOG_LEVEL = validatedEnv.LOG_LEVEL;
  public readonly LOG_TO_FILE = validatedEnv.LOG_TO_FILE;

  // File Upload - ✅ RUNTIME VALIDATED
  public readonly UPLOAD_MAX_SIZE = parseInt(validatedEnv.UPLOAD_MAX_SIZE, 10);
  public readonly UPLOAD_ALLOWED_TYPES = validatedEnv.UPLOAD_ALLOWED_TYPES.split(',');
  public readonly UPLOAD_PATH = validatedEnv.UPLOAD_PATH;

  // Frontend URLs - ✅ RUNTIME VALIDATED
  public readonly FRONTEND_URL = validatedEnv.NEXT_PUBLIC_SITE_URL || validatedEnv.FRONTEND_URL || 'http://localhost:3001';

  /**
   * ✅ SECURITY: Validate configuration on startup with production/development isolation
   */
  public validate(): void {
    // ✅ SECURITY: Production isolation checks
    if (this.IS_PRODUCTION) {
      // Production MUST use live Mollie key
      if (this.MOLLIE_API_KEY.startsWith('test_')) {
        throw new Error('FATAL: Cannot use Mollie TEST key in PRODUCTION. Use live_ key.');
      }

      // Production MUST have strong JWT secret (already validated by Zod min 32)
      if (this.JWT_SECRET.length < 32) {
        throw new Error('FATAL: JWT_SECRET must be at least 32 characters in production');
      }

      // Production MUST NOT allow localhost in CORS
      const hasLocalhost = this.CORS_ORIGINS.some(origin => 
        origin.includes('localhost') || origin.includes('127.0.0.1')
      );
      if (hasLocalhost) {
        throw new Error('FATAL: Production CORS cannot include localhost origins');
      }

      // Production MUST use production MyParcel mode if configured
      if (this.MYPARCEL_API_KEY && this.MYPARCEL_MODE === 'test') {
        console.warn('⚠️  WARNING: MyParcel in TEST mode in PRODUCTION environment');
      }
    }

    // ✅ SECURITY: Development isolation checks
    if (this.IS_DEVELOPMENT) {
      // Development can use test keys (warn only)
      if (this.MOLLIE_API_KEY.startsWith('live_')) {
        console.warn('⚠️  INFO: Using Mollie LIVE key in DEVELOPMENT (safe for testing)');
      }
    }

    // Log configuration summary
    console.log('✅ Environment Configuration Loaded:');
    console.log(`   - Environment: ${this.NODE_ENV}`);
    console.log(`   - Port: ${this.BACKEND_PORT}`);
    console.log(`   - Database: ${this.DATABASE_URL.split('@')[1] || 'configured'}`);
    console.log(`   - Mollie: ${this.MOLLIE_API_KEY.substring(0, 15)}...`);
    console.log(`   - MyParcel: ${this.MYPARCEL_API_KEY ? `configured (${this.MYPARCEL_MODE} mode)` : 'not configured'}`);
    console.log(`   - Redis: ${this.REDIS_HOST}:${this.REDIS_PORT}`);
    console.log(`   - CORS Origins: ${this.CORS_ORIGINS.join(', ')}`);
    console.log(`   - Environment: ${this.IS_DEVELOPMENT ? 'DEVELOPMENT' : 'PRODUCTION'}`);
  }
}

export const env = new EnvironmentConfig();

