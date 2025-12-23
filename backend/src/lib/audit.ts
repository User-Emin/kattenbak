/**
 * AUDIT LOGGING - Track all admin actions
 * Security: Complete audit trail for compliance
 * GDPR: Required for data modification tracking
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditLogEntry {
  userId: string;
  userEmail: string;
  action: string; // 'CREATE' | 'UPDATE' | 'DELETE'
  entity: string; // 'Product' | 'Order' | 'Return'
  entityId: string;
  changes?: any; // JSON object with before/after
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log admin action to database
 */
export const logAuditAction = async (entry: AuditLogEntry): Promise<void> => {
  try {
    // Note: Audit log table needs to be added to Prisma schema
    // For now, log to console (will add to schema in Phase B)
    console.log('🔍 AUDIT LOG:', {
      timestamp: new Date().toISOString(),
      user: entry.userEmail,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      ip: entry.ipAddress,
    });
    
    // TODO: Add to database when schema is ready
    // await prisma.auditLog.create({ data: entry });
  } catch (error: any) {
    console.error('Audit log error:', error.message);
    // Don't throw - audit logging failure shouldn't break operations
  }
};

/**
 * Express middleware to capture audit info
 */
export const auditMiddleware = (entity: string, action: string) => {
  return (req: any, res: any, next: any) => {
    // Attach audit helper to request
    req.audit = {
      log: async (entityId: string, changes?: any) => {
        await logAuditAction({
          userId: req.user?.id || 'unknown',
          userEmail: req.user?.email || 'unknown',
          action,
          entity,
          entityId,
          changes,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
        });
      }
    };
    next();
  };
};

/**
 * Get audit logs for entity
 */
export const getAuditLogs = async (
  entity: string,
  entityId: string,
  limit: number = 50
): Promise<any[]> => {
  // TODO: Implement when audit log table exists
  return [];
};






