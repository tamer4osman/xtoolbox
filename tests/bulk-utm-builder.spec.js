import { test, expect } from '@playwright/test';

test('Bulk UTM Builder tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/bulk-utm-builder');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('UTM');

  const urls = await page.locator('#utm-urls');
  await expect(urls).toBeAttached();

  const source = await page.locator('#utm-source');
  await expect(source).toBeAttached();

  const medium = await page.locator('#utm-medium');
  await expect(medium).toBeAttached();

  const campaign = await page.locator('#utm-campaign');
  await expect(campaign).toBeAttached();

  const generateBtn = await page.locator('#utm-generate');
  await expect(generateBtn).toBeAttached();

  const results = await page.locator('#utm-results');
  await expect(results).toBeAttached();

  console.log('✅ Bulk UTM Builder tool loads correctly');
});
