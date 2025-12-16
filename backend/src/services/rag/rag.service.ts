/**
 * RAG SERVICE - Retrieval Augmented Generation
 * Combines vector similarity search with Ollama LLM
 */

import { PrismaClient } from '@prisma/client';
import { EmbeddingsService } from './embeddings.service';
import { spawn } from 'child_process';

const prisma = new PrismaClient();

export interface RAGResponse {
  answer: string;
  sources: Array<{
    content: string;
    similarity: number;
    metadata: any;
  }>;
  latency_ms: number;
  model: string;
}

export class RAGService {
  private static readonly MODEL = 'llama3.2:3b';
  private static readonly MAX_CONTEXT_DOCS = 5;
  private static readonly SIMILARITY_THRESHOLD = 0.65;
  
  /**
   * Answer question using RAG
   */
  static async answerQuestion(
    question: string,
    options: {
      max_docs?: number;
      threshold?: number;
      stream?: boolean;
    } = {}
  ): Promise<RAGResponse> {
    const startTime = Date.now();
    
    try {
      // Step 1: Generate query embedding
      console.log('🔮 Generating query embedding...');
      const { embedding } = await EmbeddingsService.generateEmbedding(question);
      
      // Step 2: Similarity search
      console.log('🔍 Searching similar documents...');
      const docs = await this.similaritySearch(
        embedding,
        options.max_docs || this.MAX_CONTEXT_DOCS,
        options.threshold || this.SIMILARITY_THRESHOLD
      );
      
      console.log(`📄 Found ${docs.length} relevant documents`);
      
      if (docs.length === 0) {
        return {
          answer: 'Sorry, ik kan geen informatie vinden om deze vraag te beantwoorden. Probeer een andere vraag over onze automatische kattenbak.',
          sources: [],
          latency_ms: Date.now() - startTime,
          model: this.MODEL
        };
      }
      
      // Step 3: Build context
      const context = docs.map(d => d.content).join('\n\n');
      
      // Step 4: Generate answer with Ollama
      console.log('🤖 Generating answer with LLM...');
      const answer = await this.generateAnswer(question, context);
      
      const latency = Date.now() - startTime;
      console.log(`⏱️  Total latency: ${latency}ms`);
      
      return {
        answer,
        sources: docs.map(d => ({
          content: d.content,
          similarity: d.similarity,
          metadata: d.metadata
        })),
        latency_ms: latency,
        model: this.MODEL
      };
      
    } catch (err: any) {
      console.error('❌ RAG error:', err.message);
      throw err;
    }
  }
  
  /**
   * Similarity search in vector database
   */
  private static async similaritySearch(
    queryEmbedding: number[],
    maxDocs: number,
    threshold: number
  ): Promise<Array<{
    id: string;
    content: string;
    similarity: number;
    metadata: any;
  }>> {
    const embeddingStr = `[${queryEmbedding.join(',')}]`;
    
    const results = await prisma.$queryRaw<Array<{
      id: string;
      document_type: string;
      content: string;
      product_id: string;
      metadata: any;
      similarity: number;
    }>>`
      SELECT 
        id,
        document_type,
        content,
        product_id,
        metadata,
        1 - (embedding <=> ${embeddingStr}::vector) as similarity
      FROM document_embeddings
      WHERE 1 - (embedding <=> ${embeddingStr}::vector) > ${threshold}
      ORDER BY embedding <=> ${embeddingStr}::vector
      LIMIT ${maxDocs}
    `;
    
    return results.map(r => ({
      id: r.id,
      content: r.content,
      similarity: Number(r.similarity),
      metadata: r.metadata
    }));
  }
  
  /**
   * Generate answer using Ollama
   */
  private static async generateAnswer(
    question: string,
    context: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Build prompt
      const prompt = this.buildPrompt(question, context);
      
      // Call Ollama
      const ollama = spawn('ollama', ['run', this.MODEL]);
      
      let stdout = '';
      let stderr = '';
      
      // Send prompt
      ollama.stdin.write(prompt);
      ollama.stdin.end();
      
      ollama.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      ollama.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      ollama.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Ollama failed: ${stderr}`));
          return;
        }
        
        // Clean up response
        const answer = this.cleanResponse(stdout);
        resolve(answer);
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        ollama.kill();
        reject(new Error('Ollama timeout'));
      }, 30000);
    });
  }
  
  /**
   * Build RAG prompt with security hardening
   */
  private static buildPrompt(question: string, context: string): string {
    return `Je bent een behulpzame assistent voor een Nederlandse webshop die automatische kattenbakken verkoopt.

CONTEXT (Productinformatie):
${context}

VRAAG VAN KLANT:
${question}

INSTRUCTIES:
1. Beantwoord de vraag in het Nederlands
2. Gebruik ALLEEN informatie uit de CONTEXT hierboven
3. Wees specifiek en accuraat
4. Als je het antwoord niet weet, zeg dan eerlijk "Ik weet het niet zeker"
5. Houd het antwoord kort en duidelijk (max 3-4 zinnen)
6. Geen marketing praat, gewoon feitelijke informatie
7. NOOIT prijzen noemen (die kunnen veranderen)

ANTWOORD:`;
  }
  
  /**
   * Clean LLM response
   * SECURITY: Filter out system prompt leaks
   */
  private static cleanResponse(response: string): string {
    return response
      .trim()
      .replace(/^(ANTWOORD:|Answer:)/i, '')
      .replace(/Je bent een behulpzame.*/gi, '')
      .replace(/CONTEXT.*/gi, '')
      .replace(/INSTRUCTIES.*/gi, '')
      .trim();
  }
}
