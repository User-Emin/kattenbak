import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3002';
const PRODUCT_URL = `${BASE}/product/automatische-kattenbak-premium`;

test.describe('Logo en 6 stappen horizontaal – visuele verificatie', () => {
  test('navbar toont logo (logo.png)', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState('domcontentloaded');
    const logo = page.getByTestId('navbar-logo').or(page.locator('header img[alt="CatSupply Logo"]')).first();
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('src', /\/logos\/logo\.png/);
  });

  test('productpagina toont 6 stappen horizontaal onder productdetail, boven zigzag', async ({ page }) => {
    await page.goto(PRODUCT_URL);
    await page.waitForLoadState('networkidle');
    // Wacht tot product geladen is (voorkom dat we in loading/error state kijken)
    await page.getByRole('button', { name: /Winkelwagen|In winkelwagen/i }).or(page.locator('text=Specificaties')).first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
    const section = page.getByTestId('how-it-works-horizontal');
    await expect(section).toBeVisible({ timeout: 10_000 });
    await expect(section.locator('text=In 6 stappen klaar')).toBeVisible();
    await expect(section.locator('text=Stekker erin')).toBeVisible();
    await expect(section.locator('text=Grit tot MAX')).toBeVisible();
    await expect(section.locator('text=Afvalzak')).toBeVisible();
    await expect(section.locator('text=Aanzetten')).toBeVisible();
    await expect(section.locator('text=Timer app')).toBeVisible();
    await expect(section.locator('text=Klaar!')).toBeVisible();
  });
});
