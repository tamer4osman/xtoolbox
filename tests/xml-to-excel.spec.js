import { test, expect } from '@playwright/test';

test('XML to Excel tool loads and has correct UI', async ({ page }) => {
  await page.goto('http://localhost:3000/#/tools/xml-to-excel');

  await page.waitForSelector('.tool-layout', { timeout: 5000 });

  const title = await page.locator('.tool-header h1').textContent();
  expect(title).toContain('XML to Excel');

  const desc = await page.locator('.tool-description').textContent();
  expect(desc).toContain('Convert XML files to Excel');

  const uploadArea = await page.locator('.tool-upload-area');
  await expect(uploadArea).toBeVisible();

  const convertBtn = await page.locator('#convert-btn');
  await expect(convertBtn).toBeAttached();
  await expect(convertBtn).toHaveText('Convert to Excel');

  const processing = await page.locator('#processing');
  await expect(processing).toBeAttached();

  console.log('✅ XML to Excel tool loads correctly');
});
