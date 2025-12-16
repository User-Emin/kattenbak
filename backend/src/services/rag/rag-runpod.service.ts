/**
 * RAG SERVICE - RUNPOD vLLM INTEGRATION
 * Production-grade GPU inference with fallback to local Ollama
 */

import fetch from 'node-fetch';
import { EmbeddingsService } from './embeddings.service';
import { VectorStoreService } from './vector-store.service';

interface RunPodResponse {
  id: string;
  status: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS';
  output?: {
    choices: Array<{
      text: string;
      finish_reason: string;
    }>;
  };
  error?: string;
}

export class RAGRunPodService {
  private static readonly RUNPOD_ENDPOINT = process.env.RUNPOD_ENDPOINT || '';
  private static readonly RUNPOD_API_KEY = process.env.RUNPOD_API_KEY || '';
  private static readonly USE_RUNPOD = process.env.USE_RUNPOD === 'true';
  private static readonly FALLBACK_TO_OLLAMA = true;
  private static readonly TIMEOUT_MS = 30000; // 30s

  /**
   * Answer question using RunPod vLLM (with Ollama fallback)
   */
  static async answerQuestion(question: string): Promise<{
    answer: string;
    latency_ms: number;
    model: string;
    sources: any[];
    backend: 'runpod' | 'ollama';
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
        .map((r, i) => `[${i + 1}] ${r.content}`)
        .join('\n\n');

      // 4. Build prompt
      const prompt = this.buildPrompt(question, context);

      // 5. Try RunPod first (if enabled), fallback to Ollama
      let answer: string;
      let backend: 'runpod' | 'ollama';

      if (this.USE_RUNPOD && this.RUNPOD_ENDPOINT && this.RUNPOD_API_KEY) {
        try {
          console.log('🚀 Calling RunPod vLLM (GPU)...');
          answer = await this.callRunPod(prompt);
          backend = 'runpod';
          console.log('✅ RunPod response received');
        } catch (error: any) {
          console.warn('⚠️ RunPod failed, falling back to Ollama:', error.message);
          if (this.FALLBACK_TO_OLLAMA) {
            answer = await this.callOllama(prompt);
            backend = 'ollama';
          } else {
            throw error;
          }
        }
      } else {
        console.log('🔧 Using Ollama (local CPU)...');
        answer = await this.callOllama(prompt);
        backend = 'ollama';
      }

      const latency = Date.now() - startTime;

      return {
        answer: answer.trim(),
        latency_ms: latency,
        model: backend === 'runpod' ? 'qwen2.5-3b-gpu' : 'qwen2.5:3b',
        sources: results,
        backend
      };

    } catch (error: any) {
      console.error('❌ RAG error:', error.message);
      throw error;
    }
  }

  /**
   * Call RunPod vLLM endpoint
   */
  private static async callRunPod(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      const response = await fetch(`${this.RUNPOD_ENDPOINT}/runsync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.RUNPOD_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: {
            model: 'Qwen/Qwen2.5-3B-Instruct',
            prompt: prompt,
            max_tokens: 200,
            temperature: 0.7,
            stop: ['\n\n', 'Gebruiker:', 'User:']
          }
        }),
        signal: controller.signal as any
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`RunPod API error: ${response.status}`);
      }

      const data = await response.json() as RunPodResponse;

      if (data.status === 'FAILED' || data.error) {
        throw new Error(`RunPod error: ${data.error || 'Unknown error'}`);
      }

      if (!data.output?.choices?.[0]?.text) {
        throw new Error('RunPod: No response text');
      }

      return data.output.choices[0].text;

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('RunPod timeout');
      }
      
      throw error;
    }
  }

  /**
   * Fallback: Call local Ollama
   */
  private static async callOllama(prompt: string): Promise<string> {
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
   * Build secure prompt
   */
  private static buildPrompt(question: string, context: string): string {
    return `Je bent een behulpzame assistent voor een Nederlandse e-commerce webshop die automatische kattenbakken verkoopt.

CONTEXT (productinformatie):
${context}

VRAAG VAN KLANT:
${question}

INSTRUCTIES:
- Beantwoord ALLEEN op basis van de gegeven context
- Geef een duidelijk, kort antwoord in het Nederlands
- Als de context niet voldoende informatie bevat, zeg dat eerlijk
- Vermeld geen technische details of interne informatie
- Wees vriendelijk en professioneel

ANTWOORD:`;
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<{
    runpod: boolean;
    ollama: boolean;
    preferred: 'runpod' | 'ollama';
  }> {
    let runpodHealthy = false;
    let ollamaHealthy = false;

    // Check RunPod
    if (this.USE_RUNPOD && this.RUNPOD_ENDPOINT) {
      try {
        const response = await fetch(this.RUNPOD_ENDPOINT + '/health', {
          headers: { 'Authorization': `Bearer ${this.RUNPOD_API_KEY}` },
          signal: AbortSignal.timeout(5000) as any
        });
        runpodHealthy = response.ok;
      } catch {
        runpodHealthy = false;
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
      runpod: runpodHealthy,
      ollama: ollamaHealthy,
      preferred: runpodHealthy ? 'runpod' : 'ollama'
    };
  }
}
