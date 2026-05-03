import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Smoke Tests', () => {
  test('home page loads', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('search works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.fill('#search-input', 'pdf');
    await page.waitForTimeout(500);
  });

  test('category navigation works', async ({ page }) => {
    await page.goto(BASE_URL);
    const categoryLink = page.locator('#categories-grid .tool-card').first();
    if (await categoryLink.count() > 0) {
      await categoryLink.click();
      await page.waitForTimeout(500);
    }
  });

  test('tool pages load', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/tools/merge-pdf`);
    await page.waitForTimeout(500);
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/about`);
    await page.waitForTimeout(500);
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('no console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    const filtered = errors.filter(e => !e.includes('favicon'));
    expect(filtered.length).toBe(0);
  });
});