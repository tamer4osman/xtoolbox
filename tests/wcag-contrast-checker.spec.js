import { test, expect } from '@playwright/test';

test('WCAG Contrast Checker tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/wcag-contrast-checker');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('WCAG');

  await expect(page.locator('#wcag-fg')).toBeAttached();
  await expect(page.locator('#wcag-bg')).toBeAttached();
  await expect(page.locator('#wcag-check')).toBeAttached();
  await expect(page.locator('#wcag-results')).toBeAttached();

  console.log('✅ WCAG Contrast Checker tool loads correctly');
});
