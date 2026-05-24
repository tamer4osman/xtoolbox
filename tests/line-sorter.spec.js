import { test, expect } from '@playwright/test';

test('Text Line Sorter tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/line-sorter');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Text Line Sorter');

  await expect(page.locator('#ls-input')).toBeAttached();
  await expect(page.locator('#ls-output')).toBeAttached();
  await expect(page.locator('#ls-copy')).toBeAttached();

  const modes = await page.locator('.ls-mode').count();
  expect(modes).toBeGreaterThan(5);

  console.log('✅ Text Line Sorter tool loads correctly');
});
