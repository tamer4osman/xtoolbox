import { test, expect } from '@playwright/test';

test('Dictionary tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/dictionary');

  await page.waitForSelector('.tool-header h1', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Dictionary');

  const wordInput = await page.locator('#word-input');
  await expect(wordInput).toBeAttached();

  const searchBtn = await page.locator('#search-btn');
  await expect(searchBtn).toBeAttached();

  const loading = await page.locator('#loading');
  await expect(loading).toBeAttached();

  const result = await page.locator('#result');
  await expect(result).toBeAttached();

  const error = await page.locator('#error');
  await expect(error).toBeAttached();

  console.log('✅ Dictionary tool loads correctly');
});
