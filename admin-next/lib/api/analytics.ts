/**
 * ANALYTICS API CLIENT - DRY & Type-Safe
 * Haalt realtime traffic snapshots op via REST of SSE stream
 */

import { apiClient } from './client';

// ─── Types (gesynchroniseerd met backend analytics.service.ts) ────────────────

export interface HourlyBucket {
  hour: string;
  label: string;
  pageViews: number;
  apiRequests: number;
}

export interface PageStat {
  path: string;
  count: number;
}

export interface AnalyticsSnapshot {
  activeNow: number;
  requestsPerMinute: number;
  pageViewsToday: number;
  apiRequestsToday: number;
  topPages: PageStat[];
  hourlyBuckets: HourlyBucket[];
  uptimeSince: string;
  totalRequests: number;
}

// ─── REST snapshot ────────────────────────────────────────────────────────────

export async function getAnalyticsSummary(): Promise<AnalyticsSnapshot> {
  const response = await apiClient.get<{ success: boolean; data: AnalyticsSnapshot }>(
    '/admin/analytics/summary'
  );
  return response.data.data;
}

// ─── SSE stream URL (token via query param voor native EventSource) ───────────

export function getAnalyticsStreamUrl(): string {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('admin_token') ?? ''
    : '';

  // Bepaal base URL via zelfde logica als apiClient
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  let base: string;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    base = process.env.NEXT_PUBLIC_API_URL
      ? (process.env.NEXT_PUBLIC_API_URL.endsWith('/api/v1')
          ? process.env.NEXT_PUBLIC_API_URL
          : `${process.env.NEXT_PUBLIC_API_URL}/api/v1`)
      : 'http://localhost:3101/api/v1';
  } else {
    base = `${window.location.protocol}//${hostname}/api/v1`;
  }

  return `${base}/admin/analytics/stream?token=${encodeURIComponent(token)}`;
}
