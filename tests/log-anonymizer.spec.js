import { test, expect } from '@playwright/test';

test('Log Anonymizer tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/log-anonymizer');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Log');

  const textarea = await page.locator('#la-input');
  await expect(textarea).toBeAttached();

  const rulesGrid = await page.locator('#la-rules-grid');
  await expect(rulesGrid).toBeAttached();

  const sanitizeBtn = await page.locator('#la-sanitize');
  await expect(sanitizeBtn).toBeAttached();

  const results = await page.locator('#la-results');
  await expect(results).toBeAttached();

  console.log('✅ Log Anonymizer tool loads correctly');
});
