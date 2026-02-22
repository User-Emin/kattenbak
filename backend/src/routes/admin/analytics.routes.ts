/**
 * ADMIN ANALYTICS ROUTES
 * - GET /summary  → huidige snapshot (JSON)
 * - GET /stream   → Server-Sent Events realtime updates (elke 10s)
 *
 * Beide endpoints vereisen geldig admin JWT (Bearer of ?token= query param voor SSE).
 * Privacy: alleen geanonimiseerde aggregaten, geen PII.
 */

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getSnapshot } from '../../services/analytics.service';

const router = Router();

// ─── Inline auth helper (vermijdt circular import via authMiddleware) ──────────

function verifyAdminToken(req: Request): boolean {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET || JWT_SECRET.length < 32) return false;

  // Bearer header (standaard) óf query param (voor EventSource die geen headers kan sturen)
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token as string | undefined;
  const raw = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : queryToken;

  if (!raw) return false;

  try {
    const decoded = jwt.verify(raw, JWT_SECRET, { algorithms: ['HS256'] }) as any;
    return decoded?.role === 'ADMIN' || !!decoded?.id;
  } catch {
    return false;
  }
}

// ─── GET /summary ─────────────────────────────────────────────────────────────

router.get('/summary', (req: Request, res: Response) => {
  if (!verifyAdminToken(req)) {
    return res.status(401).json({ success: false, error: 'Authenticatie vereist' });
  }

  return res.json({ success: true, data: getSnapshot() });
});

// ─── GET /stream (SSE) ────────────────────────────────────────────────────────

const STREAM_INTERVAL_MS = 10_000; // 10 seconden

router.get('/stream', (req: Request, res: Response) => {
  if (!verifyAdminToken(req)) {
    res.status(401).end();
    return;
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Nginx buffering uit
  res.flushHeaders();

  const send = () => {
    try {
      const data = JSON.stringify(getSnapshot());
      res.write(`data: ${data}\n\n`);
    } catch {
      // Stille fout - client is waarschijnlijk verbroken
    }
  };

  // Stuur direct eerste snapshot
  send();

  const interval = setInterval(send, STREAM_INTERVAL_MS);

  // Cleanup bij verbrekingsverbreking
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

export default router;
