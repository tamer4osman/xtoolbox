import { test, expect } from '@playwright/test';

test('OpenAPI Visualizer loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/openapi-visualizer');
  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('OpenAPI');

  const uploadArea = page.locator('#upload-area');
  await expect(uploadArea).toBeVisible();

  const pasteArea = page.locator('#paste-area');
  await expect(pasteArea).toBeVisible();

  const specInput = page.locator('#spec-input');
  await expect(specInput).toBeVisible();

  const parsePasteBtn = page.locator('#parse-paste-btn');
  await expect(parsePasteBtn).toBeVisible();
  await expect(parsePasteBtn).toHaveText('Parse');

  console.log('✅ OpenAPI Visualizer tool loads correctly');
});
