import { test, expect } from '@playwright/test';

test('Roman Numeral Converter tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/roman-numerals');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Roman Numeral Converter');

  await expect(page.locator('#rn-number')).toBeAttached();
  await expect(page.locator('#rn-roman')).toBeAttached();
  await expect(page.locator('#rn-result')).toBeAttached();

  console.log('✅ Roman Numeral Converter tool loads correctly');
});
