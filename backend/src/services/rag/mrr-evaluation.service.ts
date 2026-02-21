/**
 * MRR EVALUATION SERVICE
 * Mean Reciprocal Rank for RAG Quality
 * Team: ML Engineer + Data Scientist
 */

import { EnhancedRAGPipelineService } from './enhanced-rag-pipeline.service';

interface EvaluationQuestion {
  question: string;
  expected_keywords: string[];
  category: 'product' | 'safety' | 'technical' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
}

interface EvaluationResult {
  question: string;
  answer: string;
  expected_keywords: string[];
  found_keywords: string[];
  reciprocal_rank: number;
  latency_ms: number;
  sources_count: number;
  category: string;
  difficulty: string;
  passed: boolean;
  score: number;
}

interface MRRReport {
  mrr: number;
  total_questions: number;
  passed: number;
  failed: number;
  avg_latency_ms: number;
  avg_sources: number;
  by_category: Record<string, { mrr: number; count: number }>;
  by_difficulty: Record<string, { mrr: number; count: number }>;
  failed_questions: Array<{
    question: string;
    reason: string;
    expected: string[];
    found: string[];
  }>;
}

export class MRREvaluationService {
  
  /**
   * Standard evaluation questions (20+)
   */
  private static readonly EVAL_QUESTIONS: EvaluationQuestion[] = [
    // === EASY (10 questions) ===
    {
      question: "Hoeveel liter is de afvalbak?",
      expected_keywords: ["10.5", "liter", "groot"],
      category: "product",
      difficulty: "easy"
    },
    {
      question: "Heeft het een app?",
      expected_keywords: ["app", "ios", "android"],
      category: "product",
      difficulty: "easy"
    },
    {
      question: "Is het veilig?",
      expected_keywords: ["veilig", "sensor", "detectie"],
      category: "safety",
      difficulty: "easy"
    },
    {
      question: "Hoeveel lawaai maakt het?",
      expected_keywords: ["40", "decibel", "stil"],
      category: "technical",
      difficulty: "easy"
    },
    {
      question: "Werkt het automatisch?",
      expected_keywords: ["automatisch", "zelf", "reinig"],
      category: "product",
      difficulty: "easy"
    },
    {
      question: "Geschikt voor grote kat?",
      expected_keywords: ["grote", "kat", "afmeting", "ruim"],
      category: "product",
      difficulty: "easy"
    },
    {
      question: "Kan ik 2 katten gebruiken?",
      expected_keywords: ["2", "twee", "meerdere", "kat"],
      category: "product",
      difficulty: "easy"
    },
    {
      question: "Hoe vaak moet ik legen?",
      expected_keywords: ["7", "10", "dag", "legen"],
      category: "product",
      difficulty: "easy"
    },
    {
      question: "Makkelijk schoon te maken?",
      expected_keywords: ["makkelijk", "demonteren", "schoon"],
      category: "product",
      difficulty: "easy"
    },
    {
      question: "Welke vulling gebruiken?",
      expected_keywords: ["klonterende", "vulling", "kattenbakvulling"],
      category: "product",
      difficulty: "easy"
    },
    
    // === MEDIUM (7 questions) ===
    {
      question: "Hoe werken de veiligheidssensoren precies?",
      expected_keywords: ["dubbel", "sensor", "onmiddellijk", "stop"],
      category: "safety",
      difficulty: "medium"
    },
    {
      question: "Wat zijn de afmetingen en past het in kleine ruimte?",
      expected_keywords: ["afmeting", "ruimte", "compact"],
      category: "technical",
      difficulty: "medium"
    },
    {
      question: "Hoe lang duurt een reinigingscyclus?",
      expected_keywords: ["cyclus", "minuten", "tijd"],
      category: "technical",
      difficulty: "medium"
    },
    {
      question: "Welke onderdelen zijn vervangbaar?",
      expected_keywords: ["onderdelen", "vervang", "modulair"],
      category: "product",
      difficulty: "medium"
    },
    {
      question: "Hoe krijg ik meldingen van de app?",
      expected_keywords: ["app", "melding", "notificatie"],
      category: "product",
      difficulty: "medium"
    },
    {
      question: "Is het energiezuinig?",
      expected_keywords: ["energie", "stroom", "verbruik"],
      category: "technical",
      difficulty: "medium"
    },
    {
      question: "Kan mijn kitten het ook gebruiken?",
      expected_keywords: ["kitten", "klein", "kat", "gewicht"],
      category: "product",
      difficulty: "medium"
    },
    
    // === HARD (5 questions) ===
    {
      question: "Wat gebeurt er als kat tijdens reiniging naar binnen gaat?",
      expected_keywords: ["sensor", "detecteert", "stop", "veilig"],
      category: "safety",
      difficulty: "hard"
    },
    {
      question: "Vergelijk voor- en nadelen versus normale kattenbak",
      expected_keywords: ["automatisch", "tijd", "hygiënisch", "investering"],
      category: "general",
      difficulty: "hard"
    },
    {
      question: "Wat als stroom uitvalt?",
      expected_keywords: ["stroom", "backup", "handmatig"],
      category: "technical",
      difficulty: "hard"
    },
    {
      question: "Welke garantie krijg ik en wat dekt deze?",
      expected_keywords: ["garantie", "jaar", "dekt"],
      category: "product",
      difficulty: "hard"
    },
    {
      question: "Hoe lang duurt aanpassen voor bang kat?",
      expected_keywords: ["aanpassen", "wennen", "tijd", "kat"],
      category: "general",
      difficulty: "hard"
    }
  ];
  
  /**
   * Calculate reciprocal rank for a single answer
   */
  private static calculateReciprocalRank(
    answer: string, 
    expectedKeywords: string[]
  ): number {
    const answerLower = answer.toLowerCase();
    
    // Find first matching keyword position
    let firstMatchPosition = Infinity;
    let matchedCount = 0;
    
    for (const keyword of expectedKeywords) {
      const keywordLower = keyword.toLowerCase();
      const position = answerLower.indexOf(keywordLower);
      
      if (position !== -1) {
        matchedCount++;
        if (position < firstMatchPosition) {
          firstMatchPosition = position;
        }
      }
    }
    
    // No matches = 0
    if (matchedCount === 0) {
      return 0;
    }
    
    // Reciprocal rank based on:
    // 1. Coverage: % of keywords found
    // 2. Position: How early in answer
    const coverage = matchedCount / expectedKeywords.length;
    const positionScore = firstMatchPosition === 0 ? 1 : 1 / (1 + Math.log10(firstMatchPosition + 1));
    
    return coverage * positionScore;
  }
  
  /**
   * Evaluate single question
   */
  static async evaluateQuestion(
    evalQ: EvaluationQuestion
  ): Promise<EvaluationResult> {
    try {
      // Get answer from the active RAG pipeline
      const result = await EnhancedRAGPipelineService.query({
        query: evalQ.question
      });
      const latency = result.metadata?.latency_ms || result.pipeline_metadata?.latency_breakdown.total_ms || 0;
      
      // Calculate MRR
      const rr = this.calculateReciprocalRank(result.answer || '', evalQ.expected_keywords);
      
      // Find which keywords were found
      const foundKeywords = evalQ.expected_keywords.filter(keyword =>
        (result.answer || '').toLowerCase().includes(keyword.toLowerCase())
      );
      
      // Pass threshold: RR > 0.5 OR at least 50% keywords found
      const keywordCoverage = foundKeywords.length / evalQ.expected_keywords.length;
      const passed = rr > 0.5 || keywordCoverage >= 0.5;
      
      return {
        question: evalQ.question,
        answer: result.answer || '',
        expected_keywords: evalQ.expected_keywords,
        found_keywords: foundKeywords,
        reciprocal_rank: rr,
        latency_ms: latency,
        sources_count: result.sources?.length || 0,
        category: evalQ.category,
        difficulty: evalQ.difficulty,
        passed,
        score: rr
      };
      
    } catch (error: any) {
      console.error(`Evaluation failed for: "${evalQ.question}"`, error.message);
      
      return {
        question: evalQ.question,
        answer: `ERROR: ${error.message}`,
        expected_keywords: evalQ.expected_keywords,
        found_keywords: [],
        reciprocal_rank: 0,
        latency_ms: 0,
        sources_count: 0,
        category: evalQ.category,
        difficulty: evalQ.difficulty,
        passed: false,
        score: 0
      };
    }
  }
  
  /**
   * Run full evaluation suite
   */
  static async runFullEvaluation(
    questions?: EvaluationQuestion[]
  ): Promise<MRRReport> {
    const questionsToEval = questions || this.EVAL_QUESTIONS;
    console.log(`\n🧪 Starting MRR Evaluation (${questionsToEval.length} questions)...\n`);
    
    const results: EvaluationResult[] = [];
    
    // Evaluate each question (sequential to avoid rate limits)
    for (let i = 0; i < questionsToEval.length; i++) {
      const evalQ = questionsToEval[i];
      console.log(`[${i + 1}/${questionsToEval.length}] ${evalQ.question}`);
      
      const result = await this.evaluateQuestion(evalQ);
      results.push(result);
      
      console.log(`   → RR: ${result.reciprocal_rank.toFixed(3)} | ` +
                  `Keywords: ${result.found_keywords.length}/${result.expected_keywords.length} | ` +
                  `${result.passed ? '✅ PASS' : '❌ FAIL'}`);
      
      // Respect Claude rate limit: 5 req/min = 12s per call.
      // Each question uses up to 2 calls (rewrite + generation) → 25s minimum between questions.
      if (i < questionsToEval.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 25000));
      }
    }
    
    // Calculate overall MRR
    const totalRR = results.reduce((sum, r) => sum + r.reciprocal_rank, 0);
    const mrr = totalRR / results.length;
    
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    
    const avgLatency = results.reduce((sum, r) => sum + r.latency_ms, 0) / results.length;
    const avgSources = results.reduce((sum, r) => sum + r.sources_count, 0) / results.length;
    
    // By category
    const byCategory: Record<string, { mrr: number; count: number }> = {};
    for (const result of results) {
      if (!byCategory[result.category]) {
        byCategory[result.category] = { mrr: 0, count: 0 };
      }
      byCategory[result.category].mrr += result.reciprocal_rank;
      byCategory[result.category].count++;
    }
    for (const cat in byCategory) {
      byCategory[cat].mrr /= byCategory[cat].count;
    }
    
    // By difficulty
    const byDifficulty: Record<string, { mrr: number; count: number }> = {};
    for (const result of results) {
      if (!byDifficulty[result.difficulty]) {
        byDifficulty[result.difficulty] = { mrr: 0, count: 0 };
      }
      byDifficulty[result.difficulty].mrr += result.reciprocal_rank;
      byDifficulty[result.difficulty].count++;
    }
    for (const diff in byDifficulty) {
      byDifficulty[diff].mrr /= byDifficulty[diff].count;
    }
    
    // Failed questions
    const failedQuestions = results
      .filter(r => !r.passed)
      .map(r => ({
        question: r.question,
        reason: r.reciprocal_rank === 0 ? 'No keywords found' : 'Low relevance',
        expected: r.expected_keywords,
        found: r.found_keywords
      }));
    
    return {
      mrr,
      total_questions: results.length,
      passed,
      failed,
      avg_latency_ms: avgLatency,
      avg_sources: avgSources,
      by_category: byCategory,
      by_difficulty: byDifficulty,
      failed_questions: failedQuestions
    };
  }
  
  /**
   * Print formatted report
   */
  static printReport(report: MRRReport): void {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║        MRR EVALUATION REPORT                   ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    
    console.log(`📊 OVERALL METRICS:`);
    console.log(`   MRR Score:       ${(report.mrr * 100).toFixed(1)}%`);
    console.log(`   Total Questions: ${report.total_questions}`);
    console.log(`   Passed:          ${report.passed} ✅`);
    console.log(`   Failed:          ${report.failed} ❌`);
    console.log(`   Pass Rate:       ${((report.passed / report.total_questions) * 100).toFixed(1)}%`);
    console.log(`   Avg Latency:     ${report.avg_latency_ms.toFixed(0)}ms`);
    console.log(`   Avg Sources:     ${report.avg_sources.toFixed(1)}`);
    
    console.log(`\n📈 BY CATEGORY:`);
    for (const [cat, data] of Object.entries(report.by_category)) {
      console.log(`   ${cat.padEnd(12)}: MRR ${(data.mrr * 100).toFixed(1)}% (${data.count} questions)`);
    }
    
    console.log(`\n🎯 BY DIFFICULTY:`);
    for (const [diff, data] of Object.entries(report.by_difficulty)) {
      console.log(`   ${diff.padEnd(8)}: MRR ${(data.mrr * 100).toFixed(1)}% (${data.count} questions)`);
    }
    
    if (report.failed_questions.length > 0) {
      console.log(`\n❌ FAILED QUESTIONS (${report.failed_questions.length}):`);
      report.failed_questions.forEach((fq, i) => {
        console.log(`   ${i + 1}. ${fq.question}`);
        console.log(`      Reason: ${fq.reason}`);
        console.log(`      Expected: [${fq.expected.join(', ')}]`);
        console.log(`      Found: [${fq.found.join(', ') || 'none'}]`);
      });
    }
    
    // Verdict
    console.log('\n═══════════════════════════════════════════════════');
    if (report.mrr >= 0.90) {
      console.log('✅ EXCELLENT - Production ready!');
    } else if (report.mrr >= 0.75) {
      console.log('⚠️  GOOD - Acceptable for production');
    } else if (report.mrr >= 0.60) {
      console.log('⚠️  FAIR - Needs improvement');
    } else {
      console.log('❌ POOR - Requires significant work');
    }
    console.log('═══════════════════════════════════════════════════\n');
  }
  
  /**
   * Quick health check (3 questions)
   */
  static async quickCheck(): Promise<{ passed: boolean; mrr: number }> {
    const quickQuestions: EvaluationQuestion[] = [
      this.EVAL_QUESTIONS[0], // Liter
      this.EVAL_QUESTIONS[1], // App
      this.EVAL_QUESTIONS[2]  // Veilig
    ];
    
    const report = await this.runFullEvaluation(quickQuestions);
    return {
      passed: report.mrr >= 0.75,
      mrr: report.mrr
    };
  }
}
