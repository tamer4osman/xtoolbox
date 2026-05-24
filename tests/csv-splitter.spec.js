import { test, expect } from '@playwright/test';

test('CSV Splitter tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/csv-splitter');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('CSV Splitter');

  const desc = await page.locator('.tool-description').textContent();
  expect(desc).toContain('Split large CSV files');

  const uploadArea = await page.locator('.tool-upload-area');
  await expect(uploadArea).toBeVisible();

  const convertBtn = await page.locator('#convert-btn');
  await expect(convertBtn).toBeAttached();
  await expect(convertBtn).toHaveText('Split CSV');

  const processing = await page.locator('#processing');
  await expect(processing).toBeAttached();

  console.log('✅ CSV Splitter tool loads correctly');
});
