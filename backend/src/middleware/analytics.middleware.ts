/**
 * ANALYTICS MIDDLEWARE - Lichte request tracking
 * - Registreert alleen pad en of het een publieke route is
 * - Geen IP, geen user-agent, geen PII
 * - Slaat admin-API calls op als 'apiRequests', publieke routes als 'pageViews'
 */

import { Request, Response, NextFunction } from 'express';
import { recordRequest } from '../services/analytics.service';

// Patronen die als "publieke pagina-verzoeken" tellen (frontend webshop)
const PUBLIC_PATTERNS = [
  /^\/(producten|product|cart|checkout|over-ons|contact|retourneren|winkelwagen)?(\/?$|\/[^/]+\/?$)/,
];

// API paths die publiek zijn (bijv. productenlijst voor de winkel)
const PUBLIC_API_PATTERNS = [
  /^\/api\/v1\/products/,
  /^\/api\/v1\/rag/,
  /^\/api\/v1\/payment-methods/,
];

// Paths die we volledig negeren (admin-panel, health checks, uploads, assets)
const SKIP_PATTERNS = [
  /^\/api\/v1\/admin/,
  /^\/api\/v1\/health/,
  /^\/uploads\//,
  /\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|map)$/,
  /^\/favicon/,
  /^\/_next\//,
];

export function analyticsMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const path = req.path;

  // Sla skip-paths over
  if (SKIP_PATTERNS.some(p => p.test(path))) {
    return next();
  }

  const isPublicApi = PUBLIC_API_PATTERNS.some(p => p.test(path));
  const isPublicPage = PUBLIC_PATTERNS.some(p => p.test(path));
  const isPublic = isPublicPage || isPublicApi;

  // Sla alleen op als het een bekende route is
  if (isPublic || path.startsWith('/api/v1/')) {
    recordRequest(path, isPublic);
  }

  next();
}
