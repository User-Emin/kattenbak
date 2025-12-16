/**
 * RAG SERVICE - ANTHROPIC CLAUDE INTEGRATION
 * Clean, managed inference without GPU complexity
 */

import Anthropic from '@anthropic-ai/sdk';
import { EmbeddingsService } from './embeddings.service';
import { VectorStoreService } from './vector-store.service';

export class RAGClaudeService {
  private static client: Anthropic | null = null;
  private static readonly CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || '';
  private static readonly USE_CLAUDE = process.env.USE_CLAUDE === 'true';
  private static readonly FALLBACK_TO_OLLAMA = true;
  
  /**
   * Initialize Claude client
   */
  private static getClient(): Anthropic {
    if (!this.client && this.CLAUDE_API_KEY) {
      this.client = new Anthropic({
        apiKey: this.CLAUDE_API_KEY
      });
    }
    return this.client!;
  }

  /**
   * Answer question using Claude (with Ollama fallback)
   */
  static async answerQuestion(question: string): Promise<{
    answer: string;
    latency_ms: number;
    model: string;
    sources: any[];
    backend: 'claude' | 'ollama';
  }> {
    const startTime = Date.now();

    try {
      // 1. Generate query embedding
      console.log('🔮 Generating embedding...');
      const { embedding } = await EmbeddingsService.generateEmbedding(question);

      // 2. Similarity search
      console.log('🔍 Searching vector store...');
      const results = await VectorStoreService.similaritySearch(embedding, 5, 0.5);

      if (results.length === 0) {
        return {
          answer: 'Sorry, ik kan geen informatie vinden om deze vraag te beantwoorden. Probeer een andere vraag over onze automatische kattenbak.',
          latency_ms: Date.now() - startTime,
          model: 'none',
          sources: [],
          backend: 'none' as any
        };
      }

      console.log(`✅ Found ${results.length} relevant documents`);

      // 3. Build context
      const context = results
        .map((r, i) => `[Document ${i + 1}]\n${r.content}`)
        .join('\n\n');

      // 4. Try Claude first (if enabled), fallback to Ollama
      let answer: string;
      let backend: 'claude' | 'ollama';
      let model: string;

      if (this.USE_CLAUDE && this.CLAUDE_API_KEY) {
        try {
          console.log('🤖 Calling Claude API...');
          const response = await this.callClaude(question, context);
          answer = response.answer;
          model = response.model;
          backend = 'claude';
          console.log('✅ Claude response received');
        } catch (error: any) {
          console.warn('⚠️ Claude failed, falling back to Ollama:', error.message);
          if (this.FALLBACK_TO_OLLAMA) {
            answer = await this.callOllama(question, context);
            model = 'qwen2.5:3b';
            backend = 'ollama';
          } else {
            throw error;
          }
        }
      } else {
        console.log('🔧 Using Ollama (local)...');
        answer = await this.callOllama(question, context);
        model = 'qwen2.5:3b';
        backend = 'ollama';
      }

      const latency = Date.now() - startTime;

      return {
        answer: answer.trim(),
        latency_ms: latency,
        model,
        sources: results,
        backend
      };

    } catch (error: any) {
      console.error('❌ RAG error:', error.message);
      throw error;
    }
  }

  /**
   * Call Claude API with RAG context
   */
  private static async callClaude(question: string, context: string): Promise<{
    answer: string;
    model: string;
  }> {
    const client = this.getClient();

    const systemPrompt = `Je bent een behulpzame assistent voor een Nederlandse e-commerce webshop die automatische kattenbakken verkoopt.

BELANGRIJKE REGELS:
- Beantwoord ALLEEN op basis van de gegeven context
- Geef een duidelijk, kort antwoord in het Nederlands (max 2-3 zinnen)
- Als de context niet voldoende informatie bevat, zeg dat eerlijk
- Vermeld geen technische details of interne informatie
- Wees vriendelijk en professioneel`;

    const userPrompt = `PRODUCTINFORMATIE:
${context}

VRAAG VAN KLANT:
${question}

Geef een kort, duidelijk antwoord op basis van de productinformatie.`;

    try {
      const message = await client.messages.create({
        model: 'claude-3-5-haiku-20241022', // Snelste en goedkoopste
        max_tokens: 300,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      const answer = message.content[0].type === 'text' 
        ? message.content[0].text 
        : '';

      return {
        answer,
        model: message.model
      };

    } catch (error: any) {
      if (error.status === 429) {
        throw new Error('Claude rate limit exceeded');
      }
      throw error;
    }
  }

  /**
   * Fallback: Call local Ollama
   */
  private static async callOllama(question: string, context: string): Promise<string> {
    const prompt = `Je bent een behulpzame assistent voor een Nederlandse e-commerce webshop die automatische kattenbakken verkoopt.

CONTEXT (productinformatie):
${context}

VRAAG VAN KLANT:
${question}

INSTRUCTIES:
- Beantwoord ALLEEN op basis van de gegeven context
- Geef een duidelijk, kort antwoord in het Nederlands
- Als de context niet voldoende informatie bevat, zeg dat eerlijk

ANTWOORD:`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:3b',
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 200
        }
      })
    });

    if (!response.ok) {
      throw new Error('Ollama error');
    }

    const data = await response.json() as any;
    return data.response || '';
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<{
    claude: boolean;
    ollama: boolean;
    preferred: 'claude' | 'ollama';
  }> {
    let claudeHealthy = false;
    let ollamaHealthy = false;

    // Check Claude (simple test request)
    if (this.USE_CLAUDE && this.CLAUDE_API_KEY) {
      try {
        const client = this.getClient();
        await client.messages.create({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'Hi' }]
        });
        claudeHealthy = true;
      } catch {
        claudeHealthy = false;
      }
    }

    // Check Ollama
    try {
      const response = await fetch('http://localhost:11434/api/tags', {
        signal: AbortSignal.timeout(2000) as any
      });
      ollamaHealthy = response.ok;
    } catch {
      ollamaHealthy = false;
    }

    return {
      claude: claudeHealthy,
      ollama: ollamaHealthy,
      preferred: claudeHealthy ? 'claude' : 'ollama'
    };
  }

  /**
   * Estimate costs for query
   */
  static estimateCost(queries: number): {
    total_eur: number;
    per_query_eur: number;
    breakdown: string;
  } {
    // Claude Haiku pricing (approximate)
    const INPUT_COST = 0.00025 / 1000;  // €0.00025 per 1K input tokens
    const OUTPUT_COST = 0.00125 / 1000; // €0.00125 per 1K output tokens
    
    const AVG_INPUT_TOKENS = 1000;  // Context + prompt
    const AVG_OUTPUT_TOKENS = 100;  // Response
    
    const costPerQuery = 
      (AVG_INPUT_TOKENS * INPUT_COST) + 
      (AVG_OUTPUT_TOKENS * OUTPUT_COST);
    
    const totalCost = queries * costPerQuery;
    
    return {
      total_eur: parseFloat(totalCost.toFixed(2)),
      per_query_eur: parseFloat(costPerQuery.toFixed(4)),
      breakdown: `${queries} queries × €${costPerQuery.toFixed(4)} = €${totalCost.toFixed(2)}`
    };
  }
}
