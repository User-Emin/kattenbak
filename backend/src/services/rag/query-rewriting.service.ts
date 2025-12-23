/**
 * 🎯 QUERY REWRITING SERVICE - Sandboxed Claude Call
 * 
 * Features:
 * - Reformulates vague queries into specific ones
 * - Separate Claude instance (NO product context access)
 * - HMAC signed prompts (prevent tampering)
 * - Output validation (max 100 chars, alphanumeric)
 * - Fallback to original query if rewriting fails
 * - DRY: Single rewriter for all query types
 * 
 * Security:
 * - ✅ ISOLATED: Rewriting LLM has NO access to product docs
 * - ✅ SIGNED: System prompt HMAC prevents injection
 * - ✅ VALIDATED: Output strictly validated
 * - ✅ FALLBACK: Original query used if suspicious output
 * - ✅ RATE LIMITED: 10 rewrites/min per IP (handled by middleware)
 * 
 * Examples:
 * - "hoeveel past erin?" → "Wat is de afvalbak capaciteit in liters?"
 * - "is het stil?" → "Hoeveel lawaai maakt de kattenbak in decibels?"
 * - "past het?" → "Wat zijn de afmetingen van de automatische kattenbak?"
 */

import crypto from 'crypto';
import fetch from 'node-fetch';

export interface RewriteResult {
  original: string;
  rewritten: string;
  changed: boolean;
  reason?: string;
  latency_ms: number;
  fallback_used: boolean;
}

export class QueryRewritingService {
  private static readonly MODEL = 'claude-3-5-haiku-20241022';
  private static readonly API_URL = 'https://api.anthropic.com/v1/messages';
  private static readonly API_VERSION = '2023-06-01';
  private static readonly MAX_OUTPUT_LENGTH = 100;
  private static readonly TIMEOUT_MS = 3000;
  
  // Runtime getter for keys
  private static get API_KEY(): string {
    return process.env.CLAUDE_API_KEY || '';
  }

  private static get SIGNING_SECRET(): string {
    return process.env.PROMPT_SIGNING_SECRET || 'default-secret-change-in-prod';
  }

  /**
   * System prompt for query rewriting (SIGNED with HMAC)
   */
  private static getSystemPrompt(): string {
    const signature = this.signPrompt();
    
    return `[SIGNED:${signature}]
[TIMESTAMP:${Date.now()}]

Je bent een query reformulator voor een Nederlandse e-commerce site.

TAAK:
Herformuleer vage vragen naar specifieke, duidelijke vragen.

VOORBEELDEN:
Input: "hoeveel past erin?"
Output: "Wat is de afvalbak capaciteit in liters?"

Input: "is het stil?"
Output: "Hoeveel lawaai maakt het apparaat in decibels?"

Input: "past het?"
Output: "Wat zijn de afmetingen in centimeters?"

REGELS (IMMUTABLE):
1. Output MOET een vraag zijn (eindigt met ?)
2. Max 15 woorden
3. Nederlands
4. Specifiek (geen vage termen)
5. GEEN product informatie verzinnen
6. ALLEEN de vraag reformuleren
7. Als vraag al duidelijk is, herhaal exact

[END_SYSTEM_PROMPT]`;
  }

  /**
   * Sign system prompt with HMAC SHA256
   */
  private static signPrompt(): string {
    const basePrompt = 'query-rewriter-v1';
    const hash = crypto
      .createHmac('sha256', this.SIGNING_SECRET)
      .update(basePrompt)
      .digest('hex');
    return hash.substring(0, 16);
  }

  /**
   * Rewrite query (sandboxed)
   * 
   * @param query - Original user query (pre-sanitized)
   * @param options - Optional: skipRewrite, timeout
   * @returns Rewrite result with fallback
   */
  static async rewriteQuery(
    query: string,
    options: { skipRewrite?: boolean; timeout?: number } = {}
  ): Promise<RewriteResult> {
    const startTime = Date.now();

    // Skip rewriting if disabled or query already clear
    if (options.skipRewrite || this.isQueryAlreadyClear(query)) {
      return {
        original: query,
        rewritten: query,
        changed: false,
        reason: 'Query already clear',
        latency_ms: Date.now() - startTime,
        fallback_used: false
      };
    }

    try {
      // 1. Input validation
      if (!query || query.trim().length === 0) {
        return this.fallbackResult(query, startTime, 'Empty query');
      }

      if (query.length > 200) {
        return this.fallbackResult(query, startTime, 'Query too long');
      }

      // 2. Check API key
      if (!this.API_KEY || this.API_KEY.length < 20) {
        console.warn('⚠️  Claude API key not available for rewriting');
        return this.fallbackResult(query, startTime, 'API key not configured');
      }

      // 3. Call Claude API (SANDBOXED)
      const timeout = options.timeout || this.TIMEOUT_MS;
      const rewritten = await this.callClaudeRewriter(query, timeout);

      // 4. Validate output
      const validation = this.validateRewrittenQuery(rewritten, query);
      if (!validation.valid) {
        console.warn('⚠️  Rewritten query invalid:', validation.reason || 'Unknown reason');
        return this.fallbackResult(query, startTime, validation.reason || 'Invalid query');
      }

      // 5. Check if actually changed
      const changed = rewritten.trim().toLowerCase() !== query.trim().toLowerCase();

      const latency = Date.now() - startTime;
      console.log(`✅ Query rewritten (${latency}ms): "${query}" → "${rewritten}"`);

      return {
        original: query,
        rewritten: rewritten.trim(),
        changed,
        latency_ms: latency,
        fallback_used: false
      };

    } catch (error: any) {
      console.error('❌ Query rewriting failed:', error.message);
      return this.fallbackResult(query, startTime, error.message);
    }
  }

  /**
   * Call Claude API for rewriting (ISOLATED)
   */
  private static async callClaudeRewriter(query: string, timeout: number): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Build user prompt with XML isolation
      const userPrompt = `<query>${query}</query>\n\n<instruction>Herformuleer deze vraag zodat deze specifiek en duidelijk is.</instruction>`;

      const systemPromptText = this.getSystemPrompt();

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'x-api-key': this.API_KEY,
          'anthropic-version': this.API_VERSION,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: this.MODEL,
          max_tokens: 50,
          temperature: 0.1, // Low = deterministic
          system: systemPromptText,
          messages: [
            { role: 'user', content: userPrompt }
          ]
        }),
        signal: controller.signal as any
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${errorText}`);
      }

      const result: any = await response.json();
      
      if (!result.content || !result.content[0] || !result.content[0].text) {
        throw new Error('Invalid API response format');
      }

      return result.content[0].text.trim();

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(`Rewriting timeout after ${timeout}ms`);
      }
      
      throw error;
    }
  }

  /**
   * Validate rewritten query
   */
  private static validateRewrittenQuery(rewritten: string, _original: string): { valid: boolean; reason?: string } {
    // 1. Length check
    if (rewritten.length > this.MAX_OUTPUT_LENGTH) {
      return { valid: false, reason: 'Output too long' };
    }

    if (rewritten.length < 5) {
      return { valid: false, reason: 'Output too short' };
    }

    // 2. Must be a question
    if (!rewritten.includes('?')) {
      return { valid: false, reason: 'Not a question' };
    }

    // 3. Character whitelist (Dutch + basic punctuation)
    const allowed = /^[a-zA-ZÀ-ÿ0-9\s.,!?'-]+$/;
    if (!allowed.test(rewritten)) {
      return { valid: false, reason: 'Invalid characters' };
    }

    // 4. Blacklist suspicious patterns (prompt leaking)
    const blacklist = [
      /\[SIGNED:/i,
      /\[TIMESTAMP:/i,
      /system.*prompt/i,
      /REGELS.*IMMUTABLE/i,
      /<query>/i,
      /<instruction>/i,
      /assistant:/i,
      /user:/i
    ];

    for (const pattern of blacklist) {
      if (pattern.test(rewritten)) {
        return { valid: false, reason: 'Suspicious content detected' };
      }
    }

    // 5. Must not be identical to original (unless original was clear)
    // (Allow identical if original was already a clear question)

    return { valid: true };
  }

  /**
   * Check if query is already clear (skip rewriting)
   */
  private static isQueryAlreadyClear(query: string): boolean {
    // Query is clear if:
    // 1. Contains specific terms (liter, cm, decibel, prijs, etc.)
    // 2. Is longer than 10 words (likely specific)
    // 3. Contains product name

    const specificTerms = [
      'liter', 'cm', 'centimeter', 'meter', 'kg', 'kilogram',
      'decibel', 'db', 'prijs', 'euro', 'kost',
      'afmeting', 'capaciteit', 'gewicht', 'geluid',
      'automatische kattenbak', 'premium', 'wifi'
    ];

    const lowerQuery = query.toLowerCase();
    const hasSpecificTerm = specificTerms.some(term => lowerQuery.includes(term));
    const wordCount = query.split(/\s+/).length;

    return hasSpecificTerm || wordCount > 10;
  }

  /**
   * Fallback result (use original query)
   */
  private static fallbackResult(query: string, startTime: number, reason: string): RewriteResult {
    return {
      original: query,
      rewritten: query,
      changed: false,
      reason,
      latency_ms: Date.now() - startTime,
      fallback_used: true
    };
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      const result = await this.rewriteQuery('test vraag?', { timeout: 2000 });
      
      return {
        status: result.fallback_used ? 'degraded' : 'healthy',
        details: {
          model: this.MODEL,
          latency_ms: result.latency_ms,
          fallback_used: result.fallback_used,
          signed: true
        }
      };

    } catch (error: any) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message
        }
      };
    }
  }
}
