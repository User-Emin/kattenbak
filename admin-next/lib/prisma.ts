/**
 * PRISMA CLIENT - Admin Next.js
 * DRY: Hergebruikt backend schema
 * Security: Server-side only
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Test connection
prisma.$connect()
  .then(() => console.log('✅ Admin Prisma connected'))
  .catch((error) => console.error('❌ Admin Prisma connection failed:', error));




