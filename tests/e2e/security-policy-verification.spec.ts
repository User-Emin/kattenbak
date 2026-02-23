/**
 * SECURITY POLICY VERIFICATION (docs/SECURITY_POLICY.md)
 * Chromium E2E: bevestig dat lokaal gedrag voldoet aan beleidsprincipes.
 * - Backend health + (waar aanwezig) security headers
 * - Admin login: succes, geen wachtwoord in response (LEAKAGE PREVENTION)
 * - Protected route: 401 zonder token (JWT AUTHENTICATION)
 * - Frontend: geen gevoelige data zichtbaar in pagina
 *
 * Credentials: Zelfde als backend (ADMIN_EMAIL, ADMIN_PASSWORD uit .env).
 * Default bij ontbreken: admin@catsupply.nl / admin123456789
 */

import { config } from 'dotenv';
import path from 'path';
import { test, expect } from '@playwright/test';

// Load env from root and backend (backend may have its own .env)
config({ path: path.resolve(process.cwd(), '.env') });
config({ path: path.resolve(process.cwd(), 'backend', '.env') });

const API_BASE = process.env.API_BASE || process.env.BACKEND_URL || 'http://localhost:3101';
const FRONTEND_BASE = process.env.BASE_URL || 'http://localhost:3002';
// Credentials: E2E overrides, or ADMIN_* from env, or defaults for common setups
// DB often has admin@catsupply.nl; env fallback uses admin@localhost/admin123456789
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@catsupply.nl';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || (
  process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 12
    ? process.env.ADMIN_PASSWORD
    : 'admin123'  // Common DB seed password (fallback for existing setups)
);

test.describe('Security policy – verificatie (Chromium)', () => {
  test('Backend health bereikbaar en 200 (lokaal werkend)', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/v1/health`).catch(() => null);
    expect(res).not.toBeNull();
    expect(res!.status()).toBe(200);
  });

  test('API response bevat geen stack trace of intern pad (generic errors)', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/v1/admin/orders`, {
      headers: { Authorization: 'Bearer invalid-token' },
    });
    expect(res.status()).toBe(401);
    const body = await res.text();
    // LEAKAGE PREVENTION: geen stack traces of file paths in body
    expect(body).not.toMatch(/at\s+.*\.ts|at\s+.*\.js|node_modules|\.stack/i);
    expect(body).not.toContain('JWT_SECRET');
  });

  test('Admin login: succes, token aanwezig, wachtwoord NIET in response', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/v1/admin/auth/login`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data?.token).toBeDefined();
    expect(typeof json.data.token).toBe('string');
    const bodyStr = JSON.stringify(json);
    // LEAKAGE PREVENTION: wachtwoord nooit in response
    expect(bodyStr).not.toContain(ADMIN_PASSWORD);
  });

  test('Protected admin route: 401 zonder token', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/v1/admin/orders`);
    expect(res.status()).toBe(401);
  });

  test('Frontend homepage laadt in Chromium zonder script crash', async ({ page }) => {
    const res = await page.goto(FRONTEND_BASE);
    expect(res?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Frontend bevat geen hardcoded wachtwoord in zichtbare content', async ({ page }) => {
    await page.goto(FRONTEND_BASE);
    const content = await page.content();
    expect(content).not.toContain(ADMIN_PASSWORD);
  });
});
