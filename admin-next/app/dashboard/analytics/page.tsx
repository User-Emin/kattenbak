/**
 * ANALYTICS DASHBOARD PAGE - Realtime traffic monitoring
 * Gebruikt SSE voor live updates elke 10s.
 * Privacy-compliant: geen PII, uitsluitend geanonimiseerde aggregaten.
 */

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Eye,
  Zap,
  TrendingUp,
  Clock,
  Globe,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { getAnalyticsStreamUrl, type AnalyticsSnapshot } from '@/lib/api/analytics';

// ─── Constanten ───────────────────────────────────────────────────────────────

const RECONNECT_DELAY_MS = 5_000;

const EMPTY_SNAPSHOT: AnalyticsSnapshot = {
  activeNow: 0,
  requestsPerMinute: 0,
  pageViewsToday: 0,
  apiRequestsToday: 0,
  topPages: [],
  hourlyBuckets: [],
  uptimeSince: new Date().toISOString(),
  totalRequests: 0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUptime(since: string): string {
  const ms = Date.now() - new Date(since).getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h > 0) return `${h}u ${m}m`;
  return `${m}m`;
}

function formatNumber(n: number): string {
  return n.toLocaleString('nl-NL');
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────

function BarChart({ data }: { data: AnalyticsSnapshot['hourlyBuckets'] }) {
  const maxVal = Math.max(...data.map(b => b.pageViews + b.apiRequests), 1);

  return (
    <div className="flex items-end gap-[3px] h-20 w-full">
      {data.map((bucket, i) => {
        const total = bucket.pageViews + bucket.apiRequests;
        const height = Math.max((total / maxVal) * 100, total > 0 ? 4 : 1);
        const isCurrentHour = i === data.length - 1;

        return (
          <div
            key={bucket.hour}
            className="flex-1 flex flex-col items-center gap-[2px] group relative"
            title={`${bucket.label}: ${bucket.pageViews} views, ${bucket.apiRequests} API`}
          >
            <div
              className={`w-full rounded-t transition-all duration-500 ${
                isCurrentHour ? 'bg-primary' : 'bg-primary/40 group-hover:bg-primary/70'
              }`}
              style={{ height: `${height}%` }}
            />
            {/* Label elke 6 uur */}
            {i % 6 === 0 && (
              <span className="text-[9px] text-muted-foreground leading-none">
                {bucket.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  highlight,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? 'border-primary/50' : undefined}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${highlight ? 'text-primary' : ''}`}>
          {typeof value === 'number' ? formatNumber(value) : value}
        </div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Hoofdpagina ──────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot>(EMPTY_SNAPSHOT);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    // Sluit bestaande verbinding
    esRef.current?.close();

    const url = getAnalyticsStreamUrl();
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => {
      setConnected(true);
      setError(null);
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as AnalyticsSnapshot;
        setSnapshot(data);
        setLastUpdate(new Date());
        setConnected(true);
        setError(null);
      } catch {
        // Ongeldige JSON - negeer
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      setError('Verbinding verbroken, opnieuw verbinden...');
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connect]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Verkeersanalyse</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Realtime anoniem websiteverkeer · geen persoonlijke gegevens opgeslagen
          </p>
        </div>

        <div className="flex items-center gap-2">
          {connected ? (
            <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
              <Wifi className="h-3 w-3" />
              Live
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 border-destructive text-destructive">
              <WifiOff className="h-3 w-3" />
              Verbroken
            </Badge>
          )}
          {lastUpdate && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              {lastUpdate.toLocaleTimeString('nl-NL')}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {/* Realtime stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Actief nu"
          value={snapshot.activeNow}
          sub="verzoeken in laatste 5 min"
          icon={Activity}
          highlight
        />
        <StatCard
          title="Verzoeken/min"
          value={snapshot.requestsPerMinute}
          sub="vorige minuut"
          icon={Zap}
        />
        <StatCard
          title="Pageviews vandaag"
          value={snapshot.pageViewsToday}
          sub="publieke pagina's"
          icon={Eye}
        />
        <StatCard
          title="API calls vandaag"
          value={snapshot.apiRequestsToday}
          sub="backend verzoeken"
          icon={TrendingUp}
        />
      </div>

      {/* 24-uur grafiek */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verkeersoverzicht afgelopen 24 uur</CardTitle>
          <CardDescription>
            Publieke pageviews + API verzoeken per uur ·{' '}
            <span className="text-primary font-medium">■</span> = huidig uur
          </CardDescription>
        </CardHeader>
        <CardContent>
          {snapshot.hourlyBuckets.length > 0 ? (
            <BarChart data={snapshot.hourlyBuckets} />
          ) : (
            <div className="h-20 flex items-center justify-center text-sm text-muted-foreground">
              Wacht op eerste data...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onderste rij: Top pagina's + meta */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top pagina's */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Populairste pagina's vandaag
            </CardTitle>
          </CardHeader>
          <CardContent>
            {snapshot.topPages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nog geen data beschikbaar.</p>
            ) : (
              <ul className="space-y-2">
                {snapshot.topPages.map((page, i) => (
                  <li key={page.path} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-muted-foreground w-4 text-right shrink-0">
                        {i + 1}.
                      </span>
                      <span className="font-mono text-xs truncate text-foreground">
                        {page.path || '/'}
                      </span>
                    </div>
                    <Badge variant="secondary" className="shrink-0 ml-2">
                      {formatNumber(page.count)}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Server info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Server info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Backend uptime</span>
              <span className="font-medium">{formatUptime(snapshot.uptimeSince)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Totale verzoeken</span>
              <span className="font-medium">{formatNumber(snapshot.totalRequests)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Online since</span>
              <span className="font-medium text-xs">
                {new Date(snapshot.uptimeSince).toLocaleString('nl-NL')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Update interval</span>
              <span className="font-medium">10 seconden</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1 border-t border-border">
              Geen persoonlijke gegevens opgeslagen. Anonieme telcijfers per worker-proces.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
