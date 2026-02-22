/**
 * ANALYTICS SERVICE - Privacy-compliant in-memory traffic tracker
 * - Geen PII opgeslagen: geen IPs, geen emails, geen usernames
 * - Alleen geanonimiseerde pad-counts en tijdsbuckets
 * - GDPR-vriendelijk: uitsluitend aggregeerde data
 * - Multi-worker aggregatie via gedeeld bestandssysteem
 */

import { writeFileSync, readdirSync, readFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HourlyBucket {
  hour: string;       // 'YYYY-MM-DDTHH' formaat
  label: string;      // 'HH:00' voor weergave
  pageViews: number;
  apiRequests: number;
}

export interface PageStat {
  path: string;
  count: number;
}

export interface AnalyticsSnapshot {
  activeNow: number;           // verzoeken in laatste 5 minuten
  requestsPerMinute: number;   // verzoeken in afgelopen minuut
  pageViewsToday: number;      // totale paginaviews vandaag
  apiRequestsToday: number;    // totale API requests vandaag
  topPages: PageStat[];        // top 10 meest bezochte paden (vandaag)
  hourlyBuckets: HourlyBucket[]; // laatste 24 uur per uur
  uptimeSince: string;         // ISO timestamp start analytics
  totalRequests: number;       // totaal verzoeken seit start
}

// ─── Intern state per worker ──────────────────────────────────────────────────

const MAX_HOURLY_BUCKETS = 24;
const ACTIVE_WINDOW_MS = 5 * 60 * 1000;
const PERSIST_INTERVAL_MS = 15_000; // schrijf state elke 15s naar schijf

// Gedeeld analytics directory (alle workers lezen/schrijven hier)
const ANALYTICS_DIR = process.env.ANALYTICS_DIR || '/tmp/kattenbak-analytics';
const WORKER_FILE = join(ANALYTICS_DIR, `worker_${process.pid}.json`);

interface WorkerState {
  pid: number;
  uptimeSince: string;
  totalRequests: number;
  minuteRequests: number;
  minuteWindowStart: number;
  requestsPerMinute: number;
  recentTimestamps: number[];
  hourlyBuckets: Record<string, HourlyBucket>;
  pageCounts: Record<string, number>;
  todayKey: string;
  lastUpdated: number;
}

const state: WorkerState = {
  pid: process.pid,
  uptimeSince: new Date().toISOString(),
  totalRequests: 0,
  minuteRequests: 0,
  minuteWindowStart: Date.now(),
  requestsPerMinute: 0,
  recentTimestamps: [],
  hourlyBuckets: {},
  pageCounts: {},
  todayKey: new Date().toISOString().slice(0, 10),
  lastUpdated: Date.now(),
};

// Zorg dat analytics directory bestaat
try {
  if (!existsSync(ANALYTICS_DIR)) mkdirSync(ANALYTICS_DIR, { recursive: true });
} catch {
  // Directory aanmaken mislukt - analytics draait alleen in-memory
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getHourKey(date: Date): string {
  return date.toISOString().slice(0, 13);
}

function getHourLabel(key: string): string {
  return key.slice(11, 13) + ':00';
}

function getCurrentDayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function anonymizePath(rawPath: string): string {
  const path = rawPath.split('?')[0].split('#')[0];
  return path
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
    .replace(/\/\d{6,}/g, '/:id')
    .replace(/\/[a-z0-9]{20,}/gi, '/:id');
}

// ─── Persistentie ─────────────────────────────────────────────────────────────

function persistState(): void {
  try {
    const tmp = WORKER_FILE + '.tmp';
    writeFileSync(tmp, JSON.stringify(state), 'utf8');
    // Atomische rename (POSIX garanteert atomiciteit)
    const { renameSync } = require('fs');
    renameSync(tmp, WORKER_FILE);
  } catch {
    // Stille fout - analytics blijft in-memory werken
  }
}

// Periodiek persisteren
setInterval(persistState, PERSIST_INTERVAL_MS).unref();

// Cleanup eigen worker file bij afsluiten
process.on('exit', () => {
  try { if (existsSync(WORKER_FILE)) unlinkSync(WORKER_FILE); } catch { /* ignore */ }
});

// ─── Kernfunctie: registreer een verzoek ──────────────────────────────────────

export function recordRequest(rawPath: string, isPublic: boolean): void {
  const now = Date.now();
  const date = new Date(now);

  // Dag reset
  const dayKey = getCurrentDayKey();
  if (dayKey !== state.todayKey) {
    state.todayKey = dayKey;
    state.pageCounts = {};
  }

  state.totalRequests++;
  state.lastUpdated = now;

  // Minuutvenster
  if (now - state.minuteWindowStart > 60_000) {
    state.requestsPerMinute = state.minuteRequests;
    state.minuteRequests = 0;
    state.minuteWindowStart = now;
  }
  state.minuteRequests++;

  // Actieve bezoekers (5-min venster)
  state.recentTimestamps.push(now);
  const cutoff = now - ACTIVE_WINDOW_MS;
  if (state.recentTimestamps.length > 600) {
    state.recentTimestamps = state.recentTimestamps.filter(t => t >= cutoff);
  }

  // Uurlijkse buckets
  const hourKey = getHourKey(date);
  if (!state.hourlyBuckets[hourKey]) {
    state.hourlyBuckets[hourKey] = {
      hour: hourKey,
      label: getHourLabel(hourKey),
      pageViews: 0,
      apiRequests: 0,
    };
  }
  if (isPublic) {
    state.hourlyBuckets[hourKey].pageViews++;
  } else {
    state.hourlyBuckets[hourKey].apiRequests++;
  }

  // Paginatelling
  if (isPublic) {
    const anonPath = anonymizePath(rawPath);
    state.pageCounts[anonPath] = (state.pageCounts[anonPath] ?? 0) + 1;
  }
}

// ─── Multi-worker aggregatie ──────────────────────────────────────────────────

function readAllWorkerStates(): WorkerState[] {
  const states: WorkerState[] = [state]; // Eigen worker altijd meenemen

  try {
    const files = readdirSync(ANALYTICS_DIR).filter(
      f => f.startsWith('worker_') && f.endsWith('.json') && f !== `worker_${process.pid}.json`
    );

    const staleThreshold = Date.now() - 60_000; // Bestanden ouder dan 1 min overslaan

    for (const file of files) {
      try {
        const content = readFileSync(join(ANALYTICS_DIR, file), 'utf8');
        const ws: WorkerState = JSON.parse(content);
        if (ws.lastUpdated > staleThreshold) {
          states.push(ws);
        } else {
          // Verwijder verouderd worker bestand
          try { unlinkSync(join(ANALYTICS_DIR, file)); } catch { /* ignore */ }
        }
      } catch {
        // Corrupt bestand - overslaan
      }
    }
  } catch {
    // Directory leesbaar mislukt - alleen eigen state teruggeven
  }

  return states;
}

// ─── Snapshot ophalen (geaggregeerd over alle workers) ────────────────────────

function buildHourlyBuckets(workerStates: WorkerState[]): HourlyBucket[] {
  const now = new Date();
  const aggregated: Record<string, HourlyBucket> = {};

  // Initialiseer laatste 24 uur
  for (let i = MAX_HOURLY_BUCKETS - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3_600_000);
    const key = getHourKey(d);
    aggregated[key] = { hour: key, label: getHourLabel(key), pageViews: 0, apiRequests: 0 };
  }

  // Aggregeer over alle workers
  for (const ws of workerStates) {
    for (const [key, bucket] of Object.entries(ws.hourlyBuckets)) {
      if (aggregated[key]) {
        aggregated[key].pageViews += bucket.pageViews;
        aggregated[key].apiRequests += bucket.apiRequests;
      }
    }
  }

  return Object.values(aggregated).sort((a, b) => a.hour.localeCompare(b.hour));
}

export function getSnapshot(): AnalyticsSnapshot {
  // Persisteer eigen state zodat andere workers er bij kunnen
  persistState();

  const workerStates = readAllWorkerStates();
  const hourlyBuckets = buildHourlyBuckets(workerStates);
  const todayKey = getCurrentDayKey();

  const pageViewsToday = hourlyBuckets
    .filter(b => b.hour.startsWith(todayKey))
    .reduce((sum, b) => sum + b.pageViews, 0);

  const apiRequestsToday = hourlyBuckets
    .filter(b => b.hour.startsWith(todayKey))
    .reduce((sum, b) => sum + b.apiRequests, 0);

  // Aggregeer pageCounts over alle workers
  const aggregatedPages: Record<string, number> = {};
  for (const ws of workerStates) {
    for (const [path, count] of Object.entries(ws.pageCounts)) {
      aggregatedPages[path] = (aggregatedPages[path] ?? 0) + count;
    }
  }
  const topPages: PageStat[] = Object.entries(aggregatedPages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  // Aggregeer realtime metrics
  const now = Date.now();
  const cutoff = now - ACTIVE_WINDOW_MS;
  const activeNow = workerStates.reduce(
    (sum, ws) => sum + ws.recentTimestamps.filter(t => t >= cutoff).length,
    0
  );
  const requestsPerMinute = workerStates.reduce((sum, ws) => sum + ws.requestsPerMinute, 0);
  const totalRequests = workerStates.reduce((sum, ws) => sum + ws.totalRequests, 0);

  return {
    activeNow,
    requestsPerMinute,
    pageViewsToday,
    apiRequestsToday,
    topPages,
    hourlyBuckets,
    uptimeSince: state.uptimeSince,
    totalRequests,
  };
}
