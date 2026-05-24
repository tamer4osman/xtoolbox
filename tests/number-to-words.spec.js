import { test, expect } from '@playwright/test';

test('Number to Words tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/number-to-words');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Number to Words');

  const desc = await page.locator('.tool-description').textContent();
  expect(desc).toContain('Convert numerals');

  const input = await page.locator('#n2w-input');
  await expect(input).toBeAttached();

  const convertBtn = await page.locator('#n2w-convert');
  await expect(convertBtn).toBeAttached();

  const result = await page.locator('#n2w-result');
  await expect(result).toBeAttached();

  const copyBtn = await page.locator('#n2w-copy');
  await expect(copyBtn).toBeAttached();

  console.log('✅ Number to Words tool loads correctly');
});
