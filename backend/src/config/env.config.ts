import { config } from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';

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

// Environment configuration with validation
class EnvironmentConfig {
  // Node environment
  public readonly NODE_ENV = process.env.NODE_ENV || 'development';
  public readonly IS_PRODUCTION = this.NODE_ENV === 'production';
  public readonly IS_DEVELOPMENT = this.NODE_ENV === 'development';

  // Server configuration
  public readonly BACKEND_PORT = parseInt(process.env.BACKEND_PORT || '3001', 10);
  public readonly BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

  // Database
  public readonly DATABASE_URL = this.getRequired('DATABASE_URL');

  // JWT
  public readonly JWT_SECRET = this.getRequired('JWT_SECRET');
  public readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

  // Mollie (Payment)
  public readonly MOLLIE_API_KEY = this.getRequired('MOLLIE_API_KEY');
  public readonly MOLLIE_WEBHOOK_URL = process.env.MOLLIE_WEBHOOK_URL || '';

  // MyParcel (Shipping)
  public readonly MYPARCEL_API_KEY = process.env.MYPARCEL_API_KEY || '';

  // SMTP Configuration
  public readonly SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
  public readonly SMTP_PORT = process.env.SMTP_PORT || '587';
  public readonly SMTP_SECURE = process.env.SMTP_SECURE || 'false';
  public readonly SMTP_USER = process.env.SMTP_USER || '';
  public readonly SMTP_PASS = process.env.SMTP_PASS || '';
  public readonly MYPARCEL_WEBHOOK_URL = process.env.MYPARCEL_WEBHOOK_URL || '';

  // Redis
  public readonly REDIS_HOST = process.env.REDIS_HOST || 'localhost';
  public readonly REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
  public readonly REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';

  // Email
  public readonly SMTP_HOST = process.env.SMTP_HOST || '';
  public readonly SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
  public readonly SMTP_USER = process.env.SMTP_USER || '';
  public readonly SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
  public readonly EMAIL_FROM = process.env.EMAIL_FROM || '';

  // Admin
  public readonly ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@localhost';
  public readonly ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

  // Security
  public readonly RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
  public readonly RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
  public readonly CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');

  // Logging
  public readonly LOG_LEVEL = process.env.LOG_LEVEL || 'info';
  public readonly LOG_TO_FILE = process.env.LOG_TO_FILE === 'true';

  // File Upload
  public readonly UPLOAD_MAX_SIZE = parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10);
  public readonly UPLOAD_ALLOWED_TYPES = (process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/webp').split(',');
  public readonly UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';

  // Frontend URLs
  public readonly FRONTEND_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  /**
   * Get required environment variable or throw error
   */
  private getRequired(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  /**
   * Validate configuration on startup
   */
  public validate(): void {
    // Validate Mollie API key format
    if (!this.MOLLIE_API_KEY.startsWith('test_') && !this.MOLLIE_API_KEY.startsWith('live_')) {
      throw new Error('Invalid MOLLIE_API_KEY format. Must start with test_ or live_');
    }

    // Warn if using test key in production
    if (this.IS_PRODUCTION && this.MOLLIE_API_KEY.startsWith('test_')) {
      console.warn('⚠️  WARNING: Using Mollie TEST API key in PRODUCTION environment!');
    }

    // Warn if using weak JWT secret in production
    if (this.IS_PRODUCTION && this.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production');
    }

    // Log configuration summary
    console.log('✅ Environment Configuration Loaded:');
    console.log(`   - Environment: ${this.NODE_ENV}`);
    console.log(`   - Port: ${this.BACKEND_PORT}`);
    console.log(`   - Database: ${this.DATABASE_URL.split('@')[1] || 'configured'}`);
    console.log(`   - Mollie: ${this.MOLLIE_API_KEY.substring(0, 15)}...`);
    console.log(`   - MyParcel: ${this.MYPARCEL_API_KEY ? 'configured' : 'not configured'}`);
    console.log(`   - SMTP: ${this.SMTP_USER ? 'configured' : 'not configured'}`);
    console.log(`   - Redis: ${this.REDIS_HOST}:${this.REDIS_PORT}`);
    console.log(`   - CORS Origins: ${this.CORS_ORIGINS.join(', ')}`);
  }
}

export const env = new EnvironmentConfig();

