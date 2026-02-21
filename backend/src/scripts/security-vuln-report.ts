import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { EmailService } from '../services/email.service';
import { env } from '../config/env.config';

const execFileAsync = promisify(execFile);

type AuditReport = {
  metadata?: {
    vulnerabilities?: {
      info?: number;
      low?: number;
      moderate?: number;
      high?: number;
      critical?: number;
      total?: number;
    };
  };
};

const buildSummary = (report: AuditReport) => {
  const v = report.metadata?.vulnerabilities ?? {};
  const info = v.info ?? 0;
  const low = v.low ?? 0;
  const moderate = v.moderate ?? 0;
  const high = v.high ?? 0;
  const critical = v.critical ?? 0;
  const total = v.total ?? info + low + moderate + high + critical;

  return { info, low, moderate, high, critical, total };
};

const formatText = (summary: ReturnType<typeof buildSummary>, cwd: string) => {
  return [
    'Security dependency audit (production only).',
    `Path: ${cwd}`,
    `Total: ${summary.total}`,
    `Critical: ${summary.critical}`,
    `High: ${summary.high}`,
    `Moderate: ${summary.moderate}`,
    `Low: ${summary.low}`,
    `Info: ${summary.info}`,
  ].join('\n');
};

const formatHtml = (summary: ReturnType<typeof buildSummary>, cwd: string) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Security dependency audit (production only)</h2>
      <p><strong>Path:</strong> ${cwd}</p>
      <ul>
        <li><strong>Total:</strong> ${summary.total}</li>
        <li><strong>Critical:</strong> ${summary.critical}</li>
        <li><strong>High:</strong> ${summary.high}</li>
        <li><strong>Moderate:</strong> ${summary.moderate}</li>
        <li><strong>Low:</strong> ${summary.low}</li>
        <li><strong>Info:</strong> ${summary.info}</li>
      </ul>
    </div>
  `;
};

const runAudit = async () => {
  const repoRoot = path.resolve(__dirname, '..', '..', '..');
  const { stdout } = await execFileAsync(
    'npm',
    ['audit', '--omit=dev', '--json'],
    { cwd: repoRoot, maxBuffer: 10 * 1024 * 1024 }
  );

  const report = stdout ? (JSON.parse(stdout) as AuditReport) : {};
  const summary = buildSummary(report);

  return { summary, cwd: repoRoot };
};

const main = async () => {
  const targetEmail = env.SECURITY_ALERT_EMAIL || env.ADMIN_EMAIL;
  if (!targetEmail || !targetEmail.includes('@')) {
    throw new Error('SECURITY_ALERT_EMAIL or ADMIN_EMAIL not configured');
  }

  const { summary, cwd } = await runAudit();
  const subject = summary.total > 0
    ? `Security alert: ${summary.total} production vulnerabilities`
    : 'Security check OK: no production vulnerabilities';

  await EmailService.send({
    to: targetEmail,
    subject,
    text: formatText(summary, cwd),
    html: formatHtml(summary, cwd),
  });
};

main().catch((error) => {
  // Avoid leaking secrets in logs; only log message.
  console.error('Security audit mailer failed:', error?.message || error);
  process.exit(1);
});
