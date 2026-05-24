import { test, expect } from '@playwright/test';

test('Color Blindness Simulator tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/color-blindness');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Color Blindness Simulator');

  const desc = await page.locator('.tool-description').textContent();
  expect(desc).toContain('color blindness');

  const uploadArea = await page.locator('.tool-upload-area');
  await expect(uploadArea).toBeAttached();

  console.log('✅ Color Blindness Simulator tool loads correctly');
});
