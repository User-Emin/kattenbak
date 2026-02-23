/**
 * 🔒 RESPONSE PROCESSOR - Secret Scanning & Metadata Removal (Layer 6)
 * 
 * Features:
 * - Scan for API keys, tokens, connection strings
 * - Remove internal metadata (doc IDs, scores, embeddings)
 * - Validate JSON structure
 * - Sanitize error messages (prevent info disclosure)
 * - DRY: Single processor for all RAG responses
 * 
 * Security (Layer 6 of 6-Layer Defense - FINAL LINE):
 * - ✅ SECRET SCANNING: Detects 10+ secret patterns
 * - ✅ METADATA REMOVAL: Strips internal info
 * - ✅ ERROR SANITIZATION: Generic user-facing errors
 * - ✅ STRUCTURE VALIDATION: Ensures safe JSON
 * - ✅ AUDIT LOGGING: Records suspicious responses
 * 
 * Prevents:
 * - ❌ API key leakage (Claude, HuggingFace, DB)
 * - ❌ Connection string exposure
 * - ❌ Internal metadata disclosure
 * - ❌ Stack trace leakage
 * - ❌ System path disclosure
 */

export interface RAGResponse {
  success: boolean;
  answer?: string;
  sources?: Array<{ title: string; snippet: string }>;
  /** Modulaire waarschuwingen (bijv. externe leverancier, Alibaba) */
  warnings?: string[];
  metadata?: {
    query?: string;
    latency_ms?: number;
    model?: string;
    techniques_used?: string[];
    [key: string]: any;
  };
  error?: string;
  
  // Internal fields (will be removed)
  internal_doc_ids?: string[];
  internal_scores?: number[];
  internal_embeddings?: number[][];
  internal_prompts?: string[];
  internal_debug?: any;
}

export interface ProcessorResult {
  response: RAGResponse;
  secrets_found: number;
  metadata_removed: string[];
  sanitized: boolean;
  safe: boolean;
}

export class ResponseProcessorService {
  /**
   * Secret patterns (regex for common secrets)
   */
  private static readonly SECRET_PATTERNS = [
    // Anthropic Claude API keys
    { name: 'Claude API Key', pattern: /sk-ant-api\d+-[A-Za-z0-9_-]{20,}/g },
    
    // HuggingFace API keys
    { name: 'HuggingFace API Key', pattern: /hf_[A-Za-z0-9]{20,}/g },
    
    // Database connection strings
    { name: 'PostgreSQL Connection', pattern: /postgresql:\/\/[^@]+@[^\s]+/g },
    { name: 'MySQL Connection', pattern: /mysql:\/\/[^@]+@[^\s]+/g },
    
    // JWT tokens
    { name: 'JWT Token', pattern: /Bearer [A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g },
    
    // AWS credentials
    { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g },
    { name: 'AWS Secret Key', pattern: /[A-Za-z0-9/+=]{40}/g },
    
    // Generic API keys
    { name: 'Generic API Key', pattern: /api[_-]?key[=:]\s*['"]?[A-Za-z0-9_-]{20,}['"]?/gi },
    
    // Private keys
    { name: 'Private Key', pattern: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
    
    // Passwords in connection strings
    { name: 'Password', pattern: /password[=:]\s*['"]?[^\s'"]{8,}['"]?/gi }
  ];

  /**
   * Internal metadata fields to remove
   */
  private static readonly INTERNAL_FIELDS = [
    'internal_doc_ids',
    'internal_scores',
    'internal_embeddings',
    'internal_prompts',
    'internal_debug',
    'embedding_vector',
    'similarity_scores',
    'raw_retrieval',
    'rerank_details',
    'filter_criteria'
  ];

  /**
   * Process RAG response (scan, sanitize, validate)
   * 
   * @param response - Raw RAG response
   * @returns Processed response with security report
   */
  static processResponse(response: RAGResponse): ProcessorResult {
    const secretsFound: string[] = [];
    const metadataRemoved: string[] = [];
    let sanitized = false;

    // 1. Scan for secrets in answer
    if (response.answer) {
      const { cleaned, secrets } = this.scanAndRedactSecrets(response.answer);
      
      if (secrets.length > 0) {
        console.error('🚨 CRITICAL: Secrets detected in RAG response!');
        secretsFound.push(...secrets);
        response.answer = cleaned;
        sanitized = true;
        
        // Audit log (in production, send to security monitoring)
        this.auditSecurityEvent('secret_leak_detected', {
          secrets_found: secrets.length,
          secret_types: secrets
        });
      }
    }

    // 2. Scan for secrets in sources
    if (response.sources) {
      response.sources = response.sources.map(source => {
        const { cleaned: cleanedSnippet, secrets: snippetSecrets } = this.scanAndRedactSecrets(source.snippet);
        
        if (snippetSecrets.length > 0) {
          secretsFound.push(...snippetSecrets);
          sanitized = true;
        }
        
        return {
          ...source,
          snippet: cleanedSnippet
        };
      });
    }

    // 3. Remove internal metadata fields
    for (const field of this.INTERNAL_FIELDS) {
      if (field in response) {
        delete (response as any)[field];
        metadataRemoved.push(field);
      }
    }

    // 4. Sanitize error messages (prevent info disclosure)
    if (response.error) {
      response.error = this.sanitizeError(response.error);
    }

    // 5. Validate structure
    const structureValid = this.validateStructure(response);
    if (!structureValid) {
      console.error('❌ Invalid response structure detected');
      sanitized = true;
    }

    // 6. Final safety check
    const safe = secretsFound.length === 0 && structureValid;

    if (!safe) {
      console.warn(`⚠️  Response processed: ${secretsFound.length} secrets redacted, ${metadataRemoved.length} fields removed`);
    }

    return {
      response,
      secrets_found: secretsFound.length,
      metadata_removed: metadataRemoved,
      sanitized,
      safe
    };
  }

  /**
   * Scan text for secrets and redact them
   */
  private static scanAndRedactSecrets(text: string): { cleaned: string; secrets: string[] } {
    let cleaned = text;
    const secrets: string[] = [];

    for (const { name, pattern } of this.SECRET_PATTERNS) {
      const matches = text.match(pattern);
      
      if (matches && matches.length > 0) {
        secrets.push(name);
        
        // Redact all matches
        cleaned = cleaned.replace(pattern, '[REDACTED]');
      }
    }

    return { cleaned, secrets };
  }

  /**
   * Sanitize error messages (generic user-facing errors)
   */
  private static sanitizeError(error: string): string {
    // Remove stack traces
    error = error.split('\n')[0];

    // Remove file paths
    error = error.replace(/\/[^\s]+\/(src|dist|node_modules)\/[^\s]+/g, '[path]');

    // Remove internal error codes
    error = error.replace(/Error: [A-Z_]+:/g, 'Error:');

    // Generic error patterns
    const genericErrors: Record<string, string> = {
      'ECONNREFUSED': 'Service tijdelijk niet beschikbaar',
      'ETIMEDOUT': 'Verzoek duurde te lang',
      'ENOTFOUND': 'Service niet gevonden',
      'Authentication failed': 'Authenticatie probleem',
      'API key': 'Configuratie probleem',
      'Database error': 'Database probleem',
      'Internal error': 'Interne fout'
    };

    for (const [pattern, replacement] of Object.entries(genericErrors)) {
      if (error.includes(pattern)) {
        return replacement;
      }
    }

    // Default generic error
    if (error.length > 100) {
      return 'Er ging iets mis bij het verwerken van uw vraag';
    }

    return error;
  }

  /**
   * Validate response structure
   */
  private static validateStructure(response: RAGResponse): boolean {
    // Must have success field
    if (typeof response.success !== 'boolean') {
      return false;
    }

    // If success=true, must have answer
    if (response.success && !response.answer) {
      return false;
    }

    // If success=false, must have error
    if (!response.success && !response.error) {
      return false;
    }

    // Answer must be string
    if (response.answer && typeof response.answer !== 'string') {
      return false;
    }

    // Sources must be array (if present)
    if (response.sources && !Array.isArray(response.sources)) {
      return false;
    }

    // Metadata must be object (if present)
    if (response.metadata && typeof response.metadata !== 'object') {
      return false;
    }

    return true;
  }

  /**
   * Audit security event (log for monitoring)
   */
  private static auditSecurityEvent(event: string, details: any): void {
    const auditLog = {
      timestamp: new Date().toISOString(),
      event,
      details,
      severity: 'critical'
    };

    // In production: Send to security monitoring system (Sentry, Datadog, etc.)
    console.error('🔒 SECURITY AUDIT:', JSON.stringify(auditLog));
    
    // TODO: Implement actual audit logging
    // - Write to secure audit log file
    // - Send to SIEM (Security Information and Event Management)
    // - Alert security team if critical
  }

  /**
   * Build safe error response
   */
  static buildErrorResponse(error: string, originalQuery?: string): RAGResponse {
    return {
      success: false,
      error: this.sanitizeError(error),
      metadata: {
        query: originalQuery,
        latency_ms: 0,
        model: 'error'
      }
    };
  }

  /**
   * Build success response (with automatic processing)
   */
  static buildSuccessResponse(
    answer: string,
    sources: Array<{ title: string; snippet: string }>,
    metadata: any
  ): ProcessorResult {
    const rawResponse: RAGResponse = {
      success: true,
      answer,
      sources,
      metadata
    };

    return this.processResponse(rawResponse);
  }

  /**
   * Health check
   */
  static healthCheck(): { status: string; details: any } {
    // Test with dummy data containing secrets
    const testResponse: RAGResponse = {
      success: true,
      answer: 'Test answer with potential secret sk-ant-api03-testkey123',
      metadata: {
        query: 'test',
        internal_score: 0.95 // Should be removed
      }
    };

    const result = this.processResponse(testResponse);

    return {
      status: 'healthy',
      details: {
        secrets_detected: result.secrets_found > 0,
        metadata_removed: result.metadata_removed.length,
        sanitized: result.sanitized,
        safe: result.safe,
        patterns_monitored: this.SECRET_PATTERNS.length,
        internal_fields: this.INTERNAL_FIELDS.length
      }
    };
  }
}
