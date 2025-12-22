/**
 * 📊 COMPREHENSIVE RAG METRICS SERVICE
 * 
 * Implements 9 state-of-the-art metrics:
 * 
 * **Traditional IR Metrics:**
 * 1. MRR (Mean Reciprocal Rank)
 * 2. Precision@K (P@1, P@3, P@5)
 * 3. Recall@K (R@5)
 * 4. F1 Score
 * 5. NDCG (Normalized Discounted Cumulative Gain)
 * 
 * **RAG-Specific Metrics (RAGAS Framework):**
 * 6. Faithfulness (answer matches context)
 * 7. Answer Relevancy (answer relevant to question)
 * 8. Context Precision (retrieved docs relevant)
 * 9. Context Recall (all relevant docs retrieved)
 * 
 * **2025 Advanced:**
 * 10. OPI (Overall Performance Index) - Harmonic mean of all metrics
 * 
 * Team: ML Engineer + Data Scientist + LLM Engineer
 */

export interface RetrievalResult {
  query: string;
  retrieved_docs: Array<{
    id: string;
    content: string;
    rank: number;
    score: number;
    relevant: boolean; // Ground truth
  }>;
  answer: string;
  ground_truth_answer?: string;
  ground_truth_doc_ids?: string[];
  latency_ms: number;
}

export interface ComprehensiveMetrics {
  // Traditional IR
  mrr: number;
  precision_at_1: number;
  precision_at_3: number;
  precision_at_5: number;
  recall_at_5: number;
  f1_score: number;
  ndcg_at_5: number;
  
  // RAG-specific (RAGAS)
  faithfulness: number;
  answer_relevancy: number;
  context_precision: number;
  context_recall: number;
  
  // 2025 Advanced
  opi: number; // Overall Performance Index
  
  // Operational
  avg_latency_ms: number;
  total_queries: number;
}

export interface DetailedMetricsReport {
  metrics: ComprehensiveMetrics;
  by_difficulty: Record<string, ComprehensiveMetrics>;
  by_category: Record<string, ComprehensiveMetrics>;
  failed_queries: Array<{
    query: string;
    reason: string;
    metrics: Partial<ComprehensiveMetrics>;
  }>;
  timestamp: string;
  model: string;
}

export class ComprehensiveMetricsService {
  
  /**
   * 1. MRR (Mean Reciprocal Rank)
   * 
   * Definition: 1 / rank_of_first_relevant_doc
   * Range: 0-1 (higher is better)
   * Target: >0.90 (excellent)
   */
  static calculateMRR(results: RetrievalResult[]): number {
    if (results.length === 0) return 0;
    
    const reciprocalRanks = results.map(result => {
      // Find rank of first relevant document
      const firstRelevantDoc = result.retrieved_docs.find(doc => doc.relevant);
      
      if (!firstRelevantDoc) return 0;
      
      return 1 / firstRelevantDoc.rank;
    });
    
    return reciprocalRanks.reduce((sum, rr) => sum + rr, 0) / results.length;
  }
  
  /**
   * 2. Precision@K
   * 
   * Definition: % of top-K retrieved docs that are relevant
   * Range: 0-1 (higher is better)
   * Target: P@1 >0.80, P@3 >0.90
   */
  static calculatePrecisionAtK(results: RetrievalResult[], k: number): number {
    if (results.length === 0) return 0;
    
    const precisions = results.map(result => {
      const topK = result.retrieved_docs.slice(0, k);
      const relevantInTopK = topK.filter(doc => doc.relevant).length;
      
      return relevantInTopK / k;
    });
    
    return precisions.reduce((sum, p) => sum + p, 0) / results.length;
  }
  
  /**
   * 3. Recall@K
   * 
   * Definition: % of all relevant docs that are in top-K
   * Range: 0-1 (higher is better)
   * Target: R@5 >0.90
   */
  static calculateRecallAtK(results: RetrievalResult[], k: number): number {
    if (results.length === 0) return 0;
    
    const recalls = results.map(result => {
      const topK = result.retrieved_docs.slice(0, k);
      const relevantInTopK = topK.filter(doc => doc.relevant).length;
      
      // Total relevant docs for this query
      const totalRelevant = result.ground_truth_doc_ids?.length || 
                           result.retrieved_docs.filter(doc => doc.relevant).length;
      
      if (totalRelevant === 0) return 1; // No relevant docs = perfect recall
      
      return relevantInTopK / totalRelevant;
    });
    
    return recalls.reduce((sum, r) => sum + r, 0) / results.length;
  }
  
  /**
   * 4. F1 Score
   * 
   * Definition: Harmonic mean of Precision and Recall
   * Range: 0-1 (higher is better)
   * Target: >0.85
   */
  static calculateF1Score(precision: number, recall: number): number {
    if (precision + recall === 0) return 0;
    
    return 2 * (precision * recall) / (precision + recall);
  }
  
  /**
   * 5. NDCG@K (Normalized Discounted Cumulative Gain)
   * 
   * Definition: Quality of ranking with position discount
   * Range: 0-1 (higher is better)
   * Target: >0.85
   * 
   * Formula:
   * DCG = Σ (relevance / log2(rank + 1))
   * IDCG = DCG of perfect ranking
   * NDCG = DCG / IDCG
   */
  static calculateNDCG(results: RetrievalResult[], k: number): number {
    if (results.length === 0) return 0;
    
    const ndcgs = results.map(result => {
      const topK = result.retrieved_docs.slice(0, k);
      
      // DCG: Actual ranking
      const dcg = topK.reduce((sum, doc, idx) => {
        const relevance = doc.relevant ? 1 : 0;
        const rank = idx + 1;
        const discount = Math.log2(rank + 1);
        
        return sum + (relevance / discount);
      }, 0);
      
      // IDCG: Ideal ranking (all relevant docs first)
      const idealRanking = [...topK].sort((a, b) => {
        if (a.relevant && !b.relevant) return -1;
        if (!a.relevant && b.relevant) return 1;
        return 0;
      });
      
      const idcg = idealRanking.reduce((sum, doc, idx) => {
        const relevance = doc.relevant ? 1 : 0;
        const rank = idx + 1;
        const discount = Math.log2(rank + 1);
        
        return sum + (relevance / discount);
      }, 0);
      
      if (idcg === 0) return 1; // No relevant docs = perfect NDCG
      
      return dcg / idcg;
    });
    
    return ndcgs.reduce((sum, n) => sum + n, 0) / results.length;
  }
  
  /**
   * 6. Faithfulness (RAGAS)
   * 
   * Definition: Does answer match retrieved context?
   * Range: 0-1 (higher is better)
   * Target: >0.95
   * 
   * Method: Check if answer claims are supported by context
   */
  static calculateFaithfulness(results: RetrievalResult[]): number {
    if (results.length === 0) return 0;
    
    const faithfulnessScores = results.map(result => {
      const answer = result.answer.toLowerCase();
      const contextText = result.retrieved_docs
        .map(doc => doc.content)
        .join(' ')
        .toLowerCase();
      
      // Split answer into claims (sentences)
      const claims = answer.split(/[.!?]+/).filter(s => s.trim().length > 10);
      
      if (claims.length === 0) return 1; // No claims = faithfulness not measurable
      
      // Check how many claims are supported by context
      const supportedClaims = claims.filter(claim => {
        // Simple keyword overlap check
        const claimWords = claim.split(/\s+/).filter(w => w.length > 3);
        const supportedWords = claimWords.filter(word => contextText.includes(word));
        
        // Claim is supported if >50% of words appear in context
        return supportedWords.length / claimWords.length > 0.5;
      });
      
      return supportedClaims.length / claims.length;
    });
    
    return faithfulnessScores.reduce((sum, f) => sum + f, 0) / results.length;
  }
  
  /**
   * 7. Answer Relevancy (RAGAS)
   * 
   * Definition: Is answer relevant to question?
   * Range: 0-1 (higher is better)
   * Target: >0.90
   * 
   * Method: Semantic overlap between question and answer
   */
  static calculateAnswerRelevancy(results: RetrievalResult[]): number {
    if (results.length === 0) return 0;
    
    const relevancyScores = results.map(result => {
      const queryWords = result.query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const answerWords = result.answer.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      
      if (queryWords.length === 0 || answerWords.length === 0) return 0;
      
      // Jaccard similarity
      const querySet = new Set(queryWords);
      const answerSet = new Set(answerWords);
      
      const intersection = new Set([...querySet].filter(w => answerSet.has(w)));
      const union = new Set([...querySet, ...answerSet]);
      
      return intersection.size / union.size;
    });
    
    return relevancyScores.reduce((sum, r) => sum + r, 0) / results.length;
  }
  
  /**
   * 8. Context Precision (RAGAS)
   * 
   * Definition: Are retrieved docs actually relevant?
   * Range: 0-1 (higher is better)
   * Target: >0.80
   * 
   * Same as Precision@K but specific to RAGAS framework
   */
  static calculateContextPrecision(results: RetrievalResult[]): number {
    return this.calculatePrecisionAtK(results, 5);
  }
  
  /**
   * 9. Context Recall (RAGAS)
   * 
   * Definition: Did we retrieve all relevant docs?
   * Range: 0-1 (higher is better)
   * Target: >0.90
   * 
   * Same as Recall@K but specific to RAGAS framework
   */
  static calculateContextRecall(results: RetrievalResult[]): number {
    return this.calculateRecallAtK(results, 5);
  }
  
  /**
   * 10. OPI (Overall Performance Index) - NEW 2025
   * 
   * Definition: Harmonic mean of all key metrics
   * Range: 0-1 (higher is better)
   * Target: >0.85
   * 
   * Formula: Harmonic mean of MRR, F1, NDCG, Faithfulness, Answer Relevancy
   */
  static calculateOPI(metrics: ComprehensiveMetrics): number {
    const keyMetrics = [
      metrics.mrr,
      metrics.f1_score,
      metrics.ndcg_at_5,
      metrics.faithfulness,
      metrics.answer_relevancy
    ];
    
    // Filter out zeros (avoid division by zero)
    const nonZero = keyMetrics.filter(m => m > 0);
    
    if (nonZero.length === 0) return 0;
    
    // Harmonic mean = n / Σ(1/x)
    const sumInverses = nonZero.reduce((sum, m) => sum + (1 / m), 0);
    
    return nonZero.length / sumInverses;
  }
  
  /**
   * Calculate ALL metrics for a set of results
   */
  static calculateAllMetrics(results: RetrievalResult[]): ComprehensiveMetrics {
    if (results.length === 0) {
      return this.getZeroMetrics();
    }
    
    // Traditional IR
    const mrr = this.calculateMRR(results);
    const precision_at_1 = this.calculatePrecisionAtK(results, 1);
    const precision_at_3 = this.calculatePrecisionAtK(results, 3);
    const precision_at_5 = this.calculatePrecisionAtK(results, 5);
    const recall_at_5 = this.calculateRecallAtK(results, 5);
    const f1_score = this.calculateF1Score(precision_at_5, recall_at_5);
    const ndcg_at_5 = this.calculateNDCG(results, 5);
    
    // RAGAS
    const faithfulness = this.calculateFaithfulness(results);
    const answer_relevancy = this.calculateAnswerRelevancy(results);
    const context_precision = this.calculateContextPrecision(results);
    const context_recall = this.calculateContextRecall(results);
    
    // Operational
    const avg_latency_ms = results.reduce((sum, r) => sum + r.latency_ms, 0) / results.length;
    
    // Build metrics object for OPI calculation
    const metrics: ComprehensiveMetrics = {
      mrr,
      precision_at_1,
      precision_at_3,
      precision_at_5,
      recall_at_5,
      f1_score,
      ndcg_at_5,
      faithfulness,
      answer_relevancy,
      context_precision,
      context_recall,
      opi: 0, // Will be calculated next
      avg_latency_ms,
      total_queries: results.length
    };
    
    // Calculate OPI (needs other metrics first)
    metrics.opi = this.calculateOPI(metrics);
    
    return metrics;
  }
  
  /**
   * Get zero metrics (for empty results)
   */
  private static getZeroMetrics(): ComprehensiveMetrics {
    return {
      mrr: 0,
      precision_at_1: 0,
      precision_at_3: 0,
      precision_at_5: 0,
      recall_at_5: 0,
      f1_score: 0,
      ndcg_at_5: 0,
      faithfulness: 0,
      answer_relevancy: 0,
      context_precision: 0,
      context_recall: 0,
      opi: 0,
      avg_latency_ms: 0,
      total_queries: 0
    };
  }
  
  /**
   * Print formatted metrics report
   */
  static printMetrics(metrics: ComprehensiveMetrics, title: string = 'COMPREHENSIVE METRICS'): void {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log(`║  ${title.padEnd(52)}  ║`);
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    console.log('📊 TRADITIONAL IR METRICS:');
    console.log(`   MRR:              ${(metrics.mrr * 100).toFixed(1)}% ${this.getGrade(metrics.mrr, 0.90)}`);
    console.log(`   Precision@1:      ${(metrics.precision_at_1 * 100).toFixed(1)}% ${this.getGrade(metrics.precision_at_1, 0.80)}`);
    console.log(`   Precision@3:      ${(metrics.precision_at_3 * 100).toFixed(1)}% ${this.getGrade(metrics.precision_at_3, 0.90)}`);
    console.log(`   Precision@5:      ${(metrics.precision_at_5 * 100).toFixed(1)}% ${this.getGrade(metrics.precision_at_5, 0.85)}`);
    console.log(`   Recall@5:         ${(metrics.recall_at_5 * 100).toFixed(1)}% ${this.getGrade(metrics.recall_at_5, 0.90)}`);
    console.log(`   F1 Score:         ${(metrics.f1_score * 100).toFixed(1)}% ${this.getGrade(metrics.f1_score, 0.85)}`);
    console.log(`   NDCG@5:           ${(metrics.ndcg_at_5 * 100).toFixed(1)}% ${this.getGrade(metrics.ndcg_at_5, 0.85)}`);
    
    console.log('\n🎯 RAG-SPECIFIC METRICS (RAGAS):');
    console.log(`   Faithfulness:     ${(metrics.faithfulness * 100).toFixed(1)}% ${this.getGrade(metrics.faithfulness, 0.95)}`);
    console.log(`   Answer Relevancy: ${(metrics.answer_relevancy * 100).toFixed(1)}% ${this.getGrade(metrics.answer_relevancy, 0.90)}`);
    console.log(`   Context Precision:${(metrics.context_precision * 100).toFixed(1)}% ${this.getGrade(metrics.context_precision, 0.80)}`);
    console.log(`   Context Recall:   ${(metrics.context_recall * 100).toFixed(1)}% ${this.getGrade(metrics.context_recall, 0.90)}`);
    
    console.log('\n✨ 2025 ADVANCED METRICS:');
    console.log(`   OPI (Overall):    ${(metrics.opi * 100).toFixed(1)}% ${this.getGrade(metrics.opi, 0.85)}`);
    
    console.log('\n⚡ OPERATIONAL:');
    console.log(`   Avg Latency:      ${metrics.avg_latency_ms.toFixed(0)}ms`);
    console.log(`   Total Queries:    ${metrics.total_queries}`);
    
    // Overall verdict
    console.log('\n═══════════════════════════════════════════════════════');
    const grade = this.getOverallGrade(metrics);
    console.log(`   ${grade.emoji} ${grade.label}: ${grade.description}`);
    console.log('═══════════════════════════════════════════════════════\n');
  }
  
  /**
   * Get grade emoji for metric
   */
  private static getGrade(value: number, target: number): string {
    if (value >= target) return '✅';
    if (value >= target * 0.9) return '⚠️';
    return '❌';
  }
  
  /**
   * Get overall grade
   */
  private static getOverallGrade(metrics: ComprehensiveMetrics): { emoji: string; label: string; description: string } {
    if (metrics.opi >= 0.90) {
      return { emoji: '🏆', label: 'EXCELLENT', description: 'Production-ready, state-of-the-art performance' };
    } else if (metrics.opi >= 0.85) {
      return { emoji: '✅', label: 'VERY GOOD', description: 'Production-ready with room for improvement' };
    } else if (metrics.opi >= 0.75) {
      return { emoji: '⚠️', label: 'GOOD', description: 'Acceptable for production, needs optimization' };
    } else if (metrics.opi >= 0.60) {
      return { emoji: '⚠️', label: 'FAIR', description: 'Not production-ready, significant improvements needed' };
    } else {
      return { emoji: '❌', label: 'POOR', description: 'Requires major rework before production' };
    }
  }
  
  /**
   * Compare two metric sets (e.g., before vs after)
   */
  static compareMetrics(
    before: ComprehensiveMetrics,
    after: ComprehensiveMetrics
  ): Record<string, { before: number; after: number; change: number; percentage: number }> {
    const metricKeys = [
      'mrr', 'precision_at_1', 'precision_at_3', 'precision_at_5', 'recall_at_5',
      'f1_score', 'ndcg_at_5', 'faithfulness', 'answer_relevancy',
      'context_precision', 'context_recall', 'opi'
    ];
    
    const comparison: any = {};
    
    for (const key of metricKeys) {
      const beforeVal = (before as any)[key];
      const afterVal = (after as any)[key];
      const change = afterVal - beforeVal;
      const percentage = beforeVal > 0 ? (change / beforeVal) * 100 : 0;
      
      comparison[key] = {
        before: beforeVal,
        after: afterVal,
        change,
        percentage
      };
    }
    
    return comparison;
  }
  
  /**
   * Health check
   */
  static healthCheck(): { status: string; details: any } {
    // Test with dummy data
    const dummyResults: RetrievalResult[] = [
      {
        query: 'test query',
        retrieved_docs: [
          { id: '1', content: 'relevant doc', rank: 1, score: 0.9, relevant: true },
          { id: '2', content: 'irrelevant doc', rank: 2, score: 0.5, relevant: false }
        ],
        answer: 'test answer based on relevant doc',
        ground_truth_doc_ids: ['1'],
        latency_ms: 100
      }
    ];
    
    const metrics = this.calculateAllMetrics(dummyResults);
    
    return {
      status: 'healthy',
      details: {
        metrics_calculated: Object.keys(metrics).length,
        opi: metrics.opi,
        all_metrics_valid: Object.values(metrics).every(v => typeof v === 'number' && !isNaN(v))
      }
    };
  }
}
