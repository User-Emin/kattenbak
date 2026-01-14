/**
 * RAG SECURITY MIDDLEWARE
 * 4-Layer defense against prompt injection and attacks
 * In-memory rate limiting (no database dependency)
 */

import { Request, Response, NextFunction } from 'express';

// ✅ MEMORY LIMIT: In-memory rate limiting with automatic cleanup (prevents memory leak)
const rateLimitStore = new Map<string, { count: number; windowStart: number; blockedUntil?: number }>();
const MAX_RATE_LIMIT_ENTRIES = 10000; // Max IPs to track (prevents memory overload)

// ✅ CLEANUP: Remove old entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  const oneMinute = 60000;
  let cleaned = 0;
  
  for (const [ip, entry] of rateLimitStore.entries()) {
    // Remove entries older than 1 minute
    if (now - entry.windowStart > oneMinute && (!entry.blockedUntil || entry.blockedUntil < now)) {
      rateLimitStore.delete(ip);
      cleaned++;
    }
  }
  
  // If still too many entries, remove oldest
  if (rateLimitStore.size > MAX_RATE_LIMIT_ENTRIES) {
    const entries = Array.from(rateLimitStore.entries())
      .sort((a, b) => a[1].windowStart - b[1].windowStart);
    
    const toRemove = rateLimitStore.size - MAX_RATE_LIMIT_ENTRIES;
    for (let i = 0; i < toRemove; i++) {
      rateLimitStore.delete(entries[i][0]);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Rate limit cleanup: removed ${cleaned} old entries`);
  }
}, 5 * 60 * 1000); // Every 5 minutes

export interface SecurityCheckResult {
  safe: boolean;
  flagged: boolean;
  attack_type?: string;
  sanitized_query: string;
}

export class RAGSecurityMiddleware {
  /**
   * Main security check middleware
   */
  static async checkSecurity(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // ✅ FIX: Accept multiple field names for query (frontend compatibility)
      const query = req.body.query || req.body.message || req.body.question || '';
      
      // Layer 1: Rate limiting
      const rateLimitOk = await RAGSecurityMiddleware.checkRateLimit(req.ip || 'unknown');
      if (!rateLimitOk) {
        res.status(429).json({
          success: false,
          error: 'Te veel verzoeken. Probeer het over een minuut opnieuw.'
        });
        return;
      }
      
      // Layer 2: Input sanitization
      const sanitized = RAGSecurityMiddleware.sanitizeInput(query);
      
      // Layer 3: Attack detection
      const securityCheck = RAGSecurityMiddleware.detectAttacks(sanitized);
      
      // Layer 4: Logging
      await RAGSecurityMiddleware.logQuery(
        sanitized,
        securityCheck.flagged,
        securityCheck.attack_type,
        req
      );
      
      if (!securityCheck.safe) {
        res.status(403).json({
          success: false,
          error: 'Je vraag bevat ongeldige tekens. Probeer het opnieuw met een normale vraag.'
        });
        return;
      }
      
      // Add sanitized query to request
      req.body.sanitized_query = securityCheck.sanitized_query;
      req.body.security_flagged = securityCheck.flagged;
      
      next();
    } catch (err: any) {
      console.error('Security middleware error:', err.message);
      res.status(500).json({
        success: false,
        error: 'Er ging iets mis bij het verwerken van je vraag.'
      });
    }
  }
  
  /**
   * Layer 1: Rate limiting (10 requests per minute per IP) - IN-MEMORY
   */
  private static async checkRateLimit(ip: string): Promise<boolean> {
    try {
      const now = Date.now();
      const oneMinute = 60000;
      
      // Get current entry
      let entry = rateLimitStore.get(ip);
      
      if (!entry) {
        // First request
        rateLimitStore.set(ip, {
          count: 1,
          windowStart: now
        });
        return true;
      }
      
      // Check if blocked
      if (entry.blockedUntil && entry.blockedUntil > now) {
        return false;
      }
      
      // Reset window if expired
      if (now - entry.windowStart > oneMinute) {
        rateLimitStore.set(ip, {
          count: 1,
          windowStart: now
        });
        return true;
      }
      
      // Check limit
      if (entry.count >= 10) {
        // Block for 1 minute
        entry.blockedUntil = now + oneMinute;
        rateLimitStore.set(ip, entry);
        return false;
      }
      
      // Increment counter
      entry.count++;
      rateLimitStore.set(ip, entry);
      
      return true;
    } catch (err) {
      console.error('Rate limit check error:', err);
      return true; // Fail open
    }
  }
  
  /**
   * Layer 2: Input sanitization
   */
  private static sanitizeInput(query: string): string {
    if (!query) return '';
    
    return query
      .trim()
      .substring(0, 500) // Max length
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control chars
      .replace(/--|;|\/\*|\*\//g, '') // Remove SQL syntax
      .replace(/\s+/g, ' '); // Normalize whitespace
  }
  
  /**
   * Layer 3: Attack detection
   */
  private static detectAttacks(query: string): SecurityCheckResult {
    const lowerQuery = query.toLowerCase();
    
    // Prompt injection patterns
    const injectionPatterns = [
      /ignore (previous|all|above) instructions?/i,
      /disregard (previous|all|above)/i,
      /forget (previous|all|everything)/i,
      /you are now/i,
      /new instructions?:/i,
      /system prompt/i,
      /what (is|are) your instructions?/i,
      /(show|tell|give)( me)? your (system|initial) prompt/i,
      /debug mode/i,
      /admin mode/i,
    ];
    
    for (const pattern of injectionPatterns) {
      if (pattern.test(query)) {
        return {
          safe: false,
          flagged: true,
          attack_type: 'prompt_injection',
          sanitized_query: query
        };
      }
    }
    
    // SQL injection patterns
    if (
      lowerQuery.includes('drop table') ||
      lowerQuery.includes('delete from') ||
      lowerQuery.includes('insert into') ||
      lowerQuery.includes('update set')
    ) {
      return {
        safe: false,
        flagged: true,
        attack_type: 'sql_injection',
        sanitized_query: query
      };
    }
    
    // XSS patterns
    if (
      lowerQuery.includes('<script') ||
      lowerQuery.includes('javascript:') ||
      lowerQuery.includes('onerror=') ||
      lowerQuery.includes('onload=')
    ) {
      return {
        safe: false,
        flagged: true,
        attack_type: 'xss_attempt',
        sanitized_query: query
      };
    }
    
    return {
      safe: true,
      flagged: false,
      sanitized_query: query
    };
  }
  
  /**
   * Layer 4: Query logging (console only - no database)
   */
  private static async logQuery(
    query: string,
    flagged: boolean,
    attackType: string | undefined,
    req: Request
  ): Promise<void> {
    // Log to console for monitoring
    const logEntry = {
      timestamp: new Date().toISOString(),
      ip: req.ip || 'unknown',
      query: query.substring(0, 100),
      flagged,
      attackType: attackType || null
    };
    
    if (flagged) {
      console.warn('🚨 SECURITY ALERT:', JSON.stringify(logEntry));
    } else {
      console.log('📝 RAG Query:', logEntry.query);
    }
  }
}
