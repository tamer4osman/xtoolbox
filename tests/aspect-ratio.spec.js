import { test, expect } from '@playwright/test';

test('Aspect Ratio Calculator tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/aspect-ratio');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Aspect Ratio Calculator');

  const desc = await page.locator('.tool-description').textContent();
  expect(desc).toContain('ratio');

  await expect(page.locator('#ar-width')).toBeAttached();
  await expect(page.locator('#ar-height')).toBeAttached();
  await expect(page.locator('#ar-ratio')).toBeAttached();
  await expect(page.locator('#ar-calc')).toBeAttached();

  console.log('✅ Aspect Ratio Calculator tool loads correctly');
});
