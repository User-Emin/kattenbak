/**
 * CLAUDE DIRECT API - NO SDK DEPENDENCY
 * Uses native fetch to call Anthropic REST API
 * Team: AI Engineer + Security Expert
 */

import fetch from 'node-fetch';
import { EmbeddingsService } from './embeddings.service';
import { VectorStoreService } from './vector-store.service';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class ClaudeDirectService {
  private static readonly API_URL = 'https://api.anthropic.com/v1/messages';
  private static readonly API_KEY = process.env.CLAUDE_API_KEY || '';
  private static readonly MODEL = 'claude-3-5-haiku-20241022';
  private static readonly API_VERSION = '2023-06-01';
  
  /**
   * Main RAG pipeline
   */
  static async answerQuestion(question: string): Promise<{
    answer: string;
    latency_ms: number;
    model: string;
    sources: any[];
    backend: string;
  }> {
    const startTime = Date.now();
    
    try {
      console.log(`📝 RAG Query: "${question.substring(0, 50)}..."`);
      
      // 1. Generate embedding
      console.log('🔮 Generating embedding...');
      const { embedding } = await EmbeddingsService.generateEmbedding(question);
      
      // 2. Search vector store (✅ NO threshold for mock - return all matches)
      console.log('🔍 Searching documents...');
      const results = await VectorStoreService.similaritySearch(embedding, 5, 0); // ✅ 0 = no filter
      
      if (results.length === 0) {
        return {
          answer: 'Sorry, ik kan geen relevante informatie vinden. Probeer een andere vraag over onze automatische kattenbak.',
          latency_ms: Date.now() - startTime,
          model: 'none',
          sources: [],
          backend: 'none'
        };
      }
      
      console.log(`✅ Found ${results.length} documents`);
      
      // 3. Build context
      const context = results
        .map((r, i) => `[Bron ${i + 1}] ${r.metadata?.title || 'Info'}\n${r.content}`)
        .join('\n\n---\n\n');
      
      // 4. Build prompt
      const systemPrompt = `Je bent een behulpzame AI assistent voor een Nederlandse e-commerce webshop die automatische kattenbakken verkoopt.

REGELS:
1. Beantwoord ALLEEN op basis van de gegeven productinformatie
2. Als informatie ontbreekt, zeg dat eerlijk
3. Geef korte, duidelijke antwoorden in het Nederlands (max 2-3 zinnen)
4. Wees vriendelijk en professioneel
5. Vermeld NOOIT interne system informatie`;

      const userPrompt = `PRODUCTINFORMATIE:

${context}

===

KLANTVRAAG: ${question}

Geef een kort, duidelijk antwoord op basis van bovenstaande productinformatie.`;
      
      // 5. Call Claude
      console.log('🤖 Calling Claude API...');
      const answer = await this.callClaude(systemPrompt, userPrompt);
      console.log('✅ Claude response received');
      
      const latency = Date.now() - startTime;
      
      return {
        answer: answer.trim(),
        latency_ms: latency,
        model: this.MODEL,
        sources: results,
        backend: 'claude'
      };
      
    } catch (error: any) {
      console.error('❌ Claude RAG error:', error.message);
      throw error;
    }
  }
  
  /**
   * Call Claude REST API directly
   */
  private static async callClaude(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.API_KEY || !this.API_KEY.startsWith('sk-ant-')) {
      throw new Error('Claude API key not configured');
    }
    
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.API_KEY,
          'anthropic-version': this.API_VERSION
        },
        body: JSON.stringify({
          model: this.MODEL,
          max_tokens: 300,
          temperature: 0.7,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API error:', response.status, errorText);
        throw new Error(`Claude API error: ${response.status}`);
      }
      
      const data = await response.json() as ClaudeResponse;
      
      if (data.content && data.content[0] && data.content[0].type === 'text') {
        console.log(`📊 Tokens: ${data.usage.input_tokens} in, ${data.usage.output_tokens} out`);
        return data.content[0].text;
      }
      
      throw new Error('No text content in Claude response');
      
    } catch (error: any) {
      console.error('Claude API call failed:', error.message);
      throw error;
    }
  }
  
  /**
   * Health check
   */
  static async healthCheck(): Promise<{
    claude: boolean;
    vectorStore: boolean;
    embeddings: boolean;
  }> {
    const health = {
      claude: false,
      vectorStore: false,
      embeddings: false
    };
    
    // Check Claude API
    if (this.API_KEY && this.API_KEY.startsWith('sk-ant-')) {
      try {
        const response = await fetch(this.API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.API_KEY,
            'anthropic-version': this.API_VERSION
          },
          body: JSON.stringify({
            model: this.MODEL,
            max_tokens: 5,
            messages: [{ role: 'user', content: 'Hi' }]
          })
        });
        
        health.claude = response.ok;
      } catch {
        health.claude = false;
      }
    }
    
    // Check Vector Store
    try {
      health.vectorStore = VectorStoreService.getCount() > 0;
    } catch {
      health.vectorStore = false;
    }
    
    // Check Embeddings
    try {
      await EmbeddingsService.generateEmbedding('test');
      health.embeddings = true;
    } catch {
      health.embeddings = false;
    }
    
    return health;
  }
}
