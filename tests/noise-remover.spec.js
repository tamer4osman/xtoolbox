import { test, expect } from '@playwright/test';

test('noise-remover loads and displays UI', async ({ page }) => {
  await page.goto('/#/tools/noise-remover');
  await expect(page.locator('h1')).toContainText('Noise');
  await expect(page.locator('.upload-zone')).toBeVisible();
});

test('noise-remover shows options after file upload', async ({ page }) => {
  await page.goto('/#/tools/noise-remover');
  await expect(page.locator('#method-select')).toBeVisible();
  await expect(page.locator('#strength')).toBeVisible();
  await expect(page.locator('#process-btn')).toBeVisible();
});
