import { test, expect } from '@playwright/test';

test('Book Info Lookup tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/book-lookup');

  await page.waitForSelector('.tool-header h1', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Book Info Lookup');

  const searchType = await page.locator('#search-type');
  await expect(searchType).toBeAttached();

  const queryInput = await page.locator('#query-input');
  await expect(queryInput).toBeAttached();

  const searchBtn = await page.locator('#search-btn');
  await expect(searchBtn).toBeAttached();

  const loading = await page.locator('#loading');
  await expect(loading).toBeAttached();

  const result = await page.locator('#result');
  await expect(result).toBeAttached();

  const error = await page.locator('#error');
  await expect(error).toBeAttached();

  console.log('✅ Book Info Lookup tool loads correctly');
});
