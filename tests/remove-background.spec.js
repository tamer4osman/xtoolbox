import { test, expect } from '@playwright/test';

test('Background Remover tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/remove-background');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Background Remover');

  const uploadArea = await page.locator('#upload-area');
  await expect(uploadArea).toBeAttached();

  const resultArea = await page.locator('#result-area');
  await expect(resultArea).toBeAttached();

  console.log('✅ Background Remover tool loads correctly');
});
