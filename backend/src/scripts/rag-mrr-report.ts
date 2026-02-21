// Must be first import so dotenv loads .env before any service reads process.env
import '../config/env.config';
import { MRREvaluationService } from '../services/rag/mrr-evaluation.service';

const main = async () => {
  const report = await MRREvaluationService.runFullEvaluation();
  MRREvaluationService.printReport(report);

  // JSON summary for automation/logs
  console.log(JSON.stringify({
    mrr: report.mrr,
    total_questions: report.total_questions,
    passed: report.passed,
    failed: report.failed,
    avg_latency_ms: report.avg_latency_ms,
    avg_sources: report.avg_sources,
    by_category: report.by_category,
    by_difficulty: report.by_difficulty,
    failed_questions: report.failed_questions
  }));
};

main().catch((error) => {
  console.error('MRR evaluation failed:', error?.message || error);
  process.exit(1);
});
