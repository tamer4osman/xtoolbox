import { test, expect } from '@playwright/test';

test('Image Upscaler tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/upscale-image');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Image Upscaler');

  const uploadArea = await page.locator('#upload-area');
  await expect(uploadArea).toBeAttached();

  const resultArea = await page.locator('#result-area');
  await expect(resultArea).toBeAttached();

  console.log('✅ Image Upscaler tool loads correctly');
});
