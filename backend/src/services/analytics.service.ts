/**
 * ANALYTICS SERVICE - Privacy-compliant in-memory traffic tracker
 * - Geen PII opgeslagen: geen IPs, geen emails, geen usernames
 * - Alleen geanonimiseerde pad-counts en tijdsbuckets
 * - GDPR-vriendelijk: uitsluitend aggregeerde data
 * - Singleton per worker process
 */

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

// ─── Intern state ─────────────────────────────────────────────────────────────

const MAX_HOURLY_BUCKETS = 24;
const ACTIVE_WINDOW_MS = 5 * 60 * 1000;   // 5 minuten
const ACTIVE_WINDOW_SLOTS = 300;           // max slots (1 per seconde, 5 min)

interface State {
  uptimeSince: Date;
  totalRequests: number;
  minuteRequests: number;
  minuteWindowStart: number;
  requestsPerMinute: number;
  recentTimestamps: number[];
  hourlyBuckets: Map<string, HourlyBucket>;
  pageCounts: Map<string, number>;
  todayKey: string;                        // 'YYYY-MM-DD' sleutel voor dag-reset
}

const state: State = {
  uptimeSince: new Date(),
  totalRequests: 0,
  minuteRequests: 0,
  minuteWindowStart: Date.now(),
  requestsPerMinute: 0,
  recentTimestamps: [],
  hourlyBuckets: new Map(),
  pageCounts: new Map(),
  todayKey: new Date().toISOString().slice(0, 10),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getHourKey(date: Date): string {
  return date.toISOString().slice(0, 13); // 'YYYY-MM-DDTHH'
}

function getHourLabel(key: string): string {
  return key.slice(11, 13) + ':00';       // 'HH:00'
}

function getCurrentDayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Anonimiseer een HTTP-pad: verwijder query strings en beperk diepte
 * Nooit persoonlijke IDs doorgeven (bijv. orderID, email)
 */
export function anonymizePath(rawPath: string): string {
  // Verwijder query string (kan PII bevatten)
  const path = rawPath.split('?')[0].split('#')[0];

  // Vervang dynamische UUID/numerieke segmenten met :id
  return path.replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
             .replace(/\/\d{6,}/g, '/:id')
             .replace(/\/[a-z0-9]{20,}/gi, '/:id');
}

// ─── Kernfunctie: record een verzoek ─────────────────────────────────────────

/**
 * Registreer een inkomend verzoek.
 * @param rawPath - Het HTTP-pad (bijv. '/', '/api/v1/products')
 * @param isPublic - true = publieke pagina's, false = API calls
 */
export function recordRequest(rawPath: string, isPublic: boolean): void {
  const now = Date.now();
  const date = new Date(now);

  // ── Dag reset ──────────────────────────────────────────────────────────────
  const dayKey = getCurrentDayKey();
  if (dayKey !== state.todayKey) {
    state.todayKey = dayKey;
    state.pageCounts.clear();
    // Hourlybuckets ouder dan 24h worden al afgekapt in getHourlyBuckets()
  }

  // ── Totalen ───────────────────────────────────────────────────────────────
  state.totalRequests++;

  // ── Minuutvenster ─────────────────────────────────────────────────────────
  if (now - state.minuteWindowStart > 60_000) {
    state.requestsPerMinute = state.minuteRequests;
    state.minuteRequests = 0;
    state.minuteWindowStart = now;
  }
  state.minuteRequests++;

  // ── Actieve bezoekers (5-minuutvenster) ───────────────────────────────────
  state.recentTimestamps.push(now);
  const cutoff = now - ACTIVE_WINDOW_MS;
  // Prune old timestamps (keep array bounded)
  while (state.recentTimestamps.length > ACTIVE_WINDOW_SLOTS) {
    state.recentTimestamps.shift();
  }
  state.recentTimestamps = state.recentTimestamps.filter(t => t >= cutoff);

  // ── Uurlijkse buckets ─────────────────────────────────────────────────────
  const hourKey = getHourKey(date);
  if (!state.hourlyBuckets.has(hourKey)) {
    state.hourlyBuckets.set(hourKey, {
      hour: hourKey,
      label: getHourLabel(hourKey),
      pageViews: 0,
      apiRequests: 0,
    });
  }
  const bucket = state.hourlyBuckets.get(hourKey)!;
  if (isPublic) {
    bucket.pageViews++;
  } else {
    bucket.apiRequests++;
  }

  // ── Paginatelling (alleen publieke routes) ────────────────────────────────
  if (isPublic) {
    const anonPath = anonymizePath(rawPath);
    state.pageCounts.set(anonPath, (state.pageCounts.get(anonPath) ?? 0) + 1);
  }
}

// ─── Snapshot ophalen ─────────────────────────────────────────────────────────

function getHourlyBuckets(): HourlyBucket[] {
  const now = new Date();
  const buckets: HourlyBucket[] = [];

  for (let i = MAX_HOURLY_BUCKETS - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3_600_000);
    const key = getHourKey(d);
    buckets.push(
      state.hourlyBuckets.get(key) ?? {
        hour: key,
        label: getHourLabel(key),
        pageViews: 0,
        apiRequests: 0,
      }
    );
  }

  // Prune buckets ouder dan 25h
  const cutoffKey = getHourKey(new Date(now.getTime() - 25 * 3_600_000));
  for (const k of state.hourlyBuckets.keys()) {
    if (k < cutoffKey) state.hourlyBuckets.delete(k);
  }

  return buckets;
}

export function getSnapshot(): AnalyticsSnapshot {
  const hourlyBuckets = getHourlyBuckets();

  const pageViewsToday = hourlyBuckets
    .filter(b => b.hour.startsWith(state.todayKey))
    .reduce((sum, b) => sum + b.pageViews, 0);

  const apiRequestsToday = hourlyBuckets
    .filter(b => b.hour.startsWith(state.todayKey))
    .reduce((sum, b) => sum + b.apiRequests, 0);

  const topPages: PageStat[] = Array.from(state.pageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  return {
    activeNow: state.recentTimestamps.length,
    requestsPerMinute: state.requestsPerMinute,
    pageViewsToday,
    apiRequestsToday,
    topPages,
    hourlyBuckets,
    uptimeSince: state.uptimeSince.toISOString(),
    totalRequests: state.totalRequests,
  };
}
