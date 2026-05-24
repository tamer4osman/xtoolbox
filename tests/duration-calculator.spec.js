import { test, expect } from '@playwright/test';

test('Time Duration Calculator tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/duration-calculator');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('Time Duration Calculator');

  const desc = await page.locator('.tool-description').textContent();
  expect(desc).toContain('duration');

  await expect(page.locator('#dc-start-date')).toBeAttached();
  await expect(page.locator('#dc-end-date')).toBeAttached();
  await expect(page.locator('#dc-calc')).toBeAttached();

  console.log('✅ Time Duration Calculator tool loads correctly');
});
