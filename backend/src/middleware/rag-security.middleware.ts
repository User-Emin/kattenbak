/**
 * RAG SECURITY MIDDLEWARE
 * 4-Layer defense against prompt injection and attacks
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      const query = req.body.question || req.body.query || '';
      
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
   * Layer 1: Rate limiting (10 requests per minute per IP)
   */
  private static async checkRateLimit(ip: string): Promise<boolean> {
    try {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60000);
      
      // Get or create rate limit entry
      const entry = await prisma.$queryRaw<Array<{
        request_count: number;
        window_start: Date;
        blocked_until: Date | null;
      }>>`
        SELECT request_count, window_start, blocked_until
        FROM rag_rate_limits
        WHERE ip_address = ${ip}
      `;
      
      if (entry.length === 0) {
        // First request - create entry
        await prisma.$executeRaw`
          INSERT INTO rag_rate_limits (ip_address, request_count, window_start)
          VALUES (${ip}, 1, ${now})
        `;
        return true;
      }
      
      const current = entry[0];
      
      // Check if blocked
      if (current.blocked_until && new Date(current.blocked_until) > now) {
        return false;
      }
      
      // Reset window if expired
      if (new Date(current.window_start) < oneMinuteAgo) {
        await prisma.$executeRaw`
          UPDATE rag_rate_limits
          SET request_count = 1, window_start = ${now}, blocked_until = NULL
          WHERE ip_address = ${ip}
        `;
        return true;
      }
      
      // Check limit
      if (current.request_count >= 10) {
        // Block for 1 minute
        const blockUntil = new Date(now.getTime() + 60000);
        await prisma.$executeRaw`
          UPDATE rag_rate_limits
          SET blocked_until = ${blockUntil}
          WHERE ip_address = ${ip}
        `;
        return false;
      }
      
      // Increment counter
      await prisma.$executeRaw`
        UPDATE rag_rate_limits
        SET request_count = request_count + 1
        WHERE ip_address = ${ip}
      `;
      
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
   * Layer 4: Query logging
   */
  private static async logQuery(
    query: string,
    flagged: boolean,
    attackType: string | undefined,
    req: Request
  ): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO rag_query_logs (
          query,
          query_sanitized,
          ip_address,
          user_agent,
          flagged_as_attack,
          attack_type
        ) VALUES (
          ${query.substring(0, 500)},
          ${query},
          ${req.ip || 'unknown'},
          ${req.get('user-agent') || 'unknown'},
          ${flagged},
          ${attackType || null}
        )
      `;
    } catch (err) {
      console.error('Failed to log query:', err);
      // Don't fail the request if logging fails
    }
  }
}
